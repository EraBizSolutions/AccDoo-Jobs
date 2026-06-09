"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiBriefcase,
  FiCheck,
  FiFileText,
  FiLoader,
  FiMapPin,
  FiSend,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import SecureCvButton from "@/components/common/SecureCvButton";
import { submitCandidateApplication } from "@/lib/api/applicationsApi";
import { uploadCandidateCv } from "@/lib/api/candidateApi";

const MAX_CV_SIZE_MB = 5;
const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

const COVER_NOTE_MIN_LENGTH = 20;
const COVER_NOTE_MAX_LENGTH = 1000;

const TEXT_ANSWER_MIN_LENGTH = 2;
const TEXT_ANSWER_MAX_LENGTH = 300;

const LONG_ANSWER_MIN_LENGTH = 10;
const LONG_ANSWER_MAX_LENGTH = 1500;

const SAFE_TEXT_PATTERN = /^[A-Za-z0-9 .,]*$/;
const SAFE_TEXT_INPUT_PATTERN = /^[A-Za-z0-9 .,]+$/;

const URL_PATTERN = /^[A-Za-z0-9.:/?#&=_+-]*$/;
const URL_FULL_PATTERN = /^(https?:\/\/)?([A-Za-z0-9-]+\.)+[A-Za-z]{2,}(\/.*)?$/;

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function sanitizeSafeText(value, maxLength) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 .,]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function sanitizeUrl(value, maxLength = TEXT_ANSWER_MAX_LENGTH) {
  return String(value || "")
    .replace(/\s/g, "")
    .replace(/[^A-Za-z0-9.:/?#&=_+-]/g, "")
    .slice(0, maxLength);
}

function blockUnsafeTextInput(event) {
  const inputValue = event.data;

  if (!inputValue) return;

  if (!SAFE_TEXT_INPUT_PATTERN.test(inputValue)) {
    event.preventDefault();
  }
}

function blockUnsafeUrlInput(event) {
  const inputValue = event.data;

  if (!inputValue) return;

  if (!URL_PATTERN.test(inputValue)) {
    event.preventDefault();
  }
}

function handleSafeTextPaste(event, onChange, maxLength) {
  event.preventDefault();

  const pastedText = event.clipboardData.getData("text");
  const cleanedText = sanitizeSafeText(pastedText, maxLength);

  onChange(cleanedText);
}

function handleUrlPaste(event, onChange, maxLength = TEXT_ANSWER_MAX_LENGTH) {
  event.preventDefault();

  const pastedText = event.clipboardData.getData("text");
  const cleanedText = sanitizeUrl(pastedText, maxLength);

  onChange(cleanedText);
}

function isValidSafeText(value, minLength, maxLength) {
  const text = cleanText(value);

  if (text.length < minLength) return false;
  if (text.length > maxLength) return false;

  return SAFE_TEXT_PATTERN.test(text);
}

function isValidUrl(value) {
  const text = cleanText(value);

  if (!text) return false;
  if (text.length > TEXT_ANSWER_MAX_LENGTH) return false;

  return URL_FULL_PATTERN.test(text);
}

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) return "Unknown size";

  const sizeInMb = sizeInBytes / (1024 * 1024);

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(2)} MB`;
  }

  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
}

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

function SalaryMeta({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-normal text-[#585958]">
      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-[#F7631E]">
        LKR
      </span>
      {children}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function getAnswerLimit(questionType) {
  if (questionType === "textarea") {
    return LONG_ANSWER_MAX_LENGTH;
  }

  return TEXT_ANSWER_MAX_LENGTH;
}

function getQuestionMinLength(questionType) {
  if (questionType === "textarea") {
    return LONG_ANSWER_MIN_LENGTH;
  }

  return TEXT_ANSWER_MIN_LENGTH;
}

function validateAnswer(question, value) {
  const answer = cleanText(value);
  const isRequired = Boolean(question.is_required);

  if (!answer) {
    return isRequired ? "This question is required." : "";
  }

  if (question.question_type === "yes_no") {
    if (!["Yes", "No"].includes(answer)) {
      return "Please select Yes or No.";
    }

    return "";
  }

  if (question.question_type === "url") {
    if (!isValidUrl(answer)) {
      return "Enter a valid URL. Example: https://example.com";
    }

    return "";
  }

  const minLength = getQuestionMinLength(question.question_type);
  const maxLength = getAnswerLimit(question.question_type);

  if (!isValidSafeText(answer, minLength, maxLength)) {
    return `Answer must be ${minLength}-${maxLength} characters. Use only letters, numbers, spaces, comma, and dot.`;
  }

  return "";
}

function ModalQuestionField({ question, value, onChange, error }) {
  const isRequired = Boolean(question.is_required);
  const maxLength = getAnswerLimit(question.question_type);
  const answerLength = String(value || "").length;

  function updateTextValue(nextValue) {
    onChange(question.id, sanitizeSafeText(nextValue, maxLength));
  }

  function updateUrlValue(nextValue) {
    onChange(question.id, sanitizeUrl(nextValue, maxLength));
  }

  if (question.question_type === "textarea") {
    return (
      <div>
        <label className="text-sm font-normal leading-6 text-[#202020]">
          {question.question_text}
          {isRequired ? <span className="text-[#F7631E]"> *</span> : null}
        </label>

        <textarea
          value={value || ""}
          onBeforeInput={blockUnsafeTextInput}
          onPaste={(event) =>
            handleSafeTextPaste(event, updateTextValue, LONG_ANSWER_MAX_LENGTH)
          }
          onChange={(event) => updateTextValue(event.target.value)}
          rows={4}
          maxLength={LONG_ANSWER_MAX_LENGTH}
          placeholder="Write your answer..."
          className={`mt-2 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        />

        <p className="mt-2 text-xs font-normal text-slate-400">
          Only letters, numbers, spaces, comma, and dot. {answerLength}/
          {LONG_ANSWER_MAX_LENGTH}
        </p>

        <FieldError message={error} />
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

        <FieldError message={error} />
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

        <input
          value={value || ""}
          onBeforeInput={blockUnsafeUrlInput}
          onPaste={(event) =>
            handleUrlPaste(event, updateUrlValue, TEXT_ANSWER_MAX_LENGTH)
          }
          onChange={(event) => updateUrlValue(event.target.value)}
          maxLength={TEXT_ANSWER_MAX_LENGTH}
          placeholder="https://example.com"
          className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            error ? "border-red-300" : "border-slate-200"
          }`}
        />

        <p className="mt-2 text-xs font-normal text-slate-400">
          URL only. Example: https://example.com
        </p>

        <FieldError message={error} />
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
        onBeforeInput={blockUnsafeTextInput}
        onPaste={(event) =>
          handleSafeTextPaste(event, updateTextValue, TEXT_ANSWER_MAX_LENGTH)
        }
        onChange={(event) => updateTextValue(event.target.value)}
        maxLength={TEXT_ANSWER_MAX_LENGTH}
        placeholder="Write your answer..."
        className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      />

      <p className="mt-2 text-xs font-normal text-slate-400">
        Only letters, numbers, spaces, comma, and dot. {answerLength}/
        {TEXT_ANSWER_MAX_LENGTH}
      </p>

      <FieldError message={error} />
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
  const cvInputRef = useRef(null);

  const [cvUrl, setCvUrl] = useState("");
  const [cvVersion, setCvVersion] = useState("");
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [answers, setAnswers] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCvUrl(candidateProfile?.cv_url || "");
    setCvVersion(String(Date.now()));
    setSelectedCvFile(null);
    setCoverNote("");
    setAnswers({});
    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");

    if (cvInputRef.current) {
      cvInputRef.current.value = "";
    }
  }, [isOpen, candidateProfile]);

  if (!isOpen) return null;

  const companyName = job?.company_name || "AccDoo Company";
  const companyInitials = getCompanyInitials(companyName);
  const hasViewableCv = Boolean(cvUrl);

  function updateAnswer(questionId, value) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [questionId]: "",
    }));

    setFormError("");
  }

  function updateCoverNote(nextValue) {
    setCoverNote(sanitizeSafeText(nextValue, COVER_NOTE_MAX_LENGTH));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      cover_note: "",
    }));

    setFormError("");
  }

  function handleCvFileChange(event) {
    const file = event.target.files?.[0];

    setFormError("");
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      cv_url: "",
    }));

    if (!file) {
      setSelectedCvFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedCvFile(null);
      setFormError("Only PDF CV files are supported.");
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      setSelectedCvFile(null);
      setFormError(`CV file must be below ${MAX_CV_SIZE_MB}MB.`);
      return;
    }

    setSelectedCvFile(file);
  }

  async function uploadAnotherCv() {
    setFormError("");

    if (!selectedCvFile) {
      setFormError("Please choose a PDF CV first.");
      return null;
    }

    try {
      setIsUploadingCv(true);

      const result = await uploadCandidateCv(selectedCvFile);

      const nextCvUrl =
        result?.candidate_profile?.cv_url || result?.cv_url || "";

      if (!nextCvUrl) {
        setFormError("CV uploaded, but the file URL was not returned.");
        return null;
      }

      setCvUrl(nextCvUrl);
      setCvVersion(String(Date.now()));
      setSelectedCvFile(null);

      if (cvInputRef.current) {
        cvInputRef.current.value = "";
      }

      return nextCvUrl;
    } catch (error) {
      setFormError(error.message || "Could not upload CV.");
      return null;
    } finally {
      setIsUploadingCv(false);
    }
  }

  function validateForm(finalCvUrl) {
    const errors = {};

    if (!finalCvUrl || !String(finalCvUrl).trim()) {
      errors.cv_url = "Please upload a CV before applying.";
    }

    const cleanCoverNote = cleanText(coverNote);

    if (cleanCoverNote) {
      if (
        !isValidSafeText(
          cleanCoverNote,
          COVER_NOTE_MIN_LENGTH,
          COVER_NOTE_MAX_LENGTH
        )
      ) {
        errors.cover_note = `Cover note must be ${COVER_NOTE_MIN_LENGTH}-${COVER_NOTE_MAX_LENGTH} characters. Use only letters, numbers, spaces, comma, and dot.`;
      }
    }

    questions.forEach((question) => {
      const error = validateAnswer(question, answers[question.id]);

      if (error) {
        errors[question.id] = error;
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmitApplication() {
    setFormError("");
    setSuccessMessage("");

    let finalCvUrl = cvUrl;

    if (selectedCvFile) {
      finalCvUrl = await uploadAnotherCv();

      if (!finalCvUrl) return;
    }

    if (!validateForm(finalCvUrl)) {
      setFormError("Please fix the highlighted fields before submitting.");
      return;
    }

    const formattedAnswers = Object.entries(answers)
      .map(([questionId, answerText]) => ({
        question_id: Number(questionId),
        answer_text: cleanText(answerText),
      }))
      .filter((answer) => answer.answer_text);

    try {
      setIsSubmitting(true);

      const application = await submitCandidateApplication({
        job_id: Number(job.id),
        cv_url: finalCvUrl,
        cover_note: cleanText(coverNote) || null,
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
          <div className="min-w-0">
            <p className="text-lg font-medium text-[#202020]">
              Applying for this job
            </p>
            <p className="mt-1 text-xs font-normal text-[#585958]">
              Review your CV, answer the questions, and submit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-[#202020]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto overflow-x-hidden px-6 py-6">
          <div className="rounded-3xl border border-slate-200 bg-[#F9FBFB] p-5">
            <div className="flex gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#202020] text-sm font-medium text-[#F7631E]">
                {companyInitials}
              </div>

              <div className="min-w-0">
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

                  <SalaryMeta>{formatSalary(job)}</SalaryMeta>
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
                    Your application is now visible to the recruiter.
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
                  Your saved CV is selected. You can view it or upload another CV
                  for this application.
                </p>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-[#F9FBFB] p-4">
                  {hasViewableCv ? (
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#202020]">
                          Current CV selected
                        </p>
                        <p className="mt-1 text-xs font-normal leading-5 text-[#585958]">
                          Candidate CV is ready to preview.
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <SecureCvButton
                          cvUrl={cvUrl}
                          version={cvVersion}
                          label="View CV"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-800"
                        />

                        <button
                          type="button"
                          onClick={() => cvInputRef.current?.click()}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
                        >
                          Upload another
                          <FiUploadCloud size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-[#202020]">
                        No CV found
                      </p>
                      <p className="mt-1 text-sm font-normal text-[#585958]">
                        Upload a PDF CV before submitting this application.
                      </p>

                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#e85512]"
                      >
                        Upload CV
                        <FiUploadCloud size={15} />
                      </button>
                    </div>
                  )}

                  <input
                    ref={cvInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleCvFileChange}
                    className="hidden"
                  />

                  {selectedCvFile ? (
                    <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#202020]">
                            {selectedCvFile.name}
                          </p>
                          <p className="text-xs font-normal text-[#585958]">
                            {formatFileSize(selectedCvFile.size)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={uploadAnotherCv}
                          disabled={isUploadingCv}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                        >
                          {isUploadingCv ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiUploadCloud />
                          )}
                          {isUploadingCv ? "Uploading..." : "Use this CV"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <FieldError message={fieldErrors.cv_url} />
              </section>

              <section className="mt-6">
                <label className="text-base font-medium text-[#202020]">
                  Cover note
                </label>

                <textarea
                  value={coverNote}
                  onBeforeInput={blockUnsafeTextInput}
                  onPaste={(event) =>
                    handleSafeTextPaste(
                      event,
                      updateCoverNote,
                      COVER_NOTE_MAX_LENGTH
                    )
                  }
                  onChange={(event) => updateCoverNote(event.target.value)}
                  rows={4}
                  maxLength={COVER_NOTE_MAX_LENGTH}
                  placeholder="Write a short note to the recruiter."
                  className={`mt-3 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
                    fieldErrors.cover_note
                      ? "border-red-300"
                      : "border-slate-200"
                  }`}
                />

                <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-normal text-slate-400">
                    Optional. If added, minimum {COVER_NOTE_MIN_LENGTH} characters.
                    Only letters, numbers, spaces, comma, and dot.
                  </p>

                  <p className="text-xs font-normal text-slate-400">
                    {coverNote.length}/{COVER_NOTE_MAX_LENGTH}
                  </p>
                </div>

                <FieldError message={fieldErrors.cover_note} />
              </section>

              <section className="mt-6">
                <h3 className="text-base font-medium text-[#202020]">
                  Recruiter questions
                </h3>

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
                  disabled={isSubmitting || isUploadingCv}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || isUploadingCv}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {isSubmitting ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiSend />
                  )}
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