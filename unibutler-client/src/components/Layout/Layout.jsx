import { NavLink, useNavigate } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
  const navigate = useNavigate();

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    "layout-nav__link" + (isActive ? " layout-nav__link--active" : "");

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header__inner">
          <div className="layout-logo" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/dashboard");
          }}>
            UniButler
          </div>

          <nav className="layout-nav">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/tasks" className={linkClass}>
              Tasks
            </NavLink>
            <NavLink to="/mood" className={linkClass}>
              Mood
            </NavLink>
            <NavLink to="/resources" className={linkClass}>
              Resources
            </NavLink>
            <a href="#logout" className="layout-nav__link" onClick={logout}>
              Logout
            </a>
          </nav>
        </div>
      </header>

      <main className="layout-content">
        <div className="layout-content__inner">{children}</div>
      </main>

      <footer className="layout-footer">
        <div className="layout-footer__inner">
          <span>© {new Date().getFullYear()} UniButler</span>
        </div>
      </footer>
    </div>
  );
}
