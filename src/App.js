import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

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
const auth = getAuth(firebaseApp);

// Registrazione libera, senza codice invito, per entrambe le sezioni:
// sonno (link ?register=true) e diario/pannolino (link ?register=modulo)

// Limite di accesso all'app (solo app, non il corso). Vale per sonno e modulo.
// Scaduti i 6 mesi l'account viene cancellato e al rientro compare il messaggio di fine periodo.
const APP_ACCESS_MONTHS = 6;

// Modulo "Diario della giornata": giorni di partenza + righe iniziali per giorno
const MODULO_DEFAULT_DAYS = ["Giorno 1","Giorno 2","Giorno 3"];
const MODULO_ROWS_START = 5;

const DAYS_W1 = ["Giorno 1","Giorno 2","Giorno 3","Giorno 4","Giorno 5","Giorno 6","Giorno 7"];
const DAYS_W2 = ["Giorno 8","Giorno 9","Giorno 10","Giorno 11","Giorno 12","Giorno 13","Giorno 14"];
const NOTE_SECTIONS = ["mattina","pomeriggio","pisolino_extra","sera","notte"];

const SECTIONS = [
  { label:"Mattina", key:"mattina", icon:"", color:"#FBF0E6", fields:["Svegliato/a","Colazione","Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Pranzo alle"] },
  { label:"Pomeriggio", key:"pomeriggio", icon:"", color:"#EDE8F5", fields:["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino"] },
  { label:"Pisolino Extra", key:"pisolino_extra", icon:"", color:"#E6F4EF", fields:["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Tot ore giorno"] },
  { label:"Sera", key:"sera", icon:"", color:"#EDE8F5", fields:["Cena alle","Stanco/a alle ore...","Inizio routine","Fine routine","Stanco/a da 1a10","Addormentato/a","Come","Posizione Stanza"] },
  { label:"Notte", key:"notte", icon:"", color:"#E8E6F5", fields:["Risveglio 1 - Tempo sveglio/a","Risveglio 1 - Note","Risveglio 2 - Tempo sveglio/a","Risveglio 2 - Note","Risveglio 3 - Tempo sveglio/a","Risveglio 3 - Note","Risveglio 4 - Tempo sveglio/a","Risveglio 4 - Note","Risveglio 5 - Tempo sveglio/a","Risveglio 5 - Note","Risveglio 6 - Tempo sveglio/a","Risveglio 6 - Note","Risveglio 7 - Tempo sveglio/a","Risveglio 7 - Note","Sveglio/a alle","Sveglio/a definitivamente"] }
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
    {key:"gravidanza_pianificata",label:"E stata una gravidanza pianificata?",tipo:"area"},{key:"problemi_gravidanza",label:"Problemi durante la gravidanza?",tipo:"area"},
    {key:"complicazioni_parto",label:"Complicazioni durante il parto?",tipo:"area"},{key:"prematuro",label:"Nato prematuro? Di quante settimane?",tipo:"area"},
    {key:"problemi_medici",label:"Problemi medici dalla nascita a ora?",tipo:"area"},
    {key:"pediatra_consultato",label:"Avete consultato il pediatra per il sonno?",tipo:"area"},
    {key:"pediatra_ok",label:"Il pediatra sostiene che puo dormire senza problemi?",tipo:"area"}
  ]},
  { titolo:"TAPPE DELLO SVILUPPO", campi:[
    {key:"step_ruotarsi",label:"Ruotarsi da sdraiato",tipo:"text"},{key:"step_sedersi",label:"Sedersi",tipo:"text"},
    {key:"step_strusciare",label:"Strusciare per terra",tipo:"text"},{key:"step_gattonare",label:"Gattonare",tipo:"text"},
    {key:"step_alzarsi",label:"Alzarsi",tipo:"text"},{key:"step_camminare",label:"Camminare",tipo:"text"},{key:"step_parole",label:"Prime parole",tipo:"text"}
  ]},
  { titolo:"ABITUDINI DEL BAMBINO", campi:[
    {key:"ciuccio",label:"Usa il ciuccio (Si/No)",tipo:"text"},{key:"oggetto_preferito",label:"Ha un oggetto preferito?",tipo:"area"},
    {key:"dito",label:"Ciuccia il dito (Si/No)",tipo:"text"},{key:"bagna_letto",label:"Bagna il letto la notte?",tipo:"area"}
  ]},
  { titolo:"ALIMENTAZIONE", campi:[
    {key:"allattamento",label:"Allattamento/Pasti (Formula / Seno / Svezzato)",tipo:"text"},
    {key:"cibo_solido",label:"Ha iniziato a mangiare cibo solido?",tipo:"area"},{key:"biberon",label:"Usa il biberon? Quando e quanto",tipo:"area"}
  ]},
  { titolo:"CONDIZIONI MEDICHE DURANTE IL SONNO", campi:[
    {key:"sonnambulo",label:"E sonnambulo?",tipo:"area"},{key:"russa",label:"Russa?",tipo:"area"},
    {key:"bocca_aperta",label:"Respira con la bocca?",tipo:"area"},{key:"cade_letto",label:"Cade dal letto?",tipo:"area"},
    {key:"sonno_agitato",label:"Ha un sonno agitato?",tipo:"area"},{key:"suda",label:"Suda?",tipo:"area"},
    {key:"reflusso",label:"Ha avuto reflusso e/o coliche?",tipo:"area"},{key:"allergie",label:"Allergie",tipo:"area"},
    {key:"orecchie",label:"Frequenti infezioni alle orecchie",tipo:"area"},{key:"asma",label:"Asma",tipo:"area"},
    {key:"raffreddore",label:"Raffreddore frequente",tipo:"area"}
  ]},
  { titolo:"CARATTERE E COMPORTAMENTO", campi:[
    {key:"carattere",label:"Come descrivereste il carattere di vostro figlio?",tipo:"area"},
    {key:"tempo_solo",label:"Come sopporta il tempo da solo?",tipo:"area"},
    {key:"calmarsi",label:"Cose che usa per calmarsi da solo?",tipo:"area"}
  ]},
  { titolo:"GIORNATA TIPO", campi:[
    {key:"orario_risveglio",label:"Orario risveglio (in media)",tipo:"text"},{key:"colazione_dove",label:"Colazione (orario e dove)",tipo:"text"},
    {key:"pisolino1",label:"Pisolino 1 (ora, durata, dove e come)",tipo:"area"},{key:"pisolino2",label:"Pisolino 2",tipo:"area"},
    {key:"pisolino3",label:"Pisolino 3-4 se lo fa",tipo:"area"},{key:"tot_sonno_diurno",label:"Totale ore sonno diurno",tipo:"text"},
    {key:"orario_pranzo",label:"Orario pranzo",tipo:"text"},{key:"orario_cena",label:"Orario cena",tipo:"text"},
    {key:"fasce_stanco",label:"Fasce orarie in cui sembra stanco",tipo:"area"},{key:"routine_nanna",label:"Routine nanna",tipo:"area"},
    {key:"addormentamento_serale",label:"Addormentamento serale",tipo:"area"},{key:"risvegli_notturni",label:"Risvegli notturni",tipo:"area"}
  ]},
  { titolo:"DOMANDE SUL SONNO", campi:[
    {key:"da_quanto",label:"Da quanto vanno avanti i problemi di sonno?",tipo:"area"},
    {key:"tecniche_provate",label:"Avete gia provato qualche tecnica?",tipo:"area"},
    {key:"culla_lettino",label:"Dorme nella culla o in un lettino?",tipo:"text"},{key:"camera",label:"In che camera dorme?",tipo:"text"},
    {key:"letto_genitori",label:"Se dorme nel vostro letto - e un problema?",tipo:"area"},
    {key:"cambia_location",label:"Cambia location durante la notte?",tipo:"area"},
    {key:"condivide_camera",label:"Condivide la camera con qualcuno?",tipo:"area"},
    {key:"sta_in_culla",label:"Sta nella culla senza cercare di uscire?",tipo:"area"},
    {key:"altri_bimbi_orario",label:"Altri bambini - vanno a letto alla stessa ora?",tipo:"text"},
    {key:"stanco_giorno",label:"Sembra stanco durante il giorno?",tipo:"text"},
    {key:"paura_buio_bimbo",label:"Credete abbia paura del buio?",tipo:"area"},
    {key:"lucina",label:"Lasciate una lucina o la porta aperta?",tipo:"area"},
    {key:"angosciato",label:"E angosciato se lasciato solo nella culla?",tipo:"area"},
    {key:"batte_testa",label:"Batte la testa alla culla se angosciato?",tipo:"area"},
    {key:"state_con_lui",label:"State con lui mentre si addormenta?",tipo:"area"},
    {key:"tempo_addormentarsi",label:"Quanto tempo ci mette per addormentarsi?",tipo:"text"},
    {key:"incubi",label:"Ha incubi?",tipo:"area"},{key:"sveglia_notte",label:"Si sveglia durante la notte?",tipo:"area"},
    {key:"schema_risvegli",label:"C'e uno schema nei risvegli?",tipo:"area"},
    {key:"altri_bimbi_sonno",label:"Altri figli con problemi di sonno?",tipo:"area"}
  ]},
  { titolo:"DOMANDE AI GENITORI", campi:[
    {key:"genitori_dormono",label:"Riuscite a dormire mentre il bambino dorme?",tipo:"area"},
    {key:"paure_infanzia",label:"Avete avuto problemi o paure da bambini?",tipo:"area"},
    {key:"pensieri_attuali",label:"State avendo pensieri particolari in questo periodo?",tipo:"area"},
    {key:"paura_buio_genitori",label:"Avete o avete avuto paura del buio?",tipo:"text"},
    {key:"volonta",label:"Avete entrambi volonta di aiutare il bambino a dormire meglio?",tipo:"area"},
    {key:"chi_partecipa",label:"Chi partecipera a questo percorso?",tipo:"area"},
    {key:"obiettivi",label:"Qual e l'esito finale che vorreste ottenere?",tipo:"area"},
    {key:"ulteriori_info",label:"Ulteriori informazioni",tipo:"area"}
  ]}
];

const T = {
  pink:"#FAE8E6", lavender:"#EDE8F5", mint:"#E6F4EF", peach:"#FBF0E6",
  rose:"#E8A0A0", roseDark:"#C47878", sage:"#8ABAAA", lilac:"#B0A0CC",
  text:"#3a2a28", muted:"#9e8484", bg:"#FFFAF8", card:"#FFFFFF",
  green:"#4caf50", red:"#e53935", border:"rgba(200,160,160,0.15)"
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'EB Garamond', Georgia, serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'; background: #f5ede8; -webkit-font-smoothing: antialiased; }
  .slide-enter { animation: slideIn 0.25s cubic-bezier(.4,0,.2,1) forwards; }
  @keyframes slideIn { from { transform: translateX(40px); opacity:0; } to { transform: translateX(0); opacity:1; } }
  .wl-toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:#3a2a28; color:white; border-radius:20px; padding:10px 22px;
    font-size:14px; white-space:nowrap; z-index:9999; font-family:'EB Garamond',serif;
    animation: fadeUp .3s ease, fadeOut .3s ease 1.8s forwards; pointer-events:none; }
  .wl-toast.error { background: #e53935; }
  @keyframes fadeUp { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes fadeOut { from{opacity:1} to{opacity:0} }
  ::-webkit-scrollbar { display:none; }
  input, textarea, button { font-family:'EB Garamond',Georgia,serif,'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji'; }
  .wl-btn-accessible:focus-visible { outline: 2px solid #C47878; outline-offset: 2px; border-radius: 8px; }
`;

function emptyDay() {
  const d = { date:"", note:"" };
  SECTIONS.forEach(s => s.fields.forEach(f => { d[s.key+"__"+f]=""; }));
  NOTE_SECTIONS.forEach(k => { d[k+"__NOTE_CLIENTE"]=""; d[k+"__NOTE_CONSULENTE"]=""; });
  d["caro_diario__shared"]=""; d["caro_diario__consulente"]="";
  return d;
}
function emptyDays(days) { const r={}; days.forEach(d=>{r[d]=emptyDay();}); return r; }
function emptyQuestionario() { const q={}; QUESTIONARIO_SEZIONI.forEach(s=>s.campi.forEach(c=>{q[c.key]="";})); return q; }

// FIX 2: Usa crypto.randomUUID() invece di Date.now() per evitare collisioni
function genId() {
  try { return crypto.randomUUID(); } catch { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
}

function emptyClient(name, papa) {
  return {
    id: genId(),
    name, papa: papa || "",
    type: "sonno",
    link: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toLocaleDateString("it-IT"),
    createdAtMs: Date.now(),
    week1: emptyDays(DAYS_W1),
    week2: emptyDays(DAYS_W2),
    questionario: emptyQuestionario()
  };
}

// ── MODULO "Diario della giornata" (sezione pannolino) ──
function emptyModuloRow() { return { orario:"", cosa:"", p:false, d:false, f:false }; }
function emptyModuloDay() {
  const rows = [];
  for (let i=0; i<MODULO_ROWS_START; i++) rows.push(emptyModuloRow());
  return { data:"", rows, notato:"" };
}
function emptyModulo(days) { const m={}; days.forEach(d => { m[d]=emptyModuloDay(); }); return m; }
function safeModuloDay(day) {
  if (!day) return emptyModuloDay();
  const rows = Array.isArray(day.rows) && day.rows.length ? day.rows.map(r => ({...emptyModuloRow(), ...r})) : emptyModuloDay().rows;
  return { data: day.data || "", rows, notato: day.notato || "" };
}
function emptyModuloClient(name) {
  return {
    id: genId(),
    name,
    type: "modulo",
    link: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toLocaleDateString("it-IT"),
    createdAtMs: Date.now(),
    moduloDays: [...MODULO_DEFAULT_DAYS],
    modulo: emptyModulo(MODULO_DEFAULT_DAYS)
  };
}

// Scadenza accesso app (60 giorni). Vale per tutti i clienti; non blocca chi non ha data.
function accessStartMs(client) {
  if (client && client.createdAtMs) return client.createdAtMs;
  const s = client && (client.registeredAt || client.createdAt);
  if (s && typeof s === "string" && s.includes("/")) {
    const [d,m,y] = s.split("/").map(Number);
    if (y) return new Date(y, m-1, d).getTime();
  }
  return null;
}
function isExpired(client) {
  const start = accessStartMs(client);
  if (start == null) return false;
  const d = new Date(start);
  d.setMonth(d.getMonth() + APP_ACCESS_MONTHS);
  return Date.now() > d.getTime();
}
function safeWeek(client, n) {
  const days = n===1 ? DAYS_W1 : DAYS_W2, wk = client["week"+n] || {}, r = {};
  days.forEach(d => { r[d] = wk[d] ? {...emptyDay(), ...wk[d]} : emptyDay(); });
  return r;
}

// FIX 3: Gestione errori esplicita (non silenziosa)
async function loadClients() {
  const s = await getDocs(collection(db, "clients"));
  return s.docs.map(d => d.data());
}
async function saveClient(c) { await setDoc(doc(db, "clients", c.id), c); }
async function removeClient(id) { await deleteDoc(doc(db, "clients", id)); }

async function downloadPDF(client) {
  try {
    if (!window.jspdf) await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    const {jsPDF} = window.jspdf, pdf = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const q = client.questionario || emptyQuestionario(), m = 16, cw = 210-m*2; let y = 20;
    const chk = (n=10) => { if (y+n>280) { pdf.addPage(); y=20; } };
    pdf.setFillColor(196,120,120); pdf.rect(0,0,210,18,"F");
    pdf.setTextColor(255,255,255); pdf.setFontSize(13); pdf.setFont("helvetica","bold");
    pdf.text("With Love Family - Questionario Sleep Coaching", m, 11);
    pdf.setFontSize(9); pdf.setFont("helvetica","normal");
    pdf.text("Cliente: "+client.name+"   |   Data: "+client.createdAt, m, 17); y=26;
    QUESTIONARIO_SEZIONI.forEach(sez => {
      chk(14); pdf.setFillColor(176,160,204); pdf.rect(m,y,cw,8,"F");
      pdf.setTextColor(255,255,255); pdf.setFontSize(9); pdf.setFont("helvetica","bold"); pdf.text(sez.titolo,m+3,y+5.5); y+=11;
      if (sez.note) { pdf.setTextColor(120,120,120); pdf.setFontSize(8); pdf.setFont("helvetica","italic"); pdf.text(sez.note,m,y); y+=5; }
      sez.campi.forEach(campo => {
        const val = (q[campo.key] && q[campo.key].trim()) ? q[campo.key] : "—"; chk(18);
        pdf.setTextColor(60,60,60); pdf.setFontSize(8); pdf.setFont("helvetica","bold"); pdf.text(campo.label,m,y); y+=4;
        pdf.setFillColor(251,240,230); pdf.setDrawColor(220,200,200);
        const lines = pdf.splitTextToSize(val,cw-6), bh = Math.max(8,lines.length*4.5+3);
        chk(bh+3); pdf.rect(m,y,cw,bh,"FD");
        pdf.setTextColor(40,40,40); pdf.setFontSize(8.5); pdf.setFont("helvetica","normal"); pdf.text(lines,m+3,y+4.5); y+=bh+5;
      }); y+=2;
    });
    const tp = pdf.internal.getNumberOfPages();
    for (let i=1; i<=tp; i++) { pdf.setPage(i); pdf.setFontSize(7.5); pdf.setTextColor(160,160,160); pdf.setFont("helvetica","normal"); pdf.text("With Love Family - "+client.name,m,292); pdf.text("Pag. "+i+" / "+tp,195,292,{align:"right"}); }
    pdf.save("Questionario_"+client.name.replace(/\s+/g,"_")+".pdf");
  } catch(e) { alert("Errore PDF. Usa un browser aggiornato."); console.error(e); }
}

async function ensureJsPDF() {
  if (!window.jspdf) await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

// Disegna una pagina "Diario della giornata" (con o senza dati)
function drawModuloPage(pdf, dayLabel, dayData) {
  const m = 16, pw = 210, cw = pw - m*2;
  const gold = [180,150,90];
  // Titolo
  pdf.setTextColor(120,120,120); pdf.setFontSize(8); pdf.setFont("helvetica","italic");
  pdf.text("— With Love —", pw/2, 14, {align:"center"});
  pdf.setTextColor(gold[0],gold[1],gold[2]); pdf.setFontSize(20); pdf.setFont("helvetica","normal");
  pdf.text("Diario della giornata", m, 26);
  pdf.setTextColor(60,60,60); pdf.setFontSize(11); pdf.setFont("helvetica","normal");
  const giornoTxt = "Giorno: " + (dayData && dayData.data ? dayData.data : (dayLabel||""));
  pdf.text(giornoTxt, pw - m, 26, {align:"right"});
  // Intestazione tabella
  let y = 34;
  const cOrario = m, wOrario = 26, cCosa = m+wOrario, wCosa = 78, cNote = m+wOrario+wCosa, wNote = cw-wOrario-wCosa;
  pdf.setDrawColor(gold[0],gold[1],gold[2]); pdf.setLineWidth(0.2);
  pdf.setFillColor(250,247,240); pdf.rect(m, y, cw, 7, "F");
  pdf.setTextColor(120,110,80); pdf.setFontSize(8); pdf.setFont("helvetica","italic");
  pdf.text("Orario", cOrario+3, y+4.7);
  pdf.text("Cosa è successo", cCosa+3, y+4.7);
  pdf.text("Note", cNote+wNote/2, y+4.7, {align:"center"});
  y += 7;
  // Righe
  const rows = (dayData && dayData.rows) ? dayData.rows : [];
  const totalRows = Math.max(rows.length, 18);
  const rh = 9.5;
  pdf.setFont("helvetica","normal"); pdf.setFontSize(8.5);
  for (let i=0; i<totalRows; i++) {
    if (y + rh > 250) break;
    const r = rows[i] || {};
    pdf.setDrawColor(gold[0],gold[1],gold[2]);
    pdf.rect(cOrario, y, wOrario, rh); pdf.rect(cCosa, y, wCosa, rh); pdf.rect(cNote, y, wNote, rh);
    pdf.setTextColor(40,40,40);
    if (r.orario) pdf.text(String(r.orario).slice(0,12), cOrario+2, y+6);
    if (r.cosa) pdf.text(pdf.splitTextToSize(String(r.cosa), wCosa-4), cCosa+2, y+6);
    // checkbox P D F
    const labels = [["P", r.p],["D", r.d],["F", r.f]];
    let bx = cNote + 4;
    labels.forEach(([lab, on]) => {
      pdf.setDrawColor(150,150,150); pdf.rect(bx, y+rh/2-2, 3.2, 3.2);
      if (on) { pdf.setFont("helvetica","bold"); pdf.text("x", bx+0.6, y+rh/2+0.9); pdf.setFont("helvetica","normal"); }
      pdf.setTextColor(80,80,80); pdf.setFontSize(8); pdf.text(lab, bx+4.2, y+rh/2+1);
      bx += 14;
    });
    y += rh;
  }
  // Cosa ho notato oggi
  y += 6; if (y > 250) y = 250;
  pdf.setTextColor(gold[0],gold[1],gold[2]); pdf.setFontSize(11); pdf.setFont("helvetica","normal");
  pdf.text("Cosa ho notato oggi", m, y);
  pdf.setTextColor(120,120,120); pdf.setFontSize(8); pdf.setFont("helvetica","italic");
  pdf.text("— atteggiamenti, nessi che inizio a vedere, momenti di distrazione, qualunque cosa.", m+44, y);
  y += 4;
  const boxH = Math.min(40, 285 - y);
  pdf.setDrawColor(gold[0],gold[1],gold[2]); pdf.rect(m, y, cw, boxH);
  if (dayData && dayData.notato) {
    pdf.setTextColor(40,40,40); pdf.setFontSize(9); pdf.setFont("helvetica","normal");
    pdf.text(pdf.splitTextToSize(String(dayData.notato), cw-6), m+3, y+6);
  }
  pdf.setTextColor(120,120,120); pdf.setFontSize(8); pdf.setFont("helvetica","italic");
  pdf.text("— With Love —", pw/2, 292, {align:"center"});
}

async function downloadModuloBlankPDF() {
  try {
    const jsPDF = await ensureJsPDF();
    const pdf = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    drawModuloPage(pdf, "", null);
    pdf.save("Diario_della_giornata_vuoto.pdf");
  } catch(e) { alert("Errore PDF. Usa un browser aggiornato."); console.error(e); }
}

async function downloadModuloFilledPDF(client) {
  try {
    const jsPDF = await ensureJsPDF();
    const pdf = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const days = (client.moduloDays && client.moduloDays.length) ? client.moduloDays : MODULO_DEFAULT_DAYS;
    days.forEach((d, i) => {
      if (i > 0) pdf.addPage();
      drawModuloPage(pdf, d, safeModuloDay((client.modulo||{})[d]));
    });
    pdf.save("Diario_della_giornata_" + (client.name||"").replace(/\s+/g,"_") + ".pdf");
  } catch(e) { alert("Errore PDF. Usa un browser aggiornato."); console.error(e); }
}

function Icon({name, size=20, color="currentColor"}) {
  const p = {
    back:<polyline points="15,18 9,12 15,6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    home:<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    user:<><circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></>,
    check:<polyline points="20,6 9,17 4,12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>,
    save:<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="none" stroke={color} strokeWidth="1.8"/><polyline points="17,21 17,13 7,13 7,21" fill="none" stroke={color} strokeWidth="1.8"/></>,
    table:<><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke={color} strokeWidth="1.8"/><line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.8"/><line x1="9" y1="3" x2="9" y2="21" stroke={color} strokeWidth="1.8"/></>,
    pdf:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke={color} strokeWidth="1.8"/><polyline points="14,2 14,8 20,8" fill="none" stroke={color} strokeWidth="1.8"/></>,
    plus:<><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" fill="none" stroke={color} strokeWidth="1.8"/><polyline points="16,17 21,12 16,7" fill="none" stroke={color} strokeWidth="1.8"/><line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8"/></>,
    refresh:<polyline points="23,4 23,10 17,10" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{p[name]||null}</svg>;
}

const S = {
  screen: { width:"100%", height:"100%", background:T.bg, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", fontFamily:"'EB Garamond',Georgia,serif" },
  navTop: { padding:"12px 20px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", background:T.bg, borderBottom:"1px solid rgba(200,160,160,0.15)", flexShrink:0 },
  body: { flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch", padding:"16px 20px" },
  logo: { fontSize:13, letterSpacing:2, textTransform:"uppercase", color:T.roseDark, fontStyle:"italic" },
};

function BottomNav({active, onHome, onProfile}) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",padding:"10px 0 4px",background:T.bg,borderTop:"1px solid "+T.border,flexShrink:0}}>
      <button onClick={onHome} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 24px",borderRadius:14,background:"none",border:"none"}}>
        <Icon name="home" size={22} color={active==="home"?T.roseDark:T.muted}/>
        <span style={{fontSize:11,color:active==="home"?T.roseDark:T.muted}}>Home</span>
      </button>
      <button onClick={onProfile} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 24px",borderRadius:14,background:"none",border:"none"}}>
        <Icon name="user" size={22} color={active==="profilo"?T.roseDark:T.muted}/>
        <span style={{fontSize:11,color:active==="profilo"?T.roseDark:T.muted}}>Profilo</span>
      </button>
    </div>
  );
}

function BtnPri({children, onClick, disabled, loading, style={}}) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{background:"linear-gradient(135deg,#E8A8A0,#C89090)",color:"#fff",border:"none",borderRadius:28,padding:"13px 28px",fontSize:17,fontWeight:500,cursor:(disabled||loading)?"default":"pointer",width:"100%",boxShadow:"0 4px 16px rgba(200,144,144,0.3)",opacity:(disabled||loading)?0.7:1,...style}}>
      {loading ? "Salvataggio..." : children}
    </button>
  );
}
function BtnGho({children, onClick, style={}}) {
  return <button onClick={onClick} style={{background:"none",border:"1.5px solid "+T.rose,color:T.roseDark,borderRadius:28,padding:"10px 24px",fontSize:16,cursor:"pointer",width:"100%",...style}}>{children}</button>;
}
function BtnIco({children, onClick, style={}}) {
  return <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:8,borderRadius:"50%",...style}}>{children}</button>;
}
function BtnSm({children, onClick, color=T.roseDark, textColor="#fff", style={}}) {
  return <button onClick={onClick} style={{background:color,color:textColor,border:"none",borderRadius:20,padding:"6px 14px",fontSize:14,cursor:"pointer",flexShrink:0,...style}}>{children}</button>;
}
function Inp({value, onChange, placeholder, multi, style={}}) {
  const s = {width:"100%",background:T.pink,border:"none",borderRadius:12,padding:"12px 14px",fontSize:16,color:T.text,outline:"none",...style};
  return multi
    ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...s,resize:"vertical"}}/>
    : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>;
}
function Lbl({children}) {
  return <div style={{fontSize:11,fontWeight:500,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>{children}</div>;
}
function Card({children, style={}}) {
  return <div style={{background:T.card,borderRadius:18,padding:"16px 18px",boxShadow:"0 2px 12px rgba(180,120,120,0.07)",...style}}>{children}</div>;
}

// FIX 4: Toast con variante errore
function Toast({show, error=false}) {
  return show ? <div className={"wl-toast"+(error?" error":"")}>{error ? "Errore nel salvataggio ✗" : "Salvato con successo ✓"}</div> : null;
}

// FIX 5: Dialog di conferma custom (sostituisce window.confirm)
function ConfirmDialog({message, onConfirm, onCancel}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(58,42,40,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:24}}>
      <div style={{background:"#fff",borderRadius:20,padding:28,maxWidth:320,width:"100%",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:36,marginBottom:12}}></div>
        <p style={{fontSize:16,color:T.text,marginBottom:24,fontStyle:"italic",lineHeight:1.6}}>{message}</p>
        <div style={{display:"flex",gap:10}}>
          <BtnGho onClick={onCancel} style={{flex:1}}>Annulla</BtnGho>
          <button onClick={onConfirm} style={{flex:1,background:T.red,color:"#fff",border:"none",borderRadius:28,padding:"10px 24px",fontSize:16,cursor:"pointer",fontFamily:"'EB Garamond',serif"}}>Elimina</button>
        </div>
      </div>
    </div>
  );
}

// FIX 6: NoteBox accessibile (role=button, tastiera)
function NoteBox({value, onChange, dayKey, fieldKey, label, isGold, placeholder, readOnly}) {
  const [exp, setExp] = useState(false);
  const prev = (value||"").slice(0,80), long = (value||"").length > 80;
  const toggle = () => setExp(v => !v);
  return (
    <div style={{flex:1,background:isGold?"#fff8f0":"#f0f4fb",borderRadius:12,padding:10,border:"1px solid "+(isGold?"#E8C0B8":"#C0B0D8")}}>
      <div style={{fontSize:11,fontWeight:500,color:isGold?T.roseDark:T.lilac,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.8px"}}>{label}</div>
      {exp ? (
        <div>
          <textarea value={value||""} readOnly={readOnly}
            onChange={e => { if (!readOnly) onChange(dayKey, fieldKey, e.target.value); }}
            rows={3}
            style={{width:"100%",background:readOnly?"#f9f6f4":"#fff",border:"none",borderRadius:8,padding:"8px 10px",fontSize:14,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box"}}/>
          <button className="wl-btn-accessible" onClick={toggle}
            style={{fontSize:12,color:T.roseDark,cursor:"pointer",marginTop:4,background:"none",border:"none",padding:0}}>
            chiudi ▲
          </button>
        </div>
      ) : (
        <button className="wl-btn-accessible" onClick={toggle}
          style={{cursor:"pointer",background:"none",border:"none",padding:0,width:"100%",textAlign:"left"}}>
          <div style={{fontSize:13,color:(value&&value.length>0)?T.text:"#c0a0a0",lineHeight:1.5,fontStyle:(value&&value.length>0)?"normal":"italic"}}>
            {(value&&value.length>0) ? (long ? prev+"..." : value) : (readOnly?"—":placeholder)}
          </div>
          {long && <span style={{fontSize:12,color:T.roseDark,display:"inline-block",marginTop:4}}>leggi tutto ▼</span>}
        </button>
      )}
    </div>
  );
}

function NoteRow({data, onChange, sectionKey, dayKey, isConsultant}) {
  return (
    <div style={{marginTop:10,display:"flex",gap:8}}>
      <NoteBox value={data[sectionKey+"__NOTE_CLIENTE"]||""} onChange={onChange} dayKey={dayKey} fieldKey={sectionKey+"__NOTE_CLIENTE"} label="Note mamma" isGold={false} placeholder="Scrivi le tue note..." readOnly={false}/>
      <NoteBox value={data[sectionKey+"__NOTE_CONSULENTE"]||""} onChange={onChange} dayKey={dayKey} fieldKey={sectionKey+"__NOTE_CONSULENTE"} label="Note consulente" isGold={true} placeholder={isConsultant?"Aggiungi nota...":"—"} readOnly={!isConsultant}/>
    </div>
  );
}

function InstallGuide({platform}) {
  const [open, setOpen] = useState(false);
  const isApple = platform === "apple";
  const steps = isApple
    ? ["1. Apri questo link da Safari (non Chrome!)","2. Tocca il pulsante Condividi in basso","3. Scorri e tocca Aggiungi a schermata Home","4. Tocca Aggiungi in alto a destra","L'app apparira come icona sul tuo iPhone!"]
    : ["1. Apri questo link da Chrome","2. Tocca i 3 puntini in alto a destra","3. Tocca Aggiungi a schermata Home","4. Tocca Aggiungi per confermare","L'app apparira come icona sul tuo Android!"];
  return (
    <div style={{position:"relative",flex:1}}>
      <button onClick={() => setOpen(!open)} style={{background:isApple?"#555":T.sage,color:"#fff",border:"none",borderRadius:20,padding:"10px 14px",fontSize:14,fontWeight:500,cursor:"pointer",width:"100%",fontFamily:"'EB Garamond',serif"}}>
        {isApple?"iOS App iPhone":"Android App Android"}
      </button>
      {open && (
        <div style={{position:"absolute",left:0,right:0,top:46,background:"#fff",border:"1px solid rgba(200,160,160,0.2)",borderRadius:16,padding:16,boxShadow:"0 8px 24px rgba(180,120,120,0.15)",zIndex:100}}>
          <div style={{fontWeight:600,color:isApple?"#555":T.sage,marginBottom:10,fontSize:14}}>{isApple?"Installa su iPhone/iPad":"Installa su Android"}</div>
          {steps.map((s,i) => <div key={i} style={{fontSize:13,color:T.text,marginBottom:8,lineHeight:1.5}}>{s}</div>)}
          <button onClick={() => setOpen(false)} style={{float:"right",fontSize:12,color:T.roseDark,cursor:"pointer",marginTop:8,background:"none",border:"none",fontFamily:"'EB Garamond',serif"}}>Chiudi ✕</button>
        </div>
      )}
    </div>
  );
}

function CaroDiario({data, onChange, dayKey, isConsultant}) {
  const cv = data["caro_diario__shared"]||"", qv = data["caro_diario__consulente"]||"";
  return (
    <div style={{marginTop:20,background:"linear-gradient(135deg,#FBF0E6,#EDE8F5)",borderRadius:18,padding:20,border:"1.5px solid #E8C0B8"}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:22,color:T.roseDark,fontStyle:"italic",letterSpacing:1}}>Caro Diario</div>
        <div style={{fontSize:13,color:T.muted,marginTop:3,fontStyle:"italic"}}>Raccontami le sensazioni che hai avuto in questa giornata</div>
      </div>
      <div style={{marginBottom:14}}>
        <Lbl>La tua voce</Lbl>
        {isConsultant ? (
          <div style={{fontSize:14,color:T.text,background:"rgba(255,255,255,0.7)",borderRadius:12,padding:"10px 14px",lineHeight:1.8,whiteSpace:"pre-wrap",minHeight:60}}>
            {cv.length > 0 ? cv : <span style={{color:"#c0a0a0",fontStyle:"italic"}}>La cliente non ha ancora scritto nulla.</span>}
          </div>
        ) : (
          <textarea value={cv} onChange={e=>onChange(dayKey,"caro_diario__shared",e.target.value)} placeholder="Scrivi qui come ti sei sentita oggi..." rows={4}
            style={{width:"100%",background:"rgba(255,255,255,0.7)",border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box",color:T.text,lineHeight:1.6}}/>
        )}
      </div>
      <div style={{borderTop:"1px dashed rgba(196,120,120,0.3)",margin:"14px 0"}}/>
      <Lbl>In calce - Nota consulente</Lbl>
      {isConsultant ? (
        <textarea value={qv} onChange={e=>onChange(dayKey,"caro_diario__consulente",e.target.value)} placeholder="Scrivi qui la tua nota in calce..." rows={3}
          style={{width:"100%",background:"rgba(237,232,245,0.7)",border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box",color:T.lilac,lineHeight:1.6}}/>
      ) : (
        <div style={{fontSize:14,color:T.lilac,background:"rgba(237,232,245,0.5)",borderRadius:12,padding:"10px 14px",lineHeight:1.8,whiteSpace:"pre-wrap",minHeight:36}}>
          {qv.length > 0 ? qv : <span style={{color:"#c0b0d0",fontStyle:"italic"}}>Nessuna nota della consulente ancora.</span>}
        </div>
      )}
    </div>
  );
}

// FIX 7: SectionScreen ora riceve onSave e lo chiama davvero
function SectionScreen({section, dayKey, data, onChange, onBack, isConsultant, onSave}) {
  const [toast, setToast] = useState(false);
  const [toastError, setToastError] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!data) return null;

  async function handleSave() {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave();
      setToast(true);
      setTimeout(() => setToast(false), 2200);
    } catch(e) {
      setToastError(true);
      setTimeout(() => setToastError(false), 2200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="slide-enter" style={S.screen}>
      <div style={{...S.navTop, background:section.color}}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:26}}>{section.icon}</div>
          <div style={{fontSize:17,fontWeight:500,color:T.text,fontStyle:"italic"}}>{section.label}</div>
          <div style={{fontSize:12,color:T.muted}}>{dayKey}</div>
        </div>
        <BtnIco onClick={handleSave} disabled={saving}><Icon name="save" size={22} color={saving?T.muted:T.sage}/></BtnIco>
      </div>
      <div style={S.body}>
        <Card style={{marginBottom:16}}>
          {section.fields.map((f, i) => {
            const isArea = f.toLowerCase().includes("note") || f.toLowerCase().includes("come");
            return (
              <div key={f} style={{paddingBottom:14,marginBottom:i<section.fields.length-1?14:0,borderBottom:i<section.fields.length-1?"1px solid rgba(200,160,160,0.1)":"none"}}>
                <Lbl>{f}</Lbl>
                {isArea ? (
                  <textarea value={data[section.key+"__"+f]||""} onChange={e=>onChange(dayKey,section.key+"__"+f,e.target.value)}
                    style={{width:"100%",background:T.pink,border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"none",minHeight:60,lineHeight:1.5,outline:"none"}} placeholder="Scrivi qui..."/>
                ) : (
                  <Inp value={data[section.key+"__"+f]||""} onChange={v=>onChange(dayKey,section.key+"__"+f,v)} placeholder={f.toLowerCase().includes("alle")||f.toLowerCase().includes("ora")?"00:00":"..."}/>
                )}
              </div>
            );
          })}
        </Card>
        {NOTE_SECTIONS.includes(section.key) && <NoteRow data={data} onChange={onChange} sectionKey={section.key} dayKey={dayKey} isConsultant={isConsultant}/>}
        <div style={{height:24}}/>
        <BtnPri onClick={handleSave} loading={saving}>Salva sezione</BtnPri>
        <div style={{height:24}}/>
      </div>
      <Toast show={toast}/>
      <Toast show={toastError} error={true}/>
    </div>
  );
}

function DayScreen({dayKey, weekData, onChange, onBack, isConsultant, onSave}) {
  const [activeSection, setActiveSection] = useState(null);
  const [toast, setToast] = useState(false);
  const [toastError, setToastError] = useState(false);
  const [saving, setSaving] = useState(false);

  function countFilled(sec) {
    return sec.fields.filter(f => (weekData[dayKey] && weekData[dayKey][sec.key+"__"+f] || "").trim().length > 0).length;
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave();
      setToast(true);
      setTimeout(() => setToast(false), 2200);
    } catch(e) {
      setToastError(true);
      setTimeout(() => setToastError(false), 2200);
    } finally {
      setSaving(false);
    }
  }

  // FIX 7b: SectionScreen riceve onSave
  if (activeSection) return (
    <SectionScreen section={activeSection} dayKey={dayKey} data={weekData[dayKey]} onChange={onChange}
      onBack={() => setActiveSection(null)} isConsultant={isConsultant} onSave={onSave}/>
  );

  return (
    <div className="slide-enter" style={S.screen}>
      <div style={S.navTop}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:17,fontStyle:"italic",color:T.text}}>{dayKey}</div></div>
        <BtnIco onClick={handleSave} disabled={saving}><Icon name="save" size={22} color={saving?T.muted:T.sage}/></BtnIco>
      </div>
      <div style={S.body}>
        <Card style={{marginBottom:18}}>
          <Lbl>Data</Lbl>
          <Inp value={(weekData[dayKey] && weekData[dayKey].date)||""} onChange={v=>onChange(dayKey,"date",v)} placeholder="gg/mm/aaaa"/>
        </Card>
        <Lbl style={{marginBottom:10}}>Sezioni da compilare</Lbl>
        {SECTIONS.map(s => {
          const filled = countFilled(s), done = filled === s.fields.length, partial = filled > 0 && !done;
          return (
            <button key={s.key} onClick={() => setActiveSection(s)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderRadius:18,cursor:"pointer",marginBottom:10,border:"none",fontFamily:"'EB Garamond',serif",textAlign:"left",width:"100%",background:s.color,boxShadow:"0 2px 10px rgba(180,120,120,0.07)"}}>
              <span style={{fontSize:26}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontWeight:500,color:T.text,fontStyle:"italic"}}>{s.label}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{s.fields.length} campi · {done?"Completato ✓":partial?filled+"/"+s.fields.length+" compilati":"Da compilare"}</div>
              </div>
              {done && <span style={{width:20,height:20,borderRadius:"50%",background:"#A8D8C0",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="check" size={12} color="white"/></span>}
              <span style={{color:T.muted,fontSize:20}}>›</span>
            </button>
          );
        })}
        <CaroDiario data={weekData[dayKey]||emptyDay()} onChange={onChange} dayKey={dayKey} isConsultant={isConsultant}/>
        <div style={{height:20}}/>
      </div>
      <Toast show={toast}/>
      <Toast show={toastError} error={true}/>
    </div>
  );
}

function TableView({weekData, weekNum}) {
  const days = weekNum===1 ? DAYS_W1 : DAYS_W2;
  const rows = [];
  SECTIONS.forEach(sec => {
    rows.push({type:"header",label:sec.label,icon:sec.icon,color:sec.color,secKey:sec.key});
    sec.fields.forEach(f => rows.push({type:"field",label:f,fieldKey:sec.key+"__"+f,secKey:sec.key}));
  });
  const getVal = (day, fk) => (weekData[day] && weekData[day][fk]) || "";
  return (
    <div style={{overflowX:"auto",fontSize:12,padding:"8px 0"}}>
      <table style={{borderCollapse:"collapse",minWidth:600,width:"100%"}}>
        <thead>
          <tr>
            <th style={{background:T.roseDark,color:"#fff",padding:"8px 10px",textAlign:"left",minWidth:140,position:"sticky",left:0,zIndex:2,border:"1px solid rgba(200,160,160,0.2)"}}>ORARI</th>
            {days.map(d => <th key={d} style={{background:T.roseDark,color:"#fff",padding:"8px 10px",textAlign:"center",border:"1px solid rgba(200,160,160,0.2)",minWidth:90,fontSize:11}}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.type==="header") return <tr key={i}><td colSpan={days.length+1} style={{background:row.color,color:T.text,fontWeight:600,padding:"6px 10px",fontSize:13,border:"1px solid rgba(200,160,160,0.15)"}}>{row.icon} {row.label}</td></tr>;
            const bg = i%2===0 ? "#FFFAF8" : "#fff";
            return (
              <tr key={i} style={{background:bg}}>
                <td style={{padding:"4px 10px",fontWeight:500,color:T.text,position:"sticky",left:0,background:bg,border:"1px solid rgba(200,160,160,0.15)",whiteSpace:"nowrap",fontSize:12}}>{row.label}</td>
                {days.map(d => <td key={d} style={{padding:"4px 8px",border:"1px solid rgba(200,160,160,0.15)",maxWidth:110,color:T.text,wordBreak:"break-word",fontSize:12}}>{getVal(d,row.fieldKey)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// FIX 6b: QField accessibile
function QField({label, value, onChange, tipo, readOnly}) {
  const [open, setOpen] = useState(false);
  const prev = (value||"").slice(0,60), has = (value||"").length > 0;
  return (
    <div style={{marginBottom:12}}>
      <Lbl>{label}</Lbl>
      {open ? (
        <div>
          {tipo==="area"
            ? <textarea value={value||""} readOnly={readOnly} onChange={e => !readOnly && onChange(e.target.value)} rows={4}
                style={{width:"100%",background:readOnly?"#f9f6f4":T.pink,border:"none",borderRadius:12,padding:"10px 14px",fontSize:14,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box"}} placeholder={readOnly?"—":"Scrivi qui..."}/>
            : <input value={value||""} readOnly={readOnly} onChange={e => !readOnly && onChange(e.target.value)}
                style={{width:"100%",background:readOnly?"#f9f6f4":T.pink,border:"none",borderRadius:12,padding:"12px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",boxSizing:"border-box"}} placeholder={readOnly?"—":"Scrivi qui..."}/>
          }
          <button className="wl-btn-accessible" onClick={() => setOpen(false)}
            style={{fontSize:12,color:T.roseDark,cursor:"pointer",marginTop:4,display:"inline-block",background:"none",border:"none",fontFamily:"'EB Garamond',serif"}}>
            chiudi ▲
          </button>
        </div>
      ) : (
        <button className="wl-btn-accessible" onClick={() => setOpen(true)}
          style={{cursor:"pointer",background:has?"rgba(255,255,255,0.8)":T.pink,border:"1px solid rgba(200,160,160,0.2)",borderRadius:12,padding:"10px 14px",fontSize:14,color:has?T.text:"#c0a0a0",minHeight:40,fontStyle:has?"normal":"italic",width:"100%",textAlign:"left",fontFamily:"'EB Garamond',serif"}}>
          {has ? (prev.length < (value||"").length ? prev+"..." : value) : (readOnly ? "—" : "Tocca per rispondere...")}
        </button>
      )}
    </div>
  );
}

function QuestionarioView({questionario, onChange, readOnly, onBack, onPDF}) {
  return (
    <div className="slide-enter" style={S.screen}>
      <div style={S.navTop}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:17,fontStyle:"italic",color:T.text}}>Questionario</div></div>
        {onPDF ? <BtnIco onClick={async () => await onPDF()}><Icon name="pdf" size={22} color={T.roseDark}/></BtnIco> : <div style={{width:38}}/>}
      </div>
      <div style={S.body}>
        {!readOnly && <div style={{background:"linear-gradient(135deg,#FBF0E6,#FAE8E6)",borderRadius:14,padding:14,marginBottom:18,fontSize:14,color:T.muted,fontStyle:"italic"}}>Compila il questionario almeno 24 ore prima della consulenza </div>}
        {QUESTIONARIO_SEZIONI.map((sez, si) => (
          <Card key={si} style={{marginBottom:16}}>
            <div style={{fontWeight:600,fontSize:15,color:T.roseDark,marginBottom:sez.note?4:12,fontStyle:"italic"}}>{sez.titolo}</div>
            {sez.note && <div style={{fontSize:12,color:T.muted,marginBottom:10,fontStyle:"italic"}}>{sez.note}</div>}
            {sez.campi.map(campo => (
              <QField key={campo.key} label={campo.label} value={questionario[campo.key]||""} onChange={v=>onChange(campo.key,v)} tipo={campo.tipo} readOnly={readOnly}/>
            ))}
          </Card>
        ))}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

// ── CLIENT VIEW ──
function ClientView({client, onSave}) {
  const [screen, setScreen] = useState("home");
  const [activeDay, setActiveDay] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);
  const [tableWeek, setTableWeek] = useState(1);
  const [data, setData] = useState({week1:safeWeek(client,1), week2:safeWeek(client,2)});
  const [questionario, setQuestionario] = useState(client.questionario || emptyQuestionario());
  const [toast, setToast] = useState(false);

  // FIX 8: Auto-save con debounce — usa ref per leggere i valori aggiornati nel timer
  const dataRef = useRef(data);
  const questionarioRef = useRef(questionario);
  const autoSaveTimer = useRef(null);

  function triggerAutoSave() {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await onSave({...dataRef.current, questionario: questionarioRef.current});
      } catch(e) {
        console.error("Auto-save fallito:", e);
      }
    }, 2000);
  }

  function change(wn, dk, f, v) {
    setData(prev => {
      const next = {...prev, ["week"+wn]: {...prev["week"+wn], [dk]: {...prev["week"+wn][dk], [f]: v}}};
      dataRef.current = next;
      return next;
    });
    triggerAutoSave();
  }

  function changeQuestionario(k, v) {
    setQuestionario(prev => {
      const next = {...prev, [k]: v};
      questionarioRef.current = next;
      return next;
    });
    triggerAutoSave();
  }

  async function doSave() {
    clearTimeout(autoSaveTimer.current);
    await onSave({...dataRef.current, questionario: questionarioRef.current});
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  }

  if (screen==="table") return (
    <div style={S.screen}>
      <div style={S.navTop}>
        <BtnIco onClick={() => setScreen("home")}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:15,fontStyle:"italic",color:T.text}}>Riepilogo Settimana {tableWeek}</div></div>
        <div style={{width:38}}/>
      </div>
      <div style={{padding:"8px 16px",display:"flex",gap:6}}>
        {[1,2].map(w => <BtnSm key={w} onClick={() => setTableWeek(w)} color={tableWeek===w?T.roseDark:"#eee"} textColor={tableWeek===w?"#fff":T.text} style={{fontSize:13}}>Settimana {w}</BtnSm>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 8px 16px"}}>
        <TableView weekData={data["week"+tableWeek]} weekNum={tableWeek}/>
      </div>
    </div>
  );

  if (screen==="questionario") return (
    <QuestionarioView questionario={questionario} onChange={changeQuestionario} readOnly={false} onBack={() => setScreen("home")} onPDF={null}/>
  );

  if (screen==="day" && activeDay) return (
    <DayScreen dayKey={activeDay} weekData={data["week"+activeWeek]}
      onChange={(dk,f,v) => change(activeWeek,dk,f,v)}
      onBack={() => setScreen("home")} isConsultant={false} onSave={doSave}/>
  );

  return (
    <div style={{width:"100%",height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        {screen==="home" && (
          <HomeScreen client={client} data={data}
            onDay={(d,w) => {setActiveDay(d);setActiveWeek(w);setScreen("day");}}
            onTable={w => {setTableWeek(w);setScreen("table");}}
            onQuestionario={() => setScreen("questionario")}/>
        )}
        {screen==="profilo" && (
          <ProfileScreen client={client} onLogout={() => {sessionStorage.removeItem("role");window.location.reload();}}/>
        )}
      </div>
      <BottomNav active={screen} onHome={() => setScreen("home")} onProfile={() => setScreen("profilo")}/>
      <Toast show={toast}/>
    </div>
  );
}

// ── HOME SCREEN ──
function HomeScreen({client, data, onDay, onTable, onQuestionario}) {
  const [week, setWeek] = useState(1);
  const days = week===1 ? DAYS_W1 : DAYS_W2;
  const wkData = data["week"+week];
  const total = SECTIONS.reduce((a,s) => a+s.fields.length, 0);

  function countDay(dk) {
    let n = 0;
    SECTIONS.forEach(s => s.fields.forEach(f => { if ((wkData[dk] && wkData[dk][s.key+"__"+f] || "").trim()) n++; }));
    return n;
  }

  return (
    <div style={{...S.screen}}>
      <div style={S.navTop}>
        <div><div style={S.logo}>with love</div><div style={{fontSize:18,fontStyle:"italic",color:T.text,marginTop:1}}>Ciao, {client.name.split(" ")[0]} </div></div>
        <div style={{width:38}}/>
      </div>
      <div style={S.body}>
        <div style={{background:"#F5EDEB",borderRadius:16,padding:4,display:"flex",gap:4,marginBottom:18}}>
          {[1,2].map(w => <button key={w} onClick={() => setWeek(w)} style={{flex:1,padding:"8px",borderRadius:12,border:"none",fontSize:15,cursor:"pointer",background:week===w?"white":"none",color:week===w?T.roseDark:T.muted,boxShadow:week===w?"0 2px 8px rgba(180,120,120,0.12)":"none",transition:"all 0.2s"}}>Settimana {w}</button>)}
        </div>
        <Card style={{background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",marginBottom:18}}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>Settimana {week} · Riepilogo</div>
          <div style={{fontSize:15,color:T.text,fontStyle:"italic",marginBottom:14}}>Tieni traccia di ogni giornata del tuo piccolo </div>
          <div style={{display:"flex",gap:8}}>
            <BtnSm onClick={() => onTable(week)} color={T.roseDark} style={{flex:1,fontSize:13}}>Vista tabella</BtnSm>
            <BtnSm onClick={onQuestionario} color={T.lilac} style={{flex:1,fontSize:13}}>Questionario</BtnSm>
          </div>
        </Card>
        <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>Seleziona un giorno</div>
        {days.map(d => {
          const filled = countDay(d), pct = Math.round(filled/total*100);
          return (
            <button key={d} onClick={() => onDay(d, week)} style={{background:"white",border:"none",borderRadius:18,padding:"14px 16px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 10px rgba(180,120,120,0.07)",marginBottom:10,width:"100%"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:16,fontWeight:500,color:T.text,fontStyle:"italic"}}>{d}</div>
                  {/* FIX 9: Barre colorate per sezione in base al riempimento reale */}
                  <div style={{display:"flex",gap:4,marginTop:6}}>
                    {SECTIONS.map(s => {
                      const secFilled = s.fields.filter(f => (wkData[d] && wkData[d][s.key+"__"+f] || "").trim().length > 0).length;
                      const secDone = secFilled === s.fields.length;
                      const secPartial = secFilled > 0 && !secDone;
                      return <span key={s.key} style={{width:26,height:5,borderRadius:3,display:"inline-block",background:secDone?"#A8D8C0":secPartial?"#E8A8A0":"#F0E8E8"}}/>;
                    })}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <span style={{fontSize:18}}>{pct===100?"":filled>0?"":"○"}</span>
                  <span style={{fontSize:11,color:T.muted}}>{pct}%</span>
                </div>
              </div>
            </button>
          );
        })}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

// ── PROFILE SCREEN ──
function ProfileScreen({client, onLogout}) {
  return (
    <div style={{...S.screen}}>
      <div style={S.navTop}>
        <div style={{width:38}}/>
        <div style={{fontSize:17,fontStyle:"italic",color:T.text}}>Il mio profilo</div>
        <div style={{width:38}}/>
      </div>
      <div style={S.body}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}></div>
          <div style={{fontSize:22,fontStyle:"italic",color:T.text}}>{client.name}</div>
          {client.papa && <div style={{fontSize:14,color:T.muted,marginTop:4}}>con {client.papa} </div>}
        </div>
        {[
          {label:"Consulente",value:"With Love Sleep Coaching",icon:""},
          {label:"Programma",value:"14 giorni",icon:""},
          {label:"Iniziato il",value:client.createdAt,icon:""},
          ...(client.email ? [{label:"Email",value:client.email,icon:""}] : [])
        ].map(item => (
          <Card key={item.label} style={{marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:24}}>{item.icon}</span>
            <div>
              <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.6px"}}>{item.label}</div>
              <div style={{fontSize:16,color:T.text,marginTop:2}}>{item.value}</div>
            </div>
          </Card>
        ))}
        <div style={{height:20}}/>
        <div style={{fontSize:13,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>Installa l'app sul telefono</div>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <InstallGuide platform="apple"/>
          <InstallGuide platform="android"/>
        </div>
        <BtnGho onClick={onLogout}>Esci dall'account</BtnGho>
        <div style={{marginTop:12,textAlign:"center"}}><BtnSm onClick={() => window.location.reload()} color={T.sage} style={{fontSize:13}}> Aggiorna dati</BtnSm></div>
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

// ── REGISTER PAGE (registrazione libera, senza codice invito) ──
function RegisterPage() {
  const [nome, setNome] = useState(""), [cognome, setCognome] = useState(""), [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false), [err, setErr] = useState("");

  async function handle() {
    if (!nome.trim() || !cognome.trim() || !email.trim()) { setErr("Compila tutti i campi."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErr("Email non valida."); return; }
    setSaving(true);
    try {
      const c = emptyClient(nome.trim()+" "+cognome.trim(), "");
      c.email = email.trim();
      c.registeredAt = new Date().toLocaleDateString("it-IT");
      await saveClient(c);
      window.location.href = window.location.origin + window.location.pathname + "?client=" + c.link;
    } catch(e) {
      setErr("Errore durante la registrazione. Riprova.");
      setSaving(false);
    }
  }

  return (
    <div style={{...S.screen, justifyContent:"center", padding:"32px 28px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(200,144,144,0.18)",fontSize:32}}></div>
        <div style={S.logo}>with love</div>
        <h1 style={{fontSize:28,fontWeight:500,color:T.text,marginTop:6,fontStyle:"italic"}}>Diario del Sonno</h1>
        <p style={{marginTop:6,color:T.muted,fontStyle:"italic"}}>Registrati al percorso</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
        <div><Lbl>Nome *</Lbl><Inp value={nome} onChange={setNome} placeholder="Il tuo nome..."/></div>
        <div><Lbl>Cognome *</Lbl><Inp value={cognome} onChange={setCognome} placeholder="Il tuo cognome..."/></div>
        <div><Lbl>Email *</Lbl><Inp value={email} onChange={setEmail} placeholder="La tua email..."/></div>
        {err && <p style={{color:T.roseDark,fontSize:14,textAlign:"center",fontStyle:"italic"}}>{err}</p>}
      </div>
      <BtnPri onClick={handle} loading={saving}>Accedi al tuo diario</BtnPri>
    </div>
  );
}

// ── LOGIN (FIX 1: Firebase Auth per la consulente) ──
function LoginScreen({onLogin, clients}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search), cl = p.get("client");
    if (cl) { const found = clients.find(c => c.link===cl); if (found) onLogin("client", found); }
  }, [clients]);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) { setErr("Inserisci email e password."); return; }
    setLoading(true); setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin("consultant");
    } catch(e) {
      setErr("Credenziali non corrette.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{...S.screen, justifyContent:"center", padding:"32px 28px"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(200,144,144,0.18)",fontSize:32}}></div>
        <div style={S.logo}>with love</div>
        <h1 style={{fontSize:28,fontWeight:500,color:T.text,marginTop:6,fontStyle:"italic"}}>Diario del Sonno</h1>
        <p style={{marginTop:6,color:T.muted,fontStyle:"italic"}}>per famiglie speciali</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
        <div><Lbl>Email consulente</Lbl><Inp value={email} onChange={setEmail} placeholder="La tua email..."/></div>
        <div><Lbl>Password</Lbl><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="La tua password..." style={{width:"100%",background:T.pink,border:"none",borderRadius:12,padding:"12px 14px",fontSize:16,color:T.text,outline:"none",fontFamily:"'EB Garamond',serif"}}/></div>
        {err && <p style={{color:T.roseDark,fontSize:14,textAlign:"center",fontStyle:"italic"}}>{err}</p>}
      </div>
      <BtnPri onClick={handleLogin} loading={loading}>Accedi al pannello</BtnPri>
      <p style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted,fontStyle:"italic"}}>Le clienti accedono tramite il loro link personale </p>
    </div>
  );
}

// ── CONSULTANT VIEW ──
function ConsultantView({clients, onAddClient, onUpdateClient, onDeleteClient, onLogout}) {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState(""), [newPapa, setNewPapa] = useState("");
  const [tab, setTab] = useState("w1");
  const [activeDay, setActiveDay] = useState(DAYS_W1[0]);
  const [activeSection, setActiveSection] = useState(null);
  const [saved, setSaved] = useState(false);
  const [tableWeek, setTableWeek] = useState(1);
  const [toast, setToast] = useState(false);
  // FIX 5: Stato per dialog di conferma
  const [confirmDelete, setConfirmDelete] = useState(null);
  const debounceRef = useRef(null);
  const weekNum = tab==="w2" ? 2 : 1;

  function getClient() { return selected ? (clients.find(c => c.id===selected.id) || selected) : null; }

  function handleChange(dk, f, v) {
    const client = getClient(); if (!client) return;
    const wk = "week"+weekNum;
    const updated = {...client, [wk]: {...safeWeek(client, weekNum), [dk]: {...safeWeek(client, weekNum)[dk], [f]: v}}};
    onUpdateClient(updated, false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onUpdateClient(updated, true), 800);
  }

  async function handleSectionSave() {
    clearTimeout(debounceRef.current);
    const client = getClient(); if (client) await onUpdateClient(client, true);
  }

  function openClient(c) {
    const fresh = clients.find(x => x.id===c.id) || c;
    setSelected(fresh); setTab("w1"); setActiveDay(DAYS_W1[0]); setActiveSection(null); setView("detail");
  }
  function openTable(c) {
    const fresh = clients.find(x => x.id===c.id) || c;
    setSelected(fresh); setTableWeek(1); setView("table");
  }
  function openModulo(c) {
    const fresh = clients.find(x => x.id===c.id) || c;
    setSelected(fresh); setView("modulo");
  }

  useEffect(() => {
    if (selected) { const fresh = clients.find(c => c.id===selected.id); if (fresh) setSelected(fresh); }
  }, [clients]);

  const consultantWrapper = (content) => (
    <div style={{width:"100vw",minHeight:"100vh",background:"#f5ede8",overflowY:"auto"}}>
      <div style={{maxWidth:680,margin:"0 auto",minHeight:"100vh",background:T.bg,boxShadow:"0 0 40px rgba(0,0,0,0.08)"}}>
        {content}
      </div>
    </div>
  );

  if (view==="modulo" && selected) {
    const client = clients.find(c => c.id===selected.id) || selected;
    return consultantWrapper(
      <ModuloView client={client}
        onSave={(data) => onUpdateClient({...client, ...data}, true)}
        onExit={() => setView("list")}/>
    );
  }

  if (view==="table" && selected) {
    const client = clients.find(c => c.id===selected.id) || selected;
    const wData = safeWeek(client, tableWeek);
    return consultantWrapper(
      <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <div style={S.navTop}>
          <BtnIco onClick={() => setView("detail")}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
          <div style={{textAlign:"center"}}><div style={S.logo}>Vista Tabella</div><div style={{fontSize:15,fontStyle:"italic",color:T.text}}>{client.name}</div></div>
          <div style={{width:38}}/>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
          <BtnSm onClick={() => setView("list")} color={T.muted} style={{fontSize:13}}>← Lista clienti</BtnSm>
          {[1,2].map(w => <BtnSm key={w} onClick={() => setTableWeek(w)} color={tableWeek===w?T.roseDark:"#eee"} textColor={tableWeek===w?"#fff":T.text} style={{fontSize:13}}>Settimana {w}</BtnSm>)}
        </div>
        <div style={{padding:"0 12px 24px",flex:1}}>
          <TableView weekData={wData} weekNum={tableWeek}/>
        </div>
      </div>
    );
  }

  if (view==="detail" && selected && activeSection) {
    const client = getClient();
    const wkData = safeWeek(client, weekNum);
    return consultantWrapper(
      <SectionScreen section={activeSection} dayKey={activeDay} data={wkData[activeDay]}
        onChange={handleChange} onBack={() => setActiveSection(null)}
        isConsultant={true} onSave={handleSectionSave}/>
    );
  }

  if (view==="detail" && selected && tab==="q") {
    const client = clients.find(c => c.id===selected.id) || selected;
    const questionario = client.questionario || emptyQuestionario();
    return consultantWrapper(
      <QuestionarioView questionario={questionario}
        onChange={(k,v) => onUpdateClient({...client, questionario:{...questionario,[k]:v}}, false)}
        readOnly={false} onBack={() => setTab("w1")} onPDF={async () => await downloadPDF(client)}/>
    );
  }

  if (view==="detail" && selected) {
    const client = getClient();
    const days = weekNum===1 ? DAYS_W1 : DAYS_W2;
    const baseUrl = window.location.origin + window.location.pathname;

    async function handleSave() {
      clearTimeout(debounceRef.current);
      await onUpdateClient(client, true);
      setSaved(true); setToast(true);
      setTimeout(() => { setSaved(false); setToast(false); }, 2500);
    }

    return consultantWrapper(
      <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <div style={S.navTop}>
          <BtnIco onClick={() => setView("list")}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
          <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:16,fontStyle:"italic",color:T.text}}>{client.name}</div></div>
          <BtnIco onClick={() => openTable(client)}><Icon name="table" size={22} color={T.sage}/></BtnIco>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          <Card style={{marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:12,color:T.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}> {baseUrl}?client={client.link}</div>
            <BtnSm onClick={() => navigator.clipboard && navigator.clipboard.writeText(baseUrl+"?client="+client.link)} color={T.roseDark} style={{fontSize:12}}>Copia</BtnSm>
          </Card>
          <div style={{background:"#F5EDEB",borderRadius:16,padding:4,display:"flex",gap:4,marginBottom:16}}>
            {[{id:"w1",label:"Settimana 1"},{id:"w2",label:"Settimana 2"},{id:"q",label:"Questionario"}].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); if(t.id==="w1")setActiveDay(DAYS_W1[0]); if(t.id==="w2")setActiveDay(DAYS_W2[0]); }}
                style={{flex:1,padding:"8px 4px",borderRadius:12,border:"none",fontSize:14,cursor:"pointer",background:tab===t.id?"white":"none",color:tab===t.id?T.roseDark:T.muted,boxShadow:tab===t.id?"0 2px 8px rgba(180,120,120,0.12)":"none"}}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {days.map(d => <button key={d} onClick={() => setActiveDay(d)} style={{padding:"6px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,background:activeDay===d?T.roseDark:"#F5EDEB",color:activeDay===d?"white":T.text}}>{d}</button>)}
          </div>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderRadius:18,cursor:"pointer",marginBottom:10,border:"none",fontFamily:"'EB Garamond',serif",textAlign:"left",width:"100%",background:s.color,boxShadow:"0 2px 10px rgba(180,120,120,0.07)"}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:500,color:T.text,fontStyle:"italic"}}>{s.label}</div>
                <div style={{fontSize:12,color:T.muted}}>{activeDay}</div>
              </div>
              <span style={{color:T.muted,fontSize:20}}>›</span>
            </button>
          ))}
          <CaroDiario data={safeWeek(client, weekNum)[activeDay]||emptyDay()} onChange={handleChange} dayKey={activeDay} isConsultant={true}/>
          <div style={{marginTop:16}}>
            <BtnPri onClick={handleSave}>{saved?"✓ Salvato!":"Salva modifiche"}</BtnPri>
          </div>
          <div style={{height:24}}/>
        </div>
        <Toast show={toast}/>
      </div>
    );
  }

  return consultantWrapper(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      <div style={S.navTop}>
        <div><div style={S.logo}>with love</div><div style={{fontSize:17,fontStyle:"italic",color:T.text}}>Pannello Consulente</div></div>
        <div style={{display:"flex",gap:4}}>
          <BtnIco onClick={() => window.location.reload()}><Icon name="refresh" size={20} color={T.sage}/></BtnIco>
          <BtnIco onClick={onLogout}><Icon name="logout" size={20} color={T.roseDark}/></BtnIco>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        <Card style={{background:"linear-gradient(135deg,#E6F4EF,#EDE8F5)",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.sage,marginBottom:2}}> Link registrazione · Sonno</div><div style={{fontSize:12,color:T.muted}}>Condividilo per nuove clienti</div></div>
          <BtnSm onClick={() => navigator.clipboard && navigator.clipboard.writeText(window.location.origin+window.location.pathname+"?register=true")} color={T.sage} style={{fontSize:12}}>Copia</BtnSm>
        </Card>
        <Card style={{background:"linear-gradient(135deg,#FBF0E6,#EDE8F5)",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.lilac,marginBottom:2}}> Link registrazione · Diario</div><div style={{fontSize:12,color:T.muted}}>Diario della giornata (pannolino)</div></div>
          <BtnSm onClick={() => navigator.clipboard && navigator.clipboard.writeText(window.location.origin+window.location.pathname+"?register=modulo")} color={T.lilac} style={{fontSize:12}}>Copia</BtnSm>
        </Card>
        <Card style={{background:"linear-gradient(135deg,#FBF0E6,#FAE8E6)",marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:500,color:T.roseDark,marginBottom:12,fontStyle:"italic"}}>Aggiungi nuova cliente</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><Lbl>Nome mamma</Lbl><Inp value={newName} onChange={setNewName} placeholder="Nome..."/></div>
            <div><Lbl>Nome papa</Lbl><Inp value={newPapa} onChange={setNewPapa} placeholder="Nome..."/></div>
            <BtnPri onClick={() => { if (newName.trim()) { onAddClient(newName.trim(), newPapa.trim()); setNewName(""); setNewPapa(""); } }} style={{marginTop:4}}>Aggiungi cliente</BtnPri>
          </div>
        </Card>
        {clients.length===0 ? (
          <div style={{textAlign:"center",color:T.muted,padding:40,fontStyle:"italic"}}>Nessuna cliente ancora </div>
        ) : clients.map(c => (
          <Card key={c.id} style={{marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:500,fontSize:16,color:T.text,fontStyle:"italic"}}>{c.name}{c.papa?" · "+c.papa:""}</div>
              <div style={{fontSize:12,color:T.muted}}>Dal {c.createdAt}</div>
              {(c.type||"sonno")==="modulo" && <div style={{display:"inline-block",fontSize:11,color:T.lilac,background:"rgba(176,160,204,0.15)",borderRadius:10,padding:"1px 8px",marginTop:3}}>Diario della giornata</div>}
              {c.email && <div style={{fontSize:12,color:T.sage,marginTop:2}}> {c.email}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(c.type||"sonno")==="modulo" ? (
                <BtnSm onClick={() => openModulo(c)} color={T.lilac} style={{fontSize:12}}>Diario</BtnSm>
              ) : (
                <>
                  <BtnSm onClick={() => openClient(c)} color={T.roseDark} style={{fontSize:12}}>Scheda</BtnSm>
                  <BtnSm onClick={() => openTable(c)} color={T.lilac} style={{fontSize:12}}>Tabella</BtnSm>
                </>
              )}
              {/* FIX 5: Dialog custom al posto di window.confirm */}
              <BtnSm onClick={() => setConfirmDelete(c.id)} color="#e0d0d0" textColor={T.muted} style={{fontSize:12}}>Elimina</BtnSm>
            </div>
          </Card>
        ))}
        <div style={{height:24}}/>
      </div>
      {/* FIX 5: Dialog di conferma */}
      {confirmDelete && (
        <ConfirmDialog
          message={"Eliminare " + (clients.find(c => c.id===confirmDelete)?.name || "") + "? Questa azione è irreversibile."}
          onConfirm={() => { onDeleteClient(confirmDelete); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ── MODULO: helpers UI ──
function countModuloRows(day) {
  if (!day || !day.rows) return 0;
  return day.rows.filter(r => (r.orario||"").trim() || (r.cosa||"").trim() || r.p || r.d || r.f).length;
}

function PDFToggle({label, on, onToggle}) {
  return (
    <button onClick={onToggle} aria-pressed={on} style={{width:34,height:34,borderRadius:"50%",border:"1.5px solid "+(on?T.sage:"#e0d0d0"),background:on?T.sage:"#fff",color:on?"#fff":T.muted,fontSize:15,fontWeight:500,cursor:"pointer",fontFamily:"'EB Garamond',serif",flexShrink:0}}>
      {label}
    </button>
  );
}

// ── MODULO: editor di una giornata ──
function ModuloDayScreen({dayKey, day, onField, onRow, onAddRow, onBack, onSave}) {
  const [toast, setToast] = useState(false);
  const [err, setErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const d = day || emptyModuloDay();

  async function save() {
    setSaving(true);
    try { await onSave(); setToast(true); setTimeout(() => setToast(false), 2000); }
    catch(e) { setErr(true); setTimeout(() => setErr(false), 2000); }
    finally { setSaving(false); }
  }

  return (
    <div className="slide-enter" style={S.screen}>
      <div style={{...S.navTop, background:T.peach}}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}>
          <div style={S.logo}>with love</div>
          <div style={{fontSize:17,fontWeight:500,color:T.text,fontStyle:"italic"}}>Diario della giornata</div>
          <div style={{fontSize:12,color:T.muted}}>{dayKey}</div>
        </div>
        <BtnIco onClick={save} disabled={saving}><Icon name="save" size={22} color={saving?T.muted:T.sage}/></BtnIco>
      </div>
      <div style={S.body}>
        <Card style={{marginBottom:14}}>
          <Lbl>Giorno (data)</Lbl>
          <Inp value={d.data} onChange={v=>onField("data",v)} placeholder="gg/mm/aaaa"/>
        </Card>
        <Lbl>Orario · Cosa è successo · Note (P / D / F)</Lbl>
        <div style={{height:8}}/>
        {d.rows.map((r,i) => (
          <Card key={i} style={{marginBottom:10}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input value={r.orario} onChange={e=>onRow(i,"orario",e.target.value)} placeholder="00:00"
                style={{width:78,background:T.peach,border:"none",borderRadius:10,padding:"10px 12px",fontSize:15,fontFamily:"'EB Garamond',serif",outline:"none"}}/>
              <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
                {[["P","p"],["D","d"],["F","f"]].map(([lab,key]) => (
                  <PDFToggle key={key} label={lab} on={!!r[key]} onToggle={()=>onRow(i,key,!r[key])}/>
                ))}
              </div>
            </div>
            <textarea value={r.cosa} onChange={e=>onRow(i,"cosa",e.target.value)} rows={2} placeholder="Cosa è successo..."
              style={{width:"100%",background:T.peach,border:"none",borderRadius:10,padding:"10px 12px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
          </Card>
        ))}
        <button onClick={onAddRow} style={{width:"100%",background:"none",border:"1.5px dashed "+T.rose,color:T.roseDark,borderRadius:14,padding:"11px",fontSize:15,cursor:"pointer",fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>+ Aggiungi riga</button>
        <div style={{height:18}}/>
        <Card style={{background:"linear-gradient(135deg,#FBF0E6,#EDE8F5)",border:"1.5px solid #E8C0B8"}}>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:20,color:T.roseDark,fontStyle:"italic",marginBottom:4}}>Cosa ho notato oggi</div>
          <div style={{fontSize:12,color:T.muted,fontStyle:"italic",marginBottom:10}}>Atteggiamenti, nessi che inizio a vedere, momenti di distrazione, qualunque cosa.</div>
          <textarea value={d.notato} onChange={e=>onField("notato",e.target.value)} rows={5} placeholder="Scrivi qui..."
            style={{width:"100%",background:"rgba(255,255,255,0.7)",border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box",color:T.text,lineHeight:1.6,outline:"none"}}/>
        </Card>
        <div style={{height:20}}/>
        <BtnPri onClick={save} loading={saving}>Salva giornata</BtnPri>
        <div style={{height:24}}/>
      </div>
      <Toast show={toast}/>
      <Toast show={err} error={true}/>
    </div>
  );
}

// ── MODULO: vista cliente (SOLO il diario, nessuna sezione sonno) ──
// onExit (opzionale): usato dalla consulente per tornare alla lista clienti.
function ModuloView({client, onSave, onExit}) {
  const [screen, setScreen] = useState("home");
  const [activeDay, setActiveDay] = useState(null);
  const [days, setDays] = useState(client.moduloDays && client.moduloDays.length ? [...client.moduloDays] : [...MODULO_DEFAULT_DAYS]);
  const [modulo, setModulo] = useState(() => {
    const base = {};
    (client.moduloDays && client.moduloDays.length ? client.moduloDays : MODULO_DEFAULT_DAYS).forEach(d => { base[d] = safeModuloDay((client.modulo||{})[d]); });
    return base;
  });
  const [toast, setToast] = useState(false);

  const daysRef = useRef(days);
  const moduloRef = useRef(modulo);
  const autoSaveTimer = useRef(null);

  function triggerAutoSave() {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try { await onSave({moduloDays: daysRef.current, modulo: moduloRef.current}); }
      catch(e) { console.error("Auto-save fallito:", e); }
    }, 2000);
  }

  function setDayField(dayKey, field, val) {
    setModulo(prev => { const next = {...prev, [dayKey]: {...(prev[dayKey]||emptyModuloDay()), [field]: val}}; moduloRef.current = next; return next; });
    triggerAutoSave();
  }
  function updateRow(dayKey, idx, field, val) {
    setModulo(prev => {
      const day = prev[dayKey] || emptyModuloDay();
      const rows = day.rows.map((r,i) => i===idx ? {...r, [field]: val} : r);
      const next = {...prev, [dayKey]: {...day, rows}};
      moduloRef.current = next; return next;
    });
    triggerAutoSave();
  }
  function addRow(dayKey) {
    setModulo(prev => { const day = prev[dayKey] || emptyModuloDay(); const next = {...prev, [dayKey]: {...day, rows: [...day.rows, emptyModuloRow()]}}; moduloRef.current = next; return next; });
    triggerAutoSave();
  }
  function addDay() {
    const n = "Giorno " + (daysRef.current.length + 1);
    const nd = [...daysRef.current, n]; daysRef.current = nd; setDays(nd);
    const nm = {...moduloRef.current, [n]: emptyModuloDay()}; moduloRef.current = nm; setModulo(nm);
    triggerAutoSave();
  }
  async function doSave() {
    clearTimeout(autoSaveTimer.current);
    await onSave({moduloDays: daysRef.current, modulo: moduloRef.current});
    setToast(true); setTimeout(() => setToast(false), 2200);
  }

  if (screen==="day" && activeDay) return (
    <ModuloDayScreen dayKey={activeDay} day={modulo[activeDay]}
      onField={(f,v) => setDayField(activeDay,f,v)}
      onRow={(i,f,v) => updateRow(activeDay,i,f,v)}
      onAddRow={() => addRow(activeDay)}
      onBack={() => setScreen("home")} onSave={doSave}/>
  );

  return (
    <div style={S.screen}>
      <div style={S.navTop}>
        {onExit
          ? <BtnIco onClick={onExit}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
          : <div style={{width:38}}/>}
        <div style={{textAlign:"center"}}>
          <div style={S.logo}>with love</div>
          <div style={{fontSize:16,fontStyle:"italic",color:T.text}}>{onExit ? client.name : "Ciao, "+client.name.split(" ")[0]}</div>
        </div>
        <div style={{width:38}}/>
      </div>
      <div style={S.body}>
        <Card style={{background:"linear-gradient(135deg,#FBF0E6,#FAE8E6)",marginBottom:18}}>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:22,color:T.roseDark,fontStyle:"italic",marginBottom:4}}>Diario della giornata</div>
          <div style={{fontSize:14,color:T.muted,fontStyle:"italic",marginBottom:14}}>Annota orari, cosa succede e cosa noti, giorno per giorno.</div>
          <div style={{display:"flex",gap:8}}>
            <BtnSm onClick={() => downloadModuloBlankPDF()} color={T.lilac} style={{flex:1,fontSize:12}}>Scarica vuoto</BtnSm>
            <BtnSm onClick={() => downloadModuloFilledPDF({...client, moduloDays:daysRef.current, modulo:moduloRef.current})} color={T.roseDark} style={{flex:1,fontSize:12}}>Scarica compilato</BtnSm>
          </div>
        </Card>
        <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>I tuoi giorni</div>
        {days.map(d => {
          const n = countModuloRows(modulo[d]);
          return (
            <button key={d} onClick={() => {setActiveDay(d); setScreen("day");}} style={{background:"white",border:"none",borderRadius:18,padding:"14px 16px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 10px rgba(180,120,120,0.07)",marginBottom:10,width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:16,fontWeight:500,color:T.text,fontStyle:"italic"}}>{d}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{n>0 ? n+" annotazioni" : "Da compilare"}{modulo[d]&&modulo[d].data?" · "+modulo[d].data:""}</div>
              </div>
              <span style={{color:T.muted,fontSize:20}}>›</span>
            </button>
          );
        })}
        <button onClick={addDay} style={{width:"100%",background:"none",border:"1.5px dashed "+T.rose,color:T.roseDark,borderRadius:16,padding:"12px",fontSize:15,cursor:"pointer",fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginTop:2}}>+ Aggiungi giorno</button>
        <div style={{height:24}}/>
      </div>
      <Toast show={toast}/>
    </div>
  );
}

// ── MODULO: pagina di registrazione (link dedicato, accesso libero) ──
function ModuloRegisterPage() {
  const [nome, setNome] = useState(""), [cognome, setCognome] = useState(""), [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false), [err, setErr] = useState("");

  async function handle() {
    if (!nome.trim() || !cognome.trim() || !email.trim()) { setErr("Compila tutti i campi."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErr("Email non valida."); return; }
    setSaving(true);
    try {
      const c = emptyModuloClient(nome.trim()+" "+cognome.trim());
      c.email = email.trim();
      c.registeredAt = new Date().toLocaleDateString("it-IT");
      await saveClient(c);
      window.location.href = window.location.origin + window.location.pathname + "?client=" + c.link;
    } catch(e) {
      setErr("Errore durante la registrazione. Riprova.");
      setSaving(false);
    }
  }

  return (
    <div style={{...S.screen, justifyContent:"center", padding:"32px 28px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FBF0E6,#EDE8F5)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(200,144,144,0.18)",fontSize:32}}></div>
        <div style={S.logo}>with love</div>
        <h1 style={{fontSize:28,fontWeight:500,color:T.text,marginTop:6,fontStyle:"italic"}}>Diario della giornata</h1>
        <p style={{marginTop:6,color:T.muted,fontStyle:"italic"}}>Registrati per iniziare</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
        <div><Lbl>Nome *</Lbl><Inp value={nome} onChange={setNome} placeholder="Il tuo nome..."/></div>
        <div><Lbl>Cognome *</Lbl><Inp value={cognome} onChange={setCognome} placeholder="Il tuo cognome..."/></div>
        <div><Lbl>Email *</Lbl><Inp value={email} onChange={setEmail} placeholder="La tua email..."/></div>
        {err && <p style={{color:T.roseDark,fontSize:14,textAlign:"center",fontStyle:"italic"}}>{err}</p>}
      </div>
      <BtnPri onClick={handle} loading={saving}>Accedi al diario</BtnPri>
    </div>
  );
}

// ── Schermata accesso scaduto (6 mesi — solo app, non il corso) ──
function ExpiredScreen() {
  return (
    <div style={{...S.screen, justifyContent:"center", padding:"32px 28px", textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 18px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>♥</div>
      <div style={S.logo}>with love</div>
      <h1 style={{fontSize:24,fontWeight:500,color:T.text,marginTop:8,fontStyle:"italic"}}>Il periodo è terminato</h1>
      <p style={{marginTop:14,color:T.muted,fontStyle:"italic",lineHeight:1.8}}>
        Il periodo di accesso all'app è finito e il tuo account è stato chiuso.<br/>
        Questo riguarda <b>solo l'app</b>, non il tuo percorso.<br/>
        Se vuoi maggiori informazioni, scrivici pure. ♥
      </p>
      <a href="mailto:supporto@withlovefamily.it"
         style={{display:"inline-block",marginTop:24,background:T.roseDark,color:"#fff",textDecoration:"none",padding:"13px 32px",borderRadius:40,fontSize:15,fontStyle:"italic",boxShadow:"0 6px 18px rgba(200,144,144,0.30)"}}>
        Scrivici un'email
      </a>
    </div>
  );
}

// ── APP ROOT ──
export default function App() {
  const [role, setRole] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [registerMode, setRegisterMode] = useState(null); // "sonno" | "modulo" | null
  const [expiredLink, setExpiredLink] = useState(false);   // link di account scaduto/cancellato

  // FIX 12: Debounce Firestore per evitare scritture ad ogni keystroke
  const debounceTimers = useRef({});

  useEffect(() => {
    const el = document.createElement("style"); el.textContent = GLOBAL_CSS; document.head.appendChild(el);
    const p = new URLSearchParams(window.location.search);
    const reg = p.get("register");
    if (reg==="modulo") setRegisterMode("modulo");
    else if (reg==="true") setRegisterMode("sonno");

    // FIX 1: Ripristina sessione consulente via Firebase Auth
    const unsubAuth = onAuthStateChanged(auth, user => {
      if (user && !role) {
        setRole("consultant");
      }
    });

    // FIX 3: Mostra errore se Firestore non risponde
    loadClients()
      .then(c => {
        // Pulizia attiva: gli account oltre i 6 mesi vengono cancellati da Firestore
        // anche se la cliente non rientra (così non occupano spazio).
        const expired = c.filter(isExpired);
        const active = c.filter(x => !isExpired(x));
        setClients(active);
        setLoading(false);
        expired.forEach(e => { removeClient(e.id).catch(() => {}); });
      })
      .catch(e => { setLoadError("Errore di connessione. Controlla la rete e ricarica."); setLoading(false); });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      const p = new URLSearchParams(window.location.search), cl = p.get("client");
      if (cl) {
        const found = clients.find(c => c.link===cl);
        if (found) {
          if (isExpired(found)) {
            // 6 mesi passati: cancella l'account e mostra il messaggio di fine periodo
            setExpiredLink(true);
            deleteClient(found.id);
          } else {
            setActiveClient(found); setRole("client");
          }
        } else {
          // link di un account già scaduto e cancellato: mostra comunque il messaggio
          setExpiredLink(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, clients]);

  async function addClient(n, p) {
    const c = emptyClient(n, p);
    setClients(prev => [...prev, c]);
    await saveClient(c);
  }

  // FIX 12: onUpdateClient con salvataggio opzionale (per debounce dalla ConsultantView)
  async function updateClient(u, saveNow = true) {
    setClients(prev => prev.map(c => c.id===u.id ? u : c));
    if (activeClient && activeClient.id===u.id) setActiveClient(u);
    if (!saveNow) return;
    // Cancella eventuale timer pendente e salva subito
    clearTimeout(debounceTimers.current[u.id]);
    delete debounceTimers.current[u.id];
    try { await saveClient(u); } catch(e) { console.error("Errore salvataggio:", e); throw e; }
  }

  async function deleteClient(id) {
    setClients(prev => prev.filter(c => c.id!==id));
    await removeClient(id);
  }

  async function saveClientData(data) {
    if (!activeClient) return;
    const u = {...activeClient, ...data};
    setActiveClient(u);
    setClients(prev => prev.map(c => c.id===u.id ? u : c));
    await saveClient(u);
  }

  function handleLogin(r, cl) {
    setRole(r);
    if (cl) setActiveClient(cl);
  }

  async function handleLogout() {
    try { await signOut(auth); } catch(e) { /* già disconnesso */ }
    setRole(null);
    sessionStorage.removeItem("role");
  }

  const mobileWrap = (content) => (
    <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5ede8"}}>
      <div style={{width:420,height:"min(844px,100vh)",borderRadius:window.innerWidth>500?44:0,overflow:"hidden",boxShadow:window.innerWidth>500?"0 20px 60px rgba(0,0,0,0.2)":"none",position:"relative"}}>
        {content}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f5ede8",fontFamily:"'EB Garamond',serif",fontSize:22,color:T.roseDark,fontStyle:"italic"}}>
      with love 
    </div>
  );

  // FIX 3: Schermata di errore se Firestore non risponde
  if (loadError) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f5ede8",fontFamily:"'EB Garamond',serif",padding:32,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:16}}>⚠</div>
      <div style={{fontSize:18,color:T.text,fontStyle:"italic",marginBottom:8}}>Problema di connessione</div>
      <div style={{fontSize:14,color:T.muted,marginBottom:24}}>{loadError}</div>
      <BtnSm onClick={() => window.location.reload()} color={T.roseDark} style={{fontSize:15,padding:"10px 28px"}}>Ricarica</BtnSm>
    </div>
  );

  if (registerMode==="modulo") return mobileWrap(<ModuloRegisterPage/>);
  if (registerMode==="sonno") return mobileWrap(<RegisterPage/>);
  if (expiredLink) return mobileWrap(<ExpiredScreen/>);
  if (!role) return mobileWrap(<LoginScreen clients={clients} onLogin={handleLogin}/>);
  if (role==="client" && activeClient) {
    const fresh = clients.find(c => c.id===activeClient.id) || activeClient;
    // Accesso app limitato a 60 giorni (solo app, non il corso)
    if (isExpired(fresh)) return mobileWrap(<ExpiredScreen/>);
    if ((fresh.type||"sonno")==="modulo") return mobileWrap(<ModuloView client={fresh} onSave={saveClientData}/>);
    return mobileWrap(<ClientView client={fresh} onSave={saveClientData}/>);
  }
  if (role==="consultant") return (
    <ConsultantView clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} onLogout={handleLogout}/>
  );
  return null;
}
