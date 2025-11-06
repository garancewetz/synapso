import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    const tache = await prisma.tache.findUnique({
      where: { id },
    });
    
    if (!tache) {
      return NextResponse.json(
        { error: 'Tache not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tache);
  } catch (error) {
    console.error('Error fetching tache:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tache' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const updatedData = await request.json();

    const tache = await prisma.tache.update({
      where: { id },
      data: {
        title: updatedData.title,
        url: updatedData.url,
        identifier: updatedData.identifier,
        password: updatedData.password,
        isMonthly: updatedData.isMonthly || false,
      },
    });

    return NextResponse.json(tache);
  } catch (error) {
    console.error('Error updating tache:', error);
    return NextResponse.json(
      { error: 'Failed to update tache' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    await prisma.tache.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tache:', error);
    return NextResponse.json(
      { error: 'Failed to delete tache' },
      { status: 500 }
    );
  }
}

