// Components
export { ExerciceCard } from './components/ExerciceCard';
export { ExerciceForm } from './components/ExerciceForm';
export { ExerciceCardHeader } from './components/ExerciceCardHeader';
export { ExerciceCardExpandable } from './components/ExerciceCardExpandable';
export { ExerciceCardTags } from './components/ExerciceCardTags';
export { ExerciceTags } from './components/ExerciceTags';
export { ExerciceMedia } from './components/ExerciceMedia';
export { CategoryCardWithProgress } from './components/CategoryCardWithProgress';
export { CategoryAffinerSection } from './components/CategoryAffinerSection';
export { CategoryActiveFiltersBar } from './components/CategoryActiveFiltersBar';
export { DailyGoalProgress } from './components/DailyGoalProgress';

// ExerciceForm sub-components
export { ExerciceFormCategory } from './components/ExerciceForm/ExerciceFormCategory';
export { ExerciceFormBodyparts } from './components/ExerciceForm/ExerciceFormBodyparts';
export { ExerciceFormFields } from './components/ExerciceForm/ExerciceFormFields';
export { ExerciceFormWorkout } from './components/ExerciceForm/ExerciceFormWorkout';
export { ExerciceFormEquipments } from './components/ExerciceForm/ExerciceFormEquipments';

// Hooks
export { useExercices } from './hooks/useExercices';
export { useCompleteExercice } from './hooks/useCompleteExercice';
export { usePinExercice } from './hooks/usePinExercice';
export { useArchiveExercice } from './hooks/useArchiveExercice';
export { useExerciceHandlers } from './hooks/useExerciceHandlers';
export { useExerciceStatusFilter } from './hooks/useExerciceStatusFilter';
export { useCategoryFilters } from './hooks/useCategoryFilters';
export { useCategoryActiveFiltersBarHandlers } from './hooks/useCategoryActiveFiltersBarHandlers';
export { useCategoryStats } from './hooks/useCategoryStats';
export { useTodayCompletedCount } from './hooks/useTodayCompletedCount';
export { useShareExercice } from './hooks/useShareExercice';
export { useRelatedStretchingByCategory } from './hooks/useRelatedStretchingByCategory';

// Utils
export * from './utils/exercice-complete.utils';

// Celebration components
export { GlobalCelebration } from './components/GlobalCelebration';
export { ConfettiRain } from './components/ConfettiRain';
export { ConfettiExplosion } from './components/ConfettiExplosion';
export { ConfettiValidate } from './components/ConfettiValidate';
