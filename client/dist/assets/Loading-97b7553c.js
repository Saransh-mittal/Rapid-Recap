import{s as o,t as r,v as e,j as t,F as i,B as s,m as n,T as a}from"./vendor-ui-9485c495.js";import{a as d,r as m}from"./vendor-react-7c64ad5c.js";import l from"./FixedBackground-1eafb986.js";const f=d.memo((()=>{const d=o(),f=r(),c=m.useMemo((()=>{if(!f)return`${e`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `} 1s linear infinite`}),[f]),p=m.useMemo((()=>{if(!f)return`${e`
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `} 1.5s ease-in-out infinite`}),[f]);return t.jsxs(i,{position:"fixed",top:"0",left:"0",right:"0",bottom:"0",bg:"gray.900",zIndex:"9999",alignItems:"center",justifyContent:"center",flexDirection:"column",children:[t.jsx(l,{}),t.jsx(s,{as:n.div,width:"100px",height:"100px",borderRadius:"50%",border:"4px solid",borderColor:"transparent",borderTopColor:d.colors.yellow[400],animation:c,mb:"4"}),t.jsx(a,{as:n.p,fontSize:"2xl",fontWeight:"bold",color:"white",animation:p,children:"Loading ..."})]})}));export{f as F};
