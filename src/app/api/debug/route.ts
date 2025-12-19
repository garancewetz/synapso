import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 [DEBUG] Vérification de la base de données...');
    
    // Vérifier tous les utilisateurs
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
    console.log(`👥 [DEBUG] Utilisateurs trouvés: ${users.length}`);
    console.log('👥 [DEBUG] Détails utilisateurs:', users);
    
    // Vérifier tous les exercices
    const exercices = await prisma.exercice.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        userId: true,
        category: true,
      },
    });
    console.log(`💪 [DEBUG] Exercices trouvés: ${exercices.length}`);
    console.log('💪 [DEBUG] Détails exercices:', exercices);
    
    // Compter les exercices par utilisateur
    const exercicesByUser = exercices.reduce((acc, ex) => {
      acc[ex.userId] = (acc[ex.userId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return NextResponse.json({
      users: {
        count: users.length,
        details: users,
      },
      exercices: {
        count: exercices.length,
        details: exercices,
        byUser: exercicesByUser,
      },
    });
  } catch (error) {
    console.error('❌ [DEBUG] Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Failed to debug database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

