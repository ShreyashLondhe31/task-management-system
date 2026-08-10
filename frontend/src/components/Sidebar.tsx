"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Folder, ChevronDown, ChevronsUpDown, Sun, Moon, Settings, Square, Check, ChevronRight, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useColorMode, ColorMode } from "@/context/ThemeContext";
import { useSidebar } from "@/app/dashboard/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<'theme' | 'color' | null>(null);
  
  const { theme, setTheme } = useTheme();
  const { colorMode, setColorMode } = useColorMode();
  const { isOpen, setIsOpen } = useSidebar();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setProfileOpen(false);
      setActiveSubMenu(null);
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Overlay to handle click outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      <aside className={cn(
        "fixed md:relative z-50 h-full border-r border-gray-100 dark:border-zinc-800 flex flex-col bg-[#FDFDFD] dark:bg-zinc-900 transition-all duration-300 ease-in-out shrink-0",
        profileOpen ? "overflow-visible" : "overflow-hidden",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 md:w-0 border-r-0"
      )}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute right-2 top-2 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

      {/* Profile */}
      <div className="p-4 mt-2">
        <button 
          onClick={() => {
            setProfileOpen(!profileOpen);
            setActiveSubMenu(null);
          }}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}&backgroundColor=c0aede`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate max-w-[120px]">{user?.name || 'User'}</span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Profile Dropdown */}
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <div className="absolute top-[72px] left-4 w-60 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 z-50 py-2 animate-scale-in origin-top-left">
              
              <div className="px-4 py-3 flex flex-col items-center border-b border-gray-100 dark:border-zinc-800 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 overflow-hidden mb-2">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}&backgroundColor=c0aede`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user?.name || 'User'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</span>
              </div>

              <div 
                className="relative"
                onMouseEnter={() => setActiveSubMenu('theme')}
                onMouseLeave={() => setActiveSubMenu(null)}
              >
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <div className="flex items-center gap-3"><Sun className="w-4 h-4 text-gray-500"/> Change Theme</div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                
                {activeSubMenu === 'theme' && (
                  <div className="absolute top-0 left-full ml-1 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-left-1">
                    <button onClick={() => { setTheme('light'); setActiveSubMenu(null); }} className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <span className="flex items-center gap-2">☀️ Light</span>
                      {theme === 'light' && <Check className="w-3 h-3 text-gray-900 dark:text-gray-100" />}
                    </button>
                    <button onClick={() => { setTheme('dark'); setActiveSubMenu(null); }} className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <span className="flex items-center gap-2">🌙 Dark</span>
                      {theme === 'dark' && <Check className="w-3 h-3 text-gray-900 dark:text-gray-100" />}
                    </button>
                    <button onClick={() => { setTheme('system'); setActiveSubMenu(null); }} className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <span className="flex items-center gap-2">💻 System</span>
                      {theme === 'system' && <Check className="w-3 h-3 text-gray-900 dark:text-gray-100" />}
                    </button>
                  </div>
                )}
              </div>

              <div 
                className="relative"
                onMouseEnter={() => setActiveSubMenu('color')}
                onMouseLeave={() => setActiveSubMenu(null)}
              >
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <div className="flex items-center gap-3"><Square className="w-4 h-4 text-primary fill-primary"/> Color Mode</div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {activeSubMenu === 'color' && (
                  <div className="absolute top-0 left-full ml-1 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 py-2 animate-in fade-in slide-in-from-left-1">
                    <div className="px-3 py-1.5 text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Color Mode</div>
                    {[
                      { name: 'Amber', mode: 'amber', color: 'bg-amber-500' },
                      { name: 'Blue', mode: 'blue', color: 'bg-blue-500' },
                      { name: 'Pink', mode: 'pink', color: 'bg-pink-500' },
                      { name: 'Rose', mode: 'rose', color: 'bg-rose-500' },
                      { name: 'Emerald', mode: 'emerald', color: 'bg-emerald-500' },
                      { name: 'Black', mode: 'black', color: 'bg-gray-900 dark:bg-white' },
                    ].map((c) => (
                      <button 
                        key={c.name} 
                        onClick={() => { setColorMode(c.mode as ColorMode); setActiveSubMenu(null); }}
                        className="w-full flex items-center justify-between px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <span className="flex items-center gap-2"><span className={cn("w-3 h-3 rounded-sm", c.color)} /> {c.name}</span>
                        {colorMode === c.mode && <Check className="w-3 h-3 text-gray-900 dark:text-gray-100" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                href="/settings"
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <div className="flex items-center gap-3"><Settings className="w-4 h-4 text-gray-500"/> Settings</div>
              </Link>
              
              <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <div className="flex items-center gap-3"><LogOut className="w-4 h-4 text-red-500"/> Log Out</div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Workspace Menu */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between text-gray-900 mb-2 px-2">
          <span className="text-sm font-medium">Workspace</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        
        <nav className="flex flex-col gap-1 mt-2">
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/dashboard" ? "bg-gray-100/70 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <CheckSquare className="w-4 h-4" />
            Tasks
          </Link>
          <Link 
            href="/dashboard/projects" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/dashboard/projects" ? "bg-gray-100/70 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Folder className="w-4 h-4" />
            Projects
          </Link>
        </nav>
      </div>
    </aside>
    </>
  );
}
