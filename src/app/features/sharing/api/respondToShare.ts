import { prisma } from '@/app/lib/prisma';
import { createExercice } from '@/app/features/exercices/api/createExercice';
import type { ExerciceCategory } from '@/app/types/exercice';

type RespondData = {
  shareId: number;
  receiverId: number;
  action: 'ACCEPTED' | 'REJECTED';
};

type RespondResult =
  | { success: true; action: 'REJECTED'; exercice: null }
  | { success: true; action: 'ACCEPTED'; exercice: ReturnType<typeof createExercice> extends Promise<infer T> ? T : never }
  | { success: false; reason: 'NOT_FOUND' }
  | { success: false; reason: 'EXERCICE_DELETED' };

export async function respondToShare(data: RespondData): Promise<RespondResult> {
  const { shareId, receiverId, action } = data;

  // Vérifier que le partage existe et appartient au receiver
  const share = await prisma.sharedExercice.findFirst({
    where: {
      id: shareId,
      receiverId,
      status: 'PENDING',
    },
    ...(action === 'ACCEPTED' && {
      include: {
        exercice: {
          include: {
            bodyparts: {
              include: { bodypart: true },
            },
          },
        },
      },
    }),
  });

  if (!share) {
    return { success: false, reason: 'NOT_FOUND' };
  }

  if (action === 'REJECTED') {
    await prisma.sharedExercice.update({
      where: { id: shareId },
      data: { status: 'REJECTED' },
    });
    return { success: true, action: 'REJECTED', exercice: null };
  }

  // ACCEPT : vérifier que l'exercice source existe encore
  const shareWithExercice = share as typeof share & {
    exercice: { name: string; descriptionText: string; descriptionComment: string | null; workoutRepeat: string | null; workoutSeries: string | null; workoutDuration: string | null; equipments: string; category: string; media: unknown; bodyparts: { bodypart: { name: string } }[] } | null;
  };

  if (!shareWithExercice.exercice) {
    await prisma.sharedExercice.update({
      where: { id: shareId },
      data: { status: 'REJECTED' },
    });
    return { success: false, reason: 'EXERCICE_DELETED' };
  }

  const source = shareWithExercice.exercice;

  let equipmentsParsed: string[] = [];
  try {
    equipmentsParsed = JSON.parse(source.equipments || '[]');
  } catch {
    equipmentsParsed = [];
  }

  // Dupliquer l'exercice pour le receiver puis mettre à jour le statut
  const newExercice = await createExercice({
    name: source.name,
    descriptionText: source.descriptionText,
    descriptionComment: source.descriptionComment,
    workoutRepeat: source.workoutRepeat,
    workoutSeries: source.workoutSeries,
    workoutDuration: source.workoutDuration,
    equipments: equipmentsParsed,
    category: source.category as ExerciceCategory,
    bodyparts: source.bodyparts.map((eb: { bodypart: { name: string } }) => eb.bodypart.name),
    userId: receiverId,
    media: source.media ?? undefined,
  });

  await prisma.sharedExercice.update({
    where: { id: shareId },
    data: { status: 'ACCEPTED', exerciceId: newExercice.id },
  });

  return { success: true, action: 'ACCEPTED', exercice: newExercice };
}
