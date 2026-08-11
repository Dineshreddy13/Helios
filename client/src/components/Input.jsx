import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', id, ...props }, ref) => {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-red-500 text-xs mt-1.5">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
