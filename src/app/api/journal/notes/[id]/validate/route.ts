import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getAuthContext } from '@/app/lib/auth';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { logError } from '@/app/lib/logger';
import { validateJournalNote } from '@/app/features/journal/api';

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

    let targetDateKey = format(new Date(), 'yyyy-MM-dd');
    let resetFrequency: 'DAILY' | 'WEEKLY' = 'DAILY';
    let unvalidate = false;
    try {
      const body = await request.json();
      if (body?.targetDate && /^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)) {
        targetDateKey = body.targetDate;
      }
      if (body?.resetFrequency === 'WEEKLY') {
        resetFrequency = 'WEEKLY';
      }
      if (body?.validated === false) {
        unvalidate = true;
      }
    } catch {
      // Body vide, utiliser les valeurs par défaut
    }

    const result = await validateJournalNote({
      noteId: id,
      userId,
      targetDateKey,
      resetFrequency,
      unvalidate,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Note de journal non trouvée') {
      return NextResponse.json(
        { error: 'Note de journal non trouvée' },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === 'Date invalide') {
      return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
    }
    logError('Erreur lors de la validation journal note', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}
