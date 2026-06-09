export const MIN_REQUIRED_SKILLS = 2;

const DISPLAY_NAME_PATTERN = /^[A-Za-z ]+$/;
const LOCATION_PATTERN = /^[A-Za-z0-9 ,./-]+$/;
const ROLE_PATTERN = /^[A-Za-z0-9 .#/+()-]+$/;
const SKILL_PATTERN = /^[A-Za-z0-9 .#/+()-]+$/;
const SRI_LANKAN_MOBILE_PATTERN = /^0[0-9]{9}$/;

export function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function normalizePhoneNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

export function sanitizeDisplayName(value) {
  return String(value || "").replace(/[^A-Za-z ]/g, "").replace(/\s+/g, " ");
}

export function sanitizeLocation(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 ,./-]/g, "")
    .replace(/\s+/g, " ");
}

export function sanitizeCurrentRole(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9 .#/+()-]/g, "")
    .replace(/\s+/g, " ");
}

export function sanitizeExperienceYears(value) {
  return String(value || "").replace(/[^0-9]/g, "").slice(0, 2);
}

export function parseSkills(skillsText) {
  if (!skillsText) return [];

  return String(skillsText)
    .split(",")
    .map((skill) => cleanText(skill))
    .filter(Boolean);
}

export function isValidDisplayName(value) {
  const cleanValue = cleanText(value);

  if (!cleanValue) return false;
  if (cleanValue.length < 2 || cleanValue.length > 120) return false;

  return DISPLAY_NAME_PATTERN.test(cleanValue);
}

export function isValidLocation(value) {
  const cleanValue = cleanText(value);

  if (!cleanValue) return false;
  if (cleanValue.length < 2 || cleanValue.length > 120) return false;

  return LOCATION_PATTERN.test(cleanValue);
}

export function isValidCurrentRole(value) {
  const cleanValue = cleanText(value);

  if (!cleanValue) return false;
  if (cleanValue.length < 2 || cleanValue.length > 120) return false;

  return ROLE_PATTERN.test(cleanValue);
}

export function isValidSriLankanMobile(value) {
  const phone = normalizePhoneNumber(value);

  return SRI_LANKAN_MOBILE_PATTERN.test(phone);
}

export function isValidSkill(value) {
  const cleanValue = cleanText(value);

  if (!cleanValue) return false;
  if (cleanValue.length < 2 || cleanValue.length > 60) return false;

  return SKILL_PATTERN.test(cleanValue);
}

export function getCleanSkillList(skills) {
  const skillList = Array.isArray(skills) ? skills : parseSkills(skills);
  const uniqueSkills = [];

  skillList.forEach((skill) => {
    const cleanSkill = cleanText(skill);

    if (!isValidSkill(cleanSkill)) return;

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

export function validateCandidateProfileForm(formData, skills) {
  const errors = {};
  const cleanSkills = getCleanSkillList(skills);
  const cleanPhone = normalizePhoneNumber(formData.phone);

  if (!isValidDisplayName(formData.display_name)) {
    errors.display_name =
      "Name is required. Use only letters and spaces.";
  }

  if (!SRI_LANKAN_MOBILE_PATTERN.test(cleanPhone)) {
    errors.phone = "Enter a valid 10-digit mobile number. Example: 0701234000";
  }

  if (!isValidLocation(formData.location)) {
    errors.location =
      "Location is required. Use only letters, numbers, spaces, comma, dot, slash, or hyphen.";
  }

  if (!isValidCurrentRole(formData.current_role)) {
    errors.current_role =
      "Current role is required. Avoid symbols like %, $, &, *, or brackets.";
  }

  if (
    formData.experience_years === "" ||
    formData.experience_years === null ||
    formData.experience_years === undefined
  ) {
    errors.experience_years = "Experience years is required.";
  } else if (
    Number.isNaN(Number(formData.experience_years)) ||
    Number(formData.experience_years) < 0 ||
    Number(formData.experience_years) > 60
  ) {
    errors.experience_years = "Experience must be between 0 and 60 years.";
  }

  if (cleanSkills.length < MIN_REQUIRED_SKILLS) {
    errors.skills = `Add at least ${MIN_REQUIRED_SKILLS} valid skills.`;
  }

  return errors;
}

export function getCandidateProfileCompletionIssues(candidateProfile) {
  const issues = [];

  if (!candidateProfile) {
    return ["Candidate profile is missing."];
  }

  const phone = normalizePhoneNumber(candidateProfile.phone);
  const skills = getCleanSkillList(candidateProfile.skills);
  const experienceValue = candidateProfile.experience_years;

  if (!candidateProfile.cv_url) {
    issues.push("CV is missing.");
  }

  if (!SRI_LANKAN_MOBILE_PATTERN.test(phone)) {
    issues.push("Phone number must be a valid 10-digit number like 0701234000.");
  }

  if (!isValidLocation(candidateProfile.location)) {
    issues.push("Location is missing or contains invalid symbols.");
  }

  if (!isValidCurrentRole(candidateProfile.current_role)) {
    issues.push("Current role is missing or contains invalid symbols.");
  }

  if (
    experienceValue === null ||
    experienceValue === undefined ||
    Number.isNaN(Number(experienceValue)) ||
    Number(experienceValue) < 0 ||
    Number(experienceValue) > 60
  ) {
    issues.push("Experience years must be between 0 and 60.");
  }

  if (skills.length < MIN_REQUIRED_SKILLS) {
    issues.push(`At least ${MIN_REQUIRED_SKILLS} valid skills are required.`);
  }

  return issues;
}

export function isCandidateProfileComplete(candidateProfile) {
  return getCandidateProfileCompletionIssues(candidateProfile).length === 0;
}