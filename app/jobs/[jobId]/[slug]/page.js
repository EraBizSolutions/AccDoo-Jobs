import { permanentRedirect } from "next/navigation";

import PublicJobDetailsView from "@/components/jobs/PublicJobDetailsView";
import { getPublicJobDetails } from "@/lib/api/jobsApi";
import {
  buildBreadcrumbSchema,
  buildJobMetadata,
  buildJobPostingSchema,
  getCanonicalJobUrl,
  getJobSlug,
} from "@/lib/seo/jobSeo";

export const revalidate = 300;

async function getJobForSeo(jobId) {
  try {
    return await getPublicJobDetails(jobId);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { jobId } = await params;
  const job = await getJobForSeo(jobId);

  if (!job) {
    return {
      title: "Job Opportunity | accdoo.jobs",
      description:
        "Explore this job opportunity on accdoo.jobs and apply online today.",
      alternates: {
        canonical: getCanonicalJobUrl(jobId),
      },
    };
  }

  return buildJobMetadata(job, jobId);
}

export default async function PublicJobDetailsSlugPage({ params }) {
  const { jobId, slug } = await params;
  const initialJob = await getJobForSeo(jobId);

  if (initialJob) {
    const canonicalSlug = initialJob.slug || getJobSlug(initialJob);

    if (slug !== canonicalSlug) {
      permanentRedirect(`/jobs/${jobId}/${canonicalSlug}`);
    }
  }

  const schemas = [
    buildJobPostingSchema(initialJob, jobId),
    initialJob ? buildBreadcrumbSchema(initialJob, jobId) : null,
  ].filter(Boolean);

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <PublicJobDetailsView initialJob={initialJob} />
    </>
  );
}
