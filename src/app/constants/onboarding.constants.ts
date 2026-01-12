import type { OnboardingSlide } from '@/app/types/onboarding';

// ============================================================================
// CONSTANTES POUR L'ONBOARDING
// ============================================================================

/**
 * Slides de base de l'onboarding (toujours affichées)
 */
const BASE_SLIDES: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Bienvenue dans Synapso !',
    content: 'Ton compagnon de rééducation au quotidien.',
    visual: 'welcome',
  },
  {
    id: 'exercices',
    title: 'Tes exercices par zones',
    content: 'Organise tes exercices en 4 catégories : Haut du corps, Milieu, Bas, et Étirements.',
    visual: 'categories',
  },
  {
    id: 'add-exercice',
    title: 'Ajoute tes exercices',
    content: 'Tu peux ajouter un exercice depuis le menu ou directement depuis une catégorie.',
    visual: 'add-exercice',
  },
  {
    id: 'completion',
    title: 'Marque tes exercices comme faits',
    content: 'Quand tu as terminé un exercice, clique sur "Fait aujourd\'hui".',
    visual: 'completion',
  },
  {
    id: 'progress',
    title: 'Note tes progrès',
    content: 'Le bouton flottant en bas de certaines pages te permet de noter un progrès à tout moment.',
    visual: 'progress',
  },
];

/**
 * Slide aphasie (affichée uniquement si l'utilisateur est aphasique)
 */
const APHASIE_SLIDE: OnboardingSlide = {
  id: 'aphasie',
  title: 'Ton journal d\'aphasie',
  content: 'Note tes erreurs de langage et pratique avec les exercices d\'orthophonie. Le micro 🎤 te permet de dicter au lieu de taper.',
  visual: 'aphasie',
};

/**
 * Slides finales de l'onboarding (toujours affichées)
 */
const FINAL_SLIDES: OnboardingSlide[] = [
  {
    id: 'settings',
    title: 'Personnalise ton expérience',
    content: 'Dans l\'onglet "Profil" ou le menu, tu peux modifier tes réglages à tout moment.',
    visual: 'settings',
  },
  {
    id: 'history',
    title: 'Consulte ton parcours',
    content: 'Dans l\'onglet "Parcours", découvre ta progression et tes statistiques.',
    visual: 'history',
  },
  {
    id: 'ready',
    title: 'Tu es prêt-e !',
    content: 'Tout est en place pour commencer.',
    visual: 'celebration',
  },
];

/**
 * Génère la liste complète des slides d'onboarding selon le profil utilisateur
 * @param isAphasic - Si true, inclut la slide aphasie
 * @returns Liste des slides à afficher
 */
export function getOnboardingSlides(isAphasic: boolean): OnboardingSlide[] {
  const slides: OnboardingSlide[] = [...BASE_SLIDES];

  // Ajouter la slide aphasie si l'utilisateur est aphasique
  if (isAphasic) {
    slides.push(APHASIE_SLIDE);
  }

  // Ajouter les slides finales
  slides.push(...FINAL_SLIDES);

  return slides;
}

