import React, { useEffect } from 'react';

const XIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface WelcomeToastProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  message: string;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ isOpen, onClose, userName, message }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000); // Auto-dismiss after 6 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm sm:max-w-md px-4">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 flex items-start gap-4 border border-slate-200 dark:border-slate-700 animate-toast-in"
        role="alert"
        aria-live="assertive"
      >
        <span className="text-4xl pt-1">🍌</span>
        <div className="flex-grow">
          <p className="font-bold text-slate-800 dark:text-white">¡Feliz día, {userName}!</p>
          <p className="text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <button 
            onClick={onClose} 
            className="flex-shrink-0 p-1.5 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Cerrar notificación"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeToast;
