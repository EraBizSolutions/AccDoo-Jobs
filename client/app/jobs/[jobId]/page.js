"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import Navbar from "@/components/home/Navbar";
import { getPublicJobDetails } from "@/lib/api/jobsApi";
import { getStoredUser } from "@/lib/utils/tokenStorage";

function getSkillTags(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function formatSalary(job) {
  if (!job?.salary_min && !job?.salary_max) return "Salary not disclosed";

  if (job.salary_min && job.salary_max) {
    return `LKR ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
  }

  if (job.salary_min) {
    return `From LKR ${job.salary_min.toLocaleString()}`;
  }

  return `Up to LKR ${job.salary_max.toLocaleString()}`;
}

function MetaPill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">
      {icon}
      {children}
    </span>
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

  const skills = getSkillTags(job?.required_skills);

  return (
    <main className="min-h-screen bg-slate-50 pt-20">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-700"
        >
          <FiArrowLeft />
          Back to jobs
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-sm font-bold text-slate-500">
            Loading job details...
          </div>
        ) : errorMessage ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8">
            <p className="text-sm font-bold text-red-600">{errorMessage}</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white"
            >
              Go back home
            </Link>
          </div>
        ) : job ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">
                      JobsEra verified role
                    </p>

                    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                      {job.title}
                    </h1>

                    <p className="mt-3 text-base font-bold text-slate-600">
                      {job.company_name} · {job.location || "Location not added"}
                    </p>
                  </div>

                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-xl font-black text-blue-700">
                    {job.company_name?.slice(0, 2)?.toUpperCase() || "JE"}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <MetaPill icon={<FiDollarSign />}>{formatSalary(job)}</MetaPill>
                  <MetaPill icon={<FiBriefcase />}>
                    {job.job_type || "Job type not added"}
                  </MetaPill>
                  <MetaPill icon={<FiClock />}>
                    {job.work_mode || "Work mode not added"}
                  </MetaPill>
                  <MetaPill icon={<FiMapPin />}>
                    {job.location || "Location not added"}
                  </MetaPill>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">
                  Strong Candidate Alignment
                </h2>

                <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-blue-600 bg-white text-center">
                      <div>
                        <p className="text-2xl font-black text-blue-700">82%</p>
                        <p className="text-[10px] font-black uppercase text-blue-500">
                          match
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-lg font-black text-slate-950">
                        <LuSparkles className="text-blue-700" />
                        AI-powered job fit preview
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                        JobsEra can calculate stronger matching after the candidate
                        uploads a CV. This preview is based on job skills and role data.
                      </p>

                      {skills.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-blue-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">
                  About the role
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm font-medium leading-7 text-slate-600">
                  {job.description}
                </p>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-xl font-black text-slate-950">
                  Required skills
                </h2>

                {skills.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Skills were not added for this job.
                  </p>
                )}
              </section>
            </div>

            <aside className="space-y-5">
              <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
                >
                  Apply now
                </button>

                <button
                  type="button"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Save job
                </button>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    Quick facts
                  </p>

                  <div className="mt-4 space-y-3 text-sm font-bold text-slate-600">
                    <p className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2">
                        <FiUsers /> Applicants
                      </span>
                      <span>New</span>
                    </p>

                    <p className="flex items-center justify-between">
                      <span>Status</span>
                      <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-black uppercase text-green-700">
                        {job.status}
                      </span>
                    </p>

                    <p className="flex items-center justify-between">
                      <span>Company</span>
                      <span>{job.company_name}</span>
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}