'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getDateKey } from '@/app/utils/date.utils';
import type { HeatmapDay } from '../utils/historique.utils';

type Props = {
  data: HeatmapDay[];
  currentStreak: number;
  showFullLink?: boolean;
  userName?: string;
  progressCountByDate?: Map<string, number>;
  onDayClick?: (day: HeatmapDay) => void;
};

type TooltipData = {
  x: number;
  y: number;
  day: HeatmapDay;
} | null;

export function ActivityLineChart({ data, progressCountByDate, onDayClick }: Props) {
  const [tooltip, setTooltip] = useState<TooltipData>(null);
  
  // Ne jamais afficher "Aucune donnée" - toujours montrer le graphique avec une ligne à zéro
  let allDays = data;
  if (!allDays || allDays.length === 0) {
    // Créer au moins un jour fictif pour afficher la ligne à zéro
    const today = new Date();
    const dummyDay: HeatmapDay = {
      date: today,
      dateKey: getDateKey(today) ?? '',
      count: 0,
      dominantCategory: null,
      secondaryCategory: null,
      allCategories: [],
      isToday: true,
      isEmpty: true,
    };
    allDays = [dummyDay];
  }

  // Configuration du graphique
  const chartWidth = 900;
  const chartHeight = 260; // Réduit de 320 à 260
  const padding = { top: 30, right: 40, bottom: 50, left: 60 }; // Réduction des paddings
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Trouver le max pour l'échelle Y (arrondir au multiple de 2 supérieur)
  const maxCount = Math.max(...allDays.map(d => d.count), 1);
  const maxY = Math.ceil(maxCount / 2) * 2;
  
  // Échelles
  const yScale = (value: number) => innerHeight - (value / maxY) * innerHeight + padding.top;
  const xScale = (index: number) => (index / Math.max(allDays.length - 1, 1)) * innerWidth + padding.left;

  // Créer les points pour la ligne
  const points = allDays.map((day, index) => ({
    x: xScale(index),
    y: yScale(day.count),
    day,
    index,
  }));

  // Fonction pour créer une courbe douce (Catmull-Rom avec tension modérée)
  const createSmoothPath = (pointsArray: Array<{ x: number; y: number; day: HeatmapDay; index: number }>) => {
    if (pointsArray.length === 0) return '';
    
    // Si un seul point, tracer une ligne horizontale
    if (pointsArray.length === 1) {
      const point = pointsArray[0];
      return `M ${padding.left} ${point.y} L ${chartWidth - padding.right} ${point.y}`;
    }
    
    let path = `M ${pointsArray[0].x} ${pointsArray[0].y}`;
    
    // Y max pour contraindre la courbe (ne jamais dépasser le bas du graphique)
    const maxYValue = yScale(0); // Position Y du zéro
    
    for (let i = 0; i < pointsArray.length - 1; i++) {
      const current = pointsArray[i];
      const next = pointsArray[i + 1];
      const prev = i > 0 ? pointsArray[i - 1] : current;
      const afterNext = i < pointsArray.length - 2 ? pointsArray[i + 2] : next;
      
      // Tension modérée pour une courbe douce sans trop lisser
      const tension = 0.2;
      
      const cp1x = current.x + (next.x - prev.x) * tension;
      let cp1y = current.y + (next.y - prev.y) * tension;
      const cp2x = next.x - (afterNext.x - current.x) * tension;
      let cp2y = next.y - (afterNext.y - current.y) * tension;
      
      // Contraindre les points de contrôle pour ne jamais descendre sous 0
      cp1y = Math.min(cp1y, maxYValue);
      cp2y = Math.min(cp2y, maxYValue);
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    
    return path;
  };

  // Créer le path pour la ligne lisse
  const linePath = createSmoothPath(points);

  // Créer le path pour l'aire remplie
  const areaPath = `
    ${linePath}
    L ${points[points.length - 1]?.x ?? padding.left} ${yScale(0)}
    L ${padding.left} ${yScale(0)}
    Z
  `;

  // Créer les ticks pour l'axe Y
  const yTicks = Array.from({ length: Math.floor(maxY / 2) + 1 }, (_, i) => i * 2);

  // Créer les ticks pour l'axe X (afficher quelques jours seulement)
  const xTickIndices = allDays
    .map((_, i) => i)
    .filter((i, _, arr) => {
      // Toujours afficher le premier et le dernier
      if (i === 0 || i === arr.length - 1) return true;
      // Afficher tous les 2 jours si moins de 15 jours, tous les 3 sinon
      const step = arr.length <= 15 ? 2 : 3;
      return i % step === 0;
    });

  return (
    <div>
      {/* Graphique */}
      <div className="relative w-full max-w-3xl mx-auto mb-4" style={{ height: 'clamp(220px, 30vh, 280px)' }}>
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none transition-all duration-200"
            style={{
              left: `${(tooltip.x / chartWidth) * 100}%`,
              top: `${(tooltip.y / chartHeight) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
              <div className="font-semibold">
                {tooltip.day.date ? format(tooltip.day.date, 'EEEE d MMMM', { locale: fr }) : ''}
              </div>
              <div className="text-amber-300 font-bold mt-1">
                {tooltip.day.count} exercice{tooltip.day.count > 1 ? 's' : ''}
              </div>
              {progressCountByDate?.get(tooltip.day.dateKey) && (
                <div className="text-yellow-300 text-xs mt-1">
                  ⭐ {progressCountByDate.get(tooltip.day.dateKey)} progrès 💪
                </div>
              )}
            </div>
            {/* Petite flèche vers le bas */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgb(17, 24, 39)',
              }}
            />
          </div>
        )}
        
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grille horizontale */}
          {yTicks.map((tick) => (
            <line
              key={`grid-${tick}`}
              x1={padding.left}
              y1={yScale(tick)}
              x2={chartWidth - padding.right}
              y2={yScale(tick)}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Axe Y - Labels */}
          {yTicks.map((tick) => (
            <text
              key={`y-label-${tick}`}
              x={padding.left - 15}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="14"
              fill="#6b7280"
            >
              {tick}
            </text>
          ))}

          {/* Label axe Y */}
          <text
            x={20}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#4b5563"
            fontWeight="600"
            transform={`rotate(-90, 20, ${chartHeight / 2})`}
          >
            Nombre d&apos;exercices
          </text>

          {/* Axe X - Labels */}
          {xTickIndices.map((i) => {
            const day = allDays[i];
            if (!day?.date) return null;
            const dayNum = new Date(day.date).getDate();
            
            return (
              <text
                key={`x-label-${i}`}
                x={xScale(i)}
                y={chartHeight - padding.bottom + 25}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="14"
                fill="#6b7280"
              >
                {dayNum}
              </text>
            );
          })}

          {/* Label axe X */}
          <text
            x={chartWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            fontSize="14"
            fill="#4b5563"
            fontWeight="600"
          >
            Jours du mois
          </text>

          {/* Aire remplie - effet montagne */}
          <path
            d={areaPath}
            fill="url(#mountainGradient)"
            opacity="0.95"
          />

          {/* Ligne de crête - contour des montagnes */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#ridgeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 -2px 4px rgba(59, 130, 246, 0.3))' }}
          />

          {/* Ligne verticale "Aujourd'hui" */}
          {points.map((point) => {
            if (!point.day.isToday) return null;
            
            return (
              <g key="today-marker">
                {/* Ligne pointillée verticale */}
                <line
                  x1={point.x}
                  y1={padding.top}
                  x2={point.x}
                  y2={yScale(0)}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                {/* Point lumineux sur la courbe */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill="#f59e0b"
                  opacity="0.3"
                  className="animate-pulse"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#fbbf24"
                  stroke="white"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.6))' }}
                />
                {/* Label "Aujourd'hui" */}
                <text
                  x={point.x}
                  y={padding.top - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#f59e0b"
                >
                  Aujourd&apos;hui
                </text>
              </g>
            );
          })}

          {/* Points interactifs sur toute la ligne */}
          {points.map((point) => {
            if (point.day.count === 0) return null;
            
            return (
              <circle
                key={`point-${point.index}`}
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:r-8"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))' }}
                onClick={() => {
                  setTooltip({ x: point.x, y: point.y, day: point.day });
                  setTimeout(() => setTooltip(null), 3000); // Cache après 3 secondes
                  onDayClick?.(point.day);
                }}
                onMouseEnter={() => setTooltip({ x: point.x, y: point.y, day: point.day })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* Étoiles sur les sommets (une par progrès) */}
          {points.map((point) => {
            const progressCount = progressCountByDate?.get(point.day.dateKey) || 0;
            if (progressCount === 0) return null;

            // Créer autant d'étoiles que de progrès pour ce jour
            const stars = Array.from({ length: progressCount }, (_, i) => {
              // Décalages pour positionner les étoiles au-dessus de la ligne de crête
              const offsetX = 2; // Léger décalage horizontal pour centrer l'étoile dans le halo
              const offsetY = i === 0 ? -25 : -42 - (i - 1) * 18; // 1ère à 25px au-dessus de la ligne, autres empilées avec espacement de 18px
              
              return (
                <g key={`star-${i}`}>
                  {/* Halo lumineux (seulement pour la première étoile) */}
                  {i === 0 && (
                    <circle
                      cx={point.x + offsetX}
                      cy={point.y + offsetY}
                      r="20"
                      fill="#fbbf24"
                      opacity="0.25"
                    />
                  )}
                  {/* Étoile - première sur le sommet, autres au-dessus */}
                  <text
                    x={point.x + offsetX}
                    y={point.y + offsetY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={i === 0 ? "26" : "22"}
                    style={{ 
                      filter: 'drop-shadow(0 3px 8px rgba(251, 191, 36, 0.8))',
                      opacity: 1 - (i * 0.1) // Légèrement plus transparent pour chaque étoile
                    }}
                  >
                    ⭐
                  </text>
                </g>
              );
            });

            return (
              <g 
                key={`progress-${point.index}`}
                className="cursor-pointer"
                onClick={() => onDayClick?.(point.day)}
              >
                {stars}
              </g>
            );
          })}

          {/* Gradients pour l'effet montagne */}
          <defs>
            {/* Gradient de la montagne - bleu vif en haut, transparent en bas */}
            <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#93c5fd" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#bfdbfe" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.05" />
            </linearGradient>
            
            {/* Gradient pour la ligne de crête */}
            <linearGradient id="ridgeGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-linear-to-t from-blue-700 to-blue-100 border border-blue-500"></div>
          <span>Exercices</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">⭐</span>
          <span>Victoires 💪</span>
        </div>
      </div>
      

    </div>
  );
}
