import { API_BASE_URL, parseApiResponse } from "@/lib/api/authApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

function createTimeoutSignal(milliseconds = 8000) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, milliseconds);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

function getOptionalAuthHeaders() {
  const token = getAccessToken();

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function publicApiRequest(path, errorMessage, options = {}) {
  const timeout = createTimeoutSignal();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getOptionalAuthHeaders(),
        ...(options.headers || {}),
      },
      signal: timeout.signal,
      ...options,
    });

    return parseApiResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `${errorMessage} Request timed out. Please check if backend is running.`
      );
    }

    throw error;
  } finally {
    timeout.clear();
  }
}

export async function listPublicActiveJobs() {
  return publicApiRequest("/jobs/", "Could not load jobs.");
}

export async function getPublicJobDetails(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return publicApiRequest(`/jobs/${jobId}`, "Could not load job details.");
}

export async function getPublicJobQuestions(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return publicApiRequest(
    `/job-questions/public/jobs/${jobId}`,
    "Could not load job questions."
  );
}