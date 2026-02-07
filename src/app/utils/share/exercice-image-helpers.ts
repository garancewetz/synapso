import type { Exercice } from '@/app/types/exercice';
import { TYPOGRAPHY, COLORS, FONT_FAMILY, SPACING } from './constants';
import { drawRoundedRect, wrapText } from './canvas.utils';

type DrawingContext = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  maxWidth: number;
  colors: { accent: string; tagBg: string; tagText: string };
};

/**
 * Dessine le nom de l'exercice
 */
export function drawExerciceName(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  maxWidth: number
): number {
  ctx.font = `${TYPOGRAPHY.EXERCICE_NAME.WEIGHT} ${TYPOGRAPHY.EXERCICE_NAME.SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.TEXT_GRAY_800;
  const lines = wrapText(ctx, name, maxWidth - 20);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + 20 + (index * SPACING.LINE_HEIGHT.NORMAL));
  });
  return y + (lines.length * SPACING.LINE_HEIGHT.NORMAL) + SPACING.MARGIN.SMALL;
}

/**
 * Dessine les tags de bodyparts
 */
export function drawBodypartsTags(
  ctx: CanvasRenderingContext2D,
  exercice: Exercice,
  x: number,
  y: number,
  colors: { accent: string; tagBg: string; tagText: string }
): number {
  if (!exercice.bodyparts || exercice.bodyparts.length === 0) {
    return y;
  }

  let tagX = x;
  const tagY = y;
  const { PADDING, HEIGHT, RADIUS, GAP } = SPACING.TAG;

  ctx.font = `${TYPOGRAPHY.TAG.WEIGHT} ${TYPOGRAPHY.TAG.SIZE}px ${FONT_FAMILY}`;
  exercice.bodyparts.forEach((bodypart) => {
    const textWidth = ctx.measureText(bodypart).width;
    const tagWidth = textWidth + PADDING * 2;

    ctx.fillStyle = colors.tagBg;
    drawRoundedRect(ctx, tagX, tagY, tagWidth, HEIGHT, RADIUS);
    ctx.fill();

    ctx.fillStyle = colors.tagText;
    ctx.fillText(bodypart, tagX + PADDING, tagY + 14);

    tagX += tagWidth + GAP;
  });

  return y + 28 + SPACING.MARGIN.SMALL;
}

/**
 * Dessine les tags d'équipements
 */
export function drawEquipmentsTags(
  ctx: CanvasRenderingContext2D,
  exercice: Exercice,
  x: number,
  y: number
): number {
  if (!exercice.equipments || exercice.equipments.length === 0) {
    return y;
  }

  let tagX = x;
  const tagY = y;
  const { PADDING, HEIGHT, RADIUS, GAP } = SPACING.TAG;

  ctx.font = `${TYPOGRAPHY.TAG.WEIGHT} ${TYPOGRAPHY.TAG.SIZE}px ${FONT_FAMILY}`;
  exercice.equipments.forEach((equipment) => {
    const textWidth = ctx.measureText(equipment).width;
    const tagWidth = textWidth + PADDING * 2;

    ctx.fillStyle = COLORS.BACKGROUND;
    drawRoundedRect(ctx, tagX, tagY, tagWidth, HEIGHT, RADIUS);
    ctx.fill();

    ctx.strokeStyle = COLORS.BORDER;
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, tagX, tagY, tagWidth, HEIGHT, RADIUS);
    ctx.stroke();

    ctx.fillStyle = COLORS.TEXT_GRAY_700;
    ctx.fillText(equipment, tagX + PADDING, tagY + 14);

    tagX += tagWidth + GAP;
  });

  return y + 28 + SPACING.MARGIN.SMALL;
}

/**
 * Dessine la description
 */
export function drawDescription(
  ctx: CanvasRenderingContext2D,
  description: string | undefined,
  x: number,
  y: number,
  maxWidth: number
): number {
  if (!description) {
    return y;
  }

  ctx.font = `${TYPOGRAPHY.DESCRIPTION.WEIGHT} ${TYPOGRAPHY.DESCRIPTION.SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.TEXT_SECONDARY;
  const lines = wrapText(ctx, description, maxWidth - 20);
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + 18 + (index * SPACING.LINE_HEIGHT.NORMAL));
  });
  return y + (lines.length * SPACING.LINE_HEIGHT.NORMAL) + SPACING.MARGIN.SMALL;
}

/**
 * Dessine un badge individuel
 */
function drawSingleBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  padding: number,
  height: number,
  radius: number
): number {
  const textWidth = ctx.measureText(text).width;
  const badgeWidth = textWidth + padding * 2;

  ctx.fillStyle = COLORS.SLATE_100;
  drawRoundedRect(ctx, x, y, badgeWidth, height, radius);
  ctx.fill();

  ctx.fillStyle = COLORS.SLATE_700;
  ctx.fillText(text, x + padding, y + 14);

  return x + badgeWidth + SPACING.BADGE.GAP;
}

/**
 * Dessine les badges de workout
 */
export function drawWorkoutBadges(
  ctx: CanvasRenderingContext2D,
  exercice: Exercice,
  x: number,
  y: number
): number {
  const hasWorkout = exercice.workout?.series || exercice.workout?.repeat || exercice.workout?.duration;
  if (!hasWorkout) {
    return y;
  }

  let badgeX = x;
  const badgeY = y;
  const { PADDING, HEIGHT, RADIUS } = SPACING.BADGE;

  ctx.font = `${TYPOGRAPHY.TAG.WEIGHT} ${TYPOGRAPHY.TAG.SIZE}px ${FONT_FAMILY}`;

  if (exercice.workout.series && exercice.workout.series !== '1') {
    badgeX = drawSingleBadge(ctx, `${exercice.workout.series} séries`, badgeX, badgeY, PADDING, HEIGHT, RADIUS);
  }

  if (exercice.workout.repeat) {
    badgeX = drawSingleBadge(ctx, `${exercice.workout.repeat}x`, badgeX, badgeY, PADDING, HEIGHT, RADIUS);
  }

  if (exercice.workout.duration) {
    drawSingleBadge(ctx, exercice.workout.duration, badgeX, badgeY, PADDING, HEIGHT, RADIUS);
  }

  return y + 28 + SPACING.MARGIN.SMALL;
}

/**
 * Dessine la boîte de conseil
 */
export function drawCommentBox(
  ctx: CanvasRenderingContext2D,
  comment: string | undefined,
  x: number,
  y: number,
  maxWidth: number
): void {
  if (!comment) {
    return;
  }

  const { PADDING, HEIGHT, RADIUS, BORDER_WIDTH } = SPACING.COMMENT_BOX;

  ctx.fillStyle = COLORS.SLATE_50;
  drawRoundedRect(ctx, x, y, maxWidth, HEIGHT, RADIUS);
  ctx.fill();

  ctx.strokeStyle = COLORS.SLATE_300;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + HEIGHT);
  ctx.stroke();

  ctx.font = `600 ${TYPOGRAPHY.COMMENT.SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.SLATE_700;
  const labelText = 'Conseil : ';
  ctx.fillText(labelText, x + PADDING, y + 20);

  const conseilTextX = x + PADDING + ctx.measureText(labelText).width;
  ctx.font = `${TYPOGRAPHY.COMMENT.WEIGHT} ${TYPOGRAPHY.COMMENT.SIZE}px ${FONT_FAMILY}`;
  const commentLines = wrapText(ctx, comment, maxWidth - PADDING * 2 - ctx.measureText(labelText).width);
  commentLines.forEach((line, index) => {
    ctx.fillText(line, conseilTextX, y + 20 + (index * SPACING.LINE_HEIGHT.TIGHT));
  });
}
