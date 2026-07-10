export function DumbbellIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="4" y="24" width="8" height="16" rx="2" fill="currentColor" />
      <rect x="14" y="18" width="6" height="28" rx="2" fill="currentColor" />
      <rect x="20" y="29" width="24" height="6" rx="2" fill="currentColor" />
      <rect x="44" y="18" width="6" height="28" rx="2" fill="currentColor" />
      <rect x="52" y="24" width="8" height="16" rx="2" fill="currentColor" />
    </svg>
  );
}

export function KettlebellIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M24 16a8 8 0 0 1 16 0v4h-16v-4Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="40" r="20" stroke="currentColor" strokeWidth="4" />
      <path d="M22 40h20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
