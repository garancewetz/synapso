'use client';

import { useState, memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { JournalNote } from '@/app/types';
import type { MediaItem } from '@/app/types/exercice';
import type { LinkedExercice } from '@/app/types/journal';
import { useUser } from '@/app/contexts/UserContext';
import { useTimeContext } from '@/app/contexts/TimeContext';
import { usePinJournalNote } from '../hooks/usePinJournalNote';
import { useValidateJournalNote } from '../hooks/useValidateJournalNote';
import { useShareJournalNote } from '../hooks/useShareJournalNote';
import { Button, BorderedIconList, CardActionButton, CardActionsPanel, InlineSpinner } from '@/app/components/ui';
import { MediaUploader } from '@/app/components/ui';
import { ExercicePickerModal } from './ExercicePickerModal';
import { DotsIcon, BookmarkIcon, ShareIcon, CameraIcon, CheckIcon } from '@/app/components/ui/icons';
import { TrashIcon } from '@/app/components/ui/icons/TrashIcon';
import { CATEGORY_HREFS, CATEGORY_COLORS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { JOURNAL_NOTE_STYLES } from '@/app/constants/journal.constants';
import clsx from 'clsx';

type Props = {
  note: JournalNote;
  completedExerciceIds?: Set<number>;
  onUpdated?: (updatedNote?: JournalNote) => void;
};

export const JournalNoteCard = memo(function JournalNoteCard({
  note,
  completedExerciceIds,
  onUpdated,
}: Props) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [description, setDescription] = useState(note.description ?? '');
  const [media, setMedia] = useState<MediaItem[]>(Array.isArray(note.media) ? (note.media as MediaItem[]) : []);
  const [exerciceIds, setExerciceIds] = useState<number[]>(note.exercices ? note.exercices.map((e) => e.id) : []);
  const [exerciceNames, setExerciceNames] = useState<LinkedExercice[]>(
    note.exercices
      ? note.exercices.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
        }))
      : []
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasAutoSavedOnce, setHasAutoSavedOnce] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const { effectiveUser } = useUser();
  const { referenceDateKey } = useTimeContext();
  const targetDateKey = referenceDateKey ?? format(new Date(), 'yyyy-MM-dd');

  const { handlePin, isPinning } = usePinJournalNote({
    note,
    userId: effectiveUser?.id ?? 0,
    onCompleted: onUpdated,
  });

  const { handleShare } = useShareJournalNote(note);

  const { handleValidateOrUnvalidate, isValidating, isValidatedForReferenceDay } = useValidateJournalNote({
    note,
    userId: effectiveUser?.id ?? 0,
    targetDateKey,
    resetFrequency: effectiveUser?.resetFrequency ?? 'DAILY',
    onCompleted: onUpdated,
  });

  const hasExercices = note.exercices && note.exercices.length > 0;
  const validateActionLabel = isValidatedForReferenceDay ? 'Validée' : 'Valider';
  const validateAriaLabel = isValidatedForReferenceDay
    ? "Annuler la validation pour aujourd'hui"
    : hasExercices
      ? `Valider pour aujourd'hui et marquer les ${note.exercices?.length ?? 0} exercice(s) comme faits`
      : "Valider pour aujourd'hui";

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setHasUnsavedChanges(true);
  }, []);

  const resizeDescription = useCallback(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const value = el.value;
    const lineCount = value.split('\n').length;
    const isEmpty = value.trim() === '';
    const minHeight = isEmpty || lineCount <= 1 ? 40 : 80;

    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, []);

  useLayoutEffect(() => {
    resizeDescription();
  }, [description, resizeDescription]);

  const handleMediaChange = useCallback((items: MediaItem[]) => {
    setMedia(items);
    setHasUnsavedChanges(true);
  }, []);

  const handleExerciceChange = useCallback((selected: LinkedExercice[]) => {
    setExerciceIds(selected.map((e) => e.id));
    setExerciceNames(selected);
    setHasUnsavedChanges(true);
  }, []);

  const handleAddMediaClick = useCallback(() => {
    setShowMediaUploader(true);
    setIsActionsOpen(false);
  }, []);

  const handleLinkExercicesClick = useCallback(() => {
    setIsPickerOpen(true);
    setIsActionsOpen(false);
  }, []);

  const handlePinClick = useCallback(async () => {
    await handlePin();
    setIsActionsOpen(false);
  }, [handlePin]);

  const toggleActions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isActionsOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isActionsOpen]);

  const handleDeleteClick = useCallback(async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/journal/notes/${note.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        onUpdated?.();
        setIsActionsOpen(false);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [showDeleteConfirm, note.id, onUpdated]);

  useEffect(() => {
    if (!isActionsOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const element = cardRef.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      const willMenuBeHidden = rect.bottom > viewportHeight;

      if (!willMenuBeHidden) {
        return;
      }

      const documentHeight = document.documentElement.scrollHeight;
      const currentScrollTop = window.scrollY || window.pageYOffset;
      const targetTop = Math.min(
        Math.max(currentScrollTop + rect.top - viewportHeight * 0.3, 0),
        documentHeight - viewportHeight
      );

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth',
      });
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isActionsOpen]);

  useEffect(() => {
    setTitle(note.title);
    setDescription(note.description ?? '');
    setMedia(Array.isArray(note.media) ? (note.media as MediaItem[]) : []);
    setExerciceIds(note.exercices ? note.exercices.map((e) => e.id) : []);
    setExerciceNames(
      note.exercices
        ? note.exercices.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category,
          }))
        : []
    );
    setHasUnsavedChanges(false);
    setHasAutoSavedOnce(false);
    setShowMediaUploader((prev) => prev || (Array.isArray(note.media) && (note.media as MediaItem[]).length > 0));
  }, [note]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const isEmpty =
      !title.trim() &&
      !description.trim() &&
      media.length === 0 &&
      exerciceIds.length === 0;

    setIsAutoSaving(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        if (isEmpty) {
          const response = await fetch(`/api/journal/notes/${note.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
          if (response.ok) {
            onUpdated?.();
          }
          setHasUnsavedChanges(false);
          return;
        }

        if (!title.trim()) {
          setIsAutoSaving(false);
          return;
        }

        const response = await fetch(`/api/journal/notes/${note.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description,
            media,
            exerciceIds,
          }),
        });

        if (response.ok) {
          const updatedNote = await response.json() as JournalNote;
          onUpdated?.(updatedNote);
          setHasAutoSavedOnce(true);
          setHasUnsavedChanges(false);
        }
      } finally {
        setIsAutoSaving(false);
      }
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [description, exerciceIds, hasUnsavedChanges, media, note.id, onUpdated, title]);

  return (
    <>
      <article
        role="article"
        aria-label={`Entrée : ${note.title}`}
        className={clsx('flex flex-col', JOURNAL_NOTE_STYLES.block)}
        ref={cardRef}
      >
        <div className="flex-1">
          <div className={JOURNAL_NOTE_STYLES.contentArea}>
            <div className="flex items-start justify-between gap-2">
              <h2 className={clsx('flex-1 min-w-0 focus-within:ring-0 focus-within:outline-none', JOURNAL_NOTE_STYLES.title)}>
                <textarea
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Titre"
                  rows={1}
                  style={{ fieldSizing: 'content' }}
                  className="w-full border-0! bg-transparent p-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none placeholder:text-neutral-400 resize-none"
                />
              </h2>
              <div className="flex items-center gap-1.5 shrink-0">
                {note.pinned && (
                  <BookmarkIcon className="w-4 h-4 text-amber-500" filled />
                )}
                {isValidatedForReferenceDay && (
                  <CheckIcon className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden />
                )}
              </div>
            </div>

            <div className="mt-3">
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Écrire une note..."
                className={clsx('w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none placeholder:text-neutral-400', JOURNAL_NOTE_STYLES.body)}
              />
            </div>
            {showMediaUploader && (
              <div className="mt-3">
                <MediaUploader
                  value={media}
                  onChange={handleMediaChange}
                  maxItems={1}
                  multiple={false}
                />
              </div>
            )}
            {exerciceNames.length > 0 && (
              <div className="mt-3">
                <BorderedIconList
                  title="Exercices liés"
                  ariaLabel="Exercices liés à cette note"
                  items={exerciceNames.map((ex) => {
                    const baseHref = CATEGORY_HREFS[ex.category as keyof typeof CATEGORY_HREFS];
                    const href = `${baseHref}#exercice-${ex.id}`;
                    const colors = CATEGORY_COLORS[ex.category as keyof typeof CATEGORY_COLORS];
                    return {
                      key: ex.id,
                      label: ex.name,
                      icon: CATEGORY_ICONS[ex.category as keyof typeof CATEGORY_ICONS],
                      borderClass: colors?.border || 'border-gray-200',
                      href,
                      completed: completedExerciceIds?.has(ex.id) ?? false,
                    };
                  })}
                />
              </div>
            )}
            <div className={clsx('mt-3 flex flex-wrap items-center gap-x-3 gap-y-1', JOURNAL_NOTE_STYLES.meta)}>
              {note.date && (
                <span>
                  {new Date(note.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
              {isAutoSaving && <span>Enregistrement…</span>}
              {!isAutoSaving && hasAutoSavedOnce && !hasUnsavedChanges && <span>Enregistrée</span>}
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <div className={clsx(JOURNAL_NOTE_STYLES.footer, 'gap-2')}>
              <Button
                type="button"
                variant={isValidatedForReferenceDay ? 'success' : 'secondary'}
                size="sm"
                rounded="lg"
                icon={isValidating ? undefined : <CheckIcon className="w-4 h-4" />}
                disabled={isValidating}
                aria-label={validateAriaLabel}
                onClick={() => void handleValidateOrUnvalidate()}
                className="flex-1 min-w-0 order-1"
              >
                {isValidating ? (
                  <InlineSpinner color="emerald" size="sm" />
                ) : (
                  validateActionLabel
                )}
              </Button>
              <div className="flex items-center gap-1 order-2">
                <Button
                  iconOnly
                  onClick={toggleActions}
                  aria-label={isActionsOpen ? 'Fermer les actions' : 'Ouvrir les actions'}
                  aria-expanded={isActionsOpen}
                  className="shrink-0"
                >
                  <DotsIcon className={clsx('w-5 h-5 transition-transform duration-200', isActionsOpen && 'rotate-90')} />
                </Button>
              </div>
            </div>

            {/* Actions inline */}
            <CardActionsPanel isOpen={isActionsOpen} color="neutral">
                  <CardActionButton
                    icon={<CameraIcon className="w-5 h-5" />}
                    label={media.length > 0 ? 'Modifier l\'image' : 'Ajouter une image'}
                    onClick={handleAddMediaClick}
                    color="neutral"
                    className={clsx('border-r border-b', JOURNAL_NOTE_STYLES.actionsBorder)}
                  />
                  <CardActionButton
                    icon={<CheckIcon className="w-5 h-5" />}
                    label={exerciceIds.length > 0 ? 'Modifier les exercices' : 'Lier des exercices'}
                    onClick={handleLinkExercicesClick}
                    color="neutral"
                    className={clsx('border-b', JOURNAL_NOTE_STYLES.actionsBorder)}
                  />
                  <CardActionButton
                    icon={isPinning
                      ? <InlineSpinner color="neutral" />
                      : <BookmarkIcon className="w-5 h-5" filled={note.pinned} />
                    }
                    label={note.pinned ? 'Désépingler' : 'Épingler'}
                    onClick={handlePinClick}
                    disabled={isPinning}
                    color="neutral"
                    className={clsx('border-r', JOURNAL_NOTE_STYLES.actionsBorder)}
                  />
                  <CardActionButton
                    icon={<ShareIcon className="w-5 h-5" />}
                    label="Partager"
                    onClick={handleShare}
                    color="neutral"
                  />
                  <CardActionButton
                    icon={isDeleting
                      ? <InlineSpinner color="neutral" />
                      : <TrashIcon className="w-5 h-5" />
                    }
                    label={showDeleteConfirm ? 'Confirmer la suppression' : 'Supprimer l\'entrée'}
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className={clsx(
                      'col-span-2 border-t',
                      JOURNAL_NOTE_STYLES.actionsBorder,
                      showDeleteConfirm ? 'text-red-600' : 'text-neutral-600'
                    )}
                    aria-label={showDeleteConfirm ? 'Confirmer la suppression' : 'Supprimer l\'entrée'}
                  />
            </CardActionsPanel>
          </div>
        </div>
      </article>
      <ExercicePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        value={exerciceIds}
        onChange={handleExerciceChange}
      />
    </>
  );
});
