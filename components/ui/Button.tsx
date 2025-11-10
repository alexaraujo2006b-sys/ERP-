
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-secondary focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-error',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-success',
    warning: 'bg-accent text-white hover:bg-amber-600 focus:ring-accent',
  };

  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
