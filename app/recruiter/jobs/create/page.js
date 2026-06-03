"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiBriefcase } from "react-icons/fi";

import Navbar from "@/components/home/Navbar";
import RecruiterJobForm from "@/components/recruiter/RecruiterJobForm";
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

  useEffect(() => {
    async function checkRecruiterProfile() {
      try {
        const profile = await getMyRecruiterProfile();

        setFormData((currentData) => ({
          ...currentData,
          company_name: profile.company_name || "",
          location: profile.company_location || "",
        }));
      } catch {
        router.push("/recruiter/profile");
      } finally {
        setIsCheckingProfile(false);
      }
    }

    checkRecruiterProfile();
  }, [router]);

  async function handleCreateJob(jobPayload) {
    await createRecruiterJob(jobPayload);
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
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
                Create job
              </p>

              <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
                Publish a new opportunity
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
                Add candidate-friendly job details. Drafts stay hidden, active jobs appear on the public job board.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiBriefcase size={22} />
            </div>
          </div>

          <RecruiterJobForm
            mode="create"
            initialFormData={formData}
            initialSkills={[]}
            isLoading={isCheckingProfile}
            onSubmit={handleCreateJob}
            onCancel={() => router.push("/recruiter/jobs")}
          />
        </div>
      </section>
    </main>
  );
}