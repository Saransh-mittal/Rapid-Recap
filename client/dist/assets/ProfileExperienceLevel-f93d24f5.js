import{R as y,u as C,r as t,t as e,T as a,B as x,F as W}from"./index-e380d3a9.js";import{m as S,d as w}from"./styled-components.browser.esm-e6aec4ae.js";import{C as k}from"./container-f6093760.js";import{V as m}from"./v-stack-0b5798e9.js";import{H as l}from"./h-stack-4e9be7a0.js";import"./stack-449134d0.js";import"./responsive-dced3b42.js";import"./children-e94cecdb.js";const R=S`
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
`,L=({xp:s,level:o})=>{const{t:n}=C("ProfileExperienceLevel"),b=t.useCallback((u,g)=>Math.round(100-g/u*100),[]),f=t.useCallback((u,g)=>g-u,[]),p=100/3,j=t.useMemo(()=>o*(o+1)*10/2,[o]),c=t.useMemo(()=>(o+1)*(o+2)*10/2,[o]),h=t.useMemo(()=>f(s,c),[s,c,f]),i=t.useMemo(()=>b(c-j,h),[c,j,h,b]),r=t.useCallback(()=>i<p*1?"red.400":i<p*2?"orange.300":"green.300",[i,p]);return e.jsx(k,{maxW:"container.sm",p:6,style:{backgroundColor:"rgba(15, 13, 21, 0.8)",boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"},children:e.jsxs(m,{spacing:8,align:"stretch",children:[e.jsxs(l,{justify:"space-between",align:"center",children:[e.jsxs(m,{align:"start",spacing:1,children:[e.jsx(a,{fontSize:"sm",color:"gray.400",fontWeight:"medium",children:n("experienceProgress")}),e.jsxs(d,{fontSize:"3xl",fontWeight:"bold",color:r(),children:[n("level")," ",o]})]}),e.jsx(x,{position:"relative",width:"120px",height:"120px",children:e.jsx(x,{position:"relative",borderRadius:"50%",w:"120px",h:"120px",border:"5px solid",borderColor:r(),boxShadow:`0 0 20px ${r()}`,transition:"all 1s ease",children:e.jsxs(x,{position:"absolute",overflow:"hidden",zIndex:"2",borderRadius:"50%",w:"110px",h:"110px",border:"5px solid rgba(255, 255, 255, 0.1)",transition:"all 1s ease",children:[e.jsxs(W,{position:"absolute",top:"0",left:"0",w:"100%",h:"100%",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"24px",color:r(),zIndex:"3",children:[i,"%"]}),e.jsx(z,{percent:i})]})})})]}),e.jsxs(m,{spacing:4,align:"stretch",bg:"rgba(255, 255, 255, 0.05)",p:4,borderRadius:"md",boxShadow:"sm",children:[e.jsxs(l,{justify:"space-between",children:[e.jsxs(a,{fontWeight:"medium",color:"gray.300",children:[n("currentXp"),":"]}),e.jsx(d,{fontWeight:"bold",color:r(),children:s})]}),e.jsxs(l,{justify:"space-between",children:[e.jsxs(a,{fontWeight:"medium",color:"gray.300",children:[n("xpToNextLevel"),":"]}),e.jsx(d,{fontWeight:"bold",color:r(),children:h})]}),e.jsxs(l,{justify:"space-between",children:[e.jsxs(a,{fontWeight:"medium",color:"gray.300",children:[n("nextLevel"),":"]}),e.jsx(d,{fontWeight:"bold",color:r(),children:o+1})]})]})]})})},A=y.memo(L);export{A as default};
