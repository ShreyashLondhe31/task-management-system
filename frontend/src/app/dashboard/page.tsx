"use client";

import { useState, useEffect } from "react";
import { PanelLeft, Search, Columns, Filter, Plus, LayoutGrid, List, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import api from "@/lib/api";
import { useSidebar } from "./SidebarContext";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
}

export default function DashboardPage() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);
  const [activeColumnMenu, setActiveColumnMenu] = useState<string | null>(null);
  const { isOpen, setIsOpen } = useSidebar();
  const [visibleFields, setVisibleFields] = useState({
    Priority: false,
    Members: true,
    DueDate: false,
    Labels: false,
    Status: false,
    Reporter: false,
  });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (status: string = 'TODO') => {
    try {
      const res = await api.post('/tasks', {
        title: 'Untitled Task',
        status: status,
      });
      setTasks(prev => [...prev, res.data]);
      setSelectedTaskId(res.data.id);
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleClearColumn = async (status: string) => {
    const tasksToDelete = tasks.filter(t => t.status === status);
    for (const t of tasksToDelete) {
      await handleDeleteTask(t.id);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If priorityFilter has items, task priority must be in the array. 
    // Handle null/empty priority as 'None'.
    const taskPriority = task.priority || 'None';
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(taskPriority);
    
    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const doingTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');
  const onHoldTasks = filteredTasks.filter(t => t.status === 'ON_HOLD');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFDFD] dark:bg-[#0a0a0a] animate-fade-in animate-slide-up">
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h1>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-9 pr-3 py-2 h-[38px] text-sm border border-gray-200 dark:border-zinc-800 rounded-md bg-transparent focus:outline-none focus:border-gray-300 dark:focus:border-zinc-600 focus:ring-1 focus:ring-gray-300 dark:focus:ring-zinc-600 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setFieldsOpen(!fieldsOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <Columns className="w-4 h-4" />
              Fields
            </button>
            
            {/* Fields Popover */}
            {fieldsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFieldsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 p-2 animate-scale-in origin-top-right">
                {/* View Toggle */}
                <div className="flex p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-lg mb-2">
                  <button 
                    onClick={() => setView('list')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                      view === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button 
                    onClick={() => setView('board')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                      view === 'board' ? "bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Board
                  </button>
                </div>

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
              </>
            )}
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn(
                "p-2 border rounded-md transition-colors h-[38px] flex items-center justify-center",
                filterOpen || priorityFilter.length > 0 
                  ? "bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-gray-100" 
                  : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
              )}
            >
              <Filter className="w-4 h-4" />
              {priorityFilter.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-[#0a0a0a]" />
              )}
            </button>
            
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 p-3 animate-scale-in origin-top-right">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</span>
                  {priorityFilter.length > 0 && (
                    <button 
                      onClick={() => setPriorityFilter([])}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {['High', 'Medium', 'Low', 'None'].map((priority) => {
                    const isChecked = priorityFilter.includes(priority);
                    return (
                      <label key={priority} className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer group">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{priority}</span>
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          isChecked ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 dark:border-zinc-600"
                        )}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setPriorityFilter(prev => prev.filter(p => p !== priority));
                            } else {
                              setPriorityFilter(prev => [...prev, priority]);
                            }
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => handleCreateTask('TODO')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Main Board/List Content */}
      <div className="flex-1 overflow-auto px-4 md:px-8 pb-4 md:pb-8">
        {loading ? (
           <div className="flex items-center justify-center h-full"><span className="text-gray-400">Loading tasks...</span></div>
        ) : view === 'board' ? (
           <div className="flex gap-6 h-full items-start">
             {/* To Do Column */}
             <div className="w-[320px] shrink-0 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl p-3 border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
               <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded-sm grid grid-cols-2 gap-0.5 p-[1px] opacity-70">
                     <div className="bg-gray-400 dark:bg-gray-500 rounded-[1px]" />
                     <div className="bg-gray-400 dark:bg-gray-500 rounded-[1px]" />
                     <div className="bg-gray-400 dark:bg-gray-500 rounded-[1px]" />
                     <div className="bg-gray-400 dark:bg-gray-500 rounded-[1px]" />
                   </div>
                   <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">To Do</span>
                 </div>
                 <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                   <button 
                     onClick={() => handleCreateTask('TODO')}
                     className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                   <div className="relative">
                     <button 
                       onClick={() => setActiveColumnMenu(activeColumnMenu === 'TODO' ? null : 'TODO')}
                       className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded tracking-widest leading-none font-bold pb-1.5 transition-colors"
                     >
                       ...
                     </button>
                     {activeColumnMenu === 'TODO' && (
                       <>
                         <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveColumnMenu(null); }} />
                         <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                           <button 
                             onClick={() => { handleClearColumn('TODO'); setActiveColumnMenu(null); }}
                             className="w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             Clear Column
                           </button>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               </div>
               
               {todoTasks.map(task => (
                 <div 
                    key={task.id}
                    className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
                    onClick={() => setSelectedTaskId(task.id)}
                 >
                   <div className="flex items-start justify-between gap-2">
                     <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</h3>
                     <div className="relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                         className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 tracking-widest leading-none font-bold pb-1.5 px-1 transition-colors"
                       >
                         ...
                       </button>
                       {activeTaskMenu === task.id && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); }} />
                           <div className="absolute top-full right-0 mt-1 w-28 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); setActiveTaskMenu(null); }}
                               className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                             >
                               Delete Task
                             </button>
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                   {(visibleFields.Members || visibleFields.Priority) && (
                     <div className="flex items-center justify-between mt-1">
                       <div className="flex items-center gap-2">
                         {visibleFields.Members && (
                           <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" /></div>
                         )}
                       </div>
                       {visibleFields.Priority && (
                         <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded">{task.priority}</span>
                       )}
                     </div>
                   )}
                 </div>
               ))}
               
               <button 
                 onClick={() => handleCreateTask('TODO')}
                 className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors w-full text-left mt-1"
               >
                 <Plus className="w-4 h-4" /> Add Task
               </button>
             </div>
             
             {/* Doing Column */}
             <div className="w-[320px] shrink-0 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl p-3 border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
               <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded-sm opacity-70" />
                   <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Doing</span>
                 </div>
                 <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                   <button 
                     onClick={() => handleCreateTask('IN_PROGRESS')}
                     className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                   <div className="relative">
                     <button 
                       onClick={() => setActiveColumnMenu(activeColumnMenu === 'IN_PROGRESS' ? null : 'IN_PROGRESS')}
                       className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded tracking-widest leading-none font-bold pb-1.5 transition-colors"
                     >
                       ...
                     </button>
                     {activeColumnMenu === 'IN_PROGRESS' && (
                       <>
                         <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveColumnMenu(null); }} />
                         <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                           <button 
                             onClick={() => { handleClearColumn('IN_PROGRESS'); setActiveColumnMenu(null); }}
                             className="w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             Clear Column
                           </button>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               </div>
               {doingTasks.map(task => (
                 <div 
                    key={task.id} 
                    className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
                    onClick={() => setSelectedTaskId(task.id)}
                 >
                   <div className="flex items-start justify-between gap-2">
                     <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</h3>
                     <div className="relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                         className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 tracking-widest leading-none font-bold pb-1.5 px-1 transition-colors"
                       >
                         ...
                       </button>
                       {activeTaskMenu === task.id && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); }} />
                           <div className="absolute top-full right-0 mt-1 w-28 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); setActiveTaskMenu(null); }}
                               className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                             >
                               Delete Task
                             </button>
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                   {(visibleFields.Members || visibleFields.Priority) && (
                     <div className="flex items-center justify-between mt-1">
                       <div className="flex items-center gap-2">
                         {visibleFields.Members && (
                           <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" /></div>
                         )}
                       </div>
                       {visibleFields.Priority && (
                         <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded">{task.priority}</span>
                       )}
                     </div>
                   )}
                 </div>
               ))}
               <button 
                 onClick={() => handleCreateTask('IN_PROGRESS')}
                 className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors w-full text-left mt-1"
               >
                 <Plus className="w-4 h-4" /> Add Task
               </button>
             </div>
             
             {/* Completed Column */}
             <div className="w-[320px] shrink-0 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl p-3 border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
               <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 opacity-70" />
                   <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Completed</span>
                 </div>
                 <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                   <button 
                     onClick={() => handleCreateTask('DONE')}
                     className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                   <div className="relative">
                     <button 
                       onClick={() => setActiveColumnMenu(activeColumnMenu === 'DONE' ? null : 'DONE')}
                       className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded tracking-widest leading-none font-bold pb-1.5 transition-colors"
                     >
                       ...
                     </button>
                     {activeColumnMenu === 'DONE' && (
                       <>
                         <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveColumnMenu(null); }} />
                         <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                           <button 
                             onClick={() => { handleClearColumn('DONE'); setActiveColumnMenu(null); }}
                             className="w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             Clear Column
                           </button>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               </div>
               {doneTasks.map(task => (
                 <div 
                    key={task.id} 
                    className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
                    onClick={() => setSelectedTaskId(task.id)}
                 >
                   <div className="flex items-start justify-between gap-2">
                     <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</h3>
                     <div className="relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                         className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 tracking-widest leading-none font-bold pb-1.5 px-1 transition-colors"
                       >
                         ...
                       </button>
                       {activeTaskMenu === task.id && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); }} />
                           <div className="absolute top-full right-0 mt-1 w-28 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); setActiveTaskMenu(null); }}
                               className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                             >
                               Delete Task
                             </button>
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                   {(visibleFields.Members || visibleFields.Priority) && (
                     <div className="flex items-center justify-between mt-1">
                       <div className="flex items-center gap-2">
                         {visibleFields.Members && (
                           <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" /></div>
                         )}
                       </div>
                       {visibleFields.Priority && (
                         <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded">{task.priority}</span>
                       )}
                     </div>
                   )}
                 </div>
               ))}
               <button 
                 onClick={() => handleCreateTask('DONE')}
                 className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors w-full text-left mt-1"
               >
                 <Plus className="w-4 h-4" /> Add Task
               </button>
             </div>

             {/* On Hold Column */}
             <div className="w-[320px] shrink-0 bg-gray-50/50 dark:bg-zinc-800/30 rounded-xl p-3 border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
               <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 border-dashed rounded-sm opacity-70" />
                   <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">On Hold</span>
                 </div>
                 <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                   <button 
                     onClick={() => handleCreateTask('ON_HOLD')}
                     className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-colors"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                   <div className="relative">
                     <button 
                       onClick={() => setActiveColumnMenu(activeColumnMenu === 'ON_HOLD' ? null : 'ON_HOLD')}
                       className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-300 rounded tracking-widest leading-none font-bold pb-1.5 transition-colors"
                     >
                       ...
                     </button>
                     {activeColumnMenu === 'ON_HOLD' && (
                       <>
                         <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveColumnMenu(null); }} />
                         <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                           <button 
                             onClick={() => { handleClearColumn('ON_HOLD'); setActiveColumnMenu(null); }}
                             className="w-full text-left px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             Clear Column
                           </button>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               </div>
               {onHoldTasks.map(task => (
                 <div 
                    key={task.id} 
                    className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-600 transition-colors opacity-75"
                    onClick={() => setSelectedTaskId(task.id)}
                 >
                   <div className="flex items-start justify-between gap-2">
                     <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</h3>
                     <div className="relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id); }}
                         className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 tracking-widest leading-none font-bold pb-1.5 px-1 transition-colors"
                       >
                         ...
                       </button>
                       {activeTaskMenu === task.id && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveTaskMenu(null); }} />
                           <div className="absolute top-full right-0 mt-1 w-28 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 py-1 animate-scale-in origin-top-right">
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); setActiveTaskMenu(null); }}
                               className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                             >
                               Delete Task
                             </button>
                           </div>
                         </>
                       )}
                     </div>
                   </div>
                   {(visibleFields.Members || visibleFields.Priority) && (
                     <div className="flex items-center justify-between mt-1">
                       <div className="flex items-center gap-2">
                         {visibleFields.Members && (
                           <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" /></div>
                         )}
                       </div>
                       {visibleFields.Priority && (
                         <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded">{task.priority}</span>
                       )}
                     </div>
                   )}
                 </div>
               ))}
               <button 
                 onClick={() => handleCreateTask('ON_HOLD')}
                 className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors w-full text-left mt-1"
               >
                 <Plus className="w-4 h-4" /> Add Task
               </button>
             </div>
           </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* List View Placeholder */}
            {[
              { id: 'TODO', label: 'To Do', tasks: todoTasks },
              { id: 'IN_PROGRESS', label: 'Doing', tasks: doingTasks },
              { id: 'DONE', label: 'Completed', tasks: doneTasks },
              { id: 'ON_HOLD', label: 'On Hold', tasks: onHoldTasks },
            ].map(column => (
              <div key={column.id}>
                <div className="flex items-center gap-2 mb-3">
                  <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{column.label}</span>
                </div>
                <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-white dark:bg-zinc-900">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-3">Task</th>
                        {visibleFields.Priority && <th className="px-6 py-3 w-32">Priority</th>}
                        {visibleFields.Members && <th className="px-6 py-3 w-32">Members</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {column.tasks.map(task => (
                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                          {visibleFields.Priority && <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{task.priority}</td>}
                          {visibleFields.Members && (
                            <td className="px-6 py-4">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" /></div>
                            </td>
                          )}
                        </tr>
                      ))}
                      <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                        <td colSpan={5} className="px-6 py-3">
                          <button 
                            onClick={() => handleCreateTask(column.id)}
                            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 font-medium flex items-center gap-2 transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4" /> Add Task
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskDetailsModal 
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)} 
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
}
