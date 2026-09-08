(function (root) {
  'use strict';
  // Walkable floor plan reconstructed from photographs; all units are internal.
  const obstacles = [
    {x:-3.65,z:3.05,w:2.1,d:1.55},
    {x:-0.6,z:2.65,w:1.52,d:2.15},
    {x:3.95,z:2.7,w:1.55,d:2.25},
    {x:3.8,z:-1.15,w:1.75,d:1.45},
    {x:-3.25,z:-.35,w:1.5,d:1.7},
    {x:-3.15,z:-4.25,w:2.65,d:.95},
    {x:-3.15,z:-5.73,w:3.5,d:.16},
    {x:-5.06,z:5.27,w:.65,d:.6},
    {x:-5.95,z:-.2,w:.9,d:13.6},
    {x:5.95,z:-.2,w:.9,d:13.6},
    {x:0,z:-6.85,w:12.8,d:1.1},
    {x:-3.375,z:7.3,w:6.05,d:.35},
    {x:6.1,z:7.3,w:.6,d:.35}
  ];
  function free(x,z,r=.24){
    if(x < -6.13+r || x > 6.13-r || z < -7+r || z > 11.8-r) return false;
    return !obstacles.some(o=>Math.abs(x-o.x)<o.w/2+r && Math.abs(z-o.z)<o.d/2+r);
  }
  function move(p,dx,dz){
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.09));
    for(let i=0;i<steps;i++){
      if(free(p.x+dx/steps,p.z))p.x+=dx/steps;
      if(free(p.x,p.z+dz/steps))p.z+=dz/steps;
    }
    return p;
  }
  function path(start,end){
    if(!free(end.x,end.z)) return [];
    const step=.28, xmin=-6, zmin=-6.5, w=44,h=66;
    const encode=(x,z)=>z*w+x;
    const world=k=>({x:xmin+(k%w)*step,z:zmin+Math.floor(k/w)*step});
    const node=p=>{
      const cx=Math.round((p.x-xmin)/step),cz=Math.round((p.z-zmin)/step);let best=null,distance=Infinity;
      for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
        const x=cx+dx,z=cz+dz;if(x<0||x>=w||z<0||z>=h)continue;
        const k=encode(x,z),q=world(k),dist=Math.hypot(q.x-p.x,q.z-p.z);if(dist>=distance||!free(q.x,q.z,.3))continue;
        let clear=true;const steps=Math.max(1,Math.ceil(dist/.04));for(let i=1;i<=steps;i++){if(!free(p.x+(q.x-p.x)*i/steps,p.z+(q.z-p.z)*i/steps,.24)){clear=false;break;}}
        if(clear){best=k;distance=dist;}
      }
      return best;
    };
    const s=node(start),goal=node(end);if(s===null||goal===null)return [];
    const queue=[s],prev=new Map([[s,-1]]);
    for(let k=0;k<queue.length;k++){
      const n=queue[k];if(n===goal)break;
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=n%w+dx,nz=Math.floor(n/w)+dz, next=encode(nx,nz);
        if(nx<0||nx>=w||nz<0||nz>=h||prev.has(next))continue;
        const p=world(next);if(!free(p.x,p.z,.3))continue;
        prev.set(next,n);queue.push(next);
      }
    }
    if(!prev.has(goal))return [];
    const route=[];for(let n=goal;n!==s;n=prev.get(n))route.push(world(n));
    route.reverse();route.push(end);
    // Shorten only segments that have continuous clearance.
    const clear=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.07);for(let k=1;k<=n;k++){if(!free(a.x+(b.x-a.x)*k/n,a.z+(b.z-a.z)*k/n,.29))return false;}return true;};
    const short=[];let at=start;
    while(route.length){let i=route.length-1;while(i>0&&!clear(at,route[i]))i--;at=route[i];short.push(at);route.splice(0,i+1);}
    return short;
  }
  const stops=[
    {id:'entrada',name:'Entrada',subtitle:'Una primera mirada',x:1.0,z:6.55,look:[-.2,1.6,-4.5],photo:'interior',color:'#fafafa'},
    {id:'viajes',name:'Viajes',subtitle:'Equipaje para cada destino',x:-3.7,z:5.05,look:[-6,1.6,2],photo:'viajes',color:'#66bdff'},
    {id:'personaliza',name:'Personalización',subtitle:'Tu morral, a tu manera',x:1.05,z:2.9,look:[-.7,1.5,2.65],photo:'interior',color:'#b9a0ff'},
    {id:'morrales',name:'Morrales D.C.',subtitle:'El corazón de la tienda',x:0,z:-4.7,look:[0,1.55,-6.65],photo:'morrales',color:'#eb94bc'},
    {id:'distritos',name:'Los distritos',subtitle:'Mujer, hombre y oficina',x:3.35,z:-3.1,look:[6.05,1.7,-2.6],photo:'distritos',color:'#eabe43'},
    {id:'caja',name:'Punto de pago',subtitle:'El encuentro con la marca',x:-2.6,z:-2.65,look:[-3.2,1.6,-5.6],photo:'caja',color:'#f5ca43'},
    {id:'fachada',name:'Fachada',subtitle:'La identidad hacia afuera',x:1.85,z:11.2,look:[-1.2,2,7.05],photo:'fachada',color:'#a2adba'}
  ];
  root.TottoNav={obstacles,free,move,path,stops};
  if(typeof module!=='undefined')module.exports=root.TottoNav;
})(typeof window!=='undefined'?window:globalThis);
