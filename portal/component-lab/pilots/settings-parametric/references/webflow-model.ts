/** Reconstructed reference-document domain. These are authored CSS rules, not SEDA UI tokens/contracts. */
export const breakpoints=['desktop','tablet','landscape','portrait'] as const;
export type Breakpoint=typeof breakpoints[number];
export type Length={value:number;unit:'px'|'%'|'vw'|'vh'|'rem'|'em'};
export type Dimension=Length|'auto'|'none'|'fit-content';
export interface AuthorStyle {
 display:'block'|'flex'|'grid'|'inline-block'|'none';position:'static'|'relative'|'absolute'|'fixed';
 width:Dimension;height:Dimension;minWidth:Dimension;minHeight:Dimension;maxWidth:Dimension;maxHeight:Dimension;
 marginTop:Dimension;marginRight:Dimension;marginBottom:Dimension;marginLeft:Dimension;
 paddingTop:Length;paddingRight:Length;paddingBottom:Length;paddingLeft:Length;
 top:Dimension;right:Dimension;bottom:Dimension;left:Dimension;
 flexGrow:number;flexShrink:number;flexBasis:Dimension;alignSelf:'auto'|'stretch'|'flex-start'|'center'|'flex-end'|'baseline';
 gap:Length;flexDirection:'row'|'column';justifyContent:'flex-start'|'center'|'flex-end'|'space-between';alignItems:'stretch'|'flex-start'|'center'|'flex-end'|'baseline';
 gridColumns:number;overflow:'visible'|'hidden'|'auto'|'scroll';verticalAlign:'baseline'|'top'|'middle'|'bottom';
 fontFamily:'Inter'|'Arial'|'Georgia'|'monospace';fontSize:Length;fontWeight:400|500|600|700;lineHeight:number|Length;
 color:string;backgroundColor:string;borderColor:string;borderWidth:Length;borderRadius:Length;
 textAlign:'left'|'center'|'right'|'justify';textDecoration:'none'|'underline'|'line-through';opacity:number;zIndex:number|'auto';
}
export type StyleKey=keyof AuthorStyle;export type StyleDeclarations=Partial<AuthorStyle>;
export type NodeKind='body'|'container'|'section'|'slider'|'mask'|'slide'|'text'|'divider'|'component'|'embed';
export interface AuthorNode {id:string;parentId:string|null;kind:NodeKind;name:string;className:string;text:string;visible:boolean;tag:'main'|'div'|'section'|'nav'|'footer'|'p'|'span'|'h1'|'h2'|'h3';htmlId:string;ariaLabel:string}
export interface AuthorPage {id:string;name:string;nodes:AuthorNode[]}
export interface AuthorDocument {version:1;pages:AuthorPage[];rules:Record<string,Partial<Record<Breakpoint,StyleDeclarations>>>}
export interface AuthorView {pageId:string;selection:string|null;width:number;height:number;zoom:number;panX:number;panY:number}
export const documentKey='seda.reference.webflow.document.v1';
const clone=<T>(value:T):T=>structuredClone(value),px=(value:number):Length=>({value,unit:'px'});
export const initialStyle:AuthorStyle={display:'block',position:'static',width:'auto',height:'auto',minWidth:px(0),minHeight:px(0),maxWidth:'none',maxHeight:'none',marginTop:px(0),marginRight:px(0),marginBottom:px(0),marginLeft:px(0),paddingTop:px(0),paddingRight:px(0),paddingBottom:px(0),paddingLeft:px(0),top:'auto',right:'auto',bottom:'auto',left:'auto',gap:px(0),flexGrow:0,flexShrink:1,flexBasis:'auto',alignSelf:'auto',flexDirection:'row',justifyContent:'flex-start',alignItems:'stretch',gridColumns:1,overflow:'visible',verticalAlign:'baseline',fontFamily:'Inter',fontSize:px(16),fontWeight:400,lineHeight:1.5,color:'#ffffff',backgroundColor:'#00000000',borderColor:'#000000',borderWidth:px(0),borderRadius:px(0),textAlign:'left',textDecoration:'none',opacity:1,zIndex:'auto'};
const inherited=new Set<StyleKey>(['fontFamily','fontSize','fontWeight','lineHeight','color','textAlign']);
export const styleKeys=Object.keys(initialStyle) as StyleKey[];
const kinds:NodeKind[]=['body','container','section','slider','mask','slide','text','divider','component','embed'];
const tagNames:AuthorNode['tag'][]=['main','div','section','nav','footer','p','span','h1','h2','h3'];
const idPattern=/^[A-Za-z][A-Za-z0-9_-]{0,79}$/,classPattern=/^[A-Za-z_][A-Za-z0-9_-]{0,79}$/;
function record(value:unknown):asserts value is Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('Ожидается простой объект');}
const reservedNames=new Set(['__proto__','prototype','constructor']);
function exact(value:Record<string,unknown>,keys:string[]){if(Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))throw Error('Неизвестная структура документа');}
const lengths=new Set<StyleKey>(['width','height','minWidth','minHeight','maxWidth','maxHeight','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','top','right','bottom','left','gap','fontSize','borderWidth','borderRadius','flexBasis']);
const negative=new Set<StyleKey>(['marginTop','marginRight','marginBottom','marginLeft','top','right','bottom','left']);
const allowAuto=new Set<StyleKey>(['width','height','marginTop','marginRight','marginBottom','marginLeft','top','right','bottom','left','flexBasis']);
const allowNone=new Set<StyleKey>(['maxWidth','maxHeight']);
const allowIntrinsic=new Set<StyleKey>(['width','height','minWidth','minHeight','maxWidth','maxHeight']);
const enums:Partial<Record<StyleKey,readonly unknown[]>>={display:['block','flex','grid','inline-block','none'],position:['static','relative','absolute','fixed'],alignSelf:['auto','stretch','flex-start','center','flex-end','baseline'],flexDirection:['row','column'],justifyContent:['flex-start','center','flex-end','space-between'],alignItems:['stretch','flex-start','center','flex-end','baseline'],overflow:['visible','hidden','auto','scroll'],verticalAlign:['baseline','top','middle','bottom'],fontFamily:['Inter','Arial','Georgia','monospace'],fontWeight:[400,500,600,700],textAlign:['left','center','right','justify'],textDecoration:['none','underline','line-through']};
function validateLength(value:unknown,key:StyleKey){record(value);exact(value,['value','unit']);if(typeof value.value!=='number'||!Number.isFinite(value.value)||Math.abs(value.value)>100000||(!negative.has(key)&&value.value<0)||!['px','%','vw','vh','rem','em'].includes(String(value.unit))||key==='borderWidth'&&value.unit==='%')throw Error('Недопустимая CSS длина: '+key);if(key==='fontSize'&&value.value<=0)throw Error('Размер шрифта должен быть положительным');}
export function validateStyleValue(key:StyleKey,value:unknown){
 if(!styleKeys.includes(key))throw Error('Неизвестное CSS свойство');
 if(lengths.has(key)){if(value==='auto'&&allowAuto.has(key)||value==='none'&&allowNone.has(key)||value==='fit-content'&&allowIntrinsic.has(key))return;validateLength(value,key);return;}
 if(enums[key]){if(!enums[key]!.includes(value))throw Error('Неподдерживаемое CSS значение: '+key);return;}
 if(['color','backgroundColor','borderColor'].includes(key)){if(typeof value!=='string'||!/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(value))throw Error('Нужен HEX цвет');return;}
 if(key==='lineHeight'){if(typeof value==='number'&&Number.isFinite(value)&&value>=.5&&value<=5)return;validateLength(value,'fontSize');return;}
 if(key==='zIndex'&&value==='auto')return;
 if(key==='flexGrow'||key==='flexShrink'){if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>100)throw Error('Flex factor вне0–100');return;}
 if(typeof value!=='number'||!Number.isFinite(value)||key==='opacity'&&(value<0||value>1)||key==='gridColumns'&&(!Number.isInteger(value)||value<1||value>12)||key==='zIndex'&&(!Number.isInteger(value)||Math.abs(value)>100000))throw Error('Недопустимое числовое CSS значение');
}
export function parseStyleInput(key:StyleKey,text:string):AuthorStyle[StyleKey]{
 const raw=text.trim();let value:unknown=raw;
 if(lengths.has(key)||key==='lineHeight'){
  const match=/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(px|%|vw|vh|rem|em)$/i.exec(raw);
  if(match)value={value:Number(match[1]),unit:match[2].toLowerCase()};
  else if(key==='lineHeight'&&/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))value=Number(raw);
 }else if(['gridColumns','fontWeight','opacity','zIndex','flexGrow','flexShrink'].includes(key)&&/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))value=Number(raw);
 validateStyleValue(key,value);return value as AuthorStyle[StyleKey];
}
export function formatStyleValue(value:AuthorStyle[StyleKey]){return typeof value==='object'?String(value.value)+value.unit:String(value);}
export function breakpointFor(width:number):Breakpoint{if(!Number.isFinite(width)||width<240||width>2400)throw Error('Viewport вне240–2400px');return width>=992?'desktop':width>=768?'tablet':width>=480?'landscape':'portrait';}
export function validateDocument(value:unknown):asserts value is AuthorDocument {
 record(value);exact(value,['version','pages','rules']);if(value.version!==1||!Array.isArray(value.pages)||!value.pages.length||value.pages.length>24)throw Error('Недопустимые страницы');record(value.rules);
 if(Object.keys(value.rules).length>1200)throw Error('Слишком много классов');
 for(const[name,rule]of Object.entries(value.rules)){if(!classPattern.test(name)||reservedNames.has(name))throw Error('Неверный CSS class');record(rule);for(const[bp,decl]of Object.entries(rule)){if(!breakpoints.includes(bp as Breakpoint))throw Error('Неизвестный breakpoint');record(decl);for(const[key,item]of Object.entries(decl))validateStyleValue(key as StyleKey,item);}}
 const ids=new Set<string>(),pageIds=new Set<string>();let count=0;
 for(const page of value.pages){record(page);exact(page,['id','name','nodes']);if(typeof page.id!=='string'||!idPattern.test(page.id)||pageIds.has(page.id)||typeof page.name!=='string'||!page.name.trim()||page.name.length>160||!Array.isArray(page.nodes)||!page.nodes.length)throw Error('Недопустимая страница');pageIds.add(page.id);const locals=new Map<string,AuthorNode>(),htmlIds=new Set<string>();
  for(const node of page.nodes){record(node);exact(node,['id','parentId','kind','name','className','text','visible','tag','htmlId','ariaLabel']);if(typeof node.id!=='string'||!idPattern.test(node.id)||ids.has(node.id)||!kinds.includes(node.kind as NodeKind)||!tagNames.includes(node.tag as AuthorNode['tag'])||typeof node.name!=='string'||!node.name.trim()||node.name.length>160||typeof node.className!=='string'||!Object.hasOwn(value.rules,node.className)||typeof node.text!=='string'||node.text.length>10000||typeof node.visible!=='boolean'||typeof node.htmlId!=='string'||node.htmlId!==''&&(!idPattern.test(node.htmlId)||htmlIds.has(node.htmlId))||typeof node.ariaLabel!=='string'||node.ariaLabel.length>300||node.parentId!==null&&typeof node.parentId!=='string')throw Error('Недопустимый элемент');ids.add(node.id);if(node.htmlId)htmlIds.add(node.htmlId);locals.set(node.id,node as unknown as AuthorNode);count++;}
  if(page.nodes.filter((node:AuthorNode)=>node.parentId===null).length!==1)throw Error('Нужен один root');
  for(const node of locals.values()){if(node.parentId===null&&node.kind!=='body'||node.parentId!==null&&node.kind==='body')throw Error('Неверный root kind');let parent=node.parentId,seen=new Set([node.id]);while(parent!==null){const next=locals.get(parent);if(!next||seen.has(parent)||seen.size>=32||['text','divider','embed'].includes(next.kind))throw Error('Недопустимая иерархия');seen.add(parent);parent=next.parentId;}}
 }if(count>600)throw Error('Слишком много элементов');
}
export function serializeDocument(document:AuthorDocument){validateDocument(document);return JSON.stringify(document);}
export function readDocument(text:string){if(text.length>2_000_000)throw Error('Документ больше2МБ');const value:unknown=JSON.parse(text);validateDocument(value);return clone(value);}
export function initialDocument():AuthorDocument {
 const data:[string,string|null,NodeKind,string,AuthorNode['tag']][]=[['body',null,'body','Body','main'],['embed','body','embed','Code Embed','div'],['navbar','body','component','Navbar','nav'],['section','body','section','section','section'],['container','section','container','container','div'],['hero-slider','container','slider','hero-slider','div'],['hero-big-slider','hero-slider','slider','hero-big-slider','div'],['hero-slider-mask','hero-big-slider','mask','hero-slider-mask','div'],['slide-1','hero-slider-mask','slide','slide-1','div'],['slide-2','hero-slider-mask','slide','slide-2','div'],['left-arrow','hero-big-slider','container','Left Arrow','div'],['right-arrow','hero-big-slider','container','Right Arrow','div'],['slide-nav','hero-big-slider','container','Slide Nav','div'],['hero-text','container','text','hero-text','p'],['divider','container','divider','divider','div'],['section-2','body','section','Section','section'],['section-3','body','section','Section','section'],['section-4','body','section','Section','section'],['footer','body','component','Footer','footer']];
 const document:AuthorDocument={version:1,pages:[{id:'home',name:'Home',nodes:data.map(([id,parentId,kind,name,tag])=>({id,parentId,kind,name,tag,className:id,text:'',visible:id!=='slide-nav',htmlId:'',ariaLabel:''}))}],rules:Object.fromEntries(data.map(([id])=>[id,{}]))};
 document.rules.body={desktop:{fontFamily:'Inter',fontSize:{value:1.3,unit:'vw'},fontWeight:400,lineHeight:1.5,color:'#ffffff',backgroundColor:'#0e0e0e'}};
 // Geometry/parent CSS are inferred; supplied Figma iframe has no original authored DOM/CSS.
 document.rules.navbar={desktop:{height:px(96.14)}};document.rules.container={desktop:{marginLeft:px(54),marginRight:px(54)}};
 document.rules['hero-slider-mask']={desktop:{height:px(416.48)}};document.rules['slide-2']={desktop:{position:'absolute',left:{value:100,unit:'%'},top:px(0)}};
 for(const id of ['section-2','section-3','section-4'])document.rules[id]={desktop:{minHeight:px(600)}};
 validateDocument(document);return document;
}
export function initialView():AuthorView{return{pageId:'home',selection:'slide-1',width:992,height:1343.28,zoom:.898,panX:109.5,panY:0};}
export function recipe(kind:NodeKind):StyleDeclarations{const base:StyleDeclarations={display:'block',minWidth:px(0),minHeight:px(0)};if(kind==='body')return{...base,minHeight:{value:100,unit:'vh'}};if(kind==='mask')return{...base,position:'relative',overflow:'hidden'};if(kind==='slide')return{...base,display:'inline-block',position:'relative',width:{value:100,unit:'%'},height:{value:100,unit:'%'}};if(kind==='embed')return{...base,display:'none'};return base;}
export interface CascadeStep {kind:'initial'|'recipe'|'inherit'|'rule';nodeId:string;property:StyleKey;value:AuthorStyle[StyleKey];path?:string[]}
export function resolveProperty(document:AuthorDocument,page:AuthorPage,id:string,key:StyleKey,bp:Breakpoint):{value:AuthorStyle[StyleKey];chain:CascadeStep[]}{
 const node=page.nodes.find(node=>node.id===id);if(!node||!styleKeys.includes(key)||!breakpoints.includes(bp))throw Error('Недопустимый CSS owner');
 let value:AuthorStyle[StyleKey]=initialStyle[key];let chain:CascadeStep[]=[{kind:'initial',nodeId:id,property:key,value:clone(value)}];
 if(inherited.has(key)&&node.parentId){const parent=resolveProperty(document,page,node.parentId,key,bp);value=parent.value;chain=[...parent.chain,{kind:'inherit',nodeId:id,property:key,value:clone(value),path:['nodes',node.parentId,key]}];}
 const kindStyle=recipe(node.kind);if(Object.hasOwn(kindStyle,key)){value=kindStyle[key]!;chain.push({kind:'recipe',nodeId:id,property:key,value:clone(value),path:['recipe',node.kind,key]});}
 for(const layer of breakpoints.slice(0,breakpoints.indexOf(bp)+1)){const declarations=document.rules[node.className]?.[layer];if(declarations&&Object.hasOwn(declarations,key)){value=declarations[key]!;chain.push({kind:'rule',nodeId:id,property:key,value:clone(value),path:['rules',node.className,layer,key]});}}
 return{value:clone(value),chain};
}
/** Inherited relative units must NOT be reapplied on descendants (2em would multiply at every level).
 * The browser inherits computed values; inspector trace separately explains their original declaration.
 */
export function ownDeclarations(document:AuthorDocument,node:AuthorNode,bp:Breakpoint):StyleDeclarations{const result:StyleDeclarations=recipe(node.kind);for(const layer of breakpoints.slice(0,breakpoints.indexOf(bp)+1))Object.assign(result,clone(document.rules[node.className]?.[layer]??{}));return result;}
export function cssDeclarations(document:AuthorDocument,node:AuthorNode,bp:Breakpoint):Record<string,string|number>{const css:Record<string,string|number>={},defaults=Object.fromEntries(Object.entries(initialStyle).filter(([key])=>!inherited.has(key as StyleKey)));for(const[key,value]of Object.entries({...defaults,...ownDeclarations(document,node,bp)})){if(key==='gridColumns')css.gridTemplateColumns=`repeat(${value},minmax(0,1fr))`;else css[key]=typeof value==='object'?formatStyleValue(value as Length):value as string|number;}if(!node.visible)css.display='none';return css;}
export function setStyle<K extends StyleKey>(document:AuthorDocument,className:string,bp:Breakpoint,key:K,value:AuthorStyle[K]|undefined):AuthorDocument{validateDocument(document);if(!Object.hasOwn(document.rules,className)||!breakpoints.includes(bp))throw Error('CSS класс недоступен');if(value!==undefined)validateStyleValue(key,value);const next=clone(document),declarations=next.rules[className][bp]??{};if(value===undefined)delete declarations[key];else declarations[key]=clone(value);next.rules[className][bp]=declarations;validateDocument(next);return next;}
export function updateNode(document:AuthorDocument,pageId:string,id:string,change:Partial<Pick<AuthorNode,'name'|'text'|'visible'|'tag'|'htmlId'|'ariaLabel'|'className'>>){validateDocument(document);record(change);if(Object.keys(change).some(key=>!['name','text','visible','tag','htmlId','ariaLabel','className'].includes(key)))throw Error('Недопустимое изменение элемента');const next=clone(document),node=next.pages.find(page=>page.id===pageId)?.nodes.find(node=>node.id===id);if(!node)throw Error('Элемент недоступен');Object.assign(node,change);validateDocument(next);return next;}
export function addText(document:AuthorDocument,pageId:string,parentId:string,text='Новый текст'){const next=clone(document),page=next.pages.find(page=>page.id===pageId),parent=page?.nodes.find(node=>node.id===parentId);if(!page||!parent||['text','divider','embed'].includes(parent.kind))throw Error('Нельзя добавить текст в этот элемент');const id='text-'+crypto.randomUUID();page.nodes.push({id,parentId,kind:'text',name:'Text',className:id,text,visible:true,tag:'p',htmlId:'',ariaLabel:''});next.rules[id]={};validateDocument(next);return{document:next,id};}
export function deleteNode(document:AuthorDocument,pageId:string,id:string){const next=clone(document),page=next.pages.find(page=>page.id===pageId),node=page?.nodes.find(node=>node.id===id);if(!page||!node||node.parentId===null)throw Error('Нельзя удалить root');const removed=new Set([id]);for(let changed=true;changed;){changed=false;for(const item of page.nodes)if(item.parentId&&removed.has(item.parentId)&&!removed.has(item.id)){removed.add(item.id);changed=true;}}page.nodes=page.nodes.filter(item=>!removed.has(item.id));validateDocument(next);return next;}
export class AuthorHistory {
 private past:AuthorDocument[]=[];private future:AuthorDocument[]=[];private current:AuthorDocument;
 constructor(document:AuthorDocument){validateDocument(document);this.current=clone(document);}
 get document(){return clone(this.current);}get canUndo(){return this.past.length>0;}get canRedo(){return this.future.length>0;}
 apply(next:AuthorDocument){validateDocument(next);if(serializeDocument(next)===serializeDocument(this.current))return false;this.past.push(this.current);if(this.past.length>50)this.past.shift();this.current=clone(next);this.future=[];return true;}
 undo(){const next=this.past.pop();if(!next)return false;this.future.push(this.current);this.current=next;return true;}
 redo(){const next=this.future.pop();if(!next)return false;this.past.push(this.current);this.current=next;return true;}
}

/** Same snapshot/late-response semantics as the reference editors; storage is supplied by the host. */
export class AuthorSave {
 private sequence=0;private pending:{token:number;text:string}|null=null;private saved:string;
 constructor(document:AuthorDocument){this.saved=serializeDocument(document);}
 get busy(){return this.pending!==null;}
 invalidate(){this.saved='';}
 dirty(document:AuthorDocument){return serializeDocument(document)!==this.saved;}
 begin(document:AuthorDocument){if(this.pending)return null;const request={token:++this.sequence,text:serializeDocument(document)};this.pending=request;return{...request};}
 finish(token:number,write:(text:string)=>void){if(this.pending?.token!==token)return false;const request=this.pending;try{write(request.text);this.saved=request.text;return true;}finally{this.pending=null;}}
 cancel(){this.pending=null;this.sequence++;}
}
