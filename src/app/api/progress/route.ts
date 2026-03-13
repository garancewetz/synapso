import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getProgress, createProgress } from '@/app/features/progress/api';
import { validateBody, requireJsonContentType, createProgressSchema } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const skip = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const progressList = await getProgress({
      userId,
      limit,
      skip: skip !== undefined && skip > 0 ? skip : undefined,
    });

    return NextResponse.json(progressList);
  } catch (error) {
    logError('Error fetching progress', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  const ctError = requireJsonContentType(request);
  if (ctError) return ctError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = validateBody(createProgressSchema, body);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;

    const progress = await createProgress({
      content: data.content,
      emoji: data.emoji ?? null,
      tags: data.tags,
      medias: data.medias,
      userId,
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    logError('Error creating progress', error);
    return NextResponse.json(
      { error: 'Failed to create progress' },
      { status: 500 }
    );
  }
}
