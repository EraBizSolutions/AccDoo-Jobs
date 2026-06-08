"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiExternalLink,
  FiFileText,
  FiLoader,
} from "react-icons/fi";

import { getAccessToken } from "@/lib/utils/tokenStorage";

function decodeParamValue(value) {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function CvPreviewClient() {
  const searchParams = useSearchParams();

  const rawFileParam = searchParams.get("file");
  const rawUrlParam = searchParams.get("url");
  const rawTitleParam = searchParams.get("title");
  const versionParam = searchParams.get("v");

  const title = rawTitleParam || "Candidate CV";

  const protectedCvUrl = useMemo(() => {
    return decodeParamValue(rawFileParam || rawUrlParam || "");
  }, [rawFileParam, rawUrlParam]);

  const [blobUrl, setBlobUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let currentBlobUrl = "";

    async function loadProtectedCv() {
      setIsLoading(true);
      setErrorMessage("");
      setBlobUrl("");

      if (!protectedCvUrl) {
        setErrorMessage("The CV link is missing or expired.");
        setIsLoading(false);
        return;
      }

      const accessToken = getAccessToken();

      if (!accessToken) {
        setErrorMessage("Please login again to view this CV.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(protectedCvUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          let detail = "Could not load CV preview.";

          try {
            const errorData = await response.json();
            detail = errorData?.detail || detail;
          } catch {
            detail = response.statusText || detail;
          }

          throw new Error(detail);
        }

        const cvBlob = await response.blob();

        if (!cvBlob.type.includes("pdf") && cvBlob.type !== "application/pdf") {
          throw new Error("The selected file is not a valid PDF preview.");
        }

        currentBlobUrl = URL.createObjectURL(cvBlob);
        setBlobUrl(currentBlobUrl);
      } catch (error) {
        setErrorMessage(error.message || "Could not load CV preview.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProtectedCv();

    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [protectedCvUrl, versionParam]);

  function handleClose() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.close();
  }

  function handleOpenPdf() {
    if (!blobUrl) return;

    window.open(blobUrl, "_blank", "noopener,noreferrer");
  }

  if (!protectedCvUrl || errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 font-sans">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
            <FiAlertCircle size={24} />
          </div>

          <h1 className="mt-5 text-xl font-medium text-[#202020]">
            CV preview unavailable
          </h1>

          <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
            {errorMessage || "The CV link is missing or expired. Please go back and try again."}
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#e85512]"
          >
            <FiArrowLeft />
            Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FBFB] font-sans">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <div className="min-w-0">
            <p className="text-xs font-normal uppercase tracking-[0.22em] text-[#F7631E]">
              Secure CV Preview
            </p>

            <h1 className="mt-1 truncate text-xl font-medium text-[#202020]">
              {title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
            >
              <FiArrowLeft />
              Close
            </button>

            <button
              type="button"
              onClick={handleOpenPdf}
              disabled={!blobUrl || isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              Open
              <FiExternalLink />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6">
        {isLoading ? (
          <div className="flex h-[calc(100vh-150px)] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="text-center">
              <FiLoader className="mx-auto animate-spin text-[#F7631E]" size={28} />
              <p className="mt-3 text-sm font-normal text-[#585958]">
                Loading secure CV preview...
              </p>
            </div>
          </div>
        ) : blobUrl ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <iframe
              src={blobUrl}
              title={title}
              className="h-[calc(100vh-150px)] w-full"
            />
          </div>
        ) : (
          <div className="flex h-[calc(100vh-150px)] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="text-center">
              <FiFileText className="mx-auto text-slate-400" size={30} />
              <p className="mt-3 text-sm font-normal text-[#585958]">
                No CV preview available.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}