'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AphasieItem } from '@/app/types';
import { BaseCard, Badge, Button } from '@/app/components/ui';
import { EditIcon, CalendarIcon } from '@/app/components/ui/icons';

type Props = {
  item: AphasieItem;
};

/**
 * Formate une date pour l'affichage
 */
function formatDisplayDate(dateString: string | null): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // Format: "5 janv. 2026"
    return format(date, 'd MMM yyyy', { locale: fr });
  } catch {
    return null;
  }
}

/**
 * Composant pour afficher une citation aphasie
 * Design neutre (sans couleur d'accent) harmonisé avec le reste de l'application
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
export const AphasieItemCard = memo(function AphasieItemCard({ item }: Props) {
  const router = useRouter();
  const displayDate = formatDisplayDate(item.date || item.createdAt);

  const handleEdit = useCallback(() => {
    router.push(`/aphasie/edit/${item.id}`);
  }, [router, item.id]);

  return (
    <li>
      <BaseCard role="article" aria-label={`Citation: ${item.quote}`}>
        <BaseCard.Content>
          <div className="p-4 md:p-5">
            {/* En-tête avec citation et date */}
            <div className="flex flex-col gap-3">
              {/* Citation principale */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                    {item.quote}
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 italic">
                    {item.meaning}
                  </p>
                </div>
                
                {/* Badge de date - style neutre */}
                {displayDate && (
                  <Badge className="bg-gray-100 text-gray-600 shrink-0 flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{displayDate}</span>
                  </Badge>
                )}
              </div>
              
              {/* Commentaire si présent */}
              {item.comment && (
                <div className="mt-2 p-3 bg-slate-50 border-l-2 border-slate-300 text-slate-700 text-sm rounded-r">
                  <span className="font-semibold">Note : </span>
                  {item.comment}
                </div>
              )}
            </div>
          </div>
        </BaseCard.Content>
        
        <BaseCard.Footer>
          <Button
            iconOnly
            onClick={handleEdit}
            title="Modifier la citation"
            aria-label="Modifier la citation"
          >
            <EditIcon className="w-4 h-4" />
          </Button>
        </BaseCard.Footer>
      </BaseCard>
    </li>
  );
});

