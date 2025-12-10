'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import WelcomeHeader from '@/app/components/molecules/WelcomeHeader';
import CategoryTabs from '@/app/components/molecules/CategoryTabs';
import EmptyState from '@/app/components/molecules/EmptyState';
import Link from 'next/link';
import Loader from '@/app/components/atoms/Loader';
import type { Exercice } from '@/types';
import { ExerciceCategory, CATEGORY_LABELS } from '@/types/exercice';
import { useUser } from '@/contexts/UserContext';
import { useCategory } from '@/contexts/CategoryContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';

// Nombre d'exercices visibles par défaut par catégorie
const EXERCICES_LIMIT = 4;

export default function Home() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loadingExercices, setLoadingExercices] = useState(false);
  const router = useRouter();
  const { currentUser } = useUser();
  const { activeCategory } = useCategory();

  const fetchExercices = () => {
    if (USE_MOCK_DATA) {
      setExercices(MOCK_EXERCICES);
      setLoadingExercices(false);
      return;
    }

    if (!currentUser) return;
    
    setLoadingExercices(true);
    fetch(`/api/exercices?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExercices(data);
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
        setLoadingExercices(false);
      });
  };

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setExercices(MOCK_EXERCICES);
      return;
    }
    
    if (currentUser) {
      fetchExercices();
    } else {
      setLoadingExercices(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Calculer les compteurs par catégorie
  const getCategoryCounts = (): Record<ExerciceCategory, number> => {
    return {
      UPPER_BODY: exercices.filter(e => e.category === 'UPPER_BODY').length,
      LOWER_BODY: exercices.filter(e => e.category === 'LOWER_BODY').length,
      STRETCHING: exercices.filter(e => e.category === 'STRETCHING').length,
    };
  };

  // Filtrer les exercices par catégorie active
  const getFilteredExercices = () => {
    if (!activeCategory) return exercices;
    return exercices.filter(e => e.category === activeCategory);
  };

  // Séparer les exercices épinglés des autres
  const getPinnedAndRegularExercices = () => {
    const filtered = getFilteredExercices();
    return {
      pinned: filtered.filter(e => e.pinned),
      regular: filtered.filter(e => !e.pinned),
    };
  };

  const getTodayCompletedCount = () => {
    return exercices.filter((exercice) => exercice.completed).length;
  };

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

  const { pinned, regular } = getPinnedAndRegularExercices();
  const displayName = USE_MOCK_DATA ? "Calypso" : (currentUser?.name || "");

  return (
    <section className="min-h-screen">
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        
        {/* Banner mode démo */}
        {USE_MOCK_DATA && (
          <div className="mx-4 mb-4 p-3 bg-slate-100 border border-slate-200 rounded-lg text-center">
            <span className="text-slate-600 text-sm font-medium">Mode démonstration — Données fictives</span>
          </div>
        )}

        {/* Header d'accueil avec progression */}
        {!loadingExercices && (
          <WelcomeHeader
            userName={displayName}
            completedToday={getTodayCompletedCount()}
          />
        )}

        {/* Filtres par catégorie (desktop uniquement) */}
        {!loadingExercices && exercices.length > 0 && (
          <CategoryTabs counts={getCategoryCounts()} />
        )}

        {/* Contenu principal */}
        <div className="px-4">
          {loadingExercices ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader size="large" />
            </div>
          ) : exercices.length === 0 ? (
            <EmptyState
              icon="+"
              title="Aucun exercice"
              message="Commencez par ajouter votre premier exercice."
              subMessage="Ouvrez le menu pour créer un exercice."
            />
          ) : getFilteredExercices().length === 0 ? (
            <EmptyState
              icon="📂"
              title={`Aucun exercice ${activeCategory ? CATEGORY_LABELS[activeCategory].toLowerCase() : ''}`}
              message="Cette catégorie est vide pour le moment."
              subMessage="Ajoutez des exercices ou sélectionnez une autre catégorie."
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
                    Mes priorités
                  </h2>
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
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

              {/* Section des exercices par catégorie */}
              {activeCategory ? (
                // Vue filtrée par catégorie - affiche TOUS les exercices
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      {CATEGORY_LABELS[activeCategory]}
                      <span className="text-sm font-normal text-gray-500">
                        ({regular.filter(e => e.completed).length}/{regular.length})
                      </span>
                    </h2>
                  </div>
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
              ) : (
                // Vue "Tous" - toutes les catégories
                (['UPPER_BODY', 'LOWER_BODY', 'STRETCHING'] as ExerciceCategory[]).map(category => {
                  const categoryExercices = regular.filter(e => e.category === category);
                  if (categoryExercices.length === 0) return null;
                  
                  const visibleExercices = categoryExercices.slice(0, EXERCICES_LIMIT);
                  const hiddenCount = categoryExercices.length - EXERCICES_LIMIT;
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          {CATEGORY_LABELS[category]}
                          <span className="text-sm font-normal text-gray-500">
                            ({categoryExercices.filter(e => e.completed).length}/{categoryExercices.length})
                          </span>
                        </h2>
                        {hiddenCount > 0 && (
                          <Link 
                            href={`/exercices/${category.toLowerCase()}`}
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                            scroll={true}
                          >
                            Voir tout
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                        {visibleExercices.map((exercice) => (
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
                      {hiddenCount > 0 && (
                        <Link 
                          href={`/exercices/${category.toLowerCase()}`}
                          className="w-full mt-4 py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          scroll={true}
                        >
                          Voir les {hiddenCount} autres exercices de {CATEGORY_LABELS[category]}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
