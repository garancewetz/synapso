import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getBodyparts, createBodypart } from '@/app/features/exercices/api';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const bodyparts = await getBodyparts();
    return NextResponse.json(bodyparts);
  } catch (error) {
    logError('Erreur lors de la récupération des bodyparts', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des bodyparts',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name } = body;

    const bodypart = await createBodypart({ name });
    return NextResponse.json(bodypart, { status: 201 });
  } catch (error) {
    logError('Erreur lors de la création du bodypart', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du bodypart';
    const status = errorMessage.includes('requis') ? 400 : 500;
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error),
      },
      { status }
    );
  }
}

