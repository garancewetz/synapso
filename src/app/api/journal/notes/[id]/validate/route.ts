import { NextRequest, NextResponse } from 'next/server';
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

    const result = await validateJournalNote({ noteId: id, userId });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'Note de journal non trouvée') {
      return NextResponse.json(
        { error: 'Note de journal non trouvée' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la validation journal note', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}
