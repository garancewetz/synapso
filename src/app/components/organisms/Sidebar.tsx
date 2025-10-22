'use client';

import { usePathname } from 'next/navigation';
import FilterButton from '../atoms/FilterButton';
import Logo from '../atoms/Logo';
import Link from 'next/link';

interface SidebarProps {
  equipments: Array<{
    name: string;
    count: number;
  }>;
  selectedEquipment: string | null;
  onEquipmentSelect: (equipment: string | null) => void;
  statusFilter: 'all' | 'completed' | 'pending';
  onStatusFilterChange: (status: 'all' | 'completed' | 'pending') => void;
  totalExercices: number;
  completedCount: number;
  pendingCount: number;
}

export default function Sidebar({ equipments, selectedEquipment, onEquipmentSelect, statusFilter, onStatusFilterChange, totalExercices, completedCount, pendingCount }: SidebarProps) {
  const pathname = usePathname();
  
  return (
    <header className="w-60 border-r border-gray-200 flex flex-col p-4 h-screen overflow-y-auto">
      <Logo size={50} className="mb-8" />
      
      <div className="mb-8">
        <nav className="flex flex-col gap-2">
          <Link 
            href="/" 
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === '/' 
                ? 'text-gray-900 bg-blue-50 border border-blue-200' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Exercices
          </Link>
          <Link 
            href="/historique" 
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === '/historique' 
                ? 'text-gray-900 bg-blue-50 border border-blue-200' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Historique
          </Link>
        </nav>
      </div>
   


      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Filtres</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Statut</h3>
            <div className="flex flex-col gap-2">
              <FilterButton
                isActive={statusFilter === 'all'}
                onClick={() => onStatusFilterChange('all')}
                label="Tous"
                count={totalExercices}
              />

              <FilterButton
                isActive={statusFilter === 'completed'}
                onClick={() => onStatusFilterChange('completed')}
                label="Complétés"
                count={completedCount}
              />

              <FilterButton
                isActive={statusFilter === 'pending'}
                onClick={() => onStatusFilterChange('pending')}
                label="À compléter"
                count={pendingCount}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Équipement</h3>
            <div className="flex flex-col gap-2">
              <FilterButton
                isActive={selectedEquipment === null}
                onClick={() => onEquipmentSelect(null)}
                label="Tous"
              />
              {equipments.map((equipment) => (
                <FilterButton
                  key={equipment.name}
                  isActive={selectedEquipment === equipment.name}
                  onClick={() => onEquipmentSelect(equipment.name)}
                  label={equipment.name}
                  count={equipment.count}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}


