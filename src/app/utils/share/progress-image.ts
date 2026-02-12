import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Progress } from '@/app/types';
import { CANVAS_CONFIG, TYPOGRAPHY, COLORS, FONT_FAMILY, SPACING } from './constants';
import { loadImage, canvasToBlob, wrapText } from './canvas.utils';

/**
 * Crée une image composite avec le logo Synapso et le texte du progrès
 */
export async function createProgressShareImage(progress: Progress): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('createProgressShareImage ne peut être appelé que côté client');
  }

  if (!progress || !progress.content) {
    throw new Error('Progress invalide: contenu manquant');
  }

  const emoji = progress.emoji || '🌟';
  const date = format(new Date(progress.createdAt), 'd MMMM yyyy', { locale: fr });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible de créer le contexte canvas');
  }

  const { WIDTH, HEIGHT } = CANVAS_CONFIG.PROGRESS;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  drawBackground(ctx, WIDTH, HEIGHT);
  await drawLogo(ctx);
  drawTitle(ctx);
  drawIntroText(ctx);
  drawProgressContent(ctx, emoji, progress.content, WIDTH);
  drawDate(ctx, date, progress.content, WIDTH);

  return canvasToBlob(canvas);
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, width, height);
}

async function drawLogo(ctx: CanvasRenderingContext2D): Promise<void> {
  try {
    const logo = await loadImage('/logoBrain.png');
    const { SIZE, X, Y } = SPACING.LOGO;
    ctx.drawImage(logo, X, Y, SIZE, SIZE);
  } catch (error) {
    console.warn('Impossible de charger le logo, utilisation du texte uniquement', error);
  }
}

function drawTitle(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.TEXT_PRIMARY;
  ctx.font = `${TYPOGRAPHY.TITLE.WEIGHT} ${TYPOGRAPHY.TITLE.SIZE}px ${FONT_FAMILY}`;
  const titleX = SPACING.LOGO.X + SPACING.LOGO.SIZE + 12;
  ctx.fillText('Synapso', titleX, SPACING.LOGO.Y + SPACING.LOGO.SIZE / 2 + 8);
}

function drawIntroText(ctx: CanvasRenderingContext2D): void {
  ctx.font = `${TYPOGRAPHY.SUBTITLE.SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.TEXT_SECONDARY;
  const introY = SPACING.LOGO.Y + SPACING.LOGO.SIZE + SPACING.MARGIN.MEDIUM;
  ctx.fillText("J'ai fait un nouveau progrès sur Synapso:", SPACING.LOGO.X, introY);
}

function drawProgressContent(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  content: string,
  canvasWidth: number
): void {
  ctx.font = `${TYPOGRAPHY.PROGRESS_TEXT.SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.TEXT_PRIMARY;
  const progressY = SPACING.LOGO.Y + SPACING.LOGO.SIZE + SPACING.MARGIN.MEDIUM + SPACING.MARGIN.MEDIUM;
  const progressText = `${emoji} ${content}`;
  const maxWidth = canvasWidth - SPACING.LOGO.X * 2;
  const lines = wrapText(ctx, progressText, maxWidth);
  lines.forEach((line, index) => {
    ctx.fillText(line, SPACING.LOGO.X, progressY + (index * SPACING.LINE_HEIGHT.NORMAL));
  });
}

function drawDate(
  ctx: CanvasRenderingContext2D,
  date: string,
  content: string,
  canvasWidth: number
): void {
  ctx.font = `${TYPOGRAPHY.DATE.SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLORS.TEXT_TERTIARY;
  
  const progressY = SPACING.LOGO.Y + SPACING.LOGO.SIZE + SPACING.MARGIN.MEDIUM + SPACING.MARGIN.MEDIUM;
  const maxWidth = canvasWidth - SPACING.LOGO.X * 2;
  
  // Utiliser le contexte actuel pour calculer les lignes
  ctx.font = `${TYPOGRAPHY.PROGRESS_TEXT.SIZE}px ${FONT_FAMILY}`;
  const progressText = `${content}`;
  const lines = wrapText(ctx, progressText, maxWidth);
  const dateY = progressY + (lines.length * SPACING.LINE_HEIGHT.NORMAL) + SPACING.MARGIN.MEDIUM;
  
  // Remettre la police pour la date
  ctx.font = `${TYPOGRAPHY.DATE.SIZE}px ${FONT_FAMILY}`;
  ctx.fillText(date, SPACING.LOGO.X, dateY);
}
