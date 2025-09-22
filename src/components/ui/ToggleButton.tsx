import React, { useState } from 'react';

interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => Promise<void>;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onToggle,
  loading = false,
  size = 'sm',
  className = ''
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    const action = isActive ? 'desactivar' : 'activar';
    const confirmMessage = `¿Estás seguro de que deseas ${action} este elemento?`;
    
    if (window.confirm(confirmMessage)) {
      setIsToggling(true);
      try {
        await onToggle();
      } catch (error) {
        console.error('Error toggling status:', error);
        alert(`Error al ${action} el elemento`);
      } finally {
        setIsToggling(false);
      }
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-md border transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = isActive
    ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 focus:ring-red-500'
    : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100 focus:ring-green-500';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || isToggling}
      className={classes}
      title={isActive ? 'Desactivar' : 'Activar'}
    >
      {isToggling ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {isActive ? 'Desactivando...' : 'Activando...'}
        </>
      ) : (
        <>
          {isActive ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Desactivar
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Activar
            </>
          )}
        </>
      )}
    </button>
  );
};

export default ToggleButton;