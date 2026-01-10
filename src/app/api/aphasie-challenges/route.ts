import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const challenges = await prisma.aphasieChallenge.findMany({
      where: {
        userId: userId,
      },
      orderBy: [
        { mastered: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching aphasie challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aphasie challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { text, mastered } = data;

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    const challenge = await prisma.aphasieChallenge.create({
      data: {
        text,
        mastered: mastered || false,
        userId: userId,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Error creating aphasie challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create aphasie challenge' },
      { status: 500 }
    );
  }
}
