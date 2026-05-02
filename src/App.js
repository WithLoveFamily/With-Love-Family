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
  { label:"Mattina", key:"mattina", icon:"🌤️", color:"#FBF0E6", fields:["Svegliato/a","Colazione","Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Pranzo alle"] },
  { label:"Pomeriggio", key:"pomeriggio", icon:"☁️", color:"#EDE8F5", fields:["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino"] },
  { label:"Pisolino Extra", key:"pisolino_extra", icon:"💤", color:"#E6F4EF", fields:["Stanco/a","Inizio routine","Messo/a a letto","Addormentato/a","Come","Svegliato/a alle","Totale pisolino","Tot ore giorno"] },
  { label:"Sera", key:"sera", icon:"🌙", color:"#EDE8F5", fields:["Cena alle","Stanco/a alle ore...","Inizio routine","Fine routine","Stanco/a da 1a10","Addormentato/a","Come","Posizione Stanza"] },
  { label:"Notte", key:"notte", icon:"⭐", color:"#E8E6F5", fields:["Risveglio 1 - Tempo sveglio/a","Risveglio 1 - Note","Risveglio 2 - Tempo sveglio/a","Risveglio 2 - Note","Risveglio 3 - Tempo sveglio/a","Risveglio 3 - Note","Risveglio 4 - Tempo sveglio/a","Risveglio 4 - Note","Risveglio 5 - Tempo sveglio/a","Risveglio 5 - Note","Risveglio 6 - Tempo sveglio/a","Risveglio 6 - Note","Risveglio 7 - Tempo sveglio/a","Risveglio 7 - Note","Sveglio/a alle","Sveglio/a definitivamente"] }
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
  body { font-family: 'EB Garamond', Georgia, serif; background: #f5ede8; -webkit-font-smoothing: antialiased; }
  .slide-enter { animation: slideIn 0.25s cubic-bezier(.4,0,.2,1) forwards; }
  @keyframes slideIn { from { transform: translateX(40px); opacity:0; } to { transform: translateX(0); opacity:1; } }
  .wl-toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:#3a2a28; color:white; border-radius:20px; padding:10px 22px;
    font-size:14px; white-space:nowrap; z-index:9999; font-family:'EB Garamond',serif;
    animation: fadeUp .3s ease, fadeOut .3s ease 1.8s forwards; pointer-events:none; }
  @keyframes fadeUp { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes fadeOut { from{opacity:1} to{opacity:0} }
  ::-webkit-scrollbar { display:none; }
  input, textarea, button { font-family:'EB Garamond',Georgia,serif; }
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
function emptyClient(name,papa) {
  return { id:Date.now().toString(), name, papa:papa||"",
    link:Math.random().toString(36).slice(2,10),
    createdAt:new Date().toLocaleDateString("it-IT"),
    week1:emptyDays(DAYS_W1), week2:emptyDays(DAYS_W2),
    questionario:emptyQuestionario() };
}
function safeWeek(client,n) {
  const days=n===1?DAYS_W1:DAYS_W2, wk=client["week"+n]||{}, r={};
  days.forEach(d=>{r[d]=wk[d]?{...emptyDay(),...wk[d]}:emptyDay();}); return r;
}

async function loadClients() { try{const s=await getDocs(collection(db,"clients"));return s.docs.map(d=>d.data());}catch{return[];} }
async function saveClient(c) { await setDoc(doc(db,"clients",c.id),c); }
async function removeClient(id) { await deleteDoc(doc(db,"clients",id)); }

async function downloadPDF(client) {
  try {
    if(!window.jspdf) await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    const {jsPDF}=window.jspdf, pdf=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    const q=client.questionario||emptyQuestionario(), m=16, cw=210-m*2; let y=20;
    const chk=(n=10)=>{if(y+n>280){pdf.addPage();y=20;}};
    pdf.setFillColor(196,120,120);pdf.rect(0,0,210,18,"F");
    pdf.setTextColor(255,255,255);pdf.setFontSize(13);pdf.setFont("helvetica","bold");
    pdf.text("With Love Family - Questionario Sleep Coaching",m,11);
    pdf.setFontSize(9);pdf.setFont("helvetica","normal");
    pdf.text("Cliente: "+client.name+"   |   Data: "+client.createdAt,m,17);y=26;
    QUESTIONARIO_SEZIONI.forEach(sez=>{
      chk(14);pdf.setFillColor(176,160,204);pdf.rect(m,y,cw,8,"F");
      pdf.setTextColor(255,255,255);pdf.setFontSize(9);pdf.setFont("helvetica","bold");pdf.text(sez.titolo,m+3,y+5.5);y+=11;
      if(sez.note){pdf.setTextColor(120,120,120);pdf.setFontSize(8);pdf.setFont("helvetica","italic");pdf.text(sez.note,m,y);y+=5;}
      sez.campi.forEach(campo=>{
        const val=(q[campo.key]&&q[campo.key].trim())?q[campo.key]:"—";chk(18);
        pdf.setTextColor(60,60,60);pdf.setFontSize(8);pdf.setFont("helvetica","bold");pdf.text(campo.label,m,y);y+=4;
        pdf.setFillColor(251,240,230);pdf.setDrawColor(220,200,200);
        const lines=pdf.splitTextToSize(val,cw-6),bh=Math.max(8,lines.length*4.5+3);
        chk(bh+3);pdf.rect(m,y,cw,bh,"FD");
        pdf.setTextColor(40,40,40);pdf.setFontSize(8.5);pdf.setFont("helvetica","normal");pdf.text(lines,m+3,y+4.5);y+=bh+5;
      });y+=2;
    });
    const tp=pdf.internal.getNumberOfPages();
    for(let i=1;i<=tp;i++){pdf.setPage(i);pdf.setFontSize(7.5);pdf.setTextColor(160,160,160);pdf.setFont("helvetica","normal");pdf.text("With Love Family - "+client.name,m,292);pdf.text("Pag. "+i+" / "+tp,195,292,{align:"right"});}
    pdf.save("Questionario_"+client.name.replace(/\s+/g,"_")+".pdf");
  } catch(e){alert("Errore PDF. Usa un browser aggiornato.");console.error(e);}
}

function Icon({name,size=20,color="currentColor"}) {
  const p={
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

function BtnPri({children,onClick,disabled,style={}}) {
  return <button onClick={onClick} disabled={disabled} style={{background:"linear-gradient(135deg,#E8A8A0,#C89090)",color:"#fff",border:"none",borderRadius:28,padding:"13px 28px",fontSize:17,fontWeight:500,cursor:disabled?"default":"pointer",width:"100%",boxShadow:"0 4px 16px rgba(200,144,144,0.3)",opacity:disabled?0.6:1,...style}}>{children}</button>;
}
function BtnGho({children,onClick,style={}}) {
  return <button onClick={onClick} style={{background:"none",border:"1.5px solid "+T.rose,color:T.roseDark,borderRadius:28,padding:"10px 24px",fontSize:16,cursor:"pointer",width:"100%",...style}}>{children}</button>;
}
function BtnIco({children,onClick,style={}}) {
  return <button onClick={onClick} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:8,borderRadius:"50%",...style}}>{children}</button>;
}
function BtnSm({children,onClick,color=T.roseDark,textColor="#fff",style={}}) {
  return <button onClick={onClick} style={{background:color,color:textColor,border:"none",borderRadius:20,padding:"6px 14px",fontSize:14,cursor:"pointer",flexShrink:0,...style}}>{children}</button>;
}
function Inp({value,onChange,placeholder,multi,style={}}) {
  const s={width:"100%",background:T.pink,border:"none",borderRadius:12,padding:"12px 14px",fontSize:16,color:T.text,outline:"none",...style};
  return multi?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{...s,resize:"vertical"}}/>:<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>;
}
function Lbl({children}) { return <div style={{fontSize:11,fontWeight:500,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>{children}</div>; }
function Card({children,style={}}) { return <div style={{background:T.card,borderRadius:18,padding:"16px 18px",boxShadow:"0 2px 12px rgba(180,120,120,0.07)",...style}}>{children}</div>; }
function Toast({show}) { return show?<div className="wl-toast">Salvato con successo ✓</div>:null; }

function NoteBox({value,onChange,dayKey,fieldKey,label,isGold,placeholder,readOnly}) {
  const [exp,setExp]=useState(false);
  const prev=(value||"").slice(0,80),long=(value||"").length>80;
  return (
    <div style={{flex:1,background:isGold?"#fff8f0":"#f0f4fb",borderRadius:12,padding:10,border:"1px solid "+(isGold?"#E8C0B8":"#C0B0D8")}}>
      <div style={{fontSize:11,fontWeight:500,color:isGold?T.roseDark:T.lilac,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.8px"}}>{label}</div>
      {exp?(
        <div>
          <textarea value={value||""} readOnly={readOnly} onChange={e=>{if(!readOnly)onChange(dayKey,fieldKey,e.target.value);}} rows={3}
            style={{width:"100%",background:readOnly?"#f9f6f4":"#fff",border:"none",borderRadius:8,padding:"8px 10px",fontSize:14,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box"}}/>
          <span onClick={()=>setExp(false)} style={{fontSize:12,color:T.roseDark,cursor:"pointer",display:"inline-block",marginTop:4}}>chiudi ▲</span>
        </div>
      ):(
        <div onClick={()=>setExp(true)} style={{cursor:"pointer"}}>
          <div style={{fontSize:13,color:(value&&value.length>0)?T.text:"#c0a0a0",lineHeight:1.5,fontStyle:(value&&value.length>0)?"normal":"italic"}}>
            {(value&&value.length>0)?(long?prev+"...":value):(readOnly?"—":placeholder)}
          </div>
          {long&&<span style={{fontSize:12,color:T.roseDark,display:"inline-block",marginTop:4}}>leggi tutto ▼</span>}
        </div>
      )}
    </div>
  );
}

function NoteRow({data,onChange,sectionKey,dayKey,isConsultant}) {
  return (
    <div style={{marginTop:10,display:"flex",gap:8}}>
      <NoteBox value={data[sectionKey+"__NOTE_CLIENTE"]||""} onChange={onChange} dayKey={dayKey} fieldKey={sectionKey+"__NOTE_CLIENTE"} label="Note mamma" isGold={false} placeholder="Scrivi le tue note..." readOnly={false}/>
      <NoteBox value={data[sectionKey+"__NOTE_CONSULENTE"]||""} onChange={onChange} dayKey={dayKey} fieldKey={sectionKey+"__NOTE_CONSULENTE"} label="Note consulente" isGold={true} placeholder={isConsultant?"Aggiungi nota...":"—"} readOnly={!isConsultant}/>
    </div>
  );
}

function InstallGuide({platform}) {
  const [open,setOpen]=useState(false);
  const isApple=platform==="apple";
  const steps=isApple
    ?["1. Apri questo link da Safari (non Chrome!)","2. Tocca il pulsante Condividi in basso","3. Scorri e tocca Aggiungi a schermata Home","4. Tocca Aggiungi in alto a destra","L'app apparira come icona sul tuo iPhone!"]
    :["1. Apri questo link da Chrome","2. Tocca i 3 puntini in alto a destra","3. Tocca Aggiungi a schermata Home","4. Tocca Aggiungi per confermare","L'app apparira come icona sul tuo Android!"];
  return (
    <div style={{position:"relative",flex:1}}>
      <button onClick={()=>setOpen(!open)} style={{background:isApple?"#555":T.sage,color:"#fff",border:"none",borderRadius:20,padding:"10px 14px",fontSize:14,fontWeight:500,cursor:"pointer",width:"100%",fontFamily:"'EB Garamond',serif"}}>
        {isApple?"🍎 App iPhone":"🤖 App Android"}
      </button>
      {open&&(
        <div style={{position:"absolute",left:0,right:0,top:46,background:"#fff",border:"1px solid rgba(200,160,160,0.2)",borderRadius:16,padding:16,boxShadow:"0 8px 24px rgba(180,120,120,0.15)",zIndex:100}}>
          <div style={{fontWeight:600,color:isApple?"#555":T.sage,marginBottom:10,fontSize:14}}>{isApple?"Installa su iPhone/iPad":"Installa su Android"}</div>
          {steps.map((s,i)=><div key={i} style={{fontSize:13,color:T.text,marginBottom:8,lineHeight:1.5}}>{s}</div>)}
          <div onClick={()=>setOpen(false)} style={{textAlign:"right",fontSize:12,color:T.roseDark,cursor:"pointer",marginTop:8}}>Chiudi ✕</div>
        </div>
      )}
    </div>
  );
}

function CaroDiario({data,onChange,dayKey,isConsultant}) {
  const cv=data["caro_diario__shared"]||"",qv=data["caro_diario__consulente"]||"";
  return (
    <div style={{marginTop:20,background:"linear-gradient(135deg,#FBF0E6,#EDE8F5)",borderRadius:18,padding:20,border:"1.5px solid #E8C0B8"}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:22,color:T.roseDark,fontStyle:"italic",letterSpacing:1}}>Caro Diario</div>
        <div style={{fontSize:13,color:T.muted,marginTop:3,fontStyle:"italic"}}>Raccontami le sensazioni che hai avuto in questa giornata</div>
      </div>
      <div style={{marginBottom:14}}>
        <Lbl>La tua voce</Lbl>
        {isConsultant?(
          <div style={{fontSize:14,color:T.text,background:"rgba(255,255,255,0.7)",borderRadius:12,padding:"10px 14px",lineHeight:1.8,whiteSpace:"pre-wrap",minHeight:60}}>
            {cv.length>0?cv:<span style={{color:"#c0a0a0",fontStyle:"italic"}}>La cliente non ha ancora scritto nulla.</span>}
          </div>
        ):(
          <textarea value={cv} onChange={e=>onChange(dayKey,"caro_diario__shared",e.target.value)} placeholder="Scrivi qui come ti sei sentita oggi..." rows={4}
            style={{width:"100%",background:"rgba(255,255,255,0.7)",border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box",color:T.text,lineHeight:1.6}}/>
        )}
      </div>
      <div style={{borderTop:"1px dashed rgba(196,120,120,0.3)",margin:"14px 0"}}/>
      <Lbl>In calce - Nota consulente</Lbl>
      {isConsultant?(
        <textarea value={qv} onChange={e=>onChange(dayKey,"caro_diario__consulente",e.target.value)} placeholder="Scrivi qui la tua nota in calce..." rows={3}
          style={{width:"100%",background:"rgba(237,232,245,0.7)",border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box",color:T.lilac,lineHeight:1.6}}/>
      ):(
        <div style={{fontSize:14,color:T.lilac,background:"rgba(237,232,245,0.5)",borderRadius:12,padding:"10px 14px",lineHeight:1.8,whiteSpace:"pre-wrap",minHeight:36}}>
          {qv.length>0?qv:<span style={{color:"#c0b0d0",fontStyle:"italic"}}>Nessuna nota della consulente ancora.</span>}
        </div>
      )}
    </div>
  );
}

function SectionScreen({section,dayKey,data,onChange,onBack,isConsultant}) {
  const [toast,setToast]=useState(false);
  if(!data)return null;
  return (
    <div className="slide-enter" style={S.screen}>
      <div style={{...S.navTop,background:section.color}}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:26}}>{section.icon}</div>
          <div style={{fontSize:17,fontWeight:500,color:T.text,fontStyle:"italic"}}>{section.label}</div>
          <div style={{fontSize:12,color:T.muted}}>{dayKey}</div>
        </div>
        <BtnIco onClick={()=>{setToast(true);setTimeout(()=>setToast(false),2200);}}><Icon name="save" size={22} color={T.sage}/></BtnIco>
      </div>
      <div style={S.body}>
        <Card style={{marginBottom:16}}>
          {section.fields.map((f,i)=>{
            const isArea=f.toLowerCase().includes("note")||f.toLowerCase().includes("come");
            return (
              <div key={f} style={{paddingBottom:14,marginBottom:i<section.fields.length-1?14:0,borderBottom:i<section.fields.length-1?"1px solid rgba(200,160,160,0.1)":"none"}}>
                <Lbl>{f}</Lbl>
                {isArea?(
                  <textarea value={data[section.key+"__"+f]||""} onChange={e=>onChange(dayKey,section.key+"__"+f,e.target.value)}
                    style={{width:"100%",background:T.pink,border:"none",borderRadius:12,padding:"10px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",resize:"none",minHeight:60,lineHeight:1.5,outline:"none"}} placeholder="Scrivi qui..."/>
                ):(
                  <Inp value={data[section.key+"__"+f]||""} onChange={v=>onChange(dayKey,section.key+"__"+f,v)} placeholder={f.toLowerCase().includes("alle")||f.toLowerCase().includes("ora")?"00:00":"..."}/>
                )}
              </div>
            );
          })}
        </Card>
        {NOTE_SECTIONS.includes(section.key)&&<NoteRow data={data} onChange={onChange} sectionKey={section.key} dayKey={dayKey} isConsultant={isConsultant}/>}
        <div style={{height:24}}/>
        <BtnPri onClick={()=>{setToast(true);setTimeout(()=>setToast(false),2200);}}>Salva sezione</BtnPri>
        <div style={{height:24}}/>
      </div>
      <Toast show={toast}/>
    </div>
  );
}

function DayScreen({dayKey,weekData,onChange,onBack,isConsultant,onSave}) {
  const [activeSection,setActiveSection]=useState(null);
  const [toast,setToast]=useState(false);

  function countFilled(sec) {
    return sec.fields.filter(f=>(weekData[dayKey]&&weekData[dayKey][sec.key+"__"+f]||"").trim().length>0).length;
  }

  if(activeSection) return (
    <SectionScreen section={activeSection} dayKey={dayKey} data={weekData[dayKey]} onChange={onChange} onBack={()=>setActiveSection(null)} isConsultant={isConsultant}/>
  );

  return (
    <div className="slide-enter" style={S.screen}>
      <div style={S.navTop}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:17,fontStyle:"italic",color:T.text}}>{dayKey}</div></div>
        <BtnIco onClick={()=>{onSave();setToast(true);setTimeout(()=>setToast(false),2200);}}><Icon name="save" size={22} color={T.sage}/></BtnIco>
      </div>
      <div style={S.body}>
        <Card style={{marginBottom:18}}>
          <Lbl>Data</Lbl>
          <Inp value={(weekData[dayKey]&&weekData[dayKey].date)||""} onChange={v=>onChange(dayKey,"date",v)} placeholder="gg/mm/aaaa"/>
        </Card>
        <Lbl style={{marginBottom:10}}>Sezioni da compilare</Lbl>
        {SECTIONS.map(s=>{
          const filled=countFilled(s),done=filled===s.fields.length,partial=filled>0&&!done;
          return (
            <button key={s.key} onClick={()=>setActiveSection(s)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderRadius:18,cursor:"pointer",marginBottom:10,border:"none",fontFamily:"'EB Garamond',serif",textAlign:"left",width:"100%",background:s.color,boxShadow:"0 2px 10px rgba(180,120,120,0.07)"}}>
              <span style={{fontSize:26}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:17,fontWeight:500,color:T.text,fontStyle:"italic"}}>{s.label}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:2}}>{s.fields.length} campi · {done?"Completato ✓":partial?filled+"/"+s.fields.length+" compilati":"Da compilare"}</div>
              </div>
              {done&&<span style={{width:20,height:20,borderRadius:"50%",background:"#A8D8C0",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Icon name="check" size={12} color="white"/></span>}
              <span style={{color:T.muted,fontSize:20}}>›</span>
            </button>
          );
        })}
        <CaroDiario data={weekData[dayKey]||emptyDay()} onChange={onChange} dayKey={dayKey} isConsultant={isConsultant}/>
        <div style={{height:20}}/>
      </div>
      <Toast show={toast}/>
    </div>
  );
}

function TableView({weekData,weekNum}) {
  const days=weekNum===1?DAYS_W1:DAYS_W2;
  const rows=[];
  SECTIONS.forEach(sec=>{
    rows.push({type:"header",label:sec.label,icon:sec.icon,color:sec.color,secKey:sec.key});
    sec.fields.forEach(f=>rows.push({type:"field",label:f,fieldKey:sec.key+"__"+f,secKey:sec.key}));
  });
  const getVal=(day,fk)=>(weekData[day]&&weekData[day][fk])||"";
  return (
    <div style={{overflowX:"auto",fontSize:12,padding:"8px 0"}}>
      <table style={{borderCollapse:"collapse",minWidth:600,width:"100%"}}>
        <thead>
          <tr>
            <th style={{background:T.roseDark,color:"#fff",padding:"8px 10px",textAlign:"left",minWidth:140,position:"sticky",left:0,zIndex:2,border:"1px solid rgba(200,160,160,0.2)"}}>ORARI</th>
            {days.map(d=><th key={d} style={{background:T.roseDark,color:"#fff",padding:"8px 10px",textAlign:"center",border:"1px solid rgba(200,160,160,0.2)",minWidth:90,fontSize:11}}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,i)=>{
            if(row.type==="header") return <tr key={i}><td colSpan={days.length+1} style={{background:row.color,color:T.text,fontWeight:600,padding:"6px 10px",fontSize:13,border:"1px solid rgba(200,160,160,0.15)"}}>{row.icon} {row.label}</td></tr>;
            const bg=i%2===0?"#FFFAF8":"#fff";
            return (
              <tr key={i} style={{background:bg}}>
                <td style={{padding:"4px 10px",fontWeight:500,color:T.text,position:"sticky",left:0,background:bg,border:"1px solid rgba(200,160,160,0.15)",whiteSpace:"nowrap",fontSize:12}}>{row.label}</td>
                {days.map(d=><td key={d} style={{padding:"4px 8px",border:"1px solid rgba(200,160,160,0.15)",maxWidth:110,color:T.text,wordBreak:"break-word",fontSize:12}}>{getVal(d,row.fieldKey)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QField({label,value,onChange,tipo,readOnly}) {
  const [open,setOpen]=useState(false);
  const prev=(value||"").slice(0,60),has=(value||"").length>0;
  return (
    <div style={{marginBottom:12}}>
      <Lbl>{label}</Lbl>
      {open?(
        <div>
          {tipo==="area"
            ?<textarea value={value||""} readOnly={readOnly} onChange={e=>!readOnly&&onChange(e.target.value)} rows={4} style={{width:"100%",background:readOnly?"#f9f6f4":T.pink,border:"none",borderRadius:12,padding:"10px 14px",fontSize:14,fontFamily:"'EB Garamond',serif",resize:"vertical",boxSizing:"border-box"}} placeholder={readOnly?"—":"Scrivi qui..."}/>
            :<input value={value||""} readOnly={readOnly} onChange={e=>!readOnly&&onChange(e.target.value)} style={{width:"100%",background:readOnly?"#f9f6f4":T.pink,border:"none",borderRadius:12,padding:"12px 14px",fontSize:15,fontFamily:"'EB Garamond',serif",boxSizing:"border-box"}} placeholder={readOnly?"—":"Scrivi qui..."}/>
          }
          <span onClick={()=>setOpen(false)} style={{fontSize:12,color:T.roseDark,cursor:"pointer",marginTop:4,display:"inline-block"}}>chiudi ▲</span>
        </div>
      ):(
        <div onClick={()=>setOpen(true)} style={{cursor:"pointer",background:has?"rgba(255,255,255,0.8)":T.pink,border:"1px solid rgba(200,160,160,0.2)",borderRadius:12,padding:"10px 14px",fontSize:14,color:has?T.text:"#c0a0a0",minHeight:40,fontStyle:has?"normal":"italic"}}>
          {has?(prev.length<(value||"").length?prev+"...":value):(readOnly?"—":"Tocca per rispondere...")}
        </div>
      )}
    </div>
  );
}

function QuestionarioView({questionario,onChange,readOnly,onBack,onPDF}) {
  return (
    <div className="slide-enter" style={S.screen}>
      <div style={S.navTop}>
        <BtnIco onClick={onBack}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:17,fontStyle:"italic",color:T.text}}>Questionario</div></div>
        {onPDF?<BtnIco onClick={async()=>await onPDF()}><Icon name="pdf" size={22} color={T.roseDark}/></BtnIco>:<div style={{width:38}}/>}
      </div>
      <div style={S.body}>
        {!readOnly&&<div style={{background:"linear-gradient(135deg,#FBF0E6,#FAE8E6)",borderRadius:14,padding:14,marginBottom:18,fontSize:14,color:T.muted,fontStyle:"italic"}}>Compila il questionario almeno 24 ore prima della consulenza ✨</div>}
        {QUESTIONARIO_SEZIONI.map((sez,si)=>(
          <Card key={si} style={{marginBottom:16}}>
            <div style={{fontWeight:600,fontSize:15,color:T.roseDark,marginBottom:sez.note?4:12,fontStyle:"italic"}}>{sez.titolo}</div>
            {sez.note&&<div style={{fontSize:12,color:T.muted,marginBottom:10,fontStyle:"italic"}}>{sez.note}</div>}
            {sez.campi.map(campo=>(
              <QField key={campo.key} label={campo.label} value={questionario[campo.key]||""} onChange={v=>onChange(campo.key,v)} tipo={campo.tipo} readOnly={readOnly}/>
            ))}
          </Card>
        ))}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

// ── CLIENT VIEW — gestisce tutte le schermate lato cliente con bottom nav persistente ──
function ClientView({client,onSave}) {
  const [screen,setScreen]=useState("home");
  const [activeDay,setActiveDay]=useState(null);
  const [activeWeek,setActiveWeek]=useState(1);
  const [tableWeek,setTableWeek]=useState(1);
  const [data,setData]=useState({week1:safeWeek(client,1),week2:safeWeek(client,2)});
  const [questionario,setQuestionario]=useState(client.questionario||emptyQuestionario());
  const [toast,setToast]=useState(false);

  function change(wn,dk,f,v){setData(prev=>({...prev,["week"+wn]:{...prev["week"+wn],[dk]:{...prev["week"+wn][dk],[f]:v}}}));}
  async function doSave(){await onSave({...data,questionario});setToast(true);setTimeout(()=>setToast(false),2200);}

  // Schermate che mostrano la bottom nav
  const showBottomNav = screen==="home" || screen==="profilo";

  // Schermate senza bottom nav (day, table, questionario, section)
  if(screen==="table") return (
    <div style={S.screen}>
      <div style={S.navTop}>
        <BtnIco onClick={()=>setScreen("home")}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
        <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:15,fontStyle:"italic",color:T.text}}>Riepilogo Settimana {tableWeek}</div></div>
        <div style={{width:38}}/>
      </div>
      <div style={{padding:"8px 16px",display:"flex",gap:6}}>
        {[1,2].map(w=><BtnSm key={w} onClick={()=>setTableWeek(w)} color={tableWeek===w?T.roseDark:"#eee"} textColor={tableWeek===w?"#fff":T.text} style={{fontSize:13}}>Settimana {w}</BtnSm>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 8px 16px"}}>
        <TableView weekData={data["week"+tableWeek]} weekNum={tableWeek}/>
      </div>
    </div>
  );

  if(screen==="questionario") return (
    <QuestionarioView questionario={questionario} onChange={(k,v)=>setQuestionario(prev=>({...prev,[k]:v}))} readOnly={false} onBack={()=>setScreen("home")} onPDF={null}/>
  );

  if(screen==="day"&&activeDay) return (
    <DayScreen dayKey={activeDay} weekData={data["week"+activeWeek]}
      onChange={(dk,f,v)=>change(activeWeek,dk,f,v)}
      onBack={()=>setScreen("home")} isConsultant={false} onSave={doSave}/>
  );

  // Home e Profilo condividono la bottom nav
  return (
    <div style={{width:"100%",height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>

        {/* HOME */}
        {screen==="home" && (
          <HomeScreen client={client} data={data}
            onDay={(d,w)=>{setActiveDay(d);setActiveWeek(w);setScreen("day");}}
            onTable={w=>{setTableWeek(w);setScreen("table");}}
            onQuestionario={()=>setScreen("questionario")}/>
        )}

        {/* PROFILO */}
        {screen==="profilo" && (
          <ProfileScreen
            client={client}
            onLogout={()=>{sessionStorage.removeItem("role");window.location.reload();}}
          />
        )}

      </div>

      {/* BOTTOM NAV sempre visibile su home e profilo */}
      <BottomNav
        active={screen}
        onHome={()=>setScreen("home")}
        onProfile={()=>setScreen("profilo")}
      />

      <Toast show={toast}/>
    </div>
  );
}

// ── HOME SCREEN ──
function HomeScreen({client,data,onDay,onTable,onQuestionario}) {
  const [week,setWeek]=useState(1);
  const days=week===1?DAYS_W1:DAYS_W2;
  const wkData=data["week"+week];
  const total=SECTIONS.reduce((a,s)=>a+s.fields.length,0);
  function countDay(dk){let n=0;SECTIONS.forEach(s=>s.fields.forEach(f=>{if((wkData[dk]&&wkData[dk][s.key+"__"+f]||"").trim())n++;}));return n;}

  return (
    <div style={{...S.screen}}>
      <div style={S.navTop}>
        <div><div style={S.logo}>with love</div><div style={{fontSize:18,fontStyle:"italic",color:T.text,marginTop:1}}>Ciao, {client.name.split(" ")[0]} 🌸</div></div>
        <div style={{width:38}}/>
      </div>
      <div style={S.body}>
        <div style={{background:"#F5EDEB",borderRadius:16,padding:4,display:"flex",gap:4,marginBottom:18}}>
          {[1,2].map(w=><button key={w} onClick={()=>setWeek(w)} style={{flex:1,padding:"8px",borderRadius:12,border:"none",fontSize:15,cursor:"pointer",background:week===w?"white":"none",color:week===w?T.roseDark:T.muted,boxShadow:week===w?"0 2px 8px rgba(180,120,120,0.12)":"none",transition:"all 0.2s"}}>Settimana {w}</button>)}
        </div>
        <Card style={{background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",marginBottom:18}}>
          <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>Settimana {week} · Riepilogo</div>
          <div style={{fontSize:15,color:T.text,fontStyle:"italic",marginBottom:14}}>Tieni traccia di ogni giornata del tuo piccolo 💕</div>
          <div style={{display:"flex",gap:8}}>
            <BtnSm onClick={()=>onTable(week)} color={T.roseDark} style={{flex:1,fontSize:13}}>Vista tabella</BtnSm>
            <BtnSm onClick={onQuestionario} color={T.lilac} style={{flex:1,fontSize:13}}>Questionario</BtnSm>
          </div>
        </Card>
        <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>Seleziona un giorno</div>
        {days.map(d=>{
          const filled=countDay(d),pct=Math.round(filled/total*100);
          return (
            <button key={d} onClick={()=>onDay(d,week)} style={{background:"white",border:"none",borderRadius:18,padding:"14px 16px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 10px rgba(180,120,120,0.07)",marginBottom:10,width:"100%"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:16,fontWeight:500,color:T.text,fontStyle:"italic"}}>{d}</div>
                  <div style={{display:"flex",gap:4,marginTop:6}}>
                    {SECTIONS.map(s=><span key={s.key} style={{width:26,height:5,borderRadius:3,background:filled>0?"#E8A8A0":"#F0E8E8",display:"inline-block"}}/>)}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <span style={{fontSize:18}}>{pct===100?"✅":filled>0?"🌟":"○"}</span>
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
function ProfileScreen({client,onLogout}) {
  return (
    <div style={{...S.screen}}>
      <div style={S.navTop}>
        <div style={{width:38}}/>
        <div style={{fontSize:17,fontStyle:"italic",color:T.text}}>Il mio profilo</div>
        <div style={{width:38}}/>
      </div>
      <div style={S.body}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>🌸</div>
          <div style={{fontSize:22,fontStyle:"italic",color:T.text}}>{client.name}</div>
          {client.papa&&<div style={{fontSize:14,color:T.muted,marginTop:4}}>con {client.papa} 👨</div>}
        </div>
        {[{label:"Consulente",value:"With Love Sleep Coaching",icon:"🌙"},{label:"Programma",value:"14 giorni",icon:"📋"},{label:"Iniziato il",value:client.createdAt,icon:"📅"},...(client.email?[{label:"Email",value:client.email,icon:"📧"}]:[])].map(item=>(
          <Card key={item.label} style={{marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontSize:24}}>{item.icon}</span>
            <div><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.6px"}}>{item.label}</div><div style={{fontSize:16,color:T.text,marginTop:2}}>{item.value}</div></div>
          </Card>
        ))}
        <div style={{height:20}}/>
        <div style={{fontSize:13,color:T.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>Installa l'app sul telefono</div>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <InstallGuide platform="apple"/>
          <InstallGuide platform="android"/>
        </div>
        <BtnGho onClick={onLogout}>Esci dall'account</BtnGho>
        <div style={{marginTop:12,textAlign:"center"}}><BtnSm onClick={()=>window.location.reload()} color={T.sage} style={{fontSize:13}}>🔄 Aggiorna dati</BtnSm></div>
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

// ── REGISTER PAGE ──
function RegisterPage() {
  const [nome,setNome]=useState(""),[cognome,setCognome]=useState(""),[email,setEmail]=useState(""),[saving,setSaving]=useState(false),[err,setErr]=useState("");
  async function handle(){
    if(!nome.trim()||!cognome.trim()||!email.trim()){setErr("Compila tutti i campi.");return;}
    if(!/\S+@\S+\.\S+/.test(email)){setErr("Email non valida.");return;}
    setSaving(true);
    const c=emptyClient(nome.trim()+" "+cognome.trim(),"");c.email=email.trim();c.registeredAt=new Date().toLocaleDateString("it-IT");
    await saveClient(c);
    window.location.href=window.location.origin+window.location.pathname+"?client="+c.link;
  }
  return (
    <div style={{...S.screen,justifyContent:"center",padding:"32px 28px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(200,144,144,0.18)",fontSize:32}}>🌙</div>
        <div style={S.logo}>with love</div>
        <h1 style={{fontSize:28,fontWeight:500,color:T.text,marginTop:6,fontStyle:"italic"}}>Diario del Sonno</h1>
        <p style={{marginTop:6,color:T.muted,fontStyle:"italic"}}>Registrati al percorso</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
        <div><Lbl>Nome *</Lbl><Inp value={nome} onChange={setNome} placeholder="Il tuo nome..."/></div>
        <div><Lbl>Cognome *</Lbl><Inp value={cognome} onChange={setCognome} placeholder="Il tuo cognome..."/></div>
        <div><Lbl>Email *</Lbl><Inp value={email} onChange={setEmail} placeholder="La tua email..."/></div>
        {err&&<p style={{color:T.roseDark,fontSize:14,textAlign:"center",fontStyle:"italic"}}>{err}</p>}
      </div>
      <BtnPri onClick={handle} disabled={saving}>{saving?"Registrazione in corso...":"Accedi al tuo diario"}</BtnPri>
      <p style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted,fontStyle:"italic"}}>Il tuo link personale ti sara inviato dalla consulente ✨</p>
    </div>
  );
}

// ── LOGIN ──
function LoginScreen({onLogin,clients}) {
  const [code,setCode]=useState(""),[err,setErr]=useState("");
  useEffect(()=>{
    const p=new URLSearchParams(window.location.search),cl=p.get("client");
    if(cl){const found=clients.find(c=>c.link===cl);if(found)onLogin("client",found);}
  },[clients]);
  return (
    <div style={{...S.screen,justifyContent:"center",padding:"32px 28px"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(200,144,144,0.18)",fontSize:32}}>🌙</div>
        <div style={S.logo}>with love</div>
        <h1 style={{fontSize:28,fontWeight:500,color:T.text,marginTop:6,fontStyle:"italic"}}>Diario del Sonno</h1>
        <p style={{marginTop:6,color:T.muted,fontStyle:"italic"}}>per famiglie speciali</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
        <div><Lbl>Codice consulente</Lbl><Inp value={code} onChange={setCode} placeholder="Inserisci il codice..."/></div>
        {err&&<p style={{color:T.roseDark,fontSize:14,textAlign:"center",fontStyle:"italic"}}>{err}</p>}
      </div>
      <BtnPri onClick={()=>{code===CONSULTANT_CODE?onLogin("consultant"):setErr("Codice non corretto.");}}>Accedi al pannello</BtnPri>
      <p style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted,fontStyle:"italic"}}>Le clienti accedono tramite il loro link personale ✨</p>
    </div>
  );
}

// ── CONSULTANT VIEW ──
function ConsultantView({clients,onAddClient,onUpdateClient,onDeleteClient,onLogout}) {
  const [view,setView]=useState("list");
  const [selected,setSelected]=useState(null);
  const [newName,setNewName]=useState(""),[newPapa,setNewPapa]=useState("");
  const [tab,setTab]=useState("w1");
  const [activeDay,setActiveDay]=useState(DAYS_W1[0]);
  const [activeSection,setActiveSection]=useState(null);
  const [saved,setSaved]=useState(false);
  const [tableWeek,setTableWeek]=useState(1);
  const [toast,setToast]=useState(false);

  function openClient(c){
    const fresh=clients.find(x=>x.id===c.id)||c;
    setSelected(fresh);setTab("w1");setActiveDay(DAYS_W1[0]);setActiveSection(null);setView("detail");
  }
  function openTable(c){
    const fresh=clients.find(x=>x.id===c.id)||c;
    setSelected(fresh);setTableWeek(1);setView("table");
  }

  useEffect(()=>{
    if(selected){const fresh=clients.find(c=>c.id===selected.id);if(fresh)setSelected(fresh);}
  },[clients]);

  const consultantWrapper = (content) => (
    <div style={{width:"100vw",minHeight:"100vh",background:"#f5ede8",overflowY:"auto"}}>
      <div style={{maxWidth:680,margin:"0 auto",minHeight:"100vh",background:T.bg,boxShadow:"0 0 40px rgba(0,0,0,0.08)"}}>
        {content}
      </div>
    </div>
  );

  if(view==="table"&&selected) {
    const client=clients.find(c=>c.id===selected.id)||selected;
    const wData=safeWeek(client,tableWeek);
    return consultantWrapper(
      <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <div style={S.navTop}>
          <BtnIco onClick={()=>setView("detail")}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
          <div style={{textAlign:"center"}}><div style={S.logo}>Vista Tabella</div><div style={{fontSize:15,fontStyle:"italic",color:T.text}}>{client.name}</div></div>
          <div style={{width:38}}/>
        </div>
        <div style={{padding:"12px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
          <BtnSm onClick={()=>setView("list")} color={T.muted} style={{fontSize:13}}>← Lista clienti</BtnSm>
          {[1,2].map(w=><BtnSm key={w} onClick={()=>setTableWeek(w)} color={tableWeek===w?T.roseDark:"#eee"} textColor={tableWeek===w?"#fff":T.text} style={{fontSize:13}}>Settimana {w}</BtnSm>)}
        </div>
        <div style={{padding:"0 12px 24px",flex:1}}>
          <TableView weekData={wData} weekNum={tableWeek}/>
        </div>
      </div>
    );
  }

  if(view==="detail"&&selected&&activeSection) {
    const client=clients.find(c=>c.id===selected.id)||selected;
    const weekNum=tab==="w2"?2:1;
    const wkData=safeWeek(client,weekNum);
    function handleChange(dk,f,v){
      const wk="week"+weekNum;
      const updated={...client,[wk]:{...safeWeek(client,weekNum),[dk]:{...wkData[dk],[f]:v}}};
      onUpdateClient(updated);
    }
    return consultantWrapper(
      <SectionScreen section={activeSection} dayKey={activeDay} data={wkData[activeDay]} onChange={handleChange} onBack={()=>setActiveSection(null)} isConsultant={true}/>
    );
  }

  if(view==="detail"&&selected&&tab==="q") {
    const client=clients.find(c=>c.id===selected.id)||selected;
    const questionario=client.questionario||emptyQuestionario();
    return consultantWrapper(
      <QuestionarioView questionario={questionario} onChange={(k,v)=>onUpdateClient({...client,questionario:{...questionario,[k]:v}})} readOnly={false}
        onBack={()=>setTab("w1")} onPDF={async()=>await downloadPDF(client)}/>
    );
  }

  if(view==="detail"&&selected) {
    const client=clients.find(c=>c.id===selected.id)||selected;
    const weekNum=tab==="w2"?2:1;
    const days=weekNum===1?DAYS_W1:DAYS_W2;
    const wkData=safeWeek(client,weekNum);
    const baseUrl=window.location.origin+window.location.pathname;

    async function handleSave(){await onUpdateClient(client);setSaved(true);setToast(true);setTimeout(()=>{setSaved(false);setToast(false);},2500);}

    return consultantWrapper(
      <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        <div style={S.navTop}>
          <BtnIco onClick={()=>setView("list")}><Icon name="back" size={22} color={T.roseDark}/></BtnIco>
          <div style={{textAlign:"center"}}><div style={S.logo}>with love</div><div style={{fontSize:16,fontStyle:"italic",color:T.text}}>{client.name}</div></div>
          <BtnIco onClick={()=>openTable(client)}><Icon name="table" size={22} color={T.sage}/></BtnIco>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          <Card style={{marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:12,color:T.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🔗 {baseUrl}?client={client.link}</div>
            <BtnSm onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(baseUrl+"?client="+client.link)} color={T.roseDark} style={{fontSize:12}}>Copia</BtnSm>
          </Card>
          <div style={{background:"#F5EDEB",borderRadius:16,padding:4,display:"flex",gap:4,marginBottom:16}}>
            {[{id:"w1",label:"Settimana 1"},{id:"w2",label:"Settimana 2"},{id:"q",label:"Questionario"}].map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="w1")setActiveDay(DAYS_W1[0]);if(t.id==="w2")setActiveDay(DAYS_W2[0]);}} style={{flex:1,padding:"8px 4px",borderRadius:12,border:"none",fontSize:14,cursor:"pointer",background:tab===t.id?"white":"none",color:tab===t.id?T.roseDark:T.muted,boxShadow:tab===t.id?"0 2px 8px rgba(180,120,120,0.12)":"none"}}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {days.map(d=><button key={d} onClick={()=>setActiveDay(d)} style={{padding:"6px 12px",borderRadius:20,border:"none",cursor:"pointer",fontSize:13,background:activeDay===d?T.roseDark:"#F5EDEB",color:activeDay===d?"white":T.text}}>{d}</button>)}
          </div>
          {SECTIONS.map(s=>(
            <button key={s.key} onClick={()=>setActiveSection(s)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderRadius:18,cursor:"pointer",marginBottom:10,border:"none",fontFamily:"'EB Garamond',serif",textAlign:"left",width:"100%",background:s.color,boxShadow:"0 2px 10px rgba(180,120,120,0.07)"}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:500,color:T.text,fontStyle:"italic"}}>{s.label}</div>
                <div style={{fontSize:12,color:T.muted}}>{activeDay}</div>
              </div>
              <span style={{color:T.muted,fontSize:20}}>›</span>
            </button>
          ))}
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
          <BtnIco onClick={()=>window.location.reload()}><Icon name="refresh" size={20} color={T.sage}/></BtnIco>
          <BtnIco onClick={onLogout}><Icon name="logout" size={20} color={T.roseDark}/></BtnIco>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
        <Card style={{background:"linear-gradient(135deg,#E6F4EF,#EDE8F5)",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.sage,marginBottom:2}}>🔗 Link registrazione pubblica</div><div style={{fontSize:12,color:T.muted}}>Condividilo per nuove clienti</div></div>
          <BtnSm onClick={()=>navigator.clipboard&&navigator.clipboard.writeText(window.location.origin+window.location.pathname+"?register=true")} color={T.sage} style={{fontSize:12}}>Copia</BtnSm>
        </Card>
        <Card style={{background:"linear-gradient(135deg,#FBF0E6,#FAE8E6)",marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:500,color:T.roseDark,marginBottom:12,fontStyle:"italic"}}>Aggiungi nuova cliente</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><Lbl>Nome mamma</Lbl><Inp value={newName} onChange={setNewName} placeholder="Nome..."/></div>
            <div><Lbl>Nome papa</Lbl><Inp value={newPapa} onChange={setNewPapa} placeholder="Nome..."/></div>
            <BtnPri onClick={()=>{if(newName.trim()){onAddClient(newName.trim(),newPapa.trim());setNewName("");setNewPapa("");}}} style={{marginTop:4}}>Aggiungi cliente</BtnPri>
          </div>
        </Card>
        {clients.length===0?(
          <div style={{textAlign:"center",color:T.muted,padding:40,fontStyle:"italic"}}>Nessuna cliente ancora 🌸</div>
        ):clients.map(c=>(
          <Card key={c.id} style={{marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#FAE8E6,#EDE8F5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌸</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:500,fontSize:16,color:T.text,fontStyle:"italic"}}>{c.name}{c.papa?" · "+c.papa:""}</div>
              <div style={{fontSize:12,color:T.muted}}>Dal {c.createdAt}</div>
              {c.email&&<div style={{fontSize:12,color:T.sage,marginTop:2}}>📧 {c.email}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <BtnSm onClick={()=>openClient(c)} color={T.roseDark} style={{fontSize:12}}>Scheda</BtnSm>
              <BtnSm onClick={()=>openTable(c)} color={T.lilac} style={{fontSize:12}}>Tabella</BtnSm>
              <BtnSm onClick={()=>{if(window.confirm("Eliminare "+c.name+"?"))onDeleteClient(c.id);}} color="#e0d0d0" textColor={T.muted} style={{fontSize:12}}>Elimina</BtnSm>
            </div>
          </Card>
        ))}
        <div style={{height:24}}/>
      </div>
    </div>
  );
}

// ── APP ROOT ──
export default function App() {
  const [role,setRole]=useState(()=>sessionStorage.getItem("role")||null);
  const [clients,setClients]=useState([]);
  const [activeClient,setActiveClient]=useState(null);
  const [loading,setLoading]=useState(true);
  const [isRegister,setIsRegister]=useState(false);

  useEffect(()=>{
    const el=document.createElement("style");el.textContent=GLOBAL_CSS;document.head.appendChild(el);
    const p=new URLSearchParams(window.location.search);
    if(p.get("register")==="true")setIsRegister(true);
    loadClients().then(c=>{setClients(c);setLoading(false);});
  },[]);

  useEffect(()=>{
    if(!loading){const p=new URLSearchParams(window.location.search),cl=p.get("client");
      if(cl){const found=clients.find(c=>c.link===cl);if(found){setActiveClient(found);setRole("client");sessionStorage.setItem("role","client");}}}
  },[loading,clients]);

  async function addClient(n,p){const c=emptyClient(n,p);setClients(prev=>[...prev,c]);await saveClient(c);}
  async function updateClient(u){setClients(prev=>prev.map(c=>c.id===u.id?u:c));await saveClient(u);if(activeClient&&activeClient.id===u.id)setActiveClient(u);}
  async function deleteClient(id){setClients(prev=>prev.filter(c=>c.id!==id));await removeClient(id);}
  async function saveClientData(data){if(!activeClient)return;const u={...activeClient,...data};setActiveClient(u);setClients(prev=>prev.map(c=>c.id===u.id?u:c));await saveClient(u);}
  function handleLogin(r,cl){setRole(r);sessionStorage.setItem("role",r);if(cl)setActiveClient(cl);}
  function handleLogout(){setRole(null);sessionStorage.removeItem("role");}

  const mobileWrap=(content)=>(
    <div style={{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5ede8"}}>
      <div style={{width:420,height:"min(844px,100vh)",borderRadius:window.innerWidth>500?44:0,overflow:"hidden",boxShadow:window.innerWidth>500?"0 20px 60px rgba(0,0,0,0.2)":"none",position:"relative"}}>
        {content}
      </div>
    </div>
  );

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#f5ede8",fontFamily:"'EB Garamond',serif",fontSize:22,color:T.roseDark,fontStyle:"italic"}}>with love ✨</div>;
  if(isRegister) return mobileWrap(<RegisterPage/>);
  if(!role) return mobileWrap(<LoginScreen clients={clients} onLogin={handleLogin}/>);
  if(role==="client"&&activeClient){const fresh=clients.find(c=>c.id===activeClient.id)||activeClient;return mobileWrap(<ClientView client={fresh} onSave={saveClientData}/>);}
  if(role==="consultant") return <ConsultantView clients={clients} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} onLogout={handleLogout}/>;
  return null;
}
