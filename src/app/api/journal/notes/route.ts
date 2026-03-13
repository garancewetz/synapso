import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getJournalNotes, createJournalNote } from '@/app/features/journal/api';
import { validateBody, requireJsonContentType, createJournalNoteSchema } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const notes = await getJournalNotes({ userId });

    return NextResponse.json(notes);
  } catch (error) {
    logError('Error fetching journal notes', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const ctError = requireJsonContentType(request);
  if (ctError) return ctError;

  try {
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = validateBody(createJournalNoteSchema, body);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;

    const note = await createJournalNote({
      title: data.title,
      description: data.description,
      media: data.media,
      exerciceIds: data.exerciceIds,
      userId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logError('Error creating journal note', error);
    return NextResponse.json(
      { error: 'Failed to create journal note' },
      { status: 500 }
    );
  }
}
