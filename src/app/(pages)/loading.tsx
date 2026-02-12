/**
 * Loading fallback SSR — affiché dans le HTML streamé avant hydratation.
 * 100% Server Component, CSS inline, zéro JS client.
 * Reproduit le visuel du InitialLoader (fond #F8FAFB + logo cerveau + "Synapso").
 */
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFB',
        zIndex: 9999,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        {/* Logo cerveau simplifié — SVG inline */}
        <svg
          viewBox="0 0 100 100"
          width="128"
          height="128"
          role="img"
          aria-label="Chargement de Synapso"
        >
          <defs>
            <clipPath id="clipBrainLoading">
              <path d="M50 6 C71 6 90 23 90 46 C90 70 73 92 50 92 C27 92 10 70 10 46 C10 23 29 6 50 6 Z" />
            </clipPath>
            <linearGradient id="leftGradientLoading" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>
          <g clipPath="url(#clipBrainLoading)">
            <rect x="0" y="0" width="50" height="100" fill="url(#leftGradientLoading)" />
            <rect x="50" y="0" width="50" height="100" fill="#F3F4F6" />
          </g>
          <path
            d="M50 6 C71 6 90 23 90 46 C90 70 73 92 50 92 C27 92 10 70 10 46 C10 23 29 6 50 6 Z"
            fill="none"
            stroke="#1F2937"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <span
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: '#374151',
          }}
        >
          Synapso
        </span>
      </div>
    </div>
  );
}
