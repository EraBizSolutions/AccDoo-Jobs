"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiBriefcase,
  FiCheckCircle,
  FiFileText,
  FiLoader,
  FiMapPin,
  FiSave,
  FiX,
} from "react-icons/fi";

const GOOGLE_MAPS_SCRIPT_ID = "accdoo-google-maps-places-script";

const MIN_REQUIRED_SKILLS = 2;
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 5000;

const WORK_MODES = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const JOB_TYPES = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
];

const JOB_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

const SKILL_SUGGESTIONS = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "Python",
  "FastAPI",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQL",
  "REST API",
  "Git",
  "GitHub",
  "AWS",
  "Docker",
  "Tailwind CSS",
  "Figma",
  "UI/UX",
  "Communication",
  "Problem Solving",
];

const inputClass =
  "w-full min-w-0 rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50";

const labelClass = "text-sm font-normal text-[#585958]";

function RequiredMark() {
  return <span className="text-[#F7631E]">*</span>;
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function SalaryPrefix() {
  return (
    <span className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-[#F7631E]">
      LKR
    </span>
  );
}

function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function sanitizeJobTitle(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 .#/+()-]/g, "")
    .replace(/\s+/g, " ");
}

function sanitizeCompanyName(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 .&()-]/g, "")
    .replace(/\s+/g, " ");
}

function sanitizeLocation(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 ,./-]/g, "")
    .replace(/\s+/g, " ");
}

function sanitizeSkill(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 .#/+()-]/g, "")
    .replace(/\s+/g, " ");
}

function sanitizeSalary(value) {
  return String(value || "").replace(/[^0-9]/g, "").slice(0, 9);
}

function sanitizeDescription(value) {
  return String(value || "").replace(/[<>]/g, "");
}

function getCleanSkillList(skills) {
  const uniqueSkills = [];

  skills.forEach((skill) => {
    const cleanSkill = sanitizeSkill(skill).trim();

    if (!cleanSkill || cleanSkill.length < 2 || cleanSkill.length > 60) return;

    const alreadyExists = uniqueSkills.some(
      (existingSkill) =>
        existingSkill.toLowerCase() === cleanSkill.toLowerCase()
    );

    if (!alreadyExists) {
      uniqueSkills.push(cleanSkill);
    }
  });

  return uniqueSkills;
}

function injectGooglePlacesDropdownStyles() {
  if (typeof document === "undefined") return;

  const styleId = "accdoo-google-places-style";

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

function validateJobForm(formData, skills) {
  const errors = {};

  const title = cleanText(formData.title);
  const companyName = cleanText(formData.company_name);
  const description = String(formData.description || "").trim();
  const location = cleanText(formData.location);
  const cleanSkills = getCleanSkillList(skills);

  const salaryMin =
    formData.salary_min === "" || formData.salary_min === null
      ? null
      : Number(formData.salary_min);

  const salaryMax =
    formData.salary_max === "" || formData.salary_max === null
      ? null
      : Number(formData.salary_max);

  if (!title) {
    errors.title = "Job title is required.";
  } else if (title.length < 3) {
    errors.title = "Job title must be at least 3 characters.";
  } else if (title.length > 100) {
    errors.title = "Job title must be below 100 characters.";
  } else if (!/^[A-Za-z0-9 .#/+()-]+$/.test(title)) {
    errors.title =
      "Use only letters, numbers, spaces, dot, #, slash, plus, hyphen, or brackets.";
  }

  if (!companyName) {
    errors.company_name = "Company name is required.";
  } else if (companyName.length < 2) {
    errors.company_name = "Company name must be at least 2 characters.";
  } else if (companyName.length > 150) {
    errors.company_name = "Company name must be below 150 characters.";
  } else if (!/^[A-Za-z0-9 .&()-]+$/.test(companyName)) {
    errors.company_name =
      "Company name can use only letters, numbers, spaces, dot, &, hyphen, or brackets.";
  }

  if (!description) {
    errors.description = "Job description is required.";
  } else if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Job description needs at least ${MIN_DESCRIPTION_LENGTH} characters. Add ${
      MIN_DESCRIPTION_LENGTH - description.length
    } more.`;
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Job description must be below ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  if (!location) {
    errors.location = "Job location is required.";
  } else if (!/^[A-Za-z0-9 ,./-]+$/.test(location)) {
    errors.location =
      "Location can use only letters, numbers, spaces, comma, dot, slash, or hyphen.";
  }

  if (!WORK_MODES.some((mode) => mode.value === formData.work_mode)) {
    errors.work_mode = "Please select a valid work mode.";
  }

  if (!JOB_TYPES.some((type) => type.value === formData.job_type)) {
    errors.job_type = "Please select a valid job type.";
  }

  if (!JOB_STATUSES.some((status) => status.value === formData.status)) {
    errors.status = "Please select a valid job status.";
  }

  if (cleanSkills.length < MIN_REQUIRED_SKILLS) {
    errors.required_skills = `Add at least ${MIN_REQUIRED_SKILLS} required skills.`;
  }

  if (salaryMin !== null && (Number.isNaN(salaryMin) || salaryMin < 0)) {
    errors.salary_min = "Salary min must be a valid positive number.";
  }

  if (salaryMax !== null && (Number.isNaN(salaryMax) || salaryMax < 0)) {
    errors.salary_max = "Salary max must be a valid positive number.";
  }

  if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
    errors.salary_max = "Salary max must be higher than salary min.";
  }

  if (salaryMin !== null && salaryMin > 10000000) {
    errors.salary_min = "Salary min looks too high. Maximum allowed is 10,000,000.";
  }

  if (salaryMax !== null && salaryMax > 10000000) {
    errors.salary_max = "Salary max looks too high. Maximum allowed is 10,000,000.";
  }

  return errors;
}

function SkillsInput({ skills, setSkills, error, markTouched }) {
  const [skillInput, setSkillInput] = useState("");
  const [skillError, setSkillError] = useState("");

  function addSkill(rawSkill) {
    const cleanSkill = sanitizeSkill(rawSkill).trim();

    setSkillError("");

    if (!cleanSkill) return;

    if (cleanSkill.length < 2 || cleanSkill.length > 60) {
      setSkillError("Skill must be between 2 and 60 characters.");
      setSkillInput("");
      markTouched("required_skills");
      return;
    }

    if (!/^[A-Za-z0-9 .#/+()-]+$/.test(cleanSkill)) {
      setSkillError(
        "Skill can use only letters, numbers, spaces, dot, #, slash, plus, hyphen, or brackets."
      );
      setSkillInput("");
      markTouched("required_skills");
      return;
    }

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === cleanSkill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      markTouched("required_skills");
      return;
    }

    setSkills([...skills, cleanSkill]);
    setSkillInput("");
    markTouched("required_skills");
  }

  function removeSkill(skillToRemove) {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    markTouched("required_skills");
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
  ).slice(0, 8);

  return (
    <div>
      <label className={labelClass}>
        Required skills <RequiredMark />
      </label>

      <div
        className={`mt-2 rounded-2xl border bg-white px-3 py-3 transition focus-within:border-[#F7631E] focus-within:ring-4 focus-within:ring-orange-50 ${
          error || skillError ? "border-red-300" : "border-slate-200"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-normal text-[#F7631E]"
            >
              <span className="truncate">{skill}</span>

              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="shrink-0 rounded-full hover:bg-orange-100"
              >
                <FiX size={13} />
              </button>
            </span>
          ))}

          <input
            value={skillInput}
            onChange={(event) => {
              setSkillInput(sanitizeSkill(event.target.value));
              setSkillError("");
              markTouched("required_skills");
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => addSkill(skillInput)}
            placeholder={
              skills.length
                ? "Add more skills..."
                : `Add at least ${MIN_REQUIRED_SKILLS} skills`
            }
            className="min-w-[160px] flex-1 bg-transparent px-1 py-1.5 text-sm font-normal text-[#202020] outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      <p className="mt-2 text-xs font-normal text-slate-400">
        Minimum {MIN_REQUIRED_SKILLS} skills required. Press Enter or comma to add.
      </p>

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

      <FieldError message={skillError || error} />
    </div>
  );
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
  const [skills, setSkills] = useState(getCleanSkillList(initialSkills));
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [formStatusMessage, setFormStatusMessage] = useState("");

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    setSkills(getCleanSkillList(initialSkills));
  }, [initialSkills]);

  useEffect(() => {
    if (isLoading) return;

    injectGooglePlacesDropdownStyles();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError(
        "Google Maps key is missing. You can still type location manually."
      );
      return;
    }

    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        await loadGoogleMapsScript(apiKey);

        if (
          !isMounted ||
          !locationInputRef.current ||
          !window.google?.maps?.places
        ) {
          setLocationError(
            "Location autocomplete could not load. You can type manually."
          );
          return;
        }

        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(
            autocompleteRef.current
          );
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["geocode"],
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
            location: sanitizeLocation(selectedLocation),
          }));

          setTouched((currentTouched) => ({
            ...currentTouched,
            location: true,
          }));

          setLocationError("");
        });

        setLocationError("");
      } catch {
        setLocationError("Location autocomplete failed. You can type manually.");
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

  const descriptionLength = String(formData.description || "").trim().length;
  const descriptionRemaining = Math.max(
    MIN_DESCRIPTION_LENGTH - descriptionLength,
    0
  );

  function markTouched(name) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "title") {
      nextValue = sanitizeJobTitle(value).slice(0, 100);
    }

    if (name === "company_name") {
      nextValue = sanitizeCompanyName(value).slice(0, 150);
    }

    if (name === "description") {
      nextValue = sanitizeDescription(value).slice(0, MAX_DESCRIPTION_LENGTH);
    }

    if (name === "location") {
      nextValue = sanitizeLocation(value).slice(0, 120);
      setLocationError("");
    }

    if (name === "salary_min" || name === "salary_max") {
      nextValue = sanitizeSalary(value);
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }));

    markTouched(name);
    setFormErrorMessage("");
    setFormStatusMessage("");
  }

  function updateField(name, value) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    markTouched(name);
    setFormErrorMessage("");
    setFormStatusMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setFormErrorMessage("");
    setFormStatusMessage("");

    const latestErrors = validateJobForm(formData, skills);

    if (Object.keys(latestErrors).length > 0) {
      setTouched({
        title: true,
        company_name: true,
        description: true,
        location: true,
        work_mode: true,
        job_type: true,
        status: true,
        required_skills: true,
        salary_min: true,
        salary_max: true,
      });

      setFormErrorMessage("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setIsSubmitting(true);

      const cleanSkills = getCleanSkillList(skills);

      await onSubmit({
        title: cleanText(formData.title),
        company_name: cleanText(formData.company_name),
        description: String(formData.description || "").trim(),
        location: cleanText(formData.location),
        work_mode: formData.work_mode,
        job_type: formData.job_type,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        required_skills: cleanSkills.join(", "),
        status: formData.status,
      });

      setFormStatusMessage(
        mode === "edit" ? "Job updated successfully." : "Job created successfully."
      );
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
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>
            Job title <RequiredMark />
          </label>

          <div className="relative mt-2">
            <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={() => markTouched("title")}
              placeholder="Frontend Developer Intern"
              maxLength={100}
              className={`${inputClass} pl-11 ${
                visibleErrors.title ? "border-red-300" : "border-slate-200"
              }`}
            />
          </div>

          <p className="mt-2 text-xs font-normal text-slate-400">
            Example: React Developer, UI/UX Designer, .NET Intern
          </p>
          <FieldError message={visibleErrors.title} />
        </div>

        <div>
          <label className={labelClass}>
            Company name <RequiredMark />
          </label>

          <input
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            onBlur={() => markTouched("company_name")}
            placeholder="Company name"
            maxLength={150}
            className={`mt-2 ${inputClass} ${
              visibleErrors.company_name
                ? "border-red-300"
                : "border-slate-200"
            }`}
          />

          <FieldError message={visibleErrors.company_name} />
        </div>

        <div>
          <label className={labelClass}>
            Work mode <RequiredMark />
          </label>

          <select
            name="work_mode"
            value={formData.work_mode}
            onChange={(event) => updateField("work_mode", event.target.value)}
            onBlur={() => markTouched("work_mode")}
            className={`mt-2 ${inputClass} ${
              visibleErrors.work_mode ? "border-red-300" : "border-slate-200"
            }`}
          >
            {WORK_MODES.map((modeOption) => (
              <option key={modeOption.value} value={modeOption.value}>
                {modeOption.label}
              </option>
            ))}
          </select>

          <FieldError message={visibleErrors.work_mode} />
        </div>

        <div>
          <label className={labelClass}>
            Job type <RequiredMark />
          </label>

          <select
            name="job_type"
            value={formData.job_type}
            onChange={(event) => updateField("job_type", event.target.value)}
            onBlur={() => markTouched("job_type")}
            className={`mt-2 ${inputClass} ${
              visibleErrors.job_type ? "border-red-300" : "border-slate-200"
            }`}
          >
            {JOB_TYPES.map((typeOption) => (
              <option key={typeOption.value} value={typeOption.value}>
                {typeOption.label}
              </option>
            ))}
          </select>

          <FieldError message={visibleErrors.job_type} />
        </div>

        <div>
          <label className={labelClass}>
            Location <RequiredMark />
          </label>

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

        <div>
          <label className={labelClass}>
            Status <RequiredMark />
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={(event) => updateField("status", event.target.value)}
            onBlur={() => markTouched("status")}
            className={`mt-2 ${inputClass} ${
              visibleErrors.status ? "border-red-300" : "border-slate-200"
            }`}
          >
            {JOB_STATUSES.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>

          <FieldError message={visibleErrors.status} />
        </div>

        <div>
          <label className={labelClass}>Salary min</label>

          <div className="relative mt-2">
            <SalaryPrefix />
            <input
              name="salary_min"
              type="text"
              inputMode="numeric"
              value={formData.salary_min}
              onChange={handleChange}
              onBlur={() => markTouched("salary_min")}
              placeholder="30000"
              className={`${inputClass} pl-[72px] ${
                visibleErrors.salary_min
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            />
          </div>

          <FieldError message={visibleErrors.salary_min} />
        </div>

        <div>
          <label className={labelClass}>Salary max</label>

          <div className="relative mt-2">
            <SalaryPrefix />
            <input
              name="salary_max"
              type="text"
              inputMode="numeric"
              value={formData.salary_max}
              onChange={handleChange}
              onBlur={() => markTouched("salary_max")}
              placeholder="90000"
              className={`${inputClass} pl-[72px] ${
                visibleErrors.salary_max
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            />
          </div>

          <FieldError message={visibleErrors.salary_max} />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Job description <RequiredMark />
        </label>

        <div className="relative mt-2">
          <FiFileText className="absolute left-4 top-4 text-slate-400" />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={() => markTouched("description")}
            rows={7}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="Write the role summary, responsibilities, requirements, and working expectations..."
            className={`${inputClass} resize-none pl-11 ${
              visibleErrors.description
                ? "border-red-300"
                : "border-slate-200"
            }`}
          />
        </div>

        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-normal text-slate-400">
            Minimum {MIN_DESCRIPTION_LENGTH} characters required.
            {descriptionRemaining > 0
              ? ` Add ${descriptionRemaining} more characters.`
              : " Looks clear."}
          </p>

          <p className="text-xs font-normal text-slate-400">
            {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
          </p>
        </div>

        <FieldError message={visibleErrors.description} />
      </div>

      <SkillsInput
        skills={skills}
        setSkills={(nextSkills) => {
          setSkills(nextSkills);
          markTouched("required_skills");
        }}
        error={visibleErrors.required_skills}
        markTouched={markTouched}
      />

      {formErrorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
          <FiAlertCircle className="mr-2 inline" />
          {formErrorMessage}
        </p>
      ) : null}

      {formStatusMessage ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
          <FiCheckCircle className="mr-2 inline" />
          {formStatusMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
        >
          {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
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