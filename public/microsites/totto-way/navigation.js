(function (root) {
  'use strict';
  // Walkable floor plan reconstructed from photographs; all units are internal.
  const obstacles = [
    {x:-4.65,z:0,w:.7,d:18},{x:4.65,z:0,w:.7,d:18},
    {x:0,z:-8.65,w:10,d:.7},
    {x:-4.36,z:8.96,w:1.42,d:.4},{x:2.75,z:8.67,w:4.5,d:1.15},
    {x:-3.55,z:-.35,w:1.15,d:3.5},
    {x:-2.6,z:4.6,w:1.5,d:1.65},{x:2.55,z:4.7,w:1.5,d:1.7},
    {x:.1,z:1.9,w:1.25,d:1.05},{x:2.3,z:-.9,w:1.45,d:1.15},
    {x:-1.9,z:-3.55,w:1.4,d:1.15},{x:1.5,z:-4.35,w:1.4,d:1.1},
    {x:-3.9,z:7.5,w:.85,d:.85},{x:.25,z:-6.05,w:.85,d:.85},
    {x:1.1,z:-6.05,w:.78,d:.68},
    {x:-3.15,z:8.72,w:.17,d:.48},{x:.08,z:8.72,w:.17,d:.48}
  ];
  function free(x,z,r=.24){
    if(x < -4.9+r || x > 4.9-r || z < -8.8+r || z > 13.4-r) return false;
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
    const step=.28, xmin=-4.6, zmin=-8.2, w=34,h=78;
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
    {id:'entrada',name:'Entrada',subtitle:'Acceso amarillo · tienda 1043',x:-1.2,z:7.6,look:[0,1.7,-7],photo:'interior',color:'#f5cf35'},
    {id:'mujer',name:'Mujer',subtitle:'Prendas y accesorios en tonos suaves',x:-2.15,z:6.4,look:[-4.65,1.65,4.8],photo:'perspectiva',color:'#d4b7c2'},
    {id:'caja',name:'Punto de pago',subtitle:'Madera clara y doble atención',x:-1.75,z:-.2,look:[-4.5,1.95,-.35],photo:'caja',color:'#c8a27b'},
    {id:'kids',name:'Kids',subtitle:'Color para los más pequeños',x:-2.8,z:-5.85,look:[-4.65,1.65,-6.1],photo:'kids-colors',color:'#e58caf'},
    {id:'colors',name:'COLORS',subtitle:'Desde 1987 cargando tus historias',x:-.7,z:-7.25,look:[0,1.85,-8.7],photo:'kids-colors',color:'#83b6d6'},
    {id:'viaje',name:'Viaje',subtitle:'Maletas y equipaje',x:2.9,z:-6.75,look:[4.65,1.6,-6.3],photo:'hombre-viaje',color:'#8aab9e'},
    {id:'hombre',name:'Hombre',subtitle:'Prendas, morrales y esenciales',x:2.7,z:2.9,look:[4.65,1.7,4.6],photo:'hombre-viaje',color:'#b6a07e'},
    {id:'fachada',name:'Fachada',subtitle:'Portal amarillo · vitrina BAZY',x:-.85,z:12.8,look:[0,2.1,8.75],photo:'fachada',color:'#f5cf35'}
  ];
  root.TottoNav={obstacles,free,move,path,stops};
  if(typeof module!=='undefined')module.exports=root.TottoNav;
})(typeof window!=='undefined'?window:globalThis);
