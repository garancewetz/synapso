import { WarningIcon } from '@/app/components/ui/icons';

export function DevBanner() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
  const isDev = environment === 'dev';

  if (!isDev) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white text-center py-2.5 px-4 w-full border-b border-amber-600/20 shadow-sm">
      <div className="flex items-center justify-center gap-2 max-w-9xl mx-auto">
        <WarningIcon className="w-4 h-4" />
        <span className="text-sm font-medium">
          Environnement de développement • isDev: {isDev ? 'true' : 'false'}
        </span>
      </div>
    </div>
  );
}

