import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { register } from '@/app/features/auth/api';

const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      password, 
      invitationCode,
      resetFrequency, 
      dominantHand, 
      hasJournal 
    } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom est obligatoire' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.includes(' ')) {
      return NextResponse.json(
        { error: 'Le nom ne peut pas contenir d\'espaces' },
        { status: 400 }
      );
    }

    if (trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Le nom ne peut pas dépasser ${MAX_NAME_LENGTH} caractères` },
        { status: 400 }
      );
    }

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

    const user = await register({
      name: trimmedName,
      password,
      invitationCode,
      resetFrequency,
      dominantHand,
      hasJournal,
    });

    const response = NextResponse.json({
      success: true,
      user,
    }, { status: 201 });

    return setAuthCookie(response, user.id);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Code d\'invitation invalide') {
        return NextResponse.json(
          { error: 'Code d\'invitation invalide' },
          { status: 403 }
        );
      }
      if (error.message.includes('déjà utilisé') || error.message.includes('déjà pris')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('espaces')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    logError('Erreur lors de la création du compte', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}

