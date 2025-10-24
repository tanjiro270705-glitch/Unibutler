// src/shared/upload.js
// Generic upload helpers (schedule feature removed)

import { API_BASE } from "./api";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** Lấy MIME type từ File hoặc từ DTO (fileType) */
function getMime(input = {}) {
  return String(input?.type || input?.fileType || "").toLowerCase();
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

  const t = getMime(file);
  const ok = isImageFile({ type: t }) || isPdfFile({ type: t });
  if (!ok) throw new Error("Only JPG, PNG, GIF, WEBP, HEIC and PDF files are allowed");
}

/** Lấy base public (http://localhost:8080) từ API_BASE (http://localhost:8080[/api]) */
function getPublicBase() {
  const base = API_BASE || "";
  return base.replace(/\/+$/, "").replace(/\/api$/i, ""); // bỏ /api nếu có
}

/** Nối path an toàn */
function joinUrl(base, path) {
  const b = (base || "").replace(/\/+$/, "");
  const p = (path || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}

/** Thêm cache-busting query theo updatedAt (tránh ảnh cũ bị cache) */
export function withCacheBust(url, updatedAt) {
  const ts = updatedAt ? new Date(updatedAt).getTime() : Date.now();
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${ts}`;
}

/**
 * Trả về { url, revoke? } cho mọi loại payload:
 * - string URL tuyệt đối (http(s)/data:) -> {url}
 * - File/Blob -> objectURL {url, revoke}
 * - object có url/previewUrl/fileUrl -> {url}
 * - object có path/filePath/key/id -> build http://host/uploads/<path|id>
 */
export async function getFilePreviewUrl(payload) {
  if (!payload) return null;

  // 1) String URL tuyệt đối
  if (typeof payload === "string") {
    if (/^(https?:)?\/\//i.test(payload) || payload.startsWith("data:")) {
      return { url: payload };
    }
    // string tương đối -> coi như path dưới /uploads
    const built = joinUrl(getPublicBase(), joinUrl("/uploads", payload));
    return { url: withCacheBust(built) };
  }

  // 2) File/Blob
  const isFile =
    (typeof File !== "undefined" && payload instanceof File) ||
    (typeof Blob !== "undefined" && payload instanceof Blob);
  if (isFile) {
    const url = URL.createObjectURL(payload);
    return { url, revoke: () => URL.revokeObjectURL(url) };
  }

  // 3) Object có sẵn url/previewUrl/fileUrl
  if (typeof payload === "object") {
    const directUrl = payload.url || payload.previewUrl || payload.fileUrl;
    if (typeof directUrl === "string" && directUrl) {
      // nếu là relative thì ghép base
      const url =
        /^(https?:)?\/\//i.test(directUrl) || directUrl.startsWith("data:")
          ? directUrl
          : joinUrl(getPublicBase(), directUrl.startsWith("/uploads/")
              ? directUrl
              : joinUrl("/uploads", directUrl));
      return { url: withCacheBust(url, payload.updatedAt) };
    }

    // 4) Có path/filePath/key -> build /uploads/<...>
    const pathLike = payload.path || payload.filePath || payload.key;
    if (typeof pathLike === "string" && pathLike) {
      const built = joinUrl(getPublicBase(),
        pathLike.startsWith("/uploads/")
          ? pathLike
          : joinUrl("/uploads", pathLike)
      );
      return { url: withCacheBust(built, payload.updatedAt) };
    }

    // 5) Có id -> build /uploads/<id> (theo config static-path-pattern=/uploads/**)
    if (payload.id) {
      const built = joinUrl(getPublicBase(), joinUrl("/uploads", String(payload.id)));
      return { url: withCacheBust(built, payload.updatedAt) };
    }
  }

  // Không hiểu payload → trả null để FE tự xử lý
  return null;
}

/** Revoke preview URL (chấp nhận string hoặc object {url,revoke}) */
export function revokePreviewUrl(target) {
  try {
    if (!target) return;
    if (typeof target === "string") {
      // Có thể là objectURL, nếu không phải thì revoke cũng không sao
      URL.revokeObjectURL(target);
      return;
    }
    if (typeof target === "object") {
      if (typeof target.revoke === "function") return target.revoke();
      if (typeof target.url === "string") URL.revokeObjectURL(target.url);
    }
  } catch (err) {
    console.debug("Failed to revoke preview URL:", err);
  }
}

/** Định dạng kích thước */
export function formatFileSize(bytes) {
  if (typeof bytes !== "number") return "";
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
