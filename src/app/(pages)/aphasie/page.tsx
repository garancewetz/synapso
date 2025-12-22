'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import type { AphasieItem } from '@/app/types';
import { useCalypsoCheck } from '@/app/hooks/useCalypsoCheck';

export const dynamic = 'force-dynamic';

export default function AphasiePage() {
  const [items, setItems] = useState<AphasieItem[]>([]);
  const router = useRouter();
  const { isCalypso } = useCalypsoCheck();

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

  // Ne rien afficher si l'utilisateur n'est pas Calypso
  if (!isCalypso) {
    return null;
  }

  return (
    <div className="mt-4 md:mt-10 px-4 md:px-6">
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
            <div className="mb-3 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="text-lg md:text-xl font-bold text-gray-900 md:w-1/3">{item.quote}</div>
              <div className="text-gray-700 italic text-sm md:text-base">{item.meaning}</div>
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