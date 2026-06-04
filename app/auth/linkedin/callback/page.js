"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loginWithLinkedIn } from "@/lib/api/authApi";
import {
  getLinkedInFriendlyError,
  validateLinkedInState,
} from "@/lib/utils/linkedinOAuth";
import { getSelectedLoginMode } from "@/lib/utils/tokenStorage";

function LinkedInCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Completing LinkedIn login...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function completeLinkedInLogin() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setErrorMessage(
          errorDescription ||
            "LinkedIn login was cancelled or failed. Please try again."
        );
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

        const selectedMode = getSelectedLoginMode();

        setMessage("LinkedIn login successful. Redirecting...");

        setTimeout(() => {
          if (selectedMode === "recruiter") {
            router.push("/recruiter/profile");
            return;
          }

          router.push("/candidate/upload-cv");
        }, 700);
      } catch (error) {
        setErrorMessage(
          error.message || "LinkedIn login failed. Please try again."
        );
        setMessage("");
      }
    }

    completeLinkedInLogin();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 font-sans">
      <div className="w-full max-w-107.5 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-200/70">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#F7631E] text-white shadow-lg shadow-orange-200">
          in
        </div>

        <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
          LinkedIn Authentication
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#202020]">
          Completing sign in
        </h1>

        {message ? (
          <p className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
            {message}
          </p>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm font-normal text-red-600">{errorMessage}</p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 rounded-xl bg-[#F7631E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#e85512]"
            >
              Back to Login
            </button>
          </div>
        ) : null}

        {!errorMessage ? (
          <p className="mt-4 text-xs font-normal text-slate-400">
            Please wait while AccDoo verifies your LinkedIn account.
          </p>
        ) : null}
      </div>
    </main>
  );
}

function LinkedInCallbackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 font-sans">
      <div className="w-full max-w-107.5 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-200/70">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#F7631E] text-white">
          in
        </div>

        <h1 className="text-3xl font-medium tracking-tight text-[#202020]">
          Preparing LinkedIn login...
        </h1>

        <p className="mt-4 text-sm font-normal text-slate-400">
          Please wait while we prepare the secure login callback.
        </p>
      </div>
    </main>
  );
}

export default function LinkedInCallbackPage() {
  return (
    <Suspense fallback={<LinkedInCallbackFallback />}>
      <LinkedInCallbackContent />
    </Suspense>
  );
}