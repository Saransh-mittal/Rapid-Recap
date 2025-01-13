import{R as m,r as t,j as o}from"./index-b0c029fd.js";import{H as d,aN as r,D as c,aM as i,ah as p}from"./text-9b0fe394.js";import{F as l}from"./App-b66d59c7.js";import{H as f,F as u}from"./use-toast-f6dbf3cd.js";const j=m.memo(()=>{const n=d(),e=f(),s=t.useMemo(()=>{if(!e)return`${r`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `} 1s linear infinite`},[e]),a=t.useMemo(()=>{if(!e)return`${r`
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `} 1.5s ease-in-out infinite`},[e]);return o.jsxs(u,{position:"fixed",top:"0",left:"0",right:"0",bottom:"0",bg:"gray.900",zIndex:"9999",alignItems:"center",justifyContent:"center",flexDirection:"column",children:[o.jsx(l,{}),o.jsx(c,{as:i.div,width:"100px",height:"100px",borderRadius:"50%",border:"4px solid",borderColor:"transparent",borderTopColor:n.colors.yellow[400],animation:s,mb:"4"}),o.jsx(p,{as:i.p,fontSize:"2xl",fontWeight:"bold",color:"white",animation:a,children:"Loading ..."})]})});export{j as F};
