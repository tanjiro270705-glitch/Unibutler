import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { api, ApiError, API_BASE } from "../../shared/api";
import { getFilePreviewUrl } from "../../shared/upload";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { on, AppEvents } from "../../shared/events";
import ImageUpload from "../../components/ImageUpload/ImageUpload";

const STORAGE_KEY = "dashboard.uploadedImages";

// Build absolute URL từ id/path/relative -> http://host/uploads/...
function toAbsoluteUploads(u) {
  if (!u) return null;
  if (/^(https?:)?\/\//i.test(u) || String(u).startsWith("blob:") || String(u).startsWith("data:")) return String(u);
  const base = (API_BASE || "").replace(/\/+$/, "").replace(/\/api$/i, ""); // http://localhost:8080
  const path = String(u).startsWith("/uploads/") ? String(u) : `/uploads/${String(u).replace(/^\/+/, "")}`;
  return `${base}${path}`;
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  // uploadedImages: [{ url, _revoke?: fn }]
  const [uploadedImages, setUploadedImages] = useState([]);
  const nav = useNavigate();
  const mountedRef = useRef(true);

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

      // suggestions có thể timeout => fallback
      let sug = [];
      try {
        const res = await api("/suggestions", { timeoutMs: 20000 });
        sug = res?.items || [];
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

      if (!mountedRef.current) return;
      setSummary(s || null);
      setGrowth(Array.isArray(g) ? g : []);
      setSuggestions(sug);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        nav("/login", { replace: true });
        return;
      }
      console.warn("Dashboard load error:", e);
      // Đừng show “Not Found” đỏ khi chỉ thiếu dữ liệu
      setErr("");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    loadAll();

    // Rehydrate ảnh từ localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved) && saved.length) setUploadedImages(saved);
    } catch {}

    // auto-refresh khi task thay đổi
    const off = on(AppEvents.TASKS_CHANGED, () => {
      if (!mountedRef.current) return;
      loadAll({ silent: true });
    });

    return () => {
      mountedRef.current = false;
      off();
      // chỉ revoke blob:, KHÔNG reset mảng (để quay lại vẫn còn)
      uploadedImages.forEach((img) => {
        try {
          if (img?._revoke && String(img.url).startsWith("blob:")) img._revoke();
        } catch {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist ảnh có URL công khai (http/https) để đổi trang quay lại vẫn còn
  useEffect(() => {
    const persistable = uploadedImages.filter((i) => /^https?:\/\//i.test(String(i.url)));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {}
  }, [uploadedImages]);

  // Nhận kết quả upload từ ImageUpload: string URL | id | path | object | File/Blob
  const handleUploadComplete = async (payload) => {
    try {
      if (!payload) throw new Error("Empty upload payload");

      // a) String: có thể là URL/id/path
      if (typeof payload === "string") {
        const url = toAbsoluteUploads(payload);
        if (url) {
          setUploadedImages((prev) => [...prev, { url }]);
          return;
        }
      }

      // b) File/Blob -> blob URL tạm
      const isFile =
        (typeof File !== "undefined" && payload instanceof File) ||
        (typeof Blob !== "undefined" && payload instanceof Blob);
      if (isFile) {
        const url = URL.createObjectURL(payload);
        setUploadedImages((prev) => [...prev, { url, _revoke: () => URL.revokeObjectURL(url) }]);
        return;
      }

      // c) Object có sẵn url/previewUrl/fileUrl/publicUrl
      if (payload && typeof payload === "object") {
        const direct = payload.url || payload.previewUrl || payload.fileUrl || payload.publicUrl;
        if (typeof direct === "string" && direct) {
          setUploadedImages((prev) => [...prev, { url: toAbsoluteUploads(direct) }]);
          return;
        }

        // d) Object có path/filePath/key/id/filename/savedName/storageKey/imageId
        const pathLike =
          payload.path ||
          payload.filePath ||
          payload.key ||
          payload.id ||
          payload.imageId ||
          payload.filename ||
          payload.savedName ||
          payload.storageKey;
        if (typeof pathLike === "string" && pathLike) {
          setUploadedImages((prev) => [...prev, { url: toAbsoluteUploads(pathLike) }]);
          return;
        }

        // e) Nếu ImageUpload trả { file, result: { url } } -> thay blob bằng URL server
        if (payload.result?.url) {
          const url = toAbsoluteUploads(payload.result.url);
          setUploadedImages((prev) => [...prev, { url }]);
          return;
        }

        // f) Fallback: thử string đầu tiên trong object
        const anyString = Object.values(payload).find((v) => typeof v === "string" && v.length);
        if (anyString) {
          const url = toAbsoluteUploads(anyString);
          if (url) {
            setUploadedImages((prev) => [...prev, { url }]);
            console.warn("Preview used fallback string from payload:", payload);
            return;
          }
        }
      }

      // g) Thử helper preview (nếu có cơ chế riêng trên BE)
      const preview = await getFilePreviewUrl(payload);
      if (preview && preview.url) {
        setUploadedImages((prev) => [...prev, { url: preview.url, _revoke: preview.revoke }]);
        return;
      }

      console.warn("Cannot derive preview URL from payload:", payload);
      // Không setErr để tránh đỏ cả trang chỉ vì preview
    } catch (e) {
      console.error("Make preview failed:", e, "payload=", payload);
      // Không đẩy lỗi ra UI để tránh UX xấu
      // setErr("Cannot preview uploaded image. Please try again.");
    }
  };

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
              <Metric label="Tasks done"
                      value={`${summary.tasksDone || 0}/${summary.tasksTotal || 0}`} />
              <Metric label="Productivity"
                      value={`${Number(summary.productivityScore || 0).toFixed(0)}%`} />
              <Metric label="Avg stress" value={Number(summary.avgStress || 0).toFixed(1)} />
              <Metric label="Avg mood" value={Number(summary.avgMood || 0).toFixed(1)} />
              <Metric label="Best study window"
                      value={summary.bestStudyWindow || "9:00 AM - 12:00 PM"} />
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
                  <div className="dashboard__listMeta">
                    {s.when} • {s.where}
                  </div>
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

        <ImageUpload onUploadComplete={handleUploadComplete} />

        {uploadedImages.length > 0 ? (
          <div className="dashboard__images-grid">
            {uploadedImages.map((img, index) => (
              <div key={index} className="dashboard__image-card">
                <img src={img.url} alt={`Uploaded ${index + 1}`} />
              </div>
            ))}
          </div>
        ) : (
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
              <li>🧠 Best study window: <strong>{summary.bestStudyWindow || "9:00 AM - 12:00 PM"}</strong></li>
              <li>💆 Stress peak day: <strong>{summary.stressPeakDay || "No data yet"}</strong></li>
              <li>🚀 Early completion boost: <strong>{summary.earlyCompletionBoost || 0}%</strong></li>
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
