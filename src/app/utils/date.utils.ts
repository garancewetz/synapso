import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date de victoire de manière conviviale
 * - Aujourd'hui → "Aujourd'hui à 14:30"
 * - Hier → "Hier à 14:30"
 * - Autre → "28 décembre 2024"
 */
export function formatVictoryDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  if (isYesterday(date)) {
    return `Hier à ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  return format(date, 'd MMMM yyyy', { locale: fr });
}

/**
 * Formate une date courte avec le jour de la semaine
 * Ex: "Lundi 28 décembre"
 */
export function formatShortDate(date: Date): string {
  const formatted = format(date, "EEEE d MMMM", { locale: fr });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formate une heure
 * Ex: "14:30"
 */
export function formatTime(dateString: string): string {
  return format(new Date(dateString), 'HH:mm', { locale: fr });
}

/**
 * Obtient le nom du jour de la semaine en français
 * @param date Date ou string ISO
 * @returns Nom du jour capitalisé (ex: "Lundi") ou "Cette semaine" si date invalide
 */
export function getDayName(date: Date | string | null): string {
  if (!date) return 'Cette semaine';
  
  const completedDate = date instanceof Date ? date : new Date(date);
  
  if (isNaN(completedDate.getTime())) {
    return 'Cette semaine';
  }
  
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayIndex = completedDate.getDay();
  const dayName = dayNames[dayIndex];
  
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

