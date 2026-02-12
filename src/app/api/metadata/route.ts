import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getMetadata } from '@/app/features/exercices/api';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const result = await getMetadata({ userId });
    return NextResponse.json(result);
  } catch (error) {
    logError('Error fetching metadata', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}

