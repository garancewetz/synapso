import { Input, Textarea } from '@/app/components/ui';

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
      <Input
        speech
        label="Nom de l'exercice"
        required
        placeholder="Ex: Montée de genoux"
        value={name}
        onValueChange={onNameChange}
      />

      <Textarea
        speech
        label="Description (optionnel)"
        rows={4}
        placeholder="Décrivez comment réaliser l'exercice..."
        value={descriptionText}
        onValueChange={onDescriptionTextChange}
      />

      <Input
        speech
        label="Conseil ou note (optionnel)"
        placeholder="Ajoutez un conseil ou une remarque..."
        value={descriptionComment}
        onValueChange={onDescriptionCommentChange}
      />
    </>
  );
}
