import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'peer transition-all duration-200 ease-in-out focus:outline-none';
  
  const variantClasses = {
    default: 'border-0 border-b-2 border-neutral-300 focus:border-primary-500 bg-transparent px-0 py-3',
    filled: 'border border-neutral-300 focus:border-primary-500 bg-neutral-50 focus:bg-white rounded-xl px-4 py-3',
    outlined: 'border-2 border-neutral-300 focus:border-primary-500 bg-white rounded-xl px-4 py-3',
  };

  const stateClasses = error
    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
    : success
    ? 'border-success-500 focus:border-success-500 focus:ring-success-500'
    : '';

  const iconPadding = leftIcon
    ? 'pl-10'
    : rightIcon
    ? 'pr-10'
    : '';

  const widthClass = fullWidth ? 'w-full' : '';

  const inputClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${stateClasses}
    ${iconPadding}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const labelClasses = error
    ? 'text-danger-600'
    : success
    ? 'text-success-600'
    : 'text-neutral-700 peer-focus:text-primary-600';

  const helperTextClasses = error
    ? 'text-danger-600'
    : success
    ? 'text-success-600'
    : 'text-neutral-500';

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-medium mb-2 transition-colors duration-200 ${labelClasses}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`${error ? 'text-danger-400' : success ? 'text-success-400' : 'text-neutral-400'}`}>
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`${error ? 'text-danger-400' : success ? 'text-success-400' : 'text-neutral-400'}`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <div className="mt-2 flex items-center">
          {(error || success) && (
            <span className="mr-1">
              {error ? (
                <svg className="h-4 w-4 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
          <p className={`text-sm ${helperTextClasses}`}>
            {error || success || helperText}
          </p>
        </div>
      )}
    </div>
  );
};

export default Input;
