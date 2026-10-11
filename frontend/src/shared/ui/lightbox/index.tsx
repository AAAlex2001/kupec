"use client";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import type { LightGallery as LightGalleryInstance } from "lightgallery/lightgallery";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import LightGallery from "lightgallery/react";
import { useEffect, useRef } from "react";

type LightboxProps = {
  photos: string[];
  openIndex: number | null;
  onClose: () => void;
};

const PLUGINS = [lgZoom, lgThumbnail];

/** Просмотр фото на весь экран на lightGallery: листание, увеличение, миниатюры. Страница под ним не прокручивается. */
const Lightbox = ({ photos, openIndex, onClose }: LightboxProps) => {
  const gallery = useRef<LightGalleryInstance | null>(null);

  useEffect(() => {
    if (openIndex !== null) gallery.current?.openGallery(openIndex);
  }, [openIndex]);

  return (
    <LightGallery
      dynamic
      dynamicEl={photos.map((src) => ({ src, thumb: src }))}
      plugins={PLUGINS}
      licenseKey={process.env.NEXT_PUBLIC_LIGHTGALLERY_LICENSE_KEY}
      download={false}
      hideScrollbar
      onInit={(detail) => {
        gallery.current = detail.instance;
      }}
      onAfterClose={onClose}
    />
  );
};

export default Lightbox;
