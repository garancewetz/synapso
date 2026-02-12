import { Suspense } from 'react';
import { JournalTasksPageClient } from './JournalTasksPageClient';
import { Loader } from '@/app/components/ui';

// Désactiver le prerendering car cette page utilise useSearchParams() indirectement (via composants enfants)
export const dynamic = 'force-dynamic';

export default function JournalTasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader size="large" /></div>}>
      <JournalTasksPageClient />
    </Suspense>
  );
}
