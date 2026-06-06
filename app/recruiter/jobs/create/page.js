"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiBriefcase } from "react-icons/fi";

import RecruiterJobForm from "@/components/recruiter/RecruiterJobForm";
import RecruiterShell from "@/components/recruiter/RecruiterShell";
import {
  createRecruiterJob,
  getMyRecruiterProfile,
} from "@/lib/api/recruiterApi";

const initialFormData = {
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

export default function CreateRecruiterJobPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function checkRecruiterProfile() {
      setPageError("");

      try {
        const profile = await getMyRecruiterProfile();

        setFormData((currentData) => ({
          ...currentData,
          company_name: profile.company_name || "",
          location: profile.company_location || "",
        }));
      } catch (error) {
        setPageError(
          error.message ||
            "Please complete your recruiter profile before creating jobs."
        );
      } finally {
        setIsCheckingProfile(false);
      }
    }

    checkRecruiterProfile();
  }, []);

  async function handleCreateJob(jobPayload) {
    const createdJob = await createRecruiterJob(jobPayload);
    router.push(`/recruiter/jobs/${createdJob.id}`);
  }

  return (
    <RecruiterShell>
      <section>
        <button
          type="button"
          onClick={() => router.push("/recruiter/jobs")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2E8D76] transition hover:text-[#236e5c]"
        >
          <FiArrowLeft />
          Back to jobs
        </button>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[#F7631E]">
                Create job
              </p>

              <h1 className="mt-3 text-[34px] font-semibold tracking-tight text-[#0F172A] md:text-[42px]">
                Publish a new opportunity
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-normal leading-6 text-[#667085]">
                Add candidate-friendly job details. Draft jobs stay hidden,
                active jobs appear on the public job board.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiBriefcase size={22} />
            </div>
          </div>

          {pageError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-normal text-red-600">{pageError}</p>

              <button
                type="button"
                onClick={() => router.push("/recruiter/profile")}
                className="mt-3 rounded-xl bg-[#F7631E] px-4 py-2 text-sm font-semibold text-white"
              >
                Complete profile
              </button>
            </div>
          ) : (
            <RecruiterJobForm
              mode="create"
              initialFormData={formData}
              initialSkills={[]}
              isLoading={isCheckingProfile}
              onSubmit={handleCreateJob}
              onCancel={() => router.push("/recruiter/jobs")}
            />
          )}
        </div>
      </section>
    </RecruiterShell>
  );
}