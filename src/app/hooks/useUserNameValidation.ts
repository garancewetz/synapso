import { useState, useCallback } from 'react';

type UseUserNameValidationOptions = {
  /** ID de l'utilisateur actuel (pour exclure lors de la vérification d'unicité lors de l'édition) */
  currentUserId?: number;
  /** Activer la vérification d'unicité via API */
  checkUniqueness?: boolean;
};

type UseUserNameValidationReturn = {
  /** Fonction de validation du nom d'utilisateur */
  validateName: (name: string) => string | null;
  /** Vérifier l'unicité du nom (appel API) */
  checkNameUniqueness: (name: string) => Promise<string | null>;
  /** État de chargement pour la vérification d'unicité */
  isCheckingUniqueness: boolean;
};

const MAX_NAME_LENGTH = 100;

/**
 * Hook pour valider le nom d'utilisateur
 * - Vérifie que le nom ne contient pas d'espaces
 * - Vérifie la longueur maximale
 * - Optionnellement vérifie l'unicité via API
 */
export function useUserNameValidation(
  options: UseUserNameValidationOptions = {}
): UseUserNameValidationReturn {
  const { currentUserId, checkUniqueness = false } = options;
  const [isCheckingUniqueness, setIsCheckingUniqueness] = useState(false);

  /**
   * Valide le nom d'utilisateur (validation locale uniquement)
   * @param name - Le nom à valider
   * @returns Message d'erreur ou null si valide
   */
  const validateName = useCallback((name: string): string | null => {
    const trimmedName = name.trim();

    // Vérifier que le nom n'est pas vide
    if (!trimmedName) {
      return 'Le nom est obligatoire';
    }

    // Vérifier que le nom ne contient pas d'espaces
    if (trimmedName.includes(' ')) {
      return 'Le nom ne peut pas contenir d\'espaces';
    }

    // Vérifier la longueur maximale
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return `Le nom ne peut pas dépasser ${MAX_NAME_LENGTH} caractères`;
    }

    return null;
  }, []);

  /**
   * Vérifie l'unicité du nom d'utilisateur via API
   * @param name - Le nom à vérifier
   * @returns Message d'erreur ou null si le nom est disponible
   */
  const checkNameUniqueness = useCallback(
    async (name: string): Promise<string | null> => {
      if (!checkUniqueness) {
        return null;
      }

      const trimmedName = name.trim();
      
      // Validation locale d'abord
      const localError = validateName(trimmedName);
      if (localError) {
        return localError;
      }

      setIsCheckingUniqueness(true);
      try {
        // Si on est en mode édition, vérifier via l'API de modification
        if (currentUserId) {
          const response = await fetch(`/api/users/${currentUserId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: trimmedName }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            return errorData.error || 'Ce nom est déjà utilisé';
          }
        } else {
          // En mode création, on ne peut pas vérifier directement via l'API register
          // car elle nécessite aussi le mot de passe. On retourne null ici.
          // La vérification se fera lors de la soumission du formulaire.
          return null;
        }
      } catch (error) {
        console.error('Erreur lors de la vérification d\'unicité:', error);
        return 'Erreur lors de la vérification du nom';
      } finally {
        setIsCheckingUniqueness(false);
      }

      return null;
    },
    [checkUniqueness, currentUserId, validateName]
  );

  return {
    validateName,
    checkNameUniqueness,
    isCheckingUniqueness,
  };
}

