'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/atoms/Button';
import type { AphasieItem } from '@/types';

export default function AphasiePage() {
  const [items, setItems] = useState<AphasieItem[]>([]);
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

  return (
    <div className="mt-10">
      <div className='flex justify-center mb-6'>

      <Link href="/aphasie/add">
        <Button>
          Ajouter une citation
          </Button>
          
        </Link>
      </div>
      <ul className="space-y-4 mt-6">
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