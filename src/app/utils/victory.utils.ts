import { VICTORY_TAGS, VICTORY_TAGS_WITH_EMOJI } from '@/app/constants/victory.constants';

/**
 * Extrait les victory tags du contenu et retourne le contenu nettoyé + les tags trouvés
 * 
 * @param content - Le contenu de la victoire
 * @returns Un objet avec le contenu nettoyé et les tags trouvés
 */
export function extractVictoryTags(content: string): { cleanContent: string; tags: Array<{ label: string; emoji: string }> } {
  let cleanContent = content;
  const foundTags: Array<{ label: string; emoji: string }> = [];

  VICTORY_TAGS.forEach(({ label, emoji }) => {
    if (VICTORY_TAGS_WITH_EMOJI.includes(label as typeof VICTORY_TAGS_WITH_EMOJI[number])) {
      const tagPattern = `${emoji}${label}${emoji}`;
      // Créer une regex pour retirer le tag même s'il est entouré d'espaces
      const regex = new RegExp(`\\s*${tagPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
      if (content.includes(tagPattern)) {
        foundTags.push({ label, emoji });
        cleanContent = cleanContent.replace(regex, ' ').replace(/\s+/g, ' ').trim();
      }
    } else {
      // Pour Confort, chercher juste le label avec regex pour retirer même s'il est entouré d'espaces
      const regex = new RegExp(`\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
      if (content.includes(label)) {
        foundTags.push({ label, emoji });
        cleanContent = cleanContent.replace(regex, ' ').replace(/\s+/g, ' ').trim();
      }
    }
  });

  return { cleanContent, tags: foundTags };
}

