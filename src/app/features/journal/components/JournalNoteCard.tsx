'use client';

import { useState, memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { JournalNote } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { usePinJournalNote } from '../hooks/usePinJournalNote';
import { useValidateJournalNote } from '../hooks/useValidateJournalNote';
import { useShareJournalNote } from '../hooks/useShareJournalNote';
import { BaseCard, Badge, Button } from '@/app/components/ui';
import { DotsIcon, EditIcon, BookmarkIcon, CheckIcon, ShareIcon } from '@/app/components/ui/icons';

type Props = {
  note: JournalNote;
  onUpdated?: (updatedNote: JournalNote) => void;
};

export const JournalNoteCard = memo(function JournalNoteCard({ note, onUpdated }: Props) {
  const router = useRouter();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const { effectiveUser } = useUser();

  const { handlePin, isPinning } = usePinJournalNote({
    note,
    userId: effectiveUser?.id ?? 0,
    onCompleted: onUpdated,
  });

  const { handleShare } = useShareJournalNote(note);

  const { handleValidate, isValidating } = useValidateJournalNote({
    note,
    userId: effectiveUser?.id ?? 0,
    onCompleted: onUpdated,
  });

  const handleEdit = useCallback(() => {
    setIsActionsOpen(false);
    router.push(`/journal/edit/${note.id}`);
  }, [router, note.id]);

  const handlePinClick = useCallback(async () => {
    await handlePin();
    setIsActionsOpen(false);
  }, [handlePin]);

  const toggleActions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(prev => !prev);
  }, []);

  return (
    <li>
      <BaseCard role="article" aria-label={`Note: ${note.title}`}>
        <BaseCard.Content>
          <div className="p-4 md:p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 flex-1 min-w-0">
                {note.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {note.pinned && (
                  <BookmarkIcon className="w-4 h-4 text-amber-500" filled />
                )}
                {note.validated && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    Validé
                  </Badge>
                )}
              </div>
            </div>

            {note.description && (
              <p className="mt-2 text-sm md:text-base text-gray-600 line-clamp-3">
                {note.description}
              </p>
            )}
            {note.date && (
              <p className="mt-1.5 text-xs text-gray-500">
                {new Date(note.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <BaseCard.Footer>
              <Button
                iconOnly
                onClick={toggleActions}
                aria-label={isActionsOpen ? 'Fermer les actions' : 'Ouvrir les actions'}
                aria-expanded={isActionsOpen}
              >
                <DotsIcon className={`w-5 h-5 transition-transform duration-200 ${isActionsOpen ? 'rotate-90' : ''}`} />
              </Button>

              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  note.validated
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:pointer-events-none`}
              >
                {isValidating ? (
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                <span>{note.validated ? 'Validé' : 'Valider'}</span>
              </button>
            </BaseCard.Footer>

            {/* Actions inline */}
            <div
              className="grid overflow-hidden transition-all duration-200 ease-out bg-gray-50/70"
              style={{ gridTemplateRows: isActionsOpen ? '1fr' : '0fr' }}
            >
              <div className="min-h-0">
                <div className="grid grid-cols-3 border-t border-gray-200">
                  <button type="button" onClick={handleEdit} className="px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] border-r border-gray-200">
                    <EditIcon className="w-5 h-5" />
                    <span className="font-medium">Modifier</span>
                  </button>
                  <button type="button" onClick={handlePinClick} disabled={isPinning} className="px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] border-r border-gray-200 disabled:opacity-50 disabled:pointer-events-none">
                    {isPinning ? (
                      <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5" filled={note.pinned} />
                    )}
                    <span className="font-medium">{note.pinned ? 'Démarquer' : 'Pour le kiné'}</span>
                  </button>
                  <button type="button" onClick={handleShare} className="px-2 py-3 flex flex-col items-center justify-center gap-1 text-center text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px]">
                    <ShareIcon className="w-5 h-5" />
                    <span className="font-medium">Partager</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </BaseCard.Content>
      </BaseCard>
    </li>
  );
});
