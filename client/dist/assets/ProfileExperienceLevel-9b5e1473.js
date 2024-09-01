import{R as w,r as t,j as e,B as d}from"./index-a83fa397.js";import{m as C,d as j}from"./styled-components.browser.esm-5e72d88e.js";import{C as y}from"./chunk-5MKCW436-a66b52a3.js";import{V as u}from"./chunk-NTCQBYKE-588abcc4.js";import{H as c}from"./chunk-3ASUQ6PA-be072380.js";import{T as n}from"./chunk-2OOHT3W5-298aa903.js";import{F as W}from"./chunk-KRPLQIP4-c3721d4b.js";import"./chunk-ZHMYA64R-b4016925.js";import"./chunk-G72KV6MB-59fe9e3c.js";import"./index-a54a3eba.js";import"./chunk-R3DH46PF-f0689d26.js";const S=C`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`,k=j(d)`
  position: absolute;
  z-index: 1;
  width: 200%;
  height: 200%;
  left: -50%;
  top: ${s=>`${100-s.percent}%`};
  border-radius: 40%;
  background-color: #4299e1;
  opacity: 0.7;
  animation: ${S} 10s linear infinite;
  transition: all 1s ease;
  box-shadow: 0 0 20px #63b3ed;
`,l=j(n)`
  text-shadow: 0 0 10px currentColor;
`,P=({xp:s,level:o})=>{const g=t.useCallback((h,m)=>Math.round(100-m/h*100),[]),b=t.useCallback((h,m)=>m-h,[]),x=100/3,f=t.useMemo(()=>o*(o+1)*10/2,[o]),a=t.useMemo(()=>(o+1)*(o+2)*10/2,[o]),p=t.useMemo(()=>b(s,a),[s,a,b]),i=t.useMemo(()=>g(a-f,p),[a,f,p,g]),r=t.useCallback(()=>i<x*1?"red.400":i<x*2?"orange.300":"green.300",[i,x]);return e.jsx(y,{maxW:"container.sm",p:6,style:{backgroundColor:"rgba(15, 13, 21, 0.8)",boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"},children:e.jsxs(u,{spacing:8,align:"stretch",children:[e.jsxs(c,{justify:"space-between",align:"center",children:[e.jsxs(u,{align:"start",spacing:1,children:[e.jsx(n,{fontSize:"sm",color:"gray.400",fontWeight:"medium",children:"Experience Progress"}),e.jsxs(l,{fontSize:"3xl",fontWeight:"bold",color:r(),children:["Level ",o]})]}),e.jsx(d,{position:"relative",width:"120px",height:"120px",children:e.jsx(d,{position:"relative",borderRadius:"50%",w:"120px",h:"120px",border:"5px solid",borderColor:r(),boxShadow:`0 0 20px ${r()}`,transition:"all 1s ease",children:e.jsxs(d,{position:"absolute",overflow:"hidden",zIndex:"2",borderRadius:"50%",w:"110px",h:"110px",border:"5px solid rgba(255, 255, 255, 0.1)",transition:"all 1s ease",children:[e.jsxs(W,{position:"absolute",top:"0",left:"0",w:"100%",h:"100%",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"24px",color:r(),zIndex:"3",children:[i,"%"]}),e.jsx(k,{percent:i})]})})})]}),e.jsxs(u,{spacing:4,align:"stretch",bg:"rgba(255, 255, 255, 0.05)",p:4,borderRadius:"md",boxShadow:"sm",children:[e.jsxs(c,{justify:"space-between",children:[e.jsx(n,{fontWeight:"medium",color:"gray.300",children:"Current XP:"}),e.jsx(l,{fontWeight:"bold",color:r(),children:s})]}),e.jsxs(c,{justify:"space-between",children:[e.jsx(n,{fontWeight:"medium",color:"gray.300",children:"XP to Next Level:"}),e.jsx(l,{fontWeight:"bold",color:r(),children:p})]}),e.jsxs(c,{justify:"space-between",children:[e.jsx(n,{fontWeight:"medium",color:"gray.300",children:"Next Level:"}),e.jsx(l,{fontWeight:"bold",color:r(),children:o+1})]})]})]})})},T=w.memo(P);export{T as default};
