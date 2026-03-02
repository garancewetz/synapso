import { prisma } from '@/app/lib/prisma';
import { startOfDay, addDays } from 'date-fns';
import { completeExercice } from '@/app/features/exercices/api';

type ValidateJournalNoteParams = {
  noteId: number;
  userId: number;
  targetDateKey: string;
  resetFrequency?: 'DAILY' | 'WEEKLY';
  unvalidate?: boolean;
};

function parseDateKeyToNoonUTC(dateKey: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new Error('Date invalide');
  }
  return new Date(dateKey + 'T12:00:00.000Z');
}

export async function validateJournalNote(params: ValidateJournalNoteParams) {
  const { noteId, userId, targetDateKey, resetFrequency = 'DAILY', unvalidate = false } = params;

  const note = await prisma.journalNote.findFirst({
    where: {
      id: noteId,
      userId: userId,
    },
    include: {
      exercices: { select: { exerciceId: true } },
    },
  });

  if (!note) {
    throw new Error('Note de journal non trouvée');
  }

  if (unvalidate) {
    const exerciceIds = note.exercices.map((e) => e.exerciceId);
    if (note.validatedAt && exerciceIds.length > 0) {
      for (const exerciceId of exerciceIds) {
        await completeExercice({
          exerciceId,
          userId,
          completedAt: note.validatedAt,
          resetFrequency,
        });
      }
    }
    const updatedNote = await prisma.journalNote.update({
      where: { id: noteId },
      data: { validated: false, validatedAt: null },
    });
    return { validated: updatedNote.validated, validatedAt: updatedNote.validatedAt };
  }

  const targetDate = parseDateKeyToNoonUTC(targetDateKey);
  const exerciceIds = note.exercices.map((e) => e.exerciceId);
  if (exerciceIds.length === 0) {
    const updatedNote = await prisma.journalNote.update({
      where: { id: noteId },
      data: { validated: true, validatedAt: targetDate },
    });
    return { validated: updatedNote.validated, validatedAt: updatedNote.validatedAt };
  }

  const targetDateStart = startOfDay(targetDate);
  const targetDateEnd = startOfDay(addDays(targetDate, 1));
  const alreadyCompleted = await prisma.history.findMany({
    where: {
      exerciceId: { in: exerciceIds },
      completedAt: { gte: targetDateStart, lt: targetDateEnd },
    },
    select: { exerciceId: true },
  });
  const alreadyCompletedIds = new Set(alreadyCompleted.map((h) => h.exerciceId));

  for (const exerciceId of exerciceIds) {
    if (alreadyCompletedIds.has(exerciceId)) continue;
    await completeExercice({
      exerciceId,
      userId,
      completedAt: targetDate,
      resetFrequency,
    });
  }

  const updatedNote = await prisma.journalNote.update({
    where: { id: noteId },
    data: {
      validated: true,
      validatedAt: targetDate,
    },
  });

  return {
    validated: updatedNote.validated,
    validatedAt: updatedNote.validatedAt,
  };
}
