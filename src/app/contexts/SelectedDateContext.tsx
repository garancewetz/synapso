'use client';

import { createContext, useContext, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format, startOfDay } from 'date-fns';
import { isToday } from 'date-fns';
import { validateDateKey } from '@/app/utils/dateValidation.utils';

type SelectedDateContextType = {
  selectedDate: Date | null;
  selectedDateKey: string | null; // Clé stable (yyyy-MM-dd) pour réactivité
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  isDateSelected: boolean;
  isTimeMachineMode: boolean; // Mode sablier actif (date passée)
  isTransitioning: boolean; // Indique qu'une transition est en cours (pour retarder le changement de vue)
  transitionType: 'enter' | 'exit' | null; // Type de transition en cours
};

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined);

export function SelectedDateProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'enter' | 'exit' | null>(null);
  
  // ⚡ URL-BASED: Lire la date depuis l'URL (paramètre `date` au format yyyy-MM-dd)
  const dateParam = searchParams.get('date');
  
  // ⚡ URL-BASED: Valider et normaliser la date depuis l'URL
  const selectedDateKey = useMemo(() => {
    const validDateKey = validateDateKey(dateParam);
    
    // Si la date est invalide, nettoyer l'URL
    if (dateParam && !validDateKey) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      return null;
    }
    
    return validDateKey;
  }, [dateParam, pathname, router, searchParams]);

  // ⚡ SIMPLIFICATION: Créer la date normalisée directement (useMemo gère déjà la mémorisation)
  const normalizedSelectedDate = useMemo(() => {
    if (!selectedDateKey) return null;
    return new Date(selectedDateKey + 'T00:00:00');
  }, [selectedDateKey]);

  // Mode sablier actif si date sélectionnée et passée (pas aujourd'hui)
  const isTimeMachineMode = useMemo(() => {
    if (!normalizedSelectedDate) return false;
    return !isToday(normalizedSelectedDate);
  }, [normalizedSelectedDate]);

  // ⚡ URL-BASED: setSelectedDate met à jour l'URL au lieu du state
  const setSelectedDate = useCallback((date: Date | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (date) {
      // Normaliser la date avant de la stocker
      const normalized = startOfDay(date);
      const dateKey = format(normalized, 'yyyy-MM-dd');
      
      // Valider la date avant de l'ajouter à l'URL
      const validDateKey = validateDateKey(dateKey);
      if (!validDateKey) {
        console.warn(`Date invalide pour le mode sablier: ${date.toISOString()}`);
        return;
      }
      
      // Mettre à jour l'URL avec le paramètre date
      params.set('date', validDateKey);
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
    } else {
      // Supprimer le paramètre date de l'URL
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.push(newUrl);
    }
  }, [pathname, router, searchParams]);

  // ⚡ URL-BASED: clearSelectedDate supprime le paramètre date de l'URL
  const clearSelectedDate = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  }, [pathname, router, searchParams]);

  // ⚡ NETTOYAGE: Réinitialiser la date sélectionnée quand l'utilisateur change
  useEffect(() => {
    const handleUserChanged = () => {
      // Supprimer le paramètre date de l'URL quand l'utilisateur change
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    };

    window.addEventListener('user-changed', handleUserChanged);
    return () => {
      window.removeEventListener('user-changed', handleUserChanged);
    };
  }, [pathname, router, searchParams]);

  // ⚡ PERFORMANCE: Mémoriser isDateSelected pour éviter les recalculs
  const isDateSelected = useMemo(() => normalizedSelectedDate !== null, [normalizedSelectedDate]);

  // ⚡ SIMPLIFICATION: Détecter les transitions de manière plus simple
  const previousIsTimeMachineMode = useRef(isTimeMachineMode);
  
  useEffect(() => {
    const wasTimeMachineMode = previousIsTimeMachineMode.current;
    const isNowTimeMachineMode = isTimeMachineMode;
    
    // Détecter l'entrée en mode sablier
    if (!wasTimeMachineMode && isNowTimeMachineMode) {
      setTransitionType('enter');
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionType(null);
      }, 1500);
      previousIsTimeMachineMode.current = isNowTimeMachineMode;
      return () => clearTimeout(timer);
    }
    
    // Détecter la sortie du mode sablier
    if (wasTimeMachineMode && !isNowTimeMachineMode) {
      setTransitionType('exit');
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionType(null);
      }, 1500);
      previousIsTimeMachineMode.current = isNowTimeMachineMode;
      return () => clearTimeout(timer);
    }
    
    // Mettre à jour la référence
    previousIsTimeMachineMode.current = isNowTimeMachineMode;
  }, [isTimeMachineMode]);

  // ⚡ PERFORMANCE: Mémoriser la valeur du context pour éviter les re-renders en boucle
  const contextValue = useMemo<SelectedDateContextType>(() => ({
    selectedDate: normalizedSelectedDate,
    selectedDateKey,
    setSelectedDate,
    clearSelectedDate,
    isDateSelected,
    isTimeMachineMode,
    isTransitioning,
    transitionType,
  }), [normalizedSelectedDate, selectedDateKey, setSelectedDate, clearSelectedDate, isDateSelected, isTimeMachineMode, isTransitioning, transitionType]);

  return (
    <SelectedDateContext.Provider value={contextValue}>
      {children}
    </SelectedDateContext.Provider>
  );
}

export function useSelectedDate() {
  const context = useContext(SelectedDateContext);
  if (context === undefined) {
    throw new Error('useSelectedDate must be used within a SelectedDateProvider');
  }
  return context;
}
