import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Récupérer tous les bodyparts depuis la table Bodypart
    const bodyparts = await prisma.bodypart.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });

    // Récupérer tous les équipements uniques depuis les exercices
    const exercices = await prisma.exercice.findMany({
      select: {
        equipments: true,
      },
    });

    const equipmentsSet = new Set<string>();
    exercices.forEach((exercice) => {
      const equipments = JSON.parse(exercice.equipments) as string[];
      equipments.forEach((eq: string) => equipmentsSet.add(eq));
    });

    return NextResponse.json({
      bodyparts: bodyparts.map((bp) => bp.name),
      equipments: Array.from(equipmentsSet).sort(),
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

