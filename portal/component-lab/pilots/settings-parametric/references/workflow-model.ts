/** Reference application DAG and local executor. Not a SEDA component contract or AI provider. */
export const storageKey='seda.reference.workflow.document.v1';
export type NodeKind='iterator'|'describer'|'generator'|'text';
export type PortType='image'|'text';
export interface FlowImage {id:string;name:string;mime:'image/png'|'image/jpeg'|'image/webp';dataURL:string;width:number;height:number}
interface BaseNode {id:string;kind:NodeKind;name:string;x:number;y:number}
export type FlowNode=(BaseNode&{kind:'iterator';images:FlowImage[]})|(BaseNode&{kind:'text';text:string})|(BaseNode&{kind:'describer'|'generator';prompt:string;provider:'fixture'|'fail';runs:number});
export interface Edge {id:string;from:string;output:string;to:string;input:string}
export interface WorkflowDocument {version:1;name:string;nodes:FlowNode[];edges:Edge[]}
export interface Port {id:string;label:string;type:PortType;direction:'input'|'output';required:boolean}
export type Value={type:'image';items:FlowImage[]}|{type:'text';items:string[]};
export interface Plan {target:string;order:string[];counts:Record<string,number>;operations:number}
export const copy=<T,>(value:T):T=>structuredClone(value);
function record(value:unknown):asserts value is Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Ожидается обычный объект');}
function keys(value:Record<string,unknown>,expected:string[]){if(Object.keys(value).length!==expected.length||expected.some(key=>!Object.hasOwn(value,key)))throw Error('Неизвестная структура workflow');}
function id(value:unknown):asserts value is string {if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(value)||['__proto__','prototype','constructor'].includes(value))throw Error('Недопустимый ID');}
function text(value:unknown,max:number):asserts value is string{if(typeof value!=='string'||value.length>max)throw Error('Текст вне допустимого размера');}
function finite(value:unknown,min:number,max:number){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error('Число вне диапазона');}
export function validateImage(value:unknown):asserts value is FlowImage{
 record(value);keys(value,['id','name','mime','dataURL','width','height']);id(value.id);text(value.name,160);if(!value.name.trim())throw Error('Нужно имя изображения');finite(value.width,1,16384);finite(value.height,1,16384);if(!Number.isInteger(value.width)||!Number.isInteger(value.height))throw Error('Размеры изображения должны быть целыми');
 if(!['image/png','image/jpeg','image/webp'].includes(String(value.mime))||typeof value.dataURL!=='string'||value.dataURL.length>350000)throw Error('Нужен PNG/JPEG/WebP до256KiB');
 const prefix='data:'+value.mime+';base64,';if(!value.dataURL.startsWith(prefix))throw Error('Недопустимый data URL');const encoded=value.dataURL.slice(prefix.length);if(!/^[a-zA-Z0-9+/]+={0,2}$/.test(encoded)||encoded.length%4!==0)throw Error('Повреждён base64');const bytes=atob(encoded);if(bytes.length>262144)throw Error('Изображение больше256KiB');
 const png=bytes.startsWith('\x89PNG\r\n\x1a\n'),jpeg=bytes.startsWith('\xff\xd8\xff'),webp=bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP';if(!(value.mime==='image/png'&&png||value.mime==='image/jpeg'&&jpeg||value.mime==='image/webp'&&webp))throw Error('Сигнатура изображения не совпадает с MIME');
}
export function ports(kind:NodeKind):Port[]{
 const port=(id:string,type:PortType,direction:Port['direction'],required=false):Port=>({id,label:id,type,direction,required});
 if(kind==='iterator')return[port('image','image','output')];if(kind==='text')return[port('text','text','output')];if(kind==='describer')return[port('image','image','input',true),port('text','text','output')];if(kind==='generator')return[port('text','text','input',true),port('image','image','input'),port('image','image','output')];throw Error('Неизвестный тип узла');
}
function portOf(node:FlowNode,port:string,direction:Port['direction']){const found=ports(node.kind).find(p=>p.id===port&&p.direction===direction);if(!found)throw Error('Порт недоступен');return found;}
function topological(document:WorkflowDocument,target?:string){const visited=new Set<string>(),stack=new Set<string>(),order:string[]=[];const visit=(id:string)=>{if(stack.has(id))throw Error('Цикл в графе');if(visited.has(id))return;stack.add(id);for(const e of document.edges.filter(e=>e.to===id))visit(e.from);stack.delete(id);visited.add(id);order.push(id);};if(target){if(!document.nodes.some(n=>n.id===target))throw Error('Узел недоступен');visit(target);}else for(const n of document.nodes)visit(n.id);return order;}
export function validateDocument(value:unknown):asserts value is WorkflowDocument{
 record(value);keys(value,['version','name','nodes','edges']);if(value.version!==1||!Array.isArray(value.nodes)||value.nodes.length>100||!Array.isArray(value.edges)||value.edges.length>300)throw Error('Недопустимый workflow');text(value.name,160);if(!value.name.trim())throw Error('Нужно имя workflow');
 const ids=new Set<string>();let imageCount=0;
 for(const node of value.nodes){record(node);const fields=['id','kind','name','x','y'];if(node.kind==='iterator')fields.push('images');else if(node.kind==='text')fields.push('text');else if(node.kind==='describer'||node.kind==='generator')fields.push('prompt','provider','runs');else throw Error('Неизвестный тип узла');keys(node,fields);id(node.id);if(ids.has(node.id))throw Error('Повторный ID узла');ids.add(node.id);text(node.name,160);if(!node.name.trim())throw Error('Нужно имя узла');finite(node.x,-10000,10000);finite(node.y,-10000,10000);
  if(node.kind==='iterator'){if(!Array.isArray(node.images)||node.images.length>8)throw Error('Не больше8 изображений в iterator');const imageIds=new Set<string>();for(const image of node.images){validateImage(image);if(imageIds.has(image.id)||++imageCount>16)throw Error('Повторный ID или слишком много изображений');imageIds.add(image.id);}}
  else if(node.kind==='text')text(node.text,20000);else{text(node.prompt,20000);if(typeof node.provider!=='string'||!['fixture','fail'].includes(node.provider)||!Number.isInteger(node.runs)||Number(node.runs)<1||Number(node.runs)>4)throw Error('Неверный local executor или Runs');}
 }
 const doc=value as unknown as WorkflowDocument,edgeIds=new Set<string>(),inputs=new Set<string>();
 for(const edge of doc.edges){record(edge);keys(edge,['id','from','output','to','input']);id(edge.id);if(edgeIds.has(edge.id))throw Error('Повторный ID соединения');edgeIds.add(edge.id);id(edge.from);id(edge.to);text(edge.output,20);text(edge.input,20);const from=doc.nodes.find(n=>n.id===edge.from),to=doc.nodes.find(n=>n.id===edge.to);if(!from||!to||from.id===to.id)throw Error('Недопустимые концы соединения');if(portOf(from,edge.output,'output').type!==portOf(to,edge.input,'input').type)throw Error('Несовместимые типы портов');const key=to.id+':'+edge.input;if(inputs.has(key))throw Error('Вход уже соединён');inputs.add(key);}
 topological(doc);if(JSON.stringify(doc).length>4000000)throw Error('Workflow больше4MB');
}
export function readDocument(raw:string){if(raw.length>4000000)throw Error('Workflow больше4MB');const value:unknown=JSON.parse(raw);validateDocument(value);return copy(value);}
export function serializeDocument(document:WorkflowDocument){validateDocument(document);return JSON.stringify(document);}
export function initialDocument():WorkflowDocument{return{version:1,name:'untitled',nodes:[{id:'image-iterator',kind:'iterator',name:'Image Iterator',x:-409,y:314.17,images:[]},{id:'image-describer',kind:'describer',name:'Image Describer',x:311,y:274,prompt:"You are an expert image analyst tasked with providing detailed accurate and helpful descriptions of images. Your goal is to make visual content accessible through clear comprehensive text descriptions. Be objective and factual using clear descriptive language. Organize information from general to specific and include relevant context. Start with a brief overview of what the image shows then describe the main subjects and setting. Include visual details like colors lighting, textures, style, genre, contrast and composition. Transcribe any visible text accurately. Use specific concrete language and mention spatial relationships. For people focus on actions clothing and general appearance respectfully. For data visualizations explain the information presented. Write as if describing to someone who cannot see the image including important context for understanding. Balance thoroughness with clarity and provide descriptions in natural flowing narrative form. Your description shouldn't be longer than 500 characters",provider:'fixture',runs:1},{id:'image-generator',kind:'generator',name:'GPT Image 2.5',x:1141,y:314,prompt:'',provider:'fixture',runs:1}],edges:[{id:'source-image-wire',from:'image-iterator',output:'image',to:'image-describer',input:'image'}]};}
export function updateNode(document:WorkflowDocument,nodeId:string,change:Record<string,unknown>){validateDocument(document);record(change);if(Object.keys(change).some(key=>['id','kind'].includes(key)))throw Error('ID и kind неизменяемы');if(!document.nodes.some(n=>n.id===nodeId))throw Error('Узел недоступен');const next=copy(document);const index=next.nodes.findIndex(n=>n.id===nodeId);Object.assign(next.nodes[index],copy(change));validateDocument(next);return next;}
export function connect(document:WorkflowDocument,edge:Edge){const next=copy(document);next.edges.push(copy(edge));validateDocument(next);return next;}
export function disconnect(document:WorkflowDocument,edgeId:string){validateDocument(document);if(!document.edges.some(e=>e.id===edgeId))throw Error('Соединение недоступно');return{...copy(document),edges:document.edges.filter(e=>e.id!==edgeId).map(copy)};}
export function addNode(document:WorkflowDocument,kind:NodeKind,x:number,y:number){const next=copy(document),id='node-'+crypto.randomUUID(),base={id,name:{iterator:'Image Iterator',describer:'Image Describer',generator:'Image pass-through fixture',text:'Text input'}[kind],x,y};let node:FlowNode;if(kind==='iterator')node={...base,kind,images:[]};else if(kind==='text')node={...base,kind,text:''};else if(kind==='describer'||kind==='generator')node={...base,kind,prompt:'',provider:'fixture',runs:1};else throw Error('Неизвестный тип узла');next.nodes.push(node);validateDocument(next);return{document:next,id};}
export function deleteNode(document:WorkflowDocument,nodeId:string){validateDocument(document);if(!document.nodes.some(n=>n.id===nodeId))throw Error('Узел недоступен');const next=copy(document);next.nodes=next.nodes.filter(n=>n.id!==nodeId);next.edges=next.edges.filter(e=>e.from!==nodeId&&e.to!==nodeId);validateDocument(next);return next;}
export function plan(document:WorkflowDocument,target:string):Plan{
 validateDocument(document);const order=topological(document,target),counts:Record<string,number>=Object.create(null);let operations=0;
 for(const id of order){const node=document.nodes.find(n=>n.id===id)!,incoming=document.edges.filter(e=>e.to===id),inputs=ports(node.kind).filter(p=>p.direction==='input');for(const p of inputs)if(p.required&&!incoming.some(e=>e.input===p.id))throw Error(node.name+': вход '+p.id+' не соединён');
  if(node.kind==='iterator'){if(!node.images.length)throw Error('A connected iterator has no values. Добавьте изображения.');counts[id]=node.images.length;}
  else if(node.kind==='text'){if(!node.text.trim())throw Error(node.name+': пустой текст');counts[id]=1;}
  else{if(!node.prompt.trim())throw Error(node.name+': пустой prompt');if(node.kind==='generator'&&!incoming.some(e=>e.input==='image'))throw Error('Local pass-through требует image input; AI generation не подключён');const sizes=incoming.map(e=>counts[e.from]),batch=Math.max(...sizes);if(sizes.some(size=>size!==1&&size!==batch))throw Error('Размеры batch несовместимы: нужен равный размер или broadcast1');counts[id]=batch*node.runs;operations+=counts[id];}
  if(counts[id]>64||operations>128)throw Error('Слишком большой batch: максимум64 values и128 local operations');
 }
 return{target,order,counts,operations};
}
export function numericDraft(text:string){if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text.trim()))throw Error('Нужно конечное число');const value=Number(text);finite(value,-10000,10000);return value;}
export function validateValue(value:unknown,type:PortType):asserts value is Value{record(value);keys(value,['type','items']);if(value.type!==type||!Array.isArray(value.items)||!value.items.length||value.items.length>64)throw Error('Executor вернул неверный batch');for(const item of value.items)if(type==='image')validateImage(item);else text(item,5000);}
export type Executor=(node:FlowNode,inputs:Record<string,Value>,signal:AbortSignal)=>Promise<Value>;
function fingerprint(text:string){let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);return(hash>>>0).toString(16);}
/** Deliberately deterministic metadata/pass-through fixture. No network, inference, billing or prompt execution. */
export async function fixture(node:FlowNode,inputs:Record<string,Value>):Promise<Value>{
 if(node.kind==='iterator')return{type:'image',items:copy(node.images)};if(node.kind==='text')return{type:'text',items:[node.text]};if(node.provider==='fail')throw Error('Simulated local executor error');const images=inputs.image;if(!images||images.type!=='image')throw Error('Image input недоступен');
 if(node.kind==='describer')return{type:'text',items:images.items.flatMap(image=>Array.from({length:node.runs},(_,i)=>`Local metadata fixture · ${image.name} · ${image.width}×${image.height} · run${i+1} · input ${fingerprint(image.dataURL)} · prompt ${fingerprint(node.prompt)}`))};
 const prompts=inputs.text;if(!prompts||prompts.type!=='text')throw Error('Text input недоступен');const size=Math.max(images.items.length,prompts.items.length);return{type:'image',items:Array.from({length:size*node.runs},(_,i)=>copy(images.items[Math.floor(i/node.runs)%images.items.length]))};
}
export interface RunState {token:number;target:string;snapshot:string;phase:'running'|'done'|'error'|'cancelled';order:string[];completed:number;outputs:Record<string,Value>;error:string;current:string|null}
export class WorkflowRunner {
 private sequence=0;private active:{token:number;document:WorkflowDocument;plan:Plan;controller:AbortController;started:boolean}|null=null;private stateValue:RunState|null=null;
 get busy(){return this.active!==null;}get state(){return copy(this.stateValue);}
 begin(document:WorkflowDocument,target:string){if(this.active)return null;const next=plan(document,target),token=++this.sequence,snapshot=serializeDocument(document);this.active={token,document:copy(document),plan:copy(next),controller:new AbortController(),started:false};this.stateValue={token,target,snapshot,phase:'running',order:next.order,completed:0,outputs:Object.create(null),error:'',current:null};return token;}
 cancel(){if(!this.active)return false;const request=this.active;this.active=null;this.sequence++;request.controller.abort();if(this.stateValue){this.stateValue.phase='cancelled';this.stateValue.current=null;}return true;}
 async execute(token:number,executor:Executor,notify:()=>void=()=>{}){
  const request=this.active;if(!request||request.token!==token||request.started)return false;request.started=true;const owned=()=>this.active===request&&this.sequence===token;const state=this.stateValue!;
  try{for(const id of request.plan.order){if(!owned())return false;state.current=id;notify();if(!owned())return false;const node=request.document.nodes.find(n=>n.id===id)!,inputs:Record<string,Value>=Object.create(null);for(const edge of request.document.edges.filter(e=>e.to===id))inputs[edge.input]=copy(state.outputs[edge.from]);const value=await executor(copy(node),inputs,request.controller.signal);if(!owned())return false;validateValue(value,ports(node.kind).find(p=>p.direction==='output')!.type);if(value.items.length!==request.plan.counts[id])throw Error('Executor batch не соответствует плану');state.outputs[id]=copy(value);state.completed++;notify();}if(!owned())return false;state.phase='done';state.current=null;this.active=null;notify();return true;}
  catch(error){if(!owned())return false;state.phase='error';state.error=error instanceof Error?error.message:'Executor error';state.current=null;this.active=null;notify();return true;}
 }
}
export class WorkflowHistory {
 private current:WorkflowDocument;private past:string[]=[];private future:string[]=[];
 constructor(document:WorkflowDocument){validateDocument(document);this.current=copy(document);}get document(){return copy(this.current);}get canUndo(){return!!this.past.length;}get canRedo(){return!!this.future.length;}
 private trim(){let bytes=[...this.past,...this.future].reduce((sum,text)=>sum+text.length*2,0);while(this.past.length+this.future.length>50||bytes>24000000){const queue=this.past.length?this.past:this.future;bytes-=queue.shift()!.length*2;}}
 apply(next:WorkflowDocument){const previous=serializeDocument(this.current);if(serializeDocument(next)===previous)return false;this.past.push(previous);this.current=copy(next);this.future=[];this.trim();return true;}
 undo(){const next=this.past.pop();if(!next)return false;this.future.push(serializeDocument(this.current));this.current=readDocument(next);this.trim();return true;}redo(){const next=this.future.pop();if(!next)return false;this.past.push(serializeDocument(this.current));this.current=readDocument(next);this.trim();return true;}
}
/** One drag produces one history entry. A stale gesture cannot overwrite intervening edits. */
export class WorkflowMove {
 private base:WorkflowDocument;private signature:string;private next:WorkflowDocument;private closed=false;
 constructor(document:WorkflowDocument,readonly nodeId:string){validateDocument(document);if(!document.nodes.some(n=>n.id===nodeId))throw Error('Узел недоступен');this.base=copy(document);this.next=copy(document);this.signature=serializeDocument(document);}
 update(dx:number,dy:number){if(this.closed)throw Error('Жест завершён');const node=this.base.nodes.find(n=>n.id===this.nodeId)!;finite(dx,-20000,20000);finite(dy,-20000,20000);this.next=updateNode(this.base,this.nodeId,{x:node.x+dx,y:node.y+dy});return copy(this.next);}
 finish(document:WorkflowDocument){if(this.closed)throw Error('Жест завершён');this.closed=true;if(serializeDocument(document)!==this.signature)throw Error('Документ изменился во время жеста');return copy(this.next);}
 cancel(){this.closed=true;}
}
export class WorkflowSave {
 private sequence=0;private pending:{token:number;text:string}|null=null;private saved:string;
 constructor(document:WorkflowDocument){this.saved=serializeDocument(document);}invalidate(){this.saved='';}get busy(){return this.pending!==null;}dirty(document:WorkflowDocument){return serializeDocument(document)!==this.saved;}
 begin(document:WorkflowDocument){if(this.pending)return null;const request={token:++this.sequence,text:serializeDocument(document)};this.pending=request;return copy(request);}
 finish(token:number,write:(text:string)=>void){if(this.pending?.token!==token)return false;const request=this.pending;try{write(request.text);this.saved=request.text;return true;}finally{this.pending=null;}}
 cancel(){this.pending=null;this.sequence++;}
}
