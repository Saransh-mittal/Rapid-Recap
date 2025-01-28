import{j as e}from"./index-a3d480c5.js";import p from"./ButtonComponent-24cd3bb2.js";import g from"./ButtonGradient-c8de5c7c.js";import{u as x}from"./useTranslation-52ff0a70.js";import{af as f,ak as i,Q as u}from"./text-be3af777.js";import{F as t}from"./progress-83b8daad.js";import{H as o}from"./heading-e17863df.js";import"./useSafeSound-83008ed7.js";import"./loadingProgressSlice-f1f4bfd3.js";import"./i18next-c75e253c.js";import"./react-redux-f1a0caae.js";import"./use-breakpoint-value-2f8b8ce3.js";import"./index-8ad02214.js";import"./i18nInstance-5a5667a1.js";import"./button-416bd79e.js";import"./use-toast-3d7383d0.js";const h="/images/rocket.webp",Y=({score:n,isOpen:a,submitLoad:s,boost:l,onViewReport:m})=>{const{t:r}=x("BoostedSubmittedQuizInterface"),d={position:"relative",bottom:"-500%",animation:"animate-rocket 2s ease forwards, animate 0.2s ease infinite"},c={position:"relative",bottom:"-500%",animation:"animate-rocket 2s ease forwards"};return e.jsx(f,{direction:"bottom",in:a,offsetY:"20px",style:{zIndex:10},children:e.jsxs(t,{position:"relative",flexDirection:"column",w:"100%",height:"100%",justifyContent:"center",alignItems:"center",color:"white",css:`
          @property --angle {
            syntax: '<angle>';
            initial-value: 90deg;
            inherits: true;
          }

          @property --gradX {
            syntax: '<percentage>';
            initial-value: 50%;
            inherits: true;
          }

          @property --gradY {
            syntax: '<percentage>';
            initial-value: 0%;
            inherits: true;
          }

          --d: 2500ms;
          --angle: 90deg;
          --gradX: 100%;
          --gradY: 50%;
          --c1: rgba(168, 239, 255, 1);
          --c2: rgba(168, 239, 255, 0.1);

          @keyframes animate-rocket {
            0% {
              bottom: -500%;
            }
            100% {
              bottom: 5%;
            }
          }
          @keyframes borderRotate {
            100% {
              --angle: 420deg;
            }
          }
          @keyframes animate {
            0%,
            100% {
              transform: translateY(-2px);
            }
            50% {
              transform: translateY(2px);
            }
          }
        `,children:[e.jsx(o,{as:"h3",size:"lg",width:"100%",textAlign:"center",marginBottom:"1rem",children:r("quizCompletedMessage")}),e.jsxs(t,{flexDirection:"row-reverse",children:[e.jsx(t,{justifyContent:"center",alignItems:"center",w:"100%",height:"120px",backgroundColor:"transparent",marginTop:"20",children:e.jsxs(t,{flexDirection:"column",style:c,children:[e.jsx(o,{as:"h4",fontSize:"4xl",textAlign:"center",fontFamily:'"Honk", system-ui',p:0,children:r("rapidQuizMasteryScore")}),e.jsx(t,{w:"100%",children:e.jsxs(t,{w:"100%",justifyContent:"center",flexDirection:"column",fontSize:"3vw",margin:"max(1rem, 3vw)",border:"0.35rem solid",paddingX:"2vw",paddingTop:"1vw",borderRadius:"1rem",style:{borderImage:"conic-gradient(from var(--angle), var(--c2), var(--c1) 0.1turn, var(--c1) 0.15turn, var(--c2) 0.25turn) 30"},animation:"borderRotate var(--d) linear infinite forwards",children:[s?e.jsx(o,{children:r("calculating")}):e.jsx(o,{children:n}),e.jsx(i,{fontSize:"1rem",color:"yellow",backgroundColor:"rgba(255,255,255,0.1)",textShadow:"1px 1px 2px rgba(0, 0, 0, 0.4)",padding:"2px",marginTop:"auto",marginBottom:"0.5rem",children:n!==0?`${l}x ${r("boostedText")}`:`"Don't give up! Keep going!"`})]})})]})}),e.jsx(t,{justifyContent:"center",alignItems:"center",width:"120px",height:"120px",borderRadius:"50%",backgroundColor:"transparent",children:e.jsx(t,{style:d,_before:{content:'""',position:"absolute",left:"50%",bottom:"-100px",transform:"translateX(-50%)",width:"10px",height:"100px",background:"linear-gradient(#00d0ff,transparent)"},_after:{content:'""',position:"absolute",left:"50%",bottom:"-100px",transform:"translateX(-50%)",width:"10px",height:"100px",background:"linear-gradient(#00d0ff,transparent)",filter:"blur(20px)"},children:e.jsx(u,{src:h,h:"50px",w:"35px",background:"none"})})})]}),n===0?e.jsx(i,{w:"75%",textAlign:"left",color:"#FFFFFF",p:0,m:0,fontWeight:"bold",fontStyle:"italic",fontSize:"1rem",borderLeft:"5px solid #CCCCCC",paddingLeft:"10px",marginTop:"4rem",children:r("noWorryMessage")}):e.jsx(i,{w:"75%",textAlign:"left",color:"#FFFFFF",p:0,m:0,fontWeight:"bold",fontStyle:"italic",fontSize:"1rem",borderLeft:"5px solid #CCCCCC",paddingLeft:"10px",marginTop:"4rem",children:r("congratulationMessage")}),e.jsxs(t,{mt:4,children:[e.jsx(g,{}),e.jsx(p,{colorScheme:"blue",onClick:m,children:r("viewReport")})]})]})})};export{Y as default};
