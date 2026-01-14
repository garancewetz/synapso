import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/app/lib/prisma';
import { hashPassword, setAuthCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

// 🔒 SÉCURITÉ: Le nom admin est configurable via variable d'environnement
const ADMIN_NAME = process.env.ADMIN_NAME;
const MIN_PASSWORD_LENGTH = 8; // Minimum recommandé par OWASP
const MAX_NAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 128;
const INVITATION_CODE = process.env.INVITATION_CODE;

/**
 * Récupère la liste des codes d'invitation valides depuis la variable d'environnement
 * Les codes peuvent être séparés par des virgules (ex: "coucou2025,avcsalut")
 */
function getValidInvitationCodes(): string[] {
  if (!INVITATION_CODE) {
    return [];
  }
  // Séparer par virgule et nettoyer les espaces
  return INVITATION_CODE.split(',').map(code => code.trim()).filter(code => code.length > 0);
}

/**
 * Compare deux codes d'invitation de manière sécurisée (timing-safe)
 * En mode développement, si INVITATION_CODE n'est pas défini, permet la création sans code
 * Supporte plusieurs codes d'invitation séparés par des virgules
 */
function validateInvitationCode(provided: string | undefined): boolean {
  const validCodes = getValidInvitationCodes();

  // Si aucun code n'est requis en dev, permettre la création
  if (validCodes.length === 0) {
    return process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev';
  }

  // Si le code est requis mais non fourni, refuser
  if (!provided || typeof provided !== 'string') {
    return false;
  }

  // Vérifier si le code fourni correspond à l'un des codes valides
  // Utiliser une comparaison timing-safe pour chaque code
  for (const validCode of validCodes) {
    // Comparaison timing-safe pour éviter les timing attacks
    if (provided.length !== validCode.length) {
      continue;
    }

    const providedBuffer = Buffer.from(provided, 'utf8');
    const expectedBuffer = Buffer.from(validCode, 'utf8');

    try {
      if (timingSafeEqual(providedBuffer, expectedBuffer)) {
        return true;
      }
    } catch {
      // Continuer avec le code suivant
      continue;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      password, 
      invitationCode,
      resetFrequency, 
      dominantHand, 
      isAphasic 
    } = await request.json();

    // 🔒 SÉCURITÉ: Validation du code d'invitation en premier
    // Cette validation doit se faire AVANT toute autre opération
    if (!validateInvitationCode(invitationCode)) {
      return NextResponse.json(
        { error: 'Code d\'invitation invalide' },
        { status: 403 }
      );
    }

    // Validation du nom
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom est obligatoire' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Validation de la longueur du nom
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Le nom ne peut pas dépasser ${MAX_NAME_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Le mot de passe est obligatoire' },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Le mot de passe ne peut pas dépasser ${MAX_PASSWORD_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { name: trimmedName },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce nom est déjà utilisé. Choisissez un autre nom.' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // 🔒 SÉCURITÉ: Seul le nom défini dans ADMIN_NAME peut devenir admin
    // Si ADMIN_NAME n'est pas défini, tous les utilisateurs sont USER
    const role = (ADMIN_NAME && trimmedName === ADMIN_NAME) ? 'ADMIN' : 'USER';

    // Créer l'utilisateur avec les paramètres optionnels
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        passwordHash,
        role,
        // Paramètres optionnels (utilisent les valeurs par défaut du schéma si non fournis)
        ...(resetFrequency && { resetFrequency }),
        ...(dominantHand && { dominantHand }),
        ...(isAphasic !== undefined && { isAphasic }),
      },
      select: {
        id: true,
        name: true,
        role: true,
        resetFrequency: true,
        dominantHand: true,
        isAphasic: true,
        createdAt: true,
      },
    });

    // Créer la réponse avec le cookie d'authentification
    const response = NextResponse.json({
      success: true,
      user,
    }, { status: 201 });

    return setAuthCookie(response, user.id);
  } catch (error) {
    logError('Erreur lors de la création du compte', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}

