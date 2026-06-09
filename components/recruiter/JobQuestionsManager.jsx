"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiEdit3,
  FiHelpCircle,
  FiLoader,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  createRecruiterJobQuestion,
  deleteRecruiterJobQuestion,
  listRecruiterJobQuestions,
  updateRecruiterJobQuestion,
} from "@/lib/api/recruiterApi";

const MAX_QUESTIONS = 3;

const QUESTION_TYPES = [
  { label: "Short answer", value: "text" },
  { label: "Long answer", value: "textarea" },
  { label: "Yes / No", value: "yes_no" },
  { label: "URL", value: "url" },
];

const QUESTION_ORDER_OPTIONS = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

const QUESTION_TEXT_MIN_LENGTH = 10;
const QUESTION_TEXT_MAX_LENGTH = 180;

const QUESTION_TEXT_PATTERN = /^[A-Za-z0-9 ?.,]+$/;

const emptyQuestionForm = {
  question_text: "",
  question_type: "text",
  is_required: true,
  display_order: 1,
};

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function sanitizeQuestionText(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 ?.,]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, QUESTION_TEXT_MAX_LENGTH);
}

function normalizeDisplayOrder(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 1;
  if (numberValue < 1) return 1;
  if (numberValue > MAX_QUESTIONS) return MAX_QUESTIONS;

  return numberValue;
}

function blockUnsafeQuestionInput(event) {
  const inputValue = event.data;

  if (!inputValue) return;

  if (!QUESTION_TEXT_PATTERN.test(inputValue)) {
    event.preventDefault();
  }
}

function handleQuestionPaste(event, onChange) {
  event.preventDefault();

  const pastedText = event.clipboardData.getData("text");
  const cleanedText = sanitizeQuestionText(pastedText);

  onChange(cleanedText);
}

function getNextDisplayOrder(questions) {
  const usedOrders = questions
    .map((question) => Number(question.display_order))
    .filter((order) => order >= 1 && order <= MAX_QUESTIONS);

  for (let order = 1; order <= MAX_QUESTIONS; order += 1) {
    if (!usedOrders.includes(order)) {
      return order;
    }
  }

  return Math.min(questions.length + 1, MAX_QUESTIONS);
}

function QuestionTypePill({ type }) {
  const label =
    QUESTION_TYPES.find((questionType) => questionType.value === type)?.label ||
    type;

  return (
    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
      {label}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function validateQuestionForm(formData) {
  const errors = {};
  const questionText = cleanText(formData.question_text);
  const displayOrder = Number(formData.display_order);

  if (!questionText) {
    errors.question_text = "Question text is required.";
  } else if (questionText.length < QUESTION_TEXT_MIN_LENGTH) {
    errors.question_text = `Question must be at least ${QUESTION_TEXT_MIN_LENGTH} characters.`;
  } else if (questionText.length > QUESTION_TEXT_MAX_LENGTH) {
    errors.question_text = `Question must be below ${QUESTION_TEXT_MAX_LENGTH} characters.`;
  } else if (!QUESTION_TEXT_PATTERN.test(questionText)) {
    errors.question_text =
      "Use only letters, numbers, spaces, question mark, comma, and dot.";
  }

  if (!QUESTION_TYPES.some((type) => type.value === formData.question_type)) {
    errors.question_type = "Select a valid question type.";
  }

  if (!QUESTION_ORDER_OPTIONS.some((order) => order.value === displayOrder)) {
    errors.display_order = "Display order must be 1, 2, or 3.";
  }

  return errors;
}

function QuestionForm({
  mode,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isSubmitting,
  disableSubmit = false,
  disableReason = "",
}) {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({});

  const validationErrors = useMemo(
    () => validateQuestionForm(formData),
    [formData]
  );

  const visibleErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(
      ([field]) => submitAttempted || touched[field]
    )
  );

  const questionLength = cleanText(formData.question_text).length;
  const remainingMin = Math.max(QUESTION_TEXT_MIN_LENGTH - questionLength, 0);

  function markTouched(name) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  }

  function updateField(name, value) {
    let nextValue = value;

    if (name === "question_text") {
      nextValue = sanitizeQuestionText(value);
    }

    if (name === "display_order") {
      nextValue = normalizeDisplayOrder(value);
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }));

    markTouched(name);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);

    if (disableSubmit) {
      return;
    }

    const latestErrors = validateQuestionForm(formData);

    if (Object.keys(latestErrors).length > 0) {
      setTouched({
        question_text: true,
        question_type: true,
        display_order: true,
      });
      return;
    }

    await onSubmit({
      question_text: cleanText(formData.question_text),
      question_type: formData.question_type,
      is_required: Boolean(formData.is_required),
      display_order: normalizeDisplayOrder(formData.display_order),
    });

    setSubmitAttempted(false);
    setTouched({});
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5"
    >
      {disableSubmit ? (
        <p className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-normal text-yellow-800">
          {disableReason || `Maximum ${MAX_QUESTIONS} questions allowed.`}
        </p>
      ) : null}

      <div>
        <label className="text-sm font-normal text-[#585958]">
          Question text <span className="text-[#F7631E]">*</span>
        </label>

        <textarea
          value={formData.question_text}
          onBeforeInput={blockUnsafeQuestionInput}
          onPaste={(event) =>
            handleQuestionPaste(event, (nextValue) =>
              updateField("question_text", nextValue)
            )
          }
          onChange={(event) => updateField("question_text", event.target.value)}
          onBlur={() => markTouched("question_text")}
          rows={3}
          maxLength={QUESTION_TEXT_MAX_LENGTH}
          disabled={disableSubmit || isSubmitting}
          placeholder="Example: Why are you interested in this role?"
          className={`mt-2 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 disabled:cursor-not-allowed disabled:bg-slate-50 ${
            visibleErrors.question_text ? "border-red-300" : "border-slate-200"
          }`}
        />

        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-normal text-slate-400">
            Only letters, numbers, spaces, question mark, comma, and dot.
            {remainingMin > 0
              ? ` Add ${remainingMin} more character${
                  remainingMin === 1 ? "" : "s"
                }.`
              : " Looks good."}
          </p>

          <p className="text-xs font-normal text-slate-400">
            {questionLength}/{QUESTION_TEXT_MAX_LENGTH}
          </p>
        </div>

        <FieldError message={visibleErrors.question_text} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
        <div>
          <label className="text-sm font-normal text-[#585958]">
            Answer type <span className="text-[#F7631E]">*</span>
          </label>

          <div className="mt-2 grid gap-2 sm:grid-cols-4">
            {QUESTION_TYPES.map((type) => {
              const isSelected = formData.question_type === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  disabled={disableSubmit || isSubmitting}
                  onClick={() => updateField("question_type", type.value)}
                  className={`rounded-2xl border px-3 py-2 text-left text-xs font-normal transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-[#F7631E] bg-white text-[#F7631E] ring-4 ring-orange-100"
                      : "border-slate-200 bg-white text-[#585958] hover:border-[#F7631E] hover:text-[#F7631E]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    {type.label}
                    {isSelected ? <FiCheck size={14} /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <FieldError message={visibleErrors.question_type} />
        </div>

        <div>
          <label className="text-sm font-normal text-[#585958]">
            Display order <span className="text-[#F7631E]">*</span>
          </label>

          <select
            value={normalizeDisplayOrder(formData.display_order)}
            disabled={disableSubmit || isSubmitting}
            onChange={(event) =>
              updateField("display_order", Number(event.target.value))
            }
            onBlur={() => markTouched("display_order")}
            className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 disabled:cursor-not-allowed disabled:bg-slate-50 ${
              visibleErrors.display_order
                ? "border-red-300"
                : "border-slate-200"
            }`}
          >
            {QUESTION_ORDER_OPTIONS.map((order) => (
              <option key={order.value} value={order.value}>
                Question {order.label}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs font-normal text-slate-400">
            Only 1, 2, or 3. Lower number shows first.
          </p>

          <FieldError message={visibleErrors.display_order} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-normal text-[#585958]">
          <input
            type="checkbox"
            checked={Boolean(formData.is_required)}
            disabled={disableSubmit || isSubmitting}
            onChange={(event) => updateField("is_required", event.target.checked)}
            className="h-4 w-4 accent-[#F7631E] disabled:cursor-not-allowed"
          />
          Required question
        </label>

        <div className="flex flex-wrap gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={() => {
                setSubmitAttempted(false);
                setTouched({});
                onCancel();
              }}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-[#585958] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiX />
              Cancel
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || disableSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
            {isSubmitting
              ? mode === "edit"
                ? "Updating..."
                : "Adding..."
              : mode === "edit"
              ? "Update question"
              : "Add question"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function JobQuestionsManager({ jobId }) {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState(emptyQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyQuestionForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyQuestionId, setBusyQuestionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const sortedQuestions = useMemo(() => {
    return [...questions].sort(
      (firstQuestion, secondQuestion) =>
        Number(firstQuestion.display_order || 1) -
        Number(secondQuestion.display_order || 1)
    );
  }, [questions]);

  const questionLimitReached = questions.length >= MAX_QUESTIONS;

  async function loadQuestions() {
    setErrorMessage("");

    try {
      setIsLoading(true);

      const data = await listRecruiterJobQuestions(jobId);
      const questionList = Array.isArray(data) ? data : [];

      setQuestions(questionList);

      setFormData((currentFormData) => ({
        ...currentFormData,
        display_order: getNextDisplayOrder(questionList),
      }));
    } catch (error) {
      setErrorMessage(error.message || "Could not load job questions.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) {
      loadQuestions();
    }
  }, [jobId]);

  async function handleCreateQuestion(payload) {
    setErrorMessage("");
    setStatusMessage("");

    if (questions.length >= MAX_QUESTIONS) {
      setErrorMessage(`You can add only ${MAX_QUESTIONS} questions per job.`);
      return;
    }

    try {
      setIsSubmitting(true);

      await createRecruiterJobQuestion(jobId, payload);

      const nextQuestionsCount = questions.length + 1;

      setFormData({
        ...emptyQuestionForm,
        display_order: Math.min(nextQuestionsCount + 1, MAX_QUESTIONS),
      });

      setStatusMessage("Question added successfully.");
      await loadQuestions();
    } catch (error) {
      setErrorMessage(error.message || "Could not add question.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(question) {
    setEditingQuestionId(question.id);
    setEditFormData({
      question_text: question.question_text || "",
      question_type: question.question_type || "text",
      is_required: Boolean(question.is_required),
      display_order: normalizeDisplayOrder(question.display_order || 1),
    });
  }

  function cancelEditing() {
    setEditingQuestionId(null);
    setEditFormData(emptyQuestionForm);
  }

  async function handleUpdateQuestion(payload) {
    setErrorMessage("");
    setStatusMessage("");

    try {
      setBusyQuestionId(editingQuestionId);
      await updateRecruiterJobQuestion(jobId, editingQuestionId, payload);
      setStatusMessage("Question updated successfully.");
      cancelEditing();
      await loadQuestions();
    } catch (error) {
      setErrorMessage(error.message || "Could not update question.");
    } finally {
      setBusyQuestionId(null);
    }
  }

  async function handleDeleteQuestion(questionId) {
    setErrorMessage("");
    setStatusMessage("");

    const confirmed = window.confirm(
      "Delete this question? Candidates will no longer answer it for this job."
    );

    if (!confirmed) return;

    try {
      setBusyQuestionId(questionId);
      await deleteRecruiterJobQuestion(jobId, questionId);
      setStatusMessage("Question deleted successfully.");
      await loadQuestions();
    } catch (error) {
      setErrorMessage(error.message || "Could not delete question.");
    } finally {
      setBusyQuestionId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-normal uppercase tracking-[0.2em] text-[#F7631E]">
            <FiHelpCircle />
            Custom questions
          </p>

          <h2 className="mt-2 text-2xl font-medium tracking-tight text-[#202020]">
            Screening questions
          </h2>

          <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
            Add up to {MAX_QUESTIONS} role-specific questions. Candidates will
            answer these inside the apply popup before submitting.
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center">
          <p className="text-2xl font-medium text-[#F7631E]">
            {questions.length}/{MAX_QUESTIONS}
          </p>
          <p className="text-xs font-normal text-[#585958]">Questions</p>
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
          {statusMessage}
        </p>
      ) : null}

      <div className="mt-6">
        <QuestionForm
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateQuestion}
          isSubmitting={isSubmitting}
          disableSubmit={questionLimitReached}
          disableReason={`Maximum ${MAX_QUESTIONS} screening questions are allowed for one job.`}
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="rounded-2xl bg-[#F9FBFB] px-4 py-4 text-sm font-normal text-[#585958]">
            Loading questions...
          </p>
        ) : sortedQuestions.length ? (
          sortedQuestions.map((question) => {
            const isEditing = editingQuestionId === question.id;
            const isBusy = busyQuestionId === question.id;

            return (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-100 bg-[#F9FBFB] p-4"
              >
                {isEditing ? (
                  <QuestionForm
                    mode="edit"
                    formData={editFormData}
                    setFormData={setEditFormData}
                    onSubmit={handleUpdateQuestion}
                    onCancel={cancelEditing}
                    isSubmitting={isBusy}
                  />
                ) : (
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <QuestionTypePill type={question.question_type} />

                        {question.is_required ? (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-normal text-red-600">
                            Required
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-normal text-slate-500">
                            Optional
                          </span>
                        )}

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-normal text-slate-500">
                          Question {normalizeDisplayOrder(question.display_order)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-normal leading-6 text-[#202020]">
                        {question.question_text}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(question)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiEdit3 />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-normal text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiTrash2 />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F9FBFB] p-6 text-center">
            <FiPlus className="mx-auto text-[#F7631E]" size={24} />
            <p className="mt-3 text-sm font-medium text-[#202020]">
              No questions yet.
            </p>
            <p className="mt-1 text-sm font-normal text-[#585958]">
              Add up to {MAX_QUESTIONS} questions above to make candidate
              screening sharper.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}