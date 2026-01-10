import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './prisma';

// Constantes pour les cookies
const AUTH_COOKIE_NAME = 'synapso_auth';
const IMPERSONATE_COOKIE_NAME = 'synapso_impersonate';
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'synapso-secret-key-change-in-production';

// Configuration des cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 jours
  path: '/',
};

/**
 * Crée une signature simple pour le cookie (HMAC-like)
 * En production, utiliser une vraie librairie de signature (jose, jsonwebtoken, etc.)
 */
function signValue(value: string): string {
  // Simple signature basée sur le secret
  const hmac = crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('hex')
    .substring(0, 16);
  return `${value}.${hmac}`;
}

/**
 * Vérifie et extrait la valeur d'un cookie signé
 */
function verifySignedValue(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  
  const [value] = parts;
  const expectedSigned = signValue(value);
  
  if (expectedSigned === signedValue) {
    return value;
  }
  return null;
}

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Vérifie un mot de passe contre un hash bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Récupère l'ID de l'utilisateur connecté depuis le cookie
 */
export function getCurrentUserId(request: NextRequest): number | null {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  
  if (!authCookie) return null;
  
  const userId = verifySignedValue(authCookie.value);
  if (!userId) return null;
  
  const parsed = parseInt(userId, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Récupère l'ID de l'utilisateur impersonné (admin only)
 */
export function getImpersonatedUserId(request: NextRequest): number | null {
  const impersonateCookie = request.cookies.get(IMPERSONATE_COOKIE_NAME);
  
  if (!impersonateCookie) return null;
  
  const userId = verifySignedValue(impersonateCookie.value);
  if (!userId) return null;
  
  const parsed = parseInt(userId, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Récupère l'ID de l'utilisateur effectif (impersonné si admin, sinon connecté)
 * Cette fonction vérifie aussi que l'utilisateur connecté est bien admin s'il y a impersonation
 */
export async function getEffectiveUserId(request: NextRequest): Promise<number | null> {
  const currentUserId = getCurrentUserId(request);
  if (!currentUserId) return null;
  
  const impersonatedUserId = getImpersonatedUserId(request);
  
  // Si pas d'impersonation, retourner l'utilisateur connecté
  if (!impersonatedUserId) return currentUserId;
  
  // Vérifier que l'utilisateur connecté est admin
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { role: true },
  });
  
  if (currentUser?.role !== 'ADMIN') {
    // L'utilisateur n'est pas admin, ignorer l'impersonation
    return currentUserId;
  }
  
  // L'admin peut impersonner
  return impersonatedUserId;
}

/**
 * Vérifie si l'utilisateur connecté est admin
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  const userId = getCurrentUserId(request);
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  
  return user?.role === 'ADMIN';
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function checkAuth(request: NextRequest): Promise<boolean> {
  const userId = getCurrentUserId(request);
  return userId !== null;
}

/**
 * Crée le cookie d'authentification avec l'userId signé
 */
export function setAuthCookie(response: NextResponse, userId: number): NextResponse {
  const signedValue = signValue(userId.toString());
  response.cookies.set(AUTH_COOKIE_NAME, signedValue, COOKIE_OPTIONS);
  return response;
}

/**
 * Crée le cookie d'impersonation (admin only)
 */
export function setImpersonateCookie(response: NextResponse, userId: number): NextResponse {
  const signedValue = signValue(userId.toString());
  response.cookies.set(IMPERSONATE_COOKIE_NAME, signedValue, COOKIE_OPTIONS);
  return response;
}

/**
 * Supprime le cookie d'authentification
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(IMPERSONATE_COOKIE_NAME);
  return response;
}

/**
 * Supprime le cookie d'impersonation
 */
export function clearImpersonateCookie(response: NextResponse): NextResponse {
  response.cookies.delete(IMPERSONATE_COOKIE_NAME);
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

/**
 * Middleware pour protéger les routes API admin
 * Retourne null si l'utilisateur est admin, sinon retourne une réponse d'erreur
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authError = await requireAuth(request);
  if (authError) return authError;
  
  const adminStatus = await isAdmin(request);
  
  if (!adminStatus) {
    return NextResponse.json(
      { error: 'Accès refusé. Droits administrateur requis.' },
      { status: 403 }
    );
  }
  
  return null;
}
