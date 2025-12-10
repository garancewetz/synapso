'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import EmptyState from '@/app/components/molecules/EmptyState';
import Loader from '@/app/components/atoms/Loader';
import type { Exercice } from '@/types';
import { ExerciceCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/exercice';
import { useUser } from '@/contexts/UserContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';

// Emojis pour chaque catégorie
const CATEGORY_ICONS: Record<ExerciceCategory, string> = {
  LOWER_BODY: '🦵',
  UPPER_BODY: '💪',
  STRETCHING: '🧘',
};

export default function CategoryPage() {
  const params = useParams();
  const categoryParam = params.category as string;
  const category = categoryParam?.toUpperCase() as ExerciceCategory;
  
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { currentUser } = useUser();

  // Vérifier que la catégorie est valide
  const isValidCategory = ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'].includes(category);
  const categoryStyle = isValidCategory ? CATEGORY_COLORS[category] : null;

  const fetchExercices = () => {
    if (USE_MOCK_DATA) {
      const filtered = MOCK_EXERCICES.filter(e => e.category === category);
      setExercices(filtered);
      setLoading(false);
      return;
    }

    if (!currentUser) return;
    
    setLoading(true);
    fetch(`/api/exercices?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data.filter((e: Exercice) => e.category === category);
          setExercices(filtered);
        } else {
          setExercices([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setExercices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Scroll en haut de la page
    window.scrollTo(0, 0);
    
    if (!isValidCategory) {
      router.push('/');
      return;
    }

    if (USE_MOCK_DATA) {
      const filtered = MOCK_EXERCICES.filter(e => e.category === category);
      setExercices(filtered);
      setLoading(false);
      return;
    }
    
    if (currentUser) {
      fetchExercices();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, category]);

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}`);
  };

  const handleCompleted = () => {
    if (USE_MOCK_DATA) return;
    fetchExercices();
  };

  // Toggle completion pour le mode mock
  const toggleMockComplete = (id: number) => {
    if (!USE_MOCK_DATA) return;
    setExercices(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed, completedAt: ex.completed ? null : new Date() } : ex
    ));
  };

  // Séparer épinglés et réguliers
  const pinned = exercices.filter(e => e.pinned);
  const regular = exercices.filter(e => !e.pinned);
  const completedCount = exercices.filter(e => e.completed).length;

  if (!isValidCategory) {
    return null;
  }

  return (
    <section className="min-h-screen pb-24">
      <div className="max-w-5xl mx-auto pt-6 md:pt-10">
        
        {/* Header avec retour */}
        <div className="px-4 mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          {/* Titre de la catégorie */}
          <div className={`p-6 rounded-2xl ${categoryStyle?.bg}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{CATEGORY_ICONS[category]}</span>
              <div>
                <h1 className={`text-2xl font-bold ${categoryStyle?.text}`}>
                  {CATEGORY_LABELS[category]}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {completedCount} / {exercices.length} exercices complétés
                </p>
              </div>
            </div>
            
            {/* Barre de progression de la catégorie */}
            <div className="h-2 bg-white/50 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${categoryStyle?.accent}`}
                style={{ width: `${exercices.length > 0 ? (completedCount / exercices.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader size="large" />
            </div>
          ) : exercices.length === 0 ? (
            <EmptyState
              icon={CATEGORY_ICONS[category]}
              title={`Aucun exercice ${CATEGORY_LABELS[category].toLowerCase()}`}
              message="Cette catégorie est vide pour le moment."
              subMessage="Retournez à l'accueil pour ajouter des exercices."
            />
          ) : (
            <div className="space-y-6">
              {/* Exercices épinglés */}
              {pinned.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Priorités
                  </h2>
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {pinned.map((exercice) => (
                      <div key={exercice.id} onClick={() => toggleMockComplete(exercice.id)}>
                        <ExerciceCard
                          exercice={exercice}
                          onEdit={handleEditClick}
                          onCompleted={handleCompleted}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tous les exercices */}
              {regular.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Tous les exercices ({regular.length})
                  </h2>
                  <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {regular.map((exercice) => (
                      <div key={exercice.id} onClick={() => toggleMockComplete(exercice.id)}>
                        <ExerciceCard
                          exercice={exercice}
                          onEdit={handleEditClick}
                          onCompleted={handleCompleted}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
