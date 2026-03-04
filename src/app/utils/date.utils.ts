import { format, isToday, isYesterday, startOfDay, startOfWeek, addDays } from 'date-fns';
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
 * Règle timezone (voir context.md) :
 * - getDateKey(date) : jour en timezone LOCALE (navigateur ou process). À utiliser pour affichage, référence utilisateur (ex. "aujourd'hui" côté client).
 * - getDateKeyUTC(date) : jour en UTC. À utiliser pour comparer avec le serveur (completedToday, stats, historique) et côté serveur pour tout calcul de "jour".
 */

/**
 * Convertit une Date en clé de date (yyyy-MM-dd) en timezone locale.
 * Utilisé pour les comparaisons côté client (affichage) et les clés de cache.
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
  return key;
}

/**
 * Convertit une Date en clé de date (yyyy-MM-dd) en UTC.
 * À utiliser pour toute comparaison "ce jour" avec le serveur (completedToday, stats, modal détail)
 * et côté serveur pour hasTargetDayHistory / filtres par jour (Netlify = UTC).
 *
 * @param date Date à convertir
 * @returns Clé de date au format yyyy-MM-dd en UTC
 */
export function getDateKeyUTC(date: Date | string | null): string | null {
  if (!date) return null;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return dateObj.toISOString().slice(0, 10);
}

/**
 * Clé de semaine (lundi en yyyy-MM-dd) pour un regroupement par semaine (timezone locale).
 */
export function getWeekKey(date: Date | string | null): string | null {
  if (!date) return null;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return null;
  const monday = startOfWeek(dateObj, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

/**
 * Libellé d’une semaine pour l’affichage (ex. "Du 24 février au 2 mars 2025").
 */
export function formatWeekRange(weekKey: string | null): string {
  if (!weekKey || !/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) return '';
  const start = getDateFromKey(weekKey);
  if (!start) return '';
  const end = addDays(start, 6);
  const startLabel = format(start, 'd MMMM', { locale: fr });
  const endLabel = format(end, 'd MMMM yyyy', { locale: fr });
  return `Du ${startLabel} au ${endLabel}`;
}

/**
 * Libellé ami pour les semaines récentes : "Cette semaine", "La semaine dernière",
 * ou les dates pour les semaines plus anciennes. Retourne un label principal et
 * optionnellement les dates en secondaire (pour cette / la semaine dernière).
 */
export function getFriendlyWeekLabel(weekKey: string | null): { primary: string; secondary?: string } {
  if (!weekKey || !/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) return { primary: '' };
  const dateRange = formatWeekRange(weekKey);
  const now = new Date();
  const thisWeekKey = getWeekKey(now);
  const lastWeekKey = getWeekKey(addDays(now, -7));
  if (weekKey === thisWeekKey) return { primary: 'Cette semaine', secondary: dateRange };
  if (weekKey === lastWeekKey) return { primary: 'La semaine dernière', secondary: dateRange };
  return { primary: dateRange };
}

/**
 * Bornes de la semaine (lundi 00:00 UTC → lundi suivant 00:00 UTC) pour une dateKey.
 * Aligné avec getStartOfPeriod('WEEKLY', ...) côté serveur (UTC).
 */
export function getUTCWeekBoundsForDateKey(
  dateKey: string | null
): { start: Date; end: Date } | null {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const ref = new Date(dateKey + 'T12:00:00.000Z');
  const day = ref.getUTCDay();
  const daysToMonday = (day + 6) % 7;
  const start = new Date(ref);
  start.setUTCDate(ref.getUTCDate() - daysToMonday);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
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
  return normalized;
}
