// Sự kiện toàn cục trong app
export const AppEvents = {
  TASKS_CHANGED: "tasks:changed",
};

// Phát sự kiện
export function emit(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

// Đăng ký nghe sự kiện (trả về hàm hủy)
export function on(eventName, handler) {
  window.addEventListener(eventName, handler);
  return () => window.removeEventListener(eventName, handler);
}
