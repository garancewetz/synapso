import { PROGRESS_TAGS, PROGRESS_TAGS_WITH_EMOJI } from '@/app/constants/progress.constants';
import { CATEGORY_ICONS, CATEGORY_ORDER, CATEGORY_LABELS_SHORT, CATEGORY_CHART_COLORS } from '@/app/constants/exercice.constants';
import { CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { ORTHOPHONIE_PROGRESS_EMOJI } from '@/app/constants/emoji.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

/**
 * Extrait les progress tags du contenu et retourne le contenu nettoyé + les tags trouvés
 * 
 * @param content - Le contenu du progrès
 * @returns Un objet avec le contenu nettoyé et les tags trouvés
 */
export function extractProgressTags(content: string): { cleanContent: string; tags: Array<{ label: string; emoji: string }> } {
  let cleanContent = content;
  const foundTags: Array<{ label: string; emoji: string }> = [];

  PROGRESS_TAGS.forEach(({ label, emoji }) => {
    if (PROGRESS_TAGS_WITH_EMOJI.includes(label as typeof PROGRESS_TAGS_WITH_EMOJI[number])) {
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

/**
 * Extrait la catégorie d'exercice à partir de l'emoji d'un progrès
 * 
 * @param emoji - L'emoji du progrès (peut être null)
 * @returns La catégorie d'exercice si trouvée, null sinon
 */
export function getExerciceCategoryFromEmoji(emoji: string | null | undefined): ExerciceCategory | null {
  if (!emoji) return null;
  
  return CATEGORY_ORDER.find(
    (cat) => CATEGORY_ICONS[cat] === emoji
  ) as ExerciceCategory | undefined || null;
}

/**
 * Détermine si un progrès est de type orthophonie
 * 
 * @param emoji - L'emoji du progrès (peut être null)
 * @returns true si c'est un progrès orthophonie
 */
export function isOrthophonieProgress(emoji: string | null | undefined): boolean {
  return emoji === ORTHOPHONIE_PROGRESS_EMOJI;
}

/**
 * Calcule les badges pour un progrès (type Ortho/Physique et catégorie d'exercice)
 * 
 * @param emoji - L'emoji du progrès
 * @returns Un objet contenant les informations des badges
 */
export function getProgressBadges(emoji: string | null | undefined) {
  const isOrthophonie = isOrthophonieProgress(emoji);
  const exerciceCategory = getExerciceCategoryFromEmoji(emoji);

  const typeBadge = {
    emoji: isOrthophonie ? CATEGORY_EMOJIS.ORTHOPHONIE : CATEGORY_EMOJIS.PHYSIQUE,
    label: isOrthophonie ? 'Ortho' : 'Physique',
    color: '#f97316', // Couleur orange pour la bande latérale
  };

  const categoryBadge = exerciceCategory ? {
    emoji: CATEGORY_ICONS[exerciceCategory],
    label: CATEGORY_LABELS_SHORT[exerciceCategory],
    color: CATEGORY_CHART_COLORS[exerciceCategory],
  } : null;

  return {
    typeBadge,
    categoryBadge,
    exerciceCategory,
  };
}

