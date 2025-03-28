import{b5 as x,B as a,af as n,aV as F,r as c,a3 as Y,j as e,_ as d}from"./index-68f0fa46.js";import{M as N}from"./MainArticleContent-99e43b0b.js";import{b as P}from"./button-d45d8282.js";import{B as S}from"./badge-9418b2fb.js";import{u as V}from"./use-breakpoint-value-55d20e26.js";import{I as g}from"./use-toast-9fb164f7.js";import{C as w}from"./clock-c6b47714.js";import{V as j}from"./v-stack-aaa54b7c.js";import{F as O,H as Q}from"./heading-cdd3ea78.js";import{B as U}from"./book-open-72475a64.js";import{L as D}from"./lightbulb-71ac65ef.js";import{C as J}from"./user-1e18b67d.js";import{C as k}from"./container-3dff6972.js";import{T as K}from"./tooltip-8beaf9ba.js";import{C as X}from"./circle-check-5aea6c10.js";import"./Star-9a7ede23.js";import"./grid-beac9f42.js";import"./use-form-control-12b2b7c6.js";const Z="/images/quickclash/world_quickclash.webp",L="/images/quickclash/politics_quickclash.webp",ee="/images/quickclash/technology_quickclash.webp",re="/images/quickclash/science_quickclash.webp",ie="/images/quickclash/health_quickclash.webp",te="/images/quickclash/business_quickclash.webp",oe="/images/quickclash/sports_quickclash.webp",ae="/images/quickclash/entertainment_quickclash.webp",ne="/images/quickclash/education_quickclash.webp",se="/images/quickclash/lifestyle_quickclash.webp",le="/images/quickclash/environment_quickclash.webp",ce="/images/quickclash/food_quickclash.webp",pe="/images/quickclash/tourism_quickclash.webp",de="/images/quickclash/crime_quickclash.webp",he="/images/quickclash/special_quickclash.webp",l=x(a),ue=x(P),ge=x(S),xe=x(n),be=o=>{if(!o)return null;const r=o.toLowerCase();return{world:Z,politics:L,technology:ee,science:re,health:ie,business:te,sports:oe,entertainment:ae,education:ne,lifestyle:se,environment:le,food:ce,tourism:pe,crime:de}[r]||he},me=o=>{const r=Math.floor(o/60),s=o%60;return`${r}:${s.toString().padStart(2,"0")}`},fe=(o,r)=>{const s={transition:"all 0.3s ease-in-out",boxShadow:"0 4px 10px rgba(0,0,0,0.2)",w:"100%",maxW:"400px"};return r?o<=10?{...s,bgGradient:"linear(to-r, red.500, orange.500)",color:"white",_hover:{bgGradient:"linear(to-r, red.600, orange.600)",transform:"translateY(-2px)"},boxShadow:"0 0 15px rgba(255, 59, 48, 0.6)",borderWidth:"1px",borderColor:"red.400"}:o<=30?{...s,bgGradient:"linear(to-r, orange.400, yellow.400)",_hover:{bgGradient:"linear(to-r, orange.500, yellow.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(237, 137, 54, 0.5)"}:o<=60?{...s,bgGradient:"linear(to-r, green.400, teal.400)",_hover:{bgGradient:"linear(to-r, green.500, teal.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(72, 187, 120, 0.4)"}:{...s,bgGradient:"linear(to-r, green.400, blue.400)",_hover:{bgGradient:"linear(to-r, green.500, blue.500)",transform:"translateY(-2px)"},boxShadow:"0 0 12px rgba(72, 187, 120, 0.4)"}:{...s,bgGradient:"linear(to-r, purple.500, purple.700)",_hover:{bgGradient:"linear(to-r, purple.600, purple.800)",transform:"translateY(-2px)",boxShadow:"0 6px 15px rgba(0,0,0,0.3)"},opacity:.9}},He=({article:o,timeLeft:r,onComplete:s,category:T,completeReadingLoading:q})=>{const{t:i}=F("QuickClash"),h=c.useRef(null),R=c.useRef(null),[p,C]=c.useState(0),[t,v]=c.useState(!1),[I,_]=c.useState(!1),B=V({base:"100%",md:"800px"}),[$,b,z,M,m,W]=Y("colors",["red.400","orange.400","yellow.400","green.400","blue.400","purple.400"]),A=()=>r<=10?`linear-gradient(90deg, ${$}, ${b})`:r<=30?`linear-gradient(90deg, ${b}, ${z})`:r<=60?`linear-gradient(90deg, ${M}, ${m})`:`linear-gradient(90deg, ${m}, ${W})`,G=be(T);return c.useEffect(()=>{const u=()=>{if(!h.current)return;h.current.getBoundingClientRect().height;const H=window.innerHeight,f=window.scrollY||document.documentElement.scrollTop,y=document.documentElement.scrollHeight-H,E=Math.min(100,f/y*100);C(E),y-f<100&&v(!0)};return window.addEventListener("scroll",u),()=>window.removeEventListener("scroll",u)},[]),c.useEffect(()=>{const u=setTimeout(()=>{p<30&&!t&&_(!0)},3e4);return()=>clearTimeout(u)},[p,t]),e.jsxs(l,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.3},w:"100%",children:[e.jsxs(l,{position:"fixed",top:"10px",right:"20px",zIndex:100,initial:{opacity:0,y:-10},animate:{opacity:1,y:0},transition:{duration:.3},children:[r<=30&&e.jsx(l,{position:"absolute",top:"-2px",left:"-2px",right:"-2px",bottom:"-2px",borderRadius:"full",bg:r<=10?"rgba(254, 78, 78, 0.2)":"rgba(254, 178, 78, 0.2)",initial:{scale:1},animate:{scale:[1,1.4,1],opacity:[.6,.2,.6],transition:{duration:r<=10?.8:1.2,repeat:1/0,repeatType:"reverse"}}}),e.jsxs(ge,{p:3,borderRadius:"full",display:"flex",alignItems:"center",gap:2,boxShadow:r<=10?"0 0 15px rgba(255, 59, 48, 0.5)":r<=30?"0 0 10px rgba(255, 149, 0, 0.4)":"0 4px 10px rgba(0, 0, 0, 0.3)",bg:A(),color:"white",fontWeight:"bold",initial:{scale:1},animate:r<=10?{scale:[1,1.08,1],transition:{duration:.5,repeat:1/0,repeatType:"reverse"}}:r<=30?{scale:[1,1.04,1],transition:{duration:1,repeat:1/0,repeatType:"reverse"}}:{},children:[e.jsx(g,{as:w,className:r<=10?"ticker-icon":""}),e.jsx(n,{fontWeight:"bold",children:me(r)}),r<=10&&e.jsx(a,{as:"span",w:"8px",h:"8px",borderRadius:"full",bg:"red.100",ml:"1",className:"blinker"}),e.jsx("style",{jsx:!0,children:`
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
          `})]})]}),e.jsxs(j,{spacing:4,align:"stretch",children:[e.jsx(O,{justify:"center",mb:2,children:e.jsx(S,{colorScheme:"purple",p:2,borderRadius:"md",fontSize:"sm",children:e.jsxs(d,{children:[e.jsx(g,{as:U}),e.jsx(n,{children:i("Read carefully to answer questions")})]})})}),I&&e.jsx(l,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},p:3,borderRadius:"md",bg:"rgba(255, 214, 0, 0.1)",borderLeft:"4px solid",borderColor:"yellow.400",children:e.jsxs(d,{children:[e.jsx(g,{as:D,color:"yellow.400"}),e.jsx(n,{fontSize:"sm",children:i("Tip: Remember to scroll through the entire article. Important information could be at the bottom!")})]})}),r<=30&&e.jsx(l,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{duration:.3},p:3,borderRadius:"md",bg:"rgba(255, 50, 50, 0.1)",borderLeft:"4px solid",borderColor:"red.400",children:e.jsxs(d,{children:[e.jsx(g,{as:J,color:"red.400"}),e.jsx(n,{fontSize:"sm",children:i("Time is running out! Reading phase will end soon.")})]})}),e.jsx(a,{ref:R,borderRadius:"lg",bg:"rgba(26, 21, 39, 0.7)",p:1,boxShadow:"0 4px 20px rgba(0, 0, 0, 0.25)",border:"1px solid",borderColor:t?"green.700":"purple.800",transition:"border-color 0.3s ease",children:e.jsxs(k,{maxW:B,mx:"auto",ref:h,p:0,children:[e.jsxs(a,{mb:5,children:[e.jsx(Q,{size:"lg",color:"white",mb:3,children:o.title}),e.jsxs(d,{spacing:4,color:"gray.300",fontSize:"sm",children:[e.jsx(n,{children:i("Challenge Article")}),e.jsx(n,{children:"•"}),e.jsxs(n,{children:[i("Reading Time"),": 2 ",i("minutes")]})]})]}),e.jsx(N,{imgURL:G,mainText:o?.content,articleRef:h,articleLoading:!1,themedContent:"",dictionary:o?.dictionary,importantSentences:o?.importantSentences})]})}),e.jsx(a,{position:"fixed",bottom:0,left:0,right:0,p:4,bg:"rgba(13, 10, 20, 0.95)",backdropFilter:"blur(10px)",borderTop:"1px solid",borderColor:"whiteAlpha.200",zIndex:10,children:e.jsx(k,{maxW:"container.lg",children:e.jsxs(j,{spacing:3,align:"center",children:[e.jsx(K,{label:t?i("Article fully read!"):`${Math.round(p)}% ${i("read")}`,placement:"top",children:e.jsx(a,{w:"100%",position:"relative",children:e.jsx(a,{w:"100%",h:"4px",bg:"whiteAlpha.200",borderRadius:"full",overflow:"hidden",children:e.jsx(a,{h:"100%",w:`${p}%`,bg:t?"green.400":"purple.400",borderRadius:"full",transition:"width 0.2s, background-color 0.3s"})})})}),e.jsx(n,{fontSize:"sm",color:t?"green.300":"whiteAlpha.600",children:t?i("Article fully read!"):`${Math.round(p)}% ${i("read")}`}),e.jsxs(a,{position:"relative",w:"100%",maxW:"400px",mx:"auto",children:[t&&e.jsx(l,{position:"absolute",top:"-5px",left:"-5px",right:"-5px",bottom:"-5px",borderRadius:"lg",border:"2px solid",borderColor:r<=10?"red.400":r<=30?"orange.400":"green.400",opacity:.7,initial:{opacity:0,scale:.9},animate:{opacity:[.4,.9,.4],scale:[.99,1.01,.99],transition:{duration:r<=10?.8:r<=30?1.5:3,repeat:1/0,repeatType:"reverse"}},pointerEvents:"none"}),t&&r<=30&&e.jsxs(e.Fragment,{children:[e.jsx(l,{position:"absolute",top:"50%",left:"0",width:"12px",height:"12px",ml:"-6px",mt:"-6px",borderRadius:"full",bg:r<=10?"red.400":"orange.400",initial:{opacity:0},animate:{opacity:[1,.4,1],scale:[.8,1.2,.8],transition:{duration:1,repeat:1/0,repeatType:"loop"}}}),e.jsx(l,{position:"absolute",top:"50%",right:"0",width:"12px",height:"12px",mr:"-6px",mt:"-6px",borderRadius:"full",bg:r<=10?"red.400":"orange.400",initial:{opacity:0},animate:{opacity:[1,.4,1],scale:[.8,1.2,.8],transition:{duration:1,repeat:1/0,repeatType:"loop",delay:.5}}})]}),e.jsxs(ue,{disabled:!t,size:"lg",leftIcon:r<=10?e.jsx(w,{className:"pulse-icon"}):e.jsx(X,{}),onClick:s,isLoading:q,loadingText:i("Completing..."),initial:{scale:1},whileHover:{scale:1.05,y:-2},whileTap:{scale:.95},animate:r<=10?{scale:[1,1.05,1],boxShadow:["0 0 10px rgba(255, 59, 48, 0.4)","0 0 20px rgba(255, 59, 48, 0.7)","0 0 10px rgba(255, 59, 48, 0.4)"],transition:{duration:.6,repeat:1/0,repeatType:"reverse"}}:r<=30?{y:[0,-2,0],transition:{duration:1.5,repeat:1/0,repeatType:"reverse"}}:{},...fe(r,t),position:"relative",overflow:"hidden",children:[t&&r<=30&&e.jsx(a,{position:"absolute",top:"0",left:"0",height:"100%",bg:"whiteAlpha.200",width:`${r/120*100}%`,transition:"width 1s linear",zIndex:0}),e.jsx(d,{position:"relative",zIndex:1,spacing:r<=30?3:2,children:r<=10?e.jsxs(xe,{fontWeight:"bold",animate:{scale:[1,1.1,1],transition:{duration:.5,repeat:1/0,repeatType:"reverse"}},children:[i("Complete Now!")," (",r,"s)"]}):r<=30?e.jsxs(n,{fontWeight:"bold",children:[i("Complete Reading")," (",r,"s)"]}):t?e.jsx(n,{fontWeight:"bold",children:i("Complete Reading")}):e.jsx(n,{fontWeight:"bold",children:i("Continue Reading")})}),t&&r<=10&&e.jsxs(e.Fragment,{children:[e.jsx(a,{position:"absolute",top:"50%",left:"15%",width:"5px",height:"5px",borderRadius:"full",bg:"red.200",animation:"particle1 2s infinite"}),e.jsx(a,{position:"absolute",top:"20%",right:"30%",width:"3px",height:"3px",borderRadius:"full",bg:"orange.200",animation:"particle2 1.5s infinite"}),e.jsx("style",{jsx:!0,children:`
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
                      `})]})]}),t&&r<=10&&e.jsx(l,{position:"absolute",top:"0",left:"0",right:"0",bottom:"0",pointerEvents:"none",bg:"transparent",borderRadius:"lg",animate:{boxShadow:["0 0 20px 5px rgba(255, 86, 48, 0.2)","0 0 30px 10px rgba(255, 86, 48, 0.4)","0 0 20px 5px rgba(255, 86, 48, 0.2)"],transition:{duration:.8,repeat:1/0,repeatType:"reverse"}}})]}),!t&&r>10&&e.jsx(n,{fontSize:"sm",color:"whiteAlpha.600",textAlign:"center",children:i("Try to read the entire article for better quiz performance")})]})})}),e.jsx(a,{h:"130px"})]})]})};export{He as default};
