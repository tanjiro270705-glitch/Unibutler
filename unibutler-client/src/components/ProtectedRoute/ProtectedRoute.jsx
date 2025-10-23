import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../shared/api";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState({
    status: "checking", // checking | authed | unauth
  });

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = localStorage.getItem("token");
      if (!token) {
        setState({ status: "unauth" });
        return;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { "X-Auth-Token": token },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
        await res.json().catch(() => ({}));

        if (!cancelled) {
          setState({ status: "authed" });
        }
      } catch (err) {
        console.error("Verify session failed:", err);
        localStorage.removeItem("token");
        if (!cancelled) setState({ status: "unauth" });
      } finally {
        clearTimeout(timer);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, []);

  // trạng thái chờ
  if (state.status === "checking") {
    return <div style={{ padding:24, textAlign:"center", color:"#6b7280" }}>Checking session…</div>;
  }

  // chưa login
  if (state.status === "unauth") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // hợp lệ -> hiển thị nội dung
  return children;
}
