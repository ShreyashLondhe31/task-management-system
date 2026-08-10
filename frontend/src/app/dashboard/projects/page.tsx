"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PanelLeft, Search, Columns, Filter, Plus, ChevronRight, Check, Circle, Signal, Users, Calendar, Tag, User, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useSidebar } from "../SidebarContext";
import CreateProjectModal from "@/components/CreateProjectModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProjectsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilterSub, setActiveFilterSub] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    status: null as string | null,
    priority: null as string | null,
    members: null as string | null,
  });
  const [fieldsOpen, setFieldsOpen] = useState(false);
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActionRow, setActiveActionRow] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  const { isOpen, setIsOpen } = useSidebar();
  
  const fieldsRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldsOpen && fieldsRef.current && !fieldsRef.current.contains(event.target as Node)) {
        setFieldsOpen(false);
      }
      if (filterOpen && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (activeActionRow && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionRow(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fieldsOpen, filterOpen, activeActionRow]);
  
  const [visibleFields, setVisibleFields] = useState({
    Priority: true,
    Lead: true,
    DueDate: true,
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData: any) => {
    try {
      const res = await api.post('/projects', projectData);
      setProjects(prev => [res.data, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete}`);
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      setActiveActionRow(null);
    } catch (err) {
      console.error('Failed to delete project', err);
    } finally {
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = activeFilters.priority ? p.priority === activeFilters.priority : true;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] animate-fade-in animate-slide-up">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-100 dark:border-zinc-800 flex items-center px-4 shrink-0">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      </header>

      {/* Page Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Projects</h1>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex items-center">
            {isSearchActive ? (
              <input
                autoFocus
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setIsSearchActive(false)}
                className="pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-zinc-800 rounded-md outline-none bg-transparent text-gray-900 dark:text-gray-100 w-48 animate-fade-in transition-all"
              />
            ) : (
              <button 
                onClick={() => setIsSearchActive(true)}
                className="p-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
            {isSearchActive && (
              <Search className="w-4 h-4 text-gray-400 absolute right-2 pointer-events-none" />
            )}
          </div>
          
          {/* Fields */}
          <div className="relative" ref={fieldsRef}>
            <button 
              onClick={() => {
                setFieldsOpen(!fieldsOpen);
                setFilterOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <Columns className="w-4 h-4" />
              Fields
            </button>
            
            {fieldsOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 p-2 animate-scale-in origin-top-right">
                <div className="flex flex-col gap-1 py-1">
                  {Object.entries(visibleFields).map(([field, isVisible]) => (
                    <label key={field} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer group">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center transition-colors",
                        isVisible ? "bg-[#111] dark:bg-zinc-200 text-white dark:text-zinc-900" : "bg-gray-100 dark:bg-zinc-800"
                      )}>
                        {isVisible && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isVisible}
                        onChange={() => setVisibleFields(prev => ({ ...prev, [field as keyof typeof visibleFields]: !prev[field as keyof typeof visibleFields] }))}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => {
                setFilterOpen(!filterOpen);
                setFieldsOpen(false);
              }}
              className="p-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 py-2 animate-scale-in origin-top-right">
                <div 
                  className="flex flex-col"
                  onMouseEnter={() => setActiveFilterSub('status')}
                  onMouseLeave={() => setActiveFilterSub(null)}
                >
                  <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 z-10 relative">
                    <div className="flex items-center gap-3">
                      <Circle className="w-4 h-4 text-gray-400" />
                      <span className={cn(activeFilters.status ? "font-medium text-gray-900 dark:text-gray-100" : "")}>Status</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", activeFilterSub === 'status' ? "rotate-90" : "")} />
                  </button>
                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    activeFilterSub === 'status' ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="bg-gray-50 dark:bg-zinc-800/50 py-1 border-y border-gray-100 dark:border-zinc-800">
                        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                          <button 
                            key={status} 
                            onClick={() => setActiveFilters(p => ({...p, status: p.status === status ? null : status}))}
                            className="w-full flex items-center justify-between pl-11 pr-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          >
                            {status.replace('_', ' ')}
                            {activeFilters.status === status && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex flex-col"
                  onMouseEnter={() => setActiveFilterSub('priority')}
                  onMouseLeave={() => setActiveFilterSub(null)}
                >
                  <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 z-10 relative">
                    <div className="flex items-center gap-3">
                      <Signal className="w-4 h-4 text-gray-400" />
                      <span className={cn(activeFilters.priority ? "font-medium text-gray-900 dark:text-gray-100" : "")}>Priority</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", activeFilterSub === 'priority' ? "rotate-90" : "")} />
                  </button>
                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    activeFilterSub === 'priority' ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="bg-gray-50 dark:bg-zinc-800/50 py-1 border-y border-gray-100 dark:border-zinc-800">
                        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => (
                          <button 
                            key={priority} 
                            onClick={() => setActiveFilters(p => ({...p, priority: p.priority === priority ? null : priority}))}
                            className="w-full flex items-center justify-between pl-11 pr-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                          >
                            {priority}
                            {activeFilters.priority === priority && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex flex-col"
                  onMouseEnter={() => setActiveFilterSub('members')}
                  onMouseLeave={() => setActiveFilterSub(null)}
                >
                  <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 z-10 relative">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className={cn(activeFilters.members ? "font-medium text-gray-900 dark:text-gray-100" : "")}>Members</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", activeFilterSub === 'members' ? "rotate-90" : "")} />
                  </button>
                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    activeFilterSub === 'members' ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}>
                    <div className="overflow-hidden">
                      <div className="bg-gray-50 dark:bg-zinc-800/50 py-1 border-y border-gray-100 dark:border-zinc-800">
                        <div className="pl-11 pr-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No team members assigned yet.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {(activeFilters.status || activeFilters.priority || activeFilters.members) && (
                  <div className="px-2 mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800" onMouseEnter={() => setActiveFilterSub(null)}>
                    <button 
                      onClick={() => setActiveFilters({ status: null, priority: null, members: null })}
                      className="w-full py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 md:px-8 pb-4 md:pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-full"><span className="text-gray-400">Loading projects...</span></div>
        ) : (
          <div className="flex flex-col gap-6 animate-slide-up">
            <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-sm min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3">Projects</th>
                    {visibleFields.Priority && <th className="px-6 py-3 w-32">Priority</th>}
                    {visibleFields.Lead && <th className="px-6 py-3 w-32">Lead</th>}
                    {visibleFields.DueDate && <th className="px-6 py-3 w-40">Due Date</th>}
                    <th className="px-6 py-3 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">{project.title}</Link>
                      </td>
                      {visibleFields.Priority && (
                        <td className="px-6 py-4">
                          <span className={cn(
                            "font-medium flex items-center gap-1.5",
                            project.priority === 'HIGH' ? "text-red-400" : 
                            project.priority === 'URGENT' ? "text-red-500" : 
                            project.priority === 'LOW' ? "text-gray-400" : "text-orange-400"
                          )}>
                            {project.priority === 'HIGH' || project.priority === 'URGENT' ? (
                              <span className="flex items-end gap-[1px] h-3"><span className="w-1 h-1.5 bg-current"/><span className="w-1 h-2 bg-current"/><span className="w-1 h-3 bg-current"/></span>
                            ) : project.priority === 'LOW' ? (
                              <span className="flex items-end gap-[1px] h-3"><span className="w-1 h-1 bg-current opacity-50"/><span className="w-1 h-1 bg-current opacity-50"/><span className="w-1 h-1 bg-current opacity-50"/></span>
                            ) : (
                              <span className="flex items-end gap-[1px] h-3"><span className="w-1 h-1.5 bg-current"/><span className="w-1 h-2 bg-current"/><span className="w-1 h-2 bg-current opacity-30"/></span>
                            )}
                            {project.priority.charAt(0) + project.priority.slice(1).toLowerCase()}
                          </span>
                        </td>
                      )}
                      {visibleFields.Lead && (
                        <td className="px-6 py-4">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" /></div>
                        </td>
                      )}
                      {visibleFields.DueDate && (
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}
                        </td>
                      )}
                      <td className="px-6 py-4 relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionRow(activeActionRow === project.id ? null : project.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {activeActionRow === project.id && (
                          <div 
                            ref={actionMenuRef}
                            className="absolute right-6 top-10 mt-1 w-32 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 py-1 animate-scale-in origin-top-right"
                          >
                            <button 
                              onClick={() => { setProjectToDelete(project.id); setActiveActionRow(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {filteredProjects.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                         No projects found.
                       </td>
                     </tr>
                  )}
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td colSpan={5} className="px-6 py-3">
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium flex items-center gap-2 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" /> Add Project
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {projectToDelete && (
        <ConfirmModal 
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText="Delete"
          onConfirm={handleDeleteProject}
          onCancel={() => setProjectToDelete(null)}
        />
      )}
    </div>
  );
}
