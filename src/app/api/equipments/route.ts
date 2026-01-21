import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

/**
 * Route API pour récupérer tous les équipements uniques de la base de données
 * (tous les utilisateurs confondus)
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer tous les exercices avec leurs équipements (tous les utilisateurs)
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

    // Trier par ordre alphabétique
    const allEquipments = Array.from(equipmentsSet).sort();

    return NextResponse.json({
      equipments: allEquipments,
    });
  } catch (error) {
    logError('Error fetching all equipments', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipments' },
      { status: 500 }
    );
  }
}

