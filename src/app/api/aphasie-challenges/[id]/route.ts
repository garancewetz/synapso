import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const challenge = await prisma.aphasieChallenge.findUnique({
      where: { id },
    });
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Aphasie challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error fetching aphasie challenge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch aphasie challenge' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const updatedData = await request.json();

    const challenge = await prisma.aphasieChallenge.update({
      where: { id },
      data: {
        text: updatedData.text,
        mastered: updatedData.mastered !== undefined ? updatedData.mastered : undefined,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error updating aphasie challenge:', error);
    return NextResponse.json(
      { error: 'Failed to update aphasie challenge' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { mastered } = await request.json();

    const challenge = await prisma.aphasieChallenge.update({
      where: { id },
      data: {
        mastered: mastered,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error updating aphasie challenge mastery:', error);
    return NextResponse.json(
      { error: 'Failed to update aphasie challenge mastery' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    await prisma.aphasieChallenge.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting aphasie challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete aphasie challenge' },
      { status: 500 }
    );
  }
}

