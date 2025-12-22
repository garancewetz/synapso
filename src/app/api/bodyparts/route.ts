import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    const bodyparts = await prisma.bodypart.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(bodyparts);
  } catch (error) {
    console.error('Erreur lors de la récupération des bodyparts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bodyparts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Le nom et la couleur sont requis' },
        { status: 400 }
      );
    }

    const bodypart = await prisma.bodypart.create({
      data: {
        name,
        color,
      },
    });

    return NextResponse.json(bodypart, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du bodypart:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du bodypart' },
      { status: 500 }
    );
  }
}

