import type { ExerciceCategory } from '@/app/types/exercice';
import { CATEGORY_COLORS } from '@/app/constants/exercice.constants';

/**
 * Dessine un rectangle arrondi (compatibilité navigateurs)
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Aide à gérer le retour à la ligne pour le texte long
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Charge une image depuis une URL
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Convertit un canvas en Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Impossible de convertir le canvas en image'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Obtient les couleurs de catégorie pour le canvas
 * Convertit les couleurs Tailwind en format hex pour le canvas
 */
export function getCategoryColorsForCanvas(category: ExerciceCategory): {
  accent: string;
  tagBg: string;
  tagText: string;
} {
  const categoryColors = CATEGORY_COLORS[category];
  
  // Extraire les couleurs hex depuis les classes Tailwind
  // Format: "bg-orange-100" -> "#FED7AA", "text-orange-700" -> "#C2410C"
  const colorMap: Record<string, { accent: string; tagBg: string; tagText: string }> = {
    'UPPER_BODY': { accent: '#F97316', tagBg: '#FED7AA', tagText: '#C2410C' },
    'CORE': { accent: '#14B8A6', tagBg: '#99F6E4', tagText: '#0F766E' },
    'LOWER_BODY': { accent: '#3B82F6', tagBg: '#DBEAFE', tagText: '#1E40AF' },
    'STRETCHING': { accent: '#8B5CF6', tagBg: '#E9D5FF', tagText: '#6B21A8' },
  };
  
  return colorMap[category] || { accent: '#6B7280', tagBg: '#F3F4F6', tagText: '#374151' };
}
