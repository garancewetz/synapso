import { NextResponse } from 'next/server';

/**
 * Parse un paramètre d'ID numérique depuis les params de route.
 * Retourne l'id ou une NextResponse 400 si invalide.
 */
export function parseNumericId(
  idParam: string
): { id: number } | NextResponse {
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json(
      { error: 'ID invalide' },
      { status: 400 }
    );
  }
  return { id };
}
