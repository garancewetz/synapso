import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

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
      try {
        const equipments = JSON.parse(exercice.equipments || '[]') as string[];
        if (Array.isArray(equipments)) {
          equipments.forEach((eq: string) => {
            if (typeof eq === 'string' && eq.trim()) {
              equipmentsSet.add(eq.trim());
            }
          });
        }
      } catch {
        // Ignorer les erreurs de parsing, continuer avec les autres exercices
      }
    });

    return NextResponse.json({
      bodyparts: bodyparts.map((bp) => bp.name),
      equipments: Array.from(equipmentsSet).sort(),
    });
  } catch (error) {
    logError('Error fetching metadata', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

