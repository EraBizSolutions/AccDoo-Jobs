"use client";

import { useEffect, useState } from "react";
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

const QUESTION_TYPES = [
  { label: "Short answer", value: "text" },
  { label: "Long answer", value: "textarea" },
  { label: "Yes / No", value: "yes_no" },
  { label: "URL", value: "url" },
];

const emptyQuestionForm = {
  question_text: "",
  question_type: "text",
  is_required: true,
  display_order: 0,
};

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
  const questionText = formData.question_text.trim();

  if (!questionText) {
    errors.question_text = "Question text is required.";
  } else if (questionText.length < 3) {
    errors.question_text = "Question must be at least 3 characters.";
  }

  if (!QUESTION_TYPES.some((type) => type.value === formData.question_type)) {
    errors.question_type = "Select a valid question type.";
  }

  if (Number(formData.display_order) < 0) {
    errors.display_order = "Display order cannot be negative.";
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
}) {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const errors = submitAttempted ? validateQuestionForm(formData) : {};

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);

    const latestErrors = validateQuestionForm(formData);

    if (Object.keys(latestErrors).length > 0) {
      return;
    }

    await onSubmit({
      question_text: formData.question_text.trim(),
      question_type: formData.question_type,
      is_required: Boolean(formData.is_required),
      display_order: Number(formData.display_order || 0),
    });

    setSubmitAttempted(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5"
    >
      <div>
        <label className="text-sm font-normal text-[#585958]">
          Question text
        </label>
        <textarea
          value={formData.question_text}
          onChange={(event) => updateField("question_text", event.target.value)}
          rows={3}
          placeholder="Example: Why are you interested in this role?"
          className={`mt-2 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
            errors.question_text ? "border-red-300" : "border-slate-200"
          }`}
        />
        <FieldError message={errors.question_text} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_160px]">
        <div>
          <label className="text-sm font-normal text-[#585958]">
            Answer type
          </label>

          <div className="mt-2 grid gap-2 sm:grid-cols-4">
            {QUESTION_TYPES.map((type) => {
              const isSelected = formData.question_type === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("question_type", type.value)}
                  className={`rounded-2xl border px-3 py-2 text-left text-xs font-normal transition ${
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

          <FieldError message={errors.question_type} />
        </div>

        <div>
          <label className="text-sm font-normal text-[#585958]">
            Display order
          </label>

          <input
            type="number"
            min="0"
            value={formData.display_order}
            onChange={(event) => updateField("display_order", event.target.value)}
            className={`mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50 ${
              errors.display_order ? "border-red-300" : "border-slate-200"
            }`}
          />

          <FieldError message={errors.display_order} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-normal text-[#585958]">
          <input
            type="checkbox"
            checked={Boolean(formData.is_required)}
            onChange={(event) => updateField("is_required", event.target.checked)}
            className="h-4 w-4 accent-[#F7631E]"
          />
          Required question
        </label>

        <div className="flex flex-wrap gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-[#585958] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiX />
              Cancel
            </button>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
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

  async function loadQuestions() {
    setErrorMessage("");

    try {
      setIsLoading(true);
      const data = await listRecruiterJobQuestions(jobId);
      setQuestions(Array.isArray(data) ? data : []);
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

    try {
      setIsSubmitting(true);
      await createRecruiterJobQuestion(jobId, payload);
      setFormData(emptyQuestionForm);
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
      display_order: question.display_order ?? 0,
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
            Add role-specific questions. Candidates will answer these inside the
            apply popup before submitting.
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 px-4 py-3 text-center">
          <p className="text-2xl font-medium text-[#F7631E]">
            {questions.length}
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
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="rounded-2xl bg-[#F9FBFB] px-4 py-4 text-sm font-normal text-[#585958]">
            Loading questions...
          </p>
        ) : questions.length ? (
          questions.map((question) => {
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
                          Order {question.display_order}
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
              Add a question above to make candidate screening sharper.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}