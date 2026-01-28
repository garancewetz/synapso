'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import clsx from 'clsx';
import type { JournalNote } from '@/app/types';
import { BaseCard, Badge, Button } from '@/app/components/ui';
import { EditIcon, CalendarIcon } from '@/app/components/ui/icons';

type Props = {
  note: JournalNote;
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
 * Composant pour afficher une note du journal
 * Design neutre (sans couleur d'accent) harmonisé avec le reste de l'application
 * ⚡ PERFORMANCE: Mémorisé avec React.memo pour éviter les re-renders inutiles
 */
export const JournalNoteCard = memo(function JournalNoteCard({ note }: Props) {
  const router = useRouter();
  const displayDate = formatDisplayDate(note.date || note.createdAt);

  const handleEdit = useCallback(() => {
    router.push(`/journal/notes/edit/${note.id}`);
  }, [router, note.id]);

  return (
    <li>
      <BaseCard role="article" aria-label={`Note: ${note.title || note.content.substring(0, 50)}`}>
        <BaseCard.Content>
          <div className="p-4 md:p-5">
            <div className="flex flex-col gap-3">
              {/* Titre sur toute la largeur */}
              {note.title && (
                <h3 className="text-lg md:text-xl font-bold text-gray-800 w-full">
                  {note.title}
                </h3>
              )}
              
              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  "text-base md:text-lg text-gray-700",
                  note.title ? "" : "font-semibold"
                )}>
                  {note.content}
                </p>
              </div>
              
              {/* Date à la fin */}
              {displayDate && (
                <div className="flex justify-end">
                  <Badge className="bg-gray-100 text-gray-600 shrink-0 flex items-center gap-1.5">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{displayDate}</span>
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </BaseCard.Content>
        
        <BaseCard.Footer>
          <Button
            iconOnly
            onClick={handleEdit}
            title="Modifier la note"
            aria-label="Modifier la note"
          >
            <EditIcon className="w-4 h-4" />
          </Button>
        </BaseCard.Footer>
      </BaseCard>
    </li>
  );
});

