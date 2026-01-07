import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function SettingsSection({ title, description, children }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <label className="block text-base font-semibold text-gray-800 mb-2">
        {title}
      </label>
      {description && (
        <p className="text-sm text-gray-500 mb-4">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

