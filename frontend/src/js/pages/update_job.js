import { setFlash } from "../../components/flash.js";
import { showToast } from "../../components/toast.js";
import { updateJobById } from "../api/jobs.js";
import { get_AddJobData } from "./add_job.js";

export async function initUpdateJob() {
    
  const jobData = JSON.parse(localStorage.getItem("JobToUpdate"));
  if (!jobData) return;
  

  const job_form = document.getElementById("updateJob-form");

  if (!job_form) return;

  autoFillJobData(jobData);

  job_form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const job_id = urlParams.get("job_id");
    const updated_job_data = get_AddJobData(job_form);

    console.log(updated_job_data);
    

    try {
      const res = await updateJobById(job_id, updated_job_data);

      if (res.success) {
        setFlash("Job updated successfully", "success")
        localStorage.removeItem("JobToUpdate");
        
        window.location.href = "job_sheet.html";
      } else {
        
        console.error("Update failed:", res.message);
        showToast(`Update failed`,"error");
      }
    } catch (error) {
      console.log("Error in updating job:", error.message);
      showToast("Unexpected error while updating the job. Please try again.", "error");
    }
  });
}



function autoFillJobData(jobData = {}) {
  // Map jobData keys to DOM elements & type
  const fieldMap = {
    job_title: { id: "job_title", type: "input" },
    company_name: { id: "company_name", type: "input" },
    location: { id: "location", type: "input" },
    employment_type: { id: "employment_type", type: "input" },
    experience_required: { id: "experience_required", type: "input" },
    job_url: { id: "job_url", type: "input" },
    applied_date: { id: "applied_date", type: "input" },
    skills: { id: "skills", type: "array" },
    notes: { id: "notes", type: "array" },
    cover_letter_url: { id: "last-cover_letter", type: "link" },
    resume_url: { id: "last-resume-link", type: "link" },
  };

  // Loop through mapping
  Object.entries(fieldMap).forEach(([key, { id, type }]) => {
    const value = jobData[key];
    const element = document.getElementById(id);

    if (!element || value == null || !value.length) return; // skip if missing

    switch (type) {
      case "input":
        element.value = value;
        break;
      case "array":
        if (Array.isArray(value)) {
          element.value = value.join(", ");
        }
        break;
      case "link":
        element.innerHTML = `<a href="${value}" target="_blank" class="underline">View Last Uploaded</a>`;
        break;
    }
  });
}
