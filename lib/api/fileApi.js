import {
  API_BASE_URL,
  parseApiResponse,
  refreshAccessToken,
} from "@/lib/api/authApi";
import { clearAuthData, getAccessToken } from "@/lib/utils/tokenStorage";

export function buildApiFileUrl(fileUrlOrPath) {
  if (!fileUrlOrPath) {
    throw new Error("File URL is missing.");
  }

  if (
    fileUrlOrPath.startsWith("http://") ||
    fileUrlOrPath.startsWith("https://")
  ) {
    return fileUrlOrPath;
  }

  if (fileUrlOrPath.startsWith("/")) {
    return `${API_BASE_URL}${fileUrlOrPath}`;
  }

  return `${API_BASE_URL}/${fileUrlOrPath}`;
}

export function buildProtectedPdfPreviewUrl(fileUrlOrPath, version = "") {
  if (!fileUrlOrPath) return "#";

  const cacheVersion = version || Date.now();

  return `/cv-preview?file=${encodeURIComponent(
    fileUrlOrPath
  )}&v=${encodeURIComponent(cacheVersion)}`;
}

async function fetchProtectedFile(fileUrlOrPath, accessToken) {
  const fileUrl = buildApiFileUrl(fileUrlOrPath);
  const cacheBuster = `cv_cache=${Date.now()}`;
  const separator = fileUrl.includes("?") ? "&" : "?";
  const freshFileUrl = `${fileUrl}${separator}${cacheBuster}`;

  return fetch(freshFileUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}

async function parseProtectedFileError(response) {
  try {
    await parseApiResponse(response);
  } catch (error) {
    return error.message || "Could not open file.";
  }

  return "Could not open file.";
}

export async function getProtectedPdfBlob(fileUrlOrPath) {
  let accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  let response = await fetchProtectedFile(fileUrlOrPath, accessToken);

  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      response = await fetchProtectedFile(fileUrlOrPath, accessToken);
    } catch (error) {
      clearAuthData();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      throw error;
    }
  }

  if (!response.ok) {
    const errorMessage = await parseProtectedFileError(response);
    throw new Error(errorMessage);
  }

  const blob = await response.blob();

  if (blob.type === "application/pdf") {
    return blob;
  }

  return new Blob([blob], { type: "application/pdf" });
}