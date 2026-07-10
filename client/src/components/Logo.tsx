export function Logo({ size = 40 }: { size?: number }) {
  return <img src="/logo.png" alt="OWL TATAME" width={size} height={size} className="object-contain" />;
}
