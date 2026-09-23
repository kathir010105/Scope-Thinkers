export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

// ============================================================
// FILE VALIDATION
// ============================================================

export const validateFile = (file, fieldName) => {
  if (!file) {
    return `${fieldName} is required`;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `${fieldName} must be JPG, JPEG or PNG`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${fieldName} must be less than 2 MB`;
  }

  return "";
};

// ============================================================
// FORM VALIDATION
// ============================================================

export const validateForm = (formData) => {
  const errors = {};

  // --------------------------------------------------------
  // Full Name
  // --------------------------------------------------------

  if (!formData.full_name.trim()) {
    errors.full_name = "Full name is required";
  } else if (formData.full_name.trim().length < 3) {
    errors.full_name = "Full name must contain at least 3 characters";
  }

  // --------------------------------------------------------
  // Date of Birth
  // --------------------------------------------------------

  if (!formData.date_of_birth) {
    errors.date_of_birth = "Date of birth is required";
  } else {
    const selectedDate = new Date(formData.date_of_birth);
    const today = new Date();

    if (selectedDate > today) {
      errors.date_of_birth = "Date of birth cannot be in the future";
    }
  }

  // --------------------------------------------------------
  // Gender
  // --------------------------------------------------------

  if (!formData.gender) {
    errors.gender = "Please select your gender";
  }

  // --------------------------------------------------------
  // Email
  // --------------------------------------------------------

  if (!formData.email.trim()) {
    errors.email = "Email address is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
  }

  // --------------------------------------------------------
  // Mobile
  // --------------------------------------------------------

  if (!formData.mobile.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number";
  }

  // --------------------------------------------------------
  // Address
  // --------------------------------------------------------

  if (!formData.address.trim()) {
    errors.address = "Address is required";
  }

  // --------------------------------------------------------
  // City
  // --------------------------------------------------------

  if (!formData.city.trim()) {
    errors.city = "City is required";
  }

  // --------------------------------------------------------
  // State
  // --------------------------------------------------------

  if (!formData.state.trim()) {
    errors.state = "State is required";
  }

  // --------------------------------------------------------
  // Pincode
  // --------------------------------------------------------

  if (!formData.pincode.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(formData.pincode)) {
    errors.pincode = "Pincode must contain exactly 6 digits";
  }

  // --------------------------------------------------------
  // Occupation
  // --------------------------------------------------------

  if (!formData.occupation.trim()) {
    errors.occupation = "Occupation is required";
  }

  // --------------------------------------------------------
  // Annual Income
  // --------------------------------------------------------

  if (formData.annual_income === "") {
    errors.annual_income = "Annual income is required";
  } else if (Number(formData.annual_income) < 0) {
    errors.annual_income = "Annual income cannot be negative";
  }

  // --------------------------------------------------------
  // Employment Type
  // --------------------------------------------------------

  if (!formData.employment_type) {
    errors.employment_type = "Please select employment type";
  }

  // --------------------------------------------------------
  // Aadhaar
  // --------------------------------------------------------

  if (!formData.aadhaar_number.trim()) {
    errors.aadhaar_number = "Aadhaar number is required";
  } else if (!/^\d{12}$/.test(formData.aadhaar_number)) {
    errors.aadhaar_number = "Aadhaar number must contain exactly 12 digits";
  }

  // --------------------------------------------------------
  // PAN
  // --------------------------------------------------------

  if (!formData.pan_number.trim()) {
    errors.pan_number = "PAN number is required";
  } else if (
    !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan_number.toUpperCase())
  ) {
    errors.pan_number = "Enter a valid PAN format (e.g. ABCDE1234F)";
  }

  // --------------------------------------------------------
  // Parent / Guardian
  // --------------------------------------------------------

  if (!formData.parent_name.trim()) {
    errors.parent_name = "Parent / guardian name is required";
  }

  // --------------------------------------------------------
  // Nationality
  // --------------------------------------------------------

  if (!formData.nationality) {
    errors.nationality = "Please select nationality";
  }

  // --------------------------------------------------------
  // Marital Status
  // --------------------------------------------------------

  if (!formData.marital_status) {
    errors.marital_status = "Please select marital status";
  }

  // --------------------------------------------------------
  // KYC Purpose
  // --------------------------------------------------------

  if (!formData.kyc_purpose) {
    errors.kyc_purpose = "Please select the KYC purpose";
  }

  // --------------------------------------------------------
  // Aadhaar File
  // --------------------------------------------------------

  const aadhaarFileError = validateFile(
    formData.aadhaar_file,
    "Aadhaar document",
  );

  if (aadhaarFileError) {
    errors.aadhaar_file = aadhaarFileError;
  }

  // --------------------------------------------------------
  // PAN File
  // --------------------------------------------------------

  const panFileError = validateFile(formData.pan_file, "PAN document");

  if (panFileError) {
    errors.pan_file = panFileError;
  }

  return errors;
};
