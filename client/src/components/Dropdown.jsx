import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 mt-2 w-48 rounded-md bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg focus:outline-none ${align === 'right' ? 'origin-top-right right-0' : 'origin-top-left left-0'}`}>
          <div className="py-1 flex flex-col">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && typeof child.type === 'function') {
                return React.cloneElement(child, { 
                  onClick: (e) => {
                    setIsOpen(false);
                    if (child.props.onClick) child.props.onClick(e);
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '', variant = 'default' }) => {
  const baseClass = "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-[var(--border-color)]";
  const textClass = variant === 'destructive' ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white';
  
  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${textClass} ${className}`}
    >
      {children}
    </button>
  );
};
