import { useState } from 'react';
import { CheckIcon } from '@/app/components/ui/icons';
import { Loader } from '@/app/components';
import clsx from 'clsx';

type Props = {
  selectedEquipments: string[];
  allEquipments: string[];
  equipmentIconsMap: Record<string, string>;
  loadingEquipments: boolean;
  onToggleEquipment: (equipment: string) => void;
  onAddEquipment: (equipment: string) => void;
};

export function ExerciceFormEquipments({
  selectedEquipments,
  allEquipments,
  equipmentIconsMap,
  loadingEquipments,
  onToggleEquipment,
  onAddEquipment,
}: Props) {
  const [newEquipment, setNewEquipment] = useState('');

  const handleAddNewEquipment = () => {
    const trimmedEquipment = newEquipment.trim();
    if (trimmedEquipment && !selectedEquipments.includes(trimmedEquipment)) {
      onAddEquipment(trimmedEquipment);
      setNewEquipment('');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6">
      <label className="block text-base font-semibold text-gray-800 mb-4">
        Équipements (optionnel)
      </label>
      <p className="text-sm text-gray-500 mb-4">Sélectionnez un ou plusieurs équipements (optionnel)</p>
      
      {loadingEquipments ? (
        <div className="flex items-center justify-center py-8">
          <Loader size="small" />
        </div>
      ) : allEquipments.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {allEquipments.map((equipmentName) => {
            const isSelected = selectedEquipments.includes(equipmentName);
            const icon = equipmentIconsMap[equipmentName];
            return (
              <button
                key={equipmentName}
                type="button"
                onClick={() => onToggleEquipment(equipmentName)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'flex items-center gap-2 min-w-0',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                  'active:scale-[0.98]',
                  isSelected
                    ? 'bg-gray-800 text-white ring-2 ring-offset-2 ring-gray-400'
                    : 'bg-white text-gray-700 border border-gray-200 md:hover:ring-2 md:hover:ring-gray-300/50 md:hover:ring-offset-2'
                )}
                aria-label={`${isSelected ? 'Désélectionner' : 'Sélectionner'} ${equipmentName}`}
                aria-pressed={isSelected}
              >
                <span className="text-base">{icon}</span>
                <span className="flex-1 text-left truncate">{equipmentName}</span>
                {isSelected && (
                  <CheckIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4 mb-4">
          Aucun équipement disponible pour le moment
        </p>
      )}

      <div className="pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          Ajouter un nouvel équipement :
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Nom de l'équipement..."
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNewEquipment();
              }
            }}
            className="px-4 h-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Nom du nouvel équipement"
          />
          <button
            type="button"
            onClick={handleAddNewEquipment}
            disabled={!newEquipment.trim()}
            className={clsx(
              'px-4 h-10 rounded-lg transition-colors font-medium sm:w-auto w-full',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              newEquipment.trim()
                ? 'bg-gray-800 text-white hover:bg-gray-700 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
