"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/home/Navbar";
import {
  activateRecruiterProfile,
  getMyRecruiterProfile,
  updateMyRecruiterProfile,
} from "@/lib/api/recruiterApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

const initialFormData = {
  company_name: "",
  company_website: "",
  company_location: "",
  contact_phone: "",
};

export default function RecruiterProfilePage() {
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!getAccessToken()) {
        router.push("/login");
        return;
      }

      try {
        const profile = await getMyRecruiterProfile();

        setHasProfile(true);
        setFormData({
          company_name: profile.company_name || "",
          company_website: profile.company_website || "",
          company_location: profile.company_location || "",
          contact_phone: profile.contact_phone || "",
        });
      } catch {
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

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
    setStatusMessage("");

    if (!formData.company_name.trim()) {
      setErrorMessage("Company name is required.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (hasProfile) {
        await updateMyRecruiterProfile(formData);
      } else {
        await activateRecruiterProfile(formData);
      }

      setStatusMessage("Company profile saved. Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/recruiter/dashboard");
      }, 700);
    } catch (error) {
      setErrorMessage(error.message || "Could not save recruiter profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <Navbar />

      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-7 shadow-2xl shadow-blue-950/10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            Recruiter setup
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
            Company information
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Add your company details before managing job posts.
          </p>

          {isLoading ? (
            <p className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
              Loading recruiter profile...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Company name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <input
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="Company website"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <input
                name="company_location"
                value={formData.company_location}
                onChange={handleChange}
                placeholder="Company location"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              <input
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="Contact phone"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-blue-600"
              />

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              {statusMessage ? (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                  {statusMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isSubmitting ? "Saving..." : "Save and continue"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}