import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const challenges = await prisma.aphasieChallenge.findMany({
      where: {
        userId: parseInt(userId),
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
  if (authError) {
    return authError;
  }

  try {
    const data = await request.json();
    const { text, mastered, userId } = data;

    if (!text || !userId) {
      return NextResponse.json(
        { error: 'text and userId are required' },
        { status: 400 }
      );
    }

    const challenge = await prisma.aphasieChallenge.create({
      data: {
        text,
        mastered: mastered || false,
        userId: parseInt(userId),
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

