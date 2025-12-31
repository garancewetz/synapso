'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Victory } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { useVictoryModal } from '@/app/hooks/useVictoryModal';
import { VictoryTimeline, VictoryCard } from '@/app/components/historique';
import { VictoryBottomSheet, VictoryButton, ConfettiRain } from '@/app/components';
import { ChevronIcon } from '@/app/components/ui/icons';
import { cn } from '@/app/utils/cn';

export default function VictoriesPage() {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="max-w-5xl mx-auto pt-2 md:pt-4 pb-20">
      {/* Bouton retour */}
      <div className="px-3 sm:px-6 mb-2">
        <Link 
          href="/historique"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronIcon direction="left" className="w-5 h-5" />
          <span>📋 Historique</span>
        </Link>
      </div>

      <div className="p-3 sm:p-6">
        {/* Header */}
        <div className={cn('flex items-center justify-between mb-6', currentUser?.dominantHand === 'LEFT' && 'flex-row-reverse')}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            🌟 Toutes mes réussites
          </h1>
          {currentUser && (
            <VictoryButton 
              onClick={victoryModal.openForCreate}
              variant="inline"
              label="Ajouter"
            />
          )}
        </div>

        {/* Liste des victoires */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : (
          <VictoryTimeline 
            victories={victories} 
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

