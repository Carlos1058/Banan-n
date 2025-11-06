import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, WorkoutPlan, DailyWorkout, DailyDiet, Exercise } from '../types';
import { modifyWorkoutPlan } from '../services/geminiService';
import Header from './Header';
import StreakModal from './StreakModal';
import WelcomeToast from './WelcomeToast';
import DiamondModal from './DiamondModal';

interface DashboardProps {
  userProfile: UserProfile;
  plan: WorkoutPlan | null;
  onLogout: () => void;
  onStartOnboarding: () => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setWorkoutPlan: React.Dispatch<React.SetStateAction<WorkoutPlan | null>>;
}

// --- SVG Icons ---
const CalendarIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CalendarWeekIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01M17 18h.01" />
    </svg>
);

const SparklesIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624L16.5 21.75l-.398-1.126a3.375 3.375 0 00-2.456-2.456L12.75 18l1.126-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.126a3.375 3.375 0 002.456 2.456L20.25 18l-1.126.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

const UserIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CameraIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const CheckIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const StoreIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25a.75.75 0 01-.75-.75v-7.5a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75zm-4.5 0h-.008v.008H4.5v-.008zm15 0h.008v.008h-.008v-.008zm-4.5 0h.008v.008h-.008v-.008zm-1.5-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21m12.008-9.008a18.12 18.12 0 00-18 0m18 0a.75.75 0 00.75-.75V9.313a.75.75 0 00-.424-.684l-7.5-4.125a.75.75 0 00-.652 0l-7.5 4.125a.75.75 0 00-.424.684v2.533a.75.75 0 00.75.75m18 0a.75.75 0 00.424-.684l-7.5-4.125a.75.75 0 00-.652 0l-7.5 4.125a.75.75 0 00-.424.684" />
    </svg>
);

const XIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- New Icons ---
const DumbbellIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 6.5A1.5 1.5 0 014.5 5h1.75a.75.75 0 000-1.5H4.5a3 3 0 00-3 3v4a3 3 0 003 3h1.75a.75.75 0 000-1.5H4.5a1.5 1.5 0 01-1.5-1.5v-4zM10 8a.75.75 0 000 1.5h1.25a.75.75 0 000-1.5H10zM8.75 8a.75.75 0 000 1.5H10a.75.75 0 000-1.5H8.75zM17 6.5a1.5 1.5 0 00-1.5-1.5h-1.75a.75.75 0 000 1.5h1.75a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5-1.5h-1.75a.75.75 0 000 1.5h1.75a3 3 0 003-3v-4a3 3 0 00-3-3z" />
    </svg>
);

const BreakfastIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M15.5 2.5a3 3 0 00-3-3H9a3 3 0 00-3 3v.528A4.453 4.453 0 004 7.5v2.71a.75.75 0 00.187.508l2.294 2.868a1.25 1.25 0 00.93.414h3.178a1.25 1.25 0 00.93-.414l2.294-2.868A.75.75 0 0016 10.21V7.5a4.453 4.453 0 00-1.5-4.472V2.5zM14.5 7.5a3 3 0 01-3 3H8.5a3 3 0 01-3-3V6.353a3.001 3.001 0 012.5-2.95V2.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v.903a3.001 3.001 0 012.5 2.95V7.5z" />
        <path d="M5 16.5a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1z" />
    </svg>
);

const LunchIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M15.5 7.5a2.5 2.5 0 00-1.782-2.385.25.25 0 00-.318.318A2 2 0 0115 7.5v2.25a.75.75 0 01-1.5 0v-2.5a.25.25 0 00-.25-.25H6.25a.25.25 0 00-.25.25v2.5a.75.75 0 01-1.5 0V7.5a2 2 0 011.566-1.934.25.25 0 00-.318-.318A2.5 2.5 0 004.5 7.5v2.879a.25.25 0 00.07.177l6.5 6.5a.25.25 0 00.36 0l6.5-6.5a.25.25 0 00.07-.177V7.5z" clipRule="evenodd" />
        <path d="M8 0a1 1 0 00-1 1v2.586a1 1 0 00.293.707l1.414 1.414a1 1 0 001.414 0L11.414 4.293A1 1 0 0011.707 3.586V1a1 1 0 00-1-1H8z" />
    </svg>
);

const DinnerIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.586 3.086a.5.5 0 01.708-.708L14.95 14.03a.5.5 0 01-.708.708L2.586 3.086z" />
        <path fillRule="evenodd" d="M5.015 2.382A.75.75 0 016 2h.243a.75.75 0 01.744.658l.26 1.298a.75.75 0 01-.21 1.05l-.341.342a.75.75 0 01-1.06 0l-.342-.341a.75.75 0 01.114-1.144l.217-.109a2.25 2.25 0 00-2.362-2.362l-.11.217a.75.75 0 01-1.143.114L2.03 4.075a.75.75 0 010-1.06l.341-.341a.75.75 0 011.05-.21l1.298.26A.75.75 0 015.015 2.382zM17.43 14.28a.75.75 0 01-1.05.21l-1.298-.26a.75.75 0 01-.658-.744V13a.75.75 0 01.75-.75h1.25a.75.75 0 01.75.75v.015c.33.023.655.093.966.208a.75.75 0 01.21 1.05l-.34.34a.75.75 0 01-1.06 0l-.016-.015z" clipRule="evenodd" />
    </svg>
);

const SnackIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-3.328 1.635l-1.42 2.13A4 4 0 002 9.215V14.5A1.5 1.5 0 003.5 16h13a1.5 1.5 0 001.5-1.5V9.215a4 4 0 00-3.252-3.45l-1.42-2.13A4 4 0 0010 2zm0 1.5a2.5 2.5 0 011.968 1.01l1.42 2.13a.5.5 0 010 .4l-1.42 2.13A2.5 2.5 0 0110 10.5a2.5 2.5 0 01-1.968-1.01L6.612 7.36a.5.5 0 010-.4l1.42-2.13A2.5 2.5 0 0110 3.5zM4 14.5V9.215a2.5 2.5 0 012.032-2.4l.25-.05a4.012 4.012 0 001.995.835 4 4 0 003.446 0 4.012 4.012 0 001.995-.835l.25.05A2.5 2.5 0 0116 9.215V14.5H4z" clipRule="evenodd" />
    </svg>
);

const CheckCircleIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const getMealIcon = (mealName: string) => {
    const lowerCaseName = mealName.toLowerCase();
    if (lowerCaseName.includes('desayuno')) return <BreakfastIcon className="w-6 h-6 text-amber-500" />;
    if (lowerCaseName.includes('almuerzo') || lowerCaseName.includes('comida')) return <LunchIcon className="w-6 h-6 text-orange-500" />;
    if (lowerCaseName.includes('cena')) return <DinnerIcon className="w-6 h-6 text-indigo-500" />;
    if (lowerCaseName.includes('snack') || lowerCaseName.includes('merienda')) return <SnackIcon className="w-6 h-6 text-green-500" />;
    return null;
};

// --- Animation Component ---
interface StreakCompletionAnimationProps {
    isOpen: boolean;
    onClose: () => void;
    streak: number;
}

const StreakCompletionAnimation: React.FC<StreakCompletionAnimationProps> = ({ isOpen, onClose, streak }) => {
    const [streakNumber, setStreakNumber] = useState(streak > 1 ? streak - 1 : 0);

    useEffect(() => {
        if (isOpen && streak > 0) {
            if (streak > 1) {
                setStreakNumber(streak - 1);
                setTimeout(() => setStreakNumber(streak), 500);
            } else {
                setStreakNumber(1);
            }
        }
    }, [isOpen, streak]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-modal-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-8 border border-primary-500/20 text-center animate-modal-content-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-6xl animate-in fade-in-0 zoom-in-75 duration-500">🎉</div>
                <h2 className="text-3xl font-bold mt-4 animate-text-focus-in">¡Día Completado!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">¡Increíble trabajo! Sigue así.</p>

                <div className="my-6">
                    <p className="text-lg font-semibold">Tu nueva racha</p>
                    <div className="text-7xl font-bold text-primary-500 flex items-center justify-center gap-3 transition-all duration-300">
                        🔥 <span className="transition-all duration-300" style={{ transform: `scale(${streakNumber === streak ? 1 : 0.8})` }}>{streakNumber}</span>
                    </div>
                </div>

                <div className="relative h-12">
                    <div key={streak} className="absolute inset-0 flex items-center justify-center animate-float-up">
                        <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-bold py-2 px-4 rounded-full inline-flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5" />
                            <span>+15 Diamantes 💎</span>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="mt-4 w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-primary-700 transition-colors">
                    ¡Genial!
                </button>
            </div>
        </div>
    );
};


// --- View Components ---

interface DayViewProps {
    workout: DailyWorkout;
    diet: DailyDiet;
    completedExercises: Set<string>;
    onToggleExercise: (exerciseName: string) => void;
    onCompleteDay: () => void;
    isPreview?: boolean;
    previewTitle?: string;
}

const DayView: React.FC<DayViewProps> = ({ workout, diet, completedExercises, onToggleExercise, onCompleteDay, isPreview, previewTitle }) => {
    const [activeTab, setActiveTab] = useState<'entrenamiento' | 'dieta'>('entrenamiento');
    const isRestDay = workout.exercises.length === 0;

    return (
        <div className="space-y-6">
             <div className="flex justify-center">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-1 flex items-center space-x-1">
                    <button
                        onClick={() => setActiveTab('entrenamiento')}
                        className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'entrenamiento' ? 'bg-primary-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                    >
                        Entrenamiento
                    </button>
                    <button
                        onClick={() => setActiveTab('dieta')}
                        className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'dieta' ? 'bg-primary-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                    >
                        Dieta
                    </button>
                </div>
            </div>

            {activeTab === 'entrenamiento' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">{previewTitle || `Entrenamiento de Hoy: ${workout.focus}`}</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                        {isRestDay ? (
                            <div className="text-center py-8">
                                <p className="text-2xl mb-4">😴</p>
                                <h3 className="text-xl font-bold">Día de Descanso</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">¡Tu cuerpo necesita recuperarse para volverse más fuerte!</p>
                                {!isPreview && (
                                    <button
                                        onClick={onCompleteDay}
                                        className="bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Marcar Día Como Completado
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 my-4">
                                    {workout.exercises.map((exercise, index) => <ExerciseCard 
                                        key={index} 
                                        exercise={exercise}
                                        isCompleted={completedExercises.has(exercise.name)}
                                        onToggleCompletion={!isPreview ? () => onToggleExercise(exercise.name) : undefined}
                                    />)}
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <strong>Enfriamiento:</strong> {workout.cooldown}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'dieta' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">{previewTitle ? `Dieta de Mañana` : 'Dieta de Hoy'}</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-baseline mb-4">
                            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{diet.day}</h3>
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{diet.totalCalories} kcal</p>
                        </div>
                        <div className="space-y-4">
                            {diet.meals.map((meal) => (
                                <div key={meal.name} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                          {getMealIcon(meal.name)}
                                          <span>{meal.name}</span>
                                        </h4>
                                        <span className="text-xs font-mono bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{meal.calories} kcal</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{meal.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface WeekViewProps {
    plan: WorkoutPlan;
    completedExercisesByDay: Record<string, Set<string>>;
}

const WeekView: React.FC<WeekViewProps> = ({ plan, completedExercisesByDay }) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'diet'>('workout');

  return (
    <div className="space-y-6">
       <div className="flex justify-center">
          <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-1 flex items-center space-x-1">
              <button
                  onClick={() => setActiveTab('workout')}
                  className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'workout' ? 'bg-primary-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                  Entrenamiento
              </button>
              <button
                  onClick={() => setActiveTab('diet')}
                  className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'diet' ? 'bg-primary-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
              >
                  Dieta
              </button>
          </div>
      </div>
      <div>
        {activeTab === 'workout' ? <WorkoutSchedule schedule={plan.workoutSchedule} completedExercisesByDay={completedExercisesByDay} /> : <DietPlan plan={plan.dietPlan} />}
      </div>
    </div>
  );
};

const BananinView: React.FC<{ userProfile: UserProfile, setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>> }> = ({ userProfile, setUserProfile }) => {
    
    const themes = [
        { id: 'default', name: 'BanaFit Original', price: 0, previewClass: 'bg-amber-400' },
        { id: 'verde', name: 'Verde Vitalidad', price: 100, previewClass: 'bg-green-500' },
        { id: 'rosa', name: 'Rosa Poder', price: 100, previewClass: 'bg-pink-500' },
        { id: 'azul', name: 'Azul Océano', price: 150, previewClass: 'bg-sky-500' },
        { id: 'naranja', name: 'Naranja Atardecer', price: 150, previewClass: 'bg-orange-500' },
        { id: 'purpura', name: 'Púrpura Galaxia', price: 150, previewClass: 'bg-violet-500' },
        { id: 'oro', name: 'Fiebre del Oro', price: 1500, previewClass: 'bg-yellow-400' },
        { id: 'diamante', name: 'Polvo de Diamante', price: 2500, previewClass: 'bg-cyan-300' },
        { id: 'obsidiana', name: 'Noche Obsidiana', price: 2500, previewClass: 'bg-slate-800' },
    ];
    
    const frames = [
        { id: 'silver', name: 'Borde Plateado', price: 150, previewStyle: { border: '4px solid silver' } },
        { id: 'gold', name: 'Marco Dorado', price: 250, previewStyle: { border: '4px solid gold' } },
        { id: 'bookworm', name: 'Ratón de Biblioteca', price: 200, emoji: '🤓' },
        { id: 'squats', name: 'Poder de Pesas', price: 350, emoji: '🏋️' },
        { id: 'veggie', name: 'Marco Saludable', price: 350, emoji: '🥦' },
        { id: 'fire', name: 'Racha de Fuego', price: 1200, emoji: '🔥' },
        { id: 'diamond_glow', name: 'Brillo Diamante', price: 2000, emoji: '✨' },
    ];

    const handlePurchase = (itemType: 'theme' | 'frame', itemId: string, price: number) => {
        if (userProfile.diamonds < price) {
            alert("¡No tienes suficientes diamantes!");
            return;
        }

        setUserProfile(prev => {
            if (!prev) return null;
            const key = itemType === 'theme' ? 'purchasedThemes' : 'purchasedFrames';
            return {
                ...prev,
                diamonds: prev.diamonds - price,
                [key]: [...(prev[key] || []), itemId],
            };
        });
    };

    const handleActivate = (itemType: 'theme' | 'frame', itemId: string) => {
        setUserProfile(prev => {
            if (!prev) return null;
            const key = itemType === 'theme' ? 'activeTheme' : 'activeFrame';
            return { ...prev, [key]: itemId };
        });
    };

    return (
    <div className="max-w-2xl mx-auto p-4">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-3xl font-bold mb-2">¡Tu Amigo Bananín!</h2>
            <div className="text-8xl my-6 animate-pulse-slow">🍌</div>
            <p className="text-slate-500 dark:text-slate-400">¡Completa tus entrenamientos para ganar diamantes y mantener tu racha!</p>
        </div>
        
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <StoreIcon className="w-8 h-8 text-primary-500" />
                Tienda de Bananín
            </h3>

            {/* App Themes Section */}
            <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3">Paletas de Colores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {themes.map(theme => {
                        const isOwned = userProfile.purchasedThemes?.includes(theme.id);
                        const isActive = userProfile.activeTheme === theme.id;
                        return (
                            <div key={theme.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${theme.previewClass} border-2 border-slate-300 dark:border-slate-600`}></div>
                                    <div>
                                        <p className="font-bold">{theme.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{theme.price > 0 ? `${theme.price} 💎` : 'Gratis'}</p>
                                    </div>
                                </div>
                                {isActive ? (
                                    <span className="font-bold text-sm text-primary-500">Activado</span>
                                ) : isOwned ? (
                                    <button onClick={() => handleActivate('theme', theme.id)} className="px-3 py-1 text-sm font-semibold bg-primary-500 text-white rounded-full hover:bg-primary-600">Activar</button>
                                ) : (
                                    <button onClick={() => handlePurchase('theme', theme.id, theme.price)} className="px-3 py-1 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500">Comprar</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Profile Frames Section */}
            <div>
                <h4 className="text-lg font-semibold mb-3">Marcos de Perfil</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {frames.map(frame => {
                        const isOwned = userProfile.purchasedFrames?.includes(frame.id);
                        const isActive = userProfile.activeFrame === frame.id;
                        return (
                             <div key={frame.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xl" style={frame.previewStyle}>
                                        {frame.emoji || ''}
                                    </div>
                                    <div>
                                        <p className="font-bold">{frame.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{frame.price} 💎</p>
                                    </div>
                                </div>
                                {isActive ? (
                                    <span className="font-bold text-sm text-primary-500">Equipado</span>
                                ) : isOwned ? (
                                    <button onClick={() => handleActivate('frame', frame.id)} className="px-3 py-1 text-sm font-semibold bg-primary-500 text-white rounded-full hover:bg-primary-600">Equipar</button>
                                ) : (
                                    <button onClick={() => handlePurchase('frame', frame.id, frame.price)} className="px-3 py-1 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500">Comprar</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    </div>
    );
}

type ActiveView = 'day' | 'week' | 'bananin';

const ProfileNavButton: React.FC<{
    icon: React.ElementType,
    label: string,
    view: ActiveView,
    currentView: ActiveView,
    setView: (view: ActiveView) => void,
    closeSidebar: () => void,
}> = ({ icon: Icon, label, view, currentView, setView, closeSidebar }) => (
    <button
        onClick={() => { setView(view); closeSidebar(); }}
        className={`flex items-center gap-4 w-full p-3 rounded-lg text-lg font-semibold transition-colors ${currentView === view ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
    >
        <Icon className="w-6 h-6" />
        {label}
    </button>
);


const ProfileView: React.FC<{ 
    userProfile: UserProfile, 
    onLogout: () => void, 
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>,
    activeView: ActiveView,
    setActiveView: (view: ActiveView) => void,
    closeSidebar: () => void,
}> = ({ userProfile, onLogout, setUserProfile, activeView, setActiveView, closeSidebar }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState<UserProfile>(userProfile);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        setEditableProfile(userProfile);
    }, [userProfile]);
    
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handlePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const url = event.target?.result as string;
                setUserProfile(prev => prev ? ({ ...prev, profilePictureUrl: url }) : null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableProfile(prev => {
            let finalValue: any = value;
             if (name === 'availableEquipment') {
                finalValue = value.split(',').map(s => s.trim());
            } else if (e.target.type === 'number' && value !== '') {
                finalValue = Number(value);
            }
            return {
                ...prev,
                [name]: finalValue,
            };
        });
    };

    const handleSave = () => {
        setUserProfile(editableProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditableProfile(userProfile);
        setIsEditing(false);
    };
    
    const goalOptions = ['Perder peso', 'Ganar músculo', 'Mantenerme activo', 'Mejorar resistencia'];
    const fitnessLevelOptions = ['Principiante', 'Intermedio', 'Avanzado'];
    const exerciseHabitsOptions = ['Nunca', '1-2 veces por semana', '3-5 veces por semana', 'Casi todos los días'];

    const renderDetailField = (label: string, value: string | number | string[], unit?: string) => (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{Array.isArray(value) ? value.join(', ') : value} {unit || ''}</p>
        </div>
    );
    
    const renderInputField = (label: string, name: keyof UserProfile, type: 'text' | 'number', unit?: string) => (
         <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg col-span-2 md:col-span-3">
            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">{label}</label>
            <div className="flex items-baseline">
                <input
                    type={type}
                    name={name}
                    value={Array.isArray(editableProfile[name]) ? (editableProfile[name] as string[]).join(', ') : editableProfile[name] as string | number}
                    onChange={handleProfileChange}
                    className="w-full bg-transparent text-lg font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
                />
                {unit && <span className="text-slate-500 dark:text-slate-400 font-semibold">{unit}</span>}
            </div>
        </div>
    );
    
    const renderSelectField = (label: string, name: keyof UserProfile, options: string[]) => (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg col-span-2 md:col-span-3">
             <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">{label}</label>
             <select
                name={name}
                value={editableProfile[name] as string}
                onChange={handleProfileChange}
                className="w-full bg-transparent text-lg font-semibold text-slate-800 dark:text-slate-100 focus:outline-none border-none focus:ring-0"
             >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
    
    const renderFrame = (frameId?: string) => {
        const baseStyle = { position: 'absolute', pointerEvents: 'none' } as React.CSSProperties;
        
        switch (frameId) {
            case 'gold':
                return <div style={{...baseStyle, top: '-8px', left: '-8px', width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', borderRadius: '50%', border: '6px solid gold' }}></div>;
            case 'silver':
                return <div style={{...baseStyle, top: '-8px', left: '-8px', width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', borderRadius: '50%', border: '6px solid silver' }}></div>;
            case 'squats':
            case 'veggie':
            case 'bookworm':
            case 'fire':
            case 'diamond_glow':
                 const emojiMap = { squats: '🏋️', veggie: '🥦', bookworm: '🤓', fire: '🔥', diamond_glow: '✨' };
                 return <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 rounded-full p-1 shadow-md text-sm" style={{ transform: 'translate(25%, 25%)' }}>{emojiMap[frameId as keyof typeof emojiMap]}</div>
            default:
                return null;
        }
    }

    return (
        <div className="relative p-4">
            <button 
                onClick={closeSidebar} 
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                aria-label="Cerrar perfil"
            >
                <XIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center mt-8">
                <div className="relative mb-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <button 
                        onClick={handlePictureClick} 
                        className="group relative w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-md transition-transform transform hover:scale-105"
                        aria-label="Cambiar foto de perfil"
                    >
                        {userProfile.profilePictureUrl ? (
                            <img src={userProfile.profilePictureUrl} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <CameraIcon className="w-8 h-8"/>
                        </div>
                    </button>
                    {renderFrame(userProfile.activeFrame)}
                </div>

                {isEditing ? (
                    <input name="name" value={editableProfile.name} onChange={handleProfileChange} className="text-3xl font-bold text-slate-800 dark:text-white bg-transparent text-center focus:outline-none" />
                ) : (
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{userProfile.name}</h2>
                )}

                {isEditing ? (
                    <select name="goal" value={editableProfile.goal} onChange={handleProfileChange} className="text-slate-500 dark:text-slate-400 bg-transparent text-center border-none focus:ring-0 focus:outline-none mb-8">
                         {goalOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{userProfile.goal}</p>
                )}


                <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                    {isEditing ? renderInputField('Edad', 'age', 'number') : renderDetailField('Edad', userProfile.age)}
                    {isEditing ? renderInputField('Peso', 'weight', 'number', 'kg') : renderDetailField('Peso', userProfile.weight, 'kg')}
                    {isEditing ? renderInputField('Altura', 'height', 'number', 'cm') : renderDetailField('Altura', userProfile.height, 'cm')}
                    {isEditing ? renderSelectField('Nivel Físico', 'fitnessLevel', fitnessLevelOptions) : renderDetailField('Nivel Físico', userProfile.fitnessLevel)}
                    {isEditing ? renderSelectField('Hábitos', 'exerciseHabits', exerciseHabitsOptions) : renderDetailField('Hábitos', userProfile.exerciseHabits)}
                    {isEditing ? renderInputField('Equipamiento', 'availableEquipment', 'text') : renderDetailField('Equipamiento', userProfile.availableEquipment)}
                </div>

                <div className="mt-8 w-full flex items-center gap-4">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancel} className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors">Guardar Cambios</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors">Editar Perfil</button>
                    )}
                </div>
            </div>
            
             <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-3">Navegación</h3>
                <div className="space-y-2">
                    <ProfileNavButton icon={CalendarIcon} label="Día" view="day" currentView={activeView} setView={setActiveView} closeSidebar={closeSidebar} />
                    <ProfileNavButton icon={CalendarWeekIcon} label="Semana" view="week" currentView={activeView} setView={setActiveView} closeSidebar={closeSidebar} />
                    <ProfileNavButton icon={SparklesIcon} label="Bananín" view="bananin" currentView={activeView} setView={setActiveView} closeSidebar={closeSidebar} />
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-bold text-lg mb-2">Modo de Apariencia</h3>
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Modo Oscuro</span>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isDarkMode ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <button onClick={onLogout} className="mt-8 w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              Cerrar sesión
            </button>
        </div>
    );
};


// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ userProfile, plan, onLogout, onStartOnboarding, setUserProfile, setWorkoutPlan }) => {
  const [activeView, setActiveView] = useState<ActiveView>('day');
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [modificationRequest, setModificationRequest] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedExercisesByDay, setCompletedExercisesByDay] = useState<Record<string, Set<string>>>({});
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isDiamondModalOpen, setIsDiamondModalOpen] = useState(false);
  const [lastStreakReward, setLastStreakReward] = useState<{ day: number, diamonds: number } | null>(null);
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const streakIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if toast has been shown this session and if the plan is loaded
    if (sessionStorage.getItem('welcomeToastShown') || !plan) {
        return;
    }
    
    // Determine today's day and workout focus
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const todaysWorkout = plan.workoutSchedule.find(d => d.day.toLowerCase() === today.toLowerCase());
    
    if (todaysWorkout) {
        const focus = todaysWorkout.focus;
        let message;
        if (focus.toLowerCase().includes('descanso')) {
            message = `¡Hoy es día de descanso! Aprovecha para recargar energías. 💪`;
        } else {
            message = `¡Hoy toca ${focus}! ¿Listo para darlo todo?`;
        }
        
        // Setting the message and showing the toast
        setWelcomeMessage(message);
        setShowWelcomeToast(true);
        // Mark as shown for this session
        sessionStorage.setItem('welcomeToastShown', 'true');
    }
  }, [plan, userProfile.name]);

  const toggleProfileSidebar = () => setIsProfileSidebarOpen(prev => !prev);
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const getTodayDayString = useCallback(() => {
    if (!plan) return '';
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const matchingDay = plan.workoutSchedule.find(d => d.day.toLowerCase() === today.toLowerCase());
    return matchingDay ? matchingDay.day : plan.workoutSchedule[0].day;
  }, [plan]);

  const handleCompleteDay = useCallback(() => {
    const todayStr = getTodayDateString();
    if (userProfile.completedDays.includes(todayStr)) return;

    setShowStreakAnimation(true);

    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        
        const sortedDays = [...prevProfile.completedDays].sort();
        let newStreak = 1;
        if (sortedDays.length > 0) {
            const lastCompletion = new Date(sortedDays[sortedDays.length - 1]);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastCompletion.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                newStreak = prevProfile.streak + 1;
            }
        }

        let newDiamonds = prevProfile.diamonds + 15;
        // Check for chest reward
        if (newStreak > 0 && newStreak % 5 === 0) {
            const reward = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
            newDiamonds += reward;
            setLastStreakReward({ day: newStreak, diamonds: reward });
        } else {
            setLastStreakReward(null);
        }
        
        return {
            ...prevProfile,
            diamonds: newDiamonds,
            streak: newStreak,
            completedDays: [...prevProfile.completedDays, todayStr]
        };
    });
  }, [userProfile, setUserProfile]);

  const handleToggleExercise = useCallback((day: string, exerciseName: string) => {
    setCompletedExercisesByDay(prev => {
        const newDaySet = new Set(prev[day] || []);
        if (newDaySet.has(exerciseName)) {
            newDaySet.delete(exerciseName);
        } else {
            newDaySet.add(exerciseName);
        }
        
        const workoutForDay = plan?.workoutSchedule.find(d => d.day === day);
        if (workoutForDay && workoutForDay.exercises.length > 0 && newDaySet.size === workoutForDay.exercises.length) {
            handleCompleteDay();
        }
        
        return { ...prev, [day]: newDaySet };
    });
  }, [plan, handleCompleteDay]);

  const handleModifyPlan = async () => {
    if (!modificationRequest.trim() || !plan) return;

    setIsGenerating(true);
    setError(null);
    try {
      const newPlan = await modifyWorkoutPlan(userProfile, plan, modificationRequest);
      setWorkoutPlan(newPlan);
      setCompletedExercisesByDay({}); // Reset progress on new plan
      setIsModifying(false);
      setModificationRequest('');
    } catch (err) {
      setError("¡Uy! Bananín tuvo un problema al ajustar tu plan. Inténtalo de nuevo con otras palabras.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <div className="text-8xl animate-bounce">🍌</div>
            <h1 className="text-3xl font-bold mt-6 text-slate-800 dark:text-white">¡Hola, {userProfile.name}!</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
                ¡Estás a un paso de comenzar tu aventura fitness! Deja que Bananín, tu entrenador personal de IA, cree un plan único solo para ti.
            </p>
            <button 
                onClick={onStartOnboarding} 
                className="mt-8 w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
                <SparklesIcon className="w-6 h-6" />
                Crear Mi Plan Personalizado
            </button>
            <button onClick={onLogout} className="mt-4 text-sm text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                Cerrar sesión
            </button>
        </div>
      </div>
    );
  }
  
  const renderContent = () => {
    const todayDayStr = getTodayDayString();
    if (!todayDayStr) return <div>Cargando...</div>; // Handle case where plan is not fully loaded

    const isTodayCompleted = userProfile.completedDays.includes(getTodayDateString());

    let workout: DailyWorkout, diet: DailyDiet, isPreview = false, previewTitle = '';
    const todayIndex = plan.workoutSchedule.findIndex(d => d.day === todayDayStr);

    if (isTodayCompleted) {
        const nextDayIndex = (todayIndex + 1) % plan.workoutSchedule.length;
        workout = plan.workoutSchedule[nextDayIndex];
        diet = plan.dietPlan[nextDayIndex];
        isPreview = true;
        previewTitle = `Avance de Mañana: ${workout.focus}`;
    } else {
        workout = plan.workoutSchedule[todayIndex];
        diet = plan.dietPlan[todayIndex];
    }

    switch (activeView) {
      case 'day':
        return <DayView 
                    workout={workout} 
                    diet={diet}
                    completedExercises={completedExercisesByDay[workout.day] || new Set()}
                    onToggleExercise={(exerciseName) => handleToggleExercise(workout.day, exerciseName)}
                    onCompleteDay={handleCompleteDay}
                    isPreview={isPreview}
                    previewTitle={previewTitle}
                />;
      case 'week':
        return <WeekView plan={plan} completedExercisesByDay={completedExercisesByDay} />;
      case 'bananin':
        return <BananinView userProfile={userProfile} setUserProfile={setUserProfile} />;
      default:
        return <DayView 
                    workout={workout} 
                    diet={diet}
                    completedExercises={completedExercisesByDay[workout.day] || new Set()}
                    onToggleExercise={(exerciseName) => handleToggleExercise(workout.day, exerciseName)}
                    onCompleteDay={handleCompleteDay}
                    isPreview={isPreview}
                    previewTitle={previewTitle}
                />;
    }
  };

  const navItems = [
    { id: 'day', label: 'Día', icon: CalendarIcon },
    { id: 'week', label: 'Semana', icon: CalendarWeekIcon },
    { id: 'bananin', label: 'Bananín', icon: SparklesIcon },
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <WelcomeToast
        isOpen={showWelcomeToast}
        onClose={() => setShowWelcomeToast(false)}
        userName={userProfile.name}
        message={welcomeMessage}
      />
      <Header userProfile={userProfile} onProfileClick={toggleProfileSidebar} onStreakClick={() => setIsStreakModalOpen(true)} onDiamondClick={() => setIsDiamondModalOpen(true)} streakIconRef={streakIconRef} />
      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-8 w-full pb-24">
        <div key={activeView} className="animate-in fade-in-0 duration-500">
            {(activeView === 'day' || activeView === 'week') && (
            <div className="flex justify-center mb-6">
                <button
                onClick={() => setIsModifying(true)}
                className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors animate-pulse-strong"
                >
                <SparklesIcon className="w-5 h-5 text-primary-500" />
                Modificar Plan con IA
                </button>
            </div>
            )}
            {renderContent()}
        </div>
      </main>
      
      <StreakCompletionAnimation
        isOpen={showStreakAnimation}
        onClose={() => setShowStreakAnimation(false)}
        streak={userProfile.streak}
      />

      <StreakModal 
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        userProfile={userProfile}
        lastReward={lastStreakReward}
        clearLastReward={() => setLastStreakReward(null)}
      />
      
      <DiamondModal
        isOpen={isDiamondModalOpen}
        onClose={() => setIsDiamondModalOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
      />

      {isModifying && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 transform transition-all animate-in fade-in-0 zoom-in-95">
            <h2 className="text-2xl font-bold mb-2">Ajusta tu Plan</h2>
            
            {isGenerating ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-bounce">🍌</div>
                <h3 className="text-xl font-bold">Ajustando tu plan...</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Bananín está trabajando en tus cambios.</p>
                <div className="progress-bar-indeterminate w-full mt-4"></div>
              </div>
            ) : (
              <>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Dile a Bananín qué te gustaría cambiar. Por ejemplo: "Quiero comidas más baratas" o "No me gusta correr".</p>
                <textarea
                  value={modificationRequest}
                  onChange={(e) => setModificationRequest(e.target.value)}
                  placeholder="Escribe tus cambios aquí..."
                  className="w-full h-32 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isGenerating}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => { setIsModifying(false); setError(null); }} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors" disabled={isGenerating}>
                    Cancelar
                  </button>
                  <button onClick={handleModifyPlan} className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-400" disabled={!modificationRequest.trim() || isGenerating}>
                    Generar Nuevo Plan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

        {/* Backdrop */}
        <div
            className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ${isProfileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleProfileSidebar}
        ></div>
        {/* Sidebar */}
        <aside
            className={`fixed top-0 right-0 h-full w-[85%] sm:w-[400px] bg-slate-100 dark:bg-slate-900 z-40 shadow-2xl transition-transform duration-300 ease-in-out transform ${isProfileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="h-full overflow-y-auto">
                <ProfileView userProfile={userProfile} onLogout={onLogout} setUserProfile={setUserProfile} activeView={activeView} setActiveView={setActiveView} closeSidebar={toggleProfileSidebar} />
            </div>
        </aside>


      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-t-lg">
        <nav className="flex justify-around max-w-7xl mx-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ActiveView)}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-center transition-colors duration-200 ${
                activeView === item.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-300'
              }`}
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
};


// --- Re-usable Cards ---
interface WorkoutScheduleProps {
    schedule: DailyWorkout[];
    completedExercisesByDay: Record<string, Set<string>>;
}

const WorkoutSchedule: React.FC<WorkoutScheduleProps> = ({ schedule, completedExercisesByDay }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedule.map((dayPlan) => {
            const isRestDay = dayPlan.exercises.length === 0;
            const completedCount = completedExercisesByDay[dayPlan.day]?.size || 0;
            const totalExercises = dayPlan.exercises.length;
            const progress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;
            const isDayCompleted = totalExercises > 0 && completedCount === totalExercises;

            return (
                <div key={dayPlan.day} className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border flex flex-col transition-all ${isDayCompleted ? 'border-green-400 dark:border-green-600' : 'border-slate-200 dark:border-slate-700'}`}>
                    {isDayCompleted && (
                        <div className="absolute top-3 right-3 text-green-500" title="Día completado">
                            <CheckCircleIcon className="w-7 h-7" />
                        </div>
                    )}
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{dayPlan.day}</h3>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-4">{dayPlan.focus}</p>

                    <div className="flex-grow">
                        {isRestDay ? (
                            <p className="text-slate-500 dark:text-slate-400">¡Día de descanso! Aprovecha para recuperarte.</p>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Calentamiento: {dayPlan.warmup}</p>
                                <div className="space-y-4 my-4">
                                    {dayPlan.exercises.map((exercise, index) => <ExerciseCard key={index} exercise={exercise} />)}
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enfriamiento: {dayPlan.cooldown}</p>
                            </>
                        )}
                    </div>
                    
                    {!isRestDay && (
                         <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">Progreso</span>
                                <span className="font-mono text-slate-500 dark:text-slate-400">{completedCount}/{totalExercises}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted?: boolean;
  onToggleCompletion?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isCompleted, onToggleCompletion }) => {
    const isInteractive = onToggleCompletion !== undefined;
    const [isAnimating, setIsAnimating] = useState(false);
    const prevIsCompleted = useRef(isCompleted);

    useEffect(() => {
        // Trigger animation only when changing from not completed to completed
        if (isCompleted && !prevIsCompleted.current) {
            setIsAnimating(true);
            const animationTimer = setTimeout(() => {
                setIsAnimating(false);
            }, 700); // Must match animation duration
            
            return () => {
                clearTimeout(animationTimer);
            };
        }
        prevIsCompleted.current = isCompleted;
    }, [isCompleted]);
    
    const handleToggle = () => {
        if (isInteractive) {
            onToggleCompletion();
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleToggle();
        }
    };

    return (
        <div 
            onClick={isInteractive ? handleToggle : undefined}
            className={`relative flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-all ${isInteractive ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''} ${isAnimating ? 'animate-exercise-complete' : ''}`}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : -1}
            aria-pressed={isInteractive ? isCompleted : undefined}
            onKeyDown={handleKeyDown}
        >
            <div className={`flex items-start gap-4 w-full transition-opacity duration-300 ${isCompleted ? 'opacity-40' : 'opacity-100'}`}>
                {isInteractive && (
                    <div className="flex-shrink-0 pt-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-primary-500 border-primary-500' : 'border-slate-400 dark:border-slate-500'}`}>
                            {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                )}
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h4 className={`font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 ${isCompleted ? 'line-through' : ''}`}>
                            <DumbbellIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            <span>{exercise.name}</span>
                        </h4>
                    </div>
                    <p className={`text-sm text-slate-600 dark:text-slate-300 mt-1 ${isCompleted ? 'line-through' : ''}`}>{exercise.description}</p>
                    <div className="flex justify-between items-center mt-2 text-sm font-mono text-slate-500 dark:text-slate-400">
                        <span>{exercise.sets} series</span>
                        <span>{exercise.reps} reps</span>
                        <span>{exercise.rest} descanso</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


const DietPlan: React.FC<{ plan: DailyDiet[] }> = ({ plan }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.map((dayPlan) => (
            <div key={dayPlan.day} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{dayPlan.day}</h3>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{dayPlan.totalCalories} kcal</p>
                </div>
                <div className="space-y-4 mt-4">
                    {dayPlan.meals.map((meal) => (
                        <div key={meal.name} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                    {getMealIcon(meal.name)}
                                    <span>{meal.name}</span>
                                </h4>
                                <span className="text-xs font-mono bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{meal.calories} kcal</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{meal.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);


export default Dashboard;