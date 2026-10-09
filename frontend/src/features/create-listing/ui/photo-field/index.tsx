"use client";

import { deleteListingPhoto, uploadListingPhoto, type ListingPhoto } from "@/entities/listing";
import PhotoPicker from "@/shared/ui/photo-picker";

const MAX_PHOTOS = 10;

type PhotoFieldProps = {
  photos: ListingPhoto[];
  error?: string;
  onChange: (photos: ListingPhoto[]) => void;
};

/** Фото объявления: до 10 штук, первое — обложка. */
const PhotoField = ({ photos, error, onChange }: PhotoFieldProps) => (
  <PhotoPicker
    title="Фотографии *"
    photos={photos}
    max={MAX_PHOTOS}
    error={error}
    upload={uploadListingPhoto}
    remove={deleteListingPhoto}
    onChange={onChange}
  />
);

export default PhotoField;
