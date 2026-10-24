import {breakpointFor,cssDeclarations,validateDocument,type AuthorDocument,type AuthorNode} from './webflow-model';

// Authored content is an isolated native CSS document, not nested SEDA component overrides.
// There are deliberately no scripts, remote resources, raw HTML, links or executable embeds.
const skeleton='<!doctype html><html><head><meta charset="utf-8"><style>html{font-size:16px}html,body{margin:0;padding:0;min-height:100%}*,*::before,*::after{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#fff;background:#0e0e0e}main,div,section,nav,footer,p,span,h1,h2,h3{margin:0;padding:0;border:0 solid #000;font:inherit;color:inherit}body:focus{outline:none}</style></head><body tabindex="0"></body></html>';
export interface PreviewOptions {width:number;height:number;fonts?:readonly {url:string;weight:400|500|600|700;unicodeRange:string}[];onSelect?:(id:string)=>void;onGeometry?:()=>void;onKeyDown?:(event:KeyboardEvent)=>void}
export interface NodeMeasurement {id:string;x:number;y:number;width:number;height:number;fontSize:string;lineHeight:string;display:string;color:string}

/** The host owns the iframe and any selection overlay. Coordinates are unscaled iframe CSS pixels. */
export class AuthorPreview {
 private dead=false;private ready=false;private frame:HTMLIFrameElement;private width:number;private height:number;
 private current:{document:AuthorDocument;pageId:string}|null=null;private resize:ResizeObserver|null=null;
 private resolveReady!:()=>void;private rejectReady!:(error:Error)=>void;readonly loaded:Promise<void>;
 constructor(host:HTMLElement,private options:PreviewOptions){
  this.checkSize(options.width,options.height);this.width=options.width;this.height=options.height;
  this.loaded=new Promise((resolve,reject)=>{this.resolveReady=resolve;this.rejectReady=reject;});
  // Disposal during loading is an expected host lifecycle; callers may also await rejection.
  void this.loaded.catch(()=>{});
  this.frame=host.ownerDocument.createElement('iframe');this.frame.title='Редактируемый документ';
  this.frame.setAttribute('sandbox','allow-same-origin');this.frame.setAttribute('referrerpolicy','no-referrer');
  this.frame.style.cssText='display:block;border:0;flex:none;background:#0e0e0e';this.dimensions();
  this.frame.addEventListener('load',this.onLoad);this.frame.srcdoc=skeleton;host.append(this.frame);
 }
 private checkSize(width:number,height:number){breakpointFor(width);if(!Number.isFinite(height)||height<100||height>10000)throw Error('Preview height вне100–10000px');}
 private dimensions(){this.frame.style.width=this.width+'px';this.frame.style.height=this.height+'px';}
 private onLoad=async()=>{
  if(this.dead)return;const doc=this.frame.contentDocument;if(!doc){this.rejectReady(Error('Preview document unavailable'));return;}
  this.ready=true;doc.addEventListener('click',this.onClick);doc.addEventListener('keydown',this.onKeyDown);this.frame.contentWindow?.addEventListener('scroll',this.onScroll);
  this.resize=new ResizeObserver(()=>this.options.onGeometry?.());this.resize.observe(doc.body);
  if(this.current)this.paint();
  try{await Promise.all((this.options.fonts??[]).map(async font=>{const url=new URL(font.url,this.frame.ownerDocument.baseURI);if(url.origin!==this.frame.ownerDocument.location.origin)throw Error('Preview fonts must be same-origin bundled assets');const face=new FontFace('Inter',`url(${JSON.stringify(url.href)})`,{weight:String(font.weight),unicodeRange:font.unicodeRange});doc.fonts.add(face);await face.load();}));if(!this.dead){this.options.onGeometry?.();this.resolveReady();}}catch(error){if(!this.dead)this.rejectReady(error instanceof Error?error:Error('Font loading failed'));}
 };
 private onClick=(event:MouseEvent)=>{const target=event.target as Element|null,id=target?.closest('[data-author-node]')?.getAttribute('data-author-node');if(id)this.options.onSelect?.(id);};
 private onScroll=()=>this.options.onGeometry?.();
 private onKeyDown=(event:KeyboardEvent)=>this.options.onKeyDown?.(event);
 render(document:AuthorDocument,pageId:string){
  if(this.dead)throw Error('Preview disposed');validateDocument(document);if(!document.pages.some(page=>page.id===pageId))throw Error('Unknown preview page');
  this.current={document:structuredClone(document),pageId};if(this.ready)this.paint();
 }
 private paint(){
  const doc=this.frame.contentDocument,current=this.current;if(!doc||!current)return;
  const {document,pageId}=current,page=document.pages.find(page=>page.id===pageId)!,bp=breakpointFor(this.width),nodes=new Map<string,HTMLElement>();
  const scroll=this.frame.contentWindow?{x:this.frame.contentWindow.scrollX,y:this.frame.contentWindow.scrollY}:{x:0,y:0};
  for(const node of page.nodes){
   const element=doc.createElement(node.tag);element.dataset.authorNode=node.id;element.className=node.className;
   if(node.htmlId)element.id=node.htmlId;if(node.ariaLabel)element.setAttribute('aria-label',node.ariaLabel);
   // textContent never executes HTML. The domain disallows children on text/embed/divider nodes.
   element.textContent=node.text;
   for(const[key,value]of Object.entries(cssDeclarations(document,node,bp)))(element.style as unknown as Record<string,string>)[key]=String(value);
   nodes.set(node.id,element);
  }
  for(const node of page.nodes)if(node.parentId)nodes.get(node.parentId)!.append(nodes.get(node.id)!);
  doc.body.replaceChildren(nodes.get(page.nodes.find(node=>node.parentId===null)!.id)!);
  this.frame.contentWindow?.scrollTo(scroll.x,scroll.y);this.options.onGeometry?.();
 }
 setViewport(width:number,height:number){if(this.dead)throw Error('Preview disposed');this.checkSize(width,height);this.width=width;this.height=height;this.dimensions();if(this.ready)this.paint();}
 measure(id:string):NodeMeasurement|null{
  if(this.dead||!this.ready)return null;const doc=this.frame.contentDocument,win=this.frame.contentWindow;
  const element=Array.from(doc?.querySelectorAll<HTMLElement>('[data-author-node]')??[]).find(node=>node.dataset.authorNode===id);
  if(!element||!win)return null;const box=element.getBoundingClientRect(),css=win.getComputedStyle(element);
  return{id,x:box.x,y:box.y,width:box.width,height:box.height,fontSize:css.fontSize,lineHeight:css.lineHeight,display:css.display,color:css.color};
 }
 dispose(){if(this.dead)return;this.dead=true;this.resize?.disconnect();this.frame.contentDocument?.removeEventListener('click',this.onClick);this.frame.contentDocument?.removeEventListener('keydown',this.onKeyDown);this.frame.contentWindow?.removeEventListener('scroll',this.onScroll);this.frame.removeEventListener('load',this.onLoad);this.frame.remove();this.current=null;if(!this.ready)this.rejectReady(Error('Preview disposed before load'));}
}
