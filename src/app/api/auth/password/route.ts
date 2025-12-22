import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const expectedPassword = process.env.SITE_PASSWORD;
    
    if (!expectedPassword) {
      return NextResponse.json(
        { error: 'Configuration manquante' },
        { status: 500 }
      );
    }
    
    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      return setAuthCookie(response);
    } else {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
