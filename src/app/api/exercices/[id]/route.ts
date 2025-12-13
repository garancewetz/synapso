import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExerciceCategory } from '@/types/exercice';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
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
    
    const exercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userIdNumber,
      },
      include: {
        bodyparts: {
          include: {
            bodypart: true,
          },
        },
      },
    });
    
    if (!exercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }

    // Reformater les données
    const formattedExercice = {
      id: exercice.id,
      name: exercice.name,
      description: {
        text: exercice.descriptionText,
        comment: exercice.descriptionComment,
      },
      workout: {
        repeat: exercice.workoutRepeat,
        series: exercice.workoutSeries,
        duration: exercice.workoutDuration,
      },
      equipments: JSON.parse(exercice.equipments || '[]'),
      bodyparts: exercice.bodyparts?.map(eb => eb.bodypart.name) || [],
      category: exercice.category as ExerciceCategory,
      completed: exercice.completed,
      completedAt: exercice.completedAt,
      pinned: exercice.pinned,
    };

    return NextResponse.json(formattedExercice);
  } catch (error) {
    console.error('Error fetching exercice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercice' },
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

    if (!updatedData.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(updatedData.userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid userId' },
        { status: 400 }
      );
    }

    // Vérifier que l'exercice appartient à l'utilisateur
    const existingExercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userIdNumber,
      },
    });

    if (!existingExercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }

    // Valider le nom si fourni
    if (updatedData.name !== undefined && (!updatedData.name || !updatedData.name.trim())) {
      return NextResponse.json(
        { error: 'Le nom de l\'exercice est obligatoire' },
        { status: 400 }
      );
    }

    // Valider la catégorie si fournie
    if (updatedData.category && !['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'].includes(updatedData.category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be UPPER_BODY, LOWER_BODY, or STRETCHING' },
        { status: 400 }
      );
    }

    // Mettre à jour l'exercice
    const exercice = await prisma.exercice.update({
      where: { id },
      data: {
        name: updatedData.name !== undefined ? updatedData.name.trim() : undefined,
        descriptionText: updatedData.description?.text !== undefined ? (updatedData.description.text || '') : undefined,
        descriptionComment: updatedData.description?.comment !== undefined ? (updatedData.description.comment || null) : undefined,
        workoutRepeat: updatedData.workout?.repeat,
        workoutSeries: updatedData.workout?.series,
        workoutDuration: updatedData.workout?.duration,
        equipments: updatedData.equipments ? JSON.stringify(updatedData.equipments) : undefined,
        category: updatedData.category,
      },
    });

    // Mettre à jour les bodyparts si fournis
    if (updatedData.bodyparts && Array.isArray(updatedData.bodyparts)) {
      // Supprimer les anciennes relations
      await prisma.exerciceBodypart.deleteMany({
        where: { exerciceId: id },
      });

      // Créer les nouvelles relations
      for (const bodypartName of updatedData.bodyparts) {
        const bodypart = await prisma.bodypart.upsert({
          where: { name: bodypartName },
          update: {},
          create: { name: bodypartName, color: 'gray' },
        });
        
        await prisma.exerciceBodypart.create({
          data: {
            exerciceId: id,
            bodypartId: bodypart.id,
          },
        });
      }
    }

    // Reformater les données
    const formattedExercice = {
      id: exercice.id,
      name: exercice.name,
      description: {
        text: exercice.descriptionText,
        comment: exercice.descriptionComment,
      },
      workout: {
        repeat: exercice.workoutRepeat,
        series: exercice.workoutSeries,
        duration: exercice.workoutDuration,
      },
      equipments: JSON.parse(exercice.equipments || '[]'),
      bodyparts: updatedData.bodyparts || [],
      category: exercice.category as ExerciceCategory,
      completed: exercice.completed,
      completedAt: exercice.completedAt,
      pinned: exercice.pinned,
    };

    return NextResponse.json(formattedExercice);
  } catch (error) {
    console.error('Error updating exercice:', error);
    return NextResponse.json(
      { error: 'Failed to update exercice' },
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

    // Vérifier que l'exercice appartient à l'utilisateur
    const existingExercice = await prisma.exercice.findFirst({
      where: { 
        id,
        userId: userIdNumber,
      },
    });

    if (!existingExercice) {
      return NextResponse.json(
        { error: 'Exercice not found' },
        { status: 404 }
      );
    }
    
    await prisma.exercice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exercice:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercice' },
      { status: 500 }
    );
  }
}
