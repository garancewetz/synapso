'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { useProgressModal } from '@/app/hooks/useProgressModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useProgress } from '@/app/hooks/useProgress';
import { ProgressTimeline } from '@/app/components/historique';
import { ProgressBottomSheet, ProgressButton, ConfettiRain } from '@/app/components';
import { SegmentedControl } from '@/app/components/ui';
import { BackButton } from '@/app/components/BackButton';
import { PROGRESS_EMOJIS, CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { isOrthophonieProgress } from '@/app/utils/progress.utils';
import clsx from 'clsx';

type FilterType = 'all' | 'orthophonie' | 'physique';

export default function ProgressPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { currentUser } = useUser();
  const progressModal = useProgressModal();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') as FilterType | null;
  const [filter, setFilter] = useState<FilterType>(filterParam && ['all', 'orthophonie', 'physique'].includes(filterParam) ? filterParam : 'all');

  // Charger l'historique
  const { history } = useHistory();

  // Charger les progrès
  const { progressList, loading, refetch: refetchProgress } = useProgress();

  // Synchroniser le filtre avec le paramètre d'URL
  useEffect(() => {
    if (filterParam && ['all', 'orthophonie', 'physique'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [filterParam]);

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Handler pour le succès d'un progrès avec confettis dorés
  const handleProgressSuccess = () => {
    setShowConfetti(true);
    refetchProgress();
  };

  // Filtrer les progrès selon le filtre sélectionné
  // Si l'utilisateur n'est pas aphasique, on affiche tous les progrès
  const filteredProgress = useMemo(() => {
    const isAphasic = currentUser?.isAphasic ?? false;
    
    // Si l'utilisateur n'est pas aphasique, toujours afficher tous les progrès
    if (!isAphasic) {
      return progressList;
    }
    
    // Sinon, appliquer le filtre sélectionné
    if (filter === 'all') {
      return progressList;
    }
    if (filter === 'orthophonie') {
      return progressList.filter(p => p.emoji === '🎯');
    }
    // filter === 'physique'
    return progressList.filter(p => p.emoji !== '🎯');
  }, [progressList, filter, currentUser?.isAphasic]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-8">
      {/* Bouton retour */}
      <BackButton backHref="/historique" className="mb-4" />

      <div className="px-3 sm:p-6">
        {/* Header */}
        <div className={clsx('flex items-center justify-between mb-6', currentUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            {PROGRESS_EMOJIS.STAR_BRIGHT} Tous mes progrès
          </h1>
          {currentUser && (
            <ProgressButton 
              onClick={progressModal.openForCreate}
              variant="inline"
              label="Ajouter"
            />
          )}
        </div>

        {/* Filtre avec nombre de progrès - affiché uniquement pour les utilisateurs aphasiques */}
        {!loading && progressList.length > 0 && (currentUser?.isAphasic ?? false) && (
          <div className="mb-6">
            <SegmentedControl
              options={[
                {
                  value: 'all',
                  label: 'Tous',
                  icon: PROGRESS_EMOJIS.STAR_BRIGHT,
                  count: progressList.length
                },
                {
                  value: 'orthophonie',
                  label: 'Orthophonie',
                  icon: CATEGORY_EMOJIS.ORTHOPHONIE,
                  count: progressList.filter(p => isOrthophonieProgress(p.emoji)).length
                },
                {
                  value: 'physique',
                  label: 'Physique',
                  icon: '🏋️',
                  count: progressList.filter(p => !isOrthophonieProgress(p.emoji)).length
                }
              ]}
              value={filter}
              onChange={(value) => setFilter(value as FilterType)}
              fullWidth
              size="md"
              showCountBelow
            />
          </div>
        )}

        {/* Liste des progrès */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <ProgressTimeline 
            progressList={filteredProgress}
            allProgress={progressList}
            history={history}
            onEdit={progressModal.openForEdit}
            hideChart={true}
          />
        )}
      </div>

      {/* Pluie de confettis dorés pour célébrer le progrès */}
      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

      {/* Modal de progrès */}
      {currentUser && (
        <ProgressBottomSheet
          isOpen={progressModal.isOpen}
          onClose={progressModal.close}
          onSuccess={handleProgressSuccess}
          userId={currentUser.id}
          progressToEdit={progressModal.progressToEdit}
        />
      )}
    </div>
  );
}

