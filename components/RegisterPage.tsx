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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-500">BanaFit 🍌</h1>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {isLogin ? '¡Bienvenido de vuelta!' : 'Crea tu cuenta'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {isLogin ? 'Inicia sesión para continuar tu viaje.' : 'Comencemos tu viaje de fitness personalizado.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Nombre</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Tu Nombre"
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Correo electrónico"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-400 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {isLogin ? 'Iniciar Sesión' : 'Continuar'}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
            <a href="#" onClick={toggleMode} className="font-medium text-primary-600 hover:text-primary-500">
                {isLogin ? "¿No tienes una cuenta? Regístrate" : "¿Ya tienes una cuenta? Inicia sesión"}
            </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;