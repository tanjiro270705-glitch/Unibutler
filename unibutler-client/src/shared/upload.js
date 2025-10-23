// src/shared/upload.js
// Generic upload helpers (schedule feature removed)

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** Lấy MIME type từ File hoặc từ DTO (fileType) */
function getMime(input = {}) {
  // input có thể là File (input.type) hoặc DTO (input.fileType)
  return String(input.type || input.fileType || "").toLowerCase();
}

/** Ảnh: chấp nhận image/* và một số pattern phổ biến nếu BE không set chuẩn */
export function isImageFile(input) {
  const t = getMime(input);
  return (
    t.startsWith("image/") ||
    t.includes("png") ||
    t.includes("jpg") ||
    t.includes("jpeg") ||
    t.includes("gif") ||
    t.includes("webp") ||
    t.includes("heic")
  );
}

/** PDF */
export function isPdfFile(input) {
  const t = getMime(input);
  return t === "application/pdf" || t.includes("pdf");
}

/** Validate file từ input file */
export function validateFile(file) {
  if (!file) throw new Error("No file selected");
  if (file.size > MAX_FILE_SIZE) throw new Error("File size must be less than 10MB");

  // Nhiều trình duyệt/MIME server trả khác nhau -> linh hoạt: ảnh hoặc pdf đều được
  const t = getMime(file);
  const ok = isImageFile({ type: t }) || isPdfFile({ type: t });
  if (!ok) throw new Error("Only JPG, PNG, GIF, WEBP, HEIC and PDF files are allowed");
}

/** Upload file lịch học: POST /api/schedules/upload -> { schedule: {...} } */
// schedule upload removed — function intentionally omitted

/** Preview local cho ảnh/PDF */
export function getFilePreviewUrl(file) {
  if (!file) return null;
  if (isImageFile(file) || isPdfFile(file)) {
    try {
      return URL.createObjectURL(file);
    } catch {
      return null;
    }
  }
  return null;
}
export function revokePreviewUrl(url) {
  try {
    if (url) URL.revokeObjectURL(url);
  } catch (err) {
  console.debug("Failed to revoke preview URL:", err);
}}

/** Định dạng kích thước */
export function formatFileSize(bytes) {
  if (typeof bytes !== "number") return "";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/** Xây URL file (fallback nếu BE không trả fileUrl) */
// schedule file URL helper removed

/** Thêm cache-busting query theo updatedAt (tránh ảnh cũ bị cache) */
export function withCacheBust(url, updatedAt) {
  const ts = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${ts}`;
}
