import React, { useState } from 'react';
import { UserProfile } from '../types';

// --- Icons ---
const XIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PlayIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
);
const InstagramIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.703.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.198-.509.333-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.174-1.433-.372-1.942a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 8 0zm0 1.442c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.598.92c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.598-.92c-.11-.28-.24-.705-.276-1.485C1.45 10.39 1.442 10.137 1.442 8s.008-2.39.047-3.233c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.843-.038 1.096-.047 3.232-.047zM8 3.882a4.118 4.118 0 1 0 0 8.236 4.118 4.118 0 0 0 0-8.236zM8 10.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm3.5-6.838a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92z"/>
    </svg>
);
const FacebookIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0 0 3.603 0 8.05C0 12.006 2.908 15.153 6.75 15.969V10.324H4.718V8.05h2.032V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.274H11.45V15.97A8.026 8.026 0 0 0 16 8.049z"/>
    </svg>
);
const XSocialIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633z"/>
    </svg>
);

interface DiamondModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const DiamondModal: React.FC<DiamondModalProps> = ({ isOpen, onClose, userProfile, setUserProfile }) => {
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    
    if (!isOpen) return null;

    const handleWatchAd = () => {
        setIsWatchingAd(true);
        setTimeout(() => {
            setUserProfile(prev => prev ? { ...prev, diamonds: prev.diamonds + 25 } : null);
            setIsWatchingAd(false);
        }, 2500);
    };
    
    const handlePurchase = (diamonds: number) => {
        setUserProfile(prev => prev ? { ...prev, diamonds: prev.diamonds + diamonds } : null);
    };

    const handleFollow = (platform: 'instagram' | 'facebook' | 'x') => {
        const key = platform === 'instagram' ? 'claimedInstagramReward' : platform === 'facebook' ? 'claimedFacebookReward' : 'claimedXReward';
        if (userProfile[key]) return; // Already claimed

        setUserProfile(prev => prev ? { ...prev, diamonds: prev.diamonds + 100, [key]: true } : null);
        // Note: In a real app, you would open the link here, e.g., window.open('https://instagram.com/...', '_blank');
    };

    const diamondPacks = [
        { diamonds: 200, price: 25 },
        { diamonds: 500, price: 40 },
        { diamonds: 1200, price: 80 },
        { diamonds: 3000, price: 150 },
    ];

    const socialRewards = [
        { platform: 'instagram', icon: InstagramIcon, claimed: userProfile.claimedInstagramReward },
        { platform: 'facebook', icon: FacebookIcon, claimed: userProfile.claimedFacebookReward },
        { platform: 'x', icon: XSocialIcon, claimed: userProfile.claimedXReward },
    ];
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-0"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 transform transition-all animate-in fade-in-0 zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Consigue más Diamantes 💎</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        aria-label="Cerrar modal"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Watch Ad */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Recompensa Rápida</h3>
                        <button 
                            onClick={handleWatchAd}
                            disabled={isWatchingAd}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-primary-500 text-white rounded-lg font-bold shadow-md hover:bg-primary-600 transition-colors disabled:bg-primary-400/80 disabled:cursor-not-allowed"
                        >
                            <PlayIcon className="w-6 h-6" />
                            {isWatchingAd ? 'Cargando anuncio...' : 'Ver Anuncio (+25 💎)'}
                        </button>
                    </div>

                    {/* Purchase Diamonds */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Comprar Diamantes</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {diamondPacks.map(pack => (
                                <div key={pack.diamonds} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-center">
                                    <p className="text-2xl font-bold">{pack.diamonds.toLocaleString('en-US')} 💎</p>
                                    <button 
                                        onClick={() => handlePurchase(pack.diamonds)}
                                        className="mt-2 w-full bg-slate-200 dark:bg-slate-600 px-4 py-2 rounded-full font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                                    >
                                        ${pack.price} MXN
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Rewards */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Recompensas Sociales</h3>
                        <div className="space-y-2">
                             {socialRewards.map(social => (
                                <div key={social.platform} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <social.icon className="w-6 h-6" />
                                        <span className="font-semibold capitalize">Seguir en {social.platform}</span>
                                    </div>
                                    <button
                                        onClick={() => handleFollow(social.platform as 'instagram' | 'facebook' | 'x')}
                                        disabled={social.claimed}
                                        className="px-3 py-1 text-sm font-semibold rounded-full transition-colors disabled:bg-green-500 disabled:text-white disabled:cursor-not-allowed bg-primary-500 text-white hover:bg-primary-600"
                                    >
                                        {social.claimed ? 'Reclamado ✓' : 'Seguir (+100 💎)'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiamondModal;
