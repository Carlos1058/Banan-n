import React, { useState } from 'react';
import { UserProfile, WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';

interface OnboardingAssistantProps {
  userName: string;
  onComplete: (profile: UserProfile, plan: WorkoutPlan) => void;
}

// Enhanced questions with types and options for a form-based approach
const questions = [
  { key: 'age', question: `¡Hola, ${"{userName}"}! Soy Bananín 🍌. Para empezar, ¿cuántos años tienes?`, type: 'number' },
  { key: 'gender', question: "Entendido. ¿Cuál es tu género?", type: 'select', options: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'] },
  { key: 'weight', question: "¡Perfecto! Ahora, ¿cuál es tu peso actual en kilogramos?", type: 'number' },
  { key: 'height', question: "¡Casi terminamos con lo básico! ¿Cuál es tu altura en centímetros?", type: 'number' },
  { key: 'goal', question: "¿Cuál es tu principal objetivo de fitness?", type: 'select', options: ['Perder peso', 'Ganar músculo', 'Mantenerme activo', 'Mejorar resistencia'] },
  { key: 'fitnessLevel', question: "¿Cómo describirías tu nivel de condición física actual?", type: 'select', options: ['Principiante', 'Intermedio', 'Avanzado'] },
  { key: 'exerciseHabits', question: "¿Con qué frecuencia haces ejercicio actualmente?", type: 'select', options: ['Nunca', '1-2 veces por semana', '3-5 veces por semana', 'Casi todos los días'] },
  { key: 'availableEquipment', question: "¿Qué equipo de ejercicio tienes disponible?", type: 'select', options: ['Solo mi cuerpo', 'Mancuernas y bandas', 'Un gimnasio completo'] },
  { key: 'physicalLimitations', question: "Importante: ¿Tienes alguna limitación física o lesión que deba tener en cuenta?", type: 'text', placeholder: "Ej: Dolor en la rodilla, 'Ninguna'" },
  { key: 'foodPreferences', question: "Hablemos de comida. ¿Tienes alguna preferencia alimenticia?", type: 'select', options: ['Ninguna', 'Vegetariano', 'Vegano', 'Pescetariano'] },
  { key: 'allergies', question: "¿Alguna alergia alimentaria?", type: 'text', placeholder: "Ej: Maní, 'Ninguna'" },
  { key: 'budget', question: "Para la dieta, ¿cuál es tu presupuesto semanal aproximado para la compra?", type: 'number', placeholder: 'Ej: 50' },
];

const OnboardingAssistant: React.FC<OnboardingAssistantProps> = ({ userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    name: userName,
    physicalLimitations: 'Ninguna',
    allergies: 'Ninguna',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({
      ...prev,
      [name]: questions[currentStep].type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };
  
  const handleOptionSelect = (key: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [key]: value }));
    handleNext();
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const finalProfile = userProfile as UserProfile;
      const plan = await generateWorkoutPlan(finalProfile);
      onComplete(finalProfile, plan);
    } catch (err) {
      setError("¡Uy! Algo salió mal al crear tu plan. Por favor, inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const progress = ((currentStep) / (questions.length)) * 100;
  const currentQuestion = questions[currentStep];
  const isCurrentInputValid = currentQuestion ? userProfile[currentQuestion.key as keyof UserProfile]?.toString().trim() !== '' : false;

  const renderCurrentStep = () => {
    if (isGenerating) {
        return (
            <div className="text-center">
                 <h2 className="text-2xl font-bold mb-4">Creando tu Plan Personalizado...</h2>
                 <div className="flex justify-center items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-300">¡Bananín está usando su magia de IA! Esto puede tardar un momento.</p>
            </div>
        )
    }

    if (error) {
        return (
             <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-500">¡Oh no!</h2>
                <p className="mb-6">{error}</p>
                <button
                    onClick={handleGeneratePlan}
                    className="bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    if (currentStep >= questions.length) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">¡Listo! Revisa tu información</h2>
                <div className="text-left bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6 space-y-2">
                    {questions.map(q => (
                        <p key={q.key} className="text-sm">
                            <span className="font-semibold">{q.question.split('?')[0].replace('{userName}', userName)}: </span>
                            <span>{userProfile[q.key as keyof UserProfile]?.toString()}</span>
                        </p>
                    ))}
                </div>
                <button
                    onClick={handleGeneratePlan}
                    className="bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300"
                >
                    ¡Crear Mi Plan!
                </button>
            </div>
        )
    }

    return (
        <div className="text-center">
             <h2 className="text-2xl font-bold mb-6">{currentQuestion.question.replace('{userName}', userName)}</h2>
             {currentQuestion.type === 'select' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {currentQuestion.options?.map(option => (
                         <button
                            key={option}
                            onClick={() => handleOptionSelect(currentQuestion.key as keyof UserProfile, option)}
                            className="w-full text-left p-4 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                         >
                            {option}
                         </button>
                     ))}
                 </div>
             )}
             {(currentQuestion.type === 'number' || currentQuestion.type === 'text') && (
                 <form onSubmit={(e) => { e.preventDefault(); if (isCurrentInputValid) handleNext(); }}>
                    <input
                        type={currentQuestion.type}
                        name={currentQuestion.key}
                        value={userProfile[currentQuestion.key as keyof UserProfile] as string | number}
                        onChange={handleInputChange}
                        placeholder={currentQuestion.placeholder}
                        required
                        className="w-full max-w-sm px-4 py-3 text-center text-lg border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700"
                    />
                    <button type="submit" className="mt-6 bg-primary-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-primary-700 disabled:bg-slate-400" disabled={!isCurrentInputValid}>
                        Siguiente
                    </button>
                </form>
             )}
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-2xl">
         {/* Progress Bar */}
        <div className="mb-8">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            {renderCurrentStep()}
        </div>
        
        <div className="mt-6 flex justify-center">
            {currentStep > 0 && !isGenerating && (
                 <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold transition-colors">
                    &larr; Volver
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingAssistant;