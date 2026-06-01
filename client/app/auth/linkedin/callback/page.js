"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  activateCandidate,
  getMyCandidateProfile,
  loginWithLinkedIn,
} from "@/lib/api/authApi";
import { getMyRecruiterProfile } from "@/lib/api/recruiterApi";
import { validateLinkedInState } from "@/lib/utils/linkedinOAuth";
import { getSelectedLoginMode } from "@/lib/utils/tokenStorage";

export default function LinkedInCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Completing LinkedIn login...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function redirectAfterLinkedInLogin() {
      const selectedMode = getSelectedLoginMode();

      if (selectedMode === "recruiter") {
        try {
          await getMyRecruiterProfile();
          router.push("/recruiter/dashboard");
        } catch {
          router.push("/recruiter/profile");
        }

        return;
      }

      try {
        await getMyCandidateProfile();
      } catch {
        try {
          await activateCandidate();
        } catch {
          // Candidate page can show the next error if something is missing.
        }
      }

      router.push("/candidate/upload-cv");
    }

    async function completeLinkedInLogin() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setErrorMessage("LinkedIn login was cancelled or failed.");
        setMessage("");
        return;
      }

      if (!code) {
        setErrorMessage("LinkedIn did not return an authorization code.");
        setMessage("");
        return;
      }

      try {
        validateLinkedInState(state);

        await loginWithLinkedIn(code);

        setMessage("LinkedIn login successful. Redirecting...");
        await redirectAfterLinkedInLogin();
      } catch (error) {
        setErrorMessage(error.message || "LinkedIn login failed. Please try again.");
        setMessage("");
      }
    }

    completeLinkedInLogin();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-7 text-center shadow-2xl shadow-blue-950/10">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/25">
          in
        </div>

        <h1 className="text-2xl font-extrabold text-slate-950">
          LinkedIn Authentication
        </h1>

        {message ? (
          <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
            {message}
          </p>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-bold text-red-600">{errorMessage}</p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Back to Login
            </button>
          </div>
        ) : null}

        {!errorMessage ? (
          <p className="mt-4 text-xs font-medium text-slate-400">
            Please wait while JobsEra verifies your LinkedIn account.
          </p>
        ) : null}
      </div>
    </main>
  );
}