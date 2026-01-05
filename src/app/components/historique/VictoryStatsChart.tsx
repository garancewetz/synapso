'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { format, parseISO, startOfWeek, eachWeekOfInterval, addWeeks, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isOrthophonieVictory } from '@/app/utils/victory.utils';
import { getFirstDateFromVictoriesAndHistory } from '@/app/utils/historique.utils';
import { CATEGORY_EMOJIS, VICTORY_EMOJIS } from '@/app/constants/emoji.constants';
import type { Victory, HistoryEntry } from '@/app/types';

type Props = {
  victories: Victory[];
  history?: HistoryEntry[];
  hideTitle?: boolean;
};

/**
 * Graphique de cumul avec aires empilées
 * Montre la progression cumulative des réussites - la montagne ne fait que grandir !
 */
export function VictoryStatsChart({ victories, history = [], hideTitle = false }: Props) {
  const chartData = useMemo(() => {
    if (victories.length === 0 && history.length === 0) return [];

    // Trier les victoires par date
    const sortedVictories = [...victories].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Trouver la première date : utiliser la date la plus ancienne entre la première victoire et le premier exercice
    const firstDate = getFirstDateFromVictoriesAndHistory(victories, history);
    if (!firstDate) return [];

    const today = new Date();
    const todayStartOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    const firstDateStartOfWeek = startOfWeek(firstDate, { weekStartsOn: 1 });
    
    // Créer les semaines entre la première date et aujourd'hui (inclure la semaine en cours)
    // Utiliser addWeeks pour s'assurer d'inclure la semaine en cours même si today est le lundi
    const endDate = isBefore(todayStartOfWeek, today) ? addWeeks(todayStartOfWeek, 1) : todayStartOfWeek;
    const weeks = eachWeekOfInterval(
      { start: firstDateStartOfWeek, end: endDate },
      { weekStartsOn: 1 } // Lundi
    );
    
    // S'assurer que la semaine en cours est incluse (ne pas dépasser aujourd'hui)
    const lastWeek = weeks[weeks.length - 1];
    if (!lastWeek || format(lastWeek, 'yyyy-MM-dd') !== format(todayStartOfWeek, 'yyyy-MM-dd')) {
      weeks.push(todayStartOfWeek);
    }

    // S'assurer que toutes les victoires sont dans la plage de semaines
    // Si la dernière victoire est après la dernière semaine, ajouter une semaine supplémentaire
    if (sortedVictories.length > 0) {
      const lastVictoryDate = parseISO(sortedVictories[sortedVictories.length - 1].createdAt);
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek) {
        const lastWeekEnd = new Date(lastWeek);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        
        // Si la dernière victoire est après la dernière semaine, ajouter une semaine
        if (lastVictoryDate > lastWeekEnd) {
          const nextWeek = addWeeks(lastWeek, 1);
          weeks.push(nextWeek);
        }
      }
    }

    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      // Inclure les victoires jusqu'à la fin de la semaine (inclus)
      weekEnd.setHours(23, 59, 59, 999);
      
      // Compter toutes les victoires jusqu'à la fin de cette semaine (cumulatif)
      const cumulativeVictories = sortedVictories.filter(v => {
        const vDate = parseISO(v.createdAt);
        return vDate <= weekEnd;
      });

      const orthoCumulative = cumulativeVictories.filter(v => isOrthophonieVictory(v.emoji)).length;
      const physiqueCumulative = cumulativeVictories.filter(v => !isOrthophonieVictory(v.emoji)).length;

      return {
        week: format(weekStart, 'd MMM', { locale: fr }),
        weekKey: format(weekStart, 'yyyy-MM-dd'),
        ortho: orthoCumulative,
        physique: physiqueCumulative,
        total: orthoCumulative + physiqueCumulative,
      };
    });
  }, [victories, history]);


  // Calculer le maximum pour l'axe Y avec +2 pour montrer qu'on peut encore progresser
  // Utiliser le vrai total des victoires plutôt que le max du chartData pour être sûr d'inclure toutes les victoires
  const maxYValue = useMemo(() => {
    if (chartData.length === 0) return 2;
    // Utiliser le vrai total des victoires passées en prop
    const realTotal = victories.length;
    // Vérifier aussi le dernier point du graphique pour être sûr
    const lastPointTotal = chartData.length > 0 ? chartData[chartData.length - 1].total : 0;
    // Prendre le maximum entre le vrai total et le dernier point du graphique
    const maxTotal = Math.max(realTotal, lastPointTotal);
    return maxTotal + 2;
  }, [chartData, victories.length]);

  if (victories.length === 0) {
    return (
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>{VICTORY_EMOJIS.TROPHY}</span>
        <span>Mes réussites</span>
      </h2>
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">🌟</span>
          <p className="text-gray-500">Tes réussites apparaîtront ici !</p>
        </div>
      </div>
    );
  }


  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 w-full">
      {!hideTitle && (
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>{VICTORY_EMOJIS.TROPHY}</span>
          <span>Mes réussites</span>
        </h2>
      )}
      
      <div className="w-full h-64 sm:h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorOrtho" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.9}/>
                <stop offset="50%" stopColor="#EAB308" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0.15}/>
              </linearGradient>
              <linearGradient id="colorPhysique" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.9}/>
                <stop offset="50%" stopColor="#F97316" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.15}/>
              </linearGradient>
              {/* Gradient doré pour l'effet de brillance */}
              <linearGradient id="goldenShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval={Math.max(0, Math.floor(chartData.length / 6))}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              allowDecimals={false}
              domain={[0, maxYValue]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '8px 12px',
              }}
              formatter={(value: number | undefined, name: string | undefined) => {
                if (value === undefined || name === undefined) return ['', ''];
                const label = name === 'ortho' ? 'Orthophonie' : name === 'physique' ? 'Physique' : 'Total';
                return [`${value} réussite${value > 1 ? 's' : ''}`, label];
              }}
            />
            {/* Zone orthophonie en bas (fondation) */}
            <Area 
              type="monotone" 
              dataKey="ortho" 
              stackId="1"
              stroke="#FBBF24" 
              fill="url(#colorOrtho)"
              strokeWidth={2.5}
            />
            {/* Zone physique par-dessus */}
            <Area 
              type="monotone" 
              dataKey="physique" 
              stackId="1"
              stroke="#F97316" 
              fill="url(#colorPhysique)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-gray-700 font-medium">{CATEGORY_EMOJIS.ORTHOPHONIE} Orthophonie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="text-gray-700 font-medium">{CATEGORY_EMOJIS.PHYSIQUE} Physique</span>
        </div>
      </div>

    </div>
  );
}

