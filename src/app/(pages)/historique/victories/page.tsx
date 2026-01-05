'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { useHistory } from '@/app/hooks/useHistory';
import { useVictories } from '@/app/hooks/useVictories';
import { VictoryTimeline } from '@/app/components/historique';
import { VictoryBottomSheet, VictoryButton, ConfettiRain } from '@/app/components';
import BackButton from '@/app/components/BackButton';
import { VICTORY_EMOJIS, CATEGORY_EMOJIS } from '@/app/constants/emoji.constants';
import { isOrthophonieVictory } from '@/app/utils/victory.utils';
import clsx from 'clsx';

type FilterType = 'all' | 'orthophonie' | 'physique';

export default function VictoriesPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { currentUser } = useUser();
  const victoryModal = useVictoryModal();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') as FilterType | null;
  const [filter, setFilter] = useState<FilterType>(filterParam && ['all', 'orthophonie', 'physique'].includes(filterParam) ? filterParam : 'all');

  // Charger l'historique
  const { history } = useHistory();

  // Charger les victoires
  const { victories, loading, refetch: refetchVictories } = useVictories();

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

  // Handler pour le succès d'une victoire avec confettis dorés
  const handleVictorySuccess = () => {
    setShowConfetti(true);
    refetchVictories();
  };

  // Filtrer les victoires selon le filtre sélectionné
  // Si l'utilisateur n'est pas aphasique, on affiche toutes les victoires
  const filteredVictories = useMemo(() => {
    const isAphasic = currentUser?.isAphasic ?? false;
    
    // Si l'utilisateur n'est pas aphasique, toujours afficher toutes les victoires
    if (!isAphasic) {
      return victories;
    }
    
    // Sinon, appliquer le filtre sélectionné
    if (filter === 'all') {
      return victories;
    }
    if (filter === 'orthophonie') {
      return victories.filter(v => v.emoji === '🎯');
    }
    // filter === 'physique'
    return victories.filter(v => v.emoji !== '🎯');
  }, [victories, filter, currentUser?.isAphasic]);

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-0 md:pb-8">
      {/* Bouton retour */}
      <BackButton backHref="/historique" className="mb-4" />

      <div className="px-3 sm:p-6">
        {/* Header */}
        <div className={clsx('flex items-center justify-between mb-6', currentUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            {VICTORY_EMOJIS.STAR_BRIGHT} Toutes mes réussites
          </h1>
          {currentUser && (
            <VictoryButton 
              onClick={victoryModal.openForCreate}
              variant="inline"
              label="Ajouter"
            />
          )}
        </div>

        {/* Filtre avec nombre de réussites - affiché uniquement pour les utilisateurs aphasiques */}
        {!loading && victories.length > 0 && (currentUser?.isAphasic ?? false) && (
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setFilter('all')}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center px-3 py-2.5 rounded-md font-medium text-sm transition-all duration-200',
                  filter === 'all'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <span className="text-lg mb-1">{VICTORY_EMOJIS.STAR_BRIGHT}</span>
                <span>Toutes</span>
                <span className="text-xs mt-0.5 opacity-75">({victories.length})</span>
              </button>
              <button
                onClick={() => setFilter('orthophonie')}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center px-3 py-2.5 rounded-md font-medium text-sm transition-all duration-200',
                  filter === 'orthophonie'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <span className="text-lg mb-1">{CATEGORY_EMOJIS.ORTHOPHONIE}</span>
                <span>Orthophonie</span>
                <span className="text-xs mt-0.5 opacity-75">({victories.filter(v => isOrthophonieVictory(v.emoji)).length})</span>
              </button>
              <button
                onClick={() => setFilter('physique')}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center px-3 py-2.5 rounded-md font-medium text-sm transition-all duration-200',
                  filter === 'physique'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <span className="text-lg mb-1">🏋️</span>
                <span>Physique</span>
                <span className="text-xs mt-0.5 opacity-75">({victories.filter(v => !isOrthophonieVictory(v.emoji)).length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Liste des victoires */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <VictoryTimeline 
            victories={filteredVictories}
            allVictories={victories}
            history={history}
            onEdit={victoryModal.openForEdit}
            hideChart={true}
          />
        )}
      </div>

      {/* Pluie de confettis dorés pour célébrer la victoire */}
      <ConfettiRain 
        show={showConfetti} 
        fromWindow 
        variant="golden"
        emojiCount={8}
        confettiCount={35}
      />

      {/* Modal de victoire */}
      {currentUser && (
        <VictoryBottomSheet
          isOpen={victoryModal.isOpen}
          onClose={victoryModal.close}
          onSuccess={handleVictorySuccess}
          userId={currentUser.id}
          victoryToEdit={victoryModal.victoryToEdit}
        />
      )}
    </div>
  );
}

