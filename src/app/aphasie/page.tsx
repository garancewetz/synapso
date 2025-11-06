'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/atoms/Button';

export default function AphasiePage() {
  const [items, setItems] = useState<any[]>([]);
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
    router.push(`/aphasie/edit/${id}`);
  };

  const handleAddClick = () => {
    router.push('/aphasie/add');
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

    </div>
  );
}