import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const victories = await prisma.victory.findMany({
      where: {
        userId: userIdNumber,
      },
      orderBy: { createdAt: 'desc' },
      ...(limitParam && { take: parseInt(limitParam) }),
    });

    return NextResponse.json(victories);
  } catch (error) {
    console.error('Error fetching victories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch victories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { content, emoji, userId } = body;

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'content and userId are required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const victory = await prisma.victory.create({
      data: {
        content: content.trim(),
        emoji: emoji ? emoji.trim() : null,
        userId: userIdNumber,
      },
    });

    return NextResponse.json(victory, { status: 201 });
  } catch (error) {
    console.error('Error creating victory:', error);
    return NextResponse.json(
      { error: 'Failed to create victory' },
      { status: 500 }
    );
  }
}

