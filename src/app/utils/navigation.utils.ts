import { CATEGORY_LABELS, CATEGORY_HREFS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { JOURNAL_EMOJI, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import type { ExerciceCategory } from '@/app/types/exercice';

/**
 * Obtient le nom de la page actuelle basé sur le pathname
 * Utilise un langage simple et clair (FALC) pour les personnes ayant subi un AVC
 */
export function getCurrentPageName(pathname: string): string | null {
  // Page d'accueil
  if (pathname === '/') {
    return 'Accueil';
  }

  // Catégories d'exercices
  for (const category of Object.keys(CATEGORY_HREFS) as ExerciceCategory[]) {
    if (pathname === CATEGORY_HREFS[category]) {
      return CATEGORY_LABELS[category];
    }
  }

  // Historique
  if (pathname === '/historique') {
    return 'Ma progression';
  }

  // Journal
  if (pathname === '/journal') {
    return 'Journal';
  }

  if (pathname === '/journal/notes') {
    return 'Mes notes';
  }

  if (pathname === '/journal/tasks') {
    return 'Mes tâches';
  }

  if (pathname === '/journal/notes/add') {
    return 'Ajouter une note';
  }

  if (pathname.startsWith('/journal/notes/edit/')) {
    return 'Modifier une note';
  }

  if (pathname === '/journal/tasks/add') {
    return 'Ajouter une tâche';
  }

  if (pathname.startsWith('/journal/tasks/edit/')) {
    return 'Modifier une tâche';
  }

  // Exercices
  if (pathname === '/exercice/add') {
    return 'Ajouter un exercice';
  }

  if (pathname.startsWith('/exercice/edit/')) {
    return 'Modifier un exercice';
  }

  // Page vue globale
  if (pathname === '/exercices/all' || pathname.startsWith('/exercices/all')) {
    return 'Vue globale';
  }

  // Pages d'exercices par catégorie - extraire la catégorie de l'URL
  const categoryMatch = pathname.match(/^\/exercices\/([^\/]+)$/);
  if (categoryMatch) {
    const categoryParam = categoryMatch[1];
    // Convertir "upper_body" en "UPPER_BODY"
    const categoryKey = categoryParam.toUpperCase().replace(/-/g, '_') as ExerciceCategory;
    if (categoryKey in CATEGORY_LABELS) {
      return CATEGORY_LABELS[categoryKey];
    }
  }

  // Paramètres
  if (pathname === '/settings') {
    return 'Mon profil';
  }

  // Page non reconnue
  return null;
}

/**
 * Obtient l'emoji associé à une page basé sur le pathname
 * Retourne null si aucun emoji n'est défini pour cette page
 */
export function getPageEmoji(pathname: string): string | null {
  // Page d'accueil
  if (pathname === '/') {
    return NAVIGATION_EMOJIS.HOME;
  }

  // Catégories d'exercices
  for (const category of Object.keys(CATEGORY_HREFS) as ExerciceCategory[]) {
    if (pathname === CATEGORY_HREFS[category]) {
      return CATEGORY_ICONS[category];
    }
  }

  // Historique
  if (pathname === '/historique') {
    return NAVIGATION_EMOJIS.ROCKET;
  }

  // Journal
  if (pathname === '/journal') {
    return JOURNAL_EMOJI;
  }

  if (pathname === '/journal/notes') {
    return JOURNAL_EMOJI;
  }

  if (pathname === '/journal/tasks') {
    return JOURNAL_EMOJI;
  }

  if (pathname === '/journal/notes/add') {
    return JOURNAL_EMOJI;
  }

  if (pathname.startsWith('/journal/notes/edit/')) {
    return JOURNAL_EMOJI;
  }

  if (pathname === '/journal/tasks/add') {
    return JOURNAL_EMOJI;
  }

  if (pathname.startsWith('/journal/tasks/edit/')) {
    return JOURNAL_EMOJI;
  }

  // Pages d'exercices par catégorie - extraire la catégorie de l'URL
  const categoryMatch = pathname.match(/^\/exercices\/([^\/]+)$/);
  if (categoryMatch) {
    const categoryParam = categoryMatch[1];
    // Convertir "upper_body" en "UPPER_BODY"
    const categoryKey = categoryParam.toUpperCase().replace(/-/g, '_') as ExerciceCategory;
    if (categoryKey in CATEGORY_ICONS) {
      return CATEGORY_ICONS[categoryKey];
    }
  }

  // Page non reconnue
  return null;
}

