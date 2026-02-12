import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId, isAdmin, getImpersonatedUserId, clearImpersonateCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getUser, updateUser, deleteUser } from '@/app/features/auth/api';

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

    const user = await getUser({ userId: requestedUserId });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    logError('Error fetching user', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
    const status = errorMessage.includes('non trouvé') ? 404 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
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

    const user = await updateUser({
      userId: requestedUserId,
      name: data.name,
      resetFrequency: data.resetFrequency,
      dominantHand: data.dominantHand,
      hasJournal: data.hasJournal,
    });

    return NextResponse.json(user);
  } catch (error) {
    logError('Error updating user', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    const status = errorMessage.includes('obligatoire') || errorMessage.includes('invalide') || errorMessage.includes('déjà utilisé') ? 400 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
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

    const impersonatedUserId = getImpersonatedUserId(request);
    const isDeletingImpersonatedUser = impersonatedUserId === requestedUserId;

    await deleteUser({ userId: requestedUserId });

    const response = NextResponse.json({ success: true });
    if (isDeletingImpersonatedUser) {
      return clearImpersonateCookie(response);
    }

    return response;
  } catch (error) {
    logError('Error deleting user', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    const status = errorMessage.includes('Impossible') ? 400 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}
