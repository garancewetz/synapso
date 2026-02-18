import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getJournalNotes, createJournalNote } from '@/app/features/journal/api';

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

  try {
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, description } = data;

    const MAX_TITLE_LENGTH = 200;
    const MAX_DESCRIPTION_LENGTH = 5000;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Le titre est obligatoire' },
        { status: 400 }
      );
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Le titre ne peut pas dépasser ${MAX_TITLE_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (description && description.trim().length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `La description ne peut pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères` },
        { status: 400 }
      );
    }

    const note = await createJournalNote({
      title: title.trim(),
      description: description ? description.trim() : '',
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
