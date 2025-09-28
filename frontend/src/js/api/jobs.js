/**
 * Job API Client Module
 *
 * This module provides a set of functions for interacting with the Job-related
 * backend endpoints. It abstracts away authentication and token-refresh logic
 * by consistently using {@link authorizedFetch}.
 *
 * Responsibilities:
 * - Create, read, update, and delete job records from the backend service.
 * - Ensure all API calls are authorized (via bearer tokens).
 * - Provide a normalized response shape (`success`, `data`, `message`) to simplify
 *   error handling and UI integration.
 *
 * Typical Usage:
 * ```js
 * import { createJob, readJob, updateJobById, deleteJobById } from "./jobApi.js";
 *
 * const response = await createJob(formData);
 * if (response.success) {
 *   console.log("Job created:", response.data);
 * } else {
 *   console.error("Error:", response.message);
 * }
 * ```
 *
 * Notes:
 * - Consumers must always check the `success` flag before using `data`.
 * - The API internally relies on {@link authorizedFetch} (see `utils.js`) for
 *   authentication and consistent network error handling.
 */

import { authorizedFetch } from "./utils.js";

/**
 * Create a new job entry in the backend.
 *
 * Issues a POST request with job details to `/jobs/`.
 * Relies on {@link authorizedFetch} for authentication and token refresh.
 *
 * @async
 * @function createJob
 * @param {FormData} job_data - The job data collected from a form, including files and fields.
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 *   - success: Indicates whether the request completed successfully.
 *   - data: Response payload from backend when successful.
 *   - message: Error message if the operation failed.
 *
 * @example
 * const formData = new FormData();
 * formData.append("title", "Software Engineer");
 * const res = await createJob(formData);
 */
export async function createJob(job_data) {
  return await authorizedFetch("/jobs/", {
    method: "POST",
    body: job_data,
  });
}

/**
 * Retrieve all jobs for the authenticated user.
 *
 * Issues a GET request to `/jobs/`.
 * Relies on {@link authorizedFetch} for authentication and token refresh.
 *
 * @async
 * @function readJob
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 *   - success: True if the request succeeded.
 *   - data: List of jobs or metadata from backend.
 *   - message: Error details if the fetch failed.
 *
 * @example
 * const res = await readJob();
 * if (res.success) console.log(res.data);
 */
export async function readJob() {
  return await authorizedFetch("/jobs/", {
    method: "GET",
  });
}

/**
 * Delete a job by its unique identifier.
 *
 * Issues a DELETE request to `/jobs/{job_id}/`.
 * Relies on {@link authorizedFetch} for authentication and token refresh.
 *
 * @async
 * @function deleteJobById
 * @param {string|number} job_id - Unique identifier of the job to delete.
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 *   - success: True if deletion was successful.
 *   - data: Optional backend response (may be null).
 *   - message: Error message if deletion failed.
 *
 * @example
 * await deleteJobById(42);
 */
export async function deleteJobById(job_id) {
  const delete_url = `/jobs/${job_id}/`;
  return await authorizedFetch(delete_url, {
    method: "DELETE",
  });
}

/**
 * Update an existing job by its unique identifier.
 *
 * Issues a PATCH request to `/jobs/{job_id}/` with partial job details.
 * Useful for editing specific fields without overwriting the entire record.
 * Relies on {@link authorizedFetch} for authentication and token refresh.
 *
 * @async
 * @function updateJobById
 * @param {string|number} job_id - Unique identifier of the job to update.
 * @param {FormData|Object} job_data - Updated job data. Supports both JSON and FormData (e.g., for file uploads).
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 *   - success: True if update succeeded.
 *   - data: Updated job details returned by backend.
 *   - message: Error details if the update failed.
 *
 * @example
 * const formData = new FormData();
 * formData.append("title", "Senior Engineer");
 * const res = await updateJobById(42, formData);
 */
export async function updateJobById(job_id, job_data) {
  const update_url = `/jobs/${job_id}/`;
  return await authorizedFetch(update_url, {
    method: "PATCH",
    body: job_data,
  });
}
