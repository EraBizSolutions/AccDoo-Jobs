import Link from "next/link";
import {
  FiArrowRight,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiShare2,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";

function getCompanyInitials(companyName = "JE") {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function getSkillTags(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return null;

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

function formatJobType(jobType) {
  if (!jobType) return "Job type not added";

  return jobType
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
}

function JobMetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[16px] font-normal text-slate-500">
      {icon}
      {children}
    </span>
  );
}

export default function JobCard({ job }) {
  const jobDetailsPath = `/jobs/${job.id}`;

  const companyName = job.company_name || "JobsEra Company";
  const logoText = getCompanyInitials(companyName);
  const salary = formatSalary(job);
  const skills = getSkillTags(job.required_skills);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 font-sans shadow-sm transition hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="grid gap-7 lg:grid-cols-[1fr_auto]">
        <div className="flex gap-5">
          <Link
            href={jobDetailsPath}
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#F9FBFB] text-lg font-medium text-[#0C203A] ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            {logoText}
          </Link>

          <div className="min-w-0">
            <Link
              href={jobDetailsPath}
              className="text-[23px] font-medium leading-tight tracking-tight text-[#0C203A] transition hover:text-[#F7631E]"
            >
              {job.title || "Untitled role"}
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-[17px] font-normal text-[#2b7a66]">
                {companyName}
              </p>
              <MdVerified size={18} className="text-[#2b7a66]" />
            </div>

            <p className="mt-5 text-[16px] font-normal text-[#0C203A]">
              {skills.length ? skills.join(" · ") : "Role details available"}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
              <JobMetaItem icon={<FiBriefcase size={18} />}>
                {formatJobType(job.job_type)}
              </JobMetaItem>

              <JobMetaItem icon={<FiMapPin size={18} />}>
                {job.location || "Location not added"}
              </JobMetaItem>

              {salary ? (
                <JobMetaItem icon={<FiDollarSign size={18} />}>
                  {salary}
                </JobMetaItem>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-8 lg:items-end">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[16px] font-medium text-[#0C203A] transition hover:text-[#F7631E]"
            >
              <FiShare2 size={18} />
              Share
            </button>

            <Link
              href={jobDetailsPath}
              className="inline-flex items-center gap-2 text-[16px] font-medium text-[#F7631E] transition hover:text-[#e85512]"
            >
              Apply
              <FiArrowRight size={18} />
            </Link>
          </div>

          <p className="text-sm font-normal text-slate-400">Open now</p>
        </div>
      </div>
    </article>
  );
}