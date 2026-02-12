import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId, isAdmin } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { updateUserPassword } from '@/app/features/auth/api';

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

    const result = await updateUserPassword({
      userId: requestedUserId,
      currentPassword,
      newPassword,
    });

    return NextResponse.json(result);
  } catch (error) {
    logError('Error updating password', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification du mot de passe';
    const status = errorMessage.includes('obligatoire') || errorMessage.includes('incorrect') || errorMessage.includes('différent') ? 400 : errorMessage.includes('non trouvé') ? 404 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}





