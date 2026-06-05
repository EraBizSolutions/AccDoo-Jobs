"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiBriefcase,
  FiCheck,
  FiDollarSign,
  FiFileText,
  FiLink,
  FiLoader,
  FiMapPin,
  FiSend,
  FiX,
} from "react-icons/fi";

import { submitCandidateApplication } from "@/lib/api/applicationsApi";

function getCompanyInitials(companyName = "AD") {
  return companyName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function formatSalary(job) {
  if (!job?.salary_min && !job?.salary_max) return "Salary not disclosed";

  if (job.salary_min && job.salary_max) {
    return `LKR ${Number(job.salary_min).toLocaleString()} - ${Number(
      job.salary_max
    ).toLocaleString()}/month`;
  }

  if (job.salary_min) {
    return `From LKR ${Number(job.salary_min).toLocaleString()}/month`;
  }

  return `Up to LKR ${Number(job.salary_max).toLocaleString()}/month`;
}

function formatValue(value, fallback = "Not added") {
  if (!value) return fallback;

  return String(value)
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join("-");
}

function DetailMeta({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-normal text-[#585958]">
      {icon}
      {children}
    </span>
  );
}

function ModalQuestionField({ question, value, onChange, error }) {
  const isRequired = Boolean(question.is_required);

  if (question.question_type === "textarea") {
    return (
      <div>
        <label className="text-sm font-normal leading-6 text-[#202020]">
          {question.question_text}
          {isRequired ? <span className="text-[#F7631E]"> *</span> : null}
        </label>

        <textarea
          value={value || ""}
          onChange={(event) => onChange(question.id, event.target.value)}
          rows={4}
          placeholder="Write your answer..."
          className={`mt-2 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        />

        {error ? (
          <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
        ) : null}
      </div>
    );
  }

  if (question.question_type === "yes_no") {
    const isYes = value === "Yes";

    return (
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-normal leading-6 text-[#202020]">
            {question.question_text}
            {isRequired ? <span className="text-[#F7631E]"> *</span> : null}
          </label>

          <button
            type="button"
            onClick={() => onChange(question.id, isYes ? "No" : "Yes")}
            className={`flex h-8 w-14 items-center rounded-full p-1 transition ${
              isYes ? "bg-[#F7631E]" : "bg-slate-300"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${
                isYes ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <p className="mt-2 text-xs font-normal text-[#585958]">
          Selected answer:{" "}
          <span className="font-medium text-[#202020]">
            {value || "Not selected"}
          </span>
        </p>

        {error ? (
          <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
        ) : null}
      </div>
    );
  }

  if (question.question_type === "url") {
    return (
      <div>
        <label className="text-sm font-normal leading-6 text-[#202020]">
          {question.question_text}
          {isRequired ? <span className="text-[#F7631E]"> *</span> : null}
        </label>

        <div className="relative mt-2">
          <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={value || ""}
            onChange={(event) => onChange(question.id, event.target.value)}
            placeholder="https://example.com"
            className={`w-full rounded-2xl border bg-white py-3 pl-11 pr-4 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
              error ? "border-red-300" : "border-slate-200"
            }`}
          />
        </div>

        {error ? (
          <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-normal leading-6 text-[#202020]">
        {question.question_text}
        {isRequired ? <span className="text-[#F7631E]"> *</span> : null}
      </label>

      <input
        value={value || ""}
        onChange={(event) => onChange(question.id, event.target.value)}
        placeholder="Write your answer..."
        className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      />

      {error ? (
        <p className="mt-2 text-xs font-normal text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

export default function ApplyJobModal({
  job,
  questions = [],
  candidateProfile,
  isOpen,
  onClose,
  onSubmitted,
}) {
  const [cvUrl, setCvUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [answers, setAnswers] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCvUrl(candidateProfile?.cv_url || "");
    setCoverNote("");
    setAnswers({});
    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
  }, [isOpen, candidateProfile]);

  if (!isOpen) return null;

  const companyName = job?.company_name || "AccDoo Company";
  const companyInitials = getCompanyInitials(companyName);

  function updateAnswer(questionId, value) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [questionId]: "",
    }));
  }

  function validateForm() {
    const errors = {};

    questions.forEach((question) => {
      const answerValue = answers[question.id];

      if (question.is_required && (!answerValue || !String(answerValue).trim())) {
        errors[question.id] = "This question is required.";
      }
    });

    if (cvUrl && !/^https?:\/\/.+/i.test(cvUrl.trim())) {
      errors.cv_url = "CV link must start with http:// or https://";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmitApplication() {
    setFormError("");
    setSuccessMessage("");

    if (!validateForm()) {
      setFormError("Please fix the highlighted fields before submitting.");
      return;
    }

    const formattedAnswers = Object.entries(answers)
      .map(([questionId, answerText]) => ({
        question_id: Number(questionId),
        answer_text: String(answerText || "").trim(),
      }))
      .filter((answer) => answer.answer_text);

    try {
      setIsSubmitting(true);

      const application = await submitCandidateApplication({
        job_id: Number(job.id),
        cv_url: cvUrl.trim() || candidateProfile?.cv_url || null,
        cover_note: coverNote.trim() || null,
        answers: formattedAnswers,
      });

      setSuccessMessage("Application submitted successfully.");
      onSubmitted?.(application);
    } catch (error) {
      setFormError(error.message || "Could not submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#202020]/50 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-lg font-medium text-[#202020]">
              Applying for this job
            </p>
            <p className="mt-1 text-xs font-normal text-[#585958]">
              Review your CV, answer the questions, and submit in one smooth flow.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#202020]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto px-6 py-6">
          <div className="rounded-3xl border border-slate-200 bg-[#F9FBFB] p-5">
            <div className="flex gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#202020] text-sm font-medium text-[#F7631E]">
                {companyInitials}
              </div>

              <div>
                <h2 className="text-xl font-medium text-[#202020]">
                  {job?.title || "Untitled role"}
                </h2>
                <p className="mt-1 text-base font-normal text-[#F7631E]">
                  {companyName}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <DetailMeta icon={<FiBriefcase size={15} />}>
                    {formatValue(job?.job_type, "Job type not added")}
                  </DetailMeta>
                  <DetailMeta icon={<FiMapPin size={15} />}>
                    {job?.location || "Location not added"}
                  </DetailMeta>
                  <DetailMeta icon={<FiDollarSign size={15} />}>
                    {formatSalary(job)}
                  </DetailMeta>
                </div>
              </div>
            </div>
          </div>

          {successMessage ? (
            <div className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-600 text-white">
                  <FiCheck />
                </div>

                <div>
                  <p className="font-medium text-green-800">{successMessage}</p>
                  <p className="mt-1 text-sm font-normal leading-6 text-green-700">
                    Your application is now visible to the recruiter. You can track
                    it from your candidate application history.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/candidate/applications"
                      className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white"
                    >
                      View my applications
                    </Link>

                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-normal text-green-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <section className="mt-6">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-[#F7631E]" />
                  <h3 className="text-base font-medium text-[#202020]">
                    CV for this application
                  </h3>
                </div>

                <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
                  Keep your current CV link or paste a new CV link for this job.
                </p>

                <input
                  value={cvUrl}
                  onChange={(event) => {
                    setCvUrl(event.target.value);
                    setFieldErrors((currentErrors) => ({
                      ...currentErrors,
                      cv_url: "",
                    }));
                  }}
                  placeholder="https://example.com/my-cv.pdf"
                  className={`mt-3 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
                    fieldErrors.cv_url ? "border-red-300" : "border-slate-200"
                  }`}
                />

                {fieldErrors.cv_url ? (
                  <p className="mt-2 text-xs font-normal text-red-500">
                    {fieldErrors.cv_url}
                  </p>
                ) : null}
              </section>

              <section className="mt-6">
                <label className="text-base font-medium text-[#202020]">
                  Cover note
                </label>

                <textarea
                  value={coverNote}
                  onChange={(event) => setCoverNote(event.target.value)}
                  rows={4}
                  placeholder="Write a short note to the recruiter..."
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50"
                />
              </section>

              <section className="mt-6">
                <h3 className="text-base font-medium text-[#202020]">
                  Recruiter questions
                </h3>

                <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
                  These questions were added by the recruiter for this job.
                </p>

                <div className="mt-4 space-y-5">
                  {questions.length ? (
                    questions.map((question) => (
                      <ModalQuestionField
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={updateAnswer}
                        error={fieldErrors[question.id]}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-[#F9FBFB] px-4 py-4 text-sm font-normal text-[#585958]">
                      No custom questions for this job. You can submit directly.
                    </div>
                  )}
                </div>
              </section>

              {formError ? (
                <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
                  {formError}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSend />}
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}