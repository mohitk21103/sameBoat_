import { createJob } from "../api/jobs.js";
import { showToast } from "../../components/toast.js";
import { setFlash } from "../../components/flash.js";
import { validateJobForm } from "../../utils/validation.js";
import { readFlash } from "../../components/flash.js";

/**
 * Initialize the "Add Job" form submission logic.
 * Handles form validation, API call, and user feedback.
 */
export async function initAddJob() {
  
  const form = document.getElementById("addJob-form");

  if (!form) return;

  // Handle job submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const job_data = get_AddJobData(form);

    // validate job form
    if (validateJobForm(job_data)) {
      return;
    }

    const res = await createJob(job_data);

    if (res.success) {
      setFlash("Job added successfully", "success");
    } else {
      if (res.message === "Failed to fetch") {
        showToast("Unable to connect. Please try again later.", "error");
      } else {
        console.log(res?.message);
        showToast("something went wrong", "error");
      }
    }
  });

  const flash = readFlash();
  if (flash) {
    showToast(flash.message, flash.type, flash.duration);
  }
}

export function get_AddJobData(form) {
  const formData = new FormData();

  for (let [key, value] of new FormData(form).entries()) {
    if (value instanceof File) {
      if (value.size > 0) {
        formData.append(key, value);
      }
    } else {
      if (key === "skills" || key === "notes") {
        let arr = value
          ? value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0)
          : [];

        arr.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    }
  }

  return formData;
}
