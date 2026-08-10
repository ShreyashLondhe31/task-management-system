"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Search, User, Sun, Square, Check, ChevronRight, PanelLeft, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useColorMode, ColorMode } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'theme' | 'color' | null>(null);
  const { theme, setTheme } = useTheme();
  const { colorMode, setColorMode } = useColorMode();

  return (
    <div className="flex h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a]">
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Settings Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 h-full w-64 border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 transition-transform duration-300 ease-in-out shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute right-2 top-2 p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to app
          </Link>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gray-300 dark:focus:border-zinc-600 focus:ring-1 focus:ring-gray-300 dark:focus:ring-zinc-600 transition-all text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <Link 
            href="/settings" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/settings" 
                ? "bg-gray-100/80 dark:bg-zinc-800 text-gray-900 dark:text-gray-100" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
            )}
          >
            <User className="w-4 h-4" /> Profile
          </Link>
          
          {/* Theme Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveMenu('theme')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button 
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4" /> Theme
              </div>
              <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", activeMenu === 'theme' && "rotate-90")} />
            </button>
            
            {activeMenu === 'theme' && (
              <div className="absolute top-full left-0 mt-1 md:top-0 md:left-full md:ml-1 md:mt-0 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 py-2 z-50 animate-scale-in origin-top md:origin-top-left">
                <button 
                  onClick={() => { setTheme('light'); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">☀️ Light</span>
                  {theme === 'light' && <Check className="w-3 h-3" />}
                </button>
                <button 
                  onClick={() => { setTheme('dark'); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">🌙 Dark</span>
                  {theme === 'dark' && <Check className="w-3 h-3" />}
                </button>
                <button 
                  onClick={() => { setTheme('system'); setActiveMenu(null); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <span className="flex items-center gap-2">💻 System</span>
                  {theme === 'system' && <Check className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
          
          {/* Color Mode Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setActiveMenu('color')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button 
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Square className="w-4 h-4 fill-current text-primary" /> Color
              </div>
              <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", activeMenu === 'color' && "rotate-90")} />
            </button>
            
            {activeMenu === 'color' && (
              <div className="absolute top-full left-0 mt-1 md:top-0 md:left-full md:ml-1 md:mt-0 w-40 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 py-2 z-50 animate-scale-in origin-top md:origin-top-left">
                <div className="px-3 py-1.5 text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wider">Color Mode</div>
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
                    onClick={() => { setColorMode(c.mode as ColorMode); setActiveMenu(null); }}
                    className="w-full flex items-center justify-between px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <span className="flex items-center gap-2"><span className={cn("w-3 h-3 rounded-sm", c.color)} /> {c.name}</span>
                    {colorMode === c.mode && <Check className="w-3 h-3 text-gray-900 dark:text-gray-100" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FDFDFD] dark:bg-[#0a0a0a]">
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b border-gray-100 dark:border-zinc-800 flex items-center px-4 shrink-0 bg-white dark:bg-zinc-900">
          <button 
            onClick={() => setIsOpen(true)}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 md:px-12 md:py-16">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
