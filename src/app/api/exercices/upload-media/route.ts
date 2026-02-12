import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { uploadMedia } from '@/app/features/exercices/api';

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const result = await uploadMedia({ file });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Configuration Cloudinary')) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      if (error.message.includes('Type de fichier') || error.message.includes('trop volumineux') || error.message.includes('image valide')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    logError('Error uploading media to Cloudinary', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du média' },
      { status: 500 }
    );
  }
}

