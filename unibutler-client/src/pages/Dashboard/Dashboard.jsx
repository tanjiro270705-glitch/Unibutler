import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { api, ApiError } from "../../shared/api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { on, AppEvents } from "../../shared/events";
import ImageUpload from "../../components/ImageUpload/ImageUpload";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const nav = useNavigate();

  async function loadAll({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
      setErr("");
    }

    try {
      const [s, g] = await Promise.all([
        api("/dashboard/weekly-summary"),
        api("/dashboard/growth"),
      ]);

      let sug = [];
      try {
        const res = await api("/suggestions", { timeoutMs: 20000 });
        sug = res.items || [];
      } catch (suggestionError) {
        console.warn("Failed to load suggestions:", suggestionError);
        sug = [
          {
            type: "💡 Study Tip",
            title: "Use the Pomodoro Technique for better focus",
            when: "Anytime",
            where: "AI Recommendation",
          },
        ];
      }

      setSummary(s);
      setGrowth(Array.isArray(g) ? g : []);
      setSuggestions(sug);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        nav("/login", { replace: true });
        return;
      }
      setErr(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    loadAll();

    const off = on(AppEvents.TASKS_CHANGED, () => {
      if (!mounted) return;
      loadAll({ silent: true });
    });

    return () => {
      mounted = false;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Your Week Overview</h1>

      {err && <div className="dashboard__error">{err}</div>}

      {/* Summary + Suggestions */}
      <div className="dashboard__grid">
        <section className="dashboard__card dashboard__card--wide">
          <h2 className="dashboard__sectionTitle">Weekly Summary</h2>

          {loading && !summary ? (
            <div className="dashboard__loading">Loading…</div>
          ) : summary ? (
            <div className="dashboard__metrics">
              <Metric
                label="Tasks done"
                value={`${summary.tasksDone || 0}/${summary.tasksTotal || 0}`}
              />
              <Metric
                label="Productivity"
                value={`${Number(summary.productivityScore || 0).toFixed(0)}%`}
              />
              <Metric label="Avg stress" value={Number(summary.avgStress || 0).toFixed(1)} />
              <Metric label="Avg mood" value={Number(summary.avgMood || 0).toFixed(1)} />
              <Metric
                label="Best study window"
                value={summary.bestStudyWindow || "9:00 AM - 12:00 PM"}
              />
              <div className="dashboard__tip">💡 {summary.tip || "Keep going!"}</div>
            </div>
          ) : (
            <div className="dashboard__empty">
              <p>No data yet — start creating tasks and logging your mood!</p>
              <p>Your weekly summary will appear here once you have some data.</p>
            </div>
          )}
        </section>

        <section className="dashboard__card">
          <h2 className="dashboard__sectionTitle">AI Suggestions</h2>

          {loading && suggestions.length === 0 ? (
            <div className="dashboard__loading">Loading…</div>
          ) : (
            <ul className="dashboard__list">
              {suggestions.map((s, i) => (
                <li key={i} className="dashboard__listItem">
                  <div className="dashboard__listType">{s.type}</div>
                  <div className="dashboard__listTitle">{s.title}</div>
                  <div className="dashboard__listMeta">{s.when} • {s.where}</div>
                </li>
              ))}

              {suggestions.length === 0 && (
                <li className="dashboard__empty">
                  <p>No suggestions yet.</p>
                  <p>Complete some tasks to get personalized recommendations!</p>
                </li>
              )}
            </ul>
          )}
        </section>
      </div>

      {/* Image Upload Section */}
      <section className="dashboard__images">
        <h2 className="dashboard__images-title">Your Images</h2>

        <ImageUpload
          onUploadComplete={(imageUrl) => {
            setUploadedImages((prev) => [...prev, imageUrl]);
          }}
        />

        {uploadedImages.length > 0 && (
          <div className="dashboard__images-grid">
            {uploadedImages.map((url, index) => (
              <div key={index} className="dashboard__image-card">
                <img src={url} alt={`Uploaded ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {uploadedImages.length === 0 && (
          <div className="dashboard__empty">
            <p>No images uploaded yet.</p>
            <p>Upload your first image using the button above!</p>
          </div>
        )}
      </section>

      {/* Growth chart */}
      <section className="dashboard__card">
        <h2 className="dashboard__sectionTitle">Personal Growth Trends</h2>

        {loading && growth.length === 0 ? (
          <div className="dashboard__loading">Loading…</div>
        ) : growth.length === 0 ? (
          <div className="dashboard__empty">
            <p>No data yet — start logging mood and tasks!</p>
            <p>Create some tasks and log your daily mood to see your growth trends.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#3b82f6" name="Mood" />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" name="Stress" />
              <Line type="monotone" dataKey="productivity" stroke="#10b981" name="Productivity" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {summary && (
          <div className="dashboard__insights">
            <h3 className="dashboard__insightsTitle">📈 AI Insights</h3>
            <ul className="dashboard__insightsList">
              <li>
                🧠 Best study window: <strong>{summary.bestStudyWindow || "9:00 AM - 12:00 PM"}</strong>
              </li>
              <li>
                💆 Stress peak day: <strong>{summary.stressPeakDay || "No data yet"}</strong>
              </li>
              <li>
                🚀 Early completion boost: <strong>{summary.earlyCompletionBoost || 0}%</strong>
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="dashboard__metric">
      <div className="dashboard__metricLabel">{label}</div>
      <div className="dashboard__metricValue">{value}</div>
    </div>
  );
}
