import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

interface MenuCoords {
  top?: number;
  bottom?: number;
  left: number;
  maxHeight: number;
  dropUp: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  align = 'right',
  label = 'Actions',
  direction = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  const calculateCoords = useCallback((): MenuCoords | null => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 220; // Width in pixels
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const visibleItems = items.filter((i) => !i.disabled);
    const estimatedHeight = Math.max(visibleItems.length * 40 + 16, 120);

    const spaceBelow = windowHeight - rect.bottom;
    const spaceAbove = rect.top;

    let dropUp = false;
    if (direction === 'up') {
      dropUp = true;
    } else if (direction === 'down') {
      dropUp = false;
    } else {
      // Auto: drop up if cramped below and more space above
      dropUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    }

    // Horizontal position
    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    // Bound inside viewport margins
    left = Math.max(10, Math.min(left, windowWidth - menuWidth - 10));

    if (dropUp) {
      const bottom = windowHeight - rect.top + 6;
      const maxHeight = Math.max(100, rect.top - 16);
      return { bottom, left, maxHeight, dropUp: true };
    } else {
      const top = rect.bottom + 6;
      const maxHeight = Math.max(100, windowHeight - rect.bottom - 16);
      return { top, left, maxHeight, dropUp: false };
    }
  }, [items, align, direction]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isOpen) {
      const newCoords = calculateCoords();
      setCoords(newCoords);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (event: Event) => {
      // If scroll happens inside the menu itself, keep open
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={label}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-navy-900 text-white shadow-sm ring-2 ring-navy-800/30'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/60'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              width: '220px',
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 99999,
            }}
            className="bg-white rounded-xl shadow-2xl border border-slate-200/90 p-1.5 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 ring-1 ring-slate-900/10"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, idx) => {
              if (item.disabled) return null;

              const baseClasses = `w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                item.variant === 'danger'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : item.variant === 'warning'
                  ? 'text-amber-700 hover:bg-amber-50'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-navy-950'
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
          </div>,
          document.body
        )}
    </div>
  );
};
