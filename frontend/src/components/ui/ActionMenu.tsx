import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'right' | 'left';
  label?: string;
  direction?: 'auto' | 'down' | 'up';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  align = 'right',
  label = 'Actions',
  direction = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && menuRef.current) {
      if (direction === 'down') {
        setDropUp(false);
      } else if (direction === 'up') {
        setDropUp(true);
      } else {
        const rect = menuRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        // Only flip upwards if very cramped below (< 160px) AND substantially more space above
        setDropUp(spaceBelow < 160 && spaceAbove > 200);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={label}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-slate-200 text-slate-900 shadow-inner'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, idx) => {
            if (item.disabled) return null;

            const baseClasses = `w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left ${
              item.variant === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : item.variant === 'warning'
                ? 'text-amber-700 hover:bg-amber-50'
                : 'text-slate-700 hover:bg-slate-50 hover:text-navy-950'
            }`;

            if (item.to) {
              return (
                <Link
                  key={idx}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={baseClasses}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={baseClasses}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
