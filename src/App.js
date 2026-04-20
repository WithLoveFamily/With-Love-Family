import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2-KeCRUKY-REdevBFKO1J3x3bmN6zw78",
  authDomain: "with-love-family.firebaseapp.com",
  projectId: "with-love-family",
  storageBucket: "with-love-family.firebasestorage.app",
  messagingSenderId: "408909815434",
  appId: "1:408909815434:web:b706c7dfcca2e3ae1c1773"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const CONSULTANT_CODE = "admin2024";

const DAYS_W1 = ["Assestamento G1","Assestamento G2","Giorno 1","Giorno 2","Giorno 3","Giorno 4","Giorno 5","Giorno 6","Giorno 7"];
const DAYS_W2 = ["Giorno 8","Giorno 9","Giorno 10","Giorno 11","Giorno 12","Giorno 13","Giorno 14"];

const SECTIONS = [
  {
    label: "🌅 MATTINA", key: "mattina",
    fields: ["Svegliato/a","Dramatic w/up","Colazione","Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Pranzo alle"]
  },
  {
    label: "☀️ POMERIGGIO", key: "pomeriggio",
    fields: ["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino"]
  },
  {
    label: "🌤️ PISOLINO EXTRA", key: "pisolino_extra",
    fields: ["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Tot ore giorno"]
  },
  {
    label: "🌆 SERA", key: "sera",
    fields: ["Cena alle","Stanco/a alle ore...","Inizio routine","Fine routine","Stanco/a da 1a10","Addormentato/a","Come","Posizione Stanza"]
  },
  {
    label: "🌙 NOTTE", key: "notte",
    fields: [
      "Risveglio 1 – Tempo sveglio/a","Risveglio 1 – Note",
      "Risveglio 2 – Tempo sveglio/a","Risveglio 2 – Note",
      "Risveglio 3 – Tempo sveglio/a","Risveglio 3 – Note",
      "Risveglio 4 – Tempo sveglio/a","Risveglio 4 – Note",
      "Risveglio 5 – Tempo sveglio/a","Risveglio 5 – Note",
      "Risveglio 6 – Tempo sveglio/a","Risveglio 6 – Note",
      "Risveglio 7 – Tempo sveglio/a","Risveglio 7 – Note",
      "Sveglio/a alle","Sveglio/a definitivamente"
    ]
  }
];

function emptyDays(days) {
  const data = {};
  days.forEach(d => {
    data[d] = { date: "", note: "" };
    SECTIONS.forEach(s => s.fields.forEach(f => { data[d][s.key+"__"+f] = ""; }));
  });
  return data;
}

function emptyClient(name, papa = "") {
  return {
    id: Date.now().toString(),
    name, papa,
    link: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toLocaleDateString("it-IT"),
    week1: emptyDays(DAYS_W1),
    week2: emptyDays(DAYS_W2),
    consultantNotes: { week1: "", week2: "" }
  };
}

// ── FIREBASE HELPERS ──
async function loadClients() {
  try {
    const snap = await getDocs(collection(db, "clients"));
    return snap.docs.map(d => d.data());
  } catch { return []; }
}

async function saveClient(client) {
  await setDoc(doc(db, "clients", client.id), client);
}

async function removeClient(id) {
  await deleteDoc(doc(db, "clients", id));
}

const C = {
  gold: "#b8960c", goldLight: "#f5e9b8", blue: "#6b8cae",
  blueLight: "#dde8f3", dark: "#2d2d2d", gray: "#f7f7f7",
  white: "#ffffff", border: "#e0e0e0", green: "#4caf50", red: "#e53935"
};

function Header({ title, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 16px 8px", background: `linear-gradient(135deg,${C.goldLight},${C.blueLight})`, borderBottom: `2px solid ${C.gold}` }}>
      <div style={{ fontFamily: "Georgia,serif", fontSize: 28, color: C.gold, letterSpacing: 2 }}>✦ With Love ✦</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.dark, marginTop: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, onClick, color = C.gold, small, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#ccc" : color, color: C.white, border: "none", borderRadius: 8, padding: small ? "6px 14px" : "10px 22px", fontSize: small ? 13 : 15, fontWeight: 600, cursor: disabled ? "default" : "pointer", margin: 4 }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, multiline }) {
  const s = { width: "100%", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 14, background: C.white, boxSizing: "border-box", fontFamily: "inherit" };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...s, resize: "vertical" }} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />;
}

function DayForm({ dayKey, data, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, color: "#888" }}>Data</label>
          <Input value={data.date || ""} onChange={v => onChange(dayKey, "date", v)} placeholder="gg/mm/aaaa" />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: 12, color: "#888" }}>Note generali giornata</label>
          <Input value={data.note || ""} onChange={v => onChange(dayKey, "note", v)} placeholder="Note..." />
        </div>
      </div>
      {SECTIONS.map(sec => (
        <div key={sec.key} style={{ marginBottom: 16, background: C.gray, borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.blue, marginBottom: 8 }}>{sec.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {sec.fields.map(f => (
              <div key={f}>
                <label style={{ fontSize: 12, color: "#555" }}>{f}</label>
                <Input value={data[sec.key + "__" + f] || ""} onChange={v => onChange(dayKey, sec.key + "__" + f, v)} placeholder="—" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientView({ client, onSave }) {
  const [week, setWeek] = useState(1);
  const [data, setData] = useState({ week1: client.week1, week2: client.week2 });
  const days = week === 1 ? DAYS_W1 : DAYS_W2;
  const [activeDay, setActiveDay] = useState(days[0]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleChange(dayKey, field, val) {
    const wk = "week" + week;
    setData(prev => ({ ...prev, [wk]: { ...prev[wk], [dayKey]: { ...prev[wk][dayKey], [field]: val } } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const wkData = data["week" + week];
  const consultantNote = client.consultantNotes?.["week" + week] || "";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", minHeight: "100vh", background: C.white }}>
      <Header title={`Ciao ${client.name}! 👶`} sub="Scheda Monitoraggio Percorso Sonno" />
      <div style={{ padding: 16 }}>
        {client.papa && <div style={{ fontSize: 14, color: "#555", marginBottom: 4 }}>👨 Papà: <strong>{client.papa}</strong></div>}
        <div style={{ background: C.blueLight, borderRadius: 8, padding: 12, fontSize: 13, color: C.dark, marginBottom: 16, lineHeight: 1.6 }}>
          📝 Compilare le schede entro la fine della giornata, aggiungendo l'addormentamento serale prima di andare a dormire. È importante per avere tutti i dati della giornata.<br />
          <em>Utilizzare le tabelle durante la mini consulenza se avete bisogno di aiuto.</em>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[1, 2].map(w => (
            <button key={w} onClick={() => { setWeek(w); setActiveDay(w === 1 ? DAYS_W1[0] : DAYS_W2[0]); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer", background: week === w ? C.gold : C.border, color: week === w ? C.white : C.dark, fontWeight: 600 }}>
              Settimana {w} {w === 1 ? "(Giorni 1-7)" : "(Giorni 8-14)"}
            </button>
          ))}
        </div>

        {consultantNote && (
          <div style={{ background: "#fff8e1", border: `1px solid ${C.gold}`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: C.gold, marginBottom: 4 }}>💬 Nota della consulente:</div>
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{consultantNote}</div>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
          {days.map(d => (
            <button key={d} onClick={() => setActiveDay(d)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, background: activeDay === d ? C.blue : C.gray, color: activeDay === d ? C.white : C.dark, fontWeight: activeDay === d ? 700 : 400 }}>{d}</button>
          ))}
        </div>

        <DayForm dayKey={activeDay} data={wkData[activeDay]} onChange={handleChange} />

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Btn onClick={handleSave} color={saved ? C.green : C.gold} disabled={saving}>
            {saving ? "Salvataggio..." : saved ? "✓ Salvato!" : "💾 Salva scheda"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function ConsultantView({ clients, onAddClient, onUpdateClient, onDeleteClient }) {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPapa, setNewPapa] = useState("");
  const [week, setWeek] = useState(1);
  const [activeDay, setActiveDay] = useState(DAYS_W1[0]);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  function openClient(c) { setSelected(c); setWeek(1); setActiveDay(DAYS_W1[0]); setNote(c.consultantNotes?.week1 || ""); setView("detail"); }

  async function saveNote() {
    const wk = "week" + week;
    const updated = { ...selected, consultantNotes: { ...selected.consultantNotes, [wk]: note } };
    await onUpdateClient(updated);
    setSelected(updated);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  }

  function handleWeekChange(w) {
    setWeek(w); setActiveDay(w === 1 ? DAYS_W1[0] : DAYS_W2[0]);
    setNote(selected.consultantNotes?.["week" + w] || "");
  }

  if (view === "detail" && selected) {
    const client = clients.find(c => c.id === selected.id) || selected;
    const days = week === 1 ? DAYS_W1 : DAYS_W2;
    const wkData = client["week" + week];
    const baseUrl = window.location.origin + window.location.pathname;
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", minHeight: "100vh", background: C.white }}>
        <Header title={`📋 ${client.name}`} sub={`Cliente dal ${client.createdAt}${client.papa ? " · Papà: " + client.papa : ""}`} />
        <div style={{ padding: 16 }}>
          <Btn onClick={() => setView("list")} color={C.blue} small>← Lista clienti</Btn>

          <div style={{ background: C.gray, borderRadius: 8, padding: 12, margin: "12px 0", fontSize: 13 }}>
            🔗 <strong>Link cliente:</strong>{" "}
            <span style={{ color: C.blue, wordBreak: "break-all" }}>{baseUrl}?client={client.link}</span>
            <Btn small color={C.gold} onClick={() => navigator.clipboard?.writeText(baseUrl + "?client=" + client.link)}>📋 Copia</Btn>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[1, 2].map(w => (
              <button key={w} onClick={() => handleWeekChange(w)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer", background: week === w ? C.gold : C.border, color: week === w ? C.white : C.dark, fontWeight: 600 }}>
                Settimana {w} {w === 1 ? "(G1-7)" : "(G8-14)"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
            {days.map(d => (
              <button key={d} onClick={() => setActiveDay(d)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, background: activeDay === d ? C.blue : C.gray, color: activeDay === d ? C.white : C.dark, fontWeight: activeDay === d ? 700 : 400 }}>{d}</button>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: C.dark, marginBottom: 8 }}>📊 Dati compilati – {activeDay}:</div>
            <div style={{ background: C.gray, borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 13 }}>
              <strong>Data:</strong> {wkData[activeDay]?.date || "—"} &nbsp;|&nbsp; <strong>Note:</strong> {wkData[activeDay]?.note || "—"}
            </div>
            {SECTIONS.map(sec => (
              <div key={sec.key} style={{ marginBottom: 10, background: C.blueLight, borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, color: C.blue, marginBottom: 6 }}>{sec.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {sec.fields.map(f => {
                    const val = wkData[activeDay]?.[sec.key + "__" + f];
                    return <div key={f} style={{ fontSize: 13 }}><span style={{ color: "#888" }}>{f}: </span><span style={{ fontWeight: 600 }}>{val || "—"}</span></div>;
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff8e1", border: `1px solid ${C.gold}`, borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 700, color: C.gold, marginBottom: 8 }}>✍️ Le mie note / migliorie – Settimana {week}:</div>
            <Input value={note} onChange={setNote} placeholder="Scrivi qui le tue osservazioni e suggerimenti..." multiline />
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <Btn onClick={saveNote} color={noteSaved ? C.green : C.gold} small>{noteSaved ? "✓ Salvato!" : "Salva nota"}</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", minHeight: "100vh", background: C.white }}>
      <Header title="👩‍💼 Pannello Consulente" sub="Gestione clienti – Monitoraggio Sonno" />
      <div style={{ padding: 16 }}>
        <div style={{ background: C.goldLight, borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>➕ Aggiungi nuova cliente:</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 12 }}>Nome mamma *</label>
              <Input value={newName} onChange={setNewName} placeholder="Nome della mamma..." />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 12 }}>Nome papà</label>
              <Input value={newPapa} onChange={setNewPapa} placeholder="Nome del papà..." />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Btn onClick={() => { if (newName.trim()) { onAddClient(newName.trim(), newPapa.trim()); setNewName(""); setNewPapa(""); } }}>Aggiungi</Btn>
            </div>
          </div>
        </div>

        {clients.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", padding: 40 }}>Nessuna cliente ancora. Aggiungine una! 👆</div>
        ) : clients.map(c => (
          <div key={c.id} style={{ background: C.gray, borderRadius: 10, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 12, border: `1px solid ${C.border}` }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              {c.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>👩 {c.name}{c.papa ? " · 👨 " + c.papa : ""}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Aggiunta il {c.createdAt}</div>
              <div style={{ fontSize: 11, color: C.blue, marginTop: 2 }}>Link: ...?client={c.link}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Btn small onClick={() => openClient(c)} color={C.blue}>Apri scheda</Btn>
              <Btn small onClick={() => { if (window.confirm(`Eliminare ${c.name}?`)) onDeleteClient(c.id); }} color={C.red}>Elimina</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login({ onLogin, clients }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cl = p.get("client");
    if (cl) { const found = clients.find(c => c.link === cl); if (found) onLogin("client", found); }
  }, [clients]);

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", background: C.white, borderRadius: 16, boxShadow: "0 4px 24px #0002", overflow: "hidden" }}>
      <Header title="Accesso Consulente" sub="Pannello di gestione clienti" />
      <div style={{ padding: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 600 }}>Codice di accesso:</label>
        <div style={{ margin: "8px 0" }}><Input value={code} onChange={setCode} placeholder="Inserisci il codice..." /></div>
        {err && <div style={{ color: C.red, fontSize: 13, marginBottom: 8 }}>{err}</div>}
        <Btn onClick={() => { code === CONSULTANT_CODE ? onLogin("consultant") : setErr("Codice non corretto"); }}>Accedi</Btn>
        <div style={{ marginTop: 16, fontSize: 12, color: "#888" }}>Le clienti accedono tramite il loro link personale.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients().then(c => { setClients(c); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!loading) {
      const p = new URLSearchParams(window.location.search);
      const cl = p.get("client");
      if (cl) { const found = clients.find(c => c.link === cl); if (found) { setActiveClient(found); setRole("client"); } }
    }
  }, [loading, clients]);

  async function addClient(name, papa) {
    const c = emptyClient(name, papa);
    setClients(prev => [...prev, c]);
    await saveClient(c);
  }

  async function updateClient(upd) {
    setClients(prev => prev.map(c => c.id === upd.id ? upd : c));
    await saveClient(upd);
    if (activeClient?.id === upd.id) setActiveClient(upd);
  }

  async function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id !== id));
    await removeClient(id);
  }

  async function saveClientData(data) {
    if (!activeClient) return;
    const upd = { ...activeClient, ...data };
    setActiveClient(upd);
    setClients(prev => prev.map(c => c.id === upd.id ? upd : c));
    await saveClient(upd);
  }

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: C.gold, fontSize: 20 }}>Caricamento...</div>;
  if (!role) return <Login clients={clients} onLogin={(r, cl) => { setRole(r); if (cl) setActiveClient(cl); }} />;
  if (role === "client" && activeClient) { const fresh = clients.find(c => c.id === activeClient.id) || activeClient; return <ClientView client={fresh} onSave={saveClientData} />; }
  if (role === "consultant") return <ConsultantView clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} />;
  return null;
}
