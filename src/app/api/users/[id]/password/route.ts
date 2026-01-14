import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId, isAdmin, hashPassword, verifyPassword } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const requestedUserId = parseInt(id);

    if (isNaN(requestedUserId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Récupérer l'userId effectif
    const effectiveUserId = await getEffectiveUserId(request);
    const adminStatus = await isAdmin(request);
    
    // Vérifier que l'utilisateur modifie son propre mot de passe (ou est admin)
    if (requestedUserId !== effectiveUserId && !adminStatus) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { currentPassword, newPassword } = data;

    // Validation de l'ancien mot de passe
    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { error: 'Le mot de passe actuel est obligatoire' },
        { status: 400 }
      );
    }

    // Validation du nouveau mot de passe
    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe est obligatoire' },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Le nouveau mot de passe ne peut pas dépasser ${MAX_PASSWORD_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit être différent de l\'ancien' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec son hash de mot de passe
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: requestedUserId },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    logError('Error updating password', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du mot de passe' },
      { status: 500 }
    );
  }
}





