export interface Bodypart {
  id: number;
  name: string;
  color: string;
}

export interface Exercice {
  id: number;
  name: string;
  description: {
    text: string;
    comment: string | null;
  };
  workout: {
    repeat: number | null;
    series: number | null;
    duration: string | null;
  };
  equipments: string[];
  bodyparts: Bodypart[];
  completed: boolean;
  completedAt: Date | null;
  pinned: boolean;
}

export interface BodypartWithCount extends Bodypart {
  count: number;
}

export interface BodypartWithExercices extends BodypartWithCount {
  exercices: Exercice[];
}

export interface BodypartSection {
  id: number;
  name: string;
  color: string;
  count: number;
}

export interface Metadata {
  bodyparts: string[];
  equipments: string[];
}

