"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiPhone,
  FiShare2,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { getPublicJobDetails } from "@/lib/api/jobsApi";
import { getStoredUser } from "@/lib/utils/tokenStorage";

function getCompanyInitials(companyName = "JE") {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatSalary(job) {
  if (!job?.salary_min && !job?.salary_max) return "Salary not disclosed";

  if (job.salary_min && job.salary_max) {
    return `LKR ${Number(job.salary_min).toLocaleString()} - ${Number(
      job.salary_max
    ).toLocaleString()}/month`;
  }

  if (job.salary_min) {
    return `From LKR ${Number(job.salary_min).toLocaleString()}/month`;
  }

  return `Up to LKR ${Number(job.salary_max).toLocaleString()}/month`;
}

function formatValue(value, fallback = "Not added") {
  if (!value) return fallback;

  return String(value)
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
}

function getSkillTags(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function buildDescriptionSections(description) {
  if (!description) {
    return [
      {
        title: "About the role",
        items: [
          "This role is open for candidates who are ready to work with a growing team.",
          "The recruiter has shared the key job details through JobsEra.",
          "Apply after reviewing the role, location, and required skills.",
        ],
      },
    ];
  }

  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [
      {
        title: "About the role",
        paragraph: description,
      },
    ];
  }

  return [
    {
      title: "About the role",
      paragraph: lines[0],
    },
    {
      title: "What you’ll do",
      items: lines.slice(1, 6),
    },
  ];
}

function DetailMeta({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-normal text-[#585958]">
      {icon}
      {children}
    </span>
  );
}

function JobSection({ title, paragraph, items }) {
  return (
    <section className="mt-7">
      <h2 className="text-[24px] font-medium tracking-tight text-[#202020]">
        {title}
      </h2>

      {paragraph ? (
        <p className="mt-3 max-w-[450px]xl text-[15px] font-normal leading-7 text-[#202020]">
          {paragraph}
        </p>
      ) : null}

      {items?.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-6 text-[15px] font-normal leading-7 text-[#585958]">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export default function PublicJobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);

    async function loadJob() {
      try {
        const data = await getPublicJobDetails(jobId);
        setJob(data);
      } catch (error) {
        setErrorMessage(error.message || "Could not load job details.");
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  function handleApplyClick() {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    router.push("/candidate/upload-cv");
  }

  const companyName = job?.company_name || "JobsEra Company";
  const companyInitials = getCompanyInitials(companyName);
  const skills = getSkillTags(job?.required_skills);
  const sections = buildDescriptionSections(job?.description);

  return (
    <main className="min-h-screen bg-white font-sans">
      <Navbar />

      <section className="mx-auto max-w-36.2517.5pxxl px-5 py-8 lg:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back to jobs
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F9FBFB] p-8 text-sm font-normal text-[#585958]">
            Loading job details...
          </div>
        ) : errorMessage ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-sm font-normal text-red-600">{errorMessage}</p>

            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white"
            >
              Go back home
            </Link>
          </div>
        ) : job ? (
          <>
            <section className="mt-8 border-b border-slate-200 pb-9">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#202020] text-lg font-medium text-[#F7631E]">
                    {companyInitials}
                  </div>

                  <div>
                    <h1 className="text-[36px] font-medium tracking-tight text-[#202020] md:text-[44px]">
                      {job.title || "Untitled role"}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-lg font-normal text-[#F7631E]">
                        {companyName}
                      </p>
                      <MdVerified className="text-[#2b7a66]" size={18} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      <DetailMeta icon={<FiBriefcase size={16} />}>
                        {formatValue(job.job_type, "Job type not added")}
                      </DetailMeta>

                      <DetailMeta icon={<FiMapPin size={16} />}>
                        {job.location || "Location not added"}
                      </DetailMeta>

                      <DetailMeta icon={<FiDollarSign size={16} />}>
                        {formatSalary(job)}
                      </DetailMeta>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleApplyClick}
                    className="rounded-lg bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512]"
                  >
                    Apply for this job
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
                  >
                    <FiShare2 />
                    Share
                  </button>
                </div>
              </div>
            </section>

            <div className="grid gap-10 py-9 lg:grid-cols-[1fr_330px]">
              <article>
                {sections.map((section) => (
                  <JobSection
                    key={section.title}
                    title={section.title}
                    paragraph={section.paragraph}
                    items={section.items}
                  />
                ))}

                <JobSection
                  title="What we’re looking for"
                  items={[
                    "Clear communication and a professional work attitude.",
                    "Ability to understand requirements and complete assigned tasks.",
                    "Relevant skills or experience connected to this role.",
                    "Willingness to learn, improve, and work with the team.",
                  ]}
                />

                {skills.length ? (
                  <section className="mt-7">
                    <h2 className="text-[24px] font-medium tracking-tight text-[#202020]">
                      Skills
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-200 bg-[#F9FBFB] px-4 py-2 text-sm font-normal text-[#585958]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="mt-8 border-t border-slate-200 pt-7">
                  <h2 className="text-[24px] font-medium tracking-tight text-[#202020]">
                    Apply
                  </h2>

                  <p className="mt-2 text-sm font-normal text-[#585958]">
                    Login and upload your CV to continue with this application.
                  </p>

                  <button
                    type="button"
                    onClick={handleApplyClick}
                    className="mt-4 rounded-lg bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512]"
                  >
                    Apply now
                  </button>
                </section>
              </article>

              <aside className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-[#F9FBFB] p-6">
                  <p className="text-xs font-normal uppercase tracking-[0.2em] text-[#F7631E]">
                    Quick facts
                  </p>

                  <div className="mt-5 space-y-4 text-sm font-normal text-[#585958]">
                    <p className="flex items-center justify-between gap-4">
                      <span>Status</span>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                        {job.status || "active"}
                      </span>
                    </p>

                    <p className="flex items-center justify-between gap-4">
                      <span>Work mode</span>
                      <span>{formatValue(job.work_mode, "Not added")}</span>
                    </p>

                    <p className="flex items-center justify-between gap-4">
                      <span>Job type</span>
                      <span>{formatValue(job.job_type, "Not added")}</span>
                    </p>

                    <p className="flex items-center justify-between gap-4">
                      <span>Salary</span>
                      <span className="text-right">{formatSalary(job)}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#202020] text-sm font-medium text-[#F7631E]">
                      {companyInitials}
                    </div>

                    <div>
                      <p className="text-base font-medium text-[#202020]">
                        {companyName}
                      </p>
                      <p className="text-sm font-normal text-[#585958]">
                        Hiring through JobsEra
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-normal leading-6 text-[#585958]">
                    This recruiter is managing active openings through JobsEra.
                    Candidate matching becomes smarter after CV upload.
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6">
                  <p className="text-base font-medium text-[#202020]">
                    Need help?
                  </p>

                  <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
                    If the role looks suitable, apply through your candidate
                    workspace and keep your CV updated.
                  </p>

                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-normal text-[#F7631E]">
                    <FiPhone />
                    JobsEra candidate support
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </section>

      <Footer />
    </main>
  );
}