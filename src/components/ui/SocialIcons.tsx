type IconProps = { size?: number; className?: string };

// Single-currentColor brand marks, drawn in-house (matches PaddlesIcon) since
// lucide-react dropped brand/logo icons — keeps the socials panel from
// pulling in a separate icon dependency for three glyphs.

export function InstagramIcon({ size = 18, className }: IconProps) {
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
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.3" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
    >
      <path d="M15.5 3h-2.2C10.9 3 9.4 4.6 9.4 7.1v2.6H7.2v3.4h2.2V21h3.4v-7.9h2.5l.4-3.4h-2.9V7.4c0-.9.4-1.5 1.6-1.5h1.7z" />
    </svg>
  );
}

export function TiktokIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
    >
      <path d="M16.6 3h-3.1v12.3a2.6 2.6 0 1 1-2-2.5V9.5a5.8 5.8 0 1 0 5.1 5.8V9.2a7.6 7.6 0 0 0 4.4 1.4V7.4a4.3 4.3 0 0 1-4.4-4.4z" />
    </svg>
  );
}
