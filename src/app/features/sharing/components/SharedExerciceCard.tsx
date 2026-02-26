'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/app/constants/exercice.constants';
import { useRespondToShare } from '../hooks/useRespondToShare';
import type { ReceivedShare } from '@/app/lib/api-queries';

/* eslint-disable @next/next/no-img-element */

type Props = {
  share: ReceivedShare;
};

export function SharedExerciceCard({ share }: Props) {
  const { respond, isResponding } = useRespondToShare();
  const [handled, setHandled] = useState(false);

  const handleAccept = useCallback(async () => {
    const success = await respond(share.id, 'ACCEPTED');
    if (success) setHandled(true);
  }, [respond, share.id]);

  const handleReject = useCallback(async () => {
    const success = await respond(share.id, 'REJECTED');
    if (success) setHandled(true);
  }, [respond, share.id]);

  if (handled) return null;

  const exerciceDeleted = !share.exercice;
  const categoryLabel = share.exercice
    ? CATEGORY_LABELS[share.exercice.category as keyof typeof CATEGORY_LABELS] || share.exercice.category
    : null;
  const categoryIcon = share.exercice
    ? CATEGORY_ICONS[share.exercice.category as keyof typeof CATEGORY_ICONS] || ''
    : null;
  const firstPhoto = share.exercice?.media?.photos?.[0]?.url ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Contenu */}
      <div className="p-4 space-y-2">
        {exerciceDeleted ? (
          <p className="text-sm text-red-500 italic">
            L&apos;exercice original a été supprimé
          </p>
        ) : share.exercice && (
          <>
            <p className="text-xs text-gray-400">
              Partagé par <span className="font-medium text-gray-500">{share.sender.name}</span>
            </p>
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {share.exercice.name}
            </h3>
            {categoryLabel && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                {categoryIcon} {categoryLabel}
              </span>
            )}
            {firstPhoto && (
              <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={firstPhoto}
                  alt={`Photo de ${share.exercice.name}`}
                  className="w-full h-auto object-cover max-h-48"
                />
              </div>
            )}
            {share.exercice.description && (
              <p className="text-sm text-gray-600">
                {share.exercice.description}
              </p>
            )}
          </>
        )}
      </div>

      {/* Boutons toujours visibles */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={handleAccept}
          disabled={isResponding || exerciceDeleted}
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isResponding}
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refuser
        </button>
      </div>
    </motion.div>
  );
}
