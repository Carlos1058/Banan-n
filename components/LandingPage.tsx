import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="w-full p-4 flex justify-between items-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-yellow-500">BanaFit 🍌</h1>
        <button onClick={onGetStarted} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-700 transition-colors">
          Empezar
        </button>
      </header>

      <main className="w-full max-w-5xl mx-auto flex-grow p-6 md:p-12">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white leading-tight">
            Fitness que es realmente divertido.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            BanaFit te da el plan de entrenamiento y dieta perfecto, ¡mientras juegas! Mantén tu racha, gana recompensas y personaliza a tu amigo fitness, Bananín.
          </p>
          <button onClick={onGetStarted} className="mt-10 bg-primary-600 text-white font-bold py-4 px-8 rounded-full shadow-lg text-lg hover:bg-primary-700 transform hover:scale-105 transition-all duration-300">
            Comienza tu Aventura (¡Es Gratis!)
          </button>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-slate-800/50 rounded-2xl">
          <div className="text-center mb-12 px-4">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Tu Entrenador Personal, Reinventado</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Todo lo que necesitas para triunfar, justo en tu bolsillo.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-xl text-slate-800 dark:text-white">Planes Hiper-Personalizados</h4>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Planes generados por IA que se adaptan a tu cuerpo y preferencias únicas.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-xl text-slate-800 dark:text-white">Motivación Gamificada</h4>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Mantente motivado con rachas, recompensas y tu propia mascota, Bananín.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-xl text-slate-800 dark:text-white">Nutrición sin Esfuerzo</h4>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Planes de comida deliciosos y económicos que realmente disfrutarás.</p>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="text-center py-16 md:py-24">
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-12">Tu Viaje en 3 Simples Pasos</h3>
            <div className="grid md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 font-bold rounded-full h-16 w-16 flex items-center justify-center text-2xl">1</div>
                    <h4 className="font-bold text-xl mt-4 dark:text-white">Cuéntanos Sobre Ti</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">Comparte tus metas, hábitos y preferencias.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 font-bold rounded-full h-16 w-16 flex items-center justify-center text-2xl">2</div>
                    <h4 className="font-bold text-xl mt-4 dark:text-white">Obtén tu Plan Instantáneo</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">Recibe tu plan personalizado de nuestro coach de IA.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 font-bold rounded-full h-16 w-16 flex items-center justify-center text-2xl">3</div>
                    <h4 className="font-bold text-xl mt-4 dark:text-white">Entrena con Bananín</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">¡Completa tus metas y gana recompensas!</p>
                </div>
            </div>
        </section>
      </main>

      <footer className="w-full text-center p-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} BanaFit. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;