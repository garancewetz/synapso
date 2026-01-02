import Link from 'next/link';
import { Button } from '@/app/components/ui';

type Props = {
  icon?: string;
  title: string;
  message: string;
  subMessage?: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function EmptyState({ icon = '🔍', title, message, subMessage, actionHref, actionLabel }: Props) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
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
          <div className="mt-6">
            <Link href={actionHref}>
              <Button
                variant="action"
                className="px-6 py-3"
              >
                {actionLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
