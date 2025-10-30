
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-white">
      <header className="w-full p-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-primary-600">AuraFit</h1>
        <button onClick={onGetStarted} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition-colors">
          Get Started
        </button>
      </header>

      <main className="w-full max-w-5xl mx-auto flex-grow p-6 md:p-12">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-800 leading-tight">
            Stop guessing. Start evolving.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            AuraFit gives you the exact workout and nutrition plan your body needs, based on your goals, tastes, and lifestyle—100% free.
          </p>
          <button onClick={onGetStarted} className="mt-10 bg-primary-600 text-white font-bold py-4 px-8 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300">
            Start Your Transformation (Free - Alpha)
          </button>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-50 rounded-2xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800">Your Personal Coach, Reimagined</h3>
            <p className="mt-3 text-gray-600">Everything you need to succeed, right in your pocket.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="font-bold text-xl text-gray-800">Hyper-Personalized Plans</h4>
              <p className="mt-2 text-gray-600">AI-generated plans that adapt to your unique body and preferences.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="font-bold text-xl text-gray-800">Effortless Nutrition</h4>
              <p className="mt-2 text-gray-600">Delicious, budget-friendly meal plans that you'll actually enjoy.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h4 className="font-bold text-xl text-gray-800">Workouts That Work</h4>
              <p className="mt-2 text-gray-600">Effective routines for the gym or home, designed to get you results.</p>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="text-center py-16 md:py-24">
            <h3 className="text-3xl font-bold text-gray-800 mb-12">Your Journey in 3 Simple Steps</h3>
            <div className="grid md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 font-bold rounded-full h-16 w-16 flex items-center justify-center text-2xl">1</div>
                    <h4 className="font-bold text-xl mt-4">Tell Us Who You Are</h4>
                    <p className="text-gray-600 mt-1">Share your goals, habits, and preferences.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 font-bold rounded-full h-16 w-16 flex items-center justify-center text-2xl">2</div>
                    <h4 className="font-bold text-xl mt-4">Define Your Goal</h4>
                    <p className="text-gray-600 mt-1">Whether it's weight loss, muscle gain, or wellness.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 font-bold rounded-full h-16 w-16 flex items-center justify-center text-2xl">3</div>
                    <h4 className="font-bold text-xl mt-4">Get Your Instant Plan</h4>
                    <p className="text-gray-600 mt-1">Receive your personalized plan and start today.</p>
                </div>
            </div>
        </section>
      </main>

      <footer className="w-full text-center p-6 border-t border-gray-200">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} AuraFit. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
   