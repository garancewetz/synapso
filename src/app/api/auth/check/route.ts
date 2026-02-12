import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/app/lib/logger';
import { checkAuth } from '@/app/features/auth/api';

export async function GET(request: NextRequest) {
  try {
    const result = await checkAuth({ request });

    return NextResponse.json(result);
  } catch (error) {
    logError('Erreur lors de la vérification de l\'authentification', error);
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    });
  }
}
