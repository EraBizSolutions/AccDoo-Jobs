import { API_BASE_URL, parseApiResponse } from "@/lib/api/authApi";

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

async function publicApiRequest(path, errorMessage) {
  const timeout = createTimeoutSignal();

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: timeout.signal,
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