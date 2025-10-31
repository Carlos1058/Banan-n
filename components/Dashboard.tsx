import React, { useState } from 'react';
import { UserProfile, WorkoutPlan, DailyWorkout, DailyDiet, Exercise } from '../types';

interface DashboardProps {
  userProfile: UserProfile;
  plan: WorkoutPlan | null;
  onLogout: () => void;
  onStartOnboarding: () => void;
}

// --- SVG Icons for Navbar ---
const CalendarIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v-2" />
  </svg>
);

const CalendarWeekIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01M17 18h.01" />
    </svg>
);

const BananaIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624L16.5 21.75l-.398-1.126a3.375 3.375 0 00-2.456-2.456L12.75 18l1.126-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.126a3.375 3.375 0 002.456 2.456L20.25 18l-1.126.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);


const UserIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);


// --- View Components ---

const DayView: React.FC<{ workout: DailyWorkout; diet: DailyDiet }> = ({ workout, diet }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Entrenamiento de Hoy: {workout.focus}</h2>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Calentamiento: {workout.warmup}</p>
                    <div className="space-y-4 my-4">
                        {workout.exercises.map((exercise, index) => <ExerciseCard key={index} exercise={exercise} />)}
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enfriamiento: {workout.cooldown}</p>
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-4">Dieta de Hoy</h2>
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
             <div className="pt-4 text-center">
                <button className="bg-primary-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300">
                    Completar Día
                </button>
            </div>
        </div>
    );
};

const WeekView: React.FC<{ plan: WorkoutPlan }> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'diet'>('workout');

  return (
    <div>
      <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('workout')}
            className={`${
              activeTab === 'workout'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
          >
            Plan de Entrenamiento
          </button>
          <button
            onClick={() => setActiveTab('diet')}
            className={`${
              activeTab === 'diet'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
          >
            Plan de Dieta
          </button>
        </nav>
      </div>
      <div>
        {activeTab === 'workout' ? <WorkoutSchedule schedule={plan.workoutSchedule} /> : <DietPlan plan={plan.dietPlan} />}
      </div>
    </div>
  );
};

const BananinView: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => (
    <div className="text-center p-8">
        <h2 className="text-3xl font-bold mb-8">¡Tu Amigo Bananín!</h2>
        <div className="flex flex-col items-center">
             <div className="text-8xl mb-6 animate-bounce">🍌</div>
             <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-primary-100 dark:bg-primary-900/50 p-4 rounded-lg">
                    <div className="text-sm text-primary-800 dark:text-primary-200">Racha</div>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-300">{userProfile.streak} 🔥</div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
                    <div className="text-sm text-blue-800 dark:text-blue-200">Diamantes</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">{userProfile.diamonds} 💎</div>
                </div>
             </div>
             <div className="mt-8">
                <h3 className="font-bold text-xl mb-2">Accesorios</h3>
                <p className="text-slate-500 dark:text-slate-400">¡Próximamente tienda de accesorios!</p>
             </div>
        </div>
    </div>
);

const ProfileView: React.FC<{ userProfile: UserProfile, onLogout: () => void }> = ({ userProfile, onLogout }) => (
    <div className="p-4">
        <h2 className="text-3xl font-bold mb-6">Tu Perfil</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-3 border border-slate-200 dark:border-slate-700">
            <p><strong>Nombre:</strong> {userProfile.name}</p>
            <p><strong>Edad:</strong> {userProfile.age}</p>
            <p><strong>Peso:</strong> {userProfile.weight} kg</p>
            <p><strong>Altura:</strong> {userProfile.height} cm</p>
            <p><strong>Objetivo:</strong> {userProfile.goal}</p>
        </div>
        <button onClick={onLogout} className="mt-8 w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
          Cerrar sesión
        </button>
    </div>
);


// --- Main Dashboard Component ---

type ActiveView = 'day' | 'week' | 'bananin' | 'profile';

const Dashboard: React.FC<DashboardProps> = ({ userProfile, plan, onLogout, onStartOnboarding }) => {
  const [activeView, setActiveView] = useState<ActiveView>('day');

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

  const getTodayString = () => {
    return new Date().toLocaleString('es-ES', { weekday: 'long' });
  };
  
  const todayWorkout = plan.workoutSchedule.find(d => d.day.toLowerCase() === getTodayString().toLowerCase()) || plan.workoutSchedule[0];
  const todayDiet = plan.dietPlan.find(d => d.day.toLowerCase() === getTodayString().toLowerCase()) || plan.dietPlan[0];


  const renderContent = () => {
    switch (activeView) {
      case 'day':
        return <DayView workout={todayWorkout} diet={todayDiet} />;
      case 'week':
        return <WeekView plan={plan} />;
      case 'bananin':
        return <BananinView userProfile={userProfile} />;
      case 'profile':
        return <ProfileView userProfile={userProfile} onLogout={onLogout} />;
      default:
        return <DayView workout={todayWorkout} diet={todayDiet} />;
    }
  };

  const navItems = [
    { id: 'day', label: 'Día', icon: CalendarIcon },
    { id: 'week', label: 'Semana', icon: CalendarWeekIcon },
    { id: 'bananin', label: 'Bananín', icon: BananaIcon },
    { id: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 md:p-8">
         <h1 className="text-3xl font-bold text-slate-800 dark:text-white">¡Hola, {userProfile.name}!</h1>
         <p className="text-slate-600 dark:text-slate-300">Listo para un gran día?</p>
      </header>

      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-8 w-full pb-24">
        {renderContent()}
      </main>

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
const WorkoutSchedule: React.FC<{ schedule: DailyWorkout[] }> = ({ schedule }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedule.map((dayPlan) => (
            <div key={dayPlan.day} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{dayPlan.day}</h3>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-4">{dayPlan.focus}</p>

                {dayPlan.focus.toLowerCase() !== 'rest' && (
                    <>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Calentamiento: {dayPlan.warmup}</p>
                        <div className="space-y-4 my-4">
                            {dayPlan.exercises.map((exercise, index) => <ExerciseCard key={index} exercise={exercise} />)}
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enfriamiento: {dayPlan.cooldown}</p>
                    </>
                )}
            </div>
        ))}
    </div>
);

const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <h4 className="font-bold text-slate-800 dark:text-slate-100">{exercise.name}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{exercise.description}</p>
        <div className="flex justify-between items-center mt-2 text-sm font-mono text-slate-500 dark:text-slate-400">
            <span>{exercise.sets} sets</span>
            <span>{exercise.reps} reps</span>
            <span>{exercise.rest} rest</span>
        </div>
    </div>
);


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
