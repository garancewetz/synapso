/**
 * Utilitaires pour l'accessibilité et la gestion du focus
 */

import { FOCUSABLE_SELECTORS } from '@/app/constants/accessibility.constants';

/**
 * Vérifie si un élément est focusable selon les standards d'accessibilité
 * @param element - L'élément HTML à vérifier
 * @returns true si l'élément est focusable, false sinon
 */
export function isFocusable(element: HTMLElement): boolean {
  // Vérifier si l'élément existe
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  // Vérifier l'attribut inert (HTML5.1)
  if (element.hasAttribute('inert')) {
    return false;
  }

  // Vérifier le tabIndex calculé (plus fiable que l'attribut)
  // Cela inclut déjà la vérification de l'attribut tabindex="-1"
  if (element.tabIndex === -1) {
    return false;
  }

  // Vérifier aria-disabled
  if (element.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  // Vérifier si l'élément est caché
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }

  // Vérifier si l'élément est dans un conteneur caché
  // Note: getComputedStyle ne vérifie pas récursivement, donc on doit vérifier les parents
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
      return false;
    }
    parent = parent.parentElement;
  }

  return true;
}

/**
 * Récupère tous les éléments focusables dans un conteneur
 * @param container - Le conteneur dans lequel chercher
 * @param excludeHidden - Exclure les éléments cachés (par défaut: true)
 * @returns Tableau des éléments focusables
 */
export function getFocusableElements(
  container: HTMLElement | Document = document,
  excludeHidden: boolean = true
): HTMLElement[] {
  const selectors = FOCUSABLE_SELECTORS.join(', ');
  const allElements = Array.from(
    container.querySelectorAll<HTMLElement>(selectors)
  );

  if (!excludeHidden) {
    return allElements;
  }

  return allElements.filter((el) => isFocusable(el));
}


/**
 * Vérifie si un élément est dans un menu fermé
 * @param element - L'élément à vérifier
 * @returns true si l'élément est dans un menu fermé
 */
export function isInClosedMenu(element: HTMLElement): boolean {
  // Vérifier via l'attribut data-menu-item
  if (element.hasAttribute('data-menu-item')) {
    return true;
  }

  // Vérifier si l'élément est dans le menu
  const menu = document.getElementById('main-menu') || document.querySelector('[data-menu="true"]');
  if (!menu) {
    return false;
  }

  if (!menu.contains(element)) {
    return false;
  }

  // Vérifier si le menu est fermé
  const isMenuOpen = menu.getAttribute('aria-hidden') !== 'true';
  return !isMenuOpen;
}

