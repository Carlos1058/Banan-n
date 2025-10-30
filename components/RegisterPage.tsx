import React, { useState } from 'react';

interface RegisterPageProps {
  onRegister: (name: string) => void;
  onLogin: (email: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
        if (email.trim() && password.trim()) {
            onLogin(email);
        }
    } else {
        if (name.trim() && email.trim() && password.trim()) {
            onRegister(name);
        }
    }
  };

  const toggleMode = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsLogin(!isLogin);
      setName('');
      setEmail('');
      setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-600">AuraFit</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back!' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Log in to continue your journey.' : "Let's start your personalized fitness journey."}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Your Name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {isLogin ? 'Log In' : 'Continue'}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
            <a href="#" onClick={toggleMode} className="font-medium text-primary-600 hover:text-primary-500">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;