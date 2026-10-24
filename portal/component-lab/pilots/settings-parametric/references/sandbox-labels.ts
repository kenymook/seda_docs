import type {Bounds} from './sandbox-model';
export interface CaptionCandidate{id:string;frame:Bounds;width:number;height:number;priority:boolean}
export interface CaptionPlacement extends Bounds{id:string;side:'above'|'below'}
export function intersects(a:Bounds,b:Bounds){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
/** Screen-space overlays never alter the document or scale glyphs to fit a gutter. */
export function placeCaptions(candidates:CaptionCandidate[],obstacles:Bounds[],viewport:{width:number;height:number}):CaptionPlacement[]{
 if(!Number.isFinite(viewport.width)||!Number.isFinite(viewport.height)||viewport.width<=0||viewport.height<=0)return[];
 const placed:CaptionPlacement[]=[];
 for(const candidate of [...candidates].sort((a,b)=>Number(b.priority)-Number(a.priority))){
  const {frame}=candidate;
  if(!intersects(frame,{x:0,y:0,...viewport})||!Number.isFinite(candidate.width)||!Number.isFinite(candidate.height)||candidate.width<=0||candidate.height<=0)continue;
  const x=Math.max(0,frame.x),width=Math.min(candidate.width,frame.width,viewport.width-x);
  if(width<candidate.width||candidate.height>viewport.height)continue;
  let accepted:CaptionPlacement|undefined;
  for(const side of ['above','below'] as const){for(const gap of [4,2,0]){
   const box:CaptionPlacement={id:candidate.id,x,y:side==='above'?frame.y-gap-candidate.height:frame.y+frame.height+gap,width,height:candidate.height,side};
   if(box.y<0||box.y+box.height>viewport.height||obstacles.some(other=>intersects(box,other))||placed.some(other=>intersects(box,other)))continue;
   accepted=box;break;
  }if(accepted)break;}
  if(accepted)placed.push(accepted);
 }
 return placed;
}
