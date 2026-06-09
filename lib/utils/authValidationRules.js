const EMAIL_ALLOWED_PATTERN = /^[A-Za-z0-9@._+-]*$/;
const EMAIL_FULL_PATTERN = /^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function cleanAuthText(value) {
  return String(value || "").trim();
}

export function sanitizeEmail(value) {
  return String(value || "")
    .replace(/\s/g, "")
    .replace(/[^A-Za-z0-9@._+-]/g, "")
    .toLowerCase();
}

export function getEmailValidationError(email) {
  const cleanEmail = cleanAuthText(email);

  if (!cleanEmail) {
    return "Email is required.";
  }

  if (!EMAIL_ALLOWED_PATTERN.test(cleanEmail)) {
    return "Email can only use letters, numbers, @, dot, underscore, plus, or hyphen.";
  }

  if ((cleanEmail.match(/@/g) || []).length !== 1) {
    return "Email must contain one @ symbol.";
  }

  if (!EMAIL_FULL_PATTERN.test(cleanEmail)) {
    return "Enter a valid email address. Example: name@example.com";
  }

  return "";
}

export function getPasswordChecks(password) {
  const value = String(password || "");

  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
}

export function getPasswordStrength(password) {
  const checks = getPasswordChecks(password);
  const passedCount = Object.values(checks).filter(Boolean).length;

  if (!password) {
    return {
      label: "Empty",
      score: 0,
      barWidth: "0%",
      className: "bg-slate-200",
      textClassName: "text-slate-400",
    };
  }

  if (passedCount <= 2) {
    return {
      label: "Low",
      score: passedCount,
      barWidth: "33%",
      className: "bg-red-500",
      textClassName: "text-red-600",
    };
  }

  if (passedCount <= 4) {
    return {
      label: "Medium",
      score: passedCount,
      barWidth: "66%",
      className: "bg-yellow-500",
      textClassName: "text-yellow-700",
    };
  }

  return {
    label: "Strong",
    score: passedCount,
    barWidth: "100%",
    className: "bg-green-600",
    textClassName: "text-green-700",
  };
}

export function getPasswordValidationError(password) {
  const value = String(password || "");
  const checks = getPasswordChecks(value);

  if (!value) {
    return "Password is required.";
  }

  if (!checks.length) {
    return "Password must be at least 8 characters.";
  }

  if (!checks.uppercase) {
    return "Password must include at least one uppercase letter.";
  }

  if (!checks.lowercase) {
    return "Password must include at least one lowercase letter.";
  }

  if (!checks.number) {
    return "Password must include at least one number.";
  }

  if (!checks.symbol) {
    return "Password must include at least one symbol.";
  }

  return "";
}

export function getNameValidationError(name) {
  const cleanName = cleanAuthText(name);

  if (!cleanName) {
    return "Name is required.";
  }

  if (cleanName.length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (!/^[A-Za-z ]+$/.test(cleanName)) {
    return "Name can only use letters and spaces.";
  }

  return "";
}