import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { login } from '@/app/features/auth/api';

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom est obligatoire' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Le mot de passe est obligatoire' },
        { status: 400 }
      );
    }

    const user = await login({
      name,
      password,
    });

    const response = NextResponse.json({
      success: true,
      user,
    });

    return setAuthCookie(response, user.id);
  } catch (error) {
    if (error instanceof Error && error.message === 'Identifiants incorrects') {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }
    logError('Erreur lors de la connexion', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
