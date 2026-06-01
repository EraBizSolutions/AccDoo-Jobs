"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

    if (!formData.title || !formData.company_name || !formData.description) {
      setErrorMessage("Title, company name, and description are required.");
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
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <Navbar />

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-7 shadow-2xl shadow-blue-950/10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Edit job
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
            Update job post
          </h1>

          {isLoading ? (
            <p className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              Loading job details...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Job title"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Company name"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Job description"
                rows={5}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
                />

                <select
                  name="work_mode"
                  value={formData.work_mode}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
                >
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>

                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>

                <input
                  name="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={handleChange}
                  placeholder="Salary min"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
                />

                <input
                  name="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={handleChange}
                  placeholder="Salary max"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
                />
              </div>

              <textarea
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                placeholder="Required skills, e.g. React, FastAPI, PostgreSQL"
                rows={3}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSubmitting ? "Updating..." : "Update job"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}