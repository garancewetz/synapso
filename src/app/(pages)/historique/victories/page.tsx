'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { Victory } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { VictoryTimeline } from '@/app/components/historique';
import { VictoryBottomSheet, VictoryButton, ConfettiRain } from '@/app/components';
import { ChevronIcon } from '@/app/components/ui/icons';
import { VICTORY_EMOJIS, CATEGORY_EMOJIS, NAVIGATION_EMOJIS } from '@/app/constants/emoji.constants';
import clsx from 'clsx';

type FilterType = 'all' | 'orthophonie' | 'physique';

export default function VictoriesPage() {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const { currentUser } = useUser();
  const victoryModal = useVictoryModal();

  // Fetch des victoires
  const fetchVictories = useCallback(() => {
    if (!currentUser) return;

    setLoading(true);
    fetch(`/api/victories?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVictories(data);
        } else {
          console.error('API error:', data);
          setVictories([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setVictories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchVictories();
    }
  }, [fetchVictories, currentUser]);

  // Réinitialiser les confettis après l'animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Handler pour le succès d'une victoire avec confettis dorés
  const handleVictorySuccess = useCallback(() => {
    setShowConfetti(true);
    fetchVictories();
  }, [fetchVictories]);

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
      <div className="px-3 sm:px-6 mb-2">
        <Link 
          href="/historique"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronIcon direction="left" className="w-5 h-5" />
          <span>{NAVIGATION_EMOJIS.MAP} Mon parcours</span>
        </Link>
      </div>

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

        {/* Filtre - affiché uniquement pour les utilisateurs aphasiques */}
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
            onEdit={victoryModal.openForEdit}
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

