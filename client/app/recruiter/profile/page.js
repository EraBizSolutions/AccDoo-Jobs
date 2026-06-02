"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiBriefcase, FiSave } from "react-icons/fi";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E]";

const labelClass = "text-sm font-normal text-[#585958]";

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
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto max-w-[450px]xl px-5 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-200/70">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
                Recruiter setup
              </p>

              <h1 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
                Company information
              </h1>

              <p className="mt-3 max-w-36.2530xl text-sm font-normal leading-6 text-[#585958]">
                Add your company details before publishing jobs. This profile connects your jobs to your hiring workspace.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiBriefcase size={22} />
            </div>
          </div>

          {isLoading ? (
            <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
              Loading recruiter profile...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className={labelClass}>Company name</label>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Erabiz Private Limited"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label className={labelClass}>Company website</label>
                <input
                  name="company_website"
                  value={formData.company_website}
                  onChange={handleChange}
                  placeholder="https://erabiz.io"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label className={labelClass}>Company location</label>
                <input
                  name="company_location"
                  value={formData.company_location}
                  onChange={handleChange}
                  placeholder="Colombo, Sri Lanka"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label className={labelClass}>Contact phone</label>
                <input
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+94770000000"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              {statusMessage ? (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
                  {statusMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                <FiSave />
                {isSubmitting ? "Saving..." : "Save and continue"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}