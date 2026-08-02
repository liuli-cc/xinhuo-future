export const SESSION_STORAGE_KEY = "xinhuo_cloudbase_session";
export const PROFILE_STORAGE_KEY = "xinhuo_cloudbase_profile";

export type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Remove tokens written by releases that incorrectly shared auth across tabs. */
export function clearLegacySharedSession(sharedStorage: BrowserStorage) {
  sharedStorage.removeItem(SESSION_STORAGE_KEY);
  sharedStorage.removeItem(PROFILE_STORAGE_KEY);
}

export function readTabSession(tabStorage: BrowserStorage) {
  return tabStorage.getItem(SESSION_STORAGE_KEY) ?? "";
}

export function writeTabSession(tabStorage: BrowserStorage, token: string) {
  if (token) tabStorage.setItem(SESSION_STORAGE_KEY, token);
}

export function writeTabProfile(tabStorage: BrowserStorage, profile: unknown) {
  tabStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function readTabProfile<T>(tabStorage: BrowserStorage): T | null {
  const raw = tabStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    tabStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

export function clearTabSession(tabStorage: BrowserStorage) {
  tabStorage.removeItem(SESSION_STORAGE_KEY);
  tabStorage.removeItem(PROFILE_STORAGE_KEY);
}
