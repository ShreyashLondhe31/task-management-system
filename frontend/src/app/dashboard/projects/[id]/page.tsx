"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PanelLeft, Search, Columns, Filter, Plus, ChevronDown, ChevronRight, LayoutGrid, List, Check } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import { useSidebar } from "../../SidebarContext";

export default function ProjectDetailsPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { setIsOpen } = useSidebar();
  
  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${params.id}`);
      setProject(res.data);
      if (res.data.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch project", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleCreateTask = async (status: string = 'TODO') => {
    try {
      const res = await api.post('/tasks', {
        title: 'Untitled Task',
        status: status,
        projectId: params.id
      });
      setTasks(prev => [...prev, res.data]);
      setSelectedTaskId(res.data.id);
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const doingTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] items-center justify-center">
        <span className="text-gray-400">Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a] items-center justify-center">
        <span className="text-red-400">Project not found.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-100 dark:border-zinc-800 flex items-center px-4 shrink-0 text-sm">
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors mr-4"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Link href="/dashboard/projects" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{project.title}</span>
        </div>
      </header>

      {/* Page Header */}
      <div className="px-8 py-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{project.title}</h1>
          {project.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{project.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800">
            <Search className="w-4 h-4" />
          </button>
          
          <button className="p-2 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-800 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800">
            <Filter className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => handleCreateTask('TODO')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Main Content (List View) */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="flex flex-col gap-6">
          
          {/* To Do Accordion */}
          <div>
            <div className="flex items-center gap-2 mb-3 cursor-pointer">
              <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">To Do ({todoTasks.length})</span>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3">Task</th>
                    <th className="px-6 py-3 w-32">Priority</th>
                    <th className="px-6 py-3 w-40">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {todoTasks.map(task => (
                    <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{task.priority}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                  {todoTasks.length === 0 && (
                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td colSpan={3} className="px-6 py-3 text-gray-400 text-center">No tasks in To Do</td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td colSpan={3} className="px-6 py-3">
                      <button onClick={() => handleCreateTask('TODO')} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium flex items-center gap-2 transition-colors text-sm">
                        <Plus className="w-4 h-4" /> Add Task
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Doing Accordion */}
          <div>
            <div className="flex items-center gap-2 mb-3 cursor-pointer">
              <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Doing ({doingTasks.length})</span>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3">Task</th>
                    <th className="px-6 py-3 w-32">Priority</th>
                    <th className="px-6 py-3 w-40">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {doingTasks.map(task => (
                    <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{task.priority}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                  {doingTasks.length === 0 && (
                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td colSpan={3} className="px-6 py-3 text-gray-400 text-center">No tasks in Doing</td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td colSpan={3} className="px-6 py-3">
                      <button onClick={() => handleCreateTask('IN_PROGRESS')} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium flex items-center gap-2 transition-colors text-sm">
                        <Plus className="w-4 h-4" /> Add Task
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Completed Accordion */}
          <div>
            <div className="flex items-center gap-2 mb-3 cursor-pointer">
              <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Completed ({doneTasks.length})</span>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-x-auto bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3">Task</th>
                    <th className="px-6 py-3 w-32">Priority</th>
                    <th className="px-6 py-3 w-40">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {doneTasks.map(task => (
                    <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} className="hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{task.title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{task.priority}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                  {doneTasks.length === 0 && (
                    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <td colSpan={3} className="px-6 py-3 text-gray-400 text-center">No completed tasks</td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td colSpan={3} className="px-6 py-3">
                      <button onClick={() => handleCreateTask('DONE')} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium flex items-center gap-2 transition-colors text-sm">
                        <Plus className="w-4 h-4" /> Add Task
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      
      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskDetailsModal 
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)} 
          onTaskUpdated={fetchProject}
        />
      )}
    </div>
  );
}
