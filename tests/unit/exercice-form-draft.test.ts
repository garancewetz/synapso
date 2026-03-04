import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests des fonctions de brouillon du formulaire d'exercice.
 * Les fonctions sont extraites ici car elles sont privées au module ExerciceForm.
 * On reproduit la logique exacte pour s'assurer qu'elle est correcte.
 */

// Mock localStorage pour l'environnement node
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });
// loadDraft vérifie `typeof window !== 'undefined'` — on doit le rendre disponible en node
if (typeof globalThis.window === 'undefined') {
  (globalThis as Record<string, unknown>).window = globalThis;
}

const EXERCICE_FORM_DRAFT_KEY = 'synapso_exercice_form_draft';
const TOTAL_STEPS = 3;

type FormDataState = {
  name: string;
  descriptionText: string;
  descriptionComment: string;
  workoutRepeat: string;
  workoutSeries: string;
  workoutDuration: string;
  category: string;
  bodyparts: string[];
  equipments: string[];
  media: { photos?: string[]; video?: string } | null;
};

type Draft = {
  formData: FormDataState;
  currentStep: number;
  maxVisitedStep: number;
};

function getDefaultFormData(initialCategory?: string): FormDataState {
  return {
    name: '',
    descriptionText: '',
    descriptionComment: '',
    workoutRepeat: '',
    workoutSeries: '',
    workoutDuration: '',
    category: initialCategory || 'UPPER_BODY',
    bodyparts: [],
    equipments: [],
    media: null,
  };
}

function hasDraft(formData: FormDataState, currentStep: number): boolean {
  if (currentStep > 0) return true;
  if (formData.name.trim()) return true;
  if (formData.descriptionText.trim() || formData.descriptionComment.trim()) return true;
  if (formData.workoutRepeat || formData.workoutSeries || formData.workoutDuration) return true;
  if (formData.bodyparts.length > 0 || formData.equipments.length > 0) return true;
  if (formData.media?.photos?.length || formData.media?.video) return true;
  return false;
}

function loadDraft(initialCategory?: string): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(EXERCICE_FORM_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (
      parsed &&
      typeof parsed.formData === 'object' &&
      typeof parsed.currentStep === 'number' &&
      typeof parsed.maxVisitedStep === 'number' &&
      Number.isInteger(parsed.currentStep) &&
      Number.isInteger(parsed.maxVisitedStep)
    ) {
      return {
        formData: { ...getDefaultFormData(initialCategory), ...parsed.formData, media: null },
        currentStep: Math.min(Math.max(0, parsed.currentStep), TOTAL_STEPS - 1),
        maxVisitedStep: Math.min(Math.max(0, parsed.maxVisitedStep), TOTAL_STEPS - 1),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function saveDraft(draft: Draft): void {
  try {
    const toSave = {
      ...draft,
      formData: { ...draft.formData, media: null },
    };
    localStorage.setItem(EXERCICE_FORM_DRAFT_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(EXERCICE_FORM_DRAFT_KEY);
  } catch {
    // ignore
  }
}

// --- Tests ---

describe('ExerciceForm draft - getDefaultFormData', () => {
  it('returns UPPER_BODY by default', () => {
    const data = getDefaultFormData();
    expect(data.category).toBe('UPPER_BODY');
    expect(data.name).toBe('');
    expect(data.bodyparts).toEqual([]);
    expect(data.media).toBeNull();
  });

  it('uses provided initialCategory', () => {
    expect(getDefaultFormData('STRETCHING').category).toBe('STRETCHING');
  });
});

describe('ExerciceForm draft - hasDraft', () => {
  it('returns false for empty form at step 0', () => {
    expect(hasDraft(getDefaultFormData(), 0)).toBe(false);
  });

  it('returns true if currentStep > 0', () => {
    expect(hasDraft(getDefaultFormData(), 1)).toBe(true);
  });

  it('returns true if name is filled', () => {
    const data = { ...getDefaultFormData(), name: 'Test' };
    expect(hasDraft(data, 0)).toBe(true);
  });

  it('returns true if descriptionText is filled', () => {
    const data = { ...getDefaultFormData(), descriptionText: 'Desc' };
    expect(hasDraft(data, 0)).toBe(true);
  });

  it('returns true if workoutRepeat is filled', () => {
    const data = { ...getDefaultFormData(), workoutRepeat: '10' };
    expect(hasDraft(data, 0)).toBe(true);
  });

  it('returns true if bodyparts are selected', () => {
    const data = { ...getDefaultFormData(), bodyparts: ['bras'] };
    expect(hasDraft(data, 0)).toBe(true);
  });

  it('returns true if media has photos', () => {
    const data = { ...getDefaultFormData(), media: { photos: ['photo1.jpg'] } };
    expect(hasDraft(data, 0)).toBe(true);
  });

  it('returns false for whitespace-only name', () => {
    const data = { ...getDefaultFormData(), name: '   ' };
    expect(hasDraft(data, 0)).toBe(false);
  });
});

describe('ExerciceForm draft - saveDraft / loadDraft / clearDraft', () => {
  beforeEach(() => {
    store.clear();
  });

  it('saveDraft stores data in localStorage', () => {
    const draft: Draft = {
      formData: { ...getDefaultFormData(), name: 'Mon exercice' },
      currentStep: 1,
      maxVisitedStep: 2,
    };
    saveDraft(draft);
    const raw = localStorage.getItem(EXERCICE_FORM_DRAFT_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.formData.name).toBe('Mon exercice');
    expect(parsed.currentStep).toBe(1);
  });

  it('saveDraft strips media from saved data', () => {
    const draft: Draft = {
      formData: { ...getDefaultFormData(), media: { photos: ['a.jpg'], video: 'v.mp4' } },
      currentStep: 0,
      maxVisitedStep: 0,
    };
    saveDraft(draft);
    const parsed = JSON.parse(localStorage.getItem(EXERCICE_FORM_DRAFT_KEY)!);
    expect(parsed.formData.media).toBeNull();
  });

  it('loadDraft returns null when no draft exists', () => {
    expect(loadDraft()).toBeNull();
  });

  it('loadDraft restores saved draft with media set to null', () => {
    const draft: Draft = {
      formData: { ...getDefaultFormData(), name: 'Sauvegardé', media: { photos: ['x.jpg'] } },
      currentStep: 2,
      maxVisitedStep: 2,
    };
    saveDraft(draft);
    const loaded = loadDraft();
    expect(loaded).not.toBeNull();
    expect(loaded!.formData.name).toBe('Sauvegardé');
    expect(loaded!.formData.media).toBeNull();
    expect(loaded!.currentStep).toBe(2);
  });

  it('loadDraft clamps step values to valid range', () => {
    localStorage.setItem(
      EXERCICE_FORM_DRAFT_KEY,
      JSON.stringify({ formData: getDefaultFormData(), currentStep: 99, maxVisitedStep: -5 })
    );
    const loaded = loadDraft();
    expect(loaded!.currentStep).toBe(TOTAL_STEPS - 1);
    expect(loaded!.maxVisitedStep).toBe(0);
  });

  it('loadDraft returns null for malformed JSON', () => {
    localStorage.setItem(EXERCICE_FORM_DRAFT_KEY, 'not valid json');
    expect(loadDraft()).toBeNull();
  });

  it('loadDraft returns null for JSON with missing required fields', () => {
    localStorage.setItem(EXERCICE_FORM_DRAFT_KEY, JSON.stringify({ formData: 'not an object' }));
    expect(loadDraft()).toBeNull();
  });

  it('loadDraft merges with initialCategory when provided', () => {
    const draft: Draft = {
      formData: { ...getDefaultFormData('UPPER_BODY'), name: 'Test' },
      currentStep: 0,
      maxVisitedStep: 0,
    };
    saveDraft(draft);
    const loaded = loadDraft('STRETCHING');
    // Le saved formData.category (UPPER_BODY) écrase le default de STRETCHING
    // car on fait {...getDefaultFormData(initialCategory), ...parsed.formData}
    expect(loaded!.formData.category).toBe('UPPER_BODY');
  });

  it('clearDraft removes the key from localStorage', () => {
    saveDraft({
      formData: getDefaultFormData(),
      currentStep: 0,
      maxVisitedStep: 0,
    });
    expect(localStorage.getItem(EXERCICE_FORM_DRAFT_KEY)).not.toBeNull();
    clearDraft();
    expect(localStorage.getItem(EXERCICE_FORM_DRAFT_KEY)).toBeNull();
  });
});
