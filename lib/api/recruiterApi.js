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
  return authenticatedApiRequest(`/recruiter/jobs/${jobId}`, {
    method: "GET",
  });
}

export async function updateRecruiterJob(jobId, jobData) {
  return authenticatedApiRequest(`/recruiter/jobs/${jobId}`, {
    method: "PUT",
    body: JSON.stringify(jobData),
  });
}

export async function closeRecruiterJob(jobId) {
  return authenticatedApiRequest(`/recruiter/jobs/${jobId}`, {
    method: "DELETE",
  });
}