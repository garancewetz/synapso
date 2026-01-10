'use client';

import Link from 'next/link';
import { ClockIcon, CalendarIcon } from '@/app/components/ui/icons';
import { useHandPreference } from '@/app/hooks/useHandPreference';
import clsx from 'clsx';

type Props = {
  userName: string;
  resetFrequency?: 'DAILY' | 'WEEKLY' | null;
};

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function WelcomeHeaderGreeting({ userName, resetFrequency }: Props) {
  const { isLeftHanded } = useHandPreference();

  return (
    <div className="mb-4 relative z-10 px-3 md:px-4">
      <div className={clsx('flex items-start gap-2 justify-between', isLeftHanded && 'flex-row-reverse')}>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
            {getTimeGreeting()}, {userName}
          </h1>
          {/* Badge de réinitialisation - affiché seulement si l'information est chargée */}
          {resetFrequency && (
            <span className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
              resetFrequency === 'DAILY' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-purple-100 text-purple-700'
            )}>
              {resetFrequency === 'DAILY' ? (
                <>
                  <ClockIcon className="w-3 h-3" />
                  Rythme quotidien
                </>
              ) : (
                <>
                  <CalendarIcon className="w-3 h-3" />
                  Rythme hebdomadaire
                </>
              )}
            </span>
          )}
        </div>
        <Link
          href="/settings"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors shrink-0 cursor-pointer"
          aria-label="Mon profil"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

