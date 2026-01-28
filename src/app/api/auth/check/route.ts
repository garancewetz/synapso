import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUserId, getImpersonatedUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  
  if (!userId) {
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    });
  }

  try {
    // Récupérer l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        resetFrequency: true,
        dominantHand: true,
        hasJournal: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        user: null,
        isAdmin: false,
        impersonatedUser: null,
      });
    }

    const isAdmin = user.role === 'ADMIN';
    let impersonatedUser = null;

    // Si admin, vérifier s'il y a une impersonation
    if (isAdmin) {
      const impersonatedUserId = getImpersonatedUserId(request);
      
      if (impersonatedUserId && impersonatedUserId !== userId) {
        impersonatedUser = await prisma.user.findUnique({
          where: { id: impersonatedUserId },
          select: {
            id: true,
            name: true,
            role: true,
            resetFrequency: true,
            dominantHand: true,
            hasJournal: true,
            createdAt: true,
          },
        });
      }
    }

    return NextResponse.json({ 
      authenticated: true,
      user,
      isAdmin,
      impersonatedUser,
    });
  } catch (error) {
    logError('Erreur lors de la vérification de l\'authentification', error);
    return NextResponse.json({ 
      authenticated: false,
      user: null,
      isAdmin: false,
      impersonatedUser: null,
    });
  }
}
