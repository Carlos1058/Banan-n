import React, { useEffect } from 'react';
import { UserProfile } from '../types';

const XIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface StreakModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    lastReward: { day: number, diamonds: number } | null;
    clearLastReward: () => void;
}

const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, userProfile, lastReward, clearLastReward }) => {
    
    useEffect(() => {
        if (lastReward) {
            const timer = setTimeout(() => {
                clearLastReward();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [lastReward, clearLastReward]);

    if (!isOpen) return null;

    const streak = userProfile.streak;
    const daysToShow = Math.max(21, streak + 7); // Show at least 3 weeks or up to a week ahead
    const dayElements = Array.from({ length: daysToShow }, (_, i) => i + 1);

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 transform transition-all animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">🔥 Camino de Racha</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                
                {lastReward && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-r-lg mb-4 animate-in fade-in-0 slide-in-from-top-5 duration-500" role="alert">
                        <p className="font-bold">¡Recompensa de Cofre!</p>
                        <p>¡Felicidades por alcanzar {lastReward.day} días! Ganaste {lastReward.diamonds} 💎.</p>
                    </div>
                )}
                
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {streak > 0 
                        ? `¡Felicidades por tu racha de ${streak} día${streak > 1 ? 's' : ''}! Sigue así para desbloquear cofres de recompensa.`
                        : '¡Comienza tu racha completando el día de hoy! Cada 5 días te espera una recompensa.'
                    }
                </p>

                <div className="max-h-64 overflow-y-auto pr-2">
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                        {dayElements.map(day => {
                            const isCompleted = day <= streak;
                            const isNext = day === streak + 1;
                            const isRewardDay = day % 5 === 0;
                            
                            let content = day.toString();
                            let bgColor = 'bg-slate-100 dark:bg-slate-700';
                            let textColor = 'text-slate-500 dark:text-slate-400';
                            let borderColor = 'border-transparent';
                            let extraClasses = '';

                            if (isRewardDay) content = isCompleted ? '💎' : '🎁';
                            
                            if (isCompleted) {
                                bgColor = 'bg-primary-500';
                                textColor = 'text-white';
                                content = isRewardDay ? '💎' : '✓';
                            } else if (isNext) {
                                borderColor = 'border-primary-500 dark:border-primary-400';
                                textColor = 'text-primary-600 dark:text-primary-300';
                                extraClasses = 'animate-pulse-strong';
                            }

                            return (
                                <div 
                                    key={day} 
                                    className={`h-14 w-14 flex flex-col items-center justify-center rounded-lg border-2 font-bold text-lg transition-all ${bgColor} ${textColor} ${borderColor} ${extraClasses}`}
                                >
                                    <span>{content}</span>
                                    {!isRewardDay && <span className="text-xs font-normal opacity-70">{`Día ${day}`}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreakModal;
