"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiLoader,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import SecureCvButton from "@/components/common/SecureCvButton";
import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import { listMyCandidateApplications } from "@/lib/api/applicationsApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

const STATUS_STYLES = {
  applied: "bg-orange-50 text-[#F7631E] border-orange-100",
  screening: "bg-blue-50 text-blue-700 border-blue-100",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-100",
  screening_disqualified: "bg-red-50 text-red-700 border-red-100",
  interview: "bg-purple-50 text-purple-700 border-purple-100",
  shortlisted: "bg-indigo-50 text-indigo-700 border-indigo-100",
  offer: "bg-yellow-50 text-yellow-700 border-yellow-100",
  hired: "bg-green-50 text-green-700 border-green-100",
  offer_declined: "bg-red-50 text-red-700 border-red-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
};

const STATUS_LABELS = {
  applied: "Applied",
  screening: "Screening",
  qualified: "Qualified",
  screening_disqualified: "Screening Disqualified",
  interview: "Interview",
  shortlisted: "Shortlisted",
  offer: "Offer",
  hired: "Hired",
  offer_declined: "Offer Declined",
  rejected: "Rejected",
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "screening" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Hired", value: "hired" },
  { label: "Rejected", value: "rejected" },
];

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "Applied";
}

function getStatusStyle(status) {
  return STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-100";
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(dateValue));
  } catch {
    return "Date not available";
  }
}

function getProgressPercent(status) {
  const progressMap = {
    applied: 12,
    screening: 28,
    qualified: 42,
    screening_disqualified: 100,
    interview: 58,
    shortlisted: 72,
    offer: 86,
    hired: 100,
    offer_declined: 100,
    rejected: 100,
  };

  return progressMap[status] || 12;
}

function getProgressText(status) {
  if (status === "hired") {
    return "Great news. You reached the hired stage.";
  }

  if (
    status === "rejected" ||
    status === "screening_disqualified" ||
    status === "offer_declined"
  ) {
    return "This application is closed by the recruiter.";
  }

  if (status === "offer") {
    return "You are in the offer stage.";
  }

  if (status === "interview") {
    return "You are selected for interview stage.";
  }

  if (status === "shortlisted") {
    return "You are shortlisted by the recruiter.";
  }

  if (status === "qualified") {
    return "Your profile is marked as qualified.";
  }

  if (status === "screening") {
    return "Recruiter is screening your application.";
  }

  return "Your application has been submitted.";
}

function ApplicationStats({ applications, isLoading }) {
  const stats = useMemo(() => {
    return [
      {
        label: "Total applications",
        value: applications.length,
      },
      {
        label: "In progress",
        value: applications.filter((application) =>
          [
            "applied",
            "screening",
            "qualified",
            "interview",
            "shortlisted",
            "offer",
          ].includes(application.status)
        ).length,
      },
      {
        label: "Interviews",
        value: applications.filter(
          (application) => application.status === "interview"
        ).length,
      },
      {
        label: "Offers",
        value: applications.filter(
          (application) => application.status === "offer"
        ).length,
      },
    ];
  }, [applications]);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50"
        >
          <p className="text-sm font-normal text-[#585958]">{stat.label}</p>
          <p className="mt-3 text-[38px] font-medium tracking-tight text-[#202020]">
            {isLoading ? "..." : stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function ApplicationFilters({ activeFilter, setActiveFilter }) {
  return (
    <div className="mt-7 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {FILTERS.map((filter) => {
        const isSelected = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-xl px-4 py-2 text-sm font-normal transition ${
              isSelected
                ? "bg-[#F7631E] text-white"
                : "text-[#585958] hover:bg-orange-50 hover:text-[#F7631E]"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

function ApplicationCard({ application }) {
  const job = application.job || {};
  const status = application.status || "applied";
  const progressPercent = getProgressPercent(status);
  const cvVersion = `${application.id}-${application.updated_at || application.applied_at || ""}`;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-slate-200/70">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#202020] text-[#F7631E]">
            <FiBriefcase size={22} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-medium tracking-tight text-[#202020]">
                {job.title || "Job title not available"}
              </h2>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-normal uppercase tracking-wide ${getStatusStyle(
                  status
                )}`}
              >
                {getStatusLabel(status)}
              </span>
            </div>

            <p className="mt-2 text-sm font-normal text-[#585958]">
              {job.company_name || "Company not available"}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-normal text-[#585958]">
              <span className="inline-flex items-center gap-2">
                <FiMapPin size={15} />
                {job.location || "Location not added"}
              </span>

              <span className="inline-flex items-center gap-2">
                <FiCalendar size={15} />
                Applied {formatDate(application.applied_at)}
              </span>

              <span className="inline-flex items-center gap-2">
                <FiClock size={15} />
                {getProgressText(status)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {application.cv_url ? (
            <SecureCvButton
              cvUrl={application.cv_url}
              version={cvVersion}
              label="View CV"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
            />
          ) : null}

          {job.id ? (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e85512]"
            >
              View job
              <FiExternalLink size={14} />
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-[#F9FBFB] p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-normal uppercase tracking-[0.2em] text-[#585958]">
            Application progress
          </p>

          <p className="text-xs font-medium text-[#F7631E]">
            {progressPercent}%
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-[#F7631E] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {application.cover_note ? (
          <p className="mt-4 line-clamp-2 text-sm font-normal leading-6 text-[#585958]">
            {application.cover_note}
          </p>
        ) : (
          <p className="mt-4 text-sm font-normal leading-6 text-[#585958]">
            No cover note added for this application.
          </p>
        )}
      </div>
    </article>
  );
}

function EmptyApplicationsState() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/50">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
        <FiBriefcase size={26} />
      </div>

      <h2 className="mt-5 text-xl font-medium text-[#202020]">
        No applications found.
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm font-normal leading-6 text-[#585958]">
        Apply to a job first. Your application history will appear here with
        recruiter status updates.
      </p>

      <Link
        href="/"
        className="mt-5 inline-flex rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512]"
      >
        Browse jobs
      </Link>
    </div>
  );
}

export default function CandidateApplicationsView() {
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function loadApplications({ showSuccessMessage = false } = {}) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsLoading(true);
      const data = await listMyCandidateApplications();
      setApplications(Array.isArray(data) ? data : []);

      if (showSuccessMessage) {
        setStatusMessage("Applications refreshed.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Could not load your applications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    loadApplications();
  }, [router]);

  const filteredApplications = useMemo(() => {
    if (activeFilter === "all") return applications;

    if (activeFilter === "rejected") {
      return applications.filter((application) =>
        ["rejected", "screening_disqualified", "offer_declined"].includes(
          application.status
        )
      );
    }

    return applications.filter(
      (application) => application.status === activeFilter
    );
  }, [applications, activeFilter]);

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back to jobs
        </Link>

        <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
              <LuSparkles size={14} />
              Candidate workspace
            </div>

            <h1 className="mt-3 text-[36px] font-medium tracking-tight text-[#202020] md:text-[44px]">
              My applications
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
              Track every job you applied for, follow status changes, and keep
              your career pipeline tidy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadApplications({ showSuccessMessage: true })}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] shadow-sm transition hover:border-[#F7631E] hover:text-[#F7631E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
            Refresh
          </button>
        </div>

        <ApplicationStats applications={applications} isLoading={isLoading} />

        <ApplicationFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {errorMessage ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
            {errorMessage}
          </p>
        ) : null}

        {statusMessage && !errorMessage ? (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
            <FiCheckCircle className="mr-2 inline" />
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-8 space-y-5">
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm font-normal text-[#585958] shadow-xl shadow-slate-200/50">
              Loading your applications...
            </div>
          ) : filteredApplications.length ? (
            filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          ) : (
            <EmptyApplicationsState />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}   
