export const HOME_PATH = "/";
export const SEARCH_PATH = "/search";
export const CATALOG_PATH = "/catalog";
export const NEW_LISTING_PATH = "/listings/new";
export const listingPath = (id: number) => `/listings/${id}`;
export const editListingPath = (id: number) => `/listings/${id}/edit`;
export const HELP_PATH = "/help";

export const ACCOUNT_PATH = "/account";
export const MY_LISTINGS_PATH = "/account/listings";
export const MESSAGES_PATH = "/account/messages";
export const conversationPath = (id: number) => `${MESSAGES_PATH}/${id}`;
export const FAVORITES_PATH = "/account/favorites";
export const MY_REVIEWS_PATH = "/account/reviews";
export const SETTINGS_PATH = "/account/settings";

export const RULES_PATH = "/rules";
export const TERMS_PATH = "/terms";
export const PRIVACY_PATH = "/privacy";
