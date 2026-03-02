'use client';

import { motion } from 'framer-motion';
import { ExerciceFormCategory } from './ExerciceFormCategory';
import { ExerciceFormBodyparts } from './ExerciceFormBodyparts';
import { ExerciceFormFields } from './ExerciceFormFields';
import { ExerciceFormWorkout } from './ExerciceFormWorkout';
import { ExerciceFormEquipments } from './ExerciceFormEquipments';
import { MediaUploader } from '@/app/components/ui';
import type { ExerciceCategory } from '@/app/types/exercice';
import type { MediaData } from '@/app/types/exercice';

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
  currentStep: number;
  direction: number;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  toggleBodypart: (bodypart: string) => void;
  toggleEquipment: (equipment: string) => void;
  addNewEquipment: (equipment: string) => void;
  allEquipments: string[];
  equipmentIconsMap: Record<string, string>;
  loadingEquipments: boolean;
};

export function ExerciceFormStepContent({
  currentStep,
  direction,
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
    <motion.div
      key={currentStep}
      custom={direction}
      variants={{
        enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
      className="space-y-6"
    >
      {currentStep === 0 && (
        <ExerciceFormFields
          name={formData.name}
          descriptionText={formData.descriptionText}
          descriptionComment={formData.descriptionComment}
          onNameChange={(value) => setFormData({ ...formData, name: value })}
          onDescriptionTextChange={(value) => setFormData({ ...formData, descriptionText: value })}
          onDescriptionCommentChange={(value) => setFormData({ ...formData, descriptionComment: value })}
        />
      )}

      {currentStep === 1 && (
        <>
          <ExerciceFormCategory
            category={formData.category}
            onCategoryChange={(category) => setFormData({ ...formData, category })}
          />
          <ExerciceFormBodyparts
            selectedBodyparts={formData.bodyparts}
            onToggleBodypart={toggleBodypart}
          />
        </>
      )}

      {currentStep === 2 && (
        <>
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
                media: photos.length > 0 ? { ...formData.media, photos } as MediaData : null,
              })
            }
          />
        </>
      )}
    </motion.div>
  );
}
