(function(){
 'use strict';
 const T=THREE;
 const matCache=new Map(),geoCache=new Map();
 function material(color,rough=.65,metal=0){
   const key=[color,rough,metal].join('/');
   if(!matCache.has(key))matCache.set(key,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal}));
   return matCache.get(key);
 }
 const M={black:material('#161d22'),steel:material('#8a9296',.29,.78),darkSteel:material('#343c41',.37,.7),wall:material('#dadbd6',.94),floor:material('#b8b5ae',.85),white:material('#f8f5e9'),yellow:material('#f7ca31',.35,.16),rubber:material('#11171b',.92),cream:material('#eae1ce'),screen:new T.MeshBasicMaterial({color:'#b8c8ff'}),led:new T.MeshStandardMaterial({color:'#fff6e5',emissive:'#fff1d4',emissiveIntensity:3.2,roughness:.4})};
 function rounded(w,h,d,r=.045){
   r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);r=Math.max(.001,r);
   const k=[w,h,d,r].join(',');if(geoCache.has(k))return geoCache.get(k);
   const g=new T.BoxGeometry(w,h,d,4,5,4),p=g.attributes.position,n=g.attributes.normal;
   const v=new T.Vector3(),c=new T.Vector3();
   for(let i=0;i<p.count;i++){
     v.fromBufferAttribute(p,i);c.set(T.MathUtils.clamp(v.x,-w/2+r,w/2-r),T.MathUtils.clamp(v.y,-h/2+r,h/2-r),T.MathUtils.clamp(v.z,-d/2+r,d/2-r));
     const normal=v.clone().sub(c).normalize();v.copy(c).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
   }
   geoCache.set(k,g);return g;
 }
 function mesh(g,m,p,x=0,y=0,z=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
 function box(p,w,h,d,x,y,z,m=M.steel,r=0){return mesh(r?rounded(w,h,d,r):new T.BoxGeometry(w,h,d),m,p,x,y,z);}
 const cylinderCache=new Map();
 function rod(p,a,b,r,m=M.steel){const va=new T.Vector3(...a),vb=new T.Vector3(...b),length=va.distanceTo(vb),key=r+':'+length.toFixed(4);if(!cylinderCache.has(key))cylinderCache.set(key,new T.CylinderGeometry(r,r,length,8));const o=mesh(cylinderCache.get(key),m,p);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o;}
 function tube(p,points,r,m){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(new T.TubeGeometry(curve,20,r,5,false),m,p);}
 function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;}
 function labelTexture(text,sub='',opts={}){
   return canvasTexture(opts.w||1024,opts.h||256,(c,w,h)=>{
     c.fillStyle=opts.bg||'#171d23';c.fillRect(0,0,w,h);
     if(opts.border!==false){const grad=c.createLinearGradient(0,0,w,0);grad.addColorStop(0,'#edb957');grad.addColorStop(1,'#cd76a4');c.strokeStyle=grad;c.lineWidth=5;c.strokeRect(12,12,w-24,h-24);}
     c.textAlign='center';c.textBaseline='middle';c.fillStyle=opts.fg||'#fafafa';c.font=`600 ${opts.size||h*(sub?.29:.40)}px Arial, sans-serif`;c.fillText(text,w/2,h*(sub?.38:.52),w*.91);
     if(sub){c.font=`500 ${h*.14}px Arial, sans-serif`;c.fillStyle='#dce0e4';c.fillText(sub,w/2,h*.74,w*.9);}
   });
 }
 function panel(p,tex,w,h,x,y,z,glow=false){const mat=glow?new T.MeshBasicMaterial({map:tex}):new T.MeshStandardMaterial({map:tex,roughness:.8,side:T.DoubleSide});const o=mesh(new T.PlaneGeometry(w,h),mat,p,x,y,z);o.castShadow=false;return o;}
 const badgeTex=labelTexture('TOTTO','',{w:256,h:96,bg:'#17232d',border:false,size:56});
 const badgeMaterial=new T.MeshStandardMaterial({map:badgeTex,roughness:.65});
 const tagTex=canvasTexture(128,320,(c,w,h)=>{c.fillStyle='#fafaf2';c.fillRect(0,0,w,h);c.fillStyle='#f9c724';c.fillRect(0,0,w,62);c.fillRect(0,235,w,85);c.fillStyle='#17212b';c.font='bold 24px Arial';c.textAlign='center';c.fillText('TOTTO',w/2,42);c.font='15px Arial';c.fillText('VIAJA',w/2,94);c.fillText('CONTIGO',w/2,115);for(let i=0;i<3;i++){c.beginPath();c.arc(39+i%2*49,150+Math.floor(i/2)*48,14,0,Math.PI*2);c.fillStyle='#edbc29';c.fill();}c.fillStyle='#31393c';for(let i=0;i<24;i++)c.fillRect(16+i*4,273,2,27);});
 const tagMat=new T.MeshStandardMaterial({map:tagTex,side:T.DoubleSide,roughness:.75});
 function tag(g,x,y,z,scale=1){const t=mesh(new T.PlaneGeometry(.094*scale,.237*scale),tagMat,g,x,y,z);t.rotation.z=-.055;rod(g,[x,y+.1*scale,z],[x,y+.22*scale,z-.018],.0015,M.rubber);}
 const bagColors=['#173f58','#151b22','#526760','#bca0a6','#84a8c4','#d9b438','#e3d8bf','#626779','#916d83','#323b44'];
 const bagTemplates=new Map();
 function backpack(color){
   if(bagTemplates.has(color))return bagTemplates.get(color).clone(true);
   const g=new T.Group(),fabric=material(color,.92),edge=material(new T.Color(color).multiplyScalar(.63).getHex(),.89);
   box(g,.46,.61,.245,0,0,0,fabric,.095);
   box(g,.377,.26,.073,0,-.142,.134,fabric,.033);
   tube(g,[[-.2,-.23,.117],[-.222,.08,.112],[-.16,.275,.115],[0,.306,.121],[.16,.275,.115],[.222,.08,.112],[.2,-.23,.117]],.0055,edge);
   tube(g,[[-.179,-.051,.178],[-.09,-.016,.182],[.09,-.016,.182],[.179,-.052,.178]],.0034,M.steel);
   tube(g,[[-.052,.294,-.03],[-.057,.357,-.025],[.057,.357,-.025],[.052,.294,-.03]],.011,M.rubber);
   for(const side of [-1,1]){
     tube(g,[[side*.13,.245,-.098],[side*.18,.16,-.2],[side*.16,-.14,-.23],[side*.14,-.27,-.098]],.021,edge);
     box(g,.053,.18,.105,side*.217,-.135,.007,edge,.02);
   }
   const badge=mesh(new T.PlaneGeometry(.095,.037),badgeMaterial,g,0,.115,.124);badge.castShadow=false;
   box(g,.012,.035,.006,.157,-.026,.184,M.steel,.003);
   tag(g,.131,.055,.163,.48);
   bagTemplates.set(color,g);return g.clone(true);
 }
 const suitTemplates=new Map();
 function suitcase(color){
   if(suitTemplates.has(color))return suitTemplates.get(color).clone(true);
   const g=new T.Group(),shell=material(color,.34,.15),ridge=material(new T.Color(color).multiplyScalar(.89).getHex(),.32,.15);
   box(g,.54,.77,.31,0,.04,0,shell,.065);
   box(g,.546,.762,.023,0,.04,-.015,M.rubber,.01);
   box(g,.54,.77,.163,0,.04,.074,shell,.059);
   for(let i=0;i<10;i++)box(g,.437,.02,.024,0,-.247+i*.058,.155,ridge,.009);
   for(const x of [-.20,.20])for(const z of [-.09,.105]){
     const wheel=mesh(new T.CylinderGeometry(.041,.041,.045,10),M.rubber,g,x,-.382,z);wheel.rotation.z=Math.PI/2;
     const hub=mesh(new T.CylinderGeometry(.018,.018,.046,8),M.steel,g,x,-.382,z);hub.rotation.z=Math.PI/2;
   }
   for(const x of [-.093,.093])rod(g,[x,.423,-.064],[x,.62,-.064],.009,M.steel);
   box(g,.21,.035,.041,0,.63,-.064,M.rubber,.013);
   box(g,.19,.035,.055,0,.445,.03,M.rubber,.012);
   mesh(new T.PlaneGeometry(.12,.041),badgeMaterial,g,0,-.23,.18);
   tag(g,-.106,.107,.179,.80);
   suitTemplates.set(color,g);return g.clone(true);
 }
 const jacketTemplates=new Map();
 function jacket(color){
   if(jacketTemplates.has(color))return jacketTemplates.get(color).clone(true);
   const g=new T.Group(),f=material(color,.85),zip=material('#bdc5c7',.4,.55);
   box(g,.43,.58,.15,0,-.04,0,f,.06);
   for(let i=0;i<7;i++)box(g,.429,.07,.075,0,-.278+i*.074,.065,f,.025);
   for(const side of [-1,1]){
     const arm=new T.Group();arm.position.set(side*.224,.17,0);arm.rotation.z=side*.21;
     box(arm,.13,.58,.151,side*.018,-.233,0,f,.058);for(let i=0;i<6;i++)box(arm,.135,.066,.155,side*.018,-.46+i*.082,.001,f,.025);g.add(arm);
   }
   box(g,.012,.54,.013,0,-.04,.115,zip,.005);
   box(g,.16,.095,.135,0,.289,0,f,.038);
   rod(g,[-.22,.294,0],[0,.403,0],.008,M.darkSteel);rod(g,[0,.403,0],[.22,.294,0],.008,M.darkSteel);rod(g,[-.22,.294,0],[.22,.294,0],.008,M.darkSteel);
   tube(g,[[0,.402,0],[0,.47,0],[.045,.49,0],[.062,.45,0]],.007,M.steel);
   jacketTemplates.set(color,g);return g.clone(true);
 }
 function addProduct(p,obj,x,y,z,scale=1,ry=0){obj.position.set(x,y,z);obj.scale.setScalar(scale);obj.rotation.y=ry;p.add(obj);return obj;}
 function sign(p,text,w,x,y,z,sub=''){box(p,w+.10,.39,.075,x,y,z,M.steel);panel(p,labelTexture(text,sub),w,.33,x,y,z+.041,true);}
 const shadowTex=canvasTexture(128,128,(c,w,h)=>{const grad=c.createRadialGradient(64,64,0,64,64,64);grad.addColorStop(0,'rgba(0,0,0,.42)');grad.addColorStop(.45,'rgba(0,0,0,.26)');grad.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=grad;c.fillRect(0,0,w,h);});
 const shadowMat=new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,toneMapped:false});
 function contact(p,x,z,w,d,y=.016){const m=mesh(new T.PlaneGeometry(w,d),shadowMat,p,x,y,z);m.rotation.x=-Math.PI/2;m.castShadow=false;m.receiveShadow=false;return m;}
 function floorTexture(){return canvasTexture(1024,1024,(c,w,h)=>{
   const image=c.createImageData(w,h);let seed=71;
   function rand(){seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;}
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,grout=(x%256<2||y%256<2),n=(rand()-.5)*9+Math.sin(x*.051+y*.011)*1.8;image.data[i]=(grout?143:187)+n;image.data[i+1]=(grout?143:183)+n;image.data[i+2]=(grout?141:175)+n;image.data[i+3]=255;}c.putImageData(image,0,0);
 });}
 function makeLogo(){return canvasTexture(1024,420,(c,w,h)=>{
   c.lineJoin='round';c.font='900 230px Arial, sans-serif';c.textAlign='center';c.textBaseline='middle';c.strokeStyle='#fdfdfb';c.lineWidth=7;c.strokeText('TOTTO',w/2,260,965);
   c.fillStyle='#fc2b32';c.beginPath();c.arc(553,102,17,0,Math.PI*2);c.fill();c.fillStyle='#ffcf24';c.beginPath();c.arc(596,102,17,0,Math.PI*2);c.fill();
 });}
 function makeDigital(){return canvasTexture(512,1024,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#74e2c4');g.addColorStop(.22,'#a398f3');g.addColorStop(.46,'#775cd3');g.addColorStop(.65,'#ed8eaa');g.addColorStop(.78,'#ff9d70');g.addColorStop(1,'#88c7e9');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<24;i++){c.fillStyle=`rgba(240,250,255,${.04+(i%5)*.011})`;c.fillRect(0,i*47,w,5+i%4*3);}});}
 function compileInstances(root){
   root.updateMatrixWorld(true);const buckets=new Map(),remove=[];
   root.traverse(o=>{if(!o.isMesh||o.material.transparent||o.userData.keep||o.geometry.attributes.position.count>3500)return;
     const key=o.geometry.uuid+':'+o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;
     if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
   });
   let instanced=0;
   for(const objects of buckets.values()){
     if(objects.length<8)continue;const src=objects[0],i=new T.InstancedMesh(src.geometry,src.material,objects.length);i.castShadow=src.castShadow;i.receiveShadow=src.receiveShadow;
     objects.forEach((o,k)=>{i.setMatrixAt(k,o.matrixWorld);remove.push(o);});i.computeBoundingSphere();root.add(i);instanced+=objects.length;
   }
   remove.forEach(o=>o.removeFromParent());
   // Batch the remaining one-off fixtures by material to reduce GPU draw calls.
   root.updateMatrixWorld(true);const leftovers=new Map();
   root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.material.transparent||o.userData.keep)return;const k=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;if(!leftovers.has(k))leftovers.set(k,[]);leftovers.get(k).push(o);});
   for(const list of leftovers.values()){
     if(list.length<3)continue;
     const baked=list.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);return g;}),total=baked.reduce((n,g)=>n+g.attributes.position.count,0),geo=new T.BufferGeometry();
     for(const [name,size] of [['position',3],['normal',3],['uv',2]]){const data=new Float32Array(total*size);let offset=0;for(const g of baked){if(g.attributes[name])data.set(g.attributes[name].array,offset);offset+=g.attributes.position.count*size;}geo.setAttribute(name,new T.BufferAttribute(data,size));}
     const m=new T.Mesh(geo,list[0].material);m.castShadow=list[0].castShadow;m.receiveShadow=list[0].receiveShadow;root.add(m);list.forEach(o=>o.removeFromParent());baked.forEach(g=>g.dispose());
   }
   return instanced;
 }

 window.buildTottoScene=function(){
   const scene=new T.Scene();scene.background=new T.Color('#dce1e3');scene.fog=new T.Fog('#dce1e3',34,75);
   const fixed=new T.Group(),ceiling=new T.Group(),front=new T.Group();scene.add(fixed,ceiling,front);
   const white=material('#f1f1eb',.62),stone=material('#666968',.92),blue=material('#65b8dc',.42),oakTex=canvasTexture(256,512,(c,w,h)=>{
     c.fillStyle='#c8a27b';c.fillRect(0,0,w,h);
     for(let i=0;i<180;i++){c.strokeStyle=i%3?'rgba(120,82,40,.12)':'rgba(245,218,179,.28)';c.lineWidth=1+i%2;c.beginPath();c.moveTo(i*1.7,0);c.bezierCurveTo(i*1.7+8,160,i*1.7-7,380,i*1.7+2,h);c.stroke();}
   }),oak=new T.MeshStandardMaterial({map:oakTex,roughness:.73});
   const ft=floorTexture();ft.wrapS=ft.wrapT=T.RepeatWrapping;ft.repeat.set(3,5);
   const floor=new T.MeshStandardMaterial({map:ft,color:'#e6e8e9',roughness:.65,bumpMap:ft,bumpScale:.006});
   box(fixed,10,.12,18,0,-.06,0,floor);
   box(fixed,14,.12,5,0,-.06,11.5,material('#c8c3b5',.55));
   for(let i=0;i<14;i++)for(let j=0;j<5;j++)if((i+j)%3===0)box(fixed,.98,.003,.98,-6.5+i,.002,9.5+j,material('#a4a4a0',.6));
   box(fixed,.2,3.85,18,-5,1.925,0,white);box(fixed,.2,3.85,18,5,1.925,0,white);
   box(fixed,10,3.85,.2,0,1.925,-9,white);
   for(const x of [-4.86,4.86])box(fixed,.05,.1,17.7,x,.05,0,material('#a5a5a1'));
   // Pale exposed ceiling, beams, service ducts, square light panels and linear LEDs.
   box(ceiling,10,.14,18,0,3.94,0,material('#c5c8c7',.93));
   for(const z of [-7,-3,1,5,8])box(ceiling,10,.20,.18,0,3.79,z,white);
   for(const x of [-3.65,3.65]){
     box(ceiling,.09,.07,17.5,x,3.57,0,white);box(ceiling,.045,.025,17.5,x,3.525,0,M.led);
     rod(ceiling,[x+.3,3.79,-8.7],[x+.3,3.79,8.7],.06,white);
   }
   rod(ceiling,[-1.7,3.82,-8.8],[-1.7,3.82,8.8],.035,material('#b25043'));
   for(const z of [-6,-1,4]){
     for(const x of [-2.15,2.15]){
       box(ceiling,1.85,.07,1.75,x,3.45,z,white);box(ceiling,1.71,.018,1.61,x,3.405,z,M.led);
       for(const dx of [-.7,.7])rod(ceiling,[x+dx,3.49,z],[x+dx,3.85,z],.006,M.steel);
     }
     box(ceiling,1.1,.14,1.1,0,3.66,z+1.6,white);box(ceiling,.75,.01,.75,0,3.58,z+1.6,material('#a9adad'));
     for(let k=0;k<8;k++)box(ceiling,.68,.016,.025,0,3.568,z+1.34+k*.075,white);
   }
   function grid(p,w,h,z=0,y=1.45){
     for(let x=-w/2;x<=w/2+.001;x+=.17)box(p,.011,h,.013,x,y,z,white);
     for(let yy=y-h/2;yy<=y+h/2+.001;yy+=.17)box(p,w,.011,.013,0,yy,z,white);
     for(const x of [-w/2,w/2])box(p,.035,h+.06,.035,x,y,z,white);
   }
   function heading(p,text,w,x=0,y=3.1,z=.08){
     panel(p,labelTexture(text,'',{bg:'#f1f1eb',fg:'#34393b',border:false,h:128,size:63}),w,.32,x,y,z,true);
   }
   function wallSection(x,z,w,rot,title,type,colors){
     const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;fixed.add(g);grid(g,w,2.68,0,1.57);
     box(g,w,.16,.59,0,.08,.21,oak);heading(g,title,Math.min(w,2.7));
     if(type==='clothes'){
       for(const y of [1.05,2.15]){
         rod(g,[-w/2+.1,y+.5,.34],[w/2-.1,y+.5,.34],.018,white);
         for(let i=0;i<Math.floor(w/.47);i++)addProduct(g,jacket(colors[i%colors.length]),-w/2+.28+i*.47,y,.32,.92);
       }
     }else{
       const rows=type==='luggage'?3:3,sep=type==='luggage'?.91:.78;
       for(let r=0;r<rows;r++){
         const sy=.18+r*sep;box(g,w,.055,.52,0,sy,.24,oak);
         for(let i=0;i<Math.floor(w/.59);i++)addProduct(g,type==='luggage'?suitcase(colors[(i+r)%colors.length]):backpack(colors[(i+r)%colors.length]),-w/2+.32+i*.59,sy+(type==='luggage'?.37:.32),.25,type==='luggage'?.86:.83);
       }
     }return g;
   }
   const pastel=['#d4b7c2','#e3dfce','#8faba0','#b8adc9'],dark=['#3c4741','#242e3e','#b69e7d','#202428'],kids=['#e58caf','#9676ba','#76b8cc','#edbb55','#608baa'];
   wallSection(-4.72,5.35,6.1,Math.PI/2,'MUJER','clothes',pastel);
   wallSection(-4.72,-5.75,5.2,Math.PI/2,'KIDS','bags',kids);
   wallSection(4.72,5.1,6.2,-Math.PI/2,'HOMBRE','clothes',dark);
   wallSection(4.72,-.3,3.8,-Math.PI/2,'¡Siempre listos!','bags',[...pastel,...dark]);
   wallSection(4.72,-5.9,6.3,-Math.PI/2,'VIAJE','luggage',['#bdb1c6','#7f9890','#202f35','#d5b6b1','#b8a075']);
   // The back wall is a luminous COLORS display, not a photographic billboard.
   const back=new T.Group();back.position.set(0,0,-8.7);fixed.add(back);
   box(back,7.95,2.95,.10,0,1.7,-.06,blue);
   heading(back,'COLORS',3.1,0,3.28,.025);
   panel(back,labelTexture('Desde 1987 cargando tus historias','',{bg:'#c4e8f5',fg:'#374853',border:false,h:128,size:44}),4.6,.21,0,2.94,.03,true);
   for(let i=0;i<9;i++){
     const x=-3.5+i*.875;
     for(let r=0;r<4;r++){
       const y=.5+r*.61;
       for(const xx of [-.31,.31])box(back,.016,.54,.04,x+xx,y,.015,white);
       for(const yy of [-.27,.27])box(back,.63,.016,.04,x,y+yy,.015,white);
       addProduct(back,backpack(['#dca4bd','#b777a8','#9687b0','#83b6d6','#3f789e','#263c5b','#182735','#709396','#ddc585'][i]),x,y,.20,.79);
     }
   }
   box(back,8.1,.12,.6,0,.06,.18,oak);
   // Left-center double checkout, oak canopy, two white counters and dark TOTTO screen.
   const pay=new T.Group();pay.position.set(-4.67,0,-.35);pay.rotation.y=Math.PI/2;fixed.add(pay);
   box(pay,3.45,1.01,.22,0,2.78,0,oak);
   box(pay,2.06,1.03,.08,0,2.01,.05,M.black);
   const logoMat=new T.MeshBasicMaterial({map:makeLogo(),transparent:true,depthWrite:false});
   mesh(new T.PlaneGeometry(1.73,.72),logoMat,pay,0,2.05,.1);
   for(const x of [-1.27,1.27]){box(pay,.39,.88,.08,x,2.05,.04,M.led);}
   for(const x of [-.9,.9]){
     box(pay,1.5,1.03,.82,x,.515,1.12,white);
     box(pay,1.55,.065,.9,x,1.06,1.12,oak,.01);
     box(pay,.12,.2,.14,x,1.19,1.12,M.black);
     box(pay,.43,.28,.035,x,1.39,1.16,M.black,.015);
     panel(pay,labelTexture('TOTTO','',{border:false}),.39,.23,x,1.39,1.18,true);
     for(let i=0;i<3;i++)box(pay,.27,.2,.05,x-.42+i*.42,.68,1.56,material(pastel[i]),.025);
   }
   box(pay,.32,1.16,.9,0,.58,1.1,oak);
   // White mesh gondolas with oak bases, small accessories and hanging apparel.
   let featuredProduct=null;
   function island(x,z,w,d,type,colors){
     const g=new T.Group();g.position.set(x,0,z);fixed.add(g);
     box(g,w,.14,d,0,.07,0,oak);contact(fixed,x,z,w*1.4,d*1.4);
     if(type==='clothes'){
       for(const side of [-1,1]){
         for(const xx of [-w*.43,w*.43])rod(g,[xx,.14,side*d*.3],[xx,1.72,side*d*.3],.02,white);
         rod(g,[-w*.43,1.72,side*d*.3],[w*.43,1.72,side*d*.3],.02,white);
         for(let k=0;k<3;k++){
           const selected=x===-2.6&&side===1&&k===1;
           const garment=addProduct(g,jacket(selected?'#8d839a':colors[k%colors.length]),-w*.3+k*w*.3,1.22,side*d*.32,.88,side<0?Math.PI:0);
           if(selected){
             garment.userData.productId='colorfull-violeta';
             garment.traverse(o=>{if(o.isMesh)o.userData.keep=true;});
             featuredProduct=garment;
           }
         }
       }
       box(g,w,.05,d*.7,0,1.79,0,oak);
       for(let k=0;k<3;k++)for(let r=0;r<2;r++)box(g,.31,.06,.4,-w*.3+k*w*.3,1.86+r*.061,0,material(colors[k%colors.length]),.025);
     }else{
       grid(g,w,1.38,0,.89);
       for(const y of [.23,.89,1.56])box(g,w,.05,d,0,y,0,oak);
       for(const side of [-1,1])for(let r=0;r<2;r++)for(let k=0;k<3;k++)addProduct(g,backpack(colors[(k+r)%colors.length]),-w*.32+k*w*.32,.56+r*.65,side*d*.28,.59,side<0?Math.PI:0);
     }
   }
   island(-2.6,4.6,1.5,1.65,'clothes',pastel);
   island(2.55,4.7,1.5,1.7,'clothes',dark);
   island(.1,1.9,1.25,1.05,'bags',pastel);
   island(2.3,-.9,1.45,1.15,'bags',[...dark,...pastel]);
   island(-1.9,-3.55,1.4,1.15,'bags',kids);
   island(1.5,-4.35,1.4,1.1,'bags',pastel);
   function mannequin(x,z,color,angle=0){
     const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;fixed.add(g);
     box(g,.85,.12,.85,0,.06,0,white);
     const skin=material('#e6e4dc'),pants=material('#ab9b81');
     for(const xx of [-.11,.11]){rod(g,[xx,.23,0],[xx,1.02,0],.065,pants);box(g,.14,.09,.28,xx,.18,.06,white,.03);}
     addProduct(g,jacket(color),0,1.25,0,1.02);
     rod(g,[0,1.52,0],[0,1.68,0],.055,skin);
     const head=mesh(new T.SphereGeometry(.123,16,12),skin,g,0,1.81,0);head.scale.set(.84,1.13,.94);
   }
   mannequin(-3.9,7.5,'#e3dfce',-.3);
   mannequin(.25,-6.05,'#576954',.22);
   box(fixed,.78,.13,.68,1.1,.065,-6.05,white);
   addProduct(fixed,suitcase('#78836b'),1.1,.58,-6.05,1.15,.2);
   // Gray stone facade: yellow portal to the left, blue BAZY window on the right.
   box(front,10,.75,.3,0,3.59,8.98,stone);
   box(front,1.3,3.2,.3,-4.35,1.6,8.98,stone);
   box(front,.2,3.2,.3,4.9,1.6,8.98,stone);
   mesh(new T.PlaneGeometry(2.65,1.04),logoMat,front,-2.65,3.62,9.145);
   box(front,.16,3.08,.54,-3.62,1.54,8.74,M.yellow);
   box(front,4.1,.15,.54,-1.62,3.03,8.74,M.yellow);
   box(front,.09,3.2,.15,.5,1.6,9,white);
   // Slim promotional display: stylized product, no invented human photograph.
   box(front,.8,2.17,.07,-4.33,1.65,9.16,M.black);
   panel(front,labelTexture('TOTTO','MUJER',{w:512,h:1024,bg:'#d7a6b8',fg:'#ffffff',border:false,size:87}),.73,2.08,-4.33,1.65,9.2,true);
   const posterJacket=addProduct(front,jacket('#d7b5c7'),-4.33,1.6,9.25,.79);posterJacket.scale.z=.16;
   box(front,4.25,2.85,.08,2.69,1.48,8.28,blue);
   panel(front,labelTexture('MALETA BAZY','MUÉVETE MEJOR. VIAJA MEJOR.',{w:1024,h:320,bg:'#65b8dc',border:false,size:119}),3.8,1.12,2.67,2.3,8.33,true);
   for(let i=0;i<3;i++){
     box(front,.84,.14,.62,1.3+i*1.2,.07,8.62,white);
     addProduct(front,suitcase(['#d4b0ae','#222c32','#c4a19d'][i]),1.3+i*1.2,.56+(i%2)*.12,8.65,1.06+(i%2)*.18);
   }
   const glass=new T.MeshPhysicalMaterial({color:'#ddecf0',transparent:true,opacity:.055,roughness:.08,metalness:.05,depthWrite:false,side:T.DoubleSide});
   box(front,4.28,3.1,.016,2.69,1.55,9.08,glass);
   panel(front,labelTexture('1043','',{bg:'#666968',border:false,w:256,h:128,size:78}),.53,.24,4.44,3.18,9.16,true);
   for(const x of [-3.15,.08]){box(fixed,.11,1.05,.42,x,.525,8.72,white,.035);box(fixed,.17,.05,.48,x,.025,8.72,white);}
   const hemi=new T.HemisphereLight('#f3f7ff','#958b76',2.1);scene.add(hemi);
   const key=new T.DirectionalLight('#fff6e8',2.7);key.position.set(-2,8,5);key.target.position.set(0,0,-2);key.castShadow=true;
   key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:14,bottom:-14,near:.1,far:32});key.shadow.bias=-.0004;key.shadow.normalBias=.035;scene.add(key,key.target);
   for(const z of [-6,0,6]){const light=new T.PointLight('#f5f7ff',25,14,2);light.position.set(0,3.25,z);scene.add(light);}
   ceiling.traverse(o=>{if(o.isMesh)o.castShadow=false;});
   const instanceCount=compileInstances(fixed);compileInstances(ceiling);compileInstances(front);
   scene.updateMatrixWorld(true);let meshes=0,triangles=0;
   scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);}});
   return {scene,ceiling,front,key,featuredProduct,stats:{meshes,triangles,instanceCount}};
 };
})();
