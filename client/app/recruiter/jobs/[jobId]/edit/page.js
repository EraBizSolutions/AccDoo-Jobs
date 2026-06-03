"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

import Navbar from "@/components/home/Navbar";
import RecruiterJobForm from "@/components/recruiter/RecruiterJobForm";
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
    router.push("/recruiter/jobs");
  }

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-5xl px-5 py-10">
        <button
          type="button"
          onClick={() => router.push("/recruiter/jobs")}
          className="inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back to manage jobs
        </button>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 md:p-8">
          <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
            Edit job
          </p>

          <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
            Update job post
          </h1>

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
              onCancel={() => router.push("/recruiter/jobs")}
            />
          )}
        </div>
      </section>
    </main>
  );
}