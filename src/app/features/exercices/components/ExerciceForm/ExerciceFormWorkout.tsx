import { InputWithSpeech } from '@/app/components/ui';

type Props = {
  workoutRepeat: string;
  workoutSeries: string;
  workoutDuration: string;
  onWorkoutRepeatChange: (value: string) => void;
  onWorkoutSeriesChange: (value: string) => void;
  onWorkoutDurationChange: (value: string) => void;
};

export function ExerciceFormWorkout({
  workoutRepeat,
  workoutSeries,
  workoutDuration,
  onWorkoutRepeatChange,
  onWorkoutSeriesChange,
  onWorkoutDurationChange,
}: Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 md:p-6">
      <label className="block text-base font-semibold text-gray-800 mb-4">
        Paramètres de l&apos;exercice (optionnel)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <InputWithSpeech
          label="Répétitions"
          placeholder="Ex: 10"
          value={workoutRepeat}
          onValueChange={onWorkoutRepeatChange}
        />

        <InputWithSpeech
          label="Séries"
          placeholder="Ex: 3"
          value={workoutSeries}
          onValueChange={onWorkoutSeriesChange}
        />

        <InputWithSpeech
          label="Durée"
          placeholder="Ex: 30 secondes"
          value={workoutDuration}
          onValueChange={onWorkoutDurationChange}
        />
      </div>
    </div>
  );
}
