import {
  API_BASE_URL,
  authenticatedApiRequest,
  parseApiResponse,
} from "@/lib/api/authApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

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

export async function activateCandidateProfile() {
  return authenticatedApiRequest("/candidate/activate", {
    method: "POST",
  });
}

export async function uploadCandidateCv(file) {
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("You are not logged in.");
  }

  if (!file) {
    throw new Error("Please select a PDF CV file.");
  }

  const formData = new FormData();
  formData.append("cv_file", file);

  const response = await fetch(`${API_BASE_URL}/candidate/me/cv-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return parseApiResponse(response);
}