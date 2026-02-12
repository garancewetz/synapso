import { parse, isValid, isBefore, isAfter, startOfDay, subDays } from 'date-fns';
import { MAX_TIME_MACHINE_DAYS } from '@/app/constants/historique.constants';

/**
 * Valide une date string (yyyy-MM-dd) pour le mode sablier
 * @returns null si invalide, la dateKey si valide
 */
export function validateDateKey(dateKey: string | null): string | null {
  if (!dateKey) return null;
  
  // Valider le format (yyyy-MM-dd)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateKey)) {
    return null;
  }
  
  // Valider que la date est valide
  const parsedDate = parse(dateKey, 'yyyy-MM-dd', new Date());
  if (!isValid(parsedDate)) {
    return null;
  }
  
  // Vérifier que la date n'est pas dans le futur
  const today = startOfDay(new Date());
  const normalizedDate = startOfDay(parsedDate);
  if (isAfter(normalizedDate, today)) {
    return null;
  }
  
  // Vérifier si la date est trop ancienne (plus de 28 jours)
  const minAllowedDate = subDays(new Date(), MAX_TIME_MACHINE_DAYS);
  if (isBefore(normalizedDate, minAllowedDate)) {
    return null;
  }
  
  return dateKey;
}
