import{R as y,u as C,r as t,o as e,B as x}from"./index-041a15cf.js";import{m as W,d as w}from"./styled-components.browser.esm-92612f64.js";import{C as S}from"./chunk-5MKCW436-e681aa9a.js";import{V as g}from"./chunk-NTCQBYKE-e4b63fdf.js";import{H as l}from"./chunk-3ASUQ6PA-ba96a894.js";import{T as a}from"./chunk-2OOHT3W5-bc92e1b9.js";import{F as k}from"./chunk-KRPLQIP4-7be68a51.js";import"./chunk-ZHMYA64R-fde6f26a.js";import"./chunk-G72KV6MB-a1adb129.js";import"./index-83b4c394.js";import"./chunk-R3DH46PF-f0689d26.js";const R=W`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`,z=w(x)`
  position: absolute;
  z-index: 1;
  width: 200%;
  height: 200%;
  left: -50%;
  top: ${s=>`${100-s.percent}%`};
  border-radius: 40%;
  background-color: #4299e1;
  opacity: 0.7;
  animation: ${R} 10s linear infinite;
  transition: all 1s ease;
  box-shadow: 0 0 20px #63b3ed;
`,d=w(a)`
  text-shadow: 0 0 10px currentColor;
`,L=({xp:s,level:o})=>{const{t:n}=C("ProfileExperienceLevel"),b=t.useCallback((m,u)=>Math.round(100-u/m*100),[]),f=t.useCallback((m,u)=>u-m,[]),p=100/3,j=t.useMemo(()=>o*(o+1)*10/2,[o]),c=t.useMemo(()=>(o+1)*(o+2)*10/2,[o]),h=t.useMemo(()=>f(s,c),[s,c,f]),i=t.useMemo(()=>b(c-j,h),[c,j,h,b]),r=t.useCallback(()=>i<p*1?"red.400":i<p*2?"orange.300":"green.300",[i,p]);return e.jsx(S,{maxW:"container.sm",p:6,style:{backgroundColor:"rgba(15, 13, 21, 0.8)",boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"},children:e.jsxs(g,{spacing:8,align:"stretch",children:[e.jsxs(l,{justify:"space-between",align:"center",children:[e.jsxs(g,{align:"start",spacing:1,children:[e.jsx(a,{fontSize:"sm",color:"gray.400",fontWeight:"medium",children:n("experienceProgress")}),e.jsxs(d,{fontSize:"3xl",fontWeight:"bold",color:r(),children:[n("level")," ",o]})]}),e.jsx(x,{position:"relative",width:"120px",height:"120px",children:e.jsx(x,{position:"relative",borderRadius:"50%",w:"120px",h:"120px",border:"5px solid",borderColor:r(),boxShadow:`0 0 20px ${r()}`,transition:"all 1s ease",children:e.jsxs(x,{position:"absolute",overflow:"hidden",zIndex:"2",borderRadius:"50%",w:"110px",h:"110px",border:"5px solid rgba(255, 255, 255, 0.1)",transition:"all 1s ease",children:[e.jsxs(k,{position:"absolute",top:"0",left:"0",w:"100%",h:"100%",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"24px",color:r(),zIndex:"3",children:[i,"%"]}),e.jsx(z,{percent:i})]})})})]}),e.jsxs(g,{spacing:4,align:"stretch",bg:"rgba(255, 255, 255, 0.05)",p:4,borderRadius:"md",boxShadow:"sm",children:[e.jsxs(l,{justify:"space-between",children:[e.jsxs(a,{fontWeight:"medium",color:"gray.300",children:[n("currentXp"),":"]}),e.jsx(d,{fontWeight:"bold",color:r(),children:s})]}),e.jsxs(l,{justify:"space-between",children:[e.jsxs(a,{fontWeight:"medium",color:"gray.300",children:[n("xpToNextLevel"),":"]}),e.jsx(d,{fontWeight:"bold",color:r(),children:h})]}),e.jsxs(l,{justify:"space-between",children:[e.jsxs(a,{fontWeight:"medium",color:"gray.300",children:[n("nextLevel"),":"]}),e.jsx(d,{fontWeight:"bold",color:r(),children:o+1})]})]})]})})},F=y.memo(L);export{F as default};
