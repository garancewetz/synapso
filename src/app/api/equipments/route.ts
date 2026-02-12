import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';
import { getEquipments } from '@/app/features/exercices/api';

/**
 * Route API pour récupérer tous les équipements uniques de la base de données
 * (tous les utilisateurs confondus)
 */
export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const result = await getEquipments();
    return NextResponse.json(result);
  } catch (error) {
    logError('Error fetching all equipments', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipments' },
      { status: 500 }
    );
  }
}

