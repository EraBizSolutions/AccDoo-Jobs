"use client";

import { useEffect, useMemo, useState } from "react";

import JobCard from "@/components/home/JobCard";
import { listPublicActiveJobs } from "@/lib/api/jobsApi";
import { getStoredUser } from "@/lib/utils/tokenStorage";

const DEFAULT_VISIBLE_COUNT = 18;
const LOAD_MORE_COUNT = 8;

const initialFilters = {
  search: "",
  location: "",
  jobType: "",
  workMode: "",
  salaryRange: "",
  techStacks: [],
};

const SORT_TABS = [
  { label: "Recommended", value: "recommended" },
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
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
      job.match_label,
      job.match_summary,
    ].join(" ")
  );
}

function getSalaryHighValue(job) {
  return Number(job.salary_max || job.salary_min || 0);
}

function getCreatedTime(job) {
  if (job.created_at) {
    const createdTime = new Date(job.created_at).getTime();

    if (!Number.isNaN(createdTime)) {
      return createdTime;
    }
  }

  return Number(job.id || 0);
}

function getMatchScore(job) {
  if (job.match_score === null || job.match_score === undefined) {
    return null;
  }

  const score = Number(job.match_score);

  if (Number.isNaN(score)) {
    return null;
  }

  return Math.max(0, Math.min(100, score));
}

function matchesSalaryRange(job, range) {
  if (!range) return true;

  const salary = getSalaryHighValue(job);

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

    const jobLocation = normalize(job.location);

    const matchesLocation = location
      ? jobLocation.includes(location) || location.includes(jobLocation)
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

function sortByRecommended(jobs) {
  return jobs.sort((a, b) => {
    const aMatchScore = getMatchScore(a);
    const bMatchScore = getMatchScore(b);

    const aHasMatch = aMatchScore !== null;
    const bHasMatch = bMatchScore !== null;

    if (aHasMatch && bHasMatch && bMatchScore !== aMatchScore) {
      return bMatchScore - aMatchScore;
    }

    if (aHasMatch && !bHasMatch) {
      return -1;
    }

    if (!aHasMatch && bHasMatch) {
      return 1;
    }

    return getCreatedTime(b) - getCreatedTime(a);
  });
}

function sortByPopular(jobs) {
  return jobs.sort((a, b) => {
    const aMatchScore = getMatchScore(a) || 0;
    const bMatchScore = getMatchScore(b) || 0;

    const aText = getJobSearchText(a);
    const bText = getJobSearchText(b);

    const aPopularScore =
      aMatchScore * 0.7 +
      (aText.includes("software") ? 8 : 0) +
      (aText.includes("developer") ? 8 : 0) +
      (aText.includes("engineer") ? 8 : 0) +
      (aText.includes("designer") ? 6 : 0) +
      (aText.includes("remote") ? 5 : 0);

    const bPopularScore =
      bMatchScore * 0.7 +
      (bText.includes("software") ? 8 : 0) +
      (bText.includes("developer") ? 8 : 0) +
      (bText.includes("engineer") ? 8 : 0) +
      (bText.includes("designer") ? 6 : 0) +
      (bText.includes("remote") ? 5 : 0);

    if (bPopularScore !== aPopularScore) {
      return bPopularScore - aPopularScore;
    }

    return getCreatedTime(b) - getCreatedTime(a);
  });
}

function sortJobs(jobs, sortMode) {
  const clonedJobs = [...jobs];

  if (sortMode === "recommended") {
    return sortByRecommended(clonedJobs);
  }

  if (sortMode === "latest") {
    return clonedJobs.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
  }

  if (sortMode === "popular") {
    return sortByPopular(clonedJobs);
  }

  return sortByRecommended(clonedJobs);
}

function CardSkeleton() {
  return (
    <div className="h-[136px] rounded-[10px] bg-[var(--card-bg)] shadow-[var(--shadow-card)] max-md:h-[150px]">
      <div className="flex h-full animate-pulse gap-4 p-[16px]">
        <div className="h-[44px] w-[44px] rounded-[8px] bg-black/10 dark:bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-1/3 rounded bg-black/10 dark:bg-white/10" />
          <div className="h-3 w-4/5 rounded bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </div>
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

    function handleAuthUpdate() {
      setCurrentUser(getStoredUser());
      loadJobs();
    }

    window.addEventListener("jobsera:auth-updated", handleAuthUpdate);

    return () => {
      window.removeEventListener("jobsera:auth-updated", handleAuthUpdate);
    };
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
    () => sortJobs(filteredJobs, sortMode),
    [filteredJobs, sortMode]
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
    <section className="px-[78px] pb-[74px] pt-[20px] font-sans max-xl:px-10 max-md:px-[32px] max-md:pb-[44px] max-md:pt-[28px]">
      <div className="mx-auto w-full max-w-[1260px]">
        <div className="mb-[28px] flex h-[52px] items-center justify-between rounded-[7px] bg-[var(--surface-bg)] px-[32px] shadow-[0_10px_30px_rgba(15,23,42,0.055)] ring-1 ring-black/[0.025] max-md:h-auto max-md:flex-col max-md:gap-[28px] max-md:bg-transparent max-md:px-0 max-md:shadow-none max-md:ring-0">
          <div className="order-1 max-md:order-2 max-md:text-center">
            <p className="text-[12px] font-medium text-[var(--text-muted)] max-md:text-[13px]">
              {isLoading
                ? "Loading opportunities..."
                : `${sortedJobs.length} active opportunities`}
            </p>
          </div>

          <div className="order-2 flex items-center justify-center gap-[4px] rounded-[6px] bg-[var(--surface-bg)] p-[4px] shadow-[0_10px_28px_rgba(15,23,42,0.08)] max-md:order-1 max-md:mx-auto max-md:w-fit">
            {SORT_TABS.map((tab) => {
              const isActive = sortMode === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleSortChange(tab.value)}
                  className={`h-[32px] whitespace-nowrap rounded-[5px] px-[18px] text-[11px] font-semibold transition active:scale-[0.98] max-md:h-[34px] max-md:px-[18px] max-md:text-[11px] ${
                    isActive
                      ? "bg-[#2563FF] text-white shadow-[0_8px_18px_rgba(37,99,255,0.25)]"
                      : "text-[var(--text-muted)] hover:bg-[#2563FF]/10 hover:text-[#2563FF]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-7 rounded-[13px] border border-red-200 bg-red-50 px-5 py-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-[13px] font-semibold text-red-600 dark:text-red-300">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadJobs}
              className="mt-3 h-[34px] rounded-[6px] bg-red-600 px-4 text-[12px] font-semibold text-white"
            >
              Retry loading jobs
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-x-[42px] gap-y-[22px] max-md:grid-cols-1 max-md:gap-y-[12px]">
            {Array.from({ length: 8 }).map((_, index) => (
              <CardSkeleton key={`job-skeleton-${index}`} />
            ))}
          </div>
        ) : visibleJobs.length ? (
          <div className="mx-auto grid max-w-[980px] grid-cols-2 gap-x-[42px] gap-y-[22px] max-md:grid-cols-1 max-md:gap-y-[12px]">
            {visibleJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                isLoggedIn={isLoggedIn}
                colorIndex={index}
              />
            ))}
          </div>
        ) : !errorMessage ? (
          <div className="rounded-[13px] border border-[var(--line-soft)] bg-[var(--card-bg)] px-8 py-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-[16px] font-semibold text-[var(--text-main)]">
              No matching jobs found.
            </p>

            <p className="mt-2 text-[13px] font-medium text-[var(--text-muted)]">
              Try changing your search keywords, location, or filters.
            </p>
          </div>
        ) : null}

        {!isLoading && visibleJobs.length && hasMoreJobs ? (
          <div className="mt-[54px] flex flex-col items-center justify-center gap-[10px] max-md:mt-[34px]">
            <button
              type="button"
              onClick={handleLoadMore}
              className="h-[36px] rounded-[5px] border border-[#BFC7D4] bg-[var(--surface-bg)] px-[22px] text-[12px] font-bold text-[var(--text-main)] shadow-sm transition hover:border-[#0152A4] hover:text-[#0152A4] active:scale-[0.98] dark:border-white/25"
            >
              Load More
            </button>

            <p className="text-[10px] font-semibold text-[var(--text-soft)]">
              {hiddenJobsCount} more job{hiddenJobsCount === 1 ? "" : "s"} available
            </p>
          </div>
        ) : null}

        {!isLoading && visibleJobs.length && !hasMoreJobs ? (
          <div className="mt-[54px] flex justify-center max-md:mt-[34px]">
            <p className="rounded-[5px] border border-[#BFC7D4] px-[18px] py-[10px] text-[12px] font-semibold text-[var(--text-muted)] dark:border-white/25">
              All jobs loaded
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}