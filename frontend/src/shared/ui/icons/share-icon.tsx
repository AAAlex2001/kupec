import type { IconProps } from "./types";

/** Три точки, соединённые линиями, — «Поделиться». */
export const ShareIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
