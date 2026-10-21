type TruckIconProps = {
  size?: number;
  color?: string;
  style?: "outline" | "two-tone";
};

/** Truck, drawn to match the sidebar's two-tone icons (cargo box at 40% opacity, cab and wheels solid). */
export function IconlyTruck({ size = 24, color = "currentColor", style = "outline" }: TruckIconProps) {
  if (style === "two-tone") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect opacity="0.4" x="2" y="5" width="12" height="10.5" rx="2" fill={color} />
        <path d="M15 8.25h2.62c.56 0 1.08.29 1.37.77l1.78 2.94c.15.24.23.52.23.81v2.48c0 .69-.56 1.25-1.25 1.25H15V8.25Z" fill={color} />
        <circle cx="7" cy="17.25" r="2.25" fill={color} />
        <circle cx="17" cy="17.25" r="2.25" fill={color} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2.75" y="5.75" width="11" height="9.5" rx="1.75" stroke={color} strokeWidth="1.5" />
      <path d="M13.75 8.75h3.87c.44 0 .85.23 1.07.6l1.6 2.66c.12.2.18.42.18.65v2.59h-6.72" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7" cy="17.25" r="1.75" stroke={color} strokeWidth="1.5" />
      <circle cx="17" cy="17.25" r="1.75" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
