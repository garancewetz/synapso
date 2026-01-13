type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 20, className = "" }: Props) {
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} role="img" aria-labelledby="title-desc" 
      >
        <title id="title">Logo Synapso</title>
        <defs>
          <clipPath id="clipBrain">
            <path d="M50 6
                     C71 6 90 23 90 46
                     C90 70 73 92 50 92
                     C27 92 10 70 10 46
                     C10 23 29 6 50 6 Z"/>
          </clipPath>
        </defs>

        <g clipPath="url(#clipBrain)">
          <rect x="0" y="0" width="50" height="100" fill="#1F2937"/>
        </g>

        <path d="M50 6
                 C71 6 90 23 90 46
                 C90 70 73 92 50 92
                 C27 92 10 70 10 46
                 C10 23 29 6 50 6 Z"
              fill="none" stroke="#1F2937" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

