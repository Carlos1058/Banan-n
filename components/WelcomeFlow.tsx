import React, { useState, FormEvent } from 'react';

const PlanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const GamificationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.362-3.797z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214C14.252 5.214 13.27 5.463 12.44 5.908 11.61 6.352 10.925 7.025 10.38 7.854l-2.01 2.872A8.25 8.25 0 0012 21a8.25 8.25 0 003.362-15.786z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.375 6.375 0 006.375-6.375V9.375c0-1.036-.84-1.875-1.875-1.875h-1.5c-1.036 0-1.875.84-1.875 1.875v3.375c0 .621.504 1.125 1.125 1.125h.75zM12 18.75a6.375 6.375 0 01-6.375-6.375V9.375c0-1.036.84-1.875 1.875-1.875h1.5c1.036 0 1.875.84 1.875 1.875v3.375c0 .621-.504 1.125-1.125 1.125h-.75z" />
    </svg>
);


interface WelcomeFlowProps {
  onRegister: (name: string, gender: string) => void;
  onLogin: (email: string) => void;
}

type Mode = 'intro' | 'register' | 'login';

const WelcomeFlow: React.FC<WelcomeFlowProps> = ({ onRegister, onLogin }) => {
  const [mode, setMode] = useState<Mode>('intro');
  const [step, setStep] = useState(0);
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const introSlides = [
    {
      graphic: <div className="text-8xl">🍌</div>,
      title: 'Bienvenido a BanaFit',
      subtitle: 'Fitness que es realmente divertido.'
    },
    {
      graphic: <PlanIcon />,
      title: 'Planes Hiper-Personalizados',
      subtitle: 'Recibe un plan de entrenamiento y dieta generado por IA que se adapta a tu cuerpo y metas.'
    },
    {
      graphic: <GamificationIcon />,
      title: 'Motivación Gamificada',
      subtitle: 'Mantén tu racha con Bananín, gana recompensas y desbloquea accesorios.'
    }
  ];

  const handleNextIntro = () => {
    if (step < introSlides.length - 1) {
      setStep(step + 1);
    } else {
      setMode('register');
      setStep(0);
    }
  };
  
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      if (step < 3) {
        setStep(step + 1);
      } else {
        if (name && gender && email && password) onRegister(name, gender);
      }
    } else if (mode === 'login') {
      if (step < 1) {
        setStep(step + 1);
      } else {
        if (email && password) onLogin(email);
      }
    }
  };
  
  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    setStep(step + 1);
  };

  const getProgress = () => {
    if(mode === 'register') return ((step + 1) / 4) * 100;
    if(mode === 'login') return ((step + 1) / 2) * 100;
    return 0;
  }

  const renderContent = () => {
    if (mode === 'intro') {
      const currentSlide = introSlides[step];
      return (
        <div key={`intro-${step}`} className="flex flex-col h-full text-center animate-in fade-in-0 slide-in-from-right-5 duration-500">
          <div className="flex-grow flex flex-col items-center justify-center p-8">
            {currentSlide.graphic}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-8">{currentSlide.title}</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-sm">{currentSlide.subtitle}</p>
          </div>
          <div className="p-8">
            <div className="flex justify-center gap-2 mb-8">
              {introSlides.map((_, index) => (
                <div key={index} className={`h-2 w-2 rounded-full transition-all ${step === index ? 'bg-primary-500 w-6' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
              ))}
            </div>
            <button onClick={handleNextIntro} className="w-full bg-primary-600 text-white font-bold py-4 px-8 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300">
              {step < introSlides.length - 1 ? 'Siguiente' : 'Comenzar'}
            </button>
          </div>
        </div>
      );
    }

    const isRegister = mode === 'register';
    
    return (
        <div className="flex flex-col h-full p-6 md:p-8">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-8">
                <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${getProgress()}%` }}></div>
            </div>
            
            <div className="flex-grow flex items-center">
                <form onSubmit={handleFormSubmit} className="w-full" key={`${mode}-${step}`}>
                    <div className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
                    { isRegister && step === 0 && ( <h1 className="text-4xl font-bold mb-8">Primero, ¿cómo te llamas?</h1> )}
                    { isRegister && step === 1 && ( <h1 className="text-4xl font-bold mb-8">¿Cómo te identificas?</h1> )}
                    { isRegister && step === 2 && ( <h1 className="text-4xl font-bold mb-8">Gusto en conocerte, {name}. ¿Cuál es tu correo?</h1> )}
                    { isRegister && step === 3 && ( <h1 className="text-4xl font-bold mb-8">Y por último, crea una contraseña segura.</h1> )}
                    { !isRegister && step === 0 && ( <h1 className="text-4xl font-bold mb-8">¡Hola de nuevo! Ingresa tu correo.</h1> )}
                    { !isRegister && step === 1 && ( <h1 className="text-4xl font-bold mb-8">Ingresa tu contraseña.</h1> )}
                    
                    <div className="relative">
                        {isRegister ? (
                            <>
                                {step === 0 && <input type="text" placeholder="Tu Nombre" value={name} onChange={e => setName(e.target.value)} required autoFocus className="w-full text-2xl p-3 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:border-primary-500 transition" />}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <button type="button" onClick={() => handleGenderSelect('Femenino')} className="w-full text-left p-4 text-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">Femenino</button>
                                        <button type="button" onClick={() => handleGenderSelect('Masculino')} className="w-full text-left p-4 text-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">Masculino</button>
                                        <button type="button" onClick={() => handleGenderSelect('Prefiero no decirlo')} className="w-full text-left p-4 text-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">Prefiero no decirlo</button>
                                    </div>
                                )}
                                {step === 2 && <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="w-full text-2xl p-3 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:border-primary-500 transition" />}
                                {step === 3 && <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoFocus className="w-full text-2xl p-3 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:border-primary-500 transition" />}
                            </>
                        ) : (
                             <>
                                {step === 0 && <input type="email" placeholder="tu@correo.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="w-full text-2xl p-3 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:border-primary-500 transition" />}
                                {step === 1 && <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoFocus className="w-full text-2xl p-3 bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:border-primary-500 transition" />}
                            </>
                        )}
                    </div>
                    
                    { step !== 1 && (
                      <button type="submit" className="mt-10 bg-primary-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-primary-700 disabled:bg-slate-400">
                          { (isRegister && step === 3) || (!isRegister && step === 1) ? 'Finalizar' : 'Continuar' }
                      </button>
                    )}
                    </div>
                </form>
            </div>
            
            <div className="text-center mt-auto pt-4">
                <button
                    onClick={() => { setMode(isRegister ? 'login' : 'register'); setStep(0); }}
                    className="font-medium text-primary-600 hover:text-primary-500"
                >
                    {isRegister ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md h-[80vh] max-h-[700px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        {renderContent()}
      </div>
    </div>
  );
};

export default WelcomeFlow;