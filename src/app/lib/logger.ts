/**
 * Système de logging sécurisé
 * Filtre les données sensibles et évite l'exposition d'informations critiques
 */

/**
 * Liste des champs sensibles à ne jamais logger
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'secret',
  'invitationCode',
  'cookie',
  'authorization',
];

/**
 * Filtre les données sensibles d'un objet
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (data instanceof Error) {
    return {
      message: data.message,
      stack: process.env.NODE_ENV === 'development' ? data.stack : undefined,
      name: data.name,
    };
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      // Filtrer les champs sensibles
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    
    return sanitized;
  }

  return data;
}

/**
 * Log une erreur de manière sécurisée
 */
export function logError(message: string, error?: unknown): void {
  const sanitizedError = error ? sanitizeData(error) : undefined;
  console.error(message, sanitizedError);
  
  // En production, envoyer à un service de logging (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   // Sentry.captureException(error);
  // }
}

/**
 * Log une information de manière sécurisée
 */
export function logInfo(message: string, data?: unknown): void {
  const sanitizedData = data ? sanitizeData(data) : undefined;
  console.log(`[INFO] ${message}`, sanitizedData || '');
}

/**
 * Log un avertissement de manière sécurisée
 */
export function logWarn(message: string, data?: unknown): void {
  const sanitizedData = data ? sanitizeData(data) : undefined;
  console.warn(`[WARN] ${message}`, sanitizedData || '');
}

