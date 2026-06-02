"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiSave } from "react-icons/fi";

import Navbar from "@/components/home/Navbar";
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
  required_skills: "",
  status: "draft",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E]";

const labelClass = "text-sm font-normal text-[#585958]";

export default function EditRecruiterJobPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params.jobId;

  const [formData, setFormData] = useState(emptyFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
          required_skills: job.required_skills || "",
          status: job.status || "draft",
        });
      } catch (error) {
        setErrorMessage(error.message || "Could not load job details.");
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    if (!formData.title.trim()) {
      setErrorMessage("Job title is required.");
      return;
    }

    if (!formData.company_name.trim()) {
      setErrorMessage("Company name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage("Job description is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateRecruiterJob(jobId, {
        ...formData,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      });

      router.push("/recruiter/jobs");
    } catch (error) {
      setErrorMessage(error.message || "Could not update job.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-[450px]xl px-5 py-10">
        <button
          type="button"
          onClick={() => router.push("/recruiter/jobs")}
          className="inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back to manage jobs
        </button>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-200/70">
          <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
            Edit job
          </p>

          <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
            Update job post
          </h1>

          {isLoading ? (
            <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
              Loading job details...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className={labelClass}>Job title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Job title"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label className={labelClass}>Company name</label>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Company name"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label className={labelClass}>Job description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Job description"
                  rows={7}
                  className={`mt-2 resize-none ${inputClass}`}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Work mode</label>
                  <select
                    name="work_mode"
                    value={formData.work_mode}
                    onChange={handleChange}
                    className={`mt-2 ${inputClass}`}
                  >
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Job type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className={`mt-2 ${inputClass}`}
                  >
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Publishing status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`mt-2 ${inputClass}`}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Salary min</label>
                  <input
                    name="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={handleChange}
                    placeholder="Salary min"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Salary max</label>
                  <input
                    name="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={handleChange}
                    placeholder="Salary max"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Required skills</label>
                <textarea
                  name="required_skills"
                  value={formData.required_skills}
                  onChange={handleChange}
                  placeholder="React, FastAPI, PostgreSQL"
                  rows={3}
                  className={`mt-2 resize-none ${inputClass}`}
                />
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/recruiter/jobs")}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  <FiSave />
                  {isSubmitting ? "Updating..." : "Update job"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}