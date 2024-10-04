import{u as r,t,T as e,B as s}from"./index-6c0090e7.js";import{m as a,d as m}from"./styled-components.browser.esm-79943991.js";import{a as d,M as c}from"./modal-overlay-6084290f.js";import{M as f}from"./modal-content-a058ca4f.js";import{M as x}from"./modal-header-487804c1.js";import{M as h}from"./modal-close-button-7804b3b2.js";import{M as g}from"./modal-body-89dbaed7.js";import"./use-merge-refs-9aca56e0.js";import"./call-all-1192f2a2.js";import"./transition-utils-ac1178ea.js";import"./slide-fade-cabcbae9.js";const p=a`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,y=m(e)`
  animation: ${p} 2s infinite;
`,T=({isOpen:l,onClose:i,quizLeftToGetQuizBoost:j,isStateBoosted:n})=>{const{t:o}=r("QuinBoostModal");return t.jsxs(t.Fragment,{children:[t.jsx("style",{children:`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
        `}),t.jsxs(d,{isOpen:l,onClose:i,size:"2xl",children:[t.jsx(c,{}),t.jsxs(f,{style:{backgroundColor:"#0f0d15",color:"white",borderRadius:"10px"},children:[t.jsxs(x,{textAlign:"center",p:0,bg:"transparent",borderBottom:"none",children:[t.jsxs(y,{fontSize:"4xl",fontFamily:"fantasy",color:"gold",letterSpacing:"wide",children:[o("Quin")," ",t.jsx("span",{style:{color:"crimson"},children:o("Boost")})]}),t.jsx(e,{fontSize:"sm",color:"gray.500",mt:"-3",fontStyle:"italic",children:o("levelUpSkill")})]}),t.jsx(h,{}),t.jsx(g,{children:n?t.jsxs(s,{children:[t.jsxs(s,{mt:"1rem",children:[t.jsxs(e,{fontSize:{base:"xl",md:"lg"},color:"#874CCC",textAlign:"left",mb:"4",fontFamily:"Montserrat, sans-serif",children:[t.jsx("span",{style:{fontWeight:"bold",fontStyle:"italic"},children:o("QuinBoostActive")})," ",o("EnjoyBoost"),"!"]}),t.jsxs(e,{fontSize:{base:"md",md:"md"},color:"#CDEAD5",textAlign:"left",style:{fontStyle:"italic",fontWeight:"bold"},children:["➤"," ",o("MaintainBoost")," ",t.jsx("span",{role:"img","aria-label":"thumbs-up",children:"👍"})]})]}),t.jsxs(e,{fontSize:{base:"md",md:"md"},color:"#F5DAD2",textAlign:"left",mt:"1rem",style:{fontStyle:"italic",fontWeight:"bold"},children:["➤"," ",o("ActivationBadge")]}),t.jsx(e,{fontSize:{base:"sm",md:"sm"},color:"gray.600",textAlign:"center",mt:"2rem",style:{fontStyle:"italic",fontWeight:"bold"},children:o("Note")})]}):t.jsxs(s,{mt:"1rem",children:[t.jsx(e,{fontSize:{base:"xl",md:"lg"},color:"purple.600",textAlign:"left",mb:"4",fontFamily:"Montserrat, sans-serif",fontWeight:"bold",fontStyle:"italic",children:o("QuinBoostInactive")}),t.jsxs(e,{fontSize:{base:"md",md:"md"},color:"cyan.400",textAlign:"left",fontFamily:"serif",fontStyle:"italic",fontWeight:"bold",children:["➤"," ",o("SuperchargeRQM")," ",t.jsx("span",{role:"img","aria-label":"rocket",children:"🚀"})]}),t.jsxs(e,{fontSize:{base:"md",md:"md"},color:"#C3FF93",textAlign:"left",fontWeight:"bold",fontFamily:"sans-serif",children:["➤"," ",o("TrackProgress")]})]})})]})]})]})};export{T as default};
