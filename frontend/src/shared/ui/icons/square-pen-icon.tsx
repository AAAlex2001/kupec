import type { IconProps } from "./types";

/** Карандаш над листом — «Мои публикации». */
export const SquarePenIcon = ({ className }: IconProps) => (
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
      d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.38 2.63a1 1 0 0 1 3 3l-9.02 9.01a2 2 0 0 1-.85.5l-2.87.85a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .51-.86Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);