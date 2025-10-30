import React, { useState, useCallback } from 'react';
import { UserProfile, WorkoutPlan } from './types';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import OnboardingAssistant from './components/OnboardingAssistant';
import Dashboard from './components/Dashboard';

export type Page = 'landing' | 'register' | 'onboarding' | 'dashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [userName, setUserName] = useState<string>('');

  const createInitialProfile = (name: string): UserProfile => ({
    name: name,
    age: 0,
    weight: 0,
    height: 0,
    goal: '',
    fitnessLevel: '',
    availableEquipment: '',
    physicalLimitations: 'None',
    exerciseHabits: '',
    allergies: 'Ninguna',
    budget: 0,
    foodPreferences: '',
    gender: '',
  });
  
  const handleRegister = useCallback((name: string) => {
    const initialProfile = createInitialProfile(name);
    setUserProfile(initialProfile);
    setWorkoutPlan(null);
    setCurrentPage('dashboard');
  }, []);

  const handleLogin = useCallback((email: string) => {
    const name = email.split('@')[0] || 'User';
    const initialProfile = createInitialProfile(name);
    setUserProfile(initialProfile);
    setWorkoutPlan(null); // Assume existing user, but plan will be fetched or created.
    setCurrentPage('dashboard');
  }, []);

  const handleStartOnboarding = useCallback(() => {
    if (userProfile) {
        setUserName(userProfile.name);
        setCurrentPage('onboarding');
    }
  }, [userProfile]);

  const handleOnboardingComplete = useCallback((profile: UserProfile, plan: WorkoutPlan) => {
    setUserProfile(profile);
    setWorkoutPlan(plan);
    setCurrentPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setUserProfile(null);
    setWorkoutPlan(null);
    setUserName('');
    setCurrentPage('landing');
  }, []);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentPage('register')} />;
      case 'register':
        return <RegisterPage onRegister={handleRegister} onLogin={handleLogin} />;
      case 'onboarding':
        // The userName for the assistant is derived from the userProfile.
        return <OnboardingAssistant userName={userName} onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        if (userProfile) {
          return <Dashboard userProfile={userProfile} plan={workoutPlan} onLogout={handleLogout} onStartOnboarding={handleStartOnboarding} />;
        }
        // Fallback if dashboard is reached without a profile
        return <LandingPage onGetStarted={() => setCurrentPage('register')} />;
      default:
        return <LandingPage onGetStarted={() => setCurrentPage('register')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {renderPage()}
    </div>
  );
};

export default App;