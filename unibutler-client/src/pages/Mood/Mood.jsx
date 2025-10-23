import { useEffect, useState } from "react";
import "./Mood.css";
import { api } from "../../shared/api";

export default function Mood() {
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(5);
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try { setLogs(await api("/moods/latest")); }
    catch (e) { setError(String(e.message || e)); }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError("");
    if (mood < 1 || mood > 5) { setError("Mood must be 1–5"); return; }
    if (stress < 1 || stress > 10) { setError("Stress must be 1–10"); return; }
    setSubmitting(true);
    try {
      await api("/moods", {
        method: "POST",
        body: JSON.stringify({ mood, stress, note })
      });
      setNote("");
      load();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mood">
      <h1 className="mood__title">Mood & Stress</h1>
      {error && <div className="mood__error">{error}</div>}

      <div className="mood__card">
        <form className="mood__form" onSubmit={add}>
          <div className="mood__field">
            <div className="mood__label">Mood (1–5)</div>
            <input
              className="mood__input"
              type="number" min={1} max={5}
              value={mood}
              onChange={(e)=>setMood(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="mood__field">
            <div className="mood__label">Stress (1–10)</div>
            <input
              className="mood__input"
              type="number" min={1} max={10}
              value={stress}
              onChange={(e)=>setStress(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div className="mood__field mood__field--grow">
            <div className="mood__label">Note</div>
            <input
              className="mood__input"
              placeholder="Quick note about today…"
              value={note}
              onChange={(e)=>setNote(e.target.value)}
            />
          </div>
          <button className="mood__btn" disabled={submitting}>
            {submitting ? "Logging…" : "Log today's mood"}
          </button>
        </form>
      </div>

      <div className="mood__card">
        <h2 className="mood__sectionTitle">Recent logs</h2>
        <div className="mood__list">
          {logs.map((l) => (
            <div key={l.id} className="mood__item">
              <div className="mood__date">{new Date(l.date).toLocaleDateString()}</div>
              <div className="mood__meta">Mood {l.mood} • Stress {l.stress}</div>
              <div className="mood__note">{l.note}</div>
            </div>
          ))}
          {logs.length === 0 && <div className="mood__empty">No logs yet.</div>}
        </div>
      </div>
    </div>
  );
}
