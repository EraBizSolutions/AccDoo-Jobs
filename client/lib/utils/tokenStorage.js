const ACCESS_TOKEN_KEY = "jobsera_access_token";
const REFRESH_TOKEN_KEY = "jobsera_refresh_token";
const USER_KEY = "jobsera_user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveAuthData({ accessToken, refreshToken, user }) {
  if (!isBrowser()) return;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getAccessToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  if (!isBrowser()) return null;

  const user = localStorage.getItem(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    clearAuthData();
    return null;
  }
}

export function clearAuthData() {
  if (!isBrowser()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}