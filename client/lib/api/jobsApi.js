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

export async function listPublicActiveJobs() {
  const timeout = createTimeoutSignal();

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: timeout.signal,
    });

    return parseApiResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Jobs request timed out. Please check if backend is running.");
    }

    throw error;
  } finally {
    timeout.clear();
  }
}

export async function getPublicJobDetails(jobId) {
  const timeout = createTimeoutSignal();

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: timeout.signal,
    });

    return parseApiResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Job details request timed out. Please check if backend is running.");
    }

    throw error;
  } finally {
    timeout.clear();
  }
}