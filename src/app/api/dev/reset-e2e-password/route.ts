import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { hashPassword, requireAdmin } from '@/app/lib/auth';

/**
 * Remet le mot de passe de l'utilisateur E2E à la valeur de .env (E2E_USERNAME / E2E_PASSWORD).
 * Réservé au dev, utilisé par les tests E2E pour restaurer le mot de passe après le test "change le mot de passe".
 */
export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'dev') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  // Defense-in-depth : vérifier les droits admin même en dev
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    return NextResponse.json(
      { error: 'E2E_USERNAME et E2E_PASSWORD requis dans .env' },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const result = await prisma.user.updateMany({
    where: { name: username },
    data: { passwordHash },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: `Utilisateur "${username}" introuvable` },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
