"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loginWithLinkedIn } from "@/lib/api/authApi";
import {
  getLinkedInFriendlyError,
  validateLinkedInState,
} from "@/lib/utils/linkedinOAuth";
import { getSelectedLoginMode } from "@/lib/utils/tokenStorage";

export default function LinkedInCallbackPage() {
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
        setErrorMessage(getLinkedInFriendlyError(error, errorDescription));
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
        setErrorMessage(error.message || "LinkedIn login failed. Please try again.");
        setMessage("");
      }
    }

    completeLinkedInLogin();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-200/70">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#F7631E] text-white">
          in
        </div>

        <h1 className="text-2xl font-medium text-[#202020]">
          LinkedIn Authentication
        </h1>

        {message ? (
          <p className="mt-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
            {message}
          </p>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-normal leading-6 text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 rounded-lg bg-[#F7631E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#e85512]"
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