import { useState, useEffect, useReducer } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ── SVG Icons ──
const I = {
  logo:(s=24,c="#6C5CE7")=><svg width={s} height={s} viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill={c}/><path d="M8 16L12 10L16 18L20 12L24 20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="16" cy="24" r="2" fill="#A29BFE"/></svg>,
  home:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#6C5CE7":"#B8B8C7"} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  pin:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#6C5CE7":"#B8B8C7"} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8M8 10h8"/><circle cx="12" cy="14" r="4"/><path d="M12 18v4"/></svg>,
  target:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#6C5CE7":"#B8B8C7"} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  gear:a=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a?"#6C5CE7":"#B8B8C7"} strokeWidth={a?"2":"1.6"} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  plus:c=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c||"#fff"} strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  x:c=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c||"#999"} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  up:c=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c||"#34C759"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  down:c=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c||"#FF3B30"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
  receipt:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c||"#6C5CE7"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>,
  moon:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  sun:()=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  trash:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>,
  users:c=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"#6C5CE7"} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  // Category icons
  c:{
    arriendo:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21V12h6v9"/></svg>,
    servicios:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>,
    mercado:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.93-1.46L23 6H6"/></svg>,
    transporte:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    salud:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    educacion:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    celular:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>,
    ocio:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>,
    restaurantes:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>,
    mascotas:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M12 21c-4-4-8-6.5-8-10.5a4.5 4.5 0 019 0 4.5 4.5 0 019 0c0 4-4 6.5-8 10.5z"/></svg>,
    ropa:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M6 2L2 6l4 2V22h12V8l4-2-4-4-3 3h-6z"/></svg>,
    suscripciones:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    deudas:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
    ahorro:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2"/></svg>,
    seguros:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    imprevistos:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
    regalos:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18"/></svg>,
    otros:c=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  }
};
const ci=(k,c)=>I.c[k]?I.c[k](c):I.c.otros(c);

const CUR={COP:{symbol:"$",rate:1},USD:{symbol:"US$",rate:4150},EUR:{symbol:"€",rate:4480}};
const CATS={arriendo:{label:"Arriendo",color:"#FF6B6B"},servicios:{label:"Servicios",color:"#FF9F43"},mercado:{label:"Mercado",color:"#FECA57"},transporte:{label:"Transporte",color:"#2ED573"},salud:{label:"Salud",color:"#54A0FF"},educacion:{label:"Educación",color:"#5F7ADB"},celular:{label:"Celular",color:"#A29BFE"},ocio:{label:"Ocio",color:"#FF6B81"},restaurantes:{label:"Restaurantes",color:"#EE5A6F"},mascotas:{label:"Mascotas",color:"#1DD1A1"},ropa:{label:"Ropa",color:"#48DBFB"},suscripciones:{label:"Suscripciones",color:"#C44FE2"},deudas:{label:"Deudas",color:"#FF7979"},ahorro:{label:"Ahorro",color:"#26D67B"},seguros:{label:"Seguros",color:"#2E86DE"},imprevistos:{label:"Imprevistos",color:"#F6B93B"},regalos:{label:"Regalos",color:"#E15F41"},otros:{label:"Otros",color:"#A4B0BE"}};
const IC={salario:{label:"Salario",color:"#26D67B"},freelance:{label:"Freelance",color:"#2ED573"},negocio:{label:"Negocio",color:"#1DD1A1"},otro_ingreso:{label:"Otro",color:"#48DBFB"}};
const MO=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const fm=n=>"$"+Math.abs(n).toLocaleString("es-CO",{maximumFractionDigits:0});
const fc=(n,c="COP")=>(CUR[c]?.symbol||"$")+" "+Math.abs(n).toLocaleString("es-CO",{maximumFractionDigits:c==="COP"?0:2});
const tc=(a,c)=>Math.round(a*(CUR[c]?.rate||1));
function ld(k,f){try{const r=localStorage.getItem(k);return r?JSON.parse(r):f}catch{return f}}
function sv(k,d){try{localStorage.setItem(k,JSON.stringify(d))}catch{}}

// Sample
const SF=[{id:1,category:"arriendo",amount:309000,note:"Arriendo",person:1,shared:true,currency:"COP",half:0},{id:2,category:"arriendo",amount:309000,note:"Arriendo",person:2,shared:true,currency:"COP",half:0},{id:3,category:"celular",amount:37500,note:"Internet",person:1,shared:true,currency:"COP",half:0},{id:4,category:"celular",amount:37500,note:"Internet",person:2,shared:true,currency:"COP",half:0},{id:5,category:"suscripciones",amount:55000,note:"Netflix + Spotify",person:1,shared:true,currency:"COP",half:0},{id:6,category:"deudas",amount:250000,note:"Cuota crédito",person:1,shared:false,currency:"COP",half:0}];
const SP=[{id:1,month:"Enero",half:1,label:"Ene 1-15",incomes:[{id:101,person:1,amount:2900000,note:"Salario",category:"salario",currency:"COP"},{id:102,person:2,amount:2900000,note:"Salario",category:"salario",currency:"COP"}],expenses:[{id:201,category:"mercado",amount:300000,note:"Mercado",person:1,shared:true,currency:"COP",fixed:false},{id:202,category:"ropa",amount:100000,note:"Ropa",person:1,shared:false,currency:"COP",fixed:false},{id:203,category:"restaurantes",amount:150000,note:"Rappi",person:1,shared:true,currency:"COP",fixed:false},{id:204,category:"ocio",amount:100000,note:"Guitarra",person:1,shared:false,currency:"COP",fixed:false},{id:205,category:"mascotas",amount:250000,note:"Mami",person:2,shared:true,currency:"COP",fixed:false},{id:206,category:"mercado",amount:300000,note:"Mercado",person:2,shared:true,currency:"COP",fixed:false},{id:207,category:"restaurantes",amount:150000,note:"Rappi",person:2,shared:true,currency:"COP",fixed:false}]},{id:2,month:"Enero",half:2,label:"Ene 16-31",incomes:[{id:301,person:1,amount:3200000,note:"Salario",category:"salario",currency:"COP"},{id:302,person:2,amount:3088000,note:"Salario",category:"salario",currency:"COP"}],expenses:[{id:401,category:"arriendo",amount:309000,note:"Arriendo",person:1,shared:true,currency:"COP",fixed:true},{id:402,category:"arriendo",amount:309000,note:"Arriendo",person:2,shared:true,currency:"COP",fixed:true},{id:403,category:"celular",amount:37500,note:"Internet",person:1,shared:true,currency:"COP",fixed:true},{id:404,category:"celular",amount:37500,note:"Internet",person:2,shared:true,currency:"COP",fixed:true},{id:405,category:"suscripciones",amount:55000,note:"Netflix + Spotify",person:1,shared:true,currency:"COP",fixed:true},{id:406,category:"deudas",amount:250000,note:"Cuota crédito",person:1,shared:false,currency:"COP",fixed:true},{id:407,category:"servicios",amount:150000,note:"Luz",person:1,shared:true,currency:"COP",fixed:false},{id:408,category:"servicios",amount:80000,note:"Agua",person:1,shared:true,currency:"COP",fixed:false},{id:409,category:"mercado",amount:300000,note:"Mercado",person:1,shared:true,currency:"COP",fixed:false},{id:410,category:"restaurantes",amount:200000,note:"Rappi + comida",person:1,shared:true,currency:"COP",fixed:false},{id:411,category:"mascotas",amount:300000,note:"Mami",person:2,shared:true,currency:"COP",fixed:false},{id:412,category:"mercado",amount:300000,note:"Mercado",person:2,shared:true,currency:"COP",fixed:false},{id:413,category:"servicios",amount:110000,note:"Luz",person:2,shared:true,currency:"COP",fixed:false},{id:414,category:"restaurantes",amount:150000,note:"Rappi",person:2,shared:true,currency:"COP",fixed:false},{id:415,category:"otros",amount:500000,note:"NU",person:2,shared:false,currency:"COP",fixed:false}]}];

const init={screen:"onboarding",dark:false,loaded:false,p1:{name:"Andrés"},p2:{name:"Mila"},fx:SF,periods:SP,goals:[{id:1,name:"Vacaciones San Andrés",target:2500000,saved:850000,color:"#54A0FF"}],ap:2,showAdd:false,showInc:false,showGA:false,showFA:false,showGen:false,showRec:false,ob:false};

function red(s,a){switch(a.t){
  case "L":return{...s,...a.p,loaded:true,screen:a.p.ob?"dashboard":"onboarding"};
  case "OB":return{...s,ob:true,screen:"dashboard"};
  case "SC":return{...s,screen:a.p};case "DK":return{...s,dark:!s.dark};
  case "SN":return{...s,p1:{name:a.p.n1},p2:{name:a.p.n2}};
  case "AF":return{...s,fx:[...s.fx,a.p],showFA:false};
  case "DF":return{...s,fx:s.fx.filter(f=>f.id!==a.p)};
  case "AP":{return{...s,periods:[...s.periods,a.p],ap:a.p.id,showGen:false}};
  case "AE":{const ps=s.periods.map(p=>p.id===a.p.pid?{...p,expenses:[...p.expenses,a.p.e]}:p);return{...s,periods:ps,showAdd:false}}
  case "DE":{const ps=s.periods.map(p=>({...p,expenses:p.expenses.filter(e=>e.id!==a.p)}));return{...s,periods:ps}}
  case "EE":{const ps=s.periods.map(p=>({...p,expenses:p.expenses.map(e=>e.id===a.p.id?{...e,amount:a.p.amount}:e)}));return{...s,periods:ps}}
  case "AI":{const ps=s.periods.map(p=>p.id===a.p.pid?{...p,incomes:[...p.incomes,a.p.i]}:p);return{...s,periods:ps,showInc:false}}
  case "SP":return{...s,ap:a.p};
  case "TA":return{...s,showAdd:!s.showAdd};case "TI":return{...s,showInc:!s.showInc};
  case "TG":return{...s,showGen:!s.showGen};case "TR":return{...s,showRec:!s.showRec};
  case "AG":return{...s,goals:[...s.goals,a.p],showGA:false};
  case "UG":return{...s,goals:s.goals.map(g=>g.id===a.p.id?{...g,saved:a.p.saved}:g)};
  case "DG":return{...s,goals:s.goals.filter(g=>g.id!==a.p)};
  case "TGA":return{...s,showGA:!s.showGA};case "TFA":return{...s,showFA:!s.showFA};
  default:return s}}

const th=d=>({bg:d?"#000":"#F2F2F7",cd:d?"#1C1C1E":"#FFF",bd:d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)",tx:d?"#FFF":"#000",sb:d?"#98989F":"#86868B",dm:d?"#48484A":"#C7C7CC",ip:d?"#2C2C2E":"#F2F2F7",ib:d?"#3A3A3C":"#E5E5EA",ac:"#6C5CE7",a2:"#A29BFE",c1:"#FF6B6B",c2:"#48DBFB",gn:"#34C759",rd:"#FF3B30"});

// Overlay
const OL=({children,close,t})=><div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={close}><div style={{width:"100%",maxWidth:430}} onClick={e=>e.stopPropagation()}><div style={{background:t.cd,borderRadius:"20px 20px 0 0",padding:"20px 20px 34px",maxHeight:"90vh",overflowY:"auto"}}>{children}</div></div></div>;

// Onboarding
function Onboarding({d,t}){const[st,setSt]=useState(0);const[n1,setN1]=useState("");const[n2,setN2]=useState("");const[mode,setMode]=useState("partners");
  const ok=st<2||(st===2&&n1&&(mode==="solo"||n2));
  return(<div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"60px 24px 40px"}}>
    <div>{st===0&&<div style={{textAlign:"center",paddingTop:40}}><div style={{marginBottom:20}}>{I.logo(64)}</div><p style={{fontSize:32,fontWeight:700,color:t.tx,margin:"0 0 8px",letterSpacing:-1}}>Kashy</p><p style={{fontSize:16,color:t.sb,margin:0,lineHeight:1.5}}>Tu plata bajo control</p></div>}
      {st===1&&<div style={{paddingTop:20}}><p style={{fontSize:22,fontWeight:600,color:t.tx,margin:"0 0 16px",letterSpacing:-0.5}}>¿Cómo usarás Kashy?</p>
        {[{m:"partners",t:"Con mi pareja",s:"Divide gastos, recibos quincenales"},{m:"solo",t:"Solo",s:"Control de gastos personal"}].map(x=>(<button key={x.m} onClick={()=>setMode(x.m)} style={{width:"100%",padding:"18px 16px",borderRadius:16,border:mode===x.m?`2px solid ${t.ac}`:`1.5px solid ${t.bd}`,background:mode===x.m?`${t.ac}08`:t.cd,cursor:"pointer",textAlign:"left",marginBottom:10,display:"block"}}><p style={{fontSize:16,fontWeight:600,color:t.tx,margin:"0 0 4px"}}>{x.t}</p><p style={{fontSize:13,color:t.sb,margin:0}}>{x.s}</p></button>))}</div>}
      {st===2&&<div style={{paddingTop:20}}><p style={{fontSize:22,fontWeight:600,color:t.tx,margin:"0 0 16px",letterSpacing:-0.5}}>{mode==="partners"?"¿Cómo se llaman?":"Tu nombre"}</p>
        <input type="text" placeholder="Tu nombre" value={n1} onChange={e=>setN1(e.target.value)} style={{width:"100%",padding:"16px",borderRadius:14,border:`1.5px solid ${t.ib}`,fontSize:17,fontFamily:"inherit",color:t.tx,background:t.ip,marginBottom:10,boxSizing:"border-box",outline:"none"}} autoFocus/>
        {mode==="partners"&&<input type="text" placeholder="Tu pareja" value={n2} onChange={e=>setN2(e.target.value)} style={{width:"100%",padding:"16px",borderRadius:14,border:`1.5px solid ${t.ib}`,fontSize:17,fontFamily:"inherit",color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}}/>}</div>}
    </div>
    <div><div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>{[0,1,2].map(i=><div key={i} style={{width:i===st?24:8,height:8,borderRadius:4,background:i===st?t.ac:t.dm,transition:"all 0.3s"}}/>)}</div>
      <button onClick={()=>{if(st<2)setSt(st+1);else{d({t:"SN",p:{n1:n1||"Tú",n2:n2||"Pareja"}});d({t:"OB"})}}} disabled={!ok} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:ok?t.ac:t.dm,color:"#fff",fontSize:17,fontWeight:600,cursor:ok?"pointer":"default",opacity:ok?1:.5,fontFamily:"inherit"}}>{st<2?"Continuar":"Empezar"}</button>
    </div>
  </div>);
}

// Dashboard
function Dash({s,d,t}){const per=s.periods.find(p=>p.id===s.ap)||s.periods[s.periods.length-1];const[eid,setEid]=useState(null);const[ev,setEv]=useState("");
  if(!per)return null;
  const i1=per.incomes.filter(i=>i.person===1).reduce((a,i)=>a+tc(i.amount,i.currency),0);
  const i2=per.incomes.filter(i=>i.person===2).reduce((a,i)=>a+tc(i.amount,i.currency),0);
  const ti=i1+i2;const te=per.expenses.reduce((a,e)=>a+tc(e.amount,e.currency),0);const bal=ti-te;
  const bc={};per.expenses.forEach(e=>{bc[e.category]=(bc[e.category]||0)+tc(e.amount,e.currency)});
  const pd=Object.entries(bc).map(([k,v])=>({name:CATS[k]?.label||k,value:v,color:CATS[k]?.color||"#aaa"})).sort((a,b)=>b.value-a.value);
  const sE=id=>{if(ev){d({t:"EE",p:{id,amount:Number(ev.replace(/\./g,""))}});setEid(null)}};

  return(<div style={{padding:"0 16px 100px"}}>
    <div style={{display:"flex",gap:6,padding:"12px 0",overflowX:"auto",scrollbarWidth:"none"}}>
      {s.periods.map(p=><button key={p.id} onClick={()=>d({t:"SP",p:p.id})} style={{padding:"8px 16px",borderRadius:20,border:"none",background:s.ap===p.id?t.ac:t.cd,cursor:"pointer",fontSize:13,fontWeight:s.ap===p.id?600:400,fontFamily:"inherit",color:s.ap===p.id?"#fff":t.sb,whiteSpace:"nowrap",flexShrink:0}}>{p.label}</button>)}
      <button onClick={()=>d({t:"TG"})} style={{padding:"8px 14px",borderRadius:20,border:`1.5px dashed ${t.ac}55`,background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",color:t.ac,whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:4}}>{I.plus(t.ac)} Nueva</button>
    </div>
    {/* Balance */}
    <div style={{padding:"24px 20px",borderRadius:20,background:t.cd,marginBottom:12,border:`1px solid ${t.bd}`}}>
      <p style={{fontSize:13,color:t.sb,margin:"0 0 4px",fontWeight:500}}>{per.label} · {per.month}</p>
      <p style={{fontSize:38,fontWeight:700,margin:"0 0 16px",color:bal>=0?t.gn:t.rd,letterSpacing:-1.5}}>{bal>=0?"":"-"}{fm(bal)}</p>
      <div style={{display:"flex",gap:16}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>{I.up()}<div><p style={{fontSize:11,color:t.sb,margin:0}}>Ingresos</p><p style={{fontSize:16,fontWeight:600,color:t.tx,margin:0}}>{fm(ti)}</p></div></div>
        <div style={{width:1,background:t.bd}}/>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>{I.down()}<div><p style={{fontSize:11,color:t.sb,margin:0}}>Gastos</p><p style={{fontSize:16,fontWeight:600,color:t.tx,margin:0}}>{fm(te)}</p></div></div>
      </div>
    </div>
    {/* Partners */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      {[{p:s.p1,inc:i1,exp:per.expenses.filter(e=>e.person===1).reduce((a,e)=>a+tc(e.amount,e.currency),0),c:t.c1},{p:s.p2,inc:i2,exp:per.expenses.filter(e=>e.person===2).reduce((a,e)=>a+tc(e.amount,e.currency),0),c:t.c2}].map((x,i)=><div key={i} style={{background:t.cd,borderRadius:16,padding:14,border:`1px solid ${t.bd}`}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:x.c,marginBottom:8}}/>
        <p style={{fontSize:15,fontWeight:600,color:t.tx,margin:"0 0 8px"}}>{x.p.name}</p>
        <p style={{fontSize:11,color:t.sb,margin:"0 0 2px"}}>Ingreso: {fm(x.inc)}</p>
        <p style={{fontSize:11,color:t.sb,margin:"0 0 4px"}}>Gastos: {fm(x.exp)}</p>
        <p style={{fontSize:20,fontWeight:700,color:(x.inc-x.exp)>=0?t.gn:t.rd,margin:0,letterSpacing:-0.5}}>{fm(x.inc-x.exp)}</p>
      </div>)}
    </div>
    {/* Actions */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
      <button onClick={()=>d({t:"TI"})} style={{padding:14,borderRadius:14,border:"none",background:t.gn,color:"#fff",cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{I.up("#fff")} Ingreso</button>
      <button onClick={()=>d({t:"TA"})} style={{padding:14,borderRadius:14,border:"none",background:t.rd,color:"#fff",cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{I.down("#fff")} Gasto</button>
    </div>
    <button onClick={()=>d({t:"TR"})} style={{width:"100%",padding:14,borderRadius:14,border:`1.5px solid ${t.bd}`,background:t.cd,cursor:"pointer",fontSize:14,fontWeight:500,color:t.ac,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>{I.receipt()} Recibo quincenal</button>
    {/* Pie */}
    {pd.length>0&&<div style={{background:t.cd,borderRadius:16,padding:16,marginBottom:12,border:`1px solid ${t.bd}`}}>
      <p style={{fontSize:15,fontWeight:600,color:t.tx,margin:"0 0 12px",letterSpacing:-0.3}}>Distribución</p>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:100,height:100,flexShrink:0}}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pd} dataKey="value" cx="50%" cy="50%" innerRadius={28} outerRadius={46} paddingAngle={2} strokeWidth={0}>{pd.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
        <div style={{flex:1}}>{pd.slice(0,6).map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3px 0"}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:3,background:d.color}}/><span style={{fontSize:12,color:t.sb}}>{d.name}</span></div><span style={{fontSize:12,fontWeight:600,color:t.tx}}>{fm(d.value)}</span></div>)}</div>
      </div>
    </div>}
    {/* Expenses */}
    <div style={{background:t.cd,borderRadius:16,padding:16,border:`1px solid ${t.bd}`}}>
      <p style={{fontSize:15,fontWeight:600,color:t.tx,margin:"0 0 12px",letterSpacing:-0.3}}>Gastos</p>
      {[{label:"FIJOS",color:t.ac,items:per.expenses.filter(e=>e.fixed)},{label:"VARIABLES",color:"#FF9F43",items:per.expenses.filter(e=>!e.fixed)}].filter(g=>g.items.length>0).map(g=>(<div key={g.label}>
        <p style={{fontSize:11,fontWeight:600,color:g.color,margin:"0 0 8px",letterSpacing:0.5}}>{g.label}</p>
        {g.items.map(e=>{const c=CATS[e.category];const isE=eid===e.id;return(<div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${t.bd}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${c?.color}10`,display:"flex",alignItems:"center",justifyContent:"center"}}>{ci(e.category,c?.color)}</div>
            <div><p style={{fontSize:14,fontWeight:500,color:t.tx,margin:0}}>{e.note}</p>
              <p style={{fontSize:11,color:t.sb,margin:0}}><span style={{color:e.person===1?t.c1:t.c2}}>{e.person===1?s.p1.name:s.p2.name}</span>{e.shared&&<span style={{marginLeft:4,opacity:.5}}>· 50/50</span>}</p></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {isE?<><input type="text" inputMode="numeric" value={ev} onChange={ev2=>{const r=ev2.target.value.replace(/[^\d]/g,"");setEv(r?Number(r).toLocaleString("es-CO"):"")}} onKeyDown={ev2=>ev2.key==="Enter"&&sE(e.id)} style={{width:80,padding:"4px 8px",borderRadius:8,border:`1.5px solid ${t.ib}`,fontSize:13,fontFamily:"inherit",color:t.tx,background:t.ip,outline:"none"}} autoFocus/><button onClick={()=>sE(e.id)} style={{background:t.gn,border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#fff",fontSize:11,fontWeight:600}}>✓</button></>
            :<>{e.fixed?<button onClick={()=>{setEid(e.id);setEv(e.amount.toLocaleString("es-CO"))}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:600,color:t.rd,fontFamily:"inherit"}}>{fm(tc(e.amount,e.currency))}</button>:<span style={{fontSize:14,fontWeight:600,color:t.rd}}>{fm(tc(e.amount,e.currency))}</span>}
              {!e.fixed&&<button onClick={()=>d({t:"DE",p:e.id})} style={{width:24,height:24,borderRadius:6,border:"none",background:`${t.rd}10`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.trash()}</button>}</>}
          </div>
        </div>)})}
      </div>))}
    </div>
  </div>);
}

// Receipt
function Rec({s,d,t}){const per=s.periods.find(p=>p.id===s.ap);if(!per)return null;
  const i1=per.incomes.filter(i=>i.person===1).reduce((a,i)=>a+tc(i.amount,i.currency),0);
  const i2=per.incomes.filter(i=>i.person===2).reduce((a,i)=>a+tc(i.amount,i.currency),0);
  const sh=per.expenses.filter(e=>e.shared);const ts=sh.reduce((a,e)=>a+tc(e.amount,e.currency),0);const hs=Math.round(ts/2);
  const id1=per.expenses.filter(e=>!e.shared&&e.person===1).reduce((a,e)=>a+tc(e.amount,e.currency),0);
  const id2=per.expenses.filter(e=>!e.shared&&e.person===2).reduce((a,e)=>a+tc(e.amount,e.currency),0);
  const t1=hs+id1,t2=hs+id2,r1=i1-t1,r2=i2-t2;
  return(<OL close={()=>d({t:"TR"})} t={t}>
    <div style={{textAlign:"center",paddingBottom:14,borderBottom:`1px dashed ${t.bd}`,marginBottom:14}}>{I.logo(28)}<p style={{fontSize:17,fontWeight:600,color:t.tx,margin:"8px 0 2px"}}>Recibo Quincenal</p><p style={{fontSize:13,color:t.sb,margin:0}}>{per.label} · {per.month}</p></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      {[{n:s.p1.name,v:i1,c:t.c1},{n:s.p2.name,v:i2,c:t.c2}].map((x,i)=><div key={i} style={{padding:12,borderRadius:12,background:`${x.c}08`}}><p style={{fontSize:12,color:t.sb,margin:"0 0 2px"}}>{x.n}</p><p style={{fontSize:17,fontWeight:700,color:x.c,margin:0}}>{fm(x.v)}</p></div>)}
    </div>
    <p style={{fontSize:13,fontWeight:600,color:t.tx,margin:"0 0 6px"}}>Compartidos</p>
    {sh.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}><span style={{fontSize:12,color:t.sb}}>{e.note}</span><span style={{fontSize:12,fontWeight:600,color:t.tx}}>{fm(tc(e.amount,e.currency))}</span></div>)}
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`1px solid ${t.bd}`,marginTop:4}}><span style={{fontSize:13,fontWeight:600}}>Total</span><span style={{fontSize:14,fontWeight:700,color:t.ac}}>{fm(ts)}</span></div>
    <p style={{fontSize:11,color:t.sb,textAlign:"center",margin:"4px 0 14px"}}>Cada uno: {fm(hs)}</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
      {[{n:s.p1.name,tot:t1,rem:r1,c:t.c1},{n:s.p2.name,tot:t2,rem:r2,c:t.c2}].map((x,i)=><div key={i} style={{padding:14,borderRadius:14,background:`${x.c}08`,textAlign:"center"}}>
        <p style={{fontSize:14,fontWeight:600,color:t.tx,margin:"0 0 4px"}}>{x.n}</p>
        <p style={{fontSize:11,color:t.sb,margin:"0 0 1px"}}>Gastos: {fm(x.tot)}</p>
        <p style={{fontSize:22,fontWeight:700,color:x.rem>=0?t.gn:t.rd,margin:"4px 0 0"}}>{x.rem>=0?"":"−"}{fm(x.rem)}</p>
        <p style={{fontSize:10,color:t.sb}}>{x.rem>=0?"disponible":"déficit"}</p>
      </div>)}
    </div>
    <button onClick={()=>d({t:"TR"})} style={{width:"100%",padding:14,borderRadius:14,border:`1.5px solid ${t.bd}`,background:t.ip,cursor:"pointer",fontSize:14,fontWeight:500,color:t.sb,fontFamily:"inherit"}}>Cerrar</button>
  </OL>);
}

// Generate
function Gen({s,d,t}){const last=s.periods[s.periods.length-1];const nh=last?(last.half===1?2:1):1;const nmi=last?(last.half===2?(MO.indexOf(last.month)+1)%12:MO.indexOf(last.month)):new Date().getMonth();const nm=MO[nmi];const nl=`${nm.slice(0,3)} ${nh===1?"1-15":"16-"+new Date(2026,nmi+1,0).getDate()}`;
  const fx=s.fx.filter(f=>f.half===0||f.half===nh);const tf=fx.reduce((a,f)=>a+tc(f.amount,f.currency),0);
  const gen=()=>d({t:"AP",p:{id:Date.now(),month:nm,half:nh,label:nl,incomes:[],expenses:fx.map(f=>({id:Date.now()+Math.random()*10000|0,category:f.category,amount:f.amount,note:f.note,person:f.person,shared:f.shared,currency:f.currency,fixed:true}))}});
  return(<OL close={()=>d({t:"TG"})} t={t}>
    <p style={{fontSize:17,fontWeight:600,color:t.tx,margin:"0 0 4px"}}>Nueva quincena</p>
    <p style={{fontSize:24,fontWeight:700,color:t.ac,margin:"0 0 4px",letterSpacing:-0.5}}>{nl}</p>
    <p style={{fontSize:13,color:t.sb,margin:"0 0 16px"}}>{fx.length} gastos fijos · {fm(tf)}</p>
    {fx.map(f=>{const c=CATS[f.category];return(<div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${t.bd}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:30,height:30,borderRadius:8,background:`${c?.color}10`,display:"flex",alignItems:"center",justifyContent:"center"}}>{ci(f.category,c?.color)}</div><div><p style={{fontSize:13,fontWeight:500,color:t.tx,margin:0}}>{f.note}</p><p style={{fontSize:10,color:t.sb,margin:0}}>{f.person===1?s.p1.name:s.p2.name}</p></div></div><span style={{fontSize:13,fontWeight:600,color:t.tx}}>{fc(f.amount,f.currency)}</span></div>)})}
    <button onClick={gen} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:t.ac,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:16}}>Generar</button>
  </OL>);
}

// Add expense modal
function AddE({s,d,t}){const[cat,setCat]=useState("mercado");const[am,setAm]=useState("");const[nt,setNt]=useState("");const[pr,setPr]=useState(1);const[sh,setSh]=useState(true);const[cu,setCu]=useState("COP");
  const sub=()=>{if(!am)return;d({t:"AE",p:{pid:s.ap,e:{id:Date.now(),category:cat,amount:Number(am.replace(/\./g,"")),note:nt||CATS[cat]?.label,person:pr,shared:sh,currency:cu,fixed:false}}})};
  return(<OL close={()=>d({t:"TA"})} t={t}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><p style={{fontSize:17,fontWeight:600,color:t.tx,margin:0}}>Nuevo gasto</p><button onClick={()=>d({t:"TA"})} style={{width:28,height:28,borderRadius:"50%",background:t.ip,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.x(t.sb)}</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{[{p:1,n:s.p1.name,c:t.c1},{p:2,n:s.p2.name,c:t.c2}].map(x=><button key={x.p} onClick={()=>setPr(x.p)} style={{padding:12,borderRadius:12,border:pr===x.p?`2px solid ${x.c}`:`1.5px solid ${t.ib}`,background:pr===x.p?`${x.c}0A`:t.ip,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",color:pr===x.p?x.c:t.sb}}>{x.n}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
      <button onClick={()=>setSh(true)} style={{padding:10,borderRadius:12,border:sh?`2px solid ${t.ac}`:`1.5px solid ${t.ib}`,background:sh?`${t.ac}08`:t.ip,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",color:sh?t.ac:t.sb,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>{I.users(sh?t.ac:t.sb)} Compartido</button>
      <button onClick={()=>setSh(false)} style={{padding:10,borderRadius:12,border:!sh?"2px solid #FF9F43":`1.5px solid ${t.ib}`,background:!sh?"#FF9F4308":t.ip,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",color:!sh?"#FF9F43":t.sb}}>Individual</button>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      <input type="text" inputMode="numeric" placeholder="0" value={am} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAm(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:24,fontWeight:700,fontFamily:"inherit",color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none",letterSpacing:-0.5}} autoFocus/>
      <select value={cu} onChange={e=>setCu(e.target.value)} style={{width:76,padding:"14px 6px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:14,fontFamily:"inherit",color:t.tx,background:t.ip,cursor:"pointer",outline:"none"}}>{Object.keys(CUR).map(k=><option key={k} value={k}>{k}</option>)}</select>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{Object.entries(CATS).map(([k,c])=><button key={k} onClick={()=>setCat(k)} style={{padding:"5px 9px",borderRadius:10,border:cat===k?`2px solid ${c.color}`:`1.5px solid ${t.ib}`,background:cat===k?`${c.color}10`:t.ip,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:cat===k?600:400,color:cat===k?c.color:t.sb,display:"flex",alignItems:"center",gap:3}}>{ci(k,cat===k?c.color:t.sb)}{c.label}</button>)}</div>
    <input type="text" placeholder="Nota" value={nt} onChange={e=>setNt(e.target.value)} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:15,fontFamily:"inherit",marginBottom:14,color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}}/>
    <button onClick={sub} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:t.rd,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Registrar gasto</button>
  </OL>);
}

function AddI({s,d,t}){const[pr,setPr]=useState(1);const[am,setAm]=useState("");const[nt,setNt]=useState("");const[cu,setCu]=useState("COP");
  const sub=()=>{if(!am)return;d({t:"AI",p:{pid:s.ap,i:{id:Date.now(),person:pr,amount:Number(am.replace(/\./g,"")),note:nt||"Ingreso",category:"salario",currency:cu}}})};
  return(<OL close={()=>d({t:"TI"})} t={t}>
    <p style={{fontSize:17,fontWeight:600,color:t.tx,margin:"0 0 14px"}}>Nuevo ingreso</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{[{p:1,n:s.p1.name,c:t.c1},{p:2,n:s.p2.name,c:t.c2}].map(x=><button key={x.p} onClick={()=>setPr(x.p)} style={{padding:12,borderRadius:12,border:pr===x.p?`2px solid ${x.c}`:`1.5px solid ${t.ib}`,background:pr===x.p?`${x.c}0A`:t.ip,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",color:pr===x.p?x.c:t.sb}}>{x.n}</button>)}</div>
    <div style={{display:"flex",gap:8,marginBottom:12}}>
      <input type="text" inputMode="numeric" placeholder="0" value={am} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAm(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:24,fontWeight:700,fontFamily:"inherit",color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}} autoFocus/>
      <select value={cu} onChange={e=>setCu(e.target.value)} style={{width:76,padding:"14px 6px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:14,fontFamily:"inherit",color:t.tx,background:t.ip,cursor:"pointer",outline:"none"}}>{Object.keys(CUR).map(k=><option key={k} value={k}>{k}</option>)}</select>
    </div>
    <input type="text" placeholder="Nota" value={nt} onChange={e=>setNt(e.target.value)} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:15,fontFamily:"inherit",marginBottom:14,color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}}/>
    <button onClick={sub} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:t.gn,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Registrar ingreso</button>
  </OL>);
}

// Fixed
function Fix({s,d,t}){const tf=s.fx.reduce((a,f)=>a+tc(f.amount,f.currency),0);
  return(<div style={{padding:"0 16px 100px"}}>
    <div style={{padding:"14px 0 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><h2 style={{fontSize:20,fontWeight:600,color:t.tx,margin:0,letterSpacing:-0.3}}>Gastos fijos</h2><p style={{fontSize:13,color:t.sb,margin:"2px 0 0"}}>Se copian a cada quincena</p></div><button onClick={()=>d({t:"TFA"})} style={{width:36,height:36,borderRadius:12,border:"none",background:t.ac,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.plus()}</button></div>
    <div style={{padding:"14px 16px",borderRadius:14,background:t.cd,border:`1px solid ${t.bd}`,marginBottom:12,textAlign:"center"}}><p style={{fontSize:12,color:t.sb,margin:"0 0 2px"}}>Total mensual</p><p style={{fontSize:28,fontWeight:700,color:t.ac,margin:0,letterSpacing:-1}}>{fm(tf)}</p></div>
    <div style={{background:t.cd,borderRadius:16,padding:"4px 14px",border:`1px solid ${t.bd}`}}>
      {s.fx.map((f,i)=>{const c=CATS[f.category];return(<div key={f.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:i<s.fx.length-1?`1px solid ${t.bd}`:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:10,background:`${c?.color}10`,display:"flex",alignItems:"center",justifyContent:"center"}}>{ci(f.category,c?.color)}</div><div><p style={{fontSize:14,fontWeight:500,color:t.tx,margin:0}}>{f.note}</p><p style={{fontSize:11,color:t.sb,margin:0}}>{f.person===1?s.p1.name:s.p2.name}{f.shared?" · 50/50":""}</p></div></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,fontWeight:600,color:t.tx}}>{fc(f.amount,f.currency)}</span><button onClick={()=>d({t:"DF",p:f.id})} style={{width:24,height:24,borderRadius:6,border:"none",background:`${t.rd}10`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.trash()}</button></div>
      </div>)})}
    </div>
  </div>);
}

function AddF({s,d,t}){const[cat,setCat]=useState("arriendo");const[am,setAm]=useState("");const[nt,setNt]=useState("");const[pr,setPr]=useState(1);const[sh,setSh]=useState(true);const[cu,setCu]=useState("COP");const[hf,setHf]=useState(0);
  const sub=()=>{if(!am)return;d({t:"AF",p:{id:Date.now(),category:cat,amount:Number(am.replace(/\./g,"")),note:nt||CATS[cat]?.label,person:pr,shared:sh,currency:cu,half:hf}})};
  return(<OL close={()=>d({t:"TFA"})} t={t}>
    <p style={{fontSize:17,fontWeight:600,color:t.tx,margin:"0 0 14px"}}>Nuevo gasto fijo</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>{[{p:1,n:s.p1.name,c:t.c1},{p:2,n:s.p2.name,c:t.c2}].map(x=><button key={x.p} onClick={()=>setPr(x.p)} style={{padding:11,borderRadius:12,border:pr===x.p?`2px solid ${x.c}`:`1.5px solid ${t.ib}`,background:pr===x.p?`${x.c}0A`:t.ip,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",color:pr===x.p?x.c:t.sb}}>{x.n}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
      <button onClick={()=>setSh(true)} style={{padding:10,borderRadius:12,border:sh?`2px solid ${t.ac}`:`1.5px solid ${t.ib}`,background:sh?`${t.ac}08`:t.ip,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",color:sh?t.ac:t.sb}}>Compartido</button>
      <button onClick={()=>setSh(false)} style={{padding:10,borderRadius:12,border:!sh?"2px solid #FF9F43":`1.5px solid ${t.ib}`,background:!sh?"#FF9F4308":t.ip,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",color:!sh?"#FF9F43":t.sb}}>Individual</button>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10}}>
      <input type="text" inputMode="numeric" placeholder="Monto" value={am} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAm(r?Number(r).toLocaleString("es-CO"):"")}} style={{flex:1,padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:20,fontWeight:600,fontFamily:"inherit",color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}} autoFocus/>
      <select value={cu} onChange={e=>setCu(e.target.value)} style={{width:76,padding:"14px 6px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:14,fontFamily:"inherit",color:t.tx,background:t.ip,cursor:"pointer",outline:"none"}}>{Object.keys(CUR).map(k=><option key={k} value={k}>{k}</option>)}</select>
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{Object.entries(CATS).map(([k,c])=><button key={k} onClick={()=>setCat(k)} style={{padding:"5px 9px",borderRadius:10,border:cat===k?`2px solid ${c.color}`:`1.5px solid ${t.ib}`,background:cat===k?`${c.color}10`:t.ip,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:cat===k?600:400,color:cat===k?c.color:t.sb,display:"flex",alignItems:"center",gap:3}}>{ci(k,cat===k?c.color:t.sb)}{c.label}</button>)}</div>
    <input type="text" placeholder="Nota" value={nt} onChange={e=>setNt(e.target.value)} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:15,fontFamily:"inherit",marginBottom:10,color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>{[{v:0,l:"Ambas"},{v:1,l:"Q1 (1-15)"},{v:2,l:"Q2 (16-31)"}].map(x=><button key={x.v} onClick={()=>setHf(x.v)} style={{padding:9,borderRadius:10,border:hf===x.v?`2px solid ${t.ac}`:`1.5px solid ${t.ib}`,background:hf===x.v?`${t.ac}08`:t.ip,cursor:"pointer",fontSize:12,fontWeight:hf===x.v?600:400,fontFamily:"inherit",color:hf===x.v?t.ac:t.sb}}>{x.l}</button>)}</div>
    <button onClick={sub} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:t.ac,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Agregar</button>
  </OL>);
}

// Goals
function Goals({s,d,t}){const[aa,setAa]=useState({});
  const as=(id)=>{const v=aa[id];if(!v)return;const n=Number(v.replace(/\./g,""));const g=s.goals.find(x=>x.id===id);if(g)d({t:"UG",p:{id,saved:Math.min(g.saved+n,g.target)}});setAa(p=>({...p,[id]:""}))};
  return(<div style={{padding:"0 16px 100px"}}>
    <div style={{padding:"14px 0 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{fontSize:20,fontWeight:600,color:t.tx,margin:0,letterSpacing:-0.3}}>Metas</h2><button onClick={()=>d({t:"TGA"})} style={{width:36,height:36,borderRadius:12,border:"none",background:t.ac,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{I.plus()}</button></div>
    {s.goals.map(g=>{const p=Math.min(Math.round((g.saved/g.target)*100),100);return(<div key={g.id} style={{background:t.cd,borderRadius:16,padding:"18px 16px",marginBottom:10,border:`1px solid ${t.bd}`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:16,fontWeight:600,color:t.tx}}>{g.name}</span><button onClick={()=>d({t:"DG",p:g.id})} style={{background:"none",border:"none",cursor:"pointer"}}>{I.x(t.sb)}</button></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8}}><span style={{fontSize:30,fontWeight:700,color:g.color,letterSpacing:-1}}>{p}%</span><span style={{fontSize:12,color:t.sb}}>{fm(g.saved)} / {fm(g.target)}</span></div>
      <div style={{height:6,borderRadius:3,background:t.ip,overflow:"hidden",marginBottom:12}}><div style={{height:"100%",width:`${p}%`,borderRadius:3,background:g.color,transition:"width 0.5s"}}/></div>
      <div style={{display:"flex",gap:8}}><input type="text" inputMode="numeric" placeholder="Abonar..." value={aa[g.id]||""} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setAa(p=>({...p,[g.id]:r?Number(r).toLocaleString("es-CO"):""}))}} style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${t.ib}`,fontSize:14,fontFamily:"inherit",color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}}/><button onClick={()=>as(g.id)} style={{padding:"10px 18px",borderRadius:10,border:"none",background:g.color,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>Abonar</button></div>
    </div>)})}
  </div>);
}

function GoalAdd({d,t}){const[nm,setNm]=useState("");const[tg,setTg]=useState("");
  const sub=()=>{if(!nm||!tg)return;d({t:"AG",p:{id:Date.now(),name:nm,target:Number(tg.replace(/\./g,"")),saved:0,color:["#54A0FF","#26D67B","#FF6B81","#FF9F43","#C44FE2"][Math.floor(Math.random()*5)]}})};
  return(<OL close={()=>d({t:"TGA"})} t={t}>
    <p style={{fontSize:17,fontWeight:600,color:t.tx,margin:"0 0 14px"}}>Nueva meta</p>
    <input type="text" placeholder="Nombre" value={nm} onChange={e=>setNm(e.target.value)} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:16,fontFamily:"inherit",marginBottom:10,color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}} autoFocus/>
    <input type="text" inputMode="numeric" placeholder="Meta en COP" value={tg} onChange={e=>{const r=e.target.value.replace(/[^\d]/g,"");setTg(r?Number(r).toLocaleString("es-CO"):"")}} style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1.5px solid ${t.ib}`,fontSize:16,fontFamily:"inherit",marginBottom:14,color:t.tx,background:t.ip,boxSizing:"border-box",outline:"none"}}/>
    <button onClick={sub} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:t.ac,color:"#fff",fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Crear meta</button>
  </OL>);
}

// Settings
function Set({s,d,t}){const[n1,setN1]=useState(s.p1.name);const[n2,setN2]=useState(s.p2.name);
  return(<div style={{padding:"0 16px 100px"}}>
    <div style={{padding:"14px 0 12px"}}><h2 style={{fontSize:20,fontWeight:600,color:t.tx,margin:0,letterSpacing:-0.3}}>Ajustes</h2></div>
    <div style={{background:t.cd,borderRadius:16,padding:"0 16px",marginBottom:12,border:`1px solid ${t.bd}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:`1px solid ${t.bd}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,color:t.sb}}>{s.dark?I.moon():I.sun()}<span style={{fontSize:15,fontWeight:500,color:t.tx}}>Modo oscuro</span></div>
        <button onClick={()=>d({t:"DK"})} style={{width:50,height:30,borderRadius:15,border:"none",background:s.dark?t.ac:"#E5E5EA",cursor:"pointer",position:"relative",transition:"background 0.2s"}}><div style={{width:26,height:26,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:s.dark?22:2,transition:"left 0.2s",boxShadow:"0 2px 4px rgba(0,0,0,0.15)"}}/></button>
      </div>
      <div style={{padding:"16px 0"}}><p style={{fontSize:12,fontWeight:500,color:t.sb,margin:"0 0 8px"}}>Nombres</p>
        <div style={{display:"flex",gap:8}}><input value={n1} onChange={e=>setN1(e.target.value)} onBlur={()=>d({t:"SN",p:{n1,n2}})} style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${t.ib}`,fontSize:14,fontFamily:"inherit",color:t.c1,background:t.ip,fontWeight:600,boxSizing:"border-box",outline:"none"}}/><input value={n2} onChange={e=>setN2(e.target.value)} onBlur={()=>d({t:"SN",p:{n1,n2}})} style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${t.ib}`,fontSize:14,fontFamily:"inherit",color:t.c2,background:t.ip,fontWeight:600,boxSizing:"border-box",outline:"none"}}/></div>
      </div>
    </div>
    <p style={{textAlign:"center",fontSize:12,color:t.dm,margin:"20px 0"}}>Kashy v4.0</p>
  </div>);
}

// Main
export default function Kashy(){const[s,d]=useReducer(red,init);const t=th(s.dark);
  useEffect(()=>{const data=ld("kashy-v4",null);if(data)d({t:"L",p:data});else d({t:"L",p:{}})},[]);
  useEffect(()=>{if(!s.loaded)return;sv("kashy-v4",{dark:s.dark,p1:s.p1,p2:s.p2,fx:s.fx,periods:s.periods,goals:s.goals,ap:s.ap,ob:s.ob})},[s.dark,s.p1,s.p2,s.fx,s.periods,s.goals,s.ap,s.ob,s.loaded]);
  if(!s.ob)return<Onboarding d={d} t={t}/>;
  const nav=[{k:"dashboard",ic:I.home,l:"Inicio"},{k:"fixed",ic:I.pin,l:"Fijos"},{k:"goals",ic:I.target,l:"Metas"},{k:"settings",ic:I.gear,l:"Ajustes"}];
  const sc={dashboard:<Dash s={s} d={d} t={t}/>,fixed:<Fix s={s} d={d} t={t}/>,goals:<Goals s={s} d={d} t={t}/>,settings:<Set s={s} d={d} t={t}/>};
  return(<div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:t.bg,fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",WebkitFontSmoothing:"antialiased"}}>
    <div style={{padding:"14px 18px 10px",background:s.dark?"rgba(28,28,30,0.92)":"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`0.5px solid ${t.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>{I.logo(28)}<div><p style={{fontSize:18,fontWeight:700,color:t.tx,margin:0,letterSpacing:-0.5}}>Kashy</p><p style={{fontSize:11,color:t.sb,margin:0}}>{s.p1.name} & {s.p2.name}</p></div></div>
      <button onClick={()=>d({t:"DK"})} style={{width:34,height:34,borderRadius:10,background:t.ip,border:`1px solid ${t.bd}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:t.sb}}>{s.dark?I.sun():I.moon()}</button>
    </div>
    <div key={s.screen} style={{animation:"fu .2s ease"}}>{sc[s.screen]}</div>
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:s.dark?"rgba(28,28,30,0.95)":"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`0.5px solid ${t.bd}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",padding:"6px 0 env(safe-area-inset-bottom,8px)",zIndex:80}}>
      {nav.map(n=><button key={n.k} onClick={()=>d({t:"SC",p:n.k})} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 0"}}>{n.ic(s.screen===n.k)}<span style={{fontSize:10,fontWeight:s.screen===n.k?600:400,color:s.screen===n.k?t.ac:t.sb,fontFamily:"inherit"}}>{n.l}</span></button>)}
    </div>
    {s.showAdd&&<AddE s={s} d={d} t={t}/>}{s.showInc&&<AddI s={s} d={d} t={t}/>}{s.showGen&&<Gen s={s} d={d} t={t}/>}{s.showRec&&<Rec s={s} d={d} t={t}/>}{s.showGA&&<GoalAdd d={d} t={t}/>}{s.showFA&&<AddF s={s} d={d} t={t}/>}
    <style>{`@keyframes fu{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0}::-webkit-scrollbar{display:none}::selection{background:#6C5CE733}`}</style>
  </div>);
}
