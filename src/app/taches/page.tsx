'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasswordModal from '@/app/components/atoms/PasswordModal';
import Button from '@/app/components/atoms/Button';
import TacheCard from '@/app/components/molecules/TacheCard';

export default function TachesPage() {
  const [taches, setTaches] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
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
    setPendingAction('edit');
    setPendingId(id);
    setShowPasswordModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setPendingAction('delete');
    setPendingId(id);
    setShowPasswordModal(true);
  };

  const handleAddClick = () => {
    setPendingAction('add');
    setPendingId(null);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = async () => {
    if (pendingAction === 'add') {
      router.push('/taches/add');
      setShowPasswordModal(false);
      setPendingAction(null);
      setPendingId(null);
    } else if (pendingAction === 'edit' && pendingId) {
      router.push(`/taches/edit/${pendingId}`);
      setShowPasswordModal(false);
      setPendingAction(null);
      setPendingId(null);
    } else if (pendingAction === 'delete' && pendingId) {
      const idToDelete = pendingId;
      setShowPasswordModal(false);
      setPendingAction(null);
      setPendingId(null);
      await handleDelete(idToDelete);
    }
  };

  const handleDelete = async (id: number) => {
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
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingAction(null);
    setPendingId(null);
  };

  const getModalTitle = () => {
    if (pendingAction === 'add') return 'Accès Admin - Ajouter une tâche';
    if (pendingAction === 'edit') return 'Accès Admin - Modifier une tâche';
    if (pendingAction === 'delete') return 'Accès Admin - Supprimer une tâche';
    return '';
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

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onSuccess={handlePasswordSuccess}
        title={getModalTitle()}
      />
    </div>
  );
}
