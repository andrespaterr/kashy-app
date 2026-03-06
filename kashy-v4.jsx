import { useState, useEffect, useReducer } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  Home, PiggyBank, Settings, Pin, Plus, X, ChevronDown, ChevronRight, Moon, Sun, Users, User,
  ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, TrendingUp, Receipt, ShoppingCart,
  Zap, Gift, Package, Heart, Car, GraduationCap, Smartphone, Tv, Shield, Building,
  UtensilsCrossed, Gamepad2, Dog, Shirt, Lightbulb, DollarSign, Target, FileText,
  AlertTriangle, Check, Trash2, Edit3, Download, Share2, Lock, Crown, ToggleLeft, ToggleRight,
  Coffee, Banknote, Briefcase, Store, CircleDollarSign, HandCoins
} from "lucide-react";

// ── Icon mapping ──
const CAT_ICONS = {
  arriendo: Building, servicios: Lightbulb, mercado: ShoppingCart, transporte: Car,
  salud: Heart, educacion: GraduationCap, celular: Smartphone, ocio: Gamepad2,
  restaurantes: UtensilsCrossed, mascotas: Dog, ropa: Shirt, suscripciones: Tv,
  deudas: CreditCard, ahorro: PiggyBank, seguros: Shield, imprevistos: Zap,
  regalos: Gift, otros: Package,
};
const INC_ICONS = { salario: Briefcase, freelance: Banknote, negocio: Store, otro_ingreso: CircleDollarSign };

// ── Config ──
const CURRENCIES = { COP:{symbol:"$",rate:1}, USD:{symbol:"US$",rate:4150}, EUR:{symbol:"€",rate:4480} };
const CATS = {
  arriendo:{label:"Arriendo",group:"Fijos",color:"#FF6B6B"},
  servicios:{label:"Servicios",group:"Fijos",color:"#FFA94D"},
  mercado:{label:"Mercado",group:"Fijos",color:"#FBBF24"},
  transporte:{label:"Transporte",group:"Fijos",color:"#34D399"},
  salud:{label:"Salud",group:"Fijos",color:"#60A5FA"},
  educacion:{label:"Educación",group:"Fijos",color:"#818CF8"},
  celular:{label:"Celular/Internet",group:"Fijos",color:"#A78BFA"},
  ocio:{label:"Ocio",group:"Variable",color:"#F472B6"},
  restaurantes:{label:"Restaurantes",group:"Variable",color:"#EC4899"},
  mascotas:{label:"Mascotas",group:"Variable",color:"#2DD4BF"},
  ropa:{label:"Ropa/Compras",group:"Variable",color:"#22D3EE"},
  suscripciones:{label:"Suscripciones",group:"Variable",color:"#8B5CF6"},
  deudas:{label:"Deudas/Créditos",group:"Financiero",color:"#F87171"},
  ahorro:{label:"Ahorro",group:"Financiero",color:"#4ADE80"},
  seguros:{label:"Seguros",group:"Financiero",color:"#38BDF8"},
  imprevistos:{label:"Imprevistos",group:"Otros",color:"#FACC15"},
  regalos:{label:"Regalos",group:"Otros",color:"#FB923C"},
  otros:{label:"Otros",group:"Otros",color:"#94A3B8"},
};
const INC_CATS = { salario:{label:"Salario",color:"#4ADE80"}, freelance:{label:"Freelance",color:"#34D399"}, negocio:{label:"Negocio",color:"#2DD4BF"}, otro_ingreso:{label:"Otro",color:"#22D3EE"} };
const MONTHS=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const fmt=(n)=>"$"+Math.abs(n).toLocaleString("es-CO",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtC=(n,c="COP")=>(CURRENCIES[c]?.symbol||"$")+" "+Math.abs(n).toLocaleString("es-CO",{minimumFractionDigits:0,maximumFractionDigits:c==="COP"?0:2});
const toCOP=(a,c)=>Math.round(a*(CURRENCIES[c]?.rate||1));
const fullMonth=()=>MONTHS[new Date().getMonth()];

// ── Category Icon Component ──
function CatIcon({cat,size=18,type="expense"}) {
  const IconComp = type==="expense" ? (CAT_ICONS[cat]||Package) : (INC_ICONS[cat]||CircleDollarSign);
  const color = type==="expense" ? (CATS[cat]?.color||"#94A3B8") : (INC_CATS[cat]?.color||"#4ADE80");
  return (
    <div style={{width:size+12,height:size+12,borderRadius:size>16?12:8,background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <IconComp size={size} color={color} strokeWidth={2}/>
    </div>
  );
}

// ── Storage ──
function loadStore(k,fb){try{const r=localStorage.getItem(k);return r?JSON.parse(r):fb}catch{return fb}}
function saveStore(k,d){try{localStorage.setItem(k,JSON.stringify(d))}catch(e){console.error(e)}}

// ── Sample Data ──
const SAMPLE_FIXED=[
  {id:1,category:"arriendo",amount:309000,note:"Arriendo",person:1,shared:true,currency:"COP",half:0},
  {id:2,category:"arriendo",amount:309000,note:"Arriendo",person:2,shared:true,currency:"COP",half:0},
  {id:3,category:"celular",amount:37500,note:"Internet",person:1,shared:true,currency:"COP",half:0},
  {id:4,category:"celular",amount:37500,note:"Internet",person:2,shared:true,currency:"COP",half:0},
  {id:5,category:"suscripciones",amount:55000,note:"Netflix + Spotify",person:1,shared:true,currency:"COP",half:0},
  {id:6,category:"deudas",amount:250000,note:"Cuota crédito",person:1,shared:false,currency:"COP",half:0},
];

const SAMPLE_PERIODS=[
  {id:1,month:"Enero",half:1,label:"Ene 1-15",incomes:[{id:101,person:1,amount:2900000,note:"Salario",category:"salario",currency:"COP"},{id:102,person:2,amount:2900000,note:"Salario",category:"salario",currency:"COP"}],expenses:[{id:201,category:"mercado",amount:300000,note:"Mercado",person:1,shared:true,currency:"COP",fixed:false},{id:202,category:"ropa",amount:100000,note:"Ropa classic jean",person:1,shared:false,currency:"COP",fixed:false},{id:203,category:"restaurantes",amount:150000,note:"Rappi",person:1,shared:true,currency:"COP",fixed:false},{id:204,category:"ocio",amount:100000,note:"Guitarra",person:1,shared:false,currency:"COP",fixed:false},{id:205,category:"mascotas",amount:250000,note:"Comida mascota",person:2,shared:true,currency:"COP",fixed:false},{id:206,category:"mercado",amount:300000,note:"Mercado",person:2,shared:true,currency:"COP",fixed:false},{id:207,category:"restaurantes",amount:150000,note:"Rappi",person:2,shared:true,currency:"COP",fixed:false},{id:208,category:"ocio",amount:271600,note:"Guitarra",person:2,shared:false,currency:"COP",fixed:false}]},
  {id:2,month:"Enero",half:2,label:"Ene 16-31",incomes:[{id:301,person:1,amount:3200000,note:"Salario",category:"salario",currency:"COP"},{id:302,person:2,amount:3088000,note:"Salario",category:"salario",currency:"COP"}],expenses:[{id:401,category:"arriendo",amount:309000,note:"Arriendo",person:1,shared:true,currency:"COP",fixed:true},{id:402,category:"arriendo",amount:309000,note:"Arriendo",person:2,shared:true,currency:"COP",fixed:true},{id:403,category:"celular",amount:37500,note:"Internet",person:1,shared:true,currency:"COP",fixed:true},{id:404,category:"celular",amount:37500,note:"Internet",person:2,shared:true,currency:"COP",fixed:true},{id:405,category:"suscripciones",amount:55000,note:"Netflix + Spotify",person:1,shared:true,currency:"COP",fixed:true},{id:406,category:"deudas",amount:250000,note:"Cuota crédito",person:1,shared:false,currency:"COP",fixed:true},{id:407,category:"servicios",amount:150000,note:"Luz",person:1,shared:true,currency:"COP",fixed:false},{id:408,category:"servicios",amount:80000,note:"Agua",person:1,shared:true,currency:"COP",fixed:false},{id:409,category:"mercado",amount:300000,note:"Mercado",person:1,shared:true,currency:"COP",fixed:false},{id:410,category:"restaurantes",amount:150000,note:"Rappi",person:1,shared:true,currency:"COP",fixed:false},{id:411,category:"mascotas",amount:300000,note:"Comida mascota",person:2,shared:true,currency:"COP",fixed:false},{id:412,category:"mercado",amount:300000,note:"Mercado",person:2,shared:true,currency:"COP",fixed:false},{id:413,category:"servicios",amount:110000,note:"Luz",person:2,shared:true,currency:"COP",fixed:false},{id:414,category:"restaurantes",amount:150000,note:"Rappi",person:2,shared:true,currency:"COP",fixed:false},{id:415,category:"otros",amount:500000,note:"NU",person:2,shared:false,currency:"COP",fixed:false}]},
];

// ── Reducer ──
const initState={
  screen:"dashboard",dark:false,loaded:false,mode:"partners",
  partner1:{name:"Andrés"},partner2:{name:"Mila"},
  fixedExpenses:SAMPLE_FIXED,periods:SAMPLE_PERIODS,
  goals:[{id:1,name:"Vacaciones San Andrés",target:2500000,saved:850000,icon:"✈️",color:"#60A5FA"}],
  activePeriod:2,showAdd:false,showAddIncome:false,showGoalAdd:false,showFixedAdd:false,showGenerate:false,
};

function reducer(s,a){switch(a.type){
  case"LOAD":return{...s,...a.p,loaded:true};case"SCREEN":return{...s,screen:a.p};case"DARK":return{...s,dark:!s.dark};
  case"SET_MODE":return{...s,mode:a.p};case"SET_NAMES":return{...s,partner1:{...s.partner1,name:a.p.n1},partner2:{...s.partner2,name:a.p.n2}};
  case"ADD_FIXED":return{...s,fixedExpenses:[...s.fixedExpenses,a.p],showFixedAdd:false};
  case"DEL_FIXED":return{...s,fixedExpenses:s.fixedExpenses.filter(f=>f.id!==a.p)};
  case"EDIT_FIXED":return{...s,fixedExpenses:s.fixedExpenses.map(f=>f.id===a.p.id?{...f,amount:a.p.amount}:f)};
  case"TOGGLE_FIXED_ADD":return{...s,showFixedAdd:!s.showFixedAdd};
  case"ADD_PERIOD":return{...s,periods:[...s.periods,a.p],activePeriod:a.p.id,showGenerate:false};
  case"ADD_EXPENSE":{const ps=s.periods.map(p=>p.id===a.p.pid?{...p,expenses:[...p.expenses,a.p.exp]}:p);return{...s,periods:ps,showAdd:false};}
  case"DEL_EXPENSE":{const ps=s.periods.map(p=>({...p,expenses:p.expenses.filter(e=>e.id!==a.p)}));return{...s,periods:ps};}
  case"EDIT_EXPENSE_AMOUNT":{const ps=s.periods.map(p=>({...p,expenses:p.expenses.map(e=>e.id===a.p.id?{...e,amount:a.p.amount}:e)}));return{...s,periods:ps};}
  case"ADD_INCOME":{const ps=s.periods.map(p=>p.id===a.p.pid?{...p,incomes:[...p.incomes,a.p.inc]}:p);return{...s,periods:ps,showAddIncome:false};}
  case"SET_PERIOD":return{...s,activePeriod:a.p};
  case"TOGGLE_ADD":return{...s,showAdd:!s.showAdd};case"TOGGLE_ADD_INC":return{...s,showAddIncome:!s.showAddIncome};
  case"TOGGLE_GENERATE":return{...s,showGenerate:!s.showGenerate};
  case"ADD_GOAL":return{...s,goals:[...s.goals,a.p],showGoalAdd:false};
  case"UPDATE_GOAL":return{...s,goals:s.goals.map(g=>g.id===a.p.id?{...g,saved:a.p.saved}:g)};
  case"DEL_GOAL":return{...s,goals:s.goals.filter(g=>g.id!==a.p)};
  case"TOGGLE_GOAL_ADD":return{...s,showGoalAdd:!s.showGoalAdd};
  default:return s;
}}

// ── Theme ──
const th=(d)=>({
  bg:d?"#0B0B12":"#F7F8FC",card:d?"#161625":"#FFFFFF",border:d?"rgba(255,255,255,0.06)":"#EDF0F7",
  text:d?"#EAEAEA":"#111827",sub:d?"#777":"#6B7280",dim:d?"#444":"#D1D5DB",
  input:d?"#1E1E32":"#F3F4F6",inputB:d?"#2A2A44":"#E5E7EB",
  accent:"#7C3AED",accent2:"#A78BFA",accentBg:d?"#7C3AED15":"#7C3AED08",
  p1:"#F87171",p2:"#2DD4BF",
  success:"#4ADE80",danger:"#F87171",warning:"#FBBF24",
});

// ── Shared UI ──
const Overlay=({children,onClose})=><div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}><div style={{width:"100%",maxWidth:430}} onClick={e=>e.stopPropagation()}>{children}</div></div>;
const Modal=({children,t})=><div style={{background:t.card,borderRadius:"28px 28px 0 0",padding:"24px 20px 34px",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -10px 40px rgba(0,0,0,0.15)"}}>{children}</div>;
const Btn=({children,onClick,bg,color="#fff",full,small,style:sx})=><button onClick={onClick} style={{padding:small?"8px 16px":"13px 20px",borderRadius:small?10:14,border:"none",background:bg||"linear-gradient(135deg,#7C3AED,#A78BFA)",color,cursor:"pointer",fontSize:small?12:14,fontWeight:700,fontFamily:"'Nunito',sans-serif",width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,...sx}}>{children}</button>;

function CatPill({k,active,onClick,t,type="expense"}){
  const c=type==="expense"?CATS[k]:INC_CATS[k]; const Icon=type==="expense"?(CAT_ICONS[k]||Package):(INC_ICONS[k]||CircleDollarSign);
  return <button onClick={onClick} style={{padding:"6px 12px",borderRadius:20,border:active?`2px solid ${c.color}`:`1.5px solid ${t.inputB}`,background:active?`${c.color}15`:t.input,cursor:"pointer",fontSize:11,fontFamily:"'Nunito',sans-serif",fontWeight:active?700:500,color:active?c.color:t.sub,display:"flex",alignItems:"center",gap:4}}><Icon size={13} strokeWidth={2.2}/>{c.label}</button>;
}

function PersonPicker({person,setPerson,s,t}){
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
    {[{p:1,n:s.partner1.name,c:t.p1},{p:2,n:s.partner2.name,c:t.p2}].map(x=>(
      <button key={x.p} onClick={()=>setPerson(x.p)} style={{padding:10,borderRadius:12,border:person===x.p?`2px solid ${x.c}`:`2px solid ${t.inputB}`,background:person===x.p?`${x.c}12`:t.input,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:person===x.p?x.c:t.sub,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
        <User size={14}/>{x.n}
      </button>
    ))}
  </div>;
}

function SharedPicker({shared,setShared,t}){
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
    <button onClick={()=>setShared(true)} style={{padding:9,borderRadius:10,border:shared?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:shared?t.accentBg:t.input,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:shared?t.accent:t.sub,display:"flex",alignItems:"center",gap:5,justifyContent:"center"}}><Users size={14}/>Compartido</button>
    <button onClick={()=>setShared(false)} style={{padding:9,borderRadius:10,border:!shared?`2px solid #FFA94D`:`2px solid ${t.inputB}`,background:!shared?"#FFA94D12":t.input,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:!shared?"#FFA94D":t.sub,display:"flex",alignItems:"center",gap:5,justifyContent:"center"}}><User size={14}/>Individual</button>
  </div>;
}

// ── Modals ──
function AddExpenseModal({s,d,t,pid}){
  const[cat,setCat]=useState("mercado");const[amount,setAmount]=useState("");const[note,setNote]=useState("");
  const[person,setPerson]=useState(1);const[shared,setShared]=useState(true);const[cur,setCur]=useState("COP");
  const submit=()=>{if(!amount)return;d({type:"ADD_EXPENSE",p:{pid,exp:{id:Date.now(),category:cat,amount:Number(amount.replace(/\./g,"")),note:note||CATS[cat]?.label,person:s.mode==="solo"?1:person,shared:s.mode==="solo"?false:shared,currency:cur,fixed:false}}})};
  return(<Overlay onClose={()=>d({type:"TOGGLE_ADD"})}><Modal t={t}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h2 style={{fontSize:17,fontWeight:700,margin:0,color:t.text,display:"flex",alignItems:"center",gap:8}}><ArrowDownCircle size={20} color={t.danger}/>Nuevo gasto</h2>
      <button onClick={()=>d({type:"TOGGLE_ADD"})} style={{width:30,height:30,borderRadius:"50%",border:"none",background:t.input,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={14} color={t.sub}/></button>
    </div>
    {s.mode==="partners"&&<><label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:5}}>¿Quién pagó?</label><PersonPicker person={person} setPerson={setPerson} s={s} t={t}/>
    <label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:5}}>Tipo de gasto</label><SharedPicker shared={shared} setShared={setShared} t={t}/></>}
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      <div style={{flex:1}}><label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:4}}>Monto</label>
        <input type="text" inputMode="numeric" placeholder="150.000" value={amount} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAmount(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:16,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} autoFocus/>
      </div>
      <div style={{width:80}}><label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:4}}>Moneda</label>
        <select value={cur} onChange={e=>setCur(e.target.value)} style={{width:"100%",padding:"11px 6px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,cursor:"pointer"}}>{Object.keys(CURRENCIES).map(k=><option key={k} value={k}>{k}</option>)}</select>
      </div>
    </div>
    <label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:6}}>Categoría</label>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{Object.keys(CATS).map(k=><CatPill key={k} k={k} active={cat===k} onClick={()=>setCat(k)} t={t}/>)}</div>
    <input type="text" placeholder="Nota (opcional)" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",marginBottom:16,color:t.text,background:t.input,boxSizing:"border-box"}}/>
    <Btn onClick={submit} bg="linear-gradient(135deg,#F87171,#EF4444)" full>Registrar gasto</Btn>
  </Modal></Overlay>);
}

function AddIncomeModal({s,d,t,pid}){
  const[person,setPerson]=useState(1);const[amount,setAmount]=useState("");const[note,setNote]=useState("");const[cat,setCat]=useState("salario");const[cur,setCur]=useState("COP");
  const submit=()=>{if(!amount)return;d({type:"ADD_INCOME",p:{pid,inc:{id:Date.now(),person:s.mode==="solo"?1:person,amount:Number(amount.replace(/\./g,"")),note:note||INC_CATS[cat]?.label,category:cat,currency:cur}}})};
  return(<Overlay onClose={()=>d({type:"TOGGLE_ADD_INC"})}><Modal t={t}>
    <h2 style={{fontSize:17,fontWeight:700,margin:"0 0 14px",color:t.text,display:"flex",alignItems:"center",gap:8}}><ArrowUpCircle size={20} color={t.success}/>Nuevo ingreso</h2>
    {s.mode==="partners"&&<PersonPicker person={person} setPerson={setPerson} s={s} t={t}/>}
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      <input type="text" inputMode="numeric" placeholder="Monto" value={amount} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAmount(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:16,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} autoFocus/>
      <select value={cur} onChange={e=>setCur(e.target.value)} style={{width:80,padding:"11px 6px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,cursor:"pointer"}}>{Object.keys(CURRENCIES).map(k=><option key={k} value={k}>{k}</option>)}</select>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{Object.keys(INC_CATS).map(k=><CatPill key={k} k={k} active={cat===k} onClick={()=>setCat(k)} t={t} type="income"/>)}</div>
    <input type="text" placeholder="Nota" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",marginBottom:16,color:t.text,background:t.input,boxSizing:"border-box"}}/>
    <Btn onClick={submit} bg="linear-gradient(135deg,#4ADE80,#22C55E)" full>Registrar ingreso</Btn>
  </Modal></Overlay>);
}

function GenerateModal({s,d,t}){
  const last=s.periods[s.periods.length-1];
  const nh=last?(last.half===1?2:1):1;
  const nmi=last?(last.half===2?(MONTHS.indexOf(last.month)+1)%12:MONTHS.indexOf(last.month)):new Date().getMonth();
  const nm=MONTHS[nmi];const nl=`${nm.slice(0,3)} ${nh===1?"1-15":"16-"+new Date(2026,nmi+1,0).getDate()}`;
  const fixed=s.fixedExpenses.filter(f=>f.half===0||f.half===nh);
  const totalF=fixed.reduce((a,f)=>a+toCOP(f.amount,f.currency),0);
  const gen=()=>{d({type:"ADD_PERIOD",p:{id:Date.now(),month:nm,half:nh,label:nl,incomes:[],expenses:fixed.map(f=>({id:Date.now()+Math.random()*10000|0,category:f.category,amount:f.amount,note:f.note,person:f.person,shared:f.shared,currency:f.currency,fixed:true}))}})};
  return(<Overlay onClose={()=>d({type:"TOGGLE_GENERATE"})}><Modal t={t}>
    <h2 style={{fontSize:17,fontWeight:700,margin:"0 0 4px",color:t.text,display:"flex",alignItems:"center",gap:8}}><FileText size={20} color={t.accent}/>Generar quincena</h2>
    <p style={{fontSize:13,color:t.sub,margin:"0 0 16px"}}>Se creará: <b style={{color:t.accent}}>{nl}</b></p>
    <div style={{padding:14,borderRadius:14,background:t.accentBg,border:`1px solid ${t.accent}20`,marginBottom:16}}>
      <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px",display:"flex",alignItems:"center",gap:6}}><Pin size={14} color={t.accent}/>Gastos fijos a copiar:</p>
      {fixed.length===0&&<p style={{fontSize:12,color:t.sub,margin:0,fontStyle:"italic"}}>No hay gastos fijos. Configúralos primero.</p>}
      {fixed.map(f=><div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${t.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><CatIcon cat={f.category} size={14}/><span style={{fontSize:11,color:t.text}}>{f.note}</span>
          <span style={{fontSize:9,color:f.person===1?t.p1:t.p2,fontWeight:600}}>{f.person===1?s.partner1.name:s.partner2.name}</span>
          {f.shared&&<span style={{fontSize:8,padding:"2px 5px",borderRadius:6,background:t.accentBg,color:t.accent,fontWeight:700}}>50/50</span>}
        </div><span style={{fontSize:11,fontWeight:700,color:t.text}}>{fmtC(f.amount,f.currency)}</span>
      </div>)}
      {fixed.length>0&&<div style={{display:"flex",justifyContent:"space-between",paddingTop:8,marginTop:4}}><span style={{fontSize:12,fontWeight:700,color:t.text}}>Total</span><span style={{fontSize:13,fontWeight:800,color:t.accent}}>{fmt(totalF)}</span></div>}
    </div>
    <Btn onClick={gen} full>Generar {nl}</Btn>
  </Modal></Overlay>);
}

function AddFixedModal({s,d,t}){
  const[cat,setCat]=useState("arriendo");const[amount,setAmount]=useState("");const[note,setNote]=useState("");
  const[person,setPerson]=useState(1);const[shared,setShared]=useState(true);const[cur,setCur]=useState("COP");const[half,setHalf]=useState(0);
  const submit=()=>{if(!amount)return;d({type:"ADD_FIXED",p:{id:Date.now(),category:cat,amount:Number(amount.replace(/\./g,"")),note:note||CATS[cat]?.label,person,shared,currency:cur,half}})};
  return(<Overlay onClose={()=>d({type:"TOGGLE_FIXED_ADD"})}><Modal t={t}>
    <h2 style={{fontSize:17,fontWeight:700,margin:"0 0 14px",color:t.text,display:"flex",alignItems:"center",gap:8}}><Pin size={20} color={t.accent}/>Nuevo gasto fijo</h2>
    {s.mode==="partners"&&<><PersonPicker person={person} setPerson={setPerson} s={s} t={t}/><SharedPicker shared={shared} setShared={setShared} t={t}/></>}
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      <input type="text" inputMode="numeric" placeholder="Monto fijo" value={amount} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAmount(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:16,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}} autoFocus/>
      <select value={cur} onChange={e=>setCur(e.target.value)} style={{width:80,padding:"11px 6px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,cursor:"pointer"}}>{Object.keys(CURRENCIES).map(k=><option key={k} value={k}>{k}</option>)}</select>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{Object.keys(CATS).map(k=><CatPill key={k} k={k} active={cat===k} onClick={()=>setCat(k)} t={t}/>)}</div>
    <input type="text" placeholder="Nota" value={note} onChange={e=>setNote(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",marginBottom:12,color:t.text,background:t.input,boxSizing:"border-box"}}/>
    <label style={{fontSize:11,fontWeight:600,color:t.sub,display:"block",marginBottom:5}}>¿En cuál quincena?</label>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16}}>
      {[{v:0,l:"Ambas"},{v:1,l:"1ra (1-15)"},{v:2,l:"2da (16-31)"}].map(x=><button key={x.v} onClick={()=>setHalf(x.v)} style={{padding:8,borderRadius:10,border:half===x.v?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:half===x.v?t.accentBg:t.input,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:half===x.v?t.accent:t.sub}}>{x.l}</button>)}
    </div>
    <Btn onClick={submit} full>Agregar gasto fijo</Btn>
  </Modal></Overlay>);
}

function GoalAddModal({d,t}){
  const[name,setName]=useState("");const[target,setTarget]=useState("");
  const submit=()=>{if(!name||!target)return;d({type:"ADD_GOAL",p:{id:Date.now(),name,target:Number(target.replace(/\./g,"")),saved:0,color:["#60A5FA","#4ADE80","#F472B6","#FBBF24","#A78BFA"][Math.floor(Math.random()*5)]}})};
  return(<Overlay onClose={()=>d({type:"TOGGLE_GOAL_ADD"})}><Modal t={t}>
    <h2 style={{fontSize:17,fontWeight:700,margin:"0 0 14px",color:t.text,display:"flex",alignItems:"center",gap:8}}><Target size={20} color={t.accent}/>Nueva meta</h2>
    <input type="text" placeholder="Nombre (ej: Vacaciones)" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",marginBottom:10,color:t.text,background:t.input,boxSizing:"border-box"}}/>
    <input type="text" inputMode="numeric" placeholder="Meta en COP" value={target} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setTarget(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:`2px solid ${t.inputB}`,fontSize:14,fontFamily:"'Nunito',sans-serif",marginBottom:16,color:t.text,background:t.input,boxSizing:"border-box"}}/>
    <Btn onClick={submit} full>Crear meta</Btn>
  </Modal></Overlay>);
}

// ── Receipt ──
function ReceiptCard({period,s,t}){
  const[show,setShow]=useState(false);if(!period||s.mode==="solo")return null;
  const p1=s.partner1,p2=s.partner2;
  const inc1=period.incomes.filter(i=>i.person===1).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const inc2=period.incomes.filter(i=>i.person===2).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const shared=period.expenses.filter(e=>e.shared);const ind1=period.expenses.filter(e=>!e.shared&&e.person===1);const ind2=period.expenses.filter(e=>!e.shared&&e.person===2);
  const ts=shared.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);const hs=Math.round(ts/2);
  const ti1=ind1.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);const ti2=ind2.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const t1=hs+ti1,t2=hs+ti2,r1=inc1-t1,r2=inc2-t2;
  if(!show)return<button onClick={()=>setShow(true)} style={{width:"100%",padding:14,borderRadius:16,border:`2px dashed ${t.accent}33`,background:t.accentBg,cursor:"pointer",fontSize:13,fontWeight:700,color:t.accent,fontFamily:"'Nunito',sans-serif",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Receipt size={16}/>Ver recibo quincenal</button>;
  return(<div style={{background:t.card,borderRadius:20,padding:"20px 18px",marginBottom:12,border:`1px solid ${t.border}`,boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
    <div style={{textAlign:"center",marginBottom:14,borderBottom:`2px dashed ${t.border}`,paddingBottom:12}}>
      <p style={{fontSize:20,fontWeight:800,color:t.accent,margin:"0 0 2px"}}>Kashy</p>
      <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 2px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Receipt size={15}/>Recibo Quincenal</p>
      <p style={{fontSize:12,color:t.sub,margin:0}}>{period.label} · {period.month} 2026</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {[{p:p1,inc:inc1,c:t.p1},{p:p2,inc:inc2,c:t.p2}].map((x,i)=><div key={i} style={{padding:10,borderRadius:12,background:`${x.c}08`,border:`1px solid ${x.c}22`}}><p style={{fontSize:11,color:t.sub,margin:"0 0 2px"}}>{x.p.name}</p><p style={{fontSize:15,fontWeight:800,color:x.c,margin:0,display:"flex",alignItems:"center",gap:4}}><ArrowUpCircle size={14}/>{fmt(x.inc)}</p></div>)}
    </div>
    <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 6px",display:"flex",alignItems:"center",gap:6}}><Users size={14} color={t.accent}/>Compartidos</p>
    {shared.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${t.border}`}}><div style={{display:"flex",alignItems:"center",gap:5}}><CatIcon cat={e.category} size={12}/><span style={{fontSize:11,color:t.sub}}>{e.note}{e.fixed&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:700}}>FIJO</span>}</span></div><span style={{fontSize:11,fontWeight:600,color:t.text}}>{fmt(toCOP(e.amount,e.currency))}</span></div>)}
    <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",margin:"3px 0"}}><span style={{fontSize:12,fontWeight:700,color:t.text}}>Total compartido</span><span style={{fontSize:12,fontWeight:800,color:t.accent}}>{fmt(ts)}</span></div>
    <p style={{fontSize:10,color:t.sub,textAlign:"center",fontStyle:"italic",margin:"0 0 10px"}}>Cada uno: {fmt(hs)}</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      {[{p:p1,items:ind1,total:ti1,c:t.p1},{p:p2,items:ind2,total:ti2,c:t.p2}].map((x,i)=><div key={i}><p style={{fontSize:11,fontWeight:700,color:x.c,margin:"0 0 4px"}}>{x.p.name} — Individual</p>
        {x.items.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}><span style={{fontSize:10,color:t.sub,display:"flex",alignItems:"center",gap:3}}><CatIcon cat={e.category} size={10}/>{e.note}</span><span style={{fontSize:10,fontWeight:600,color:t.text}}>{fmt(toCOP(e.amount,e.currency))}</span></div>)}
        <div style={{borderTop:`1px solid ${t.border}`,marginTop:3,paddingTop:3,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,fontWeight:700}}>Total</span><span style={{fontSize:10,fontWeight:700,color:x.c}}>{fmt(x.total)}</span></div>
      </div>)}
    </div>
    <div style={{borderTop:`2px dashed ${t.border}`,paddingTop:12}}>
      <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><TrendingUp size={14} color={t.accent}/>Resumen</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{p:p1,inc:inc1,tot:t1,rem:r1,c:t.p1},{p:p2,inc:inc2,tot:t2,rem:r2,c:t.p2}].map((x,i)=><div key={i} style={{padding:10,borderRadius:12,background:`${x.c}08`,border:`1px solid ${x.c}22`,textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,color:t.text,margin:"0 0 2px"}}>{x.p.name}</p>
          <p style={{fontSize:9,color:t.sub,margin:0}}>Gastos: {fmt(x.tot)}</p>
          <p style={{fontSize:18,fontWeight:800,color:x.rem>=0?t.success:t.danger,margin:"3px 0 0"}}>{x.rem>=0?"":"−"}{fmt(x.rem)}</p>
          <p style={{fontSize:9,color:t.sub,margin:0}}>{x.rem>=0?"disponible":"déficit"}</p>
        </div>)}
      </div>
    </div>
    <button onClick={()=>setShow(false)} style={{width:"100%",marginTop:12,padding:9,borderRadius:10,border:`1px solid ${t.border}`,background:t.input,cursor:"pointer",fontSize:11,fontWeight:600,color:t.sub,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><X size={12}/>Cerrar</button>
  </div>);
}

// ── Dashboard ──
function Dashboard({s,d,t}){
  const period=s.periods.find(p=>p.id===s.activePeriod)||s.periods[s.periods.length-1];
  if(!period)return<div style={{padding:40,textAlign:"center"}}><FileText size={48} color={t.dim}/><p style={{color:t.sub,margin:"12px 0"}}>Genera tu primera quincena</p><Btn onClick={()=>d({type:"TOGGLE_GENERATE"})}>Generar quincena</Btn></div>;
  const[editId,setEditId]=useState(null);const[editVal,setEditVal]=useState("");
  const inc1=period.incomes.filter(i=>i.person===1).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const inc2=period.incomes.filter(i=>i.person===2).reduce((a,i)=>a+toCOP(i.amount,i.currency),0);
  const totalInc=s.mode==="partners"?inc1+inc2:inc1;
  const totalExp=period.expenses.reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const fixedT=period.expenses.filter(e=>e.fixed).reduce((a,e)=>a+toCOP(e.amount,e.currency),0);
  const balance=totalInc-totalExp;
  const byCat={};period.expenses.forEach(e=>{byCat[e.category]=(byCat[e.category]||0)+toCOP(e.amount,e.currency)});
  const pieData=Object.entries(byCat).map(([k,v])=>({name:CATS[k]?.label||k,value:v,color:CATS[k]?.color||"#94A3B8",cat:k})).sort((a,b)=>b.value-a.value);
  const saveEdit=(id)=>{if(editVal){d({type:"EDIT_EXPENSE_AMOUNT",p:{id,amount:Number(editVal.replace(/\./g,""))}});setEditId(null)}};

  return(<div style={{padding:"0 16px 110px"}}>
    {/* Period tabs */}
    <div style={{display:"flex",gap:6,padding:"10px 0",alignItems:"center",overflowX:"auto",scrollbarWidth:"none"}}>
      {s.periods.map(p=><button key={p.id} onClick={()=>d({type:"SET_PERIOD",p:p.id})} style={{padding:"7px 14px",borderRadius:10,border:s.activePeriod===p.id?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:s.activePeriod===p.id?t.accentBg:t.input,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Nunito',sans-serif",color:s.activePeriod===p.id?t.accent:t.sub,whiteSpace:"nowrap",flexShrink:0}}>{p.label}</button>)}
      <button onClick={()=>d({type:"TOGGLE_GENERATE"})} style={{padding:"7px 14px",borderRadius:10,border:`2px dashed ${t.accent}44`,background:"transparent",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Nunito',sans-serif",color:t.accent,whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:4}}><Plus size={12}/>Quincena</button>
    </div>
    {/* Balance */}
    <div style={{padding:"20px 18px",borderRadius:22,background:"linear-gradient(135deg,#1E1B4B,#312E81,#4338CA)",color:"#fff",marginBottom:14,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
      <div style={{position:"absolute",bottom:-20,left:"30%",width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.03)"}}/>
      <p style={{fontSize:11,opacity:0.5,margin:"0 0 4px",letterSpacing:1,display:"flex",alignItems:"center",gap:4}}><Wallet size={12}/>{period.label} · {period.month}</p>
      <p style={{fontSize:30,fontWeight:800,margin:"0 0 14px",color:balance>=0?"#86EFAC":"#FCA5A5"}}>{fmt(balance)}</p>
      <div style={{display:"grid",gridTemplateColumns:s.mode==="partners"?"1fr 1fr 1fr":"1fr 1fr",gap:8}}>
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"8px 10px"}}><p style={{fontSize:8,opacity:0.4,letterSpacing:1,margin:0}}>INGRESOS</p><p style={{fontSize:15,fontWeight:700,margin:0,color:"#86EFAC",display:"flex",alignItems:"center",gap:3}}><ArrowUpCircle size={13}/>{fmt(totalInc)}</p></div>
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"8px 10px"}}><p style={{fontSize:8,opacity:0.4,letterSpacing:1,margin:0}}>GASTOS</p><p style={{fontSize:15,fontWeight:700,margin:0,color:"#FCA5A5",display:"flex",alignItems:"center",gap:3}}><ArrowDownCircle size={13}/>{fmt(totalExp)}</p></div>
        {s.mode==="partners"&&<div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"8px 10px"}}><p style={{fontSize:8,opacity:0.4,letterSpacing:1,margin:0}}>FIJOS</p><p style={{fontSize:15,fontWeight:700,margin:0,color:"#C4B5FD",display:"flex",alignItems:"center",gap:3}}><Pin size={13}/>{fmt(fixedT)}</p></div>}
      </div>
    </div>
    {/* Partner cards */}
    {s.mode==="partners"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
      {[{p:s.partner1,inc:inc1,exp:period.expenses.filter(e=>e.person===1).reduce((a,e)=>a+toCOP(e.amount,e.currency),0),c:t.p1},{p:s.partner2,inc:inc2,exp:period.expenses.filter(e=>e.person===2).reduce((a,e)=>a+toCOP(e.amount,e.currency),0),c:t.p2}].map((x,i)=><div key={i} style={{background:t.card,borderRadius:16,padding:14,border:`1px solid ${t.border}`}}>
        <p style={{fontSize:12,fontWeight:700,color:x.c,margin:"0 0 6px",display:"flex",alignItems:"center",gap:5}}><User size={13}/>{x.p.name}</p>
        <p style={{fontSize:10,color:t.sub,margin:"0 0 1px"}}>Ingreso: <b style={{color:t.success}}>{fmt(x.inc)}</b></p>
        <p style={{fontSize:10,color:t.sub,margin:"0 0 1px"}}>Gastó: <b style={{color:t.danger}}>{fmt(x.exp)}</b></p>
        <p style={{fontSize:15,fontWeight:800,color:(x.inc-x.exp)>=0?t.success:t.danger,margin:"4px 0 0"}}>{fmt(x.inc-x.exp)}</p>
      </div>)}
    </div>}
    {/* Actions */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      <Btn onClick={()=>d({type:"TOGGLE_ADD_INC"})} bg="linear-gradient(135deg,#4ADE80,#22C55E)" full><ArrowUpCircle size={15}/>Ingreso</Btn>
      <Btn onClick={()=>d({type:"TOGGLE_ADD"})} bg="linear-gradient(135deg,#F87171,#EF4444)" full><ArrowDownCircle size={15}/>Gasto</Btn>
    </div>
    {/* Receipt */}
    <ReceiptCard period={period} s={s} t={t}/>
    {/* Pie */}
    {pieData.length>0&&<div style={{background:t.card,borderRadius:18,padding:"16px 14px",marginBottom:14,border:`1px solid ${t.border}`}}>
      <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 10px",display:"flex",alignItems:"center",gap:6}}><TrendingUp size={15} color={t.accent}/>Distribución</p>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:115,height:115,flexShrink:0}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={52} paddingAngle={2} strokeWidth={0}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
        <div style={{flex:1,maxHeight:115,overflowY:"auto"}}>{pieData.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 0"}}><div style={{display:"flex",alignItems:"center",gap:5}}><CatIcon cat={d.cat} size={11}/><span style={{fontSize:10,color:t.sub}}>{d.name}</span></div><span style={{fontSize:10,fontWeight:700,color:t.text}}>{fmt(d.value)}</span></div>)}</div>
      </div>
    </div>}
    {/* Expense list */}
    <div style={{background:t.card,borderRadius:18,padding:"14px",border:`1px solid ${t.border}`}}>
      <p style={{fontSize:13,fontWeight:700,color:t.text,margin:"0 0 10px"}}>Gastos esta quincena</p>
      {period.expenses.filter(e=>e.fixed).length>0&&<>
        <p style={{fontSize:10,fontWeight:700,color:t.accent,margin:"0 0 6px",letterSpacing:1,display:"flex",alignItems:"center",gap:4}}><Pin size={11}/>FIJOS</p>
        {period.expenses.filter(e=>e.fixed).map(e=>{const isE=editId===e.id;return(
          <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><CatIcon cat={e.category} size={14}/><div><p style={{fontSize:12,fontWeight:600,color:t.text,margin:0}}>{e.note}</p>
              {s.mode==="partners"&&<p style={{fontSize:9,color:t.sub,margin:0}}><span style={{color:e.person===1?t.p1:t.p2,fontWeight:600}}>{e.person===1?s.partner1.name:s.partner2.name}</span>{e.shared&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:600}}>50/50</span>}</p>}
            </div></div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {isE?<><input type="text" inputMode="numeric" value={editVal} onChange={ev=>{const r=ev.target.value.replace(/[^\d]/g,"");setEditVal(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:85,padding:"4px 8px",borderRadius:8,border:`2px solid ${t.inputB}`,fontSize:12,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input}} autoFocus onKeyDown={ev=>ev.key==="Enter"&&saveEdit(e.id)}/>
                <button onClick={()=>saveEdit(e.id)} style={{width:24,height:24,borderRadius:6,border:"none",background:t.success,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={12}/></button>
              </>:<button onClick={()=>{setEditId(e.id);setEditVal(e.amount.toLocaleString("es-CO"))}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:t.danger,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:3}}><Edit3 size={10}/>{fmt(toCOP(e.amount,e.currency))}</button>}
            </div>
          </div>
        )})}
      </>}
      {period.expenses.filter(e=>!e.fixed).length>0&&<>
        <p style={{fontSize:10,fontWeight:700,color:"#FBBF24",margin:"10px 0 6px",letterSpacing:1,display:"flex",alignItems:"center",gap:4}}><Zap size={11}/>VARIABLES</p>
        {period.expenses.filter(e=>!e.fixed).map(e=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${t.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><CatIcon cat={e.category} size={14}/><div><p style={{fontSize:12,fontWeight:600,color:t.text,margin:0}}>{e.note}</p>
              {s.mode==="partners"&&<p style={{fontSize:9,color:t.sub,margin:0}}><span style={{color:e.person===1?t.p1:t.p2,fontWeight:600}}>{e.person===1?s.partner1.name:s.partner2.name}</span>{e.shared&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:600}}>50/50</span>}</p>}
            </div></div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:12,fontWeight:700,color:t.danger}}>{fmt(toCOP(e.amount,e.currency))}</span>
              <button onClick={()=>d({type:"DEL_EXPENSE",p:e.id})} style={{width:22,height:22,borderRadius:6,border:"none",background:`${t.danger}12`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={11} color={t.danger}/></button>
            </div>
          </div>
        ))}
      </>}
    </div>
  </div>);
}

// ── Fixed Screen ──
function FixedScreen({s,d,t}){
  const[editId,setEditId]=useState(null);const[editVal,setEditVal]=useState("");
  const totalF=s.fixedExpenses.reduce((a,f)=>a+toCOP(f.amount,f.currency),0);
  const saveE=(id)=>{if(editVal){d({type:"EDIT_FIXED",p:{id,amount:Number(editVal.replace(/\./g,""))}});setEditId(null)}};
  return(<div style={{padding:"0 16px 110px"}}>
    <div style={{padding:"14px 0 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h2 style={{fontSize:18,fontWeight:700,color:t.text,margin:0,display:"flex",alignItems:"center",gap:8}}><Pin size={18} color={t.accent}/>Gastos fijos</h2><p style={{fontSize:11,color:t.sub,margin:"2px 0 0"}}>Se copian a cada quincena nueva</p></div>
      <Btn onClick={()=>d({type:"TOGGLE_FIXED_ADD"})} small><Plus size={13}/>Nuevo</Btn>
    </div>
    <div style={{padding:14,borderRadius:16,background:t.accentBg,border:`1px solid ${t.accent}18`,marginBottom:12,textAlign:"center"}}>
      <p style={{fontSize:11,color:t.sub,margin:"0 0 2px"}}>Total mensual</p>
      <p style={{fontSize:24,fontWeight:800,color:t.accent,margin:0}}>{fmt(totalF)}</p>
    </div>
    <div style={{background:t.card,borderRadius:18,padding:"4px 14px",border:`1px solid ${t.border}`}}>
      {s.fixedExpenses.length===0&&<p style={{textAlign:"center",padding:24,color:t.sub,fontSize:13}}>Agrega tu primer gasto fijo</p>}
      {s.fixedExpenses.map((f,i)=>{const isE=editId===f.id;return(
        <div key={f.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<s.fixedExpenses.length-1?`1px solid ${t.border}`:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><CatIcon cat={f.category} size={15}/><div><p style={{fontSize:12,fontWeight:600,color:t.text,margin:0}}>{f.note}</p>
            <p style={{fontSize:10,color:t.sub,margin:0}}>
              {s.mode==="partners"&&<><span style={{color:f.person===1?t.p1:t.p2,fontWeight:600}}>{f.person===1?s.partner1.name:s.partner2.name}</span>{f.shared&&<span style={{marginLeft:3,fontSize:8,color:t.accent,fontWeight:600}}>50/50</span>}<span style={{marginLeft:4}}>·</span></>}
              <span style={{marginLeft:4,fontSize:9,opacity:0.6}}>{f.half===0?"Ambas Q":f.half===1?"Q1":"Q2"}</span>
            </p>
          </div></div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {isE?<><input type="text" inputMode="numeric" value={editVal} onChange={ev=>{const r=ev.target.value.replace(/[^\d]/g,"");setEditVal(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:85,padding:"4px 8px",borderRadius:8,border:`2px solid ${t.inputB}`,fontSize:12,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input}} autoFocus onKeyDown={ev=>ev.key==="Enter"&&saveE(f.id)}/>
              <button onClick={()=>saveE(f.id)} style={{width:24,height:24,borderRadius:6,border:"none",background:t.success,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={12}/></button>
            </>:<button onClick={()=>{setEditId(f.id);setEditVal(f.amount.toLocaleString("es-CO"))}} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,color:t.accent,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:3}}><Edit3 size={10}/>{fmtC(f.amount,f.currency)}</button>}
            <button onClick={()=>d({type:"DEL_FIXED",p:f.id})} style={{width:24,height:24,borderRadius:6,border:"none",background:`${t.danger}12`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={11} color={t.danger}/></button>
          </div>
        </div>
      )})}
    </div>
  </div>);
}

// ── Goals Screen ──
function GoalsScreen({s,d,t}){
  const[addAmt,setAddAmt]=useState({});
  const addSave=(id)=>{const v=addAmt[id];if(!v)return;const n=Number(v.replace(/\./g,""));const g=s.goals.find(x=>x.id===id);if(g)d({type:"UPDATE_GOAL",p:{id,saved:Math.min(g.saved+n,g.target)}});setAddAmt(p=>({...p,[id]:""}))};
  return(<div style={{padding:"0 16px 110px"}}>
    <div style={{padding:"14px 0 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h2 style={{fontSize:18,fontWeight:700,color:t.text,margin:0,display:"flex",alignItems:"center",gap:8}}><Target size={18} color={t.accent}/>Metas</h2>
      <Btn onClick={()=>d({type:"TOGGLE_GOAL_ADD"})} small><Plus size={13}/>Nueva</Btn>
    </div>
    {s.goals.map(g=>{const pct=Math.min(Math.round((g.saved/g.target)*100),100);return(
      <div key={g.id} style={{background:t.card,borderRadius:18,padding:"18px 16px",marginBottom:10,border:`1px solid ${t.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:15,fontWeight:700,color:t.text,display:"flex",alignItems:"center",gap:6}}><Target size={16} color={g.color}/>{g.name}</span><button onClick={()=>d({type:"DEL_GOAL",p:g.id})} style={{background:"none",border:"none",cursor:"pointer"}}><X size={14} color={t.sub}/></button></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:26,fontWeight:800,color:g.color}}>{pct}%</span><span style={{fontSize:11,color:t.sub,alignSelf:"flex-end"}}>{fmt(g.saved)} / {fmt(g.target)}</span></div>
        <div style={{height:8,borderRadius:4,background:s.dark?"#222":"#F3F4F6",overflow:"hidden",marginBottom:10}}><div style={{height:"100%",width:`${pct}%`,borderRadius:4,background:`linear-gradient(90deg,${g.color},${g.color}88)`,transition:"width 0.5s"}}/></div>
        <div style={{display:"flex",gap:6}}>
          <input type="text" inputMode="numeric" placeholder="Abonar..." value={addAmt[g.id]||""} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAddAmt(p=>({...p,[g.id]:r?Number(r).toLocaleString("es-CO"):""}))}} style={{flex:1,padding:"9px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:12,fontFamily:"'Nunito',sans-serif",color:t.text,background:t.input,boxSizing:"border-box"}}/>
          <Btn onClick={()=>addSave(g.id)} bg={g.color} small><Plus size={13}/>Abonar</Btn>
        </div>
      </div>
    )})}
    {s.goals.length===0&&<div style={{textAlign:"center",padding:40}}><Target size={48} color={t.dim}/><p style={{color:t.sub,margin:"12px 0"}}>Crea tu primera meta</p></div>}
  </div>);
}

// ── Settings ──
function SettingsScreen({s,d,t}){
  const[n1,setN1]=useState(s.partner1.name);const[n2,setN2]=useState(s.partner2.name);
  return(<div style={{padding:"0 16px 110px"}}>
    <div style={{padding:"14px 0 12px"}}><h2 style={{fontSize:18,fontWeight:700,color:t.text,margin:0,display:"flex",alignItems:"center",gap:8}}><Settings size={18} color={t.accent}/>Ajustes</h2></div>
    <div style={{background:t.card,borderRadius:18,padding:"4px 16px",marginBottom:14,border:`1px solid ${t.border}`}}>
      {/* Dark mode */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${t.border}`}}>
        <span style={{fontSize:13,fontWeight:600,color:t.text,display:"flex",alignItems:"center",gap:8}}>{s.dark?<Moon size={16} color={t.accent}/>:<Sun size={16} color="#FBBF24"/>}Modo {s.dark?"oscuro":"claro"}</span>
        <button onClick={()=>d({type:"DARK"})} style={{width:48,height:26,borderRadius:13,border:"none",background:s.dark?t.accent:"#D1D5DB",cursor:"pointer",position:"relative",transition:"background 0.2s"}}><div style={{width:22,height:22,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:s.dark?24:2,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)"}}/></button>
      </div>
      {/* Mode */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${t.border}`}}>
        <span style={{fontSize:13,fontWeight:600,color:t.text,display:"flex",alignItems:"center",gap:8}}><Users size={16} color={t.accent}/>Modo</span>
        <div style={{display:"flex",gap:4}}>
          {[{m:"solo",l:"Solo",i:User},{m:"partners",l:"Partners",i:Users}].map(x=>{const Icon=x.i;return(
            <button key={x.m} onClick={()=>d({type:"SET_MODE",p:x.m})} style={{padding:"6px 14px",borderRadius:10,border:s.mode===x.m?`2px solid ${t.accent}`:`2px solid ${t.inputB}`,background:s.mode===x.m?t.accentBg:t.input,cursor:"pointer",fontSize:11,fontWeight:600,color:s.mode===x.m?t.accent:t.sub,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:4}}><Icon size={12}/>{x.l}</button>
          )})}
        </div>
      </div>
      {/* Names */}
      {s.mode==="partners"&&<div style={{padding:"14px 0",borderBottom:`1px solid ${t.border}`}}>
        <p style={{fontSize:11,fontWeight:600,color:t.sub,margin:"0 0 8px"}}>Nombres</p>
        <div style={{display:"flex",gap:8}}>
          <input type="text" value={n1} onChange={e=>setN1(e.target.value)} onBlur={()=>d({type:"SET_NAMES",p:{n1,n2}})} style={{flex:1,padding:"9px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.p1,background:t.input,fontWeight:600,boxSizing:"border-box"}}/>
          <input type="text" value={n2} onChange={e=>setN2(e.target.value)} onBlur={()=>d({type:"SET_NAMES",p:{n1,n2}})} style={{flex:1,padding:"9px 12px",borderRadius:10,border:`2px solid ${t.inputB}`,fontSize:13,fontFamily:"'Nunito',sans-serif",color:t.p2,background:t.input,fontWeight:600,boxSizing:"border-box"}}/>
        </div>
      </div>}
      {/* Fixed link */}
      <button onClick={()=>d({type:"SCREEN",p:"fixed"})} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"14px 0",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
        <Pin size={16} color={t.accent}/><span style={{fontSize:13,fontWeight:600,color:t.text,fontFamily:"'Nunito',sans-serif",flex:1}}>Gastos fijos</span><ChevronRight size={16} color={t.dim}/>
      </button>
    </div>
    {/* Freemium teaser */}
    <div style={{background:`linear-gradient(135deg,${t.accent}12,${t.accent2}08)`,borderRadius:18,padding:"18px",border:`1px solid ${t.accent}22`,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <Crown size={20} color="#FBBF24"/><p style={{fontSize:14,fontWeight:700,color:t.text,margin:0}}>Kashy Premium</p>
      </div>
      <p style={{fontSize:12,color:t.sub,lineHeight:1.6,margin:"0 0 12px"}}>Exporta a PDF, sincroniza entre dispositivos, resumen con IA, y soporte prioritario.</p>
      <Btn small bg="linear-gradient(135deg,#FBBF24,#F59E0B)" color="#1E1B4B" style={{cursor:"default",opacity:0.7}}><Lock size={12}/>Próximamente</Btn>
    </div>
    <div style={{background:t.card,borderRadius:18,padding:"16px",border:`1px solid ${t.border}`}}>
      <p style={{fontSize:12,fontWeight:700,color:t.text,margin:"0 0 8px",display:"flex",alignItems:"center",gap:6}}><Lightbulb size={14} color="#FBBF24"/>Tips</p>
      {["Configura gastos fijos una vez y se copian solos.","Toca el monto de un gasto fijo para editarlo.","El recibo quincenal divide todo automáticamente."].map((x,i)=><p key={i} style={{fontSize:12,color:t.sub,margin:i<2?"0 0 6px":0,lineHeight:1.5}}>• {x}</p>)}
    </div>
    <p style={{textAlign:"center",fontSize:11,color:t.dim,margin:"14px 0"}}>Kashy v4.0 · Hecho con 💜 para Colombia</p>
  </div>);
}

// ── Main ──
export default function Kashy(){
  const[s,d]=useReducer(reducer,initState);const t=th(s.dark);
  useEffect(()=>{const data=loadStore("kashy-v4",null);if(data)d({type:"LOAD",p:data});else d({type:"LOAD",p:{}});},[]);
  useEffect(()=>{if(!s.loaded)return;saveStore("kashy-v4",{dark:s.dark,mode:s.mode,partner1:s.partner1,partner2:s.partner2,fixedExpenses:s.fixedExpenses,periods:s.periods,goals:s.goals,activePeriod:s.activePeriod})},[s.dark,s.mode,s.partner1,s.partner2,s.fixedExpenses,s.periods,s.goals,s.activePeriod,s.loaded]);

  const nav=[{k:"dashboard",Icon:Home,l:"Inicio"},{k:"fixed",Icon:Pin,l:"Fijos"},{k:"goals",Icon:Target,l:"Metas"},{k:"settings",Icon:Settings,l:"Ajustes"}];
  const screens={dashboard:<Dashboard s={s} d={d} t={t}/>,fixed:<FixedScreen s={s} d={d} t={t}/>,goals:<GoalsScreen s={s} d={d} t={t}/>,settings:<SettingsScreen s={s} d={d} t={t}/>};

  return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:t.bg,fontFamily:"'Nunito','Segoe UI',sans-serif",position:"relative"}}>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    {/* Header */}
    <div style={{padding:"12px 18px 8px",background:t.card,borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
      <div>
        <h1 style={{fontSize:22,fontWeight:800,margin:0,background:`linear-gradient(135deg,${t.accent},${t.accent2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Kashy</h1>
        <p style={{fontSize:10,color:t.dim,margin:0,display:"flex",alignItems:"center",gap:3}}>
          {s.mode==="partners"?<><Users size={10}/>{s.partner1.name} & {s.partner2.name}</>:<><User size={10}/>Tu plata bajo control</>}
        </p>
      </div>
      <button onClick={()=>d({type:"DARK"})} style={{width:34,height:34,borderRadius:10,background:t.input,border:`1px solid ${t.inputB}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {s.dark?<Sun size={16} color="#FBBF24"/>:<Moon size={16} color={t.accent}/>}
      </button>
    </div>
    <div key={s.screen} style={{animation:"fadeUp 0.2s ease"}}>{screens[s.screen]}</div>
    {/* Nav */}
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:t.card,borderTop:`1px solid ${t.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"6px 0 env(safe-area-inset-bottom,8px)",zIndex:80}}>
      {nav.map(n=>{const Icon=n.Icon;return(
        <button key={n.k} onClick={()=>d({type:"SCREEN",p:n.k})} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 0"}}>
          <Icon size={19} color={s.screen===n.k?t.accent:t.dim} strokeWidth={s.screen===n.k?2.5:1.8}/>
          <span style={{fontSize:9,fontWeight:s.screen===n.k?700:500,color:s.screen===n.k?t.accent:t.dim,fontFamily:"'Nunito',sans-serif"}}>{n.l}</span>
        </button>
      )})}
    </div>
    {s.showAdd&&<AddExpenseModal s={s} d={d} t={t} pid={s.activePeriod}/>}
    {s.showAddIncome&&<AddIncomeModal s={s} d={d} t={t} pid={s.activePeriod}/>}
    {s.showGenerate&&<GenerateModal s={s} d={d} t={t}/>}
    {s.showFixedAdd&&<AddFixedModal s={s} d={d} t={t}/>}
    {s.showGoalAdd&&<GoalAddModal d={d} t={t}/>}
    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}::-webkit-scrollbar{display:none}input:focus,select:focus{outline:none;border-color:${t.accent}!important}`}</style>
  </div>);
}
