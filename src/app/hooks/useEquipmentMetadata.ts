import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';

type EquipmentWithCount = {
  name: string;
  count: number;
};

type UseEquipmentMetadataReturn = {
  equipmentsWithCounts: EquipmentWithCount[];
  equipmentIconsMap: Record<string, string>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook personnalisé pour gérer les métadonnées des équipements
 * Centralise la logique de récupération et de mapping des équipements avec leurs icônes
 */
export function useEquipmentMetadata(): UseEquipmentMetadataReturn {
  const { effectiveUser, loading: userLoading } = useUser();
  const [equipmentsWithCounts, setEquipmentsWithCounts] = useState<EquipmentWithCount[]>([]);
  const [equipmentIconsMap, setEquipmentIconsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetadata = useCallback(async () => {
    // Attendre que l'utilisateur soit chargé
    if (userLoading) {
      return;
    }
    
    // Ne pas charger si pas d'utilisateur effectif
    if (!effectiveUser) {
      setLoading(false);
      setEquipmentsWithCounts([]);
      setEquipmentIconsMap({});
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/metadata', { credentials: 'include' });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Erreur HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Importer dynamiquement les constantes d'équipements pour éviter les dépendances circulaires
      const { getEquipmentIcon } = await import('@/app/constants/equipment.constants');
      
      // Utiliser uniquement les équipements que l'utilisateur a (avec count > 0)
      let allEquipments: EquipmentWithCount[] = [];
      
      if (data.equipmentsWithCounts) {
        // Filtrer pour ne garder que les équipements que l'utilisateur a réellement
        allEquipments = data.equipmentsWithCounts.filter((eq: EquipmentWithCount) => eq.count > 0);
      } else {
        // Fallback si l'API ne retourne pas les compteurs
        const counts: Record<string, number> = {};
        (data.equipments || []).forEach((eq: string) => {
          counts[eq] = 0;
        });
        allEquipments = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .filter(eq => eq.count > 0);
      }
      
      // Trier : d'abord par count décroissant, puis par nom alphabétique
      allEquipments.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.name.localeCompare(b.name);
      });
      
      setEquipmentsWithCounts(allEquipments);
      
      // Créer le mapping d'emojis pour tous les équipements
      const iconsMap: Record<string, string> = {};
      allEquipments.forEach(({ name }) => {
        iconsMap[name] = getEquipmentIcon(name);
      });
      setEquipmentIconsMap(iconsMap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Erreur inconnue lors de la récupération des métadonnées des équipements');
      setError(errorMessage);
      setEquipmentsWithCounts([]);
      setEquipmentIconsMap({});
      console.error('Erreur lors de la récupération des métadonnées des équipements:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [effectiveUser, userLoading]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    equipmentsWithCounts,
    equipmentIconsMap,
    loading: loading || userLoading,
    error,
    refetch: fetchMetadata,
  };
}
