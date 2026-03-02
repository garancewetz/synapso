import { prisma } from '@/app/lib/prisma';

type ValidateJournalNoteParams = {
  noteId: number;
  userId: number;
};

export async function validateJournalNote(params: ValidateJournalNoteParams) {
  const { noteId, userId } = params;

  const note = await prisma.journalNote.findFirst({
    where: {
      id: noteId,
      userId: userId,
    },
  });

  if (!note) {
    throw new Error('Note de journal non trouvée');
  }

  const newValidated = !note.validated;

  const updatedNote = await prisma.journalNote.update({
    where: { id: noteId },
    data: {
      validated: newValidated,
      validatedAt: newValidated ? new Date() : null,
    },
  });

  return { validated: updatedNote.validated, validatedAt: updatedNote.validatedAt };
}
