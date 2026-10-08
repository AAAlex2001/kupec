export type { User, UserChanges } from "./model/types";
export { UserProvider, useUser } from "./model/user";
export { loginWithCode, requestLoginCode, type CodeSent } from "./api/auth";
export {
  confirmEmailChange,
  logout,
  requestEmailChange,
  updateProfile,
  uploadAvatar,
} from "./api/profile";
export { avatarLetter, displayName } from "./lib/names";
