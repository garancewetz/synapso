'use client';

import { useEffect, useRef } from 'react';
import { getBgColorLight, getBorderColor, getBorderColorHover } from '@/utils/colors';
import type { BodypartWithCount } from '@/types';

interface BodyPartsNavProps {
  bodyparts: BodypartWithCount[];
  activeBodypart?: string | null;
}

export default function BodyPartsNav({ bodyparts, activeBodypart }: BodyPartsNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  useEffect(() => {
    if (activeBodypart && containerRef.current) {
      const activeElement = itemRefs.current[activeBodypart];
      
      if (activeElement) {
        // Vérifier si on est sur mobile (largeur < 768px)
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          const container = containerRef.current;
          
          const containerRect = container.getBoundingClientRect();
          const elementRect = activeElement.getBoundingClientRect();
          
          const scrollLeft = container.scrollLeft;
          const elementLeft = elementRect.left - containerRect.left + scrollLeft;
          const elementWidth = elementRect.width;
          const containerWidth = containerRect.width;
          
          // Calculer la position pour centrer l'élément
          const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2);
          
          container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeBodypart]);

  return (
    <div className="bg-white border-b border-gray-200 px-0 sm:px-4 py-4 sm:py-3 sticky top-0 z-20">
      <div ref={containerRef} className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto">
     
        <div className="flex gap-2 sm:gap-2 pl-4 sm:pl-0 pr-4 sm:pr-0">
          {bodyparts.map((bodypart) => {
            const isActive = activeBodypart === bodypart.name;
            return (
              <a
                ref={(el) => {
                  itemRefs.current[bodypart.name] = el;
                }}
                key={`${bodypart.id}-${bodypart.name}`}
                href={`#${bodypart.name}`}
                className={`group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3 py-2.5 sm:py-2 rounded-md text-sm sm:text-sm font-medium transition-colors whitespace-nowrap border-2 ${
                  isActive 
                    ? `${getBorderColor(bodypart.color)} ${getBgColorLight(bodypart.color, false)}` 
                    : `border-transparent ${getBorderColorHover(bodypart.color)} ${getBgColorLight(bodypart.color, false)}`
                }`}
              >
                <span>{bodypart.name}</span>
                <span className="bg-white bg-opacity-20 min-w-[24px] h-6 sm:h-5 flex items-center justify-center rounded-full text-xs">
                  {bodypart.count}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
