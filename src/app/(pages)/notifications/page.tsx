'use client';

import { motion } from 'framer-motion';
import { Loader } from '@/app/components/ui/Loader';
import { EmptyState } from '@/app/components/EmptyState';
import { SharedExerciceCard, useReceivedShares } from '@/app/features/sharing';

export default function NotificationsPage() {
  const { shares, isLoading } = useReceivedShares();

  return (
    <section className="pb-12 md:pb-8 min-h-screen">
      <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto pt-2 md:pt-4 px-4 md:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Notifications
          </h1>
          {!isLoading && (
            <p className="text-gray-500 mt-1">
              {shares.length > 0
                ? `${shares.length} exercice${shares.length > 1 ? 's' : ''} partagé${shares.length > 1 ? 's' : ''} en attente`
                : 'Aucune notification en attente'}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="medium" />
          </div>
        ) : shares.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <EmptyState
              icon="🔔"
              title="Aucune notification"
              message="Vous n'avez aucun exercice partagé en attente."
            />
          </motion.div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {shares.map(share => (
              <SharedExerciceCard key={share.id} share={share} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
