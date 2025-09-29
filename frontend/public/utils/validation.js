import { showToast } from "../components/toast.js";
export function isFormEmpty(form) {
  const inputs = form.querySelectorAll("input, textarea, select");
  for (let input of inputs) {
    if (input.type !== "submit" && input.value.trim() === "") {
      return true; //if any of the field is empty
    }
  }
  return false; // not found any emty field
}

export function validateJobForm(job_data) {
  // Config: field_name → friendly label
  const requiredFields = {
    job_title: "Job title",
    company_name: "Company name",
    location: "Location",
    experience_required: "Experience Required",
  };

  // Convert FormData to object
  const formObj = Object.fromEntries(job_data.entries());

  // Check if entire form is empty
  if (Object.values(formObj).every((val) => val.trim() === "")) {
    showToast("Please fill the form before submitting.", "error");
    return true;
  }

  // Validate required fields
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!formObj[field] || formObj[field].trim() === "") {
      showToast(`${label} is required`, "error");
      return true; // stop at first error
    }
  }

  return false;
}
