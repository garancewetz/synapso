import { TextareaWithSpeech, InputWithSpeech } from '@/app/components/ui';

type Props = {
  name: string;
  descriptionText: string;
  descriptionComment: string;
  onNameChange: (value: string) => void;
  onDescriptionTextChange: (value: string) => void;
  onDescriptionCommentChange: (value: string) => void;
};

export function ExerciceFormFields({
  name,
  descriptionText,
  descriptionComment,
  onNameChange,
  onDescriptionTextChange,
  onDescriptionCommentChange,
}: Props) {
  return (
    <>
      <InputWithSpeech
        label="Nom de l'exercice"
        required
        placeholder="Ex: Montée de genoux"
        value={name}
        onValueChange={onNameChange}
      />

      <TextareaWithSpeech
        label="Description (optionnel)"
        rows={4}
        placeholder="Décrivez comment réaliser l'exercice..."
        value={descriptionText}
        onValueChange={onDescriptionTextChange}
      />

      <InputWithSpeech
        label="Conseil ou note (optionnel)"
        placeholder="Ajoutez un conseil ou une remarque..."
        value={descriptionComment}
        onValueChange={onDescriptionCommentChange}
      />
    </>
  );
}
