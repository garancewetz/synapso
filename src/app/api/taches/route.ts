import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const taches = await prisma.tache.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(taches);
  } catch (error) {
    console.error('Error fetching taches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch taches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const tache = await prisma.tache.create({
      data: {
        title: data.title,
        url: data.url,
        identifier: data.identifier,
        password: data.password,
        isMonthly: data.isMonthly || false,
      },
    });

    return NextResponse.json(tache, { status: 201 });
  } catch (error) {
    console.error('Error creating tache:', error);
    return NextResponse.json(
      { error: 'Failed to create tache' },
      { status: 500 }
    );
  }
}

