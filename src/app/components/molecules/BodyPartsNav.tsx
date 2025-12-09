'use client';

import { getBgColor, getBgColorLight } from '@/utils/colors';
import type { BodypartWithCount } from '@/types';

interface BodyPartsNavProps {
  bodyparts: BodypartWithCount[];
}

export default function BodyPartsNav({ bodyparts }: BodyPartsNavProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-0 sm:px-4 py-4 sm:py-3 sticky top-0 z-20">
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto">
     
        <div className="flex gap-2 sm:gap-2 pl-4 sm:pl-0 pr-4 sm:pr-0">
          {bodyparts.map((bodypart) => (
            <a
              key={`${bodypart.id}-${bodypart.name}`}
              href={`#${bodypart.name}`}
              className={`group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3 py-2.5 sm:py-2 rounded-md text-sm sm:text-sm font-medium transition-colors whitespace-nowrap ${getBgColor(bodypart.color, true)} hover:text-white ${getBgColorLight(bodypart.color, false)}`}
            >
              <span className="group-hover:text-white">{bodypart.name}</span>
              <span className="bg-white bg-opacity-20 min-w-[24px] h-6 sm:h-5 flex items-center justify-center rounded-full text-xs">
                {bodypart.count}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
