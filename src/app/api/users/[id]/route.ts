import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId, isAdmin, getImpersonatedUserId, clearImpersonateCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

export async function GET(
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
    
    // Vérifier que l'utilisateur demande ses propres infos (ou est admin)
    if (requestedUserId !== effectiveUserId && !adminStatus) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    logError('Error fetching user', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const requestedUserId = parseInt(id);
    const data = await request.json();

    if (isNaN(requestedUserId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Récupérer l'userId effectif
    const effectiveUserId = await getEffectiveUserId(request);
    const adminStatus = await isAdmin(request);
    
    // Vérifier que l'utilisateur modifie ses propres infos (ou est admin)
    if (requestedUserId !== effectiveUserId && !adminStatus) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que resetFrequency est valide
    if (data.resetFrequency && !['DAILY', 'WEEKLY'].includes(data.resetFrequency)) {
      return NextResponse.json(
        { error: 'resetFrequency doit être DAILY ou WEEKLY' },
        { status: 400 }
      );
    }

    // Vérifier que dominantHand est valide
    if (data.dominantHand && !['LEFT', 'RIGHT'].includes(data.dominantHand)) {
      return NextResponse.json(
        { error: 'dominantHand doit être LEFT ou RIGHT' },
        { status: 400 }
      );
    }

    // Vérifier que le nom n'est pas vide s'il est fourni
    if (data.name !== undefined && !data.name.trim()) {
      return NextResponse.json(
        { error: 'Le nom ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Validation : le nom ne doit pas contenir d'espaces
    if (data.name && data.name.trim().includes(' ')) {
      return NextResponse.json(
        { error: 'Le nom ne peut pas contenir d\'espaces' },
        { status: 400 }
      );
    }

    // Vérifier que le nom n'est pas déjà pris par un autre utilisateur
    if (data.name) {
      const trimmedName = data.name.trim();
      const existingUser = await prisma.user.findFirst({
        where: {
          name: trimmedName,
          id: { not: requestedUserId },
        },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Ce nom est déjà utilisé par un autre utilisateur' },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: requestedUserId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.resetFrequency && { resetFrequency: data.resetFrequency }),
        ...(data.dominantHand && { dominantHand: data.dominantHand }),
        ...(data.isAphasic !== undefined && { isAphasic: data.isAphasic }),
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

    return NextResponse.json(user);
  } catch (error) {
    logError('Error updating user', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const effectiveUserId = await getEffectiveUserId(request);
    const adminStatus = await isAdmin(request);
    
    // Vérifier que l'utilisateur supprime son propre compte (ou est admin)
    if (requestedUserId !== effectiveUserId && !adminStatus) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que ce n'est pas le dernier utilisateur
    const userCount = await prisma.user.count();
    if (userCount <= 1) {
      return NextResponse.json(
        { error: 'Impossible de supprimer le dernier utilisateur' },
        { status: 400 }
      );
    }

    // Vérifier que ce n'est pas le seul admin
    const user = await prisma.user.findUnique({
      where: { id: requestedUserId },
      select: { role: true },
    });

    if (user?.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible de supprimer le dernier administrateur' },
          { status: 400 }
        );
      }
    }

    // Vérifier si l'utilisateur supprimé est celui qui est impersonné
    const impersonatedUserId = getImpersonatedUserId(request);
    const isDeletingImpersonatedUser = impersonatedUserId === requestedUserId;

    // Supprimer l'utilisateur (cascade automatique)
    await prisma.user.delete({
      where: { id: requestedUserId },
    });

    // Si on supprimait l'utilisateur impersonné, supprimer le cookie d'impersonation
    const response = NextResponse.json({ success: true });
    if (isDeletingImpersonatedUser) {
      return clearImpersonateCookie(response);
    }

    return response;
  } catch (error) {
    logError('Error deleting user', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
