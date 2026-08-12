// ── TIPS — Informazioni pre consulenza ──
// Testi di Federica e Mariasole, presi parola per parola dal PDF
// "informazioni-pre-consulenza.pdf" (pre-consulenza-with-love.vercel.app).
// Corretti solo i refusi di accento e le legature perse nell'estrazione dal PDF.
// Se i testi cambiano, si cambiano QUI: App.js si limita a impaginarli.
//
// Tipi di blocco riconosciuti dal renderer (TipsPanel in App.js):
//   p       paragrafo
//   forte   frase da ricordare, su fondo colorato
//   h3      titolo interno alla sezione
//   lista   elenco senza puntini
//   voce    voce d'indice con filetto laterale (titolo + righe)
//   tabella tabella delle ore di sonno
//   nota    riga di nota, più piccola
//   faq     domanda e risposta
//   firma   chiusura

export const TIPS_INTRO = "Queste sono informazioni utili da leggere prima della consulenza.";

export const TIPS_SEZIONI = [
  {
    id: "prima",
    titolo: "Prima della consulenza",
    blocchi: [
      {tipo:"p", t:"Prima di sentirci, abbiamo pensato di lasciarvi queste informazioni."},
      {tipo:"p", t:"Qui trovate alcune indicazioni di base per iniziare ad avere più chiarezza mentre aspettate la consulenza. Sono considerazioni generali."},
      {tipo:"p", t:"Che la vostra consulenza sia con me, Federica, o con Mariasole vedremo tutto insieme, quindi non preoccupatevi."},
      {tipo:"p", t:"L'idea è che possiate iniziare a osservare alcune dinamiche con uno sguardo diverso, così quando ci sentiremo potremo lavorare direttamente su di voi."},
      {tipo:"forte", t:"Ci lavoreremo insieme"},
      {tipo:"firma", t:"Un abbraccio", nome:"Federica e Mariasole"}
    ]
  },
  {
    id: "cosa-vedremo",
    titolo: "Cosa troverete qui",
    blocchi: [
      {tipo:"p", t:"Le basi corrette sono il primo step. Vediamo perché sono fondamentali, perché è importante partire da qui e cosa vuol dire seguire basi corrette."},
      {tipo:"voce", titolo:"Il concetto di stanchezza", righe:[
        "stanchezza e nervosismo",
        "segnali di stanchezza giusti, quali sono e come riconoscerli."
      ]},
      {tipo:"voce", titolo:"Gestione della giornata", righe:[
        "Risveglio della mattina",
        "Sonno diurno e gestione pisolini",
        "Routine nanna",
        "Addormentamento"
      ]},
      {tipo:"voce", titolo:"Modalità di addormentamento", righe:[
        "Vedremo tutto bene in consulenza ma ecco qui degli spunti per partire con osservazioni che saranno molto preziose per molti di voi"
      ]},
      {tipo:"voce", titolo:"Risvegli notturni", righe:[
        "Obiettivo di molti di voi ma è importante fare chiarezza sul fatto che non partiremo da qui. Vediamo insieme il perché...intanto la notte fate quello che vi è più semplice per poter dormire il più possibile!"
      ]},
      {tipo:"voce", titolo:"Domande frequenti", righe:[
        "Le domande che ci vengono fatte più spesso riguardo alla gestione del percorso, malattie, sgarri, vacanze, regressioni..."
      ]}
    ]
  },
  {
    id: "basi",
    titolo: "Partiamo dalle basi corrette",
    blocchi: [
      {tipo:"p", t:"Per impostare una buona igiene del sonno — e ancora di più se si vogliono modificare alcune abitudini — è fondamentale partire dalle basi corrette."},
      {tipo:"h3", t:"Cosa significa?"},
      {tipo:"p", t:"Significa rispettare le esigenze dei nostri bambini in termini di:"},
      {tipo:"lista", voci:["orari","ritmi","stimoli"]},
      {tipo:"p", t:"Ma non solo. Se avete scelto il mio approccio lo sapete già: per me non è mai “solo sonno”. Quindi sì, lavoreremo sull'igiene del sonno, ma c'è anche un altro aspetto che spesso viene sottovalutato e che per molte famiglie fa davvero la differenza:"},
      {tipo:"forte", t:"⟶ la connessione, il nostro stato d'animo, la relazione, la presenza."},
      {tipo:"p", t:"Tranquilli: niente sensi di colpa. Solo consapevolezza. E spesso è proprio lì che si apre una porta. Questa parte delle basi corrette è fondamentale."},
      {tipo:"p", t:"Lo so che quando c'è stanchezza si ha fretta di risolvere. È umano. Ma è proprio lavorando su queste basi che riusciremo poi a fare cambiamenti sereni e duraturi."},
      {tipo:"p", t:"Sono le fondamenta che ci permettono di intervenire senza forzature e — lo sapete — senza lasciarli piangere."},
      {tipo:"h3", t:"Per questo partiamo sempre da:"},
      {tipo:"lista", voci:[
        "gestione corretta della giornata",
        "sonno diurno soddisfacente, in base alla fascia di età",
        "routine nanna svolta nel modo giusto",
        "associazione positiva con la nanna (addormentarsi serenamente, indipendentemente dalla modalità)"
      ]},
      {tipo:"nota", t:"E qui entra in gioco un concetto centrale: la stanchezza. Partiamo da qui, e poi passiamo al resto"}
    ]
  },
  {
    id: "stanchezza",
    titolo: "Il concetto di stanchezza",
    blocchi: [
      {tipo:"p", t:"Prima di qualsiasi cambiamento, è fondamentale capire cosa significa “stanchezza giusta”. Nel questionario che avete compilato vi abbiamo chiesto come manifesta stanchezza il vostro bambino, da cosa vi rendete conto che è stanco."},
      {tipo:"p", t:"Nella maggior parte dei casi i genitori rispondono che notano un po' di nervosismo… ma qui è importante fare chiarezza: un bambino stanco non è un bambino nervoso. Quando vediamo nervosismo, nella maggior parte dei casi siamo già arrivati tardi."},
      {tipo:"p", t:"Pensate anche a noi adulti... quando siamo stanchi desideriamo rilassarci. Quando siamo tanto stanchi, invece, perdiamo la pazienza. È la stanchezza accumulata che porta nervosismo e che ci rende più “fragili”, non la stanchezza giusta."},
      {tipo:"h3", t:"La stanchezza si manifesta a fasi:"},
      {tipo:"lista", voci:[
        "Stanchezza giusta ⟶ Il bambino rallenta ma è sereno. È il momento ideale per la nanna.",
        "Nervosismo ⟶ Qui siamo già arrivati tardi. Potrebbe lamentarsi, cercare più contatto, perdere interesse nel gioco.",
        "Fase attiva ⟶ Sembra sveglissimo, ma in realtà è sostenuto da adrenalina e cortisolo (ormone dello stress), antagonista della melatonina (ormone del sonno).",
        "Crollo ⟶ Finisce la propria energia, finisce quella “di riserva”… e crollano. Più cortisolo circola, più sarà difficile addormentarsi e mantenere il sonno."
      ]},
      {tipo:"p", t:"Quindi no: il nervosismo non è il segnale giusto. Quando c'è nervosismo siamo già oltre. Ed ecco perché arrivare lunghi rende tutto più complicato: addormentamento, notte, giornata."},
      {tipo:"forte", t:"I segnali giusti di stanchezza sono segnali molto leggeri, come stropicciarsi gli occhi, sbadigliare, toccare le orecchie, incantarsi, rallentare"},
      {tipo:"p", t:"A volte però i segnali sono molto leggeri. Possono durare pochi secondi. Soprattutto nei bambini calmi o molto curiosi, che magari li mostrano “al volo”, mentre noi siamo girati a bere un bicchiere d'acqua."},
      {tipo:"p", t:"Ecco perché diventa importante conoscere anche le finestre di veglia (la loro autonomia tra un sonno e l'altro) e, di conseguenza, la gestione della giornata: orari, ritmi e bisogni reali."}
    ]
  },
  {
    id: "giornata",
    titolo: "Gestione della giornata",
    blocchi: [
      {tipo:"p", t:"Il concetto di base è che il sonno è governato dai ritmi interni e in quanto appunto interni sostanzialmente noi non possiamo modificarli. Alimentazione, attività, bagnetto sono invece aspetti che possiamo decidere noi."},
      {tipo:"p", t:"Questo vuol dire che se un bambino è stanco, “intrattenerlo” per sostituire il sonno potrebbe non essere la scelta giusta, rimandare e accumulare stanchezza si vedrà poi in difficoltà in addormentamento…o nella notte."},
      {tipo:"forte", t:"Se un bambino è stanco, intrattenerlo non sostituisce il sonno. Rimanda solo il momento… e accumula stanchezza, e la stanchezza accumulata si vede la sera."},
      {tipo:"p", t:"L'idea è quindi quella di tenere in considerazione i ritmi sonno-veglia dei nostri bimbi e gestire il resto di conseguenza."},
      {tipo:"p", t:"Vediamo ora qualche info sulla gestione della giornata, dal risveglio della mattina, sonno diurno, routine nanna e orari serali."},

      {tipo:"h3", t:"Risveglio del mattino"},
      {tipo:"p", t:"È utile avere un orario di risveglio abbastanza costante (con una variazione di circa 30 minuti). Questo aiuta:"},
      {tipo:"lista", voci:[
        "a dare prevedibilità alla giornata",
        "a sincronizzare i ritmi",
        "a rendere più semplice la gestione serale"
      ]},
      {tipo:"p", t:"Se il vostro bimbo si sveglia molto presto:"},
      {tipo:"p", t:"⟶ poca luce, poca stimolazione, intervento rapido, ok fare qualsiasi cosa per provare a riaddormentarlo e anche concettualmente trattatelo come un risveglio notturno (sostanzialmente alle 3 di notte non pensereste mai di iniziare la giornata!)"},
      {tipo:"p", t:"Le cause più comuni dei risvegli precoci:"},
      {tipo:"lista", voci:[
        "luce nella stanza",
        "nanna serale troppo tardiva",
        "sonno diurno insufficiente",
        "troppo tempo tra ultimo pisolino e sera"
      ]},

      {tipo:"h3", t:"Sonno diurno e pisolini"},
      {tipo:"p", t:"Il sonno diurno è fondamentale, non solo per farli riposare, ma per:"},
      {tipo:"lista", voci:[
        "non accumulare cortisolo",
        "arrivare sereni alla sera",
        "poter lavorare sui vostri obiettivi"
      ]},
      {tipo:"p", t:"“Fallo dormire meno di giorno così dormirà di più di notte.” ⟶ No. Meno dorme di giorno, più accumula stanchezza, cortisolo e adrenalina, più è probabile che avrà una associazione negativa con la nanna e arrivi nervoso e/o destabilizzato per la sera e la notte (cosa che vogliamo assolutamente evitare in fase di modifiche)"},
      {tipo:"h3", t:"Quante ore dovrebbe dormire di giorno?"},
      {tipo:"p", t:"Ecco una semplice tabella per aiutarvi a fare una considerazione rispetto a quanto dovrebbero dormire i vostri bimbi in base alla loro fascia di età."},
      {tipo:"tabella",
        intestazioni:["Fascia di età","Sonno diurno","Pisolini","Sonno notturno"],
        righe:[
          ["6–9 mesi","3h 30min","3","11h"],
          ["9–15 mesi","3h","2","10h (11h se niente pisolino)"],
          ["15-19 mesi","2h 30min","2 ⟶ 1 (tra i 15 e 19 mesi)","11h"],
          ["19–24 mesi","2h - 2h 30min","1","11h"],
          ["2–3 anni","1h 30min","1","10h–11h (11h senza pisolino)"],
          ["4+ anni","occasionalmente","—","11h (10h con pisolino)"]
        ]},
      {tipo:"nota", t:"Nota: Queste sono ovviamente linee guida, potrebbero variare nel caso del tuo bambino, ma considera che solitamente la variazione è minima."},

      {tipo:"h3", t:"Se tuo figlio fa pisolini brevi"},
      {tipo:"p", t:"Pisolini brevi da 30/45 minuti sono comuni e normali (è la durata di un ciclo di sonno) ma spesso non soddisfacenti ed è sicuramente ideale cercare di favorire pisolini completi."},
      {tipo:"p", t:"La prima idea è quella di cercare di capire se il vostro bambino riesce a dormire meglio in alcune situazioni rispetto ad altre e partire da lì, favorendo quelle modalità. Va bene tutto, purché riescano a dormire bene."},
      {tipo:"p", t:"In generale ecco ciò che favorisce di più la nanna, soprattutto diurna:"},
      {tipo:"lista", voci:[
        "buio reale",
        "vicinanza se necessaria",
        "rumori bianchi come schermo ai rumori",
        "intervenire appena si sveglia",
        "offrire qualsiasi supporto che solitamente aiuta il sonno"
      ]},
      {tipo:"forte", t:"E se proprio ha difficoltà ecco cosa consiglio di provare..."},
      {tipo:"lista", voci:[
        "si sveglia dopo 30-45 minuti → stanza con buio + rumori bianchi già attivi, intervieni nel più breve tempo possibile e ok tutto per riaddormentarlo",
        "se non riesci a riaddormentarlo → vai 5–10 minuti prima del momento in cui di solito si sveglia, così quando si sveglia vi trova già vicini e il passaggio è più semplice. (Esempio: se di solito dorme dalle 10:00 e sai che dura più o meno 45 minuti entra in stanza alle 10:40)",
        "se anche così non funziona → per qualche giorno stare vicino e a contatto per tutta la durata del pisolino (Per qualcuno potrebbe essere pesante e lo capisco ma non è per sempre, è una fase di recupero che ci permette di lavorare sugli altri obiettivi in modo più sereno)"
      ]},
      {tipo:"nota", t:"Nota: Se durante il giorno dorme meno del necessario, può essere utile anticipare la sera in base al sonno mancante."},

      {tipo:"h3", t:"Routine nanna"},
      {tipo:"p", t:"La routine viene spesso confusa con il bagnetto, con i preparativi o con l'addormentamento. Facciamo chiarezza."},
      {tipo:"p", t:"Routine = da quando entrate nella stanza in cui il bambino dorme a quando decidete di iniziare l'addormentamento. È un momento di connessione. Luce tipo abat-jour. Qualsiasi attività purché sia piacevole per voi. Va benissimo anche il latte."},
      {tipo:"p", t:"Addormentamento = da quando decidete di farlo addormentare a quando si addormenta. È il momento in cui si lascia andare al sonno. Luce molto bassa o buio."},
      {tipo:"p", t:"La routine è il passaggio tra la fase attiva (stimoli, gioco, cose da fare) e la nanna. Un po' come per noi adulti quando, a fine serata, ci rilassiamo sul divano. È un momento di connessione e presenza. Per un bambino la nanna può significare separazione. E la routine nanna serve a farlo sentire al sicuro. Dà quella “dose di connessione” che li riempie emotivamente e li aiuta a lasciarsi andare."},
      {tipo:"p", t:"Spesso per routine si intende una sequenza perfetta per dare prevedibilità. Sì, la prevedibilità è importante. Ma ancora più importante è una routine di connessione reale."},
      {tipo:"forte", t:"Non importa cosa fate. Importa come lo fate."},
      {tipo:"h3", t:"Note pratiche:"},
      {tipo:"p", t:"Dovrebbe durare circa 20–30 minuti. Iniziare circa 12 ore dopo il risveglio della mattina (anticipando se ha dormito poco di giorno). Se arrivate di corsa o con la testa altrove, il bambino lo percepisce. Ecco perché spesso serve riorganizzare le serate. Non per rigidità. Ma per qualità."}
    ]
  },
  {
    id: "addormentamento",
    titolo: "Addormentamento",
    blocchi: [
      {tipo:"p", t:"La cosa importante dell'addormentamento (sempre ma a maggior ragione quando si vogliono fare cambiamenti) è gestirlo nella fascia oraria corretta. Ma attenzione, non c'è un orario giusto per tutti."},
      {tipo:"p", t:"Ovviamente un bambino che si sveglia alle 6 avrà un orario di messa a nanna diverso da un bambino che si sveglia alle 9. Così come un bambino che non dorme a sufficienza di giorno potrebbe aver bisogno di anticipare sulla messa a nanna serale. E ovviamente anche in base all'età."},
      {tipo:"p", t:"In generale possiamo dire che i bimbi dovrebbero dormire circa 11h fino ai 3 anni per poi passare a 10 ore a 3 e 4 anni fino a che fanno ancora il pisolino diurno e poi quando abbandonano il pisolino solitamente tornare a 11."},
      {tipo:"h3", t:"In generale quello che si fa è…"},
      {tipo:"lista", numerata:true, voci:[
        "capire qual è l'orario medio di risveglio del nostro bimbo (orario in cui inizia la giornata) (esempio: si sveglia alle 7:30)",
        "Tornare indietro di 11 o 10h in base alle sue necessità (se dalle 7:30 torno indietro di 11 ore arrivo alle 20:30)",
        "E lì capiamo l'orario in cui dovrebbe essere addormentato (quindi per l'esempio sarebbero le 20:30) —> Addormentato, non orario in cui iniziamo l'addormentamento!"
      ]},
      {tipo:"nota", t:"Attenzione: questo non vuol dire che non riuscirebbero a stare svegli più a lungo ma che questa è considerata la finestra di veglia ideale per le loro necessità!"},
      {tipo:"p", t:"Tardare ogni tanto non è assolutamente un problema ma è importante avere delle basi corrette come abitudine così che quando si sgarra (che sia per esigenza o per piacere) non si va a intaccare niente."},

      {tipo:"h3", t:"Cambiare modalità"},
      {tipo:"p", t:"Molti arrivano con l'obiettivo di diminuire il supporto e vorrebbero partire subito da lì. Lo capisco. Ma prima dobbiamo sistemare le basi."},
      {tipo:"forte", t:"Quando le basi sono solide, il cambiamento è più sereno. Quando non lo sono, diventa una lotta."},
      {tipo:"p", t:"È uno degli aspetti fondamentali dei percorsi che non prevedono il pianto. Quindi: niente fretta. In consulenza vi spiegherò tutto nel dettaglio e costruiremo un piano graduale, realistico e sostenibile per voi."}
    ]
  },
  {
    id: "risvegli",
    titolo: "Risvegli notturni",
    blocchi: [
      {tipo:"p", t:"I motivi principali dei risvegli notturni possono essere diversi. Tra i più comuni:"},
      {tipo:"lista", voci:[
        "condizioni mediche (prime da considerare, sempre)",
        "gestione della giornata (sonno diurno, routine, orari)",
        "modalità di addormentamento necessità (fame, caldo, freddo, fastidi)",
        "connessione"
      ]},
      {tipo:"forte", t:"Ed è per questo che “sistemare i risvegli” raramente è il primo step"},
      {tipo:"p", t:"Finché lavoriamo sulle basi, va bene gestirli nel modo che vi permette di dormire meglio possibile. Non dobbiamo sistemare tutto insieme."},
      {tipo:"p", t:"Quindi anche in questo caso, niente fretta! Se il vostro bimbo ha risvegli notturni tutta la stanchezza la sentite lì e lo capisco ma ad ora sarebbe controproducente partire dalla notte, oltre che irrealistico il fatto che i vostri bimbi riescano a gestirli diversamente."}
    ]
  },
  {
    id: "faq",
    titolo: "Domande frequenti",
    blocchi: [
      {tipo:"faq", d:"Se si ammala?", r:"Quando non sta bene, la priorità è il suo benessere. In quei giorni potrebbe essere difficile attuare modifiche sui cambiamenti ma non dovrebbero esserci problemi per quanto riguarda le basi corrette in quanto si tratta di rispettare i loro ritmi! Potrebbero però avere più stanchezza o difficoltà a dormire quindi è normale se non si riesce ad essere precisi!"},
      {tipo:"faq", d:"Se un giorno non riesco a seguire tutto precisamente?", r:"Non serve perfezione. Serve consapevolezza. Se un giorno non riuscite a seguire tutto semplicemente il giorno dopo tornate a essere precisi. Sicuramente direi che cambia se non siamo riusciti o se non ci siamo impegnati. In fase di modifiche il vostro impegno è fondamentale"},
      {tipo:"faq", d:"E se nel weekend usciamo?", r:"In generale non succede nulla. Non è una gara alla perfezione. L'importante è che nella quotidianità la gestione sia coerente. Uno “sgarro” non rovina il lavoro. Chi mi segue da un po' sa che mostro spesso i nostri sgarri. (In fase di modifiche consiglio di lavorarci con precisione.)"},
      {tipo:"faq", d:"Devo fare tutto perfetto da subito?", r:"No. Ma serve organizzazione e impegno. Il cambiamento arriva perché mettiamo in pratica, con costanza. Per questo il mio consiglio è quello di scegliere un periodo in cui decidete di lavorare su questo e dare la priorità al percorso, evitando quindi sgarri mentre state facendo il percorso. Essere costanti e precisi vi aiuterà a risolvere prima."},
      {tipo:"faq", d:"E se siamo in un periodo di cambiamenti?", r:"In generale sconsiglio di fare più cambiamenti contemporaneamente ma questo dipende anche da situazioni e necessità. Considerate che le basi corrette non destabilizzano in quanto vuol dire solo assestarsi a loro e rispettare le loro esigenze. Quindi nessun problema a lavorare sulle basi corrette. Per altre modifiche possiamo confrontarci."}
    ]
  },
  {
    id: "conclusione",
    titolo: "Conclusione e riflessioni",
    blocchi: [
      {tipo:"p", t:"Ed ecco terminata la parte relativa alle basi corrette. Speriamo possa esservi stata utile per comprendere alcuni aspetti importanti o per rinfrescarvi concetti imparati in passato."},
      {tipo:"p", t:"Intanto ci tengo a dirvi una cosa banale ma fondamentale: il cambiamento non arriva solo perché ne parliamo insieme. Arriva perché decidete di metterlo in pratica nella vostra quotidianità, con impegno e costanza. Non serve perfezione ma serve volontà. Anche piccoli passi, ma fatti davvero."},
      {tipo:"forte", t:"Consiglio pratico: scegliete un periodo in cui potete dare priorità a questo percorso. Non perché “non si può mai sgarrare”, ma perché all'inizio la costanza vi aiuta a capire prima cosa funziona e a ottenere risultati più velocemente, senza arrivare a demoralizzarvi."},
      {tipo:"firma", t:"Ci vediamo in consulenza\nUn abbraccio", nome:"Federica e Mariasole"}
    ]
  }
];
