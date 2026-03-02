import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { pinExercice } from '@/app/features/exercices/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {
    const { id: idParam } = await params;
    const parsed = parseNumericId(idParam);
    if (parsed instanceof NextResponse) return parsed;
    const { id } = parsed;

    const result = await pinExercice({
      exerciceId: id,
      userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Exercice non trouvé') {
      return NextResponse.json(
        { error: 'Exercice non trouvé' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la mise à jour du pin', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du pin' },
      { status: 500 }
    );
  }
}
