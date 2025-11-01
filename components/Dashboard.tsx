import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, WorkoutPlan, DailyWorkout, DailyDiet, Exercise } from '../types';
import { modifyWorkoutPlan } from '../services/geminiService';
import Header from './Header';

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

// --- Completion Animation ---
const CompletionAnimation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm p-8 border border-slate-200 dark:border-slate-700 text-center transform transition-all animate-in fade-in-0 zoom-in-95">
                <div className="text-7xl animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold mt-4">¡Día Completado!</h2>
                <p className="text-slate-600 dark:text-slate-300 mt-2">¡Increíble trabajo! Sigue así.</p>
                <div className="mt-6 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold py-3 px-5 rounded-full inline-flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6" />
                    <span>+15 Diamantes 💎</span>
                </div>
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
    isPreview?: boolean;
    previewTitle?: string;
}

const DayView: React.FC<DayViewProps> = ({ workout, diet, completedExercises, onToggleExercise, isPreview, previewTitle }) => {
    const [activeTab, setActiveTab] = useState<'entrenamiento' | 'dieta'>('entrenamiento');

    return (
        <div className={`space-y-6 ${isPreview ? 'opacity-70 pointer-events-none' : ''}`}>
             <div className="flex justify-center">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full p-1 flex items-center space-x-1">
                    <button
                        onClick={() => setActiveTab('entrenamiento')}
                        className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'entrenamiento' ? 'bg-primary-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                        disabled={isPreview}
                    >
                        Entrenamiento
                    </button>
                    <button
                        onClick={() => setActiveTab('dieta')}
                        className={`px-6 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'dieta' ? 'bg-primary-500 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                        disabled={isPreview}
                    >
                        Dieta
                    </button>
                </div>
            </div>

            {activeTab === 'entrenamiento' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-center sm:text-left">{previewTitle || `Entrenamiento de Hoy: ${workout.focus}`}</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
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
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{meal.name}</h4>
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
        { id: 'default', name: 'Original BanaFit', price: 0, previewClass: 'bg-amber-400' },
        { id: 'verde', name: 'Verde Vitalidad', price: 100, previewClass: 'bg-green-500' },
        { id: 'rosa', name: 'Rosa Poder', price: 100, previewClass: 'bg-pink-500' },
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
            <div className="text-8xl my-6 animate-bounce">🍌</div>
            <p className="text-slate-500 dark:text-slate-400">¡Completa tus entrenamientos para ganar diamantes y mantener tu racha!</p>
        </div>
        
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <StoreIcon className="w-8 h-8 text-primary-500" />
                Tienda de Bananín
            </h3>

            {/* App Themes Section */}
            <div className="mb-8">
                <h4 className="text-lg font-semibold mb-3">Temas de la App</h4>
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
        setEditableProfile(prev => ({
            ...prev,
            [name]: (e.target.type === 'number' && value !== '') ? Number(value) : value,
        }));
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
    const availableEquipmentOptions = ['Solo mi cuerpo', 'Mancuernas y bandas', 'Un gimnasio completo'];

    const renderDetailField = (label: string, value: string | number, unit?: string) => (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{value} {unit || ''}</p>
        </div>
    );
    
    const renderInputField = (label: string, name: keyof UserProfile, type: 'text' | 'number', unit?: string) => (
         <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">{label}</label>
            <div className="flex items-baseline">
                <input
                    type={type}
                    name={name}
                    value={editableProfile[name] as string | number}
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
                        aria-label="Change profile picture"
                    >
                        {userProfile.profilePictureUrl ? (
                            <img src={userProfile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
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
                    {isEditing ? renderSelectField('Equipamiento', 'availableEquipment', availableEquipmentOptions) : renderDetailField('Equipamiento', userProfile.availableEquipment)}
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
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  const toggleProfileSidebar = () => setIsProfileSidebarOpen(prev => !prev);
  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  
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
            const todayStr = getTodayDateString();
            if (!userProfile.completedDays.includes(todayStr)) {
                setShowCompletionAnimation(true);
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
                    
                    return {
                        ...prevProfile,
                        diamonds: prevProfile.diamonds + 15,
                        streak: newStreak,
                        completedDays: [...prevProfile.completedDays, todayStr]
                    };
                });
            }
        }
        
        return { ...prev, [day]: newDaySet };
    });
  }, [plan, userProfile, setUserProfile]);

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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-3xl font-bold">¡Bienvenido, {userProfile.name}!</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Parece que aún no tienes un plan de entrenamiento.</p>
        <p className="mt-2 text-slate-500 dark:text-slate-400">¡Hablemos con Bananín para crear uno perfecto para ti!</p>
        <button onClick={onStartOnboarding} className="mt-8 bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300">
          Crear mi Plan
        </button>
        <button onClick={onLogout} className="mt-4 text-sm text-slate-500 hover:text-primary-600">
          Cerrar sesión
        </button>
      </div>
    );
  }

  const getTodayDayString = () => {
    const today = new Date().toLocaleString('en-US', { weekday: 'long' });
    const matchingDay = plan.workoutSchedule.find(d => d.day.toLowerCase() === today.toLowerCase());
    return matchingDay ? matchingDay.day : plan.workoutSchedule[0].day;
  };

  const renderContent = () => {
    const todayDayStr = getTodayDayString();
    const isTodayCompleted = userProfile.completedDays.includes(getTodayDateString()) && !showCompletionAnimation;

    let workout: DailyWorkout, diet: DailyDiet, isPreview = false, previewTitle = '';

    if (isTodayCompleted) {
        const todayIndex = plan.workoutSchedule.findIndex(d => d.day === todayDayStr);
        const nextDayIndex = (todayIndex + 1) % plan.workoutSchedule.length;
        workout = plan.workoutSchedule[nextDayIndex];
        diet = plan.dietPlan[nextDayIndex];
        isPreview = true;
        previewTitle = `Avance de Mañana: ${workout.focus}`;
    } else {
        workout = plan.workoutSchedule.find(d => d.day === todayDayStr)!;
        diet = plan.dietPlan.find(d => d.day === todayDayStr)!;
    }

    switch (activeView) {
      case 'day':
        return <DayView 
                    workout={workout} 
                    diet={diet}
                    completedExercises={completedExercisesByDay[workout.day] || new Set()}
                    onToggleExercise={(exerciseName) => handleToggleExercise(workout.day, exerciseName)}
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
      <Header userProfile={userProfile} onProfileClick={toggleProfileSidebar} />
      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-8 w-full pb-24">
        <div key={activeView} className="animate-in fade-in-0 duration-500">
            {(activeView === 'day' || activeView === 'week') && (
            <div className="flex justify-center mb-6">
                <button
                onClick={() => setIsModifying(true)}
                className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                <SparklesIcon className="w-5 h-5 text-primary-500" />
                Modificar Plan con IA
                </button>
            </div>
            )}
            {renderContent()}
        </div>
      </main>
      
      {showCompletionAnimation && <CompletionAnimation onClose={() => setShowCompletionAnimation(false)} />}
      
      {isModifying && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 transform transition-all animate-in fade-in-0 zoom-in-95">
            <h2 className="text-2xl font-bold mb-2">Ajusta tu Plan</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Dile a Bananín qué te gustaría cambiar. Por ejemplo: "Quiero comidas más baratas" o "No me gusta correr".</p>
            
            {isGenerating ? (
              <div className="text-center py-8">
                <p className="font-semibold mb-2">Bananín está pensando...</p>
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : (
              <>
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
            const isRestDay = dayPlan.focus.toLowerCase() === 'rest' || dayPlan.focus.toLowerCase() === 'descanso';
            const completedCount = completedExercisesByDay[dayPlan.day]?.size || 0;
            const totalExercises = dayPlan.exercises.length;
            const progress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

            return (
                <div key={dayPlan.day} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
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
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onToggleCompletion();
        }
    };

    return (
        <div 
            onClick={isInteractive ? onToggleCompletion : undefined}
            className={`flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-all ${isInteractive ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : ''} ${isCompleted ? 'opacity-60 dark:opacity-50' : ''}`}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : -1}
            aria-pressed={isInteractive ? isCompleted : undefined}
            onKeyDown={handleKeyDown}
        >
            {isInteractive && (
                <div className="flex-shrink-0 pt-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-primary-500 border-primary-500' : 'border-slate-400 dark:border-slate-500'}`}>
                        {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                </div>
            )}
            <div className="flex-grow">
                <h4 className={`font-bold text-slate-800 dark:text-slate-100 ${isCompleted ? 'line-through' : ''}`}>{exercise.name}</h4>
                <p className={`text-sm text-slate-600 dark:text-slate-300 mt-1 ${isCompleted ? 'line-through' : ''}`}>{exercise.description}</p>
                <div className="flex justify-between items-center mt-2 text-sm font-mono text-slate-500 dark:text-slate-400">
                    <span>{exercise.sets} series</span>
                    <span>{exercise.reps} reps</span>
                    <span>{exercise.rest} descanso</span>
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
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{meal.name}</h4>
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