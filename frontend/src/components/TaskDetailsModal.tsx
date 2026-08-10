import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Eye, Share2, MoreHorizontal, ChevronDown, Plus, Paperclip, Send, Check, Trash2, CalendarDays, Tag, Smile, Settings, SplitSquareHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import CustomSelect from "./CustomSelect";
import ConfirmModal from "./ConfirmModal";

interface User {
  id: string;
  name: string | null;
}

interface Comment {
  id: string;
  content: string;
  user: User;
  createdAt: string;
}

interface Label {
  id: string;
  name: string;
  color?: string | null;
}

interface Resource {
  id: string;
  title: string;
  url?: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  subtasks?: Task[];
  comments?: Comment[];
  labels?: Label[];
  resources?: Resource[];
  user?: User;
}

const SignalIcon = ({ level, colorClass }: { level: number, colorClass: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={colorClass}>
    <rect x="2" y="11" width="2.5" height="3" rx="1" fill="currentColor" className={level >= 1 ? "" : "opacity-30"} />
    <rect x="6" y="8" width="2.5" height="6" rx="1" fill="currentColor" className={level >= 2 ? "" : "opacity-30"} />
    <rect x="10" y="5" width="2.5" height="9" rx="1" fill="currentColor" className={level >= 3 ? "" : "opacity-30"} />
    <rect x="14" y="2" width="2.5" height="12" rx="1" fill="currentColor" className={level >= 4 ? "" : "opacity-30"} />
  </svg>
);

const PRIORITY_OPTIONS = [
  { value: 'NONE', label: 'No Priority', level: 0, color: 'text-gray-400' },
  { value: 'URGENT', label: 'Urgent', level: 4, color: 'text-red-500' },
  { value: 'HIGH', label: 'High', level: 3, color: 'text-orange-500' },
  { value: 'MEDIUM', label: 'Medium', level: 2, color: 'text-yellow-500' },
  { value: 'LOW', label: 'Low', level: 1, color: 'text-gray-400' },
];

export default function TaskDetailsModal({ 
  taskId, 
  onClose,
  onTaskUpdated 
}: { 
  taskId: string; 
  onClose: () => void;
  onTaskUpdated: () => void;
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeActionSubtask, setActiveActionSubtask] = useState<string | null>(null);
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [fieldsMenuOpen, setFieldsMenuOpen] = useState(false);
  const fieldsMenuRef = useRef<HTMLDivElement>(null);
  const [addCustomFieldOpen, setAddCustomFieldOpen] = useState(false);
  const addCustomFieldRef = useRef<HTMLDivElement>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("Text");
  const [customFields, setCustomFields] = useState<{name: string, type: string, value: string}[]>([]);
  const [visibleFields, setVisibleFields] = useState({
    Status: true,
    Priority: true,
    Members: true,
    Dates: true,
    Labels: true,
    Teams: true,
    Reporter: true,
  });

  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeActionSubtask && actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionSubtask(null);
      }
      if (fieldsMenuOpen && fieldsMenuRef.current && !fieldsMenuRef.current.contains(event.target as Node)) {
        setFieldsMenuOpen(false);
      }
      if (addCustomFieldOpen && addCustomFieldRef.current && !addCustomFieldRef.current.contains(event.target as Node)) {
        setAddCustomFieldOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeActionSubtask, fieldsMenuOpen, addCustomFieldOpen]);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data);
    } catch (err) {
      console.error("Failed to fetch task details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const updateTask = async (updates: Partial<Task>) => {
    try {
      if (task) setTask({ ...task, ...updates });
      await api.patch(`/tasks/${taskId}`, updates);
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, status: string) => {
    try {
      await api.patch(`/tasks/${subtaskId}`, { status });
      fetchTask(); // refetch to get updated subtasks
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to update subtask", err);
    }
  };

  const deleteSubtask = async () => {
    if (!subtaskToDelete) return;
    try {
      await api.delete(`/tasks/${subtaskToDelete}`);
      fetchTask();
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to delete subtask", err);
    } finally {
      setSubtaskToDelete(null);
    }
  };

  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${taskId}`);
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to delete task", err);
    } finally {
      setShowDeleteTaskConfirm(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: newComment });
      setNewComment("");
      fetchTask();
    } catch (err) {
      console.error(err);
    }
  };

  const addSubtask = async () => {
    try {
      await api.post('/tasks', { title: 'New Subtask', parentId: taskId });
      fetchTask();
    } catch (err) {
      console.error(err);
    }
  };

  const addLabel = async () => {
    const name = window.prompt("Enter label name (e.g. Research, Design):");
    if (!name) return;
    try {
      await api.post(`/tasks/${taskId}/labels`, { name });
      fetchTask();
    } catch (err) {
      console.error(err);
    }
  };

  const addResource = async () => {
    const title = window.prompt("Enter resource title:");
    if (!title) return;
    const url = window.prompt("Enter URL (optional):");
    try {
      await api.post(`/tasks/${taskId}/resources`, { title, url });
      fetchTask();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !task) return null;

  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority) || PRIORITY_OPTIONS.find(p => p.value === 'NONE')!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/30 dark:bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden animate-slide-up custom-scrollbar">
        
        {/* Main Content (Left) */}
        <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-zinc-800 custom-scrollbar">
          <div className="p-4 sm:p-8 pb-16 sm:pb-32"> {/* Extra padding bottom for scrolling */}
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
              <input 
                type="text" 
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                onBlur={() => updateTask({ title: task.title })}
                className="text-3xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none w-full mr-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 focus:bg-gray-50 dark:focus:bg-zinc-800/50 rounded px-2 -ml-2 transition-colors placeholder-gray-400"
                placeholder="Task Title"
              />
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 shrink-0">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><Lock className="w-4 h-4" /></button>
                <button className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md flex items-center gap-1.5 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20 dark:text-blue-400 transition-colors border border-blue-100 dark:border-blue-800/30"><Eye className="w-4 h-4" /> <span className="text-xs font-medium">1</span></button>
                
                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><Share2 className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-200 dark:bg-zinc-800 mx-1"></div>
                  <button 
                    onClick={() => setShowDeleteTaskConfirm(true)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors ml-1"><X className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <textarea
              className="w-full text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed resize-none border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-gray-300 dark:focus:border-zinc-600 rounded-lg p-2 -ml-2 outline-none transition-all focus:bg-gray-50 dark:focus:bg-zinc-800 min-h-[60px]"
              placeholder="Add a description..."
              value={task.description || ''}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              onBlur={() => updateTask({ description: task.description })}
            />

            {/* Properties Block */}
            <div className="grid grid-cols-[120px_1fr] gap-y-5 items-center text-sm mb-10 px-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Properties</span>
              <div className="flex items-center gap-3">
                {task.user && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-full border border-gray-100 dark:border-zinc-800">
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">{task.user.name?.charAt(0) || 'U'}</div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{task.user.name || 'User'}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="font-medium text-xs">{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
              </div>

              <span className="text-gray-500 dark:text-gray-400 font-medium">Labels</span>
              <div className="flex items-center gap-2 flex-wrap">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map(label => (
                    <div key={label.id} className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200/60 dark:border-zinc-700">
                      <Tag className="w-3 h-3 text-gray-400" />
                      {label.name}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">No labels yet</span>
                )}
                <button onClick={addLabel} className="text-xs text-blue-500 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ml-1">+ Add Label</button>
              </div>

              <span className="text-gray-500 dark:text-gray-400 font-medium">Resources</span>
              <div className="flex flex-col gap-2">
                {task.resources?.map(resource => (
                  <a key={resource.id} href={resource.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-500 transition-colors w-max">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-sm border-b border-transparent hover:border-blue-500 pb-0.5">{resource.title}</span>
                  </a>
                ))}
                <button onClick={addResource} className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors w-max mt-1">
                  <Plus className="w-4 h-4" />
                  <span className="border-b border-dashed border-gray-300 dark:border-zinc-600 pb-0.5">Add document or link...</span>
                </button>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="mb-10 px-1">
              <div className="flex items-center gap-2 mb-4 cursor-pointer group w-max">
                <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 rounded transition-colors" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">Subtasks ({task.subtasks?.length || 0})</span>
              </div>
              
              <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/30 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                    <tr className="text-gray-500 dark:text-gray-400 font-medium">
                      <th className="px-4 py-3 font-medium">Task</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Due Date</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                    {task.subtasks?.map(subtask => {
                      const subPrio = PRIORITY_OPTIONS.find(p => p.value === subtask.priority) || PRIORITY_OPTIONS[0];
                      return (
                        <tr key={subtask.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{subtask.title}</td>
                          <td className="px-4 py-3.5">
                            <div className={cn("flex items-center gap-1.5 font-medium", subPrio.color)}>
                              <SignalIcon level={subPrio.level} colorClass={subPrio.color} /> {subPrio.label}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <CustomSelect 
                              variant="ghost"
                              value={subtask.status}
                              onChange={(val) => updateSubtaskStatus(subtask.id, val)}
                              options={[
                                { value: "TODO", label: "To Do" },
                                { value: "IN_PROGRESS", label: "In Prog" },
                                { value: "DONE", label: "Done" }
                              ]}
                            />
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                            {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                          </td>
                          <td className="px-4 py-3.5 text-right relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionSubtask(activeActionSubtask === subtask.id ? null : subtask.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            
                            {activeActionSubtask === subtask.id && (
                              <div 
                                ref={actionMenuRef}
                                className="absolute right-6 top-6 mt-1 w-32 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 py-1 animate-scale-in origin-top-right text-left"
                              >
                                <button 
                                  onClick={() => { setSubtaskToDelete(subtask.id); setActiveActionSubtask(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!task.subtasks || task.subtasks.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">No subtasks yet. Click below to add one.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-800/50 bg-gray-50/30 dark:bg-zinc-900/20">
                  <button onClick={addSubtask} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Subtask
                  </button>
                </div>
              </div>
            </div>

            {/* Comments / Activity Section */}
            <div className="px-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity & Comments ({task.comments?.length || 0})</h3>
              
              <div className="flex flex-col gap-6 mb-8">
                {task.comments?.map(comment => (
                  <div key={comment.id} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                      {comment.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{comment.user?.name || 'User'}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded"><Smile className="w-4 h-4" /></button>
                          <button className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Comment Box */}
              <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col gap-2 bg-white dark:bg-zinc-900 shadow-sm focus-within:border-gray-300 dark:focus-within:border-zinc-600 transition-colors">
                <textarea 
                  placeholder="Add a comment..." 
                  className="w-full bg-transparent outline-none resize-none text-sm min-h-[60px] text-gray-700 dark:text-gray-300 placeholder-gray-400"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><Paperclip className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><Smile className="w-4 h-4" /></button>
                  </div>
                  <button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 rounded-md transition-colors font-medium flex items-center gap-1.5 text-sm"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Sidebar (Right) */}
        <div className="w-full lg:w-[360px] shrink-0 bg-gray-50/50 dark:bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-zinc-800 p-4 sm:p-6 flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar">
          
          {/* Details Block */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 cursor-pointer group">
                <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 rounded transition-colors" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-[15px]">Details</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 relative">
                <div ref={addCustomFieldRef}>
                  <button onClick={() => { setAddCustomFieldOpen(!addCustomFieldOpen); setFieldsMenuOpen(false); }} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors" title="Create Custom Field"><Plus className="w-4 h-4" /></button>
                  
                  {addCustomFieldOpen && (
                    <div className="absolute right-6 top-full mt-1 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 p-3 animate-scale-in origin-top-right">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Create Custom Field</div>
                      <input 
                        type="text" 
                        placeholder="Field Name" 
                        className="w-full text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 mb-2 outline-none focus:border-blue-500 transition-colors placeholder-gray-400" 
                        value={newFieldName}
                        onChange={e => setNewFieldName(e.target.value)}
                      />
                      <select 
                        className="w-full text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 mb-3 outline-none focus:border-blue-500 transition-colors"
                        value={newFieldType}
                        onChange={e => setNewFieldType(e.target.value)}
                      >
                        <option>Text</option>
                        <option>Number</option>
                        <option>Date</option>
                        <option>URL</option>
                      </select>
                      <button 
                        onClick={() => {
                          if(newFieldName.trim()) {
                            setCustomFields([...customFields, {name: newFieldName, type: newFieldType, value: ""}]);
                            setNewFieldName("");
                            setAddCustomFieldOpen(false);
                          }
                        }}
                        disabled={!newFieldName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-medium text-sm py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Create
                      </button>
                    </div>
                  )}
                </div>
                
                <div ref={fieldsMenuRef}>
                  <button onClick={() => { setFieldsMenuOpen(!fieldsMenuOpen); setAddCustomFieldOpen(false); }} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors" title="Configure fields"><Settings className="w-4 h-4" /></button>
                  
                  {fieldsMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 p-2 animate-scale-in origin-top-right">
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Configure Fields</div>
                      {Object.entries(visibleFields).map(([field, isVisible]) => (
                        <label key={field} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", isVisible ? "bg-primary border-primary text-white" : "border-gray-300 dark:border-zinc-600")}>
                            {isVisible && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 select-none">{field}</span>
                          <input type="checkbox" className="hidden" checked={isVisible} onChange={() => setVisibleFields(prev => ({ ...prev, [field as keyof typeof visibleFields]: !prev[field as keyof typeof visibleFields] }))} />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-[85px_1fr] gap-y-4 items-center text-sm">
              {visibleFields.Status && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <div className="relative">
                <button 
                  onClick={() => { setStatusOpen(!statusOpen); setPriorityOpen(false); }}
                  className="flex items-center justify-between w-full font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 py-1.5 px-2 -ml-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.status === 'TODO' ? "bg-orange-500" : task.status === 'IN_PROGRESS' ? "bg-blue-500" : "bg-green-500"
                    )} />
                    {task.status === 'TODO' ? 'Backlog' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                  </div>
                </button>
                
                {statusOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 p-1.5 animate-scale-in">
                      {[
                        { value: 'TODO', label: 'Backlog', color: 'bg-orange-500' },
                        { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
                        { value: 'DONE', label: 'Done', color: 'bg-green-500' }
                      ].map(opt => (
                        <button 
                          key={opt.value}
                          onClick={() => { updateTask({ status: opt.value }); setStatusOpen(false); }}
                          className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                            {opt.label}
                          </div>
                          {task.status === opt.value && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                  </div>
                </>
              )}
              
              {visibleFields.Priority && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">Priority</span>
                  <div className="relative">
                <button 
                  onClick={() => { setPriorityOpen(!priorityOpen); setStatusOpen(false); }}
                  className="flex items-center justify-between w-full font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 py-1.5 px-2 -ml-2 rounded-md transition-colors"
                >
                  <div className={cn("flex items-center gap-2", currentPriority.color)}>
                    <SignalIcon level={currentPriority.level} colorClass={currentPriority.color} />
                    {currentPriority.label}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                
                {priorityOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setPriorityOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 py-1.5 animate-scale-in">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Priority</div>
                      {PRIORITY_OPTIONS.map(opt => (
                        <button 
                          key={opt.value}
                          onClick={() => { updateTask({ priority: opt.value }); setPriorityOpen(false); }}
                          className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className={cn("flex items-center gap-3", opt.color)}>
                            <SignalIcon level={opt.level} colorClass={opt.color} />
                            <span className="text-gray-700 dark:text-gray-300">{opt.label}</span>
                          </div>
                          {task.priority === opt.value && <Check className="w-4 h-4 text-gray-900 dark:text-gray-100" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                  </div>
                </>
              )}
              
              {visibleFields.Members && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">Members</span>
                  <div className="flex items-center gap-1 -ml-1">
                 <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-100 ring-2 ring-white dark:ring-zinc-900 flex items-center justify-center text-[10px] font-bold text-blue-600">
                   {task.user?.name?.charAt(0) || 'U'}
                 </div>
                 <button className="w-6 h-6 rounded-full bg-gray-50 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-600 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                   <Plus className="w-3 h-3" />
                 </button>
                  </div>
                </>
              )}

              {visibleFields.Dates && (
                <>
                  <span className="text-gray-500">Dates</span>
                  <div className="relative">
                <button 
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 py-1.5 px-2 rounded-md -ml-2 transition-colors"
                >
                  <span className="text-xs">📅</span> Jan 10 <span className="text-gray-400 mx-1">→</span> <span className="text-gray-400 font-normal">End</span>
                </button>
                {/* Calendar Dropdown */}
                {calendarOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCalendarOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 p-4 animate-scale-in">
                      <div className="flex items-center justify-between mb-4">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&lt;</button>
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">January 2026</span>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&gt;</button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-700 dark:text-gray-300">
                        <div className="py-1 text-gray-300 dark:text-gray-600">28</div><div className="py-1 text-gray-300 dark:text-gray-600">29</div><div className="py-1 text-gray-300 dark:text-gray-600">30</div><div className="py-1 text-gray-300 dark:text-gray-600">31</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">1</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">2</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">3</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">4</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">5</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">6</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">7</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">8</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">9</div>
                        <div className="py-1 bg-black dark:bg-white text-white dark:text-black rounded-full cursor-pointer shadow-sm font-medium">10</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">11</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">12</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">13</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">14</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">15</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">16</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">17</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">18</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">19</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">20</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">21</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">22</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">23</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">24</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">25</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">26</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">27</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">28</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">29</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">30</div>
                        <div className="py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">31</div>
                      </div>
                    </div>
                  </>
                )}
                  </div>
                </>
              )}
              
              {visibleFields.Labels && (
                <>
                  <span className="text-gray-500">Labels</span>
                  <button onClick={addLabel} className="text-blue-500 hover:text-blue-600 font-medium text-left px-2 py-1 -ml-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors w-max">Add labels</button>
                </>
              )}
              
              {visibleFields.Teams && (
                <>
                  <span className="text-gray-500">Teams</span>
                  <button className="text-blue-500 hover:text-blue-600 font-medium text-left px-2 py-1 -ml-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors w-max">Add team</button>
                </>
              )}
              
              {visibleFields.Reporter && (
                <>
                  <span className="text-gray-500">Reporter</span>
                  <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">{task.user?.name?.charAt(0) || 'U'}</div>
                    {task.user?.name || 'User'}
                  </div>
                </>
              )}
              
              {customFields.map((field, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-gray-500">{field.name}</span>
                  <input 
                    type={field.type === 'Number' ? 'number' : field.type === 'Date' ? 'date' : 'text'}
                    placeholder={`Enter ${field.type.toLowerCase()}...`}
                    className="w-full text-sm bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-500 rounded px-2 py-1 -ml-2 outline-none text-gray-700 dark:text-gray-300 transition-colors"
                    value={field.value}
                    onChange={e => {
                      const newFields = [...customFields];
                      newFields[idx].value = e.target.value;
                      setCustomFields(newFields);
                    }}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Updates Block */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 cursor-pointer group">
                <ChevronDown className="w-4 h-4 text-gray-900 dark:text-gray-100 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800 rounded transition-colors" />
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-[15px]">Updates</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-5 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-gray-200 dark:before:bg-zinc-800">
              {task.comments?.slice(0, 3).map(comment => (
                <div key={comment.id} className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{comment.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">{comment.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(comment.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-xs text-gray-400 italic">No updates yet.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Confirmation Modals */}
      {subtaskToDelete && (
        <ConfirmModal 
          title="Delete Subtask"
          message="Are you sure you want to delete this subtask? This action cannot be undone."
          confirmText="Delete"
          onConfirm={deleteSubtask}
          onCancel={() => setSubtaskToDelete(null)}
        />
      )}
      
      {showDeleteTaskConfirm && (
        <ConfirmModal 
          title="Delete Task"
          message="Are you sure you want to delete this entire task? All subtasks, comments, and attachments will be permanently removed."
          confirmText="Delete Task"
          onConfirm={deleteTask}
          onCancel={() => setShowDeleteTaskConfirm(false)}
        />
      )}
    </div>
  );
}
