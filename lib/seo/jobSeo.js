const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.accdoo.jobs"
).replace(/\/$/, "");

const SITE_NAME = "accdoo.jobs";
const DEFAULT_COUNTRY = "Sri Lanka";
const DEFAULT_COUNTRY_CODE = "LK";
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/accdoo-logo.svg`;

function cleanText(value, fallback = "") {
  return String(value || fallback)
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, maxLength) {
  const text = cleanText(value);

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function stripHtml(value) {
  return cleanText(String(value || "").replace(/<[^>]*>/g, " "));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function slugifyJobPart(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getJobCity(job) {
  const location = cleanText(job?.location);

  if (!location) return "Sri Lanka";

  return location.split(",")[0]?.trim() || location;
}

export function getCanonicalJobUrl(jobId) {
  return `${SITE_URL}/jobs/${encodeURIComponent(String(jobId || ""))}`;
}

export function getCanonicalJobUrlForJob(job, jobId) {
  if (job?.public_url) {
    return job.public_url;
  }

  if (job?.canonical_path) {
    return `${SITE_URL}${job.canonical_path}`;
  }

  return getCanonicalJobUrl(jobId);
}

export function getJobSlug(job) {
  return [job?.title, getJobCity(job)].map(slugifyJobPart).filter(Boolean).join("-");
}

export function buildJobTitle(job) {
  const title = cleanText(job?.title, "Job");
  const city = getJobCity(job);
  const companyName = cleanText(job?.company_name, "AccDoo Company");

  return truncateText(
    `${title} Job in ${city}, ${DEFAULT_COUNTRY} at ${companyName} | ${SITE_NAME}`,
    60
  );
}

export function buildJobDescription(job) {
  const title = cleanText(job?.title, "this role");
  const city = getJobCity(job);
  const companyName = cleanText(job?.company_name, "the hiring company");

  return truncateText(
    `Apply now for the ${title} position at ${companyName} in ${city}. Explore duties, requirements, and salary details. Start your application today!`,
    155
  );
}

export function buildJobMetadata(job, jobId) {
  const canonicalUrl = getCanonicalJobUrlForJob(job, jobId);
  const title = buildJobTitle(job);
  const description = buildJobDescription(job);
  const city = getJobCity(job);
  const companyName = cleanText(job?.company_name, "AccDoo Company");
  const socialTitle = truncateText(
    `Hiring: ${cleanText(job?.title, "Job opportunity")} at ${companyName} (${city})`,
    70
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: socialTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_SOCIAL_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} job opportunity`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [DEFAULT_SOCIAL_IMAGE],
    },
  };
}

function getEmploymentType(jobType) {
  const normalized = cleanText(jobType).toLowerCase();

  if (normalized.includes("part")) return "PART_TIME";
  if (normalized.includes("contract")) return "CONTRACTOR";
  if (normalized.includes("intern")) return "INTERN";
  if (normalized.includes("temporary")) return "TEMPORARY";

  return "FULL_TIME";
}

function htmlDescription(description) {
  const plainDescription = stripHtml(description);

  if (!plainDescription) {
    return "<p>View this job opportunity on accdoo.jobs and apply online.</p>";
  }

  const paragraphs = plainDescription
    .split(/\n+/)
    .map((paragraph) => cleanText(paragraph))
    .filter(Boolean);

  if (!paragraphs.length) {
    return `<p>${escapeHtml(plainDescription)}</p>`;
  }

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function hasSalary(job) {
  return job?.salary_min || job?.salary_max;
}

function buildSalary(job) {
  if (!hasSalary(job)) return null;

  const minValue = Number(job.salary_min || job.salary_max);
  const maxValue = Number(job.salary_max || job.salary_min);

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return null;

  return {
    "@type": "MonetaryAmount",
    currency: "LKR",
    value: {
      "@type": "QuantitativeValue",
      minValue,
      maxValue,
      unitText: "MONTH",
    },
  };
}

export function isExpiredJob(job) {
  const status = cleanText(job?.status || job?.state || job?.job_status).toLowerCase();
  const isActive = job?.is_active;

  return (
    isActive === false ||
    status.includes("expired") ||
    status.includes("inactive") ||
    status.includes("closed")
  );
}

export function buildJobPostingSchema(job, jobId) {
  if (!job || isExpiredJob(job)) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: cleanText(job.title, "Job opportunity"),
    description: htmlDescription(job.description),
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: String(jobId || job.id || ""),
    },
    datePosted: job.created_at || job.date_posted || undefined,
    employmentType: getEmploymentType(job.job_type),
    hiringOrganization: {
      "@type": "Organization",
      name: cleanText(job.company_name, "AccDoo Company"),
      sameAs: SITE_URL,
      logo: DEFAULT_SOCIAL_IMAGE,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: getJobCity(job),
        addressCountry: DEFAULT_COUNTRY_CODE,
      },
    },
  };

  const validThrough = job.valid_through || job.expires_at || job.closing_date;
  const salary = buildSalary(job);

  if (validThrough) {
    schema.validThrough = validThrough;
  }

  if (salary) {
    schema.baseSalary = salary;
  }

  return schema;
}

export function buildBreadcrumbSchema(job, jobId) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jobs",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cleanText(job?.title, "Job opportunity"),
        item: getCanonicalJobUrlForJob(job, jobId),
      },
    ],
  };
}

export function getSiteUrl() {
  return SITE_URL;
}
