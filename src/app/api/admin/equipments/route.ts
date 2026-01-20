import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer tous les exercices avec leurs équipements (tous les utilisateurs)
    const exercices = await prisma.exercice.findMany({
      select: {
        id: true,
        name: true,
        equipments: true,
        userId: true,
      },
    });

    const equipmentsSet = new Set<string>();
    const equipmentsCounts: Record<string, number> = {};
    const equipmentsByExercice: Array<{
      exerciceId: number;
      exerciceName: string;
      userId: number;
      equipments: string[];
    }> = [];

    exercices.forEach((exercice) => {
      try {
        const equipments = JSON.parse(exercice.equipments || '[]') as string[];
        if (Array.isArray(equipments)) {
          const validEquipments: string[] = [];
          equipments.forEach((eq: string) => {
            if (typeof eq === 'string' && eq.trim()) {
              const trimmed = eq.trim();
              validEquipments.push(trimmed);
              equipmentsSet.add(trimmed);
              equipmentsCounts[trimmed] = (equipmentsCounts[trimmed] || 0) + 1;
            }
          });
          if (validEquipments.length > 0) {
            equipmentsByExercice.push({
              exerciceId: exercice.id,
              exerciceName: exercice.name,
              userId: exercice.userId,
              equipments: validEquipments,
            });
          }
        }
      } catch {
        // Ignorer les erreurs de parsing
      }
    });

    // Trier les équipements par nombre d'occurrences (décroissant)
    const equipmentsWithCounts = Array.from(equipmentsSet)
      .map(eq => ({
        name: eq,
        count: equipmentsCounts[eq] || 0,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalUnique: equipmentsSet.size,
      equipmentsList: Array.from(equipmentsSet).sort(),
      equipmentsWithCounts: equipmentsWithCounts,
      equipmentsByExercice: equipmentsByExercice,
    });
  } catch (error) {
    logError('Error extracting equipments', error);
    return NextResponse.json(
      { error: 'Failed to extract equipments' },
      { status: 500 }
    );
  }
}
