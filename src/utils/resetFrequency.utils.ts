import { startOfDay, startOfWeek, isSameDay, isAfter, isEqual } from 'date-fns';

type ResetFrequency = 'DAILY' | 'WEEKLY';

/**
 * Calcule le début de la période de réinitialisation selon le resetFrequency
 * @param resetFrequency - Fréquence de réinitialisation (DAILY ou WEEKLY)
 * @param referenceDate - Date de référence (par défaut: maintenant)
 * @returns Date du début de la période
 */
export function getStartOfPeriod(
  resetFrequency: ResetFrequency | string,
  referenceDate: Date = new Date()
): Date {
  if (resetFrequency === 'WEEKLY') {
    // weekStartsOn: 0 = Dimanche
    return startOfWeek(referenceDate, { weekStartsOn: 1 });
  }
  
  // DAILY par défaut
  return startOfDay(referenceDate);
}

/**
 * Vérifie si une date est dans la période de réinitialisation actuelle
 * @param completedDate - Date de complétion à vérifier
 * @param resetFrequency - Fréquence de réinitialisation
 * @param referenceDate - Date de référence (par défaut: maintenant)
 * @returns true si la date est dans la période actuelle
 */
export function isCompletedInPeriod(
  completedDate: Date | null,
  resetFrequency: ResetFrequency | string,
  referenceDate: Date = new Date()
): boolean {
  if (!completedDate) return false;
  
  const startOfPeriod = getStartOfPeriod(resetFrequency, referenceDate);
  // Vérifier si completedDate est après ou égal à startOfPeriod
  return isAfter(completedDate, startOfPeriod) || isEqual(completedDate, startOfPeriod);
}

/**
 * Vérifie si une date correspond à aujourd'hui
 * @param date - Date à vérifier
 * @param referenceDate - Date de référence (par défaut: aujourd'hui)
 * @returns true si la date est aujourd'hui
 */
export function isCompletedToday(
  date: Date | null,
  referenceDate: Date = new Date()
): boolean {
  if (!date) return false;
  return isSameDay(date, referenceDate);
}

/**
 * Retourne le libellé du jour de complétion
 * @param completedAt - Date de complétion (Date, string ou null)
 * @param referenceDate - Date de référence (par défaut: aujourd'hui)
 * @returns "Aujourd'hui" si c'est aujourd'hui, sinon "Ce lundi", "Ce mardi", etc.
 */
export function getCompletionDayLabel(
  completedAt: Date | string | null,
  referenceDate: Date = new Date()
): string {
  if (!completedAt) return 'Cette semaine';
  
  // Convertir en Date si c'est une string
  const completedDate = completedAt instanceof Date ? completedAt : new Date(completedAt);
  
  // Vérifier si la date est valide
  if (isNaN(completedDate.getTime())) {
    return 'Cette semaine';
  }
  
  if (isSameDay(completedDate, referenceDate)) {
    return 'Aujourd\'hui';
  }
  
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayIndex = completedDate.getDay();
  const dayName = dayNames[dayIndex];
  
  return `Ce ${dayName}`;
}

