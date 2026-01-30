import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, setAuthCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json();

    // Validation du nom
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom est obligatoire' },
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

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { name: name.trim() },
      select: {
        id: true,
        name: true,
        passwordHash: true,
        role: true,
        resetFrequency: true,
        dominantHand: true,
        hasJournal: true,
        createdAt: true,
      },
    });

    // 🔒 SÉCURITÉ: Toujours vérifier le mot de passe même si l'utilisateur n'existe pas
    // pour éviter l'énumération d'utilisateurs (user enumeration)
    let isValidPassword = false;
    
    if (user) {
      isValidPassword = await verifyPassword(password, user.passwordHash);
    } else {
      // Simuler la vérification du mot de passe pour un temps constant
      // Utiliser un hash bcrypt valide mais qui ne correspondra jamais au mot de passe
      // Hash généré pour "dummy-password-never-matches" avec bcrypt
      const dummyHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
      try {
        await verifyPassword(password, dummyHash);
      } catch {
        // Ignorer les erreurs de vérification du hash factice
      }
    }

    // Toujours retourner le même message pour éviter l'énumération
    if (!user || !isValidPassword) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Préparer les données utilisateur (sans le hash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _unused, ...userWithoutPassword } = user;

    // Créer la réponse avec le cookie d'authentification
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });

    return setAuthCookie(response, user.id);
  } catch (error) {
    logError('Erreur lors de la connexion', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
