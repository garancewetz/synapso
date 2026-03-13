import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId, isAdmin, getImpersonatedUserId, clearImpersonateCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getUser, updateUser, deleteUser } from '@/app/features/auth/api';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { validateBody, requireJsonContentType, updateUserSchema } from '@/app/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const requestedUserId = parsed.id;

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
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 });
      }
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const requestedUserId = parsed.id;
    const ctError = requireJsonContentType(request);
    if (ctError) return ctError;

    const body = await request.json();
    const result = validateBody(updateUserSchema, body);
    if (result instanceof NextResponse) return result;
    const { data } = result;

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
    if (error instanceof Error) {
      if (error.message.includes('obligatoire') || error.message.includes('invalide') || error.message.includes('déjà utilisé')) {
        return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const requestedUserId = parsed.id;

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
    if (error instanceof Error) {
      if (error.message.includes('Impossible')) {
        return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
