import { prisma } from '@/app/lib/prisma';

export async function getEquipments() {
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

  const allEquipments = Array.from(equipmentsSet).sort();

  return {
    equipments: allEquipments,
  };
}
