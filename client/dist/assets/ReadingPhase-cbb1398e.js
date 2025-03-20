import{r as c,j as e}from"./index-7db6837b.js";import{M as E}from"./MainArticleContent-94cc665c.js";import{aL as g,D as a,ak as n,a8 as F,a3 as d}from"./text-998c4dcb.js";import{b as Y}from"./button-1edd38fe.js";import{B as S}from"./badge-4810fb3b.js";import{u as N}from"./useTranslation-2b5a55de.js";import{u as P}from"./use-breakpoint-value-6e235682.js";import{I as x}from"./use-toast-6a875d1a.js";import{C as w}from"./clock-4081e3bb.js";import{V as j}from"./v-stack-9e2226ee.js";import{F as V,H as D}from"./heading-5c599e46.js";import{B as O}from"./book-open-e316cd77.js";import{L as Q}from"./lightbulb-a0a3624e.js";import{C as U}from"./user-26b3bf9a.js";import{C as k}from"./container-0c42818d.js";import{T as J}from"./tooltip-dd62a826.js";import{C as K}from"./circle-check-eb943056.js";import"./react-redux-6fd37bde.js";import"./grid-d2773517.js";import"./index-0c894122.js";import"./i18nInstance-5a5667a1.js";import"./inventorySlice-8431520a.js";import"./i18next-c75e253c.js";import"./use-form-control-fee0a65b.js";const X="/images/quickclash/world_quickclash.webp",Z="/images/quickclash/politics_quickclash.webp",L="/images/quickclash/technology_quickclash.webp",ee="/images/quickclash/science_quickclash.webp",re="/images/quickclash/health_quickclash.webp",te="/images/quickclash/business_quickclash.webp",oe="/images/quickclash/sports_quickclash.webp",ie="/images/quickclash/entertainment_quickclash.webp",ae="/images/quickclash/education_quickclash.webp",ne="/images/quickclash/lifestyle_quickclash.webp",se="/images/quickclash/environment_quickclash.webp",le="/images/quickclash/food_quickclash.webp",ce="/images/quickclash/tourism_quickclash.webp",pe="/images/quickclash/crime_quickclash.webp",l=g(a),de=g(Y),he=g(S),ue=g(n),xe=i=>{if(!i)return null;const r=i.toLowerCase();return{world:X,politics:Z,technology:L,science:ee,health:re,business:te,sports:oe,entertainment:ie,education:ae,lifestyle:ne,environment:se,food:le,tourism:ce,crime:pe}[r]||null},ge=i=>{const r=Math.floor(i/60),s=i%60;return`${r}:${s.toString().padStart(2,"0")}`},me=(i,r)=>{const s={transition:"all 0.3s ease-in-out",boxShadow:"0 4px 10px rgba(0,0,0,0.2)",w:"100%",maxW:"400px"};return r?i<=10?{...s,bgGradient:"linear(to-r, red.500, orange.500)",color:"white",_hover:{bgGradient:"linear(to-r, red.600, orange.600)",transform:"translateY(-2px)"},boxShadow:"0 0 15px rgba(255, 59, 48, 0.6)",borderWidth:"1px",borderColor:"red.400"}:i<=30?{...s,bgGradient:"linear(to-r, orange.400, yellow.400)",_hover:{bgGradient:"linear(to-r, orange.500, yellow.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(237, 137, 54, 0.5)"}:i<=60?{...s,bgGradient:"linear(to-r, green.400, teal.400)",_hover:{bgGradient:"linear(to-r, green.500, teal.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(72, 187, 120, 0.4)"}:{...s,bgGradient:"linear(to-r, green.400, blue.400)",_hover:{bgGradient:"linear(to-r, green.500, blue.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(72, 187, 120, 0.4)"}:{...s,bgGradient:"linear(to-r, purple.500, purple.700)",_hover:{bgGradient:"linear(to-r, purple.600, purple.800)",transform:"translateY(-2px)",boxShadow:"0 6px 15px rgba(0,0,0,0.3)"},opacity:.9}},Ne=({article:i,timeLeft:r,onComplete:s,category:T})=>{const{t:o}=N("QuickClash"),h=c.useRef(null),q=c.useRef(null),[p,R]=c.useState(0),[t,v]=c.useState(!1),[C,I]=c.useState(!1),_=P({base:"100%",md:"800px"}),[B,m,$,z,b,M]=F("colors",["red.400","orange.400","yellow.400","green.400","blue.400","purple.400"]),W=()=>r<=10?`linear-gradient(90deg, ${B}, ${m})`:r<=30?`linear-gradient(90deg, ${m}, ${$})`:r<=60?`linear-gradient(90deg, ${z}, ${b})`:`linear-gradient(90deg, ${b}, ${M})`,A=xe(T);return c.useEffect(()=>{const u=()=>{if(!h.current)return;h.current.getBoundingClientRect().height;const G=window.innerHeight,f=window.scrollY||document.documentElement.scrollTop,y=document.documentElement.scrollHeight-G,H=Math.min(100,f/y*100);R(H),y-f<100&&v(!0)};return window.addEventListener("scroll",u),()=>window.removeEventListener("scroll",u)},[]),c.useEffect(()=>{const u=setTimeout(()=>{p<30&&!t&&I(!0)},3e4);return()=>clearTimeout(u)},[p,t]),e.jsxs(l,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.3},w:"100%",children:[e.jsxs(l,{position:"fixed",top:"10px",right:"20px",zIndex:100,initial:{opacity:0,y:-10},animate:{opacity:1,y:0},transition:{duration:.3},children:[r<=30&&e.jsx(l,{position:"absolute",top:"-2px",left:"-2px",right:"-2px",bottom:"-2px",borderRadius:"full",bg:r<=10?"rgba(254, 78, 78, 0.2)":"rgba(254, 178, 78, 0.2)",initial:{scale:1},animate:{scale:[1,1.4,1],opacity:[.6,.2,.6],transition:{duration:r<=10?.8:1.2,repeat:1/0,repeatType:"reverse"}}}),e.jsxs(he,{p:3,borderRadius:"full",display:"flex",alignItems:"center",gap:2,boxShadow:r<=10?"0 0 15px rgba(255, 59, 48, 0.5)":r<=30?"0 0 10px rgba(255, 149, 0, 0.4)":"0 4px 10px rgba(0, 0, 0, 0.3)",bg:W(),color:"white",fontWeight:"bold",initial:{scale:1},animate:r<=10?{scale:[1,1.08,1],transition:{duration:.5,repeat:1/0,repeatType:"reverse"}}:r<=30?{scale:[1,1.04,1],transition:{duration:1,repeat:1/0,repeatType:"reverse"}}:{},children:[e.jsx(x,{as:w,className:r<=10?"ticker-icon":""}),e.jsx(n,{fontWeight:"bold",children:ge(r)}),r<=10&&e.jsx(a,{as:"span",w:"8px",h:"8px",borderRadius:"full",bg:"red.100",ml:"1",className:"blinker"}),e.jsx("style",{jsx:!0,children:`
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
          `})]})]}),e.jsxs(j,{spacing:4,align:"stretch",children:[e.jsx(V,{justify:"center",mb:2,children:e.jsx(S,{colorScheme:"purple",p:2,borderRadius:"md",fontSize:"sm",children:e.jsxs(d,{children:[e.jsx(x,{as:O}),e.jsx(n,{children:o("Read carefully to answer questions")})]})})}),C&&e.jsx(l,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},p:3,borderRadius:"md",bg:"rgba(255, 214, 0, 0.1)",borderLeft:"4px solid",borderColor:"yellow.400",children:e.jsxs(d,{children:[e.jsx(x,{as:Q,color:"yellow.400"}),e.jsx(n,{fontSize:"sm",children:o("Tip: Remember to scroll through the entire article. Important information could be at the bottom!")})]})}),r<=30&&e.jsx(l,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3},p:3,borderRadius:"md",bg:"rgba(255, 50, 50, 0.1)",borderLeft:"4px solid",borderColor:"red.400",children:e.jsxs(d,{children:[e.jsx(x,{as:U,color:"red.400"}),e.jsx(n,{fontSize:"sm",children:o("Time is running out! Reading phase will end soon.")})]})}),e.jsx(a,{ref:q,borderRadius:"lg",bg:"rgba(26, 21, 39, 0.7)",p:1,boxShadow:"0 4px 20px rgba(0, 0, 0, 0.25)",border:"1px solid",borderColor:t?"green.700":"purple.800",transition:"border-color 0.3s ease",children:e.jsxs(k,{maxW:_,mx:"auto",ref:h,p:0,children:[e.jsxs(a,{mb:5,children:[e.jsx(D,{size:"lg",color:"white",mb:3,children:i.title}),e.jsxs(d,{spacing:4,color:"gray.300",fontSize:"sm",children:[e.jsx(n,{children:o("Challenge Article")}),e.jsx(n,{children:"•"}),e.jsxs(n,{children:[o("Reading Time"),": 2 ",o("minutes")]})]})]}),e.jsx(E,{imgURL:A,mainText:i?.content,articleRef:h,articleLoading:!1,themedContent:"",dictionary:i?.dictionary,importantSentences:i?.importantSentences})]})}),e.jsx(a,{position:"fixed",bottom:0,left:0,right:0,p:4,bg:"rgba(13, 10, 20, 0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid",borderColor:"whiteAlpha.200",zIndex:10,children:e.jsx(k,{maxW:"container.lg",children:e.jsxs(j,{spacing:3,align:"center",children:[e.jsx(J,{label:t?o("Article fully read!"):`${Math.round(p)}% ${o("read")}`,placement:"top",children:e.jsx(a,{w:"100%",position:"relative",children:e.jsx(a,{w:"100%",h:"4px",bg:"whiteAlpha.200",borderRadius:"full",overflow:"hidden",children:e.jsx(a,{h:"100%",w:`${p}%`,bg:t?"green.400":"purple.400",borderRadius:"full",transition:"width 0.2s, background-color 0.3s"})})})}),e.jsx(n,{fontSize:"sm",color:t?"green.300":"whiteAlpha.600",children:t?o("Article fully read!"):`${Math.round(p)}% ${o("read")}`}),e.jsxs(a,{position:"relative",w:"100%",maxW:"400px",mx:"auto",children:[t&&e.jsx(l,{position:"absolute",top:"-5px",left:"-5px",right:"-5px",bottom:"-5px",borderRadius:"lg",border:"2px solid",borderColor:r<=10?"red.400":r<=30?"orange.400":"green.400",opacity:.7,initial:{opacity:0,scale:.9},animate:{opacity:[.4,.9,.4],scale:[.99,1.01,.99],transition:{duration:r<=10?.8:r<=30?1.5:3,repeat:1/0,repeatType:"reverse"}},pointerEvents:"none"}),t&&r<=30&&e.jsxs(e.Fragment,{children:[e.jsx(l,{position:"absolute",top:"50%",left:"0",width:"12px",height:"12px",ml:"-6px",mt:"-6px",borderRadius:"full",bg:r<=10?"red.400":"orange.400",initial:{opacity:0},animate:{opacity:[1,.4,1],scale:[.8,1.2,.8],transition:{duration:1,repeat:1/0,repeatType:"loop"}}}),e.jsx(l,{position:"absolute",top:"50%",right:"0",width:"12px",height:"12px",mr:"-6px",mt:"-6px",borderRadius:"full",bg:r<=10?"red.400":"orange.400",initial:{opacity:0},animate:{opacity:[1,.4,1],scale:[.8,1.2,.8],transition:{duration:1,repeat:1/0,repeatType:"loop",delay:.5}}})]}),e.jsxs(de,{disabled:!t,size:"lg",leftIcon:r<=10?e.jsx(w,{className:"pulse-icon"}):e.jsx(K,{}),onClick:s,initial:{scale:1},whileHover:{scale:1.05,y:-2},whileTap:{scale:.95},animate:r<=10?{scale:[1,1.05,1],boxShadow:["0 0 10px rgba(255, 59, 48, 0.4)","0 0 20px rgba(255, 59, 48, 0.7)","0 0 10px rgba(255, 59, 48, 0.4)"],transition:{duration:.6,repeat:1/0,repeatType:"reverse"}}:r<=30?{y:[0,-2,0],transition:{duration:1.5,repeat:1/0,repeatType:"reverse"}}:{},...me(r,t),position:"relative",overflow:"hidden",children:[t&&r<=30&&e.jsx(a,{position:"absolute",top:"0",left:"0",height:"100%",bg:"whiteAlpha.200",width:`${r/120*100}%`,transition:"width 1s linear",zIndex:0}),e.jsx(d,{position:"relative",zIndex:1,spacing:r<=30?3:2,children:r<=10?e.jsxs(ue,{fontWeight:"bold",animate:{scale:[1,1.1,1],transition:{duration:.5,repeat:1/0,repeatType:"reverse"}},children:[o("Complete Now!")," (",r,"s)"]}):r<=30?e.jsxs(n,{fontWeight:"bold",children:[o("Complete Reading")," (",r,"s)"]}):t?e.jsx(n,{fontWeight:"bold",children:o("Complete Reading")}):e.jsx(n,{fontWeight:"bold",children:o("Continue Reading")})}),t&&r<=10&&e.jsxs(e.Fragment,{children:[e.jsx(a,{position:"absolute",top:"50%",left:"15%",width:"5px",height:"5px",borderRadius:"full",bg:"red.200",animation:"particle1 2s infinite"}),e.jsx(a,{position:"absolute",top:"20%",right:"30%",width:"3px",height:"3px",borderRadius:"full",bg:"orange.200",animation:"particle2 1.5s infinite"}),e.jsx("style",{jsx:!0,children:`
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
                      `})]})]}),t&&r<=10&&e.jsx(l,{position:"absolute",top:"0",left:"0",right:"0",bottom:"0",pointerEvents:"none",bg:"transparent",borderRadius:"lg",animate:{boxShadow:["0 0 20px 5px rgba(255, 86, 48, 0.2)","0 0 30px 10px rgba(255, 86, 48, 0.4)","0 0 20px 5px rgba(255, 86, 48, 0.2)"],transition:{duration:.8,repeat:1/0,repeatType:"reverse"}}})]}),!t&&r>10&&e.jsx(n,{fontSize:"sm",color:"whiteAlpha.600",textAlign:"center",children:o("Try to read the entire article for better quiz performance")})]})})}),e.jsx(a,{h:"130px"})]})]})};export{Ne as default};
