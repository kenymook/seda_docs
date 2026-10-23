/** Application domain, not a registered SEDA UI component contract.
 * Meshes and camera are reconstructed: the supplied handoff contains no scene export.
 */
export type Vector3 = [number, number, number];
export const materialNames = ['green dark team','violet dark team','glass dark team','color glass','silver','Glass','green','violet','white'] as const;
export type MaterialName = typeof materialNames[number];
export const shapeNames = ['ripple','carabiner','flower','connector','spike','cube','donut','blob','spring'] as const;
export interface SceneObject {
 id:string; name:string; shape:typeof shapeNames[number]; position:Vector3; rotation:Vector3; scale:Vector3;
 material:MaterialName; visible:boolean; locked:boolean;
}
export interface SplineDocument {version:1; objects:SceneObject[]; background:string; grid:boolean; fog:boolean}
export interface SplineView {selection:string|null; tab:'Agent'|'Objects'|'Assets'; target:Vector3; eye:Vector3; zoom:number; projection:'orthographic'|'perspective'}
export const storageKey='seda.reference.spline.document.v1';
export const copy=<T>(value:T):T=>structuredClone(value);
const hex=/^#[0-9a-f]{6}$/i;
function record(value:unknown):asserts value is Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Ожидается объект сцены');}
function keys(value:Record<string,unknown>,expected:string[]){if(Object.keys(value).length!==expected.length||expected.some(key=>!Object.hasOwn(value,key)))throw Error('Неизвестная структура сцены');}
function vector(value:unknown,min:number,max:number):asserts value is Vector3{if(!Array.isArray(value)||value.length!==3||value.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<min||n>max))throw Error('Недопустимый XYZ');}
export function validateDocument(value:unknown):asserts value is SplineDocument{
 record(value); keys(value,['version','objects','background','grid','fog']);
 if(value.version!==1||typeof value.background!=='string'||!hex.test(value.background)||typeof value.grid!=='boolean'||typeof value.fog!=='boolean'||!Array.isArray(value.objects)||value.objects.length>500)throw Error('Недопустимая сцена');
 const ids=new Set<string>();
 for(const item of value.objects){record(item);keys(item,['id','name','shape','position','rotation','scale','material','visible','locked']);
  if(typeof item.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(item.id)||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>160||!shapeNames.includes(item.shape as SceneObject['shape'])||!materialNames.includes(item.material as MaterialName)||typeof item.visible!=='boolean'||typeof item.locked!=='boolean')throw Error('Недопустимый объект сцены');
  ids.add(item.id);vector(item.position,-100000,100000);vector(item.rotation,-36000,36000);vector(item.scale,.01,100);
 }
}
export function readDocument(text:string):SplineDocument{if(text.length>1_000_000)throw Error('Слишком большой документ');const value:unknown=JSON.parse(text);validateDocument(value);return copy(value);}
export function serializeDocument(document:SplineDocument){validateDocument(document);return JSON.stringify(document);}
export function initialDocument():SplineDocument{
 const names=['Ripple','Carabiner','Flower','Connector','Spiky','Cube','Donut','Blob','Spring'];
 const materials:MaterialName[]=['violet','green','color glass','silver','green dark team','silver','violet','white','glass dark team'];
 return {version:1,background:'#BEBEBE',grid:true,fog:false,objects:shapeNames.map((shape,index)=>({id:shape,name:names[index],shape,
  // Carabiner XYZ are literal values verified in source1:5688/5693/5698.
  // Remaining placement, rotations and scales are reconstruction defaults.
  position:[109.33+(index%3-1)*320,534.92-Math.floor(index/3)*320,index===1?-.33:0],rotation:[0,0,0],scale:[1,1,1],material:materials[index],visible:true,locked:false}))};
}
export function initialView(context:'scene'|'object'='scene'):SplineView{return{selection:context==='object'?'carabiner':null,tab:context==='object'?'Assets':'Agent',target:[70,214.92,0],eye:[70,214.92,1500],zoom:2,projection:'orthographic'};}
export function numericValue(text:string,kind:'position'|'rotation'|'scale'){
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text.trim()))throw Error('Введите конечное число');
 const value=Number(text),bounds=kind==='scale'?[.01,100]:kind==='rotation'?[-36000,36000]:[-100000,100000];
 if(!Number.isFinite(value)||value<bounds[0]||value>bounds[1])throw Error('Значение вне допустимого диапазона');return value;
}
type ObjectChange=Partial<Pick<SceneObject,'name'|'position'|'rotation'|'scale'|'material'|'visible'|'locked'>>;
export function updateObject(document:SplineDocument,id:string,change:ObjectChange):SplineDocument{
 const object=document.objects.find(item=>item.id===id);if(!object)throw Error('Объект недоступен');
 if(object.locked&&Object.keys(change).some(key=>key!=='locked'))throw Error('Объект заблокирован');
 const next={...document,objects:document.objects.map(item=>item.id===id?{...item,...copy(change)}:item)};validateDocument(next);return next;
}
export function transformAxis(document:SplineDocument,id:string,kind:'position'|'rotation'|'scale',axis:0|1|2,value:number){
 const object=document.objects.find(item=>item.id===id);if(!object)throw Error('Объект недоступен');
 const vector:Vector3=[...object[kind]];vector[axis]=value;return updateObject(document,id,{[kind]:vector});
}
export function updateScene(document:SplineDocument,change:Partial<Pick<SplineDocument,'background'|'grid'|'fog'>>){const next={...document,...change};validateDocument(next);return next;}
export type ObjectTransform=Pick<SceneObject,'position'|'rotation'|'scale'>;
/** One owned pointer transaction. Preview is never a committed document or a save snapshot. */
export class SplineTransformGesture {
 private readonly base:SplineDocument;private readonly signature:string;private preview:SplineDocument;private closed=false;
 constructor(document:SplineDocument,readonly id:string){validateDocument(document);const object=document.objects.find(item=>item.id===id);if(!object||!object.visible||object.locked)throw Error('Объект недоступен для манипуляции');this.base=copy(document);this.preview=copy(document);this.signature=serializeDocument(document);}
 update(transform:ObjectTransform){if(this.closed)throw Error('Жест уже завершён');record(transform);keys(transform,['position','rotation','scale']);const next=updateObject(this.base,this.id,transform);this.preview=next;return copy(next);}
 finish(current:SplineDocument){if(this.closed)throw Error('Жест уже завершён');this.closed=true;if(serializeDocument(current)!==this.signature)throw Error('Документ изменился во время жеста');return copy(this.preview);}
 cancel(){this.closed=true;}
}
export class SplineHistory {
 private past:SplineDocument[]=[]; private future:SplineDocument[]=[];private current:SplineDocument;
 constructor(document:SplineDocument){validateDocument(document);this.current=copy(document);}
 replace(document:SplineDocument){validateDocument(document);this.current=copy(document);this.past=[];this.future=[];}
 get document(){return copy(this.current);}
 get canUndo(){return this.past.length>0;}get canRedo(){return this.future.length>0;}
 apply(next:SplineDocument){validateDocument(next);if(serializeDocument(next)===serializeDocument(this.current))return false;this.past.push(copy(this.current));if(this.past.length>50)this.past.shift();this.current=copy(next);this.future=[];return true;}
 undo(){const next=this.past.pop();if(!next)return false;this.future.push(copy(this.current));this.current=next;return true;}
 redo(){const next=this.future.pop();if(!next)return false;this.past.push(copy(this.current));this.current=next;return true;}
}
/** Local persistence acknowledges exactly its captured document, never newer edits.
 * A stale completion cannot finish a newer request; cancel invalidates its token.
 */
export class SplineSave {
 private sequence=0;private pending:{token:number;text:string}|null=null;private saved:string;
 constructor(document:SplineDocument){this.saved=serializeDocument(document);}
 get busy(){return this.pending!==null;}
 invalidate(){this.saved='';}
 dirty(document:SplineDocument){return serializeDocument(document)!==this.saved;}
 begin(document:SplineDocument){if(this.pending)return null;const request={token:++this.sequence,text:serializeDocument(document)};this.pending=request;return{...request};}
 finish(token:number,write:(text:string)=>void){if(this.pending?.token!==token)return false;const request=this.pending;
  // Failure preserves dirty status and frees the request for an explicit retry.
  try{write(request.text);this.saved=request.text;return true;}finally{this.pending=null;}
 }
 cancel(){this.pending=null;this.sequence++;}
}
