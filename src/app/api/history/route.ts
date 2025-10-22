import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
    });

    // Reformater les données
    const formattedHistory = history.map((entry: any) => ({
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
        bodyparts: entry.exercice.bodyparts.map((eb: any) => ({
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

