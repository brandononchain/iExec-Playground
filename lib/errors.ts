export type AppErrorCode =
  | "UPLOAD_FAILED"
  | "JOB_TIMEOUT"
  | "PROOF_NOT_AVAILABLE"
  | "NETWORK_ERROR"
  | "SUBMIT_FAILED"
  | "DECRYPT_FAILED"
  | "RESULT_DOWNLOAD_FAILED";

const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  UPLOAD_FAILED: "Upload failed. Please try again.",
  JOB_TIMEOUT: "Job timed out. Please try again later.",
  PROOF_NOT_AVAILABLE: "Proof not available yet. Please check back soon.",
  NETWORK_ERROR: "Network error. Check your connection and retry.",
  SUBMIT_FAILED: "Submit failed. Please retry.",
  DECRYPT_FAILED: "Decryption failed. Ensure the key and IV are correct.",
  RESULT_DOWNLOAD_FAILED: "Failed to download result. Please retry."
};

export function getErrorMessage(code: AppErrorCode, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? "Something went wrong.";
}

export function toAppErrorCode(err: unknown): AppErrorCode {
  const msg = typeof err === "string" ? err : (err as Error | undefined)?.message ?? "";
  const low = msg.toLowerCase();
  if (low.includes("decrypt")) return "DECRYPT_FAILED";
  if (low.includes("upload")) return "UPLOAD_FAILED";
  if (low.includes("timeout")) return "JOB_TIMEOUT";
  if (low.includes("proof")) return "PROOF_NOT_AVAILABLE";
  if (low.includes("download") || low.includes("fetch")) return "RESULT_DOWNLOAD_FAILED";
  if (low.includes("submit")) return "SUBMIT_FAILED";
  return "NETWORK_ERROR";
}

