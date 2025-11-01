import React from 'react';
import { UserProfile } from '../types';

const UserIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

interface HeaderProps {
    userProfile: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ userProfile }) => {
    
    const renderFrame = (frameId?: string) => {
        const baseStyle = { position: 'absolute', pointerEvents: 'none' } as React.CSSProperties;
        
        switch (frameId) {
            case 'gold':
                 return <div style={{...baseStyle, top: '-5px', left: '-5px', width: 'calc(100% + 10px)', height: 'calc(100% + 10px)', borderRadius: '50%', border: '3px solid gold' }}></div>;
            case 'squats':
                return <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-700 rounded-full p-0.5 shadow-md text-lg" style={{ transform: 'translate(15%, 15%)' }}>🏋️</div>
            case 'veggie':
                return <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-700 rounded-full p-0.5 shadow-md text-lg" style={{ transform: 'translate(15%, 15%)' }}>🥦</div>
            default:
                return null;
        }
    }

    return (
        <header className="w-full p-3 px-4 md:px-8 flex justify-between items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-primary-500">BanaFit 🍌</h1>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm font-semibold">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                        <span>🔥</span>
                        <span className="text-slate-800 dark:text-slate-100">{userProfile.streak}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                        <span>💎</span>
                        <span className="text-slate-800 dark:text-slate-100">{userProfile.diamonds}</span>
                    </div>
                </div>
                <div className="relative">
                    <div className="h-10 w-10">
                        {userProfile.profilePictureUrl ? (
                            <img src={userProfile.profilePictureUrl} alt="Profile" className="h-full w-full rounded-full object-cover border-2 border-white dark:border-slate-900" />
                        ) : (
                            <div className="h-full w-full rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-slate-500" />
                            </div>
                        )}
                    </div>
                     {renderFrame(userProfile.activeFrame)}
                </div>
            </div>
        </header>
    );
};

export default Header;