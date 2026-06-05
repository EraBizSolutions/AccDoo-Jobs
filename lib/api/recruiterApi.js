import { authenticatedApiRequest } from "@/lib/api/authApi";

export async function activateRecruiterProfile(profileData) {
  return authenticatedApiRequest("/recruiter/activate", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

export async function getMyRecruiterProfile() {
  return authenticatedApiRequest("/recruiter/me/profile", {
    method: "GET",
  });
}

export async function updateMyRecruiterProfile(profileData) {
  return authenticatedApiRequest("/recruiter/me/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

export async function getRecruiterDashboard() {
  return authenticatedApiRequest("/recruiter/dashboard", {
    method: "GET",
  });
}

export async function createRecruiterJob(jobData) {
  return authenticatedApiRequest("/recruiter/jobs", {
    method: "POST",
    body: JSON.stringify(jobData),
  });
}

export async function listRecruiterJobs() {
  return authenticatedApiRequest("/recruiter/jobs", {
    method: "GET",
  });
}

export async function getRecruiterJob(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/recruiter/jobs/${jobId}`, {
    method: "GET",
  });
}

export async function updateRecruiterJob(jobId, jobData) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/recruiter/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
}

export async function closeRecruiterJob(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/recruiter/jobs/${jobId}`, {
    method: "DELETE",
  });
}

export async function createRecruiterJobQuestion(jobId, questionData) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/job-questions/recruiter/jobs/${jobId}`, {
    method: "POST",
    body: JSON.stringify(questionData),
  });
}

export async function listRecruiterJobQuestions(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/job-questions/recruiter/jobs/${jobId}`, {
    method: "GET",
  });
}

export async function updateRecruiterJobQuestion(jobId, questionId, questionData) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  if (!questionId) {
    throw new Error("Question id is missing.");
  }

  return authenticatedApiRequest(
    `/job-questions/recruiter/jobs/${jobId}/${questionId}`,
    {
      method: "PUT",
      body: JSON.stringify(questionData),
    }
  );
}

export async function deleteRecruiterJobQuestion(jobId, questionId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  if (!questionId) {
    throw new Error("Question id is missing.");
  }

  return authenticatedApiRequest(
    `/job-questions/recruiter/jobs/${jobId}/${questionId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getRecruiterAtsOverview() {
  return authenticatedApiRequest("/recruiter/ats/overview", {
    method: "GET",
  });
}

export async function getRecruiterJobAtsPipeline(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/recruiter/ats/jobs/${jobId}/pipeline`, {
    method: "GET",
  });
}