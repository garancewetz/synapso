import { prisma } from '@/app/lib/prisma';
import { getStartOfPeriod } from '@/app/utils/resetFrequency.utils';
import { addDays, startOfDay } from 'date-fns';
import { getDateKey, getDateKeyUTC } from '@/app/utils/date.utils';
import { cacheApiResponse, generateCacheKey, CACHE_TAGS } from '@/app/lib/cache';
import type { ExerciceCategory } from '@/app/types/exercice';

type GetCategoryStatsParams = {
  userId: number;
  targetDate?: string;
  resetFrequency: 'DAILY' | 'WEEKLY';
};

export async function getCategoryStats(params: GetCategoryStatsParams) {
  const { userId, targetDate, resetFrequency } = params;

  let targetDateObj = new Date();
  if (targetDate) {
    const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(targetDate);
    if (isDateKey) {
      targetDateObj = new Date(targetDate + 'T12:00:00.000Z');
    } else {
      const parsedDate = new Date(targetDate);
      if (!isNaN(parsedDate.getTime())) {
        const key = getDateKey(parsedDate);
        if (key) targetDateObj = new Date(key + 'T12:00:00.000Z');
      }
    }
  } else {
    const todayKeyUTC = getDateKeyUTC(new Date()) ?? getDateKey(new Date());
    if (todayKeyUTC) targetDateObj = new Date(todayKeyUTC + 'T12:00:00.000Z');
  }

  const now = targetDateObj;
  const startOfTargetDay = startOfDay(now);
  const endOfTargetDay = startOfDay(addDays(now, 1));

  const dateKey = (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate))
    ? targetDate
    : (getDateKeyUTC(targetDateObj) ?? '');

  const cacheKey = generateCacheKey([
    'stats-category',
    userId,
    dateKey,
    resetFrequency,
  ]);

  const stats = await cacheApiResponse(
    cacheKey,
    async () => {
      const statsResult = await prisma.$queryRaw<Array<{
        category: ExerciceCategory;
        count: bigint;
      }>>`
        SELECT 
          e.category,
          COUNT(DISTINCT e.id)::int as count
        FROM "Exercice" e
        INNER JOIN "History" h ON h."exerciceId" = e.id
        WHERE 
          e."userId" = ${userId}::int
          AND e.archived = false
          AND h."completedAt" >= ${startOfTargetDay}::timestamp
          AND h."completedAt" < ${endOfTargetDay}::timestamp
        GROUP BY e.category
      `;

      const statsByCategory: Record<ExerciceCategory, number> = {
        UPPER_BODY: 0,
        LOWER_BODY: 0,
        STRETCHING: 0,
        CORE: 0,
        MAXILLO_FACIAL: 0,
      };

      statsResult.forEach((row) => {
        if (row.category && row.category in statsByCategory) {
          statsByCategory[row.category as ExerciceCategory] = Number(row.count);
        }
      });

      return statsByCategory;
    },
    {
      revalidate: 30,
      tags: [
        CACHE_TAGS.STATS,
        CACHE_TAGS.USER_STATS(userId, dateKey),
        CACHE_TAGS.EXERCICES,
        CACHE_TAGS.HISTORY,
      ],
    }
  );

  return stats;
}
