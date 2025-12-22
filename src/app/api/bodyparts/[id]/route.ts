import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const bodypart = await prisma.bodypart.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bodypart) {
      return NextResponse.json(
        { error: 'Partie du corps non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(bodypart);
  } catch (error) {
    console.error('Erreur lors de la récupération du bodypart:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du bodypart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color } = body;

    const bodypart = await prisma.bodypart.update({
      where: { id: parseInt(id) },
      data: {
        name,
        color,
      },
    });

    return NextResponse.json(bodypart);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bodypart:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du bodypart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    await prisma.bodypart.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Bodypart supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du bodypart:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du bodypart',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

