import{u as x,t as e,F as t,T as i}from"./index-B8m4vp_W.js";import g from"./ButtonComponent-hAdJm0ZL.js";import f from"./ButtonGradient-QWrRTp1N.js";import{S as u}from"./chunk-7254PCTD-6x3KNDqc.js";import{H as n}from"./chunk-7OLJDQMT-CH77SdyH.js";import{I as h}from"./chunk-QINAG4RG-BkGoZ3Sy.js";import"./chunk-KC77MHL3-B20NBeyd.js";import"./chunk-G72KV6MB-CR3-7XTe.js";import"./chunk-6NHXDBFO-BpOq4TiW.js";import"./chunk-SPIKMR6I-DqIkIq3A.js";const b="/images/rocket.webp",I=({score:o,isOpen:a,submitLoad:s,onViewReport:l,isBoosted:d,isQuinBoostAvailable:c})=>{const{t:r}=x("BoostedSubmittedQuizInterface"),m={position:"relative",bottom:"-500%",animation:"animate-rocket 2s ease forwards, animate 0.2s ease infinite"},p={position:"relative",bottom:"-500%",animation:"animate-rocket 2s ease forwards"};return e.jsx(u,{direction:"bottom",in:a,offsetY:"20px",style:{zIndex:10},children:e.jsxs(t,{position:"relative",flexDirection:"column",w:"100%",height:"100%",justifyContent:"center",alignItems:"center",color:"white",css:`
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
        `,children:[e.jsx(n,{as:"h3",size:"lg",width:"100%",textAlign:"center",marginBottom:"1rem",children:r("quizCompletedMessage")}),e.jsxs(t,{flexDirection:"row-reverse",children:[e.jsx(t,{justifyContent:"center",alignItems:"center",w:"100%",height:"120px",backgroundColor:"transparent",marginTop:"20",children:e.jsxs(t,{flexDirection:"column",style:p,children:[e.jsx(n,{as:"h4",fontSize:"4xl",textAlign:"center",fontFamily:'"Honk", system-ui',p:0,children:r("rapidQuizMasteryScore")}),e.jsx(t,{w:"100%",children:e.jsxs(t,{w:"100%",justifyContent:"center",flexDirection:"column",fontSize:"3vw",margin:"max(1rem, 3vw)",border:"0.35rem solid",paddingX:"2vw",paddingTop:"1vw",borderRadius:"1rem",style:{borderImage:"conic-gradient(from var(--angle), var(--c2), var(--c1) 0.1turn, var(--c1) 0.15turn, var(--c2) 0.25turn) 30"},animation:"borderRotate var(--d) linear infinite forwards",children:[s?e.jsx(n,{children:r("calculating")}):e.jsx(n,{children:o}),e.jsx(i,{fontSize:"1rem",color:"yellow",backgroundColor:"rgba(255,255,255,0.1)",textShadow:"1px 1px 2px rgba(0, 0, 0, 0.4)",padding:"2px",marginTop:"auto",marginBottom:"0.5rem",children:o!==0?d&&c?`1.75x ${r("boostedText")}`:`1.5x ${r("boostedText")}`:`"Don't give up! Keep going!"`})]})})]})}),e.jsx(t,{justifyContent:"center",alignItems:"center",width:"120px",height:"120px",borderRadius:"50%",backgroundColor:"transparent",children:e.jsx(t,{style:m,_before:{content:'""',position:"absolute",left:"50%",bottom:"-100px",transform:"translateX(-50%)",width:"10px",height:"100px",background:"linear-gradient(#00d0ff,transparent)"},_after:{content:'""',position:"absolute",left:"50%",bottom:"-100px",transform:"translateX(-50%)",width:"10px",height:"100px",background:"linear-gradient(#00d0ff,transparent)",filter:"blur(20px)"},children:e.jsx(h,{src:b,h:"50px",w:"35px",background:"none"})})})]}),o===0?e.jsx(i,{w:"75%",textAlign:"left",color:"#FFFFFF",p:0,m:0,fontWeight:"bold",fontStyle:"italic",fontSize:"1rem",borderLeft:"5px solid #CCCCCC",paddingLeft:"10px",marginTop:"4rem",children:r("noWorryMessage")}):e.jsx(i,{w:"75%",textAlign:"left",color:"#FFFFFF",p:0,m:0,fontWeight:"bold",fontStyle:"italic",fontSize:"1rem",borderLeft:"5px solid #CCCCCC",paddingLeft:"10px",marginTop:"4rem",children:r("congratulationMessage")}),e.jsxs(t,{mt:4,children:[e.jsx(f,{}),e.jsx(g,{colorScheme:"blue",onClick:l,children:r("viewReport")})]})]})})};export{I as default};
