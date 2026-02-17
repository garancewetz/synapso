'use client';

import Image from 'next/image';
import type { Progress } from '@/app/types';
import { formatVictoryDate } from '@/app/utils/date.utils';
import { GOLDEN_TEXT_STYLES } from '@/app/constants/card.constants';

export type ProgressSlide =
  | { type: 'progress'; progress: Progress; mediaUrl?: string; victoryNumber: number }
  | { type: 'closing' };

type Props = {
  slide: ProgressSlide;
};

export function ProgressSlideshowSlide({ slide }: Props) {
  if (slide.type === 'closing') {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 p-8"
        data-slide-type="closing"
      >
        <p className="text-4xl md:text-6xl mb-4" aria-hidden="true">
          🌟
        </p>
        <h2 className={`text-2xl md:text-4xl font-bold text-center ${GOLDEN_TEXT_STYLES.primary}`}>
          Bravo pour tous ces progrès !
        </h2>
      </div>
    );
  }

  const { progress, mediaUrl, victoryNumber } = slide;

  if (mediaUrl) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 p-6 md:p-8"
        data-slide-type="with-photo"
      >
        <div className="relative w-full max-w-4xl aspect-[4/3] max-h-[50vh] shrink-0 mb-6">
          <Image
            src={`${mediaUrl}?f_auto,q_auto`}
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 896px"
            unoptimized
          />
        </div>
        <p className={`text-sm ${GOLDEN_TEXT_STYLES.secondary} mb-2`}>
          Victoire #{victoryNumber} · {formatVictoryDate(progress.createdAt)}
        </p>
        <p className={`text-xl md:text-3xl font-bold text-center ${GOLDEN_TEXT_STYLES.primary}`}>
          {progress.content}
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 p-8"
      data-slide-type="text-only"
    >
      {progress.emoji && (
        <p className="text-5xl md:text-7xl mb-4" aria-hidden="true">
          {progress.emoji}
        </p>
      )}
      <p className={`text-sm ${GOLDEN_TEXT_STYLES.secondary} mb-2`}>
        Victoire #{victoryNumber} · {formatVictoryDate(progress.createdAt)}
      </p>
      <p className={`text-xl md:text-3xl font-bold text-center ${GOLDEN_TEXT_STYLES.primary}`}>
        {progress.content}
      </p>
    </div>
  );
}
