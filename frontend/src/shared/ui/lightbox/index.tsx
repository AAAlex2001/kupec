"use client";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import type { LightGallery as LightGalleryInstance } from "lightgallery/lightgallery";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import LightGallery from "lightgallery/react";
import { useEffect, useMemo, useRef } from "react";

type LightboxProps = {
  photos: string[];
  openIndex: number | null;
  onClose: () => void;
};

const PLUGINS = [lgZoom, lgThumbnail];

/**
 * Просмотр фото на весь экран на lightGallery: листание, увеличение, миниатюры. Страница под ним не прокручивается.
 * Внутри модального dialog галерея открывается в элементе с data-lightbox-root, иначе окажется под окном.
 * Обёртка lightGallery пересоздаёт галерею на каждой перерисовке, поэтому она перерисовывается только при смене фото.
 */
const Lightbox = ({ photos, openIndex, onClose }: LightboxProps) => {
  const gallery = useRef<LightGalleryInstance | null>(null);
  const close = useRef(onClose);
  const photosKey = photos.join("\n");

  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (openIndex !== null) gallery.current?.openGallery(openIndex);
  }, [openIndex]);

  return useMemo(
    () => (
      <LightGallery
        dynamic
        dynamicEl={photosKey.split("\n").map((src) => ({ src, thumb: src }))}
        plugins={PLUGINS}
        licenseKey={process.env.NEXT_PUBLIC_LIGHTGALLERY_LICENSE_KEY}
        container="[data-lightbox-root]"
        download={false}
        hideScrollbar
        onInit={(detail) => {
          gallery.current = detail.instance;
        }}
        onAfterClose={() => close.current()}
      />
    ),
    [photosKey],
  );
};

export default Lightbox;
