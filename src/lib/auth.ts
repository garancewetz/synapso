import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'synapso_auth';
const AUTH_COOKIE_VALUE = 'authenticated';

/**
 * Vérifie si l'utilisateur est authentifié en vérifiant le cookie HTTP-only
 */
export async function checkAuth(request: NextRequest): Promise<boolean> {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  
  if (!authCookie || authCookie.value !== AUTH_COOKIE_VALUE) {
    return false;
  }
  
  return true;
}

/**
 * Crée le cookie d'authentification HTTP-only
 */
export function setAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 heures
    path: '/',
  });
  
  return response;
}

/**
 * Supprime le cookie d'authentification
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

/**
 * Middleware pour protéger les routes API
 * Retourne null si l'utilisateur est authentifié, sinon retourne une réponse d'erreur
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const isAuthenticated = await checkAuth(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Non autorisé. Authentification requise.' },
      { status: 401 }
    );
  }
  
  return null;
}

