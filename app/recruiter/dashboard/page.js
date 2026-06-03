"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBriefcase,
  FiEdit3,
  FiPlus,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";

import Navbar from "@/components/home/Navbar";
import {
  closeRecruiterJob,
  getRecruiterDashboard,
} from "@/lib/api/recruiterApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

function statusClass(status) {
  if (status === "active") {
    return "bg-green-50 text-green-700";
  }

  if (status === "draft") {
    return "bg-yellow-50 text-yellow-700";
  }

  if (status === "closed") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function RecruiterDashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboard() {
    setErrorMessage("");

    try {
      setIsLoading(true);
      const data = await getRecruiterDashboard();
      setDashboard(data);
    } catch (error) {
      setErrorMessage(error.message || "Could not load recruiter dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    loadDashboard();
  }, [router]);

  async function handleCloseJob(jobId) {
    setErrorMessage("");
    setStatusMessage("");

    const confirmed = window.confirm(
      "This will mark the job as closed. You can recover it later from Manage Jobs. Continue?"
    );

    if (!confirmed) return;

    try {
      await closeRecruiterJob(jobId);
      setStatusMessage("Job closed successfully.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error.message || "Could not close job.");
    }
  }

  const stats = [
    ["Total jobs", dashboard?.total_jobs || 0],
    ["Active", dashboard?.active_jobs || 0],
    ["Draft", dashboard?.draft_jobs || 0],
    ["Closed", dashboard?.closed_jobs || 0],
  ];

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-36.2517.5pxxl px-5 py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
              Recruiter dashboard
            </p>
            <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
              Manage your hiring pipeline
            </h1>
            <p className="mt-3 max-w-36.2530xl text-sm font-normal leading-6 text-[#585958]">
              Track job status, review recent posts, and manage the company hiring workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/recruiter/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] shadow-sm transition hover:border-[#F7631E] hover:text-[#F7631E]"
            >
              <FiSettings />
              Company profile
            </Link>

            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] shadow-sm transition hover:border-[#F7631E] hover:text-[#F7631E]"
            >
              <FiBriefcase />
              Manage jobs
            </Link>

            <Link
              href="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#e85512]"
            >
              <FiPlus />
              Create job
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60"
            >
              <p className="text-sm font-normal text-[#585958]">{label}</p>
              <p className="mt-3 text-[42px] font-medium tracking-tight text-[#202020]">
                {isLoading ? "..." : value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-medium text-[#202020]">
              Recent job posts
            </h2>

            <Link
              href="/recruiter/jobs"
              className="text-sm font-medium text-[#F7631E]"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <p className="rounded-2xl bg-[#F9FBFB] px-4 py-4 text-sm font-normal text-[#585958]">
                Loading recent jobs...
              </p>
            ) : dashboard?.recent_jobs?.length ? (
              dashboard.recent_jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-[#F9FBFB] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="font-medium text-[#202020]">{job.title}</p>
                    <p className="mt-1 text-sm font-normal text-[#585958]">
                      {job.company_name} · {job.location || "Location not added"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-normal uppercase tracking-wide ${statusClass(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>

                    <Link
                      href={`/recruiter/jobs/${job.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-normal text-[#585958] shadow-sm transition hover:text-[#F7631E]"
                    >
                      <FiEdit3 />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCloseJob(job.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-normal text-red-700"
                    >
                      <FiTrash2 />
                      Close
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-[#F9FBFB] px-4 py-4 text-sm font-normal text-[#585958]">
                No job posts yet. Create your first job post.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}