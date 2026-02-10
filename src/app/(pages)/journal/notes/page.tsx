import { Suspense } from 'react';
import { JournalNotesPageClient } from './JournalNotesPageClient';
import { Loader } from '@/app/components/ui';

// Désactiver le prerendering car cette page utilise useSearchParams() indirectement (via composants enfants)
export const dynamic = 'force-dynamic';

export default function JournalNotesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader size="large" /></div>}>
      <JournalNotesPageClient />
    </Suspense>
  );
}
