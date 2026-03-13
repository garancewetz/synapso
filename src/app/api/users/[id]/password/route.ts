import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId, isAdmin, clearAuthCookie } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { updateUserPassword } from '@/app/features/auth/api';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { validateBody, requireJsonContentType, changePasswordSchema } from '@/app/lib/validation';

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

    const ctError = requireJsonContentType(request);
    if (ctError) return ctError;

    const body = await request.json();
    const validated = validateBody(changePasswordSchema, body);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;

    const result = await updateUserPassword({
      userId: requestedUserId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    // Invalider la session : l'utilisateur devra se reconnecter
    const response = NextResponse.json(result);
    return clearAuthCookie(response);
  } catch (error) {
    logError('Error updating password', error);
    if (error instanceof Error) {
      if (error.message.includes('non trouvé')) {
        return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 });
      }
      if (error.message.includes('obligatoire') || error.message.includes('incorrect') || error.message.includes('différent')) {
        return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
      }
    }
    return NextResponse.json({ error: 'Erreur lors de la modification du mot de passe' }, { status: 500 });
  }
}





