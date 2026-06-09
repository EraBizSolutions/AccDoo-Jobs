"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiExternalLink,
  FiFileText,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSave,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";

import SecureCvButton from "@/components/common/SecureCvButton";
import {
  activateCandidateProfile,
  getMyCandidateProfile,
  updateMyCandidateProfile,
  uploadCandidateCv,
} from "@/lib/api/candidateApi";
import { getCurrentUser } from "@/lib/api/authApi";
import {
  getAccessToken,
  updateStoredUser,
} from "@/lib/utils/tokenStorage";
import {
  cleanText,
  getCleanSkillList,
  MIN_REQUIRED_SKILLS,
  normalizePhoneNumber,
  sanitizeCurrentRole,
  sanitizeDisplayName,
  sanitizeExperienceYears,
  sanitizeLocation,
  validateCandidateProfileForm,
} from "@/lib/utils/candidateProfileRules";

const GOOGLE_MAPS_SCRIPT_ID = "accdoo-google-maps-places-script";

const initialFormData = {
  display_name: "",
  email: "",
  phone: "",
  location: "",
  current_role: "",
  experience_years: "",
};

const SKILL_SUGGESTIONS = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Java",
  "C#",
  "Python",
  "FastAPI",
  "Git",
  "GitHub",
  "REST API",
  "Figma",
  "Tailwind CSS",
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

function formatFileSize(sizeInBytes) {
  if (!sizeInBytes) return "Unknown size";

  const sizeInMb = sizeInBytes / (1024 * 1024);

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(2)} MB`;
  }

  return `${(sizeInBytes / 1024).toFixed(1)} KB`;
}

function getCvFileName(candidateProfile) {
  if (candidateProfile?.cv_file_name) {
    return candidateProfile.cv_file_name;
  }

  if (candidateProfile?.cv_url) {
    return `candidate-${candidateProfile.id || "profile"}-cv.pdf`;
  }

  return "Candidate CV";
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

function calculateProfileStrength(formData, skills, cvUrl) {
  let score = 10;

  if (normalizePhoneNumber(formData.phone)) score += 10;
  if (cleanText(formData.location)) score += 10;
  if (cleanText(formData.current_role)) score += 15;

  if (formData.experience_years !== "" && Number(formData.experience_years) >= 0) {
    score += 10;
  }

  if (getCleanSkillList(skills).length >= MIN_REQUIRED_SKILLS) score += 25;
  if (cvUrl) score += 20;

  return Math.min(score, 100);
}

function parseSkills(skillsText) {
  if (!skillsText) return [];

  return String(skillsText)
    .split(",")
    .map((skill) => cleanText(skill))
    .filter(Boolean);
}

function QuickActionLink({ href, icon, label, tone = "light" }) {
  const className =
    tone === "primary"
      ? "flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[#F7631E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#e85512]"
      : "flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[#F9FBFB] px-4 py-3 text-sm font-normal text-[#585958] transition hover:border-[#F7631E] hover:text-[#F7631E]";

  return (
    <Link href={href} className={className}>
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <FiExternalLink className="shrink-0" size={15} />
    </Link>
  );
}

function SkillsInput({ skills, setSkills, error, markTouched }) {
  const [skillInput, setSkillInput] = useState("");
  const [skillError, setSkillError] = useState("");

  function addSkill(rawSkill) {
    const cleanSkill = cleanText(rawSkill);

    setSkillError("");

    if (!cleanSkill) return;

    const validSkills = getCleanSkillList([cleanSkill]);

    if (!validSkills.length) {
      setSkillError(
        "Skill can use only letters, numbers, spaces, dot, #, slash, plus, hyphen, or brackets."
      );
      setSkillInput("");
      markTouched("skills");
      return;
    }

    const alreadyExists = skills.some(
      (skill) => skill.toLowerCase() === cleanSkill.toLowerCase()
    );

    if (alreadyExists) {
      setSkillInput("");
      markTouched("skills");
      return;
    }

    setSkills([...skills, cleanSkill]);
    setSkillInput("");
    markTouched("skills");
  }

  function removeSkill(skillToRemove) {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
    markTouched("skills");
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
    <div className="min-w-0">
      <label className={labelClass}>
        Skills <RequiredMark />
      </label>

      <div
        className={`mt-2 min-w-0 rounded-2xl border bg-white px-3 py-3 transition focus-within:border-[#F7631E] focus-within:ring-4 focus-within:ring-orange-50 ${
          error || skillError ? "border-red-300" : "border-slate-200"
        }`}
      >
        <div className="flex min-w-0 flex-wrap gap-2">
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
              setSkillInput(event.target.value);
              setSkillError("");
              markTouched("skills");
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => addSkill(skillInput)}
            placeholder={
              skills.length
                ? "Add more skills..."
                : `Add at least ${MIN_REQUIRED_SKILLS} skills`
            }
            className="min-w-[150px] flex-1 bg-transparent px-1 py-1.5 text-sm font-normal text-[#202020] outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      <p className="mt-2 text-xs font-normal text-slate-400">
        Minimum {MIN_REQUIRED_SKILLS} skills required. Example: React, JavaScript
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

function CandidateCvCard({
  candidateProfile,
  selectedCvFile,
  error,
  isUploading,
  onSelectClick,
  onUploadClick,
  onRemoveSelectedFile,
}) {
  const cvUrl = candidateProfile?.cv_url;
  const cvFileName = getCvFileName(candidateProfile);

  return (
    <div className="min-w-0">
      <label className={labelClass}>
        Candidate CV <RequiredMark />
      </label>

      <div
        className={`mt-2 min-w-0 rounded-3xl border bg-white p-4 transition ${
          error ? "border-red-300" : "border-slate-200"
        }`}
      >
        {cvUrl ? (
          <div className="min-w-0 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-green-700 text-white">
                  <FiFileText size={24} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    CV attached
                  </p>
                  <p className="mt-1 max-w-full break-all text-xs font-normal leading-5 text-green-700">
                    {cvFileName}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <SecureCvButton
                  cvUrl={cvUrl}
                  label="View CV"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-green-800"
                />

                <button
                  type="button"
                  onClick={onSelectClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-medium text-green-700 transition hover:bg-green-50"
                >
                  <FiUploadCloud />
                  Replace
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelectClick}
            className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-[#F9FBFB] px-5 py-8 text-center transition hover:border-[#F7631E] hover:bg-orange-50/40"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 text-[#F7631E]">
              <FiUploadCloud size={25} />
            </span>

            <span className="mt-3 text-sm font-medium text-[#202020]">
              Attach CV
            </span>

            <span className="mt-1 text-xs font-normal text-slate-400">
              PDF only. Maximum 5MB.
            </span>
          </button>
        )}

        {selectedCvFile ? (
          <div className="mt-4 min-w-0 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#202020]">
                  {selectedCvFile.name}
                </p>
                <p className="mt-1 text-xs font-normal text-[#585958]">
                  {formatFileSize(selectedCvFile.size)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onUploadClick}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F7631E] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {isUploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
                  {isUploading ? "Uploading..." : "Use this CV"}
                </button>

                <button
                  type="button"
                  onClick={onRemoveSelectedFile}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiX />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <FieldError message={error} />
    </div>
  );
}

export default function CandidateProfileCard() {
  const router = useRouter();
  const cvInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [skills, setSkills] = useState([]);
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCandidateProfile() {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    setErrorMessage("");

    try {
      setIsLoading(true);

      const user = await getCurrentUser();

      let profile;

      try {
        profile = await getMyCandidateProfile();
      } catch {
        profile = await activateCandidateProfile();
      }

      setCandidateProfile(profile);

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

  useEffect(() => {
    loadCandidateProfile();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    injectGooglePlacesDropdownStyles();

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setLocationError("Google Maps key is missing. You can still type location manually.");
      return;
    }

    let isMounted = true;

    async function initializeGooglePlaces() {
      try {
        await loadGoogleMapsScript(apiKey);

        if (!isMounted || !locationInputRef.current || !window.google?.maps?.places) {
          setLocationError("Location autocomplete could not load. You can type manually.");
          return;
        }

        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
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

  const profileStrength = useMemo(
    () => calculateProfileStrength(formData, skills, candidateProfile?.cv_url),
    [formData, skills, candidateProfile]
  );

  const validationErrors = useMemo(
    () => validateCandidateProfileForm(formData, skills),
    [formData, skills]
  );

  const visibleErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(
      ([field]) => touched[field] || submitAttempted
    )
  );

  const avatarLetter =
    formData.display_name?.trim()?.charAt(0)?.toUpperCase() ||
    formData.email?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  function markTouched(name) {
    setTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "display_name") {
      nextValue = sanitizeDisplayName(value);
    }

    if (name === "phone") {
      nextValue = normalizePhoneNumber(value).slice(0, 10);
    }

    if (name === "location") {
      nextValue = sanitizeLocation(value);
      setLocationError("");
    }

    if (name === "current_role") {
      nextValue = sanitizeCurrentRole(value);
    }

    if (name === "experience_years") {
      nextValue = sanitizeExperienceYears(value);
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: nextValue,
    }));

    markTouched(name);
  }

  function handleCvFileChange(event) {
    const file = event.target.files?.[0];

    setStatusMessage("");
    setErrorMessage("");

    if (!file) {
      setSelectedCvFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedCvFile(null);
      setErrorMessage("Only PDF CV files are supported right now.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedCvFile(null);
      setErrorMessage("CV file must be below 5MB.");
      return;
    }

    setSelectedCvFile(file);
  }

  async function handleUploadSelectedCv() {
    setStatusMessage("");
    setErrorMessage("");

    if (!selectedCvFile) {
      setErrorMessage("Please select a PDF CV first.");
      return null;
    }

    try {
      setIsUploadingCv(true);

      const uploadResult = await uploadCandidateCv(selectedCvFile);

      setCandidateProfile(uploadResult.candidate_profile);
      setSelectedCvFile(null);

      setFormData((currentData) => ({
        ...currentData,
        current_role:
          uploadResult.detected_current_role ||
          uploadResult.candidate_profile?.current_role ||
          currentData.current_role,
        experience_years:
          uploadResult.detected_experience_years !== undefined &&
          uploadResult.detected_experience_years !== null
            ? String(uploadResult.detected_experience_years)
            : currentData.experience_years,
      }));

      if (uploadResult.detected_skills) {
        setSkills(parseSkills(uploadResult.detected_skills));
        markTouched("skills");
      }

      if (cvInputRef.current) {
        cvInputRef.current.value = "";
      }

      setStatusMessage("CV attached. Please review your profile and save.");

      return uploadResult.candidate_profile;
    } catch (error) {
      setErrorMessage(error.message || "Could not attach CV.");
      return null;
    } finally {
      setIsUploadingCv(false);
    }
  }

  function removeSelectedCvFile() {
    setSelectedCvFile(null);

    if (cvInputRef.current) {
      cvInputRef.current.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitAttempted(true);
    setStatusMessage("");
    setErrorMessage("");

    const latestErrors = validateCandidateProfileForm(formData, skills);

    if (!candidateProfile?.cv_url && !selectedCvFile) {
      latestErrors.cv_url = "CV is required. Please attach your CV.";
    }

    if (Object.keys(latestErrors).length > 0) {
      setTouched({
        display_name: true,
        phone: true,
        location: true,
        current_role: true,
        experience_years: true,
        skills: true,
        cv_url: true,
      });

      setErrorMessage("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setIsSaving(true);

      let latestProfile = candidateProfile;

      if (selectedCvFile) {
        latestProfile = await handleUploadSelectedCv();

        if (!latestProfile) {
          return;
        }
      }

      const cleanSkills = getCleanSkillList(skills);

      const payload = {
        phone: normalizePhoneNumber(formData.phone),
        location: cleanText(formData.location),
        current_role: cleanText(formData.current_role),
        experience_years: Number(formData.experience_years),
        skills: cleanSkills.join(", "),
        cv_url: latestProfile?.cv_url || candidateProfile?.cv_url || null,
        profile_strength: profileStrength,
      };

      const updatedProfile = await updateMyCandidateProfile(payload);

      setCandidateProfile(updatedProfile);
      setSkills(parseSkills(updatedProfile.skills));

      updateStoredUser({
        name: cleanText(formData.display_name),
      });

      setStatusMessage("Profile saved. Redirecting to jobs...");

      setTimeout(() => {
        router.replace("/");
      }, 800);
    } catch (error) {
      setErrorMessage(error.message || "Could not save candidate profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="w-full overflow-x-hidden px-4 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-6xl overflow-hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-normal text-[#F7631E] transition hover:text-[#e85512]"
        >
          <FiArrowLeft />
          Back
        </button>

        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 md:p-6">
            <div className="text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-[#F7631E] text-4xl font-medium text-white ring-4 ring-orange-50 md:h-32 md:w-32">
                {avatarLetter}
              </div>

              <h1 className="mt-5 text-[26px] font-medium tracking-tight text-[#202020]">
                Candidate profile
              </h1>

              <p className="mx-auto mt-2 max-w-[260px] text-sm font-normal leading-6 text-[#585958]">
                Complete your details before applying to jobs.
              </p>
            </div>

            <div className="mt-7 rounded-3xl bg-[#F9FBFB] p-4">
              <div className="flex items-center justify-between gap-3">
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
                Phone, location, role, minimum 2 skills, and CV are required.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {candidateProfile?.cv_url ? (
                <SecureCvButton
                  cvUrl={candidateProfile.cv_url}
                  label="View CV"
                  className="flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-100"
                />
              ) : null}

              {!candidateProfile?.cv_url ? (
                <QuickActionLink
                  href="/candidate/upload-cv"
                  icon={<FiUploadCloud />}
                  label="Attach CV"
                />
              ) : null}

              <QuickActionLink
                href="/candidate/applications"
                icon={<FiBriefcase />}
                label="Applied jobs"
              />

              <QuickActionLink
                href="/"
                icon={<FiRefreshCw />}
                label="Browse jobs"
                tone="primary"
              />
            </div>

            {candidateProfile?.id ? (
              <p className="mt-5 break-all rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-normal text-slate-400">
                Profile ID: {candidateProfile.id}
              </p>
            ) : null}
          </aside>

          <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 md:p-8">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-normal text-[#F7631E]">
                <LuSparkles className="shrink-0" size={14} />
                <span className="truncate">Candidate workspace</span>
              </div>

              <p className="mt-5 text-sm font-normal uppercase tracking-[0.22em] text-[#F7631E]">
                Profile details
              </p>

              <h2 className="mt-2 text-[30px] font-medium tracking-tight text-[#202020] md:text-[38px]">
                Edit your candidate information
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#585958]">
                Required fields are marked with orange stars. Save your profile
                to start applying.
              </p>
            </div>

            {isLoading ? (
              <p className="mt-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-normal text-[#F7631E]">
                Loading candidate profile...
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 min-w-0 space-y-6">
                <div className="grid min-w-0 gap-5 md:grid-cols-2">
                  <div className="min-w-0">
                    <label className={labelClass}>
                      Display name <RequiredMark />
                    </label>
                    <div className="relative mt-2 min-w-0">
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

                  <div className="min-w-0">
                    <label className={labelClass}>Email</label>
                    <input
                      value={formData.email}
                      readOnly
                      className="mt-2 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-400 outline-none"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>
                      Mobile number <RequiredMark />
                    </label>
                    <div className="relative mt-2 min-w-0">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={() => markTouched("phone")}
                        placeholder="0701234000"
                        inputMode="numeric"
                        maxLength={10}
                        className={`${inputClass} pl-11 ${
                          visibleErrors.phone ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                    </div>
                    <FieldError message={visibleErrors.phone} />
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>
                      Location <RequiredMark />
                    </label>
                    <div className="relative mt-2 min-w-0">
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

                  <div className="min-w-0">
                    <label className={labelClass}>
                      Current role <RequiredMark />
                    </label>
                    <div className="relative mt-2 min-w-0">
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

                  <div className="min-w-0">
                    <label className={labelClass}>
                      Experience years <RequiredMark />
                    </label>
                    <input
                      name="experience_years"
                      type="text"
                      inputMode="numeric"
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
                  setSkills={setSkills}
                  error={visibleErrors.skills}
                  markTouched={markTouched}
                />

                <CandidateCvCard
                  candidateProfile={candidateProfile}
                  selectedCvFile={selectedCvFile}
                  error={visibleErrors.cv_url}
                  isUploading={isUploadingCv}
                  onSelectClick={() => cvInputRef.current?.click()}
                  onUploadClick={handleUploadSelectedCv}
                  onRemoveSelectedFile={removeSelectedCvFile}
                />

                <input
                  ref={cvInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
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
                    <FiCheckCircle className="mr-2 inline" />
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
                    disabled={isSaving || isUploadingCv}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F7631E] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#e85512] disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                    {isSaving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}