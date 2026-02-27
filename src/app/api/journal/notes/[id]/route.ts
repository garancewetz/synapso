import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getJournalNoteById, updateJournalNote, deleteJournalNote } from '@/app/features/journal/api';
import { deleteCloudinaryMedia } from '@/app/utils/cloudinary.utils';
import type { MediaItem } from '@/app/types/exercice';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const note = await getJournalNoteById({ noteId: id, userId });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal note not found') {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }
    logError('Error fetching journal note', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal note' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const updatedData = await request.json();

    if (!updatedData.title || !updatedData.title.trim()) {
      return NextResponse.json(
        { error: 'Le titre est obligatoire' },
        { status: 400 }
      );
    }

    const note = await updateJournalNote({
      noteId: id,
      userId,
      data: {
        title: updatedData.title.trim(),
        description: updatedData.description !== undefined ? updatedData.description.trim() : undefined,
        media: updatedData.media !== undefined ? (Array.isArray(updatedData.media) ? updatedData.media : []) : undefined,
        exerciceIds: updatedData.exerciceIds !== undefined ? (Array.isArray(updatedData.exerciceIds) ? updatedData.exerciceIds : []) : undefined,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal note not found') {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }
    logError('Error updating journal note', error);
    return NextResponse.json(
      { error: 'Failed to update journal note' },
      { status: 500 }
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
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer la note pour nettoyer les médias Cloudinary
    const note = await getJournalNoteById({ noteId: id, userId });
    const media = (note.media as MediaItem[] | null) || [];

    await deleteJournalNote({ noteId: id, userId });

    // Supprimer les images de Cloudinary après la suppression en BDD
    await Promise.all(
      media.map((m) => deleteCloudinaryMedia(m.publicId, 'image'))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Journal note not found') {
      return NextResponse.json(
        { error: 'Journal note not found' },
        { status: 404 }
      );
    }
    logError('Error deleting journal note', error);
    return NextResponse.json(
      { error: 'Failed to delete journal note' },
      { status: 500 }
    );
  }
}
