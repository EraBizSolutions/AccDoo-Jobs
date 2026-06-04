"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiMapPin, FiSave, FiX } from "react-icons/fi";

const GOOGLE_MAPS_SCRIPT_ID = "jobsera-google-maps-places-script";

const WORK_MODE_OPTIONS = [
  { label: "Onsite", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
];

const JOB_TYPE_OPTIONS = [
  { label: "Internship", value: "internship" },
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
];

const STATUS_OPTIONS = [
  {
    label: "Draft",
    value: "draft",
    helper: "Hidden from public jobs",
    tone: "draft",
  },
  {
    label: "Active",
    value: "active",
    helper: "Visible to candidates",
    tone: "active",
  },
  {
    label: "Closed",
    value: "closed",
    helper: "Not accepting applicants",
    tone: "closed",
  },
];

const SKILL_SUGGESTIONS = [
  "React",
  "Next.js",
  "JavaScript",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Express.js",
  "FastAPI",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "SQL",
  "REST API",
  "Git",
  "Docker",
  "AWS",
  "Firebase",
];

const inputClass =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50";

const labelClass = "text-sm font-normal text-[#585958]";

function injectGooglePlacesDropdownStyles() {
  if (typeof document === "undefined") return;

  const styleId = "jobsera-google-places-style";

  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    .pac-container {
      z-index: 999999 !important;
      border-radius: 16px !important;
      margin-top: 8px !important;
      border: 1px solid #e2e8f0 !important;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12) !important;
      font-family: inherit !important;
      overflow: hidden !important;
    }

    .pac-item {
      padding: 12px 14px !important;
      font-size: 14px !important;
      cursor: pointer !important;
    }

    .pac-item:hover {
      background: #fff7ed !important;
    }

    .pac-item-query {
      color: #202020 !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    }
  `;

  document.head.appendChild(style);
}

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;

    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });

      const waitForGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(waitForGoogle);
          resolve();
        }
      }, 150);

      setTimeout(() => {
        clearInterval(waitForGoogle);
      }, 7000);

      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
  });
}

function getStatusToneClasses(option, isSelected) {
  if (!isSelected) {
    return "border-slate-200 bg-white text-[#585958] hover:border-slate-300 hover:bg-slate-50";
  }

  if (option.tone === "active") {
    return "border-green-500 bg-green-50 text-green-700 ring-4 ring-green-50";
  }

  if (option.tone === "closed") {
    return "border-red-500 bg-red-50 text-red-700 ring-4 ring-red-50";
  }

  return "border-slate-400 bg-slate-50 text-slate-700 ring-4 ring-slate-100";
}

function getNormalChoiceClasses(isSelected) {
  return isSelected
    ? "border-[#F7631E] bg-orange-50 text-[#F7631E] ring-4 ring-orange-50"
    : "border-slate-200 bg-white text-[#585958] hover:border-[#F7631E] hover:bg-orange-50/40";
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function ChoiceTabs({ label, value, options, onChange, statusMode = false }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          const className = statusMode
            ? getStatusToneClasses(option, isSelected)
            : getNormalChoiceClasses(isSelected);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${className}`}
            >
              <span className="flex items-center justify-between gap-2 text-sm font-medium">
                {option.label}
                {isSelected ? <FiCheck size={16} /> : null}
              </span>

              {option.helper ? (
                <span className="mt-1 block text-xs font-normal opacity-70">
                  {option.helper}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkillsInput({ skills, setSkills, error }) {
  const [skillInput, setSkillInput] = useState("");

  function addSkill(rawSkill) {
    const cleanSkill = rawSkill.trim();

    if (!cleanSkill) return;

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === cleanSkill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setSkills([...skills, cleanSkill]);
    setSkillInput("");
  }

  function removeSkill(skillToRemove) {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(skillInput);
    }

    if (event.key === "Backspace" && !skillInput && skills.length) {
      removeSkill(skills[skills.length - 1]);
    }
  }

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(skillInput.toLowerCase()) &&
      !skills.some((skill) => skill.toLowerCase() === suggestion.toLowerCase())
  ).slice(0, 6);

  return (
    <div>
      <label className={labelClass}>Required skills</label>

      <div
        className={`mt-2 rounded-2xl border bg-white px-3 py-3 transition focus-within:border-[#F7631E] focus-within:ring-4 focus-within:ring-orange-50 ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-normal text-[#F7631E]"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="rounded-full hover:bg-orange-100"
              >
                <FiX size={13} />
              </button>
            </span>
          ))}

          <input
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addSkill(skillInput)}
            placeholder={skills.length ? "Add more skills..." : "Type skill and press Enter"}
            className="min-w-40 flex-1 bg-transparent px-1 py-1.5 text-sm font-normal text-[#202020] outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      {skillInput && filteredSuggestions.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addSkill(suggestion)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <FieldError message={error} />

      <p className="mt-2 text-xs font-normal text-slate-400">
        Press Enter or comma after each skill.
      </p>
    </div>
  );
}

function validateJobForm(formData, skills) {
  const errors = {};
  const title = formData.title.trim();
  const companyName = formData.company_name.trim();
  const description = formData.description.trim();
  const location = formData.location.trim();

  if (!title) {
    errors.title = "Job title is required.";
  } else if (title.length < 3) {
    errors.title = "Job title must be at least 3 characters.";
  } else if (!/^[A-Za-z0-9\s-]+$/.test(title)) {
    errors.title = "Use only letters, numbers, spaces, and hyphen (-).";
  }

  if (!companyName) {
    errors.company_name = "Company name is required.";
  }

  if (!description) {
    errors.description = "Job description is required.";
  } else if (description.length < 50) {
    errors.description = `Add ${50 - description.length} more characters for a clear description.`;
  }

  if (!location) {
    errors.location = "Location is required.";
  }

  if (!skills.length) {
    errors.required_skills = "Add at least one required skill.";
  }

  const salaryMin = formData.salary_min ? Number(formData.salary_min) : null;
  const salaryMax = formData.salary_max ? Number(formData.salary_max) : null;

  if (salaryMin !== null && salaryMin < 0) {
    errors.salary_min = "Salary min cannot be negative.";
  }

  if (salaryMax !== null && salaryMax < 0) {
    errors.salary_max = "Salary max cannot be negative.";
  }

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    errors.salary_max = "Salary max must be higher than salary min.";
  }

  return errors;
}

export default function RecruiterJobForm({
  mode = "create",
  initialFormData,
  initialSkills = [],
  isLoading = false,
  onSubmit,
  onCancel,
}) {
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState(initialSkills);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    setSkills(initialSkills);
  }, [initialSkills]);

  useEffect(() => {
    if (isLoading) return;

    injectGooglePlacesDropdownStyles();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError("Location autocomplete is not configured.");
      return;
    }

    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        await loadGoogleMapsScript(apiKey);

        if (!isMounted || !locationInputRef.current || !window.google?.maps?.places) {
          setLocationError("Location autocomplete could not load.");
          return;
        }

        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: "lk" },
            fields: ["formatted_address", "name"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          const selectedLocation =
            place.formatted_address ||
            place.name ||
            locationInputRef.current?.value ||
            "";

          setFormData((currentData) => ({
            ...currentData,
            location: selectedLocation,
          }));

          setTouched((currentTouched) => ({
            ...currentTouched,
            location: true,
          }));

          setLocationError("");
        });

        setLocationError("");
      } catch {
        setLocationError("Location autocomplete failed to load.");
      }
    }

    initializeGooglePlaces();

    return () => {
      isMounted = false;

      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoading]);

  const validationErrors = useMemo(
    () => validateJobForm(formData, skills),
    [formData, skills]
  );

  const visibleErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(
      ([field]) => touched[field] || submitAttempted
    )
  );

  function markTouched(name) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "title") {
      const cleanedValue = value.replace(/[^A-Za-z0-9\s-]/g, "");

      setFormData((currentData) => ({
        ...currentData,
        title: cleanedValue,
      }));

      markTouched("title");
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    markTouched(name);
  }

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    markTouched(name);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setFormErrorMessage("");

    const latestErrors = validateJobForm(formData, skills);

    if (Object.keys(latestErrors).length > 0) {
      setFormErrorMessage("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        ...formData,
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        required_skills: skills.join(", "),
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
      });
    } catch (error) {
      setFormErrorMessage(error.message || "Could not save job.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
        Loading job form...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-6">
      <div>
        <label className={labelClass}>Job title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          onBlur={() => markTouched("title")}
          placeholder="Frontend Developer Intern"
          maxLength={100}
          className={`mt-2 ${inputClass} ${
            visibleErrors.title ? "border-red-300" : "border-slate-200"
          }`}
        />
        <FieldError message={visibleErrors.title} />
        <p className="mt-2 text-xs font-normal text-slate-400">
          Letters, numbers, spaces, and hyphen only.
        </p>
      </div>

      <div>
        <label className={labelClass}>Company name</label>
        <input
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          onBlur={() => markTouched("company_name")}
          placeholder="Company name"
          className={`mt-2 ${inputClass} ${
            visibleErrors.company_name ? "border-red-300" : "border-slate-200"
          }`}
        />
        <FieldError message={visibleErrors.company_name} />
      </div>

      <div>
        <label className={labelClass}>Job description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={() => markTouched("description")}
          placeholder="Write a clear role description, responsibilities, expectations, and benefits..."
          rows={7}
          className={`mt-2 resize-none ${inputClass} ${
            visibleErrors.description ? "border-red-300" : "border-slate-200"
          }`}
        />
        <FieldError message={visibleErrors.description} />
        <p className="mt-2 text-xs font-normal text-slate-400">
          Minimum 50 characters. Current: {formData.description.trim().length}/50.
        </p>
      </div>

      <div>
        <label className={labelClass}>Location</label>

        <div className="relative mt-2">
          <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            ref={locationInputRef}
            name="location"
            value={formData.location}
            onChange={handleChange}
            onBlur={() => markTouched("location")}
            placeholder="Colombo, Sri Lanka"
            autoComplete="off"
            className={`${inputClass} pl-11 ${
              visibleErrors.location || locationError
                ? "border-red-300"
                : "border-slate-200"
            }`}
          />
        </div>

        <FieldError message={visibleErrors.location || locationError} />
      </div>

      <ChoiceTabs
        label="Work mode"
        value={formData.work_mode}
        options={WORK_MODE_OPTIONS}
        onChange={(value) => updateField("work_mode", value)}
      />

      <ChoiceTabs
        label="Job type"
        value={formData.job_type}
        options={JOB_TYPE_OPTIONS}
        onChange={(value) => updateField("job_type", value)}
      />

      <ChoiceTabs
        label="Publishing status"
        value={formData.status}
        options={STATUS_OPTIONS}
        statusMode
        onChange={(value) => updateField("status", value)}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Salary min</label>
          <input
            name="salary_min"
            type="number"
            min="0"
            value={formData.salary_min}
            onChange={handleChange}
            onBlur={() => markTouched("salary_min")}
            placeholder="30000"
            className={`mt-2 ${inputClass} ${
              visibleErrors.salary_min ? "border-red-300" : "border-slate-200"
            }`}
          />
          <FieldError message={visibleErrors.salary_min} />
        </div>

        <div>
          <label className={labelClass}>Salary max</label>
          <input
            name="salary_max"
            type="number"
            min="0"
            value={formData.salary_max}
            onChange={handleChange}
            onBlur={() => markTouched("salary_max")}
            placeholder="90000"
            className={`mt-2 ${inputClass} ${
              visibleErrors.salary_max ? "border-red-300" : "border-slate-200"
            }`}
          />
          <FieldError message={visibleErrors.salary_max} />
        </div>
      </div>

      <SkillsInput
        skills={skills}
        setSkills={(nextSkills) => {
          setSkills(nextSkills);
          markTouched("required_skills");
        }}
        error={visibleErrors.required_skills}
      />

      {formErrorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
          {formErrorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          <FiSave />
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
            ? "Update job"
            : "Create job"}
        </button>
      </div>
    </form>
  );
}