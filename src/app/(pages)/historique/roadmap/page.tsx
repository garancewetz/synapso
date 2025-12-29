'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { HistoryEntry } from '@/app/types';
import { useUser } from '@/app/contexts/UserContext';
import { ChevronIcon } from '@/app/components/ui/icons';
import { ActivityHeatmap } from '@/app/components/historique';
import { ROADMAP_FULL_DAYS } from '@/app/constants/historique.constants';
import {
  getHeatmapData,
  calculateCurrentStreak,
} from '@/app/utils/historique.utils';

export default function RoadmapPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { currentUser } = useUser();

  // Fetch de l'historique
  const fetchHistory = useCallback(() => {
    if (!currentUser) return;

    fetch(`/api/history?userId=${currentUser.id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error('API error:', data);
          setHistory([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setHistory([]);
      });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [fetchHistory, currentUser]);

  // Données pour la roadmap complète (90 jours)
  const roadmapData = useMemo(() => {
    return getHeatmapData(history, ROADMAP_FULL_DAYS);
  }, [history]);

  // Série de jours consécutifs
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(roadmapData);
  }, [roadmapData]);

  // Statistiques du parcours
  const realDays = roadmapData.filter(day => !day.isEmpty);
  const daysWithExercises = realDays.filter(day => day.count > 0).length;
  const totalExercises = realDays.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="max-w-3xl mx-auto pt-2 md:pt-4 pb-20">
      {/* Header avec bouton retour */}
      <div className="px-4 md:px-6 mb-6">
        <Link 
          href="/historique"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <ChevronIcon direction="left" className="w-5 h-5" />
          <span>Retour à l&apos;historique</span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
          📜 Mon chemin parcouru
        </h1>
        <p className="text-gray-500 mt-2">
          Les {ROADMAP_FULL_DAYS} derniers jours de ton parcours
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="px-4 md:px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{daysWithExercises}</p>
            <p className="text-xs text-emerald-700">jours actifs</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalExercises}</p>
            <p className="text-xs text-blue-700">exercices</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{currentStreak}</p>
            <p className="text-xs text-amber-700">jours d&apos;affilée</p>
          </div>
        </div>
      </div>

      {/* Roadmap complète */}
      <div className="px-4 md:px-6">
        <ActivityHeatmap 
          data={roadmapData} 
          currentStreak={currentStreak} 
          showFullLink={false}
        />
      </div>
    </div>
  );
}

