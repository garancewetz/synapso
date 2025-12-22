'use client';

export default function InitialLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8FAFB]">
      <div className="flex flex-col items-center gap-8">
        {/* Logo animé */}
        <div className="relative w-24 h-24">
          {/* Cercle de fond avec effet de glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-100 to-white opacity-60 animate-[breathe_3s_ease-in-out_infinite]" />
          
          {/* SVG du cerveau */}
          <svg 
            viewBox="0 0 100 100" 
            className="relative w-full h-full drop-shadow-sm"
            role="img"
            aria-label="Chargement de Synapso"
          >
            <defs>
              <clipPath id="clipBrain">
                <path d="M50 6 C71 6 90 23 90 46 C90 70 73 92 50 92 C27 92 10 70 10 46 C10 23 29 6 50 6 Z"/>
              </clipPath>
              
              {/* Gradient pour la moitié gauche */}
              <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1F2937" />
                <stop offset="100%" stopColor="#374151" />
              </linearGradient>
              
              {/* Gradient pour l'effet de "scan" */}
              <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(20, 184, 166, 0)" />
                <stop offset="45%" stopColor="rgba(20, 184, 166, 0.15)" />
                <stop offset="50%" stopColor="rgba(20, 184, 166, 0.4)" />
                <stop offset="55%" stopColor="rgba(20, 184, 166, 0.15)" />
                <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
              </linearGradient>
            </defs>

            {/* Moitié gauche */}
            <g clipPath="url(#clipBrain)">
              <rect x="0" y="0" width="50" height="100" fill="url(#leftGradient)" />
              
              {/* Moitié droite avec effet subtil */}
              <rect x="50" y="0" width="50" height="100" fill="#F3F4F6" />
              
              {/* Effet de scan qui traverse */}
              <rect 
                x="0" 
                y="0" 
                width="100" 
                height="100" 
                fill="url(#scanGradient)"
                className="animate-[scan_2.5s_ease-in-out_infinite]"
              />
            </g>

            {/* Contour avec effet de dessin progressif */}
            <path 
              d="M50 6 C71 6 90 23 90 46 C90 70 73 92 50 92 C27 92 10 70 10 46 C10 23 29 6 50 6 Z"
              fill="none" 
              stroke="#1F2937" 
              strokeWidth="1.5"
              strokeLinecap="round"
              className="animate-[drawPath_3s_ease-in-out_infinite]"
              style={{
                strokeDasharray: 280,
                strokeDashoffset: 0,
              }}
            />
            
          </svg>
        </div>

        {/* Nom de l'app avec effet de révélation */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-wide text-gray-800 animate-[fadeIn_1s_ease-out]">
            Synapso
          </h1>
          
          {/* Indicateur de chargement subtil */}
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-[bounce_1.4s_ease-in-out_infinite]" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-[bounce_1.4s_ease-in-out_infinite_0.2s]" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-[bounce_1.4s_ease-in-out_infinite_0.4s]" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.7;
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
          50.01% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
        }

        @keyframes drawPath {
          0% {
            stroke-dashoffset: 280;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -280;
          }
        }
      `}</style>
    </div>
  );
}

