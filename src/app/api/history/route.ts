import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import type { ExerciceCategory } from '@/app/types/exercice';

interface HistoryEntry {
  id: number;
  completedAt: Date;
  exercice: {
    id: number;
    name: string;
    category: ExerciceCategory;
    descriptionText: string;
    descriptionComment: string | null;
    workoutRepeat: string | null;
    workoutSeries: string | null;
    workoutDuration: string | null;
    equipments: string;
    userId: number;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const history = await prisma.history.findMany({
      where: {
        exercice: {
          userId: parseInt(userId),
        },
      },
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
        category: entry.exercice.category,
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

