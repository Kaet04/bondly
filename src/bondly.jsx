import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from './supabaseClient.js';

// ════════ THEMES (light base + alternatives) ════════
const THEMES = {
  midnight: {
    name:"Midnight", swatch:["#D6249F","#8E5BE8","#C77DFF"],
    bg:"#251B33", surface:"#33264A", surface2:"#3F2F59",
    glass:"rgba(64,48,92,0.55)", glassBorder:"rgba(214,180,255,0.22)",
    bgScene:"radial-gradient(120% 70% at 50% -10%, rgba(142,91,232,0.32), rgba(214,36,159,0.14) 42%, #251B33 78%)",
    line:"rgba(214,180,255,0.16)", line2:"rgba(214,180,255,0.28)",
    text:"#F2ECFA", sub:"rgba(242,236,250,0.82)", faint:"rgba(242,236,250,0.58)",
    a1:"#E03DAE", a2:"#9D6BFF", a3:"#C77DFF", a4:"#7C5CE0", a5:"#B98CFF",
  },
  daylight: {
    name:"Daylight", swatch:["#FF6B8A","#FFB347","#7C6FF0"],
    bg:"#FBF7F4", surface:"#FFFFFF", surface2:"#F4EFEA",
    glass:"rgba(255,247,244,0.72)", glassBorder:"rgba(100,60,80,0.12)",
    bgScene:"radial-gradient(120% 60% at 50% -10%, rgba(255,107,138,0.15), rgba(124,111,240,0.07) 50%, #FBF7F4 80%)",
    line:"rgba(60,40,55,0.08)", line2:"rgba(60,40,55,0.16)",
    text:"#332433", sub:"rgba(51,36,51,0.56)", faint:"rgba(51,36,51,0.34)",
    a1:"#FF6B8A", a2:"#7C6FF0", a3:"#FFB347", a4:"#3BC9A8", a5:"#5BB8F0",
  },
  blush: {
    name:"Blush", swatch:["#E8638C","#F5A65B","#B57BD8"],
    bg:"#FFF5F7", surface:"#FFFFFF", surface2:"#FCEBF0",
    glass:"rgba(255,245,247,0.72)", glassBorder:"rgba(180,60,110,0.12)",
    bgScene:"radial-gradient(120% 60% at 50% -10%, rgba(232,99,140,0.16), rgba(181,123,216,0.09) 50%, #FFF5F7 80%)",
    line:"rgba(180,60,110,0.1)", line2:"rgba(180,60,110,0.18)",
    text:"#3D2030", sub:"rgba(61,32,48,0.56)", faint:"rgba(61,32,48,0.34)",
    a1:"#E8638C", a2:"#B57BD8", a3:"#F5A65B", a4:"#3BC9A8", a5:"#5BB8F0",
  },
  aurora: {
    name:"Aurora", swatch:["#3DEBC8","#FF5BAE","#FFC857"],
    bg:"#1A0F1E", surface:"#2B1830", surface2:"#352038",
    glass:"rgba(43,24,48,0.55)", glassBorder:"rgba(255,210,180,0.2)",
    bgScene:"radial-gradient(120% 70% at 50% -10%, rgba(255,91,174,0.32), rgba(181,123,255,0.14) 42%, #1A0F1E 78%)",
    line:"rgba(255,210,180,0.1)", line2:"rgba(255,210,180,0.2)",
    text:"#FFF4EC", sub:"rgba(255,244,236,0.6)", faint:"rgba(255,244,236,0.36)",
    a1:"#FF5BAE", a2:"#B57BFF", a3:"#FFC857", a4:"#3DEBC8", a5:"#5BC8FF",
  },
  sage: {
    name:"Sage", swatch:["#5BA88A","#E0A458","#7C9AD8"],
    bg:"#F6F8F4", surface:"#FFFFFF", surface2:"#EBF0E8",
    glass:"rgba(246,248,244,0.72)", glassBorder:"rgba(40,70,50,0.12)",
    bgScene:"radial-gradient(120% 60% at 50% -10%, rgba(91,168,138,0.14), rgba(124,154,216,0.07) 50%, #F6F8F4 80%)",
    line:"rgba(40,70,50,0.09)", line2:"rgba(40,70,50,0.16)",
    text:"#243028", sub:"rgba(36,48,40,0.56)", faint:"rgba(36,48,40,0.34)",
    a1:"#5BA88A", a2:"#7C9AD8", a3:"#E0A458", a4:"#3BC9A8", a5:"#5BB8F0",
  },
};
function grads(T){return{
  a1:`linear-gradient(135deg,${T.a1},${T.a3})`,
  a2:`linear-gradient(135deg,${T.a2},${T.a1})`,
  a3:`linear-gradient(135deg,${T.a3},${T.a1})`,
  a4:`linear-gradient(135deg,${T.a4},${T.a5})`,
  a5:`linear-gradient(135deg,${T.a5},${T.a4})`,
  hero:`linear-gradient(135deg,${T.a1},${T.a2})`,
};}

// ════════ DATA ════════
const CHAPTERS=[
  {ch:1,name:"L'Inizio",need:0,g:"a1",icon:"🌱",desc:"I primi passi insieme",soon:false},
  {ch:2,name:"La Scoperta",need:1200,g:"a3",icon:"🌸",desc:"Sbloccate lati che non conoscevate",soon:false},
  {ch:3,name:"La Profondità",need:4000,g:"a4",icon:"🌊",desc:"Andate sotto la superficie",soon:false},
  {ch:4,name:"La Complicità",need:9000,g:"a2",icon:"💫",desc:"Vi capite con uno sguardo",soon:false},
  {ch:5,name:"La Maestria",need:18000,g:"hero",icon:"👑",desc:"Una coppia affiatata e forte",soon:false},
  {ch:6,name:"L'Avventura",need:30000,g:"a5",icon:"🗺️",desc:"Esplorate il mondo insieme",soon:true},
  {ch:7,name:"La Passione",need:45000,g:"a1",icon:"🔥",desc:"Riaccendete la scintilla, sempre",soon:true},
  {ch:8,name:"L'Armonia",need:65000,g:"a3",icon:"🎵",desc:"Due voci, una sola melodia",soon:true},
  {ch:9,name:"L'Eternità",need:90000,g:"a4",icon:"♾️",desc:"Un legame che non si spezza",soon:true},
  {ch:10,name:"La Leggenda",need:120000,g:"hero",icon:"⭐",desc:"La vostra storia è leggendaria",soon:true},
];

const GAMES=[
  // Connessione
  {id:"questions",name:"36 Domande Profonde",emoji:"💭",g:"a1",group:"connect",mode:"both",play:"async",ch:1,desc:"Le domande che fanno innamorare",time:"15 min",cp:60},
  {id:"sync",name:"Sincronia",emoji:"🎯",g:"a4",group:"connect",mode:"both",play:"async",ch:2,desc:"Quanto vi conoscete davvero?",time:"10 min",cp:50},
  {id:"values",name:"Valori a Confronto",emoji:"🧭",g:"a4",group:"connect",mode:"both",play:"async",ch:3,desc:"Allineate ciò che conta davvero",time:"15 min",cp:80},
  // Quiz & Trivia
  {id:"trivia2",name:"Trivia dell'Amore",emoji:"❓",g:"a2",group:"quiz",mode:"both",play:"async",ch:1,desc:"Quiz a tema coppie e curiosità romantiche",time:"5 min",cp:40},
  {id:"trivia",name:"Sfida Lampo",emoji:"⚡",g:"a5",group:"quiz",mode:"both",play:"solo",ch:2,desc:"20 domande veloci, anche da solo",time:"5 min",cp:40},
  {id:"wouldyou",name:"Preferiresti...",emoji:"⚖️",g:"a3",group:"quiz",mode:"both",play:"async",ch:1,desc:"Scelte impossibili che vi rivelano",time:"8 min",cp:40},
  {id:"mostlikely",name:"Chi è più probabile",emoji:"🫵",g:"a2",group:"quiz",mode:"both",play:"async",ch:1,desc:"Indovina chi di voi due... risate assicurate",time:"6 min",cp:45},
  {id:"wordle",name:"Parola del Giorno",emoji:"🟩",g:"a4",group:"connect",mode:"both",play:"async",ch:1,desc:"Una parola al giorno, indovinatela insieme",time:"4 min",cp:50,daily:true},
  // Arcade
  {id:"slingshot",name:"Fionda & Bicchieri",emoji:"🎯",g:"a5",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Lancia la pallina e colpisci più bicchieri a tempo",time:"2 min",cp:35},
  {id:"reflex",name:"Riflessi di Coppia",emoji:"⚡",g:"a4",group:"arcade",mode:"both",play:"solo",ch:2,desc:"Tocca al momento giusto, batti il tempo",time:"2 min",cp:30},
  {id:"pacman",name:"Mangia-Frutta",emoji:"🟡",g:"a3",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Il più veloce a mangiare tutta la frutta vince!",time:"2 min",cp:40},
  {id:"catch",name:"Cuori in Caduta",emoji:"💝",g:"a1",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Sposta il cestino e prendi i cuori che cadono",time:"2 min",cp:35},
  {id:"tap",name:"Tap Frenesia",emoji:"👆",g:"a4",group:"arcade",mode:"both",play:"solo",ch:2,desc:"Tocca solo i bersagli giusti, evita le bombe",time:"2 min",cp:35},
  {id:"stack",name:"Torre dei Sogni",emoji:"🗼",g:"a5",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Impila i blocchi al momento giusto, più in alto possibile",time:"2 min",cp:40},
  {id:"snake",name:"Snake Romantico",emoji:"🐍",g:"a3",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Mangia i cuori e cresci, senza sbattere!",time:"3 min",cp:40},
  {id:"simon",name:"Simon Romantico",emoji:"🧠",g:"a2",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Ricorda la sequenza di cuori e ripetila",time:"3 min",cp:40},
  {id:"intruso",name:"Trova l'Intruso",emoji:"🔍",g:"a3",group:"arcade",mode:"both",play:"solo",ch:2,desc:"Trova l'emoji diversa il più in fretta possibile!",time:"2 min",cp:35},
  // Puzzle & Memoria
  {id:"memory",name:"Memoria di Coppia",emoji:"🃏",g:"a2",group:"puzzle",mode:"both",play:"solo",ch:1,desc:"Ricordate i dettagli dell'altro",time:"5 min",cp:40},
  // Drawing & Art
  {id:"draw",name:"Disegna & Indovina",emoji:"🎨",g:"a5",group:"art",mode:"far",play:"together",ch:1,desc:"Uno disegna, l'altro indovina dal vivo",time:"10 min",cp:55},
  // Sogni & Futuro
  {id:"dreams",name:"Mappa dei Sogni",emoji:"🗺️",g:"a3",group:"future",mode:"both",play:"solo",ch:4,desc:"Disegnate la vita che volete",time:"20 min",cp:90},
  {id:"bucket",name:"100 Cose Insieme",emoji:"✓",g:"a4",group:"future",mode:"both",play:"solo",ch:5,desc:"La vostra lista di esperienze",time:"15 min",cp:80},
  {id:"timecapsule",name:"Capsula del Tempo",emoji:"⏳",g:"a1",group:"future",mode:"both",play:"solo",ch:5,desc:"Una lettera da aprire tra un anno",time:"20 min",cp:100},
  // Intimità (18+)
  {id:"spicy",name:"Domande Piccanti",emoji:"🌶️",g:"a1",group:"intimacy",mode:"both",play:"async",ch:3,desc:"Per esplorare con complicità",time:"15 min",cp:70,adult:true},
  // New Arcade
  {id:"flappy",name:"Cuore Volante",emoji:"❤️",g:"a1",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Fai volare il cuore tra gli ostacoli, batti il tuo record!",time:"3 min",cp:45},
  {id:"memory_cards",name:"Carte Coppia",emoji:"🃏",g:"a2",group:"puzzle",mode:"both",play:"solo",ch:1,desc:"Trova tutte le coppie romantiche. Sfida la memoria!",time:"3 min",cp:45},
  {id:"bubble",name:"Scoppia Bolle",emoji:"🫧",g:"a4",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Scoppia più bolle che puoi in 30 secondi!",time:"1 min",cp:30},
  {id:"reaction",name:"Reaction Battle",emoji:"💕",g:"a1",group:"arcade",mode:"both",play:"solo",ch:1,desc:"Tocca tutti i cuori prima che spariscano! Chi è più reattivo?",time:"30 sec",cp:35},
];
const GROUPS=[
  {id:"connect",name:"Quiz di Coppia",sub:"Conoscervi più a fondo",emoji:"💞",g:"a1"},
  {id:"quiz",name:"Trivia & Quiz",sub:"Sfide di sapere e scelte",emoji:"❓",g:"a2"},
  {id:"arcade",name:"Giochi Arcade",sub:"Abilità e riflessi",emoji:"🕹️",g:"a5"},
  {id:"puzzle",name:"Puzzle & Memoria",sub:"Mettete alla prova la mente",emoji:"🧩",g:"a4"},
  {id:"art",name:"Drawing & Art",sub:"Creatività a due",emoji:"🎨",g:"a3"},
  {id:"future",name:"Sogni & Futuro",sub:"Costruite ciò che verrà",emoji:"🌅",g:"a4"},
  {id:"intimacy",name:"Intimità",sub:"Accendete la scintilla",emoji:"🔥",g:"a1",adult:true},
];
const MODES=[{id:"live",l:"Tempo reale",e:"🔴"},{id:"turns",l:"A turni",e:"🕓"}];
// every game is played WITH the partner online — either live (real-time) or turn-based (async)
const SYNC_LABEL={live:{e:"🔴",t:"Tempo reale",d:"Giocate connessi nello stesso momento"},turns:{e:"🕓",t:"A turni",d:"Rispondi tu, poi tocca al partner"}};
// derive sync mode: arcade/skill = live race, everything reflective = turns
function syncOf(g){
  if(g.sync)return g.sync;
  const live=["arcade","art"];
  return live.includes(g.group)?"live":"turns";
}
const PLAY_BADGE={solo:{e:"👤",t:"Da solo",d:"Giocabile subito"},async:{e:"🔄",t:"A turni",d:"Rispondi tu, il partner dopo"},together:{e:"👥",t:"Insieme",d:"Serve il partner ora"}};

// ════════ AVATAR SYSTEM (full-body cartoon, layered) ════════
const AV_SKIN=["#F4C9A8","#E8B088","#D49B6A","#B07D52","#8D5C3B","#6B4429","#FBD9C0","#FFE0BD"];
const AV_HAIR_STYLES=[
  // corti
  {id:"buzz",label:"Rasati",len:"corti",cost:0},{id:"short",label:"Corti",len:"corti",cost:0},
  {id:"crew",label:"A spazzola",len:"corti",cost:0},{id:"side",label:"Riga laterale",len:"corti",cost:90},
  {id:"mohawk",label:"Cresta",len:"corti",cost:160},{id:"afro",label:"Afro",len:"corti",cost:140},
  {id:"quiff",label:"Ciuffo",len:"corti",cost:120},{id:"fade",label:"Sfumato",len:"corti",cost:130},
  {id:"slick",label:"All'indietro",len:"corti",cost:150},{id:"curtains",label:"Tendina",len:"corti",cost:140},
  // medi
  {id:"wavy",label:"Mossi",len:"medi",cost:0},{id:"curly",label:"Ricci",len:"medi",cost:0},
  {id:"bob",label:"Caschetto",len:"medi",cost:120},{id:"messy",label:"Spettinati",len:"medi",cost:100},
  {id:"lob",label:"Lob",len:"medi",cost:150},{id:"shag",label:"Scalato",len:"medi",cost:160},
  // lunghi
  {id:"long",label:"Lunghi",len:"lunghi",cost:0},{id:"pony",label:"Coda",len:"lunghi",cost:0},
  {id:"bun",label:"Chignon",len:"lunghi",cost:120},{id:"braids",label:"Trecce",len:"lunghi",cost:200},
  {id:"twin",label:"Codini",len:"lunghi",cost:180},{id:"wavylong",label:"Onde lunghe",len:"lunghi",cost:220},
  {id:"hightail",label:"Coda alta",len:"lunghi",cost:200},{id:"halfup",label:"Semiraccolto",len:"lunghi",cost:210},
  {id:"bald",label:"Pelato",len:"corti",cost:0},
];
const AV_HAIR_LEN=[{id:"corti",label:"Corti"},{id:"medi",label:"Medi"},{id:"lunghi",label:"Lunghi"}];
const AV_HAIR_COLORS=["#FFFFFF","#2B2B2B","#5C3A21","#A8682E","#D9A441","#C0C0C0","#E85D9C","#7C6FF0","#3BC9A8","#5BB8F0","#FF6B4A","#B24BF3","#FF3D8B"];
const AV_BEARD=[
  {id:"none",label:"Niente",cost:0},{id:"stubble",label:"Ombra",cost:60},
  {id:"goatee",label:"Pizzetto",cost:100},{id:"full",label:"Folta",cost:140},
  {id:"mustache",label:"Baffi",cost:90},{id:"circle",label:"Circolare",cost:120},
  {id:"long",label:"Lunga",cost:180},{id:"handlebar",label:"Baffi a manubrio",cost:160},
  {id:"soul",label:"Pizzetto soul",cost:110},
];
const AV_BEARD_COLORS=["#FFFFFF","#2B2B2B","#4A3520","#6B4A2E","#8B5A2B","#A8682E","#C8924E","#D9A441","#5A5A5A","#9AA0AE","#E8DCC8","#B24BF3","#5BB8F0"];
const AV_FACE_EXP=[
  {id:"smile",label:"Sorriso"},{id:"happy",label:"Felice"},{id:"wink",label:"Occhiolino"},
  {id:"calm",label:"Sereno"},{id:"love",label:"Innamorato"},{id:"cool",label:"Sicuro"},
];
const AV_TOP=[
  {id:"bra",label:"Intimo",cost:0,sex:"f"},{id:"tank",label:"Canotta",cost:0,sex:"u"},
  {id:"tee",label:"T-shirt",cost:0,sex:"u"},{id:"hoodie",label:"Felpa",cost:0,sex:"u"},
  {id:"shirt",label:"Camicia",cost:0,sex:"m"},{id:"dress",label:"Vestito",cost:0,sex:"f"},
  {id:"suit",label:"Elegante",cost:350,sex:"m"},{id:"sweater",label:"Maglione",cost:0,sex:"u"},
  {id:"crop",label:"Top corto",cost:0,sex:"f"},{id:"jacket",label:"Giacca",cost:300,sex:"m"},
  {id:"blouse",label:"Blusa",cost:0,sex:"f"},{id:"polo",label:"Polo",cost:0,sex:"m"},
  {id:"kimono",label:"Kimono",cost:450,sex:"u"},{id:"varsity",label:"College",cost:380,sex:"u"},
  {id:"galaxy",label:"Galassia",cost:600,sex:"u"},{id:"royal",label:"Reale",cost:800,sex:"u"},
];
const AV_TOP_COLORS=["#FFFFFF","#FF5E78","#7C6FF0","#3BC9A8","#FFB347","#5BB8F0","#3D2433","#E85D9C","#2BB673","#F5C518","#1A1A2E"];
const AV_BOTTOM=[
  {id:"briefs",label:"Intimo",cost:0,sex:"u"},
  {id:"jeans",label:"Jeans",cost:0,sex:"u"},{id:"shorts",label:"Pantaloncini",cost:0,sex:"u"},
  {id:"skirt",label:"Gonna",cost:0,sex:"f"},{id:"elegant",label:"Eleganti",cost:0,sex:"m"},
  {id:"joggers",label:"Tuta",cost:0,sex:"u"},{id:"longskirt",label:"Gonna lunga",cost:0,sex:"f"},
  {id:"chinos",label:"Chinos",cost:0,sex:"m"},{id:"leggings",label:"Leggings",cost:0,sex:"f"},
  {id:"tutu",label:"Tutù",cost:280,sex:"f"},{id:"cargo",label:"Cargo",cost:0,sex:"m"},
];
const AV_SHOES=[
  {id:"barefoot",label:"Scalzo",cost:0},
  {id:"sneakers",label:"Sneakers",cost:0},{id:"boots",label:"Stivali",cost:0},
  {id:"heels",label:"Tacchi",cost:0},{id:"sandals",label:"Sandali",cost:0},
  {id:"flipflops",label:"Infradito",cost:0},{id:"loafers",label:"Mocassini",cost:140},
  {id:"hightop",label:"Alte",cost:0},{id:"ballet",label:"Ballerine",cost:0},
  {id:"chelsea",label:"Chelsea",cost:160},{id:"glow",label:"Luminose",cost:320},
];
const AV_SHOE_COLORS=["#FFFFFF","#EDEDED","#1A1A2E","#FF5E78","#7C6FF0","#3BC9A8","#5BB8F0","#FFB347","#E85D9C","#5C3A21","#F5C518"];
const AV_GLASSES=[
  {id:"none",label:"Nessuno",cost:0},{id:"round",label:"Tondi",cost:0},
  {id:"sun",label:"Sole",cost:0},{id:"star",label:"Stelle",cost:160},
  {id:"heart",label:"Cuore",cost:200},{id:"visor",label:"Visore",cost:420},
  {id:"monocle",label:"Monocolo",cost:260},
];
const AV_TATTOO=[
  {id:"none",label:"Nessuno",cost:0},{id:"heart",label:"Cuore",cost:0},
  {id:"star",label:"Stella",cost:0},{id:"rose",label:"Rosa",cost:120},
  {id:"tribal",label:"Tribale",cost:150},{id:"anchor",label:"Ancora",cost:130},
  {id:"butterfly",label:"Farfalla",cost:160},{id:"initials",label:"Iniziali",cost:140},
];
const AV_NECK=[
  {id:"none",label:"Nessuna",cost:0},{id:"chain",label:"Catenina",cost:110},
  {id:"pearls",label:"Perle",cost:170},{id:"heart",label:"Cuore",cost:140},
  {id:"bowtie",label:"Papillon",cost:130},{id:"scarf",label:"Sciarpa",cost:190},
  {id:"medal",label:"Medaglia",cost:350},
];
const AV_HATS=[
  {id:"none",label:"Nessuno",cost:0},{id:"cap",label:"Cappellino",cost:90},
  {id:"crown",label:"Corona",cost:400},{id:"beanie",label:"Beanie",cost:80},
  {id:"flower",label:"Fiori",cost:150},{id:"party",label:"Festa",cost:120},
  {id:"halo",label:"Aureola",cost:500},{id:"horns",label:"Diavoletto",cost:480},
  {id:"chef",label:"Chef",cost:200},{id:"wizard",label:"Mago",cost:550},
  {id:"cowboy",label:"Cowboy",cost:280},{id:"pirate",label:"Pirata",cost:420},
  {id:"santa",label:"Babbo Natale",cost:320},{id:"unicorn",label:"Unicorno",cost:650},
];
const AV_BACK=[
  {id:"none",label:"Niente",cost:0},
  {id:"wings",label:"Ali d'angelo",cost:600,e:"🪽"},
  {id:"cape",label:"Mantello",cost:450},
  {id:"backpack",label:"Zaino",cost:180,e:"🎒"},
  {id:"balloon",label:"Palloncini",cost:240,e:"🎈"},
  {id:"devilwings",label:"Ali di drago",cost:680},
  {id:"jetpack",label:"Jetpack",cost:550,e:"🚀"},
  {id:"sword",label:"Spada",cost:400,e:"⚔️"},
];
const AV_BG=[
  {id:"none",label:"Neutro",cost:0,c1:"#EFE7F7",c2:"#F6EFF9"},
  {id:"sunset",label:"Tramonto",cost:0,c1:"#FFB37B",c2:"#FF6B9D"},
  {id:"ocean",label:"Oceano",cost:120,c1:"#5BB8F0",c2:"#3BC9A8"},
  {id:"night",label:"Notte",cost:160,c1:"#5B5BD6",c2:"#2D2D6B"},
  {id:"forest",label:"Natura",cost:140,c1:"#7BD88F",c2:"#2BB673"},
  {id:"hearts",label:"Amore",cost:200,c1:"#FF8FB1",c2:"#E85D9C"},
  {id:"galaxy",label:"Galassia",cost:280,c1:"#3A1C71",c2:"#D76D77"},
  {id:"gold",label:"Oro",cost:350,c1:"#F5C518",c2:"#E8A93B"},
  {id:"candy",label:"Caramella",cost:240,c1:"#FF9EC4",c2:"#A18CD1"},
  {id:"aurora",label:"Aurora",cost:320,c1:"#43E97B",c2:"#38F9D7"},
];
const AV_PET=[
  {id:"none",label:"Nessuno",cost:0,e:""},
  {id:"dog",label:"Cagnolino",cost:180,e:"🐶"},
  {id:"cat",label:"Gattino",cost:180,e:"🐱"},
  {id:"bunny",label:"Coniglietto",cost:220,e:"🐰"},
  {id:"bird",label:"Uccellino",cost:160,e:"🐦"},
  {id:"panda",label:"Panda",cost:300,e:"🐼"},
  {id:"fox",label:"Volpe",cost:280,e:"🦊"},
  {id:"dragon",label:"Draghetto",cost:500,e:"🐲"},
  {id:"unicornpet",label:"Unicorno",cost:550,e:"🦄"},
  {id:"penguin",label:"Pinguino",cost:260,e:"🐧"},
];
// Themed full outfits — set top, bottom, hat in one tap
const AV_OUTFITS=[
  {id:"none",label:"Personalizzato",emoji:"🎨",cost:0},
  {id:"beach",label:"Mare",emoji:"🏖️",cost:200,set:{top:"crop",topColor:"#5BB8F0",bottom:"shorts",hat:"none",glasses:"sun"}},
  {id:"xmas",label:"Natale",emoji:"🎄",cost:300,set:{top:"sweater",topColor:"#E5484D",bottom:"jeans",hat:"santa"}},
  {id:"halloween",label:"Halloween",emoji:"🎃",cost:350,set:{top:"royal",topColor:"#1A1A2E",bottom:"elegant",hat:"wizard",effect:"fire"}},
  {id:"gala",label:"Gran Galà",emoji:"🥂",cost:400,set:{top:"suit",topColor:"#1A1A2E",bottom:"elegant",neck:"bowtie",shoes:"boots"}},
  {id:"sport",label:"Sportivo",emoji:"🏃",cost:180,set:{top:"hoodie",topColor:"#3BC9A8",bottom:"joggers",shoes:"sneakers"}},
  {id:"royal",label:"Reale",emoji:"👑",cost:500,set:{top:"royal",topColor:"#7C6FF0",bottom:"elegant",hat:"crown",neck:"medal"}},
  {id:"angel",label:"Angelo",emoji:"😇",cost:600,set:{top:"dress",topColor:"#FFFFFF",bottom:"longskirt",hat:"halo",back:"wings",effect:"aura"}},
  {id:"pirate",label:"Pirata",emoji:"🏴‍☠️",cost:480,set:{top:"shirt",topColor:"#3D2433",bottom:"elegant",hat:"pirate",back:"sword"}},
  {id:"cowboy",label:"Far West",emoji:"🤠",cost:420,set:{top:"varsity",topColor:"#A8682E",bottom:"jeans",hat:"cowboy",shoes:"boots"}},
  {id:"unicorn",label:"Magico",emoji:"🦄",cost:700,set:{top:"galaxy",topColor:"#B24BF3",bottom:"tutu",hat:"unicorn",effect:"rainbow",pet:"unicornpet"}},
];
const AV_EFFECT=[
  {id:"none",label:"Niente",cost:0},
  {id:"sparkle",label:"Brillantini",cost:220},
  {id:"aura",label:"Aura",cost:300},
  {id:"hearts",label:"Cuoricini",cost:260},
  {id:"fire",label:"Fuoco",cost:380},
  {id:"rainbow",label:"Arcobaleno",cost:450},
  {id:"stars",label:"Stelle",cost:340},
  {id:"snow",label:"Neve",cost:300},
  {id:"glow",label:"Bagliore",cost:420},
  {id:"butterfly",label:"Farfalle",cost:400},
];
const DEFAULT_AVATARS={
  p1:{name:"Gaetano",skin:"#E8B088",hair:"short",hairColor:"#2B2B2B",beard:"none",face:"smile",top:"tank",topColor:"#7C6FF0",bottom:"briefs",bottomColor:"#3D3A4A",shoes:"sneakers",glasses:"none",neck:"none",hat:"none",bg:"sunset",pet:"none",back:"none",effect:"none",tattoo:"none"},
  p2:{name:"Federica",skin:"#F4C9A8",hair:"long",hairColor:"#A8682E",beard:"none",face:"happy",top:"dress",topColor:"#FF5E78",bottom:"skirt",shoes:"heels",glasses:"none",neck:"pearls",hat:"none",bg:"sunset",pet:"cat",back:"none",effect:"none",tattoo:"none"},
};
const DRAW_WORDS=["Cuore","Casa","Gatto","Sole","Pizza","Albero","Stella","Fiore","Luna","Pesce","Aereo","Tazza"];

// NOTE: divulgazione basata su ricerche e libri PUBBLICI di esperti reali.
// Nessuna foto, nessuna citazione testuale inventata. Da verificare prima della pubblicazione.
const EXPERTS=[
  {author:"John & Julie Gottman",src:"The Gottman Institute · Univ. of Washington",origin:"🇺🇸 USA",role:"Ricerca sulle coppie",field:"psico",av:"🧠",g:"a2",title:"Il rapporto 5:1 e i Quattro Cavalieri",reads:"—",min:"7 min",
   intro:"Dopo oltre 40 anni di studi nel «Love Lab», i Gottman hanno individuato schemi che predicono con alta accuratezza se una coppia resterà unita.",
   pts:["Rapporto magico 5:1: almeno cinque interazioni positive per ogni negativa durante un conflitto","I «Quattro Cavalieri» da evitare: critica, disprezzo, difensività, muro di silenzio","Il disprezzo è il predittore più forte di rottura: sostituitelo con una cultura dell'apprezzamento","Avvio dolce: «Io sento… ho bisogno di…» invece di «Tu sempre…»","Quando l'emozione sale, time-out di almeno 20 minuti per calmarsi, poi si riprende"]},
  {author:"John & Julie Gottman",src:"«The Seven Principles for Making Marriage Work»",origin:"🇺🇸 USA",role:"Ricerca sulle coppie",field:"psico",av:"🗺️",g:"a3",title:"Le mappe dell'amore e i conflitti perpetui",reads:"—",min:"6 min",
   intro:"Secondo i Gottman, il 69% dei conflitti di coppia è «perpetuo»: non si risolve, si impara a gestirlo.",
   pts:["«Mappe dell'amore»: conoscere il mondo interiore dell'altro, sogni e paure incluse","Distinguere problemi risolvibili da differenze perpetue di valori o personalità","Gestire invece di vincere: dialogo aperto e curiosità, non accusa","«Conto corrente emotivo»: piccoli gesti positivi come deposito quotidiano","Rispondere ai «tentativi di connessione» del partner, anche piccoli"]},
  {author:"Esther Perel",src:"«Mating in Captivity» (2006)",origin:"🇧🇪 Belgio",role:"Psicoterapeuta · sessualità",field:"sex",av:"🔥",g:"a1",title:"Amore e desiderio: la distanza che accende",reads:"—",min:"7 min",
   intro:"Esther Perel esplora un paradosso: gli ingredienti che nutrono l'amore (sicurezza, familiarità) sono spesso quelli che spengono il desiderio.",
   pts:["«L'amore ha bisogno di vicinanza, il desiderio ha bisogno di spazio»","La novità e un po' di mistero riaccendono l'eros nelle relazioni lunghe","Vedere il partner da lontano, mentre fa qualcoso che ama, può ravvivare l'attrazione","Il desiderio non è un guasto da riparare: cala anche nelle coppie sane","Coltivare spazi separati rende più ricco l'incontro"]},
  {author:"Sue Johnson",src:"«Hold Me Tight» · Terapia EFT",origin:"🇨🇦 Canada",role:"Psicologa · fondatrice EFT",field:"psico",av:"🤝",g:"a2",title:"L'attaccamento: sentirsi al sicuro in due",reads:"—",min:"6 min",
   intro:"La Emotionally Focused Therapy di Sue Johnson vede l'amore adulto come un legame di attaccamento: ci serve sentire che l'altro c'è.",
   pts:["Dietro molte liti c'è una domanda: «Ci sei? Conto per te?»","Stili di attaccamento: sicuro, ansioso, evitante — influenzano come reagiamo","La sicurezza emotiva è la base della connessione (e, per molte donne, anche del desiderio)","Trasformare le critiche in richieste di vicinanza","Le «conversazioni che contano» riparano e rafforzano il legame"]},
  {author:"Gary Chapman",src:"«I 5 linguaggi dell'amore»",origin:"🇺🇸 USA",role:"Counselor · autore",field:"coach",av:"💌",g:"a4",title:"I cinque linguaggi dell'amore",reads:"—",min:"5 min",
   intro:"Secondo Chapman tendiamo a esprimere amore nel modo in cui vorremmo riceverlo: se il partner «parla» un'altra lingua, il messaggio si perde.",
   pts:["Parole di affermazione: riconoscere e incoraggiare ad alta voce","Tempo di qualità: presenza piena, senza distrazioni","Atti di servizio: fare le cose senza che vengano chieste","Contatto fisico: vicinanza e gesti affettuosi","Doni: il pensiero conta più dell'oggetto — scoprite il linguaggio principale dell'altro"]},
  {author:"Emily Nagoski",src:"«Come As You Are» (2015)",origin:"🇺🇸 USA",role:"Ricercatrice · sessualità",field:"sex",av:"🌸",g:"a1",title:"Desiderio responsivo: non sempre parte da soli",reads:"—",min:"6 min",
   intro:"La ricerca di Emily Nagoski distingue il desiderio «spontaneo» da quello «responsivo», che nasce in risposta a un contesto piacevole.",
   pts:["Molte persone (spesso le donne) hanno desiderio responsivo: prima il contesto, poi la voglia","Modello «acceleratore e freni»: contano sia gli stimoli sì sia ciò che frena","Ridurre i «freni» (stress, stanchezza, tensioni) conta più che aggiungere tecniche","Il contesto giusto — calma, sicurezza, gioco — accende più della spontaneità","Nessun «modello unico» di sessualità sana: ognuno ha il suo"]},
  {author:"Harriet Lerner",src:"«The Dance of Anger»",origin:"🇺🇸 USA",role:"Psicologa clinica",field:"psico",av:"🌀",g:"a3",title:"La rabbia come segnale, non come arma",reads:"—",min:"6 min",
   intro:"Per Harriet Lerner la rabbia è un segnale prezioso: ci dice che qualcosa va cambiato, in noi o nella relazione.",
   pts:["La rabbia indica un bisogno o un limite violato: ascoltatela invece di reprimerla","Evitare gli schemi che scaricano la rabbia senza cambiare nulla","Parlare in prima persona del proprio bisogno, senza incolpare","Cambiare la propria parte nella «danza» invece di voler cambiare l'altro","Mantenere la propria voce senza rompere il legame"]},
  {author:"Dr. Becky Kennedy",src:"«Good Inside» (2022)",origin:"🇺🇸 USA",role:"Psicologa · genitorialità",field:"family",av:"👨‍👩‍👧",g:"a2",title:"Fare squadra come genitori",reads:"—",min:"6 min",
   intro:"Dr. Becky Kennedy invita a partire da un principio: entrambi i partner sono «buoni dentro», anche quando sbagliano sotto stress.",
   pts:["Allinearsi sulle regole davanti ai figli, discutere i disaccordi in privato","Riparare dopo un errore conta più dell'essere perfetti","Distinguere il comportamento dalla persona: «hai sbagliato» non «sei sbagliato»","Validare le emozioni del bambino ponendo comunque limiti fermi","Prendersi cura della coppia, non solo dei figli: è la base della famiglia"]},
  {author:"Brené Brown",src:"Ricerca su vulnerabilità e fiducia",origin:"🇺🇸 USA",role:"Ricercatrice · scienze sociali",field:"coach",av:"💛",g:"a4",title:"La fiducia si costruisce coi piccoli gesti",reads:"—",min:"6 min",
   intro:"Brené Brown descrive la fiducia come somma di piccoli momenti: non un grande atto, ma tanti gesti coerenti nel tempo.",
   pts:["La fiducia è fatta di piccoli depositi quotidiani, non di grandi promesse","Affidabilità: fare ciò che si dice, anche nelle cose minime","Vulnerabilità condivisa: aprirsi crea connessione, non debolezza","Confini chiari: dire di sì e di no con onestà","Dare il beneficio del dubbio, l'interpretazione più generosa"]},
  {author:"John Gottman",src:"«The Science of Trust»",origin:"🇺🇸 USA",role:"Ricerca sulle coppie",field:"coach",av:"🌱",g:"a4",title:"Tradimento e fiducia: i piccoli «sì»",reads:"—",min:"5 min",
   intro:"Gottman lega la fiducia ai «bid», i tentativi quotidiani di connessione: girarsi verso l'altro la costruisce, ignorarlo la erode.",
   pts:["«Tentativi di connessione»: ogni gesto è un invito a cui rispondere","Girarsi verso (non contro, non altrove) costruisce intimità","Coltivare un atteggiamento di apprezzamento invece che di critica","Le coppie solide mantengono viva la curiosità reciproca","Riparare presto dopo un conflitto protegge il legame"]},
];
const EXPERT_FIELDS=[
  {id:"psico",name:"Psicologi & Terapeuti",sub:"Comunicazione, conflitti, emozioni",emoji:"🧠",g:"a2"},
  {id:"sex",name:"Sessuologi",sub:"Desiderio, intimità, passione",emoji:"🔥",g:"a1"},
  {id:"coach",name:"Coach Relazionali",sub:"Obiettivi, crescita, abitudini",emoji:"🌱",g:"a4"},
  {id:"finance",name:"Esperti di Finanze",sub:"Soldi, progetti e futuro insieme",emoji:"💰",g:"a3"},
  {id:"life",name:"Avventura & Lifestyle",sub:"Viaggi, esperienze, vita di coppia",emoji:"🌍",g:"a5"},
  {id:"family",name:"Famiglia & Genitorialità",sub:"Crescere e fare squadra in due",emoji:"👨‍👩‍👧",g:"a2"},
];

const REWARDS=[
  {brand:"Amazon",emoji:"📦",g:"a3",from:5,hot:true},
  {brand:"Booking",emoji:"🏨",g:"a5",from:10,hot:true},
  {brand:"Netflix",emoji:"🎬",g:"a1",from:15},
  {brand:"Spotify",emoji:"🎵",g:"a4",from:10},
  {brand:"Zalando",emoji:"👗",g:"a2",from:10},
  {brand:"IKEA",emoji:"🛋️",g:"a2",from:25},
];
const DESTS=[
  {name:"Santorini",country:"Grecia",emoji:"🏛️",cost:1200,saved:340,g:"a5",tag:"Romantica",
   hero:"L'isola dei tramonti più belli del mondo",
   desc:"Case bianche aggrappate alle scogliere, cupole blu, mare color zaffiro. Santorini è il sogno romantico per eccellenza.",
   best:"Maggio–Settembre",fly:"2h30 da Roma",budget:"€100–250/notte",
   see:[
     {e:"🌅",t:"Tramonto a Oia",d:"Il più famoso al mondo. Arrivate un'ora prima per un posto sul muretto del castello."},
     {e:"🍷",t:"Cantine vulcaniche",d:"Degustazione a Santo Wines con vista sulla caldera. I vini Assyrtiko sono unici."},
     {e:"🚤",t:"Crociera nella caldera",d:"Tour in barca tra sorgenti termali, isole vulcaniche e spiagge nascoste."},
     {e:"🏖️",t:"Spiaggia rossa",d:"Sabbia e scogliere rosse a Akrotiri, scenario surreale per una giornata in due."},
     {e:"🍴",t:"Cena ad Ammoudi Bay",d:"Pesce freschissimo sul porticciolo sotto Oia, con i piedi quasi nell'acqua."},
   ]},
  {name:"Bali",country:"Indonesia",emoji:"🌴",cost:2400,saved:800,g:"a4",tag:"Esotica",
   hero:"L'isola degli dei tra templi e risaie",
   desc:"Spiritualità, natura lussureggiante e spa tra le migliori al mondo. Bali avvolge le coppie in un'atmosfera magica.",
   best:"Aprile–Ottobre",fly:"14h da Roma",budget:"€60–200/notte",
   see:[
     {e:"🌄",t:"Alba sul Monte Batur",d:"Trekking notturno per vedere il sorgere del sole sopra le nuvole. Indimenticabile."},
     {e:"🛕",t:"Tempio Tanah Lot",d:"Tempio sul mare, spettacolare al tramonto quando le onde lo circondano."},
     {e:"🌾",t:"Risaie di Tegallalang",d:"Terrazze verdi a perdita d'occhio, perfette per foto e passeggiate."},
     {e:"🧖",t:"Spa balinese",d:"Massaggi tradizionali di coppia immersi nella natura di Ubud."},
     {e:"🐒",t:"Foresta delle scimmie",d:"Santuario sacro tra alberi giganti e templi muschiati a Ubud."},
   ]},
  {name:"Tokyo",country:"Giappone",emoji:"⛩️",cost:3200,saved:1100,g:"a2",tag:"Unica",
   hero:"Dove il futuro incontra la tradizione",
   desc:"Neon e templi, sakura e grattacieli, ramen alle 3 di notte. Tokyo è un'esperienza che cambia il modo di vedere il mondo.",
   best:"Marzo–Aprile / Ottobre",fly:"12h da Roma",budget:"€80–250/notte",
   see:[
     {e:"🌸",t:"Sakura a Ueno",d:"Se andate in primavera, i ciliegi in fiore sono pura poesia. Picnic sotto i petali."},
     {e:"🌃",t:"Shibuya di notte",d:"L'incrocio più famoso del mondo, neon ovunque, energia incredibile."},
     {e:"♨️",t:"Onsen a Hakone",d:"Bagni termali con vista sul Monte Fuji. Relax assoluto in coppia."},
     {e:"🍜",t:"Ramen a Shinjuku",d:"Vicoli di Omoide Yokocho, lanterne rosse e ciotole fumanti a tarda notte."},
     {e:"⛩️",t:"Tempio Senso-ji",d:"Il più antico di Tokyo ad Asakusa, magico al mattino presto senza folla."},
   ]},
  {name:"Parigi",country:"Francia",emoji:"🗼",cost:900,saved:600,g:"a1",tag:"Classica",
   hero:"La città dell'amore, senza tempo",
   desc:"Boulevard, bistrot, la Senna al tramonto. Parigi resta la meta romantica per definizione, a poche ore da casa.",
   best:"Aprile–Giugno / Settembre",fly:"2h15 da Roma",budget:"€100–280/notte",
   see:[
     {e:"🗼",t:"Torre Eiffel al tramonto",d:"Picnic al Champ de Mars mentre la torre si illumina. Scintilla ogni ora."},
     {e:"🚢",t:"Crociera sulla Senna",d:"Battello al crepuscolo tra i ponti illuminati. Il classico più romantico."},
     {e:"🥐",t:"Colazione a Montmartre",d:"Croissant in un bistrot, poi salita al Sacré-Cœur per la vista su Parigi."},
     {e:"🎨",t:"Louvre senza code",d:"Prenotate online. Non perdetevi la Gioconda all'alba dell'apertura."},
     {e:"💕",t:"Quartiere Le Marais",d:"Stradine medievali, caffè nascosti, perfetto per perdersi mano nella mano."},
   ]},
];
const DEST_IDEAS=[
  {name:"Maldive",country:"Maldive",emoji:"🐠",cost:4500,g:"a4",tag:"Paradiso"},
  {name:"New York",country:"USA",emoji:"🗽",cost:1800,g:"a1",tag:"Iconica"},
  {name:"Marrakech",country:"Marocco",emoji:"🕌",cost:800,g:"a3",tag:"Avventura"},
  {name:"Islanda",country:"Islanda",emoji:"🌋",cost:1600,g:"a5",tag:"Natura"},
  {name:"Lisbona",country:"Portogallo",emoji:"🚋",cost:700,g:"a3",tag:"Charme"},
  {name:"Dubai",country:"Emirati",emoji:"🏜️",cost:1500,g:"a3",tag:"Lusso"},
];

const TOURNAMENTS=[
  {id:"t1",emoji:"🎯",name:"Coppa Sincronia",status:"live",couples:1240,buyin:50,prize:"500 🪙 + Badge",ends:"3 giorni",g:"a3",desc:"Sfida di sintonia a eliminazione. Scommetti 50 gettoni, il vincitore prende il montepremi."},
  {id:"t2",emoji:"🎨",name:"Disegno Express",status:"live",couples:670,buyin:30,prize:"300 🪙",ends:"5 giorni",g:"a5",desc:"Indovinate più disegni possibile. Buy-in 30 gettoni."},
  {id:"t3",emoji:"🌍",name:"World Couples Cup",status:"soon",couples:0,buyin:100,prize:"Buono €25 + 1000 🪙",ends:"Lunedì",g:"a2",desc:"Il torneo mensile. Solo coppie dal Capitolo 3. Premio reale offerto dagli sponsor."},
];
const LEADERBOARD=[
  {rank:1,couple:"Priya & Raj",av:"💎",flag:"🇮🇳",tok:8420,badge:"👑"},
  {rank:2,couple:"Yuki & Hiro",av:"🌸",flag:"🇯🇵",tok:7100,badge:"💎"},
  {rank:3,couple:"Tom & Emma",av:"💫",flag:"🇬🇧",tok:6300,badge:"🌟"},
  {rank:4,couple:"Carlos & Ana",av:"🥰",flag:"🇧🇷",tok:4900,badge:"⭐"},
  {rank:5,couple:"Marco & Laura",av:"💑",flag:"🇮🇹",tok:3800,badge:"🔥"},
  {rank:12,couple:"Gaetano & Federica",av:"🔥",flag:"🇮🇹",tok:420,badge:"🌱",me:true},
];
const DUELS=[
  {id:"d1",mode:"1v1",emoji:"⚡",name:"Sfida Lampo 1v1",desc:"Tu contro un'altra persona. 20 domande veloci.",buyin:20,g:"a5"},
  {id:"d2",mode:"1v1",emoji:"🧠",name:"Quiz Cultura 1v1",desc:"Sfida a colpi di sapere, uno contro uno.",buyin:30,g:"a4"},
  {id:"d3",mode:"2v2",emoji:"💑",name:"Coppia vs Coppia",desc:"Voi due contro un'altra coppia. Sintonia totale.",buyin:50,g:"a1"},
  {id:"d4",mode:"2v2",emoji:"🎨",name:"Disegno a Squadre",desc:"Indovinate più disegni della coppia avversaria.",buyin:40,g:"a3"},
];

const VALUES_Q=[
  {q:"Cosa conta di più in una relazione?",opts:["Fiducia","Passione","Crescita insieme","Libertà"]},
  {q:"Come immagini la casa ideale?",opts:["In città","In campagna","Vicino al mare","Sempre in viaggio"]},
  {q:"Il successo per te è...",opts:["Una famiglia felice","Realizzarmi nel lavoro","Libertà economica","Esperienze e ricordi"]},
  {q:"Nei momenti difficili preferisci...",opts:["Parlarne subito","Un po' di spazio","Un abbraccio","Distrarti insieme"]},
  {q:"Il tempo libero ideale è...",opts:["Avventura","Relax","Amici","Solo noi due"]},
  {q:"La cosa più importante per crescere insieme?",opts:["Comunicare","Rispettarsi","Sognare in grande","Ridere ogni giorno"]},
];
const SPICY_Q=[
  {q:"Il momento più romantico è...",opts:["Una cena a lume di candela","Un ballo lento","Una fuga a sorpresa","Una serata a casa solo noi"],adult:true},
  {q:"Cosa ti fa battere il cuore?",opts:["Uno sguardo intenso","Un messaggio inaspettato","Un abbraccio stretto","Le parole giuste"],adult:true},
  {q:"La sorpresa che vorresti ricevere?",opts:["Un weekend romantico","Una lettera d'amore","Una serata speciale","Lascio decidere a te 😏"],adult:true},
  {q:"Il vostro posto più complice?",opts:["Il divano","La cucina","Sotto le stelle","Ovunque, basta esserci"],adult:true},
];
const DEEP_Q=[
  {q:"Se potessi cenare con chiunque al mondo, chi sceglieresti?",opts:["Un mio idolo","Un parente che non c'è più","Il me stesso del futuro","Resto con te 💞"]},
  {q:"Qual è il ricordo più bello della nostra storia?",opts:["Il primo bacio","Il primo viaggio insieme","Una notte qualunque sul divano","Il giorno che ci siamo detti 'ti amo'"]},
  {q:"Cosa ti spaventa di più del futuro?",opts:["Perdere le persone care","Non realizzarmi","Allontanarci","Niente, se siamo insieme"]},
  {q:"Se partissimo domani, dove andremmo?",opts:["Un'isola tropicale","Una città d'arte","Un viaggio on the road","Ovunque, purché insieme"]},
  {q:"Cosa ti fa sentire più amato/a da me?",opts:["Le piccole attenzioni","Quando mi ascolti","Il contatto fisico","Quando mi fai ridere"]},
  {q:"Qual è la qualità che ami di più in me?",opts:["La dolcezza","Il senso dell'umorismo","La forza","Come mi guardi"]},
  {q:"Cosa sogni per noi tra 10 anni?",opts:["Una casa nostra","Una famiglia","Girare il mondo","Semplicemente ancora qui, insieme"]},
  {q:"Quando ti sei sentito/a più vicino/a a me?",opts:["In un momento difficile","Durante una risata","In silenzio, vicini","La prima volta che ci siamo visti"]},
];
const SYNC_Q=[
  {q:"Il nostro posto del cuore è...",opts:["Il mare","La montagna","Casa nostra","La nostra città"]},
  {q:"Un sabato perfetto insieme è...",opts:["Relax sul divano","Avventura fuori","Cena romantica","Festa con amici"]},
  {q:"Il nostro modo di dirci 'ti amo' è...",opts:["A parole","Con i gesti","Con un abbraccio","Con uno sguardo"]},
  {q:"La nostra serata ideale è...",opts:["Film e coccole","Cena fuori","Cucinare insieme","Uscire a ballare"]},
  {q:"Il viaggio dei nostri sogni è...",opts:["Un'isola tropicale","Una capitale europea","Un on the road","Una baita in montagna"]},
  {q:"La stagione di noi due è...",opts:["Primavera","Estate","Autunno","Inverno"]},
  {q:"Ciò che ci unisce di più è...",opts:["Le risate","La complicità","La passione","La calma insieme"]},
  {q:"Il nostro animale-simbolo è...",opts:["Cane fedele","Gatto coccolone","Uccelli liberi","Lupi inseparabili"]},
];
const WOULDYOU=[
  {a:"Vivere al mare",b:"Vivere in montagna"},{a:"Viaggiare sempre",b:"Casa stabile"},
  {a:"Cena a casa",b:"Uscita elegante"},{a:"Più tempo libero",b:"Più soldi"},
  {a:"Colazione a letto",b:"Aperitivo al tramonto"},{a:"Vacanza avventurosa",b:"Vacanza relax"},
  {a:"Notte sotto le stelle",b:"Hotel di lusso"},{a:"Cane",b:"Gatto"},
  {a:"Maratona di serie TV",b:"Serata giochi da tavolo"},{a:"Città d'arte",b:"Spiaggia tropicale"},
  {a:"Cucinare insieme",b:"Ordinare e rilassarsi"},{a:"Ballare tutta la notte",b:"Coccole sul divano"},
  {a:"Sorpresa romantica",b:"Piano organizzato insieme"},{a:"Svegliarsi all'alba",b:"Dormire fino a tardi"},
  {a:"Un grande amore turbolento",b:"Un amore calmo e sereno"},{a:"Leggere la sua mente",b:"Essere invisibili insieme"},
];
const TRIVIA=[
  // ── AMORE & COPPIA ──
  {q:"In quale città si trova la 'Casa di Giulietta'?",opts:["Venezia","Verona","Firenze"],correct:1,cat:"amore",lvl:1},
  {q:"Qual è l'ormone chiamato 'molecola dell'amore'?",opts:["Adrenalina","Ossitocina","Insulina"],correct:1,cat:"amore",lvl:2},
  {q:"In che giorno si celebra San Valentino?",opts:["14 febbraio","14 gennaio","24 febbraio"],correct:0,cat:"amore",lvl:1},
  {q:"Quante rose rosse simboleggiano 'ti amo'?",opts:["Una","Dodici","Cento"],correct:1,cat:"amore",lvl:1},
  {q:"Quale metallo si regala per le nozze d'oro?",opts:["Argento","Oro","Platino"],correct:1,cat:"amore",lvl:1},
  {q:"Cosa si festeggia per le nozze d'argento?",opts:["10 anni","25 anni","50 anni"],correct:1,cat:"amore",lvl:1},
  {q:"Quale dito porta tradizionalmente la fede nuziale in Italia?",opts:["Indice","Anulare","Mignolo"],correct:1,cat:"amore",lvl:1},
  {q:"Da quale parte del corpo si pensava partisse la 'vena dell'amore'?",opts:["Cuore","Anulare sinistro","Cervello"],correct:1,cat:"amore",lvl:3},
  {q:"Quale santo è il patrono degli innamorati?",opts:["San Antonio","San Valentino","San Francesco"],correct:1,cat:"amore",lvl:1},
  {q:"Quanto dura in media la fase dell'innamoramento secondo gli studi?",opts:["1-3 anni","10 anni","6 mesi"],correct:0,cat:"amore",lvl:3},
  // ── CULTURA GENERALE ──
  {q:"Quale città è soprannominata 'la città dell'amore'?",opts:["Venezia","Parigi","Roma"],correct:1,cat:"cultura",lvl:1},
  {q:"Chi ha dipinto la Gioconda?",opts:["Raffaello","Leonardo da Vinci","Michelangelo"],correct:1,cat:"cultura",lvl:1},
  {q:"Qual è il pianeta più vicino al Sole?",opts:["Venere","Mercurio","Marte"],correct:1,cat:"cultura",lvl:1},
  {q:"In quale continente si trova l'Egitto?",opts:["Asia","Africa","Europa"],correct:1,cat:"cultura",lvl:1},
  {q:"Quante corde ha una chitarra classica?",opts:["Quattro","Sei","Otto"],correct:1,cat:"cultura",lvl:1},
  {q:"Qual è il fiume più lungo del mondo?",opts:["Nilo","Rio delle Amazzoni","Mississippi"],correct:1,cat:"cultura",lvl:3},
  {q:"In che anno è caduto il Muro di Berlino?",opts:["1989","1979","1995"],correct:0,cat:"cultura",lvl:2},
  {q:"Qual è la capitale dell'Australia?",opts:["Sydney","Canberra","Melbourne"],correct:1,cat:"cultura",lvl:3},
  {q:"Quante zampe ha un ragno?",opts:["Sei","Otto","Dieci"],correct:1,cat:"cultura",lvl:1},
  {q:"Quale gas respiriamo per vivere?",opts:["Azoto","Ossigeno","Anidride carbonica"],correct:1,cat:"cultura",lvl:1},
  // ── DIVERTENTE / CINEMA & MUSICA ──
  {q:"In quale film compare «Tu completi me»?",opts:["Notting Hill","Jerry Maguire","Titanic"],correct:1,cat:"fun",lvl:2},
  {q:"Come si chiama il protagonista di Titanic?",opts:["Jack","John","James"],correct:0,cat:"fun",lvl:1},
  {q:"Quale animale è Pumba ne Il Re Leone?",opts:["Facocero","Cinghiale","Maiale"],correct:0,cat:"fun",lvl:2},
  {q:"Chi canta 'Shape of You'?",opts:["Ed Sheeran","Justin Bieber","Bruno Mars"],correct:0,cat:"fun",lvl:1},
  {q:"In che film vola un tappeto magico?",opts:["Aladdin","Cenerentola","Frozen"],correct:0,cat:"fun",lvl:1},
  {q:"Qual è il cocktail con prosecco e pesca?",opts:["Spritz","Bellini","Mojito"],correct:1,cat:"fun",lvl:2},
  {q:"Quante note musicali ci sono nella scala?",opts:["Cinque","Sette","Nove"],correct:1,cat:"fun",lvl:1},
  {q:"In quale città è ambientato Friends?",opts:["New York","Los Angeles","Chicago"],correct:0,cat:"fun",lvl:1},
  // ── PICCANTE (per coppie, leggero) ──
  {q:"Quale frutto è simbolo di tentazione e sensualità?",opts:["Mela","Fragola","Banana"],correct:1,cat:"spicy",lvl:1,adult:true},
  {q:"Quale spezia è considerata afrodisiaca?",opts:["Cannella","Zafferano","Origano"],correct:1,cat:"spicy",lvl:2,adult:true},
  {q:"Quale colore è associato alla passione?",opts:["Blu","Rosso","Verde"],correct:1,cat:"spicy",lvl:1,adult:true},
  {q:"Quale alimento è il più famoso afrodisiaco?",opts:["Ostriche","Pane","Riso"],correct:0,cat:"spicy",lvl:1,adult:true},
  {q:"Quale ballo è considerato il più sensuale?",opts:["Valzer","Tango","Polka"],correct:1,cat:"spicy",lvl:1,adult:true},
];
const TRIVIA_CATS=[
  {id:"all",l:"Tutte",e:"🎲"},{id:"amore",l:"Amore",e:"💞"},
  {id:"cultura",l:"Cultura",e:"🧠"},{id:"fun",l:"Divertente",e:"🎬"},{id:"spicy",l:"Piccante",e:"🌶️"},
];

// ════════ HELPERS ════════
function chapterOf(p){let c=CHAPTERS[0],n=CHAPTERS[1];for(let i=0;i<CHAPTERS.length;i++){if(p>=CHAPTERS[i].need){c=CHAPTERS[i];n=CHAPTERS[i+1]||CHAPTERS[i];}}const pct=n===c?100:Math.round(((p-c.need)/(n.need-c.need))*100);return{c,n,pct};}
const fmt=n=>parseFloat(n).toFixed(2);
// ── Daily content rotation ──
function dayNumber(){const t=new Date();return Math.floor((t-new Date(t.getFullYear(),0,0))/86400000)+t.getFullYear()*1000;}
// pick N deterministic items for "today" from an array, rotating each day, offset by a per-game key
function dailySet(arr,n,key=0){
  const day=dayNumber()+key;const out=[];const used=new Set();const len=arr.length;
  for(let i=0;i<Math.min(n,len);i++){let idx=(day*7+i*13)%len;while(used.has(idx))idx=(idx+1)%len;used.add(idx);out.push(arr[idx]);}
  return out;
}
function msToMidnight(){const now=new Date();const m=new Date(now);m.setHours(24,0,0,0);return m-now;}
function Countdown({T,label="Nuovi quiz tra"}){
  const [ms,setMs]=useState(msToMidnight());
  useEffect(()=>{const i=setInterval(()=>setMs(msToMidnight()),1000);return()=>clearInterval(i);},[]);
  const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000);
  return <span style={{fontSize:12,fontWeight:700,color:T.a3}}>⏱ {label} {h}h {m}m {s}s</span>;
}

// ════════ ATOMS ════════
function Btn({children,onClick,grad,style={},disabled,variant="grad",T,light}){
  const base={borderRadius:14,padding:"14px 20px",fontWeight:700,fontSize:15,cursor:disabled?"not-allowed":"pointer",width:"100%",opacity:disabled?0.4:1,transition:"transform 0.15s",border:"none"};
  const v={grad:{...base,background:grad,color:light?T.text:"#fff",fontWeight:800,boxShadow:light?"none":`0 6px 22px ${(T&&T.a1)||"#FF4D9D"}44`},soft:{...base,background:T.surface2,color:T.a1,border:`1px solid ${T.line2}`},ghost:{...base,background:"transparent",color:T.sub,border:`1px solid ${T.line2}`}};
  return <button onClick={onClick} disabled={disabled} onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} style={{...v[variant],...style}}>{children}</button>;
}
function Bar({pct,grad,h=8,T}){return <div style={{height:h,background:T.surface2,borderRadius:h,overflow:"hidden"}}><div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:grad,borderRadius:h,transition:"width 0.9s cubic-bezier(.4,0,.2,1)"}}/></div>;}
function Toast({msg,visible,T}){return <div style={{position:"fixed",top:14,left:"50%",transform:`translateX(-50%) translateY(${visible?0:-80}px)`,background:T.text,color:T.bg,borderRadius:22,padding:"8px 16px",fontWeight:700,fontSize:12.5,zIndex:9999,transition:"transform 0.45s cubic-bezier(.34,1.4,.64,1)",boxShadow:"0 6px 22px rgba(0,0,0,0.18)",pointerEvents:"none",maxWidth:"80%",textAlign:"center"}}>{msg}</div>;}
function Sheet({children,onClose,T}){return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(20,12,18,0.55)",backdropFilter:"blur(5px)",zIndex:500,display:"flex",alignItems:"flex-end"}}><div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,margin:"0 auto",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:"26px 26px 0 0",maxHeight:"92vh",overflowY:"auto"}}>{children}</div></div>;}
function Pill({children,grad}){return <span style={{background:grad,color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{children}</span>;}
function Section({title,sub,T}){return <div style={{padding:"22px 18px 10px"}}><div style={{fontSize:13,fontWeight:700,color:T.sub,letterSpacing:0.4,textTransform:"uppercase"}}>{title}</div>{sub&&<div style={{fontSize:13,color:T.faint,marginTop:3}}>{sub}</div>}</div>;}

// ════════ LOVE NOTES ════════
const NOTE_EMOJIS=["💕","🌹","😍","🥰","💌","✨","🌙","🎀","🦋","💫"];
function LoveNotes({userId,coupleId,partnerName,T,G}){
  const [notes,setNotes]=useState([]);
  const [composing,setComposing]=useState(false);
  const [msg,setMsg]=useState("");
  const [emoji,setEmoji]=useState("💕");
  const [sending,setSending]=useState(false);

  useEffect(()=>{
    if(!coupleId)return;
    supabase.from("love_notes").select("id,from_user,message,emoji,created_at").eq("couple_id",coupleId).order("created_at",{ascending:false}).limit(5).then(({data})=>{if(data)setNotes(data);});
    const ch=supabase.channel("notes-"+coupleId)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"love_notes",filter:`couple_id=eq.${coupleId}`},(p)=>{setNotes(prev=>[p.new,...prev].slice(0,5));})
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[coupleId]);

  async function send(){
    if(!msg.trim()||!coupleId||!userId)return;
    setSending(true);
    await supabase.from("love_notes").insert({couple_id:coupleId,from_user:userId,message:msg.trim(),emoji}).catch(()=>{});
    setMsg("");setSending(false);setComposing(false);
  }

  const latest=notes[0];
  const isFromMe=latest?.from_user===userId;

  return(<div style={{padding:"0 18px"}}>
    <style>{`@keyframes noteSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    {!composing?(
      <div style={{borderRadius:20,background:T.glass||T.surface,backdropFilter:T.glass?"blur(14px)":"none",WebkitBackdropFilter:T.glass?"blur(14px)":"none",border:`1px solid ${T.line2}`,overflow:"hidden"}}>
        <div style={{padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:11,fontWeight:800,color:T.a1,letterSpacing:0.5,textTransform:"uppercase"}}>💌 Note d'amore</span>
          <div onClick={()=>setComposing(true)} style={{fontSize:11,fontWeight:800,color:"#fff",background:G.a1,borderRadius:10,padding:"4px 10px",cursor:"pointer"}}>+ Scrivi</div>
        </div>
        {latest?(
          <div style={{padding:"0 14px 13px",animation:"noteSlide 0.4s ease"}}>
            <div style={{background:T.surface2,borderRadius:14,padding:"11px 13px"}}>
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{fontSize:22,flexShrink:0}}>{latest.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13.5,fontWeight:600,lineHeight:1.45,color:T.text}}>{latest.message}</div>
                  <div style={{fontSize:11,color:T.faint,marginTop:4}}>{isFromMe?"Tu":"♥ "+partnerName} · {new Date(latest.created_at).toLocaleDateString("it",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
              </div>
            </div>
            {notes.length>1&&<div style={{display:"flex",gap:5,marginTop:8,overflowX:"auto",paddingBottom:2}}>
              {notes.slice(1).map(n=>(
                <div key={n.id} style={{flexShrink:0,background:T.surface2,borderRadius:12,padding:"7px 10px",maxWidth:160}}>
                  <div style={{fontSize:14}}>{n.emoji}</div>
                  <div style={{fontSize:11.5,color:T.sub,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.message}</div>
                </div>
              ))}
            </div>}
          </div>
        ):(
          <div style={{padding:"0 14px 13px",textAlign:"center",color:T.faint,fontSize:13}}>Nessuna nota ancora — scrivi la prima! 💕</div>
        )}
      </div>
    ):(
      <div style={{borderRadius:20,background:T.glass||T.surface,backdropFilter:T.glass?"blur(14px)":"none",WebkitBackdropFilter:T.glass?"blur(14px)":"none",border:`1px solid ${T.a1}55`,padding:"14px",animation:"noteSlide 0.3s ease"}}>
        <div style={{fontSize:12,fontWeight:800,color:T.a1,marginBottom:10}}>💌 Scrivi una nota a {partnerName}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {NOTE_EMOJIS.map(e=>(<span key={e} onClick={()=>setEmoji(e)} style={{fontSize:22,cursor:"pointer",borderRadius:10,padding:"4px 6px",background:emoji===e?`${T.a1}22`:"transparent",border:emoji===e?`1px solid ${T.a1}55`:"1px solid transparent"}}>{e}</span>))}
        </div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value.slice(0,120))} placeholder="Scrivi qualcosa di dolce..." rows={3}
          style={{width:"100%",border:`1px solid ${T.line2}`,borderRadius:12,padding:"10px 12px",fontSize:14,background:T.surface2,color:T.text,resize:"none",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        <div style={{fontSize:11,color:T.faint,textAlign:"right",marginTop:3}}>{msg.length}/120</div>
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <div onClick={()=>setComposing(false)} style={{flex:1,textAlign:"center",padding:"10px",borderRadius:12,border:`1px solid ${T.line2}`,fontSize:13,fontWeight:700,color:T.sub,cursor:"pointer"}}>Annulla</div>
          <div onClick={send} style={{flex:2,textAlign:"center",padding:"10px",borderRadius:12,background:msg.trim()&&!sending?G.a1:"rgba(128,128,128,0.3)",fontSize:13,fontWeight:800,color:"#fff",cursor:msg.trim()&&!sending?"pointer":"default"}}>
            {sending?"Invio...":"Invia 💕"}
          </div>
        </div>
      </div>
    )}
  </div>);
}

// ════════ ONBOARDING ════════
function Onboarding({T,G,onDone}){
  const [step,setStep]=useState(0);
  const slides=[
    {icon:"🫶",title:"Benvenuti in Bondly",lead:"Il vostro spazio di coppia",
     text:"Un luogo dove giocare, conoscervi più a fondo e ritrovarvi — che siate sul divano insieme o a chilometri di distanza.",
     foot:"Pensato per due. Sempre.",grad:G.hero},
    {icon:"💑",title:"Create il vostro avatar",lead:"Siete voi, in Bondly",
     text:"La prima cosa: disegnate insieme il vostro avatar di coppia. Vi accompagnerà nei giochi, nelle sfide online e crescerà con voi. Personalizzatelo con accessori unici.",
     foot:"💞 Un'identità tutta vostra.",grad:G.a1},
    {icon:"📖",title:"Un percorso, non un punteggio",lead:"I Capitoli della vostra storia",
     text:"Ogni gioco completato vi fa avanzare nei Capitoli: dall'Inizio fino alla Maestria. Più giocate, più giochi profondi si sbloccano. Non è una gara — è la vostra crescita.",
     foot:"💛 I Punti Connessione misurano questo viaggio.",grad:G.a2},
    {icon:"💰",title:"Sognate, e venite premiati",lead:"Il Salvadanaio reale",
     text:"Mentre giocate e guardate brevi contenuti, accumulate denaro vero. Sceglietelo come preferite: trasformatelo in buoni Amazon, Booking e altri, o risparmiatelo per il viaggio dei vostri sogni.",
     foot:"💰 Reale, vostro, da spendere come volete.",grad:G.a3},
    {icon:"💜",title:"Non siete soli",lead:"Esperti al vostro fianco",
     text:"Psicologi e sessuologi da tutto il mondo condividono consigli concreti, tradotti in italiano. Perché una relazione bella si coltiva ogni giorno, con gli strumenti giusti.",
     foot:"Pronti a iniziare insieme?",grad:G.a4},
  ];
  const s=slides[step];
  return(<div style={{position:"fixed",inset:0,background:T.bgScene||T.bg,color:T.text,zIndex:1000,maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",padding:"0 24px"}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
      <div style={{width:128,height:128,borderRadius:36,background:s.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60,marginBottom:30,boxShadow:`0 12px 40px ${T.a1}33`}}>{s.icon}</div>
      <div style={{fontSize:13,fontWeight:700,color:T.a1,letterSpacing:0.8,textTransform:"uppercase",marginBottom:8}}>{s.lead}</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:27,fontWeight:800,color:T.text,marginBottom:16,letterSpacing:-0.6}}>{s.title}</div>
      <div style={{fontSize:16,color:T.sub,lineHeight:1.65,maxWidth:320,marginBottom:18}}>{s.text}</div>
      <div style={{fontSize:14,fontWeight:600,color:T.a2,background:T.surface2,borderRadius:16,padding:"10px 18px"}}>{s.foot}</div>
    </div>
    <div style={{paddingBottom:40}}>
      <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:24}}>
        {slides.map((_,i)=>(<div key={i} style={{width:i===step?26:8,height:8,borderRadius:8,background:i===step?T.a1:T.line2,transition:"width 0.3s"}}/>))}
      </div>
      <Btn T={T} grad={s.grad} onClick={()=>step<slides.length-1?setStep(step+1):onDone()}>{step<slides.length-1?"Avanti →":"Iniziamo insieme!"}</Btn>
      {step<slides.length-1&&<div onClick={onDone} style={{textAlign:"center",marginTop:14,fontSize:14,color:T.faint,cursor:"pointer"}}>Salta l'introduzione</div>}
    </div>
  </div>);
}

// ════════ HOME ════════
function ChaptersModal({cp,onClose,T,G}){
  const cur=chapterOf(cp).c;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",maxWidth:440,margin:"0 auto"}}>
      <style>{`@keyframes chSheet{0%{transform:translateY(100%)}100%{transform:translateY(0)}}`}</style>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxHeight:"88vh",overflowY:"auto",background:T.bg,borderRadius:"28px 28px 0 0",padding:"10px 0 30px",animation:"chSheet 0.3s cubic-bezier(.34,1.1,.64,1)"}}>
        <div style={{width:40,height:5,borderRadius:3,background:T.line2,margin:"6px auto 14px"}}/>
        <div style={{padding:"0 22px",marginBottom:16}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:23,fontWeight:800,letterSpacing:-0.5}}>Il vostro viaggio</div>
          <div style={{fontSize:14,color:T.sub,marginTop:3}}>Più giocate insieme, più capitoli sbloccate. Ognuno racconta una fase del vostro legame.</div>
        </div>
        <div style={{padding:"0 18px"}}>
          {CHAPTERS.map((ch,i)=>{
            const done=cp>=ch.need&&!ch.soon;
            const isCurrent=ch.ch===cur.ch;
            const locked=!done&&!ch.soon;
            return(
              <div key={ch.ch} style={{display:"flex",gap:13,marginBottom:6}}>
                {/* timeline rail */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:36,flexShrink:0}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:done||isCurrent?G[ch.g]:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,border:isCurrent?`2px solid ${T.text}`:"none",opacity:ch.soon?0.5:1}}>{done&&!isCurrent?"✓":ch.icon}</div>
                  {i<CHAPTERS.length-1&&<div style={{width:3,flex:1,minHeight:28,background:done?G[ch.g]:T.line2,opacity:0.5,borderRadius:2}}/>}
                </div>
                {/* card */}
                <div style={{flex:1,background:isCurrent?`linear-gradient(135deg,${T.a1}14,${T.a2}0A)`:T.surface,borderRadius:16,padding:"13px 15px",marginBottom:8,border:`1px solid ${isCurrent?T.a1+"44":T.line}`,opacity:ch.soon?0.7:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:15.5,fontWeight:800}}>{ch.name}</div>
                    {isCurrent&&<span style={{fontSize:10,fontWeight:800,color:"#fff",background:G.hero,borderRadius:10,padding:"3px 9px"}}>SEI QUI</span>}
                    {done&&!isCurrent&&<span style={{fontSize:11,fontWeight:800,color:T.a4}}>✓ Sbloccato</span>}
                    {ch.soon&&<span style={{fontSize:10,fontWeight:800,color:T.sub,background:T.surface2,borderRadius:10,padding:"3px 9px"}}>PRESTO</span>}
                    {locked&&<span style={{fontSize:13}}>🔒</span>}
                  </div>
                  <div style={{fontSize:12.5,color:T.sub,marginTop:3,lineHeight:1.4}}>{ch.desc}</div>
                  {!done&&!ch.soon&&<div style={{fontSize:11.5,color:T.faint,marginTop:6,fontWeight:600}}>Servono {ch.need.toLocaleString()} punti{cp<ch.need?` · ancora ${(ch.need-cp).toLocaleString()}`:""}</div>}
                  {ch.soon&&<div style={{fontSize:11.5,color:T.faint,marginTop:6,fontWeight:600}}>🔧 In arrivo nei prossimi aggiornamenti</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"4px 22px 0"}}>
          <Btn T={T} grad={G.hero} onClick={onClose}>Continua il viaggio 💞</Btn>
        </div>
      </div>
    </div>
  );
}
function Home({cp,wallet,tokens,setTokens,streak,avatars,setTab,T,G,onToast,openGame,userId,coupleId,coupleStartedAt}){
  const {c,n,pct}=chapterOf(cp);
  const daysTogetherNum=coupleStartedAt?Math.max(0,Math.floor((Date.now()-new Date(coupleStartedAt).getTime())/86400000)):null;
  const [showChapters,setShowChapters]=useState(false);
  const activeCount=CHAPTERS.filter(x=>!x.soon).length;
  const dailyReady=tokens<150; // show free daily recharge prompt when low
  // Domanda del giorno
  const dq=DAILY_QUESTIONS[dayNumber()%DAILY_QUESTIONS.length];
  const dqKey=dayNumber();
  const partnerName=avatars.p2.name;
  const [myAnswer,setMyAnswer]=useState(null);
  const [partnerAnswer,setPartnerAnswer]=useState(null);
  const [dqLoading,setDqLoading]=useState(true);
  const dqPartnerIdRef=useRef(null);

  useEffect(()=>{
    if(!userId||!coupleId){setDqLoading(false);return;}
    let channel=null;
    async function load(){
      const{data:couple}=await supabase.from("couples").select("member_a,member_b").eq("id",coupleId).single();
      const pid=couple?.member_a===userId?couple?.member_b:couple?.member_a;
      dqPartnerIdRef.current=pid;
      const{data:myProf}=await supabase.from("profiles").select("daily_answer").eq("id",userId).single();
      if(myProf?.daily_answer?.day===dqKey)setMyAnswer(myProf.daily_answer.answer);
      if(pid){
        const{data:pProf}=await supabase.from("profiles").select("daily_answer").eq("id",pid).single();
        if(pProf?.daily_answer?.day===dqKey)setPartnerAnswer(pProf.daily_answer.answer);
        channel=supabase.channel("dq-"+coupleId)
          .on("postgres_changes",{event:"UPDATE",schema:"public",table:"profiles",filter:`id=eq.${pid}`},(payload)=>{
            const da=payload.new?.daily_answer;
            if(da?.day===dqKey){
              setPartnerAnswer(da.answer);
              setMyAnswer(ma=>{if(ma&&da.answer)logDiscovery(dq.q,ma,da.answer);return ma;});
            }
          }).subscribe();
      }
      setDqLoading(false);
    }
    load();
    return()=>{if(channel)supabase.removeChannel(channel);};
  },[userId,coupleId]);

  async function answerDaily(o){
    setMyAnswer(o);
    await supabase.from("profiles").update({daily_answer:{day:dqKey,answer:o}}).eq("id",userId);
    if(partnerAnswer!=null){
      logDiscovery(dq.q,o,partnerAnswer);
      onToast(o===partnerAnswer?"💞 Stessa risposta di "+partnerName+"!":"💌 Risposta inviata!");
    } else {
      onToast("💌 Risposta inviata!");
    }
  }

  // Turns
  const [myTurns,setMyTurns]=useState([]);
  const [waitingTurns,setWaitingTurns]=useState([]);

  useEffect(()=>{
    if(!userId||!coupleId)return;
    let channel=null;
    async function loadTurns(){
      const{data:turns}=await supabase.from("game_turns")
        .select("id,game_id,question_index,player_a,player_b")
        .eq("couple_id",coupleId).is("player_b",null);
      const pending=(turns||[]);
      setMyTurns(pending.filter(t=>t.player_a!==userId));
      setWaitingTurns(pending.filter(t=>t.player_a===userId));
    }
    loadTurns();
    channel=supabase.channel("turns-home-"+coupleId)
      .on("postgres_changes",{event:"*",schema:"public",table:"game_turns",filter:`couple_id=eq.${coupleId}`},()=>loadTurns())
      .subscribe();
    return()=>{if(channel)supabase.removeChannel(channel);};
  },[userId,coupleId]);

  return(<div style={{paddingBottom:90}}>
    {/* ── Domanda del giorno (appears on top, disappears once answered) ── */}
    {!dqLoading&&!myAnswer&&(
      <div style={{padding:"14px 18px 0"}}>
        <style>{`@keyframes cardGlow{0%,100%{box-shadow:0 4px 18px ${T.a1}22}50%{box-shadow:0 6px 26px ${T.a1}44}}`}</style>
        <div style={{borderRadius:18,padding:"1.5px",background:`linear-gradient(135deg,${T.a1},${T.a2})`,animation:"cardGlow 3.5s ease-in-out infinite"}}>
          <div style={{borderRadius:16.5,padding:"14px 15px",background:T.glass||T.surface,backdropFilter:T.glass?"blur(14px)":"none",WebkitBackdropFilter:T.glass?"blur(14px)":"none",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${T.a1}14,transparent 60%)`,pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
                <span style={{fontSize:10,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:T.a1,background:`${T.a1}18`,borderRadius:8,padding:"3px 8px"}}>🌅 Domanda del giorno</span>
              </div>
              <div style={{fontSize:16,fontWeight:800,letterSpacing:-0.2,lineHeight:1.3,marginBottom:12,color:T.text}}>{dq.q}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {dq.opts.map((o,i)=>(<div key={i} onClick={()=>answerDaily(o)} style={{background:T.surface2,border:`1px solid ${T.line2}`,borderRadius:11,padding:"10px 9px",textAlign:"center",fontSize:12.5,fontWeight:700,cursor:"pointer",color:T.text}}>{o}</div>))}
              </div>
              <div style={{fontSize:10.5,color:T.faint,marginTop:9,textAlign:"center"}}>Rispondi e mantieni viva la serie 🔥</div>
            </div>
          </div>
        </div>
      </div>
    )}
    {myAnswer&&(
      <div style={{padding:"16px 18px 0"}}>
        <div style={{borderRadius:18,padding:"14px 16px",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`}}>
          <div style={{fontSize:11,fontWeight:800,color:T.faint,textTransform:"uppercase",marginBottom:6}}>🌅 Domanda del giorno · risposto!</div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{dq.q}</div>
          <div style={{display:"flex",gap:8,fontSize:12.5}}>
            <span style={{flex:1,background:`${T.a4}14`,borderRadius:10,padding:"7px 10px",fontWeight:700,color:T.a4}}>Tu: {myAnswer}</span>
            {partnerAnswer!=null
              ?<span style={{flex:1,background:`${T.a3}14`,borderRadius:10,padding:"7px 10px",fontWeight:700,color:T.a3}}>{partnerName}: {partnerAnswer}</span>
              :<span style={{flex:1,background:T.surface2,borderRadius:10,padding:"7px 10px",fontWeight:600,color:T.faint,fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>⏳ {partnerName} non ha ancora risposto</span>
            }
          </div>
          {myAnswer&&partnerAnswer&&myAnswer===partnerAnswer&&<div style={{fontSize:12,color:T.a2,fontWeight:700,marginTop:8,textAlign:"center"}}>✨ Stessa risposta!</div>}
        </div>
      </div>
    )}

    <div style={{padding:"18px 18px 0",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
      <div onClick={()=>setTab("avatar")} style={{cursor:"pointer",position:"relative",background:`linear-gradient(135deg,${T.a1}10,${T.a2}06)`,borderRadius:24,padding:"16px 30px 14px"}}>
        <CoupleAvatar avatars={avatars} T={T} G={G} size={156} bg/>
        <div style={{display:"flex",justifyContent:"center",marginTop:8}}>
          <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,borderRadius:20,padding:"6px 16px",fontSize:12.5,fontWeight:700,color:T.a1,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>✏️ Modifica avatar</div>
        </div>
      </div>
      <div onClick={()=>setTab("profile")} style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,letterSpacing:-0.5,marginTop:10,cursor:"pointer"}}>{avatars.p1.name} & {avatars.p2.name}</div>
      <div style={{fontSize:13,color:T.sub,marginTop:2}}>{daysTogetherNum!=null?`Insieme da ${daysTogetherNum} giorn${daysTogetherNum===1?"o":"i"} 💑 ·`:""} {streak}🔥 di serie</div>
    </div>

    {/* ── The journey banner — motivating, goal-driven ── */}
    <div style={{padding:"18px 18px 0"}}>
      <div onClick={()=>setShowChapters(true)} style={{borderRadius:20,padding:"15px 17px",background:G[c.g],color:"#fff",position:"relative",overflow:"hidden",cursor:"pointer",boxShadow:`0 8px 24px ${T.a1}33`}}>
        <div style={{position:"absolute",bottom:-30,right:-16,fontSize:110,opacity:0.14,transform:"rotate(-8deg)"}}>{c.icon}</div>
        <div style={{position:"relative",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:14,background:"rgba(255,255,255,0.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,backdropFilter:"blur(4px)"}}>{c.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:0.6,textTransform:"uppercase",opacity:0.85}}>Cap. {c.ch}/{activeCount}</span>
              <span style={{fontSize:10.5,fontWeight:800,background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"2px 8px"}}>{streak}🔥</span>
            </div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,letterSpacing:-0.3}}>{c.name}</div>
          </div>
          <div style={{fontSize:18,opacity:0.8,fontWeight:800}}>›</div>
        </div>
        <div style={{position:"relative",marginTop:12}}>
          <div style={{height:6,background:"rgba(255,255,255,0.25)",borderRadius:6,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:"#fff",borderRadius:6,transition:"width 0.9s"}}/>
          </div>
          <div style={{fontSize:11,opacity:0.92,fontWeight:600,marginTop:6}}>{c===n?"🏆 Capitolo finale!":`Ancora ${(n.need-cp).toLocaleString()} punti per "${n.name}"`}</div>
        </div>
      </div>
    </div>

    {showChapters&&<ChaptersModal cp={cp} onClose={()=>setShowChapters(false)} T={T} G={G}/>}

    {/* ── Partite a turni in sospeso ── */}
    {(myTurns.length>0||waitingTurns.length>0)&&(
    <div style={{padding:"22px 18px 0"}}>
      <div style={{fontSize:12,fontWeight:700,color:T.faint,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10,paddingLeft:2}}>🕓 Partite a turni</div>
      {myTurns.map(t=>{
        const gInfo=GAMES.find(g=>g.id===t.game_id)||{emoji:"🎮",name:t.game_id,g:"a3"};
        return(
          <div key={t.id} onClick={()=>openGame(t.game_id)} style={{background:`${T.a3}10`,border:`1px solid ${T.a3}33`,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:13,cursor:"pointer",marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:G[gInfo.g]||G.a3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{gInfo.emoji}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:800}}>{partnerName} ha giocato il suo turno!</div><div style={{fontSize:12.5,color:T.sub}}>{gInfo.name} · tocca a te rispondere</div></div>
            <div style={{fontSize:11,fontWeight:800,color:"#fff",background:G.a1,borderRadius:10,padding:"4px 9px",whiteSpace:"nowrap"}}>IL TUO TURNO</div>
          </div>
        );
      })}
      {waitingTurns.map(t=>{
        const gInfo=GAMES.find(g=>g.id===t.game_id)||{emoji:"🎮",name:t.game_id,g:"a3"};
        return(
          <div key={t.id} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line}`,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:13,marginBottom:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,opacity:0.7}}>{gInfo.emoji}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:800}}>{gInfo.name}</div><div style={{fontSize:12.5,color:T.faint}}>In attesa che {partnerName} finisca il turno</div></div>
            <div style={{fontSize:11,fontWeight:700,color:T.faint,whiteSpace:"nowrap"}}>🕓 In sospeso</div>
          </div>
        );
      })}
    </div>
    )}

    {/* ── Free daily token recharge when low ── */}
    {dailyReady&&(
      <div style={{padding:"22px 18px 0"}}>
        <div onClick={()=>{setTokens(t=>t+50);onToast("🎁 +50 gettoni gratis · torna domani!");}} style={{borderRadius:16,padding:"13px 16px",background:`${T.a4}12`,border:`1px solid ${T.a4}30`,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:22}}>🎁</span>
          <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:700,color:T.a4}}>Ricarica gratuita giornaliera</div><div style={{fontSize:11.5,color:T.sub,marginTop:1}}>+50 gettoni per la coppia, ogni giorno.</div></div>
          <span style={{fontSize:18,color:T.a4}}>›</span>
        </div>
      </div>
    )}

    {/* ── Love Notes ── */}
    {coupleId&&<div style={{padding:"22px 0 0"}}><LoveNotes userId={userId} coupleId={coupleId} partnerName={avatars.p2.name} T={T} G={G}/></div>}

    {/* ── Supporting features (secondary to playing) ── */}
    <div style={{padding:"24px 18px 0"}}>
      <div style={{fontSize:12,fontWeight:700,color:T.faint,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12,paddingLeft:2}}>E molto altro</div>
      {[
        {i:"⚔️",l:"Arena & Sfide",s:"Duelli, tornei e classifica",t:"arena",g:"a4"},
        {i:"🎟️",l:"Lotteria Bondly",s:"Biglietti e premi reali, dentro Premi",t:"rewards",g:"a1"},
        {i:"💰",l:"Salvadanaio & Premi",s:"Buoni reali e il viaggio dei sogni",t:"rewards",g:"a3"},
      ].map((a,i)=>(
        <div key={i} onClick={()=>setTab(a.t)} style={{display:"flex",gap:14,alignItems:"center",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:15,marginBottom:10,cursor:"pointer",border:`1px solid ${T.line}`}}>
          <div style={{width:46,height:46,borderRadius:13,background:G[a.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:23,flexShrink:0}}>{a.i}</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{a.l}</div><div style={{fontSize:12.5,color:T.sub,marginTop:2,lineHeight:1.4}}>{a.s}</div></div>
          <span style={{fontSize:19,color:T.faint}}>›</span>
        </div>
      ))}
    </div>
  </div>);
}

// ════════ GAMES ════════
// ── Live game lobby: wait for partner to join (simulated) ──
function LiveLobby({game,onReady,onCancel,partnerName,T,G}){
  const [dots,setDots]=useState(1);
  const [joined,setJoined]=useState(false);
  useEffect(()=>{const d=setInterval(()=>setDots(v=>v%3+1),500);return()=>clearInterval(d);},[]);
  useEffect(()=>{const t=setTimeout(()=>setJoined(true),2600);return()=>clearTimeout(t);},[]);
  useEffect(()=>{if(joined){const t=setTimeout(onReady,1100);return()=>clearTimeout(t);}},[joined]);
  return(<div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 24px"}}>
    <style>{`@keyframes pulse2{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:0.85}}@keyframes ringExpand{0%{transform:scale(0.8);opacity:0.5}100%{transform:scale(1.5);opacity:0}}`}</style>
    <div style={{fontSize:13,color:T.sub,marginBottom:30}}>{game.emoji} {game.name} · 🔴 Tempo reale</div>
    <div style={{position:"relative",marginBottom:30}}>
      {!joined&&<div style={{position:"absolute",inset:-12,borderRadius:"50%",border:`2px solid ${T.a1}`,animation:"ringExpand 1.4s ease-out infinite"}}/>}
      <div style={{width:96,height:96,borderRadius:"50%",background:joined?G.a4:G.hero,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,animation:joined?"none":"pulse2 1.2s ease-in-out infinite"}}>{joined?"✅":"💑"}</div>
    </div>
    {!joined?<>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:8}}>In attesa di {partnerName}{".".repeat(dots)}</div>
      <div style={{fontSize:14,color:T.sub,lineHeight:1.5,maxWidth:280,marginBottom:30}}>Per giocare in tempo reale dovete essere connessi entrambi. Abbiamo avvisato {partnerName} che la stai aspettando.</div>
      <button onClick={onCancel} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",color:T.sub,border:`1px solid ${T.line2}`,borderRadius:14,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Annulla</button>
    </>:<>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:T.a4,marginBottom:8}}>{partnerName} è entrato/a! 💞</div>
      <div style={{fontSize:14,color:T.sub}}>Si parte...</div>
    </>}
  </div>);
}

// ── Turn-based game: turn sent, waiting for partner ──
function TurnSent({game,onClose,partnerName,T,G}){
  return(<div style={{minHeight:"70vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 24px"}}>
    <div style={{width:96,height:96,borderRadius:"50%",background:G.a3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,marginBottom:24}}>📨</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:23,fontWeight:800,marginBottom:10}}>Turno inviato!</div>
    <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,marginBottom:8}}>Hai completato il tuo turno di <b style={{color:T.text}}>{game.name}</b>. Ora tocca a {partnerName}.</div>
    <div style={{background:`${T.a3}12`,border:`1px solid ${T.a3}30`,borderRadius:16,padding:"14px 18px",margin:"14px 0 26px",maxWidth:320}}>
      <div style={{fontSize:13,color:T.sub,lineHeight:1.5}}>🕓 La partita resta <b style={{color:T.a3}}>in sospeso</b>. Quando {partnerName} finisce il suo turno, la trovi pronta nella tua <b style={{color:T.text}}>Home</b>.</div>
    </div>
    <Btn T={T} grad={G.hero} onClick={onClose}>Ho capito</Btn>
  </div>);
}

function Games({cp,setCp,onToast,T,G,pendingGame,clearPending,userId,coupleId,avatars}){
  const {c}=chapterOf(cp);
  const partnerName=avatars?.p2?.name||"il partner";
  const [mode,setMode]=useState("live");
  const [active,setActive]=useState(null);
  const [stage,setStage]=useState(null); // null | "lobby" | "playing" | "turnsent"
  useEffect(()=>{
    if(pendingGame){const g=GAMES.find(x=>x.id===pendingGame);if(g){setActive(g);setStage("playing");setMode("turns");}clearPending&&clearPending();}
  },[pendingGame]);
  function launch(g){
    setActive(g);
    if(syncOf(g)==="live"){setStage("lobby");}
    else setStage("playing");
  }
  function endGame(){setActive(null);setStage(null);}
  if(active&&stage==="lobby") return <LiveLobby game={active} onReady={()=>setStage("playing")} onCancel={endGame} partnerName={partnerName} T={T} G={G}/>;
  if(active&&stage==="turnsent") return <TurnSent game={active} onClose={endGame} partnerName={partnerName} T={T} G={G}/>;
  if(active&&stage==="playing") return <Player game={active} onBack={(scenario)=>{if(syncOf(active)!=="turns")endGame();else if(scenario==="partner")endGame();else setStage("turnsent");}} setCp={setCp} onToast={onToast} T={T} G={G} userId={userId} coupleId={coupleId} partnerName={partnerName}/>;
  const matchMode=g=>syncOf(g)===mode;
  const totalUnlocked=GAMES.filter(g=>g.ch<=c.ch&&matchMode(g)).length;

  const GameCard=({g})=>{
    const sm=SYNC_LABEL[syncOf(g)], locked=g.ch>c.ch;
    if(locked) return(
      <div onClick={()=>onToast(`🔒 Si sblocca al Capitolo ${g.ch}: ${CHAPTERS[g.ch-1].name}`)} style={{minWidth:210,maxWidth:210,background:T.surface2,borderRadius:18,padding:15,cursor:"pointer",border:`1px solid ${T.line}`,opacity:0.6,flexShrink:0}}>
        <div style={{width:46,height:46,borderRadius:13,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid ${T.line}`,marginBottom:10}}>🔒</div>
        <div style={{fontSize:15,fontWeight:700}}>{g.name}</div>
        <div style={{fontSize:11.5,color:T.faint,marginTop:3}}>Capitolo {g.ch} · {CHAPTERS[g.ch-1].name}</div>
      </div>
    );
    return(
      <div onClick={()=>launch(g)} style={{minWidth:210,maxWidth:210,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:15,cursor:"pointer",border:`1px solid ${T.line}`,flexShrink:0,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{width:46,height:46,borderRadius:13,background:G[g.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:23}}>{g.emoji}</div>
          {g.adult&&<Pill grad={G.a1}>18+</Pill>}
        </div>
        <div style={{fontSize:15,fontWeight:700}}>{g.name}</div>
        <div style={{fontSize:12,color:T.sub,marginTop:3,lineHeight:1.4,flex:1}}>{g.desc}</div>
        <div style={{display:"flex",gap:6,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:10.5,fontWeight:700,color:syncOf(g)==="live"?T.a1:T.a3,background:T.surface2,borderRadius:7,padding:"2px 7px"}}>{sm.e} {sm.t}</span>
          <span style={{fontSize:11.5,fontWeight:800,color:T.a2,marginLeft:"auto"}}>+{g.cp}</span>
        </div>
      </div>
    );
  };

  return(<div style={{paddingBottom:90}}>
    <div style={{padding:"18px 18px 0"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.6}}>Giochi</div>
      <div style={{fontSize:14,color:T.sub,marginTop:3}}>Si gioca sempre in due, connessi 💞</div>
      {/* partner online status (simulated) */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,borderRadius:14,padding:"10px 14px"}}>
        <div style={{position:"relative"}}><span style={{fontSize:18}}>💑</span><span style={{position:"absolute",bottom:-1,right:-2,width:9,height:9,borderRadius:"50%",background:"#3BC9A8",border:`2px solid ${T.surface}`}}/></div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{partnerName} è online</div><div style={{fontSize:11.5,color:T.faint}}>Potete giocare in tempo reale, o a turni quando volete</div></div>
      </div>
    </div>
    {/* Mode filter — sync vs turns */}
    <div style={{display:"flex",gap:8,padding:"14px 18px 4px"}}>
      {MODES.map(m=>(<button key={m.id} onClick={()=>setMode(m.id)} style={{flex:1,background:mode===m.id?G.hero:T.surface,color:mode===m.id?"#fff":T.sub,border:mode===m.id?"none":`1px solid ${T.line2}`,borderRadius:14,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{m.e} {m.l}</button>))}
    </div>

    {/* Ordered micro-sections */}
    {GROUPS.map(grp=>{
      const games=GAMES.filter(g=>g.group===grp.id&&matchMode(g));
      if(games.length===0)return null;
      // unlocked first, then locked
      games.sort((a,b)=>(a.ch>c.ch?1:0)-(b.ch>c.ch?1:0));
      return(
        <div key={grp.id} style={{marginTop:22}}>
          <div style={{display:"flex",alignItems:"center",gap:11,padding:"0 18px 12px"}}>
            <div style={{width:38,height:38,borderRadius:11,background:G[grp.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{grp.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:800,letterSpacing:-0.3}}>{grp.name}</span>{grp.adult&&<Pill grad={G.a1}>18+</Pill>}</div>
              <div style={{fontSize:12,color:T.sub}}>{grp.sub}</div>
            </div>
            <span style={{fontSize:12,color:T.faint,fontWeight:600}}>{games.filter(g=>g.ch<=c.ch).length}/{games.length}</span>
          </div>
          <div style={{display:"flex",gap:12,overflowX:"auto",scrollbarWidth:"none",padding:"0 18px 4px"}}>
            {games.map(g=><GameCard key={g.id} g={g}/>)}
          </div>
        </div>
      );
    })}
  </div>);
}

// ════════ PLAYER ════════
// ════════ TURN-BASED Q&A (questions/values/spicy/sync/wouldyou) ════════
function TurnQA({game,data,kind,onBack,setCp,onToast,T,G,userId,coupleId}){
  const grad=G[game.g];
  const [loading,setLoading]=useState(true);
  const [qi,setQi]=useState(-1);
  const [scenario,setScenario]=useState("mine");
  const [partnerPick,setPartnerPick]=useState(null);
  const [turnId,setTurnId]=useState(null);
  const [phase,setPhase]=useState("loading");
  const [mine,setMine]=useState(null);
  const [agree,setAgree]=useState(0);
  const [count,setCount]=useState(0);

  useEffect(()=>{
    if(!userId||!coupleId){
      const nxt=nextUnused(game.id,data.length);
      setQi(nxt<0?-1:nxt);setScenario("mine");setPhase(nxt<0?"empty":"answer");setLoading(false);
      return;
    }
    async function load(){
      const{data:turns}=await supabase.from("game_turns")
        .select("id,question_index,player_a,answer_a,player_b")
        .eq("couple_id",coupleId).eq("game_id",game.id);
      const played=new Set((turns||[]).map(t=>t.question_index));
      const pending=(turns||[]).find(t=>t.player_a!==userId&&!t.player_b);
      if(pending){
        setQi(pending.question_index);
        setPartnerPick(pending.answer_a);
        setTurnId(pending.id);
        setScenario("partner");
        setPhase("answer");
      } else {
        let nxt=-1;
        for(let i=0;i<data.length;i++)if(!played.has(i)){nxt=i;break;}
        setQi(nxt);setScenario("mine");setPhase(nxt<0?"empty":"answer");
      }
      setLoading(false);
    }
    load();
  },[]);

  if(loading) return(
    <div style={{padding:24,textAlign:"center",paddingTop:80}}>
      <div style={{fontSize:38,marginBottom:14}}>⌛</div>
      <div style={{fontSize:14,color:T.sub}}>Carico la partita...</div>
    </div>
  );

  if(qi<0||phase==="empty") return(
    <div style={{padding:24,textAlign:"center",paddingTop:70}}>
      <div style={{fontSize:60,marginBottom:16}}>✅</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:10}}>Avete giocato tutte le domande!</div>
      <div style={{fontSize:14,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto 10px"}}>Avete completato questo mazzo. Ne aggiungiamo di nuove di continuo — tornate presto 💞</div>
      {count>0&&<div style={{fontSize:14,color:T.a2,fontWeight:700,marginBottom:20}}>D'accordo {agree}/{count} volte</div>}
      <Btn T={T} grad={grad} onClick={onBack}>Concludi</Btn>
    </div>
  );

  const q=data[qi];
  const opts=kind==="would"?[q.a,q.b]:q.opts;
  const isMatch=mine===partnerPick;
  const accent=game.id==="spicy"?T.a1:kind==="would"?T.a3:game.id==="sync"?T.a4:T.a3;
  const label=game.id==="sync"?"🎯 Sincronia":kind==="would"?"⚖️ Preferiresti":game.id==="spicy"?"🌶️ Piccante":game.id==="values"?"🧭 Valori":"💭 A turni";

  async function choose(o){
    setMine(o);setCount(c=>c+1);
    if(scenario==="mine"){
      if(userId&&coupleId){
        await supabase.from("game_turns").insert({
          couple_id:coupleId,game_id:game.id,question_index:qi,player_a:userId,answer_a:o
        }).catch(()=>{});
      }
      setCp(p=>p+Math.round(game.cp/3));
      onBack();
    } else {
      if(o===partnerPick)setAgree(a=>a+1);
      if(userId&&turnId){
        await supabase.from("game_turns").update({player_b:userId,answer_b:o}).eq("id",turnId).catch(()=>{});
      }
      logDiscovery(kind==="would"?`Preferiresti: ${q.a} o ${q.b}?`:q.q,o,partnerPick);
      setCp(p=>p+Math.round(game.cp/3));
      setPhase("reveal");
    }
  }

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span>
      <span style={{fontSize:13,color:T.faint}}>{game.name}</span>
    </div>
    <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:accent,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{label} · 🕓 a turni</div>

    {scenario==="partner"&&phase==="answer"&&(
      <div style={{display:"flex",alignItems:"center",gap:10,background:`${T.a3}12`,border:`1px solid ${T.a3}33`,borderRadius:14,padding:"10px 14px",marginBottom:16}}>
        <span style={{fontSize:20}}>💞</span>
        <div style={{fontSize:12.5,color:T.sub,fontWeight:600}}>Il partner ha già risposto. Tocca a te — poi vedrete entrambe le risposte!</div>
      </div>
    )}

    <div style={{margin:"10px 0 22px",minHeight:70,display:"flex",alignItems:"center"}}>
      <div style={{fontSize:21,fontWeight:700,lineHeight:1.4,textAlign:"center",width:"100%"}}>{kind==="would"?"Preferiresti...":q.q}</div>
    </div>

    {phase==="answer"&&<>
      <div style={{fontSize:13,color:T.sub,textAlign:"center",marginBottom:14}}>
        {scenario==="partner"?"Scegli la tua risposta — poi vedrete entrambe 💌":"Scegli — la tua risposta arriva al partner 💌"}
      </div>
      {opts.map((o,i)=>(<div key={i} onClick={()=>choose(o)} style={{padding:kind==="would"?"22px":"15px 18px",borderRadius:kind==="would"?20:15,marginBottom:kind==="would"?14:11,background:kind==="would"?(i===0?G.a1:G.a2):T.surface,color:kind==="would"?"#fff":T.text,border:kind==="would"?"none":`1px solid ${T.line2}`,fontSize:kind==="would"?18:15,fontWeight:kind==="would"?700:600,textAlign:kind==="would"?"center":"left",cursor:"pointer"}}>{o}</div>))}
    </>}

    {phase==="reveal"&&<>
      <div style={{background:`${T.a3}10`,border:`1px solid ${T.a3}33`,borderRadius:16,padding:"14px 16px",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:800,color:T.a3,textTransform:"uppercase",marginBottom:5}}>Il partner 💞</div>
        <div style={{fontSize:15,fontWeight:600}}>{partnerPick}</div>
      </div>
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,borderRadius:16,padding:"14px 16px",marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:800,color:T.a4,textTransform:"uppercase",marginBottom:5}}>La tua risposta 💌</div>
        <div style={{fontSize:15,fontWeight:600}}>{mine}</div>
        <div style={{fontSize:12,color:T.faint,marginTop:6}}>{isMatch?"✨ Avete risposto uguale!":"🌗 Viste diverse — parlatene!"}</div>
      </div>
      {count>0&&<div style={{fontSize:13,color:T.a2,fontWeight:700,marginBottom:16,textAlign:"center"}}>D'accordo {agree}/{count} {count===1?"volta":"volte"}</div>}
      <Btn T={T} grad={grad} onClick={()=>onBack("partner")}>Concludi questo turno →</Btn>
    </>}
  </div>);
}

function Player({game,onBack,setCp,onToast,T,G,userId,coupleId,partnerName="il partner"}){
  const [idx,setIdx]=useState(0);const [done,setDone]=useState(false);
  const [a,setA]=useState("");const [b,setB]=useState("");const [rev,setRev]=useState(false);
  const grad=G[game.g];
  // daily sets so each game refreshes every 24h, same for everyone
  const [syncPool]=useState(()=>dailySet(SYNC_Q,5,1));
  const [wouldPool]=useState(()=>dailySet(WOULDYOU,6,2));
  const fin=()=>{setCp(p=>p+game.cp);onToast(`+${game.cp} punti connessione 💛`);onBack();};
  const Top=()=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>{game.name}</span></div>);
  const inp={width:"100%",background:T.surface2,border:`1px solid ${T.line2}`,borderRadius:14,padding:"15px 16px",fontSize:15,outline:"none",color:T.text,marginBottom:12,boxSizing:"border-box"};

  if(done) return(<div style={{padding:24,textAlign:"center",paddingTop:80}}>
    <div style={{fontSize:64,marginBottom:18}}>🎉</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:8}}>Bel momento insieme!</div>
    <div style={{fontSize:15,color:T.sub,marginBottom:36}}>+{game.cp} punti connessione</div>
    <Btn T={T} grad={grad} onClick={fin}>Continua</Btn>
  </div>);

  if(game.id==="questions"||game.id==="values"||game.id==="spicy"){
    const DATA=game.id==="values"?VALUES_Q:game.id==="spicy"?SPICY_Q:DEEP_Q;
    return <TurnQA game={game} data={DATA} kind="qa" onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G} userId={userId} coupleId={coupleId}/>;
  }
  if(game.id==="sync") return <TurnQA game={game} data={SYNC_Q} kind="qa" onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G} userId={userId} coupleId={coupleId}/>;
  if(game.id==="wouldyou") return <TurnQA game={game} data={WOULDYOU} kind="would" onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G} userId={userId} coupleId={coupleId}/>;

  if(game.id==="memory") return <Memory game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="draw") return <DrawGame game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="slingshot") return <Slingshot game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="reflex") return <Reflex game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="pacman") return <Pacman game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="stack") return <Stack game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="snake") return <Snake game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="wordle") return <WordGuess game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="mostlikely") return <MostLikely game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G} partnerName={partnerName}/>;
  if(game.id==="catch") return <CatchGame game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="tap") return <TapGame game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="simon") return <SimonGame game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="intruso") return <TrovaIntruso game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="flappy") return <FlappyHeart game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="memory_cards") return <MemoryCards game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="bubble") return <BubblePop game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="reaction") return <ReactionBattle game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;
  if(game.id==="trivia"||game.id==="trivia2") return <Trivia game={game} onBack={onBack} setCp={setCp} onToast={onToast} T={T} G={G}/>;

  return(<div style={{padding:20,paddingBottom:90}}><Top/>
    <div style={{textAlign:"center",padding:"50px 0"}}><div style={{fontSize:60,marginBottom:18}}>{game.emoji}</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:10}}>{game.name}</div><div style={{fontSize:15,color:T.sub,lineHeight:1.5,maxWidth:280,margin:"0 auto"}}>{game.desc}</div>
    <div style={{fontSize:13,color:T.faint,marginTop:16,maxWidth:280,marginLeft:"auto",marginRight:"auto",lineHeight:1.5}}>🕓 Gioco a turni — la tua parte viene salvata e condivisa con {partnerName}.</div></div>
    <Btn T={T} grad={grad} onClick={()=>setDone(true)}>Invia il mio turno a {partnerName}</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Torna indietro</Btn>
  </div>);
}
function Memory({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [diff,setDiff]=useState(null); // null=choose
  const LEVELS={facile:{pairs:6,cols:4,emoji:"🌱"},medio:{pairs:8,cols:4,emoji:"🔥"},difficile:{pairs:10,cols:4,emoji:"💎"}};
  const ALL=["❤️","🌍","🎵","📸","🌙","🍷","🌹","✈️","🎁","⭐","🍰","🎬"];
  const [cards,setCards]=useState([]);
  const [fl,setFl]=useState([]);const [m,setM]=useState(0);const [moves,setMoves]=useState(0);const [win,setWin]=useState(false);

  function start(level){
    const n=LEVELS[level].pairs;const pp=ALL.slice(0,n);
    setCards([...pp,...pp].map((v,i)=>({id:i,v,f:false,d:false})).sort(()=>Math.random()-0.5));
    setDiff(level);setFl([]);setM(0);setMoves(0);setWin(false);
  }
  function tap(i){
    if(fl.length===2||cards[i].f||cards[i].d)return;
    const nc=[...cards];nc[i]={...nc[i],f:true};setCards(nc);const nf=[...fl,i];setFl(nf);
    if(nf.length===2){setMoves(v=>v+1);const[x,y]=nf;
      if(nc[x].v===nc[y].v){setTimeout(()=>{setCards(c=>c.map((cc,j)=>j===x||j===y?{...cc,d:true}:cc));setFl([]);setM(v=>{const nv=v+1;if(nv===LEVELS[diff].pairs){setCp(p=>p+game.cp);setWin(true);onToast(`+${game.cp} punti 💛`);}return nv;});},380);}
      else setTimeout(()=>{setCards(c=>c.map((cc,j)=>j===x||j===y?{...cc,f:false}:cc));setFl([]);},680);}
  }

  if(!diff) return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{textAlign:"center",padding:"30px 0 24px"}}><div style={{fontSize:56,marginBottom:14}}>🃏</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:8}}>Memoria di Coppia</div><div style={{fontSize:14,color:T.sub,lineHeight:1.5,maxWidth:280,margin:"0 auto"}}>Scegliete la difficoltà e trovate tutte le coppie nel minor numero di mosse.</div></div>
    {Object.entries(LEVELS).map(([k,v])=>(
      <div key={k} onClick={()=>start(k)} style={{display:"flex",alignItems:"center",gap:14,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,marginBottom:12,cursor:"pointer",border:`1px solid ${T.line}`}}>
        <div style={{width:48,height:48,borderRadius:13,background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{v.emoji}</div>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,textTransform:"capitalize"}}>{k}</div><div style={{fontSize:13,color:T.sub}}>{v.pairs} coppie da trovare</div></div>
        <span style={{fontSize:20,color:T.faint}}>›</span>
      </div>
    ))}
  </div>);

  const cfg=LEVELS[diff];
  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <span onClick={()=>setDiff(null)} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Difficoltà</span>
      <div style={{display:"flex",gap:12}}><span style={{fontSize:13,fontWeight:700,color:T.a4}}>✓ {m}/{cfg.pairs}</span><span style={{fontSize:13,color:T.faint}}>🔄 {moves} mosse</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cfg.cols},1fr)`,gap:9}}>
      {cards.map((c,i)=>(<div key={i} onClick={()=>tap(i)} style={{aspectRatio:"1",borderRadius:14,background:c.f||c.d?grad:T.surface,border:`1px solid ${c.d?T.a4:T.line2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.f||c.d?26:20,cursor:"pointer",color:c.f||c.d?"#fff":T.faint,transition:"all 0.3s",transform:c.f||c.d?"scale(1)":"scale(0.97)"}}>{c.f||c.d?c.v:"?"}</div>))}
    </div>
    {win&&<div style={{marginTop:24,textAlign:"center"}}><div style={{fontSize:44,marginBottom:8}}>🎉</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,marginBottom:4}}>Completato in {moves} mosse!</div><div style={{fontSize:13,color:T.faint,marginBottom:16}}>+{game.cp} punti · sfidate il partner a fare meglio</div><Btn T={T} grad={grad} onClick={onBack}>Concludi</Btn></div>}
  </div>);
}

// ════════ DRAWING GAME ════════
function DrawGame({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [phase,setPhase]=useState("intro"); // intro | draw | guess | done
  const [word,setWord]=useState("");
  const [paths,setPaths]=useState([]);
  const [cur,setCur]=useState(null);
  const [guess,setGuess]=useState("");
  const [result,setResult]=useState(null);
  const [color,setColor]=useState(T.a1);
  const svgRef=useRef(null);
  const colors=[T.a1,T.a2,T.a3,T.a4,T.a5,T.text];

  function startRound(){const w=DRAW_WORDS[Math.floor(Math.random()*DRAW_WORDS.length)];setWord(w);setPaths([]);setPhase("draw");}
  function pt(e){const r=svgRef.current.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:((t.clientX-r.left)/r.width)*300,y:((t.clientY-r.top)/r.height)*300};}
  function down(e){e.preventDefault();const p=pt(e);setCur({color,d:`M${p.x},${p.y}`});}
  function move(e){if(!cur)return;e.preventDefault();const p=pt(e);setCur(c=>({...c,d:c.d+` L${p.x},${p.y}`}));}
  function up(){if(cur){setPaths(ps=>[...ps,cur]);setCur(null);}}
  function checkGuess(){const ok=guess.toLowerCase().trim()===word.toLowerCase().trim();setResult(ok);if(ok){setCp(p=>p+game.cp);}}

  if(phase==="intro") return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>📱 A distanza</span></div>
    <div style={{textAlign:"center",padding:"40px 0"}}>
      <div style={{fontSize:60,marginBottom:18}}>🎨</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Disegna & Indovina</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Uno di voi riceve una parola segreta e la disegna. L'altro indovina! Perfetto in videochiamata o passandovi il telefono.</div>
    </div>
    <Btn T={T} grad={grad} onClick={startRound}>Inizia a disegnare ✏️</Btn>
  </div>);

  if(phase==="draw") return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span><span style={{fontSize:13,color:T.faint}}>Disegnatore</span></div>
    <div style={{textAlign:"center",marginBottom:12}}>
      <div style={{fontSize:12,color:T.sub}}>La tua parola segreta:</div>
      <div style={{fontSize:24,fontWeight:800,color:T.a1}}>{word}</div>
    </div>
    <svg ref={svgRef} viewBox="0 0 300 300" onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up}
      style={{width:"100%",aspectRatio:"1",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,border:`1px solid ${T.line2}`,touchAction:"none",cursor:"crosshair"}}>
      {paths.map((p,i)=><path key={i} d={p.d} stroke={p.color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
      {cur&&<path d={cur.d} stroke={cur.color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
    {/* Color palette */}
    <div style={{display:"flex",gap:10,justifyContent:"center",margin:"14px 0"}}>
      {colors.map((c,i)=>(<div key={i} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,cursor:"pointer",border:color===c?`3px solid ${T.text}`:`2px solid ${T.line}`,boxSizing:"border-box"}}/>))}
      <div onClick={()=>setPaths([])} style={{width:32,height:32,borderRadius:"50%",background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,border:`1px solid ${T.line2}`}}>🗑️</div>
    </div>
    <Btn T={T} grad={grad} onClick={()=>setPhase("guess")}>Ho finito → tocca all'altro 👀</Btn>
  </div>);

  if(phase==="guess") return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span><span style={{fontSize:13,color:T.faint}}>Chi indovina</span></div>
    <div style={{textAlign:"center",fontSize:14,color:T.sub,marginBottom:12}}>Cosa ha disegnato il tuo partner?</div>
    <svg viewBox="0 0 300 300" style={{width:"100%",aspectRatio:"1",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,border:`1px solid ${T.line2}`}}>
      {paths.map((p,i)=><path key={i} d={p.d} stroke={p.color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
    </svg>
    {result===null?<div style={{marginTop:16}}>
      <input value={guess} onChange={e=>setGuess(e.target.value)} placeholder="La tua ipotesi..." style={{width:"100%",background:T.surface2,border:`1px solid ${T.line2}`,borderRadius:14,padding:"15px 16px",fontSize:15,outline:"none",color:T.text,marginBottom:12,boxSizing:"border-box"}}/>
      <Btn T={T} grad={grad} disabled={!guess.trim()} onClick={checkGuess}>Indovina!</Btn>
    </div>:<div style={{marginTop:16}}>
      <div style={{borderRadius:18,padding:22,textAlign:"center",marginBottom:14,background:result?G.a4:G.a3,color:"#fff"}}>
        <div style={{fontSize:40}}>{result?"🎯":"😅"}</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,marginTop:8}}>{result?"Indovinato!":"Non proprio!"}</div>
        <div style={{fontSize:14,marginTop:6,opacity:0.95}}>Era: <b>{word}</b></div>
      </div>
      <Btn T={T} grad={grad} onClick={()=>{setResult(null);setGuess("");setPhase("intro");onToast(result?`+${game.cp} punti 💛`:"Riprovate!");}}>Altro round 🎨</Btn>
      <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:8}}>Concludi</Btn>
    </div>}
  </div>);

  return null;
}

// ════════ CHALLENGE HELPERS ════════
async function createChallenge(coupleId,userId,gameId,score,label){
  try{await supabase.from("challenges").insert({couple_id:coupleId,from_user:userId,game_id:gameId,score,score_label:label,status:"pending"});}catch(e){}
}
async function completeChallenge(coupleId,gameId,score){
  try{
    const{data}=await supabase.from("challenges").select("id").eq("couple_id",coupleId).eq("game_id",gameId).eq("status","pending").single();
    if(data)await supabase.from("challenges").update({partner_score:score,status:"done"}).eq("id",data.id);
  }catch(e){}
}

// ════════ WIN PARTICLES ════════
function WinParticles(){
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"}}>
    <style>{`@keyframes hfall{0%{transform:translateY(-20px) rotate(var(--rot)) scale(0.5);opacity:1}100%{transform:translateY(120vh) rotate(calc(var(--rot) + 720deg)) scale(1);opacity:0}}`}</style>
    {Array.from({length:16}).map((_,i)=>(
      <div key={i} style={{position:"absolute",left:`${5+i*6}%`,top:"-20px",fontSize:"min(6vw,28px)",animation:`hfall ${1.8+Math.random()*1.2}s ease-in ${i*0.12}s forwards`,"--rot":`${Math.floor(Math.random()*360)}deg`}}>❤️</div>
    ))}
  </div>);
}

// ════════ SLINGSHOT — fionda & bicchieri ════════
function Slingshot({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [phase,setPhase]=useState("intro"); // intro | play | done
  const [score,setScore]=useState(0);
  const [time,setTime]=useState(30);
  const [ball,setBall]=useState(null); // flying ball {x,y,vx,vy}
  const [drag,setDrag]=useState(null); // current aim
  const [cups,setCups]=useState([]);
  const svgRef=useRef(null);
  const rafRef=useRef(null);
  const ANCHOR={x:150,y:340};

  function makeCups(){const arr=[];for(let i=0;i<5;i++){arr.push({id:Math.random(),x:40+Math.random()*220,y:40+Math.random()*160,hit:false});}return arr;}
  function start(){setScore(0);setTime(30);setCups(makeCups());setPhase("play");}

  // countdown
  useEffect(()=>{
    if(phase!=="play")return;
    if(time<=0){setPhase("done");if(score>0)setCp(p=>p+game.cp);return;}
    const t=setTimeout(()=>setTime(v=>v-1),1000);
    return()=>clearTimeout(t);
  },[phase,time]);

  function pt(e){const r=svgRef.current.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:((t.clientX-r.left)/r.width)*300,y:((t.clientY-r.top)/r.height)*400};}
  function down(e){if(ball)return;e.preventDefault();setDrag(pt(e));}
  function move(e){if(!drag||ball)return;e.preventDefault();setDrag(pt(e));}
  function release(){
    if(!drag||ball){setDrag(null);return;}
    const vx=(ANCHOR.x-drag.x)*0.12, vy=(ANCHOR.y-drag.y)*0.12;
    setBall({x:ANCHOR.x,y:ANCHOR.y,vx,vy});setDrag(null);
  }
  // animate ball
  useEffect(()=>{
    if(!ball)return;
    rafRef.current=requestAnimationFrame(()=>{
      setBall(b=>{
        if(!b)return null;
        let nx=b.x+b.vx, ny=b.y+b.vy, nvy=b.vy+0.25;
        // collisions
        setCups(cs=>cs.map(c=>{if(!c.hit&&Math.abs(c.x-nx)<24&&Math.abs(c.y-ny)<24){setScore(s=>s+1);return{...c,hit:true};}return c;}));
        if(nx<0||nx>300||ny>400){return null;} // off screen
        return{x:nx,y:ny,vx:b.vx,vy:nvy};
      });
    });
    return()=>cancelAnimationFrame(rafRef.current);
  },[ball]);
  // respawn cups when all hit
  useEffect(()=>{if(phase==="play"&&cups.length>0&&cups.every(c=>c.hit)){setCups(makeCups());}},[cups,phase]);

  if(phase==="intro") return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}>
      <div style={{fontSize:60,marginBottom:18}}>🎯</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Fionda & Bicchieri</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Tira indietro la pallina come una fionda e lasciala andare. Colpisci più bicchieri possibile in 30 secondi! Sfidate a turno il punteggio più alto.</div>
    </div>
    <Btn T={T} grad={grad} onClick={start}>Inizia · 30 secondi ⏱</Btn>
  </div>);

  if(phase==="done") return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    <div style={{fontSize:60,marginBottom:16}}>🏆</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Tempo scaduto!</div>
    <div style={{fontSize:40,fontWeight:800,color:T.a3,marginBottom:6}}>{score}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>bicchieri colpiti</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>{score>0?`+${game.cp} punti! Ora tocca al partner battervi 😏`:"Riprovate, potete fare meglio!"}</div>
    <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div style={{display:"flex",gap:14}}><span style={{fontSize:14,fontWeight:800,color:T.a3}}>🎯 {score}</span><span style={{fontSize:14,fontWeight:800,color:time<=5?T.a1:T.text}}>⏱ {time}s</span></div>
    </div>
    <svg ref={svgRef} viewBox="0 0 300 400" onMouseDown={down} onMouseMove={move} onMouseUp={release} onMouseLeave={release} onTouchStart={down} onTouchMove={move} onTouchEnd={release}
      style={{width:"100%",aspectRatio:"3/4",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,border:`1px solid ${T.line2}`,touchAction:"none",cursor:"crosshair"}}>
      {/* cups */}
      {cups.map(c=>(<g key={c.id} opacity={c.hit?0.25:1}><rect x={c.x-16} y={c.y-16} width={32} height={32} rx={5} fill={c.hit?T.faint:T.a4}/><text x={c.x} y={c.y+6} fontSize={18} textAnchor="middle">{c.hit?"💥":"🥤"}</text></g>))}
      {/* slingshot anchor */}
      <circle cx={ANCHOR.x} cy={ANCHOR.y} r={6} fill={T.a2}/>
      {/* aim line */}
      {drag&&!ball&&<line x1={ANCHOR.x} y1={ANCHOR.y} x2={drag.x} y2={drag.y} stroke={T.a1} strokeWidth={3} strokeDasharray="5,5"/>}
      {/* ball */}
      {ball?<circle cx={ball.x} cy={ball.y} r={10} fill={T.a1}/>:<circle cx={drag?drag.x:ANCHOR.x} cy={drag?drag.y:ANCHOR.y} r={10} fill={T.a1}/>}
    </svg>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:10}}>Trascina la pallina e rilascia per lanciare 🎯</div>
  </div>);
}

// ════════ REFLEX — tocca al momento giusto ════════
function Reflex({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [phase,setPhase]=useState("intro"); // intro|wait|now|result|done
  const [msg,setMsg]=useState("");
  const [rt,setRt]=useState(0);
  const [round,setRound]=useState(0);
  const [best,setBest]=useState(null);
  const startRef=useRef(0);const toRef=useRef(null);

  function begin(){setPhase("wait");setMsg("Aspetta il verde...");toRef.current=setTimeout(()=>{startRef.current=Date.now();setPhase("now");},1200+Math.random()*2500);}
  function tap(){
    if(phase==="wait"){clearTimeout(toRef.current);setMsg("Troppo presto! 😅");setPhase("result");return;}
    if(phase==="now"){const ms=Date.now()-startRef.current;setRt(ms);setBest(b=>b===null?ms:Math.min(b,ms));setMsg(`${ms} ms`);setPhase("result");}
  }
  function next(){if(round>=2){if(best!==null)setCp(p=>p+game.cp);setPhase("done");}else{setRound(r=>r+1);begin();}}

  if(phase==="intro") return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:60,marginBottom:18}}>⚡</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Riflessi di Coppia</div><div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Quando lo schermo diventa verde, tocca il più velocemente possibile. Chi ha i riflessi migliori della coppia?</div></div>
    <Btn T={T} grad={grad} onClick={()=>{setRound(0);begin();}}>Inizia</Btn>
  </div>);

  if(phase==="done") return(<div style={{padding:24,textAlign:"center",paddingTop:80}}>
    <div style={{fontSize:60,marginBottom:16}}>⚡</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Miglior tempo</div>
    <div style={{fontSize:40,fontWeight:800,color:T.a4,marginBottom:8}}>{best} ms</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>+{game.cp} punti! Passa il telefono e sfida il partner 😏</div>
    <Btn T={T} grad={grad} onClick={()=>{setRound(0);setBest(null);begin();}}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  const bg=phase==="now"?G.a4:phase==="wait"?G.a1:T.surface;
  const col=phase==="now"||phase==="wait"?"#fff":T.text;
  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span><span style={{fontSize:13,color:T.faint}}>Round {round+1}/3</span></div>
    <div onClick={tap} style={{borderRadius:24,background:bg,minHeight:320,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${T.line}`,color:col,textAlign:"center",padding:20}}>
      {phase==="now"?<><div style={{fontSize:64}}>👆</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginTop:10}}>TOCCA ORA!</div></>
       :phase==="wait"?<div style={{fontSize:20,fontWeight:700}}>{msg}</div>
       :<><div style={{fontSize:40,fontWeight:800}}>{msg}</div><div style={{fontSize:14,color:T.sub,marginTop:8}}>{rt>0&&rt<300?"Riflessi felini! 🐆":rt>0?"Niente male!":""}</div></>}
    </div>
    {phase==="result"&&<Btn T={T} grad={grad} onClick={next} style={{marginTop:16}}>{round>=2?"Vedi risultato":"Prossimo round →"}</Btn>}
  </div>);
}

// ════════ PACMAN — mangia-frutta (improved 9x9 with walls & ghost) ════════
const PAC_MAZE=[
  [0,1,0,0,0,1,0,0,0],
  [0,1,0,1,0,1,0,1,0],
  [0,0,0,1,0,0,0,1,0],
  [0,1,0,0,0,1,0,0,0],
  [0,1,1,1,0,1,1,1,0],
  [0,0,0,1,0,0,0,0,0],
  [0,1,0,1,0,1,1,1,0],
  [0,1,0,0,0,0,0,1,0],
  [0,0,0,1,0,1,0,0,0],
];
function Pacman({game,onBack,setCp,onToast,T,G}){
  const N=9,CELL=36;
  const MAZE_W=N*CELL,MAZE_H=N*CELL,HUD=44;
  const CW=MAZE_W,CH=MAZE_H+HUD;
  const FRUITS=["🍎","🍓","🍒","🍇","🍊","🍑","🍌","🍉","🫐","🍋"];
  const canvasRef=useRef(null);
  const stRef=useRef(null);
  const rafRef=useRef(null);
  const touchRef=useRef(null);
  const [phase,setPhase]=useState("intro");
  const [dispEaten,setDispEaten]=useState(0);
  const [dispTime,setDispTime]=useState("0.0");
  const finalRef=useRef({eaten:0,time:0});

  function iW(x,y){if(x<0||x>=N||y<0||y>=N)return true;return PAC_MAZE[y][x]===1;}

  function seedF(){
    const cells=[];
    for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!iW(x,y)&&!(x===0&&y===0)&&!(x===8&&y===8))cells.push({x,y});
    cells.sort(()=>Math.random()-0.5);
    return cells.slice(0,12).map((c,i)=>({...c,e:FRUITS[i%FRUITS.length],id:i}));
  }

  function gMove(g,pac){
    const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>!iW(g.x+dx,g.y+dy)).map(([dx,dy])=>({x:g.x+dx,y:g.y+dy}));
    if(!opts.length)return g;
    if(Math.random()<0.72)opts.sort((a,b)=>(Math.abs(a.x-pac.x)+Math.abs(a.y-pac.y))-(Math.abs(b.x-pac.x)+Math.abs(b.y-pac.y)));
    return opts[0];
  }

  function makeSt(){return{pac:{x:0,y:0,dir:"right",nd:"right"},
    g1:{x:8,y:8},g2:{x:4,y:4},
    fruits:seedF(),eaten:0,time:0,fr:0,
    pt:0,gt:0,g2t:0,parts:[]};}

  function drawScene(ctx,st){
    ctx.fillStyle=T.bg||'#0d0a1a';ctx.fillRect(0,0,CW,CH);
    // Walls
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const px=x*CELL,py=y*CELL+HUD;
      if(iW(x,y)){
        const wg=ctx.createLinearGradient(px,py,px+CELL,py+CELL);
        wg.addColorStop(0,T.a2+'cc');wg.addColorStop(1,T.a2+'88');
        ctx.shadowColor=T.a2;ctx.shadowBlur=6;
        ctx.fillStyle=wg;ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
        ctx.shadowBlur=0;
        ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=0.8;ctx.strokeRect(px+2,py+2,CELL-4,CELL-4);
      } else {
        ctx.fillStyle='rgba(255,255,255,0.025)';ctx.beginPath();ctx.arc(px+CELL/2,py+CELL/2,1.8,0,Math.PI*2);ctx.fill();
      }
    }
    // Fruits
    ctx.textAlign='center';ctx.textBaseline='middle';
    st.fruits.forEach(f=>{
      const px=f.x*CELL+CELL/2,py=f.y*CELL+CELL/2+HUD;
      const pulse=Math.sin(st.fr*0.1+f.id)*1.5;
      ctx.shadowColor=T.a3;ctx.shadowBlur=8+pulse;
      ctx.font=`${CELL*0.62}px serif`;ctx.fillText(f.e,px,py+1);ctx.shadowBlur=0;
    });
    // Particles
    st.parts.forEach(p=>{const a=p.l/p.ml;ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s*a,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
    // Ghost 1
    function drawG(gx,gy,col){
      const px=gx*CELL+CELL/2,py=gy*CELL+CELL/2+HUD,r=CELL/2-3;
      ctx.shadowColor=col;ctx.shadowBlur=14;ctx.fillStyle=col;
      ctx.beginPath();ctx.arc(px,py-r*0.15,r,Math.PI,0);
      const by2=py+r*0.85;
      ctx.lineTo(px+r,by2);
      const ww2=r*2/3;
      for(let i=3;i>=0;i--){ctx.lineTo(px-r+i*ww2,by2+(i%2===0?0:r*0.35));}
      ctx.closePath();ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(px-r*0.3,py-r*0.2,r*0.28,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(px+r*0.3,py-r*0.2,r*0.28,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#1155ff';ctx.beginPath();ctx.arc(px-r*0.3+Math.sin(st.fr*0.08)*2,py-r*0.17,r*0.13,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(px+r*0.3+Math.sin(st.fr*0.08)*2,py-r*0.17,r*0.13,0,Math.PI*2);ctx.fill();
    }
    drawG(st.g1.x,st.g1.y,T.a1||'#ff4daa');
    drawG(st.g2.x,st.g2.y,T.a4||'#9D6BFF');
    // Pacman
    const b=st.pac,px2=b.x*CELL+CELL/2,py2=b.y*CELL+CELL/2+HUD;
    const mouth=0.22*Math.abs(Math.sin(st.fr*0.18));
    const rot2={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[b.dir];
    ctx.save();ctx.translate(px2,py2);ctx.rotate(rot2);
    ctx.shadowColor='#FFD700';ctx.shadowBlur=20;ctx.fillStyle='#FFD700';
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,CELL/2-3,mouth*Math.PI,(2-mouth)*Math.PI);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.restore();
    // HUD bar
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,CW,HUD);
    ctx.fillStyle='#fff';ctx.font='bold 15px Sora,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(`🍎 ${st.eaten}/12`,8,HUD/2);
    ctx.textAlign='right';ctx.fillText(`⏱ ${st.time.toFixed(1)}s`,CW-8,HUD/2);
    // Maze border glow
    ctx.strokeStyle=T.a2;ctx.lineWidth=2;ctx.shadowColor=T.a2;ctx.shadowBlur=10;
    ctx.strokeRect(0,HUD,CW,MAZE_H);ctx.shadowBlur=0;
  }

  useEffect(()=>{
    if(phase!=='play')return;
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');
    const st=makeSt();stRef.current=st;
    const MV={right:{x:1,y:0},left:{x:-1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
    const PAC_F=13,G1_F=33,G2_F=43;

    function end(dead){
      cancelAnimationFrame(rafRef.current);
      finalRef.current={eaten:st.eaten,time:st.time};
      if(!dead)setCp(p=>p+game.cp);
      drawScene(ctx,st);setPhase(dead?'over':'done');
    }

    function tick(){
      st.fr++;st.time+=1/60;
      const ts=st.time.toFixed(1);setDispTime(ts);
      // Pacman move
      st.pt++;if(st.pt>=PAC_F){st.pt=0;
        const tryDir=(d)=>{const {x:dx,y:dy}=MV[d]||{x:0,y:0};return!iW(st.pac.x+dx,st.pac.y+dy)?d:null;};
        const ok=tryDir(st.pac.nd);
        if(ok){const {x:dx,y:dy}=MV[ok];st.pac.x+=dx;st.pac.y+=dy;st.pac.dir=ok;}
        else{const ok2=tryDir(st.pac.dir);if(ok2){const {x:dx,y:dy}=MV[ok2];st.pac.x+=dx;st.pac.y+=dy;}}
      }
      // Ghost moves
      st.gt++;if(st.gt>=G1_F){st.gt=0;const ng=gMove(st.g1,st.pac);st.g1.x=ng.x;st.g1.y=ng.y;}
      st.g2t++;if(st.g2t>=G2_F){st.g2t=0;const ng=gMove(st.g2,st.pac);st.g2.x=ng.x;st.g2.y=ng.y;}
      // Eat
      const hf=st.fruits.find(f=>f.x===st.pac.x&&f.y===st.pac.y);
      if(hf){
        st.fruits=st.fruits.filter(f=>f.id!==hf.id);st.eaten++;setDispEaten(st.eaten);
        const fpx=hf.x*CELL+CELL/2,fpy=hf.y*CELL+CELL/2+HUD;
        for(let i=0;i<10;i++)st.parts.push({x:fpx,y:fpy,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5-2,l:22,ml:22,c:T.a3||'#c77dff',s:4});
        if(!st.fruits.length){end(false);return;}
      }
      // Ghost hit
      if((st.g1.x===st.pac.x&&st.g1.y===st.pac.y)||(st.g2.x===st.pac.x&&st.g2.y===st.pac.y)){end(true);return;}
      st.parts=st.parts.filter(p=>p.l>0);st.parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.l--;});
      drawScene(ctx,st);
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  function setD(d){const st=stRef.current;if(!st)return;st.pac.nd=d;}
  function onSwS(e){const t=e.touches[0];touchRef.current={x:t.clientX,y:t.clientY};}
  function onSwE(e){if(!touchRef.current)return;const t=e.changedTouches[0];const dx=t.clientX-touchRef.current.x,dy=t.clientY-touchRef.current.y;touchRef.current=null;if(Math.abs(dx)<20&&Math.abs(dy)<20)return;setD(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));}
  const csw=Math.min((typeof window!=='undefined'?window.innerWidth:320)-24,360);
  const csh=Math.round(csw*(CH/CW));

  if(phase==='intro')return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"24px 0"}}>
      <div style={{fontSize:64,marginBottom:16}}>🟡</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Mangia-Frutta</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Guida Pac-Man nel labirinto Canvas! Mangia 12 frutti e sfuggi ai 2 fantasmi. <b style={{color:T.text}}>Chi è più veloce vince!</b></div>
    </div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Inizia 🟡</Btn>
  </div>);

  if(phase==='done')return(<div style={{padding:24,textAlign:"center",paddingTop:60}}>
    <WinParticles/>
    <div style={{fontSize:56,marginBottom:12}}>🏆</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Tutto mangiato!</div>
    <div style={{fontSize:52,fontWeight:900,color:T.a3,marginBottom:2}}>{finalRef.current.time.toFixed(1)}s</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>il tuo tempo</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:28}}>+{game.cp} punti coppia 💞 · ora tocca al partner!</div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  if(phase==='over')return(<div style={{padding:24,textAlign:"center",paddingTop:60}}>
    <div style={{fontSize:56,marginBottom:12}}>👻</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Preso dal fantasma!</div>
    <div style={{fontSize:52,fontWeight:900,color:T.a1,marginBottom:2}}>{finalRef.current.eaten}/12</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>frutti mangiati</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:28}}>Riprova! 💪</div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:"12px 12px 90px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <span style={{fontSize:14,fontWeight:800,color:T.a3}}>🍎 {dispEaten}/12 · ⏱ {dispTime}s</span>
    </div>
    <div style={{display:"flex",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={CW} height={CH}
        style={{width:csw,height:csh,borderRadius:16,border:`2px solid ${T.line2}`,display:"block",touchAction:"none",boxShadow:`0 0 40px ${T.a2}22,0 8px 32px rgba(0,0,0,0.4)`}}
        onTouchStart={onSwS} onTouchEnd={onSwE}/>
    </div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:14,gap:8}}>
      <DBtn T={T} grad={G[game.g]} on={()=>setD('up')}>▲</DBtn>
      <div style={{display:"flex",gap:48}}>
        <DBtn T={T} grad={G[game.g]} on={()=>setD('left')}>◀</DBtn>
        <DBtn T={T} grad={G[game.g]} on={()=>setD('down')}>▼</DBtn>
        <DBtn T={T} grad={G[game.g]} on={()=>setD('right')}>▶</DBtn>
      </div>
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:8}}>Swipe o D-pad · evita i 2 fantasmi! 👻</div>
  </div>);
}
function DBtn({children,on,T,grad}){
  return <button onClick={on} style={{width:56,height:56,borderRadius:16,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,fontSize:20,fontWeight:800,color:T.text,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>;
}

// ════════ CATCH — cuori in caduta (improved) ════════
function CatchGame({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [phase,setPhase]=useState("intro");
  const [items,setItems]=useState([]);
  const [bx,setBx]=useState(50);
  const [score,setScore]=useState(0);
  const [lives,setLives]=useState(3);
  const [time,setTime]=useState(60);
  const livesRef=useRef(3);
  const areaRef=useRef(null);

  // timer
  useEffect(()=>{
    if(phase!=="play")return;
    if(time<=0){setPhase("done");if(score>0)setCp(p=>p+game.cp);return;}
    const t=setTimeout(()=>setTime(v=>v-1),1000);return()=>clearTimeout(t);
  },[phase,time]);

  // spawn items — speed increases with time elapsed
  useEffect(()=>{
    if(phase!=="play")return;
    const elapsed=60-time;
    const spawnMs=Math.max(800,1800-elapsed*16);
    const sp=setInterval(()=>{
      const isBomb=Math.random()<0.2;
      setItems(it=>[...it,{id:Math.random(),x:6+Math.random()*88,y:0,isBomb,e:isBomb?"💣":["💝","💖","💕","💗"][Math.floor(Math.random()*4)]}]);
    },spawnMs);
    return()=>clearInterval(sp);
  },[phase,time]);

  // move items
  useEffect(()=>{
    if(phase!=="play")return;
    const mv=setInterval(()=>{
      setItems(it=>it.map(o=>({...o,y:o.y+3.5})).filter(o=>{
        if(o.y>=85&&o.y<=99&&Math.abs(o.x-bx)<18){
          if(o.isBomb){
            const nl=livesRef.current-1;
            livesRef.current=nl;
            setLives(nl);
            onToast("💣 -1 vita!");
            if(nl<=0){setPhase("done");if(score>0)setCp(p=>p+game.cp);}
          } else {
            setScore(s=>s+1);
          }
          return false;
        }
        return o.y<102;
      }));
    },50);return()=>clearInterval(mv);
  },[phase,bx,score]);

  function move(e){
    if(!areaRef.current)return;
    const r=areaRef.current.getBoundingClientRect();
    const t=e.touches?e.touches[0]:e;
    setBx(Math.max(8,Math.min(92,((t.clientX-r.left)/r.width)*100)));
  }
  function start(){
    setScore(0);setTime(60);setItems([]);setBx(50);
    livesRef.current=3;setLives(3);setPhase("play");
  }

  if(phase==="intro")return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}>
      <div style={{fontSize:60,marginBottom:18}}>💝</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Cuori in Caduta</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Muovi il cestino e prendi i cuori che cadono. Hai 3 vite — le bombe 💣 le tolgono! I cuori cadono sempre più veloci. <b style={{color:T.text}}>Sfidate il punteggio più alto!</b></div>
    </div>
    <Btn T={T} grad={grad} onClick={start}>Inizia · 60s</Btn>
  </div>);

  if(phase==="done")return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    {score>8&&<WinParticles/>}
    <div style={{fontSize:60,marginBottom:16}}>💖</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>{lives<=0?"Vite esaurite!":"Tempo scaduto!"}</div>
    <div style={{fontSize:40,fontWeight:800,color:T.a1,marginBottom:6}}>{score}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>cuori presi</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>{score>0?`+${game.cp} punti! Tocca al partner 😏`:"Riprovate!"}</div>
    <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:14,fontWeight:800,color:T.a1}}>💝 {score}</span>
        <span style={{fontSize:14}}>{Array.from({length:lives}).map((_,i)=>"❤️").join("")}{Array.from({length:3-lives}).map((_,i)=>"🖤").join("")}</span>
        <span style={{fontSize:14,fontWeight:800,color:time<=10?T.a1:T.text}}>⏱ {time}s</span>
      </div>
    </div>
    <div ref={areaRef} onMouseMove={move} onTouchMove={move}
      style={{position:"relative",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,border:`1px solid ${T.line2}`,height:380,overflow:"hidden",touchAction:"none",cursor:"pointer"}}>
      {items.map(o=>(<div key={o.id} style={{position:"absolute",left:`${o.x}%`,top:`${o.y}%`,fontSize:28,transform:"translate(-50%,-50%)"}}>{o.e}</div>))}
      <div style={{position:"absolute",left:`${bx}%`,bottom:4,fontSize:40,transform:"translateX(-50%)",filter:`drop-shadow(0 2px 6px ${T.a1}88)`}}>🧺</div>
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:10}}>Muovi il dito · evita le 💣 · 3 vite</div>
  </div>);
}

// ════════ TAP — tap frenesia ════════
// ════════ REACTION BATTLE — Canvas target game ════════
function ReactionBattle({game,onBack,setCp,onToast,T,G}){
  const CW=300,CH=440;
  const canvasRef=useRef(null);
  const stRef=useRef(null);
  const rafRef=useRef(null);
  const [phase,setPhase]=useState("intro");
  const [displayScore,setDisplayScore]=useState(0);
  const [displayTime,setDisplayTime]=useState(25);
  const [isNewBest,setIsNewBest]=useState(false);
  const finalRef=useRef(0);

  function makeTarget(fr){
    const r=26+Math.random()*18;
    return{x:r+Math.random()*(CW-r*2),y:60+r+Math.random()*(CH-120-r*2),r,life:0,maxLife:100-Math.min(fr*0.4,55),color:[T.a1,T.a2,T.a3][Math.floor(Math.random()*3)],scale:0,hit:false,hitLife:0};
  }

  function drawScene(ctx,st){
    ctx.fillStyle=T.bg||'#0d0a1a';ctx.fillRect(0,0,CW,CH);
    // Stars bg
    ctx.fillStyle='rgba(255,255,255,0.04)';
    for(let i=0;i<30;i++){ctx.beginPath();ctx.arc((i*47)%CW,(i*31+20)%CH,1,0,Math.PI*2);ctx.fill();}
    // Targets
    st.targets.forEach(tg=>{
      if(tg.hit){
        const a=tg.hitLife/20;ctx.globalAlpha=a;
        for(let i=0;i<6;i++){ctx.fillStyle=tg.color;ctx.shadowColor=tg.color;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(tg.x+Math.cos(i*Math.PI/3)*tg.r*tg.hitLife/10,tg.y+Math.sin(i*Math.PI/3)*tg.r*tg.hitLife/10,5*(1-a),0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=1;ctx.shadowBlur=0;return;
      }
      const sc=Math.min(1,tg.scale);const a=Math.min(1,tg.life/10);
      // shrinking warning ring
      const shrink=1-tg.life/tg.maxLife;
      ctx.strokeStyle=tg.color;ctx.lineWidth=3;ctx.globalAlpha=0.35*a;ctx.shadowColor=tg.color;ctx.shadowBlur=12;
      ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r*(1+shrink*0.6),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.shadowBlur=0;
      // main circle
      ctx.shadowColor=tg.color;ctx.shadowBlur=22;ctx.fillStyle=tg.color;ctx.globalAlpha=a;
      ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r*sc,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.35*a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(tg.x-tg.r*0.25*sc,tg.y-tg.r*0.28*sc,tg.r*0.32*sc,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;ctx.shadowBlur=0;
      // heart
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${tg.r*0.9}px serif`;ctx.fillText('💕',tg.x,tg.y+2);
    });
    // HUD
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,CW,48);
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 18px Sora,sans-serif';
    ctx.fillText(`💕 ${st.score}`,CW/2,24);
    // Timer bar
    const tp=st.timeLeft/25;const tc=tp>0.5?T.a3:tp>0.25?T.a5||'#FFD700':'#ff4444';
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(12,36,CW-24,6,3);else ctx.rect(12,36,CW-24,6);ctx.fill();
    ctx.shadowColor=tc;ctx.shadowBlur=8;ctx.fillStyle=tc;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(12,36,(CW-24)*tp,6,3);else ctx.rect(12,36,(CW-24)*tp,6);ctx.fill();ctx.shadowBlur=0;
    // Floating texts
    st.floats.forEach(f=>{const a=f.l/f.ml;ctx.globalAlpha=a;ctx.fillStyle=f.c||T.a1;ctx.font=`800 ${f.sz||20}px Sora,sans-serif`;ctx.textAlign='center';ctx.fillText(f.t,f.x,f.y);ctx.globalAlpha=1;});
  }

  useEffect(()=>{
    if(phase!=='play')return;
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');
    const st={targets:[],score:0,fr:0,timeLeft:25,nextTarget:0,floats:[]};stRef.current=st;
    st.targets.push(makeTarget(0));

    function tick(){
      st.fr++;st.timeLeft=Math.max(0,25-st.fr/60);
      setDisplayTime(Math.ceil(st.timeLeft));
      if(st.timeLeft<=0){
        cancelAnimationFrame(rafRef.current);
        finalRef.current=st.score;
        const bst=parseInt(localStorage.getItem('bly_react_best')||'0');
        if(st.score>bst){localStorage.setItem('bly_react_best',String(st.score));setIsNewBest(true);}
        if(st.score>0)setCp(p=>p+game.cp);
        drawScene(ctx,st);setPhase('over');return;
      }
      // update targets
      st.targets=st.targets.filter(t=>t.hit?t.hitLife>0:t.life<t.maxLife);
      st.targets.forEach(t=>{if(!t.hit){t.life++;t.scale=Math.min(1,t.life/8);}else t.hitLife--;});
      // spawn new targets
      const active=st.targets.filter(t=>!t.hit);
      if(active.length<Math.min(3,1+Math.floor(st.fr/180))){st.targets.push(makeTarget(st.fr));}
      // floats
      st.floats=st.floats.filter(f=>f.l>0);st.floats.forEach(f=>{f.y+=f.vy;f.l--;});
      drawScene(ctx,st);
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  function handleTap(e){
    const st=stRef.current;if(!st)return;
    const cv=canvasRef.current;if(!cv)return;
    const rect=cv.getBoundingClientRect();
    const scaleX=CW/rect.width,scaleY=CH/rect.height;
    const touches=e.changedTouches||[e.nativeEvent||e];
    const pts=[...touches].map(t=>({x:(t.clientX-rect.left)*scaleX,y:(t.clientY-rect.top)*scaleY}));
    let hit=false;
    pts.forEach(pt=>{
      st.targets.forEach(tg=>{
        if(!tg.hit&&Math.hypot(pt.x-tg.x,pt.y-tg.y)<tg.r*1.2){
          tg.hit=true;tg.hitLife=20;st.score++;setDisplayScore(st.score);
          st.floats.push({t:'+1',x:tg.x,y:tg.y-10,vy:-1.5,l:35,ml:35,c:'#FFD700',sz:22});
          hit=true;
        }
      });
    });
  }

  const best=parseInt(localStorage.getItem('bly_react_best')||'0');
  const csw=Math.min((typeof window!=='undefined'?window.innerWidth:320)-24,340);
  const csh=Math.round(csw*(CH/CW));

  if(phase==='intro')return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{textAlign:"center",padding:"24px 0"}}>
      <div style={{fontSize:64,marginBottom:16}}>💕</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Reaction Battle</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Tocca tutti i cuori prima che spariscano! Hai 25 secondi. I cuori diventano sempre più veloci. Chi di voi è più reattivo?</div>
      {best>0&&<div style={{marginTop:14,fontSize:13,color:T.a1,fontWeight:700}}>🏆 Record: {best} cuori</div>}
    </div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Inizia! 💕</Btn>
  </div>);

  if(phase==='over')return(<div style={{padding:24,textAlign:"center",paddingTop:60}}>
    {isNewBest&&<WinParticles/>}
    <div style={{fontSize:56,marginBottom:12}}>💕</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Tempo scaduto!</div>
    <div style={{fontSize:52,fontWeight:900,color:T.a1,marginBottom:2}}>{finalRef.current}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>cuori toccati in 25 secondi</div>
    {isNewBest&&<div style={{fontSize:15,fontWeight:800,color:T.a3,marginBottom:8}}>🏆 NUOVO RECORD!</div>}
    <div style={{fontSize:13,color:T.faint,marginBottom:4}}>Best: {Math.max(best,finalRef.current)}</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:28}}>{finalRef.current>0?`+${game.cp} punti coppia 💞`:"Riprova!"}</div>
    <Btn T={T} grad={G[game.g]} onClick={()=>{setIsNewBest(false);setPhase('play');}}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:"12px 12px 90px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <span style={{fontSize:16,fontWeight:800,color:T.a1}}>💕 {displayScore} · ⏱ {displayTime}s</span>
    </div>
    <div style={{display:"flex",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={CW} height={CH}
        style={{width:csw,height:csh,borderRadius:20,border:`2px solid ${T.line2}`,display:"block",touchAction:"none",boxShadow:`0 0 40px ${T.a1}22,0 8px 32px rgba(0,0,0,0.4)`}}
        onPointerDown={handleTap} onTouchStart={e=>{e.preventDefault();handleTap(e);}}/>
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:10}}>Tocca i cuori prima che spariscano! 💕</div>
  </div>);
}

function TapGame({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [phase,setPhase]=useState("intro");
  const [targets,setTargets]=useState([]);
  const [score,setScore]=useState(0);
  const [time,setTime]=useState(20);

  useEffect(()=>{if(phase!=="play")return;if(time<=0){setPhase("done");if(score>0)setCp(p=>p+game.cp);return;}const t=setTimeout(()=>setTime(v=>v-1),1000);return()=>clearTimeout(t);},[phase,time]);
  useEffect(()=>{if(phase!=="play")return;const sp=setInterval(()=>{setTargets(ts=>[...ts.slice(-5),{id:Math.random(),x:8+Math.random()*78,y:10+Math.random()*70,bad:Math.random()<0.25}]);},620);return()=>clearInterval(sp);},[phase]);
  useEffect(()=>{if(phase!=="play")return;const cl=setInterval(()=>setTargets(ts=>ts.slice(-4)),900);return()=>clearInterval(cl);},[phase]);

  function tap(t){if(t.bad){setScore(s=>Math.max(0,s-3));onToast("💣 -3!");}else setScore(s=>s+1);setTargets(ts=>ts.filter(x=>x.id!==t.id));}
  function start(){setScore(0);setTime(20);setTargets([]);setPhase("play");}

  if(phase==="intro")return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}><div style={{fontSize:60,marginBottom:18}}>👆</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Tap Frenesia</div><div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Tocca i cuori più veloce che puoi in 20 secondi. Ma evita le bombe 💣 o perdi punti!</div></div>
    <Btn T={T} grad={grad} onClick={start}>Inizia · 20s</Btn>
  </div>);

  if(phase==="done")return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    <div style={{fontSize:60,marginBottom:16}}>⚡</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Finito!</div>
    <div style={{fontSize:40,fontWeight:800,color:T.a4,marginBottom:6}}>{score}</div><div style={{fontSize:14,color:T.sub,marginBottom:8}}>punti</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>{score>0?`+${game.cp} punti! Sfida il partner 😏`:"Riprovate!"}</div>
    <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn><Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div style={{display:"flex",gap:14}}><span style={{fontSize:14,fontWeight:800,color:T.a4}}>👆 {score}</span><span style={{fontSize:14,fontWeight:800,color:time<=3?T.a1:T.text}}>⏱ {time}s</span></div>
    </div>
    <div style={{position:"relative",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,border:`1px solid ${T.line2}`,height:400,overflow:"hidden"}}>
      {targets.map(t=>(<div key={t.id} onClick={()=>tap(t)} style={{position:"absolute",left:`${t.x}%`,top:`${t.y}%`,fontSize:40,cursor:"pointer",userSelect:"none",animation:"pop 0.3s ease-out"}}>{t.bad?"💣":"💝"}</div>))}
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:10}}>Tocca i 💝, evita le 💣</div>
  </div>);
}

// ════════ STACK — torre dei sogni (improved) ════════
function Stack({game,onBack,setCp,onToast,T,G}){
  const CW=300,CH=480,BH=24,MARGIN=30;
  const INNER=CW-MARGIN*2; // inner play area width
  const canvasRef=useRef(null);
  const stRef=useRef(null);
  const rafRef=useRef(null);
  const [phase,setPhase]=useState("intro");
  const [displayScore,setDisplayScore]=useState(0);
  const [isNewBest,setIsNewBest]=useState(false);
  const finalRef=useRef(0);
  const COLORS=[T.a1,T.a2,T.a3,T.a4,T.a5||T.a1];

  function makeSt(){
    return{blocks:[{x:MARGIN+INNER/2-INNER*0.4,w:INNER*0.6}],cur:{x:MARGIN,w:INNER*0.6,dir:1},
      score:0,combo:0,fr:0,flashText:'',flashLife:0,parts:[],floats:[],over:false};
  }

  function rr(ctx,x,y,w,h,r){if(w<=0||h<=0)return;ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}

  function blockY(idx,total){
    const BASE=CH-40;
    const scroll=Math.max(0,(total-12)*BH);
    return BASE-(idx*BH)+scroll;
  }

  function drawScene(ctx,st){
    // Background — night sky
    const bg=ctx.createLinearGradient(0,0,0,CH);
    bg.addColorStop(0,'#040210');bg.addColorStop(0.5,T.bg||'#0d0a1a');bg.addColorStop(1,'#1a0d30');
    ctx.fillStyle=bg;ctx.fillRect(0,0,CW,CH);

    // City silhouette
    ctx.fillStyle='rgba(255,255,255,0.03)';
    [[20,220,40,160],[70,240,30,180],[110,210,50,170],[170,230,40,160],[220,205,60,175],[270,225,25,155]].forEach(([x,y,w,h])=>{
      ctx.fillRect(x,y,w,CH-y);
      // windows
      for(let wy=y+10;wy<CH-20;wy+=16)for(let wx=x+6;wx<x+w-4;wx+=10){
        if(Math.random()<0.35){ctx.fillStyle=`rgba(255,220,100,0.06)`;ctx.fillRect(wx,wy,4,6);}
        ctx.fillStyle='rgba(255,255,255,0.03)';
      }
    });

    // Stars
    ctx.fillStyle='rgba(255,255,255,0.5)';
    for(let i=0;i<30;i++){const blink=(st.fr*0.02+i*0.4)%1;if(blink<0.5){ctx.globalAlpha=blink;ctx.beginPath();ctx.arc(i*10+5,10+i*4%80,0.8,0,Math.PI*2);ctx.fill();}}
    ctx.globalAlpha=1;

    // Tower blocks
    const N=st.blocks.length;
    st.blocks.forEach((b,i)=>{
      const y=blockY(i,N);
      if(y<-BH||y>CH)return;
      const col=COLORS[(i)%COLORS.length];
      // glass gradient
      const bg2=ctx.createLinearGradient(b.x,y,b.x+b.w,y+BH);
      bg2.addColorStop(0,col+'cc');bg2.addColorStop(0.5,col+'ee');bg2.addColorStop(1,col+'88');
      ctx.fillStyle=bg2;rr(ctx,b.x,y,b.w,BH,5);ctx.fill();
      // reflection
      ctx.fillStyle='rgba(255,255,255,0.15)';rr(ctx,b.x+3,y+3,b.w-6,BH/2-2,3);ctx.fill();
      // glow on top block
      if(i===N-1){ctx.shadowColor=col;ctx.shadowBlur=18;ctx.strokeStyle=col;ctx.lineWidth=1.5;rr(ctx,b.x,y,b.w,BH,5);ctx.stroke();ctx.shadowBlur=0;}
    });

    // Moving block — neon glow
    const c=st.cur;const ci=N%COLORS.length;const cc=COLORS[ci];
    const cy=blockY(N,N)-BH-4;
    if(cy>-BH&&cy<CH){
      ctx.shadowColor=cc;ctx.shadowBlur=28;
      const mg=ctx.createLinearGradient(c.x,cy,c.x+c.w,cy+BH);
      mg.addColorStop(0,cc+'bb');mg.addColorStop(0.5,cc);mg.addColorStop(1,cc+'bb');
      ctx.fillStyle=mg;rr(ctx,c.x,cy,c.w,BH,5);ctx.fill();
      ctx.shadowBlur=0;
      // moving glow bar
      ctx.fillStyle='rgba(255,255,255,0.3)';rr(ctx,c.x+2,cy+2,c.w-4,7,3);ctx.fill();
    }

    // Particles
    st.parts.forEach(p=>{const a=p.l/p.ml;ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.shadowColor=p.c;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(0.3+a*0.7),0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=1;ctx.shadowBlur=0;

    // Float texts
    st.floats.forEach(f=>{const a=f.l/f.ml;ctx.globalAlpha=a;ctx.fillStyle=f.c||T.a1;ctx.font=`800 ${f.sz||18}px Sora,sans-serif`;ctx.textAlign='center';ctx.fillText(f.t,f.x,f.y);ctx.globalAlpha=1;});

    // Flash message
    if(st.flashLife>0){const a=Math.min(1,st.flashLife/20);ctx.globalAlpha=a;ctx.fillStyle=T.a1;ctx.font='bold 22px Sora,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.shadowColor=T.a1;ctx.shadowBlur=20;ctx.fillText(st.flashText,CW/2,CH/2-60);ctx.shadowBlur=0;ctx.globalAlpha=1;}

    // Score top
    ctx.fillStyle='rgba(0,0,0,0.4)';rr(ctx,CW/2-44,8,88,32,8);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 18px Sora,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(`🗼 ${st.score}`,CW/2,24);

    // Ground line
    ctx.strokeStyle=`${T.a2}88`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(MARGIN,CH-36);ctx.lineTo(CW-MARGIN,CH-36);ctx.stroke();

    if(st.fr<60){ctx.globalAlpha=Math.max(0,(60-st.fr)/60);ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='13px Sora,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Tocca per posare! 👆',CW/2,CH-16);ctx.globalAlpha=1;}
  }

  useEffect(()=>{
    if(phase!=='play')return;
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');
    const st=makeSt();stRef.current=st;

    function tick(){
      st.fr++;
      const speed=Math.min(5.5,2.0+st.score*0.14);
      let nx=st.cur.x+st.cur.dir*speed;
      if(nx<=MARGIN){nx=MARGIN;st.cur.dir=1;}
      if(nx+st.cur.w>=CW-MARGIN){nx=CW-MARGIN-st.cur.w;st.cur.dir=-1;}
      st.cur.x=nx;
      if(st.flashLife>0)st.flashLife--;
      st.parts=st.parts.filter(p=>p.l>0);st.parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.l--;});
      st.floats=st.floats.filter(f=>f.l>0);st.floats.forEach(f=>{f.y+=f.vy;f.l--;});
      drawScene(ctx,st);
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  function drop(){
    const st=stRef.current;if(!st)return;
    const top=st.blocks[st.blocks.length-1];
    const c=st.cur;
    const ol=Math.max(c.x,top.x),or2=Math.min(c.x+c.w,top.x+top.w);
    const ow=or2-ol;
    if(ow<=0){
      finalRef.current=st.score;
      const bst=parseInt(localStorage.getItem('bly_stack_best')||'0');
      if(st.score>bst){localStorage.setItem('bly_stack_best',String(st.score));setIsNewBest(true);}
      if(st.score>0)setCp(p=>p+game.cp);
      cancelAnimationFrame(rafRef.current);setPhase('over');return;
    }
    const perf=ow/c.w>0.95;
    const nw=perf?c.w:ow;const nx2=perf?c.x:ol;
    st.blocks.push({x:nx2,w:nw});
    const nc=perf?st.combo+1:0;st.combo=nc;
    let pts=1;if(perf)pts+=2;if(nc>=3)pts+=nc-2;
    st.score+=pts;setDisplayScore(st.score);
    const bx=nx2+nw/2,by=blockY(st.blocks.length-1,st.blocks.length);
    // particles
    const col=COLORS[st.blocks.length%COLORS.length];
    for(let i=0;i<(perf?16:8);i++)st.parts.push({x:bx,y:by,vx:(Math.random()-.5)*(perf?7:4),vy:(Math.random()-.5)*5-2,l:perf?45:28,ml:perf?45:28,c:perf?'#FFD700':col,s:perf?5:3});
    if(perf){st.flashText=nc>=3?`COMBO x${nc}! +${pts}`:'PERFETTO! +3';st.flashLife=55;st.floats.push({t:`+${pts}`,x:bx,y:by-10,vy:-1.4,l:45,ml:45,c:perf?'#FFD700':T.a1,sz:22});}
    st.cur={x:MARGIN,w:nw,dir:1};
  }

  const best=parseInt(localStorage.getItem('bly_stack_best')||'0');
  const csw=Math.min((typeof window!=='undefined'?window.innerWidth:320)-24,340);
  const csh=Math.round(csw*(CH/CW));

  if(phase==='intro')return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"24px 0"}}>
      <div style={{fontSize:64,marginBottom:16}}>🗼</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Torre dei Sogni</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Tocca per posare ogni blocco a 60fps! Drop perfetto +3 pts. 3 perfetti di fila = COMBO con moltiplicatore!</div>
      {best>0&&<div style={{marginTop:14,fontSize:13,color:T.a5||T.a1,fontWeight:700}}>🏆 Record: {best} piani</div>}
    </div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Costruisci 🗼</Btn>
  </div>);

  if(phase==='over')return(<div style={{padding:24,textAlign:"center",paddingTop:60}}>
    {isNewBest&&<WinParticles/>}
    <div style={{fontSize:56,marginBottom:12}}>🏆</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Torre crollata!</div>
    <div style={{fontSize:52,fontWeight:900,color:T.a5||T.a1,marginBottom:2}}>{finalRef.current}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>piani costruiti</div>
    {isNewBest&&<div style={{fontSize:15,fontWeight:800,color:T.a1,marginBottom:8}}>🏆 NUOVO RECORD!</div>}
    <div style={{fontSize:13,color:T.faint,marginBottom:4}}>Best: {Math.max(best,finalRef.current)}</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:28}}>{finalRef.current>0?`+${game.cp} punti coppia 💞`:"Riprova!"}</div>
    <Btn T={T} grad={G[game.g]} onClick={()=>{setIsNewBest(false);setPhase('play');}}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:"12px 12px 90px",cursor:"pointer",userSelect:"none"}} onClick={drop} onTouchStart={e=>{e.preventDefault();drop();}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}} onClick={e=>e.stopPropagation()}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <span style={{fontSize:16,fontWeight:800,color:T.a5||T.a1}}>🗼 {displayScore}</span>
    </div>
    <div style={{display:"flex",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={CW} height={CH}
        style={{width:csw,height:csh,borderRadius:20,border:`2px solid ${T.line2}`,display:"block",touchAction:"none",boxShadow:`0 0 40px ${T.a1}22,0 8px 32px rgba(0,0,0,0.4)`}}/>
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:10}}>Tocca per posare il blocco 🗼</div>
  </div>);
}

// ════════ WORD GUESS — parola del giorno ════════
const WORD_LIST=[
  // amore & coppia
  {w:"AMORE",hint:"Ciò che vi unisce"},{w:"BACIO",hint:"Un gesto dolce"},
  {w:"CUORE",hint:"Batte per te"},{w:"SOGNO",hint:"Quello che costruite insieme"},
  {w:"FELICE",hint:"Come vi sentite insieme"},{w:"ABBRACCIO",hint:"Caldo e protettivo"},
  {w:"COCCOLE",hint:"Tenerezze sul divano"},{w:"PASSIONE",hint:"La scintilla che brucia"},
  {w:"DESTINO",hint:"Vi siete trovati così"},{w:"FEDELTA",hint:"Una promessa importante"},
  {w:"COMPLICE",hint:"Chi ti capisce al volo"},{w:"DOLCEZZA",hint:"Un modo di amare"},
  {w:"INTESA",hint:"Quando vi capite senza parlare"},{w:"TENEREZZA",hint:"Affetto delicato"},
  {w:"FIDUCIA",hint:"La base di tutto"},{w:"NOZZE",hint:"Il grande giorno"},
  {w:"FIDANZATI",hint:"Lo stadio prima dell'altare"},{w:"CAREZZA",hint:"Un tocco gentile"},
  // natura & vita
  {w:"SOLE",hint:"Splende di giorno"},{w:"LUNA",hint:"Romantica di notte"},
  {w:"STELLA",hint:"Brilla nel cielo"},{w:"MARE",hint:"Onde e orizzonte"},
  {w:"FIORE",hint:"Si regala per amore"},{w:"VIAGGIO",hint:"Avventura insieme"},
  {w:"ESTATE",hint:"La stagione calda"},{w:"NOTTE",hint:"Quando spuntano le stelle"},
  {w:"ALBA",hint:"Il primo chiarore"},{w:"NEVE",hint:"Bianca e fredda"},
  // cultura & vario
  {w:"MUSICA",hint:"La colonna sonora"},{w:"BALLO",hint:"Due che si muovono insieme"},
  {w:"CINEMA",hint:"Film al buio"},{w:"CENA",hint:"A lume di candela"},
  {w:"REGALO",hint:"Sorpresa impacchettata"},{w:"FESTA",hint:"Si balla e si brinda"},
  {w:"RISATA",hint:"Contagiosa e leggera"},{w:"AVVENTURA",hint:"Fuori dalla comfort zone"},
  {w:"CASA",hint:"Dove tornate insieme"},{w:"TEMPO",hint:"Il regalo più prezioso"},
  {w:"FUTURO",hint:"Quello che vi aspetta"},{w:"RICORDO",hint:"Resta nel cuore"},
];
function WordGuess({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  // deterministic "word of the day": same for everyone on a given date
  const [target]=useState(()=>{
    const today=new Date();const seed=today.getFullYear()*1000+ (Math.floor((today-new Date(today.getFullYear(),0,0))/86400000));
    return WORD_LIST[seed%WORD_LIST.length];
  });
  const W=target.w;
  const [guesses,setGuesses]=useState([]);
  const [cur,setCur]=useState("");
  const [done,setDone]=useState(false);
  const MAX=6;

  function press(k){if(done||cur.length>=W.length)return;setCur(c=>c+k);}
  function del(){setCur(c=>c.slice(0,-1));}
  function submit(){
    if(cur.length!==W.length){onToast(`La parola ha ${W.length} lettere`);return;}
    const ng=[...guesses,cur];setGuesses(ng);
    if(cur===W){setDone(true);const bonus=Math.max(0,(MAX-ng.length))*5;setCp(p=>p+game.cp+bonus);onToast(`🟩 +${game.cp+bonus} punti!`);}
    else if(ng.length>=MAX){setDone(true);onToast(`La parola era ${W}`);}
    setCur("");
  }
  // letter status with proper letter-count handling (like real Wordle): 2=correct,1=present,0=absent
  function rowStatus(guess){
    const res=Array(W.length).fill(0);
    const counts={};
    for(const ch of W)counts[ch]=(counts[ch]||0)+1;
    // first pass: greens
    for(let i=0;i<W.length;i++){if(guess[i]===W[i]){res[i]=2;counts[guess[i]]--;}}
    // second pass: yellows
    for(let i=0;i<W.length;i++){if(res[i]===0&&counts[guess[i]]>0){res[i]=1;counts[guess[i]]--;}}
    return res;
  }
  const keyStatus={};
  guesses.forEach(g=>{const rs=rowStatus(g);for(let i=0;i<g.length;i++){if((keyStatus[g[i]]??-1)<rs[i])keyStatus[g[i]]=rs[i];}});
  const col=s=>s===2?G.a4:s===1?G.a3:"#9AA0AE";
  const won=guesses.includes(W);

  return(<div style={{padding:18,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span>
      <span style={{fontSize:13,color:T.faint}}>🟩 Parola del Giorno</span>
    </div>
    <div style={{fontSize:13,color:T.sub,textAlign:"center",marginBottom:14,fontStyle:"italic"}}>💡 {target.hint} · {W.length} lettere</div>

    {/* grid */}
    <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",marginBottom:18}}>
      {Array.from({length:MAX}).map((_,r)=>{
        const g=guesses[r]||(r===guesses.length?cur:"");
        const submitted=r<guesses.length;
        const rs=submitted?rowStatus(guesses[r]):null;
        return(<div key={r} style={{display:"flex",gap:6}}>
          {Array.from({length:W.length}).map((_,c)=>{
            const ch=g[c]||"";const s=submitted?rs[c]:-1;
            return<div key={c} style={{width:`min(13vw,46px)`,height:`min(13vw,46px)`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:submitted?"#fff":T.text,background:submitted?col(s):T.surface,border:`2px solid ${submitted?"transparent":ch?T.a4:T.line2}`,transition:"background 0.2s"}}>{ch}</div>;
          })}
        </div>);
      })}
    </div>

    {done&&<div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:40,marginBottom:6}}>{won?"🎉":"💪"}</div><div style={{fontSize:16,fontWeight:800}}>{won?`Indovinata in ${guesses.length}!`:`Era: ${W}`}</div><div style={{fontSize:13,color:T.faint,marginTop:4}}>Torna domani per una nuova parola</div><Btn T={T} grad={grad} onClick={onBack} style={{marginTop:14}}>Concludi</Btn></div>}

    {/* keyboard */}
    {!done&&<div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center"}}>
      {["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"].map((row,i)=>(
        <div key={i} style={{display:"flex",gap:4,justifyContent:"center"}}>
          {i===2&&<button onClick={submit} style={{padding:"0 10px",borderRadius:7,background:grad,color:"#fff",border:"none",fontSize:12,fontWeight:800,cursor:"pointer"}}>OK</button>}
          {row.split("").map(k=>{const s=keyStatus[k];return(
            <button key={k} onClick={()=>press(k)} style={{minWidth:`min(8vw,30px)`,height:40,borderRadius:7,background:s!==undefined?col(s):T.surface2,color:s!==undefined?"#fff":T.text,border:`1px solid ${T.line2}`,fontSize:14,fontWeight:700,cursor:"pointer"}}>{k}</button>
          );})}
          {i===2&&<button onClick={del} style={{padding:"0 10px",borderRadius:7,background:T.surface2,color:T.text,border:`1px solid ${T.line2}`,fontSize:14,cursor:"pointer"}}>⌫</button>}
        </div>
      ))}
    </div>}
  </div>);
}

// ════════ MOST LIKELY — chi è più probabile ════════
const DAILY_DONE={};
// ── Domanda del giorno (one shared question per day) ──
const DAILY_QUESTIONS=[
  {q:"Cosa ti renderebbe felice oggi?",opts:["Un abbraccio","Una sorpresa","Tempo insieme","Una bella notizia"]},
  {q:"Se potessimo teletrasportarci ora, dove?",opts:["Al mare","In montagna","In una città nuova","A casa, sul divano"]},
  {q:"Qual è la cosa che apprezzi di più di noi?",opts:["La complicità","Le risate","Il sostegno","La passione"]},
  {q:"Come ti senti oggi?",opts:["Carico/a","Tranquillo/a","Un po' stanco/a","Innamorato/a 💞"]},
  {q:"Cosa ti va di fare stasera insieme?",opts:["Film e coccole","Cena fuori","Cucinare","Una passeggiata"]},
  {q:"La prima cosa che hai pensato di me stamattina?",opts:["Mi manchi","Sei bellissimo/a","Voglio abbracciarti","Che fortuna averti"]},
  {q:"Cosa ti farebbe sentire più amato/a oggi?",opts:["Un messaggio dolce","Un gesto a sorpresa","Più tempo insieme","Ascolto vero"]},
  {q:"Un piccolo sogno per questa settimana?",opts:["Riposarci","Un'avventura","Fare ordine","Coccolarci di più"]},
  {q:"Cosa ti fa ridere di me?",opts:["Le mie facce","Le mie battute","Come ballo","Quando mi imbarazzo"]},
  {q:"Di cosa hai voglia in questo momento?",opts:["Un caffè insieme","Un bacio","Silenzio e relax","Parlare di noi"]},
];
// shared daily answer state (session): who answered, what
const DAILY_Q_STATE={}; // key dayNumber -> {mine, partner}
// discoveries log: pairs of matched / surprising answers across games (persisted)
const DISCOVERIES=_lsGet('bly_discoveries',[]);
function logDiscovery(q,mine,partner){
  if(!q||mine==null||partner==null)return;
  if(DISCOVERIES.find(d=>d.q===q))return;
  DISCOVERIES.unshift({q,mine,partner,match:mine===partner});
  if(DISCOVERIES.length>40)DISCOVERIES.pop();
  _lsSet('bly_discoveries',DISCOVERIES);
}
const _lsGet=(k,fb)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):fb;}catch{return fb;}};
const _lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
const READ_ARTICLES=new Set(_lsGet('bly_read_arts',[]));
// ── Turn-based async state persisted to localStorage per game ──
const TURN_STATE={};
function turnState(id){
  if(!TURN_STATE[id]){
    const saved=_lsGet(`bly_ts_${id}`,null);
    TURN_STATE[id]={consumed:new Set(saved?.consumed||[]),pending:saved?.pending||[]};
  }
  return TURN_STATE[id];
}
function _saveTurnState(id){const st=TURN_STATE[id];if(st)_lsSet(`bly_ts_${id}`,{consumed:[...st.consumed],pending:st.pending});}
function nextUnused(id,len){const st=turnState(id);for(let i=0;i<len;i++)if(!st.consumed.has(i))return i;return -1;}
function partnerPendingFor(id){const st=turnState(id);return st.pending.find(p=>p.partner!=null&&p.mine==null);}
const FORCE_PARTNER_NEXT={on:false};
const MOSTLIKELY=[
  // quotidiano
  "...dimentica un anniversario?","...si addormenta per primo?","...controlla il telefono a tavola?",
  "...organizza il viaggio?","...sbaglia strada?","...mangia l'ultimo pezzo di pizza?",
  "...canta sotto la doccia?","...spende di più shopping?","...russa di notte?","...fa più foto?",
  "...lascia i piatti nel lavandino?","...si perde a fare zapping?","...arriva in ritardo?",
  "...prende il telecomando per primo?","...dimentica le chiavi?","...parla di più al telefono?",
  // emotivo / coppia
  "...piange durante un film?","...dice 'ti amo' per primo ogni giorno?","...fa il primo passo dopo un litigio?",
  "...prepara una sorpresa romantica?","...si emoziona ai matrimoni?","...scrive bigliettini d'amore?",
  "...abbraccia più a lungo?","...si gelosisce di più?","...ricorda i dettagli del primo appuntamento?",
  // divertente
  "...ballerebbe in mezzo alla strada?","...mangerebbe dessert a colazione?","...parlerebbe con gli animali?",
  "...vincerebbe a un karaoke?","...si travestirebbe per una festa?","...riderebbe nei momenti seri?",
  "...diventerebbe famoso sui social?","...sopravviverebbe su un'isola deserta?",
  // piccante (leggero)
  "...fa il primo passo a letto?","...proporrebbe una fuga romantica last-minute?","...invierebbe un messaggio audace?",
  "...sceglierebbe il film più piccante?","...sussurra cose dolci all'orecchio?",
];
function MostLikely({game,onBack,setCp,onToast,T,G,partnerName="il partner"}){
  const grad=G[game.g];
  const st=turnState(game.id);
  const [qi,setQi]=useState(()=>nextUnused(game.id,MOSTLIKELY.length));
  const [scenario,setScenario]=useState(()=>{if(FORCE_PARTNER_NEXT.on){FORCE_PARTNER_NEXT.on=false;return "partner";}return Math.random()<0.5?"mine":"partner";});
  const [phase,setPhase]=useState("answer"); // answer | waiting | reveal | empty
  const [mine,setMine]=useState(null);
  const [agree,setAgree]=useState(0);
  const [count,setCount]=useState(0);
  const partnerPick=(qi%2===0)?"me":"partner";

  if(qi<0||phase==="empty") return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    <div style={{fontSize:60,marginBottom:16}}>✅</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:10}}>Avete giocato tutti gli spunti!</div>
    {count>0&&<div style={{fontSize:15,color:T.a2,fontWeight:700,marginBottom:8}}>D'accordo {agree}/{count} volte</div>}
    <div style={{fontSize:14,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto 20px"}}>Ne aggiungiamo di nuovi di continuo — tornate presto 💞</div>
    <Btn T={T} grad={grad} onClick={onBack}>Concludi</Btn>
  </div>);

  function choose(who){
    setMine(who);setCount(c=>c+1);if(who===partnerPick)setAgree(a=>a+1);
    if(scenario==="partner")setPhase("reveal");
    else{setPhase("waiting");setTimeout(()=>setPhase("reveal"),1600);}
  }
  function next(){
    st.consumed.add(qi);_saveTurnState(game.id);setCp(p=>p+Math.round(game.cp/3));
    const nxt=nextUnused(game.id,MOSTLIKELY.length);
    if(nxt<0)setPhase("empty");
    else{setQi(nxt);setMine(null);setScenario(Math.random()<0.5?"mine":"partner");setPhase("answer");}
  }

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>🫵 Chi è più probabile</span></div>
    <div style={{textAlign:"center",fontSize:12,fontWeight:700,color:T.a2,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>🕓 a turni</div>

    {scenario==="partner"&&phase==="answer"&&(
      <div style={{display:"flex",alignItems:"center",gap:10,background:`${T.a3}12`,border:`1px solid ${T.a3}33`,borderRadius:14,padding:"10px 14px",marginBottom:16}}><span style={{fontSize:20}}>💞</span><div style={{fontSize:12.5,color:T.sub,fontWeight:600}}>{partnerName} ha già risposto. Tocca a te — poi vedete i risultati!</div></div>
    )}

    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minHeight:150,textAlign:"center",padding:"10px 0"}}>
      <div style={{fontSize:13,fontWeight:800,color:T.a2,textTransform:"uppercase",letterSpacing:0.5,marginBottom:12}}>Chi è più probabile che...</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:23,fontWeight:800,letterSpacing:-0.4,lineHeight:1.35}}>{MOSTLIKELY[qi]}</div>
    </div>

    {phase==="answer"&&<>
      <div style={{fontSize:13,color:T.sub,textAlign:"center",marginBottom:14}}>{scenario==="partner"?"Scegli la tua risposta 💌":`Scegli — arriva a ${partnerName} 💌`}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div onClick={()=>choose("me")} style={{background:G.a4,color:"#fff",borderRadius:18,padding:"18px",textAlign:"center",fontSize:17,fontWeight:800,cursor:"pointer"}}>Io 🙋</div>
        <div onClick={()=>choose("partner")} style={{background:G.a1,color:"#fff",borderRadius:18,padding:"18px",textAlign:"center",fontSize:17,fontWeight:800,cursor:"pointer"}}>{partnerName} 💞</div>
      </div>
    </>}

    {phase==="waiting"&&<div style={{textAlign:"center",padding:"30px 0"}}>
      <style>{`@keyframes dotpulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
      <div style={{width:80,height:80,borderRadius:"50%",background:`${T.a3}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 18px"}}>📨</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,marginBottom:6}}>Risposta inviata!</div>
      <div style={{fontSize:14,color:T.sub}}>In attesa che {partnerName} risponda<span style={{animation:"dotpulse 1s infinite"}}>...</span></div>
    </div>}

    {phase==="reveal"&&<>
      <div style={{background:mine===partnerPick?`${T.a4}12`:`${T.a3}12`,border:`1px solid ${mine===partnerPick?T.a4:T.a3}40`,borderRadius:18,padding:"16px",textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:30}}>{mine===partnerPick?"🎯":"😄"}</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,marginTop:6}}>{mine===partnerPick?"D'accordo!":"Avete risposto diverso!"}</div>
        <div style={{fontSize:13,color:T.sub,marginTop:6}}>Tu: {mine==="me"?"Io":partnerName} · {partnerName}: {partnerPick==="me"?"te":"se stesso/a"}</div>
      </div>
      <Btn T={T} grad={grad} onClick={next}>Prossima →</Btn>
    </>}
  </div>);
}

// ════════ SIMON — memoria romantica ════════
function SimonGame({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const BTNS=[{e:"💕",c:"#FF5E8A"},{e:"💜",c:"#7C6FF0"},{e:"🧡",c:"#FFB347"},{e:"💚",c:"#3DEBC8"}];
  const [phase,setPhase]=useState("intro");
  const [seq,setSeq]=useState([]);
  const [input,setInput]=useState([]);
  const [active,setActive]=useState(null);
  const [round,setRound]=useState(0);

  function start(){const s=[Math.floor(Math.random()*4)];setSeq(s);setInput([]);setRound(1);setPhase("show");}
  useEffect(()=>{
    if(phase!=="show")return;
    let i=0;
    function next(){
      if(i>=seq.length){setActive(null);setTimeout(()=>setPhase("input"),400);return;}
      setActive(null);setTimeout(()=>{setActive(seq[i]);i++;setTimeout(next,650);},200);
    }
    const t=setTimeout(next,500);
    return()=>clearTimeout(t);
  },[phase,seq]);

  function tap(id){
    if(phase!=="input")return;
    setActive(id);setTimeout(()=>setActive(null),200);
    const ns=[...input,id];
    for(let i=0;i<ns.length;i++){if(ns[i]!==seq[i]){setTimeout(()=>{if(round>1)setCp(p=>p+game.cp);setPhase("over");},400);return;}}
    if(ns.length===seq.length){
      const next=[...seq,Math.floor(Math.random()*4)];
      setSeq(next);setInput([]);setRound(r=>r+1);setTimeout(()=>setPhase("show"),700);
    } else setInput(ns);
  }

  if(phase==="intro")return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}><div style={{fontSize:60,marginBottom:18}}>🧠</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Simon Romantico</div><div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Guarda la sequenza di cuori colorati e ripetila. Ogni round aggiunge un passo. Chi ricorda la sequenza più lunga vince! 💕</div></div>
    <Btn T={T} grad={grad} onClick={start}>Inizia 🧠</Btn>
  </div>);
  if(phase==="over")return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    <div style={{fontSize:60,marginBottom:16}}>🧠</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Memoria finita!</div>
    <div style={{fontSize:42,fontWeight:800,color:T.a2,marginBottom:4}}>{round-1}</div><div style={{fontSize:14,color:T.sub,marginBottom:8}}>round completati</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>{round>1?`+${game.cp} punti · ora tocca al partner! 😏`:"Riprovate!"}</div>
    <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn><Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);
  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div><span style={{fontSize:14,fontWeight:800,color:T.a2}}>🧠 Round {round}</span><span style={{fontSize:13,color:T.faint,marginLeft:12}}>{phase==="show"?"Guarda...":"Tocca!"}</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:8}}>
      {BTNS.map((b,id)=><div key={id} onClick={()=>tap(id)} style={{height:130,borderRadius:22,background:active===id?b.c:`${b.c}44`,border:`3px solid ${active===id?b.c:b.c+'55'}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,cursor:"pointer",transition:"all 0.15s",transform:active===id?"scale(1.06)":"scale(1)",boxShadow:active===id?`0 8px 24px ${b.c}66`:"none"}}>{b.e}</div>)}
    </div>
    <div style={{textAlign:"center",marginTop:20,fontSize:14,color:T.faint}}>{phase==="show"?`Osserva la sequenza (${seq.length} step)`:`Ripeti ${seq.length} cuori nell'ordine giusto`}</div>
  </div>);
}

// ════════ TROVA L'INTRUSO — spot the odd one ════════
function TrovaIntruso({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const SETS=[
    ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨"],
    ["🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥭","🍍"],
    ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓"],
    ["🌹","🌻","🌸","🌺","🌼","💐","🌷","🌿","🍀"],
    ["✈️","🚀","🚁","🛸","🛩️","🚂","🚗","⛵","🛶"],
    ["🎸","🎹","🎺","🎻","🥁","🎷","🪗","🪘","🎵"],
    ["😀","😄","😁","😆","😊","😍","🥰","😘","😏"],
    ["🌙","⭐","🌟","✨","💫","🌠","☀️","🌤️","⛅"],
  ];
  const [phase,setPhase]=useState("intro");
  const [round,setRound]=useState(0);
  const [score,setScore]=useState(0);
  const [grid,setGrid]=useState([]);
  const [odd,setOdd]=useState(-1);
  const [revealed,setRevealed]=useState(false);
  const [startMs,setStartMs]=useState(0);
  const [bestMs,setBestMs]=useState(null);

  function makeRound(r){
    const base=SETS[r%SETS.length];
    const g=base.slice(0,8);
    const odd=Math.floor(Math.random()*8);
    const intruder=SETS[(r+1)%SETS.length][Math.floor(Math.random()*9)];
    const cells=[...g.slice(0,odd),intruder,...g.slice(odd)];
    setGrid(cells);setOdd(odd);setRevealed(false);setStartMs(Date.now());
  }
  function start(){setRound(0);setScore(0);setBestMs(null);makeRound(0);setPhase("play");}
  function pick(i){
    if(revealed)return;
    const ms=Date.now()-startMs;
    if(i===odd){
      setScore(s=>s+Math.max(10,50-Math.floor(ms/100)));
      setBestMs(b=>b===null?ms:Math.min(b,ms));
      setRevealed(true);
      setTimeout(()=>{if(round>=6){setCp(p=>p+game.cp);setPhase("done");}else{setRound(r=>{const nr=r+1;makeRound(nr);return nr;});}},900);
    } else {
      setScore(s=>Math.max(0,s-5));
      setRevealed(true);
      setTimeout(()=>{makeRound(round);setRevealed(false);},900);
    }
  }

  if(phase==="intro")return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}><div style={{fontSize:60,marginBottom:18}}>🔍</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Trova l'Intruso</div><div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>In ogni griglia c'è un'emoji diversa da tutte le altre. Trovala più in fretta che puoi! Sfidate chi ha il record di velocità.</div></div>
    <Btn T={T} grad={grad} onClick={start}>Inizia 🔍</Btn>
  </div>);
  if(phase==="done")return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    <div style={{fontSize:60,marginBottom:16}}>🔍</div><div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Bravissimo!</div>
    <div style={{fontSize:42,fontWeight:800,color:T.a3,marginBottom:4}}>{score}</div><div style={{fontSize:14,color:T.sub,marginBottom:8}}>punti totali</div>
    {bestMs&&<div style={{fontSize:13,color:T.a4,marginBottom:8,fontWeight:700}}>Miglior tempo: {(bestMs/1000).toFixed(1)}s ⚡</div>}
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>+{game.cp} punti · ora tocca al partner! 😏</div>
    <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn><Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);
  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div style={{display:"flex",gap:14}}><span style={{fontSize:14,fontWeight:800,color:T.a3}}>🔍 {score}</span><span style={{fontSize:13,color:T.faint}}>{round+1}/7</span></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {grid.map((e,i)=><div key={i} onClick={()=>pick(i)} style={{aspectRatio:"1",borderRadius:16,background:revealed&&i===odd?`${T.a4}22`:T.glass||T.surface,backdropFilter:T.glass?"blur(10px)":"none",WebkitBackdropFilter:T.glass?"blur(10px)":"none",border:`2px solid ${revealed&&i===odd?T.a4:T.line2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"min(9vw,38px)",cursor:"pointer",transition:"all 0.2s",transform:revealed&&i===odd?"scale(1.08)":"scale(1)"}}>{e}</div>)}
    </div>
    <div style={{fontSize:13,color:T.faint,textAlign:"center",marginTop:16}}>Tocca l'emoji diversa dalle altre 🔍</div>
  </div>);
}

// ════════ FLAPPY HEART ════════
function FlappyHeart({game,onBack,setCp,onToast,T,G}){
  const CW=320,CH=480,BIRD_X=70,BIRD_R=15,GAP=110,PIPE_W=52,GRAVITY=0.4,JUMP_VEL=-7.8,SPEED=2.8;
  const canvasRef=useRef(null);
  const stRef=useRef(null);
  const rafRef=useRef(null);
  const [phase,setPhase]=useState("intro");
  const [displayScore,setDisplayScore]=useState(0);
  const [isNewBest,setIsNewBest]=useState(false);
  const finalRef=useRef(0);

  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}
  function heart(ctx,cx,cy,s){const h=s*0.6;ctx.beginPath();ctx.moveTo(cx,cy+h*1.4);ctx.bezierCurveTo(cx-h*2.2,cy-h*0.2,cx-h*2.2,cy-h*1.6,cx,cy-h*0.2);ctx.bezierCurveTo(cx+h*2.2,cy-h*1.6,cx+h*2.2,cy-h*0.2,cx,cy+h*1.4);ctx.fill();}

  function makeSt(){
    return{bird:{y:CH/2,vy:0,ang:0,trail:[]},pipes:[{x:CW+60,gapY:CH/2,passed:false}],
      score:0,fr:0,gx:0,
      stars:[...Array(25)].map(()=>({x:Math.random()*CW,y:Math.random()*CH*0.65,r:Math.random()*1.8+0.4,p:Math.random()*Math.PI*2})),
      clouds:[{x:60,y:55,w:90},{x:210,y:38,w:110},{x:330,y:70,w:75},{x:480,y:45,w:95}]
    };
  }

  function drawScene(ctx,st){
    // Sky
    const sky=ctx.createLinearGradient(0,0,0,CH);
    sky.addColorStop(0,T.bg||'#0d0a1a');sky.addColorStop(0.75,T.surface||'#1a1030');sky.addColorStop(1,'#241510');
    ctx.fillStyle=sky;ctx.fillRect(0,0,CW,CH);

    // Stars
    st.stars.forEach(s=>{const a=0.25+0.75*((Math.sin(st.fr*0.04+s.p)+1)/2);ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=1;

    // Clouds parallax
    ctx.fillStyle='rgba(255,255,255,0.07)';
    st.clouds.forEach(c=>{const cx=((c.x-st.gx*0.25)%CW+CW)%CW;ctx.beginPath();ctx.ellipse(cx,c.y,c.w/2,20,0,0,Math.PI*2);ctx.fill();if(cx+c.w/2>CW){ctx.beginPath();ctx.ellipse(cx-CW,c.y,c.w/2,20,0,0,Math.PI*2);ctx.fill();}});

    // Pipes
    st.pipes.forEach(p=>{
      const topH=p.gapY-GAP/2;
      const botY=p.gapY+GAP/2,botH=CH-botY-32;
      // pipe glow
      ctx.shadowColor=T.a2||'#7c5ce0';ctx.shadowBlur=16;
      const pgTop=ctx.createLinearGradient(p.x,0,p.x+PIPE_W,0);
      pgTop.addColorStop(0,T.a2||'#7c5ce0');pgTop.addColorStop(0.45,'rgba(255,255,255,0.18)');pgTop.addColorStop(1,T.a3||'#c77dff');
      ctx.fillStyle=pgTop;rr(ctx,p.x,0,PIPE_W,topH,4);ctx.fill();
      ctx.fillStyle=T.a1;rr(ctx,p.x-5,topH-18,PIPE_W+10,22,7);ctx.fill();
      const pgBot=ctx.createLinearGradient(p.x,0,p.x+PIPE_W,0);
      pgBot.addColorStop(0,T.a2);pgBot.addColorStop(0.45,'rgba(255,255,255,0.18)');pgBot.addColorStop(1,T.a3);
      ctx.fillStyle=pgBot;rr(ctx,p.x,botY,PIPE_W,botH,4);ctx.fill();
      ctx.fillStyle=T.a1;rr(ctx,p.x-5,botY-4,PIPE_W+10,22,7);ctx.fill();
      ctx.shadowBlur=0;
    });

    // Ground
    const gr=ctx.createLinearGradient(0,CH-32,0,CH);gr.addColorStop(0,'#3a2818');gr.addColorStop(1,'#1a1008');
    ctx.fillStyle=gr;ctx.fillRect(0,CH-32,CW,32);
    ctx.strokeStyle='rgba(255,255,255,0.07)';ctx.lineWidth=1;
    for(let i=0;i<CW+40;i+=36){const ox=(i-st.gx*1.8%36+36)%36-36;ctx.beginPath();ctx.moveTo(ox,CH-32);ctx.lineTo(ox+18,CH);ctx.stroke();}

    // Bird trail
    const b=st.bird;
    b.trail.forEach((t,i)=>{const a=(i/b.trail.length)*0.35;ctx.globalAlpha=a;ctx.fillStyle=T.a1;ctx.shadowColor=T.a1;ctx.shadowBlur=10;heart(ctx,t.x,t.y,8*(0.4+i/b.trail.length*0.6));});
    ctx.globalAlpha=1;ctx.shadowBlur=0;

    // Bird
    ctx.save();ctx.translate(BIRD_X,b.y);ctx.rotate(b.ang);
    ctx.shadowColor=T.a1;ctx.shadowBlur=24;ctx.fillStyle=T.a1;heart(ctx,0,0,BIRD_R);
    ctx.shadowBlur=0;ctx.globalAlpha=0.38;ctx.fillStyle='#fff';heart(ctx,-3,-4,7);ctx.globalAlpha=1;
    ctx.restore();

    // Score badge
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.arc(CW/2,26,24,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 18px Sora,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(st.score,CW/2,26);

    if(st.fr<100){ctx.globalAlpha=Math.max(0,(100-st.fr)/100);ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='14px Sora,sans-serif';ctx.fillText('Tocca per volare 💕',CW/2,CH-52);ctx.globalAlpha=1;}
  }

  useEffect(()=>{
    if(phase!=='play')return;
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');
    const st=makeSt();stRef.current=st;

    function end(sc){cancelAnimationFrame(rafRef.current);finalRef.current=sc;
      const bst=parseInt(localStorage.getItem('bly_flappy_best')||'0');
      if(sc>bst){localStorage.setItem('bly_flappy_best',String(sc));setIsNewBest(true);}
      if(sc>0)setCp(p=>p+game.cp);drawScene(ctx,st);setPhase('over');}

    function tick(){
      const b=st.bird;st.fr++;
      b.vy+=GRAVITY;b.y+=b.vy;b.ang=Math.max(-0.6,Math.min(0.8,b.vy*0.07));
      b.trail.push({x:BIRD_X,y:b.y});if(b.trail.length>12)b.trail.shift();
      st.gx+=SPEED;
      st.pipes=st.pipes.map(p=>({...p,x:p.x-SPEED})).filter(p=>p.x>-PIPE_W-30);
      if(!st.pipes.length||st.pipes[st.pipes.length-1].x<CW-200)
        st.pipes.push({x:CW+20,gapY:80+Math.random()*(CH-GAP-140),passed:false});
      st.pipes.forEach(p=>{if(!p.passed&&p.x+PIPE_W<BIRD_X-BIRD_R){p.passed=true;st.score++;setDisplayScore(st.score);}});
      if(b.y+BIRD_R>CH-32||b.y-BIRD_R<0){end(st.score);return;}
      for(const p of st.pipes){if(BIRD_X+BIRD_R>p.x&&BIRD_X-BIRD_R<p.x+PIPE_W){if(b.y-BIRD_R<p.gapY-GAP/2||b.y+BIRD_R>p.gapY+GAP/2){end(st.score);return;}}}
      drawScene(ctx,st);rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  function jump(){const st=stRef.current;if(!st)return;st.bird.vy=JUMP_VEL;st.bird.trail=[];}
  const best=parseInt(localStorage.getItem('bly_flappy_best')||'0');
  const csw=Math.min((typeof window!=='undefined'?window.innerWidth:320)-24,360);
  const csh=Math.round(csw*(CH/CW));

  if(phase==='intro')return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"24px 0"}}>
      <div style={{fontSize:64,marginBottom:16}}>❤️</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Cuore Volante</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Tocca o swipe per far volare il cuore tra le colonne! Parallax, trail e glow a 60fps.</div>
      {best>0&&<div style={{marginTop:14,fontSize:13,color:T.a1,fontWeight:700}}>🏆 Record: {best} 💕</div>}
    </div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Vola! ❤️</Btn>
  </div>);

  if(phase==='over')return(<div style={{padding:24,textAlign:"center",paddingTop:60}}>
    {isNewBest&&<WinParticles/>}
    <div style={{fontSize:56,marginBottom:12}}>❤️</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Atterrato!</div>
    <div style={{fontSize:52,fontWeight:900,color:T.a1,marginBottom:2}}>{finalRef.current}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>tubi superati</div>
    {isNewBest&&<div style={{fontSize:15,fontWeight:800,color:T.a3,marginBottom:8}}>🏆 NUOVO RECORD!</div>}
    <div style={{fontSize:13,color:T.faint,marginBottom:4}}>Best: {Math.max(best,finalRef.current)}</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:28}}>{finalRef.current>0?`+${game.cp} punti coppia 💞`:"Riprova!"}</div>
    <Btn T={T} grad={G[game.g]} onClick={()=>{setIsNewBest(false);setPhase('play');}}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:"12px 12px 90px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <span style={{fontSize:16,fontWeight:800,color:T.a1}}>❤️ {displayScore}</span>
    </div>
    <div style={{display:"flex",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={CW} height={CH}
        style={{width:csw,height:csh,borderRadius:20,border:`2px solid ${T.line2}`,display:"block",touchAction:"none",cursor:"pointer",boxShadow:`0 0 40px ${T.a1}22,0 8px 32px rgba(0,0,0,0.4)`}}
        onClick={jump} onTouchStart={e=>{e.preventDefault();jump();}}/>
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:10}}>Tocca il canvas per saltare ❤️</div>
  </div>);
}

// ════════ MEMORY CARDS ════════
function MemoryCards({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const EMOJIS=["🌹","💍","💌","🕯️","🍷","🎁","💫","🌙"];
  const [phase,setPhase]=useState("intro");
  const [cards,setCards]=useState([]);
  const [firstPick,setFirstPick]=useState(null);
  const [secondPick,setSecondPick]=useState(null);
  const [matches,setMatches]=useState(0);
  const [mistakes,setMistakes]=useState(0);
  const [timer,setTimer]=useState(0);
  const [locked,setLocked]=useState(false);
  const [best]=useState(()=>parseInt(localStorage.getItem("bly_memory_best")||"9999"));

  function shuffle(){
    const deck=[...EMOJIS,...EMOJIS].map((e,i)=>({id:i,emoji:e,flipped:false,matched:false}));
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    return deck;
  }
  function start(){setCards(shuffle());setFirstPick(null);setSecondPick(null);setMatches(0);setMistakes(0);setTimer(0);setLocked(false);setPhase("play");}

  useEffect(()=>{
    if(phase!=="play")return;
    const t=setInterval(()=>setTimer(v=>v+1),1000);
    return()=>clearInterval(t);
  },[phase]);

  function flip(idx){
    if(locked||cards[idx].flipped||cards[idx].matched)return;
    const nc=cards.map((c,i)=>i===idx?{...c,flipped:true}:c);
    setCards(nc);
    if(firstPick===null){setFirstPick(idx);return;}
    setSecondPick(idx);setLocked(true);
    const a=nc[firstPick],b=nc[idx];
    if(a.emoji===b.emoji){
      const matched=nc.map((c,i)=>(i===firstPick||i===idx)?{...c,matched:true}:c);
      setCards(matched);
      const nm=matches+1;setMatches(nm);
      setFirstPick(null);setSecondPick(null);setLocked(false);
      if(nm===8){
        const sc=Math.max(50,200-timer)+(8-mistakes)*10;
        const stored=parseInt(localStorage.getItem("bly_memory_best")||"9999");
        if(timer<stored)localStorage.setItem("bly_memory_best",String(timer));
        setCp(p=>p+game.cp);setPhase("done");
      }
    } else {
      setMistakes(m=>m+1);
      setTimeout(()=>{
        setCards(prev=>prev.map((c,i)=>(i===firstPick||i===idx)?{...c,flipped:false}:c));
        setFirstPick(null);setSecondPick(null);setLocked(false);
      },900);
    }
  }

  const bestDisp=best===9999?"—":`${best}s`;

  if(phase==="intro")return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}>
      <div style={{fontSize:60,marginBottom:18}}>🃏</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Carte Coppia</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Trova tutte le coppie romantiche nella griglia 4×4. Meno errori e meno tempo = più punti! <b style={{color:T.text}}>Sfida il partner al tuo record!</b></div>
      {best<9999&&<div style={{marginTop:16,fontSize:13,color:T.a2,fontWeight:700}}>🏆 Record: {bestDisp}</div>}
    </div>
    <Btn T={T} grad={grad} onClick={start}>Inizia 🃏</Btn>
  </div>);

  if(phase==="done"){
    const stored=parseInt(localStorage.getItem("bly_memory_best")||"9999");
    const isNew=timer<best;
    return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
      <WinParticles/>
      <div style={{fontSize:60,marginBottom:16}}>🎉</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Completato!</div>
      <div style={{fontSize:40,fontWeight:800,color:T.a2,marginBottom:4}}>{timer}s</div>
      <div style={{fontSize:14,color:T.sub,marginBottom:4}}>tempo impiegato · {mistakes} errori</div>
      {isNew&&<div style={{fontSize:15,fontWeight:800,color:T.a1,marginBottom:8}}>🏆 NUOVO RECORD!</div>}
      <div style={{fontSize:13,color:T.faint,marginBottom:30}}>+{game.cp} punti · tocca al partner! 😏</div>
      <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn>
      <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
    </div>);
  }

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div style={{display:"flex",gap:14}}>
        <span style={{fontSize:13,fontWeight:700,color:T.a2}}>🃏 {matches}/8</span>
        <span style={{fontSize:13,fontWeight:700}}>⏱ {timer}s</span>
        <span style={{fontSize:13,color:T.faint}}>❌ {mistakes}</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
      {cards.map((c,i)=>(
        <div key={c.id} onClick={()=>flip(i)}
          style={{aspectRatio:"1",borderRadius:14,cursor:"pointer",transition:"transform 0.3s",transform:c.flipped||c.matched?"rotateY(0)":"rotateY(0)",perspective:600,
            background:c.flipped||c.matched?`${T.surface}`:`${T.glass||T.a2}44`,
            border:`2px solid ${c.matched?T.a2:c.flipped?T.a3:T.line2}`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.flipped||c.matched?26:20,
            boxShadow:c.matched?`0 0 12px ${T.a2}55`:"none"}}>
          {c.flipped||c.matched?c.emoji:"💝"}
        </div>
      ))}
    </div>
  </div>);
}

// ════════ BUBBLE POP ════════
function BubblePop({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const TOTAL=40;
  const [phase,setPhase]=useState("intro");
  const [cells,setCells]=useState([]);
  const [score,setScore]=useState(0);
  const [time,setTime]=useState(30);

  function makeCells(){
    return Array.from({length:TOTAL},(_,i)=>{
      const r=Math.random();
      const e=r<0.12?"💣":r<0.25?"💖":"🫧";
      return{id:i,e,popped:false};
    });
  }
  function start(){setCells(makeCells());setScore(0);setTime(30);setPhase("play");}

  useEffect(()=>{
    if(phase!=="play")return;
    if(time<=0){setPhase("done");if(score>0)setCp(p=>p+game.cp);return;}
    const t=setTimeout(()=>setTime(v=>v-1),1000);return()=>clearTimeout(t);
  },[phase,time]);

  function pop(i){
    if(cells[i].popped||phase!=="play")return;
    const c=cells[i];
    setCells(prev=>prev.map((x,j)=>j===i?{...x,popped:true}:x));
    if(c.e==="💣"){setScore(s=>Math.max(0,s-2));onToast("💣 -2!");}
    else if(c.e==="💖"){setScore(s=>s+3);onToast("💖 +3!");}
    else setScore(s=>s+1);
    // refill with new bubble after a bit
    setTimeout(()=>setCells(prev=>prev.map((x,j)=>j===i?{...x,popped:false,e:Math.random()<0.12?"💣":Math.random()<0.25?"💖":"🫧",id:Math.random()}:x)),600);
  }

  if(phase==="intro")return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"36px 0"}}>
      <div style={{fontSize:60,marginBottom:18}}>🫧</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Scoppia Bolle</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Scoppia più bolle in 30 secondi! 💖 vale +3, 💣 vale -2. <b style={{color:T.text}}>Sfida chi fa più punti!</b></div>
    </div>
    <Btn T={T} grad={grad} onClick={start}>Scoppia! 🫧</Btn>
  </div>);

  if(phase==="done")return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    {score>15&&<WinParticles/>}
    <div style={{fontSize:60,marginBottom:16}}>🫧</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Tempo!</div>
    <div style={{fontSize:42,fontWeight:800,color:T.a4,marginBottom:4}}>{score}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>punti</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>{score>0?`+${game.cp} punti · tocca al partner! 😏`:"Riprova!"}</div>
    <Btn T={T} grad={grad} onClick={start}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <div style={{display:"flex",gap:14}}>
        <span style={{fontSize:14,fontWeight:800,color:T.a4}}>🫧 {score}</span>
        <span style={{fontSize:14,fontWeight:800,color:time<=5?T.a1:T.text}}>⏱ {time}s</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
      {cells.map((c,i)=>(
        <div key={c.id} onClick={()=>pop(i)}
          style={{aspectRatio:"1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,cursor:"pointer",
            background:c.popped?"transparent":c.e==="💣"?`${T.a1}33`:c.e==="💖"?`${T.a2}44`:`${T.a4}33`,
            border:c.popped?"none":`2px solid ${c.e==="💣"?T.a1:c.e==="💖"?T.a2:T.a4}55`,
            transform:c.popped?"scale(0)":"scale(1)",transition:"transform 0.25s,background 0.2s",
            boxShadow:c.popped?"none":`0 2px 8px ${T.a4}33`}}>
          {c.popped?"":c.e}
        </div>
      ))}
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:12}}>Tocca le bolle · 💖+3 · 💣-2 🫧</div>
  </div>);
}

// ════════ SNAKE — snake romantico (improved) ════════
function Snake({game,onBack,setCp,onToast,T,G}){
  const COLS=20,ROWS=20,CELL=20,W=400,H=400;
  const canvasRef=useRef(null);
  const stRef=useRef(null);
  const rafRef=useRef(null);
  const swipeRef=useRef(null);
  const [phase,setPhase]=useState("intro");
  const [displayScore,setDisplayScore]=useState(0);
  const [isNewBest,setIsNewBest]=useState(false);
  const finalRef=useRef(0);

  function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}
  function rand(sn,ex){let f;do{f={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)};}while(sn.some(s=>s.x===f.x&&s.y===f.y)||(ex&&ex.x===f.x&&ex.y===f.y));return f;}

  function makeSt(){return{snake:[{x:10,y:10},{x:9,y:10},{x:8,y:10}],dir:{x:1,y:0},nextDir:{x:1,y:0},food:{x:15,y:10},bonus:null,bonusT:0,score:0,fr:0,mfr:0,parts:[],floats:[],over:false};}

  function draw(ctx,st){
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,T.bg||'#0d0a1a');g.addColorStop(1,T.surface||'#1a1030');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.03)';
    for(let x=0;x<COLS;x++)for(let y=0;y<ROWS;y++){ctx.beginPath();ctx.arc(x*CELL+CELL/2,y*CELL+CELL/2,1,0,Math.PI*2);ctx.fill();}
    for(let i=st.snake.length-1;i>=0;i--){
      const s=st.snake[i],t=i/Math.max(1,st.snake.length-1);
      const px=s.x*CELL+2,py=s.y*CELL+2,pw=CELL-4,ph=CELL-4;
      if(i===0){ctx.shadowColor=T.a1;ctx.shadowBlur=20;ctx.fillStyle=T.a1;rr(ctx,px-1,py-1,pw+2,ph+2,7);ctx.fill();ctx.shadowBlur=0;
        const d=st.dir,ex=s.x*CELL+CELL/2,ey=s.y*CELL+CELL/2;
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex+d.x*3-d.y*4,ey+d.y*3-d.x*4,2.5,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(ex+d.x*3+d.y*4,ey+d.y*3+d.x*4,2.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#111';ctx.beginPath();ctx.arc(ex+d.x*4.5-d.y*4,ey+d.y*4.5-d.x*4,1.3,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(ex+d.x*4.5+d.y*4,ey+d.y*4.5+d.x*4,1.3,0,Math.PI*2);ctx.fill();
      } else {
        const a=Math.max(0.18,1-t*0.72);
        ctx.globalAlpha=a;ctx.shadowColor=t<0.4?T.a2:T.a3;ctx.shadowBlur=t<0.3?10:4;
        ctx.fillStyle=t<0.4?T.a2:t<0.7?T.a3:T.a4;
        rr(ctx,px,py,pw,ph,4);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;
      }
    }
    const fp=st.food,pulse=Math.sin(st.fr*0.12)*3;
    ctx.shadowColor=T.a1;ctx.shadowBlur=14+pulse;ctx.font=`${CELL}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('💕',fp.x*CELL+CELL/2,fp.y*CELL+CELL/2+1);ctx.shadowBlur=0;
    if(st.bonus){const blink=Math.floor(st.fr/7)%2;if(blink||st.bonusT>180){ctx.shadowColor='#FFD700';ctx.shadowBlur=18;ctx.fillText('💎',st.bonus.x*CELL+CELL/2,st.bonus.y*CELL+CELL/2+1);ctx.shadowBlur=0;}}
    st.parts.forEach(p=>{const a=p.l/p.ml;ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.shadowColor=p.c;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(0.4+a*0.6),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.shadowBlur=0;});
    st.floats.forEach(f=>{const a=f.l/f.ml;ctx.globalAlpha=a;ctx.fillStyle=f.c||T.a1;ctx.font=`800 ${f.sz||16}px Sora,sans-serif`;ctx.textAlign='center';ctx.fillText(f.t,f.x,f.y);ctx.globalAlpha=1;});
  }

  useEffect(()=>{
    if(phase!=='play')return;
    const cv=canvasRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');
    const st=makeSt();stRef.current=st;
    function tick(){
      st.fr++;st.mfr++;
      const mi=Math.max(4,10-Math.floor(st.score*0.28));
      if(st.mfr>=mi){
        st.mfr=0;st.dir={...st.nextDir};
        const h={x:(st.snake[0].x+st.dir.x+COLS)%COLS,y:(st.snake[0].y+st.dir.y+ROWS)%ROWS};
        if(st.snake.slice(1).some(s=>s.x===h.x&&s.y===h.y)){
          finalRef.current=st.score;
          const bst=parseInt(localStorage.getItem('bly_snake_best')||'0');
          if(st.score>bst){localStorage.setItem('bly_snake_best',String(st.score));setIsNewBest(true);}
          if(st.score>0)setCp(p=>p+game.cp);
          draw(ctx,st);setDisplayScore(st.score);setPhase('over');return;
        }
        const af=h.x===st.food.x&&h.y===st.food.y;
        const ab=st.bonus&&h.x===st.bonus.x&&h.y===st.bonus.y;
        st.snake=[h,...st.snake];if(!af&&!ab)st.snake.pop();
        if(af){st.score++;setDisplayScore(st.score);for(let i=0;i<12;i++)st.parts.push({x:h.x*CELL+CELL/2,y:h.y*CELL+CELL/2,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5-2,l:30,ml:30,c:T.a1,s:4});st.floats.push({t:'+1',x:h.x*CELL+CELL/2,y:h.y*CELL,vy:-1.3,l:38,ml:38,c:T.a1,sz:16});st.food=rand(st.snake,st.bonus);if(st.score%5===0){st.bonus=rand(st.snake,st.food);st.bonusT=300;}}
        if(ab){st.score+=3;setDisplayScore(st.score);for(let i=0;i<18;i++)st.parts.push({x:h.x*CELL+CELL/2,y:h.y*CELL+CELL/2,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7-2,l:40,ml:40,c:'#FFD700',s:5});st.floats.push({t:'💎 +3',x:h.x*CELL+CELL/2,y:h.y*CELL,vy:-1.6,l:50,ml:50,c:'#FFD700',sz:20});st.bonus=null;}
      }
      if(st.bonus){st.bonusT--;if(st.bonusT<=0)st.bonus=null;}
      st.parts=st.parts.filter(p=>p.l>0);st.parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.l--;});
      st.floats=st.floats.filter(f=>f.l>0);st.floats.forEach(f=>{f.y+=f.vy;f.l--;});
      draw(ctx,st);
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  const nd=useCallback((nx,ny)=>{const st=stRef.current;if(!st)return;if(st.dir.x===-nx&&st.dir.y===-ny)return;st.nextDir={x:nx,y:ny};},[]);
  function swS(e){const t=e.touches[0];swipeRef.current={x:t.clientX,y:t.clientY};}
  function swE(e){if(!swipeRef.current)return;const t=e.changedTouches[0];const dx=t.clientX-swipeRef.current.x,dy=t.clientY-swipeRef.current.y;swipeRef.current=null;if(Math.abs(dx)<18&&Math.abs(dy)<18)return;if(Math.abs(dx)>Math.abs(dy))nd(dx>0?1:-1,0);else nd(0,dy>0?1:-1);}
  const best=parseInt(localStorage.getItem('bly_snake_best')||'0');
  const csz=Math.min((typeof window!=='undefined'?window.innerWidth:400)-40,400);

  if(phase==='intro')return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span><span style={{fontSize:13,color:T.faint}}>👤 Da solo</span></div>
    <div style={{textAlign:"center",padding:"24px 0"}}>
      <div style={{fontSize:64,marginBottom:16}}>🐍</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginBottom:12}}>Snake Romantico</div>
      <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Mangia i cuori 💕 e cresci a 60fps! Attraversa i muri. Ogni 5 cuori appare il 💎 bonus +3.</div>
      {best>0&&<div style={{marginTop:14,fontSize:13,color:T.a3,fontWeight:700}}>🏆 Record: {best} cuori</div>}
    </div>
    <Btn T={T} grad={G[game.g]} onClick={()=>setPhase('play')}>Inizia 🐍</Btn>
  </div>);

  if(phase==='over')return(<div style={{padding:24,textAlign:"center",paddingTop:60}}>
    {isNewBest&&<WinParticles/>}
    <div style={{fontSize:56,marginBottom:12}}>💕</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>Game Over!</div>
    <div style={{fontSize:52,fontWeight:900,color:T.a1,marginBottom:2}}>{finalRef.current}</div>
    <div style={{fontSize:14,color:T.sub,marginBottom:8}}>cuori mangiati</div>
    {isNewBest&&<div style={{fontSize:15,fontWeight:800,color:T.a3,marginBottom:8}}>🏆 NUOVO RECORD!</div>}
    <div style={{fontSize:13,color:T.faint,marginBottom:4}}>Best: {Math.max(best,finalRef.current)}</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:28}}>{finalRef.current>0?`+${game.cp} punti coppia 💞`:"Riprova!"}</div>
    <Btn T={T} grad={G[game.g]} onClick={()=>{setIsNewBest(false);setPhase('play');}}>Rigioca</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);

  return(<div style={{padding:"16px 16px 90px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Esci</span>
      <span style={{fontSize:16,fontWeight:800,color:T.a1}}>💕 {displayScore}</span>
    </div>
    <div style={{display:"flex",justifyContent:"center"}}>
      <canvas ref={canvasRef} width={W} height={H}
        style={{width:csz,height:csz,borderRadius:18,border:`2px solid ${T.line2}`,display:"block",touchAction:"none",boxShadow:`0 0 40px ${T.a1}22,0 8px 32px rgba(0,0,0,0.3)`}}
        onTouchStart={swS} onTouchEnd={swE}/>
    </div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:14,gap:8}}>
      <DBtn T={T} grad={G[game.g]} on={()=>nd(0,-1)}>▲</DBtn>
      <div style={{display:"flex",gap:48}}>
        <DBtn T={T} grad={G[game.g]} on={()=>nd(-1,0)}>◀</DBtn>
        <DBtn T={T} grad={G[game.g]} on={()=>nd(0,1)}>▼</DBtn>
        <DBtn T={T} grad={G[game.g]} on={()=>nd(1,0)}>▶</DBtn>
      </div>
    </div>
    <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:8}}>Swipe o D-pad · attraversa i muri! 💕</div>
  </div>);
}

// ════════ TRIVIA — quiz ════════
function Trivia({game,onBack,setCp,onToast,T,G}){
  const grad=G[game.g];
  const [cat,setCat]=useState(null); // null = category picker
  const [pool,setPool]=useState([]);
  const [idx,setIdx]=useState(0);const [sel,setSel]=useState(null);
  const [score,setScore]=useState(0);const [pts,setPts]=useState(0);const [streak,setStreak]=useState(0);
  const [time,setTime]=useState(10);const [done,setDone]=useState(false);

  function startCat(cId){
    const filtered=TRIVIA.filter(t=>cId==="all"||t.cat===cId);
    // daily set: same 10 questions per category each day, rotates every 24h
    const catKey=TRIVIA_CATS.findIndex(c=>c.id===cId)+1;
    setPool(dailySet(filtered,Math.min(10,filtered.length),catKey));
    setCat(cId);setIdx(0);setSel(null);setScore(0);setPts(0);setStreak(0);setTime(10);setDone(false);
  }

  useEffect(()=>{
    if(cat===null||done||sel!==null)return;
    if(time<=0){setSel(-1);setStreak(0);return;}
    const t=setTimeout(()=>setTime(v=>v-1),1000);
    return()=>clearTimeout(t);
  },[time,sel,done,cat]);

  // category picker
  if(cat===null)return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{textAlign:"center",marginBottom:24}}>
      <div style={{fontSize:48,marginBottom:10}}>🧠</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:23,fontWeight:800,letterSpacing:-0.4}}>Scegli una categoria</div>
      <div style={{fontSize:14,color:T.sub,marginTop:4}}>10 domande del giorno · più sei veloce, più punti</div>
      <div style={{marginTop:8}}><Countdown T={T} label="Nuove domande tra"/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {TRIVIA_CATS.map(c=>{const n=TRIVIA.filter(t=>c.id==="all"||t.cat===c.id).length;return(
        <div key={c.id} onClick={()=>startCat(c.id)} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,borderRadius:18,padding:"20px 12px",textAlign:"center",cursor:"pointer"}}>
          <div style={{fontSize:34}}>{c.e}</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:800,marginTop:6}}>{c.l}</div>
          <div style={{fontSize:11.5,color:T.faint,marginTop:2}}>{n} domande</div>
        </div>
      );})}
    </div>
  </div>);

  const q=pool[idx];

  function pick(i){
    if(sel!==null)return;setSel(i);
    if(i===q.correct){const combo=streak+1;const diffBonus=(q.lvl||1)*5;const gained=10+time+diffBonus+(combo>=3?10:0);setScore(s=>s+1);setPts(p=>p+gained);setStreak(combo);}
    else setStreak(0);
  }
  function next(){if(idx>=pool.length-1){if(score>0)setCp(p=>p+game.cp);setDone(true);}else{setIdx(x=>x+1);setSel(null);setTime(10);}}

  if(done){const perfect=score===pool.length;return(<div style={{padding:24,textAlign:"center",paddingTop:70}}>
    <div style={{fontSize:60,marginBottom:16}}>{perfect?"🏆":score>=pool.length*0.6?"🧠":"💪"}</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:6}}>{perfect?"Perfetto!":"Quiz completato!"}</div>
    <div style={{fontSize:42,fontWeight:800,color:T.a2,marginBottom:4}}>{score}/{pool.length}</div>
    <div style={{fontSize:15,color:T.a3,fontWeight:700,marginBottom:8}}>{pts} punti quiz</div>
    <div style={{fontSize:13,color:T.faint,marginBottom:30}}>+{game.cp} punti connessione · sfidate il partner sullo stesso tema!</div>
    <Btn T={T} grad={grad} onClick={()=>setCat(null)}>Altra categoria</Btn>
    <Btn T={T} variant="ghost" onClick={onBack} style={{marginTop:10}}>Concludi</Btn>
  </div>);}

  const lvlLabel=q.lvl===3?"Difficile":q.lvl===2?"Media":"Facile";
  const lvlCol=q.lvl===3?T.a1:q.lvl===2?T.a3:T.a4;
  return(<div style={{padding:20,paddingBottom:90}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <span onClick={()=>setCat(null)} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Categorie</span>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        {streak>=2&&<span style={{fontSize:12,fontWeight:800,color:T.a1}}>🔥{streak}</span>}
        <span style={{fontSize:13,fontWeight:700,color:T.a3}}>{pts} pt</span>
        <span style={{fontSize:13,color:T.faint}}>{idx+1}/{pool.length}</span>
      </div>
    </div>
    {/* Timer ring */}
    <div style={{height:6,background:T.surface2,borderRadius:6,overflow:"hidden",marginBottom:4}}>
      <div style={{width:`${(time/10)*100}%`,height:"100%",background:time<=3?G.a1:grad,borderRadius:6,transition:"width 1s linear"}}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <span style={{fontSize:11,fontWeight:800,color:lvlCol,background:`${lvlCol}1A`,borderRadius:10,padding:"3px 9px"}}>{lvlLabel}</span>
      <span style={{fontSize:12,fontWeight:700,color:time<=3?T.a1:T.faint}}>{sel===null?`${time}s`:"—"}</span>
    </div>
    <div style={{margin:"10px 0 24px",minHeight:80,display:"flex",alignItems:"center"}}><div style={{fontSize:20,fontWeight:700,lineHeight:1.4,textAlign:"center"}}>{q.q}</div></div>
    {q.opts.map((o,i)=>{
      const reveal=sel!==null, isC=reveal&&i===q.correct, isW=sel===i&&i!==q.correct;
      return <div key={i} onClick={()=>pick(i)} style={{padding:"16px 18px",borderRadius:16,marginBottom:12,cursor:sel===null?"pointer":"default",background:isC?G.a4:isW?G.a1:T.surface,color:isC||isW?"#fff":T.text,border:`1px solid ${isC||isW?"transparent":T.line2}`,fontSize:15,fontWeight:600,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:reveal&&!isC&&!isW?0.5:1}}>{o}{isC&&<span>✓</span>}{isW&&<span>✕</span>}</div>;
    })}
    {sel!==null&&<Btn T={T} grad={grad} onClick={next} style={{marginTop:8}}>{idx>=pool.length-1?"Vedi risultato":"Prossima →"}</Btn>}
  </div>);
}

// ════════ EXPERTS ════════
function Experts({onToast,setCp,T,G}){
  const [open,setOpen]=useState(null);
  const [filter,setFilter]=useState("all");
  const key=e=>`${e.author}|${e.title}`;

  if(open){const e=open;const grad=G[e.g];const already=READ_ARTICLES.has(key(e));
    return(<div style={{padding:20,paddingBottom:90}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><span onClick={()=>setOpen(null)} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:18}}><div style={{width:56,height:56,borderRadius:"50%",background:grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{e.av}</div><div><div style={{fontSize:15,fontWeight:700}}>{e.author}</div><div style={{fontSize:13,color:T.a2,fontWeight:700}}>{e.role} · {e.origin}</div></div></div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:25,fontWeight:800,lineHeight:1.3,letterSpacing:-0.5,marginBottom:6}}>{e.title}</div>
      <div style={{fontSize:13,color:T.faint,marginBottom:18}}>📚 Fonte: {e.src} · {e.min}</div>
      <div style={{fontSize:16,color:T.sub,lineHeight:1.7,marginBottom:26,fontStyle:"italic"}}>{e.intro}</div>
      {e.pts.map((p,i)=>(<div key={i} style={{display:"flex",gap:14,marginBottom:18}}><div style={{width:28,height:28,borderRadius:"50%",background:grad,color:"#fff",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div><div style={{fontSize:15,lineHeight:1.55,paddingTop:3}}>{p}</div></div>))}
      <div style={{fontSize:11.5,color:T.faint,lineHeight:1.5,background:T.surface2,borderRadius:12,padding:"11px 13px",marginTop:6,marginBottom:4}}>ℹ️ Divulgazione basata su ricerche e libri pubblici di {e.author}. Bondly non sostituisce un percorso con un professionista.</div>
      {already
        ? <div style={{marginTop:12,background:`${T.a4}12`,border:`1px solid ${T.a4}33`,borderRadius:16,padding:"14px 16px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:T.a4}}>✓ Già letto</div><div style={{fontSize:12.5,color:T.sub,marginTop:2}}>Ricompensa già riscossa</div></div>
        : <Btn T={T} grad={grad} onClick={()=>{READ_ARTICLES.add(key(e));_lsSet('bly_read_arts',[...READ_ARTICLES]);setCp(p=>p+30);onToast("+30 punti · articolo letto");setOpen(null);}} style={{marginTop:12}}>Ho letto · +30 punti</Btn>}
    </div>);
  }
  return(<div style={{paddingBottom:90}}>
    <div style={{padding:"18px 18px 0"}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.6}}>Esperti</div><div style={{fontSize:14,color:T.sub,marginTop:3}}>Metodi reali dei migliori esperti · spiegati semplici</div></div>

    {/* New articles countdown */}
    <div style={{padding:"12px 18px 0"}}>
      <div style={{background:`${T.a3}10`,border:`1px solid ${T.a3}30`,borderRadius:14,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>🌍</span>
        <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:700}}>Nuovi articoli dai migliori esperti</div><div style={{fontSize:11.5,color:T.sub,marginTop:1}}><Countdown T={T} label="Prossimi tra"/></div></div>
      </div>
    </div>

    {/* Field filter chips */}
    <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",padding:"14px 18px 4px"}}>
      <button onClick={()=>setFilter("all")} style={{background:filter==="all"?G.hero:T.surface,color:filter==="all"?"#fff":T.sub,border:filter==="all"?"none":`1px solid ${T.line2}`,borderRadius:16,padding:"8px 14px",fontSize:12.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>Tutti</button>
      {EXPERT_FIELDS.map(f=>(<button key={f.id} onClick={()=>setFilter(f.id)} style={{background:filter===f.id?G.hero:T.surface,color:filter===f.id?"#fff":T.sub,border:filter===f.id?"none":`1px solid ${T.line2}`,borderRadius:16,padding:"8px 14px",fontSize:12.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{f.emoji} {f.name}</button>))}
    </div>

    {/* Sections by field */}
    {EXPERT_FIELDS.filter(f=>filter==="all"||filter===f.id).map(f=>{
      // unread first, read pushed to the bottom
      const list=EXPERTS.filter(e=>e.field===f.id).slice().sort((a,b)=>(READ_ARTICLES.has(key(a))?1:0)-(READ_ARTICLES.has(key(b))?1:0));
      if(list.length===0)return null;
      return(
        <div key={f.id} style={{marginTop:18}}>
          <div style={{display:"flex",alignItems:"center",gap:11,padding:"0 18px 12px"}}>
            <div style={{width:40,height:40,borderRadius:12,background:G[f.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{f.emoji}</div>
            <div style={{flex:1}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:800,letterSpacing:-0.3}}>{f.name}</div><div style={{fontSize:12,color:T.sub}}>{f.sub}</div></div>
            <span style={{fontSize:12,color:T.faint,fontWeight:600}}>{list.length}</span>
          </div>
          <div style={{padding:"0 18px"}}>
            {list.map((e,i)=>{const read=READ_ARTICLES.has(key(e));return(
              <div key={i} onClick={()=>setOpen(e)} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,marginBottom:11,cursor:"pointer",border:`1px solid ${T.line}`,opacity:read?0.6:1}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:G[e.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>{e.av}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>{e.author}</div><div style={{fontSize:12,color:T.sub}}>{e.role} · {e.origin}</div></div>
                  {read&&<span style={{fontSize:10.5,fontWeight:800,color:T.a4,background:`${T.a4}16`,borderRadius:10,padding:"3px 9px",whiteSpace:"nowrap"}}>✓ Già letto</span>}
                </div>
                <div style={{fontSize:16,fontWeight:700,marginBottom:7,letterSpacing:-0.3}}>{e.title}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11.5,color:T.faint,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginRight:8}}>📚 {e.src} · {e.min}</span><span style={{fontSize:13,fontWeight:700,color:read?T.faint:T.a2,whiteSpace:"nowrap"}}>{read?"Riscossa":"Leggi ›"}</span></div>
              </div>
            );})}
          </div>
        </div>
      );
    })}
  </div>);
}

// ════════ REWARDS ════════
function Rewards({wallet,setWallet,tokens,setTokens,tickets,setTickets,onToast,T,G}){
  const [sel,setSel]=useState(null);
  const [dests,setDests]=useState(DESTS);
  const [adsToday,setAdsToday]=useState(4);
  const [tab2,setTab2]=useState("earn");
  const [detail,setDetail]=useState(null);   // open destination detail
  const [showAdd,setShowAdd]=useState(false); // add custom destination
  function watchAd(i){if(adsToday>=20){onToast("✅ Limite giornaliero raggiunto");return;}setDests(ds=>ds.map((d,j)=>j===i?{...d,saved:Math.min(d.saved+0.05,d.cost)}:d));setWallet(w=>w+0.05);setAdsToday(n=>n+1);onToast("📺 +€0.05 nel salvadanaio!");}
  function addDest(idea){setDests(ds=>[...ds,{...idea,saved:0,hero:`${idea.name}, ${idea.country}`,desc:"Una nuova meta da sognare insieme.",best:"Da scoprire",fly:"—",budget:"—",see:[]}]);setShowAdd(false);onToast(`✨ ${idea.name} aggiunta ai vostri sogni!`);}

  // ── DESTINATION DETAIL ──
  if(detail!==null){
    const d=dests[detail];
    return(<div style={{paddingBottom:90}}>
      <div style={{height:170,background:G[d.g],position:"relative"}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:90,opacity:0.25}}>{d.emoji}</div>
        <span onClick={()=>setDetail(null)} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.25)",borderRadius:20,padding:"6px 14px",fontSize:14,color:"#fff",cursor:"pointer",fontWeight:600}}>← Indietro</span>
        <div style={{position:"absolute",bottom:16,left:18,color:"#fff"}}>
          <div style={{fontSize:13,fontWeight:600,opacity:0.9}}>{d.tag} · {d.country}</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:28,fontWeight:800,letterSpacing:-0.5}}>{d.emoji} {d.name}</div>
        </div>
      </div>
      <div style={{padding:"18px 18px 0"}}>
        <div style={{fontSize:17,fontWeight:700,lineHeight:1.4,marginBottom:8}}>{d.hero}</div>
        <div style={{fontSize:14,color:T.sub,lineHeight:1.6,marginBottom:16}}>{d.desc}</div>
        {/* Quick info */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
          {[["📅",d.best,"Periodo"],["✈️",d.fly,"Volo"],["🏨",d.budget,"Hotel"]].map(([e,v,l],i)=>(
            <div key={i} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:14,padding:"12px 8px",textAlign:"center",border:`1px solid ${T.line}`}}><div style={{fontSize:16}}>{e}</div><div style={{fontSize:12,fontWeight:700,marginTop:3}}>{v}</div><div style={{fontSize:10,color:T.faint,marginTop:1}}>{l}</div></div>
          ))}
        </div>
        {/* What to see */}
        {d.see&&d.see.length>0&&(<>
          <div style={{fontSize:14,fontWeight:800,marginBottom:12}}>✨ Cosa vedere insieme</div>
          {d.see.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:14,marginBottom:12,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:16,padding:14,border:`1px solid ${T.line}`}}>
              <div style={{width:46,height:46,borderRadius:13,background:G[d.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{s.e}</div>
              <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{s.t}</div><div style={{fontSize:13,color:T.sub,lineHeight:1.5}}>{s.d}</div></div>
            </div>
          ))}
        </>)}
        {/* Savings */}
        <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:18,marginTop:8,border:`1px solid ${T.line}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:14,fontWeight:700}}>💰 Salvadanaio per {d.name}</span>
            <span style={{fontSize:13,color:T.a3,fontWeight:700}}>€{fmt(d.saved)} / €{d.cost}</span>
          </div>
          <Bar pct={(d.saved/d.cost)*100} grad={G[d.g]} h={10} T={T}/>
          <Btn T={T} grad={G[d.g]} disabled={adsToday>=20} onClick={()=>watchAd(detail)} style={{marginTop:14}}>{adsToday>=20?"Limite ads raggiunto":`📺 Guarda ads → +€0.05 per ${d.name}`}</Btn>
        </div>
      </div>
    </div>);
  }

  return(<div style={{paddingBottom:90}}>
    <div style={{padding:"18px 18px 0"}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.6}}>Salvadanaio</div><div style={{fontSize:14,color:T.sub,marginTop:3}}>💞 Fondo comune della coppia · denaro reale verso i vostri sogni</div></div>

    {/* Hero: Salvadanaio + Lotteria side by side */}
    <div style={{padding:"16px 18px",display:"flex",gap:12}}>
      <div style={{flex:1.15,borderRadius:20,padding:18,background:G.a3,color:"#fff"}}>
        <div style={{fontSize:12,fontWeight:600,opacity:0.85}}>💰 Salvadanaio di coppia</div>
        <div style={{fontSize:30,fontWeight:800,letterSpacing:-1,marginTop:4}}>€{fmt(wallet)}</div>
        <div style={{fontSize:11,opacity:0.9,marginTop:4}}>Di entrambi · Ads oggi: {adsToday}/20</div>
      </div>
      <div onClick={()=>setTab2("lottery")} style={{flex:1,borderRadius:20,padding:18,background:G.hero,color:"#fff",cursor:"pointer",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-12,right:-8,fontSize:64,opacity:0.2}}>🎟️</div>
        <div style={{position:"relative"}}>
          <div style={{fontSize:12,fontWeight:600,opacity:0.9}}>🎟️ Lotteria</div>
          <div style={{fontSize:30,fontWeight:800,marginTop:4}}>{tickets}</div>
          <div style={{fontSize:11,opacity:0.92,marginTop:4}}>biglietti di coppia →</div>
        </div>
      </div>
    </div>

    {/* Toggle */}
    <div style={{display:"flex",gap:8,padding:"4px 18px 0"}}>
      {[["earn","💰 Accumula"],["spend","🎁 Riscatta"],["lottery","🎟️ Lotteria"]].map(([id,l])=>(
        <button key={id} onClick={()=>setTab2(id)} style={{flex:1,background:tab2===id?G.hero:T.surface,color:tab2===id?"#fff":T.sub,border:tab2===id?"none":`1px solid ${T.line2}`,borderRadius:14,padding:"11px 6px",fontSize:12.5,fontWeight:700,cursor:"pointer"}}>{l}</button>
      ))}
    </div>

    {tab2==="lottery"&&<LotteryPanel tokens={tokens} setTokens={setTokens} tickets={tickets} setTickets={setTickets} onToast={onToast} T={T} G={G}/>}

    {tab2==="earn"&&(<div style={{padding:"16px 18px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:13,color:T.sub,lineHeight:1.5,flex:1,paddingRight:10}}>Scegliete le vostre mete e guardate brevi video: il salvadanaio cresce verso quel viaggio 🌍</div>
        <button onClick={()=>setShowAdd(true)} style={{background:G.hero,color:"#fff",border:"none",borderRadius:12,padding:"8px 14px",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>+ Aggiungi</button>
      </div>
      {dests.map((d,i)=>(
        <div key={i} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,marginBottom:12,border:`1px solid ${T.line}`}}>
          <div onClick={()=>setDetail(i)} style={{display:"flex",gap:14,alignItems:"center",marginBottom:12,cursor:"pointer"}}>
            <div style={{width:50,height:50,borderRadius:14,background:G[d.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{d.emoji}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:15,fontWeight:700}}>{d.name}</span><span style={{fontSize:11,color:T.faint}}>{d.tag}</span></div>
              <Bar pct={(d.saved/d.cost)*100} grad={G[d.g]} h={6} T={T}/>
              <div style={{fontSize:12,color:T.faint,marginTop:4}}>€{fmt(d.saved)} di €{d.cost}</div>
            </div>
            <span style={{fontSize:18,color:T.faint}}>›</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn T={T} grad={G[d.g]} disabled={adsToday>=20} onClick={()=>watchAd(i)} style={{fontSize:13,padding:"10px",flex:2}}>{adsToday>=20?"Limite":"📺 +€0.05"}</Btn>
            <Btn T={T} variant="soft" onClick={()=>setDetail(i)} style={{fontSize:13,padding:"10px",flex:1}}>Scopri →</Btn>
          </div>
        </div>
      ))}
    </div>)}

    {tab2==="spend"&&(<div style={{padding:"16px 18px 0"}}>
      <div style={{fontSize:13,color:T.sub,marginBottom:14,lineHeight:1.5}}>Converti il salvadanaio in buoni reali dei migliori brand 🎁</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {REWARDS.map((r,i)=>{const can=wallet>=r.from;return(
          <div key={i} onClick={()=>setSel(r)} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,cursor:"pointer",border:`1px solid ${T.line}`,opacity:can?1:0.6,position:"relative"}}>
            {r.hot&&<div style={{position:"absolute",top:12,right:12}}><Pill grad={G.a1}>🔥</Pill></div>}
            <div style={{width:46,height:46,borderRadius:14,background:G[r.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:10}}>{r.emoji}</div>
            <div style={{fontSize:15,fontWeight:700}}>{r.brand}</div>
            <div style={{fontSize:12,color:can?T.a4:T.faint,fontWeight:700,marginTop:6}}>{can?`✓ Da €${r.from}`:`Min €${r.from}`}</div>
          </div>
        );})}
      </div>
    </div>)}

    {/* Add destination sheet */}
    {showAdd&&(<Sheet onClose={()=>setShowAdd(false)} T={T}>
      <div style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800}}>✨ Scegliete una meta</div><span onClick={()=>setShowAdd(false)} style={{fontSize:22,color:T.sub,cursor:"pointer"}}>✕</span></div>
        <div style={{fontSize:13,color:T.sub,marginBottom:18}}>Aggiungete il vostro prossimo sogno al salvadanaio</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {DEST_IDEAS.filter(idea=>!dests.find(d=>d.name===idea.name)).map((idea,i)=>(
            <div key={i} onClick={()=>addDest(idea)} style={{background:T.surface2,borderRadius:18,padding:16,cursor:"pointer",border:`1px solid ${T.line}`}}>
              <div style={{width:46,height:46,borderRadius:13,background:G[idea.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:10}}>{idea.emoji}</div>
              <div style={{fontSize:15,fontWeight:700}}>{idea.name}</div>
              <div style={{fontSize:12,color:T.sub,marginTop:2}}>{idea.tag} · €{idea.cost}</div>
            </div>
          ))}
        </div>
      </div>
    </Sheet>)}

    {sel&&(<Sheet onClose={()=>setSel(null)} T={T}>
      <div style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}><div style={{width:48,height:48,borderRadius:14,background:G[sel.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{sel.emoji}</div><div><div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800}}>{sel.brand}</div><div style={{fontSize:12,color:T.sub}}>Buono digitale reale</div></div></div>
          <span onClick={()=>setSel(null)} style={{fontSize:22,color:T.sub,cursor:"pointer"}}>✕</span>
        </div>
        <div style={{background:T.surface2,borderRadius:16,padding:16,marginBottom:18}}><div style={{fontSize:13,color:T.sub,lineHeight:1.6}}>Saldo: <b style={{color:T.a3}}>€{fmt(wallet)}</b> · Buono minimo: <b style={{color:T.text}}>€{sel.from}</b></div></div>
        <Btn T={T} grad={G[sel.g]} disabled={wallet<sel.from} onClick={()=>{setWallet(w=>w-sel.from);onToast(`🎁 Buono ${sel.brand} da €${sel.from} richiesto!`);setSel(null);}}>{wallet<sel.from?`Mancano €${fmt(sel.from-wallet)}`:`Riscatta €${sel.from}`}</Btn>
      </div>
    </Sheet>)}
  </div>);
}

// ════════ PET — little cartoon creatures (4 legs, tail, ears) ════════
function PetSVG({id,x=68,y=110,scale=1}){
  // each pet drawn in its own ~40x40 local space, then translated/scaled
  const shade=(hex,amt=0.85)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=Math.round(r*amt);g=Math.round(g*amt);b=Math.round(b*amt);return`#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;};
  const body=(col)=>{
    const dk=shade(col,0.8);
    return(<g>
      {/* shadow */}
      <ellipse cx="20" cy="37" rx="13" ry="2.6" fill="#000" opacity="0.12"/>
      {/* back legs */}
      <rect x="11" y="28" width="5" height="9" rx="2.5" fill={dk}/>
      <rect x="24" y="28" width="5" height="9" rx="2.5" fill={dk}/>
      {/* front legs */}
      <rect x="13" y="29" width="5" height="9" rx="2.5" fill={col}/>
      <rect x="22" y="29" width="5" height="9" rx="2.5" fill={col}/>
      {/* body (plump) */}
      <ellipse cx="20" cy="25" rx="13" ry="10" fill={col}/>
    </g>);
  };
  const PETS={
    dog:(<g>{body("#C8924E")}
      <ellipse cx="20" cy="33" rx="4" ry="3" fill="#A8742E"/>{/* tail */}<path d="M32 22 Q39 18 37 12 Q34 16 31 19 Z" fill="#C8924E"/>
      {/* head */}<circle cx="20" cy="14" r="9" fill="#C8924E"/>{/* ears */}<ellipse cx="12" cy="11" rx="3" ry="6" fill="#A8742E"/><ellipse cx="28" cy="11" rx="3" ry="6" fill="#A8742E"/>
      {/* face */}<circle cx="17" cy="13" r="1.3" fill="#2B2B2B"/><circle cx="23" cy="13" r="1.3" fill="#2B2B2B"/><ellipse cx="20" cy="16" rx="2" ry="1.5" fill="#4A3520"/><path d="M20 17 Q18 19 16 18 M20 17 Q22 19 24 18" stroke="#2B2B2B" strokeWidth="0.6" fill="none"/>
    </g>),
    cat:(<g>{body("#E0A85C")}
      <path d="M32 24 Q40 22 39 14 Q35 19 31 21 Z" fill="#E0A85C"/>{/* tail */}
      <circle cx="20" cy="14" r="9" fill="#E0A85C"/>{/* pointy ears */}<path d="M11 9 L9 2 L16 7 Z" fill="#E0A85C"/><path d="M29 9 L31 2 L24 7 Z" fill="#E0A85C"/><path d="M12 8 L11 4 L14 7 Z" fill="#FF9EC4"/><path d="M28 8 L29 4 L26 7 Z" fill="#FF9EC4"/>
      <ellipse cx="17" cy="13" rx="1.3" ry="1.8" fill="#2B7A3B"/><ellipse cx="23" cy="13" rx="1.3" ry="1.8" fill="#2B7A3B"/><path d="M20 15 l-1.5 1.5 h3 Z" fill="#FF9EC4"/><path d="M14 14 L9 13 M14 16 L9 17 M26 14 L31 13 M26 16 L31 17" stroke="#fff" strokeWidth="0.5"/>
    </g>),
    bunny:(<g>{body("#F0E6E0")}
      <circle cx="32" cy="30" r="3.5" fill="#fff"/>{/* fluffy tail */}
      <circle cx="20" cy="14" r="8.5" fill="#F0E6E0"/>{/* long ears */}<ellipse cx="16" cy="4" rx="2.5" ry="7" fill="#F0E6E0"/><ellipse cx="24" cy="4" rx="2.5" ry="7" fill="#F0E6E0"/><ellipse cx="16" cy="4" rx="1.2" ry="5" fill="#FF9EC4"/><ellipse cx="24" cy="4" rx="1.2" ry="5" fill="#FF9EC4"/>
      <circle cx="17" cy="13" r="1.3" fill="#2B2B2B"/><circle cx="23" cy="13" r="1.3" fill="#2B2B2B"/><path d="M20 15 l-1 1 h2 Z" fill="#FF9EC4"/>
    </g>),
    fox:(<g>{body("#FF7A3D")}
      <path d="M32 24 Q41 24 40 14 Q35 20 31 21 Z" fill="#FF7A3D"/><path d="M38 18 Q40 16 39.5 14 Q37 17 36 18 Z" fill="#fff"/>{/* tail tip */}
      <circle cx="20" cy="14" r="9" fill="#FF7A3D"/><path d="M11 9 L8 1 L16 7 Z" fill="#FF7A3D"/><path d="M29 9 L32 1 L24 7 Z" fill="#FF7A3D"/><path d="M12 8 L11 4 L14 7 Z" fill="#2B2B2B"/><path d="M28 8 L29 4 L26 7 Z" fill="#2B2B2B"/>
      <path d="M14 16 Q20 22 26 16 L24 12 Q20 14 16 12 Z" fill="#fff"/><circle cx="17" cy="12" r="1.3" fill="#2B2B2B"/><circle cx="23" cy="12" r="1.3" fill="#2B2B2B"/><circle cx="20" cy="16" r="1.3" fill="#2B2B2B"/>
    </g>),
    panda:(<g>{body("#FFFFFF")}
      <circle cx="20" cy="14" r="9" fill="#fff"/><circle cx="12" cy="7" r="3.5" fill="#2B2B2B"/><circle cx="28" cy="7" r="3.5" fill="#2B2B2B"/>{/* ears */}
      <ellipse cx="16" cy="13" rx="2.5" ry="3" fill="#2B2B2B"/><ellipse cx="24" cy="13" rx="2.5" ry="3" fill="#2B2B2B"/><circle cx="16" cy="13" r="1" fill="#fff"/><circle cx="24" cy="13" r="1" fill="#fff"/><circle cx="20" cy="16" r="1.3" fill="#2B2B2B"/>
      <rect x="13" y="29" width="5" height="9" rx="2.5" fill="#2B2B2B"/><rect x="22" y="29" width="5" height="9" rx="2.5" fill="#2B2B2B"/>
    </g>),
    penguin:(<g>
      <ellipse cx="20" cy="37" rx="11" ry="2.4" fill="#000" opacity="0.12"/>
      <ellipse cx="20" cy="24" rx="11" ry="13" fill="#2B2B3A"/><ellipse cx="20" cy="26" rx="7" ry="10" fill="#fff"/>{/* feet */}<path d="M15 36 l-3 2 h5 Z" fill="#FF9E3D"/><path d="M25 36 l3 2 h-5 Z" fill="#FF9E3D"/>
      {/* wings */}<ellipse cx="9" cy="24" rx="2.5" ry="8" fill="#1E1E2A"/><ellipse cx="31" cy="24" rx="2.5" ry="8" fill="#1E1E2A"/>
      <circle cx="17" cy="16" r="1.3" fill="#2B2B2B"/><circle cx="23" cy="16" r="1.3" fill="#2B2B2B"/><path d="M20 18 l-2 2 h4 Z" fill="#FF9E3D"/>
    </g>),
    dragon:(<g>
      {/* wings behind */}<path d="M8 18 Q-2 10 2 24 Q6 20 12 22 Z" fill="#7C4FD6"/><path d="M32 18 Q42 10 38 24 Q34 20 28 22 Z" fill="#7C4FD6"/>
      {body("#7BD88F")}
      <path d="M32 24 Q40 22 40 30 Q36 26 31 26 Z" fill="#7BD88F"/>{/* tail */}<path d="M38 29 l3 -1 l-1 3 Z" fill="#FFD166"/>
      <circle cx="20" cy="14" r="9" fill="#7BD88F"/>{/* horns */}<path d="M14 7 L13 2 L17 6 Z" fill="#FFD166"/><path d="M26 7 L27 2 L23 6 Z" fill="#FFD166"/>{/* spikes */}<path d="M20 5 L18 8 L22 8 Z" fill="#5BAE6E"/>
      <circle cx="17" cy="13" r="1.3" fill="#2B2B2B"/><circle cx="23" cy="13" r="1.3" fill="#2B2B2B"/><path d="M16 16 h2 M24 16 h-2" stroke="#2B2B2B" strokeWidth="0.7"/><path d="M18 17 Q20 19 22 17" stroke="#2B2B2B" strokeWidth="0.7" fill="none"/>
    </g>),
    unicornpet:(<g>{body("#F4E1F7")}
      <path d="M32 24 Q41 20 40 30 Q35 25 31 26 Z" fill="#FF9EC4"/>{/* tail */}<path d="M37 22 Q41 22 40 28" stroke="#A18CD1" strokeWidth="1.5" fill="none"/>
      <circle cx="20" cy="14" r="9" fill="#F4E1F7"/>{/* horn */}<path d="M20 5 L18.5 -2 L21.5 -2 Z" fill="#FFD166"/><path d="M19 1 L21 1 M18.7 3 L21.3 3" stroke="#fff" strokeWidth="0.5"/>
      {/* mane */}<path d="M11 9 Q8 14 11 19" stroke="#FF9EC4" strokeWidth="2.5" fill="none"/><ellipse cx="12" cy="11" rx="2" ry="3.5" fill="#F4E1F7"/><ellipse cx="28" cy="11" rx="2" ry="3.5" fill="#F4E1F7"/>
      <circle cx="17" cy="13" r="1.3" fill="#2B2B2B"/><circle cx="23" cy="13" r="1.3" fill="#2B2B2B"/><circle cx="14" cy="16" r="1.5" fill="#FF9EC4" opacity="0.5"/><circle cx="26" cy="16" r="1.5" fill="#FF9EC4" opacity="0.5"/>
    </g>),
    bird:(<g>
      <ellipse cx="20" cy="37" rx="8" ry="2" fill="#000" opacity="0.12"/>
      <ellipse cx="20" cy="24" rx="9" ry="10" fill="#5BB8F0"/><ellipse cx="20" cy="27" rx="5.5" ry="6" fill="#BDE6FF"/>
      {/* wings */}<ellipse cx="10" cy="24" rx="3" ry="7" fill="#3D9BE0"/><ellipse cx="30" cy="24" rx="3" ry="7" fill="#3D9BE0"/>
      {/* tail */}<path d="M20 33 l-3 5 h6 Z" fill="#3D9BE0"/>{/* feet */}<path d="M18 34 v3 M22 34 v3" stroke="#FF9E3D" strokeWidth="1"/>
      <circle cx="20" cy="14" r="7" fill="#5BB8F0"/><circle cx="17" cy="13" r="1.2" fill="#2B2B2B"/><circle cx="23" cy="13" r="1.2" fill="#2B2B2B"/><path d="M20 15 l-3 1.5 l3 1.5 Z" fill="#FF9E3D"/>
    </g>),
  };
  if(!PETS[id])return null;
  return <g transform={`translate(${x-20*scale} ${y-20*scale}) scale(${scale})`}>{PETS[id]}</g>;
}

// ════════ AVATAR RENDER (full-body SVG cartoon) ════════
function Avatar({data,T,G,size=120,bg=false}){
  const d=data;
  const W=100,H=160;
  const bgItem=AV_BG.find(b=>b.id===d.bg)||AV_BG[0];
  const petItem=AV_PET.find(p=>p.id===d.pet);
  const uid=`${d.name}-${d.skin}`.replace(/[^a-zA-Z0-9]/g,"");
  // darker shade of a hex color for shadows
  const shade=(hex,amt=0.82)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g2=(n>>8)&255,b=n&255;r=Math.round(r*amt);g2=Math.round(g2*amt);b=Math.round(b*amt);return`#${((1<<24)+(r<<16)+(g2<<8)+b).toString(16).slice(1)}`;};
  const skinShade=shade(d.skin,0.93);
  const topShade=shade(d.topColor,0.88);
  // hair path by style
  const hair=()=>{
    switch(d.hair){
      case"long":return <path d="M26 40 Q26 13 50 13 Q74 13 74 40 L76 82 Q76 66 69 60 L69 40 Q50 29 31 40 L31 60 Q24 66 24 82 Z" fill={`url(#hair-${uid})`}/>;
      case"bun":return <g><circle cx="50" cy="13" r="10" fill={`url(#hair-${uid})`}/><path d="M28 41 Q28 19 50 19 Q72 19 72 41 Q72 30 50 30 Q28 30 28 41 Z" fill={`url(#hair-${uid})`}/></g>;
      case"curly":return <g fill={`url(#hair-${uid})`}><circle cx="31" cy="28" r="10"/><circle cx="50" cy="21" r="11"/><circle cx="69" cy="28" r="10"/><circle cx="27" cy="43" r="8"/><circle cx="73" cy="43" r="8"/></g>;
      case"buzz":return <path d="M29 39 Q29 17 50 17 Q71 17 71 39 Q71 29 50 29 Q29 29 29 39 Z" fill={d.hairColor} opacity="0.9"/>;
      case"pony":return <g fill={`url(#hair-${uid})`}><path d="M29 41 Q29 18 50 18 Q71 18 71 41 Q71 29 50 29 Q29 29 29 41 Z"/><path d="M70 33 Q86 40 81 70 Q77 58 69 53 Z"/></g>;
      case"wavy":return <path d="M27 41 Q25 15 50 14 Q75 15 73 41 Q73 30 64 32 Q60 25 50 27 Q40 25 36 32 Q27 30 27 41 Z" fill={`url(#hair-${uid})`}/>;
      case"mohawk":return <g fill={d.hairColor}><path d="M45 11 L55 11 L54 31 L46 31 Z"/><path d="M33 35 Q33 31 40 31 L40 37 Z M67 35 Q67 31 60 31 L60 37 Z" opacity="0.7"/></g>;
      case"crew":return <path d="M30 38 Q30 19 50 19 Q70 19 70 38 Q70 30 50 30 Q30 30 30 38 Z" fill={`url(#hair-${uid})`}/>;
      case"side":return <g fill={`url(#hair-${uid})`}><path d="M28 41 Q28 16 50 16 Q72 16 72 41 Q72 27 50 27 Q28 27 28 41 Z"/><path d="M28 28 Q44 20 60 24 L58 30 Q44 26 30 32 Z" opacity="0.85"/></g>;
      case"afro":return <g fill={`url(#hair-${uid})`}><circle cx="50" cy="26" r="22"/><circle cx="30" cy="34" r="10"/><circle cx="70" cy="34" r="10"/></g>;
      case"bob":return <path d="M26 42 Q26 14 50 14 Q74 14 74 42 L74 56 Q74 48 68 46 L68 40 Q50 30 32 40 L32 46 Q26 48 26 56 Z" fill={`url(#hair-${uid})`}/>;
      case"messy":return <g fill={`url(#hair-${uid})`}><path d="M27 40 Q25 16 50 15 Q75 16 73 40 Q73 30 64 31 Q62 24 54 27 Q50 22 46 27 Q38 24 36 31 Q27 30 27 40 Z"/><circle cx="34" cy="20" r="4"/><circle cx="66" cy="20" r="4"/></g>;
      case"wavylong":return <path d="M25 40 Q25 12 50 12 Q75 12 75 40 Q78 60 73 84 Q71 74 68 70 Q72 56 68 44 Q50 30 32 44 Q28 56 32 70 Q29 74 27 84 Q22 60 25 40 Z" fill={`url(#hair-${uid})`}/>;
      case"braids":return <g fill={`url(#hair-${uid})`}><path d="M28 40 Q28 15 50 15 Q72 15 72 40 Q72 27 50 27 Q28 27 28 40 Z"/><g><circle cx="28" cy="48" r="3"/><circle cx="28" cy="56" r="3"/><circle cx="28" cy="64" r="3"/><circle cx="72" cy="48" r="3"/><circle cx="72" cy="56" r="3"/><circle cx="72" cy="64" r="3"/></g></g>;
      case"twin":return <g fill={`url(#hair-${uid})`}><path d="M28 40 Q28 15 50 15 Q72 15 72 40 Q72 27 50 27 Q28 27 28 40 Z"/><circle cx="26" cy="46" r="7"/><circle cx="74" cy="46" r="7"/></g>;
      case"quiff":return <g fill={`url(#hair-${uid})`}><path d="M29 40 Q29 16 50 16 Q71 16 71 40 Q71 28 50 28 Q29 28 29 40 Z"/><path d="M40 18 Q46 6 58 12 Q52 12 49 20 Q44 16 40 18 Z"/><path d="M30 30 Q40 24 52 26" stroke="#fff" strokeWidth="0.7" opacity="0.25" fill="none"/></g>;
      case"fade":return <g><path d="M30 38 Q30 18 50 18 Q70 18 70 38 Q70 30 50 30 Q30 30 30 38 Z" fill={`url(#hair-${uid})`}/><path d="M30 38 Q30 33 33 32 L67 32 Q70 33 70 38 Q70 35 50 35 Q30 35 30 38 Z" fill={d.hairColor} opacity="0.4"/></g>;
      case"slick":return <g fill={`url(#hair-${uid})`}><path d="M29 39 Q29 16 50 16 Q71 16 71 39 Q71 27 50 27 Q29 27 29 39 Z"/><path d="M32 24 Q50 18 68 24" stroke="#fff" strokeWidth="0.8" opacity="0.3" fill="none"/><path d="M34 30 Q50 25 66 30" stroke="#fff" strokeWidth="0.6" opacity="0.22" fill="none"/></g>;
      case"curtains":return <g fill={`url(#hair-${uid})`}><path d="M28 41 Q28 15 50 15 Q72 15 72 41 Q72 27 50 27 Q28 27 28 41 Z"/><path d="M50 18 Q40 22 34 38 L38 40 Q44 26 50 24 Z"/><path d="M50 18 Q60 22 66 38 L62 40 Q56 26 50 24 Z"/></g>;
      case"lob":return <path d="M26 42 Q26 14 50 14 Q74 14 74 42 L74 62 Q74 52 67 49 L67 40 Q50 30 33 40 L33 49 Q26 52 26 62 Z" fill={`url(#hair-${uid})`}/>;
      case"shag":return <g fill={`url(#hair-${uid})`}><path d="M26 44 Q24 14 50 14 Q76 14 74 44 Q74 32 66 33 Q63 25 54 28 Q50 22 46 28 Q37 25 34 33 Q26 32 26 44 Z"/><path d="M28 44 L26 56 M72 44 L74 56 M34 46 L33 58 M66 46 L67 58" stroke={d.hairColor} strokeWidth="2.5" opacity="0.7" strokeLinecap="round"/></g>;
      case"hightail":return <g fill={`url(#hair-${uid})`}><path d="M29 41 Q29 16 50 16 Q71 16 71 41 Q71 28 50 28 Q29 28 29 41 Z"/><circle cx="50" cy="12" r="5"/><path d="M50 10 Q66 14 70 40 Q66 50 60 54 Q66 36 58 18 Z"/></g>;
      case"halfup":return <g fill={`url(#hair-${uid})`}><path d="M26 40 Q26 13 50 13 Q74 13 74 40 L75 74 Q74 60 68 56 L68 40 Q50 29 32 40 L32 56 Q26 60 25 74 Z"/><circle cx="50" cy="14" r="6"/><path d="M40 18 Q50 14 60 18" stroke="#fff" strokeWidth="0.7" opacity="0.25" fill="none"/></g>;
      case"bald":return null;
      default:return <path d="M28 41 Q28 15 50 15 Q72 15 72 41 Q72 27 50 27 Q28 27 28 41 Z" fill={`url(#hair-${uid})`}/>;
    }
  };
  const bottomCol=d.bottomColor||(d.bottom==="elegant"?"#3D2433":(d.bottom==="skirt"||d.bottom==="longskirt")?d.topColor:d.bottom==="joggers"?"#8891A5":"#4A6FA5");
  const bottomShade=shade(bottomCol,0.82);
  const shoeCol=d.shoeColor||(d.shoes==="heels"?"#3D2433":d.shoes==="boots"||d.shoes==="chelsea"?"#5C3A21":d.shoes==="loafers"?"#3D2433":d.shoes==="ballet"?"#FF8FB1":d.shoes==="hightop"?d.topColor:"#EDEDED");
  // single torso silhouette — every full top reuses it so the body is never exposed
  const TORSO="M32 74 Q32 66 41 66 L59 66 Q68 66 68 74 Q70 92 68 110 Q50 106 32 110 Q30 92 32 74 Z";
  return(
    <svg viewBox={`0 0 ${W} ${H}`} width={size*0.625} height={size} style={{display:"block"}}>
      <defs>
        <linearGradient id={`avbg-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={bgItem.c1}/><stop offset="100%" stopColor={bgItem.c2}/></linearGradient>
        <radialGradient id={`skin-${uid}`} cx="40%" cy="35%" r="75%"><stop offset="0%" stopColor={d.skin}/><stop offset="100%" stopColor={skinShade}/></radialGradient>
        <linearGradient id={`top-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={d.topColor}/><stop offset="100%" stopColor={topShade}/></linearGradient>
        <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor={d.hairColor}/><stop offset="100%" stopColor={shade(d.hairColor,0.78)}/></linearGradient>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="40%" r="70%"><stop offset="60%" stopColor="#000" stopOpacity="0"/><stop offset="100%" stopColor="#000" stopOpacity="0.10"/></radialGradient>
      </defs>
      {/* background */}
      {bg&&<g><rect x="0" y="0" width={W} height={H} rx="16" fill={`url(#avbg-${uid})`}/><rect x="0" y="0" width={W} height={H} rx="16" fill={`url(#vig-${uid})`}/></g>}
      {/* ground shadow */}
      <ellipse cx="50" cy="148" rx="26" ry="5" fill="#000" opacity="0.13"/>
      {/* back accessory (behind body) */}
      {d.back==="wings"&&<g opacity="0.95"><path d="M30 72 Q10 60 14 88 Q24 80 34 84 Z" fill="#fff" stroke="#E0E0F0" strokeWidth="0.8"/><path d="M70 72 Q90 60 86 88 Q76 80 66 84 Z" fill="#fff" stroke="#E0E0F0" strokeWidth="0.8"/></g>}
      {d.back==="cape"&&<path d="M34 66 Q50 72 66 66 L72 116 Q50 110 28 116 Z" fill="#C0392B" opacity="0.9"/>}
      {d.back==="backpack"&&<text x="50" y="98" fontSize="26" textAnchor="middle" opacity="0.92">🎒</text>}
      {d.back==="balloon"&&<text x="74" y="40" fontSize="22" textAnchor="middle">🎈</text>}
      {d.back==="devilwings"&&<g fill="#8B1A2E" opacity="0.95"><path d="M30 70 Q8 58 12 86 Q20 76 28 80 Q24 74 30 70 Z"/><path d="M70 70 Q92 58 88 86 Q80 76 72 80 Q76 74 70 70 Z"/><path d="M14 84 L18 90 M86 84 L82 90" stroke="#8B1A2E" strokeWidth="2"/></g>}
      {d.back==="jetpack"&&<g><rect x="30" y="74" width="8" height="22" rx="4" fill="#9AA0AE"/><rect x="62" y="74" width="8" height="22" rx="4" fill="#9AA0AE"/><text x="34" y="108" fontSize="9" textAnchor="middle">🔥</text><text x="66" y="108" fontSize="9" textAnchor="middle">🔥</text></g>}
      {d.back==="sword"&&<g><rect x="72" y="60" width="3" height="40" rx="1.5" fill="#C0C0C0" transform="rotate(12 73 80)"/><rect x="69" y="86" width="9" height="3" rx="1" fill="#D9A441" transform="rotate(12 73 87)"/></g>}
      {/* legs (short, fat) — fuller, attached under the torso */}
      <rect x="40" y="108" width="10" height="32" rx="5" fill={`url(#skin-${uid})`}/>
      <rect x="50" y="108" width="10" height="32" rx="5" fill={`url(#skin-${uid})`}/>
      {/* bottom */}
      {(d.bottom==="skirt"||d.bottom==="longskirt")
        ? <g><path d={d.bottom==="longskirt"?"M36 99 Q50 96 64 99 L71 134 Q50 130 29 134 Z":"M37 99 Q50 96 63 99 L69 123 Q50 120 31 123 Z"} fill={bottomCol}/><path d={d.bottom==="longskirt"?"M50 98 L50 132":"M50 98 L50 121"} stroke={bottomShade} strokeWidth="0.8" opacity="0.5"/></g>
        : d.bottom==="tutu"
        ? <g><path d="M34 100 Q50 96 66 100 L72 112 Q50 106 28 112 Z" fill="#FF9EC4"/><path d="M30 108 Q50 104 70 108 L74 116 Q50 110 26 116 Z" fill="#FFB8D4" opacity="0.85"/></g>
        : d.bottom==="briefs"
        ? <path d="M39 99 Q50 97 61 99 L59 108 Q50 105 41 108 Z" fill={bottomCol}/>
        : d.bottom==="shorts"
        ? <g><rect x="39" y="99" width="10.5" height="20" rx="4" fill={bottomCol}/><rect x="50.5" y="99" width="10.5" height="20" rx="4" fill={bottomCol}/></g>
        : <g><rect x="39" y="99" width="10.5" height="37" rx="4" fill={bottomCol}/><rect x="50.5" y="99" width="10.5" height="37" rx="4" fill={bottomCol}/><rect x="39" y="99" width="3" height="37" rx="1.5" fill="#fff" opacity="0.12"/></g>}
      {/* shoes */}
      {d.shoes==="barefoot"
        ? null
        : d.shoes==="heels"
        ? <g fill={shoeCol}><path d="M39 140 Q44 138 50 140 L50 145 L42 149 L39 145 Z"/><path d="M50 140 Q56 138 61 140 L61 145 L58 149 L50 145 Z"/><rect x="40" y="148" width="2" height="4" fill={shade(shoeCol,0.7)}/><rect x="56" y="148" width="2" height="4" fill={shade(shoeCol,0.7)}/></g>
        : d.shoes==="boots"
        ? <g fill={shoeCol}><rect x="38" y="128" width="12" height="18" rx="4"/><rect x="50" y="128" width="12" height="18" rx="4"/><rect x="38" y="128" width="12" height="3" rx="1.5" fill="#fff" opacity="0.18"/><rect x="50" y="128" width="12" height="3" rx="1.5" fill="#fff" opacity="0.18"/></g>
        : d.shoes==="chelsea"
        ? <g fill={shoeCol}><path d="M38 132 Q38 130 41 130 L47 130 Q50 130 50 133 L50 146 L38 146 Z"/><path d="M50 132 Q50 130 53 130 L59 130 Q62 130 62 133 L62 146 L50 146 Z"/><rect x="47" y="134" width="3" height="8" fill={shade(shoeCol,0.6)}/><rect x="59" y="134" width="3" height="8" fill={shade(shoeCol,0.6)}/></g>
        : d.shoes==="loafers"
        ? <g fill={shoeCol}><path d="M37 140 Q37 137 41 137 L49 137 Q51 140 51 144 L37 144 Z"/><path d="M50 140 Q50 137 54 137 L62 137 Q64 140 64 144 L50 144 Z"/><rect x="41" y="139" width="6" height="1.6" rx="0.8" fill={shade(shoeCol,0.6)}/><rect x="54" y="139" width="6" height="1.6" rx="0.8" fill={shade(shoeCol,0.6)}/></g>
        : d.shoes==="ballet"
        ? <g fill={shoeCol}><path d="M38 141 Q44 138 50 141 L50 145 Q44 147 38 145 Z"/><path d="M50 141 Q56 138 62 141 L62 145 Q56 147 50 145 Z"/><path d="M43 140 Q44 137 46 140" stroke={shade(shoeCol,0.65)} strokeWidth="0.8" fill="none"/><path d="M54 140 Q55 137 57 140" stroke={shade(shoeCol,0.65)} strokeWidth="0.8" fill="none"/></g>
        : d.shoes==="sandals"
        ? <g fill={shoeCol}><rect x="38" y="143" width="12" height="3.5" rx="1.7"/><rect x="50" y="143" width="12" height="3.5" rx="1.7"/><path d="M40 143 L44 138 M48 143 L44 138" stroke={shoeCol} strokeWidth="1.4"/><path d="M52 143 L56 138 M60 143 L56 138" stroke={shoeCol} strokeWidth="1.4"/></g>
        : d.shoes==="flipflops"
        ? <g fill={shoeCol}><ellipse cx="44" cy="145" rx="6.5" ry="2.6"/><ellipse cx="56" cy="145" rx="6.5" ry="2.6"/><path d="M44 143 L41 139 M44 143 L47 139" stroke={shade(shoeCol,0.6)} strokeWidth="1.1"/><path d="M56 143 L53 139 M56 143 L59 139" stroke={shade(shoeCol,0.6)} strokeWidth="1.1"/></g>
        : d.shoes==="hightop"
        ? <g fill={shoeCol}><rect x="37" y="132" width="13" height="14" rx="4"/><rect x="50" y="132" width="13" height="14" rx="4"/><rect x="37" y="143" width="13" height="3" rx="1.5" fill="#fff" opacity="0.5"/><rect x="50" y="143" width="13" height="3" rx="1.5" fill="#fff" opacity="0.5"/><circle cx="43" cy="137" r="0.8" fill="#fff" opacity="0.6"/><circle cx="56" cy="137" r="0.8" fill="#fff" opacity="0.6"/></g>
        : d.shoes==="glow"
        ? <g><rect x="37" y="138" width="13" height="9" rx="4.5" fill={d.shoeColor||d.topColor}/><rect x="50" y="138" width="13" height="9" rx="4.5" fill={d.shoeColor||d.topColor}/><rect x="37" y="145" width="13" height="2.5" rx="1.2" fill="#7CF5FF"/><rect x="50" y="145" width="13" height="2.5" rx="1.2" fill="#7CF5FF"/></g>
        : <g fill={shoeCol}><rect x="37" y="138" width="13" height="9" rx="4.5"/><rect x="50" y="138" width="13" height="9" rx="4.5"/><rect x="37" y="138" width="13" height="3" rx="1.5" fill="#fff" opacity="0.4"/><rect x="50" y="138" width="13" height="3" rx="1.5" fill="#fff" opacity="0.4"/><path d="M40 142 L47 142" stroke={shade(shoeCol,0.7)} strokeWidth="0.7" opacity="0.5"/><path d="M53 142 L60 142" stroke={shade(shoeCol,0.7)} strokeWidth="0.7" opacity="0.5"/></g>}
      {/* arms — open outward but lower, close to the torso */}
      <rect x="20" y="76" width="8.5" height="25" rx="4.25" fill={`url(#skin-${uid})`} transform="rotate(26 32 88)"/>
      <rect x="71.5" y="76" width="8.5" height="25" rx="4.25" fill={`url(#skin-${uid})`} transform="rotate(-26 68 88)"/>
      {/* tattoo on the right arm (skin-level; covered by long sleeves naturally would be ideal, kept simple here) */}
      {d.tattoo&&d.tattoo!=="none"&&(()=>{const tc="#3D3A4A";return(
        <g transform="rotate(-26 68 88)" opacity="0.78">
          {d.tattoo==="heart"&&<path d="M75 86 q-2 -2.5 -4 0 q-2 -2.5 -4 0 q0 2.5 4 5 q4 -2.5 4 -5 Z" fill="#E5484D"/>}
          {d.tattoo==="star"&&<path d="M71 84 l1.2 2.6 2.8 0.3 -2.1 1.9 0.6 2.8 -2.5 -1.5 -2.5 1.5 0.6 -2.8 -2.1 -1.9 2.8 -0.3 Z" fill="#F5C518"/>}
          {d.tattoo==="rose"&&<g><circle cx="71" cy="87" r="2.6" fill="#E5487D"/><circle cx="71" cy="87" r="1.3" fill="#B23068"/><path d="M71 90 q-3 2 -4 5" stroke="#2BB673" strokeWidth="1" fill="none"/></g>}
          {d.tattoo==="tribal"&&<path d="M68 83 q5 3 3 8 q-1 -4 -4 -5 q4 4 2 7 q-2 -4 -5 -4" stroke={tc} strokeWidth="1.3" fill="none" strokeLinecap="round"/>}
          {d.tattoo==="anchor"&&<g stroke={tc} strokeWidth="1.1" fill="none"><line x1="71" y1="83" x2="71" y2="91"/><circle cx="71" cy="83" r="1.2"/><line x1="68" y1="86" x2="74" y2="86"/><path d="M67 89 q4 4 8 0"/></g>}
          {d.tattoo==="butterfly"&&<g fill="#7C6FF0"><ellipse cx="69" cy="86" rx="2.2" ry="3" transform="rotate(-20 69 86)"/><ellipse cx="73" cy="86" rx="2.2" ry="3" transform="rotate(20 73 86)"/><line x1="71" y1="84" x2="71" y2="89" stroke="#3D3A4A" strokeWidth="0.8"/></g>}
          {d.tattoo==="initials"&&<text x="71" y="89" fontSize="6" fontWeight="800" textAnchor="middle" fill={tc}>G</text>}
        </g>
      );})()}
      {/* torso: skin base always present, then the garment fully covers it */}
      <path d={TORSO} fill={`url(#skin-${uid})`}/>
      {d.top==="bra"
        ? <g><path d="M34 76 Q41 79 41 84 Q41 89 35 89 Q32 84 34 76 Z" fill={`url(#top-${uid})`}/><path d="M66 76 Q59 79 59 84 Q59 89 65 89 Q68 84 66 76 Z" fill={`url(#top-${uid})`}/><path d="M41 82 Q50 85 59 82" stroke={d.topColor} strokeWidth="2" fill="none"/><path d="M38 67 Q41 74 40 78 M62 67 Q59 74 60 78" stroke={d.topColor} strokeWidth="1.6" fill="none" opacity="0.9"/></g>
        : d.top==="crop"
        ? <path d="M32 74 Q32 66 42 66 L58 66 Q68 66 68 74 L69 90 Q50 88 31 90 Z" fill={`url(#top-${uid})`}/>
        : d.top==="dress"
        ? <path d="M32 74 Q32 66 42 66 L58 66 Q68 66 68 74 L75 122 Q50 117 25 122 Z" fill={`url(#top-${uid})`}/>
        : d.top==="tank"
        ? <g><path d={TORSO} fill={`url(#top-${uid})`}/><path d="M41 67 L43 72 M59 67 L57 72" stroke={d.topColor} strokeWidth="5" strokeLinecap="round"/><path d="M41 74 Q50 78 59 74" stroke="#fff" strokeWidth="0.7" opacity="0.25" fill="none"/></g>
        : d.top==="jacket"
        ? <g><path d={TORSO} fill={`url(#top-${uid})`}/><path d="M48 66 L48 108 L52 108 L52 66 Z" fill="#000" opacity="0.16"/></g>
        : <path d={TORSO} fill={`url(#top-${uid})`}/>}
      {/* soft body highlight */}
      <ellipse cx="40" cy="82" rx="7" ry="14" fill="#fff" opacity="0.10"/>
      {d.top==="hoodie"&&<g><path d="M38 65 Q50 78 62 65 L62 70 Q50 82 38 70 Z" fill="#000" opacity="0.22"/><circle cx="44" cy="72" r="1.2" fill="#fff" opacity="0.5"/><circle cx="56" cy="72" r="1.2" fill="#fff" opacity="0.5"/><path d="M44 73 L43 84 M56 73 L57 84" stroke="#fff" strokeWidth="1" opacity="0.4" strokeLinecap="round"/><line x1="50" y1="74" x2="50" y2="104" stroke="#000" strokeWidth="1.2" opacity="0.3"/><path d="M38 94 Q50 98 62 94 L62 102 Q50 106 38 102 Z" fill="#000" opacity="0.12"/></g>}
      {d.top==="suit"&&<g><rect x="46" y="65" width="8" height="40" fill="#fff" opacity="0.95"/><path d="M40 65 L47 66 L44 92 Z M60 65 L53 66 L56 92 Z" fill="#000" opacity="0.42"/><path d="M40 65 L47 66 M60 65 L53 66" stroke="#fff" strokeWidth="0.6" opacity="0.3"/><circle cx="50" cy="80" r="1" fill="#3D3A4A"/><circle cx="50" cy="86" r="1" fill="#3D3A4A"/><rect x="41" y="96" width="6" height="4" rx="0.5" fill="#000" opacity="0.18"/></g>}
      {d.top==="shirt"&&<g><path d="M44 65 L50 72 L56 65 L54 64 L50 68 L46 64 Z" fill="#fff" opacity="0.8"/><line x1="50" y1="72" x2="50" y2="104" stroke="#000" strokeWidth="1" opacity="0.28"/><circle cx="50" cy="82" r="0.9" fill="#000" opacity="0.3"/><circle cx="50" cy="90" r="0.9" fill="#000" opacity="0.3"/><circle cx="50" cy="98" r="0.9" fill="#000" opacity="0.3"/></g>}
      {d.top==="sweater"&&<g><path d="M40 66 Q50 73 60 66" stroke="#000" strokeWidth="1.5" opacity="0.25" fill="none"/><g stroke="#fff" strokeWidth="0.8" opacity="0.25"><line x1="32" y1="82" x2="68" y2="82"/><line x1="32" y1="90" x2="68" y2="90"/><line x1="32" y1="98" x2="68" y2="98"/></g></g>}
      {d.top==="tee"&&<path d="M43 65 Q50 71 57 65" stroke="#000" strokeWidth="1.3" opacity="0.18" fill="none"/>}
      {d.top==="kimono"&&<g><path d="M50 65 L40 108 L37 106 L46 66 Z" fill="#fff" opacity="0.6"/><path d="M50 65 L60 108 L63 106 L54 66 Z" fill="#000" opacity="0.12"/><path d="M30 82 Q50 87 70 82 L70 90 Q50 95 30 90 Z" fill="#C0392B" opacity="0.85"/></g>}
      {d.top==="varsity"&&<g><path d="M29 74 L40 66 L43 74 Z" fill="#fff" opacity="0.9"/><path d="M71 74 L60 66 L57 74 Z" fill="#fff" opacity="0.9"/><rect x="30" y="100" width="40" height="4" rx="2" fill="#fff" opacity="0.5"/><text x="50" y="92" fontSize="13" textAnchor="middle" fill="#fff" opacity="0.95" fontWeight="800">B</text></g>}
      {d.top==="galaxy"&&<g><circle cx="40" cy="82" r="1.2" fill="#fff"/><circle cx="56" cy="76" r="1.4" fill="#fff"/><circle cx="50" cy="92" r="1" fill="#fff"/><circle cx="62" cy="94" r="1.2" fill="#fff"/><circle cx="36" cy="94" r="1" fill="#fff"/><text x="46" y="86" fontSize="9" textAnchor="middle">✨</text><text x="60" y="82" fontSize="6" textAnchor="middle">⭐</text></g>}
      {d.top==="royal"&&<g><path d="M38 70 Q50 76 62 70 L62 75 Q50 81 38 75 Z" fill="#F5C518"/><circle cx="50" cy="90" r="3" fill="#F5C518"/><path d="M33 74 L33 105 M67 74 L67 105" stroke="#F5C518" strokeWidth="2" opacity="0.8"/></g>}
      {d.top==="crop"&&<path d="M43 65 Q50 71 57 65" stroke="#000" strokeWidth="1.2" opacity="0.18" fill="none"/>}
      {d.top==="jacket"&&<g><path d="M40 66 L48 68 L48 108 M60 66 L52 68 L52 108" stroke="#000" strokeWidth="1" opacity="0.25" fill="none"/><circle cx="46" cy="88" r="1" fill="#fff" opacity="0.5"/><circle cx="46" cy="96" r="1" fill="#fff" opacity="0.5"/></g>}
      {/* neck accessory */}
      {d.neck==="chain"&&<path d="M44 67 Q50 74 56 67" stroke="#E8C25A" strokeWidth="2" fill="none"/>}
      {d.neck==="pearls"&&<path d="M43 67 Q50 75 57 67" stroke="#fff" strokeWidth="2.6" fill="none" strokeDasharray="1.6,1.6"/>}
      {d.neck==="heart"&&<g><path d="M44 67 Q50 73 56 67" stroke="#E8C25A" strokeWidth="1.5" fill="none"/><path d="M50 72 l-2.2 -2.2 a1.55 1.55 0 0 1 2.2 0 a1.55 1.55 0 0 1 2.2 0 z" fill="#FF5E78"/></g>}
      {d.neck==="bowtie"&&<g><path d="M45 66 L50 70 L45 74 Z M55 66 L50 70 L55 74 Z" fill="#E5484D"/><rect x="48.5" y="68.5" width="3" height="3" rx="0.5" fill="#C0392B"/></g>}
      {d.neck==="scarf"&&<g><path d="M42 64 Q50 70 58 64 L58 70 Q50 76 42 70 Z" fill="#E07A5F"/><path d="M55 68 L60 82 L56 82 L52 70 Z" fill="#E07A5F"/></g>}
      {d.neck==="medal"&&<g><path d="M45 65 L50 78 L55 65" stroke="#5BB8F0" strokeWidth="2" fill="none"/><circle cx="50" cy="80" r="4" fill="#F5C518" stroke="#E8A93B" strokeWidth="0.6"/><text x="50" y="82.5" fontSize="4" textAnchor="middle">★</text></g>}
      {/* neck (tiny, merged) */}
      <rect x="45" y="58" width="10" height="9" rx="4" fill={skinShade}/>
      {/* head (big marshmallow, soft rounded square) */}
      <path d="M28 40 Q28 18 50 18 Q72 18 72 40 Q72 62 50 62 Q28 62 28 40 Z" fill={`url(#skin-${uid})`}/>
      {/* ears */}
      <circle cx="29" cy="42" r="3.5" fill={skinShade}/><circle cx="71" cy="42" r="3.5" fill={skinShade}/>
      {/* blush (soft) */}
      <ellipse cx="37" cy="46" rx="3.2" ry="2.2" fill="#FF7A9C" opacity="0.26"/>
      <ellipse cx="63" cy="46" rx="3.2" ry="2.2" fill="#FF7A9C" opacity="0.26"/>
      {/* eyes (minimal dots) */}
      {d.face==="wink"
        ? <g><circle cx="42" cy="40" r="2.2" fill="#3D3A4A"/><path d="M56 40 q2.5 -2 5 0" stroke="#3D3A4A" strokeWidth="1.6" fill="none" strokeLinecap="round"/></g>
        : d.face==="cool"
        ? <g><rect x="37" y="38" width="11" height="5.5" rx="2.5" fill="#3D3A4A"/><rect x="52" y="38" width="11" height="5.5" rx="2.5" fill="#3D3A4A"/><line x1="48" y1="40.5" x2="52" y2="40.5" stroke="#3D3A4A" strokeWidth="1.2"/></g>
        : d.face==="love"
        ? <g><path d="M42 41 l-2 -2 a1.4 1.4 0 0 1 2 0 a1.4 1.4 0 0 1 2 0 z" fill="#FF5E78"/><path d="M58 41 l-2 -2 a1.4 1.4 0 0 1 2 0 a1.4 1.4 0 0 1 2 0 z" fill="#FF5E78"/></g>
        : <g><circle cx="42" cy="40" r="2.4" fill="#3D3A4A"/><circle cx="58" cy="40" r="2.4" fill="#3D3A4A"/></g>}
      {/* mouth (tiny, minimal) */}
      {d.face==="happy"||d.face==="love"
        ? <path d="M46 48 q4 4 8 0" stroke="#3D3A4A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        : d.face==="calm"
        ? <line x1="47" y1="49" x2="53" y2="49" stroke="#3D3A4A" strokeWidth="1.5" strokeLinecap="round"/>
        : d.face==="cool"
        ? <path d="M47 49 q3 2 6 0" stroke="#3D3A4A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        : <path d="M47 48 q3 2.5 6 0" stroke="#3D3A4A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
      {/* beard */}
      {/* beard — uses custom beardColor, falls back to hair color */}
      {(()=>{const bc=d.beardColor||d.hairColor;const bcD=shade(bc,0.82);return(<g>
        {d.beard==="stubble"&&<g><path d="M33 45 Q50 66 67 45 Q67 59 50 61 Q33 59 33 45 Z" fill={bc} opacity="0.32"/><path d="M42 56 Q50 60 58 56" stroke={bcD} strokeWidth="0.5" fill="none" opacity="0.4"/></g>}
        {d.beard==="goatee"&&<g><path d="M43 51 Q50 64 57 51 Q57 61 50 63 Q43 61 43 51 Z" fill={bc}/><path d="M46 53 Q50 60 54 53" stroke={bcD} strokeWidth="0.6" fill="none" opacity="0.5"/><rect x="46" y="47" width="8" height="3" rx="1.5" fill={bc} opacity="0.85"/></g>}
        {d.beard==="full"&&<g><path d="M31 43 Q33 66 50 64 Q67 66 69 43 Q69 60 50 58 Q31 60 31 43 Z" fill={bc}/><path d="M31 43 Q33 64 50 62 Q67 64 69 43" stroke={bcD} strokeWidth="0.8" fill="none" opacity="0.4"/><rect x="44" y="46" width="12" height="3.5" rx="1.7" fill={bc}/><path d="M38 52 Q50 58 62 52" stroke={bcD} strokeWidth="0.6" fill="none" opacity="0.5"/></g>}
        {d.beard==="mustache"&&<g><path d="M42 50 Q46 54 50 52 Q54 54 58 50 Q54 53 50 52.5 Q46 53 42 50 Z" fill={bc}/></g>}
        {d.beard==="circle"&&<g><rect x="44" y="46" width="12" height="3.5" rx="1.7" fill={bc}/><path d="M43 51 Q50 63 57 51 Q57 60 50 62 Q43 60 43 51 Z" fill={bc}/></g>}
        {d.beard==="long"&&<g><path d="M31 43 Q33 70 50 72 Q67 70 69 43 Q69 60 50 58 Q31 60 31 43 Z" fill={bc}/><path d="M44 46 h12 v4 h-12 Z" fill={bc}/><path d="M40 60 Q50 70 60 60" stroke={bcD} strokeWidth="0.7" fill="none" opacity="0.4"/><path d="M46 64 Q50 70 54 64" stroke={bcD} strokeWidth="0.6" fill="none" opacity="0.4"/></g>}
        {d.beard==="handlebar"&&<g><path d="M40 50 Q44 54 50 52 Q56 54 60 50 Q57 49 54 51 Q52 53 50 52.5 Q48 53 46 51 Q43 49 40 50 Z" fill={bc}/><path d="M40 50 Q36 50 35 47" stroke={bc} strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M60 50 Q64 50 65 47" stroke={bc} strokeWidth="2" fill="none" strokeLinecap="round"/></g>}
        {d.beard==="soul"&&<g><rect x="47" y="47" width="6" height="2.5" rx="1.2" fill={bc}/><path d="M46 53 h8 v4 q-4 3 -8 0 Z" fill={bc}/></g>}
      </g>);})()}
      {/* hair */}
      {d.hair!=="bald"&&d.hair!=="buzz"&&<path d="M27 42 Q27 14 50 14 Q73 14 73 42 Q73 30 50 30 Q27 30 27 42 Z" fill={`url(#hair-${uid})`}/>}
      {hair()}
      {/* glasses */}
      {d.glasses==="round"&&<g fill="none" stroke="#3D3A4A" strokeWidth="1.6"><circle cx="42" cy="40" r="4.5"/><circle cx="58" cy="40" r="4.5"/><line x1="46.5" y1="40" x2="53.5" y2="40"/></g>}
      {d.glasses==="sun"&&<g><rect x="36" y="36" width="10" height="7.5" rx="2.5" fill="#2B2B2B"/><rect x="54" y="36" width="10" height="7.5" rx="2.5" fill="#2B2B2B"/><line x1="46" y1="38" x2="54" y2="38" stroke="#2B2B2B" strokeWidth="1.6"/><rect x="37.5" y="37.5" width="4" height="1.6" rx="0.8" fill="#fff" opacity="0.35"/></g>}
      {d.glasses==="star"&&<g><text x="42" y="46" fontSize="9" textAnchor="middle">⭐</text><text x="58" y="46" fontSize="9" textAnchor="middle">⭐</text></g>}
      {d.glasses==="heart"&&<g><text x="42" y="46" fontSize="8" textAnchor="middle">💗</text><text x="58" y="46" fontSize="8" textAnchor="middle">💗</text></g>}
      {d.glasses==="visor"&&<g><path d="M34 40 Q50 36 66 40 L66 47 Q50 50 34 47 Z" fill="#1A1A2E" opacity="0.9"/><path d="M37 42 Q50 39 62 42" stroke="#7CF5FF" strokeWidth="1.2" fill="none" opacity="0.8"/></g>}
      {d.glasses==="monocle"&&<g fill="none" stroke="#E8A93B" strokeWidth="1.4"><circle cx="58" cy="43" r="5"/><path d="M58 48 L60 56"/></g>}
      {/* hat */}
      {d.hat==="cap"&&<g><path d="M30 32 Q50 16 70 32 L70 35 L48 35 Q28 35 26 40 Z" fill={`url(#top-${uid})`}/><path d="M30 32 Q50 16 70 32 L70 34 Q50 20 30 34 Z" fill="#fff" opacity="0.14"/></g>}
      {d.hat==="beanie"&&<g><path d="M29 35 Q29 16 50 16 Q71 16 71 35 Z" fill={`url(#top-${uid})`}/><rect x="29" y="32" width="42" height="4" rx="2" fill="#000" opacity="0.12"/></g>}
      {d.hat==="crown"&&<g><path d="M35 25 L40 14 L45 22 L50 12 L55 22 L60 14 L65 25 Z" fill="#FFC857" stroke="#E8A93B" strokeWidth="0.9"/><rect x="35" y="24" width="30" height="3" rx="1" fill="#E8A93B"/><circle cx="40" cy="15" r="1.4" fill="#FF5E78"/><circle cx="50" cy="13" r="1.6" fill="#5BB8F0"/><circle cx="60" cy="15" r="1.4" fill="#3BC9A8"/><circle cx="50" cy="25.5" r="1.2" fill="#E5484D"/></g>}
      {d.hat==="flower"&&<g><text x="33" y="29" fontSize="10" textAnchor="middle">🌸</text><text x="50" y="25" fontSize="10" textAnchor="middle">🌷</text><text x="67" y="29" fontSize="10" textAnchor="middle">🌼</text></g>}
      {d.hat==="party"&&<g><path d="M50 9 L43 30 L57 30 Z" fill="#FF5E78" stroke="#fff" strokeWidth="0.7"/><path d="M46 20 L54 20 M47.5 25 L52.5 25" stroke="#fff" strokeWidth="1.2" opacity="0.7"/><circle cx="50" cy="9" r="2" fill="#FFC857"/></g>}
      {d.hat==="halo"&&<ellipse cx="50" cy="18" rx="14" ry="4" fill="none" stroke="#FFE08A" strokeWidth="2.5" opacity="0.95"/>}
      {d.hat==="horns"&&<g fill="#C0392B"><path d="M36 28 Q32 18 38 16 Q38 24 42 28 Z"/><path d="M64 28 Q68 18 62 16 Q62 24 58 28 Z"/></g>}
      {d.hat==="chef"&&<g><rect x="38" y="22" width="24" height="10" rx="3" fill="#fff"/><ellipse cx="44" cy="20" rx="6" ry="6" fill="#fff"/><ellipse cx="56" cy="20" rx="6" ry="6" fill="#fff"/><ellipse cx="50" cy="18" rx="7" ry="7" fill="#fff"/></g>}
      {d.hat==="wizard"&&<g><path d="M50 6 L38 32 L62 32 Z" fill="#5B5BD6"/><text x="50" y="24" fontSize="7" textAnchor="middle">⭐</text><ellipse cx="50" cy="32" rx="15" ry="3" fill="#5B5BD6"/></g>}
      {d.hat==="cowboy"&&<g fill="#A8682E"><ellipse cx="50" cy="30" rx="22" ry="5"/><path d="M38 30 Q38 16 50 16 Q62 16 62 30 Z"/><rect x="38" y="27" width="24" height="3" fill="#6B4429"/></g>}
      {d.hat==="pirate"&&<g><path d="M30 28 Q50 14 70 28 Q50 24 30 28 Z" fill="#1A1A2E"/><ellipse cx="50" cy="28" rx="21" ry="4" fill="#1A1A2E"/><text x="50" y="26" fontSize="8" textAnchor="middle">☠️</text></g>}
      {d.hat==="santa"&&<g><path d="M30 32 Q32 14 52 16 Q70 18 68 32 Z" fill="#E5484D"/><rect x="29" y="30" width="42" height="5" rx="2.5" fill="#fff"/><circle cx="68" cy="16" r="4" fill="#fff"/></g>}
      {d.hat==="unicorn"&&<g><path d="M48 30 Q44 16 46 8 Q50 10 52 14 Q54 10 54 8 Q56 18 52 30 Z" fill="#F5C518"/><path d="M46 8 L54 8" stroke="#fff" strokeWidth="1" opacity="0.6"/><text x="40" y="26" fontSize="7">🌸</text><text x="60" y="26" fontSize="7">🌸</text></g>}
      {/* pet beside */}
      {petItem&&petItem.id!=="none"&&<PetSVG id={petItem.id} x={80} y={132} scale={0.95}/>}
      {/* special effects / aura */}
      {d.effect==="aura"&&<ellipse cx="50" cy="80" rx="40" ry="56" fill="none" stroke={d.topColor} strokeWidth="2.5" opacity="0.35"/>}
      {d.effect==="sparkle"&&<g><text x="22" y="40" fontSize="11">✨</text><text x="74" y="60" fontSize="13">✨</text><text x="30" y="100" fontSize="10">✨</text><text x="72" y="116" fontSize="11">✨</text></g>}
      {d.effect==="hearts"&&<g opacity="0.9"><text x="20" y="50" fontSize="11">💕</text><text x="76" y="44" fontSize="13">💗</text><text x="78" y="96" fontSize="10">💕</text><text x="20" y="104" fontSize="12">💖</text></g>}
      {d.effect==="fire"&&<g><text x="22" y="120" fontSize="16">🔥</text><text x="70" y="124" fontSize="16">🔥</text><text x="46" y="14" fontSize="13">🔥</text></g>}
      {d.effect==="rainbow"&&<g opacity="0.55"><path d="M14 96 Q50 30 86 96" fill="none" stroke="#FF5E78" strokeWidth="2.5"/><path d="M19 96 Q50 38 81 96" fill="none" stroke="#FFB347" strokeWidth="2.5"/><path d="M24 96 Q50 46 76 96" fill="none" stroke="#3BC9A8" strokeWidth="2.5"/><path d="M29 96 Q50 54 71 96" fill="none" stroke="#5BB8F0" strokeWidth="2.5"/></g>}
      {d.effect==="stars"&&<g><text x="20" y="44" fontSize="11">⭐</text><text x="76" y="56" fontSize="9">⭐</text><text x="26" y="100" fontSize="10">🌟</text><text x="74" y="108" fontSize="11">⭐</text><text x="50" y="12" fontSize="9">🌟</text></g>}
      {d.effect==="snow"&&<g fill="#fff" opacity="0.9"><circle cx="24" cy="40" r="2"/><circle cx="76" cy="52" r="2.5"/><circle cx="30" cy="90" r="2"/><circle cx="72" cy="100" r="2.5"/><circle cx="50" cy="20" r="2"/><circle cx="18" cy="70" r="1.8"/><circle cx="82" cy="78" r="2"/></g>}
      {d.effect==="glow"&&<ellipse cx="50" cy="80" rx="44" ry="60" fill="none" stroke="#FFE08A" strokeWidth="6" opacity="0.3" style={{filter:"blur(3px)"}}/>}
      {d.effect==="butterfly"&&<g><text x="22" y="56" fontSize="13">🦋</text><text x="74" y="68" fontSize="11">🦋</text><text x="70" y="40" fontSize="12">🦋</text></g>}
    </svg>
  );
}
function CoupleAvatar({avatars,T,G,size=70,bg=false}){
  return(<div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:size*0.04}}>
    <Avatar data={avatars.p1} T={T} G={G} size={size} bg={bg}/>
    <Avatar data={avatars.p2} T={T} G={G} size={size} bg={bg}/>
  </div>);
}

// ════════ AVATAR CREATOR (full-body) ════════
function AvatarCreator({avatars,setAvatars,tokens,setTokens,owned,setOwned,onBack,onToast,T,G}){
  const who="p1"; // you can only edit yourself, not your partner
  const [tab,setTab]=useState("look");
  const [cSex,setCSex]=useState("all"); // m | f | u | all filter for clothing
  const [draft,setDraft]=useState(avatars[who]); // edit a local copy; commit only on Save
  const [boughtIds,setBoughtIds]=useState([]); // items actually purchased in this session
  // items already worn when opening the editor → treated as owned (don't ask to buy what you already wear)
  const [initialWorn]=useState(()=>Object.values(avatars[who]));
  const a=draft;
  const ownedAll=[...owned,...boughtIds,...initialWorn];
  function upd(key,val){setDraft(d=>({...d,[key]:val}));}
  // contextual color set shown beside the avatar, based on active tab
  const colorCtx=(()=>{
    if(tab==="look")return a.beard&&a.beard!=="none"?{field:"beardColor",label:"Colore barba",colors:AV_BEARD_COLORS}:{field:"skin",label:"Carnagione",colors:AV_SKIN};
    if(tab==="hair")return(a.hair==="buzz"||a.hair==="bald")?null:{field:"hairColor",label:"Colore capelli",colors:AV_HAIR_COLORS};
    if(tab==="top")return{field:"topColor",label:"Colore sopra",colors:AV_TOP_COLORS};
    if(tab==="bottom")return{field:"bottomColor",label:"Colore sotto",colors:AV_TOP_COLORS};
    if(tab==="shoes")return{field:"shoeColor",label:"Colore scarpe",colors:AV_SHOE_COLORS};
    return null;
  })();
  const SLOT_MAP={hair:AV_HAIR_STYLES,beard:AV_BEARD,top:AV_TOP,bottom:AV_BOTTOM,shoes:AV_SHOES,glasses:AV_GLASSES,tattoo:AV_TATTOO,neck:AV_NECK,hat:AV_HATS,back:AV_BACK,bg:AV_BG,pet:AV_PET,effect:AV_EFFECT};
  // pickItem PREVIEWS the item. Only ONE unpaid item can be in preview at a time.
  const [savedLook]=useState(()=>({...avatars[who]})); // the look as saved when editor opened
  function pickItem(key,it){
    setDraft(cur0=>{
      const cur={...cur0};
      // revert any previously-previewed (unpaid, not-yet-owned) item in OTHER slots back to the SAVED look
      Object.entries(SLOT_MAP).forEach(([slot,list])=>{
        if(slot===key)return;
        const w=list.find(x=>x.id===cur[slot]);
        if(w&&w.cost>0&&!ownedAll.includes(w.id))cur[slot]=savedLook[slot];
      });
      cur[key]=it.id;
      return cur;
    });
    // always bring the avatar back into view so you can see the change
    if(typeof window!=="undefined")setTimeout(()=>{const el=document.getElementById("av-preview");if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},50);
  }
  // collect paid items currently worn but not yet owned → shown in buy panel
  const ALL_ITEMS=[...AV_HAIR_STYLES,...AV_BEARD,...AV_TOP,...AV_BOTTOM,...AV_SHOES,...AV_GLASSES,...AV_TATTOO,...AV_NECK,...AV_HATS,...AV_BACK,...AV_BG,...AV_PET,...AV_EFFECT];
  const wornIds=[a.hair,a.beard,a.top,a.bottom,a.shoes,a.glasses,a.tattoo,a.neck,a.hat,a.back,a.bg,a.pet,a.effect];
  const toBuy=ALL_ITEMS.filter(it=>it&&it.cost>0&&wornIds.includes(it.id)&&!ownedAll.includes(it.id));
  const toBuyTotal=toBuy.reduce((s,it)=>s+it.cost,0);
  function buyWorn(){
    if(tokens<toBuyTotal){onToast(`🪙 Ti mancano ${toBuyTotal-tokens} gettoni`);return;}
    setTokens(t=>t-toBuyTotal);
    const ids=toBuy.map(it=>it.id);
    setOwned(o=>[...o,...ids]);
    setBoughtIds(b=>[...b,...ids]);
    onToast("✨ Oggetto acquistato!");
  }
  function revertWorn(){
    const def=DEFAULT_AVATARS[who];
    const fixes={};
    Object.entries(SLOT_MAP).forEach(([slot,list])=>{
      const cur=list.find(x=>x.id===a[slot]);
      if(cur&&cur.cost>0&&!ownedAll.includes(cur.id))fixes[slot]=def[slot];
    });
    if(Object.keys(fixes).length)setDraft(d=>({...d,...fixes}));
    onToast("Anteprima annullata");
  }
  const Swatches=({colors,sel,onPick,round})=>(
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:18}}>
      {colors.map(c=>(<div key={c} onClick={()=>onPick(c)} style={{width:38,height:38,borderRadius:round?"50%":10,background:c,cursor:"pointer",border:sel===c?`3px solid ${T.text}`:`2px solid ${T.line}`,boxSizing:"border-box"}}/>))}
    </div>
  );
  const ItemGrid=({items,slot,sel})=>(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:18}}>
      {items.map(it=>{const own=it.cost===0||ownedAll.includes(it.id);const on=sel===it.id;return(
        <div key={it.id} onClick={()=>pickItem(slot,it)} style={{borderRadius:13,padding:"12px 4px",background:on?G.hero:T.surface,border:`1px solid ${on?"transparent":!own?T.a4+"55":T.line2}`,textAlign:"center",cursor:"pointer",color:on?"#fff":T.text,position:"relative"}}>
          {!own&&<div style={{position:"absolute",top:4,right:4,fontSize:9}}>🔒</div>}
          <div style={{fontSize:13,fontWeight:700}}>{it.label}</div>
          {it.cost>0&&<div style={{fontSize:10.5,fontWeight:700,marginTop:3,color:on?"#fff":own?T.a4:T.faint}}>{own?"✓ tuo":`${it.cost}🪙`}</div>}
        </div>
      );})}
    </div>
  );
  const Label=({children})=><div style={{fontSize:13,fontWeight:700,color:T.sub,marginBottom:10}}>{children}</div>;

  return(<div style={{paddingBottom:toBuy.length>0?240:90}}>
    <div style={{padding:"18px 18px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span onClick={()=>{
        if(boughtIds.length>0){
          const final={...a};
          Object.entries(SLOT_MAP).forEach(([slot,list])=>{
            const cur=list.find(x=>x.id===final[slot]);
            if(cur&&cur.cost>0&&!ownedAll.includes(cur.id))final[slot]=savedLook[slot];
          });
          setAvatars(av=>({...av,[who]:final}));
        }
        onBack();
      }} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span>
      <span style={{fontSize:12,fontWeight:800,color:T.a4,background:`${T.a4}16`,borderRadius:14,padding:"5px 11px"}}>🪙 {tokens}</span>
    </div>

    {/* Live full-body preview */}
    <div id="av-preview" style={{padding:"12px 18px 0",scrollMarginTop:12}}>
      <div style={{borderRadius:22,padding:"18px",background:`linear-gradient(135deg,${T.a1}18,${T.a2}0C)`,border:`1px solid ${T.line}`}}>
        <div style={{display:"flex",alignItems:"stretch",gap:16}}>
          {/* Avatar left — bigger, protagonist */}
          <div style={{textAlign:"center",flexShrink:0}}>
            <Avatar data={a} T={T} G={G} size={196} bg/>
            <div style={{fontSize:13,fontWeight:800,color:T.a1,marginTop:6}}>Tu ✏️</div>
          </div>
          {/* Contextual colors right — separated palette card */}
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
            {colorCtx
              ? <div style={{background:T.bg,borderRadius:16,border:`1px solid ${T.line}`,padding:"14px",display:"flex",flexDirection:"column",height:"100%",boxSizing:"border-box"}}>
                  <div style={{fontSize:11.5,fontWeight:800,color:T.faint,textTransform:"uppercase",letterSpacing:0.4,marginBottom:11}}>🎨 {colorCtx.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:11,overflowY:"auto",alignContent:"flex-start",flex:1}}>
                    {colorCtx.colors.map(c=>(<div key={c} onClick={()=>upd(colorCtx.field,c)} style={{width:40,height:40,borderRadius:"50%",background:c,cursor:"pointer",flexShrink:0,border:a[colorCtx.field]===c?`3px solid ${T.a1}`:`2px solid ${T.line2}`,boxShadow:a[colorCtx.field]===c?`0 0 0 2px ${T.bg}`:"none"}}/>))}
                  </div>
                </div>
              : <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",opacity:0.55,filter:"grayscale(0.3)"}}><Avatar data={avatars.p2} T={T} G={G} size={120} bg/><div style={{fontSize:11,fontWeight:700,color:T.faint,marginTop:4}}>{avatars.p2.name} 🔒</div></div></div>}
          </div>
        </div>
        <div style={{fontSize:12,color:T.faint,marginTop:12,lineHeight:1.4,textAlign:"center"}}>{avatars.p2.name} personalizza il suo dal proprio telefono 💞</div>
      </div>
    </div>

    {/* Category tabs */}
    <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",padding:"14px 18px 4px"}}>
      {[["look","😊 Aspetto"],["hair","💇 Capelli"],["top","👕 Sopra"],["bottom","👖 Sotto"],["shoes","👟 Scarpe"],["acc","🎀 Accessori"],["outfit","✨ Look"],["scene","🌅 Scena"],["fx","💫 Effetti"]].map(([id,l])=>(
        <button key={id} onClick={()=>setTab(id)} style={{background:tab===id?T.surface2:T.surface,color:tab===id?T.text:T.sub,border:`1px solid ${tab===id?T.line2:T.line}`,borderRadius:16,padding:"8px 13px",fontSize:12.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
      ))}
    </div>

    <div style={{padding:"14px 18px 0"}}>
      {tab==="look"&&(<>
        <Label>Espressione</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
          {AV_FACE_EXP.map(f=>(<div key={f.id} onClick={()=>upd("face",f.id)} style={{borderRadius:13,padding:"11px 4px",background:a.face===f.id?G.hero:T.surface,border:`1px solid ${a.face===f.id?"transparent":T.line2}`,textAlign:"center",cursor:"pointer",color:a.face===f.id?"#fff":T.text,fontSize:13,fontWeight:700}}>{f.label}</div>))}
        </div>
        <Label>Barba</Label><ItemGrid items={AV_BEARD} slot="beard" sel={a.beard}/>
        <div style={{fontSize:11.5,color:T.faint,marginTop:2}}>💡 La carnagione{a.beard&&a.beard!=="none"?" e il colore barba":""} si scelgono accanto all'avatar ↑</div>
      </>)}
      {tab==="hair"&&(<>
        {AV_HAIR_LEN.map(len=>(
          <div key={len.id}>
            <Label>{len.label}</Label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:14}}>
              {AV_HAIR_STYLES.filter(h=>h.len===len.id).map(h=>{const own=h.cost===0||ownedAll.includes(h.id);const on=a.hair===h.id;return(
                <div key={h.id} onClick={()=>pickItem("hair",h)} style={{borderRadius:13,padding:"11px 4px",background:on?G.hero:T.surface,border:`1px solid ${on?"transparent":T.line2}`,textAlign:"center",cursor:"pointer",color:on?"#fff":T.text}}>
                  <div style={{fontSize:13,fontWeight:700}}>{h.label}</div>
                  {h.cost>0&&<div style={{fontSize:10,fontWeight:700,marginTop:2,color:on?"#fff":own?T.a4:T.faint}}>{own?"✓":`${h.cost}🪙`}</div>}
                </div>
              );})}
            </div>
          </div>
        ))}
        <div style={{fontSize:11.5,color:T.faint,marginTop:2}}>💡 Il colore dei capelli si sceglie accanto all'avatar ↑</div>
      </>)}
      {tab==="top"&&(<>
        <Label>Indumento</Label>
        <div style={{display:"flex",gap:7,marginBottom:10}}>
          {[["all","Tutti"],["m","♂ Lui"],["f","♀ Lei"],["u","Unisex"]].map(([id,l])=>(<button key={id} onClick={()=>setCSex(id)} style={{background:cSex===id?T.surface2:T.surface,color:cSex===id?T.text:T.sub,border:`1px solid ${cSex===id?T.line2:T.line}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>))}
        </div>
        <ItemGrid items={AV_TOP.filter(t=>cSex==="all"||t.sex===cSex)} slot="top" sel={a.top}/>
        <div style={{fontSize:11.5,color:T.faint,marginTop:2}}>💡 Il colore si sceglie accanto all'avatar ↑</div>
      </>)}
      {tab==="bottom"&&(<>
        <Label>Pantaloni / Gonna</Label>
        <div style={{display:"flex",gap:7,marginBottom:10}}>
          {[["all","Tutti"],["m","♂ Lui"],["f","♀ Lei"],["u","Unisex"]].map(([id,l])=>(<button key={id} onClick={()=>setCSex(id)} style={{background:cSex===id?T.surface2:T.surface,color:cSex===id?T.text:T.sub,border:`1px solid ${cSex===id?T.line2:T.line}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>))}
        </div>
        <ItemGrid items={AV_BOTTOM.filter(b=>cSex==="all"||b.sex===cSex)} slot="bottom" sel={a.bottom}/>
        <div style={{fontSize:11.5,color:T.faint,marginTop:2}}>💡 Il colore si sceglie accanto all'avatar ↑</div>
      </>)}
      {tab==="shoes"&&(<><Label>Scarpe</Label><ItemGrid items={AV_SHOES} slot="shoes" sel={a.shoes}/><div style={{fontSize:11.5,color:T.faint,marginTop:2}}>💡 Il colore si sceglie accanto all'avatar ↑</div></>)}
      {tab==="acc"&&(<>
        <Label>Occhiali</Label><ItemGrid items={AV_GLASSES} slot="glasses" sel={a.glasses}/>
        <Label>Tatuaggio</Label><ItemGrid items={AV_TATTOO} slot="tattoo" sel={a.tattoo}/>
        <Label>Collana</Label><ItemGrid items={AV_NECK} slot="neck" sel={a.neck}/>
        <Label>Cappello</Label><ItemGrid items={AV_HATS} slot="hat" sel={a.hat}/>
        <Label>Sulla schiena</Label><ItemGrid items={AV_BACK} slot="back" sel={a.back}/>
      </>)}
      {tab==="scene"&&(<>
        <Label>Sfondo</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:18}}>
          {AV_BG.map(b=>{const own=b.cost===0||ownedAll.includes(b.id);const on=a.bg===b.id;return(
            <div key={b.id} onClick={()=>pickItem("bg",b)} style={{borderRadius:13,padding:6,background:on?G.hero:T.surface,border:`1px solid ${on?"transparent":T.line2}`,cursor:"pointer"}}>
              <div style={{height:38,borderRadius:9,background:`linear-gradient(135deg,${b.c1},${b.c2})`,marginBottom:6}}/>
              <div style={{fontSize:12,fontWeight:700,textAlign:"center",color:on?"#fff":T.text}}>{b.label}</div>
              {b.cost>0&&<div style={{fontSize:10,fontWeight:700,textAlign:"center",marginTop:2,color:on?"#fff":own?T.a4:T.faint}}>{own?"✓":`${b.cost}🪙`}</div>}
            </div>
          );})}
        </div>
        <Label>Mascotte</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:8}}>
          {AV_PET.map(p=>{const own=p.cost===0||ownedAll.includes(p.id);const on=a.pet===p.id;return(
            <div key={p.id} onClick={()=>pickItem("pet",p)} style={{borderRadius:13,padding:"10px 4px",background:on?G.hero:T.surface,border:`1px solid ${on?"transparent":T.line2}`,textAlign:"center",cursor:"pointer",color:on?"#fff":T.text}}>
              <div style={{height:34,display:"flex",alignItems:"center",justifyContent:"center"}}>{p.id==="none"?<span style={{fontSize:22}}>∅</span>:<svg viewBox="0 0 40 40" width="34" height="34"><PetSVG id={p.id} x={20} y={20} scale={1}/></svg>}</div>
              <div style={{fontSize:11.5,fontWeight:700,marginTop:2}}>{p.label}</div>
              {p.cost>0&&<div style={{fontSize:10,fontWeight:700,marginTop:2,color:on?"#fff":own?T.a4:T.faint}}>{own?"✓":`${p.cost}🪙`}</div>}
            </div>
          );})}
        </div>
      </>)}
      {tab==="outfit"&&(<>
        <Label>Outfit a tema</Label>
        <div style={{fontSize:12.5,color:T.sub,marginBottom:12,lineHeight:1.4}}>Un tocco e vesti l'intero look. Puoi sempre ritoccare i singoli pezzi dopo.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {AV_OUTFITS.map(o=>{const own=o.cost===0||ownedAll.includes(o.id);return(
            <div key={o.id} onClick={()=>{
              if(!o.set){return;}
              setDraft(d=>({...d,...o.set}));onToast(`✨ Look ${o.label} provato!`);
              if(typeof window!=="undefined")setTimeout(()=>{const el=document.getElementById("av-preview");if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},50);
            }} style={{borderRadius:16,padding:"18px 10px",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,textAlign:"center",cursor:"pointer"}}>
              <div style={{fontSize:34}}>{o.emoji}</div>
              <div style={{fontSize:14,fontWeight:800,marginTop:6}}>{o.label}</div>
              {o.cost>0&&<div style={{fontSize:11,fontWeight:700,marginTop:3,color:own?T.a4:T.faint}}>{own?"✓ Acquistato":`${o.cost}🪙`}</div>}
            </div>
          );})}
        </div>
      </>)}
      {tab==="fx"&&(<>
        <Label>Effetti speciali</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
          {AV_EFFECT.map(e=>{const own=e.cost===0||ownedAll.includes(e.id);const on=a.effect===e.id;return(
            <div key={e.id} onClick={()=>pickItem("effect",e)} style={{borderRadius:13,padding:"14px 4px",background:on?G.hero:T.surface,border:`1px solid ${on?"transparent":T.line2}`,textAlign:"center",cursor:"pointer",color:on?"#fff":T.text}}>
              <div style={{fontSize:22,height:26}}>{({none:"∅",sparkle:"✨",aura:"🔮",hearts:"💕",fire:"🔥",rainbow:"🌈",stars:"⭐",snow:"❄️",glow:"💡",butterfly:"🦋"})[e.id]}</div>
              <div style={{fontSize:12,fontWeight:700,marginTop:2}}>{e.label}</div>
              {e.cost>0&&<div style={{fontSize:10,fontWeight:700,marginTop:2,color:on?"#fff":own?T.a4:T.faint}}>{own?"✓":`${e.cost}🪙`}</div>}
            </div>
          );})}
        </div>
      </>)}
    </div>

    <div style={{padding:"10px 18px 0"}}>
      <Btn T={T} grad={G.hero} onClick={()=>{
        // strip any unpaid previewed items before committing — revert to the saved look
        const final={...a};
        Object.entries(SLOT_MAP).forEach(([slot,list])=>{
          const cur=list.find(x=>x.id===final[slot]);
          if(cur&&cur.cost>0&&!ownedAll.includes(cur.id))final[slot]=savedLook[slot];
        });
        setAvatars(av=>({...av,[who]:final}));
        onToast("💞 Avatar salvato!");onBack();
      }}>Salva avatar</Btn>
    </div>

    {/* Compact buy/cancel panel — no screen dimming, avatar stays in full focus */}
    {toBuy.length>0&&(
      <div style={{position:"fixed",left:0,right:0,bottom:88,zIndex:9000,maxWidth:412,margin:"0 auto",padding:"0 14px",pointerEvents:"none"}}>
        <style>{`@keyframes popUp2{0%{transform:translateY(50px);opacity:0;}100%{transform:translateY(0);opacity:1;}}`}</style>
        <div style={{pointerEvents:"auto",background:T.bg,borderRadius:20,padding:"14px 16px",animation:"popUp2 0.24s ease-out",boxShadow:"0 12px 40px rgba(0,0,0,0.4)",border:`2px solid ${T.a4}`}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:`${T.a4}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👀</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Stai provando "{toBuy[0].label}"</div>
              <div style={{fontSize:12,color:T.sub,marginTop:1}}>Ti piace? Acquistalo o riprova</div>
            </div>
            <div style={{fontSize:17,fontWeight:800,color:T.a4,whiteSpace:"nowrap"}}>{toBuyTotal}🪙</div>
          </div>
          <div style={{display:"flex",gap:9}}>
            <button onClick={revertWorn} style={{flex:1,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",color:T.sub,border:`1px solid ${T.line2}`,borderRadius:13,padding:"12px",fontSize:14,fontWeight:800,cursor:"pointer"}}>Annulla</button>
            <button onClick={buyWorn} style={{flex:1.7,background:G.hero,color:"#fff",border:"none",borderRadius:13,padding:"12px",fontSize:14,fontWeight:800,cursor:"pointer"}}>{tokens<toBuyTotal?`Mancano ${toBuyTotal-tokens}🪙`:`Acquista · ${toBuyTotal}🪙`}</button>
          </div>
        </div>
      </div>
    )}
  </div>);
}

// ════════ PROFILE + SETTINGS ════════
function Profile({cp,wallet,tokens,setTokens,tickets,streak,wheelDone,setWheelDone,avatars,setTab,onToast,T,G,themeName,setThemeName}){
  const {c,n,pct}=chapterOf(cp);
  const [showSet,setShowSet]=useState(false);
  const [showRev,setShowRev]=useState(false);
  const [wheel,setWheel]=useState(null); // spin result
  const [spinning,setSpinning]=useState(false);
  const WHEEL=[{l:"+20 🪙",v:20,k:"tok"},{l:"+50 🪙",v:50,k:"tok"},{l:"+10 🪙",v:10,k:"tok"},{l:"🎟️ Biglietto",v:1,k:"tic"},{l:"+100 🪙",v:100,k:"tok"},{l:"+30 🪙",v:30,k:"tok"}];
  function spin(){
    if(wheelDone||spinning)return;
    setSpinning(true);
    const pick=WHEEL[Math.floor(Math.random()*WHEEL.length)];
    setTimeout(()=>{
      setWheel(pick);setSpinning(false);setWheelDone(true);
      if(pick.k==="tok")setTokens(t=>t+pick.v);
      onToast(`🎡 Hai vinto ${pick.l}!`);
    },1100);
  }
  const REVENUE=[
    {icon:"✈️",t:"Affiliazione Viaggi",d:"4-8% su prenotazioni · finanzia i premi",g:"a5"},
    {icon:"📺",t:"Ads Rewarded",d:"Video opzionali per il salvadanaio",g:"a3"},
    {icon:"💎",t:"Premium €5.99/mese",d:"Giochi illimitati, esperti completi",g:"a2"},
    {icon:"🧠",t:"Marketplace Esperti",d:"Consulenze a pagamento, 20-30%",g:"a1"},
    {icon:"🎁",t:"Pack Contenuti €2.99",d:"Prematrimoniale, Genitori, Distanza",g:"a1"},
    {icon:"🤝",t:"Brand Partnership",d:"Esperienze sponsorizzate",g:"a4"},
  ];
  return(<div style={{paddingBottom:90}}>
    <div style={{height:120,background:G[c.g],position:"relative"}}>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:84,opacity:0.2}}>{c.icon}</div>
      <div onClick={()=>setShowSet(true)} style={{position:"absolute",top:14,right:16,background:"rgba(255,255,255,0.25)",borderRadius:20,padding:"6px 12px",fontSize:13,color:"#fff",cursor:"pointer",fontWeight:600}}>⚙ Impostazioni</div>
    </div>
    <div style={{padding:"0 18px",marginTop:-36}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:"6px 14px",border:`1px solid ${T.line}`}}><CoupleAvatar avatars={avatars} T={T} G={G} size={76} bg/></div>
        <div onClick={()=>setTab("avatar")} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,borderRadius:14,padding:"8px 14px",fontSize:13,fontWeight:700,color:T.a1,cursor:"pointer",marginBottom:4}}>✏️ Crea avatar</div>
      </div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,marginTop:10}}>{avatars.p1.name} & {avatars.p2.name}</div>
      <div style={{fontSize:13,color:T.sub}}>🇮🇹 Caserta · Insieme dal 2022</div>

      {/* Level + precise progression */}
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:20,marginTop:16,border:`1px solid ${T.line}`}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:60,height:60,borderRadius:17,background:G[c.g],display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}>
            <div style={{fontSize:22,lineHeight:1}}>{c.icon}</div>
            <div style={{fontSize:11,fontWeight:800,marginTop:2}}>Lv.{c.ch}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800}}>{c.name}</div>
            <div style={{fontSize:13,color:T.sub}}>Capitolo {c.ch} di {CHAPTERS.filter(x=>!x.soon).length}</div>
          </div>
        </div>
        <Bar pct={pct} grad={G[c.g]} h={10} T={T}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <span style={{fontSize:12,color:T.faint}}>{cp.toLocaleString()} punti totali</span>
          <span style={{fontSize:12,fontWeight:700,color:T.a2}}>{c===n?"Livello massimo":`${(n.need-cp).toLocaleString()} a Lv.${c.ch+1}`}</span>
        </div>
      </div>

      {/* Stat grid: streak, tokens, tickets, wallet — all shared by the couple */}
      <div style={{fontSize:11.5,color:T.faint,fontWeight:600,marginTop:14,paddingLeft:2}}>💞 Tutto in comune tra voi due</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:8}}>
        {[["🔥",streak,"Serie giorni",T.a3],["🪙",tokens,"Gettoni di coppia",T.a4],["🎟️",tickets,"Biglietti di coppia",T.a1],["💰",`€${fmt(wallet)}`,"Salvadanaio comune",T.a3]].map(([e,v,l,col],i)=>(
          <div key={i} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:16,padding:"14px 16px",border:`1px solid ${T.line}`,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>{e}</span>
            <div><div style={{fontSize:17,fontWeight:800,color:col}}>{v}</div><div style={{fontSize:11,color:T.sub}}>{l}</div></div>
          </div>
        ))}
      </div>

      {/* ── Cosa avete scoperto l'uno dell'altro ── */}
      {(()=>{const matches=DISCOVERIES.filter(d=>d.match);const diffs=DISCOVERIES.filter(d=>!d.match);return(
        <div style={{marginTop:18}}>
          <div style={{fontSize:17,fontWeight:800,letterSpacing:-0.3,marginBottom:3}}>💞 Noi due</div>
          <div style={{fontSize:12.5,color:T.sub,marginBottom:12}}>Cosa avete scoperto l'uno dell'altro giocando</div>
          {DISCOVERIES.length===0
            ? <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px dashed ${T.line2}`,borderRadius:16,padding:"20px 16px",textAlign:"center"}}><div style={{fontSize:30,marginBottom:6}}>🔍</div><div style={{fontSize:13.5,color:T.sub,lineHeight:1.5}}>Giocate insieme e qui comparirà il ritratto della vostra coppia: cosa vi accomuna e cosa vi sorprende l'uno dell'altro.</div></div>
            : <>
                {matches.length>0&&<div style={{marginBottom:diffs.length>0?14:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:T.a2,textTransform:"uppercase",letterSpacing:0.4,marginBottom:8}}>✨ Siete in sintonia su</div>
                  {matches.slice(0,4).map((d,i)=>(<div key={i} style={{background:`${T.a2}0E`,border:`1px solid ${T.a2}28`,borderRadius:14,padding:"11px 14px",marginBottom:8}}><div style={{fontSize:12.5,color:T.sub,marginBottom:2}}>{d.q}</div><div style={{fontSize:14,fontWeight:700,color:T.a2}}>Entrambi: {d.mine}</div></div>))}
                </div>}
                {diffs.length>0&&<div>
                  <div style={{fontSize:12,fontWeight:800,color:T.a3,textTransform:"uppercase",letterSpacing:0.4,marginBottom:8}}>🌗 Una cosa nuova scoperta</div>
                  {diffs.slice(0,4).map((d,i)=>(<div key={i} style={{background:`${T.a3}0E`,border:`1px solid ${T.a3}28`,borderRadius:14,padding:"11px 14px",marginBottom:8}}><div style={{fontSize:12.5,color:T.sub,marginBottom:3}}>{d.q}</div><div style={{display:"flex",gap:8,fontSize:12.5,fontWeight:700}}><span style={{flex:1,color:T.a4}}>Tu: {d.mine}</span><span style={{flex:1,color:T.a3}}>{avatars.p2.name}: {d.partner}</span></div></div>))}
                </div>}
              </>}
        </div>
      );})()}

      <div style={{borderRadius:20,padding:20,marginTop:12,background:wheelDone?T.surface:`linear-gradient(135deg,${T.a1}1A,${T.a4}12)`,border:`1px solid ${wheelDone?T.line:T.a1+"33"}`}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:62,height:62,borderRadius:"50%",background:G.hero,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0,transition:"transform 1s cubic-bezier(.2,.8,.2,1)",transform:spinning?"rotate(1080deg)":"rotate(0deg)"}}>🎡</div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:800}}>Ruota giornaliera</div>
            <div style={{fontSize:12.5,color:T.sub,marginTop:2,lineHeight:1.4}}>{wheelDone?(wheel?`Oggi hai vinto: ${wheel.l}. Torna domani!`:"Già girata oggi. Torna domani!"):"Gira gratis ogni giorno e vinci gettoni o biglietti!"}</div>
          </div>
        </div>
        {!wheelDone&&<Btn T={T} grad={G.hero} disabled={spinning} onClick={spin} style={{marginTop:14}}>{spinning?"Gira...":"Gira la ruota 🎡"}</Btn>}
      </div>

      {/* Premium */}
      <div style={{borderRadius:18,padding:18,marginTop:12,background:G.a2,color:"#fff"}}>
        <div style={{fontSize:16,fontWeight:800}}>💎 Bondly Premium</div>
        <div style={{fontSize:13,marginTop:4,lineHeight:1.5,opacity:0.9}}>Giochi illimitati · Esperti completi · Zero pubblicità · Temi esclusivi</div>
        <Btn T={T} grad="rgba(255,255,255,0.95)" light onClick={()=>onToast("💎 Premium attivato!")} style={{marginTop:14,color:T.text}}>7 giorni gratis · poi €5.99/mese</Btn>
      </div>

      <div onClick={()=>setShowRev(true)} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:16,padding:16,marginTop:12,cursor:"pointer",border:`1px dashed ${T.line2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:13,fontWeight:700}}>📊 Come guadagna Bondly</div><div style={{fontSize:12,color:T.sub,marginTop:2}}>Le 6 fonti di revenue</div></div>
        <span style={{fontSize:18,color:T.faint}}>›</span>
      </div>
    </div>

    {/* Settings sheet with theme picker */}
    {showSet&&(<Sheet onClose={()=>setShowSet(false)} T={T}>
      <div style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800}}>Impostazioni</div><span onClick={()=>setShowSet(false)} style={{fontSize:22,color:T.sub,cursor:"pointer"}}>✕</span></div>
        <div style={{fontSize:13,color:T.sub,fontWeight:700,marginBottom:12}}>🎨 Tema colori</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {Object.entries(THEMES).map(([k,th])=>(
            <div key={k} onClick={()=>setThemeName(k)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderRadius:14,background:themeName===k?`${th.a1}14`:T.surface2,border:`1px solid ${themeName===k?th.a1:T.line}`,cursor:"pointer"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{display:"flex",gap:4}}>{th.swatch.map((s,j)=>(<div key={j} style={{width:18,height:18,borderRadius:"50%",background:s}}/>))}</div>
                <span style={{fontSize:15,fontWeight:600}}>{th.name}</span>
              </div>
              {themeName===k&&<span style={{color:th.a1,fontSize:16,fontWeight:800}}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </Sheet>)}

    {/* Revenue sheet */}
    {showRev&&(<Sheet onClose={()=>setShowRev(false)} T={T}>
      <div style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:800}}>💰 Modello di Guadagno</div><span onClick={()=>setShowRev(false)} style={{fontSize:22,color:T.sub,cursor:"pointer"}}>✕</span></div>
        <div style={{fontSize:13,color:T.sub,marginBottom:18,lineHeight:1.5}}>La #1 finanzia i premi che regaliamo — così il salvadanaio è sostenibile.</div>
        {REVENUE.map((r,i)=>(<div key={i} style={{display:"flex",gap:14,marginBottom:14,padding:14,background:T.surface2,borderRadius:16}}><div style={{width:44,height:44,borderRadius:12,background:G[r.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{r.icon}</div><div><div style={{fontSize:14,fontWeight:700}}>{r.t}</div><div style={{fontSize:12,color:T.sub,marginTop:2,lineHeight:1.4}}>{r.d}</div></div></div>))}
      </div>
    </Sheet>)}
  </div>);
}

// ════════ ARENA (Duels + Tournaments + Lottery + Leaderboard) ════════
function Arena({tokens,setTokens,tickets,setTickets,avatars,onToast,T,G}){
  const [tab2,setTab2]=useState("duelli");
  const me=LEADERBOARD.find(l=>l.me);
  const TICKET_COST=100;

  function joinDuel(d){
    if(tokens<d.buyin){onToast("🪙 Gettoni insufficienti — gioca per guadagnarne!");return;}
    // turn-based: you play your turn now, opponent plays later → challenge stays pending
    setTokens(t=>t-d.buyin);
    onToast(`📨 Sfida inviata! ${d.buyin}🪙 in palio · attendi l'avversario`);
  }
  function buyTicket(){
    if(tokens<TICKET_COST){onToast("🪙 Ti servono 100 gettoni per un biglietto");return;}
    setTokens(t=>t-TICKET_COST);setTickets(n=>n+1);onToast("🎟️ Biglietto Lotteria acquistato!");
  }

  return(<div style={{paddingBottom:90}}>
    <div style={{padding:"18px 18px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.6}}>Arena</div><div style={{fontSize:14,color:T.sub,marginTop:3}}>🕓 Sfide a turni · gettoni in comune con {avatars?.p2?.name||"il partner"}</div></div>
        <div style={{background:`${T.a3}18`,border:`1px solid ${T.a3}40`,borderRadius:16,padding:"8px 14px",textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:800,color:T.a3}}>🪙 {tokens}</div>
          <div style={{fontSize:10,color:T.faint}}>Gettoni di coppia</div>
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,padding:"16px 18px 4px"}}>
      {[["duelli","⚔️ Duelli"],["tornei","🏆 Tornei"],["classifica","📊 Top"]].map(([id,l])=>(
        <button key={id} onClick={()=>setTab2(id)} style={{flex:1,background:tab2===id?G.hero:T.surface,color:tab2===id?"#fff":T.sub,border:tab2===id?"none":`1px solid ${T.line2}`,borderRadius:13,padding:"10px 4px",fontSize:11.5,fontWeight:700,cursor:"pointer"}}>{l}</button>
      ))}
    </div>

    {/* DUELS — 1v1 and 2v2 with token betting */}
    {tab2==="duelli"&&(<div style={{padding:"12px 18px 0"}}>
      {/* Avatar vs preview */}
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,border:`1px solid ${T.line}`,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-around"}}>
        <div style={{textAlign:"center"}}>{avatars&&<CoupleAvatar avatars={avatars} T={T} G={G} size={64}/>}<div style={{fontSize:11,fontWeight:700,marginTop:4,color:T.a1}}>Voi</div></div>
        <div style={{fontSize:20,fontWeight:800,color:T.faint}}>VS</div>
        <div style={{textAlign:"center"}}>
          <CoupleAvatar avatars={{p1:{name:"",skin:"#D49B6A",hair:"buzz",hairColor:"#2B2B2B",face:"calm",top:"tee",topColor:"#3BC9A8",bottom:"jeans",shoes:"sneakers",glasses:"none",neck:"none",hat:"cap"},p2:{name:"",skin:"#F4C9A8",hair:"pony",hairColor:"#D9A441",face:"smile",top:"tee",topColor:"#FFB347",bottom:"shorts",shoes:"sneakers",glasses:"none",neck:"none",hat:"none"}}} T={T} G={G} size={64}/>
          <div style={{fontSize:11,fontWeight:700,marginTop:4,color:T.sub}}>Avversari</div>
        </div>
      </div>
      <div style={{fontSize:13,color:T.sub,lineHeight:1.5,marginBottom:14}}>Scommetti gettoni in una sfida. Chi vince prende il montepremi. <b style={{color:T.text}}>Da soli o in coppia.</b></div>
      {["1v1","2v2"].map(mode=>(
        <div key={mode} style={{marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:T.faint,textTransform:"uppercase",letterSpacing:0.5,margin:"8px 2px"}}>{mode==="1v1"?"👤 Singolo · 1 vs 1":"💑 Coppia · 2 vs 2"}</div>
          {DUELS.filter(d=>d.mode===mode).map((d,i)=>(
            <div key={i} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,marginBottom:10,border:`1px solid ${T.line}`,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:50,height:50,borderRadius:14,background:G[d.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{d.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700}}>{d.name}</div>
                <div style={{fontSize:12,color:T.sub,marginTop:2,lineHeight:1.4}}>{d.desc}</div>
                <div style={{fontSize:12,fontWeight:700,color:T.a3,marginTop:5}}>Buy-in: {d.buyin} 🪙 · Vincita: {d.buyin*2} 🪙</div>
              </div>
              <Btn T={T} grad={G[d.g]} onClick={()=>joinDuel(d)} style={{width:"auto",padding:"9px 14px",fontSize:12}}>Sfida</Btn>
            </div>
          ))}
        </div>
      ))}
      <div style={{background:`${T.a4}10`,border:`1px solid ${T.a4}26`,borderRadius:14,padding:14,marginTop:8,fontSize:12,color:T.sub,lineHeight:1.5}}>💡 I gettoni si guadagnano giocando — non si comprano. Sono per il divertimento competitivo, separati dal salvadanaio in euro.</div>
      {/* Recharge when out of tokens */}
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:16,padding:16,marginTop:10,border:`1px solid ${T.line}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <span style={{fontSize:24}}>🪙</span>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700}}>Finiti i gettoni?</div><div style={{fontSize:12,color:T.sub,marginTop:1}}>Guarda un breve video e ricaricane 30, gratis</div></div>
        </div>
        <Btn T={T} grad={G.a4} onClick={()=>{setTokens(t=>t+30);onToast("📺 +30 gettoni!");}}>📺 Guarda e ricarica · +30 🪙</Btn>
      </div>
    </div>)}

    {/* TOURNAMENTS — smaller token prizes */}
    {tab2==="tornei"&&(<div style={{padding:"12px 18px 0"}}>
      {TOURNAMENTS.map((t,i)=>(
        <div key={i} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:18,marginBottom:12,border:`1px solid ${T.line}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:48,height:48,borderRadius:14,background:G[t.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{t.emoji}</div>
            <div><div style={{fontSize:16,fontWeight:800}}>{t.name}</div><span style={{fontSize:11,fontWeight:700,color:t.status==="live"?T.a4:T.faint}}>{t.status==="live"?"🔴 In corso":"⏳ In arrivo"}</span></div>
          </div>
          <div style={{fontSize:13,color:T.sub,lineHeight:1.5,marginBottom:12}}>{t.desc}</div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1,background:T.surface2,borderRadius:12,padding:"10px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:T.a3}}>{t.buyin} 🪙</div><div style={{fontSize:11,color:T.faint}}>Buy-in</div></div>
            <div style={{flex:1,background:T.surface2,borderRadius:12,padding:"10px",textAlign:"center"}}><div style={{fontSize:13,fontWeight:800,color:T.a2}}>{t.couples>0?t.couples.toLocaleString():"—"}</div><div style={{fontSize:11,color:T.faint}}>Coppie</div></div>
            <div style={{flex:1,background:T.surface2,borderRadius:12,padding:"10px",textAlign:"center"}}><div style={{fontSize:13,fontWeight:800,color:T.a4}}>{t.ends}</div><div style={{fontSize:11,color:T.faint}}>Scade</div></div>
          </div>
          <div style={{background:`${T.a3}14`,borderRadius:12,padding:"10px 14px",marginBottom:12,fontSize:13}}>🎁 Premio: <b style={{color:T.a3}}>{t.prize}</b></div>
          <Btn T={T} grad={G[t.g]} onClick={()=>{if(t.status!=="live"){onToast("🔔 Ti avviseremo!");return;}if(tokens<t.buyin){onToast("🪙 Gettoni insufficienti");return;}setTokens(x=>x-t.buyin);onToast(`⚔️ Iscritti a ${t.name}!`);}}>{t.status==="live"?`Partecipa · ${t.buyin} 🪙`:"Notificami"}</Btn>
        </div>
      ))}
    </div>)}

    {/* LOTTERY */}
    {/* LEADERBOARD */}
    {tab2==="classifica"&&(<div style={{padding:"12px 18px 0"}}>
      {me&&(<div style={{background:`${T.a1}14`,border:`1px solid ${T.a1}33`,borderRadius:18,padding:16,marginBottom:14}}>
        <div style={{fontSize:11,color:T.a1,fontWeight:700,marginBottom:8,textTransform:"uppercase"}}>La vostra posizione</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:24,fontWeight:800,color:T.a1}}>#{me.rank}</div>
          <div style={{width:42,height:42,borderRadius:"50%",background:G.hero,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{me.av}</div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:800}}>{me.couple}</div><div style={{fontSize:12,color:T.sub}}>🪙 {me.tok.toLocaleString()} gettoni</div></div>
        </div>
      </div>)}
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:16,border:`1px solid ${T.line}`}}>
        <div style={{fontSize:13,fontWeight:800,marginBottom:14}}>🌍 Top coppie · gettoni vinti</div>
        {LEADERBOARD.filter(l=>!l.me).map((l,i)=>{const medal=["🥇","🥈","🥉"][l.rank-1];return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<4?`1px solid ${T.line}`:"none"}}>
            <div style={{width:26,textAlign:"center",fontSize:l.rank<=3?18:14,fontWeight:800,color:T.sub}}>{medal||l.rank}</div>
            <div style={{width:38,height:38,borderRadius:"50%",background:G[["a1","a2","a3","a4","a5"][l.rank%5]],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{l.av}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{l.flag} {l.couple}</div><div style={{fontSize:11,color:T.faint}}>🪙 {l.tok.toLocaleString()}</div></div>
            <span style={{fontSize:18}}>{l.badge}</span>
          </div>
        );})}
      </div>
    </div>)}
  </div>);
}

// ════════ AUTH FLOW (account → couple → invite) ════════
function Auth({T,G,onDone}){
  const [step,setStep]=useState("welcome"); // welcome | taster | reward | signup | couple | create | join | ready
  const [tasteIdx,setTasteIdx]=useState(0);
  const [taps,setTaps]=useState(0); // 0..3 — piggy bank cracks
  const [tGamePhase,setTGamePhase]=useState("ready"); // ready | play | over
  const [quizIdx,setQuizIdx]=useState(0);
  const [quizAns,setQuizAns]=useState([]);
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [authLoading,setAuthLoading]=useState(false);
  const [authError,setAuthError]=useState("");
  const [isLogin,setIsLogin]=useState(false);
  const [partnerName,setPartnerName]=useState("");
  const [joinCode,setJoinCode]=useState("");
  // first avatar traits chosen at signup
  const [figure,setFigure]=useState(null); // "m" | "f" | "x"
  const [initTab,setInitTab]=useState("skin"); // which color shows beside avatar in onboarding
  const [clothSex,setClothSex]=useState("all"); // m | f | u | all filter for clothing
  const [av,setAv]=useState({skin:AV_SKIN[1],hair:"short",hairColor:"#2B2B2B",top:"tank",topColor:"#7C6FF0",bottom:"briefs",bottomColor:"#3D3A4A",shoes:"sneakers"});
  const setAvF=(k,v)=>setAv(p=>({...p,[k]:v}));
  const myCode="BND-7K2F";
  const inp={width:"100%",background:T.surface2,border:`1px solid ${T.line2}`,borderRadius:14,padding:"15px 16px",fontSize:15,outline:"none",color:T.text,marginBottom:12,boxSizing:"border-box"};
  const Wrap=({children})=>(<div style={{position:"fixed",inset:0,background:T.bgScene||T.bg,color:T.text,zIndex:1000,maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",padding:"0 24px",overflowY:"auto"}}>{children}</div>);

  // ── Taster mini-game: break the piggy bank (3 taps, no continuous animation = no lag) ──
  function startTaster(){setTaps(0);setTGamePhase("play");}
  function tapPiggy(){
    if(tGamePhase!=="play")return;
    const n=taps+1;setTaps(n);
    if(n>=3){setTGamePhase("over");setTimeout(()=>setStep("reward"),1100);}
  }

  if(step==="welcome") return(<Wrap>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
      {/* Logo mark */}
      <div style={{position:"relative",marginBottom:30}}>
        <div style={{width:108,height:108,borderRadius:32,background:G.hero,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,boxShadow:`0 16px 50px ${T.a1}55`}}>💞</div>
        <div style={{position:"absolute",top:-8,right:-14,width:38,height:38,borderRadius:"50%",background:G.a3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:`0 6px 18px ${T.a3}66`}}>🎮</div>
        <div style={{position:"absolute",bottom:-6,left:-14,width:34,height:34,borderRadius:"50%",background:G.a4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 6px 18px ${T.a4}66`}}>💰</div>
      </div>

      <div style={{fontFamily:"'Sora',sans-serif",fontSize:38,fontWeight:800,letterSpacing:-1.5,background:"linear-gradient(135deg,#FF6FB0,#B98CFF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:16}}>bondly</div>

      {/* The one-line promise */}
      <div style={{fontSize:21,fontWeight:700,color:T.text,lineHeight:1.4,maxWidth:320,marginBottom:14,letterSpacing:-0.3}}>Giocate insieme.<br/>Crescete come coppia.<br/><span style={{background:G.hero,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Venite premiati davvero.</span></div>

      <div style={{fontSize:15,color:T.sub,lineHeight:1.55,maxWidth:300}}>Decine di giochi per due, vicini o a distanza. Ogni momento insieme riempie un salvadanaio reale.</div>
    </div>

    <div style={{paddingBottom:40,width:"100%"}}>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:20}}>
        {[["🎮","Giochi di coppia"],["⚔️","Arena Online"],["🏆","Tornei"],["💜","Esperti d'amore"],["🎁","Premi Veri"],["✈️","Viaggi"]].map(([e,l],i)=>(
          <div key={i} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:13,padding:"9px 13px",display:"flex",alignItems:"center",gap:7,border:`1px solid ${T.line}`}}><span style={{fontSize:16}}>{e}</span><span style={{fontSize:12.5,color:T.text,fontWeight:600}}>{l}</span></div>
        ))}
      </div>
      <Btn T={T} grad={G.hero} onClick={()=>{setTGamePhase("ready");setStep("choose");}}>✨ Provala adesso</Btn>
      <div onClick={()=>{setIsLogin(true);setStep("signup");}} style={{textAlign:"center",marginTop:16,fontSize:14,color:T.sub,cursor:"pointer"}}>Ho già un account? <b style={{color:T.a1}}>Accedi</b></div>
    </div>
  </Wrap>);

  if(step==="choose"){
    return(<Wrap>
      <div style={{paddingTop:30}}><span onClick={()=>setStep("welcome")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{fontSize:44,marginBottom:14}}>💞</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:8}}>Come volete iniziare?</div>
          <div style={{fontSize:15,color:T.sub,lineHeight:1.5,maxWidth:300,margin:"0 auto"}}>Scegli il tuo primo assaggio di Bondly. Entrambi ti fanno guadagnare il regalo di benvenuto.</div>
        </div>
        {/* Option: game */}
        <div onClick={()=>{setTGamePhase("ready");setStep("taster");}} style={{borderRadius:22,padding:22,marginBottom:14,background:G.a3,color:"#fff",cursor:"pointer",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-16,right:-8,fontSize:90,opacity:0.2}}>🐷</div>
          <div style={{position:"relative"}}>
            <div style={{fontSize:30,marginBottom:8}}>🐷</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:800}}>Rompi il salvadanaio</div>
            <div style={{fontSize:13.5,opacity:0.94,marginTop:4,lineHeight:1.4,maxWidth:260}}>Tre tocchi e scopri il tuo regalo di benvenuto. Veloce e soddisfacente! 💰</div>
          </div>
        </div>
        {/* Option: quiz */}
        <div onClick={()=>{setQuizIdx(0);setQuizAns([]);setStep("introquiz");}} style={{borderRadius:22,padding:22,background:G.a2,color:"#fff",cursor:"pointer",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-16,right:-8,fontSize:90,opacity:0.18}}>💭</div>
          <div style={{position:"relative"}}>
            <div style={{fontSize:30,marginBottom:8}}>💭</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:800}}>Un quiz introspettivo</div>
            <div style={{fontSize:13.5,opacity:0.92,marginTop:4,lineHeight:1.4,maxWidth:250}}>Tre domande dolci su di voi come coppia. Per iniziare a conoscervi meglio.</div>
          </div>
        </div>
      </div>
    </Wrap>);
  }

  if(step==="introquiz"){
    const QUIZ=[
      {q:"Cosa vi unisce di più come coppia?",opts:["Le risate insieme 😄","Il sostegno reciproco 🤝","La passione 🔥","I sogni condivisi 🌟"]},
      {q:"Come vi ricaricate insieme?",opts:["Una serie sul divano 🛋️","Un'avventura fuori 🌍","Una cena speciale 🍷","Coccole e relax 💆"]},
      {q:"Cosa vorreste coltivare di più?",opts:["Il tempo di qualità ⏳","La complicità 💞","Le nuove esperienze ✨","La comunicazione 💬"]},
    ];
    const q=QUIZ[quizIdx];
    function answer(i){
      const na=[...quizAns,i];setQuizAns(na);
      if(quizIdx>=QUIZ.length-1){setStep("reward");} // give a nice welcome reward
      else setQuizIdx(x=>x+1);
    }
    return(<Wrap>
      <div style={{paddingTop:30,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span onClick={()=>setStep("choose")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span>
        <span style={{fontSize:13,color:T.faint}}>{quizIdx+1} di {QUIZ.length}</span>
      </div>
      <div style={{paddingTop:8}}><Bar pct={(quizIdx/QUIZ.length)*100} grad={G.hero} T={T}/></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.a2,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>💭 Conoscetevi meglio</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:23,fontWeight:800,letterSpacing:-0.4,textAlign:"center",lineHeight:1.35,marginBottom:28}}>{q.q}</div>
        {q.opts.map((o,i)=>(
          <div key={i} onClick={()=>answer(i)} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${T.line2}`,borderRadius:16,padding:"17px 18px",marginBottom:11,fontSize:15.5,fontWeight:600,cursor:"pointer"}}>{o}</div>
        ))}
      </div>
      <div style={{paddingBottom:30,fontSize:12.5,color:T.faint,textAlign:"center",lineHeight:1.5}}>Non ci sono risposte giuste o sbagliate — solo la vostra storia 💞</div>
    </Wrap>);
  }

  if(step==="taster"){
    const cracked=taps>=1, cracked2=taps>=2, broken=tGamePhase==="over";
    return(<Wrap>
      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-6px) rotate(-3deg)}75%{transform:translateX(6px) rotate(3deg)}}
        @keyframes coinOut{0%{transform:translate(0,0) scale(0.5);opacity:0}30%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1);opacity:0}}
        @keyframes popThump{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 10px 40px ${T.a3}44}50%{box-shadow:0 10px 60px ${T.a3}88}}
      `}</style>
      <div style={{paddingTop:30,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span onClick={()=>{setTGamePhase("ready");setStep("choose");}} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span>
      </div>

      {tGamePhase==="ready"&&(<div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:72,marginBottom:20}}>🐷</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:12}}>Rompi il salvadanaio</div>
        <div style={{fontSize:16,color:T.sub,lineHeight:1.6,maxWidth:300,marginBottom:20}}>Tocca il salvadanaio 3 volte per romperlo e scoprire il tuo regalo di benvenuto!</div>
        <div style={{background:`${T.a3}12`,border:`1px solid ${T.a3}30`,borderRadius:18,padding:"16px 20px",display:"flex",alignItems:"center",gap:13,maxWidth:330}}>
          <span style={{fontSize:30}}>🎁</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,fontWeight:800,color:T.a3}}>Regalo di benvenuto</div>
            <div style={{fontSize:13,color:T.sub,lineHeight:1.4,marginTop:1}}>Le vincite vanno nel tuo salvadanaio: soldi veri da spendere insieme, per un regalo o un viaggio.</div>
          </div>
        </div>
      </div>)}

      {(tGamePhase==="play"||broken)&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}>
          {/* tap target */}
          <div onClick={tapPiggy} style={{position:"relative",cursor:broken?"default":"pointer",userSelect:"none",WebkitTapHighlightColor:"transparent"}}>
            <div key={taps} style={{fontSize:150,lineHeight:1,animation:broken?"none":"popThump 0.18s ease-out",display:broken?"none":"block",filter:cracked2?"saturate(0.85)":"none"}}>🐷</div>
            {/* cracks appear as overlay lines, no re-render loop */}
            {cracked&&!broken&&<div style={{position:"absolute",top:"38%",left:"46%",fontSize:40,color:"#3D3A4A",fontWeight:900,pointerEvents:"none",transform:"rotate(12deg)"}}>⚡</div>}
            {cracked2&&!broken&&<div style={{position:"absolute",top:"30%",left:"30%",fontSize:30,color:"#3D3A4A",fontWeight:900,pointerEvents:"none",transform:"rotate(-18deg)"}}>⚡</div>}
            {broken&&(<div style={{position:"relative",width:240,height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:120,animation:"popThump 0.4s ease-out"}}>💰</div>
              {/* one-shot coins flying out */}
              {[
                {dx:"-90px",dy:"-70px"},{dx:"90px",dy:"-70px"},{dx:"-110px",dy:"10px"},
                {dx:"110px",dy:"10px"},{dx:"-50px",dy:"-110px"},{dx:"50px",dy:"-110px"},
                {dx:"0px",dy:"-130px"},{dx:"-130px",dy:"-30px"},{dx:"130px",dy:"-30px"},
              ].map((c,i)=>(
                <div key={i} style={{position:"absolute",left:"50%",top:"50%",fontSize:26,pointerEvents:"none","--dx":c.dx,"--dy":c.dy,animation:`coinOut 0.8s ease-out ${i*0.04}s forwards`}}>🪙</div>
              ))}
            </div>)}
          </div>

          {!broken&&<>
            {/* progress dots */}
            <div style={{display:"flex",gap:10,marginTop:30}}>
              {[0,1,2].map(i=>(<div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<taps?G.a3:T.surface2,border:`2px solid ${i<taps?"transparent":T.line2}`,transition:"background 0.15s"}}/>))}
            </div>
            <div style={{fontSize:16,fontWeight:800,color:T.a1,marginTop:18}}>{taps===0?"Tocca il salvadanaio! 👆":taps===1?"Ancora! 💪":"Un altro colpo! 🔨"}</div>
          </>}
          {broken&&<div style={{fontSize:20,fontWeight:800,color:T.a3,marginTop:10,animation:"popThump 0.5s ease-out"}}>💥 Rotto!</div>}
        </div>
      )}

      <div style={{paddingBottom:40}}>
        {tGamePhase==="ready"&&<Btn T={T} grad={G.hero} onClick={startTaster}>Inizia 🐷</Btn>}
      </div>
    </Wrap>);
  }

  // ── REWARD: coins fly into balance, welcome cash in piggy ──
  if(step==="reward"){
    const coinsWon=80;
    const cashWon=(0.30).toFixed(2);
    return(<Wrap>
      <style>{`@keyframes flyup{0%{transform:translateY(40px) scale(0.4);opacity:0}50%{opacity:1}100%{transform:translateY(-10px) scale(1);opacity:1}}@keyframes coinpop{0%{transform:scale(0) rotate(-30deg)}60%{transform:scale(1.25) rotate(8deg)}100%{transform:scale(1) rotate(0)}}@keyframes shimmer{0%,100%{opacity:0.6}50%{opacity:1}}@keyframes glow{0%,100%{box-shadow:0 16px 50px ${T.a3}44}50%{box-shadow:0 16px 60px ${T.a3}88}}`}</style>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:13,fontWeight:800,color:T.a3,letterSpacing:1,textTransform:"uppercase",marginBottom:8,animation:"shimmer 1.5s infinite"}}>✨ Regalo di benvenuto ✨</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:27,fontWeight:800,letterSpacing:-0.5,marginBottom:28}}>Hai già guadagnato!</div>

        {/* Salvadanaio prize — the hero */}
        <div style={{width:130,height:130,borderRadius:36,background:G.a3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,marginBottom:18,animation:"coinpop 0.7s ease-out, glow 2s ease-in-out infinite"}}>💰</div>
        <div style={{fontSize:46,fontWeight:800,color:T.a3,animation:"flyup 0.8s ease-out",letterSpacing:-1}}>€{cashWon}</div>
        <div style={{fontSize:15,color:T.sub,marginBottom:8,maxWidth:280}}>nel tuo salvadanaio reale — soldi per un regalo o un viaggio insieme 💕</div>

        {/* Coins secondary */}
        <div style={{display:"flex",alignItems:"center",gap:10,background:`${T.a4}12`,border:`1px solid ${T.a4}30`,borderRadius:16,padding:"12px 18px",marginTop:14,animation:"flyup 1s ease-out"}}>
          <span style={{fontSize:26}}>🪙</span>
          <div style={{textAlign:"left"}}><div style={{fontSize:18,fontWeight:800,color:T.a4}}>+{coinsWon} gettoni</div><div style={{fontSize:11.5,color:T.sub}}>per sfidare altre coppie nell'Arena</div></div>
        </div>
      </div>

      <div style={{paddingBottom:40}}>
        <div style={{fontSize:15,color:T.text,textAlign:"center",lineHeight:1.5,marginBottom:8,fontWeight:600}}>E questo è solo l'inizio.</div>
        <div style={{fontSize:12.5,color:T.faint,textAlign:"center",lineHeight:1.5,marginBottom:18}}>Continua a giocare per riempire il salvadanaio. Da €20 lo converti in un buono vero (Amazon, Booking e altri).</div>
        <Btn T={T} grad={G.hero} onClick={()=>setStep("signup")}>Crea l'account e tieni il regalo →</Btn>
        <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:12}}>Gratis · i tuoi premi ti aspettano</div>
      </div>
    </Wrap>);
  }

  if(step==="pitch") return(<Wrap>
    <div style={{paddingTop:30}}><span onClick={()=>setStep("taster")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{flex:1,paddingTop:18}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:25,fontWeight:800,letterSpacing:-0.5,marginBottom:4}}>Ecco com'è fatta Bondly</div>
      <div style={{fontSize:14,color:T.sub,marginBottom:24}}>Tre cose, in poche parole.</div>

      {[
        {e:"🎮",g:"a1",t:"Giocate insieme",d:"Decine di giochi per conoscervi, ridere e riaccendere la scintilla — vicini o a distanza, anche a turni quando avete tempo."},
        {e:"📈",g:"a2",t:"Crescete come coppia",d:"Ogni gioco vi fa avanzare nei Capitoli e sblocca esperienze nuove. Più consigli di psicologi e sessuologi, sempre con voi."},
        {e:"💰",g:"a3",t:"Venite premiati davvero",d:"Mentre giocate accumulate un salvadanaio reale: buoni Amazon, Booking e altri, o risparmi per il viaggio dei vostri sogni."},
      ].map((s,i)=>(
        <div key={i} style={{display:"flex",gap:14,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:18,marginBottom:12,border:`1px solid ${T.line}`}}>
          <div style={{width:50,height:50,borderRadius:14,background:G[s.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{s.e}</div>
          <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,marginBottom:3}}>{s.t}</div><div style={{fontSize:13,color:T.sub,lineHeight:1.55}}>{s.d}</div></div>
        </div>
      ))}

      <div style={{background:`${T.a1}12`,border:`1px solid ${T.a1}30`,borderRadius:16,padding:16,marginTop:6,textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:700,color:T.a1}}>Gratis. Si gioca anche da soli.</div>
        <div style={{fontSize:13,color:T.sub,marginTop:4,lineHeight:1.5}}>Invita il partner quando vuoi: i progressi restano salvati per sempre.</div>
      </div>
    </div>
    <div style={{paddingBottom:40}}>
      <Btn T={T} grad={G.hero} onClick={()=>setStep("signup")}>Crea il nostro spazio</Btn>
      <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:12}}>Bastano 30 secondi</div>
    </div>
  </Wrap>);

  if(step==="signup") return(<Wrap>
    <div style={{paddingTop:30}}><span onClick={()=>{setIsLogin(false);setStep("welcome");}} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{paddingTop:24,flex:1}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:6}}>{isLogin?"Bentornato 👋":"Crea il tuo account"}</div>
      <div style={{fontSize:14,color:T.sub,marginBottom:28}}>{isLogin?"Accedi per ritrovare i tuoi progressi.":"Ognuno ha il proprio profilo. Poi vi collegate come coppia."}</div>
      <Btn T={T} variant="ghost" disabled={authLoading} onClick={async()=>{
        setAuthLoading(true);setAuthError("");
        const{error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});
        if(error){setAuthError(error.message);setAuthLoading(false);}
      }} style={{marginBottom:20}}>🔵 Continua con Google</Btn>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><div style={{flex:1,height:1,background:T.line2}}/><span style={{fontSize:12,color:T.faint}}>oppure</span><div style={{flex:1,height:1,background:T.line2}}/></div>
      {!isLogin&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Il tuo nome" style={inp}/>}
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="La tua email" style={inp}/>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={inp}/>
      {authError&&<div style={{fontSize:13,color:"#ff6b6b",marginBottom:12,textAlign:"center"}}>{authError}</div>}
      <div onClick={()=>{setIsLogin(x=>!x);setAuthError("");}} style={{textAlign:"center",fontSize:14,color:T.sub,cursor:"pointer",marginBottom:8}}>{isLogin?"Non hai ancora un account? ":"Hai già un account? "}<b style={{color:T.a1}}>{isLogin?"Registrati":"Accedi"}</b></div>
    </div>
    <div style={{paddingBottom:40}}>
      <Btn T={T} grad={G.hero} disabled={authLoading||!email.trim()||!password.trim()||(!isLogin&&!name.trim())} onClick={async()=>{
        setAuthLoading(true);setAuthError("");
        if(isLogin){
          const{error}=await supabase.auth.signInWithPassword({email,password});
          if(error){setAuthError(error.message);setAuthLoading(false);return;}
          setAuthLoading(false);onDone(null);
        } else {
          const{error}=await supabase.auth.signUp({email,password,options:{data:{name}}});
          if(error){setAuthError(error.message);setAuthLoading(false);return;}
          setAuthLoading(false);setStep("avatar");
        }
      }}>{authLoading?"...":(isLogin?"Accedi":"Continua")}</Btn>
      <div style={{fontSize:11,color:T.faint,textAlign:"center",marginTop:12,lineHeight:1.5}}>Continuando accetti i Termini e la Privacy Policy</div>
    </div>
  </Wrap>);

  if(step==="avatar"){
    const previewData={...DEFAULT_AVATARS.p1,name,...av};
    const initColor=initTab==="hair"?((av.hair==="buzz"||av.hair==="bald")?{field:"skin",label:"Carnagione",colors:AV_SKIN}:{field:"hairColor",label:"Colore capelli",colors:AV_HAIR_COLORS})
      :initTab==="top"?{field:"topColor",label:"Colore sopra",colors:AV_TOP_COLORS}
      :initTab==="bottom"?{field:"bottomColor",label:"Colore sotto",colors:AV_TOP_COLORS}
      :initTab==="shoes"?{field:"shoeColor",label:"Colore scarpe",colors:AV_SHOE_COLORS}
      :{field:"skin",label:"Carnagione",colors:AV_SKIN};
    const figures=[
      {id:"m",label:"Maschile",emoji:"👨",pre:{hair:"short",top:"tank",bottom:"briefs",shoes:"sneakers"}},
      {id:"f",label:"Femminile",emoji:"👩",pre:{hair:"long",top:"bra",bottom:"briefs",shoes:"sneakers"}},
      {id:"x",label:"Preferisco non dirlo",emoji:"🧑",pre:{hair:"short",top:"tank",bottom:"briefs",shoes:"sneakers"}},
    ];
    return(<div style={{position:"fixed",inset:0,background:T.bgScene||T.bg,color:T.text,zIndex:1000,maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",padding:"0 24px",overflowY:"auto"}}>
      <div style={{paddingTop:30}}><span onClick={()=>setStep("signup")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
      <div style={{paddingTop:12,flex:1}}>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:6}}>Crea il tuo avatar ✨</div>
        <div style={{fontSize:14,color:T.sub,marginBottom:20,lineHeight:1.5}}>Scegli i primi tratti. Potrai personalizzarlo nei minimi dettagli più avanti.</div>

        {!figure?<>
          {/* live preview centered while choosing base */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <div style={{borderRadius:24,overflow:"hidden",border:`1px solid ${T.line}`}}><Avatar data={previewData} T={T} G={G} size={188} bg/></div>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:T.sub,marginBottom:12,textAlign:"center"}}>Come vuoi che parta il tuo avatar?</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {figures.map(f=>(
              <div key={f.id} onClick={()=>{setFigure(f.id);setAv(p=>({...p,...f.pre}));}} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:18,padding:"16px 18px",border:`1px solid ${T.line2}`,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:46,height:46,borderRadius:13,background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{f.emoji}</div>
                <div style={{flex:1,fontSize:16,fontWeight:700}}>{f.label}</div>
                <span style={{fontSize:20,color:T.faint}}>›</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11.5,color:T.faint,textAlign:"center",marginTop:16,lineHeight:1.5}}>È solo un punto di partenza estetico. Il tuo partner creerà il suo avatar dal suo telefono 💞</div>
        </>:<>
          {/* HYBRID: avatar left + contextual colors right (sticky) */}
          <div style={{position:"sticky",top:0,zIndex:50,background:T.bg,paddingBottom:10}}>
            <div style={{borderRadius:20,padding:"14px 16px",background:`linear-gradient(135deg,${T.a1}14,${T.a2}0A)`,border:`1px solid ${T.line}`,display:"flex",gap:12,alignItems:"stretch"}}>
              <div style={{flexShrink:0}}><Avatar data={previewData} T={T} G={G} size={172} bg/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:800,color:T.faint,textTransform:"uppercase",letterSpacing:0.4,marginBottom:7}}>{initColor.label}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,overflowY:"auto",maxHeight:118,alignContent:"flex-start"}}>
                  {initColor.colors.map(c=>(<div key={c} onClick={()=>setAvF(initColor.field,c)} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",flexShrink:0,border:av[initColor.field]===c?`3px solid ${T.a1}`:`2px solid ${T.line2}`}}/>))}
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"4px 0 10px"}}>
            <div style={{fontSize:13,fontWeight:700,color:T.sub}}>Personalizza</div>
            <span onClick={()=>setFigure(null)} style={{fontSize:12.5,color:T.a1,fontWeight:700,cursor:"pointer"}}>← Cambia base</span>
          </div>

          {/* mini tabs choosing which color shows on the right */}
          <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",marginBottom:14}}>
            {[["skin","😊 Pelle"],["hair","💇 Capelli"],["top","👕 Sopra"],["bottom","👖 Sotto"],["shoes","👟 Scarpe"],["glasses","🕶 Occhiali"],["tattoo","🎨 Tatuaggi"]].map(([id,l])=>(
              <button key={id} onClick={()=>setInitTab(id)} style={{background:initTab===id?G.hero:T.surface,color:initTab===id?"#fff":T.sub,border:initTab===id?"none":`1px solid ${T.line2}`,borderRadius:14,padding:"8px 13px",fontSize:12.5,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
            ))}
          </div>

          {/* big item choices full width, depend on tab */}
          {(initTab==="top"||initTab==="bottom")&&(
            <div style={{display:"flex",gap:7,marginBottom:12}}>
              {[["all","Tutti"],["m","♂ Lui"],["f","♀ Lei"],["u","Unisex"]].map(([id,l])=>(
                <button key={id} onClick={()=>setClothSex(id)} style={{background:clothSex===id?T.surface2:T.surface,color:clothSex===id?T.text:T.sub,border:`1px solid ${clothSex===id?T.line2:T.line}`,borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          )}
          {initTab==="hair"&&(<>
            <div style={{fontSize:12.5,fontWeight:700,color:T.faint,marginBottom:8}}>Stile capelli</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AV_HAIR_STYLES.filter(h=>h.cost===0).map(h=>(<div key={h.id} onClick={()=>setAvF("hair",h.id)} style={{padding:"9px 14px",borderRadius:12,background:av.hair===h.id?G.hero:T.surface,color:av.hair===h.id?"#fff":T.text,border:av.hair===h.id?"none":`1px solid ${T.line2}`,fontSize:13,fontWeight:700,cursor:"pointer"}}>{h.label}</div>))}
            </div>
          </>)}
          {initTab==="top"&&(<>
            <div style={{fontSize:12.5,fontWeight:700,color:T.faint,marginBottom:8}}>Indumento sopra</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AV_TOP.filter(t=>t.cost===0&&(clothSex==="all"||t.sex===clothSex)).map(t=>(<div key={t.id} onClick={()=>setAvF("top",t.id)} style={{padding:"9px 14px",borderRadius:12,background:av.top===t.id?G.hero:T.surface,color:av.top===t.id?"#fff":T.text,border:av.top===t.id?"none":`1px solid ${T.line2}`,fontSize:13,fontWeight:700,cursor:"pointer"}}>{t.label}</div>))}
            </div>
            <div style={{fontSize:11,color:T.faint,marginTop:8}}>Altri capi sbloccabili nel profilo coi gettoni 🪙</div>
          </>)}
          {initTab==="bottom"&&(<>
            <div style={{fontSize:12.5,fontWeight:700,color:T.faint,marginBottom:8}}>Pantaloni / Gonna</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AV_BOTTOM.filter(b=>b.cost===0&&(clothSex==="all"||b.sex===clothSex)).map(b=>(<div key={b.id} onClick={()=>setAvF("bottom",b.id)} style={{padding:"9px 14px",borderRadius:12,background:av.bottom===b.id?G.hero:T.surface,color:av.bottom===b.id?"#fff":T.text,border:av.bottom===b.id?"none":`1px solid ${T.line2}`,fontSize:13,fontWeight:700,cursor:"pointer"}}>{b.label}</div>))}
            </div>
            <div style={{fontSize:11,color:T.faint,marginTop:8}}>Altri capi sbloccabili nel profilo coi gettoni 🪙</div>
          </>)}
          {initTab==="shoes"&&(<>
            <div style={{fontSize:12.5,fontWeight:700,color:T.faint,marginBottom:8}}>Scarpe</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AV_SHOES.filter(s=>s.cost===0).map(s=>(<div key={s.id} onClick={()=>setAvF("shoes",s.id)} style={{padding:"9px 14px",borderRadius:12,background:av.shoes===s.id?G.hero:T.surface,color:av.shoes===s.id?"#fff":T.text,border:av.shoes===s.id?"none":`1px solid ${T.line2}`,fontSize:13,fontWeight:700,cursor:"pointer"}}>{s.label}</div>))}
            </div>
            <div style={{fontSize:11,color:T.faint,marginTop:8}}>Altre scarpe sbloccabili nel profilo coi gettoni 🪙</div>
          </>)}
          {initTab==="glasses"&&(<>
            <div style={{fontSize:12.5,fontWeight:700,color:T.faint,marginBottom:8}}>Occhiali</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AV_GLASSES.filter(o=>o.cost===0).map(o=>(<div key={o.id} onClick={()=>setAvF("glasses",o.id)} style={{padding:"9px 14px",borderRadius:12,background:av.glasses===o.id?G.hero:T.surface,color:av.glasses===o.id?"#fff":T.text,border:av.glasses===o.id?"none":`1px solid ${T.line2}`,fontSize:13,fontWeight:700,cursor:"pointer"}}>{o.label}</div>))}
            </div>
            <div style={{fontSize:11,color:T.faint,marginTop:8}}>Altri modelli sbloccabili nel profilo coi gettoni 🪙</div>
          </>)}
          {initTab==="tattoo"&&(<>
            <div style={{fontSize:12.5,fontWeight:700,color:T.faint,marginBottom:8}}>Tatuaggio</div>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
              {AV_TATTOO.filter(t=>t.cost===0).map(t=>(<div key={t.id} onClick={()=>setAvF("tattoo",t.id)} style={{padding:"9px 14px",borderRadius:12,background:av.tattoo===t.id?G.hero:T.surface,color:av.tattoo===t.id?"#fff":T.text,border:av.tattoo===t.id?"none":`1px solid ${T.line2}`,fontSize:13,fontWeight:700,cursor:"pointer"}}>{t.label}</div>))}
            </div>
            <div style={{fontSize:11,color:T.faint,marginTop:8}}>Altri tatuaggi sbloccabili nel profilo coi gettoni 🪙</div>
          </>)}
          {initTab==="skin"&&(<div style={{fontSize:11.5,color:T.faint,lineHeight:1.5}}>💡 Scegli la carnagione tra i colori accanto all'avatar ↑. Capelli, vestiti, scarpe, occhiali e tatuaggi hanno le loro schede qui sopra.</div>)}
        </>}
      </div>
      <div style={{paddingBottom:40,paddingTop:10}}>
        <Btn T={T} grad={G.hero} disabled={!figure} onClick={()=>onDone({...DEFAULT_AVATARS.p1,name,...av})}>{figure?"Continua →":"Scegli una base per continuare"}</Btn>
      </div>
    </div>);
  }

  if(step==="couple") return(<Wrap><div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:6}}>Ciao {name}! 👋</div>
    <div style={{fontSize:15,color:T.sub,lineHeight:1.6,marginBottom:32}}>Bondly è per due. Crea la vostra coppia o unisciti a quella del tuo partner.</div>
    <div onClick={()=>setStep("create")} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:20,marginBottom:14,cursor:"pointer",border:`1px solid ${T.line}`,display:"flex",gap:14,alignItems:"center"}}>
      <div style={{width:52,height:52,borderRadius:15,background:G.a1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>✨</div>
      <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700}}>Crea una nuova coppia</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>Sarai tu a invitare il partner</div></div>
      <span style={{fontSize:20,color:T.faint}}>›</span>
    </div>
    <div onClick={()=>setStep("join")} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:20,cursor:"pointer",border:`1px solid ${T.line}`,display:"flex",gap:14,alignItems:"center"}}>
      <div style={{width:52,height:52,borderRadius:15,background:G.a4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔗</div>
      <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700}}>Unisciti con un codice</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>Il partner ti ha già invitato</div></div>
      <span style={{fontSize:20,color:T.faint}}>›</span>
    </div>
  </div></Wrap>);

  if(step==="create") return(<Wrap>
    <div style={{paddingTop:30}}><span onClick={()=>setStep("couple")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",textAlign:"center"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:8}}>Invita il tuo partner 💌</div>
      <div style={{fontSize:14,color:T.sub,lineHeight:1.6,marginBottom:28,maxWidth:300,marginLeft:"auto",marginRight:"auto"}}>Condividi questo codice. Quando lo inserisce, sarete collegati e i vostri progressi saranno condivisi per sempre.</div>
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:24,border:`2px dashed ${T.a1}`,marginBottom:20}}>
        <div style={{fontSize:12,color:T.faint,marginBottom:8}}>Il vostro codice coppia</div>
        <div style={{fontSize:34,fontWeight:800,letterSpacing:3,color:T.a1}}>{myCode}</div>
      </div>
      <Btn T={T} variant="soft" onClick={()=>{}} style={{marginBottom:10}}>📤 Condividi il codice</Btn>
    </div>
    <div style={{paddingBottom:40}}>
      <Btn T={T} grad={G.hero} onClick={()=>setStep("ready")}>Il partner si è collegato →</Btn>
      <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:12}}>Puoi invitarlo anche più tardi</div>
    </div>
  </Wrap>);

  if(step==="join") return(<Wrap>
    <div style={{paddingTop:30}}><span onClick={()=>setStep("couple")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:8}}>Inserisci il codice 🔗</div>
      <div style={{fontSize:14,color:T.sub,lineHeight:1.6,marginBottom:28}}>Chiedi al tuo partner il codice coppia che vede nel suo invito.</div>
      <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="BND-XXXX" style={{...inp,textAlign:"center",fontSize:24,fontWeight:800,letterSpacing:3}}/>
    </div>
    <div style={{paddingBottom:40}}>
      <Btn T={T} grad={G.hero} disabled={joinCode.length<5} onClick={()=>setStep("ready")}>Collegati al partner</Btn>
    </div>
  </Wrap>);

  if(step==="ready") return(<Wrap><div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",textAlign:"center"}}>
    <div style={{width:110,height:110,borderRadius:32,background:G.hero,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,marginBottom:28,boxShadow:`0 12px 40px ${T.a1}44`}}>💞</div>
    <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,marginBottom:12}}>Siete collegati!</div>
    <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,marginBottom:8}}>Da ora i vostri punti, il salvadanaio e il percorso sono condivisi e salvati al sicuro. Cambiate telefono quando volete: ritroverete tutto.</div>
    <div style={{fontSize:13,fontWeight:600,color:T.a2,background:T.surface2,borderRadius:16,padding:"10px 18px",marginTop:14}}>🔒 I vostri progressi non si perdono mai</div>
  </div>
  <div style={{paddingBottom:40,width:"100%"}}><Btn T={T} grad={G.hero} onClick={()=>onDone({...DEFAULT_AVATARS.p1,name,...av})}>Iniziamo l'avventura! 🎉</Btn></div></Wrap>);

  return null;
}

// ════════ PASS ════════
function PassScreen({tokens,setTokens,onBack,onToast,T,G}){
  const [tab,setTab]=useState("pass");
  const passes=[
    {id:"biweekly",name:"Pass Bisettimanale",price:"€4,99",per:"ogni 2 settimane",g:"a1",pop:true,
     perks:["Accumulo punti +50% più veloce","+200 gettoni bonus alla settimana","2 biglietti Lotteria a settimana","Sblocco anticipato dei giochi","1 accessorio avatar esclusivo al mese"]},
    {id:"premium",name:"Premium Mensile",price:"€7,99",per:"al mese",g:"a2",
     perks:["Tutto il Pass Bisettimanale","Zero banner pubblicitari","Giochi e contenuti esperti illimitati","Temi e avatar esclusivi","Accumulo punti +100%"]},
  ];
  const tokenPacks=[
    {amt:500,price:"€1,99",g:"a4",bonus:0},
    {amt:1200,price:"€3,99",g:"a3",bonus:200,pop:true},
    {amt:3000,price:"€7,99",g:"a1",bonus:800},
    {amt:7000,price:"€14,99",g:"a2",bonus:2500,best:true},
  ];
  return(<div style={{paddingBottom:90}}>
    <div style={{padding:"18px 18px 0"}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{padding:"14px 18px 0",textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:8}}>✨</div>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5}}>Bondly Pass & Store</div>
      <div style={{fontSize:14,color:T.sub,marginTop:4,maxWidth:300,marginLeft:"auto",marginRight:"auto",lineHeight:1.5}}>Accelerate il percorso e sbloccate il meglio di Bondly.</div>
    </div>
    <div style={{display:"flex",gap:8,padding:"18px 18px 0"}}>
      {[["pass","✨ Abbonamenti"],["tokens","🪙 Gettoni"]].map(([id,l])=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:tab===id?G.hero:T.surface,color:tab===id?"#fff":T.sub,border:tab===id?"none":`1px solid ${T.line2}`,borderRadius:14,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
      ))}
    </div>

    {tab==="pass"&&(<div style={{padding:"18px 18px 0"}}>
      {passes.map((p,i)=>(
        <div key={i} style={{borderRadius:22,padding:22,marginBottom:14,background:i===0?G[p.g]:T.surface,color:i===0?"#fff":T.text,border:i===0?"none":`1px solid ${T.line}`,position:"relative",overflow:"hidden"}}>
          {p.pop&&<div style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,0.25)",borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:800}}>PIÙ SCELTO</div>}
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800}}>{p.name}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginTop:4,marginBottom:16}}>
            <span style={{fontSize:30,fontWeight:800}}>{p.price}</span>
            <span style={{fontSize:13,opacity:0.8}}>{p.per}</span>
          </div>
          {p.perks.map((perk,j)=>(
            <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:9}}>
              <span style={{fontSize:14,flexShrink:0,opacity:i===0?1:0.7}}>✓</span>
              <span style={{fontSize:13.5,lineHeight:1.4,opacity:i===0?0.96:0.85}}>{perk}</span>
            </div>
          ))}
          <Btn T={T} grad={i===0?"rgba(255,255,255,0.95)":G.hero} light={i===0} onClick={()=>onToast(`✨ ${p.name} attivato!`)} style={{marginTop:14,color:i===0?T.text:"#fff"}}>Attiva ora</Btn>
        </div>
      ))}
      <div style={{background:`${T.a4}10`,border:`1px solid ${T.a4}26`,borderRadius:14,padding:14,fontSize:12,color:T.sub,lineHeight:1.5}}>💡 Il Pass accelera punti e gettoni — usali per giochi, accessori avatar e biglietti. I gettoni restano valuta di gioco, mai denaro convertibile.</div>
    </div>)}

    {tab==="tokens"&&(<div style={{padding:"18px 18px 0"}}>
      <div style={{fontSize:13,color:T.sub,lineHeight:1.5,marginBottom:16}}>I gettoni servono per accessori avatar, biglietti lotteria e duelli. Guadagnali giocando — o fai il pieno qui. 🪙</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {tokenPacks.map((p,i)=>(
          <div key={i} onClick={()=>{setTokens(t=>t+p.amt+p.bonus);onToast(`🪙 +${(p.amt+p.bonus).toLocaleString()} gettoni!`);}} style={{borderRadius:18,padding:18,background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",border:`1px solid ${p.best||p.pop?T.a1:T.line}`,cursor:"pointer",position:"relative",textAlign:"center"}}>
            {p.pop&&<div style={{position:"absolute",top:10,right:10}}><Pill grad={G.a3}>Popolare</Pill></div>}
            {p.best&&<div style={{position:"absolute",top:10,right:10}}><Pill grad={G.a1}>Best</Pill></div>}
            <div style={{width:54,height:54,borderRadius:15,background:G[p.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"6px auto 12px"}}>🪙</div>
            <div style={{fontSize:20,fontWeight:800}}>{p.amt.toLocaleString()}</div>
            {p.bonus>0&&<div style={{fontSize:12,fontWeight:700,color:T.a4,marginTop:1}}>+{p.bonus} bonus</div>}
            <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.line}`,fontSize:16,fontWeight:800,color:T.a1}}>{p.price}</div>
          </div>
        ))}
      </div>
      <div style={{background:`${T.a3}10`,border:`1px solid ${T.a3}26`,borderRadius:14,padding:14,fontSize:12,color:T.sub,lineHeight:1.5,marginTop:14}}>🔒 I gettoni sono valuta di gioco per cosmetici e divertimento. Non sono convertibili in denaro né ritirabili — questo tiene Bondly fuori dal gioco d'azzardo.</div>
    </div>)}
  </div>);
}

// ════════ SETTINGS ════════
function SettingsScreen({themeName,setThemeName,onBack,onToast,onLogout,T,G}){
  const [showRev,setShowRev]=useState(false);
  const REVENUE=[
    {icon:"💎",t:"Abbonamenti Pass & Premium",d:"Il motore dell'utile · ricavo ricorrente",g:"a2"},
    {icon:"📱",t:"Pubblicità discreta",d:"Banner leggeri + video opzionali · copre i costi",g:"a3"},
    {icon:"🎨",t:"Cosmetici Avatar",d:"Accessori e outfit · acquisti col gioco",g:"a1"},
    {icon:"✈️",t:"Affiliazione Viaggi",d:"Commissioni prenotazioni · finanzia il salvadanaio",g:"a5"},
    {icon:"🎟️",t:"Lotteria Sponsorizzata",d:"Premi offerti dai partner · costo zero",g:"a4"},
    {icon:"🎁",t:"Pack Contenuti",d:"Temi a pacchetto una tantum",g:"a1"},
  ];
  return(<div style={{paddingBottom:90}}>
    <div style={{padding:"18px 18px 0"}}><span onClick={onBack} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{padding:"14px 18px 0"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:18}}>Impostazioni</div>

      <div style={{fontSize:13,color:T.sub,fontWeight:700,marginBottom:12}}>🎨 Tema colori</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
        {Object.entries(THEMES).map(([k,th])=>(
          <div key={k} onClick={()=>setThemeName(k)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",borderRadius:14,background:themeName===k?`${th.a1}14`:T.surface,border:`1px solid ${themeName===k?th.a1:T.line}`,cursor:"pointer"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <div style={{display:"flex",gap:4}}>{th.swatch.map((s,j)=>(<div key={j} style={{width:18,height:18,borderRadius:"50%",background:s}}/>))}</div>
              <span style={{fontSize:15,fontWeight:600}}>{th.name}</span>
            </div>
            {themeName===k&&<span style={{color:th.a1,fontSize:16,fontWeight:800}}>✓</span>}
          </div>
        ))}
      </div>

      <div style={{fontSize:13,color:T.sub,fontWeight:700,marginBottom:12}}>⚙ Account</div>
      {[["🔔","Notifiche"],["🌍","Lingua · Italiano"],["🔒","Privacy e sicurezza"],["💞","Gestisci la coppia"],["❓","Aiuto e supporto"]].map(([e,l],i)=>(
        <div key={i} onClick={()=>onToast("Impostazione in arrivo")} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:14,marginBottom:8,cursor:"pointer",border:`1px solid ${T.line}`}}>
          <span style={{fontSize:18}}>{e}</span><span style={{flex:1,fontSize:14,fontWeight:600}}>{l}</span><span style={{fontSize:16,color:T.faint}}>›</span>
        </div>
      ))}
      <div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:14,marginBottom:8,cursor:"pointer",border:`1px solid ${T.line}`}}>
        <span style={{fontSize:18}}>🚪</span><span style={{flex:1,fontSize:14,fontWeight:600,color:"#ff6b6b"}}>Esci dall'account</span>
      </div>

      <div onClick={()=>setShowRev(true)} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:14,padding:16,marginTop:10,cursor:"pointer",border:`1px dashed ${T.line2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:13,fontWeight:700}}>📊 Come guadagna Bondly</div><div style={{fontSize:12,color:T.sub,marginTop:2}}>Il modello di business</div></div>
        <span style={{fontSize:18,color:T.faint}}>›</span>
      </div>
    </div>

    {showRev&&(<Sheet onClose={()=>setShowRev(false)} T={T}>
      <div style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:800}}>💰 Modello di Guadagno</div><span onClick={()=>setShowRev(false)} style={{fontSize:22,color:T.sub,cursor:"pointer"}}>✕</span></div>
        <div style={{fontSize:13,color:T.sub,marginBottom:18,lineHeight:1.5}}>Gli abbonamenti sono il motore. La pubblicità copre i costi. I premi grossi li pagano sponsor e affiliazioni.</div>
        {REVENUE.map((r,i)=>(<div key={i} style={{display:"flex",gap:14,marginBottom:14,padding:14,background:T.surface2,borderRadius:16}}><div style={{width:44,height:44,borderRadius:12,background:G[r.g],display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{r.icon}</div><div><div style={{fontSize:14,fontWeight:700}}>{r.t}</div><div style={{fontSize:12,color:T.sub,marginTop:2,lineHeight:1.4}}>{r.d}</div></div></div>))}
      </div>
    </Sheet>)}
  </div>);
}

// ════════ LOTTERY PANEL (inside Premi) ════════
function LotteryPanel({tokens,setTokens,tickets,setTickets,onToast,T,G}){
  const TICKET_COST=100;
  const [countdown]=useState("2g 14h 32m");
  function buyTicket(){
    if(tokens<TICKET_COST){onToast("🪙 Ti servono 100 gettoni per un biglietto");return;}
    setTokens(t=>t-TICKET_COST);setTickets(n=>n+1);onToast("🎟️ Biglietto Lotteria acquistato!");
  }
  function buy5(){
    if(tokens<450){onToast("🪙 Ti servono 450 gettoni");return;}
    setTokens(t=>t-450);setTickets(n=>n+5);onToast("🎟️ +5 biglietti! (1 in regalo)");
  }
  const PRIZES=[
    {e:"🏆",t:"Buono Booking €100",s:"1° premio",big:true},
    {e:"📦",t:"Buono Amazon €50",s:"2° premio"},
    {e:"🎬",t:"Buono Netflix €25",s:"3° premio"},
    {e:"🎵",t:"Spotify 3 mesi",s:"4° premio"},
    {e:"☕",t:"Buono regalo €15",s:"5°-10° premio"},
  ];
  return(<div>
    {/* Hero */}
    <div style={{padding:"16px 18px 0"}}>
      <div style={{borderRadius:24,padding:24,background:G.hero,color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-20,fontSize:150,opacity:0.18}}>🎟️</div>
        <div style={{position:"relative"}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:1,textTransform:"uppercase",opacity:0.92}}>Lotteria Bondly</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:27,fontWeight:800,marginTop:6,letterSpacing:-0.5}}>Vincete premi veri</div>
          <div style={{fontSize:14,opacity:0.94,lineHeight:1.5,marginTop:6,maxWidth:280}}>Ogni domenica estraiamo buoni reali offerti dai nostri partner. I biglietti si pagano coi gettoni che vincete giocando.</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.22)",borderRadius:14,padding:"8px 14px",marginTop:16}}>
            <span style={{fontSize:15}}>⏳</span><span style={{fontSize:14,fontWeight:800}}>Prossima estrazione: {countdown}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Your tickets */}
    <div style={{padding:"16px 18px 0"}}>
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:20,border:`1px solid ${T.line}`,textAlign:"center"}}>
        <div style={{fontSize:13,color:T.sub,fontWeight:600}}>I vostri biglietti per questa settimana</div>
        <div style={{fontSize:52,fontWeight:800,color:T.a1,margin:"6px 0",letterSpacing:-1}}>🎟️ {tickets}</div>
        <div style={{fontSize:12.5,color:T.faint,marginBottom:18}}>Più biglietti avete, più alte sono le vostre chance di vincere</div>
        <div style={{display:"flex",gap:10}}>
          <Btn T={T} grad={G.hero} onClick={buyTicket} style={{flex:1}}>1 biglietto · 100🪙</Btn>
          <Btn T={T} grad={G.a3} onClick={buy5} style={{flex:1}}>5 biglietti · 450🪙</Btn>
        </div>
        <div style={{fontSize:11,color:T.a3,fontWeight:700,marginTop:8}}>🎁 Pacchetto 5 = 1 biglietto in regalo</div>
      </div>
    </div>

    {/* Prizes */}
    <div style={{padding:"18px 18px 0"}}>
      <div style={{fontSize:13,fontWeight:800,color:T.sub,marginBottom:12,paddingLeft:2}}>🎁 PREMI DI QUESTA SETTIMANA</div>
      {PRIZES.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:14,alignItems:"center",background:p.big?`linear-gradient(135deg,${T.a1}14,${T.a2}0A)`:T.surface,borderRadius:16,padding:15,marginBottom:10,border:`1px solid ${p.big?T.a1+"44":T.line}`}}>
          <div style={{width:46,height:46,borderRadius:13,background:p.big?G.hero:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{p.e}</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700}}>{p.t}</div><div style={{fontSize:12,color:p.big?T.a1:T.faint,fontWeight:p.big?700:400,marginTop:1}}>{p.s}</div></div>
          {p.big&&<span style={{fontSize:22}}>👑</span>}
        </div>
      ))}
    </div>

    {/* How it works */}
    <div style={{padding:"8px 18px 0"}}>
      <div style={{background:`${T.a4}10`,border:`1px solid ${T.a4}26`,borderRadius:16,padding:16}}>
        <div style={{fontSize:13,fontWeight:800,marginBottom:10}}>Come funziona</div>
        {[["🎮","Giocate e guadagnate gettoni gratis"],["🎟️","Convertite i gettoni in biglietti"],["📅","Ogni domenica estraiamo i vincitori"],["🎁","I premi sono offerti dai partner, non comprati da voi"]].map(([e,t],i)=>(
          <div key={i} style={{display:"flex",gap:11,alignItems:"center",marginBottom:9}}><span style={{fontSize:18}}>{e}</span><span style={{fontSize:13,color:T.sub,lineHeight:1.4}}>{t}</span></div>
        ))}
        <div style={{fontSize:11,color:T.faint,marginTop:8,lineHeight:1.5,paddingTop:10,borderTop:`1px solid ${T.line}`}}>⚖️ Concorso a premi a norma di legge (DPR 430/2001), non gioco d'azzardo. I gettoni si guadagnano gratis giocando e non sono convertibili in denaro. Regolamento completo in app.</div>
      </div>
    </div>
  </div>);
}

// ════════ MAIN ════════
function Splash({T,G}){
  // precomputed particle start positions (converge toward center) — deterministic, CSS-only
  const parts=[...Array(22)].map((_,i)=>{
    const ang=(i/22)*Math.PI*2;const dist=120+((i*37)%90);
    return{x:Math.cos(ang)*dist,y:Math.sin(ang)*dist,d:(i%10)*0.12,e:["✨","💫","·","•"][i%4],s:6+(i%4)*3};
  });
  return(<div style={{position:"fixed",inset:0,zIndex:5000,background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",maxWidth:440,margin:"0 auto",overflow:"hidden"}}>
    <style>{`
      @keyframes splashWave{0%{transform:translate(-50%,-50%) scale(0.3);opacity:0.5}100%{transform:translate(-50%,-50%) scale(3.4);opacity:0}}
      @keyframes splashPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
      @keyframes splashLogoIn{0%{transform:scale(0.4);opacity:0}55%{transform:scale(1.08);opacity:1}100%{transform:scale(1);opacity:1}}
      @keyframes splashName{0%{opacity:0;transform:translateY(14px);letter-spacing:6px}100%{opacity:1;transform:translateY(0);letter-spacing:1px}}
      @keyframes splashSub{0%{opacity:0}100%{opacity:0.92}}
      @keyframes splashFade{0%,72%{opacity:1}100%{opacity:0}}
      @keyframes splashGlow{0%,100%{filter:drop-shadow(0 0 12px ${T.a1}66)}50%{filter:drop-shadow(0 0 26px ${T.a1}cc)}}
      @keyframes splashSpark{0%{transform:translateY(0) scale(0);opacity:0}30%{opacity:1}100%{transform:translateY(-90px) scale(1);opacity:0}}
      @keyframes splashConverge{0%{transform:translate(var(--px),var(--py)) scale(0.4);opacity:0}40%{opacity:1}100%{transform:translate(0,0) scale(1);opacity:0}}
    `}</style>
    <div style={{position:"relative",animation:"splashFade 2.5s ease-forwards"}}>
      {/* converging light particles (app tints) */}
      {parts.map((p,i)=>(
        <div key={"p"+i} style={{position:"absolute",left:"50%",top:"50%",fontSize:p.s,color:[T.a1,T.a2,T.a4][i%3],"--px":`${p.x}px`,"--py":`${p.y}px`,animation:`splashConverge 1.6s ease-in ${p.d}s infinite`,pointerEvents:"none"}}>{p.e}</div>
      ))}
      {/* expanding light waves (accent tinted) */}
      {[0,0.5,1,1.5].map((d,i)=>(
        <div key={i} style={{position:"absolute",left:"50%",top:"50%",width:120,height:120,borderRadius:"50%",border:`2px solid ${T.a1}55`,animation:`splashWave 2.2s ease-out ${d}s infinite`}}/>
      ))}
      {/* floating sparks */}
      {[...Array(7)].map((_,i)=>(
        <div key={"s"+i} style={{position:"absolute",left:`${20+i*10}%`,top:"60%",fontSize:`${10+(i%3)*4}px`,animation:`splashSpark ${1.6+i*0.15}s ease-out ${0.3+i*0.12}s infinite`}}>{["✨","💛","💫","💕"][i%4]}</div>
      ))}
      {/* logo */}
      <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{animation:"splashLogoIn 0.9s cubic-bezier(.2,.9,.3,1.4) both"}}>
          <div style={{animation:"splashPulse 1.4s ease-in-out 0.9s infinite"}}>
            <div style={{fontSize:88,lineHeight:1,animation:"splashGlow 1.6s ease-in-out infinite"}}>💞</div>
          </div>
        </div>
        <div style={{fontFamily:"'Sora',sans-serif",marginTop:18,fontSize:46,fontWeight:800,letterSpacing:1,animation:"splashName 0.8s ease-out 0.7s both",background:"linear-gradient(135deg,#FF6FB0,#B98CFF)",WebkitBackgroundClip:"text",backgroundClip:"text",WebkitTextFillColor:"transparent",color:"#FF6FB0"}}>Bondly</div>
        <div style={{marginTop:6,fontSize:14,fontWeight:600,color:T.sub,animation:"splashSub 0.8s ease-out 1.3s both"}}>L'app per voi due 💞</div>
      </div>
    </div>
  </div>);
}

// ════════ COUPLE SETUP ════════
function generateInviteCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:6},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}

function CoupleSetup({T,G,userId,onDone}){
  const [step,setStep]=useState("choose"); // choose | join | created
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [createdCode,setCreatedCode]=useState("");
  const [createdCoupleId,setCreatedCoupleId]=useState(null);
  const [joinCode,setJoinCode]=useState("");
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    const m=(window.location.hash||window.location.pathname).match(/unisciti\/([A-Z0-9]{6})/i);
    if(m){setJoinCode(m[1].toUpperCase());setStep("join");}
  },[]);

  const Wrap=({children})=>(<div style={{position:"fixed",inset:0,background:T.bgScene||T.bg,color:T.text,zIndex:1000,maxWidth:440,margin:"0 auto",display:"flex",flexDirection:"column",padding:"0 24px",overflowY:"auto"}}>{children}</div>);
  const inp={width:"100%",background:T.surface2,border:`1px solid ${T.line2}`,borderRadius:14,padding:"15px 16px",fontSize:15,outline:"none",color:T.text,marginBottom:12,boxSizing:"border-box"};

  async function handleCreate(){
    if(loading)return;
    setLoading(true);setError("");
    try{
      const code=generateInviteCode();
      const{data:couple,error:e1}=await supabase.from("couples").insert({member_a:userId,invite_code:code}).select("id").single();
      if(e1)throw e1;
      const{error:e2}=await supabase.from("profiles").update({couple_id:couple.id}).eq("id",userId);
      if(e2)throw e2;
      setCreatedCode(code);
      setCreatedCoupleId(couple.id);
      setStep("created");
    }catch(e){setError(e.message||"Errore. Riprova.");}
    setLoading(false);
  }

  async function handleJoin(){
    if(loading)return;
    setLoading(true);setError("");
    try{
      const code=joinCode.trim().toUpperCase();
      const{data:couple,error:e1}=await supabase.from("couples").select("id,member_a,member_b").eq("invite_code",code).single();
      if(e1||!couple)throw new Error("Codice non trovato. Controlla e riprova.");
      if(couple.member_b)throw new Error("Questa coppia è già completa.");
      if(couple.member_a===userId)throw new Error("Non puoi unirti alla tua stessa coppia.");
      const{error:e2}=await supabase.from("couples").update({member_b:userId}).eq("id",couple.id);
      if(e2)throw e2;
      const{error:e3}=await supabase.from("profiles").update({couple_id:couple.id}).eq("id",userId);
      if(e3)throw e3;
      onDone(couple.id);
    }catch(e){setError(e.message||"Errore. Riprova.");}
    setLoading(false);
  }

  function copyLink(){
    const base=`${window.location.origin}${import.meta.env.BASE_URL}`;
    const link=`${base}#unisciti/${createdCode}`;
    navigator.clipboard.writeText(link).catch(()=>navigator.clipboard.writeText(createdCode));
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  }

  if(step==="choose") return(<Wrap>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:52,marginBottom:16}}>💞</div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-0.5,marginBottom:10}}>Collegatevi come coppia</div>
        <div style={{fontSize:15,color:T.sub,lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>Bondly funziona per due. Crea la vostra coppia o unisciti a quella del tuo partner.</div>
      </div>
      <div onClick={handleCreate} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:20,marginBottom:14,cursor:loading?"not-allowed":"pointer",border:`1px solid ${T.line}`,display:"flex",gap:14,alignItems:"center",opacity:loading?0.6:1,pointerEvents:loading?"none":"auto"}}>
        <div style={{width:52,height:52,borderRadius:15,background:G.a1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>✨</div>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700}}>Crea una nuova coppia</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{loading?"Creo la coppia...":"Sarai tu a invitare il partner"}</div></div>
        <span style={{fontSize:20,color:T.faint}}>›</span>
      </div>
      <div onClick={()=>setStep("join")} style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:20,cursor:"pointer",border:`1px solid ${T.line}`,display:"flex",gap:14,alignItems:"center"}}>
        <div style={{width:52,height:52,borderRadius:15,background:G.a4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🔗</div>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700}}>Unisciti con un codice</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>Il partner ti ha già invitato</div></div>
        <span style={{fontSize:20,color:T.faint}}>›</span>
      </div>
      {error&&<div style={{fontSize:13,color:"#ff6b6b",textAlign:"center",marginTop:14}}>{error}</div>}
    </div>
    <div style={{paddingBottom:32,fontSize:12,color:T.faint,textAlign:"center"}}>Potrete sempre gestire la coppia dalle Impostazioni</div>
  </Wrap>);

  if(step==="created") return(<Wrap>
    <div style={{paddingTop:30}}><span onClick={()=>setStep("choose")} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",textAlign:"center"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:8}}>Invita il tuo partner 💌</div>
      <div style={{fontSize:14,color:T.sub,lineHeight:1.6,marginBottom:28,maxWidth:300,marginLeft:"auto",marginRight:"auto"}}>Condividi questo codice. Quando lo inserisce, sarete collegati e i progressi condivisi per sempre.</div>
      <div style={{background:T.glass||T.surface,backdropFilter:T.glass?"blur(12px)":"none",WebkitBackdropFilter:T.glass?"blur(12px)":"none",borderRadius:20,padding:28,border:`2px dashed ${T.a1}`,marginBottom:16}}>
        <div style={{fontSize:12,color:T.faint,marginBottom:8}}>Il vostro codice coppia</div>
        <div style={{fontSize:38,fontWeight:800,letterSpacing:6,color:T.a1}}>{createdCode}</div>
      </div>
      <div onClick={copyLink} style={{background:T.surface2,borderRadius:14,padding:"13px 16px",fontSize:13,color:T.sub,cursor:"pointer",marginBottom:8,border:`1px solid ${T.line2}`,wordBreak:"break-all"}}>
        <div style={{fontWeight:700,color:copied?T.a4:T.a2,marginBottom:4}}>{copied?"✓ Link copiato!":"📤 Tocca per copiare il link di invito"}</div>
        <div style={{opacity:0.7}}>{window.location.origin}{import.meta.env.BASE_URL}#unisciti/{createdCode}</div>
      </div>
    </div>
    <div style={{paddingBottom:40}}>
      <Btn T={T} grad={G.hero} onClick={()=>onDone(createdCoupleId)}>Continua →</Btn>
      <div style={{fontSize:12,color:T.faint,textAlign:"center",marginTop:12}}>Il partner può unirsi in un secondo momento</div>
    </div>
  </Wrap>);

  if(step==="join") return(<Wrap>
    <div style={{paddingTop:30}}><span onClick={()=>{setError("");setStep("choose");}} style={{fontSize:14,color:T.sub,cursor:"pointer"}}>← Indietro</span></div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,marginBottom:8}}>Inserisci il codice 🔗</div>
      <div style={{fontSize:14,color:T.sub,lineHeight:1.6,marginBottom:28}}>Chiedi al tuo partner il codice di 6 lettere che vede nel suo invito.</div>
      <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="XXXXXX" maxLength={6} style={{...inp,textAlign:"center",fontSize:28,fontWeight:800,letterSpacing:8}}/>
      {error&&<div style={{fontSize:13,color:"#ff6b6b",textAlign:"center",marginBottom:8}}>{error}</div>}
    </div>
    <div style={{paddingBottom:40}}>
      <Btn T={T} grad={G.hero} disabled={loading||joinCode.trim().length<6} onClick={handleJoin}>{loading?"Collego...":"Collegati al partner"}</Btn>
    </div>
  </Wrap>);

  return null;
}

export default function Bondly(){
  const [themeName,setThemeName]=useState(()=>_lsGet('bly_theme','midnight'));
  const T=THEMES[themeName]||THEMES.midnight;
  const G=grads(T);
  const [tab,setTab]=useState("home");
  const [pendingGame,setPendingGame]=useState(null);
  const [cp,setCp]=useState(()=>_lsGet('bly_cp',0));
  const [wallet,setWallet]=useState(()=>_lsGet('bly_wallet',0));
  const [tokens,setTokens]=useState(()=>_lsGet('bly_tokens',0));
  const [tickets,setTickets]=useState(()=>_lsGet('bly_tickets',0));
  const _today=new Date().toDateString();
  const [wheelDone,setWheelDoneRaw]=useState(()=>_lsGet('bly_wheeld',null)===_today);
  const setWheelDone=useCallback((v)=>{if(v)_lsSet('bly_wheeld',new Date().toDateString());setWheelDoneRaw(v);},[]);
  const [avatars,setAvatars]=useState(()=>_lsGet('bly_avatars',DEFAULT_AVATARS));
  const [ownedItems,setOwnedItems]=useState(()=>_lsGet('bly_owned',["sun","pearls"]));
  const [streak,setStreak]=useState(()=>_lsGet('bly_streak',0));
  const [onboard,setOnboard]=useState(true);
  const [toast,setToast]=useState({msg:"",visible:false});
  const onToast=useCallback(m=>{setToast({msg:m,visible:true});setTimeout(()=>setToast(t=>({...t,visible:false})),2200);},[]);
  const nav=[{id:"home",i:"⌂",l:"Home"},{id:"arena",i:"⚔",l:"Arena"},{id:"games",i:"🎮",l:"Gioca",star:true},{id:"experts",i:"❀",l:"Esperti"},{id:"rewards",i:"◈",l:"Premi"}];
  const [authed,setAuthed]=useState(false);
  const [userId,setUserId]=useState(null);
  const [coupleId,setCoupleId]=useState(null);
  const [coupleReady,setCoupleReady]=useState(false);
  const [coupleStartedAt,setCoupleStartedAt]=useState(()=>_lsGet('bly_couple_start',null));
  const [splash,setSplash]=useState(true);
  // Persist state to localStorage (immediate)
  useEffect(()=>{_lsSet('bly_theme',themeName);},[themeName]);
  useEffect(()=>{_lsSet('bly_cp',cp);},[cp]);
  useEffect(()=>{_lsSet('bly_wallet',wallet);},[wallet]);
  useEffect(()=>{_lsSet('bly_tokens',tokens);},[tokens]);
  useEffect(()=>{_lsSet('bly_tickets',tickets);},[tickets]);
  useEffect(()=>{_lsSet('bly_avatars',avatars);},[avatars]);
  useEffect(()=>{_lsSet('bly_owned',ownedItems);},[ownedItems]);
  useEffect(()=>{_lsSet('bly_streak',streak);},[streak]);
  // Supabase cloud sync (debounced 900ms)
  const _syncT=useRef({});
  function _dbq(k,fn){clearTimeout(_syncT.current[k]);_syncT.current[k]=setTimeout(fn,900);}
  // Couple-shared data → couples table
  useEffect(()=>{if(!coupleId)return;_dbq('cp',()=>supabase.from("couples").update({cp}).eq("id",coupleId).catch(()=>{}));},[cp,coupleId]);
  useEffect(()=>{if(!coupleId)return;_dbq('wl',()=>supabase.from("couples").update({wallet}).eq("id",coupleId).catch(()=>{}));},[wallet,coupleId]);
  useEffect(()=>{if(!coupleId)return;_dbq('oi',()=>supabase.from("couples").update({owned_items:ownedItems}).eq("id",coupleId).catch(()=>{}));},[ownedItems,coupleId]);
  // Per-user data → profiles table
  useEffect(()=>{if(!userId)return;_dbq('pf',()=>supabase.from("profiles").update({tokens,tickets,streak}).eq("id",userId).catch(()=>{}));},[tokens,tickets,streak,userId]);
  // Realtime: receive partner changes to couple-shared data
  useEffect(()=>{
    if(!coupleId)return;
    const ch=supabase.channel(`cp-sync-${coupleId}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"couples",filter:`id=eq.${coupleId}`},(p)=>{
        const d=p.new;
        if(d.cp!=null)setCp(prev=>d.cp>prev?d.cp:prev);
        if(d.wallet!=null)setWallet(d.wallet);
        if(d.owned_items?.length)setOwnedItems(prev=>{const m=[...new Set([...prev,...d.owned_items])];return m.length>prev.length?m:prev;});
      })
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[coupleId]);
  // Sync own avatar to Supabase so partner devices can read it
  useEffect(()=>{
    if(!userId||!avatars.p1)return;
    const av=avatars.p1;
    _lsSet('bly_my_avatar',av);
    supabase.from("profiles").update({avatar:av,name:av.name}).eq("id",userId).catch(()=>{});
  },[userId,avatars.p1]);
  useEffect(()=>{const t=setTimeout(()=>setSplash(false),2500);return()=>clearTimeout(t);},[]);
  const loadPartnerProfile=useCallback(async(uid,cid)=>{
    try{
      const{data:couple}=await supabase.from("couples").select("member_a,member_b").eq("id",cid).single();
      if(!couple)return;
      const pid=couple.member_a===uid?couple.member_b:couple.member_a;
      if(!pid)return;
      const{data:pp}=await supabase.from("profiles").select("name,avatar").eq("id",pid).single();
      if(pp){
        setAvatars(a=>({...a,p2:{...DEFAULT_AVATARS.p2,...(pp.avatar||{}),name:pp.name||a.p2.name}}));
      }
    }catch{}
  },[]);
  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(!session)return;
      const uid=session.user.id;
      setUserId(uid);
      const name=session.user.user_metadata?.full_name||session.user.user_metadata?.name||"Utente";
      const myAvatar=_lsGet('bly_my_avatar',null);
      await supabase.from("profiles").upsert({id:uid,name,...(myAvatar?{avatar:myAvatar}:{})},{onConflict:"id",ignoreDuplicates:false}).catch(()=>
        supabase.from("profiles").upsert({id:uid,name},{onConflict:"id",ignoreDuplicates:true})
      );
      const{data:prof}=await supabase.from("profiles").select("couple_id,avatar,name,tokens,tickets,streak,streak_date").eq("id",uid).single();
      const cid=prof?.couple_id||null;
      setCoupleId(cid);
      // load own avatar
      if(prof?.avatar){setAvatars(a=>({...a,p1:{...DEFAULT_AVATARS.p1,...prof.avatar,name:prof.name||a.p1.name}}));}
      // merge per-user cloud progress (take max to handle offline earnings)
      if((prof?.tokens||0)>0)setTokens(t=>Math.max(t,prof.tokens));
      if((prof?.tickets||0)>0)setTickets(t=>Math.max(t,prof.tickets));
      if((prof?.streak||0)>0)setStreak(s=>Math.max(s,prof.streak));
      // load partner + couple-shared cloud progress
      if(cid){
        await loadPartnerProfile(uid,cid);
        const{data:cpd}=await supabase.from("couples").select("cp,wallet,owned_items,started_at,created_at").eq("id",cid).single();
        if(cpd){
          setCp(p=>Math.max(p,cpd.cp||0));
          setWallet(w=>Math.max(w,Number(cpd.wallet)||0));
          if(cpd.owned_items?.length)setOwnedItems(prev=>[...new Set([...prev,...cpd.owned_items])]);
          const sa=cpd.started_at||cpd.created_at;
          if(sa){setCoupleStartedAt(sa);_lsSet('bly_couple_start',sa);}
        }
      }
      setCoupleReady(true);
      setOnboard(false);
      // daily streak
      const todayStr=new Date().toDateString();
      const lastLogin=prof?.streak_date||_lsGet('bly_streak_date',null);
      if(lastLogin!==todayStr){
        const yesterday=new Date(Date.now()-86400000).toDateString();
        const newS=lastLogin===yesterday?Math.max(1,_lsGet('bly_streak',0))+1:1;
        setStreak(s=>Math.max(s,newS));
        _lsSet('bly_streak_date',todayStr);
        supabase.from("profiles").update({streak:newS,streak_date:todayStr}).eq("id",uid).catch(()=>{});
      }
      setAuthed(true);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
      if(event==="SIGNED_OUT"){setAuthed(false);setOnboard(true);setCoupleId(null);setCoupleReady(false);setUserId(null);}
    });
    return()=>subscription.unsubscribe();
  },[loadPartnerProfile]);
  const scrollRef=useRef(null);
  useEffect(()=>{
    const reset=()=>{if(scrollRef.current)scrollRef.current.scrollTop=0;if(typeof window!=="undefined")window.scrollTo(0,0);};
    reset();
    requestAnimationFrame(reset);
    const t1=setTimeout(reset,0);
    const t2=setTimeout(reset,60);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[tab]);
  if(splash) return <Splash T={T} G={G}/>;
  if(!authed) return <Auth T={T} G={G} onDone={async(av)=>{
    const isNewSignup=!!av;
    if(av){
      setAvatars(a=>({...a,p1:{...DEFAULT_AVATARS.p1,...av}}));
      // award starter tokens for new users
      setTokens(t=>t===0?200:t);
      setStreak(1);
      _lsSet('bly_streak_date',new Date().toDateString());
    }
    const{data:{session}}=await supabase.auth.getSession();
    if(session){
      const uid=session.user.id;
      setUserId(uid);
      const name=av?.name||session.user.user_metadata?.full_name||"Utente";
      const todayStr=new Date().toDateString();
      if(av){
        // new signup: initialize cloud data
        await supabase.from("profiles").upsert({id:uid,name,tokens:200,streak:1,streak_date:todayStr},{onConflict:"id",ignoreDuplicates:true});
      } else {
        await supabase.from("profiles").upsert({id:uid,name},{onConflict:"id",ignoreDuplicates:true});
      }
      const{data:prof}=await supabase.from("profiles").select("couple_id,tokens,tickets,streak,streak_date").eq("id",uid).single();
      const cid=prof?.couple_id||null;
      setCoupleId(cid);
      // merge per-user cloud progress (returning login)
      if(!av){
        if((prof?.tokens||0)>0)setTokens(t=>Math.max(t,prof.tokens));
        if((prof?.tickets||0)>0)setTickets(t=>Math.max(t,prof.tickets));
        if((prof?.streak||0)>0)setStreak(s=>Math.max(s,prof.streak));
        // daily streak
        const lastLogin=prof?.streak_date||null;
        if(lastLogin!==todayStr){
          const yesterday=new Date(Date.now()-86400000).toDateString();
          const newS=lastLogin===yesterday?Math.max(1,_lsGet('bly_streak',0))+1:1;
          setStreak(s=>Math.max(s,newS));
          _lsSet('bly_streak_date',todayStr);
          supabase.from("profiles").update({streak:newS,streak_date:todayStr}).eq("id",uid).catch(()=>{});
        }
        // load couple-shared data
        if(cid){
          const{data:cpd}=await supabase.from("couples").select("cp,wallet,owned_items").eq("id",cid).single();
          if(cpd){
            setCp(p=>Math.max(p,cpd.cp||0));
            setWallet(w=>Math.max(w,Number(cpd.wallet)||0));
            if(cpd.owned_items?.length)setOwnedItems(prev=>[...new Set([...prev,...cpd.owned_items])]);
          }
        }
      }
      setCoupleReady(true);
    }
    setAuthed(true);
  }}/>;
  if(authed&&!coupleReady) return <Splash T={T} G={G}/>;
  if(authed&&coupleReady&&!coupleId) return <CoupleSetup T={T} G={G} userId={userId} onDone={async(cid)=>{setCoupleId(cid);if(cid&&userId){await loadPartnerProfile(userId,cid);const{data:cpd}=await supabase.from("couples").select("cp,wallet,owned_items").eq("id",cid).single();if(cpd){setCp(p=>Math.max(p,cpd.cp||0));setWallet(w=>Math.max(w,Number(cpd.wallet)||0));if(cpd.owned_items?.length)setOwnedItems(prev=>[...new Set([...prev,...cpd.owned_items])]);}}}}/>;
  if(onboard) return <Onboarding T={T} G={G} onDone={()=>setOnboard(false)}/>;

  return(<div style={{fontFamily:"'Manrope',-apple-system,'Segoe UI',sans-serif",background:T.bgScene||T.bg,height:"100vh",maxWidth:440,margin:"0 auto",color:T.text,display:"flex",flexDirection:"column",overflow:"hidden",transition:"background 0.4s,color 0.4s",position:"relative"}}>
    {T.bgScene&&(
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
        <style>{`
          @keyframes ambientFloat{0%{transform:translateY(0) scale(1);opacity:0}15%{opacity:0.65}85%{opacity:0.65}100%{transform:translateY(-60px) scale(1.3);opacity:0}}
          @keyframes waveDrift1{0%,100%{transform:translate(-12%,0) scale(1)}50%{transform:translate(12%,6%) scale(1.18)}}
          @keyframes waveDrift2{0%,100%{transform:translate(10%,4%) scale(1.1)}50%{transform:translate(-10%,-6%) scale(1)}}
          @keyframes waveDrift3{0%,100%{transform:translate(0,8%) scale(1.05)}50%{transform:translate(6%,-4%) scale(1.2)}}
        `}</style>
        {/* slow relaxing wave blobs */}
        <div style={{position:"absolute",width:"80%",height:"42%",left:"-15%",top:"8%",borderRadius:"50%",background:`radial-gradient(circle,${T.a2}5C,transparent 70%)`,filter:"blur(48px)",animation:"waveDrift1 22s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:"75%",height:"40%",right:"-18%",top:"38%",borderRadius:"50%",background:`radial-gradient(circle,${T.a1}54,transparent 70%)`,filter:"blur(52px)",animation:"waveDrift2 27s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:"85%",height:"38%",left:"-10%",bottom:"2%",borderRadius:"50%",background:`radial-gradient(circle,${T.a4}4A,transparent 70%)`,filter:"blur(56px)",animation:"waveDrift3 31s ease-in-out infinite"}}/>
        {[...Array(14)].map((_,i)=>{const sz=2+(i%3);const dur=9+(i%5)*2.5;return(
          <div key={i} style={{position:"absolute",left:`${(i*7+5)%96}%`,top:`${(i*13+10)%92}%`,width:sz,height:sz,borderRadius:"50%",background:[T.a1,T.a2,T.a4][i%3],boxShadow:`0 0 ${4+sz}px ${[T.a1,T.a2,T.a4][i%3]}`,animation:`ambientFloat ${dur}s ease-in-out ${i*0.7}s infinite`}}/>
        );})}
      </div>
    )}
    <Toast msg={toast.msg} visible={toast.visible} T={T}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px 12px",position:"sticky",top:0,background:T.glass||T.bg,backdropFilter:T.glass?"blur(16px)":"none",WebkitBackdropFilter:T.glass?"blur(16px)":"none",zIndex:60,borderBottom:`1px solid ${T.line}`}}>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        {(()=>{const{c}=chapterOf(cp);return <span style={{fontSize:12,fontWeight:800,color:"#fff",background:G[c.g],borderRadius:14,padding:"5px 11px"}}>{c.icon} Lv.{c.ch}</span>;})()}
        <span style={{fontSize:12,fontWeight:700,color:T.a4,background:T.glass||T.surface,backdropFilter:T.glass?"blur(10px)":"none",WebkitBackdropFilter:T.glass?"blur(10px)":"none",borderRadius:14,padding:"5px 10px",border:`1px solid ${T.glassBorder||T.line}`}}>🪙 {tokens}</span>
        <span style={{fontSize:12,fontWeight:700,color:T.a3,background:T.glass||T.surface,backdropFilter:T.glass?"blur(10px)":"none",WebkitBackdropFilter:T.glass?"blur(10px)":"none",borderRadius:14,padding:"5px 10px",border:`1px solid ${T.glassBorder||T.line}`}}>💰 €{fmt(wallet)}</span>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div onClick={()=>setTab("pass")} style={{display:"flex",alignItems:"center",gap:5,background:G.hero,borderRadius:14,padding:"6px 13px",cursor:"pointer",boxShadow:`0 4px 14px ${T.a1}44`}}>
          <span style={{fontSize:13}}>✨</span><span style={{fontSize:13,fontWeight:800,color:"#fff",letterSpacing:0.3}}>Pass</span>
        </div>
        <div onClick={()=>setTab("settings")} style={{width:34,height:34,borderRadius:"50%",background:T.glass||T.surface,backdropFilter:T.glass?"blur(10px)":"none",WebkitBackdropFilter:T.glass?"blur(10px)":"none",border:`1px solid ${T.glassBorder||T.line2}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",color:T.sub}}>⚙</div>
      </div>
    </div>
    <div ref={scrollRef} style={{flex:1,overflowY:"auto",minHeight:0,WebkitOverflowScrolling:"touch",position:"relative",zIndex:1}}>
      {tab==="home"   &&<Home cp={cp} wallet={wallet} tokens={tokens} setTokens={setTokens} streak={streak} avatars={avatars} setTab={setTab} T={T} G={G} onToast={onToast} openGame={(id)=>{setPendingGame(id);setTab("games");}} userId={userId} coupleId={coupleId} coupleStartedAt={coupleStartedAt}/>}
      {tab==="games"  &&<Games cp={cp} setCp={setCp} onToast={onToast} T={T} G={G} pendingGame={pendingGame} clearPending={()=>setPendingGame(null)} userId={userId} coupleId={coupleId} avatars={avatars}/>}
      {tab==="arena"  &&<Arena tokens={tokens} setTokens={setTokens} tickets={tickets} setTickets={setTickets} avatars={avatars} onToast={onToast} T={T} G={G}/>}
      {tab==="experts"&&<Experts onToast={onToast} setCp={setCp} T={T} G={G}/>}
      {tab==="rewards"&&<Rewards wallet={wallet} setWallet={setWallet} tokens={tokens} setTokens={setTokens} tickets={tickets} setTickets={setTickets} onToast={onToast} T={T} G={G}/>}
      {tab==="avatar" &&<AvatarCreator avatars={avatars} setAvatars={setAvatars} tokens={tokens} setTokens={setTokens} owned={ownedItems} setOwned={setOwnedItems} onBack={()=>setTab("home")} onToast={onToast} T={T} G={G}/>}
      {tab==="pass"   &&<PassScreen tokens={tokens} setTokens={setTokens} onBack={()=>setTab("home")} onToast={onToast} T={T} G={G}/>}
      {tab==="settings"&&<SettingsScreen themeName={themeName} setThemeName={setThemeName} onBack={()=>setTab("home")} onToast={onToast} onLogout={async()=>{await supabase.auth.signOut();}} T={T} G={G}/>}
      {tab==="profile"&&<Profile cp={cp} wallet={wallet} tokens={tokens} setTokens={setTokens} tickets={tickets} streak={streak} wheelDone={wheelDone} setWheelDone={setWheelDone} avatars={avatars} setTab={setTab} onToast={onToast} T={T} G={G} themeName={themeName} setThemeName={setThemeName}/>}
    </div>
    <nav style={{position:"sticky",bottom:0,background:T.glass||T.surface,backdropFilter:T.glass?"blur(18px)":"none",WebkitBackdropFilter:T.glass?"blur(18px)":"none",borderTop:`1px solid ${T.glassBorder||T.line}`,display:"flex",justifyContent:"space-around",alignItems:"flex-end",padding:"10px 0 16px",zIndex:60}}>
      {nav.map(item=>{const on=tab===item.id;
        if(item.star) return(
          <div key={item.id} onClick={()=>setTab(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",marginTop:-22}}>
            <div style={{width:58,height:58,borderRadius:"50%",background:G.hero,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 6px 20px ${T.a1}66`,border:`3px solid ${T.surface}`,transform:on?"scale(1.05)":"scale(1)",transition:"transform 0.2s"}}>{item.i}</div>
            <span style={{fontSize:10.5,fontWeight:800,color:on?T.a1:T.text}}>{item.l}</span>
          </div>
        );
        return(<div key={item.id} onClick={()=>setTab(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",padding:"2px 10px"}}><span style={{fontSize:19,color:on?T.a1:T.faint}}>{item.i}</span><span style={{fontSize:10,fontWeight:on?700:500,color:on?T.text:T.faint}}>{item.l}</span></div>);
      })}
    </nav>
  </div>);
}
