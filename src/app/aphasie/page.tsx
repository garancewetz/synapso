'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasswordModal from '@/app/components/atoms/PasswordModal';
import Button from '@/app/components/atoms/Button';

export default function AphasiePage() {
  const [items, setItems] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'add' | 'edit' | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const router = useRouter();

  const fetchItems = () => {
    fetch('/api/aphasie')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Trier par date (plus récente d'abord), utiliser createdAt si date n'est pas renseignée
          const sortedItems = data.sort((a, b) => {
            const dateA = a.date || a.createdAt;
            const dateB = b.date || b.createdAt;
            // Comparer les dates (plus récente d'abord = décroissant)
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          });
          setItems(sortedItems);
        } else {
          console.error('API error:', data);
          setItems([]);
        }
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setItems([]);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditClick = (id: number) => {
    setPendingAction('edit');
    setPendingId(id);
    setShowPasswordModal(true);
  };

  const handleAddClick = () => {
    setPendingAction('add');
    setPendingId(null);
    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = () => {
    if (pendingAction === 'add') {
      router.push('/aphasie/add');
    } else if (pendingAction === 'edit' && pendingId) {
      router.push(`/aphasie/edit/${pendingId}`);
    }
    setShowPasswordModal(false);
    setPendingAction(null);
    setPendingId(null);
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPendingAction(null);
    setPendingId(null);
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50">
      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="bg-white px-4 py-3 rounded-lg border border-gray-200">
            <div className="mb-3 flex items-center space-x-6">
              <div className="text-xl font-bold text-gray-900 w-1/3">{item.quote}</div>
              <div className="text-gray-700 italic">{item.meaning}</div>
            </div>
            {item.comment && (
              <div className="mb-2 text-xs text-gray-400 italic">{item.comment}</div>
            )}
            <div className="flex items-center">
              {item.date && (
                <div className="text-sm text-gray-600 font-medium">{item.date}</div>
              )}
              <button
                onClick={() => handleEditClick(item.id)}
                className="ml-auto cursor-pointer text-xs text-gray-400 hover:text-gray-600"
              >
                Modifier
              </button>
            </div>
          </li>
        ))}
      </ul>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handlePasswordModalClose}
        onSuccess={handlePasswordSuccess}
        title={pendingAction === 'add' ? 'Accès Admin - Ajouter un item d\'aphasie' : 'Accès Admin - Modifier un item d\'aphasie'}
      />
    </div>
  );
}