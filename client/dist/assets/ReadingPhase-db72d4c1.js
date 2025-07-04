import{r as a,b4 as h,B as s,ae as o,j as e,Z as p,aU as P,a2 as V}from"./index-9043770b.js";import{M as O}from"./MainArticleContent-9b19df7f.js";import{b as U}from"./button-8d032e48.js";import{B as T}from"./badge-8d9588d1.js";import{I as g}from"./use-toast-1cca39e2.js";import{C as I}from"./clock-1c92fc02.js";import{T as Q}from"./tooltip-4f9a2aed.js";import{C as Z}from"./circle-check-74f75181.js";import{u as D}from"./use-breakpoint-value-eccc13c6.js";import{V as v}from"./v-stack-0fcc8462.js";import{F as J,H as K}from"./heading-95a5b95c.js";import{B as X}from"./book-open-c5a68571.js";import{L}from"./lightbulb-ef570465.js";import{C as ee}from"./circle-alert-3a610100.js";import{C as S}from"./container-3994caa1.js";import"./Star-7a45387b.js";import"./grid-8d9dd21d.js";import"./use-form-control-789182c2.js";const re="/images/quickclash/world_quickclash.webp",ie="/images/quickclash/politics_quickclash.webp",te="/images/quickclash/technology_quickclash.webp",ne="/images/quickclash/science_quickclash.webp",ae="/images/quickclash/health_quickclash.webp",oe="/images/quickclash/business_quickclash.webp",se="/images/quickclash/sports_quickclash.webp",le="/images/quickclash/entertainment_quickclash.webp",ce="/images/quickclash/education_quickclash.webp",pe="/images/quickclash/lifestyle_quickclash.webp",de="/images/quickclash/environment_quickclash.webp",ue="/images/quickclash/food_quickclash.webp",xe="/images/quickclash/tourism_quickclash.webp",ge="/images/quickclash/crime_quickclash.webp",he="/images/quickclash/special_quickclash.webp",l=h(s),be=h(U),me=h(T),fe=h(o),ye={world:re,politics:ie,technology:te,science:ne,health:ae,business:oe,sports:se,entertainment:le,education:ce,lifestyle:pe,environment:de,food:ue,tourism:xe,crime:ge},we=r=>{if(!r)return null;const i=r.toLowerCase();return ye[i]||he},je=r=>{const i=Math.floor(r/60),t=r%60;return`${i}:${t.toString().padStart(2,"0")}`},ke=(r,i)=>{const t={transition:"all 0.3s ease-in-out",boxShadow:"0 4px 10px rgba(0,0,0,0.2)",w:"100%",maxW:"400px"};return i?r<=10?{...t,bgGradient:"linear(to-r, red.500, orange.500)",color:"white",_hover:{bgGradient:"linear(to-r, red.600, orange.600)",transform:"translateY(-2px)"},boxShadow:"0 0 15px rgba(255, 59, 48, 0.6)",borderWidth:"1px",borderColor:"red.400"}:r<=30?{...t,bgGradient:"linear(to-r, orange.400, yellow.400)",_hover:{bgGradient:"linear(to-r, orange.500, yellow.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(237, 137, 54, 0.5)"}:r<=60?{...t,bgGradient:"linear(to-r, green.400, teal.400)",_hover:{bgGradient:"linear(to-r, green.500, teal.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(72, 187, 120, 0.4)"}:{...t,bgGradient:"linear(to-r, green.400, blue.400)",_hover:{bgGradient:"linear(to-r, green.500, blue.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(72, 187, 120, 0.4)"}:{...t,bgGradient:"linear(to-r, purple.500, purple.700)",_hover:{bgGradient:"linear(to-r, purple.600, purple.800)",transform:"translateY(-2px)",boxShadow:"0 6px 15px rgba(0,0,0,0.3)"},opacity:.9}},_=a.memo(({timeLeft:r,getTimerGradient:i})=>e.jsxs(l,{position:"fixed",top:"10px",right:"20px",zIndex:100,initial:{opacity:0,y:-10},animate:{opacity:1,y:0},transition:{duration:.3},children:[r<=30&&e.jsx(l,{position:"absolute",top:"-2px",left:"-2px",right:"-2px",bottom:"-2px",borderRadius:"full",bg:r<=10?"rgba(254, 78, 78, 0.2)":"rgba(254, 178, 78, 0.2)",initial:{scale:1},animate:{scale:[1,1.4,1],opacity:[.6,.2,.6],transition:{duration:r<=10?.8:1.2,repeat:1/0,repeatType:"reverse"}}}),e.jsxs(me,{p:3,borderRadius:"full",display:"flex",alignItems:"center",gap:2,boxShadow:r<=10?"0 0 15px rgba(255, 59, 48, 0.5)":r<=30?"0 0 10px rgba(255, 149, 0, 0.4)":"0 4px 10px rgba(0, 0, 0, 0.3)",bg:i(),color:"white",fontWeight:"bold",initial:{scale:1},animate:r<=10?{scale:[1,1.08,1],transition:{duration:.5,repeat:1/0,repeatType:"reverse"}}:r<=30?{scale:[1,1.04,1],transition:{duration:1,repeat:1/0,repeatType:"reverse"}}:{},children:[e.jsx(g,{as:I,className:r<=10?"ticker-icon":""}),e.jsx(o,{fontWeight:"bold",children:je(r)}),r<=10&&e.jsx(s,{as:"span",w:"8px",h:"8px",borderRadius:"full",bg:"red.100",ml:"1",className:"blinker"}),e.jsx("style",{jsx:!0,children:`
          .ticker-icon {
            animation: tick 0.5s linear infinite;
          }
          @keyframes tick {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }
          .blinker {
            animation: blink 0.7s ease-in-out infinite;
          }
          @keyframes blink {
            0% {
              opacity: 0.2;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.2;
            }
          }
        `})]})]}));_.displayName="FloatingTimer";const $=a.memo(({scrollPercentage:r,hasScrolledToBottom:i,t})=>e.jsxs(e.Fragment,{children:[e.jsx(Q,{label:i?t("Article fully read!"):`${Math.round(r)}% ${t("read")}`,placement:"top",children:e.jsx(s,{w:"100%",position:"relative",children:e.jsx(s,{w:"100%",h:"4px",bg:"whiteAlpha.200",borderRadius:"full",overflow:"hidden",children:e.jsx(s,{h:"100%",w:`${r}%`,bg:i?"green.400":"purple.400",borderRadius:"full",transition:"width 0.2s, background-color 0.3s"})})})}),e.jsx(o,{fontSize:"sm",color:i?"green.300":"whiteAlpha.600",children:i?t("Article fully read!"):`${Math.round(r)}% ${t("read")}`})]}));$.displayName="ProgressIndicator";const A=a.memo(({timeLeft:r,hasScrolledToBottom:i,onComplete:t,completeReadingLoading:d,getButtonStyles:b,t:n})=>e.jsxs(s,{position:"relative",w:"100%",maxW:"400px",mx:"auto",children:[i&&e.jsx(l,{position:"absolute",top:"-5px",left:"-5px",right:"-5px",bottom:"-5px",borderRadius:"lg",border:"2px solid",borderColor:r<=10?"red.400":r<=30?"orange.400":"green.400",opacity:.7,initial:{opacity:0,scale:.9},animate:{opacity:[.4,.9,.4],scale:[.99,1.01,.99],transition:{duration:r<=10?.8:r<=30?1.5:3,repeat:1/0,repeatType:"reverse"}},pointerEvents:"none"}),i&&r<=30&&e.jsxs(e.Fragment,{children:[e.jsx(l,{position:"absolute",top:"50%",left:"0",width:"12px",height:"12px",ml:"-6px",mt:"-6px",borderRadius:"full",bg:r<=10?"red.400":"orange.400",initial:{opacity:0},animate:{opacity:[1,.4,1],scale:[.8,1.2,.8],transition:{duration:1,repeat:1/0,repeatType:"loop"}}}),e.jsx(l,{position:"absolute",top:"50%",right:"0",width:"12px",height:"12px",mr:"-6px",mt:"-6px",borderRadius:"full",bg:r<=10?"red.400":"orange.400",initial:{opacity:0},animate:{opacity:[1,.4,1],scale:[.8,1.2,.8],transition:{duration:1,repeat:1/0,repeatType:"loop",delay:.5}}})]}),e.jsxs(be,{disabled:!i,size:"lg",leftIcon:r<=10?e.jsx(I,{className:"pulse-icon"}):e.jsx(Z,{}),onClick:t,isLoading:d,loadingText:n("Completing..."),initial:{scale:1},whileHover:{scale:1.05,y:-2},whileTap:{scale:.95},animate:r<=10?{scale:[1,1.05,1],boxShadow:["0 0 10px rgba(255, 59, 48, 0.4)","0 0 20px rgba(255, 59, 48, 0.7)","0 0 10px rgba(255, 59, 48, 0.4)"],transition:{duration:.6,repeat:1/0,repeatType:"reverse"}}:r<=30?{y:[0,-2,0],transition:{duration:1.5,repeat:1/0,repeatType:"reverse"}}:{},...b(r,i),position:"relative",overflow:"hidden",children:[i&&r<=30&&e.jsx(s,{position:"absolute",top:"0",left:"0",height:"100%",bg:"whiteAlpha.200",width:`${r/120*100}%`,transition:"width 1s linear",zIndex:0}),e.jsx(p,{position:"relative",zIndex:1,spacing:r<=30?3:2,children:r<=10?e.jsxs(fe,{fontWeight:"bold",animate:{scale:[1,1.1,1],transition:{duration:.5,repeat:1/0,repeatType:"reverse"}},children:[n("Complete Now!")," (",r,"s)"]}):r<=30?e.jsxs(o,{fontWeight:"bold",children:[n("Complete Reading")," (",r,"s)"]}):i?e.jsx(o,{fontWeight:"bold",children:n("Complete Reading")}):e.jsx(o,{fontWeight:"bold",children:n("Continue Reading")})}),i&&r<=10&&e.jsxs(e.Fragment,{children:[e.jsx(s,{position:"absolute",top:"50%",left:"15%",width:"5px",height:"5px",borderRadius:"full",bg:"red.200",animation:"particle1 2s infinite"}),e.jsx(s,{position:"absolute",top:"20%",right:"30%",width:"3px",height:"3px",borderRadius:"full",bg:"orange.200",animation:"particle2 1.5s infinite"}),e.jsx("style",{jsx:!0,children:`
                @keyframes particle1 {
                  0% {
                    transform: translate(0, 0);
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    transform: translate(-15px, -15px);
                    opacity: 0;
                  }
                }
                @keyframes particle2 {
                  0% {
                    transform: translate(0, 0);
                    opacity: 0;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    transform: translate(10px, -20px);
                    opacity: 0;
                  }
                }
                .pulse-icon {
                  animation: pulse-icon 1s infinite;
                }
                @keyframes pulse-icon {
                  0% {
                    transform: scale(1);
                  }
                  50% {
                    transform: scale(1.2);
                  }
                  100% {
                    transform: scale(1);
                  }
                }
              `})]})]}),i&&r<=10&&e.jsx(l,{position:"absolute",top:"0",left:"0",right:"0",bottom:"0",pointerEvents:"none",bg:"transparent",borderRadius:"lg",animate:{boxShadow:["0 0 20px 5px rgba(255, 86, 48, 0.2)","0 0 30px 10px rgba(255, 86, 48, 0.4)","0 0 20px 5px rgba(255, 86, 48, 0.2)"],transition:{duration:.8,repeat:1/0,repeatType:"reverse"}}})]}));A.displayName="CompleteButton";const qe=({article:r,timeLeft:i,onComplete:t,category:d,completeReadingLoading:b})=>{const{t:n}=P("QuickClash"),u=a.useRef(null),z=a.useRef(null),[m,G]=a.useState(0),[c,M]=a.useState(!1),[E,W]=a.useState(!1),H=D({base:"100%",md:"800px"}),[w,f,j,k,y,q]=V("colors",["red.400","orange.400","yellow.400","green.400","blue.400","purple.400"]),B=a.useCallback(()=>i<=10?`linear-gradient(90deg, ${w}, ${f})`:i<=30?`linear-gradient(90deg, ${f}, ${j})`:i<=60?`linear-gradient(90deg, ${k}, ${y})`:`linear-gradient(90deg, ${y}, ${q})`,[i,w,f,j,k,y,q]),F=a.useMemo(()=>we(d),[d]);return a.useEffect(()=>{const x=()=>{if(!u.current)return;u.current.getBoundingClientRect().height;const N=window.innerHeight,C=window.scrollY||document.documentElement.scrollTop,R=document.documentElement.scrollHeight-N,Y=Math.min(100,C/R*100);G(Y),R-C<100&&M(!0)};return window.addEventListener("scroll",x),()=>window.removeEventListener("scroll",x)},[]),a.useEffect(()=>{const x=setTimeout(()=>{m<30&&!c&&W(!0)},3e4);return()=>clearTimeout(x)},[m,c]),e.jsxs(l,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.3},w:"100%",children:[e.jsx(_,{timeLeft:i,getTimerGradient:B}),e.jsxs(v,{spacing:4,align:"stretch",children:[e.jsx(J,{justify:"center",mb:2,children:e.jsx(T,{colorScheme:"purple",p:2,borderRadius:"md",fontSize:"sm",children:e.jsxs(p,{children:[e.jsx(g,{as:X}),e.jsx(o,{children:n("Read carefully to answer questions")})]})})}),E&&e.jsx(l,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},p:3,borderRadius:"md",bg:"rgba(255, 214, 0, 0.1)",borderLeft:"4px solid",borderColor:"yellow.400",children:e.jsxs(p,{children:[e.jsx(g,{as:L,color:"yellow.400"}),e.jsx(o,{fontSize:"sm",children:n("Tip: Remember to scroll through the entire article. Important information could be at the bottom!")})]})}),i<=30&&e.jsx(l,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3},p:3,borderRadius:"md",bg:"rgba(255, 50, 50, 0.1)",borderLeft:"4px solid",borderColor:"red.400",children:e.jsxs(p,{children:[e.jsx(g,{as:ee,color:"red.400"}),e.jsx(o,{fontSize:"sm",children:n("Time is running out! Reading phase will end soon.")})]})}),e.jsx(s,{ref:z,borderRadius:"lg",bg:"rgba(26, 21, 39, 0.7)",p:1,boxShadow:"0 4px 20px rgba(0, 0, 0, 0.25)",border:"1px solid",borderColor:c?"green.700":"purple.800",transition:"border-color 0.3s ease",children:e.jsxs(S,{maxW:H,mx:"auto",ref:u,p:0,children:[e.jsxs(s,{mb:5,children:[e.jsx(K,{size:"lg",color:"white",mb:3,children:r.title}),e.jsxs(p,{spacing:4,color:"gray.300",fontSize:"sm",children:[e.jsx(o,{children:n("Challenge Article")}),e.jsx(o,{children:"•"}),e.jsxs(o,{children:[n("Reading Time"),": 2 ",n("minutes")]})]})]}),e.jsx(O,{imgURL:F,mainText:r?.content,articleRef:u,articleLoading:!1,themedContent:"",dictionary:r?.dictionary,importantSentences:r?.importantSentences})]})}),e.jsx(s,{position:"fixed",bottom:0,left:0,right:0,p:4,bg:"rgba(13, 10, 20, 0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid",borderColor:"whiteAlpha.200",zIndex:10,children:e.jsx(S,{maxW:"container.lg",children:e.jsxs(v,{spacing:3,align:"center",children:[e.jsx($,{scrollPercentage:m,hasScrolledToBottom:c,t:n}),e.jsx(A,{timeLeft:i,hasScrolledToBottom:c,onComplete:t,completeReadingLoading:b,getButtonStyles:ke,t:n}),!c&&i>10&&e.jsx(o,{fontSize:"sm",color:"whiteAlpha.600",textAlign:"center",children:n("Try to read the entire article for better quiz performance")})]})})}),e.jsx(s,{h:"130px"})]})]})},Pe=a.memo(qe);export{Pe as default};
