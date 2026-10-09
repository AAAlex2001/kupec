export const HOME_PATH = "/";
export const SEARCH_PATH = "/search";
export const CATALOG_PATH = "/catalog";
export const categoryPath = (slug: string) => `${CATALOG_PATH}/${slug}`;
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

export const ADMIN_PATH = "/admin";
export const ADMIN_USERS_PATH = "/admin/users";
export const ADMIN_LISTINGS_PATH = "/admin/listings";
export const ADMIN_REVIEWS_PATH = "/admin/reviews";
export const ADMIN_CATEGORIES_PATH = "/admin/categories";
export const ADMIN_ATTRIBUTES_PATH = "/admin/attributes";
export const ADMIN_UNITS_PATH = "/admin/units";
export const adminUserPath = (id: number) => `${ADMIN_USERS_PATH}/${id}`;

export const RULES_PATH = "/rules";
export const TERMS_PATH = "/terms";
export const PRIVACY_PATH = "/privacy";
