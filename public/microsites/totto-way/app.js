(function(){
 'use strict';
 const $=id=>document.getElementById(id),T=window.THREE,N=window.TottoNav;
 const coarse=matchMedia('(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let renderer,model,camera,scene,ready=false,aerial=false,high=!coarse,current=0,photoIndex=0,toastTimer,tipTimer;
 let yaw=0,pitch=0,lookTarget=null,route=[],routeEnd=null,guided=false,dwell=0,travel=false,lastTime=0,frame=0;
 let pointer=null,pointerDragged=false,savedWalk=null,orbit={az:0,elev:1.03,dist:20};
 const keys=new Set(),joy={x:0,y:0,id:null},speed=2.25;
 const photos=[{id:'fachada',name:'Fachada · acceso amarillo y vitrina BAZY'},{id:'interior',name:'Vista general · tienda 1043'},{id:'perspectiva',name:'Mujer · perspectiva del interior'},{id:'hombre-viaje',name:'Hombre y Viaje · pared derecha'},{id:'kids-colors',name:'Kids y muro COLORS'},{id:'caja',name:'Doble punto de pago'},{id:'pasillo',name:'Pasillo de acceso'},{id:'contravista',name:'Vista hacia la entrada'}];
 const ray=new T.Raycaster(),mouse=new T.Vector2(),ground=new T.Plane(new T.Vector3(0,1,0),0),point=new T.Vector3();
 const assets=window.TOTTO_ASSETS||{};
 const productAnchor=new T.Vector3(),productProjected=new T.Vector3();
 function openProduct(){
   manual();$('floor-target').style.display='none';$('product-hotspot').hidden=true;
   $('product-image').src=assets['colorfull-violeta']||'assets/colorfull-violeta.png';
   showDialog('product-dialog');
 }
 $('product-hotspot').onclick=openProduct;
 function productAt(clientX,clientY){
   if(!ready||aerial||!model.featuredProduct)return false;
   const b=$('viewport').getBoundingClientRect();mouse.set((clientX-b.left)/b.width*2-1,-(clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);
   const hits=ray.intersectObject(model.featuredProduct,true);if(!hits.length||hits[0].distance>7)return false;
   const first=ray.intersectObjects(scene.children,true).find(h=>!h.object.material.transparent);
   if(!first)return false;let object=first.object;
   while(object){if(object.userData.productId==='colorfull-violeta')return true;object=object.parent;}
   return false;
 }
 function drawProductHotspot(){
   const button=$('product-hotspot');button.hidden=true;
   if(!ready||aerial||opened()||!model.featuredProduct)return;
   model.featuredProduct.getWorldPosition(productAnchor);productAnchor.y+=.08;productAnchor.z+=.16;
   if(camera.position.z<productAnchor.z+.3||camera.position.distanceTo(productAnchor)>6)return;
   camera.updateMatrixWorld();productProjected.copy(productAnchor).project(camera);
   if(productProjected.z< -1||productProjected.z>1||Math.abs(productProjected.x)>.8||Math.abs(productProjected.y)>.68)return;
   const b=$('viewport').getBoundingClientRect(),x=b.left+(productProjected.x+1)*b.width/2,y=b.top+(1-productProjected.y)*b.height/2;
   if(!productAt(x,y))return;
   button.hidden=false;button.style.left=(x-$('experience').getBoundingClientRect().left)+'px';button.style.top=(y-$('experience').getBoundingClientRect().top)+'px';
 }
 function notify(text){$('announcement').textContent=text;$('announcement').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('announcement').classList.remove('show'),3200);}
 function hideTip(){$('intro-tip').style.opacity='0';$('intro-tip').style.pointerEvents='none';clearTimeout(tipTimer);}
 $('dismiss-tip').onclick=hideTip;
 function opened(){return !!document.querySelector('dialog[open]');}
 function anglesAt(target){const dx=target[0]-camera.position.x,dy=target[1]-camera.position.y,dz=target[2]-camera.position.z;return {yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(dy,Math.hypot(dx,dz))};}
 function wrap(n){return Math.atan2(Math.sin(n),Math.cos(n));}
 function lookAtTarget(target,instant=false){const a=anglesAt(target);if(instant){yaw=a.yaw;pitch=a.pitch;lookTarget=null;}else lookTarget=a;}
 function setZone(i,scroll=false){
   current=i;const z=N.stops[i];$('zone-name').textContent=z.name;$('zone-subtitle').textContent=z.subtitle;$('zone-number').textContent=String(i+1).padStart(2,'0');
   $('tour-progress').innerHTML=String(i+1).padStart(2,'0')+' <span>/ '+String(N.stops.length).padStart(2,'0')+'</span>';
   document.querySelectorAll('#zone-nav button').forEach((b,k)=>{b.classList.toggle('active',k===i);b.setAttribute('aria-current',k===i?'location':'false');if(k===i&&scroll)b.scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest',inline:'center'});});
 }
 function stopGuided(announce=false){guided=false;dwell=0;$('tour-label').textContent='Recorrido guiado';$('tour').classList.remove('is-playing');$('play-icon').innerHTML='<path d="m8 5 11 7-11 7V5Z"/>';$('zone-kind').textContent='EXPLORA A TU RITMO';if(announce)notify('Recorrido pausado. Puedes continuar explorando.');}
 function manual(){stopGuided();route=[];travel=false;routeEnd=null;lookTarget=null;hideTip();}
 function changeMode(value){
   if(!ready)return;
   if(value===aerial)return;
   manual();aerial=value;document.body.classList.toggle('aerial',aerial);
   $('walk-mode').classList.toggle('selected',!aerial);$('walk-mode').setAttribute('aria-pressed',String(!aerial));$('plan-mode').classList.toggle('selected',aerial);$('plan-mode').setAttribute('aria-pressed',String(aerial));
   if(aerial){savedWalk={x:camera.position.x,z:camera.position.z,yaw,pitch};model.ceiling.visible=false;model.front.visible=false;$('zone-kind').textContent='DISTRIBUCIÓN DE LA TIENDA';notify('Selecciona un punto del suelo para entrar allí.');}
   else{model.ceiling.visible=true;model.front.visible=true;if(savedWalk){camera.position.set(savedWalk.x,1.66,savedWalk.z);yaw=savedWalk.yaw;pitch=savedWalk.pitch;}$('zone-kind').textContent='EXPLORA A TU RITMO';}
   $('floor-target').style.display='none';
 }
 function goTo(i,keepTour=false){
   if(!ready)return;if(aerial)changeMode(false);if(!keepTour)stopGuided();
   hideTip();const z=N.stops[i],path=N.path(camera.position,z);
   if(!path.length){notify('Elige un punto accesible del pasillo.');return;}
   route=path;routeEnd=z;travel=true;lookTarget=null;setZone(i,true);$('zone-kind').textContent=guided?'RECORRIDO GUIADO':'CAMINANDO A '+z.name.toUpperCase();
 }
 function goPoint(p){
   if(!N.free(p.x,p.z,.3)){notify('Selecciona un punto libre del pasillo.');return;}
   if(aerial){changeMode(false);camera.position.set(p.x,1.66,p.z);lookAtTarget([0,1.65,-6],true);notify('Ya estás aquí. Arrastra para mirar.');return;}
   manual();const path=N.path(camera.position,p);if(!path.length){notify('No hay paso a ese punto. Prueba desde otro pasillo.');return;}
   route=path;routeEnd=null;travel=true;
 }
 function floorPoint(clientX,clientY){
   if(!ready)return null;const b=$('viewport').getBoundingClientRect();mouse.set((clientX-b.left)/b.width*2-1,-(clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);
   const hit=ray.ray.intersectPlane(ground,point);if(!hit||hit.distanceTo(camera.position)>30)return null;return {x:hit.x,z:hit.z};
 }
 N.stops.forEach((s,i)=>{const b=document.createElement('button');b.innerHTML='<span class="num">'+String(i+1).padStart(2,'0')+'</span>'+s.name;b.onclick=()=>goTo(i);b.title='Ir a '+s.name;$('zone-nav').append(b);});
 $('previous').onclick=()=>goTo((current+N.stops.length-1)%N.stops.length);$('next').onclick=()=>goTo((current+1)%N.stops.length);
 $('reset').onclick=()=>goTo(0);$('walk-mode').onclick=()=>changeMode(false);$('plan-mode').onclick=()=>changeMode(true);
 $('tour').onclick=()=>{
   if(!ready)return;
   if(guided){route=[];travel=false;stopGuided(true);return;}
   if(aerial)changeMode(false);guided=true;$('tour-label').textContent='Pausar recorrido';$('tour').classList.add('is-playing');$('play-icon').innerHTML='<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>';
   goTo(current,true);
 };
 function clearInputs(){keys.clear();joy.x=joy.y=0;joy.id=null;pointer=null;$('joystick').querySelector('.joy-knob').style.transform='';}
 function showDialog(id){clearInputs();route=[];travel=false;stopGuided();$(id).showModal();}
 $('help').onclick=()=>showDialog('help-dialog');document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
 document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();});d.addEventListener('close',()=>{$('viewport').focus({preventScroll:true});lastTime=0;});});
 function showPhoto(){const p=photos[photoIndex];$('reference-title').textContent=p.name;$('reference-image').src=assets[p.id]||'assets/'+p.id+'.png';$('reference-image').alt=p.name+' — fotografía de la tienda TOTTO facilitada como referencia';$('photo-count').textContent=(photoIndex+1)+' / '+photos.length;}
 $('reference').onclick=()=>{photoIndex=photos.findIndex(p=>p.id===N.stops[current].photo);if(photoIndex<0)photoIndex=0;showPhoto();showDialog('reference-dialog');};
 $('photo-prev').onclick=()=>{photoIndex=(photoIndex+photos.length-1)%photos.length;showPhoto();};$('photo-next').onclick=()=>{photoIndex=(photoIndex+1)%photos.length;showPhoto();};
 $('fallback-gallery').onclick=()=>{showPhoto();showDialog('reference-dialog');};$('retry').onclick=()=>location.reload();
 $('reference-image').onerror=()=>notify('No se pudo abrir la imagen de referencia.');
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('experience').requestFullscreen)await $('experience').requestFullscreen();else notify('La pantalla completa no está disponible en este navegador.');}catch{notify('Abre el recorrido en una pestaña para usar pantalla completa.');}};
 $('quality').onclick=()=>{if(!ready)return;high=!high;applyQuality();notify(high?'Calidad alta activada.':'Modo ligero activado.');};
 function applyQuality(){renderer.setPixelRatio(Math.min(devicePixelRatio||1,high?1.75:1));renderer.shadowMap.enabled=high;renderer.shadowMap.needsUpdate=true;$('quality').setAttribute('aria-label','Calidad de imagen: '+(high?'alta':'ligera'));$('quality').title='Calidad '+(high?'alta':'ligera')+' · haz clic para cambiar';}
 function collapseMap(){const isVisible=coarse||innerWidth<=800?$('minimap').classList.contains('open'):$('minimap').style.display!=='none';if(isVisible){$('minimap').classList.remove('open');$('minimap').style.display='none';$('map-open').style.display='grid';}else{$('minimap').style.display='block';$('minimap').classList.add('open');$('map-open').style.display='none';}}
 $('map-collapse').onclick=collapseMap;$('map-open').onclick=collapseMap;
 const map=$('map'),mc=map.getContext('2d');
 function mapXY(x,z){return{x:60+(x+5)/10*240,y:18+(z+9)/23*390};}
 function drawMap(){
   if(!ready)return;mc.clearRect(0,0,360,430);const a=mapXY(-5,-9),b=mapXY(5,9);mc.fillStyle='#26333d';mc.fillRect(a.x,a.y,b.x-a.x,b.y-a.y);mc.strokeStyle='#8d9daa';mc.lineWidth=2;mc.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);
   N.obstacles.forEach(o=>{const p=mapXY(o.x-o.w/2,o.z-o.d/2),q=mapXY(o.x+o.w/2,o.z+o.d/2);mc.fillStyle='#566470';mc.fillRect(p.x,p.y,q.x-p.x,q.y-p.y);});
   const entA=mapXY(-3.62,9),entB=mapXY(.5,9);mc.strokeStyle='#26333d';mc.lineWidth=5;mc.beginPath();mc.moveTo(entA.x,entA.y);mc.lineTo(entB.x,entB.y);mc.stroke();
   if(route.length){mc.strokeStyle='#dfc94c77';mc.lineWidth=3;mc.setLineDash([5,5]);mc.beginPath();const p=mapXY(camera.position.x,camera.position.z);mc.moveTo(p.x,p.y);route.forEach(p=>{const q=mapXY(p.x,p.z);mc.lineTo(q.x,q.y);});mc.stroke();mc.setLineDash([]);}
   N.stops.forEach((s,i)=>{const p=mapXY(s.x,s.z);mc.beginPath();mc.arc(p.x,p.y,9,0,Math.PI*2);mc.fillStyle=i===current?'#eef0ec':'#a7b4bd';mc.fill();mc.fillStyle='#17242d';mc.font='bold 12px Arial';mc.textAlign='center';mc.textBaseline='middle';mc.fillText(String(i+1),p.x,p.y+.4);});
   const p=mapXY(aerial?savedWalk.x:camera.position.x,aerial?savedWalk.z:camera.position.z);const heading=aerial?savedWalk.yaw:yaw;mc.save();mc.translate(p.x,p.y);mc.rotate(-heading);mc.fillStyle='#f8d7472a';mc.beginPath();mc.moveTo(0,0);mc.arc(0,0,41,-Math.PI*.72,-Math.PI*.28);mc.closePath();mc.fill();mc.beginPath();mc.moveTo(0,-10);mc.lineTo(-6,7);mc.lineTo(0,4);mc.lineTo(6,7);mc.closePath();mc.fillStyle='#ffdc51';mc.strokeStyle='#141f27';mc.lineWidth=2;mc.stroke();mc.fill();mc.restore();
 }
 map.onclick=e=>{if(!ready)return;const b=map.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*360,z=(e.clientY-b.top)/b.height*430;let nearest=0,dist=1e9;N.stops.forEach((s,i)=>{const p=mapXY(s.x,s.z),d=Math.hypot(p.x-x,p.y-z);if(d<dist){dist=d;nearest=i;}});goTo(nearest);};
 map.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();goTo((current+1)%N.stops.length);}};
 const viewport=$('viewport');
 viewport.addEventListener('pointerdown',e=>{if(!ready||opened()||e.button>0)return;viewport.focus({preventScroll:true});pointer={id:e.pointerId,x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY};pointerDragged=false;viewport.setPointerCapture(e.pointerId);hideTip();});
 viewport.addEventListener('pointermove',e=>{
   if(!ready)return;
   if(pointer&&pointer.id===e.pointerId){
     const dx=e.clientX-pointer.px,dy=e.clientY-pointer.py;
     if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>5){if(!pointerDragged)manual();pointerDragged=true;}
     if(pointerDragged){if(aerial){orbit.az-=dx*.006;orbit.elev=T.MathUtils.clamp(orbit.elev+dy*.004,.65,1.5);}else{yaw-=dx*.0032;pitch=T.MathUtils.clamp(pitch-dy*.0032,-1.10,1.05);}}
     pointer.px=e.clientX;pointer.py=e.clientY;$('floor-target').style.display='none';
   }else if(!coarse&&!aerial){
     if(productAt(e.clientX,e.clientY)){viewport.style.cursor='pointer';$('floor-target').style.display='none';return;}
     viewport.style.cursor='';const p=floorPoint(e.clientX,e.clientY);if(p&&N.free(p.x,p.z,.3)){$('floor-target').style.display='grid';$('floor-target').style.left=e.clientX+'px';$('floor-target').style.top=e.clientY+'px';}else $('floor-target').style.display='none';}
 });
 viewport.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const tap=!pointerDragged;pointer=null;if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);if(tap){if(productAt(e.clientX,e.clientY)){openProduct();return;}const p=floorPoint(e.clientX,e.clientY);if(p)goPoint(p);}});
 viewport.addEventListener('pointercancel',()=>{pointer=null;});viewport.addEventListener('pointerleave',()=>{$('floor-target').style.display='none';});
 viewport.addEventListener('wheel',e=>{if(!ready||opened())return;e.preventDefault();if(aerial)orbit.dist=T.MathUtils.clamp(orbit.dist+e.deltaY*.014,13,29);else{camera.fov=T.MathUtils.clamp(camera.fov+e.deltaY*.025,45,80);camera.updateProjectionMatrix();}},{passive:false});
 window.addEventListener('keydown',e=>{
   if(opened()){if($('reference-dialog').open){if(e.key==='ArrowRight')$('photo-next').click();if(e.key==='ArrowLeft')$('photo-prev').click();}return;}
   if(!ready)return;
   const k=e.key.toLowerCase();
   if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();if(aerial)changeMode(false);manual();keys.add(k);}
   if(k==='escape'){manual();hideTip();}
 });window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{clearInputs();route=[];travel=false;stopGuided();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInputs();stopGuided();route=[];travel=false;}lastTime=0;});
 const joystick=$('joystick'),knob=joystick.querySelector('.joy-knob');
 joystick.addEventListener('pointerdown',e=>{if(!ready||aerial||opened())return;e.preventDefault();manual();joy.id=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoy(e);});
 function updateJoy(e){const rect=joystick.querySelector('.joy-ring').getBoundingClientRect();let x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;const r=rect.width*.33,len=Math.hypot(x,y);if(len>r){x*=r/len;y*=r/len;}joy.x=x/r;joy.y=y/r;knob.style.transform=`translate(${x}px,${y}px)`;}
 joystick.addEventListener('pointermove',e=>{if(e.pointerId===joy.id){e.preventDefault();updateJoy(e);}});
 function releaseJoy(e){if(e.pointerId!==joy.id)return;joy.x=joy.y=0;joy.id=null;knob.style.transform='';}
 joystick.addEventListener('pointerup',releaseJoy);joystick.addEventListener('pointercancel',releaseJoy);
 function arrive(){
   travel=false;if(routeEnd){lookAtTarget(routeEnd.look);$('zone-kind').textContent=guided?'RECORRIDO GUIADO':'EXPLORA A TU RITMO';notify('Has llegado a '+routeEnd.name+'.');}
   if(guided)dwell=5.2;routeEnd=null;
 }
 function step(dt){
   if(aerial){camera.position.set(Math.sin(orbit.az)*orbit.dist*Math.cos(orbit.elev),orbit.dist*Math.sin(orbit.elev),Math.cos(orbit.az)*orbit.dist*Math.cos(orbit.elev));camera.lookAt(0,.1,.15);return;}
   if(route.length){
     let remaining=speed*dt;while(remaining>0&&route.length){const target=route[0],dx=target.x-camera.position.x,dz=target.z-camera.position.z,dist=Math.hypot(dx,dz);
       if(dist<.035){route.shift();continue;}
       const amount=Math.min(remaining,dist),before=camera.position.clone();N.move(camera.position,dx/dist*amount,dz/dist*amount);remaining-=amount;
       const moveYaw=Math.atan2(-dx,-dz);yaw+=wrap(moveYaw-yaw)*(1-Math.exp(-3.0*dt));pitch+=(0-pitch)*(1-Math.exp(-2.5*dt));
       if(camera.position.distanceToSquared(before)<1e-9){route=[];travel=false;stopGuided();notify('Paso bloqueado. Selecciona otro punto del pasillo.');break;}
       if(dist<=amount+.035)route.shift();
     }
     if(!route.length&&travel)arrive();
   }else{
     let side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joy.x;
     let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joy.y;
     const len=Math.hypot(side,forward);if(len>.03){if(len>1){side/=len;forward/=len;}N.move(camera.position,(Math.cos(yaw)*side-Math.sin(yaw)*forward)*speed*dt,(-Math.sin(yaw)*side-Math.cos(yaw)*forward)*speed*dt);}
     if(lookTarget){const f=1-Math.exp(-(reduced?30:3.4)*dt);yaw+=wrap(lookTarget.yaw-yaw)*f;pitch+=(lookTarget.pitch-pitch)*f;if(Math.abs(wrap(lookTarget.yaw-yaw))+Math.abs(lookTarget.pitch-pitch)<.003)lookTarget=null;}
     if(guided&&dwell>0){dwell-=dt;if(dwell<=0){if(current===N.stops.length-1){stopGuided();notify('Recorrido completo. Sigue explorando a tu ritmo.');}else goTo(current+1,true);}}
     if(frame%45===0&&!guided&&!lookTarget&&!travel){let closest=current,distance=3.3;N.stops.forEach((s,i)=>{const d=Math.hypot(s.x-camera.position.x,s.z-camera.position.z);if(d<distance){distance=d;closest=i;}});if(closest!==current)setZone(closest);}
   }
   camera.position.y=1.66;camera.rotation.set(pitch,yaw,0,'YXZ');
 }
 function animate(t){
   requestAnimationFrame(animate);if(!ready||document.hidden)return;const dt=lastTime?Math.min((t-lastTime)/1000,.04):.016;lastTime=t;frame++;
   if(!opened())step(dt);if(frame%6===0){drawMap();drawProductHotspot();}renderer.render(scene,camera);
 }
 function resize(){if(!renderer)return;const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
 window.addEventListener('resize',resize);
 function environment(){const faces=[];for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,64);g.addColorStop(0,i===2?'#f9fbff':'#a4aab0');g.addColorStop(.49,'#c8c8bf');g.addColorStop(1,i===3?'#555b5d':'#727a7e');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);ctx.fillStyle='#ffffff';ctx.fillRect(8,8,5,37);ctx.fillRect(46,5,4,43);faces.push(c);}const cube=new T.CubeTexture(faces);cube.colorSpace=T.SRGBColorSpace;cube.needsUpdate=true;const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromCubemap(cube);cube.dispose();pmrem.dispose();return env.texture;}
 function fail(error){console.error('TOTTO viewer:',error);$('loading').hidden=true;$('unavailable').hidden=false;}
 setZone(0);
 if(coarse)$('intro-tip').querySelector('span').innerHTML='<b>Estás dentro.</b> Desliza para mirar. Usa el control circular para caminar.';
 requestAnimationFrame(()=>setTimeout(()=>{
   try{
     renderer=new T.WebGLRenderer({antialias:true,powerPreference:coarse?'default':'high-performance',alpha:false});renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;
     renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;viewport.append(renderer.domElement);
     camera=new T.PerspectiveCamera(innerWidth<600?73:66,1,.07,85);camera.position.set(N.stops[0].x,1.66,N.stops[0].z);lookAtTarget(N.stops[0].look,true);
     model=window.buildTottoScene();scene=model.scene;scene.environment=environment();camera.rotation.set(pitch,yaw,0,'YXZ');applyQuality();resize();
     renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;$('unavailable-message').textContent='El navegador ha interrumpido la aceleración gráfica. Cierra otras pestañas y vuelve a intentarlo.';fail('WebGL context lost');});
     renderer.compile(scene,camera);renderer.render(scene,camera);ready=true;
     window.TottoViewer={getState:()=>({ready,aerial,current,position:{x:camera.position.x,z:camera.position.z},routeLength:route.length,guided,quality:high?'high':'low',stats:model.stats}),goTo,changeMode};
     $('loading').classList.add('done');setTimeout(()=>$('loading').hidden=true,650);tipTimer=setTimeout(hideTip,12000);requestAnimationFrame(animate);
   }catch(error){fail(error);}
 },35));
})();
