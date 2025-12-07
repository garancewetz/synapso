import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const items = await prisma.aphasieItem.findMany({
      orderBy: { id: 'asc' },
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

    const item = await prisma.aphasieItem.create({
      data: {
        quote: data.quote,
        meaning: data.meaning,
        date: data.date || null,
        comment: data.comment || null,
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

