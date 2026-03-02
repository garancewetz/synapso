import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';
import { getHistory, formatHistoryForApi } from '@/app/features/historique/api';

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request);
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  try {

    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const limitParam = searchParams.get('limit');

    const sinceDate = sinceParam ? new Date(sinceParam) : undefined;
    const limit = limitParam && !isNaN(parseInt(limitParam)) ? parseInt(limitParam) : undefined;

    const cacheKey = generateCacheKey([
      'history',
      userId,
      sinceParam || 'all',
      limitParam || 'no-limit',
    ]);

    const formattedHistory = await cacheApiResponse(
      cacheKey,
      async () => {
        const history = await getHistory({
          userId,
          since: sinceDate && !isNaN(sinceDate.getTime()) ? sinceDate : undefined,
          limit,
        });
        return formatHistoryForApi(history);
      },
      {
        revalidate: 10,
        tags: [CACHE_TAGS.HISTORY, CACHE_TAGS.USER_HISTORY(userId)],
      }
    );

    return NextResponse.json(formattedHistory);
  } catch (error) {
    logError('Erreur lors de la récupération de l\'historique', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'historique' },
      { status: 500 }
    );
  }
}
