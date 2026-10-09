export const LOCATION_COOKIE = "city";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Запомнить в браузере, где искать объявления. null — вся область. */
export const saveLocation = (cityId: number | null) => {
  document.cookie = cityId
    ? `${LOCATION_COOKIE}=${cityId}; path=/; max-age=${YEAR_SECONDS}; samesite=lax`
    : `${LOCATION_COOKIE}=; path=/; max-age=0; samesite=lax`;
};
