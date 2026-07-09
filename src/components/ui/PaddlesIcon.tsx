export function PaddlesIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g transform="rotate(-42 12 12)">
        <line x1="12" y1="7.5" x2="12" y2="21" strokeWidth="2.2" />
        <path
          d="M9.4 7 C9 4 10.2 1.3 12 1.1 C13.8 1.3 15 4 14.6 7 C14.5 7.9 13.3 8.2 12 8.2 C10.7 8.2 9.5 7.9 9.4 7 Z"
          fill="currentColor"
          stroke="none"
        />
      </g>
      <g transform="rotate(38 12 12)">
        <line x1="12" y1="7.5" x2="12" y2="21" strokeWidth="2.2" />
        <path
          d="M10.8 7.3 C9.6 4.7 9.9 1.8 11.4 1 C12.7 1.6 13.7 3.7 13.7 5.9 C13.7 7.2 13.3 8 12.4 8.2 C11.7 8.3 11.1 7.9 10.8 7.3 Z"
          fill="currentColor"
          stroke="none"
        />
      </g>
    </svg>
  );
}
