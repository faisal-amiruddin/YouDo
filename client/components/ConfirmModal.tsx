
import React from 'react';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#ff5555] dark:bg-[#7f1d1d] border-4 border-black dark:border-gray-200 p-8 w-full max-w-md neo-brutal-shadow-lg transform rotate-1">
        <h3 className="text-3xl font-black uppercase mb-4 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
            {title}
        </h3>
        <div className="bg-white dark:bg-[#1a1a1a] dark:text-white border-4 border-black dark:border-gray-200 p-4 mb-6 font-bold text-lg">
            {message}
        </div>
        <div className="flex gap-4">
            <Button variant="danger" className="flex-1 bg-black text-white dark:bg-white dark:text-black border-white dark:border-black" onClick={onConfirm}>
                YES, DELETE
            </Button>
            <Button variant="primary" className="flex-1" onClick={onCancel}>
                NO, KEEP IT
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
