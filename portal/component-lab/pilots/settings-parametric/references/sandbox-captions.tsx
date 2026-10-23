import{useEffect,useLayoutEffect,useRef,useState}from'react';
import{nodeBounds,ancestorIds}from'./sandbox-model';import type{ScenePage,Camera,Bounds}from'./sandbox-model';
import{placeCaptions}from'./sandbox-labels';
interface Caption{id:string;name:string;text:string;x:number;y:number;width:number;height:number;truncated:boolean}
/** Optional visual names; the complete accessible hierarchy remains in Tree. */
export function SceneCaptions({page,camera,selected}:{page:ScenePage;camera:Camera;selected:string[]}){
 const measure=useRef<SVGGElement>(null),[captions,setCaptions]=useState<Caption[]>([]),[revision,setRevision]=useState(0);
 const nodes=page.nodes.filter(node=>node.parentId===null&&node.visible),signature=JSON.stringify(selected);
 useEffect(()=>{const svg=measure.current?.ownerSVGElement;if(!svg)return;const changed=()=>setRevision(value=>value+1),observer=new ResizeObserver(changed);observer.observe(svg);document.fonts?.addEventListener('loadingdone',changed);return()=>{observer.disconnect();document.fonts?.removeEventListener('loadingdone',changed);};},[]);
 useLayoutEffect(()=>{
  const group=measure.current,svg=group?.ownerSVGElement;if(!group||!svg)return;
  const viewport={width:svg.clientWidth,height:svg.clientHeight},boxes=new Map<string,Bounds>();
  for(const node of nodes){const b=nodeBounds(page,node.id);boxes.set(node.id,{x:camera.x+b.x*camera.zoom,y:camera.y+b.y*camera.zoom,width:b.width*camera.zoom,height:b.height*camera.zoom});}
  const priority=new Set(selected.flatMap(id=>[id,...ancestorIds(page,id)])),context=document.createElement('canvas').getContext('2d');if(!context)return;
  const entries=new Map<string,{name:string;text:string;box:DOMRect;frame:Bounds;truncated:boolean}>();
  const segmenter=new Intl.Segmenter(undefined,{granularity:'grapheme'});
  for(const textElement of Array.from(group.querySelectorAll('text'))){
   const id=textElement.dataset.captionMeasure!,frame=boxes.get(id)!;
   if(frame.x>=viewport.width||frame.y>=viewport.height||frame.x+frame.width<=0||frame.y+frame.height<=0)continue;
   const name=textElement.textContent??'',style=getComputedStyle(textElement);context.font=style.font;
   const bounds=(text:string)=>{const ink=context.measureText(text);return new DOMRect(-ink.actualBoundingBoxLeft,-ink.actualBoundingBoxAscent,ink.actualBoundingBoxLeft+ink.actualBoundingBoxRight,ink.actualBoundingBoxAscent+ink.actualBoundingBoxDescent);};
   const maxWidth=Math.min(frame.width,viewport.width-Math.max(0,frame.x));let text=name;
   if(bounds(text).width>maxWidth){
    const segments=Array.from(segmenter.segment(name),part=>part.segment);let left=0,right=segments.length;
    while(left<right){const middle=Math.ceil((left+right)/2);if(bounds(segments.slice(0,middle).join('')+'…').width<=maxWidth)left=middle;else right=middle-1;}
    if(left===0)continue;text=segments.slice(0,left).join('')+'…';
   }
   const box=bounds(text);
   if(box.width<=0||box.width>maxWidth+.01)continue;
   entries.set(id,{name,text,box,frame,truncated:text!==name});
  }
  const placements=placeCaptions(Array.from(entries,([id,value])=>({id,frame:value.frame,width:value.box.width,height:value.box.height,priority:priority.has(id)})),Array.from(boxes.values()),viewport);
  setCaptions(placements.map(p=>{const entry=entries.get(p.id)!;return{id:p.id,name:entry.name,text:entry.text,x:p.x-entry.box.x,y:p.y-entry.box.y,width:p.width,height:p.height,truncated:entry.truncated};}));
 },[page,camera,signature,revision]);
 return <><g ref={measure} visibility="hidden" aria-hidden="true" pointerEvents="none">{nodes.map(node=><text key={node.id} x={0} y={0} data-caption-measure={node.id} className="sandbox-artboard-name">{node.name}</text>)}</g><g aria-hidden="true" pointerEvents="none" data-scene-captions={captions.length}>{captions.map(c=><text key={c.id} x={c.x} y={c.y} data-artboard-caption={c.id} data-truncated={c.truncated||undefined} className="sandbox-artboard-name"><title>{c.name}</title>{c.text}</text>)}</g></>;
}
