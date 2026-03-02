import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/app/lib/auth';
import { parseNumericId } from '@/app/lib/api-route-utils';
import { logError } from '@/app/lib/logger';
import { getJournalNoteById, updateJournalNote, deleteJournalNote } from '@/app/features/journal/api';
import { deleteCloudinaryMedia } from '@/app/utils/cloudinary.utils';
import type { MediaItem } from '@/app/types/exercice';

export async function GET(
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

    const note = await getJournalNoteById({ noteId: id, userId });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof Error && error.message === 'Note de journal non trouvée') {
      return NextResponse.json(
        { error: 'Note de journal non trouvée' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la récupération de la note de journal', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la note de journal' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    if (error instanceof Error && error.message === 'Note de journal non trouvée') {
      return NextResponse.json(
        { error: 'Note de journal non trouvée' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la mise à jour de la note de journal', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la note de journal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    if (error instanceof Error && error.message === 'Note de journal non trouvée') {
      return NextResponse.json(
        { error: 'Note de journal non trouvée' },
        { status: 404 }
      );
    }
    logError('Erreur lors de la suppression de la note de journal', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la note de journal' },
      { status: 500 }
    );
  }
}
