import{j as t,F as s,B as r}from"./index-5d7f6f3b.js";const m=()=>{const e=`
    @keyframes shine {
      0% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0.5);
      }
      50% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0);
      }
      100% {
        box-shadow: 0 0 10px 0 rgba(255, 255, 0, 0.5);
      }
    }

    @keyframes bubbleTop {
      0% {
        transform: translateY(-35px) scale(1); /* Start from bottom */
        opacity: 1;
      }
      100% {
        transform: translateY(-55px) scale(0.6); /* End at top */
        opacity: 0;
      }
    }

    @keyframes bubbleBottom {
      0% {
        transform: translateY(25px) scale(1); /* Start from button position */
        opacity: 1;
      }
      100% {
        transform: translateY(45px) scale(0.6); /* Move further up and to the right */
        opacity: 0;
      }
    }

    @keyframes bubbleLeft {
      0% {
        transform: translateX(-95px) scale(1); /* Start from button position */
        opacity: 1;
      }
      100% {
        transform: translateX(-105px) scale(0.6); /* Move further up and to the right */
        opacity: 0;
      }
    }

    @keyframes bubbleRight {
      0% {
        transform: translateX(95px) scale(1); /* Start from button position */
        opacity: 1;
      }
      100% {
        transform: translateX(105px) scale(1); /* Move further up and to the right */
        opacity: 0;
      }
    }
  `,o={position:"absolute",width:"10px",height:"10px",borderRadius:"50%"};return t.jsxs(s,{css:e,children:[Array.from({length:10}).map((n,a)=>t.jsx(r,{position:"absolute",style:{...o,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,animationDelay:`${Math.random()*3}s`,background:`hsla(${Math.random()*360}, 100%, 50%, ${Math.random()*.5})`},animation:"bubbleTop 3s infinite"},a)),Array.from({length:10}).map((n,a)=>t.jsx(r,{position:"absolute",style:{...o,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,animationDelay:`${Math.random()*3}s`,background:`hsla(${Math.random()*360}, 100%, 50%, ${Math.random()*.5})`},animation:"bubbleBottom 3s infinite"},a)),Array.from({length:10}).map((n,a)=>t.jsx(r,{position:"absolute",style:{...o,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,animationDelay:`${Math.random()*3}s`,background:`hsla(${Math.random()*360}, 100%, 50%, ${Math.random()*.5})`},animation:"bubbleLeft 3s infinite"},a)),Array.from({length:10}).map((n,a)=>t.jsx(r,{position:"absolute",style:{...o,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,animationDelay:`${Math.random()*3}s`,background:`hsla(${Math.random()*360}, 100%, 50%, ${Math.random()*.5})`},animation:"bubbleRight 3s infinite"},a))]})};export{m as B};
