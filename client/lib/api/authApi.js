import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  saveAuthData,
} from "@/lib/utils/tokenStorage";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function parseApiResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      "Something went wrong. Please try again.";

    if (Array.isArray(message)) {
      throw new Error(message[0]?.msg || "Validation failed.");
    }

    throw new Error(message);
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return parseApiResponse(response);
}

export async function authenticatedApiRequest(path, options = {}) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  return parseApiResponse(response);
}

function saveLoginResponse(data) {
  saveAuthData({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  });

  return data;
}

export async function registerCandidate({ name, email, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

export async function loginCandidate({ email, password }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return saveLoginResponse(data);
}

export async function loginWithGoogle(idToken) {
  const data = await apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  return saveLoginResponse(data);
}

export async function loginWithLinkedIn(code) {
  const data = await apiRequest("/auth/linkedin", {
    method: "POST",
    body: JSON.stringify({
      code,
    }),
  });

  return saveLoginResponse(data);
}

export async function getCurrentUser() {
  return authenticatedApiRequest("/auth/me", {
    method: "GET",
  });
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthData();
    throw new Error("Session expired. Please login again.");
  }

  const data = await apiRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  saveAuthData({
    accessToken: data.access_token,
  });

  return data.access_token;
}

export async function getMyCandidateProfile() {
  return authenticatedApiRequest("/candidate/me/profile", {
    method: "GET",
  });
}

export async function updateMyCandidateProfile(profileData) {
  return authenticatedApiRequest("/candidate/me/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

export async function activateCandidate() {
  return authenticatedApiRequest("/candidate/activate", {
    method: "POST",
  });
}