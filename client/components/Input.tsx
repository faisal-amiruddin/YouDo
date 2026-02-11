
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  isTextArea?: boolean;
}

const Input: React.FC<InputProps> = ({ label, isTextArea, className = '', ...props }) => {
  const commonClasses = `
    w-full p-4 border-4 border-black dark:border-gray-200 
    font-bold neo-brutal-shadow 
    focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20
    bg-[#fafafa] dark:bg-[#2a2a2a] 
    text-black dark:text-white 
    placeholder-gray-500 dark:placeholder-gray-400
    transition-colors duration-200
    ${className}
  `;

  return (
    <div className="mb-6 group">
      {label && (
        <label className="dark:text-white block mb-2 font-black uppercase tracking-wider text-sm group-focus-within:text-blue-600 dark:group-focus-within:text-yellow-400 transition-colors">
          {label}
        </label>
      )}
      {isTextArea ? (
        <textarea
          className={commonClasses}
          rows={3}
          {...(props as any)}
        />
      ) : (
        <input
          className={commonClasses}
          {...(props as any)}
        />
      )}
    </div>
  );
};

export default Input;
