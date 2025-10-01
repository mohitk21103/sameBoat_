import { readJob } from "../api/jobs.js";
import { deleteJobById } from "../api/jobs.js";
import { UPDATE_URL } from "../../utils/constants.js";
import { readFlash, setFlash } from "../../components/flash.js";
import { showToast } from "../../components/toast.js";

export async function initJobsheet() {
  // show flash if any  present
  const flash = readFlash();
  if (flash) {
    showToast(flash.message, flash.type, flash.duration);
  }

  let job_data = null;

  // fetching user jobs
  try {
    job_data = await load_CurrentUser_JobData();

    if (job_data) {
      renderJobs(job_data);
    }
  } catch (error) {
    console.error("Job fetch error:", error.message);
    showToast("Not able to fetch the job", "error");
  }

  // Refresh button
  const refreshBtn = document.getElementById("refresh-jobs");
  refreshBtn.addEventListener("click", async () => {
    try {
      const data = await load_CurrentUser_JobData(); // your existing method
      if (data) renderJobs(data);
    } catch (e) {
      showToast("Failed to refresh jobs", "error");
    }
  });
}

async function load_CurrentUser_JobData() {
  try {
    const res = await readJob();

    if (!res.success) {
      showToast(res?.message, "error");
      return null;
    }

    return res.data;
  } catch (error) {
    console.error("Job loading error:", error.message);
    showToast("Failed to load the job data", "error");
    return null;
  }
}

export function renderJobs(job_data) {
  const container = document.getElementById("jobs-container");
  const searchInput = document.getElementById("job-search");
  const refreshBtn = document.getElementById("refresh-jobs");

  if (!container) {
    console.warn("No container with id='jobs-container' found in DOM");
    return;
  }

  // Helper: compute dashboard stats from job_data
  function computeStats(jobs) {
    const stats = {
      applied: jobs.length,
      active: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      rejected: 0,
    };

    jobs.forEach((j) => {
      // prefer the more explicit fields if present
      const s = (j.current_status || j.status || "").toString().toLowerCase();
      if (j.is_active) stats.active++;
      if (s.includes("short")) stats.shortlisted++;
      if (s.includes("interview")) stats.interviewed++;
      if (s.includes("offer")) stats.offered++;
      if (s.includes("reject")) stats.rejected++;
    });

    return stats;
  }

  // write stats into DOM
  function updateDashboard(jobs) {
    const s = computeStats(jobs);
    const setIfExists = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };
    setIfExists("stat-applied", s.applied);
    setIfExists("stat-active", s.active);
    setIfExists("stat-shortlisted", s.shortlisted);
    setIfExists("stat-interviewed", s.interviewed);
    setIfExists("stat-offered", s.offered);
    setIfExists("stat-rejected", s.rejected);
  }

  // Render list of jobs in container
  function displayJobs(list) {
    container.innerHTML = "";

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="w-full rounded-lg p-6 bg-[#0b1220] border border-gray-800 text-center">
          <p class="text-gray-300">No jobs found. Add a job to get started.</p>
        </div>
      `;
      return;
    }

    // create cards
    list.forEach((job) => {
      // prepare badge color by status
      const statusStr = (job.current_status || job.status || "").toString();
      const lower = statusStr.toLowerCase();
      let statusClasses = "bg-gray-500 text-white";
      if (job.is_active) statusClasses = "bg-emerald-500 text-black";
      else if (lower.includes("short"))
        statusClasses = "bg-yellow-400 text-black";
      else if (lower.includes("interview"))
        statusClasses = "bg-purple-500 text-white";
      else if (lower.includes("offer"))
        statusClasses = "bg-indigo-500 text-white";
      else if (lower.includes("reject"))
        statusClasses = "bg-rose-500 text-white";

      const sanitizedSkills = Array.isArray(job.skills)
        ? job.skills.join(", ")
        : job.skills || "";

      const card = document.createElement("div");
      card.className =
        "job-item w-full rounded-2xl border border-gray-800 overflow-hidden shadow-lg transform transition hover:-translate-y-1";
      card.id = job.job_id;

      card.innerHTML = `
        <div class="bg-gradient-to-r from-[#0f1724] to-[#1f2937] p-5">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 class="text-2xl font-semibold text-white">${escapeHtml(
                job.job_title
              )} <span class="text-gray-400 text-sm">at ${escapeHtml(
        job.company_name || ""
      )}</span></h3>
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <span class="${statusClasses} px-3 py-1 rounded-full text-sm font-medium">${
        job.is_active ? "Active : Yes" : `Active : No`
      }</span>

              ${
                job.job_url
                  ? `<a href="${job.job_url}" target="_blank" rel="noopener"
                        class="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-800 text-white text-sm px-3 py-1 rounded-lg transition"
                        title="Opens the original job listing or company’s page in a new tab">
                        View Job on Company Site 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.828 10.172a4 4 0 010 5.656l-4.95 4.95a4 4 0 01-5.657-5.657l4.95-4.95m1.415-1.414a4 4 0 015.657 0l4.95 4.95a4 4 0 01-5.657 5.657l-4.95-4.95" />
                        </svg>
                      </a>`
                  : `<span class="inline-block bg-gray-700 text-gray-200 text-sm px-3 py-1 rounded-lg"
                      title="No external job link was provided">
                      No Job Link Available
                    </span>`
              }


              <button class="show-detail-btn bg-blue-700 hover:bg-blue-900 text-white text-sm px-3 py-1 rounded-lg transition">Show Details</button>
              <button class="update-job-btn bg-indigo-600 hover:bg-indigo-800 text-white text-sm px-3 py-1 rounded-lg transition">Update Job</button>
              <button class="job-delete-btn bg-rose-600 hover:bg-rose-800 text-white text-sm px-3 py-1 rounded-lg transition">Delete</button>
            </div>
          </div>
        </div>

        <div class="detail-grid max-h-0 overflow-hidden transition-all duration-300 bg-gray-800 dark:bg-gray-800  grid gap-4 md:grid-cols-3 text-gray-900 dark:text-gray-100 pl-5 pr-5">
          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Experience Required</div>
            <div class="font-semibold mt-1">${
              job.experience_required ?? "N/A"
            } years</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Applied Date</div>
            <div class="font-semibold mt-1">${
              job.applied_date ?? "No date provided"
            }</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Cover Letter</div>
            <div class="mt-1">${
              job.cover_letter_url
                ? `<a href="${job.cover_letter_url}" target="_blank" class="text-blue-600 hover:underline">View</a>`
                : '<span class="italic text-gray-600">Not Provided</span>'
            }</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Employment Type</div>
            <div class="font-semibold mt-1">${escapeHtml(
              job.employment_type
            )}</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Current Status</div>
            <div class="font-semibold mt-1">${escapeHtml(
              job.current_status
            )}</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Required Skills</div>
            <div class="mt-1">${escapeHtml(sanitizedSkills)}</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Location</div>
            <div class="font-semibold mt-1">${escapeHtml(job.location)}</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Submitted Resume</div>
            <div class="mt-1">${
              job.resume_url
                ? `<a href="${job.resume_url}" target="_blank" class="text-blue-600 hover:underline">View</a>`
                : '<span class="italic text-gray-600">Not Provided</span>'
            }</div>
          </div>

          <div class="p-4 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div class="text-sm text-gray-600 dark:text-gray-300">Notes</div>
            <div class="mt-1">${
              Array.isArray(job.notes) && job.notes.length
                ? `<ul class="list-disc list-inside">${job.notes
                    .map((n) => `<li>${escapeHtml(n)}</li>`)
                    .join("")}</ul>`
                : '<span class="italic text-gray-600">Not Added</span>'
            }</div>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }

  // small HTML escape helper to avoid accidental injections if any
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // Initial UI population and dashboard update
  updateDashboard(job_data);
  displayJobs(job_data);

  // SEARCH: live filter
  if (searchInput) {
    searchInput.value = ""; // clear existing
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        displayJobs(job_data);
        updateDashboard(job_data);
        return;
      }

      const filtered = job_data.filter((job) => {
        const hay = [
          job.job_title,
          job.company_name,
          job.location,
          Array.isArray(job.skills) ? job.skills.join(" ") : job.skills,
          job.current_status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(q);
      });

      displayJobs(filtered);
      updateDashboard(filtered);
    });
  }

  // Refresh button: dispatch a custom event 'jobs:refresh' so your existing loader can handle it
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      // visible feedback
      refreshBtn.classList.add("animate-pulse");
      setTimeout(() => refreshBtn.classList.remove("animate-pulse"), 700);

      // custom event — keep separation of concerns: your existing initJobsheet can listen to this
      const evt = new CustomEvent("jobs:refresh");
      window.dispatchEvent(evt);
    });
  }

  // Event delegation for buttons (delete / update / show details)
  container.addEventListener("click", async (event) => {
    const jobCard = event.target.closest(".job-item");
    if (!jobCard) return;
    const jobId = jobCard.getAttribute("id");

    // --- Delete job ---
    if (event.target.classList.contains("job-delete-btn")) {
      const response = await deleteJobById(jobId);
      if (response.success) {
        showToast("Job deleted successfully", "success");
        // Remove the job card from the DOM
        if (jobCard && jobCard.parentNode) {
          jobCard.parentNode.removeChild(jobCard);
        }
        // Optionally, remove from job_data array in memory so search/stats update correctly
        const idx = job_data.findIndex((job) => job.job_id === jobId);
        if (idx !== -1) {
          job_data.splice(idx, 1);
        }
        // Update dashboard stats after deletion
        updateDashboard(job_data);
      } else {
        console.error(
          `error while deletion: ${response?.message}`,
          response.data,
          "error"
        );
        showToast("Unable to delete the job", "error");
      }
    }

    // --- Update job ---
    else if (event.target.classList.contains("update-job-btn")) {
      // use job_data from outer scope as before
      const selectedJob = job_data.find((job) => job.job_id === jobId);
      if (!selectedJob) {
        console.error("Job not found in job_data for id:", jobId);
        return;
      }
      localStorage.setItem("JobToUpdate", JSON.stringify(selectedJob));
      window.location.href = `${UPDATE_URL}?job_id=${jobId}`;
    }

    // --- Show/Hide details with animated expand ---
    else if (event.target.classList.contains("show-detail-btn")) {
      const detailContainer = jobCard.querySelector(".detail-grid");
      if (!detailContainer) return;

      // animate height: toggle between 0 and scrollHeight
      const isHidden =
        detailContainer.style.maxHeight === "" ||
        detailContainer.style.maxHeight === "0px" ||
        detailContainer.classList.contains("closed");
      if (isHidden) {
        // open
        detailContainer.classList.remove("closed");
        detailContainer.style.maxHeight = detailContainer.scrollHeight + "px";
        detailContainer.classList.add("animate-slideDown", "animate-fadeIn");
        // remove animation classes shortly after to allow re-add later
        setTimeout(() => {
          detailContainer.classList.remove(
            "animate-slideDown",
            "animate-fadeIn"
          );
        }, 300);
        // change button text
        event.target.innerText = "Hide Details";
      } else {
        // close
        detailContainer.style.maxHeight = "0px";
        detailContainer.classList.add("closed");
        event.target.innerText = "Show Details";
      }
    }
  });

  // ensure details closed initially (in case)
  document.querySelectorAll(".detail-grid").forEach((d) => {
    d.style.maxHeight = "0px";
    d.classList.add("closed");
  });
}
