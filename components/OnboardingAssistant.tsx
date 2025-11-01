import React, { useState, useMemo } from 'react';
import { UserProfile, WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';

interface OnboardingAssistantProps {
  userName: string;
  onComplete: (profile: UserProfile, plan: WorkoutPlan) => void;
}

type DetailLevel = 'sencillo' | 'avanzado' | 'experto';

const questionsBase = [
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
  // New questions for Avanzado & Experto
  { key: 'sleepHours', question: 'En promedio, ¿cuántas horas duermes por noche?', type: 'select', options: ['Menos de 6 horas', '6-7 horas', '7-8 horas', 'Más de 8 horas'] },
  { key: 'trainingTime', question: '¿Cuánto tiempo tienes para cada sesión de entrenamiento?', type: 'select', options: ['30 minutos o menos', '30-45 minutos', '45-60 minutos', 'Más de 60 minutos'] },
];

const questionsExperto = [
    ...questionsBase,
    { key: 'neckCircumference', question: 'Para un plan experto, necesitamos algunas medidas. ¿Circunferencia del cuello (cm)?', type: 'number', placeholder: 'Ej: 38' },
    { key: 'waistCircumference', question: '¿Circunferencia de la cintura (cm), a la altura del ombligo?', type: 'number', placeholder: 'Ej: 85' },
    { key: 'hipCircumference', question: '¿Y la circunferencia de la cadera (cm), en la parte más ancha?', type: 'number', placeholder: 'Ej: 100' },
    { key: 'favoriteProteins', question: '¿Cuáles de estas fuentes de proteína disfrutas más?', type: 'multiselect', options: ['Pollo', 'Pescado', 'Carne Roja', 'Huevos', 'Tofu', 'Lentejas', 'Yogur Griego'] },
    { key: 'favoriteCarbs', question: '¿Y cuáles son tus carbohidratos preferidos?', type: 'multiselect', options: ['Arroz', 'Pasta', 'Pan', 'Avena', 'Patatas', 'Quinoa'] }
];

const OnboardingAssistant: React.FC<OnboardingAssistantProps> = ({ userName, onComplete }) => {
  const [detailLevel, setDetailLevel] = useState<DetailLevel | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    name: userName,
    physicalLimitations: 'Ninguna',
    allergies: 'Ninguna',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');

  const questions = useMemo(() => {
    if (detailLevel === 'sencillo') return [questionsBase[4], questionsBase[5], questionsBase[7]]; // Goal, fitness level, equipment
    if (detailLevel === 'avanzado') return questionsBase;
    if (detailLevel === 'experto') return questionsExperto;
    return [];
  }, [detailLevel]);

  const handleNext = () => setCurrentStep(prev => prev + 1);
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
  
  const handleMultiSelect = (key: keyof UserProfile, value: string) => {
    setUserProfile(prev => {
        const currentValues = (prev[key] as string[] | undefined) || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return { ...prev, [key]: newValues };
    });
  };

  const handleAddOther = (key: keyof UserProfile) => {
    if (otherText.trim()) {
        handleMultiSelect(key, otherText.trim());
        setOtherText('');
    }
  }

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
    // Loading, Error, and Review states are the same as before...
    if (isGenerating) {
        return ( <div className="text-center"> <h2 className="text-2xl font-bold mb-4">Creando tu Plan Personalizado...</h2> <div className="flex justify-center items-center space-x-2"> <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div> <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.2s]"></div> <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse [animation-delay:0.4s]"></div> </div> <p className="mt-4 text-slate-600 dark:text-slate-300">¡Bananín está usando su magia de IA! Esto puede tardar un momento.</p> </div> )
    }
    if (error) {
        return ( <div className="text-center"> <h2 className="text-2xl font-bold mb-4 text-red-500">¡Oh no!</h2> <p className="mb-6">{error}</p> <button onClick={handleGeneratePlan} className="bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-primary-700 transition-colors"> Reintentar </button> </div> )
    }
    if (currentStep >= questions.length) {
        return ( <div className="text-center"> <h2 className="text-2xl font-bold mb-4">¡Listo! Revisa tu información</h2> <div className="text-left bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6 space-y-2 max-h-60 overflow-y-auto"> {questions.map(q => ( <p key={q.key} className="text-sm"> <span className="font-semibold">{q.question.split('?')[0].replace('{userName}', userName)}: </span> <span>{Array.isArray(userProfile[q.key as keyof UserProfile]) ? (userProfile[q.key as keyof UserProfile] as string[]).join(', ') : userProfile[q.key as keyof UserProfile]?.toString()}</span> </p> ))} </div> <button onClick={handleGeneratePlan} className="bg-primary-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300"> ¡Crear Mi Plan! </button> </div> )
    }

    // Render question types
    return (
        <div className="text-center">
             <h2 className="text-2xl font-bold mb-6">{currentQuestion.question.replace('{userName}', userName)}</h2>
             {currentQuestion.type === 'select' && ( <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {currentQuestion.options?.map(option => ( <button key={option} onClick={() => handleOptionSelect(currentQuestion.key as keyof UserProfile, option)} className="w-full text-left p-4 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"> {option} </button> ))} </div> )}
             {(currentQuestion.type === 'number' || currentQuestion.type === 'text') && ( <form onSubmit={(e) => { e.preventDefault(); if (isCurrentInputValid) handleNext(); }}> <input type={currentQuestion.type} name={currentQuestion.key} value={userProfile[currentQuestion.key as keyof UserProfile] as string | number} onChange={handleInputChange} placeholder={currentQuestion.placeholder} required className="w-full max-w-sm px-4 py-3 text-center text-lg border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700" /> <button type="submit" className="mt-6 bg-primary-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-primary-700 disabled:bg-slate-400" disabled={!isCurrentInputValid}> Siguiente </button> </form> )}
             {currentQuestion.type === 'multiselect' && ( 
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {currentQuestion.options?.map(option => {
                            const isSelected = (userProfile[currentQuestion.key as keyof UserProfile] as string[] | undefined)?.includes(option);
                            return (<button key={option} onClick={() => handleMultiSelect(currentQuestion.key as keyof UserProfile, option)} className={`w-full p-3 border-2 rounded-lg transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-primary-400'}`}> {option} </button>)
                        })}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                         <input type="text" value={otherText} onChange={(e) => setOtherText(e.target.value)} placeholder="¿Otro? Añádelo aquí" className="flex-grow px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700" />
                         <button onClick={() => handleAddOther(currentQuestion.key as keyof UserProfile)} className="bg-slate-200 dark:bg-slate-600 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-500">Añadir</button>
                    </div>
                    <button onClick={handleNext} className="mt-6 bg-primary-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-primary-700"> Siguiente </button> 
                </div>
            )}
        </div>
    )
  }

  if (!detailLevel) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Elige tu Aventura de Fitness</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">¿Qué tan detallado quieres que sea tu plan?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <button onClick={() => setDetailLevel('sencillo')} className="text-left p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-transparent hover:border-primary-500 hover:shadow-primary-500/20 transition-all">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">Sencillo</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Para empezar rápido. Unas pocas preguntas clave y estarás listo para entrenar.</p>
                </button>
                 <button onClick={() => setDetailLevel('avanzado')} className="text-left p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-primary-500 ring-2 ring-primary-500/50 transition-all">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">Avanzado</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">El balance perfecto. Un plan detallado basado en tus metas y estilo de vida.</p>
                </button>
                 <button onClick={() => setDetailLevel('experto')} className="text-left p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-transparent hover:border-primary-500 hover:shadow-primary-500/20 transition-all">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">Experto</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Máxima personalización. Incluye medidas corporales y preferencias de comida detalladas.</p>
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-2xl">
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