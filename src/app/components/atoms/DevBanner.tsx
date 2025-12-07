'use client';

export default function DevBanner() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  if (environment !== 'dev') {
    return null;
  }

  return (
    <div className="bg-red-600 text-white text-center py-2 px-4 w-full">
      Environnement de développement
    </div>
  );
}

