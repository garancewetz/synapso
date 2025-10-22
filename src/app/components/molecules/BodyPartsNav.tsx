'use client';

import { getBgColor, getBgColorLight } from '@/app/utils/colors';

interface BodyPartsNavProps {
  bodyparts: Array<{
    id: number;
    name: string;
    count: number;
    color: string;
  }>;
}

export default function BodyPartsNav({ bodyparts }: BodyPartsNavProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap mr-2">Parties du corps :</span>
        <div className="flex gap-1 sm:gap-2">
          {bodyparts.map((bodypart) => (
            <a
              key={`${bodypart.id}-${bodypart.name}`}
              href={`#${bodypart.name}`}
              className={`group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${getBgColor(bodypart.color, true)} hover:text-white ${getBgColorLight(bodypart.color, false)}`}
            >
              <span className="group-hover:text-white">{bodypart.name}</span>
              <span className="bg-white bg-opacity-20 px-1 sm:px-2 py-1 rounded-full text-xs">
                {bodypart.count}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
