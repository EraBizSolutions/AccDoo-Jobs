"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AuthEmailField from "@/components/auth/AuthEmailField";
import AuthPasswordField from "@/components/auth/AuthPasswordField";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import {
  activateCandidate,
  getMyCandidateProfile,
  loginCandidate,
  loginWithGoogle,
} from "@/lib/api/authApi";
import { getMyRecruiterProfile } from "@/lib/api/recruiterApi";
import { startLinkedInAuth } from "@/lib/utils/linkedinOAuth";
import {
  getEmailValidationError,
  sanitizeEmail,
} from "@/lib/utils/authValidationRules";
import {
  getSelectedLoginMode,
  setSelectedLoginMode,
} from "@/lib/utils/tokenStorage";

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

export default function LoginCard() {
  const router = useRouter();

  const [selectedMode, setSelectedMode] = useState("candidate");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCandidateSelected = selectedMode === "candidate";
  const isRecruiterSelected = selectedMode === "recruiter";

  const validationErrors = useMemo(() => {
    return {
      email: getEmailValidationError(formData.email),
      password: formData.password ? "" : "Password is required.",
    };
  }, [formData]);

  const visibleErrors = {
    email: touched.email || submitAttempted ? validationErrors.email : "",
    password:
      touched.password || submitAttempted ? validationErrors.password : "",
  };

  useEffect(() => {
    const savedMode = getSelectedLoginMode();
    setSelectedMode(savedMode);
  }, []);

  function changeMode(mode) {
    setSelectedMode(mode);
    setSelectedLoginMode(mode);
    setErrorMessage("");
    setStatusMessage("");
  }

  function markTouched(fieldName) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [fieldName]: true,
    }));
  }

  function handleEmailChange(value) {
    setFormData((currentData) => ({
      ...currentData,
      email: sanitizeEmail(value),
    }));

    setErrorMessage("");
    markTouched("email");
  }

  function handlePasswordChange(event) {
    setFormData((currentData) => ({
      ...currentData,
      password: event.target.value,
    }));

    setErrorMessage("");
    markTouched("password");
  }

  function getFormValidationMessage() {
    if (validationErrors.email) return validationErrors.email;
    if (validationErrors.password) return validationErrors.password;

    return "";
  }

  async function redirectAfterLogin(mode) {
    setSelectedLoginMode(mode);

    if (mode === "recruiter") {
      try {
        await getMyRecruiterProfile();
        router.push("/recruiter/dashboard");
      } catch {
        router.push("/recruiter/profile");
      }

      return;
    }

    try {
      const profile = await getMyCandidateProfile();

      if (profile?.cv_url) {
        router.push("/");
        return;
      }
    } catch {
      try {
        await activateCandidate();
      } catch {
        // Candidate setup pages handle this state.
      }
    }

    router.push("/candidate/upload-cv");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setErrorMessage("");
    setStatusMessage("");

    const validationMessage = getFormValidationMessage();

    if (validationMessage) {
      setTouched({
        email: true,
        password: true,
      });

      setErrorMessage(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);

      await loginCandidate({
        email: formData.email,
        password: formData.password,
      });

      setStatusMessage("Login successful. Redirecting...");
      await redirectAfterLogin(selectedMode);
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
      await redirectAfterLogin(selectedMode);
    } catch (error) {
      setErrorMessage(error.message || "Google login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLinkedInLogin() {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setSelectedLoginMode(selectedMode);
      startLinkedInAuth();
    } catch (error) {
      setErrorMessage(error.message || "LinkedIn login failed to start.");
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 py-10 font-sans">
      <div className="w-full max-w-[430px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
        <div className="h-1 bg-[#F7631E]" />

        <div className="px-6 py-6 text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#F7631E] text-white shadow-sm">
            <BriefcaseIcon />
          </div>

          <h1 className="mt-4 text-[27px] font-medium tracking-tight text-[#202020]">
            Welcome back
          </h1>

          <p className="mt-2 text-[13px] font-normal leading-5 text-[#585958]">
            Choose your AccDoo space before signing in.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => changeMode("candidate")}
              disabled={isSubmitting}
              className={`rounded-2xl border px-3 py-4 text-center transition disabled:cursor-not-allowed disabled:opacity-70 ${
                isCandidateSelected
                  ? "border-[#F7631E] bg-orange-50 text-[#F7631E]"
                  : "border-slate-200 bg-white text-[#202020] hover:border-[#F7631E]"
              }`}
            >
              <div
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${
                  isCandidateSelected
                    ? "bg-[#F7631E] text-white"
                    : "bg-slate-100"
                }`}
              >
                <UserIcon />
              </div>
              <p className="mt-2 text-sm font-medium">Job Seeker</p>
              <p className="mt-1 text-[11px] font-normal text-slate-400">
                Profile, CV, jobs
              </p>
            </button>

            <button
              type="button"
              onClick={() => changeMode("recruiter")}
              disabled={isSubmitting}
              className={`rounded-2xl border px-3 py-4 text-center transition disabled:cursor-not-allowed disabled:opacity-70 ${
                isRecruiterSelected
                  ? "border-[#F7631E] bg-orange-50 text-[#F7631E]"
                  : "border-slate-200 bg-white text-[#202020] hover:border-[#F7631E]"
              }`}
            >
              <div
                className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${
                  isRecruiterSelected
                    ? "bg-[#F7631E] text-white"
                    : "bg-slate-100"
                }`}
              >
                <BriefcaseIcon />
              </div>
              <p className="mt-2 text-sm font-medium">Recruiter</p>
              <p className="mt-1 text-[11px] font-normal text-slate-400">
                Company, jobs, hiring
              </p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3 text-left">
            <AuthEmailField
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={() => markTouched("email")}
              error={visibleErrors.email}
            />

            <AuthPasswordField
              label="Password"
              value={formData.password}
              onChange={handlePasswordChange}
              onBlur={() => markTouched("password")}
              error={visibleErrors.password}
              placeholder="Enter your password"
            />

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
              {isSubmitting ? "Logging in..." : "Login with Email"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[9px] font-normal uppercase tracking-[0.18em] text-slate-300">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GoogleAuthButton
              buttonText="signin_with"
              disabled={isSubmitting}
              onGoogleSuccess={handleGoogleLogin}
              onGoogleError={(message) =>
                setErrorMessage(message || "Google login failed. Please try again.")
              }
            />

            <button
              type="button"
              onClick={handleLinkedInLogin}
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-normal text-[#202020] shadow-sm transition hover:border-[#F7631E] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LinkedInIcon />
              LinkedIn
            </button>
          </div>

          <div className="my-4 h-px bg-slate-200" />

          <p className="text-[12px] font-normal leading-5 text-[#585958]">
            {isRecruiterSelected
              ? "Recruiters continue to company setup or dashboard."
              : "Job seekers continue to CV upload and job discovery."}
          </p>

          <p className="mt-3 text-[12px] font-normal text-[#585958]">
            New to AccDoo?{" "}
            <Link href="/register" className="font-medium text-[#F7631E]">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}