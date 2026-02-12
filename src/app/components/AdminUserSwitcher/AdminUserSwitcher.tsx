'use client';

import { useUser } from '@/app/contexts/UserContext';
import { Button } from '@/app/components/ui/Button';

export function AdminUserSwitcher() {
  const { 
    currentUser, 
    effectiveUser, 
    isAdmin, 
    stopImpersonation,
  } = useUser();

  if (!isAdmin || !currentUser) {
    return null;
  }

  const isImpersonating = effectiveUser && effectiveUser.id !== currentUser.id;

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">👁️</span>
          <span>
            Vue en tant que : <strong>{effectiveUser?.name}</strong>
          </span>
        </div>
        <Button
          onClick={stopImpersonation}
          variant="secondary"
          size="sm"
          rounded="lg"
          className="px-3 py-1 bg-white/20 hover:bg-white/30"
        >
          Revenir à mon compte
        </Button>
      </div>
    </div>
  );
}
