"use client";

import cn from "classnames";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Badge from "@/shared/ui/badge";
import styles from "./style.module.scss";

type Segment = {
  href: string;
  label: string;
  count?: number;
};

type SegmentedNavProps = {
  items: Segment[];
  current?: string;
  ariaLabel: string;
  className?: string;
};

/** Разделы сегментами на светлой подложке. Активный — белый. Не помещаются — листаются вбок. */
const SegmentedNav = ({ items, current, ariaLabel, className }: SegmentedNavProps) => {
  const active = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    active.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [current]);

  return (
    <nav className={cn(styles.segments, className)} aria-label={ariaLabel}>
      {items.map(({ href, label, count }) => (
        <Link
          key={href}
          ref={href === current ? active : undefined}
          className={cn(styles.segment, href === current && styles.active)}
          href={href}
          aria-current={href === current ? "page" : undefined}
        >
          {label}
          {count ? <Badge count={count} /> : null}
        </Link>
      ))}
    </nav>
  );
};

export default SegmentedNav;
