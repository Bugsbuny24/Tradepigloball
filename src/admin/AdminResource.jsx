import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function toCSV(rows, cols) {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const head = cols.map(esc).join(",");
  const body = rows.map((r) => cols.map((c) => esc(r?.[c])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export default function AdminResource({ resource }) {
  const { table, columns, editable, idCol, readOnly, pkIsText } = resource;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [q, rows]);

  async function load() {
    setLoading(true);
    setErr("");
    const { data, error } = await supabase.from(table).select(columns.join(",")).order(columns.includes("created_at") ? "created_at" : idCol, { ascending: false }).limit(500);
    if (error) setErr(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [table]);

  async function saveRow(id, patch) {
    setErr("");
    const match = pkIsText ? { [idCol]: String(id) } : { [idCol]: id };
    const { error } = await supabase.from(table).update(patch).match(match);
    if (error) return setErr(error.message);
    setRows((prev) => prev.map((r) => (r[idCol] === id ? { ...r, ...patch } : r)));

    // audit
    await supabase.from("audit_log").insert({
      action: "update",
      table_name: table,
      row_id: pkIsText ? null : id,
      payload: patch,
    });
  }

  async function deleteRow(id) {
    if (!confirm("Delete row?")) return;
    setErr("");
    const match = pkIsText ? { [idCol]: String(id) } : { [idCol]: id };
    const { error } = await supabase.from(table).delete().match(match);
    if (error) return setErr(error.message);
    setRows((prev) => prev.filter((r) => r[idCol] !== id));

    await supabase.from("audit_log").insert({
      action: "delete",
      table_name: table,
      row_id: pkIsText ? null : id,
      payload: { [idCol]: id },
    });
  }

  function exportCSV() {
    const csv = toCSV(filtered, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${table}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>{resource.title}</h2>
        <button onClick={load} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,.15)", background: "white" }}>Refresh</button>
        <button onClick={exportCSV} style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,.15)", background: "white" }}>Export CSV</button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" style={{ marginLeft: "auto", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,.15)", minWidth: 260 }} />
      </div>

      {err ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" }}>
          <b>Error:</b> {err}
        </div>
      ) : null}

      {loading ? <div style={{ marginTop: 12 }}>Loading…</div> : null}

      {!loading ? (
        <div style={{ marginTop: 12, overflowX: "auto", border: "1px solid rgba(0,0,0,.12)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c} style={{ textAlign: "left", padding: 10, fontSize: 13, borderBottom: "1px solid rgba(0,0,0,.12)", background: "rgba(0,0,0,.03)", whiteSpace: "nowrap" }}>
                    {c}
                  </th>
                ))}
                {!readOnly ? <th style={{ padding: 10, fontSize: 13, borderBottom: "1px solid rgba(0,0,0,.12)", background: "rgba(0,0,0,.03)" }}>actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Row
                  key={String(r[idCol])}
                  r={r}
                  columns={columns}
                  editable={editable}
                  idCol={idCol}
                  readOnly={!!readOnly}
                  onSave={saveRow}
                  onDelete={deleteRow}
                />
              ))}
              {filtered.length === 0 ? (
                <tr><td colSpan={columns.length + 1} style={{ padding: 12, opacity: 0.7 }}>No rows.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function Row({ r, columns, editable, idCol, readOnly, onSave, onDelete }) {
  const [draft, setDraft] = useState({});
  const [dirty, setDirty] = useState(false);

  function setVal(k, v) {
    setDraft((p) => ({ ...p, [k]: v }));
    setDirty(true);
  }

  const id = r[idCol];

  return (
    <tr>
      {columns.map((c) => {
        const v = dirty && c in draft ? draft[c] : r[c];

        const isEditable = editable.includes(c) && !readOnly;
        const isBool = typeof v === "boolean";

        return (
          <td key={c} style={{ padding: 10, fontSize: 13, borderBottom: "1px solid rgba(0,0,0,.08)", whiteSpace: "nowrap" }}>
            {isEditable ? (
              isBool ? (
                <input type="checkbox" checked={!!v} onChange={(e) => setVal(c, e.target.checked)} />
              ) : (
                <input
                  value={v ?? ""}
                  onChange={(e) => setVal(c, e.target.value)}
                  style={{ padding: 6, borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", minWidth: 160 }}
                />
              )
            ) : (
              String(v ?? "")
            )}
          </td>
        );
      })}

      {!readOnly ? (
        <td style={{ padding: 10, borderBottom: "1px solid rgba(0,0,0,.08)", whiteSpace: "nowrap" }}>
          <button
            disabled={!dirty}
            onClick={() => { onSave(id, draft); setDirty(false); setDraft({}); }}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", background: dirty ? "white" : "rgba(0,0,0,.03)", cursor: dirty ? "pointer" : "not-allowed" }}
          >
            Save
          </button>
          <button
            onClick={() => onDelete(id)}
            style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,.15)", background: "white", cursor: "pointer" }}
          >
            Delete
          </button>
        </td>
      ) : null}
    </tr>
  );
        }
