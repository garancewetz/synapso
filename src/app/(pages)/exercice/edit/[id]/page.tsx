import { Suspense, use } from 'react';
import { notFound } from 'next/navigation';
import { EditPageClient } from './EditPageClient';
import { Loader } from '@/app/components/ui';

// Désactiver le prerendering car cette page utilise useSearchParams() dans le Client Component
export const dynamic = 'force-dynamic';

type AdminEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function AdminEditPage({ params }: AdminEditPageProps) {
  const { id } = use(params);
  const exerciceId = id ? parseInt(id) : null;

  if (!exerciceId || isNaN(exerciceId)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader size="large" /></div>}>
      <EditPageClient exerciceId={exerciceId} />
    </Suspense>
  );
}
