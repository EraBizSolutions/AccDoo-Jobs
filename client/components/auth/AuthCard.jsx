"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import {
  activateCandidate,
  loginCandidate,
  loginWithGoogle,
  registerCandidate,
} from "@/lib/api/authApi";
import { startLinkedInAuth } from "@/lib/utils/linkedinOAuth";
import { setSelectedLoginMode } from "@/lib/utils/tokenStorage";

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M9 7V6a3 3 0 0 1 6 0v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.5 8h15A1.5 1.5 0 0 1 21 9.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5A1.5 1.5 0 0 1 4.5 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 13v2h4v-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m4.5 7 7.5 6 7.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#0A66C2">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.32 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V9H7.1v11.45z" />
    </svg>
  );
}

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthCard() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("candidate");
  const [formData, setFormData] = useState(initialFormData);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCandidateSelected = selectedRole === "candidate";
  const isRecruiterSelected = selectedRole === "recruiter";

  function handleRoleChange(role) {
    setSelectedRole(role);
    setSelectedLoginMode(role);
    setErrorMessage("");
    setStatusMessage("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Please fill in all required fields.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Password and confirm password do not match.";
    }

    return "";
  }

  async function redirectAfterRegister(role) {
    setSelectedLoginMode(role);

    if (role === "recruiter") {
      router.push("/recruiter/profile");
      return;
    }

    try {
      await activateCandidate();
    } catch {
      // Candidate profile normally exists after register.
    }

    router.push("/candidate/upload-cv");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setStatusMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setSelectedLoginMode(selectedRole);

      await registerCandidate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      await loginCandidate({
        email: formData.email,
        password: formData.password,
      });

      setStatusMessage(
        isRecruiterSelected
          ? "Account created. Opening company setup..."
          : "Account created. Opening job seeker workspace..."
      );

      setFormData(initialFormData);

      setTimeout(() => {
        redirectAfterRegister(selectedRole);
      }, 500);
    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignup(idToken) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsSubmitting(true);
      setSelectedLoginMode(selectedRole);

      await loginWithGoogle(idToken);

      setStatusMessage(
        isRecruiterSelected
          ? "Google signup successful. Opening company setup..."
          : "Google signup successful. Opening workspace..."
      );

      setTimeout(() => {
        if (selectedRole === "recruiter") {
          router.push("/recruiter/profile");
          return;
        }

        router.push("/candidate/upload-cv");
      }, 500);
    } catch (error) {
      setErrorMessage(error.message || "Google signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLinkedInSignup() {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setSelectedLoginMode(selectedRole);
      startLinkedInAuth();
    } catch (error) {
      setErrorMessage(error.message || "LinkedIn signup failed to start.");
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 py-10 font-sans">
      <div className="w-full max-w-[450px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
        <div className="h-1 bg-[#F7631E]" />

        <div className="px-6 py-6 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#F7631E] text-white shadow-sm">
            <BriefcaseIcon />
          </div>

          <h1 className="mt-4 text-[28px] font-medium tracking-tight text-[#202020]">
            Join JobsEra
          </h1>

          <p className="mt-2 text-[13px] font-normal leading-5 text-[#585958]">
            Create one account and choose your workspace.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange("candidate")}
              className={`group rounded-2xl border px-3 py-4 transition ${
                isCandidateSelected
                  ? "border-[#F7631E] bg-orange-50"
                  : "border-slate-200 bg-white hover:border-[#F7631E]"
              }`}
            >
              <div
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${
                  isCandidateSelected
                    ? "bg-[#F7631E] text-white"
                    : "bg-slate-100 text-[#0C203A]"
                }`}
              >
                <UserIcon />
              </div>
              <p className="mt-2 text-sm font-medium text-[#202020]">
                Job Seeker
              </p>
              <p className="mt-1 text-[11px] font-normal text-slate-400">
                CV, profile, jobs
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange("recruiter")}
              className={`group rounded-2xl border px-3 py-4 transition ${
                isRecruiterSelected
                  ? "border-[#F7631E] bg-orange-50"
                  : "border-slate-200 bg-white hover:border-[#F7631E]"
              }`}
            >
              <div
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${
                  isRecruiterSelected
                    ? "bg-[#F7631E] text-white"
                    : "bg-slate-100 text-[#0C203A]"
                }`}
              >
                <BriefcaseIcon />
              </div>
              <p className="mt-2 text-sm font-medium text-[#202020]">
                Recruiter
              </p>
              <p className="mt-1 text-[11px] font-normal text-slate-400">
                Company, hiring
              </p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              autoComplete="email"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password e.g. Password@123"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <p className="text-[11px] font-normal leading-5 text-slate-400">
              Use 8+ characters with uppercase, lowercase, number, and symbol.
            </p>

            {errorMessage ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-[12px] font-normal text-red-600">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-center text-[12px] font-normal text-green-700">
                {statusMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#F7631E] py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              <MailIcon />
              {isSubmitting
                ? "Creating account..."
                : isRecruiterSelected
                ? "Create recruiter account"
                : "Create job seeker account"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-22x flex-1 bg-slate-200" />
            <span className="text-[9px] font-normal uppercase tracking-[0.18em] text-slate-300">
              Sign up with
            </span>
            <div className="h-22x flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoogleAuthButton
              buttonText="signup_with"
              disabled={isSubmitting}
              onGoogleSuccess={handleGoogleSignup}
              onGoogleError={(message) =>
                setErrorMessage(message || "Google signup failed. Please try again.")
              }
            />

            <button
              type="button"
              onClick={handleLinkedInSignup}
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-normal text-[#202020] shadow-sm transition hover:border-[#F7631E] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LinkedInIcon /> LinkedIn
            </button>
          </div>

          <div className="my-4 h-22x bg-slate-200" />

          <p className="text-[12px] font-normal leading-5 text-[#585958]">
            {isRecruiterSelected
              ? "Recruiters continue to company setup after account creation."
              : "Job seekers continue to CV upload and job discovery."}
          </p>

          <p className="mt-3 text-[12px] font-normal text-[#585958]">
            Already have an account?{" "}
            <Link
              href="/login"
              onClick={() => setSelectedLoginMode(selectedRole)}
              className="font-medium text-[#F7631E]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}