import { useState, useEffect, useReducer } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// ── Config ──
const CURRENCIES = { COP:{symbol:"$",rate:1}, USD:{symbol:"US$",rate:4150}, EUR:{symbol:"€",rate:4480} };
const CATS = {
  arriendo:{label:"Arriendo",emoji:"🏠",group:"Fijos",color:"#FF6B6B"},
  servicios:{label:"Servicios",emoji:"💡",group:"Fijos",color:"#FFA94D"},
  mercado:{label:"Mercado",emoji:"🛒",group:"Fijos",color:"#FFD43B"},
  transporte:{label:"Transporte",emoji:"🚌",group:"Fijos",color:"#69DB7C"},
  salud:{label:"Salud",emoji:"🏥",group:"Fijos",color:"#4DABF7"},
  educacion:{label:"Educación",emoji:"📖",group:"Fijos",color:"#748FFC"},
  celular:{label:"Celular/Internet",emoji:"📱",group:"Fijos",color:"#9775FA"},
  ocio:{label:"Ocio",emoji:"🎮",group:"Variable",color:"#F06595"},
  restaurantes:{label:"Restaurantes",emoji:"🍽️",group:"Variable",color:"#E64980"},
  mascotas:{label:"Mascotas",emoji:"🐾",group:"Variable",color:"#20C997"},
  ropa:{label:"Ropa/Compras",emoji:"👕",group:"Variable",color:"#3BC9DB"},
  suscripciones:{label:"Suscripciones",emoji:"📺",group:"Variable",color:"#845EF7"},
  deudas:{label:"Deudas/Créditos",emoji:"🏦",group:"Financiero",color:"#FF8787"},
  ahorro:{label:"Ahorro",emoji:"💎",group:"Financiero",color:"#51CF66"},
  seguros:{label:"Seguros",emoji:"🛡️",group:"Financiero",color:"#339AF0"},
  imprevistos:{label:"Imprevistos",emoji:"⚡",group:"Otros",color:"#FCC419"},
  regalos:{label:"Regalos",emoji:"🎁",group:"Otros",color:"#FF922B"},
  otros:{label:"Otros",emoji:"📦",group:"Otros",color:"#ADB5BD"},
};
const INC_CATS = { salario:{label:"Salario",emoji:"💼",color:"#51CF66"}, freelance:{label:"Freelance",emoji:"💻",color:"#69DB7C"}, negocio:{label:"Negocio",emoji:"🏪",color:"#20C997"}, otro_ingreso:{label:"Otro",emoji:"💰",color:"#3BC9DB"} };
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const fmt = (n) => "$" + Math.abs(n).toLocaleString("es-CO",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtC = (n,c="COP") => (CURRENCIES[c]?.symbol||"$")+" "+Math.abs(n).toLocaleString("es-CO",{minimumFractionDigits:0,maximumFractionDigits:c==="COP"?0:2});
const toCOP = (a,c) => Math.round(a*(CURRENCIES[c]?.rate||1));

// ── Storage ──
async function load(k,fb){try{const r=localStorage.getItem(k) ? {value: localStorage.getItem(k)} : null;return r?JSON.parse(r.value):fb}catch{return fb}}
function save(k,d){try{localStorage.setItem(k,JSON.stringify(d))}catch(e){console.error(e)}}

// ── Sample Data ──
const SAMPLE_FIXED = [
  { id:1, category:"arriendo", amount:309000, note:"Arriendo", person:1, shared:true, currency:"COP", half:0 },
  { id:2, category:"arriendo", amount:309000, note:"Arriendo", person:2, shared:true, currency:"COP", half:0 },
  { id:3, category:"celular", amount:37500, note:"Internet", person:1, shared:true, currency:"COP", half:0 },
  { id:4, category:"celular", amount:37500, note:"Internet", person:2, shared:true, currency:"COP", half:0 },
  { id:5, category:"suscripciones", amount:55000, note:"Netflix + Spotify", person:1, shared:true, currency:"COP", half:0 },
  { id:6, category:"deudas", amount:250000, note:"Cuota crédito", person:1, shared:false, currency:"COP", half:0 },
];

const SAMPLE_PERIODS = [
  {
    id:1, month:"Enero", half:1, label:"Ene 1-15",
    incomes:[
      {id:101,person:1,amount:2900000,note:"Salario",category:"salario",currency:"COP"},
      {id:102,person:2,amount:2900000,note:"Salario",category:"salario",currency:"COP"},
    ],
    expenses:[
      {id:201,category:"mercado",amount:300000,note:"Mercado",person:1,shared:true,currency:"COP",fixed:false},
      {id:202,category:"ropa",amount:100000,note:"Ropa classic jean",person:1,shared:false,currency:"COP",fixed:false},
      {id:203,category:"otros",amount:240000,note:"MOUSE",person:1,shared:false,currency:"COP",fixed:false},
      {id:204,category:"restaurantes",amount:150000,note:"Rappi",person:1,shared:true,currency:"COP",fixed:false},
      {id:205,category:"ocio",amount:100000,note:"Guitarra",person:1,shared:false,currency:"COP",fixed:false},
      {id:206,category:"mascotas",amount:250000,note:"Mami",person:2,shared:true,currency:"COP",fixed:false},
      {id:207,category:"mercado",amount:300000,note:"Mercado",person:2,shared:true,currency:"COP",fixed:false},
      {id:208,category:"celular",amount:314000,note:"Audífonos",person:2,shared:false,currency:"COP",fixed:false},
      {id:209,category:"restaurantes",amount:150000,note:"Rappi",person:2,shared:true,currency:"COP",fixed:false},
      {id:210,category:"ocio",amount:271600,note:"Guitarra",person:2,shared:false,currency:"COP",fixed:false},
    ],
  },
  {
    id:2, month:"Enero", half:2, label:"Ene 16-31",
    incomes:[
      {id:301,person:1,amount:3200000,note:"Salario",category:"salario",currency:"COP"},
      {id:302,person:2,amount:3088000,note:"Salario",category:"salario",currency:"COP"},
    ],
    expenses:[
      // Auto-generated fixed
      {id:401,category:"arriendo",amount:309000,note:"Arriendo",person:1,shared:true,currency:"COP",fixed:true},
      {id:402,category:"arriendo",amount:309000,note:"Arriendo",person:2,shared:true,currency:"COP",fixed:true},
      {id:403,category:"celular",amount:37500,note:"Internet",person:1,shared:true,currency:"COP",fixed:true},
      {id:404,category:"celular",amount:37500,note:"Internet",person:2,shared:true,currency:"COP",fixed:true},
      {id:405,category:"suscripciones",amount:55000,note:"Netflix + Spotify",person:1,shared:true,currency:"COP",fixed:true},
      {id:406,category:"deudas",amount:250000,note:"Cuota crédito",person:1,shared:false,currency:"COP",fixed:true},
      // Variable
      {id:407,category:"servicios",amount:150000,note:"Luz",person:1,shared:true,currency:"COP",fixed:false},
      {id:408,category:"servicios",amount:80000,note:"Agua",person:1,shared:true,currency:"COP",fixed:false},
      {id:409,category:"mercado",amount:300000,note:"Mercado",person:1,shared:true,currency:"COP",fixed:false},
      {id:410,category:"otros",amount:250000,note:"Tarjeta gráfica",person:1,shared:false,currency:"COP",fixed:false},
      {id:411,category:"restaurantes",amount:150000,note:"Rappi",person:1,shared:true,currency:"COP",fixed:false},
      {id:412,category:"mascotas",amount:300000,note:"Mami",person:2,shared:true,currency:"COP",fixed:false},
      {id:413,category:"mercado",amount:300000,note:"Mercado",person:2,shared:true,currency:"COP",fixed:false},
      {id:414,category:"servicios",amount:110000,note:"Luz",person:2,shared:true,currency:"COP",fixed:false},
      {id:415,category:"servicios",amount:80000,note:"Agua",person:2,shared:true,currency:"COP",fixed:false},
      {id:416,category:"restaurantes",amount:150000,note:"Rappi",person:2,shared:true,currency:"COP",fixed:false},
      {id:417,category:"otros",amount:500000,note:"NU",person:2,shared:false,currency:"COP",fixed:false},
    ],
  },
];

// ── Reducer ──
const initState = {
  screen:"dashboard", dark:false, loaded:false,
  partner1:{name:"Andrés",avatar:"🧔"}, partner2:{name:"Mila",avatar:"👩"},
  fixedExpenses: SAMPLE_FIXED,
  periods: SAMPLE_PERIODS,
  goals:[{id:1,name:"Vacaciones San Andrés",target:2500000,saved:850000,emoji:"🏝️",color:"#4DABF7"}],
  activePeriod:2,
  showAdd:false, showAddIncome:false, showGoalAdd:false, showFixedAdd:false, showGenerate:false,
};

function reducer(s,a) {
  switch(a.type) {
    case "LOAD": return {...s,...a.p,loaded:true};
    case "SCREEN": return {...s,screen:a.p};
    case "DARK": return {...s,dark:!s.dark};
    case "SET_NAMES": return {...s,partner1:{...s.partner1,name:a.p.n1},partner2:{...s.partner2,name:a.p.n2}};
    // Fixed expenses
    case "ADD_FIXED": return {...s,fixedExpenses:[...s.fixedExpenses,a.p],showFixedAdd:false};
    case "DEL_FIXED": return {...s,fixedExpenses:s.fixedExpenses.filter(f=>f.id!==a.p)};
    case "EDIT_FIXED": return {...s,fixedExpenses:s.fixedExpenses.map(f=>f.id===a.p.id?{...f,amount:a.p.amount}:f)};
    case "TOGGLE_FIXED_ADD": return {...s,showFixedAdd:!s.showFixedAdd};
    // Periods
    case "ADD_PERIOD": return {...s,periods:[...s.periods,a.p],activePeriod:a.p.id,showGenerate:false};
    case "ADD_EXPENSE": { const ps=s.periods.map(p=>p.id===a.p.pid?{...p,expenses:[...p.expenses,a.p.exp]}:p);return{...s,periods:ps,showAdd:false}; }
    case "DEL_EXPENSE": { const ps=s.periods.map(p=>({...p,expenses:p.expenses.filter(e=>e.id!==a.p)}));return{...s,periods:ps}; }
    case "EDIT_EXPENSE_AMOUNT": { const ps=s.periods.map(p=>({...p,expenses:p.expenses.map(e=>e.id===a.p.id?{...e,amount:a.p.amount}:e)}));return{...s,periods:ps}; }
    case "ADD_INCOME": { const ps=s.periods.map(p=>p.id===a.p.pid?{...p,incomes:[...p.incomes,a.p.inc]}:p);return{...s,periods:ps,showAddIncome:false}; }
    case "SET_PERIOD": return {...s,activePeriod:a.p};
    case "TOGGLE_ADD": return {...s,showAdd:!s.showAdd};
    case "TOGGLE_ADD_INC": return {...s,showAddIncome:!s.showAddIncome};
    case "TOGGLE_GENERATE": return {...s,showGenerate:!s.showGenerate};
    // Goals
    case "ADD_GOAL": return {...s,goals:[...s.goals,a.p],showGoalAdd:false};
    case "UPDATE_GOAL": return {...s,goals:s.goals.map(g=>g.id===a.p.id?{...g,saved:a.p.saved}:g)};
    case "DEL_GOAL": return {...s,goals:s.goals.filter(g=>g.id!==a.p)};
    case "TOGGLE_GOAL_ADD": return {...s,showGoalAdd:!s.showGoalAdd};
    default: return s;
  }
}

// ── Theme ──
const th=(d)=>({bg:d?"#0C0C14":"#F5F6FA",card:d?"#18182A":"#fff",border:d?"rgba(255,255,255,0.06)":"#EEEFF3",text:d?"#E8E6E3":"#1A1A2E",sub:d?"#888":"#999",dim:d?"#555":"#ccc",input:d?"#222236":"#F5F6FA",inputB:d?"#333":"#E8E9EE",accent:"#6C5CE7",accent2:"#A29BFE",p1:"#FF6B6B",p2:"#4ECDC4"});

// ── Shared UI ──
const Overlay=({children,onClose})=><div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}><div style={{width:"100%",maxWidth:430}} onClick={e=>e.stopPropagation()}>{children}</div></div>;
const ModalBox=({children,t})=><div style={{background:t.card,borderRadius:"24px 24px 0 0",padding:"22px 18px 30px",maxHeight:"90vh",overflowY:"auto"}}>{children}</div>;
const CatPill=({k,c,active,onClick,t})=><button onClick={onClick} style={{padding:"4px 9px",borderRadius:16,border:active?`2px solid ${c.color}`:`1.5px solid ${t.inputB}`,background:active?`${c.color}18`:t.input,cursor:"pointer",fontSize:10,fontFamily:"'Nunito',sans-serif",fontWeight:active?700:500,color:active?c.color:t.sub,display:"flex",alignItems:"center",gap:2}}><span style={{fontSize:12}}>{c.emoji}</span>{c.label}</button>;

// ── Generate Quincena Modal ──
function GenerateModal({s,d,t}) {
  const last = s.periods[s.periods.length-1];
  const nextHalf = last ? (last.half===1?2:1) : 1;
  const nextMonthIdx = last ? (last.half===2 ? (MONTHS.indexOf(last.month)+1)%12 : MONTHS.indexOf(last.month)) : new Date().getMonth();
  const nextMonth = MONTHS[nextMonthIdx];
  const nextLabel = `${nextMonth.slice(0,3)} ${nextHalf===1?"1-15":"16-"+new Date(2026,nextMonthIdx+1,0).getDate()}`;

  const fixedForPeriod = s.fixedExpenses.filter(f=>f.half===0||f.half===nextHalf);
  const totalFixed = fixedForPeriod.reduce((a,f)=>a+toCOP(f.amount,f.currency),0);

  const generate = () => {
    const newPeriod = {
      id: Date.now(),
      month: nextMonth,
      half: nextHalf,
      label: nextLabel,
      incomes: [],
      expenses: fixedForPeriod.map(f=>({
        id: Date.now()+Math.random()*10000|0,
        category: f.category,
        amount: f.amount,
        note: f.note,
        person: f.person,
        shared: f.shared,
        currency: f.currency,
        fixed: true,
      })),
    };
    d({type:"ADD_PERIOD",p:newPeriod});
  };

  return(
    <Overlay onClose={()=>d({type:"TOGGLE_GENERATE"})}>
      <ModalBox t={t}>
        <h2 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:t.text}}>📅 Generar siguiente quincena</h2>
        <p style={{fontSize:13,color:t.sub,margin:"0 0 16px"}}>Se creará: <b style={{color:t.accent}}>{nextLabel}</b></p>

        <div style={{padding:14,borderRadius:14,background:`${t.accent}08`,border:`1px solid ${t.accent}20`,marginBottom:16}}>
          <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px"}}>📌 Gastos fijos que se copiarán automáticamente:</p>
          {fixedForPeriod.length===0&&<p style={{fontSize:12,color:t.sub,margin:0,fontStyle:"italic"}}>No tienes gastos fijos configurados. Ve a Ajustes → Gastos Fijos.</p>}
          {fixedForPeriod.map(f=>{const c=CATS[f.category];return(
            <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>{c?.emoji}</span>
                <span style={{fontSize:12,color:t.text,fontWeight:500}}>{f.note}</span>
                <span style={{fontSize:10,color:f.person===1?t.p1:t.p2,fontWeight:600}}>{f.person===1?s.partner1.name:s.partner2.name}</span>
                {f.shared&&<span style={{fontSize:8,padding:"2px 5px",borderRadius:6,background:`${t.accent}15`,color:t.accent,fontWeight:700}}>50/50</span>}
              </div>
              <span style={{fontSize:12,fontWeight:700,color:t.text}}>{fmtC(f.amount,f.currency)}</span>
            </div>
          )})}
          {fixedForPeriod.length>0&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:8,marginTop:4}}>
            <span style={{fontSize:12,fontWeight:700,color:t.text}}>Total fijos</span>
            <span style={{fontSize:13,fontWeight:800,color:t.accent}}>{fmt(totalFixed)}</span>
          </div>}
        </div>

        <p style={{fontSize:11,color:t.sub,margin:"0 0 14px",lineHeight:1.5}}>
          💡 Los gastos fijos se agregarán con su monto actual. Después puedes editar cualquier monto si cambió, y agregar gastos variables como siempre.
        </p>

        <button onClick={generate} style={{width:"100%",padding:14,borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",background:`linear-gradient(135deg,${t.accent},${t.accent2})`}}>
          Generar {nextLabel}
        </button>
      </ModalBox>
    </Overlay>
  );
}

// ── Add Fixed Expense Modal ──
function AddFixedModal({s,d,t}) {
  const[cat,setCat]=useState("arriendo");const[amount,setAmount]=useState("");const[note,setNote]=useState("");
  const[person,setPerson]=useState(1);const[shared,setShared]=useState(true);const[cur,setCur]=useState("COP");
  const[half,setHalf]=useState(0); // 0=ambas, 1=1ra, 2=2da
  const submit=()=>{if(!amount)return;d({type:"ADD_FIXED",p:{id:Date.now(),category:cat,amount:Number(amount.replace(/\./g,"")),note:note||CATS[cat]?.label,person,shared,currency:cur,half}})};
  return(
    <Overlay onClose={()=>d({type:"TOGGLE_FIXED_ADD"})}>
      <ModalBox t={t}>
        <h2 style={{fontSize:17,fontWeight:700,margin:"0 0 14px",color:t.text}}>📌 Nuevo gasto fijo</h2>
        <label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:5}}>¿Quién paga?</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[{p:1,n:s.partner1.name,a:s.partner1.avatar,c:t.p1},{p:2,n:s.partner2.name,a:s.partner2.avatar,c:t.p2}].map(x=>(
            <button key={x.p} onClick={()=>setPerson(x.p)} style={{padding:10,borderRadius:12,border:person===x.p?`2px solid ${x.c}`:`2px solid ${t.inputB}`,background:person===x.p?`${x.c}12`:t.input,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:person===x.p?x.c:t.sub}}>{x.a} {x.n}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <button onClick={()=>setShared(true)} style={{padding:9,borderRadius:10,border:shared?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:shared?`${t.accent}12`:t.input,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:shared?t.accent:t.sub}}>🏠 Compartido</button>
          <button onClick={()=>setShared(false)} style={{padding:9,borderRadius:10,border:!shared?`2px solid #FFA94D`:`2px solid ${t.inputB}`,background:!shared?"#FFA94D12":t.input,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:!shared?"#FFA94D":t.sub}}>👤 Individual</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{flex:1}}><label style={{fontSize:10,fontWeight:600,color:t.sub,display:"block",marginBottom:3}}>Monto fijo</label>
            <input type="text" inputMode="numeric" placeholder="309.000" value={amount} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAmount(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:15,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} autoFocus />
          </div>
          <div style={{width:76}}><label style={{fontSize:10,fontWeight:600,color:t.sub,display:"block",marginBottom:3}}>Moneda</label>
            <select value={cur} onChange={e=>setCur(e.target.value)} style={{width:"100%",padding:"10px 4px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,cursor:"pointer"}}>{Object.keys(CURRENCIES).map(k=><option key={k} value={k}>{k}</option>)}</select>
          </div>
        </div>
        <label style={{fontSize:10,fontWeight:600,color:t.sub,display:"block",marginBottom:4}}>Categoría</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
          {Object.entries(CATS).map(([k,c])=><CatPill key={k} k={k} c={c} active={cat===k} onClick={()=>setCat(k)} t={t}/>)}
        </div>
        <input type="text" placeholder="Nota (ej: Arriendo apto)" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",marginBottom:10,color:t.text,background:t.input,boxSizing:"border-box"}} />
        <label style={{fontSize:10,fontWeight:600,color:t.sub,display:"block",marginBottom:5}}>¿En cuál quincena se cobra?</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {[{v:0,l:"Ambas"},{v:1,l:"1ra (1-15)"},{v:2,l:"2da (16-31)"}].map(x=>(
            <button key={x.v} onClick={()=>setHalf(x.v)} style={{padding:8,borderRadius:10,border:half===x.v?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:half===x.v?`${t.accent}12`:t.input,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:half===x.v?t.accent:t.sub}}>{x.l}</button>
          ))}
        </div>
        <button onClick={submit} style={{width:"100%",padding:13,borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",background:`linear-gradient(135deg,${t.accent},${t.accent2})`}}>Agregar gasto fijo</button>
      </ModalBox>
    </Overlay>
  );
}

// ── Add Expense Modal ──
function AddExpenseModal({s,d,t,pid}) {
  const[cat,setCat]=useState("mercado");const[amount,setAmount]=useState("");const[note,setNote]=useState("");
  const[person,setPerson]=useState(1);const[shared,setShared]=useState(true);const[cur,setCur]=useState("COP");
  const submit=()=>{if(!amount)return;d({type:"ADD_EXPENSE",p:{pid,exp:{id:Date.now(),category:cat,amount:Number(amount.replace(/\./g,"")),note:note||CATS[cat]?.label,person,shared,currency:cur,fixed:false}}})};
  return(
    <Overlay onClose={()=>d({type:"TOGGLE_ADD"})}>
      <ModalBox t={t}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h2 style={{fontSize:17,fontWeight:700,margin:0,color:t.text}}>Nuevo gasto variable</h2>
          <button onClick={()=>d({type:"TOGGLE_ADD"})} style={{width:28,height:28,borderRadius:"50%",border:"none",background:t.input,cursor:"pointer",fontSize:12,color:t.sub}}>✕</button>
        </div>
        <label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:5}}>¿Quién pagó?</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[{p:1,n:s.partner1.name,a:s.partner1.avatar,c:t.p1},{p:2,n:s.partner2.name,a:s.partner2.avatar,c:t.p2}].map(x=>(
            <button key={x.p} onClick={()=>setPerson(x.p)} style={{padding:9,borderRadius:12,border:person===x.p?`2px solid ${x.c}`:`2px solid ${t.inputB}`,background:person===x.p?`${x.c}12`:t.input,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:person===x.p?x.c:t.sub}}>{x.a} {x.n}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <button onClick={()=>setShared(true)} style={{padding:8,borderRadius:10,border:shared?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:shared?`${t.accent}12`:t.input,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:shared?t.accent:t.sub}}>🏠 Compartido</button>
          <button onClick={()=>setShared(false)} style={{padding:8,borderRadius:10,border:!shared?"2px solid #FFA94D":`2px solid ${t.inputB}`,background:!shared?"#FFA94D12":t.input,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:!shared?"#FFA94D":t.sub}}>👤 Individual</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input type="text" inputMode="numeric" placeholder="Monto" value={amount} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAmount(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:15,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} autoFocus />
          <select value={cur} onChange={e=>setCur(e.target.value)} style={{width:76,padding:"10px 4px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,cursor:"pointer"}}>{Object.keys(CURRENCIES).map(k=><option key={k} value={k}>{k}</option>)}</select>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>{Object.entries(CATS).map(([k,c])=><CatPill key={k} k={k} c={c} active={cat===k} onClick={()=>setCat(k)} t={t}/>)}</div>
        <input type="text" placeholder="Nota" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",marginBottom:14,color:t.text,background:t.input,boxSizing:"border-box"}} />
        <button onClick={submit} style={{width:"100%",padding:13,borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",background:"linear-gradient(135deg,#FF6B6B,#ee5a24)"}}>Registrar gasto</button>
      </ModalBox>
    </Overlay>
  );
}

function AddIncomeModal({s,d,t,pid}) {
  const[person,setPerson]=useState(1);const[amount,setAmount]=useState("");const[note,setNote]=useState("");const[cat,setCat]=useState("salario");const[cur,setCur]=useState("COP");
  const submit=()=>{if(!amount)return;d({type:"ADD_INCOME",p:{pid,inc:{id:Date.now(),person,amount:Number(amount.replace(/\./g,"")),note:note||INC_CATS[cat]?.label,category:cat,currency:cur}}})};
  return(
    <Overlay onClose={()=>d({type:"TOGGLE_ADD_INC"})}>
      <ModalBox t={t}>
        <h2 style={{fontSize:17,fontWeight:700,margin:"0 0 14px",color:t.text}}>Nuevo ingreso</h2>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[{p:1,n:s.partner1.name,a:s.partner1.avatar,c:t.p1},{p:2,n:s.partner2.name,a:s.partner2.avatar,c:t.p2}].map(x=>(
            <button key={x.p} onClick={()=>setPerson(x.p)} style={{padding:9,borderRadius:12,border:person===x.p?`2px solid ${x.c}`:`2px solid ${t.inputB}`,background:person===x.p?`${x.c}12`:t.input,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:person===x.p?x.c:t.sub}}>{x.a} {x.n}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input type="text" inputMode="numeric" placeholder="Monto" value={amount} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAmount(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:15,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} autoFocus />
          <select value={cur} onChange={e=>setCur(e.target.value)} style={{width:76,padding:"10px 4px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,cursor:"pointer"}}>{Object.keys(CURRENCIES).map(k=><option key={k} value={k}>{k}</option>)}</select>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
          {Object.entries(INC_CATS).map(([k,c])=><button key={k} onClick={()=>setCat(k)} style={{padding:"5px 10px",borderRadius:16,border:cat===k?`2px solid ${c.color}`:`1.5px solid ${t.inputB}`,background:cat===k?`${c.color}18`:t.input,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:cat===k?700:500,color:cat===k?c.color:t.sub}}>{c.emoji} {c.label}</button>)}
        </div>
        <input type="text" placeholder="Nota" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",marginBottom:14,color:t.text,background:t.input,boxSizing:"border-box"}} />
        <button onClick={submit} style={{width:"100%",padding:13,borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",background:"linear-gradient(135deg,#51CF66,#20C997)"}}>Registrar ingreso</button>
      </ModalBox>
    </Overlay>
  );
}

// ── Receipt ──
function Receipt({period,s,t}) {
  const[show,setShow]=useState(false);
  if(!period)return null;
  const p1=s.partner1,p2=s.partner2;
  const inc1=period.incomes.filter(i=>i.person===1).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const inc2=period.incomes.filter(i=>i.person===2).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const shared=period.expenses.filter(e=>e.shared);
  const ind1=period.expenses.filter(e=>!e.shared&&e.person===1);
  const ind2=period.expenses.filter(e=>!e.shared&&e.person===2);
  const totalShared=shared.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const halfShared=Math.round(totalShared/2);
  const totalInd1=ind1.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const totalInd2=ind2.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const tot1=halfShared+totalInd1,tot2=halfShared+totalInd2;
  const rem1=inc1-tot1,rem2=inc2-tot2;

  if(!show)return<button onClick={()=>setShow(true)} style={{width:"100%",padding:13,borderRadius:14,border:`2px dashed ${t.accent}44`,background:`${t.accent}08`,cursor:"pointer",fontSize:13,fontWeight:700,color:t.accent,fontFamily:"'Nunito',sans-serif",marginBottom:12}}>🧾 Ver recibo quincenal</button>;
  return(
    <div style={{background:t.card,borderRadius:20,padding:"18px 16px",marginBottom:12,border:`1px solid ${t.border}`,boxShadow:s.dark?"none":"0 4px 20px rgba(0,0,0,0.06)"}}>
      <div style={{textAlign:"center",marginBottom:14,borderBottom:`2px dashed ${t.border}`,paddingBottom:12}}>
        <p style={{fontSize:18,fontWeight:800,color:t.accent,margin:"0 0 2px"}}>Kashy</p>
        <p style={{fontSize:14,fontWeight:700,color:t.text,margin:"0 0 2px"}}>🧾 Recibo Quincenal</p>
        <p style={{fontSize:12,color:t.sub,margin:0}}>{period.label} · {period.month} 2026</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[{p:p1,inc:inc1,c:t.p1},{p:p2,inc:inc2,c:t.p2}].map((x,i)=>(
          <div key={i} style={{padding:10,borderRadius:10,background:`${x.c}08`,border:`1px solid ${x.c}22`}}>
            <p style={{fontSize:11,color:t.sub,margin:"0 0 2px"}}>{x.p.avatar} {x.p.name}</p>
            <p style={{fontSize:15,fontWeight:800,color:x.c,margin:0}}>↑ {fmt(x.inc)}</p>
          </div>
        ))}
      </div>
      {/* Shared */}
      <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 6px"}}>🏠 Gastos compartidos</p>
      {shared.map(e=>{const c=CATS[e.category];return(
        <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${t.border}`}}>
          <span style={{fontSize:11,color:t.sub}}>{c?.emoji} {e.note} {e.fixed&&<span style={{fontSize:8,color:t.accent,fontWeight:700}}>FIJO</span>} <span style={{fontSize:9,opacity:0.5}}>({e.person===1?p1.name:p2.name})</span></span>
          <span style={{fontSize:11,fontWeight:600,color:t.text}}>{fmt(toCOP(e.amount,e.currency))}</span>
        </div>
      )})}
      <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",marginTop:3}}>
        <span style={{fontSize:12,fontWeight:700,color:t.text}}>Total compartido</span>
        <span style={{fontSize:12,fontWeight:800,color:t.accent}}>{fmt(totalShared)}</span>
      </div>
      <p style={{fontSize:10,color:t.sub,margin:"2px 0 10px",textAlign:"center",fontStyle:"italic"}}>Cada uno: {fmt(halfShared)}</p>
      {/* Individual */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[{p:p1,items:ind1,total:totalInd1,c:t.p1},{p:p2,items:ind2,total:totalInd2,c:t.p2}].map((x,i)=>(
          <div key={i}>
            <p style={{fontSize:11,fontWeight:700,color:x.c,margin:"0 0 4px"}}>{x.p.name} — Individual</p>
            {x.items.map(e=>{const c=CATS[e.category];return(
              <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
                <span style={{fontSize:10,color:t.sub}}>{c?.emoji} {e.note}</span>
                <span style={{fontSize:10,fontWeight:600,color:t.text}}>{fmt(toCOP(e.amount,e.currency))}</span>
              </div>
            )})}
            <div style={{borderTop:`1px solid ${t.border}`,marginTop:3,paddingTop:3,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,fontWeight:700,color:t.text}}>Total</span>
              <span style={{fontSize:10,fontWeight:700,color:x.c}}>{fmt(x.total)}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Summary */}
      <div style={{borderTop:`2px dashed ${t.border}`,paddingTop:12}}>
        <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px",textAlign:"center"}}>📊 Resumen</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{p:p1,inc:inc1,tot:tot1,rem:rem1,c:t.p1},{p:p2,inc:inc2,tot:tot2,rem:rem2,c:t.p2}].map((x,i)=>(
            <div key={i} style={{padding:10,borderRadius:12,background:`${x.c}08`,border:`1px solid ${x.c}22`,textAlign:"center"}}>
              <p style={{fontSize:11,fontWeight:700,color:t.text,margin:"0 0 2px"}}>{x.p.avatar} {x.p.name}</p>
              <p style={{fontSize:9,color:t.sub,margin:"0 0 1px"}}>Ingreso: {fmt(x.inc)}</p>
              <p style={{fontSize:9,color:t.sub,margin:"0 0 1px"}}>Gastos: {fmt(x.tot)}</p>
              <p style={{fontSize:16,fontWeight:800,color:x.rem>=0?"#2B8A3E":"#E03131",margin:"3px 0 0"}}>{x.rem>=0?"":"−"}{fmt(x.rem)}</p>
              <p style={{fontSize:9,color:t.sub,margin:0}}>{x.rem>=0?"disponible":"déficit"}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>setShow(false)} style={{width:"100%",marginTop:12,padding:9,borderRadius:10,border:`1px solid ${t.border}`,background:t.input,cursor:"pointer",fontSize:11,fontWeight:600,color:t.sub,fontFamily:"'Nunito',sans-serif"}}>Cerrar recibo</button>
    </div>
  );
}

// ── Dashboard ──
function Dashboard({s,d,t}) {
  const period=s.periods.find(p=>p.id===s.activePeriod)||s.periods[s.periods.length-1];
  if(!period)return<div style={{padding:40,textAlign:"center"}}><p style={{fontSize:40}}>📅</p><p style={{color:t.sub}}>Genera tu primera quincena</p><button onClick={()=>d({type:"TOGGLE_GENERATE"})} style={{padding:"12px 24px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${t.accent},${t.accent2})`,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>Generar quincena</button></div>;

  const [editId,setEditId]=useState(null);const[editVal,setEditVal]=useState("");

  const inc1=period.incomes.filter(i=>i.person===1).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const inc2=period.incomes.filter(i=>i.person===2).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const totalInc=inc1+inc2;
  const totalExp=period.expenses.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const sharedTotal=period.expenses.filter(e=>e.shared).reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const fixedTotal=period.expenses.filter(e=>e.fixed).reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const balance=totalInc-totalExp;

  const byCat={};period.expenses.forEach(e=>{byCat[e.category]=(byCat[e.category]||0)+toCOP(e.amount,e.currency)});
  const pieData=Object.entries(byCat).map(([k,v])=>({name:CATS[k]?.label||k,value:v,color:CATS[k]?.color||"#aaa",emoji:CATS[k]?.emoji||"📦"})).sort((a,b)=>b.value-a.value);

  const saveEdit=(id)=>{if(editVal){d({type:"EDIT_EXPENSE_AMOUNT",p:{id,amount:Number(editVal.replace(/\./g,""))}});setEditId(null)}};

  return(
    <div style={{padding:"0 16px 110px"}}>
      {/* Period selector + generate */}
      <div style={{display:"flex",gap:6,padding:"10px 0",alignItems:"center",overflowX:"auto",scrollbarWidth:"none"}}>
        {s.periods.map(p=>(
          <button key={p.id} onClick={()=>d({type:"SET_PERIOD",p:p.id})} style={{padding:"7px 12px",borderRadius:10,border:s.activePeriod===p.id?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:s.activePeriod===p.id?`${t.accent}12`:t.input,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:s.activePeriod===p.id?t.accent:t.sub,whiteSpace:"nowrap",flexShrink:0}}>{p.label}</button>
        ))}
        <button onClick={()=>d({type:"TOGGLE_GENERATE"})} style={{padding:"7px 12px",borderRadius:10,border:`2px dashed ${t.accent}55`,background:"transparent",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Nunito',sans-serif",color:t.accent,whiteSpace:"nowrap",flexShrink:0}}>+ Quincena</button>
      </div>

      {/* Balance Card */}
      <div style={{padding:"18px 16px",borderRadius:20,background:"linear-gradient(135deg,#1A1A2E,#16213E,#0F3460)",color:"#fff",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}}/>
        <p style={{fontSize:10,opacity:0.5,margin:"0 0 3px",letterSpacing:1}}>{period.label} · {period.month}</p>
        <p style={{fontSize:28,fontWeight:800,margin:"0 0 10px",color:balance>=0?"#69DB7C":"#FF6B6B"}}>{fmt(balance)}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {[{l:"INGRESOS",v:totalInc,c:"#69DB7C"},{l:"GASTOS",v:totalExp,c:"#FF6B6B"},{l:"FIJOS",v:fixedTotal,c:"#A29BFE"}].map((x,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"6px 8px"}}>
              <p style={{fontSize:8,opacity:0.4,margin:0,letterSpacing:1}}>{x.l}</p>
              <p style={{fontSize:13,fontWeight:700,margin:0,color:x.c}}>{fmt(x.v)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partner cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        {[{p:s.partner1,inc:inc1,exp:period.expenses.filter(e=>e.person===1).reduce((a,e)=>a+toCOP(e.amount,e.currency),0),c:t.p1},{p:s.partner2,inc:inc2,exp:period.expenses.filter(e=>e.person===2).reduce((a,e)=>a+toCOP(e.amount,e.currency),0),c:t.p2}].map((x,i)=>(
          <div key={i} style={{background:t.card,borderRadius:14,padding:12,border:`1px solid ${t.border}`}}>
            <p style={{fontSize:12,fontWeight:700,color:x.c,margin:"0 0 6px"}}>{x.p.avatar} {x.p.name}</p>
            <p style={{fontSize:10,color:t.sub,margin:"0 0 1px"}}>Ingreso: <b style={{color:"#2B8A3E"}}>{fmt(x.inc)}</b></p>
            <p style={{fontSize:10,color:t.sub,margin:"0 0 1px"}}>Gastó: <b style={{color:"#E03131"}}>{fmt(x.exp)}</b></p>
            <p style={{fontSize:14,fontWeight:800,color:(x.inc-x.exp)>=0?"#2B8A3E":"#E03131",margin:"3px 0 0"}}>{fmt(x.inc-x.exp)}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
        <button onClick={()=>d({type:"TOGGLE_ADD_INC"})} style={{padding:11,borderRadius:12,border:"none",background:"linear-gradient(135deg,#51CF66,#20C997)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>+ Ingreso</button>
        <button onClick={()=>d({type:"TOGGLE_ADD"})} style={{padding:11,borderRadius:12,border:"none",background:"linear-gradient(135deg,#FF6B6B,#ee5a24)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>+ Gasto</button>
      </div>

      {/* Receipt */}
      <Receipt period={period} s={s} t={t}/>

      {/* Pie */}
      {pieData.length>0&&<div style={{background:t.card,borderRadius:16,padding:"14px 12px",marginBottom:12,border:`1px solid ${t.border}`}}>
        <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px"}}>🍩 Distribución</p>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:110,height:110,flexShrink:0}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={2} strokeWidth={0}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
          <div style={{flex:1,maxHeight:110,overflowY:"auto"}}>{pieData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2px 0"}}><div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:6,height:6,borderRadius:"50%",background:d.color}}/><span style={{fontSize:10,color:t.sub}}>{d.emoji} {d.name}</span></div><span style={{fontSize:10,fontWeight:700,color:t.text}}>{fmt(d.value)}</span></div>)}</div>
        </div>
      </div>}

      {/* Expense list with fixed badge and inline edit */}
      <div style={{background:t.card,borderRadius:16,padding:"12px",border:`1px solid ${t.border}`}}>
        <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px"}}>Gastos esta quincena</p>
        {/* Fixed first */}
        {period.expenses.filter(e=>e.fixed).length>0&&<>
          <p style={{fontSize:10,fontWeight:700,color:t.accent,margin:"0 0 5px",letterSpacing:1}}>📌 FIJOS</p>
          {period.expenses.filter(e=>e.fixed).map(e=>{const c=CATS[e.category];const isEdit=editId===e.id;return(
            <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>{c?.emoji}</span>
                <div><p style={{fontSize:11,fontWeight:600,color:t.text,margin:0}}>{e.note}</p>
                  <p style={{fontSize:9,color:t.sub,margin:0}}><span style={{color:e.person===1?t.p1:t.p2,fontWeight:600}}>{e.person===1?s.partner1.name:s.partner2.name}</span>{e.shared&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:700}}>50/50</span>}</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {isEdit?<>
                  <input type="text" inputMode="numeric" value={editVal} onChange={ev=>{const r=ev.target.value.replace(/[^\d]/g,"");setEditVal(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:80,padding:"3px 6px",borderRadius:6,border:`2px solid ${t.inputB}`,fontSize:11,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input}} autoFocus onKeyDown={ev=>ev.key==="Enter"&&saveEdit(e.id)} />
                  <button onClick={()=>saveEdit(e.id)} style={{background:"#51CF66",border:"none",borderRadius:5,color:"#fff",padding:"3px 6px",fontSize:10,cursor:"pointer",fontWeight:600}}>✓</button>
                  <button onClick={()=>setEditId(null)} style={{background:s.dark?"#333":"#eee",border:"none",borderRadius:5,color:t.sub,padding:"3px 5px",fontSize:10,cursor:"pointer"}}>✕</button>
                </>:<button onClick={()=>{setEditId(e.id);setEditVal(e.amount.toLocaleString("es-CO"))}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:"#E03131",fontFamily:"'Nunito',sans-serif"}}>{fmt(toCOP(e.amount,e.currency))}</button>}
              </div>
            </div>
          )})}
        </>}
        {/* Variable */}
        {period.expenses.filter(e=>!e.fixed).length>0&&<>
          <p style={{fontSize:10,fontWeight:700,color:"#FFA94D",margin:"8px 0 5px",letterSpacing:1}}>📝 VARIABLES</p>
          {period.expenses.filter(e=>!e.fixed).map(e=>{const c=CATS[e.category];return(
            <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${t.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13}}>{c?.emoji}</span>
                <div><p style={{fontSize:11,fontWeight:600,color:t.text,margin:0}}>{e.note}</p>
                  <p style={{fontSize:9,color:t.sub,margin:0}}><span style={{color:e.person===1?t.p1:t.p2,fontWeight:600}}>{e.person===1?s.partner1.name:s.partner2.name}</span>{e.shared&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:700}}>50/50</span>}</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:11,fontWeight:700,color:"#E03131"}}>{fmt(toCOP(e.amount,e.currency))}</span>
                <button onClick={()=>d({type:"DEL_EXPENSE",p:e.id})} style={{width:20,height:20,borderRadius:5,border:"none",background:s.dark?"#2a1515":"#FFF5F5",color:"#E03131",cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
            </div>
          )})}
        </>}
      </div>
    </div>
  );
}

// ── Fixed Expenses Screen ──
function FixedScreen({s,d,t}) {
  const[editId,setEditId]=useState(null);const[editVal,setEditVal]=useState("");
  const totalFixed=s.fixedExpenses.reduce((a,f)=>a+toCOP(f.amount,f.currency),0);
  const saveEdit=(id)=>{if(editVal){d({type:"EDIT_FIXED",p:{id,amount:Number(editVal.replace(/\./g,""))}});setEditId(null)}};
  return(
    <div style={{padding:"0 16px 110px"}}>
      <div style={{padding:"14px 0 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h2 style={{fontSize:18,fontWeight:700,color:t.text,margin:0}}>📌 Gastos fijos</h2><p style={{fontSize:11,color:t.sub,margin:"2px 0 0"}}>Se copian automáticamente a cada quincena nueva</p></div>
        <button onClick={()=>d({type:"TOGGLE_FIXED_ADD"})} style={{padding:"7px 12px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${t.accent},${t.accent2})`,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>+ Nuevo</button>
      </div>
      <div style={{padding:12,borderRadius:14,background:`${t.accent}08`,border:`1px solid ${t.accent}20`,marginBottom:12,textAlign:"center"}}>
        <p style={{fontSize:11,color:t.sub,margin:"0 0 2px"}}>Total gastos fijos mensuales</p>
        <p style={{fontSize:22,fontWeight:800,color:t.accent,margin:0}}>{fmt(totalFixed)}</p>
      </div>
      <div style={{background:t.card,borderRadius:16,padding:"4px 14px",border:`1px solid ${t.border}`}}>
        {s.fixedExpenses.length===0&&<p style={{textAlign:"center",padding:24,color:t.sub,fontSize:13}}>Agrega tu primer gasto fijo</p>}
        {s.fixedExpenses.map((f,i)=>{const c=CATS[f.category];const isEdit=editId===f.id;return(
          <div key={f.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<s.fixedExpenses.length-1?`1px solid ${t.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:34,height:34,borderRadius:9,background:`${c?.color||"#aaa"}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{c?.emoji}</div>
              <div>
                <p style={{fontSize:12,fontWeight:600,color:t.text,margin:0}}>{f.note}</p>
                <p style={{fontSize:10,color:t.sub,margin:0}}>
                  <span style={{color:f.person===1?t.p1:t.p2,fontWeight:600}}>{f.person===1?s.partner1.name:s.partner2.name}</span>
                  {f.shared&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:700}}>50/50</span>}
                  <span style={{marginLeft:4,fontSize:9,opacity:0.6}}>{f.half===0?"Ambas Q":f.half===1?"Q1 (1-15)":"Q2 (16-31)"}</span>
                </p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {isEdit?<>
                <input type="text" inputMode="numeric" value={editVal} onChange={ev=>{const r=ev.target.value.replace(/[^\d]/g,"");setEditVal(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:85,padding:"4px 6px",borderRadius:6,border:`2px solid ${t.inputB}`,fontSize:12,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input}} autoFocus onKeyDown={ev=>ev.key==="Enter"&&saveEdit(f.id)} />
                <button onClick={()=>saveEdit(f.id)} style={{background:"#51CF66",border:"none",borderRadius:5,color:"#fff",padding:"4px 7px",fontSize:10,cursor:"pointer",fontWeight:600}}>✓</button>
              </>:<button onClick={()=>{setEditId(f.id);setEditVal(f.amount.toLocaleString("es-CO"))}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:t.accent,fontFamily:"'Nunito',sans-serif"}} title="Toca para editar">{fmtC(f.amount,f.currency)}</button>}
              <button onClick={()=>d({type:"DEL_FIXED",p:f.id})} style={{width:22,height:22,borderRadius:6,border:"none",background:s.dark?"#2a1515":"#FFF5F5",color:"#E03131",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

// ── Goals Screen ──
function GoalsScreen({s,d,t}) {
  const[addAmt,setAddAmt]=useState({});
  const addSave=(id)=>{const v=addAmt[id];if(!v)return;const n=Number(v.replace(/\./g,""));const g=s.goals.find(x=>x.id===id);if(g)d({type:"UPDATE_GOAL",p:{id,saved:Math.min(g.saved+n,g.target)}});setAddAmt(p=>({...p,[id]:""}))};
  return(
    <div style={{padding:"0 16px 110px"}}>
      <div style={{padding:"14px 0 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{fontSize:18,fontWeight:700,color:t.text,margin:0}}>🎯 Metas</h2>
        <button onClick={()=>d({type:"TOGGLE_GOAL_ADD"})} style={{padding:"7px 12px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${t.accent},${t.accent2})`,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>+ Nueva</button>
      </div>
      {s.goals.map(g=>{const pct=Math.min(Math.round((g.saved/g.target)*100),100);return(
        <div key={g.id} style={{background:t.card,borderRadius:18,padding:"16px",marginBottom:10,border:`1px solid ${t.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:15,fontWeight:700,color:t.text}}>{g.emoji} {g.name}</span><button onClick={()=>d({type:"DEL_GOAL",p:g.id})} style={{background:"none",border:"none",color:t.sub,cursor:"pointer"}}>✕</button></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:22,fontWeight:800,color:g.color}}>{pct}%</span><span style={{fontSize:11,color:t.sub,alignSelf:"flex-end"}}>{fmt(g.saved)} / {fmt(g.target)}</span></div>
          <div style={{height:8,borderRadius:4,background:s.dark?"#222":"#f0f0f0",overflow:"hidden",marginBottom:10}}><div style={{height:"100%",width:`${pct}%`,borderRadius:4,background:g.color,transition:"width 0.5s"}}/></div>
          <div style={{display:"flex",gap:6}}>
            <input type="text" inputMode="numeric" placeholder="Abonar..." value={addAmt[g.id]||""} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAddAmt(p=>({...p,[g.id]:r?Number(r).toLocaleString("es-CO"):""}))}} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`2px solid ${t.inputB}`,fontSize:12,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} />
            <button onClick={()=>addSave(g.id)} style={{padding:"8px 14px",borderRadius:8,border:"none",background:g.color,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Abonar</button>
          </div>
        </div>
      )})}
    </div>
  );
}

function GoalAddModal({d,t}) {
  const[name,setName]=useState("");const[target,setTarget]=useState("");const[emoji,setEmoji]=useState("🎯");
  const emojis=["🏝️","🚗","🏠","💻","📱","🎓","💍","🛡️","🎮","✈️","🎯","💎"];
  const submit=()=>{if(!name||!target)return;d({type:"ADD_GOAL",p:{id:Date.now(),name,target:Number(target.replace(/\./g,"")),saved:0,emoji,color:["#4DABF7","#51CF66","#F06595","#FFA94D","#845EF7"][Math.floor(Math.random()*5)]}})};
  return(<Overlay onClose={()=>d({type:"TOGGLE_GOAL_ADD"})}><ModalBox t={t}><h2 style={{fontSize:17,fontWeight:700,margin:"0 0 14px",color:t.text}}>Nueva meta</h2><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{emojis.map(e=><button key={e} onClick={()=>setEmoji(e)} style={{width:34,height:34,borderRadius:8,border:emoji===e?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:emoji===e?`${t.accent}15`:t.input,cursor:"pointer",fontSize:16}}>{e}</button>)}</div><input type="text" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",marginBottom:8,color:t.text,background:t.input,boxSizing:"border-box"}} /><input type="text" inputMode="numeric" placeholder="Meta en COP" value={target} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setTarget(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",marginBottom:14,color:t.text,background:t.input,boxSizing:"border-box"}} /><button onClick={submit} style={{width:"100%",padding:13,borderRadius:14,border:"none",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",background:`linear-gradient(135deg,${t.accent},${t.accent2})`}}>Crear meta</button></ModalBox></Overlay>);
}

// ── Settings ──
function Settings({s,d,t}) {
  const[n1,setN1]=useState(s.partner1.name);const[n2,setN2]=useState(s.partner2.name);
  return(
    <div style={{padding:"0 16px 110px"}}>
      <div style={{padding:"14px 0 12px"}}><h2 style={{fontSize:18,fontWeight:700,color:t.text,margin:0}}>Ajustes</h2></div>
      <div style={{background:t.card,borderRadius:16,padding:"4px 16px",marginBottom:12,border:`1px solid ${t.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${t.border}`}}>
          <span style={{fontSize:13,fontWeight:600,color:t.text}}>🌙 Modo oscuro</span>
          <button onClick={()=>d({type:"DARK"})} style={{width:44,height:24,borderRadius:12,border:"none",background:s.dark?t.accent:"#ccc",cursor:"pointer",position:"relative"}}><div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:s.dark?22:2,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/></button>
        </div>
        <div style={{padding:"12px 0",borderBottom:`1px solid ${t.border}`}}>
          <p style={{fontSize:11,fontWeight:600,color:t.sub,margin:"0 0 6px"}}>👫 Nombres</p>
          <div style={{display:"flex",gap:8}}>
            <input type="text" value={n1} onChange={e=>setN1(e.target.value)} onBlur={()=>d({type:"SET_NAMES",p:{n1,n2}})} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.p1,background:t.input,fontWeight:600,boxSizing:"border-box"}} />
            <input type="text" value={n2} onChange={e=>setN2(e.target.value)} onBlur={()=>d({type:"SET_NAMES",p:{n1,n2}})} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.p2,background:t.input,fontWeight:600,boxSizing:"border-box"}} />
          </div>
        </div>
        <button onClick={()=>d({type:"SCREEN",p:"fixed"})} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
          <span style={{fontSize:16}}>📌</span><span style={{fontSize:13,fontWeight:600,color:t.text,fontFamily:"'Nunito',sans-serif",flex:1}}>Gastos fijos</span><span style={{color:t.sub,fontSize:13}}>›</span>
        </button>
      </div>
      <div style={{background:t.card,borderRadius:16,padding:"14px",border:`1px solid ${t.border}`}}>
        <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px"}}>💡 Tips</p>
        {["Configura tus gastos fijos una vez y se copian solos a cada quincena.","Toca el monto de un gasto fijo para editarlo si cambió este mes.","El recibo quincenal divide todo automáticamente entre los dos."].map((x,i)=><p key={i} style={{fontSize:12,color:t.sub,margin:i<2?"0 0 6px":0,lineHeight:1.5}}>• {x}</p>)}
      </div>
      <p style={{textAlign:"center",fontSize:11,color:t.dim,margin:"14px 0"}}>Kashy v3.5 · Partners Edition 💜</p>
    </div>
  );
}

// ── Main ──
export default function Kashy() {
  const[s,d]=useReducer(reducer,initState);
  const t=th(s.dark);

  useEffect(()=>{const data=load("kashy-v35",null);if(data)d({type:"LOAD",p:data});else d({type:"LOAD",p:{}});},[]);
  useEffect(()=>{if(!s.loaded)return;save("kashy-v35",{dark:s.dark,partner1:s.partner1,partner2:s.partner2,fixedExpenses:s.fixedExpenses,periods:s.periods,goals:s.goals,activePeriod:s.activePeriod})},[s.dark,s.partner1,s.partner2,s.fixedExpenses,s.periods,s.goals,s.activePeriod,s.loaded]);

  const nav=[{k:"dashboard",i:"🏠",l:"Inicio"},{k:"fixed",i:"📌",l:"Fijos"},{k:"goals",i:"🎯",l:"Metas"},{k:"settings",i:"⚙️",l:"Ajustes"}];
  const screens={dashboard:<Dashboard s={s} d={d} t={t}/>,fixed:<FixedScreen s={s} d={d} t={t}/>,goals:<GoalsScreen s={s} d={d} t={t}/>,settings:<Settings s={s} d={d} t={t}/>};

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:t.bg,fontFamily:"'Nunito','Segoe UI',sans-serif",position:"relative"}}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{padding:"12px 18px 8px",background:t.card,borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,margin:0,background:`linear-gradient(135deg,${t.accent},${t.accent2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Kashy</h1>
          <p style={{fontSize:10,color:t.dim,margin:0}}>{s.partner1.avatar} {s.partner1.name} & {s.partner2.avatar} {s.partner2.name}</p>
        </div>
        <button onClick={()=>d({type:"DARK"})} style={{width:32,height:32,borderRadius:"50%",background:t.input,border:`1px solid ${t.inputB}`,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.dark?"☀️":"🌙"}</button>
      </div>
      <div key={s.screen} style={{animation:"fadeUp 0.2s ease"}}>{screens[s.screen]}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:t.card,borderTop:`1px solid ${t.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"5px 0 env(safe-area-inset-bottom,6px)",zIndex:80}}>
        {nav.map(n=><button key={n.k} onClick={()=>d({type:"SCREEN",p:n.k})} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"5px 0"}}><span style={{fontSize:17,filter:s.screen===n.k?"none":"grayscale(100%)",opacity:s.screen===n.k?1:0.35}}>{n.i}</span><span style={{fontSize:9,fontWeight:s.screen===n.k?700:500,color:s.screen===n.k?t.accent:t.dim,fontFamily:"'Nunito',sans-serif"}}>{n.l}</span></button>)}
      </div>
      {s.showAdd&&<AddExpenseModal s={s} d={d} t={t} pid={s.activePeriod}/>}
      {s.showAddIncome&&<AddIncomeModal s={s} d={d} t={t} pid={s.activePeriod}/>}
      {s.showFixedAdd&&<AddFixedModal s={s} d={d} t={t}/>}
      {s.showGenerate&&<GenerateModal s={s} d={d} t={t}/>}
      {s.showGoalAdd&&<GoalAddModal d={d} t={t}/>}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}input:focus,select:focus{outline:none;border-color:${t.accent}!important}`}</style>
    </div>
  );
}
