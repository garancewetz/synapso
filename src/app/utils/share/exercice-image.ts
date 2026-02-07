import type { Exercice } from '@/app/types/exercice';
import { CANVAS_CONFIG, COLORS, TYPOGRAPHY, FONT_FAMILY, SPACING } from './constants';
import { drawRoundedRect, wrapText, canvasToBlob, getCategoryColorsForCanvas } from './canvas.utils';
import {
  drawExerciceName,
  drawBodypartsTags,
  drawEquipmentsTags,
  drawDescription,
  drawWorkoutBadges,
  drawCommentBox,
} from './exercice-image-helpers';

type CardDimensions = {
  width: number;
  height: number;
  cardX: number;
  cardY: number;
  cardWidth: number;
  cardHeight: number;
  contentX: number;
  contentY: number;
  contentWidth: number;
};

/**
 * Crée une image composite reprenant exactement le style d'une carte d'exercice ouverte
 */
export async function createExerciceShareImage(exercice: Exercice): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('createExerciceShareImage ne peut être appelé que côté client');
  }

  if (!exercice || !exercice.name) {
    throw new Error('Exercice invalide: nom manquant');
  }

  const colors = getCategoryColorsForCanvas(exercice.category);
  const dimensions = calculateCardDimensions(exercice);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas');
  }

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  drawCardBackground(ctx, dimensions, colors);
  drawCardContent(ctx, exercice, dimensions, colors);

  return canvasToBlob(canvas);
}

function calculateCardDimensions(exercice: Exercice): CardDimensions {
  const { WIDTH, PADDING, CARD_PADDING, ACCENT_WIDTH, BOTTOM_PADDING } = CANVAS_CONFIG.EXERCICE;
  
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('Impossible de créer le contexte temporaire');
  }

  let currentY = CARD_PADDING;
  const contentWidth = WIDTH - PADDING * 2 - ACCENT_WIDTH - CARD_PADDING * 2;

  tempCtx.font = `${TYPOGRAPHY.EXERCICE_NAME.WEIGHT} ${TYPOGRAPHY.EXERCICE_NAME.SIZE}px ${FONT_FAMILY}`;
  const nameLines = wrapText(tempCtx, exercice.name, contentWidth - 20);
  const nameHeight = nameLines.length * SPACING.LINE_HEIGHT.NORMAL;
  currentY += nameHeight + SPACING.MARGIN.SMALL;

  if ((exercice.bodyparts && exercice.bodyparts.length > 0) || 
      (exercice.equipments && exercice.equipments.length > 0)) {
    currentY += 28 + SPACING.MARGIN.SMALL;
  }

  tempCtx.font = `${TYPOGRAPHY.DESCRIPTION.WEIGHT} ${TYPOGRAPHY.DESCRIPTION.SIZE}px ${FONT_FAMILY}`;
  const descLines = wrapText(tempCtx, exercice.description.text || '', contentWidth - 20);
  const descHeight = descLines.length * SPACING.LINE_HEIGHT.NORMAL;
  currentY += descHeight + SPACING.MARGIN.SMALL;

  const hasWorkout = exercice.workout?.series || exercice.workout?.repeat || exercice.workout?.duration;
  if (hasWorkout) {
    currentY += 28 + SPACING.MARGIN.SMALL;
  }

  if (exercice.description.comment) {
    currentY += 80 + SPACING.MARGIN.SMALL;
  }

  const cardHeight = currentY - CARD_PADDING + CARD_PADDING + BOTTOM_PADDING;
  const height = cardHeight + PADDING * 2;

  return {
    width: WIDTH,
    height,
    cardX: PADDING,
    cardY: PADDING,
    cardWidth: WIDTH - PADDING * 2,
    cardHeight,
    contentX: PADDING + ACCENT_WIDTH + CARD_PADDING,
    contentY: PADDING + CARD_PADDING,
    contentWidth: WIDTH - PADDING * 2 - ACCENT_WIDTH - CARD_PADDING * 2,
  };
}

function drawCardBackground(
  ctx: CanvasRenderingContext2D,
  dimensions: CardDimensions,
  colors: { accent: string; tagBg: string; tagText: string }
): void {
  const { cardX, cardY, cardWidth, cardHeight } = dimensions;
  const { BORDER_RADIUS, ACCENT_WIDTH } = CANVAS_CONFIG.EXERCICE;

  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, dimensions.width, dimensions.height);

  ctx.shadowColor = COLORS.SHADOW;
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.fillStyle = COLORS.BACKGROUND;
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, BORDER_RADIUS);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = COLORS.BORDER;
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, BORDER_RADIUS);
  ctx.stroke();

  ctx.fillStyle = colors.accent;
  ctx.fillRect(cardX, cardY, ACCENT_WIDTH, cardHeight);
}

function drawCardContent(
  ctx: CanvasRenderingContext2D,
  exercice: Exercice,
  dimensions: CardDimensions,
  colors: { accent: string; tagBg: string; tagText: string }
): void {
  let contentY = dimensions.contentY;

  contentY = drawExerciceName(ctx, exercice.name, dimensions.contentX, contentY, dimensions.contentWidth);
  contentY = drawBodypartsTags(ctx, exercice, dimensions.contentX, contentY, colors);
  contentY = drawEquipmentsTags(ctx, exercice, dimensions.contentX, contentY);
  contentY = drawDescription(ctx, exercice.description.text, dimensions.contentX, contentY, dimensions.contentWidth);
  contentY = drawWorkoutBadges(ctx, exercice, dimensions.contentX, contentY);
  drawCommentBox(ctx, exercice.description.comment || undefined, dimensions.contentX, contentY, dimensions.contentWidth);
}

