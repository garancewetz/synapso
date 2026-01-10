import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId, isAdmin } from '@/app/lib/auth';

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
    console.error('Error fetching user:', error);
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

    // Vérifier que le nom n'est pas déjà pris par un autre utilisateur
    if (data.name) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: data.name.trim(),
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
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
