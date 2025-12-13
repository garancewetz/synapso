import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  subMessage?: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function EmptyState({ icon = '🔍', title, message, subMessage, actionHref, actionLabel }: EmptyStateProps) {
  const content = (
    <div className="text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {message}
      </p>
      {subMessage && (
        <p className="text-sm text-gray-500 mt-2">
          {subMessage}
        </p>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center py-12">
      {actionHref ? (
        <Link href={actionHref} className="block w-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
