import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getJournalNotes, createJournalNote } from '@/app/features/journal/api';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Journal notes error details:', { errorMessage, errorStack, error });
    return NextResponse.json(
      { 
        error: 'Failed to fetch journal notes',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { content, title, date } = data;

    // Constantes de validation
    const MAX_CONTENT_LENGTH = 5000;
    const MAX_TITLE_LENGTH = 200;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    // Valider les longueurs maximales
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Le contenu ne peut pas dépasser ${MAX_CONTENT_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (title && title.trim().length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Le titre ne peut pas dépasser ${MAX_TITLE_LENGTH} caractères` },
        { status: 400 }
      );
    }

    let dateValue: Date | null = null;
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        dateValue = parsedDate;
      }
    }

    const note = await createJournalNote({
      content: trimmedContent,
      title: title ? title.trim() : null,
      date: dateValue,
      userId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logError('Error creating journal note', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Journal note creation error details:', { errorMessage, errorStack, error });
    return NextResponse.json(
      { 
        error: 'Failed to create journal note',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

