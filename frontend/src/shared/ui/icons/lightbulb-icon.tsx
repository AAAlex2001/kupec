import type { IconProps } from "./types";

export const LightbulbIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 16.5v-.7c0-.8-.4-1.5-1-2a6 6 0 1 1 8 0c-.6.5-1 1.2-1 2v.7H9Z" />
      <path d="M9 19.5h6m-5 3h4M12 1v1M3 5l1 1m16-1-1 1M1 11h1m20 0h1" />
    </g>
  </svg>
);
