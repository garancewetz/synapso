interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  subMessage?: string;
}

export default function EmptyState({ icon = '🔍', title, message, subMessage }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
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
      </div>
    </div>
  );
}
