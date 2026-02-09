'use client';

import { createContext, useContext, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { subDays, isBefore, isAfter, format, startOfDay, parse, isValid } from 'date-fns';
import { isToday } from 'date-fns';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';

type SelectedDateContextType = {
  selectedDate: Date | null;
  selectedDateKey: string | null; // Clé stable (yyyy-MM-dd) pour réactivité
  debouncedSelectedDateKey: string | null; // Pour calculs coûteux (debounced)
  setSelectedDate: (date: Date | null) => void;
  clearSelectedDate: () => void;
  isDateSelected: boolean;
  isTimeMachineMode: boolean; // Mode sablier actif (date passée)
  isTransitioning: boolean; // Indique qu'une transition est en cours (pour retarder le changement de vue)
};

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined);

export function SelectedDateProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousDateKeyRef = useRef<string | null>(null);
  const previousDateParamRef = useRef<string | null>(null);
  
  // ⚡ URL-BASED: Lire la date depuis l'URL (paramètre `date` au format yyyy-MM-dd)
  const dateParam = searchParams.get('date');
  
  // ⚡ FIX: Stocker la dernière valeur valide de dateParam pour éviter les faux positifs lors de la navigation
  useEffect(() => {
    if (dateParam) {
      previousDateParamRef.current = dateParam;
    }
  }, [dateParam]);
  
  // ⚡ PERFORMANCE: Clé stable basée sur la date depuis l'URL
  // Valider et normaliser la date depuis l'URL
  const selectedDateKey = useMemo(() => {
    if (!dateParam) return null;
    
    // Valider le format (yyyy-MM-dd)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateParam)) {
      // Format invalide, nettoyer l'URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      return null;
    }
    
    // Valider que la date est valide et dans les limites
    const parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date());
    if (!isValid(parsedDate)) {
      // Date invalide, nettoyer l'URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      return null;
    }
    
    // ⚡ VALIDATION: Vérifier que la date n'est pas dans le futur
    const today = startOfDay(new Date());
    if (isAfter(parsedDate, today)) {
      // Date dans le futur, nettoyer l'URL (on ne peut pas voyager vers le futur)
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      return null;
    }
    
    // ⚡ VALIDATION: Vérifier si la date est trop ancienne (plus de 28 jours)
    const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
    if (isBefore(parsedDate, minAllowedDate)) {
      // Date trop ancienne, nettoyer l'URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('date');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
      return null;
    }
    
    return dateParam;
  }, [dateParam, pathname, router, searchParams]);
  
  // ⚡ PERFORMANCE: Debouncing séparé pour les calculs coûteux (UI immédiate, calculs debounced)
  const [debouncedSelectedDateKey, setDebouncedSelectedDateKey] = useState<string | null>(selectedDateKey);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSelectedDateKey(selectedDateKey);
    }, 100); // 100ms de debounce pour les changements rapides
    return () => clearTimeout(timer);
  }, [selectedDateKey]);

  // ⚡ PERFORMANCE: Stocker la date normalisée dans un ref pour éviter les re-créations
  // On ne recrée l'objet Date que si la clé change réellement
  const normalizedSelectedDateRef = useRef<Date | null>(null);
  const normalizedSelectedDate = useMemo(() => {
    if (!selectedDateKey) {
      normalizedSelectedDateRef.current = null;
      return null;
    }
    // Si la clé n'a pas changé, réutiliser la même référence
    if (normalizedSelectedDateRef.current && 
        format(startOfDay(normalizedSelectedDateRef.current), 'yyyy-MM-dd') === selectedDateKey) {
      return normalizedSelectedDateRef.current;
    }
    // Sinon, créer un nouvel objet Date depuis la clé (plus rapide)
    const date = new Date(selectedDateKey + 'T00:00:00');
    normalizedSelectedDateRef.current = date;
    return date;
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
      // ⚡ VALIDATION: Vérifier que la date n'est pas dans le futur
      const today = startOfDay(new Date());
      const normalizedDate = startOfDay(date);
      if (isAfter(normalizedDate, today)) {
        console.warn(`Date dans le futur pour le mode sablier: ${date.toISOString()}. On ne peut pas voyager vers le futur.`);
        return; // Ne pas définir la date si dans le futur
      }
      
      // ⚡ VALIDATION: Vérifier si la date est trop ancienne (plus de 28 jours)
      const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
      if (isBefore(normalizedDate, minAllowedDate)) {
        console.warn(`Date trop ancienne pour le mode sablier: ${date.toISOString()}. Limite: ${MAX_TIME_MACHINE_DAYS} jours`);
        return; // Ne pas définir la date si trop ancienne
      }
      
      // Normaliser la date avant de la stocker (sans heures/minutes/secondes)
      const normalized = new Date(date);
      normalized.setHours(0, 0, 0, 0);
      const dateKey = format(startOfDay(normalized), 'yyyy-MM-dd');
      
      // Mettre à jour l'URL avec le paramètre date
      params.set('date', dateKey);
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

  // ⚡ FIX: Détecter quand on passe en mode sablier ou qu'on en sort pour déclencher la transition
  useEffect(() => {
    // ⚡ FIX: Utiliser la dernière valeur valide de dateParam stockée dans le ref
    // pour éviter les faux positifs lors de la navigation (searchParams peut être temporairement vide)
    const effectiveDateParam = dateParam || previousDateParamRef.current;
    const hasDateParam = effectiveDateParam !== null && effectiveDateParam !== '';
    const currentDateKey = isTimeMachineMode && selectedDateKey ? selectedDateKey : null;
    const wasInTimeMachine = previousDateKeyRef.current !== null;
    const isEnteringTimeMachine = !previousDateKeyRef.current && currentDateKey && hasDateParam;
    
    // ⚡ FIX: Ne déclencher la sortie que si le paramètre date a vraiment disparu de l'URL
    // Vérifier directement dans window.location.search pour éviter les faux positifs lors de la navigation
    let isExitingTimeMachine = false;
    if (wasInTimeMachine && !dateParam) {
      // Vérifier directement dans l'URL réelle (pas searchParams qui peut être temporairement vide)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlDateParam = urlParams.get('date');
        // Si le paramètre date n'existe vraiment pas dans l'URL, alors on sort du mode sablier
        isExitingTimeMachine = !urlDateParam || urlDateParam === '';
      } else {
        // En SSR, se fier à dateParam
        isExitingTimeMachine = true;
      }
    }
    
    // Si on entre en mode sablier, déclencher la transition
    if (isEnteringTimeMachine) {
      setIsTransitioning(true);
      // La transition durera 1.5 secondes (durée de l'animation d'entrée)
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        previousDateKeyRef.current = currentDateKey;
        if (dateParam) {
          previousDateParamRef.current = dateParam;
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // ⚡ NOUVEAU: Si on sort du mode sablier, déclencher la transition de sortie
    if (isExitingTimeMachine) {
      setIsTransitioning(true);
      // La transition de sortie durera 1.5 secondes (durée de l'animation de sortie)
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        previousDateKeyRef.current = null;
        previousDateParamRef.current = null;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Mettre à jour la référence si on change de date (mais toujours en mode sablier)
    if (currentDateKey !== previousDateKeyRef.current && !isTransitioning && currentDateKey && hasDateParam) {
      previousDateKeyRef.current = currentDateKey;
      if (dateParam) {
        previousDateParamRef.current = dateParam;
      }
    }
  }, [isTimeMachineMode, selectedDateKey, dateParam, isTransitioning]);

  // ⚡ PERFORMANCE: Mémoriser la valeur du context pour éviter les re-renders en boucle
  const contextValue = useMemo<SelectedDateContextType>(() => ({
    selectedDate: normalizedSelectedDate,
    selectedDateKey, // Immédiat pour UI
    debouncedSelectedDateKey, // Pour calculs coûteux (debounced)
    setSelectedDate,
    clearSelectedDate,
    isDateSelected,
    isTimeMachineMode,
    isTransitioning,
  }), [normalizedSelectedDate, selectedDateKey, debouncedSelectedDateKey, setSelectedDate, clearSelectedDate, isDateSelected, isTimeMachineMode, isTransitioning]);

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
