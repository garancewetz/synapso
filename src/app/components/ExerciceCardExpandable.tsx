'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronIcon } from '@/app/components/ui/icons';
import { ExerciceMedia } from '@/app/components/ExerciceMedia';
import { Badge } from '@/app/components/ui';
import type { Exercice } from '@/app/types';

type Props = {
  exercice: Exercice;
  isExpanded: boolean;
  onLightboxOpen: (index: number) => void;
};

export function ExerciceCardExpandable({
  exercice,
  isExpanded,
  onLightboxOpen,
}: Props) {
  const hasWorkoutInfo = exercice.workout.series || exercice.workout.repeat || exercice.workout.duration;
  const hasExpandableContent = exercice.description.text || exercice.media || hasWorkoutInfo;

  if (!hasExpandableContent) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              marginTop: 16
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut"
            }}
            className="overflow-hidden space-y-3"
          >
            {/* 1. Images */}
            {exercice.media && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                <ExerciceMedia 
                  media={exercice.media} 
                  maxPhotos={3}
                  onLightboxOpen={onLightboxOpen}
                  showLightbox={false}
                />
              </motion.div>
            )}
            
            {/* 2. Description */}
            {exercice.description.text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.1
                }}
                className="text-gray-600 leading-relaxed text-sm"
              >
                {exercice.description.text}
              </motion.p>
            )}
            
            {/* 3. Badges de paramètre (séries, répétitions, durée) */}
            {hasWorkoutInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="flex flex-wrap gap-1.5"
              >
                {exercice.workout.series && exercice.workout.series !== '1' && (
                  <Badge variant="workout">
                    {exercice.workout.series} séries
                  </Badge>
                )}
                
                {exercice.workout.repeat && (
                  <Badge variant="workout">
                    {exercice.workout.repeat}x
                  </Badge>
                )}
                
                {exercice.workout.duration && (
                  <Badge variant="workout">
                    {exercice.workout.duration}
                  </Badge>
                )}
              </motion.div>
            )}
            
            {/* 4. Conseil */}
            {exercice.description.comment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.1
                }}
                className="p-3 bg-slate-50 border-l-2 border-slate-300 text-slate-700 text-sm rounded-r"
              >
                <span className="font-semibold">Conseil : </span>
                {exercice.description.comment}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center mt-2">
        <ChevronIcon
          className={`w-4 h-4 text-gray-400 transition-transform duration-200`}
          direction={isExpanded ? 'up' : 'down'}
        />
      </div>
    </>
  );
}

