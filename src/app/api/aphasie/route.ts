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

    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const items = await prisma.aphasieItem.findMany({
      where: {
        userId: userIdNumber,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching aphasie items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aphasie items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Vérifier l'authentification
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const data = await request.json();
    const { quote, meaning, date, comment, userId } = data;

    if (!quote || !meaning || !userId) {
      return NextResponse.json(
        { error: 'quote, meaning and userId are required' },
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

    if (!quote.trim() || !meaning.trim()) {
      return NextResponse.json(
        { error: 'quote and meaning cannot be empty' },
        { status: 400 }
      );
    }

    // Convertir la date string (YYYY-MM-DD) en DateTime si fournie
    let dateValue: Date | null = null;
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        dateValue = parsedDate;
      }
    }

    const item = await prisma.aphasieItem.create({
      data: {
        quote: quote.trim(),
        meaning: meaning.trim(),
        date: dateValue,
        comment: comment ? comment.trim() : null,
        userId: userIdNumber,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating aphasie item:', error);
    return NextResponse.json(
      { error: 'Failed to create aphasie item' },
      { status: 500 }
    );
  }
}

