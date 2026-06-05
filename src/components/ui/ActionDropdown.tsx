import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "warning" | "success";
  hidden?: boolean;
}

interface ActionDropdownProps {
  items: ActionItem[];
}

export function ActionDropdown({ items }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter((item) => !item.hidden);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (visibleItems.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-xl shadow-stone-200/50 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden transform transition-all duration-200 ease-out">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {visibleItems.map((item, index) => {
              let colorClass = "text-stone-700 hover:bg-stone-50 hover:text-stone-900";
              if (item.variant === "danger") colorClass = "text-red-600 hover:bg-red-50 hover:text-red-700";
              if (item.variant === "warning") colorClass = "text-amber-600 hover:bg-amber-50 hover:text-amber-700";
              if (item.variant === "success") colorClass = "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700";

              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`group flex w-full items-center px-4 py-2.5 text-sm font-medium transition-colors ${colorClass}`}
                  role="menuitem"
                >
                  <span className="mr-3 opacity-70 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
