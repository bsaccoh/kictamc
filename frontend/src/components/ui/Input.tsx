import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
            {label} {props.required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`block w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-navy-600 transition-colors placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed ${
            error ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
