import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAuth, getEffectiveUserId } from '@/app/lib/auth';
import { logError } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const items = await prisma.aphasieItem.findMany({
      where: {
        userId: userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    logError('Error fetching aphasie items', error);
    return NextResponse.json(
      { error: 'Failed to fetch aphasie items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Récupérer l'userId effectif depuis le cookie
    const userId = await getEffectiveUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { quote, meaning, date, comment } = data;

    // Constantes de validation
    const MAX_QUOTE_LENGTH = 1000;
    const MAX_MEANING_LENGTH = 2000;
    const MAX_COMMENT_LENGTH = 5000;

    if (!quote || !meaning) {
      return NextResponse.json(
        { error: 'quote and meaning are required' },
        { status: 400 }
      );
    }

    const trimmedQuote = quote.trim();
    const trimmedMeaning = meaning.trim();

    if (!trimmedQuote || !trimmedMeaning) {
      return NextResponse.json(
        { error: 'quote and meaning cannot be empty' },
        { status: 400 }
      );
    }

    // Valider les longueurs maximales
    if (trimmedQuote.length > MAX_QUOTE_LENGTH) {
      return NextResponse.json(
        { error: `La citation ne peut pas dépasser ${MAX_QUOTE_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (trimmedMeaning.length > MAX_MEANING_LENGTH) {
      return NextResponse.json(
        { error: `La signification ne peut pas dépasser ${MAX_MEANING_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (comment && comment.trim().length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères` },
        { status: 400 }
      );
    }

    // Convertir la date string (YYYY-MM-DD) en DateTime si fournie
    let dateValue: Date | null = null;
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        dateValue = parsedDate;
      }
    }

    const item = await prisma.aphasieItem.create({
      data: {
        quote: trimmedQuote,
        meaning: trimmedMeaning,
        date: dateValue,
        comment: comment ? comment.trim() : null,
        userId: userId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    logError('Error creating aphasie item', error);
    return NextResponse.json(
      { error: 'Failed to create aphasie item' },
      { status: 500 }
    );
  }
}
