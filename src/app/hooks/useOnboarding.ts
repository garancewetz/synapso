'use client';

import { useState, useEffect, useCallback } from 'react';

const ONBOARDING_STORAGE_KEY = 'synapso_onboarding_seen';

type OnboardingState = {
  hasSeenOnboarding: boolean;
  showOnboarding: boolean;
};

/**
 * Hook pour gérer l'état de l'onboarding
 * - Stocke dans localStorage si l'onboarding a été vu
 * - Permet d'afficher/masquer l'onboarding manuellement
 */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    hasSeenOnboarding: false,
    showOnboarding: false,
  });

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setState({
      hasSeenOnboarding: hasSeen,
      showOnboarding: false,
    });
  }, []);

  // Marquer l'onboarding comme vu
  const markAsSeen = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setState({
      hasSeenOnboarding: true,
      showOnboarding: false,
    });
  }, []);

  // Ouvrir l'onboarding (pour réconsultation)
  const openOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      showOnboarding: true,
    }));
  }, []);

  // Fermer l'onboarding
  const closeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      showOnboarding: false,
    }));
  }, []);

  // Vérifier si on doit afficher l'onboarding automatiquement (première création)
  const shouldShowOnboarding = useCallback((isNewUser: boolean) => {
    if (!isNewUser) return false;
    const hasSeen = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    return !hasSeen;
  }, []);

  return {
    hasSeenOnboarding: state.hasSeenOnboarding,
    showOnboarding: state.showOnboarding,
    markAsSeen,
    openOnboarding,
    closeOnboarding,
    shouldShowOnboarding,
  };
}

