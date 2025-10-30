import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, WorkoutPlan } from '../types';
import { generatePlan, generateSpeech } from '../services/geminiService';

// --- Type definitions for Web Speech API ---
// Fix: Add local interfaces to provide types for the non-standard SpeechRecognition API.
interface ISpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
  // FIX: Add 'onaudiostart' to the ISpeechRecognition interface to fix a TypeScript error.
  onaudiostart: () => void;
}

interface SpeechRecognitionStatic {
  new (): ISpeechRecognition;
}

// --- Audio Decoding Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface OnboardingAssistantProps {
  userName: string;
  onComplete: (profile: UserProfile, plan: WorkoutPlan) => void;
}

const MaleAvatar = () => <img src="https://picsum.photos/seed/male/100/100" alt="Male Coach" className="w-12 h-12 rounded-full"/>;
const FemaleAvatar = () => <img src="https://picsum.photos/seed/female/100/100" alt="Female Coach" className="w-12 h-12 rounded-full"/>;
const UserAvatar = () => <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">You</div>;

const OnboardingAssistant: React.FC<OnboardingAssistantProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({ name: userName });
  const [coach, setCoach] = useState<'male' | 'female' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [messages, setMessages] = useState<{ sender: 'coach' | 'user', content: React.ReactNode }[]>([]);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  // Fix: Use the locally defined interface for the SpeechRecognition instance.
  const speechRecognitionRef = useRef<ISpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback(async (text: string) => {
      if (!coach) return;
      setIsSpeaking(true);
      if (isListening) {
          speechRecognitionRef.current?.stop();
      }
      try {
          if (!audioContextRef.current) {
              // Fix: Cast window to `any` to access the vendor-prefixed `webkitAudioContext`.
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const base64Audio = await generateSpeech(text, coach);
          const audioCtx = audioContextRef.current;
          const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          source.start();
          source.onended = () => {
              setIsSpeaking(false);
              // Automatically start listening after coach finishes speaking.
              if (step > 0 && step < 13 && !isLoading) { // Increased step limit
                  speechRecognitionRef.current?.start();
              }
          };
      } catch (e) {
          console.error("Speech generation/playback failed:", e);
          setError("I'm having trouble speaking right now. Please use the text inputs.");
          setIsSpeaking(false);
      }
  }, [coach, step, isLoading, isListening]);

  const addCoachMessage = useCallback((content: React.ReactNode, textToSpeak?: string) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'coach', content }]);
      if (textToSpeak && coach) {
        speak(textToSpeak);
      }
    }, 500);
  }, [coach, speak]);

  const addUserMessage = (content: React.ReactNode) => {
     setMessages(prev => [...prev, { sender: 'user', content }]);
  };

  const handleOptionSelect = (key: keyof UserProfile | 'coach', value: any) => {
    if (key === 'coach') {
        addUserMessage(<div className="p-3 bg-primary-600 text-white rounded-2xl">{value === 'male' ? 'Coach (Hombre)' : 'Coach (Mujer)'}</div>);
        setCoach(value);
        setStep(1);
        return;
    }

    const newProfile = { ...profile, [key]: value };
    setProfile(newProfile);

    const nextStep = step + 1;
    setStep(nextStep);

    let question = '';
    switch(nextStep) {
        case 2: question = "Gran objetivo. ¿Cuál dirías que es tu nivel de fitness actual? ¿Principiante, intermedio o avanzado?"; break;
        case 3: question = "Entendido. ¿Y a qué tipo de equipo tienes acceso? Por ejemplo, un gimnasio completo, solo mancuernas, o únicamente tu peso corporal."; break;
        case 4: question = "Bien. ¿Tienes alguna limitación física o lesión que deba tener en cuenta, como dolor de rodilla o alguna lesión pasada?"; break;
        case 5: question = "Anotado. Ahora, cuéntame sobre tus hábitos de ejercicio. ¿Vas al gimnasio, entrenas en casa, o eres principiante?"; break;
        case 6: question = "Perfecto. Hablemos de comida. ¿Tienes alguna alergia o restricción importante?"; break;
        case 7: question = "Ok. ¿Y qué comidas te gustan? Menciona algunas para tenerlo en cuenta."; break;
        case 8: question = "Casi terminamos. Necesito algunos datos más. ¿Cuál es tu género?"; break;
        case 9: question = "¿Cuántos años tienes?"; break;
        case 10: question = "¿Cuál es tu peso actual en kilogramos?"; break;
        case 11: question = "¿Y tu altura en centímetros?"; break;
        case 12: question = `Finalmente, ${userName}, ¿cuál es tu presupuesto semanal aproximado para comida en pesos mexicanos?`; break;
        case 13: 
            const finalText = "¡Excelente! Tengo toda la información que necesito. Estoy generando tu plan personalizado. Esto puede tardar un momento...";
            addCoachMessage(finalText, finalText);
            handleSubmit({ ...newProfile, budget: value } as UserProfile);
            return;
    }
    if (question) addCoachMessage(question, question);
  };
  
  const processVoiceInput = useCallback((transcript: string) => {
    addUserMessage(<div className="p-3 bg-primary-600 text-white rounded-2xl">{transcript}</div>);
    const lower = transcript.toLowerCase();

    switch(step) {
      case 1: // Goal
        if (lower.includes('peso') || lower.includes('bajar')) handleOptionSelect('goal', 'Bajar de peso');
        else if (lower.includes('músculo') || lower.includes('ganar')) handleOptionSelect('goal', 'Ganar músculo');
        else if (lower.includes('mantener') || lower.includes('forma')) handleOptionSelect('goal', 'Mantenerme en forma');
        else addCoachMessage("No entendí bien. ¿Es bajar de peso, ganar músculo o mantenerte?", "No entendí bien. ¿Es bajar de peso, ganar músculo o mantenerte?");
        break;
      case 2: // Fitness Level
        if (lower.includes('principiante')) handleOptionSelect('fitnessLevel', 'beginner');
        else if (lower.includes('intermedio')) handleOptionSelect('fitnessLevel', 'intermediate');
        else if (lower.includes('avanzado')) handleOptionSelect('fitnessLevel', 'advanced');
        else addCoachMessage("No te entendí. ¿Eres principiante, intermedio o avanzado?", "No te entendí. ¿Eres principiante, intermedio o avanzado?");
        break;
      case 3: // Equipment
        handleOptionSelect('availableEquipment', transcript);
        break;
      case 4: // Limitations
        if (lower.includes('ninguna') || lower.includes('no tengo')) handleOptionSelect('physicalLimitations', 'None');
        else handleOptionSelect('physicalLimitations', transcript);
        break;
      case 5: // Habits
        if (lower.includes('gym') || lower.includes('gimnasio')) handleOptionSelect('exerciseHabits', 'Voy al gym');
        else if (lower.includes('casa')) handleOptionSelect('exerciseHabits', 'Entreno en casa');
        else if (lower.includes('calistenia')) handleOptionSelect('exerciseHabits', 'Hago calistenia');
        else if (lower.includes('principiante')) handleOptionSelect('exerciseHabits', 'Soy principiante');
        else addCoachMessage("Disculpa, no te entendí. ¿Gym, casa, o principiante?", "Disculpa, no te entendí. ¿Gym, casa, o principiante?");
        break;
      case 6: // Allergies
        if (lower.includes('ninguna')) handleOptionSelect('allergies', 'Ninguna');
        else handleOptionSelect('allergies', transcript);
        break;
      case 7: // Food Prefs
        handleOptionSelect('foodPreferences', transcript);
        break;
      case 8: // Gender
        if (lower.includes('masculino') || lower.includes('hombre')) handleOptionSelect('gender', 'Masculino');
        else if (lower.includes('femenino') || lower.includes('mujer')) handleOptionSelect('gender', 'Femenino');
        else addCoachMessage("¿Podrías repetir tu género?", "¿Podrías repetir tu género?");
        break;
      case 9: case 10: case 11: case 12: // Numerical inputs
        const numbers = lower.match(/\d+/);
        if (numbers) {
          const num = parseInt(numbers[0], 10);
          if (step === 9) handleOptionSelect('age', num);
          else if (step === 10) handleOptionSelect('weight', num);
          else if (step === 11) handleOptionSelect('height', num);
          else if (step === 12) handleOptionSelect('budget', num);
        } else {
          addCoachMessage("No detecté un número. ¿Puedes repetirlo?", "No detecté un número. ¿Puedes repetirlo?");
        }
        break;
    }
  }, [step]);
  
  useEffect(() => {
    // Fix: Cast window to `any` to access vendor-prefixed APIs and use the local `SpeechRecognitionStatic` type.
    const SpeechRecognition: SpeechRecognitionStatic = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Tu navegador no soporta la API de voz. Por favor, usa Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'es-MX';
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (finalTranscript) {
        processVoiceInput(finalTranscript.trim());
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onaudiostart = () => {
        setIsListening(true);
    };

    speechRecognitionRef.current = recognition;
  }, [processVoiceInput]);

  // Effect to ask the first question once a coach is selected
  useEffect(() => {
    if (coach && step === 1 && messages.length === 1) { // Only ask if it's the first time at this step
       const question = `¡Genial! Empecemos con lo básico, ${userName}. ¿Cuál es tu objetivo principal? ¿Bajar de peso, ganar músculo, o mantenerte en forma?`;
       addCoachMessage(question, question);
    }
  }, [coach, step, userName, messages.length, addCoachMessage]);


  useEffect(() => {
    if (step === 0 && messages.length === 0) {
      addCoachMessage(`¡Bienvenido, ${userName}! Soy tu asistente. Para empezar, ¿prefieres que te guíe un coach o una coach?`);
    }
  }, [userName, step, messages.length, addCoachMessage]);

  const handleMicClick = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
    } else {
      speechRecognitionRef.current?.start();
    }
  };

  const handleSubmit = async (finalProfile: UserProfile) => {
    setIsLoading(true);
    setError('');
    try {
        const plan = await generatePlan(finalProfile);
        onComplete(finalProfile, plan);
    } catch(err) {
        setError('Hubo un problema al generar tu plan. Por favor, intenta de nuevo.');
        addCoachMessage("Lo siento, hubo un error. ¿Quieres que intente generar el plan de nuevo?", "Lo siento, hubo un error. ¿Quieres que intente generar el plan de nuevo?");
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderInput = () => {
    if (step === 0) {
      return (
        <div className="p-4 flex justify-center">
          <button onClick={() => handleOptionSelect('coach', 'male')} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full hover:bg-gray-100 transition-colors m-1">Coach (Hombre)</button>
          <button onClick={() => handleOptionSelect('coach', 'female')} className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full hover:bg-gray-100 transition-colors m-1">Coach (Mujer)</button>
        </div>
      );
    }
    
    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Generando plan...</div>;
    }
    
    let statusText = "Toca para hablar";
    if (isSpeaking) statusText = "El coach está hablando...";
    else if (isListening) statusText = "Escuchando...";

    return (
        <div className="flex flex-col items-center justify-center p-4 h-32">
            <p className="text-gray-600 h-6">{isListening ? interimTranscript : statusText}</p>
            <button
                onClick={handleMicClick}
                disabled={isSpeaking || isLoading}
                className={`mt-2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out text-white
                    ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-600'}
                    ${(isSpeaking || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 10.5a.5.5 0 01.5.5v.5a.5.5 0 01-1 0v-.5a.5.5 0 01.5-.5zM5 10a.5.5 0 00-1 0v1.5a.5.5 0 001 0V10zM10 18a8 8 0 100-16 8 8 0 000 16zm-5-8a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5zm1.5.5a.5.5 0 01.5-.5h.5a.5.5 0 010 1h-.5a.5.5 0 01-.5-.5zm2.5-.5a.5.5 0 00-1 0v.5a.5.5 0 001 0v-.5z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
  };

  const getCoachAvatar = () => {
    if (coach === 'male') return <MaleAvatar />;
    if (coach === 'female') return <FemaleAvatar />;
    return <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">AI</div>
  };


  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white shadow-lg">
      <header className="p-4 border-b border-gray-200 text-center font-bold text-lg">Asistente de Bienvenida</header>
      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'coach' && getCoachAvatar()}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'coach' ? 'bg-gray-100 text-gray-800 rounded-bl-none' : 'bg-primary-600 text-white rounded-br-none'}`}>
              {msg.content}
            </div>
             {msg.sender === 'user' && <UserAvatar />}
          </div>
        ))}
        {error && <div className="text-center text-red-500">{error}</div>}
         <div ref={chatEndRef} />
      </div>
      <div className="border-t border-gray-200 bg-gray-50">
        {renderInput()}
      </div>
    </div>
  );
};

export default OnboardingAssistant;