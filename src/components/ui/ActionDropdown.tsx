import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});
  const [isUp, setIsUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter((item) => !item.hidden);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    if (isOpen) {
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        // Check if there is enough space below (assume menu might be up to 250px tall)
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < 250 && rect.top > 250;
        
        setIsUp(openUp);
        setDropdownStyles({
          position: "fixed",
          top: openUp ? "auto" : `${rect.bottom + 4}px`,
          bottom: openUp ? `${window.innerHeight - rect.top + 4}px` : "auto",
          right: `${window.innerWidth - rect.right}px`,
          zIndex: 9999,
          width: "12rem", // w-48 = 12rem
        });
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  if (visibleItems.length === 0) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={dropdownStyles}
          className={`rounded-xl bg-white shadow-xl shadow-stone-200/50 ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden transform transition-all duration-200 ease-out ${isUp ? 'origin-bottom-right' : 'origin-top-right'}`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {visibleItems.map((item, index) => {
              let colorClass = "text-stone-700 hover:bg-stone-50 hover:text-stone-900";
              if (item.variant === "danger") colorClass = "text-red-600 hover:bg-red-50 hover:text-red-700";
              if (item.variant === "warning") colorClass = "text-amber-600 hover:bg-amber-50 hover:text-amber-700";
              if (item.variant === "success") colorClass = "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700";

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
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
        </div>,
        document.body
      )}
    </div>
  );
}
