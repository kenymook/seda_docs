/** Framer reference application domain. Reconstructed layout, not a SEDA component contract. */
import * as author from './webflow-model';
export const documentKey='seda.reference.framer.document.v1';
export type FramerBreakpoint='desktop'|'tablet'|'portrait';
export type Axis='width'|'height';
export type SizingMode='fixed'|'fill'|'fit';
export const frames=[{id:'desktop',label:'Desktop',width:1200,x:0},{id:'tablet',label:'Tablet',width:810,x:1300},{id:'portrait',label:'Phone',width:390,x:2210}] as const;
export const sourceHeading='One shared research assistant for teams who show their work.';
const px=(value:number):author.Length=>({value,unit:'px'});
export function breakpointFor(width:number):FramerBreakpoint{if(!Number.isFinite(width)||width<240||width>2400)throw Error('Framer viewport вне240–2400px');return width>=1200?'desktop':width>=810?'tablet':'portrait';}
export function initialView(){return{pageId:'teams',selection:'teams-heading',activeFrame:'desktop' as FramerBreakpoint,zoom:1,panX:-146,panY:174};}
function node(id:string,parentId:string|null,name:string,kind:author.NodeKind='container',tag:author.AuthorNode['tag']='div',text=''):author.AuthorNode{return{id,parentId,name,kind,tag,text,className:id,visible:true,htmlId:'',ariaLabel:''};}
export function initialDocument():author.AuthorDocument{
 const pages=[['home','Home'],['teams','/teams'],['pricing','/pricing'],['design-system','/design-system']].map(([id,name])=>({id,name,nodes:[node(id+'-root',null,name,'body','main')]}));
 const teams=pages.find(page=>page.id==='teams')!;
 teams.nodes.push(node('teams-hero','teams-root','Hero'),node('teams-media','teams-hero','Empty column'),node('teams-copy','teams-hero','Copy'),node('teams-heading','teams-copy','Heading','text','h1',sourceHeading));
 const rules:author.AuthorDocument['rules']=Object.fromEntries(pages.flatMap(p=>p.nodes).map(n=>[n.className,{desktop:{position:'relative'}}]));
 for(const page of pages)rules[page.id+'-root']={desktop:{position:'relative',width:{value:100,unit:'%'},height:px(1400),backgroundColor:'#1f1f1f',fontFamily:'Inter',fontSize:px(16),lineHeight:1.5,color:'#ffffff'}};
 // Original authored page DOM/styles are absent from the Figma export. These parent rules
 // reconstruct the selected width570 and origin(610,268), not an invented landing page.
 // Correctly painted Inter gives an inferred height135, differing from the source90; fidelity remains open.
 rules['teams-hero']={desktop:{position:'relative',display:'flex',flexDirection:'row',gap:px(20),paddingLeft:px(20),paddingRight:px(20),paddingTop:px(268)},portrait:{flexDirection:'column'}};
 rules['teams-media']={desktop:{position:'relative',width:'auto',flexGrow:1,flexShrink:1,flexBasis:px(0)},portrait:{display:'none',flexGrow:0,flexBasis:'auto'}};
 rules['teams-copy']={desktop:{position:'relative',display:'flex',flexDirection:'column',width:'auto',flexGrow:1,flexShrink:1,flexBasis:px(0)},portrait:{flexGrow:0,flexBasis:'auto',alignSelf:'stretch'}};
 // H1(L) name and text are supplied; font metrics are inferred and differ from source height.
 rules['teams-heading']={desktop:{position:'relative',width:'auto',height:'auto',alignSelf:'stretch',fontSize:px(40),lineHeight:px(45),fontWeight:600,color:'#ffffff'}};
 const document:author.AuthorDocument={version:1,pages,rules};validateDocument(document);return document;
}
export function validateDocument(value:unknown):asserts value is author.AuthorDocument{author.validateDocument(value);for(const rule of Object.values(value.rules))if(Object.hasOwn(rule,'landscape'))throw Error('Framer reference uses Desktop/Tablet/Phone layers');}
export function readDocument(raw:string){const value=author.readDocument(raw);validateDocument(value);return value;}
function owner(document:author.AuthorDocument,pageId:string,nodeId:string){const page=document.pages.find(page=>page.id===pageId),node=page?.nodes.find(node=>node.id===nodeId);if(!page||!node)throw Error('Framer element unavailable');return{page,node,parent:page.nodes.find(n=>n.id===node.parentId)};}
function resolve(document:author.AuthorDocument,page:author.AuthorPage,node:author.AuthorNode,key:author.StyleKey,bp:FramerBreakpoint){return author.resolveProperty(document,page,node.id,key,bp).value;}
function mainAxis(document:author.AuthorDocument,page:author.AuthorPage,parent:author.AuthorNode|undefined,node:author.AuthorNode,bp:FramerBreakpoint):Axis|null{if(!parent||resolve(document,page,parent,'display',bp)!=='flex'||['absolute','fixed'].includes(String(resolve(document,page,node,'position',bp))))return null;return resolve(document,page,parent,'flexDirection',bp)==='row'?'width':'height';}
export function sizingMode(document:author.AuthorDocument,pageId:string,nodeId:string,axis:Axis,bp:FramerBreakpoint):SizingMode{
 const {page,node,parent}=owner(document,pageId,nodeId),value=resolve(document,page,node,axis,bp),main=mainAxis(document,page,parent,node,bp);
 if(value==='fit-content')return'fit';
 if(typeof value==='object')return value.unit==='%'&&value.value===100?'fill':'fixed';
 if(value==='auto'&&axis===main)return Number(resolve(document,page,node,'flexGrow',bp))>0?'fill':'fit';
 if(value==='auto'&&parent&&main&&axis!==main){const self=resolve(document,page,node,'alignSelf',bp);return self==='stretch'||self==='auto'&&resolve(document,page,parent,'alignItems',bp)==='stretch'?'fill':'fit';}
 if(axis==='width'&&value==='auto')return ['absolute','fixed'].includes(String(resolve(document,page,node,'position',bp)))||resolve(document,page,node,'display',bp)==='inline-block'?'fit':'fill';
 return'fit';
}
/** Fill in a fit-sized parent has no definite vertical budget in this reference model.
 * Reject it rather than displaying an unapplied cached height; users can fix parent height first.
 */
function definiteHeight(document:author.AuthorDocument,page:author.AuthorPage,node:author.AuthorNode,bp:FramerBreakpoint,seen=new Set<string>()):boolean{
 if(seen.has(node.id))return false;seen.add(node.id);if(node.parentId===null)return true;
 const value=resolve(document,page,node,'height',bp),parent=page.nodes.find(n=>n.id===node.parentId);
 if(typeof value==='object'&&value.unit!=='%')return true;
 if(typeof value==='object'&&value.unit==='%'&&parent)return definiteHeight(document,page,parent,bp,seen);
 if(parent&&mainAxis(document,page,parent,node,bp)==='height'&&Number(resolve(document,page,node,'flexGrow',bp))>0)return definiteHeight(document,page,parent,bp,seen);
 return false;
}
export function setSizing(document:author.AuthorDocument,pageId:string,nodeId:string,axis:Axis,mode:SizingMode,value:number,bp:FramerBreakpoint):author.AuthorDocument{
 validateDocument(document);if(!['width','height'].includes(axis)||!['fixed','fill','fit'].includes(mode)||!['desktop','tablet','portrait'].includes(bp))throw Error('Invalid sizing request');
 if(!Number.isFinite(value)||value<0||value>10000||mode==='fill'&&(value<=0||value>100))throw Error('Invalid size or Fill factor');
 const {page,node,parent}=owner(document,pageId,nodeId),main=mainAxis(document,page,parent,node,bp);
 const position=resolve(document,page,node,'position',bp);
 if(mode==='fill'&&axis==='height'&&position!=='fixed'&&parent&&!definiteHeight(document,page,parent,bp))throw Error('Fill height требует заданной высоты родителя');
 let next=structuredClone(document);
 function set<K extends author.StyleKey>(key:K,value:author.AuthorStyle[K]){next=author.setStyle(next,node.className,bp,key,value);}
 if(main===axis){set('flexGrow',mode==='fill'?value:0);set('flexShrink',mode==='fill'?1:0);set('flexBasis',mode==='fill'?px(0):'auto');}
 else if(main&&parent){const current=resolve(document,page,node,'alignSelf',bp) as author.AuthorStyle['alignSelf'];const stretched=current==='stretch'||current==='auto'&&resolve(document,page,parent,'alignItems',bp)==='stretch';set('alignSelf',mode==='fill'?'stretch':stretched?'flex-start':current);}
 const outOfFlow=position==='absolute'||position==='fixed',inline=resolve(document,page,node,'display',bp)==='inline-block';
 set(axis,mode==='fixed'?px(value):mode==='fit'?(axis==='width'?'fit-content':'auto'):main?'auto':axis==='width'&&!outOfFlow&&!inline?'auto':{value:100,unit:'%'});
 validateDocument(next);return next;
}
export function parseSize(text:string,mode:SizingMode){const raw=text.trim(),pattern=mode==='fill'?/^([+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:fr)?$/:/^([+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:px)?$/;const match=pattern.exec(raw);if(!match)throw Error(mode==='fill'?'Нужен положительный Fill factor (fr)':'Нужен размер в px');const value=Number(match[1]);if(!Number.isFinite(value)||value<0||value>10000||mode==='fill'&&(value<=0||value>100))throw Error('Размер вне диапазона');return value;}
