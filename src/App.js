import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

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
const DAYS_W1 = ["Giorno 1","Giorno 2","Giorno 3","Giorno 4","Giorno 5","Giorno 6","Giorno 7"];
const DAYS_W2 = ["Giorno 8","Giorno 9","Giorno 10","Giorno 11","Giorno 12","Giorno 13","Giorno 14"];
const NOTE_SECTIONS = ["mattina","pomeriggio","pisolino_extra","sera","notte"];

const SECTIONS = [
  { label:"MATTINA", key:"mattina", fields:["Svegliato/a","Colazione","Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Pranzo alle"] },
  { label:"POMERIGGIO", key:"pomeriggio", fields:["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino"] },
  { label:"PISOLINO EXTRA", key:"pisolino_extra", fields:["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Tot ore giorno"] },
  { label:"SERA", key:"sera", fields:["Cena alle","Stanco/a alle ore...","Inizio routine","Fine routine","Stanco/a da 1a10","Addormentato/a","Come","Posizione Stanza"] },
  { label:"NOTTE", key:"notte", fields:["Risveglio 1 - Tempo sveglio/a","Risveglio 1 - Note","Risveglio 2 - Tempo sveglio/a","Risveglio 2 - Note","Risveglio 3 - Tempo sveglio/a","Risveglio 3 - Note","Risveglio 4 - Tempo sveglio/a","Risveglio 4 - Note","Risveglio 5 - Tempo sveglio/a","Risveglio 5 - Note","Risveglio 6 - Tempo sveglio/a","Risveglio 6 - Note","Risveglio 7 - Tempo sveglio/a","Risveglio 7 - Note","Sveglio/a alle","Sveglio/a definitivamente"] }
];

const QUESTIONARIO_SEZIONI = [
  { titolo:"DETTAGLI GENITORI", campi:[
    {key:"gen1_nome",label:"Nome genitore 1",tipo:"text"},{key:"gen1_prof",label:"Professione genitore 1",tipo:"text"},{key:"gen1_eta",label:"Eta genitore 1",tipo:"text"},
    {key:"gen2_nome",label:"Nome genitore 2",tipo:"text"},{key:"gen2_prof",label:"Professione genitore 2",tipo:"text"},{key:"gen2_eta",label:"Eta genitore 2",tipo:"text"}
  ]},
  { titolo:"DETTAGLI FIGLI", note:"Scrivere i dettagli di tutti i figli", campi:[
    {key:"figlio1_nome",label:"Nome figlio 1",tipo:"text"},{key:"figlio1_sesso",label:"Sesso (M/F)",tipo:"text"},{key:"figlio1_anni",label:"Anni",tipo:"text"},{key:"figlio1_mesi",label:"Mesi",tipo:"text"},
    {key:"figlio2_nome",label:"Nome figlio 2 (se presente)",tipo:"text"},{key:"figlio2_sesso",label:"Sesso (M/F)",tipo:"text"},{key:"figlio2_anni",label:"Anni",tipo:"text"},{key:"figlio2_mesi",label:"Mesi",tipo:"text"}
  ]},
  { titolo:"ALTRE PERSONE COINVOLTE", note:"Nonni, zii, fratelli maggiori, babysitter ecc.", campi:[
    {key:"altri1_nome",label:"Nome",tipo:"text"},{key:"altri1_relazione",label:"Relazione",tipo:"text"},{key:"altri1_eta",label:"Eta",tipo:"text"},{key:"altri1_occupazione",label:"Occupazione",tipo:"text"},{key:"altri1_viveincase",label:"Vive in casa (Si/No)",tipo:"text"},
    {key:"altri2_nome",label:"Nome (2)",tipo:"text"},{key:"altri2_relazione",label:"Relazione (2)",tipo:"text"},{key:"altri2_eta",label:"Eta (2)",tipo:"text"},{key:"altri2_occupazione",label:"Occupazione (2)",tipo:"text"},{key:"altri2_viveincase",label:"Vive in casa (Si/No) (2)",tipo:"text"},
    {key:"altri_ulteriori",label:"Ulteriori informazioni",tipo:"area"}
  ]},
  { titolo:"INFORMAZIONI GENERALI SUL BAMBINO", campi:[
    {key:"bimbo_nome",label:"Nome",tipo:"text"},{key:"bimbo_nascita",label:"Data di nascita",tipo:"text"},
    {key:"gravidanza_pianificata",label:"E stata una gravidanza pianificata?",tipo:"area"},
    {key:"problemi_gravidanza",label:"Problemi durante la gravidanza?",tipo:"area"},
    {key:"complicazioni_parto",label:"Complicazioni durante il parto?",tipo:"area"},
    {key:"prematuro",label:"Il bambino e nato prematuro? Se si, di quante settimane?",tipo:"area"},
    {key:"problemi_medici",label:"Ci sono stati problemi medici dalla nascita a ora?",tipo:"area"},
    {key:"pediatra_consultato",label:"Avete consultato il pediatra per escludere problemi che influiscono sul sonno?",tipo:"area"},
    {key:"pediatra_ok",label:"Il pediatra sostiene che il bambino dovrebbe dormire senza problemi?",tipo:"area"}
  ]},
  { titolo:"TAPPE DELLO SVILUPPO", campi:[
    {key:"step_ruotarsi",label:"Ruotarsi da sdraiato",tipo:"text"},{key:"step_sedersi",label:"Sedersi",tipo:"text"},
    {key:"step_strusciare",label:"Strusciare per terra",tipo:"text"},{key:"step_gattonare",label:"Gattonare",tipo:"text"},
    {key:"step_alzarsi",label:"Alzarsi",tipo:"text"},{key:"step_camminare",label:"Camminare",tipo:"text"},{key:"step_parole",label:"Prime parole",tipo:"text"}
  ]},
  { titolo:"ABITUDINI DEL BAMBINO", campi:[
    {key:"ciuccio",label:"Usa il ciuccio (Si/No)",tipo:"text"},{key:"oggetto_preferito",label:"Ha un oggetto preferito (Si/No - descrivi)",tipo:"area"},
    {key:"dito",label:"Ciuccia il dito (Si/No)",tipo:"text"},{key:"bagna_letto",label:"Bagna il letto la notte (Si/No - quante volte?)",tipo:"area"}
  ]},
  { titolo:"ALIMENTAZIONE", campi:[
    {key:"allattamento",label:"Allattamento/Pasti (Formula / Seno / Svezzato)",tipo:"text"},
    {key:"cibo_solido",label:"Ha iniziato a mangiare cibo solido? (Si/No - quando?)",tipo:"area"},
    {key:"biberon",label:"Usa il biberon? Descrivi quando e quanto",tipo:"area"}
  ]},
  { titolo:"CONDIZIONI MEDICHE DURANTE IL SONNO", campi:[
    {key:"sonnambulo",label:"E sonnambulo (Si/No - descrivi)",tipo:"area"},{key:"russa",label:"Russa (Si/No - descrivi)",tipo:"area"},
    {key:"bocca_aperta",label:"Respira con la bocca (Si/No)",tipo:"area"},{key:"cade_letto",label:"Cade dal letto (Si/No)",tipo:"area"},
    {key:"sonno_agitato",label:"Ha un sonno agitato (Si/No)",tipo:"area"},{key:"suda",label:"Suda (Si/No)",tipo:"area"},
    {key:"reflusso",label:"Ha avuto reflusso e/o coliche?",tipo:"area"},{key:"allergie",label:"Allergie",tipo:"area"},
    {key:"orecchie",label:"Frequenti infezioni alle orecchie",tipo:"area"},{key:"asma",label:"Asma",tipo:"area"},
    {key:"raffreddore",label:"Raffreddore frequente",tipo:"area"}
  ]},
  { titolo:"CARATTERE E COMPORTAMENTO", campi:[
    {key:"carattere",label:"Come descrivereste il carattere di vostro figlio?",tipo:"area"},
    {key:"tempo_solo",label:"Come sopporta il tempo da solo (da sveglio)?",tipo:"area"},
    {key:"calmarsi",label:"Cose che usa per calmarsi da solo?",tipo:"area"}
  ]},
  { titolo:"GIORNATA TIPO", campi:[
    {key:"orario_risveglio",label:"Orario risveglio (in media)",tipo:"text"},{key:"colazione_dove",label:"Colazione (orario e dove)",tipo:"text"},
    {key:"pisolino1",label:"Pisolino 1 (ora, durata, dove e come)",tipo:"area"},{key:"pisolino2",label:"Pisolino 2 (ora, durata, dove e come)",tipo:"area"},
    {key:"pisolino3",label:"Pisolino 3-4 se lo fa",tipo:"area"},{key:"tot_sonno_diurno",label:"Totale ore sonno diurno",tipo:"text"},
    {key:"orario_pranzo",label:"Orario pranzo",tipo:"text"},{key:"orario_cena",label:"Orario cena",tipo:"text"},
    {key:"fasce_stanco",label:"Fasce orarie in cui sembra stanco",tipo:"area"},{key:"routine_nanna",label:"Routine nanna (orario, durata, cosa fate)",tipo:"area"},
    {key:"addormentamento_serale",label:"Addormentamento serale (orario, durata, chi e cosa fate)",tipo:"area"},
    {key:"risvegli_notturni",label:"Risvegli notturni (quanti, durata, come gestiti)",tipo:"area"}
  ]},
  { titolo:"DOMANDE SUL SONNO", campi:[
    {key:"da_quanto",label:"Da quanto vanno avanti i problemi di sonno?",tipo:"area"},
    {key:"tecniche_provate",label:"Avete gia provato qualche tecnica? (Cosa, come, per quanto, risultati)",tipo:"area"},
    {key:"culla_lettino",label:"Dorme nella culla o in un lettino?",tipo:"text"},{key:"camera",label:"In che camera dorme?",tipo:"text"},
    {key:"letto_genitori",label:"Se dorme nel vostro letto - e un problema? Volete cambiarlo?",tipo:"area"},
    {key:"cambia_location",label:"Cambia location durante la notte?",tipo:"area"},
    {key:"condivide_camera",label:"Condivide la camera con qualcuno?",tipo:"area"},
    {key:"sta_in_culla",label:"Sta nella culla senza cercare di uscire?",tipo:"area"},
    {key:"altri_bimbi_orario",label:"Se avete altri bambini - vanno a letto alla stessa ora?",tipo:"text"},
    {key:"stanco_giorno",label:"Sembra stanco durante il giorno?",tipo:"text"},
    {key:"paura_buio_bimbo",label:"Credete abbia paura del buio?",tipo:"area"},
    {key:"lucina",label:"Lasciate una lucina o la porta aperta?",tipo:"area"},
    {key:"angosciato",label:"E angosciato se lasciato solo nella culla?",tipo:"area"},
    {key:"batte_testa",label:"Batte la testa alla culla se angosciato?",tipo:"area"},
    {key:"state_con_lui",label:"State con lui mentre si addormenta?",tipo:"area"},
    {key:"tempo_addormentarsi",label:"Quanto tempo ci mette per addormentarsi?",tipo:"text"},
    {key:"incubi",label:"Ha incubi? (quante volte, ora, durata, come vi comportate)",tipo:"area"},
    {key:"sveglia_notte",label:"Si sveglia durante la notte? (perche, quanto sta sveglio, cosa fate)",tipo:"area"},
    {key:"schema_risvegli",label:"C'e uno schema nei risvegli?",tipo:"area"},
    {key:"altri_bimbi_sonno",label:"Altri figli con problemi di sonno? Come avete risolto?",tipo:"area"}
  ]},
  { titolo:"DOMANDE AI GENITORI", campi:[
    {key:"genitori_dormono",label:"Riuscite a dormire mentre il bambino dorme?",tipo:"area"},
    {key:"paure_infanzia",label:"Avete avuto problemi o paure da bambini?",tipo:"area"},
    {key:"pensieri_attuali",label:"State avendo pensieri particolari in questo periodo?",tipo:"area"},
    {key:"paura_buio_genitori",label:"Avete o avete avuto paura del buio?",tipo:"text"},
    {key:"volonta",label:"Avete entrambi volonta di aiutare il bambino a dormire meglio?",tipo:"area"},
    {key:"chi_partecipa",label:"Chi partecipera a questo percorso?",tipo:"area"},
    {key:"obiettivi",label:"Qual e l'esito finale che vorreste ottenere? (siate specifici)",tipo:"area"},
    {key:"ulteriori_info",label:"Ulteriori informazioni",tipo:"area"}
  ]}
];

const C = { gold:"#b8960c", goldLight:"#f5e9b8", blue:"#6b8cae", blueLight:"#dde8f3", dark:"#2d2d2d", gray:"#f7f7f7", white:"#ffffff", border:"#e0e0e0", green:"#4caf50", red:"#e53935", olive:"#7a7a2a" };

function emptyDay() {
  const d = { date:"", note:"" };
  SECTIONS.forEach(s => { s.fields.forEach(f => { d[s.key+"__"+f] = ""; }); });
  NOTE_SECTIONS.forEach(k => { d[k+"__NOTE_CLIENTE"] = ""; d[k+"__NOTE_CONSULENTE"] = ""; });
  d["caro_diario__shared"] = "";
  d["caro_diario__consulente"] = "";
  return d;
}

function emptyDays(days) {
  const data = {};
  days.forEach(d => { data[d] = emptyDay(); });
  return data;
}

function emptyQuestionario() {
  const q = {};
  QUESTIONARIO_SEZIONI.forEach(s => s.campi.forEach(c => { q[c.key] = ""; }));
  return q;
}

function emptyClient(name, papa) {
  return {
    id: Date.now().toString(), name, papa: papa||"",
    link: Math.random().toString(36).slice(2,10),
    createdAt: new Date().toLocaleDateString("it-IT"),
    week1: emptyDays(DAYS_W1), week2: emptyDays(DAYS_W2),
    questionario: emptyQuestionario()
  };
}

function safeWeek(client, weekNum) {
  const days = weekNum===1 ? DAYS_W1 : DAYS_W2;
  const wk = client["week"+weekNum] || {};
  const result = {};
  days.forEach(d => { result[d] = wk[d] ? { ...emptyDay(), ...wk[d] } : emptyDay(); });
  return result;
}

async function loadClients() {
  try { const snap = await getDocs(collection(db,"clients")); return snap.docs.map(d => d.data()); }
  catch(e) { return []; }
}
async function saveClient(c) { await setDoc(doc(db,"clients",c.id), c); }
async function removeClient(id) { await deleteDoc(doc(db,"clients",id)); }

function Header({ title, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"24px 16px 8px", background:"linear-gradient(135deg,#f5e9b8,#dde8f3)", borderBottom:"2px solid #b8960c" }}>
      <div style={{ fontFamily:"Georgia,serif", fontSize:28, color:C.gold, letterSpacing:2 }}>With Love</div>
      <div style={{ fontSize:20, fontWeight:700, color:C.dark, marginTop:4 }}>{title}</div>
      {sub && <div style={{ fontSize:13, color:"#666", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Btn({ children, onClick, color, small, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ background:disabled?"#ccc":(color||C.gold), color:"#fff", border:"none", borderRadius:8, padding:small?"6px 14px":"10px 22px", fontSize:small?13:15, fontWeight:600, cursor:disabled?"default":"pointer", margin:4 }}>{children}</button>;
}

function Input({ value, onChange, placeholder, multiline }) {
  const s = { width:"100%", border:"1px solid #e0e0e0", borderRadius:6, padding:"8px 10px", fontSize:14, background:"#fff", boxSizing:"border-box", fontFamily:"inherit" };
  return multiline ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...s,resize:"vertical"}} /> : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s} />;
}

function renderLinks(text) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((p,i) =>
    /^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color:C.blue, wordBreak:"break-all" }}>{p}</a> : <span key={i}>{p}</span>
  );
}

function NoteBox({ value, onChange, dayKey, fieldKey, label, isGold, placeholder, readOnly }) {
  const [expanded, setExpanded] = useState(false);
  const preview = (value||"").slice(0,80);
  const isLong = (value||"").length > 80;
  return (
    <div style={{ flex:1, background:isGold?"#fff8e1":"#eef4fb", borderRadius:8, padding:10, border:"1px solid "+(isGold?C.gold:C.blue) }}>
      <div style={{ fontSize:12, fontWeight:700, color:isGold?C.gold:C.blue, marginBottom:6 }}>{label}</div>
      {expanded ? (
        <div>
          <textarea value={value||""} readOnly={readOnly} onChange={e=>{if(!readOnly)onChange(dayKey,fieldKey,e.target.value);}} rows={3}
            style={{ width:"100%", border:"1px solid #e0e0e0", borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", background:readOnly?"#f5f5f5":"#fff" }} />
          <span onClick={()=>setExpanded(false)} style={{ fontSize:12, color:C.blue, cursor:"pointer", display:"inline-block", marginTop:4 }}>chiudi</span>
        </div>
      ) : (
        <div onClick={()=>setExpanded(true)} style={{ cursor:"pointer" }}>
          <div style={{ fontSize:13, color:(value&&value.length>0)?C.dark:"#aaa", lineHeight:1.5 }}>{(value&&value.length>0)?(isLong?preview+"...":value):(readOnly?"—":placeholder)}</div>
          {isLong && <span style={{ fontSize:12, color:C.blue, display:"inline-block", marginTop:4 }}>leggi tutto</span>}
        </div>
      )}
    </div>
  );
}

function NoteRow({ data, onChange, sectionKey, dayKey, isConsultant }) {
  return (
    <div style={{ marginTop:10, display:"flex", gap:8 }}>
      <NoteBox value={data[sectionKey+"__NOTE_CLIENTE"]||""} onChange={onChange} dayKey={dayKey} fieldKey={sectionKey+"__NOTE_CLIENTE"} label="Note cliente" isGold={false} placeholder="Scrivi le tue note..." readOnly={false} />
      <NoteBox value={data[sectionKey+"__NOTE_CONSULENTE"]||""} onChange={onChange} dayKey={dayKey} fieldKey={sectionKey+"__NOTE_CONSULENTE"} label="Note consulente" isGold={true} placeholder={isConsultant?"Aggiungi nota...":"—"} readOnly={!isConsultant} />
    </div>
  );
}

function CaroDiario({ data, onChange, dayKey, isConsultant }) {
  const clienteVal = data["caro_diario__shared"]||"";
  const consulenteVal = data["caro_diario__consulente"]||"";
  return (
    <div style={{ marginTop:24, background:"linear-gradient(135deg,#fff8e1,#eef4fb)", borderRadius:12, padding:20, border:"2px solid "+C.gold }}>
      <div style={{ textAlign:"center", marginBottom:16 }}>
        <div style={{ fontFamily:"Georgia,serif", fontSize:20, color:C.gold, letterSpacing:1 }}>Caro Diario</div>
        <div style={{ fontSize:13, color:"#888", marginTop:4, fontStyle:"italic" }}>Raccontami le sensazioni che hai avuto in questa giornata</div>
      </div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.dark, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>La tua voce</div>
        {isConsultant ? (
          <div style={{ fontSize:14, color:"#000", background:"#fff", borderRadius:8, padding:"10px 12px", lineHeight:1.8, whiteSpace:"pre-wrap", minHeight:60, border:"1px solid "+C.border }}>
            {clienteVal.length>0 ? renderLinks(clienteVal) : <span style={{ color:"#aaa", fontStyle:"italic" }}>La cliente non ha ancora scritto nulla.</span>}
          </div>
        ) : (
          <textarea value={clienteVal} onChange={e=>onChange(dayKey,"caro_diario__shared",e.target.value)} placeholder="Scrivi qui come ti sei sentita oggi..." rows={5}
            style={{ width:"100%", border:"1px solid "+C.gold, borderRadius:8, padding:"10px 12px", fontSize:14, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", color:"#000", lineHeight:1.6, background:"#fff" }} />
        )}
      </div>
      <div style={{ borderTop:"1px dashed "+C.gold, margin:"16px 0" }} />
      <div>
        <div style={{ fontSize:12, fontWeight:700, color:C.blue, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>In calce - Nota consulente</div>
        {isConsultant ? (
          <textarea value={consulenteVal} onChange={e=>onChange(dayKey,"caro_diario__consulente",e.target.value)} placeholder="Scrivi qui la tua nota in calce..." rows={4}
            style={{ width:"100%", border:"1px solid "+C.blue, borderRadius:8, padding:"10px 12px", fontSize:14, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", color:C.blue, lineHeight:1.6, background:"#eef4fb" }} />
        ) : (
          <div style={{ fontSize:14, color:C.blue, background:"#eef4fb", borderRadius:8, padding:"10px 12px", lineHeight:1.8, whiteSpace:"pre-wrap", minHeight:40, border:"1px solid "+C.blueLight }}>
            {consulenteVal.length>0 ? renderLinks(consulenteVal) : <span style={{ color:"#aaa", fontStyle:"italic" }}>Nessuna nota della consulente ancora.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function DayForm({ dayKey, data, onChange, isConsultant }) {
  if(!data) return null;
  return (
    <div>
      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:12, color:"#888" }}>Data</label>
        <Input value={data.date||""} onChange={v=>onChange(dayKey,"date",v)} placeholder="gg/mm/aaaa" />
      </div>
      {SECTIONS.map(sec => (
        <div key={sec.key} style={{ marginBottom:16, background:C.gray, borderRadius:8, padding:12 }}>
          <div style={{ fontWeight:700, fontSize:14, color:C.blue, marginBottom:8 }}>{sec.label}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {sec.fields.map(f => (
              <div key={f}>
                <label style={{ fontSize:12, color:"#555" }}>{f}</label>
                <Input value={data[sec.key+"__"+f]||""} onChange={v=>onChange(dayKey,sec.key+"__"+f,v)} placeholder="—" />
              </div>
            ))}
          </div>
          {NOTE_SECTIONS.includes(sec.key) && <NoteRow data={data} onChange={onChange} sectionKey={sec.key} dayKey={dayKey} isConsultant={isConsultant} />}
        </div>
      ))}
      <CaroDiario data={data} onChange={onChange} dayKey={dayKey} isConsultant={isConsultant} />
    </div>
  );
}

function TableView({ weekData, weekNum }) {
  const days = weekNum===1 ? DAYS_W1 : DAYS_W2;
  const rows = [];
  SECTIONS.forEach(sec => {
    rows.push({ type:"header", label:sec.label, secKey:sec.key });
    sec.fields.forEach(f => rows.push({ type:"field", label:f, fieldKey:sec.key+"__"+f, secKey:sec.key }));
  });
  const headerBg = { mattina:"#8B7355", pomeriggio:"#6b8cae", pisolino_extra:"#7a7a2a", sera:"#8B7355", notte:"#4a5a6a" };
  const getVal = (day, fieldKey) => (weekData[day] && weekData[day][fieldKey]) || "";
  return (
    <div style={{ overflowX:"auto", fontSize:12 }}>
      <table style={{ borderCollapse:"collapse", minWidth:900, width:"100%" }}>
        <thead>
          <tr>
            <th style={{ background:C.olive, color:"#fff", padding:"8px 10px", textAlign:"left", minWidth:150, position:"sticky", left:0, zIndex:2, border:"1px solid #e0e0e0" }}>ORARI</th>
            {days.map(d => <th key={d} style={{ background:C.olive, color:"#fff", padding:"8px 10px", textAlign:"center", border:"1px solid #e0e0e0" }}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if(row.type==="header") return (
              <tr key={i}><td colSpan={days.length+1} style={{ background:headerBg[row.secKey]||C.blue, color:"#fff", fontWeight:700, padding:"6px 10px", fontSize:13, border:"1px solid #e0e0e0" }}>{row.label}</td></tr>
            );
            const bg = i%2===0?"#f0f4f8":"#fff";
            return (
              <tr key={i} style={{ background:bg }}>
                <td style={{ padding:"4px 10px", fontWeight:500, color:C.dark, position:"sticky", left:0, background:bg, border:"1px solid #e0e0e0", whiteSpace:"nowrap" }}>{row.label}</td>
                {days.map(d => <td key={d} style={{ padding:"4px 8px", border:"1px solid #e0e0e0", maxWidth:120, color:"#333", wordBreak:"break-word" }}>{getVal(d, row.fieldKey)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QField({ label, value, onChange, tipo, readOnly }) {
  const [open, setOpen] = useState(false);
  const preview = (value||"").slice(0,60);
  const hasValue = (value||"").length > 0;
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:13, color:"#555", marginBottom:4, fontWeight:500 }}>{label}</div>
      {open ? (
        <div>
          {tipo==="area"
            ? <textarea value={value||""} readOnly={readOnly} onChange={e=>!readOnly&&onChange(e.target.value)} rows={4} style={{ width:"100%", border:"1px solid "+C.border, borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"inherit", resize:"vertical", boxSizing:"border-box", background:readOnly?"#f5f5f5":"#fff" }} placeholder={readOnly?"—":"Scrivi qui..."} />
            : <input value={value||""} readOnly={readOnly} onChange={e=>!readOnly&&onChange(e.target.value)} style={{ width:"100%", border:"1px solid "+C.border, borderRadius:6, padding:"8px 10px", fontSize:13, fontFamily:"inherit", boxSizing:"border-box", background:readOnly?"#f5f5f5":"#fff" }} placeholder={readOnly?"—":"Scrivi qui..."} />
          }
          <span onClick={()=>setOpen(false)} style={{ fontSize:12, color:C.blue, cursor:"pointer", marginTop:4, display:"inline-block" }}>chiudi</span>
        </div>
      ) : (
        <div onClick={()=>setOpen(true)} style={{ cursor:"pointer", background:hasValue?"#fff":C.gray, border:"1px solid "+C.border, borderRadius:6, padding:"8px 10px", fontSize:13, color:hasValue?C.dark:"#aaa", minHeight:36 }}>
          {hasValue ? (preview.length<(value||"").length?preview+"...":value) : (readOnly?"—":"Tocca per rispondere...")}
        </div>
      )}
    </div>
  );
}

function QuestionarioView({ questionario, onChange, readOnly }) {
  return (
    <div>
      {QUESTIONARIO_SEZIONI.map((sez,si) => (
        <div key={si} style={{ marginBottom:20, background:C.gray, borderRadius:10, padding:14 }}>
          <div style={{ fontWeight:700, fontSize:15, color:C.blue, marginBottom:sez.note?4:10 }}>{sez.titolo}</div>
          {sez.note && <div style={{ fontSize:12, color:"#888", marginBottom:10, fontStyle:"italic" }}>{sez.note}</div>}
          {sez.campi.map(campo => (
            <QField key={campo.key} label={campo.label} value={questionario[campo.key]||""} onChange={v=>onChange(campo.key,v)} tipo={campo.tipo} readOnly={readOnly} />
          ))}
        </div>
      ))}
    </div>
  );
}

function InstallGuide({ platform }) {
  const [open, setOpen] = useState(false);
  const isApple = platform==="apple";
  const steps = isApple
    ? ["1. Apri questo link da Safari (non Chrome!)","2. Tocca il pulsante Condividi in basso","3. Scorri e tocca Aggiungi a schermata Home","4. Tocca Aggiungi in alto a destra","L'app apparira come icona sul tuo iPhone!"]
    : ["1. Apri questo link da Chrome","2. Tocca i 3 puntini in alto a destra","3. Tocca Aggiungi a schermata Home","4. Tocca Aggiungi per confermare","L'app apparira come icona sul tuo Android!"];
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(!open)} style={{ background:isApple?"#555":C.green, color:"#fff", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{isApple?"App iPhone":"App Android"}</button>
      {open && (
        <div style={{ position:"absolute", right:0, top:36, background:"#fff", border:"1px solid #e0e0e0", borderRadius:10, padding:16, width:260, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", zIndex:100 }}>
          <div style={{ fontWeight:700, color:isApple?"#555":C.green, marginBottom:10, fontSize:13 }}>{isApple?"Installa su iPhone/iPad":"Installa su Android"}</div>
          {steps.map((s,i)=><div key={i} style={{ fontSize:13, color:C.dark, marginBottom:8, lineHeight:1.5 }}>{s}</div>)}
          <div onClick={()=>setOpen(false)} style={{ textAlign:"right", fontSize:12, color:C.blue, cursor:"pointer", marginTop:8 }}>Chiudi</div>
        </div>
      )}
    </div>
  );
}

function RegisterPage() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  async function handleSubmit() {
    if(!nome.trim()||!cognome.trim()||!email.trim()) { setErr("Compila tutti i campi."); return; }
    if(!/\S+@\S+\.\S+/.test(email)) { setErr("Inserisci un indirizzo email valido."); return; }
    setSaving(true);
    const c = emptyClient(nome.trim()+" "+cognome.trim(), "");
    c.email = email.trim();
    c.registeredAt = new Date().toLocaleDateString("it-IT");
    await saveClient(c);
    window.location.href = window.location.origin+window.location.pathname+"?client="+c.link;
  }
  return (
    <div style={{ maxWidth:440, margin:"60px auto", background:"#fff", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.1)", overflow:"hidden" }}>
      <Header title="Registrati al percorso" sub="With Love Family – Sleep Coaching" />
      <div style={{ padding:24 }}>
        <div style={{ background:C.blueLight, borderRadius:8, padding:12, fontSize:13, marginBottom:20, lineHeight:1.6 }}>
          Compila il modulo per richiedere il tuo percorso di Sleep Coaching.
        </div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:13, fontWeight:600 }}>Nome *</label><Input value={nome} onChange={setNome} placeholder="Il tuo nome..." /></div>
        <div style={{ marginBottom:12 }}><label style={{ fontSize:13, fontWeight:600 }}>Cognome *</label><Input value={cognome} onChange={setCognome} placeholder="Il tuo cognome..." /></div>
        <div style={{ marginBottom:16 }}><label style={{ fontSize:13, fontWeight:600 }}>Email *</label><Input value={email} onChange={setEmail} placeholder="La tua email..." /></div>
        {err && <div style={{ color:C.red, fontSize:13, marginBottom:12 }}>{err}</div>}
        <Btn onClick={handleSubmit} disabled={saving} color={C.gold}>{saving?"Registrazione in corso...":"Invia richiesta"}</Btn>
      </div>
    </div>
  );
}

// ── CLIENT VIEW ──
function ClientView({ client, onSave }) {
  const [tab, setTab] = useState("w1");
  const [activeDay, setActiveDay] = useState(DAYS_W1[0]);
  const [data, setData] = useState({ week1: safeWeek(client,1), week2: safeWeek(client,2) });
  const [questionario, setQuestionario] = useState(client.questionario||emptyQuestionario());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [tableWeek, setTableWeek] = useState(1);

  const weekNum = tab==="w2" ? 2 : 1;
  const days = weekNum===1 ? DAYS_W1 : DAYS_W2;
  const wkData = data["week"+weekNum];
  const currentDayData = wkData[activeDay] || emptyDay();

  function switchTab(t) {
    setTab(t);
    if(t==="w1") setActiveDay(DAYS_W1[0]);
    else if(t==="w2") setActiveDay(DAYS_W2[0]);
  }

  function handleChange(dayKey, field, val) {
    setData(prev => ({ ...prev, ["week"+weekNum]:{ ...prev["week"+weekNum], [dayKey]:{ ...prev["week"+weekNum][dayKey], [field]:val } } }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ ...data, questionario });
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  }

  if(showTable) return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <Header title={"Ciao "+client.name+"!"} sub="Riepilogo settimana" />
      <div style={{ padding:16 }}>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <Btn onClick={()=>setShowTable(false)} color={C.blue} small>Torna alla scheda</Btn>
          {[1,2].map(w=><button key={w} onClick={()=>setTableWeek(w)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:tableWeek===w?C.gold:"#e0e0e0", color:tableWeek===w?"#fff":C.dark, fontWeight:600, margin:4 }}>Settimana {w}</button>)}
        </div>
        <TableView weekData={data["week"+tableWeek]} weekNum={tableWeek} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:700, margin:"0 auto", minHeight:"100vh", background:"#fff" }}>
      <Header title={"Ciao "+client.name+"! 👶"} sub="Scheda Monitoraggio Percorso Sonno" />
      <div style={{ padding:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
          <Btn small color={C.blue} onClick={()=>window.location.reload()}>Aggiorna dati</Btn>
          <div style={{ display:"flex", gap:8 }}><InstallGuide platform="apple" /><InstallGuide platform="android" /></div>
        </div>
        <div style={{ background:C.blueLight, borderRadius:8, padding:12, fontSize:13, color:C.dark, marginBottom:16, lineHeight:1.8 }}>
          📋 <strong>Questionario:</strong> compilalo almeno 24 ore prima della consulenza.<br/>
          🕐 <strong>Schede giornaliere:</strong> inizia a compilarle solo dopo la consulenza.
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          {[{id:"w1",label:"Settimana 1"},{id:"w2",label:"Settimana 2"},{id:"q",label:"Questionario"}].map(t=>(
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{ flex:1, padding:"10px 4px", borderRadius:8, border:"none", cursor:"pointer", background:tab===t.id?C.gold:"#e0e0e0", color:tab===t.id?"#fff":C.dark, fontWeight:600, fontSize:13 }}>{t.label}</button>
          ))}
        </div>
        {tab==="q" && (
          <div>
            <div style={{ background:"#fff8e1", border:"1px solid "+C.gold, borderRadius:8, padding:12, marginBottom:16, fontSize:13 }}>
              Compila il questionario una volta sola prima di iniziare il percorso.
            </div>
            <QuestionarioView questionario={questionario} onChange={(k,v)=>{setQuestionario(prev=>({...prev,[k]:v}));setSaved(false);}} readOnly={false} />
          </div>
        )}
        {(tab==="w1"||tab==="w2") && (
          <div>
            <div style={{ textAlign:"right", marginBottom:12 }}>
              <Btn small color={C.olive} onClick={()=>{setTableWeek(weekNum);setShowTable(true);}}>Riepilogo settimana</Btn>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:16 }}>
              {days.map(d=><button key={d} onClick={()=>setActiveDay(d)} style={{ padding:"6px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, background:activeDay===d?C.blue:C.gray, color:activeDay===d?"#fff":C.dark, fontWeight:activeDay===d?700:400 }}>{d}</button>)}
            </div>
            <DayForm dayKey={activeDay} data={currentDayData} onChange={handleChange} isConsultant={false} />
          </div>
        )}
        <div style={{ textAlign:"center", marginTop:16 }}>
          <Btn onClick={handleSave} color={saved?C.green:C.gold} disabled={saving}>{saving?"Salvataggio...":saved?"Salvato!":"Salva scheda"}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── CONSULTANT VIEW ──
function ConsultantView({ clients, onAddClient, onUpdateClient, onDeleteClient, onLogout }) {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPapa, setNewPapa] = useState("");
  const [tab, setTab] = useState("w1");
  const [activeDay, setActiveDay] = useState(DAYS_W1[0]);
  const [saved, setSaved] = useState(false);
  const [tableWeek, setTableWeek] = useState(1);

  function openClient(c) { setSelected(c); setTab("w1"); setActiveDay(DAYS_W1[0]); setView("detail"); }
  function openTable(c) { setSelected(c); setTableWeek(1); setView("table"); }

  if(view==="table" && selected) {
    const client = clients.find(c=>c.id===selected.id)||selected;
    const w1 = safeWeek(client,1);
    const w2 = safeWeek(client,2);
    return (
      <div style={{ minHeight:"100vh", background:"#fff" }}>
        <Header title={client.name+" - Vista Tabella"} sub={"Settimana "+tableWeek} />
        <div style={{ padding:16 }}>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            <Btn onClick={()=>setView("list")} color={C.blue} small>Lista clienti</Btn>
            <Btn onClick={()=>setView("detail")} color={C.blue} small>Vista scheda</Btn>
            {[1,2].map(w=><button key={w} onClick={()=>setTableWeek(w)} style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", background:tableWeek===w?C.gold:"#e0e0e0", color:tableWeek===w?"#fff":C.dark, fontWeight:600, margin:4 }}>Settimana {w}</button>)}
          </div>
          <TableView weekData={tableWeek===1?w1:w2} weekNum={tableWeek} />
        </div>
      </div>
    );
  }

  if(view==="detail" && selected) {
    const client = clients.find(c=>c.id===selected.id)||selected;
    const weekNum = tab==="w2"?2:1;
    const days = weekNum===1?DAYS_W1:DAYS_W2;
    const wkData = safeWeek(client, weekNum);
    const currentDayData = wkData[activeDay] || emptyDay();
    const questionario = client.questionario||emptyQuestionario();
    const baseUrl = window.location.origin+window.location.pathname;

    function handleChange(dayKey, field, val) {
      const wk = "week"+weekNum;
      const updated = { ...client, [wk]:{ ...safeWeek(client,weekNum), [dayKey]:{ ...wkData[dayKey], [field]:val } } };
      onUpdateClient(updated);
    }

    function handleQChange(key, val) {
      onUpdateClient({ ...client, questionario:{ ...questionario, [key]:val } });
    }

    function switchTab(t) {
      setTab(t);
      if(t==="w1") setActiveDay(DAYS_W1[0]);
      else if(t==="w2") setActiveDay(DAYS_W2[0]);
    }

    async function handleSave() {
      await onUpdateClient(client);
      setSaved(true); setTimeout(()=>setSaved(false),2500);
    }

    return (
      <div style={{ maxWidth:900, margin:"0 auto", minHeight:"100vh", background:"#fff" }}>
        <Header title={client.name} sub={"Cliente dal "+client.createdAt+(client.papa?" - Papa: "+client.papa:"")} />
        <div style={{ padding:16 }}>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
            <Btn onClick={()=>setView("list")} color={C.blue} small>Lista clienti</Btn>
            <Btn onClick={()=>openTable(client)} color={C.olive} small>Vista tabella</Btn>
          </div>
          <div style={{ background:C.gray, borderRadius:8, padding:12, margin:"12px 0", fontSize:13 }}>
            Link cliente: <span style={{ color:C.blue, wordBreak:"break-all" }}>{baseUrl}?client={client.link}</span>
            <Btn small color={C.gold} onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(baseUrl+"?client="+client.link)}>Copia</Btn>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:16 }}>
            {[{id:"w1",label:"Settimana 1"},{id:"w2",label:"Settimana 2"},{id:"q",label:"Questionario"}].map(t=>(
              <button key={t.id} onClick={()=>switchTab(t.id)} style={{ flex:1, padding:"10px 4px", borderRadius:8, border:"none", cursor:"pointer", background:tab===t.id?C.gold:"#e0e0e0", color:tab===t.id?"#fff":C.dark, fontWeight:600, fontSize:13 }}>{t.label}</button>
            ))}
          </div>
          {tab==="q" && <QuestionarioView questionario={questionario} onChange={handleQChange} readOnly={false} />}
          {(tab==="w1"||tab==="w2") && (
            <div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:16 }}>
                {days.map(d=><button key={d} onClick={()=>setActiveDay(d)} style={{ padding:"6px 10px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, background:activeDay===d?C.blue:C.gray, color:activeDay===d?"#fff":C.dark, fontWeight:activeDay===d?700:400 }}>{d}</button>)}
              </div>
              <DayForm dayKey={activeDay} data={currentDayData} onChange={handleChange} isConsultant={true} />
            </div>
          )}
          <div style={{ textAlign:"center", marginTop:16 }}>
            <Btn onClick={handleSave} color={saved?C.green:C.gold}>{saved?"Salvato!":"Salva modifiche"}</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:700, margin:"0 auto", minHeight:"100vh", background:"#fff" }}>
      <Header title="Pannello Consulente" sub="Gestione clienti - Monitoraggio Sonno" />
      <div style={{ padding:16 }}>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:8 }}>
          <Btn small color={C.blue} onClick={()=>window.location.reload()}>Ricarica dati</Btn>
          <Btn small color={C.red} onClick={onLogout}>Esci</Btn>
        </div>
        <div style={{ background:"#e8f5e9", border:"1px solid "+C.green, borderRadius:8, padding:12, marginBottom:16, fontSize:13, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:700, color:C.green, marginBottom:2 }}>Link di registrazione pubblica</div>
            <div style={{ color:"#555", fontSize:12 }}>Condividilo — chi si registra appare subito qui!</div>
          </div>
          <Btn small color={C.green} onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(window.location.origin+window.location.pathname+"?register=true")}>Copia link</Btn>
        </div>
        <div style={{ background:C.goldLight, borderRadius:8, padding:16, marginBottom:20 }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:10 }}>Aggiungi nuova cliente:</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:140 }}><label style={{ fontSize:12 }}>Nome mamma</label><Input value={newName} onChange={setNewName} placeholder="Nome..." /></div>
            <div style={{ flex:1, minWidth:140 }}><label style={{ fontSize:12 }}>Nome papa</label><Input value={newPapa} onChange={setNewPapa} placeholder="Nome..." /></div>
            <div style={{ display:"flex", alignItems:"flex-end" }}><Btn onClick={()=>{if(newName.trim()){onAddClient(newName.trim(),newPapa.trim());setNewName("");setNewPapa("");}}} >Aggiungi</Btn></div>
          </div>
        </div>
        {clients.length===0 ? (
          <div style={{ textAlign:"center", color:"#888", padding:40 }}>Nessuna cliente ancora.</div>
        ) : clients.map(c=>(
          <div key={c.id} style={{ background:C.gray, borderRadius:10, padding:16, marginBottom:12, display:"flex", alignItems:"center", gap:12, border:"1px solid #e0e0e0" }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#b8960c,#6b8cae)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18, flexShrink:0 }}>{c.name[0].toUpperCase()}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{c.name}{c.papa?" - "+c.papa:""}</div>
              <div style={{ fontSize:12, color:"#888" }}>Aggiunta il {c.createdAt}</div>
              {c.email && <div style={{ fontSize:12, color:C.olive, marginTop:2 }}>📧 {c.email}</div>}
              <div style={{ fontSize:11, color:C.blue, marginTop:2 }}>Link: ...?client={c.link}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <Btn small onClick={()=>openClient(c)} color={C.blue}>Scheda</Btn>
              <Btn small onClick={()=>openTable(c)} color={C.olive}>Tabella</Btn>
              <Btn small onClick={()=>{if(window.confirm("Eliminare "+c.name+"?"))onDeleteClient(c.id);}} color={C.red}>Elimina</Btn>
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
  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    const cl = p.get("client");
    if(cl) { const found = clients.find(c=>c.link===cl); if(found) onLogin("client",found); }
  },[clients]);
  return (
    <div style={{ maxWidth:400, margin:"60px auto", background:"#fff", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.1)", overflow:"hidden" }}>
      <Header title="Accesso Consulente" sub="Pannello di gestione clienti" />
      <div style={{ padding:24 }}>
        <label style={{ fontSize:14, fontWeight:600 }}>Codice di accesso:</label>
        <div style={{ margin:"8px 0" }}><Input value={code} onChange={setCode} placeholder="Inserisci il codice..." /></div>
        {err && <div style={{ color:C.red, fontSize:13, marginBottom:8 }}>{err}</div>}
        <Btn onClick={()=>{code===CONSULTANT_CODE?onLogin("consultant"):setErr("Codice non corretto");}}>Accedi</Btn>
        <div style={{ marginTop:16, fontSize:12, color:"#888" }}>Le clienti accedono tramite il loro link personale.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(()=>sessionStorage.getItem("role")||null);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(()=>{
    const p = new URLSearchParams(window.location.search);
    if(p.get("register")==="true") setIsRegister(true);
    loadClients().then(c=>{ setClients(c); setLoading(false); });
  },[]);

  useEffect(()=>{
    if(!loading){
      const p = new URLSearchParams(window.location.search);
      const cl = p.get("client");
      if(cl){ const found=clients.find(c=>c.link===cl); if(found){ setActiveClient(found); setRole("client"); sessionStorage.setItem("role","client"); } }
    }
  },[loading,clients]);

  async function addClient(name,papa){ const c=emptyClient(name,papa); setClients(prev=>[...prev,c]); await saveClient(c); }
  async function updateClient(upd){ setClients(prev=>prev.map(c=>c.id===upd.id?upd:c)); await saveClient(upd); if(activeClient&&activeClient.id===upd.id)setActiveClient(upd); }
  async function deleteClient(id){ setClients(prev=>prev.filter(c=>c.id!==id)); await removeClient(id); }
  async function saveClientData(data){ if(!activeClient)return; const upd={...activeClient,...data}; setActiveClient(upd); setClients(prev=>prev.map(c=>c.id===upd.id?upd:c)); await saveClient(upd); }
  function handleLogin(r,cl){ setRole(r); sessionStorage.setItem("role",r); if(cl)setActiveClient(cl); }
  function handleLogout(){ setRole(null); sessionStorage.removeItem("role"); }

  if(loading) return <div style={{ textAlign:"center", padding:60, color:C.gold, fontSize:20 }}>Caricamento...</div>;
  if(isRegister) return <RegisterPage />;
  if(!role) return <Login clients={clients} onLogin={handleLogin} />;
  if(role==="client"&&activeClient){ const fresh=clients.find(c=>c.id===activeClient.id)||activeClient; return <ClientView client={fresh} onSave={saveClientData} />; }
  if(role==="consultant") return <ConsultantView clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} onLogout={handleLogout} />;
  return null;
}
