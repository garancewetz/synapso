import { z } from 'zod';
import { parse, isValid } from 'date-fns';

// --- Schémas réutilisables ---

export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format attendu : yyyy-MM-dd')
  .refine((val) => isValid(parse(val, 'yyyy-MM-dd', new Date())), {
    message: 'Date invalide',
  });

const exerciceCategorySchema = z.enum([
  'UPPER_BODY',
  'LOWER_BODY',
  'STRETCHING',
  'CORE',
  'FACE',
]);

const resetFrequencySchema = z.enum(['DAILY', 'WEEKLY']);

const dominantHandSchema = z.enum(['LEFT', 'RIGHT']);

const mediaItemSchema = z.object({
  url: z.string().max(500),
  publicId: z.string().max(500),
});

// --- Schémas par route ---

export const createExerciceSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire').max(200).transform((v) => v.trim()),
  description: z
    .object({
      text: z.string().max(5000).default(''),
      comment: z.string().max(5000).nullable().optional(),
    })
    .optional(),
  workout: z
    .object({
      repeat: z.string().max(200).nullable().optional(),
      series: z.string().max(200).nullable().optional(),
      duration: z.string().max(200).nullable().optional(),
    })
    .optional(),
  category: exerciceCategorySchema.default('UPPER_BODY'),
  bodyparts: z.array(z.string().max(100)).max(50).default([]),
  equipments: z.array(z.string().max(100).trim()).max(50).default([]),
  media: z.array(mediaItemSchema).max(10).nullable().optional(),
  createdAt: z.string().optional(),
});

export const updateExerciceSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire').max(200).transform((v) => v.trim()).optional(),
  description: z
    .object({
      text: z.string().max(5000).default(''),
      comment: z.string().max(5000).nullable().optional(),
    })
    .optional(),
  workout: z
    .object({
      repeat: z.string().max(200).nullable().optional(),
      series: z.string().max(200).nullable().optional(),
      duration: z.string().max(200).nullable().optional(),
    })
    .optional(),
  category: exerciceCategorySchema.optional(),
  bodyparts: z.array(z.string().max(100)).max(50).optional(),
  equipments: z.array(z.string().max(100).trim()).max(50).optional(),
  media: z.array(mediaItemSchema).max(10).nullable().optional(),
  resetFrequency: resetFrequencySchema.optional(),
  pinned: z.boolean().optional(),
  mastered: z.boolean().optional(),
});

export const completeExerciceSchema = z.object({
  completedAt: dateKeySchema.optional(),
  resetFrequency: resetFrequencySchema.default('DAILY'),
});

export const createProgressSchema = z.object({
  content: z.string().min(1, 'Le contenu est obligatoire').max(5000).transform((v) => v.trim()),
  emoji: z.string().max(10).nullable().optional(),
  tags: z.array(z.string().max(100)).max(20).default([]),
  medias: z.array(z.string().max(500)).max(10).default([]),
});

export const updateProgressSchema = z.object({
  content: z.string().min(1, 'Le contenu est obligatoire').max(5000).transform((v) => v.trim()),
  emoji: z.string().max(10).nullable().optional(),
  tags: z.array(z.string().max(100)).max(20).optional(),
  medias: z.array(z.string().max(500)).max(10).optional(),
});

export const createJournalNoteSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(200).transform((v) => v.trim()),
  description: z.string().max(5000).optional().transform((v) => v?.trim() ?? ''),
  media: z.array(mediaItemSchema).max(10).optional(),
  exerciceIds: z.array(z.number().int().positive()).max(50).optional(),
});

export const updateJournalNoteSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(200).transform((v) => v.trim()),
  description: z.string().max(5000).optional().transform((v) => v?.trim()),
  media: z.array(mediaItemSchema).max(10).optional(),
  exerciceIds: z.array(z.number().int().positive()).max(50).optional(),
});

export const createShareSchema = z.object({
  exerciceId: z.number().int().positive('exerciceId requis'),
  receiverId: z.number().int().positive('receiverId requis'),
});

export const respondToShareSchema = z.object({
  action: z.enum(['ACCEPTED', 'REJECTED'], {
    message: 'action doit être ACCEPTED ou REJECTED',
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).transform((v) => v.trim()).refine((v) => !v.includes(' '), {
    message: 'Le nom ne peut pas contenir d\'espaces',
  }).optional(),
  resetFrequency: resetFrequencySchema.optional(),
  dominantHand: dominantHandSchema.optional(),
  hasJournal: z.boolean().optional(),
  dailyGoal: z.number().int().min(1).max(50).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel obligatoire').max(128),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères').max(128),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .max(100)
    .transform((v) => v.trim())
    .refine((v) => !v.includes(' '), { message: 'Le nom ne peut pas contenir d\'espaces' }),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128),
  invitationCode: z.string().default(''),
  resetFrequency: resetFrequencySchema.optional(),
  dominantHand: dominantHandSchema.optional(),
  hasJournal: z.boolean().optional(),
});

// --- Helper de validation ---

import { NextResponse } from 'next/server';

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T } | NextResponse {
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  return { data: result.data };
}

// --- Validation Content-Type ---

export function requireJsonContentType(request: Request): NextResponse | null {
  const ct = request.headers.get('content-type');
  if (!ct || !ct.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type application/json requis' },
      { status: 415 }
    );
  }
  return null;
}
