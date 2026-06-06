"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";

import RecruiterJobForm from "@/components/recruiter/RecruiterJobForm";
import RecruiterShell from "@/components/recruiter/RecruiterShell";
import { getRecruiterJob, updateRecruiterJob } from "@/lib/api/recruiterApi";

const emptyFormData = {
  title: "",
  company_name: "",
  description: "",
  location: "",
  work_mode: "hybrid",
  job_type: "internship",
  salary_min: "",
  salary_max: "",
  status: "draft",
};

function parseSkills(requiredSkills) {
  if (!requiredSkills) return [];

  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function EditRecruiterJobPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params.jobId;

  const [formData, setFormData] = useState(emptyFormData);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function loadJob() {
      setPageError("");

      try {
        const job = await getRecruiterJob(jobId);

        setFormData({
          title: job.title || "",
          company_name: job.company_name || "",
          description: job.description || "",
          location: job.location || "",
          work_mode: job.work_mode || "hybrid",
          job_type: job.job_type || "internship",
          salary_min: job.salary_min ?? "",
          salary_max: job.salary_max ?? "",
          status: job.status || "draft",
        });

        setSkills(parseSkills(job.required_skills));
      } catch (error) {
        setPageError(error.message || "Could not load job details.");
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  async function handleUpdateJob(jobPayload) {
    await updateRecruiterJob(jobId, jobPayload);
    router.push(`/recruiter/jobs/${jobId}`);
  }

  return (
    <RecruiterShell>
      <section>
        <button
          type="button"
          onClick={() => router.push(`/recruiter/jobs/${jobId}`)}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2E8D76] transition hover:text-[#236e5c]"
        >
          <FiArrowLeft />
          Back to job workspace
        </button>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F7631E]">
                Edit job
              </p>

              <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#0F172A] md:text-[42px]">
                Update job post
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
                Keep the role details clean, accurate, and ready for candidate
                applications.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiEdit3 size={22} />
            </div>
          </div>

          {pageError ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
              {pageError}
            </p>
          ) : (
            <RecruiterJobForm
              mode="edit"
              initialFormData={formData}
              initialSkills={skills}
              isLoading={isLoading}
              onSubmit={handleUpdateJob}
              onCancel={() => router.push(`/recruiter/jobs/${jobId}`)}
            />
          )}
        </div>
      </section>
    </RecruiterShell>
  );
}