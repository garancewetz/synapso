import { Suspense } from 'react';
import { AddPageClient } from './AddPageClient';
import { Loader } from '@/app/components/ui';

// Désactiver le prerendering car cette page utilise useSearchParams() dans le Client Component
export const dynamic = 'force-dynamic';

export default function AdminAddPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader size="large" /></div>}>
      <AddPageClient />
    </Suspense>
  );
}
