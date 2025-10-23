// src/shared/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status ?? 0;
    this.body = body;
  }
}

function normalizePath(p) {
  if (!p) return "";
  return p.startsWith("/") ? p : `/${p}`;
}

function joinUrl(base, path) {
  if (!base) return path;
  // remove trailing slash from base
  return `${base.replace(/\/+$/, "")}${normalizePath(path)}`;
}

export async function api(path, options = {}) {
  const {
    method = "GET",
    timeoutMs = 12000,
    signal: externalSignal,
    headers: headersInit,
    body: rawBody,
    ...rest
  } = options;

  // Build headers as a plain object first to allow easier checks
  const headersObj = Object.assign({}, headersInit || {});
  let body = rawBody;

  // Tự stringify JSON nếu body là object thường và không phải FormData / string
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isStringBody = typeof body === "string";

  if (!isFormData && body && typeof body === "object" && !isStringBody) {
    body = JSON.stringify(body);
  }

  // Set Content-Type: application/json nếu KHÔNG phải FormData và chưa có header này
  if (!isFormData && body && !headersObj["Content-Type"] && !headersObj["content-type"]) {
    headersObj["Content-Type"] = "application/json";
  }

  // Gắn token
  const token = localStorage.getItem("token");
  if (token) headersObj["X-Auth-Token"] = token;

  // Timeout + AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Nếu có externalSignal, nối sự kiện abort
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let res;
  // Create Headers object from headersObj (so fetch can manage them)
  const headers = new Headers();
  Object.entries(headersObj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    headers.set(k, String(v));
  });

  try {
    res = await fetch(joinUrl(API_BASE, path), {
      method,
      headers,
      // For FormData, pass the FormData directly and don't let fetch override headers
      body: isFormData ? body : body,
      signal: controller.signal,
      ...rest,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    // Distinguish abort (timeout or external abort) from other network errors
    if (err && err.name === "AbortError") {
      const abortedByExternal = externalSignal && externalSignal.aborted;
      const msg = abortedByExternal ? "Request was aborted" : "Request timed out";
      throw new ApiError(msg, 0, null);
    }
    // Network error or other failure
    throw new ApiError(err?.message || "Network error", 0, null);
  } finally {
    clearTimeout(timeoutId);
  }

  // No content
  if (res.status === 204) {
    return null;
  }

  const ct = (res.headers.get("content-type") || res.headers.get("Content-Type") || "").toLowerCase();
  const isJson = ct.includes("application/json");

  let payload;
  try {
    if (isJson) payload = await res.json();
    else payload = await res.text();
  } catch {
    // If parsing fails, keep raw text if possible
    try {
      payload = await res.text();
    } catch {
      payload = isJson ? {} : "";
    }
  }

  if (!res.ok) {
    // 401 -> clear token
    if (res.status === 401) {
      localStorage.removeItem("token");
    }
    const message = isJson
      ? (payload && (payload.error || payload.message)) || res.statusText
      : String(payload || res.statusText || `HTTP ${res.status}`);
    throw new ApiError(message || `HTTP ${res.status}`, res.status, payload);
  }

  // Trả đúng kiểu theo content-type
  return isJson ? payload : { data: payload };
}

// Tiện ích nho nhỏ: build URL có query (nếu cần)
/**
 * buildPath("/schedules", { page:1, q:"math" }) => "/schedules?page=1&q=math"
 */
export function buildPath(path, query) {
  if (!query || typeof query !== "object") return path;
  const usp = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    usp.append(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}
