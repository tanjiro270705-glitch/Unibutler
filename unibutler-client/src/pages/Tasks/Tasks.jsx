import { useEffect, useState } from "react";
import "./Tasks.css";
import { api } from "../../shared/api";
import { emit, AppEvents } from "../../shared/events";

export default function Tasks() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setItems(await api("/tasks"));
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addTask(e) {
  e.preventDefault();
  setError("");
  if (!title.trim()) { setError("Title is required"); return; }
  try {
    await api("/tasks", {
      method: "POST",
      body: JSON.stringify({
        title,
        dueDate: due ? new Date(due).toISOString() : null
      })
    });
    setTitle(""); setDue("");
    emit(AppEvents.TASKS_CHANGED, { reason: "create" });   // 👈 phát sự kiện
    load();
  } catch (e) {
    setError(String(e.message || e));
  }
}

async function setStatus(id, status) {
  try {
    await api(`/tasks/${id}`, { method:"PATCH", body: JSON.stringify({ status }) });
    emit(AppEvents.TASKS_CHANGED, { reason: "status", id, status }); // 👈 phát sự kiện
    load();
  } catch (e) { setError(String(e.message || e)); }
}

async function del(id) {
  if (!confirm("Delete this task?")) return;
  try {
    await api(`/tasks/${id}`, { method:"DELETE" });
    emit(AppEvents.TASKS_CHANGED, { reason: "delete", id }); // 👈 phát sự kiện
    load();
  } catch (e) { setError(String(e.message || e)); }
}

  return (
    <div className="tasks">
      <h1 className="tasks__title">Tasks</h1>
      {error && <div className="tasks__error">{error}</div>}

      <div className="tasks__card">
        <form className="tasks__form" onSubmit={addTask}>
          <input
            className="tasks__input"
            placeholder="New task title"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />
        <input
            className="tasks__input"
            type="date"
            value={due}
            onChange={(e)=>setDue(e.target.value)}
          />
          <button className="tasks__btn">Add</button>
        </form>
      </div>

      {loading ? (
        <div className="tasks__loading">Loading…</div>
      ) : (
        <div className="tasks__list">
          {items.map(t => (
            <div key={t.id} className="tasks__item">
              <div className="tasks__itemMain">
                <div className="tasks__itemTitle">{t.title}</div>
                <div className="tasks__itemMeta">
                  {t.dueDate ? new Date(t.dueDate).toLocaleString() : "No due date"}
                </div>
              </div>
              <div className="tasks__itemActions">
                <select
                  className="tasks__select"
                  value={t.status}
                  onChange={(e)=>setStatus(t.id, e.target.value)}
                >
                  <option>TODO</option>
                  <option>IN_PROGRESS</option>
                  <option>DONE</option>
                </select>
                <button className="tasks__btn tasks__btn--danger" onClick={()=>del(t.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="tasks__empty">No tasks yet. Add your first one!</div>}
        </div>
      )}
    </div>
  );
}
