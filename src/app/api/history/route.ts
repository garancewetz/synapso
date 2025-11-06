import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface HistoryEntry {
  id: number;
  completedAt: Date;
  exercice: {
    id: number;
    name: string;
    descriptionText: string;
    descriptionComment: string | null;
    workoutRepeat: number | null;
    workoutSeries: number | null;
    workoutDuration: string | null;
    equipments: string;
    bodyparts: Array<{
      exerciceId: number;
      bodypartId: number;
      bodypart: {
        id: number;
        name: string;
        color: string;
      };
    }>;
  };
}

export async function GET() {
  try {
    const history = await prisma.history.findMany({
      include: {
        exercice: {
          include: {
            bodyparts: {
              include: {
                bodypart: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    }) as HistoryEntry[];

    // Reformater les données
    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      completedAt: entry.completedAt,
      exercice: {
        id: entry.exercice.id,
        name: entry.exercice.name,
        description: {
          text: entry.exercice.descriptionText,
          comment: entry.exercice.descriptionComment,
        },
        workout: {
          repeat: entry.exercice.workoutRepeat,
          series: entry.exercice.workoutSeries,
          duration: entry.exercice.workoutDuration,
        },
        equipments: JSON.parse(entry.exercice.equipments),
        bodyparts: entry.exercice.bodyparts.map((eb) => ({
          id: eb.bodypart.id,
          name: eb.bodypart.name,
          color: eb.bodypart.color,
        })),
      },
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

