export function Logo({ size = 40 }: { size?: number }) {
  const pad = Math.max(4, Math.round(size * 0.08));
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 animate-scale-in transition-transform duration-300 ease-out hover:scale-105 hover:shadow-md"
      style={{ padding: pad }}
    >
      <img src="/logo.png" alt="OWL TATAME" width={size} height={size} className="object-contain" />
    </span>
  );
}
