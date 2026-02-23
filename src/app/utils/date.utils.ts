import { format, isToday, isYesterday, startOfDay } from 'date-fns';
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

/**
 * Convertit une Date en clé de date (yyyy-MM-dd)
 * Utilisé pour les comparaisons et les clés de cache
 * 
 * ⚡ PERFORMANCE: Utilise startOfDay pour normaliser la date avant formatage
 * pour éviter les problèmes de fuseau horaire
 * 
 * @param date Date à convertir
 * @returns Clé de date au format yyyy-MM-dd
 */
export function getDateKey(date: Date | string | null): string | null {
  if (!date) return null;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  const normalized = startOfDay(dateObj);
  const key = format(normalized, 'yyyy-MM-dd');
  console.log('[DEBUG-PROD] getDateKey:', {
    input: date instanceof Date ? date.toISOString() : date,
    startOfDay: normalized.toISOString(),
    key,
    timezoneOffset: new Date().getTimezoneOffset(),
  });
  return key;
}

/**
 * Crée une Date depuis une clé de date (yyyy-MM-dd)
 * Plus rapide que parse() de date-fns pour ce cas d'usage
 * 
 * ⚡ FIX: Utilise startOfDay pour normaliser la date et éviter les problèmes de timezone
 * 
 * @param dateKey Clé de date au format yyyy-MM-dd
 * @returns Date normalisée (début de journée)
 */
export function getDateFromKey(dateKey: string | null): Date | null {
  if (!dateKey) return null;

  // Validation du format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateKey)) {
    return null;
  }

  // Créer la date depuis la clé et normaliser avec startOfDay pour éviter les problèmes de timezone
  const date = new Date(dateKey + 'T00:00:00');
  const normalized = startOfDay(date);
  console.log('[DEBUG-PROD] getDateFromKey:', {
    dateKey,
    rawDate: date.toISOString(),
    normalized: normalized.toISOString(),
    timezoneOffset: new Date().getTimezoneOffset(),
  });
  return normalized;
}
