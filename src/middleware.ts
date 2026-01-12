import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rate limiting simple en mémoire
 * ⚠️ En production, utiliser Redis ou un service dédié (Upstash, etc.)
 */
type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

// Configuration du rate limiting
const RATE_LIMIT_CONFIG = {
  // Routes d'authentification : 5 tentatives par 15 minutes
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Routes API générales : 100 requêtes par minute
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Nettoie les entrées expirées du rate limit map
 * (pour éviter une fuite mémoire)
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Vérifie et met à jour le rate limit pour une IP
 */
function checkRateLimit(
  ip: string,
  config: { maxAttempts: number; windowMs: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Nettoyer les entrées expirées périodiquement (10% de chance)
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  if (!record || record.resetTime < now) {
    // Nouvelle fenêtre ou fenêtre expirée
    const resetTime = now + config.windowMs;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime,
    };
  }

  // Fenêtre active
  if (record.count >= config.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Incrémenter le compteur
  record.count++;
  return {
    allowed: true,
    remaining: config.maxAttempts - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Obtient l'adresse IP de la requête
 */
function getClientIP(request: NextRequest): string {
  // Essayer différents headers (pour les proxies/reverse proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback si aucun header n'est disponible
  return 'unknown';
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = getClientIP(request);

  // Rate limiting pour les routes d'authentification
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
    const result = checkRateLimit(ip, RATE_LIMIT_CONFIG.auth);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.auth.maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          },
        }
      );
    }

    // Ajouter les headers de rate limit même en cas de succès
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.auth.maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
  }

  // Rate limiting général pour toutes les routes API
  if (path.startsWith('/api/')) {
    const result = checkRateLimit(ip, RATE_LIMIT_CONFIG.api);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez ralentir.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.api.maxAttempts.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          },
        }
      );
    }

    // Ajouter les headers de rate limit
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.api.maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

