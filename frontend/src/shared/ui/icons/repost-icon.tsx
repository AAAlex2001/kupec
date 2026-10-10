import type { IconProps } from "./types";

/** Две стрелки по кругу — «Репост». */
export const RepostIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="m2 9 3-3 3 3M13 18H7a2 2 0 0 1-2-2V6M22 15l-3 3-3-3M11 6h6a2 2 0 0 1 2 2v10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
