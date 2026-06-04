"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBriefcase,
  FiCamera,
  FiEye,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiSave,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";

import {
  activateCandidate,
  getCurrentUser,
  getMyCandidateProfile,
  updateMyCandidateProfile,
} from "@/lib/api/authApi";
import {
  getAccessToken,
  getCandidateProfilePhoto,
  saveCandidateProfilePhoto,
  updateStoredUser,
} from "@/lib/utils/tokenStorage";

const GOOGLE_MAPS_SCRIPT_ID = "jobsera-google-maps-places-script";
const CANDIDATE_CV_FILE_KEY = "jobsera_candidate_cv_file";

const initialFormData = {
  display_name: "",
  email: "",
  phone: "",
  location: "",
  current_role: "",
  experience_years: "",
};

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
  "UI Design",
  "Data Analysis",
];

const inputClass =
  "w-full rounded-2xl border bg-white px-4 py-3 text-sm font-normal text-[#202020] outline-none transition placeholder:text-slate-300 focus:border-[#F7631E] focus:ring-4 focus:ring-orange-50";

const labelClass = "text-sm font-normal text-[#585958]";

function isBrowser() {
  return typeof window !== "undefined";
}

function saveCandidateCvFile(fileData) {
  if (!isBrowser()) return;

  if (fileData) {
    localStorage.setItem(CANDIDATE_CV_FILE_KEY, JSON.stringify(fileData));
  } else {
    localStorage.removeItem(CANDIDATE_CV_FILE_KEY);
  }
}

function getCandidateCvFile() {
  if (!isBrowser()) return null;

  const savedFile = localStorage.getItem(CANDIDATE_CV_FILE_KEY);

  if (!savedFile) return null;

  try {
    return JSON.parse(savedFile);
  } catch {
    localStorage.removeItem(CANDIDATE_CV_FILE_KEY);
    return null;
  }
}

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

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-normal text-red-500">{message}</p>;
}

function calculateProfileStrength(formData, skills, photo, cvFile) {
  let score = 10;

  if (formData.phone.trim()) score += 10;
  if (formData.location.trim()) score += 10;
  if (formData.current_role.trim()) score += 15;

  if (Number(formData.experience_years) >= 0 && formData.experience_years !== "") {
    score += 10;
  }

  if (skills.length) score += 25;
  if (cvFile?.name) score += 20;
  if (photo) score += 10;

  return Math.min(score, 100);
}

function validateCandidateProfile(formData, skills, cvFile) {
  const errors = {};

  const displayName = formData.display_name.trim();
  const phone = formData.phone.trim();
  const location = formData.location.trim();
  const currentRole = formData.current_role.trim();
  const experience = formData.experience_years;

  if (!displayName) {
    errors.display_name = "Name is required.";
  } else if (displayName.length < 2) {
    errors.display_name = "Name must be at least 2 characters.";
  }

  if (phone) {
    const phonePattern = /^\+?[0-9\s-]{7,15}$/;

    if (!phonePattern.test(phone)) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  if (!location) {
    errors.location = "Location is required.";
  }

  if (!currentRole) {
    errors.current_role = "Current role is required.";
  }

  if (experience === "") {
    errors.experience_years = "Experience years is required.";
  } else if (Number(experience) < 0 || Number(experience) > 50) {
    errors.experience_years = "Experience must be between 0 and 50 years.";
  }

  if (!skills.length) {
    errors.skills = "Add at least one skill.";
  }

  if (!cvFile?.name) {
    errors.cv = "Upload your CV before saving profile.";
  }

  return errors;
}

function parseSkills(skillsText) {
  if (!skillsText) return [];

  return skillsText
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) return "Unknown size";

  const sizeInMb = sizeInBytes / (1024 * 1024);

  return `${sizeInMb.toFixed(2)} MB`;
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
  ).slice(0, 7);

  return (
    <div>
      <label className={labelClass}>Skills</label>

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
    </div>
  );
}

function CandidateCvCard({ cvFile, error, onUploadClick, onView, onRemove }) {
  return (
    <div>
      <label className={labelClass}>Uploaded CV</label>

      <div
        className={`mt-2 rounded-3xl border bg-white p-4 transition ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      >
        {cvFile?.name ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
                <FiFileText size={24} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#202020]">
                  {cvFile.name}
                </p>
                <p className="mt-1 text-xs font-normal text-slate-400">
                  {cvFile.type || "Document"} · {formatFileSize(cvFile.size)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onView}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]"
              >
                <FiEye />
                View
              </button>

              <button
                type="button"
                onClick={onUploadClick}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#e85512]"
              >
                <FiUploadCloud />
                Replace
              </button>

              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
              >
                <FiX />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onUploadClick}
            className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-[#F9FBFB] px-5 py-8 text-center transition hover:border-[#F7631E] hover:bg-orange-50/40"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiUploadCloud size={25} />
            </span>

            <span className="mt-3 text-sm font-medium text-[#202020]">
              Upload your CV
            </span>

            <span className="mt-1 text-xs font-normal text-slate-400">
              PDF, DOC, or DOCX. Maximum 5MB.
            </span>
          </button>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}

export default function CandidateProfileCard() {
  const router = useRouter();
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCandidateProfile() {
      if (!getAccessToken()) {
        router.push("/login");
        return;
      }

      try {
        const user = await getCurrentUser();

        let profile;

        try {
          profile = await getMyCandidateProfile();
        } catch {
          profile = await activateCandidate();
        }

        const savedPhoto = getCandidateProfilePhoto();
        const savedCvFile = getCandidateCvFile();

        setProfileId(profile.id);
        setProfilePhoto(savedPhoto);
        setCvFile(savedCvFile);

        setFormData({
          display_name: user.name || "",
          email: user.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          current_role: profile.current_role || "",
          experience_years:
            profile.experience_years === null ||
            profile.experience_years === undefined
              ? ""
              : String(profile.experience_years),
        });

        setSkills(parseSkills(profile.skills));
      } catch (error) {
        setErrorMessage(error.message || "Could not load candidate profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCandidateProfile();
  }, [router]);

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

  const profileStrength = useMemo(
    () => calculateProfileStrength(formData, skills, profilePhoto, cvFile),
    [formData, skills, profilePhoto, cvFile]
  );

  const validationErrors = useMemo(
    () => validateCandidateProfile(formData, skills, cvFile),
    [formData, skills, cvFile]
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

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    markTouched(name);

    if (name === "location") {
      setLocationError("");
    }
  }

  function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Profile photo must be below 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      setProfilePhoto(result);
      saveCandidateProfilePhoto(result);
      setErrorMessage("");
    };

    reader.readAsDataURL(file);
  }

  function removeProfilePhoto() {
    setProfilePhoto(null);
    saveCandidateProfilePhoto(null);
  }

  function handleCvFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!allowedTypes.includes(file.type) && !hasAllowedExtension) {
      setErrorMessage("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("CV file must be below 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileData = {
        name: file.name,
        type: file.type || "Document",
        size: file.size,
        dataUrl: reader.result,
        uploadedAt: new Date().toISOString(),
      };

      setCvFile(fileData);
      saveCandidateCvFile(fileData);

      setTouched((currentTouched) => ({
        ...currentTouched,
        cv: true,
      }));

      setErrorMessage("");
    };

    reader.readAsDataURL(file);
  }

  function viewCvFile() {
    if (!cvFile?.dataUrl) {
      setErrorMessage("CV preview is not available. Please upload the CV again.");
      return;
    }

    window.open(cvFile.dataUrl, "_blank", "noopener,noreferrer");
  }

  function removeCvFile() {
    setCvFile(null);
    saveCandidateCvFile(null);

    setTouched((currentTouched) => ({
      ...currentTouched,
      cv: true,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setStatusMessage("");
    setErrorMessage("");

    const latestErrors = validateCandidateProfile(formData, skills, cvFile);

    if (Object.keys(latestErrors).length > 0) {
      setErrorMessage("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        current_role: formData.current_role.trim(),
        experience_years: Number(formData.experience_years),
        skills: skills.join(", "),
        cv_url: cvFile?.name || "",
        profile_strength: profileStrength,
      };

      await updateMyCandidateProfile(payload);

      updateStoredUser({
        name: formData.display_name.trim(),
      });

      setStatusMessage("Profile saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Could not save candidate profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const avatarLetter =
    formData.display_name?.trim()?.charAt(0)?.toUpperCase() ||
    formData.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70">
          <div className="text-center">
            <div className="relative mx-auto h-32 w-32">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Candidate profile"
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-orange-50"
                />
              ) : (
                <div className="grid h-32 w-32 place-items-center rounded-full bg-[#F7631E] text-4xl font-medium text-white ring-4 ring-orange-50">
                  {avatarLetter}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-white text-[#F7631E] shadow-lg ring-1 ring-slate-200 transition hover:bg-orange-50"
                aria-label="Upload profile photo"
              >
                <FiCamera size={18} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
              />
            </div>

            {profilePhoto ? (
              <button
                type="button"
                onClick={removeProfilePhoto}
                className="mt-3 text-xs font-normal text-red-500 transition hover:text-red-600"
              >
                Remove photo
              </button>
            ) : null}

            <h1 className="mt-5 text-[28px] font-medium tracking-tight text-[#202020]">
              Candidate profile
            </h1>

            <p className="mt-2 text-sm font-normal leading-6 text-[#585958]">
              Keep your details updated so AccDoo can improve your job matches.
            </p>
          </div>

          <div className="mt-7 rounded-3xl bg-[#F9FBFB] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-normal text-[#585958]">
                Profile strength
              </p>
              <p className="text-sm font-medium text-[#F7631E]">
                {profileStrength}%
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[#F7631E] transition-all"
                style={{ width: `${profileStrength}%` }}
              />
            </div>

            <p className="mt-3 text-xs font-normal leading-5 text-slate-400">
              Add phone, location, current role, skills, CV, and profile photo to improve strength.
            </p>
          </div>

          {profileId ? (
            <p className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-normal text-slate-400">
              Profile ID: {profileId}
            </p>
          ) : null}
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70 md:p-8">
          <div>
            <p className="text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
              Profile details
            </p>

            <h2 className="mt-2 text-[34px] font-medium tracking-tight text-[#202020]">
              Edit your candidate information
            </h2>
          </div>

          {isLoading ? (
            <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
              Loading candidate profile...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Display name</label>
                  <div className="relative mt-2">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleChange}
                      onBlur={() => markTouched("display_name")}
                      placeholder="Your name"
                      className={`${inputClass} pl-11 ${
                        visibleErrors.display_name
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  <FieldError message={visibleErrors.display_name} />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    value={formData.email}
                    readOnly
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-400 outline-none"
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone</label>
                  <div className="relative mt-2">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => markTouched("phone")}
                      placeholder="+94770000000"
                      className={`${inputClass} pl-11 ${
                        visibleErrors.phone ? "border-red-300" : "border-slate-200"
                      }`}
                    />
                  </div>
                  <FieldError message={visibleErrors.phone} />
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

                <div>
                  <label className={labelClass}>Current role</label>
                  <div className="relative mt-2">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="current_role"
                      value={formData.current_role}
                      onChange={handleChange}
                      onBlur={() => markTouched("current_role")}
                      placeholder="Frontend Developer Intern"
                      className={`${inputClass} pl-11 ${
                        visibleErrors.current_role
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  <FieldError message={visibleErrors.current_role} />
                </div>

                <div>
                  <label className={labelClass}>Experience years</label>
                  <input
                    name="experience_years"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience_years}
                    onChange={handleChange}
                    onBlur={() => markTouched("experience_years")}
                    placeholder="0"
                    className={`mt-2 ${inputClass} ${
                      visibleErrors.experience_years
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  />
                  <FieldError message={visibleErrors.experience_years} />
                </div>
              </div>

              <SkillsInput
                skills={skills}
                setSkills={(nextSkills) => {
                  setSkills(nextSkills);
                  markTouched("skills");
                }}
                error={visibleErrors.skills}
              />

              <CandidateCvCard
                cvFile={cvFile}
                error={visibleErrors.cv}
                onUploadClick={() => cvInputRef.current?.click()}
                onView={viewCvFile}
                onRemove={removeCvFile}
              />

              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvFileChange}
                className="hidden"
              />

              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              {statusMessage ? (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-normal text-green-700">
                  {statusMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-normal text-[#585958] transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  <FiSave />
                  {isSaving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </section>
  );
}