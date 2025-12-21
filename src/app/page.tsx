'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExerciceCard from '@/app/components/molecules/ExerciceCard';
import EmptyState from '@/app/components/molecules/EmptyState';
import CreateUserCard from '@/app/components/molecules/CreateUserCard';
import CategoryCard from '@/app/components/molecules/CategoryCard';
import AddExerciceButton from '@/app/components/atoms/AddExerciceButton';
import Link from 'next/link';
import Loader from '@/app/components/atoms/Loader';
import type { Exercice } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/app/constants/exercice.constants';
import { useUser } from '@/contexts/UserContext';
import { MOCK_EXERCICES, USE_MOCK_DATA } from '@/datas/mockExercices';
import { isCompletedToday } from '@/utils/resetFrequency.utils';

// Nombre d'exercices visibles par défaut par catégorie
const EXERCICES_LIMIT = 2;

export default function Home() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [loadingExercices, setLoadingExercices] = useState(false);
  const router = useRouter();
  const { currentUser, users, loading: userLoading } = useUser();

  const fetchExercices = () => {
    if (USE_MOCK_DATA) {
      setExercices(MOCK_EXERCICES);
      setLoadingExercices(false);
      return;
    }

    if (!currentUser) return;
    
    setLoadingExercices(true);
    fetch(`/api/exercices?userId=${currentUser.id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setExercices([]);
          return;
        }
        if (Array.isArray(data)) {
          setExercices(data);
        } else {
          setExercices([]);
        }
      })
      .catch(() => {
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
    const now = new Date();
    setExercices(prev => prev.map(ex => {
      if (ex.id === id) {
        const newCompleted = !ex.completed;
        const newCompletedAt = newCompleted ? now : null;
        const newCompletedToday = newCompleted ? isCompletedToday(newCompletedAt, now) : false;
        return { 
          ...ex, 
          completed: newCompleted, 
          completedAt: newCompletedAt,
          completedToday: newCompletedToday,
        };
      }
      return ex;
    }));
  };

  const pinned = exercices.filter(e => e.pinned);

  return (
    <section>
      <div className="max-w-5xl mx-auto">
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
          ) : (
            <div className="space-y-6">
              {/* Cartes de catégories avec jauges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {CATEGORY_ORDER.map(category => {
                  const categoryExercices = exercices.filter(e => e.category === category);
                  if (categoryExercices.length === 0) return null;
                  
                  return (
                    <CategoryCard
                      key={category}
                      category={category}
                      exercices={exercices}
                    />
                  );
                }).filter(Boolean)}
              </div>

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

     
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
