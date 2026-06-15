"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiFileText,
  FiLoader,
  FiSend,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import Footer from "@/components/common/Footer";
import Navbar from "@/components/common/Navbar";
import {
  activateCandidateProfile,
  getMyCandidateProfile,
  uploadCandidateCv,
} from "@/lib/api/candidateApi";
import { getAccessToken } from "@/lib/utils/tokenStorage";

function formatFileSize(size) {
  if (!size) return "0 KB";

  const sizeInMb = size / (1024 * 1024);

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(2)} MB`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

function CheckingScreen() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-5 py-8">
        <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/60">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
            <FiLoader className="animate-spin" size={30} />
          </div>

          <p className="mt-5 text-base font-medium text-[#202020]">
            Checking your CV status...
          </p>
          <p className="mt-2 text-sm font-normal text-[#585958]">
            We’ll send you to the right page in a moment.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function CandidateCvUploadView() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [canShowUploadForm, setCanShowUploadForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function checkCandidateCvStatus() {
      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }

      setErrorMessage("");

      try {
        setIsCheckingProfile(true);
        setCanShowUploadForm(false);

        let profile;

        try {
          profile = await getMyCandidateProfile();
        } catch {
          profile = await activateCandidateProfile();
        }

        if (!isMounted) return;

        if (profile?.cv_url) {
          router.replace("/");
          return;
        }

        setCanShowUploadForm(true);
      } catch (error) {
        if (!isMounted) return;

        setCanShowUploadForm(true);
        setErrorMessage(error.message || "Could not check your CV status.");
      } finally {
        if (isMounted) {
          setIsCheckingProfile(false);
        }
      }
    }

    checkCandidateCvStatus();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setErrorMessage("");
    setStatusMessage("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setErrorMessage("Only PDF CV files are supported right now.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setErrorMessage("CV file must be below 5MB.");
      return;
    }

    setSelectedFile(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleUploadCv() {
    setErrorMessage("");
    setStatusMessage("");

    if (!selectedFile) {
      setErrorMessage("Please select a PDF CV file first.");
      return;
    }

    try {
      setIsUploading(true);

      await uploadCandidateCv(selectedFile);

      setSelectedFile(null);
      setStatusMessage("CV uploaded successfully. Opening your profile draft...");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        router.replace("/candidate/profile");
      }, 600);
    } catch (error) {
      setErrorMessage(error.message || "Could not upload CV.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isCheckingProfile || !canShowUploadForm) {
    return <CheckingScreen />;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F9FBFB] font-sans">
      <Navbar />

      <section className="mx-auto w-full max-w-3xl px-5 py-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
          >
            <FiArrowLeft />
            Back
          </button>

          <button
            type="button"
            onClick={() => router.replace("/")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
          >
            Skip
          </button>
        </div>

        <div className="mt-8 rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/60 md:p-8">
          <div className="text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
              <LuSparkles size={14} />
              Candidate CV setup
            </div>

            <div className="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-2xl bg-orange-50 text-[#F7631E] shadow-sm">
              <FiFileText size={28} />
            </div>

            <h1 className="mt-5 text-[30px] font-medium tracking-tight text-[#202020] md:text-[38px]">
              Upload your CV
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm font-normal leading-6 text-[#585958]">
              Upload a PDF CV. AccDoo will create a CV link, read basic skills,
              then open your profile draft for editing.
            </p>
          </div>

          {errorMessage ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
              {errorMessage}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
              <FiCheckCircle className="mr-2 inline" />
              {statusMessage}
            </p>
          ) : null}

          <div className="mt-7 rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 p-5 text-center md:p-7">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#F7631E] shadow-sm">
              <FiUploadCloud size={26} />
            </div>

            <p className="mt-4 text-base font-medium text-[#202020]">
              Select PDF CV
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm font-normal leading-6 text-[#585958]">
              Maximum 5MB. PDF only for this MVP.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="mx-auto mt-5 w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#585958] file:mr-4 file:rounded-xl file:border-0 file:bg-[#F7631E] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            {selectedFile ? (
              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#202020]">
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-xs font-normal text-[#585958]">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-50 text-red-600"
                  >
                    <FiX size={15} />
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleUploadCv}
                disabled={isUploading || !selectedFile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {isUploading ? <FiLoader className="animate-spin" /> : <FiSend />}
                {isUploading ? "Uploading..." : "Upload CV"}
              </button>

              <button
                type="button"
                onClick={() => router.replace("/")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
