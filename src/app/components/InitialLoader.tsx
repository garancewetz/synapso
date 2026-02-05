'use client';

import { useState, useCallback, useRef } from 'react';
import { ConfettiExplosion } from './ConfettiExplosion';

type Explosion = {
  id: number;
  timestamp: number;
};

export function InitialLoader() {
  const [activeExplosions, setActiveExplosions] = useState<Explosion[]>([]);
  const lastClickTime = useRef(0);
  const explosionIdRef = useRef(0);
  const COOLDOWN_MS = 500; // 0.5 seconde entre chaque clic
  const EXPLOSION_DURATION = 4000; // Durée de l'explosion en ms

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    // Limiter la fréquence des clics à 1 toutes les 0.5 secondes
    if (now - lastClickTime.current < COOLDOWN_MS) {
      return;
    }
    lastClickTime.current = now;
    
    // Créer une nouvelle explosion
    const newExplosion: Explosion = {
      id: explosionIdRef.current++,
      timestamp: now,
    };
    
    setActiveExplosions(prev => [...prev, newExplosion]);
    
    // Supprimer l'explosion après sa durée
    setTimeout(() => {
      setActiveExplosions(prev => prev.filter(exp => exp.id !== newExplosion.id));
    }, EXPLOSION_DURATION);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8FAFB] z-[9999]">
      {/* Explosions de confettis - toutes s'accumulent */}
      {activeExplosions.map((explosion) => (
        <ConfettiExplosion 
          key={explosion.id}
          show={true} 
          centerX={50} 
          centerY={50}
          confettiCount={50}
        />
      ))}
      
      <div className="relative flex flex-col items-center gap-8">
        {/* Particules qui tournent autour comme des planètes - 4 couleurs des catégories */}
        {/* Placées en arrière-plan pour passer derrière le texte */}
        <div className="absolute top-[64px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 animate-[rotate_8s_linear_infinite] z-0">
          {/* Orange - Haut du corps */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-orange-400 opacity-60 shadow-sm" />
          {/* Teal - Milieu du corps */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-teal-400 opacity-60 shadow-sm" />
          {/* Bleu - Bas du corps */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full bg-blue-400 opacity-60 shadow-sm" />
          {/* Violet - Étirement */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-purple-400 opacity-60 shadow-sm" />
        </div>

        {/* Orbite avec trait gris clair */}
        <div className="absolute top-[64px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-gray-200/40 z-0" />

        {/* Logo animé - cliquable */}
        <div 
          className="relative w-32 h-32 cursor-pointer active:scale-95 transition-all duration-200 hover:scale-110 group animate-[gentlePulse_3s_ease-in-out_infinite] z-10"
          onClick={handleLogoClick}
          onTouchStart={handleLogoClick}
          role="button"
          aria-label="Cliquez pour une explosion de confettis"
          tabIndex={0}
        >
          {/* Cercle de fond avec effet de glow - plus visible au hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-white opacity-60 animate-[breathe_3s_ease-in-out_infinite] group-hover:opacity-90 group-hover:from-indigo-300 group-hover:to-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-300" />
          
          {/* Anneau de pulsation au hover */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-300 opacity-0 group-hover:opacity-70 group-hover:animate-[pulseRing_2s_ease-in-out_infinite] transition-opacity duration-300" />
          
          {/* Effet de brillance qui passe sur le logo */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] transition-transform duration-1500" />
          </div>
          
          {/* SVG du cerveau */}
          <svg 
            viewBox="0 0 100 100" 
            className="relative w-full h-full drop-shadow-sm"
            role="img"
            aria-label="Chargement de Synapso"
          >
            <defs>
              <clipPath id="clipBrain">
                <path d="M50 6 C71 6 90 23 90 46 C90 70 73 92 50 92 C27 92 10 70 10 46 C10 23 29 6 50 6 Z"/>
              </clipPath>
              
              {/* Gradient pour la moitié gauche */}
              <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1F2937" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
            </defs>

            {/* Moitié gauche */}
            <g clipPath="url(#clipBrain)">
              <rect x="0" y="0" width="50" height="100" fill="url(#leftGradient)" />
              {/* Moitié droite avec effet subtil */}
              <rect x="50" y="0" width="50" height="100" fill="#F3F4F6" />
            </g>

            {/* Contour avec pulsation - plus visible au hover */}
            <path 
              d="M50 6 C71 6 90 23 90 46 C90 70 73 92 50 92 C27 92 10 70 10 46 C10 23 29 6 50 6 Z"
              fill="none" 
              stroke="#1F2937" 
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-[pulseStroke_2s_ease-in-out_infinite] group-hover:stroke-indigo-600 group-hover:strokeWidth-2 transition-all duration-300"
            />
            
          </svg>
        </div>

        {/* Nom de l'app avec effet de révélation - au premier plan */}
        <div className="relative flex flex-col items-center gap-2 z-20">
          <h1 className="text-2xl font-semibold tracking-wide text-gray-700 animate-[fadeIn_1s_ease-out]">
            Synapso
          </h1>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.7;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulseStroke {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes pulseRing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.3;
          }
        }

        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}

