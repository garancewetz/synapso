// ============================================================================
// ÉQUIPEMENTS - Configuration des icônes pour les équipements
// ============================================================================

// Mapping de référence des emojis pour les équipements
// Basé sur les équipements réellement utilisés dans le projet
export const EQUIPMENT_ICONS: Record<string, string> = {
  'Lit/Tapis': '🛏️', // Terme unifié pour Lit et Tapis (surface d'appui similaire)
  'Rambarde': '🏋️',
  'Stepper': '🪜',
  'Sangle': '🎗️',
  'Chaise': '🪑',
  'Bâton': '🏋️',
  'Porte': '🚪',
  'Escaliers': '🪜',
  'Table': '🍱',
} as const;

// Icône par défaut pour les équipements sans icône spécifique
export const DEFAULT_EQUIPMENT_ICON = '🏋️';

// Helper pour obtenir l'icône d'un équipement (avec fallback)
export function getEquipmentIcon(equipmentName: string): string {
  return EQUIPMENT_ICONS[equipmentName] || DEFAULT_EQUIPMENT_ICON;
}
