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
     if(objects.length<3)continue;const src=objects[0],i=new T.InstancedMesh(src.geometry,src.material,objects.length);i.castShadow=src.castShadow;i.receiveShadow=src.receiveShadow;
     objects.forEach((o,k)=>{i.setMatrixAt(k,o.matrixWorld);remove.push(o);});i.computeBoundingSphere();root.add(i);instanced+=objects.length;
   }
   remove.forEach(o=>o.removeFromParent());
   // Batch the remaining one-off fixtures by material to reduce GPU draw calls.
   root.updateMatrixWorld(true);const leftovers=new Map();
   root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.material.transparent)return;const k=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;if(!leftovers.has(k))leftovers.set(k,[]);leftovers.get(k).push(o);});
   for(const list of leftovers.values()){
     if(list.length<3)continue;
     const baked=list.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);return g;}),total=baked.reduce((n,g)=>n+g.attributes.position.count,0),geo=new T.BufferGeometry();
     for(const [name,size] of [['position',3],['normal',3],['uv',2]]){const data=new Float32Array(total*size);let offset=0;for(const g of baked){if(g.attributes[name])data.set(g.attributes[name].array,offset);offset+=g.attributes.position.count*size;}geo.setAttribute(name,new T.BufferAttribute(data,size));}
     const m=new T.Mesh(geo,list[0].material);m.castShadow=list[0].castShadow;m.receiveShadow=list[0].receiveShadow;root.add(m);list.forEach(o=>o.removeFromParent());baked.forEach(g=>g.dispose());
   }
   return instanced;
 }
 window.buildTottoScene=function(){
   const scene=new T.Scene();scene.background=new T.Color('#abb8c0');scene.fog=new T.Fog('#afb5b5',28,65);
   const fixed=new T.Group(),ceiling=new T.Group(),front=new T.Group();scene.add(fixed,ceiling,front);
   const ft=floorTexture();ft.wrapS=ft.wrapT=T.RepeatWrapping;ft.repeat.set(4,6);const fm=new T.MeshStandardMaterial({map:ft,roughness:.61,metalness:.05,bumpMap:ft,bumpScale:.012});
   box(fixed,13,.14,15,0,-.07,0,fm);
   box(fixed,18,.15,6,0,-.075,10.5,material('#bfc3c3',.28,.19));
   // Wall volumes and illuminated perimeter skirting.
   box(fixed,.20,4.05,15,-6.5,2.025,0,M.wall);box(fixed,.20,4.05,15,6.5,2.025,0,M.wall);box(fixed,13,4.05,.2,0,2.025,-7.5,M.wall);
   box(fixed,12.7,.035,.028,0,.12,-7.36,M.led);
   for(const x of [-6.36,6.36])box(fixed,.025,.035,14.4,x,.12,-.02,M.led);
   box(ceiling,13,.18,15,0,4.13,0,M.black);
   for(const z of [-6,-2.5,1,4.7]){
     box(ceiling,12.55,.14,.12,0,3.87,z,M.darkSteel);
     box(ceiling,12.3,.025,.044,0,3.79,z,M.led);
   }
   for(const x of [-4.7,4.7]){box(ceiling,.1,.1,12.5,x,3.83,-.6,M.darkSteel);box(ceiling,.043,.025,12.5,x,3.77,-.6,M.led);}
   for(const z of [-5,-1,3]){
     for(const x of [-5.5,-2.75,0,2.75,5.5]){
       const lamp=mesh(new T.CylinderGeometry(.087,.095,.14,12),M.black,ceiling,x,3.76,z);lamp.rotation.z=x*.03;
       const lens=mesh(new T.CircleGeometry(.069,12),M.led,ceiling,x,3.68,z);lens.rotation.x=Math.PI/2;
     }
   }
   for(const x of [-2.8,2.8])rod(ceiling,[x,4,-7.3],[x,4,7.3],.025,material('#713d32',.65,.28));
   // Back wall: four rows of rounded fabric backpacks, school districts at either end.
   const back=new T.Group();back.position.set(0,0,-6.96);fixed.add(back);
   for(let i=0;i<11;i++){
     const x=-5.25+i*1.05;
     box(back,.025,2.77,.033,x,1.54,0,M.steel);
     for(let row=0;row<4;row++){
       const color=bagColors[(i+row*(i%2?2:3))%bagColors.length];
       const bp=backpack(color);addProduct(back,bp,x,.46+row*.71,.17,.94,(i%3-1)*.06);
       rod(back,[x,.8+row*.71,0],[x,.8+row*.71,.22],.009,M.steel);
     }
   }
   for(let k=0;k<5;k++)box(back,2.05,.07,.62,-4.2+k*2.1,.08,.15,M.steel);
   for(const x of [-2.55,2.55])box(back,.055,2.7,.76,x,1.43,.1,M.wall,.02);
   sign(back,'Morrales D.C.',3.35,0,3.37,.11);
   panel(back,labelTexture('SOMOS EXPERTOS DESDE 1987','',{h:128,border:false,size:54}),3.22,.18,0,3.07,.17,true);
   sign(back,'NIÑO',1.5,-4.3,3.17,.12);sign(back,'NIÑA',1.5,4.3,3.17,.12);
   // Left wall: the travel wall with brushed metal shelves and light under every shelf.
   const travel=new T.Group();travel.position.set(-6.24,0,0);travel.rotation.y=Math.PI/2;fixed.add(travel);
   box(travel,12.9,2.99,.07,0,1.64,-.02,material('#a8a8a1',.5,.4));
   for(const y of [.13,1.23,2.37,3.4]){
     box(travel,12.8,.065,.67,0,y,.28,M.steel);
     if(y>.2)box(travel,12.65,.023,.036,0,y-.04,.58,M.led);
   }
   const colors=['#89b4d8','#152630','#6d9b92','#d8c2a5','#e3bd37','#536c7e'];
   for(let c=0;c<15;c++)for(let row=0;row<3;row++){
     const x=-6+c*.855;
     addProduct(travel,suitcase(colors[(c+row*2)%colors.length]),x,.13+row*1.125+.414,.29,row===2?.84:.97,.04*(c%3-1));
   }
   sign(travel,'Estación de viajes',3.2,1.5,3.71,.15);sign(travel,'Artículo personal',2,-3.6,3.71,.15);
   // Right wall: district rails, apparel and small bag shelves.
   const right=new T.Group();right.position.set(6.25,0,0);right.rotation.y=-Math.PI/2;fixed.add(right);
   for(let i=0;i<9;i++){const x=-5.7+i*1.43;box(right,.03,2.93,.04,x,1.61,0,M.steel);}
   for(const y of [1.1,2.28]){
     rod(right,[-6,y+.48,.37],[6,y+.48,.37],.018,M.steel);
     for(let i=0;i<21;i++){
       const color=['#2e4a4d','#1f405a','#263239','#d8d4c6','#dcba3d','#c3a6b7'][Math.floor(i/4)%6];
       addProduct(right,jacket(color),-5.85+i*.58,y,.27,1.04,(i%2)*.12);
     }
   }
   sign(right,'Distrito Hombre',3.1,-3.9,3.4,.1);sign(right,'Distrito Mujer',3.1,3.8,3.4,.1);
   box(right,1.44,2.92,.16,0,1.68,.12,M.steel);
   panel(right,labelTexture('Esenciales','PARA LA OFICINA',{w:512,h:512,bg:'#8176ac',border:false,size:68}),1.32,1.1,0,2.6,.205,true);
   for(let i=0;i<3;i++){
     box(right,1.35,.035,.51,0,.35+i*.64,.34,M.steel);
     addProduct(right,backpack(bagColors[i*2]),0,.69+i*.64,.43,.93);
   }
   function plinth(x,z,w,d,height=.14,col=M.darkSteel){box(fixed,w,height,d,x,height/2,z,col,.015);contact(fixed,x,z,w*1.5,d*1.5);return height;}
   // Entrance travel island.
   plinth(-3.65,3.05,2.1,1.55,.16);box(fixed,2.03,.025,1.48,-3.65,.174,3.05,material('#5368b0',.44));
   [[-4.23,3.35,1.03],[-3.54,3.3,1.17],[-2.92,3.08,.92],[-4.1,2.68,.88]].forEach((p,i)=>addProduct(fixed,suitcase(['#1e2e39','#87abd4','#a2b4ca','#94b7d7'][i]),p[0],.17+.42*p[2],p[1],p[2],-.13));
   // Personalisation island and its luminous totem.
   plinth(-.6,2.65,1.52,2.15,.16);
   box(fixed,1.45,.025,2.05,-.6,.17,2.65,material('#395cc3',.4,.1));
   const totem=new T.Group();totem.position.set(-.6,0,2.35);fixed.add(totem);
   box(totem,1.27,2.2,.15,0,1.3,0,M.darkSteel,.024);
   const personal=canvasTexture(512,1024,(c,w,h)=>{const grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#c6bce9');grad.addColorStop(.6,'#a19bdc');grad.addColorStop(1,'#486ce9');c.fillStyle=grad;c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='600 45px Arial';c.fillText('TU IDEA.',44,115);c.fillText('TU ESTILO.',44,175);c.font='500 26px Arial';c.fillText('PERSONALIZA',44,243);c.fillText('TUS PRODUCTOS',44,282);c.save();c.translate(49,925);c.rotate(-Math.PI/2);c.font='bold 58px Arial';c.fillStyle='rgba(255,255,255,.65)';c.fillText('HAZLO TUYO',0,0);c.restore();});
   panel(totem,personal,1.18,2.1,0,1.3,.08,true);
   const backPanel=panel(totem,personal,1.18,2.1,0,1.3,-.08,true);backPanel.rotation.y=Math.PI;
   addProduct(totem,backpack('#162b45'),.24,1.13,.36,1.19);
   box(totem,.63,.62,.57,.22,.46,.32,M.darkSteel,.015);
   addProduct(fixed,backpack('#e0dfd7'),-1.02,.55,3.31,1.0,.1);
   addProduct(fixed,backpack('#2c526d'),-.19,.55,3.32,1.0,-.11);
   // Clothing islands.
   function clothingIsland(x,z,w,d){
     plinth(x,z,w,d,.12);
     for(const zz of [-d*.41,d*.41]){
       rod(fixed,[x-w*.43,.14,z+zz],[x-w*.43,1.79,z+zz],.027,M.darkSteel);
       rod(fixed,[x+w*.43,.14,z+zz],[x+w*.43,1.79,z+zz],.027,M.darkSteel);
       rod(fixed,[x-w*.43,1.79,z+zz],[x+w*.43,1.79,z+zz],.023,M.steel);
       for(let i=0;i<5;i++)addProduct(fixed,jacket(['#203943','#284b4a','#344449','#243e57','#b9b8b1'][i]),x-w*.34+i*w*.17,1.305,z+zz,1.0,zz>0?0:Math.PI);
     }
   }
   clothingIsland(3.95,2.7,1.55,2.25);
   plinth(3.8,-1.15,1.75,1.45,.12);
   box(fixed,1.69,.075,1.37,3.8,.95,-1.15,M.steel,.012);
   for(let col=0;col<3;col++)for(let layer=0;layer<5;layer++)box(fixed,.42,.037,.44,3.26+col*.51,1.015+layer*.04,-1.12,material(['#b9c9d5','#dddacf','#d5b253'][col],.98),.016);
   // Accessories display with steel grid and bottles.
   plinth(-3.25,-.35,1.5,1.7,.11);
   for(const x of [-3.87,-2.63])for(const z of [-1.07,.37])rod(fixed,[x,.12,z],[x,1.88,z],.021,M.darkSteel);
   for(const y of [.24,.78,1.3,1.83])box(fixed,1.37,.04,1.49,-3.25,y,-.35,M.darkSteel);
   const bottleMat=['#9ebbd0','#dbb5c3','#20383d','#c6c9b8'].map(c=>material(c,.35,.12));
   for(let row=0;row<3;row++)for(let col=0;col<5;col++){
     const x=-3.78+col*.263,y=.4+row*.535;
     mesh(new T.CylinderGeometry(.063,.068,.26,10),bottleMat[(row+col)%4],fixed,x,y,.15);
     mesh(new T.CylinderGeometry(.056,.056,.046,10),M.darkSteel,fixed,x,y+.15,.15);
     addProduct(fixed,backpack(bagColors[(col+row*2)%10]),x,y+.014,-.70,.41,Math.PI);
   }
   sign(fixed,'Accesorios',1.38,-3.25,2.01,.36);
   // Payment desk and its iridescent branded backdrop.
   const pay=new T.Group();pay.position.set(-3.15,0,-4.25);fixed.add(pay);
   box(pay,2.65,1.08,.95,0,.54,0,M.yellow,.01);
   box(pay,2.54,1.025,.015,0,.527,.485,M.steel);
   box(pay,2.7,.065,1.02,0,1.11,0,M.darkSteel,.02);
   box(pay,.12,.20,.16,.47,1.235,-.05,M.black,.01);
   const screen=box(pay,.49,.32,.045,.47,1.42,-.1,M.black,.015);screen.rotation.x=-.15;
   panel(pay,labelTexture('TOTTO','BIENVENIDO',{h:256,border:false}),.44,.267,.47,1.42,-.073,true);
   box(pay,.2,.055,.13,-.6,1.173,.1,M.black,.014);
   box(pay,3.5,2.94,.1,0,1.6,-1.48,M.wall);
   box(pay,3.22,1.82,.075,0,2.1,-1.4,M.darkSteel);
   panel(pay,makeDigital(),3.13,1.74,0,2.1,-1.35,true);
   const logoMat=new T.MeshBasicMaterial({map:makeLogo(),transparent:true,depthWrite:false});
   mesh(new T.PlaneGeometry(2.55,1.03),logoMat,pay,0,2.15,-1.34);
   contact(fixed,-3.15,-4.25,3.3,1.5);
   // Coloured wayfinding stripes, as in the supplied interior photograph.
   const lineColors=['#d17b9f','#348ab7','#715fab','#e47f59','#e0b838'];
   lineColors.forEach((c,i)=>{
     const x=1.52+i*.126,m=material(c,.7);
     box(fixed,.066,.004,9.9,x,.014,1.40,m);
     const length=i<3?1.5:2.7;
     box(fixed,length,.004,.066,x+(i<3?-1:1)*length/2,.014,-3.51-i*.10,m);
   });
   // Front frame, transparent entry and iridescent shop window.
   box(front,13,.73,.36,0,3.65,7.32,M.black);
   box(front,.50,3.29,.36,-.60,1.645,7.32,M.black);
   box(front,.55,3.29,.36,6.17,1.645,7.32,M.black);
   box(front,.35,3.29,.36,-6.31,1.645,7.32,M.black);
   box(front,5.25,.12,.40,-3.54,.06,7.32,M.black);
   const displayTex=makeDigital();
   for(let i=0;i<7;i++){
     box(front,.59,2.89,.075,-5.89+i*.719,1.70,7.24,M.darkSteel);
     const tex=displayTex.clone();tex.offset.y=i*.07;tex.wrapT=T.MirroredRepeatWrapping;
     panel(front,tex,.50,2.77,-5.89+i*.719,1.70,7.285,true);
   }
   mesh(new T.PlaneGeometry(3.7,1.5),logoMat,front,-3.70,1.87,7.38);
   mesh(new T.PlaneGeometry(2.14,.87),logoMat,front,2.37,3.66,7.525);
   const glass=new T.MeshPhysicalMaterial({color:'#e3f3ff',transparent:true,opacity:.095,roughness:.08,metalness:.1,side:T.DoubleSide,depthWrite:false});
   box(front,5.20,3.11,.02,-3.59,1.63,7.4,glass);
   rod(front,[-.30,.022,7.58],[5.87,.022,7.58],.011,M.led);
   // Smooth mannequin in the yellow travel jacket.
   const man=new T.Group();man.position.set(-5.06,0,5.27);fixed.add(man);
   mesh(new T.CylinderGeometry(.27,.30,.045,18),M.darkSteel,man,0,.022,0);
   const skin=material('#d6d8d1',.72),trouser=material('#303940',.92);
   for(const x of [-.11,.11]){rod(man,[x,.12,0],[x,.91,0],.07,trouser);box(man,.14,.10,.27,x,.087,.054,M.cream,.042);}
   const torso=mesh(new T.SphereGeometry(1,16,14),skin,man,0,1.13,0);torso.scale.set(.205,.315,.11);
   addProduct(man,jacket('#e2be3f'),0,1.15,.02,1.05);
   rod(man,[0,1.48,0],[0,1.61,0],.06,skin);
   const head=mesh(new T.SphereGeometry(.125,18,16),skin,man,0,1.71,0);head.scale.set(.81,1.16,.93);
   // No painted wall photographs: all display objects have actual depth.
   const hemi=new T.HemisphereLight('#edf4ff','#77705f',2.05);scene.add(hemi);
   const key=new T.DirectionalLight('#fff4df',3.1);key.position.set(-3,8.5,4);key.target.position.set(0,0,-1);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-11,right:11,top:12,bottom:-12,near:.1,far:30});key.shadow.bias=-.00045;key.shadow.normalBias=.035;key.shadow.radius=3;scene.add(key,key.target);
   const fill=new T.PointLight('#fff7ec',35,18,2);fill.position.set(0,3.48,-3.7);scene.add(fill);
   const fill2=new T.PointLight('#e5edff',29,18,2);fill2.position.set(0,3.45,3.9);scene.add(fill2);
   // The ceiling is visually opaque but must not block the broad interior light rig.
   ceiling.traverse(o=>{if(o.isMesh)o.castShadow=false;});
   const instanceCount=compileInstances(fixed);compileInstances(ceiling);compileInstances(front);
   scene.updateMatrixWorld(true);
   let meshes=0,triangles=0;scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);}});
   return {scene,ceiling,front,key,stats:{meshes,triangles,instanceCount}};
 };
})();
