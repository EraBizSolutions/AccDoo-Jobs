const ACCESS_TOKEN_KEY = "jobsera_access_token";
const REFRESH_TOKEN_KEY = "jobsera_refresh_token";
const USER_KEY = "jobsera_user";
const LOGIN_MODE_KEY = "jobsera_login_mode";
const CANDIDATE_PROFILE_PHOTO_KEY = "jobsera_candidate_profile_photo";

const VALID_LOGIN_MODES = ["candidate", "recruiter"];

function isBrowser() {
  return typeof window !== "undefined";
}

function notifyAuthStateChanged() {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event("jobsera:auth-updated"));
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

  notifyAuthStateChanged();
}

export function updateStoredUser(userUpdates) {
  if (!isBrowser()) return null;

  const currentUser = getStoredUser();

  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    ...userUpdates,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

  notifyAuthStateChanged();

  return updatedUser;
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

export function setSelectedLoginMode(mode) {
  if (!isBrowser()) return;

  const safeMode = VALID_LOGIN_MODES.includes(mode) ? mode : "candidate";

  localStorage.setItem(LOGIN_MODE_KEY, safeMode);
}

export function getSelectedLoginMode() {
  if (!isBrowser()) return "candidate";

  const savedMode = localStorage.getItem(LOGIN_MODE_KEY);

  if (!VALID_LOGIN_MODES.includes(savedMode)) {
    return "candidate";
  }

  return savedMode;
}

export function saveCandidateProfilePhoto(photoDataUrl) {
  if (!isBrowser()) return;

  if (photoDataUrl) {
    localStorage.setItem(CANDIDATE_PROFILE_PHOTO_KEY, photoDataUrl);
  } else {
    localStorage.removeItem(CANDIDATE_PROFILE_PHOTO_KEY);
  }

  notifyAuthStateChanged();
}

export function getCandidateProfilePhoto() {
  if (!isBrowser()) return null;

  return localStorage.getItem(CANDIDATE_PROFILE_PHOTO_KEY);
}

export function clearAuthData() {
  if (!isBrowser()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(CANDIDATE_PROFILE_PHOTO_KEY);
  localStorage.removeItem(LOGIN_MODE_KEY);

  notifyAuthStateChanged();
}