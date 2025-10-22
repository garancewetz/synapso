'use client';

import { getBgColor, getBgColorLight } from '@/app/utils/colors';
import FilterButton from '../atoms/FilterButton';

interface SidebarProps {
  bodyparts: Array<{
    id: number;
    name: string;
    count: number;
    color: string;
  }>;
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

export default function Sidebar({ bodyparts, equipments, selectedEquipment, onEquipmentSelect, statusFilter, onStatusFilterChange, totalExercices, completedCount, pendingCount }: SidebarProps) {
  return (
    <header className="w-60 border-r border-gray-200 flex flex-col p-4 h-screen overflow-y-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-8">Réeduc' Calypso</h1>
      
   

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
          <span>Exercices</span>
        </h2>
        <ul className="flex flex-col items-start space-y-2">
          {bodyparts.map((data: { id: number; name: string; color: string; count: number }) => (
            <li key={`${data?.id}-${data.name}`} className="w-full hover:text-white">
              <a className={`w-full flex items-center justify-between gap-2 ${getBgColor(data.color, true)} hover:text-white ${getBgColorLight(data.color, false)} transition-colors duration-300 rounded px-2 py-1`} href={`#${data.name}`}>
                <div className={`text-sm  rounded-md px-2 py-1`}>{data.name} </div>
                <div className={`text-sm pr-1`}>{data?.count || ''}</div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Statut</h2>
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
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Équipement</h2>
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

    </header>
  );
}


