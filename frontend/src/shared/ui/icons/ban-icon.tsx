import type { IconProps } from "./types";

/** Перечёркнутый круг — «Заблокировать». */
export const BanIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="m4.9 4.9 14.2 14.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);