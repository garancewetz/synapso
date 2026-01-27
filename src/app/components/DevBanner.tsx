'use client';

import { useEffect, useState } from 'react';
import { WarningIcon } from '@/app/components/ui/icons';

type DbInfo = {
  dbType: 'DEV' | 'PROD';
  dbHost: string;
  isDev: boolean;
  hasDevDb: boolean;
};

export function DevBanner() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const isDev = environment === 'dev';
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDev) {
      setLoading(false);
      return;
    }

    // Récupérer l'info sur la base de données
    fetch('/api/dev/db-info')
      .then((res) => res.json())
      .then((data) => {
        setDbInfo(data);
      })
      .catch(() => {
        // En cas d'erreur, on ignore
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isDev]);

  if (!isDev) {
    return null;
  }

  const dbTypeDisplay = dbInfo?.dbType || '...';
  const dbHostDisplay = dbInfo?.dbHost || '...';
  const isDevDb = dbInfo?.dbType === 'DEV';

  return (
    <div className="bg-amber-500 text-white text-center py-2.5 px-4 w-full border-b border-amber-600/20 shadow-sm">
      <div className="flex items-center justify-center gap-2 max-w-9xl mx-auto flex-wrap">
        <WarningIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          Environnement de développement
        </span>
        {!loading && dbInfo && (
          <>
            <span className="text-amber-200">•</span>
            <span className={isDevDb ? 'text-green-200 font-semibold' : 'text-red-200 font-semibold'}>
              DB: {dbTypeDisplay}
            </span>
            <span className="text-amber-200 text-xs">({dbHostDisplay})</span>
          </>
        )}
      </div>
    </div>
  );
}

