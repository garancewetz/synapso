import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { getEquipmentIcon } from '@/app/constants/equipment.constants';

type UseAllEquipmentsReturn = {
  equipments: string[];
  equipmentIconsMap: Record<string, string>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook personnalisé pour récupérer tous les équipements de la base de données
 * (tous les utilisateurs confondus)
 */
export function useAllEquipments(): UseAllEquipmentsReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const [equipments, setEquipments] = useState<string[]>([]);
  const [equipmentIconsMap, setEquipmentIconsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEquipments = useCallback(async () => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }
    
    // Ne pas charger si pas d'utilisateur effectif
    if (!effectiveUser) {
      setLoading(false);
      setEquipments([]);
      setEquipmentIconsMap({});
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/equipments', { credentials: 'include' });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Erreur HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      const allEquipments = data.equipments || [];
      setEquipments(allEquipments);
      
      // Créer le mapping d'emojis pour tous les équipements
      const iconsMap: Record<string, string> = {};
      allEquipments.forEach((name: string) => {
        iconsMap[name] = getEquipmentIcon(name);
      });
      setEquipmentIconsMap(iconsMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erreur inconnue lors de la récupération des équipements');
      setError(errorMessage);
      setEquipments([]);
      setEquipmentIconsMap({});
      console.error('Erreur lors de la récupération des équipements:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  return {
    equipments,
    equipmentIconsMap,
    loading: loading || userLoading,
    error,
    refetch: fetchEquipments,
  };
}

