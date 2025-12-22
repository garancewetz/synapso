// Les 4 catégories simples pour les exercices
export type ExerciceCategory = 'UPPER_BODY' | 'LOWER_BODY' | 'STRETCHING' | 'CORE';

export interface Exercice {
  id: number;
  name: string;
  description: {
    text: string;
    comment: string | null;
  };
  workout: {
    repeat: string | null;
    series: string | null;
    duration: string | null;
  };
  equipments: string[];
  bodyparts: string[];  // Parties du corps ciblées
  category: ExerciceCategory;
  completed: boolean; // Complété dans la période (jour ou semaine selon resetFrequency)
  completedToday: boolean; // Complété aujourd'hui (pour la gauge)
  completedAt: Date | null;
  pinned: boolean;
}

export interface Bodypart {
  id: number;
  name: string;
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
  count: number;
}

export interface Metadata {
  categories: ExerciceCategory[];
  equipments: string[];
}
