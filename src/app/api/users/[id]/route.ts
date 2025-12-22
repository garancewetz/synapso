import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        resetFrequency: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const userId = parseInt(id);
    const data = await request.json();

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Vérifier que resetFrequency est valide
    if (data.resetFrequency && !['DAILY', 'WEEKLY'].includes(data.resetFrequency)) {
      return NextResponse.json(
        { error: 'resetFrequency doit être DAILY ou WEEKLY' },
        { status: 400 }
      );
    }

    // Vérifier que le nom n'est pas vide s'il est fourni
    if (data.name !== undefined && !data.name.trim()) {
      return NextResponse.json(
        { error: 'Le nom ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Vérifier que le nom n'est pas déjà pris par un autre utilisateur
    if (data.name) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: data.name.trim(),
          id: { not: userId },
        },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Ce nom est déjà utilisé par un autre utilisateur' },
          { status: 400 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.resetFrequency && { resetFrequency: data.resetFrequency }),
      },
      select: {
        id: true,
        name: true,
        resetFrequency: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

