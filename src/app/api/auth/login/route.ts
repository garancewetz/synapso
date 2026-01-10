import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { verifyPassword, setAuthCookie } from '@/app/lib/auth';

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
        isAphasic: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Préparer les données utilisateur (sans le hash)
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Créer la réponse avec le cookie d'authentification
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });

    return setAuthCookie(response, user.id);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
