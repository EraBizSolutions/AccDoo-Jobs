"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { loginCandidate, loginWithGoogle } from "@/lib/api/authApi";

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
        d="M4.5 8.5h15A1.5 1.5 0 0 1 21 10v8.5A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5V10a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 13h6"
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

export default function LoginCard() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function redirectCandidate() {
    router.push("/candidate/upload-cv");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setStatusMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      await loginCandidate({
        email: formData.email,
        password: formData.password,
      });

      setStatusMessage("Login successful. Redirecting...");
      redirectCandidate();
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin(idToken) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setIsSubmitting(true);

      await loginWithGoogle(idToken);

      setStatusMessage("Google login successful. Redirecting...");
      redirectCandidate();
    } catch (error) {
      setErrorMessage(error.message || "Google login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleError(message) {
    setErrorMessage(message || "Google login failed. Please try again.");
  }

  function handleLinkedInLogin() {
    setErrorMessage(
      "LinkedIn login needs a backend LinkedIn OAuth endpoint. It will be connected after the LinkedIn app credentials are ready."
    );
  }

  return (
    <section className="flex h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-5 pt-16">
      <div className="w-full max-w-95 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-blue-950/10">
        <div className="h-1 bg-linear-to-r from-blue-800 via-blue-600 to-sky-400" />

        <div className="px-6 py-4 text-center">
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/25">
            <BriefcaseIcon />
          </div>

          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-slate-950">
            Welcome back
          </h1>

          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            Sign in to continue your JobsEra journey.
          </p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-left">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600"
            />

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600"
            />

            {errorMessage ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-[12px] font-semibold text-red-600">
                {errorMessage}
              </p>
            ) : null}

            {statusMessage ? (
              <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center text-[12px] font-semibold text-green-700">
                {statusMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-700 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              <MailIcon />
              {isSubmitting ? "Logging in..." : "Login with Email"}
            </button>
          </form>

          <div className="my-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoogleAuthButton
              buttonText="signin_with"
              disabled={isSubmitting}
              onGoogleSuccess={handleGoogleLogin}
              onGoogleError={handleGoogleError}
            />

            <button
              type="button"
              onClick={handleLinkedInLogin}
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LinkedInIcon />
              LinkedIn
            </button>
          </div>

          <div className="my-3 h-px bg-slate-200" />

          <p className="text-[12px] leading-5 text-slate-500">
            Secure access for job seekers and recruiters.
            <br />
            Manage your AI profile and applications.
          </p>

          <p className="mt-2 text-[12px] font-semibold text-slate-600">
            New to JobsEra?{" "}
            <Link href="/register" className="font-bold text-blue-700">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}