import{j as o,e as r}from"./index.b7eb2725.js";import{a as e,r as t}from"./react-vendor.e7e33feb.js";import{a as i,b as a,k as n,m as s,B as m,T as d,F as p}from"./ui-vendor.ee1108b6.js";import{F as f}from"./App.8795376c.js";const l=e.memo((()=>{const e=i(),l=a(),c=t.useMemo((()=>{if(!l)return`${n`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `} 1s linear infinite`}),[l]),b=t.useMemo((()=>{if(!l)return`${n`
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `} 1.5s ease-in-out infinite`}),[l]);return o(p,{position:"fixed",top:"0",left:"0",right:"0",bottom:"0",bg:"gray.900",zIndex:"9999",alignItems:"center",justifyContent:"center",flexDirection:"column",children:[r(f,{}),r(m,{as:s.div,width:"100px",height:"100px",borderRadius:"50%",border:"4px solid",borderColor:"transparent",borderTopColor:e.colors.yellow[400],animation:c,mb:"4"}),r(d,{as:s.p,fontSize:"2xl",fontWeight:"bold",color:"white",animation:b,children:"Loading ..."})]})}));export{l as F};
