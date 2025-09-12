import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = false,
  onClick,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300 ease-in-out';
  
  const variantClasses = {
    default: 'bg-white shadow-soft border border-neutral-100',
    elevated: 'bg-white shadow-medium border border-neutral-100',
    outlined: 'bg-white border-2 border-neutral-200 shadow-soft',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-medium',
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'hover:shadow-medium hover:-translate-y-1 hover:scale-[1.02] cursor-pointer'
    : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
