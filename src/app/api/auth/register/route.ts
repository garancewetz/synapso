import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hashPassword, setAuthCookie } from '@/app/lib/auth';

const ADMIN_NAME = 'Garou';
const MIN_PASSWORD_LENGTH = 6;

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

    const trimmedName = name.trim();

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

    // Déterminer le rôle (Garou = ADMIN, autres = USER)
    const role = trimmedName === ADMIN_NAME ? 'ADMIN' : 'USER';

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        passwordHash,
        role,
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
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}

