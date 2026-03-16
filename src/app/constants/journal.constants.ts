// ============================================================================
// CONSTANTES POUR LE MODULE JOURNAL
// ============================================================================
// Inspiré des Notes iPhone : fond blanc, séparateurs discrets, hiérarchie claire.

export const JOURNAL_NOTE_STYLES = {
  block: 'bg-white font-sans rounded-xl border border-neutral-100 shadow-sm',
  contentArea: 'px-5 py-5',
  title: 'text-lg font-semibold text-neutral-900',
  body: 'text-base text-neutral-600 leading-relaxed',
  meta: 'text-xs text-neutral-400',
  footer: 'border-t border-neutral-100 px-5 py-2.5 flex items-center gap-2',
  actionsPanel: 'bg-neutral-50/50',
  actionsBorder: 'border-neutral-100',
  actionsButtonHover: 'hover:bg-neutral-100 active:bg-neutral-200',
} as const;

