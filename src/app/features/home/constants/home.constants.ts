// Nombre de jours d'historique préchargés pour le WelcomeHeader.
// Utilisé à la fois côté SSR (page.tsx) et côté client (WelcomeHeaderWrapper)
// pour garantir l'alignement queryKey ↔ initialData (pas de refetch parasite).
// ⚠️ Conséquence : `calculateCurrentStreak` reçoit au max ce nombre de jours →
// le streak affiché plafonne à HOME_HISTORY_PRELOAD_DAYS. Augmenter si on veut
// pouvoir afficher des streaks plus longs.
export const HOME_HISTORY_PRELOAD_DAYS = 7;
