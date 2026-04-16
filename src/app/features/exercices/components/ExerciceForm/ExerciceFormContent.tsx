'use client';

import { ExerciceFormCategory } from './ExerciceFormCategory';
import { ExerciceFormBodyparts } from './ExerciceFormBodyparts';
import { ExerciceFormFields } from './ExerciceFormFields';
import { ExerciceFormWorkout } from './ExerciceFormWorkout';
import { ExerciceFormEquipments } from './ExerciceFormEquipments';
import { MediaUploader } from '@/app/components/ui';
import type { ExerciceCategory, MediaData } from '@/app/types/exercice';

type FormData = {
  name: string;
  descriptionText: string;
  descriptionComment: string;
  workoutRepeat: string;
  workoutSeries: string;
  workoutDuration: string;
  category: ExerciceCategory;
  bodyparts: string[];
  equipments: string[];
  media: MediaData | null;
};

type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  toggleBodypart: (bodypart: string) => void;
  toggleEquipment: (equipment: string) => void;
  addNewEquipment: (equipment: string) => void;
  allEquipments: string[];
  equipmentIconsMap: Record<string, string>;
  loadingEquipments: boolean;
};

export function ExerciceFormContent({
  formData,
  setFormData,
  toggleBodypart,
  toggleEquipment,
  addNewEquipment,
  allEquipments,
  equipmentIconsMap,
  loadingEquipments,
}: Props) {
  return (
    <div className="space-y-8">
      <ExerciceFormFields
        name={formData.name}
        descriptionText={formData.descriptionText}
        descriptionComment={formData.descriptionComment}
        onNameChange={(value) => setFormData({ ...formData, name: value })}
        onDescriptionTextChange={(value) => setFormData({ ...formData, descriptionText: value })}
        onDescriptionCommentChange={(value) => setFormData({ ...formData, descriptionComment: value })}
      />

      <ExerciceFormCategory
        category={formData.category}
        onCategoryChange={(category) => setFormData({ ...formData, category })}
      />
      <ExerciceFormBodyparts
        selectedBodyparts={formData.bodyparts}
        onToggleBodypart={toggleBodypart}
      />

      <ExerciceFormWorkout
        workoutRepeat={formData.workoutRepeat}
        workoutSeries={formData.workoutSeries}
        workoutDuration={formData.workoutDuration}
        onWorkoutRepeatChange={(value) => setFormData({ ...formData, workoutRepeat: value })}
        onWorkoutSeriesChange={(value) => setFormData({ ...formData, workoutSeries: value })}
        onWorkoutDurationChange={(value) => setFormData({ ...formData, workoutDuration: value })}
      />
      <ExerciceFormEquipments
        selectedEquipments={formData.equipments}
        allEquipments={allEquipments}
        equipmentIconsMap={equipmentIconsMap}
        loadingEquipments={loadingEquipments}
        onToggleEquipment={toggleEquipment}
        onAddEquipment={addNewEquipment}
      />
      <MediaUploader
        value={formData.media?.photos || []}
        onChange={(photos) =>
          setFormData({
            ...formData,
            media: photos.length > 0 ? { video: formData.media?.video, photos } : null,
          })
        }
      />
    </div>
  );
}
