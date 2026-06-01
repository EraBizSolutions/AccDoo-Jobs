import Link from "next/link";
import {
  FiMapPin,
  FiShare2,
  FiBriefcase,
  FiDollarSign,
  FiClock,
  FiArrowRight,
  FiLock,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { LuSparkles } from "react-icons/lu";

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
      {icon}
      {children}
    </span>
  );
}

function getCompanyInitials(companyName = "JE") {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return null;

  if (job.salary_min && job.salary_max) {
    return `LKR ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
  }

  if (job.salary_min) {
    return `From LKR ${job.salary_min.toLocaleString()}`;
  }

  return `Up to LKR ${job.salary_max.toLocaleString()}`;
}

function getSkillTags(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export default function JobCard({ job, isLoggedIn = false }) {
  const jobDetailsPath = `/jobs/${job.id}`;

  const companyName = job.company_name || job.company || "JobsEra Company";
  const logoText = job.logoText || getCompanyInitials(companyName);
  const title = job.title || "Untitled role";
  const location = job.location || "Location not added";
  const jobType = job.job_type || job.type || "Role";
  const workMode = job.work_mode || job.mode || "Work mode not added";
  const salary = job.salary || formatSalary(job);
  const tags = job.tags || getSkillTags(job.required_skills);
  const category = job.category || "Technology";
  const match = job.match || "82%";
  const aiStatus =
    job.aiStatus ||
    job.statusText ||
    "Strong match based on your profile and skills.";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-lg hover:shadow-blue-950/5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 gap-4">
          <Link
            href={jobDetailsPath}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-sm font-extrabold text-blue-700 shadow-sm transition hover:border-blue-300"
          >
            {logoText}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={jobDetailsPath}
                className="text-lg font-extrabold leading-snug text-slate-950 transition hover:text-blue-700 md:text-xl"
              >
                {title}
              </Link>

              {isLoggedIn ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">
                  <LuSparkles size={12} />
                  AI Pick
                </span>
              ) : null}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-extrabold text-emerald-700">
                {companyName}
              </p>

              <MdVerified className="text-emerald-600" size={16} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-800">
              {category}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <JobMetaItem icon={<FiBriefcase size={15} />}>
                {jobType}
              </JobMetaItem>

              <JobMetaItem icon={<FiMapPin size={15} />}>
                {location}
              </JobMetaItem>

              {salary ? (
                <JobMetaItem icon={<FiDollarSign size={15} />}>
                  {salary}
                </JobMetaItem>
              ) : null}

              <JobMetaItem icon={<FiClock size={15} />}>
                {workMode}
              </JobMetaItem>
            </div>

            {tags.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-5 lg:min-w-60 lg:items-end">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-1.5 text-sm font-extrabold text-slate-800 transition hover:text-blue-700">
              <FiShare2 size={15} />
              Share
            </button>

            <Link
              href={jobDetailsPath}
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-orange-500 transition hover:text-orange-600"
            >
              View details
              <FiArrowRight size={15} />
            </Link>
          </div>

          {isLoggedIn ? (
            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 lg:w-52">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold uppercase tracking-wide text-blue-500">
                  AI Match
                </span>
                <span className="text-lg font-black text-blue-700">
                  {match}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-blue-700"
                  style={{ width: match }}
                />
              </div>

              <p className="mt-2 text-xs font-bold text-slate-600">
                {aiStatus}
              </p>
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-52">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <FiLock size={13} />
                AI Match Locked
              </div>

              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                Login and upload your CV to unlock personalized match scores.
              </p>
            </div>
          )}

          <p className="text-sm font-semibold text-slate-400">
            Status: {job.status || "active"}
          </p>
        </div>
      </div>
    </article>
  );
}