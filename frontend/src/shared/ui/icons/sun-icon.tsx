import type { IconProps } from "./types";

export const SunIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2.5V4m0 16v1.5M2.5 12H4m16 0h1.5M5.3 5.3l1.1 1.1m11.2 11.2 1.1 1.1M5.3 18.7l1.1-1.1M17.6 6.4l1.1-1.1" />
    </g>
  </svg>
);
