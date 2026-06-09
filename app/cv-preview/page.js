import { Suspense } from "react";

import CvPreviewClient from "@/components/candidate/CvPreviewClient";

export const metadata = {
  title: "CV Preview | AccDoo",
};

function CvPreviewLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FBFB] px-5 font-sans">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl shadow-slate-200/60">
        <p className="text-sm font-normal text-[#585958]">
          Loading CV preview...
        </p>
      </div>
    </main>
  );
}

export default function CvPreviewPage() {
  return (
    <Suspense fallback={<CvPreviewLoading />}>
      <CvPreviewClient />
    </Suspense>
  );
}