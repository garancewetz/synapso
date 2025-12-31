import { useUser } from '@/app/contexts/UserContext';
import { cn } from '@/app/utils/cn';

/**
 * Hook pour gérer la préférence de main de l'utilisateur
 * Centralise la logique d'adaptation de l'interface selon la préférence
 * 
 * @returns Helpers pour adapter les classes CSS selon la préférence de main
 */
export function useHandPreference() {
  const { currentUser } = useUser();
  const isLeftHanded = currentUser?.dominantHand === 'LEFT';

  /**
   * Retourne les classes pour un flex container selon la préférence
   * Adapté sur mobile ET desktop
   */
  const getFlexClasses = (baseClasses: string = 'flex items-center') => {
    return cn(
      baseClasses,
      isLeftHanded 
        ? 'flex-row-reverse justify-start'
        : 'justify-between'
    );
  };

  /**
   * Retourne les classes pour la position du menu drawer
   * Adapté sur mobile ET desktop
   */
  const getMenuPositionClasses = (isOpen: boolean) => {
    if (isLeftHanded) {
      return cn(
        'left-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      );
    }
    return cn(
      'right-0',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    );
  };

  /**
   * Retourne les classes pour justifier le contenu
   * Adapté sur mobile ET desktop
   */
  const getJustifyClasses = () => {
    return isLeftHanded 
      ? 'justify-start'
      : 'justify-end';
  };

  return {
    isLeftHanded,
    getFlexClasses,
    getMenuPositionClasses,
    getJustifyClasses,
  };
}

