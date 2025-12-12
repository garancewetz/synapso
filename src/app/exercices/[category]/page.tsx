'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import EmptyState from '@/app/components/molecules/EmptyState';
import Loader from '@/app/components/atoms/Loader';
import type { Exercice } from '@/types';
import { ExerciceCategory, CATEGORY_LABELS } from '@/types/exercice';
import { useUser } from '@/contexts/UserContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';
import Link from 'next/link';

export default function CategoryPage() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { currentUser } = useUser();

  // Convertir le paramètre URL en catégorie
  const categoryParam = (params.category as string)?.toUpperCase() as ExerciceCategory;
  const isValidCategory = ['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'].includes(categoryParam);

  const fetchExercices = () => {
    if (USE_MOCK_DATA) {
      const filtered = MOCK_EXERCICES.filter(e => e.category === categoryParam);
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
          const filtered = data.filter((e: Exercice) => e.category === categoryParam);
          setExercices(filtered);
        } else {
          console.error('API error:', data);
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
    if (!isValidCategory) {
      router.push('/');
      return;
    }

    if (USE_MOCK_DATA) {
      const filtered = MOCK_EXERCICES.filter(e => e.category === categoryParam);
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
  }, [currentUser, categoryParam, isValidCategory]);

  const handleEditClick = (id: number) => {
    router.push(`/exercice/edit/${id}`);
  };

  const handleCompleted = (updatedExercice: Exercice) => {
    if (USE_MOCK_DATA) return;
    // Mettre à jour uniquement l'exercice concerné sans recharger toute la liste
    setExercices(prev => prev.map(ex => 
      ex.id === updatedExercice.id ? updatedExercice : ex
    ));
  };

  // Toggle completion pour le mode mock
  const toggleMockComplete = (id: number) => {
    if (!USE_MOCK_DATA) return;
    setExercices(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed, completedAt: ex.completed ? null : new Date() } : ex
    ));
  };

  // Séparer les exercices épinglés des autres
  const pinned = exercices.filter(e => e.pinned);
  const regular = exercices.filter(e => !e.pinned);
  const completedCount = exercices.filter(e => e.completed).length;

  if (!isValidCategory) {
    return null;
  }

  return (
    <section className="min-h-screen">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        {/* Header avec retour */}
        <div className="px-4 mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {CATEGORY_LABELS[categoryParam]}
          </h1>
          <p className="text-gray-500 mt-1">
            {completedCount}/{exercices.length} exercices complétés
          </p>
        </div>

        {/* Contenu principal */}
        <div className="px-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="large" />
            </div>
          ) : exercices.length === 0 ? (
            <EmptyState
              icon="📂"
              title={`Aucun exercice ${CATEGORY_LABELS[categoryParam].toLowerCase()}`}
              message="Cette catégorie est vide pour le moment."
              subMessage="Ajoutez des exercices depuis le menu."
            />
          ) : (
            <div className="space-y-6">
              {/* Section des exercices épinglés */}
              {pinned.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Priorités
                  </h2>
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    {pinned.map((exercice) => (
                      <div key={exercice.id} onClick={() => toggleMockComplete(exercice.id)}>
                        <ExerciceCard
                          exercice={exercice}
                          onEdit={handleEditClick}
                          onCompleted={handleCompleted}
                          showCategory={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tous les exercices */}
              {regular.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <h2 className="text-base font-semibold text-gray-900 mb-3">
                      Autres exercices
                    </h2>
                  )}
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    {regular.map((exercice) => (
                      <div key={exercice.id} onClick={() => toggleMockComplete(exercice.id)}>
                        <ExerciceCard
                          exercice={exercice}
                          onEdit={handleEditClick}
                          onCompleted={handleCompleted}
                          showCategory={false}
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
