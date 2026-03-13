import { Suspense } from 'react';
import { ArchivedPageClient } from './ArchivedPageClient';
import { Loader } from '@/app/components/ui';

// Désactiver le prerendering car cette page utilise useSearchParams() indirectement (via AddButton avec addFromParam)
export const dynamic = 'force-dynamic';

export default function ArchivedPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader size="xl" /></div>}>
      <ArchivedPageClient />
    </Suspense>
  );
}
