'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import CategoryTabs from '@/app/components/molecules/CategoryTabs';
import EmptyState from '@/app/components/molecules/EmptyState';
import CreateUserCard from '@/app/components/molecules/CreateUserCard';
import AddExerciceButton from '@/app/components/atoms/AddExerciceButton';
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
  const { currentUser, users, loading: userLoading } = useUser();
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
      setLoadingExercices(false);
      return;
    }
    
    // Attendre que le UserContext ait fini de charger
    if (userLoading) {
      setLoadingExercices(true);
      return;
    }
    
    if (currentUser) {
      fetchExercices();
    } else {
      setLoadingExercices(false);
      setExercices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userLoading]);

  // Calculer les compteurs par catégorie
  const getCategoryCounts = (): Record<ExerciceCategory, number> => {
    return {
      UPPER_BODY: exercices.filter(e => e.category === 'UPPER_BODY').length,
      CORE: exercices.filter(e => e.category === 'CORE').length,
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

  const { pinned, regular } = getPinnedAndRegularExercices();

  return (
    <section>
      <div className="max-w-5xl mx-auto pt-2 md:pt-4">
        
        {/* Filtres par catégorie (desktop uniquement) */}
        {!loadingExercices && exercices.length > 0 && (
          <CategoryTabs counts={getCategoryCounts()} />
        )}

        {/* Contenu principal */}
        <div className="px-3 md:px-4">
          {loadingExercices || userLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size="large" />
            </div>
          ) : users.length === 0 ? (
            <div className="max-w-md mx-auto py-8">
              <CreateUserCard />
            </div>
          ) : exercices.length === 0 ? (
            <EmptyState
              icon="+"
              title="Aucun exercice"
              message="Commencez par ajouter votre premier exercice."
              subMessage="Cliquez sur le bouton ci-dessous pour créer un exercice."
              actionHref="/exercice/add"
              actionLabel="Créer mon premier exercice"
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
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Mes priorités
                    </h2>
                    <AddExerciceButton />
                  </div>
                  <div className="grid gap-2.5 md:gap-3 grid-cols-1 lg:grid-cols-2">
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

              {/* Section des exercices par catégorie */}
              {activeCategory ? (
                // Vue filtrée par catégorie - affiche TOUS les exercices
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      {CATEGORY_LABELS[activeCategory]}
                      <span className="text-xs md:text-sm font-normal text-gray-500">
                        ({regular.filter(e => e.completed).length}/{regular.length})
                      </span>
                    </h2>
                    <AddExerciceButton category={activeCategory} />
                  </div>
                  <div className="grid gap-2.5 md:gap-3 grid-cols-1 lg:grid-cols-2">
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
                (['UPPER_BODY', 'CORE', 'LOWER_BODY', 'STRETCHING'] as ExerciceCategory[]).map(category => {
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
                        <div className="flex items-center gap-2">
                          <AddExerciceButton category={category} />
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
                      </div>
                      <div className="grid gap-2.5 md:gap-3 grid-cols-1 lg:grid-cols-2">
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
                          className="w-full mt-3 md:mt-4 py-2.5 md:py-3 px-3 md:px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium text-xs md:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          scroll={true}
                        >
                          Voir les {hiddenCount} autres exercices de {CATEGORY_LABELS[category]}
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
