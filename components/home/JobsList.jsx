"use client";

import { useEffect, useMemo, useState } from "react";

import JobCard from "@/components/home/JobCard";
import { listPublicActiveJobs } from "@/lib/api/jobsApi";
import { getStoredUser } from "@/lib/utils/tokenStorage";

const DEFAULT_VISIBLE_COUNT = 8;
const LOAD_MORE_COUNT = 8;

const initialFilters = {
  search: "",
  location: "",
  jobType: "",
  workMode: "",
  salaryRange: "",
  techStacks: [],
};

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Salary high", value: "salary-high" },
  { label: "Salary low", value: "salary-low" },
];

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getJobSearchText(job) {
  return normalize(
    [
      job.title,
      job.company_name,
      job.description,
      job.location,
      job.job_type,
      job.work_mode,
      job.required_skills,
    ].join(" ")
  );
}

function getSalaryValue(job) {
  return Number(job.salary_max || job.salary_min || 0);
}

function matchesSalaryRange(job, range) {
  if (!range) return true;

  const salary = getSalaryValue(job);

  if (!salary) return false;

  if (range === "200000+") {
    return salary >= 200000;
  }

  const [min, max] = range.split("-").map(Number);

  return salary >= min && salary <= max;
}

function matchesTechStacks(job, techStacks) {
  if (!Array.isArray(techStacks) || techStacks.length === 0) {
    return true;
  }

  const skills = normalize(job.required_skills);

  return techStacks.some((tech) => skills.includes(normalize(tech)));
}

function filterJobs(jobs, filters) {
  const search = normalize(filters.search);
  const location = normalize(filters.location);
  const jobType = normalize(filters.jobType);
  const workMode = normalize(filters.workMode);

  return jobs.filter((job) => {
    const searchableText = getJobSearchText(job);

    const matchesSearch = search ? searchableText.includes(search) : true;
    const matchesLocation = location
      ? normalize(job.location).includes(location) ||
        normalize(location).includes(normalize(job.location))
      : true;
    const matchesJobType = jobType
      ? normalize(job.job_type).includes(jobType)
      : true;
    const matchesWorkMode = workMode
      ? normalize(job.work_mode).includes(workMode)
      : true;
    const matchesTechStack = matchesTechStacks(job, filters.techStacks);
    const matchesSalary = matchesSalaryRange(job, filters.salaryRange);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesJobType &&
      matchesWorkMode &&
      matchesTechStack &&
      matchesSalary
    );
  });
}

function getRecommendedScore(job, isLoggedIn) {
  const text = getJobSearchText(job);
  let score = 0;

  if (isLoggedIn) score += 20;
  if (text.includes("frontend")) score += 8;
  if (text.includes("react")) score += 8;
  if (text.includes("next")) score += 6;
  if (text.includes("intern")) score += 4;
  if (job.status === "active") score += 4;

  score += Math.min(getSalaryValue(job) / 20000, 10);

  return score;
}

function sortJobs(jobs, sortMode, isLoggedIn) {
  const clonedJobs = [...jobs];

  if (sortMode === "latest") {
    return clonedJobs.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }

  if (sortMode === "popular") {
    return clonedJobs.sort((a, b) => {
      const aText = getJobSearchText(a);
      const bText = getJobSearchText(b);

      const aScore =
        (aText.includes("software") ? 8 : 0) +
        (aText.includes("developer") ? 8 : 0) +
        (aText.includes("engineer") ? 8 : 0) +
        (aText.includes("remote") ? 5 : 0);

      const bScore =
        (bText.includes("software") ? 8 : 0) +
        (bText.includes("developer") ? 8 : 0) +
        (bText.includes("engineer") ? 8 : 0) +
        (bText.includes("remote") ? 5 : 0);

      return bScore - aScore;
    });
  }

  if (sortMode === "salary-high") {
    return clonedJobs.sort((a, b) => getSalaryValue(b) - getSalaryValue(a));
  }

  if (sortMode === "salary-low") {
    return clonedJobs.sort((a, b) => getSalaryValue(a) - getSalaryValue(b));
  }

  return clonedJobs.sort(
    (a, b) =>
      getRecommendedScore(b, isLoggedIn) - getRecommendedScore(a, isLoggedIn)
  );
}

export default function JobsList() {
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [sortMode, setSortMode] = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadJobs() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listPublicActiveJobs();
      setJobs(Array.isArray(data) ? data : []);
      setVisibleCount(DEFAULT_VISIBLE_COUNT);
    } catch (error) {
      setErrorMessage(error.message || "Could not load jobs right now.");
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);

    loadJobs();
  }, []);

  useEffect(() => {
    function handleFiltersChanged(event) {
      setFilters({
        ...initialFilters,
        ...(event.detail || {}),
      });

      setVisibleCount(DEFAULT_VISIBLE_COUNT);
    }

    window.addEventListener("AccDoo:jobFiltersChanged", handleFiltersChanged);

    return () => {
      window.removeEventListener(
        "AccDoo:jobFiltersChanged",
        handleFiltersChanged
      );
    };
  }, []);

  const isLoggedIn = Boolean(currentUser);

  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  const sortedJobs = useMemo(
    () => sortJobs(filteredJobs, sortMode, isLoggedIn),
    [filteredJobs, sortMode, isLoggedIn]
  );

  const visibleJobs = sortedJobs.slice(0, visibleCount);
  const hasMoreJobs = visibleCount < sortedJobs.length;
  const hiddenJobsCount = Math.max(sortedJobs.length - visibleCount, 0);

  function handleLoadMore() {
    setVisibleCount((currentCount) => currentCount + LOAD_MORE_COUNT);
  }

  function handleSortChange(nextSortMode) {
    setSortMode(nextSortMode);
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }

  return (
    <section className="bg-white px-6 py-12 font-sans lg:px-8">
      <div className="mx-auto max-w-36.2517.5pxxl">
        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-[32px] font-medium tracking-tight text-[#202020] md:text-[38px]">
              {isLoading ? "Loading jobs..." : `${sortedJobs.length} total jobs`}
            </h2>

            <p className="mt-2 text-[15px] font-normal text-[#585958]">
              {isLoggedIn
                ? "Recommended active roles based on your profile and search filters."
                : "Explore active roles from trusted companies. Login to unlock AI match scores."}
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:w-fit">
            {SORT_OPTIONS.map((option) => {
              const isSelected = sortMode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSortChange(option.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-normal transition ${
                    isSelected
                      ? "bg-[#F7631E] text-white shadow-sm"
                      : "text-[#585958] hover:bg-orange-50 hover:text-[#F7631E]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm font-normal text-red-600">{errorMessage}</p>

            <button
              type="button"
              onClick={loadJobs}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white"
            >
              Retry loading jobs
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-normal text-[#585958]">
            Loading active job posts...
          </div>
        ) : visibleJobs.length ? (
          <div className="space-y-5">
            {visibleJobs.map((job) => (
              <JobCard key={job.id} job={job} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        ) : !errorMessage ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-base font-medium text-[#202020]">
              No matching jobs found.
            </p>
            <p className="mt-2 text-sm font-normal text-[#585958]">
              Try changing your search keywords, location, or filters.
            </p>
          </div>
        ) : null}

        {!isLoading && visibleJobs.length ? (
          <div className="mt-10 flex flex-col items-center gap-3">
            {hasMoreJobs ? (
              <>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm font-medium text-[#F7631E] shadow-sm transition hover:border-[#F7631E] hover:bg-orange-50"
                >
                  Load More Roles
                </button>

                <p className="text-xs font-normal text-slate-400">
                  {hiddenJobsCount} more job{hiddenJobsCount === 1 ? "" : "s"} available
                </p>
              </>
            ) : (
              <p className="rounded-full bg-slate-100 px-5 py-2 text-xs font-normal text-[#585958]">
                All matching jobs loaded
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}