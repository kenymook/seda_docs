import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {SplineDocument,SplineView,SceneObject,MaterialName,ObjectTransform} from './spline-model';
import {SplineManipulator} from './spline-manipulator';import type {ManipulatorMode} from './spline-manipulator';

/** Procedural reconstruction, not the original Spline meshes or materials. */
function shapeObject(shape:SceneObject['shape'],material:THREE.MeshPhysicalMaterial){
 const root=new THREE.Group();
 const mesh=(geometry:THREE.BufferGeometry,at:[number,number,number]=[0,0,0],alternate=material)=>{const item=new THREE.Mesh(geometry,alternate);item.position.set(...at);root.add(item);return item;};
 const tube=(points:THREE.Vector3[],radius:number,closed=false)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed),100,radius,12,closed);
 const gold=()=>new THREE.MeshPhysicalMaterial({color:0xd6ad54,metalness:1,roughness:.22});
 if(shape==='carabiner'){
  const oval=(x:number,y:number,rx:number,ry:number,z:number,rotation:number,mat=material)=>{const points=Array.from({length:48},(_,i)=>{const a=i/48*Math.PI*2,px=Math.cos(a)*rx,py=Math.sin(a)*ry;return new THREE.Vector3(x+px*Math.cos(rotation)-py*Math.sin(rotation),y+px*Math.sin(rotation)+py*Math.cos(rotation),z+Math.sin(a)*10);});mesh(tube(points,14,true),[0,0,0],mat);};
  oval(-25,25,45,72,0,-.6);oval(40,-50,40,60,16,-.6,new THREE.MeshPhysicalMaterial({color:0xc2c8cc,metalness:1,roughness:.15}));
  const connector=mesh(new THREE.CylinderGeometry(18,18,45,24),[-55,0,5],new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.4}));connector.rotation.z=-.6;
 }else if(shape==='ripple'){
  for(let i=0;i<5;i++){const ring=mesh(new THREE.TorusGeometry(75-i*8,10,12,60),[0,i*8-15,i*5]);ring.rotation.x=.45;}
  const wedge=mesh(new THREE.ConeGeometry(33,100,3),[25,20,50],gold());wedge.rotation.z=-.8;
 }else if(shape==='flower'){
  for(let i=0;i<8;i++){const petal=mesh(new THREE.TorusGeometry(45,15,12,48),[Math.cos(i*Math.PI/4)*38,Math.sin(i*Math.PI/4)*38,0]);petal.rotation.set(.6,i*.5,i*Math.PI/4);}
 }else if(shape==='connector'){
  mesh(new THREE.IcosahedronGeometry(34,1));for(let i=0;i<6;i++){const a=i*Math.PI/3,arm=mesh(new THREE.CylinderGeometry(15,15,105,16),[Math.cos(a)*50,Math.sin(a)*50,0]);arm.rotation.z=a-Math.PI/2;mesh(new THREE.SphereGeometry(24,20,16),[Math.cos(a)*100,Math.sin(a)*100,0]);}
 }else if(shape==='spike'){
  mesh(new THREE.IcosahedronGeometry(65,0));for(let i=0;i<10;i++){const a=i*Math.PI/5,spike=mesh(new THREE.ConeGeometry(25,70,4),[Math.cos(a)*60,Math.sin(a)*60,Math.sin(a*3)*20]);spike.rotation.z=a-Math.PI/2;}
  mesh(tube([new THREE.Vector3(-50,-40,70),new THREE.Vector3(0,40,90),new THREE.Vector3(50,50,70),new THREE.Vector3(70,-10,50)],12),[0,0,0],gold());
 }else if(shape==='cube'){
  const cube=mesh(new THREE.BoxGeometry(105,105,105));cube.rotation.set(.3,.5,.2);for(const x of [-1,1])for(const y of [-1,1])mesh(new THREE.SphereGeometry(25,20,16),[x*58,y*58,50]);
 }else if(shape==='donut'){
  const donut=mesh(new THREE.TorusGeometry(62,30,24,60));donut.rotation.x=.4;
  mesh(new THREE.BoxGeometry(75,20,20),[0,0,45],gold());mesh(new THREE.BoxGeometry(20,75,20),[0,0,45],gold());
 }else if(shape==='blob'){
  const geo=new THREE.SphereGeometry(75,40,30),positions=geo.attributes.position;
  for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),f=1+.16*Math.sin(x*.05)*Math.cos(y*.04)+.1*Math.sin(z*.06);positions.setXYZ(i,x*f,y*f,z*f);}geo.computeVertexNormals();mesh(geo);
  const heart=mesh(new THREE.TorusKnotGeometry(20,7,64,10,2,3),[10,5,80],gold());heart.scale.set(.8,1,.4);
 }else{
  const points=Array.from({length:241},(_,i)=>{const a=i/240*Math.PI*12;return new THREE.Vector3(Math.cos(a)*47,(i/240-.5)*180,Math.sin(a)*47);});const spring=mesh(tube(points,13));spring.rotation.z=-.6;
 }
 return root;
}
export function sceneMaterial(name:MaterialName){
 const colors:Record<MaterialName,number>={'green dark team':0xb4da35,'violet dark team':0x7452c8,'glass dark team':0xb8c8d2,'color glass':0xe6a5bc,silver:0xc5cbd1,Glass:0xd5e5ea,green:0xbada3e,violet:0x8973c9,white:0xf3f1e9};
 const metallic=['silver','glass dark team','color glass'].includes(name),glass=name==='Glass';
 return new THREE.MeshPhysicalMaterial({color:colors[name],metalness:metallic?1:.05,roughness:metallic?.19:.32,transmission:glass?.8:0,thickness:glass?20:0,clearcoat:1,iridescence:name==='glass dark team'?1:0});
}
function disposeObject(root:THREE.Object3D){const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();root.traverse(item=>{if(item instanceof THREE.Mesh){geometries.add(item.geometry);for(const m of Array.isArray(item.material)?item.material:[item.material])materials.add(m);}});for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();}
export interface RendererCallbacks {select:(id:string|null)=>void;camera:(view:Pick<SplineView,'eye'|'target'|'zoom'>)=>void;status:(status:'ready'|'lost'|'restored'|'error',message?:string)=>void;transformStart?:(id:string)=>boolean;transformPreview?:(id:string,transform:ObjectTransform)=>boolean;transformEnd?:(id:string,transform:ObjectTransform)=>boolean;transformCancel?:(reason:string)=>void}
export class SplineRenderer {
 readonly scene=new THREE.Scene();readonly renderer:THREE.WebGLRenderer;
 private camera:THREE.OrthographicCamera|THREE.PerspectiveCamera;
 private controls:OrbitControls;private roots=new THREE.Group();private grid=new THREE.GridHelper(3000,60,0x888888,0xaaaaaa);
 private rendered=new Map<string,{shape:SceneObject['shape'];material:MaterialName;root:THREE.Group}>();
 private manipulator:SplineManipulator;private selectedId:string|null=null;private manipulationMode:ManipulatorMode='translate';private manipulationEnabled=false;
 private environment:THREE.WebGLRenderTarget;private selected:THREE.BoxHelper|null=null;private frame=0;private destroyed=false;private lost=false;private applying=false;
 private down:{x:number;y:number}|null=null;private width=1;private height=1;private observer:ResizeObserver;
 constructor(private canvas:HTMLCanvasElement,private callbacks:RendererCallbacks){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,preserveDrawingBuffer:false});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
  this.environment=this.makeEnvironment();this.scene.environment=this.environment.texture;
  this.camera=new THREE.OrthographicCamera(-600,600,600,-600,1,10000);this.camera.position.set(70,214.92,1500);
  this.controls=this.createControls();this.scene.add(this.roots,new THREE.HemisphereLight(0xffffff,0x666666,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-400,800,1500);this.scene.add(key);
  // Front-facing reconstruction grid; source floor/camera export is unavailable.
  this.grid.rotation.x=Math.PI/2;this.grid.position.set(70,214.92,-160);this.scene.add(this.grid);
  this.manipulator=new SplineManipulator(this.camera,canvas,this.scene,{start:id=>this.callbacks.transformStart?.(id)??false,preview:(id,value)=>this.callbacks.transformPreview?.(id,value)??false,finish:(id,value)=>this.callbacks.transformEnd?.(id,value)??false,cancel:reason=>this.callbacks.transformCancel?.(reason)},()=>{this.selected?.update();this.invalidate();});
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);canvas.addEventListener('pointerdown',this.pointerDown);canvas.addEventListener('pointerup',this.pointerUp);canvas.addEventListener('webglcontextlost',this.contextLost);canvas.addEventListener('webglcontextrestored',this.contextRestored);this.resize();this.callbacks.status('ready');
 }
 private createControls(){const controls=new OrbitControls(this.camera,this.canvas);controls.target.set(70,214.92,0);controls.minZoom=.25;controls.maxZoom=8;controls.minDistance=200;controls.maxDistance=6000;controls.addEventListener('change',this.cameraChanged);return controls;}
 private makeEnvironment(){const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();try{return pmrem.fromScene(room,.04);}finally{room.dispose();pmrem.dispose();}}
 private cameraChanged=()=>{this.invalidate();if(!this.applying)this.callbacks.camera({eye:this.camera.position.toArray() as SplineView['eye'],target:this.controls.target.toArray() as SplineView['target'],zoom:this.camera.zoom});};
 private pointerDown=(event:PointerEvent)=>{if(event.button===0)this.down={x:event.clientX,y:event.clientY};};
 private pointerUp=(event:PointerEvent)=>{const start=this.down;this.down=null;if(!start||Math.hypot(event.clientX-start.x,event.clientY-start.y)>4||event.button!==0)return;const rect=this.canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),this.camera);const hit=ray.intersectObjects(this.roots.children,true).find(hit=>{let node:THREE.Object3D|null=hit.object;while(node&&node!==this.roots){if(!node.visible)return false;node=node.parent;}return true;});let object:THREE.Object3D|null=hit?.object??null;while(object&&!object.userData.objectId)object=object.parent;this.callbacks.select(object?.userData.objectId??null);};
 private contextLost=(event:Event)=>{event.preventDefault();this.lost=true;this.manipulator.cancel('context-lost');this.manipulator.setMode(this.manipulationMode,false);cancelAnimationFrame(this.frame);this.frame=0;this.callbacks.status('lost','WebGL context lost. Изменения документа сохранены в памяти.');};
 private contextRestored=()=>{if(this.destroyed)return;try{const previous=this.environment;this.environment=this.makeEnvironment();this.scene.environment=this.environment.texture;previous.dispose();this.lost=false;this.manipulator.setMode(this.manipulationMode,this.manipulationEnabled);this.callbacks.status('restored');this.invalidate();}catch(error){this.lost=true;this.callbacks.status('error','Восстановление WebGL environment не выполнено: '+String(error));}};
 private resize(){this.manipulator?.cancel('viewport-resize');const {width,height}=this.canvas.getBoundingClientRect();this.width=Math.max(1,width);this.height=Math.max(1,height);this.renderer.setSize(this.width,this.height,false);this.projection();this.invalidate();}
 private projection(){const aspect=this.width/this.height;if(this.camera instanceof THREE.OrthographicCamera){this.camera.left=-1200*aspect;this.camera.right=1200*aspect;this.camera.top=1200;this.camera.bottom=-1200;}else this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}
 setView(view:SplineView){this.manipulator.cancel('view-change');this.applying=true;try{
  const perspective=view.projection==='perspective';if(perspective!==(this.camera instanceof THREE.PerspectiveCamera)){this.controls.dispose();const distance=new THREE.Vector3(...view.eye).distanceTo(new THREE.Vector3(...view.target));this.camera=perspective?new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(2*Math.atan(1200/Math.max(distance,1))),this.width/this.height,1,10000):new THREE.OrthographicCamera(-1200,1200,1200,-1200,1,10000);this.controls=this.createControls();}
  this.manipulator.setCamera(this.camera);this.camera.position.set(...view.eye);this.camera.zoom=view.zoom;this.controls.target.set(...view.target);this.controls.update();this.projection();this.select(view.selection);this.invalidate();
 }finally{this.applying=false;}}
 setDocument(document:SplineDocument){
  this.manipulator.cancel('document-change');this.manipulator.select(null);
  if(this.selected){this.scene.remove(this.selected);this.selected.dispose();this.selected=null;}
  const ids=new Set(document.objects.map(object=>object.id));for(const[id,item]of this.rendered)if(!ids.has(id)){this.roots.remove(item.root);disposeObject(item.root);this.rendered.delete(id);}
  for(const object of document.objects){let item=this.rendered.get(object.id);if(!item||item.shape!==object.shape||item.material!==object.material){if(item){this.roots.remove(item.root);disposeObject(item.root);}item={shape:object.shape,material:object.material,root:shapeObject(object.shape,sceneMaterial(object.material))};item.root.userData.objectId=object.id;this.rendered.set(object.id,item);this.roots.add(item.root);}const root=item.root;root.userData.locked=object.locked;root.position.set(...object.position);root.rotation.set(...object.rotation.map(THREE.MathUtils.degToRad) as [number,number,number]);root.scale.set(...object.scale);root.visible=object.visible;}
  this.scene.background=new THREE.Color(document.background);this.scene.fog=document.fog?new THREE.Fog(document.background,1600,3500):null;this.grid.visible=document.grid;this.scene.updateMatrixWorld(true);this.select(this.selectedId);this.invalidate();
 }
 select(id:string|null){this.selectedId=id;if(this.selected){this.scene.remove(this.selected);this.selected.dispose();this.selected=null;}const object=this.roots.children.find(item=>item.userData.objectId===id);if(object&&object.visible){this.selected=new THREE.BoxHelper(object,0x4a8aff);this.scene.add(this.selected);}this.manipulator.select(object??null);this.invalidate();}
 setManipulator(mode:ManipulatorMode,enabled:boolean){this.manipulationMode=mode;this.manipulationEnabled=enabled;this.manipulator.setMode(mode,enabled&&!this.lost);}
 cancelManipulation(reason='cancel'){this.manipulator.cancel(reason);}
 private invalidate(){if(this.frame||this.destroyed||this.lost)return;this.frame=requestAnimationFrame(()=>{this.frame=0;if(this.destroyed||this.lost)return;try{this.renderer.render(this.scene,this.camera);}catch(error){this.callbacks.status('error',String(error));}});}
 dispose(){if(this.destroyed)return;this.destroyed=true;this.manipulator.dispose();cancelAnimationFrame(this.frame);this.observer.disconnect();this.controls.dispose();this.canvas.removeEventListener('pointerdown',this.pointerDown);this.canvas.removeEventListener('pointerup',this.pointerUp);this.canvas.removeEventListener('webglcontextlost',this.contextLost);this.canvas.removeEventListener('webglcontextrestored',this.contextRestored);this.selected?.dispose();disposeObject(this.roots);this.grid.geometry.dispose();for(const material of Array.isArray(this.grid.material)?this.grid.material:[this.grid.material])material.dispose();this.environment.dispose();this.renderer.dispose();}
}
