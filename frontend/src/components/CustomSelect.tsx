"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  triggerClassName?: string;
  dropdownClassName?: string;
  variant?: 'default' | 'ghost';
}

export default function CustomSelect({ value, onChange, options, triggerClassName, dropdownClassName, variant = 'default' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close if click is outside both the trigger and the dropdown portal
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        minWidth: variant === 'ghost' ? '120px' : undefined,
      });
    }

    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true); // Capture phase to catch all scrolls
    }
    
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, variant]);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={cn(
          "w-full flex items-center justify-between outline-none transition-colors",
          variant === 'default' && "px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-900 dark:text-gray-100 text-sm",
          variant === 'ghost' && "bg-transparent font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 p-1.5 rounded -ml-1 text-xs",
          triggerClassName
        )}
      >
        <span className="truncate">{selected?.label || "Select option"}</span>
        <ChevronDown className={cn("shrink-0 ml-2 transition-transform", isOpen && "rotate-180", variant === 'default' ? "w-4 h-4 text-gray-500" : "w-3 h-3 text-gray-400")} />
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className={cn("z-[100] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 py-1 overflow-hidden animate-scale-in origin-top-left", dropdownClassName)}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <span className={cn(value === option.value && "font-medium text-primary")}>{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 text-primary ml-3" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
