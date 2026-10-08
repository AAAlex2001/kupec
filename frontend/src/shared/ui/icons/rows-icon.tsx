import type { IconProps } from "./types";

export const RowsIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M21 9H3M21 15H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
