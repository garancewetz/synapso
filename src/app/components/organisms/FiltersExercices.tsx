
import FilterButton from '../atoms/FilterButton';
interface FiltersExercicesProps {
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
    isOpen?: boolean;
    onClose?: () => void;
  }

export default function FiltersExercices({ equipments, selectedEquipment, onEquipmentSelect, statusFilter, onStatusFilterChange, totalExercices, completedCount, pendingCount }: FiltersExercicesProps) {
  return (
    <div>
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
      
    </div>
  );
}