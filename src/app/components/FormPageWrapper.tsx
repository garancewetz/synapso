'use client';

import { useRouter } from 'next/navigation';

interface FormPageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export default function FormPageWrapper({ children, title }: FormPageWrapperProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 bg-gray-50">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 sm:p-6">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour</span>
          </button>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

