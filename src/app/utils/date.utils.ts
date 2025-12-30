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

