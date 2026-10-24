import * as THREE from 'three';
import {TransformControls} from 'three/addons/controls/TransformControls.js';
import type {TransformControlsMode} from 'three/addons/controls/TransformControls.js';
import type {ObjectTransform,Vector3} from './spline-model';
export type ManipulatorMode=TransformControlsMode;
export interface ManipulatorCallbacks {
 start:(id:string)=>boolean;
 preview:(id:string,transform:ObjectTransform)=>boolean;
 finish:(id:string,transform:ObjectTransform)=>boolean;
 cancel:(reason:string)=>void;
}
type Active={pointerId:number;id:string;object:THREE.Object3D;before:ObjectTransform;rect:DOMRect;viewport:[number,number,number]};
const transform=(object:THREE.Object3D):ObjectTransform=>({position:object.position.toArray() as Vector3,rotation:[object.rotation.x,object.rotation.y,object.rotation.z].map(THREE.MathUtils.radToDeg) as Vector3,scale:object.scale.toArray() as Vector3});
/** Own DOM capture explicitly: TransformControls' default bridge has no pointercancel rollback.
 * It supplies genuine raycast handles/math; this bridge owns cancel, input focus and camera isolation.
 */
export class SplineManipulator {
 readonly control:TransformControls;
 private active:Active|null=null;private disposed=false;private enabled=false;private selected:THREE.Object3D|null=null;
 constructor(camera:THREE.Camera,private canvas:HTMLCanvasElement,private scene:THREE.Scene,private callbacks:ManipulatorCallbacks,private invalidate:()=>void){
  this.control=new TransformControls(camera,canvas);this.control.disconnect();canvas.style.touchAction='none';
  this.control.setSize(.8);this.control.setSpace('world');
  // Domain validation owns finite XYZ/positive scale constraints, including rollback.
  scene.add(this.control.getHelper());this.control.addEventListener('change',this.invalidate);this.control.addEventListener('objectChange',this.changed);
  canvas.addEventListener('pointerdown',this.down,true);canvas.addEventListener('pointermove',this.move,true);canvas.addEventListener('pointerup',this.up,true);canvas.addEventListener('pointercancel',this.pointerCancel,true);canvas.addEventListener('lostpointercapture',this.captureLost,true);canvas.addEventListener('keydown',this.key,true);canvas.addEventListener('wheel',this.wheel,{capture:true,passive:false});window.addEventListener('blur',this.blur);document.addEventListener('visibilitychange',this.visibility);
 }
 get dragging(){return this.active!==null;}
 setCamera(camera:THREE.Camera){if(this.control.camera!==camera){this.cancel('camera-change');this.control.camera=camera;}}
 setMode(mode:ManipulatorMode,enabled:boolean){if(this.control.mode!==mode||!enabled)this.cancel('mode-change');this.enabled=enabled;this.control.enabled=enabled;this.control.setMode(mode);this.attach();}
 select(object:THREE.Object3D|null){if(this.selected!==object)this.cancel('selection-change');this.selected=object;this.attach();}
 private attach(){const object=this.selected;if(this.enabled&&object?.visible&&!object.userData.locked){if(this.control.object!==object)this.control.attach(object);}else this.control.detach();this.invalidate();}
 private pointer(event:PointerEvent){const rect=this.canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)/rect.width*2-1,y:-(event.clientY-rect.top)/rect.height*2+1,button:event.button} as unknown as PointerEvent;}
 private consume(event:Event){event.preventDefault();event.stopImmediatePropagation();}
 private down=(event:PointerEvent)=>{
  if(this.active){this.consume(event);return;}if(!this.enabled||!this.control.object||event.button!==0||!event.isPrimary)return;
  this.control.pointerHover(this.pointer(event));if(!this.control.axis)return;this.consume(event);
  const object=this.control.object,id=object.userData.objectId as string;if(!this.callbacks.start(id))return;
  this.active={pointerId:event.pointerId,id,object,before:transform(object),rect:this.canvas.getBoundingClientRect(),viewport:[innerWidth,innerHeight,devicePixelRatio]};
  try{this.control.pointerDown(this.pointer(event));if(!this.control.dragging){this.cancel('no-hit');return;}this.canvas.focus({preventScroll:true});this.canvas.setPointerCapture(event.pointerId);}catch{this.cancel('pointer-error');}
 };
 private geometryChanged(active:Active){const now=this.canvas.getBoundingClientRect();return active.viewport.some((value,index)=>value!==[innerWidth,innerHeight,devicePixelRatio][index])||(['x','y','width','height'] as const).some(key=>Math.abs(now[key]-active.rect[key])>.1);}
 private move=(event:PointerEvent)=>{if(this.active){this.consume(event);if(this.geometryChanged(this.active)){this.cancel('viewport-resize');return;}if(event.pointerId===this.active.pointerId)this.control.pointerMove(this.pointer(event));}else if(this.enabled&&event.pointerType!=='touch')this.control.pointerHover(this.pointer(event));};
 private changed=()=>{const active=this.active;if(!active)return;try{if(!this.callbacks.preview(active.id,transform(active.object)))this.cancel('invalid-transform');}catch{this.cancel('invalid-transform');}};
 private up=(event:PointerEvent)=>{const active=this.active;if(!active||active.pointerId!==event.pointerId)return;this.consume(event);if(this.geometryChanged(active)){this.cancel('viewport-resize');return;}this.active=null;this.control.dragging=false;this.control.axis=null;this.release(active.pointerId);
  let accepted=false;try{accepted=this.callbacks.finish(active.id,transform(active.object));}catch{accepted=false;}finally{if(!accepted){this.restore(active);this.callbacks.cancel('rejected-transform');}this.invalidate();}
 };
 private release(id:number){if(this.canvas.hasPointerCapture(id))this.canvas.releasePointerCapture(id);}
 private restore(active:Active){active.object.position.set(...active.before.position);active.object.rotation.set(...active.before.rotation.map(THREE.MathUtils.degToRad) as Vector3);active.object.scale.set(...active.before.scale);active.object.updateMatrixWorld(true);}
 cancel(reason='cancel'){const active=this.active;if(!active)return;this.active=null;this.control.dragging=false;this.control.axis=null;this.restore(active);this.release(active.pointerId);this.callbacks.cancel(reason);this.invalidate();}
 private pointerCancel=(event:PointerEvent)=>{if(this.active?.pointerId===event.pointerId){this.consume(event);this.cancel('pointercancel');}};
 private captureLost=(event:PointerEvent)=>{if(this.active?.pointerId===event.pointerId)this.cancel('capture-lost');};
 private key=(event:KeyboardEvent)=>{if(this.active&&event.key==='Escape'){this.consume(event);this.cancel('escape');}};
 private wheel=(event:WheelEvent)=>{if(this.active)this.consume(event);};
 private blur=()=>this.cancel('window-blur');private visibility=()=>{if(document.hidden)this.cancel('document-hidden');};
 dispose(){if(this.disposed)return;this.cancel('unmount');this.disposed=true;this.canvas.removeEventListener('pointerdown',this.down,true);this.canvas.removeEventListener('pointermove',this.move,true);this.canvas.removeEventListener('pointerup',this.up,true);this.canvas.removeEventListener('pointercancel',this.pointerCancel,true);this.canvas.removeEventListener('lostpointercapture',this.captureLost,true);this.canvas.removeEventListener('keydown',this.key,true);this.canvas.removeEventListener('wheel',this.wheel,true);window.removeEventListener('blur',this.blur);document.removeEventListener('visibilitychange',this.visibility);this.control.removeEventListener('change',this.invalidate);this.control.removeEventListener('objectChange',this.changed);this.scene.remove(this.control.getHelper());this.control.dispose();}
}
