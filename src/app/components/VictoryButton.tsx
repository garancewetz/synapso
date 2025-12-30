'use client';

interface VictoryButtonProps {
  onClick: () => void;
  variant?: 'fixed' | 'inline';
  position?: 'left' | 'right';
  label?: string;
}

/**
 * Bouton "Noter une victoire" réutilisable
 * 
 * Variantes :
 * - `fixed` : Bouton flottant fixe en bas de l'écran
 * - `inline` : Bouton standard pour intégration dans une page
 */
export default function VictoryButton({ 
  onClick, 
  variant = 'inline',
  position = 'right',
  label = 'Ajouter'
}: VictoryButtonProps) {
  
  if (variant === 'fixed') {
    return (
      <button
        onClick={onClick}
        className={`
          fixed bottom-24 md:bottom-8 z-40
          w-14 h-14 md:w-auto md:h-auto md:px-5 md:py-3
          bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
          rounded-full shadow-lg hover:shadow-xl hover:scale-105
          transition-all duration-200 
          flex items-center justify-center gap-2
          text-amber-950 font-semibold
          active:scale-95
          ${position === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'}
        `}
        aria-label="Noter une victoire"
      >
        <span className="text-xl">🌟</span>
        <span className="hidden md:inline">Noter une victoire</span>
      </button>
    );
  }

  // Variante inline
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2.5
                 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
                 rounded-full shadow-lg hover:shadow-xl hover:scale-105
                 transition-all duration-200 
                 flex items-center justify-center gap-2
                 text-amber-950 font-bold text-sm
                 active:scale-95"
      aria-label="Noter une victoire"
    >
      <span className="text-lg">🌟</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

