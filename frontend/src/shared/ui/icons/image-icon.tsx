import type { IconProps } from "./types";

/** Картинка — «Добавить фото». */
export const ImageIcon = ({ className }: IconProps) => (
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
    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
