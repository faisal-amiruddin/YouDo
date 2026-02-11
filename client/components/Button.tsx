
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'dark';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-[#ffdf00] text-black', // Bright Yellow
    secondary: 'bg-[#00f0ff] text-black', // Cyan
    danger: 'bg-[#ff5555] text-white', // Bright Red
    success: 'bg-[#00ff9d] text-black', // Neon Green
    warning: 'bg-[#ff9d00] text-black', // Orange
    dark: 'bg-black text-white dark:bg-white dark:text-black', // Inverted
  };

  return (
    <button
      className={`
        px-6 py-3 border-4 border-black dark:border-gray-200 font-black uppercase tracking-widest
        transition-all duration-200 neo-brutal-shadow active:neo-brutal-shadow-active
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
