import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  saveAuthData,
} from "@/lib/utils/tokenStorage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function parseApiResponse(response) {
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

function saveLoginResponse(data) {
  saveAuthData({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  });

  return data;
}

export async function registerCandidate({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return parseApiResponse(response);
}

export async function loginCandidate({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await parseApiResponse(response);
  return saveLoginResponse(data);
}

export async function loginWithGoogle(idToken) {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  const data = await parseApiResponse(response);
  return saveLoginResponse(data);
}

export async function getCurrentUser() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse(response);
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthData();
    throw new Error("Session expired. Please login again.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  const data = await parseApiResponse(response);

  saveAuthData({
    accessToken: data.access_token,
  });

  return data.access_token;
}