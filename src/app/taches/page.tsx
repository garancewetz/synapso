'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/atoms/Button';
import TacheCard from '@/app/components/molecules/TacheCard';

export default function TachesPage() {
  const [taches, setTaches] = useState<any[]>([]);
  const router = useRouter();

  const fetchTaches = () => {
    fetch('/api/taches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTaches(data);
        } else {
          console.error('API error:', data);
          setTaches([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setTaches([]);
      });
  };

  useEffect(() => {
    fetchTaches();
  }, []);

  const handleEditClick = (id: number) => {
    router.push(`/taches/edit/${id}`);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        const response = await fetch(`/api/taches/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTaches();
        } else {
          console.error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleAddClick = () => {
    router.push('/taches/add');
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Liste de tâches</h1>
          <Button onClick={handleAddClick}>
            Ajouter une tâche
          </Button>
        </div>

        {taches.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucune tâche pour le moment.</p>
            <p className="text-sm mt-2">Cliquez sur "Ajouter une tâche" pour en créer une.</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {taches.map(tache => (
              <TacheCard
                key={tache.id}
                id={tache.id}
                tache={tache}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
