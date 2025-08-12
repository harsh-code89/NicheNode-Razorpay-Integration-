import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface DropdownOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownButtonProps {
  label: string;
  options: DropdownOption[];
  selectedId?: string;
  onSelect?: (option: DropdownOption) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  maxHeight?: string;
  showSelectedIcon?: boolean;
}

export function DropdownButton({
  label,
  options,
  selectedId,
  onSelect,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  position = 'bottom-left',
  maxHeight = "300px",
  showSelectedIcon = true
}: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    selectedId ? options.find(opt => opt.id === selectedId) || null : null
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter out divider-only options for keyboard navigation
  const navigableOptions = options.filter(opt => !opt.divider);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev < navigableOptions.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : navigableOptions.length - 1;
            return nextIndex;
          });
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < navigableOptions.length) {
            const option = navigableOptions[focusedIndex];
            handleOptionSelect(option);
          }
          break;

        case 'Tab':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, focusedIndex, navigableOptions]);

  // Auto-scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const focusedElement = menuRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [focusedIndex, isOpen]);

  // Position dropdown to stay within viewport
  useEffect(() => {
    if (isOpen && menuRef.current && buttonRef.current) {
      const menu = menuRef.current;
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // Reset position classes
      menu.classList.remove('dropdown-top', 'dropdown-bottom', 'dropdown-left', 'dropdown-right');

      // Determine vertical position
      const spaceBelow = viewport.height - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = menuRect.height;

      if (position.includes('top') || (spaceBelow < menuHeight && spaceAbove > menuHeight)) {
        menu.classList.add('dropdown-top');
      } else {
        menu.classList.add('dropdown-bottom');
      }

      // Determine horizontal position
      const spaceRight = viewport.width - rect.left;
      const spaceLeft = rect.right;
      const menuWidth = menuRect.width;

      if (position.includes('right') || (spaceRight < menuWidth && spaceLeft > menuWidth)) {
        menu.classList.add('dropdown-right');
      } else {
        menu.classList.add('dropdown-left');
      }
    }
  }, [isOpen, position]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setFocusedIndex(-1);
  };

  const handleOptionSelect = (option: DropdownOption) => {
    if (option.disabled) return;

    setSelectedOption(option);
    setIsOpen(false);
    setFocusedIndex(-1);
    
    if (option.action) {
      option.action();
    }
    
    if (onSelect) {
      onSelect(option);
    }

    buttonRef.current?.focus();
  };

  const getPositionClasses = () => {
    const baseClasses = "absolute z-50 mt-1 transition-all duration-200 ease-out";
    
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} right-0 top-full`;
      case 'top-left':
        return `${baseClasses} left-0 bottom-full mb-1`;
      case 'top-right':
        return `${baseClasses} right-0 bottom-full mb-1`;
      default: // bottom-left
        return `${baseClasses} left-0 top-full`;
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}

      {/* Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-left 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 ease-in-out
          ${disabled 
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed' 
            : 'hover:border-slate-400 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
          ${buttonClassName}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${label}-label` : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedOption && selectedOption.icon && showSelectedIcon && (
              <selectedOption.icon className="w-5 h-5 text-slate-500" />
            )}
            <span className={`block truncate ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <div className="flex items-center">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-400 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200" />
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            ${getPositionClasses()}
            w-full min-w-max bg-white border border-slate-200 rounded-lg shadow-lg
            transform transition-all duration-200 ease-out
            ${isOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }
            ${menuClassName}
          `}
          style={{ maxHeight }}
          role="listbox"
          aria-labelledby={label ? `${label}-label` : undefined}
        >
          <div className="py-1 overflow-auto" style={{ maxHeight: `calc(${maxHeight} - 2rem)` }}>
            {options.map((option, index) => {
              if (option.divider) {
                return (
                  <div key={`divider-${index}`} className="border-t border-slate-200 my-1" />
                );
              }

              const navigableIndex = navigableOptions.findIndex(opt => opt.id === option.id);
              const isFocused = navigableIndex === focusedIndex;
              const isSelected = selectedOption?.id === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  disabled={option.disabled}
                  className={`
                    w-full text-left px-4 py-3 text-sm transition-colors duration-150
                    flex items-center space-x-3
                    ${option.disabled 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                    }
                    ${isFocused && !option.disabled ? 'bg-blue-50 text-blue-700' : ''}
                    ${isSelected ? 'bg-blue-100 text-blue-800 font-medium' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                >
                  {option.icon && (
                    <option.icon className={`w-5 h-5 ${
                      option.disabled 
                        ? 'text-slate-300' 
                        : isSelected 
                          ? 'text-blue-600' 
                          : isFocused 
                            ? 'text-blue-600' 
                            : 'text-slate-500'
                    }`} />
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom CSS for positioning */}
      <style jsx>{`
        .dropdown-top {
          bottom: 100% !important;
          top: auto !important;
          margin-bottom: 0.25rem !important;
          margin-top: 0 !important;
        }
        .dropdown-bottom {
          top: 100% !important;
          bottom: auto !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0 !important;
        }
        .dropdown-left {
          left: 0 !important;
          right: auto !important;
        }
        .dropdown-right {
          right: 0 !important;
          left: auto !important;
        }
      `}</style>
    </div>
  );
}