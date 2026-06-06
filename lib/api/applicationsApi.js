import { authenticatedApiRequest } from "@/lib/api/authApi";

export async function submitCandidateApplication(applicationData) {
  return authenticatedApiRequest("/applications/candidate", {
    method: "POST",
    body: JSON.stringify(applicationData),
  });
}

export async function listMyCandidateApplications() {
  return authenticatedApiRequest("/applications/candidate/me", {
    method: "GET",
  });
}

export async function getMyCandidateApplicationDetails(applicationId) {
  if (!applicationId) {
    throw new Error("Application id is missing.");
  }

  return authenticatedApiRequest(`/applications/candidate/${applicationId}`, {
    method: "GET",
  });
}

export async function listRecruiterApplications() {
  return authenticatedApiRequest("/applications/recruiter", {
    method: "GET",
  });
}

export async function listRecruiterJobApplications(jobId) {
  if (!jobId) {
    throw new Error("Job id is missing.");
  }

  return authenticatedApiRequest(`/applications/recruiter/jobs/${jobId}`, {
    method: "GET",
  });
}

export async function getRecruiterApplicationDetails(applicationId) {
  if (!applicationId) {
    throw new Error("Application id is missing.");
  }

  return authenticatedApiRequest(`/applications/recruiter/${applicationId}`, {
    method: "GET",
  });
}

export async function updateRecruiterApplicationStatus(applicationId, statusData) {
  if (!applicationId) {
    throw new Error("Application id is missing.");
  }

  return authenticatedApiRequest(`/applications/recruiter/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify(statusData),
  });
}