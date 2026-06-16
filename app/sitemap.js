import { listPublicActiveJobs } from "@/lib/api/jobsApi";
import {
  getCanonicalJobUrlForJob,
  getSiteUrl,
  isExpiredJob,
} from "@/lib/seo/jobSeo";

export const revalidate = 300;

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const routes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const jobs = await listPublicActiveJobs();

    if (Array.isArray(jobs)) {
      jobs
        .filter((job) => !isExpiredJob(job))
        .forEach((job) => {
          const jobId = job.id || job.job_id || job.slug;

          if (!jobId) return;

          routes.push({
            url: getCanonicalJobUrlForJob(job, jobId),
            lastModified: job.updated_at || job.created_at || new Date(),
            changeFrequency: "daily",
            priority: 0.8,
          });
        });
    }
  } catch {
    // Keep the sitemap valid even if the jobs API is temporarily unavailable.
  }

  return routes;
}
