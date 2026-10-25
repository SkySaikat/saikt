import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createHeroScene(canvas, container, initiallyPaused = false) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'}); }
  catch { canvas.remove(); return {setPaused(){},setAccent(){}}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  camera.position.set(0, 0, 10);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(environment, .04);
  scene.environment = envMap.texture;
  environment.dispose(); pmrem.dispose();
  const ambient = new THREE.AmbientLight(0xb6a4ff, 2); scene.add(ambient);
  const light = new THREE.PointLight(0xd9c3ff, 60, 20); light.position.set(-3, 4, 4); scene.add(light);
  const fill = new THREE.PointLight(0x7bb9d3, 35, 20); fill.position.set(3, -2, 3); scene.add(fill);
  const group = new THREE.Group(); scene.add(group);
  const material = new THREE.MeshPhysicalMaterial({color:0xc2afe9,metalness:.92,roughness:.16,clearcoat:1,clearcoatRoughness:.08,iridescence:.75,iridescenceIOR:1.4,iridescenceThicknessRange:[100,350]});
  const geometry = new THREE.OctahedronGeometry(1,0);
  const shards = new THREE.InstancedMesh(geometry, material, 6);
  group.add(shards);
  const shardData = [
    {x:-1.64,y:1.23,z:1,scale:[.22,.92,.27],r:[.32,.3,-.55]},
    {x:1.64,y:1.82,z:-.7,scale:[.17,.69,.21],r:[.4,.2,.7]},
    {x:1.74,y:-1.3,z:1,scale:[.27,1.06,.24],r:[-.4,.6,-.65]},
    {x:-1.61,y:-1.52,z:.5,scale:[.2,.72,.21],r:[.8,-.4,.7]},
    {x:.48,y:2.16,z:-1,scale:[.09,.34,.10],r:[.7,.4,-.7]},
    {x:-.2,y:-2.15,z:-.5,scale:[.08,.33,.08],r:[.5,.9,1.1]}
  ];
  const dummy = new THREE.Object3D();
  const ringPoints = Array.from({length:100},(_,i)=>{const a=i/99*Math.PI*2;return new THREE.Vector3(Math.cos(a)*2.28,Math.sin(a)*2.28,0)});
  const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
  const ring = new THREE.Line(ringGeometry,new THREE.LineBasicMaterial({color:0x9a83bf,transparent:true,opacity:.23}));
  ring.rotation.set(.85,.4,-.3); ring.position.z=-1; group.add(ring);
  const dotsGeometry = new THREE.BufferGeometry();
  const positions=[];for(let i=0;i<45;i++){const a=i*2.39996;const radius=2.1+(i%7)*.15;positions.push(Math.cos(a)*radius,Math.sin(a)*radius,Math.sin(i)*.9-1)}
  dotsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const dots = new THREE.Points(dotsGeometry,new THREE.PointsMaterial({color:0xbeb2d2,size:.018,transparent:true,opacity:.5}));group.add(dots);
  let frame=0,time=0,last=0,paused=initiallyPaused,inView=true,disposed=false;
  const target={x:0,y:0},pointer={x:0,y:0};
  const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw(0)};
  function draw(dt){
    time+=dt; pointer.x+=(target.x-pointer.x)*.045;pointer.y+=(target.y-pointer.y)*.045;
    group.rotation.y=pointer.x*.13;group.rotation.x=pointer.y*.09;
    shardData.forEach((item,i)=>{const a=time*.25+i;dummy.position.set(item.x+Math.sin(a)*.07,item.y+Math.cos(a*1.2)*.10,item.z);dummy.scale.set(...item.scale);dummy.rotation.set(item.r[0]+time*.09,item.r[1]+time*.13,item.r[2]+Math.sin(a)*.08);dummy.updateMatrix();shards.setMatrixAt(i,dummy.matrix)});
    shards.instanceMatrix.needsUpdate=true;ring.rotation.z=-.3+time*.025;dots.rotation.z=-time*.015;renderer.render(scene,camera);
  }
  function tick(now){frame=0;if(disposed||paused||!inView||document.hidden)return;const dt=last?Math.min((now-last)/1000,.04):0;last=now;draw(dt);frame=requestAnimationFrame(tick)}
  function resume(){if(!frame&&!paused&&inView&&!document.hidden&&!disposed){last=0;frame=requestAnimationFrame(tick)}}
  function halt(){if(frame)cancelAnimationFrame(frame);frame=0;last=0}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)resume();else halt()},{threshold:.01});observer.observe(container);
  const move=e=>{if(paused)return;const b=container.getBoundingClientRect();target.x=Math.max(-1,Math.min(1,((e.clientX-b.left)/b.width-.5)*2));target.y=Math.max(-1,Math.min(1,((e.clientY-b.top)/b.height-.5)*2))};
  const visibility=()=>document.hidden?halt():resume();
  window.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',visibility);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();halt();canvas.style.opacity='0'});
  canvas.addEventListener('webglcontextrestored',()=>{canvas.style.opacity='1';resume()});
  resize();resume();
  return {
    setAccent(hex){
      const color=new THREE.Color(hex);
      material.color.copy(color).lerp(new THREE.Color(0xffffff),.16);
      ambient.color.copy(color);light.color.copy(color).lerp(new THREE.Color(0xffffff),.45);
      fill.color.copy(color).lerp(new THREE.Color(0xffffff),.25);
      ring.material.color.copy(color);dots.material.color.copy(color);
      material.iridescence=.22;
      draw(0);
    },
    setPaused(value){paused=value;if(paused){halt();target.x=0;target.y=0;draw(0)}else resume()},
    dispose(){disposed=true;halt();observer.disconnect();resizeObserver.disconnect();window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);geometry.dispose();material.dispose();ringGeometry.dispose();ring.material.dispose();dotsGeometry.dispose();dots.material.dispose();envMap.dispose();renderer.dispose()}
  };
}
