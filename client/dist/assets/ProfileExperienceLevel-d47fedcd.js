import{R as w,r as t,j as e,a7 as g,ak as c,T as i,J as d,F as C}from"./index-235a35bd.js";import{m as y,d as j}from"./styled-components.browser.esm-3f439feb.js";import{C as W}from"./chunk-5MKCW436-30b53929.js";const k=y`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`,S=j(d)`
  position: absolute;
  z-index: 1;
  width: 200%;
  height: 200%;
  left: -50%;
  top: ${s=>`${100-s.percent}%`};
  border-radius: 40%;
  background-color: #4299e1;
  opacity: 0.7;
  animation: ${k} 10s linear infinite;
  transition: all 1s ease;
  box-shadow: 0 0 20px #63b3ed;
`,l=j(i)`
  text-shadow: 0 0 10px currentColor;
`,P=({xp:s,level:o})=>{const b=t.useCallback((h,u)=>Math.round(100-u/h*100),[]),m=t.useCallback((h,u)=>u-h,[]),x=100/3,f=t.useMemo(()=>o*(o+1)*10/2,[o]),a=t.useMemo(()=>(o+1)*(o+2)*10/2,[o]),p=t.useMemo(()=>m(s,a),[s,a,m]),n=t.useMemo(()=>b(a-f,p),[a,f,p,b]),r=t.useCallback(()=>n<x*1?"red.400":n<x*2?"orange.300":"green.300",[n,x]);return e.jsx(W,{maxW:"container.sm",p:6,style:{backgroundColor:"rgba(15, 13, 21, 0.8)",boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"},children:e.jsxs(g,{spacing:8,align:"stretch",children:[e.jsxs(c,{justify:"space-between",align:"center",children:[e.jsxs(g,{align:"start",spacing:1,children:[e.jsx(i,{fontSize:"sm",color:"gray.400",fontWeight:"medium",children:"Experience Progress"}),e.jsxs(l,{fontSize:"3xl",fontWeight:"bold",color:r(),children:["Level ",o]})]}),e.jsx(d,{position:"relative",width:"120px",height:"120px",children:e.jsx(d,{position:"relative",borderRadius:"50%",w:"120px",h:"120px",border:"5px solid",borderColor:r(),boxShadow:`0 0 20px ${r()}`,transition:"all 1s ease",children:e.jsxs(d,{position:"absolute",overflow:"hidden",zIndex:"2",borderRadius:"50%",w:"110px",h:"110px",border:"5px solid rgba(255, 255, 255, 0.1)",transition:"all 1s ease",children:[e.jsxs(C,{position:"absolute",top:"0",left:"0",w:"100%",h:"100%",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"24px",color:r(),zIndex:"3",children:[n,"%"]}),e.jsx(S,{percent:n})]})})})]}),e.jsxs(g,{spacing:4,align:"stretch",bg:"rgba(255, 255, 255, 0.05)",p:4,borderRadius:"md",boxShadow:"sm",children:[e.jsxs(c,{justify:"space-between",children:[e.jsx(i,{fontWeight:"medium",color:"gray.300",children:"Current XP:"}),e.jsx(l,{fontWeight:"bold",color:r(),children:s})]}),e.jsxs(c,{justify:"space-between",children:[e.jsx(i,{fontWeight:"medium",color:"gray.300",children:"XP to Next Level:"}),e.jsx(l,{fontWeight:"bold",color:r(),children:p})]}),e.jsxs(c,{justify:"space-between",children:[e.jsx(i,{fontWeight:"medium",color:"gray.300",children:"Next Level:"}),e.jsx(l,{fontWeight:"bold",color:r(),children:o+1})]})]})]})})},M=w.memo(P);export{M as default};
