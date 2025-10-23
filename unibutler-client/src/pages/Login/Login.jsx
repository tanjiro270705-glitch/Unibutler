import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../shared/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  // Nếu đã có token thì vào trang landing
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) nav("/", { replace: true });
  }, [nav]);

  function validate() {
    if (!email.trim()) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Email is invalid";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) { setError(msg); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem("token", data.token);

      // Redirect to landing page first
      nav("/", { replace: true });
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Welcome back 👋</h1>
        <form className="login__form" onSubmit={onSubmit} noValidate>
          <label className="login__label">
            Email
            <input
              className="login__input"
              type="email"
              placeholder="university@email.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login__label">
            Password
            <div className="login__pwd">
              <input
                className="login__input login__input--pwd"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login__toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label="Toggle password"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && <div className="login__error">{error}</div>}

          <button className="login__btn" disabled={submitting}>
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="login__hint">
          No account? <Link className="login__link" to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
