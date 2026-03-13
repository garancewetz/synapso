'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/app/components/ui';
import { SegmentedControl } from '@/app/components/ui';
import { PeriodNavigation } from '@/app/components/ui/PeriodNavigation';
import {
  ActivityHeatmap,
  BodypartsBarChart,
} from '@/app/features/historique';
import type { HeatmapDay } from '@/app/features/historique';
import type { DonutChartItem } from '@/app/features/historique/utils/historique.types';

const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false, loading: () => null }
);

type BodypartPeriodFilter = 'week' | 'month' | 'all';

type Props = {
  heatmapData: HeatmapDay[];
  heatmapPeriodLabel: string;
  goToPreviousHeatmapPeriod: () => void;
  goToNextHeatmapPeriod: () => void;
  canGoBackHeatmap: boolean;
  canGoForwardHeatmap: boolean;
  donutDataBodyparts: DonutChartItem[];
  bodypartPeriod: BodypartPeriodFilter;
  onBodypartPeriodChange: (value: BodypartPeriodFilter) => void;
  onDayClick: (day: HeatmapDay) => void;
  currentStreak: number;
  progressDates: Set<string>;
  loadingHistory: boolean;
  displayName: string;
};

export function HistoriqueStatistiquesSection({
  heatmapData,
  heatmapPeriodLabel,
  goToPreviousHeatmapPeriod,
  goToNextHeatmapPeriod,
  canGoBackHeatmap,
  canGoForwardHeatmap,
  donutDataBodyparts,
  bodypartPeriod,
  onBodypartPeriodChange,
  onDayClick,
  currentStreak,
  progressDates,
  loadingHistory,
  displayName,
}: Props) {
  return (
    <MotionDiv
      key="statistiques"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 md:space-y-8"
    >
      <section id="statistiques" className="space-y-6 md:space-y-8">
        {!loadingHistory && (
          <Card variant="default" padding="md">
            <PeriodNavigation
              label={heatmapPeriodLabel}
              onPrevious={goToPreviousHeatmapPeriod}
              onNext={goToNextHeatmapPeriod}
              canGoBack={canGoBackHeatmap}
              canGoForward={canGoForwardHeatmap}
            />
            <MotionDiv
              key="heatmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <ActivityHeatmap
                data={heatmapData}
                currentStreak={currentStreak}
                userName={displayName}
                progressDates={progressDates}
                onDayClick={onDayClick}
                showFullLink={false}
              />
            </MotionDiv>
          </Card>
        )}

        <BodypartsBarChart
          title="🦴 Zones travaillées"
          data={donutDataBodyparts}
          emptyIcon="💪"
          emptyMessage="Tes zones travaillées apparaîtront ici !"
          filterSlot={
            <SegmentedControl
              options={[
                { value: 'week', label: 'Cette semaine' },
                { value: 'month', label: 'Ce mois-ci' },
                { value: 'all', label: 'Tout' },
              ]}
              value={bodypartPeriod}
              onChange={(value) => onBodypartPeriodChange(value as BodypartPeriodFilter)}
              fullWidth
              size="sm"
              variant="filter"
            />
          }
        />
      </section>
    </MotionDiv>
  );
}
