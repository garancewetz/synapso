import { CATEGORY_LABELS, CATEGORY_HREFS } from '@/app/constants/exercice.constants';
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
    return 'Mon parcours';
  }

  // Aphasie
  if (pathname === '/aphasie') {
    return 'Journal d\'aphasie';
  }

  if (pathname === '/aphasie/citations') {
    return 'Mes citations';
  }

  if (pathname === '/aphasie/exercices') {
    return 'Mes exercices';
  }

  if (pathname.startsWith('/aphasie/add')) {
    return 'Ajouter une citation';
  }

  if (pathname.startsWith('/aphasie/edit/')) {
    return 'Modifier une citation';
  }

  if (pathname.startsWith('/aphasie/exercices/add')) {
    return 'Ajouter un exercice';
  }

  if (pathname.startsWith('/aphasie/exercices/edit/')) {
    return 'Modifier un exercice';
  }

  // Exercices
  if (pathname === '/exercice/add') {
    return 'Ajouter un exercice';
  }

  if (pathname.startsWith('/exercice/edit/')) {
    return 'Modifier un exercice';
  }

  // Page équipements
  if (pathname === '/exercices/equipments' || pathname.startsWith('/exercices/equipments')) {
    return 'Filtrer par équipement';
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

