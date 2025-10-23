import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../shared/api";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) nav("/dashboard", { replace: true });
  }, [nav]);

  function validate() {
    if (!email.trim()) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Email is invalid";
    if (!name.trim()) return "Full name is required";
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
      // register
      const r = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password })
      });
      if (!r.ok) throw new Error(await r.text());

      // auto-login
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem("token", data.token);
  nav("/dashboard", { replace: true });
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register">
      <div className="register__card">
        <h1 className="register__title">Create your account 🎓</h1>
        <form className="register__form" onSubmit={onSubmit} noValidate>
          <label className="register__label">
            University email
            <input
              className="register__input"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="register__label">
            Full name
            <input
              className="register__input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="register__label">
            Password
            <div className="register__pwd">
              <input
                className="register__input register__input--pwd"
                type={showPwd ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="register__toggle"
                onClick={() => setShowPwd((s) => !s)}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && <div className="register__error">{error}</div>}

          <button className="register__btn" disabled={submitting}>
            {submitting ? "Creating..." : "Register"}
          </button>
        </form>

        <div className="register__hint">
          Already have an account?{" "}
          <Link className="register__link" to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
