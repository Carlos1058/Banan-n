import React, { useState, useMemo, useRef } from 'react';
import { WorkoutPlan, Exercise, Meal, UserProfile } from '../types';

interface DashboardProps {
  userProfile: UserProfile;
  plan: WorkoutPlan | null;
  onLogout: () => void;
  onStartOnboarding: () => void;
}

const HomeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.006v3.988a1 1 0 001.555.832l3.197-1.994a1 1 0 000-1.664l-3.197-1.994z" clipRule="evenodd" />
    </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


const VideoModal = ({ exerciseName, onClose }: { exerciseName: string, onClose: () => void }) => {
    const videoSrc = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(exerciseName + ' exercise demonstration')}`;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-3xl w-full m-4" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 flex justify-between items-center border-b">
                    <h3 className="text-xl font-bold text-gray-800">{exerciseName} - Demostración</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none font-bold">&times;</button>
                </div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                        src={videoSrc}
                        title={`YouTube video player for ${exerciseName}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};


const NutritionCard: React.FC<{ title: string, meal: Meal | undefined }> = ({ title, meal }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm">
        <h4 className="font-bold text-primary-700">{title}</h4>
        {meal ? (
            <>
                <p className="font-semibold text-gray-800 mt-1">{meal.name}</p>
                <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">{meal.calories} kcal</p>
            </>
        ) : <p className="text-sm text-gray-500 mt-1">No plan available.</p>}
    </div>
);

const ExerciseCard: React.FC<{ exercise: Exercise; onWatchVideo: () => void; }> = ({ exercise, onWatchVideo }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
                <h4 className="font-bold text-lg text-gray-800">{exercise.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{exercise.instructions}</p>
            </div>
            <div className="flex-shrink-0 flex gap-2 text-center">
                <div className="bg-primary-50 p-2 rounded-lg w-20">
                    <p className="font-bold text-primary-600 text-xl">{exercise.sets}</p>
                    <p className="text-xs text-primary-700 font-semibold">SETS</p>
                </div>
                 <div className="bg-primary-50 p-2 rounded-lg w-20">
                    <p className="font-bold text-primary-600 text-xl">{exercise.reps}</p>
                    <p className="text-xs text-primary-700 font-semibold">REPS</p>
                </div>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 text-right">
            <button
                onClick={onWatchVideo}
                className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors"
            >
                <PlayIcon className="h-5 w-5 mr-1"/>
                Ver Demostración
            </button>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ userProfile, plan, onLogout, onStartOnboarding }) => {
    const [activeView, setActiveView] = useState<'today' | 'week' | 'profile'>('today');
    const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const todayIndex = useMemo(() => {
        const day = new Date().getDay();
        return day === 0 ? 6 : day - 1;
    }, []);

    const todayPlan = plan?.weeklyPlan[todayIndex];

    const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicture(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const renderToday = () => {
        if (!todayPlan) {
            return <p className="text-center text-gray-500 mt-8">No plan available for today.</p>;
        }
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Entrenamiento de Hoy: {todayPlan.workout.focus}</h3>
                    <div className="mt-4 space-y-4">
                        {todayPlan.workout.exercises.map((ex, i) => <ExerciseCard key={i} exercise={ex} onWatchVideo={() => setViewingExercise(ex)} />)}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Nutrición de Hoy</h3>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <NutritionCard title="Desayuno" meal={todayPlan.nutrition.breakfast}/>
                        <NutritionCard title="Comida" meal={todayPlan.nutrition.lunch}/>
                        <NutritionCard title="Cena" meal={todayPlan.nutrition.dinner}/>
                        {todayPlan.nutrition.snacks && <NutritionCard title="Snack" meal={todayPlan.nutrition.snacks}/>}
                    </div>
                </div>
            </div>
        );
    };

    const renderWeek = () => {
        if (!plan) return null; // Should be handled by renderContent
        return (
            <div className="space-y-8">
                {plan.weeklyPlan.map((dailyPlan, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
                        <h3 className="text-2xl font-bold text-primary-700 border-b pb-2 mb-4">{dailyPlan.day} - {dailyPlan.workout.focus}</h3>
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-xl mb-3">Entrenamiento</h4>
                                <div className="space-y-3">
                                    {dailyPlan.workout.exercises.map((ex, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                            <p className="font-semibold text-gray-800">{ex.name}</p>
                                            <p className="text-sm text-gray-600">{ex.sets} sets, {ex.reps} reps</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-xl mb-3">Nutrición</h4>
                                <div className="space-y-3">
                                   <p><strong className="text-gray-700">Desayuno:</strong> {dailyPlan.nutrition.breakfast.name}</p>
                                   <p><strong className="text-gray-700">Comida:</strong> {dailyPlan.nutrition.lunch.name}</p>
                                   <p><strong className="text-gray-700">Cena:</strong> {dailyPlan.nutrition.dinner.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderProfile = () => (
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h3>
        <div className="flex flex-col items-center">
            <div className="relative mb-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePictureChange}
                    accept="image/*"
                    className="hidden"
                />
                {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="h-32 w-32 rounded-full object-cover border-4 border-primary-500" />
                ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                        <UserIcon className="h-16 w-16 text-gray-400" />
                    </div>
                )}
                <button
                    onClick={handleUploadClick}
                    className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow-md"
                    aria-label="Change profile picture"
                >
                    <EditIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="w-full mt-4 bg-white p-6 rounded-2xl shadow-sm space-y-3 divide-y divide-gray-200 capitalize">
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Nombre:</strong> {userProfile.name}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Edad:</strong> {userProfile.age || 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Género:</strong> {userProfile.gender || 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Peso:</strong> {userProfile.weight ? `${userProfile.weight} kg` : 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Altura:</strong> {userProfile.height ? `${userProfile.height} cm` : 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Objetivo:</strong> {userProfile.goal || 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Nivel de Fitness:</strong> {userProfile.fitnessLevel || 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Equipo Disponible:</strong> {userProfile.availableEquipment || 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Limitaciones:</strong> {userProfile.physicalLimitations || 'N/A'}</div>
                <div className="pt-3 first:pt-0"><strong className="text-gray-600 w-40 inline-block">Hábitos:</strong> {userProfile.exerciseHabits || 'N/A'}</div>
            </div>
            <button onClick={onLogout} className="mt-6 w-full bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl hover:bg-red-100 transition-colors">
                Cerrar Sesión
            </button>
        </div>
      </div>
    );

    const renderNoPlanView = () => (
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg mt-8">
            <h3 className="text-2xl font-bold text-gray-800">¡Bienvenido a AuraFit!</h3>
            <p className="mt-4 text-gray-600 max-w-md mx-auto">
                Estás a un paso de tu transformación. Completa nuestro breve cuestionario para que la IA cree tu plan de entrenamiento y nutrición 100% personalizado.
            </p>
            <button
                onClick={onStartOnboarding}
                className="mt-8 bg-primary-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300"
            >
                Crear Mi Plan Personalizado
            </button>
        </div>
    );
    
    const renderLockedView = () => (
        <div className="text-center bg-white p-8 rounded-2xl shadow-md text-gray-500 mt-8">
            <LockIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold">Plan Semanal Bloqueado</h3>
            <p className="mt-2">Completa el cuestionario inicial para desbloquear tu plan semanal.</p>
        </div>
    );

    const renderContent = () => {
        if (!plan) {
            switch (activeView) {
                case 'today': return renderNoPlanView();
                case 'week': return renderLockedView();
                case 'profile': return renderProfile();
                default: return renderNoPlanView();
            }
        }
    
        switch (activeView) {
            case 'today': return renderToday();
            case 'week': return renderWeek();
            case 'profile': return renderProfile();
            default: return renderToday();
        }
    }
    
    return (
        <>
            {viewingExercise && (
              <VideoModal 
                  exerciseName={viewingExercise.name} 
                  onClose={() => setViewingExercise(null)} 
              />
            )}
            <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900">Hola de nuevo, {userProfile.name}!</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        {plan ? "Listo para el día de hoy? Aquí está tu plan." : "Empecemos tu viaje hacia una mejor versión de ti."}
                    </p>
                </header>

                <main>
                    {renderContent()}
                </main>
            </div>
            
            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md">
                <div className="max-w-5xl mx-auto flex justify-around">
                    <button onClick={() => setActiveView('today')} className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm font-medium ${activeView === 'today' ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600 transition-colors'}`}>
                        <HomeIcon className="h-6 w-6 mb-1"/>
                        <span>Hoy</span>
                    </button>
                    <button onClick={() => setActiveView('week')} className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm font-medium ${activeView === 'week' ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600 transition-colors'}`}>
                        <CalendarIcon className="h-6 w-6 mb-1"/>
                        <span>Semana</span>
                    </button>
                    <button onClick={() => setActiveView('profile')} className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm font-medium ${activeView === 'profile' ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600 transition-colors'}`}>
                        <UserIcon className="h-6 w-6 mb-1"/>
                        <span>Perfil</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Dashboard;