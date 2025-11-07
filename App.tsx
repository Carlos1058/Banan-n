import React, { useState, useCallback, useEffect } from 'react';
import { UserProfile, WorkoutPlan } from './types';
import OnboardingAssistant from './components/OnboardingAssistant';
import Dashboard from './components/Dashboard';
import WelcomeFlow from './components/WelcomeFlow';

export type Page = 'welcome' | 'onboarding' | 'dashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Effect to handle theme and dark mode application
  useEffect(() => {
    if (!userProfile) return;

    // Apply color theme
    const theme = userProfile.activeTheme || 'default';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply card style
    const cardStyle = userProfile.activeCardStyle || 'default';
    document.documentElement.setAttribute('data-card-style', cardStyle);

    // Apply dark/light mode
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') { // Default to light mode unless explicitly set to dark
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [userProfile, userProfile?.activeTheme, userProfile?.activeCardStyle]);

  const createInitialProfile = (name: string, gender: string): UserProfile => ({
    name: name,
    age: 0,
    weight: 0,
    height: 0,
    goal: '',
    fitnessLevel: '',
    availableEquipment: [],
    physicalLimitations: 'None',
    exerciseHabits: '',
    allergies: 'Ninguna',
    budget: 0,
    foodPreferences: '',
    gender: gender,
    // Gamification defaults
    streak: 0,
    diamonds: 999, // Start with 999 diamonds for testing
    purchasedPets: ['bananin'],
    activePet: 'bananin',
    completedDays: [],
    claimedInstagramReward: false,
    claimedFacebookReward: false,
    claimedXReward: false,
    // Customization defaults
    purchasedThemes: ['default'],
    activeTheme: 'default',
    purchasedFrames: [],
    activeFrame: undefined,
    purchasedCardStyles: ['default'],
    activeCardStyle: 'default',
  });
  
  const handleRegister = useCallback((name: string, gender: string) => {
    const initialProfile = createInitialProfile(name, gender);
    setUserProfile(initialProfile);
    setWorkoutPlan(null);
    setCurrentPage('dashboard');
  }, []);

  const handleLogin = useCallback((email: string) => {
    const name = email.split('@')[0] || 'User';
    // For login, we don't know the gender, so default to empty
    const initialProfile = createInitialProfile(name, '');
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

  const handleOnboardingComplete = useCallback((onboardingProfile: UserProfile, plan: WorkoutPlan) => {
    setUserProfile(prevProfile => {
      // Merge the data from onboarding with the existing profile to preserve
      // gamification and customization fields that are not part of the onboarding flow.
      if (prevProfile) {
        return { ...prevProfile, ...onboardingProfile };
      }
      // This is a fallback case and shouldn't be reached in normal flow.
      console.error("Onboarding completed without a base profile. Gamification data may be lost.");
      return onboardingProfile;
    });
    setWorkoutPlan(plan);
    setCurrentPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setUserProfile(null);
    setWorkoutPlan(null);
    setUserName('');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-card-style');
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
    setCurrentPage('welcome');
  }, []);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomeFlow onRegister={handleRegister} onLogin={handleLogin} />;
      case 'onboarding':
        // The userName for the assistant is derived from the userProfile.
        return <OnboardingAssistant userName={userName} onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        if (userProfile) {
          return <Dashboard 
                    userProfile={userProfile} 
                    setUserProfile={setUserProfile} 
                    plan={workoutPlan} 
                    setWorkoutPlan={setWorkoutPlan}
                    onLogout={handleLogout} 
                    onStartOnboarding={handleStartOnboarding} 
                 />;
        }
        // Fallback if dashboard is reached without a profile
        return <WelcomeFlow onRegister={handleRegister} onLogin={handleLogin} />;
      default:
        return <WelcomeFlow onRegister={handleRegister} onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 font-sans">
      {renderPage()}
    </div>
  );
};

export default App;