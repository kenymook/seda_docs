import {forwardRef,useId,useRef,useState,useImperativeHandle} from "react";
import type {KeyboardEvent,PointerEvent} from "react";
import {useBrowserLayoutEffect} from "../../utils/useBrowserLayoutEffect";
import {cx} from "../../utils/classNames";
import {SedaProvider} from "../../foundation/SedaProvider";
import {clampSplit,splitBounds} from "./splitModel";
import type {SplitViewProps,SplitViewResizeReason} from "./SplitView.types";

/** Two persistent panes; product state and persistence belong to the host. */
export const SplitView=forwardRef<HTMLDivElement,SplitViewProps>(
 ({primary,secondary,primaryLabel,secondaryLabel,separatorLabel,orientation="horizontal",
   primarySize,defaultPrimarySize,minSize=160,maxSize,secondaryMinSize=160,resizeStep=8,largeResizeStep=32,
   disabled=false,onSizeChange,onResizeEnd,className,id,...props},ref)=>{
  const generated=useId(),rootId=id??generated;
  const root=useRef<HTMLDivElement|null>(null),separator=useRef<HTMLDivElement|null>(null);
  useImperativeHandle(ref,()=>root.current!,[]);
  const [local,setLocal]=useState(defaultPrimarySize??240);
  const [measurement,setMeasurement]=useState<{extent:number;divider:number}|null>(null);
  const [dragging,setDragging]=useState(false);
  const expandedSize=useRef(defaultPrimarySize??240);
  const gesture=useRef<{pointerId:number;start:number;size:number;requested:number;changed:boolean;scale:number;sign:number}|null>(null);
  const mounted=useRef(false),generation=useRef(0);
  const requested=primarySize??local;
  const bounds=splitBounds(measurement?.extent??null,measurement?.divider??8,requested,minSize,maxSize,secondaryMinSize);
  const effective=clampSplit(requested,bounds.min,bounds.max);
  useBrowserLayoutEffect(()=>{
   const element=root.current;
   if(!element)return;
   const hiddenPane=effective===0?element.children[0]:bounds.total-effective===0?element.children[2]:null;
   if(hiddenPane?.contains(element.ownerDocument.activeElement))separator.current?.focus();
  },[effective,bounds.total]);
  const latest=useRef({primarySize,requested,effective,bounds,onSizeChange,onResizeEnd,disabled,orientation});
  useBrowserLayoutEffect(()=>{latest.current={primarySize,requested,effective,bounds,onSizeChange,onResizeEnd,disabled,orientation};});
  useBrowserLayoutEffect(()=>{mounted.current=true;generation.current++;return()=>{mounted.current=false;generation.current++;};},[]);
  function stopCapture(){
   const active=gesture.current;gesture.current=null;
   if(active&&separator.current?.hasPointerCapture(active.pointerId))separator.current.releasePointerCapture(active.pointerId);
   if(mounted.current)setDragging(false);
  }
  useBrowserLayoutEffect(()=>{
   stopCapture();
   const element=root.current,divider=separator.current;if(!element||!divider)return;
   const view=element.ownerDocument.defaultView!;
   const measure=()=>{
    const style=view.getComputedStyle(element),horizontal=orientation==="horizontal";
    const extent=horizontal?element.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight):element.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const dividerStyle=view.getComputedStyle(divider);
    const dividerSize=parseFloat(horizontal?dividerStyle.width:dividerStyle.height);
    setMeasurement(old=>old?.extent===extent&&old.divider===dividerSize?old:{extent:Math.max(0,extent),divider:dividerSize});
   };
   measure();const observer=new view.ResizeObserver(measure);observer.observe(element);observer.observe(divider);
   return()=>{observer.disconnect();stopCapture();};
  },[orientation]);
  useBrowserLayoutEffect(()=>{if(disabled)stopCapture();},[disabled]);
  useBrowserLayoutEffect(()=>{
   if(!dragging)return;const view=root.current?.ownerDocument.defaultView;if(!view)return;
   const cancel=()=>cancelGesture();
   view.addEventListener("blur",cancel);return()=>view.removeEventListener("blur",cancel);
  },[dragging]);
  function request(value:number,reason:SplitViewResizeReason){
   const current=latest.current;if(current.disabled)return false;
   const next=clampSplit(value,current.bounds.min,current.bounds.max);
   if(next===current.effective)return false;
   if(current.primarySize===undefined)setLocal(next);
   current.onSizeChange?.(next,reason);
   return true;
  }
  function end(reason:SplitViewResizeReason){
   const epoch=generation.current;
   queueMicrotask(()=>{if(mounted.current&&generation.current===epoch)latest.current.onResizeEnd?.(latest.current.effective,reason);});
  }
  function cancelGesture(){
   const active=gesture.current;if(!active)return;
   stopCapture();
   const current=latest.current;
   if(active.changed&&!current.disabled){if(current.primarySize===undefined)setLocal(active.requested);current.onSizeChange?.(active.requested,"cancel");}
   end("cancel");
  }
  function pointerDown(event:PointerEvent<HTMLDivElement>){
   if(event.defaultPrevented||disabled||event.button!==0||!event.isPrimary||gesture.current)return;
   event.preventDefault();event.currentTarget.focus();
   const element=root.current!,view=element.ownerDocument.defaultView!,style=view.getComputedStyle(element);
   const horizontal=orientation==="horizontal",rect=element.getBoundingClientRect();
   const scale=horizontal?element.offsetWidth/rect.width:element.offsetHeight/rect.height;
   gesture.current={pointerId:event.pointerId,start:horizontal?event.clientX:event.clientY,size:effective,requested,changed:false,scale:Number.isFinite(scale)?scale:1,sign:horizontal&&style.direction==="rtl"?-1:1};
   event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);
  }
  function pointerMove(event:PointerEvent<HTMLDivElement>){
   const active=gesture.current;if(!active||event.pointerId!==active.pointerId)return;
   if(request(active.size+((orientation==="horizontal"?event.clientX:event.clientY)-active.start)*active.scale*active.sign,"pointer"))active.changed=true;
  }
  function keyDown(event:KeyboardEvent<HTMLDivElement>){
   if(event.defaultPrevented||event.nativeEvent.isComposing)return;
   if(event.key==="Escape"&&gesture.current){event.preventDefault();cancelGesture();return;}
   if(disabled||event.altKey||event.ctrlKey||event.metaKey)return;
   const horizontal=orientation==="horizontal",rtl=root.current?.ownerDocument.defaultView?.getComputedStyle(root.current).direction==="rtl";
   const step=event.shiftKey?largeResizeStep:resizeStep;
   let next:number|undefined;
   if(event.key==="Enter"){
    if(effective>bounds.min){expandedSize.current=effective;next=bounds.min;}
    else next=expandedSize.current;
   }
   else if(event.key==="Home")next=bounds.min;else if(event.key==="End")next=bounds.max;
   else if(horizontal&&event.key==="ArrowRight")next=effective+(rtl?-step:step);
   else if(horizontal&&event.key==="ArrowLeft")next=effective+(rtl?step:-step);
   else if(!horizontal&&event.key==="ArrowDown")next=effective+step;
   else if(!horizontal&&event.key==="ArrowUp")next=effective-step;
   if(next===undefined)return;
   event.preventDefault();request(next,"keyboard");end("keyboard");
  }
  for(const [name,value] of Object.entries({primarySize,defaultPrimarySize,minSize,maxSize,secondaryMinSize,resizeStep,largeResizeStep})){
   if(value!==undefined&&(!Number.isFinite(value)||value<0||["resizeStep","largeResizeStep"].includes(name)&&value===0))throw new TypeError("SplitView "+name+" must be finite and nonnegative; steps must be positive");
  }
  if(maxSize!==undefined&&maxSize<minSize)throw new TypeError("SplitView maxSize must not be smaller than minSize");
  if(primarySize!==undefined&&(defaultPrimarySize!==undefined||!onSizeChange))throw new TypeError("Controlled SplitView requires onSizeChange and excludes defaultPrimarySize");
  if(!["horizontal","vertical"].includes(orientation)||![primaryLabel,secondaryLabel].every(value=>typeof value==="string"&&value.trim())||separatorLabel!==undefined&&!separatorLabel.trim())throw new TypeError("SplitView needs valid orientation and nonempty panel labels");
  const percent=(value:number)=>bounds.total>0?Math.round(value/bounds.total*1000)/10:0;
  const template=effective+"px "+(measurement?.divider??8)+"px minmax("+secondaryMinSize+"px,1fr)";
  return <SedaProvider {...props} id={rootId} ref={root}
    className={cx("seda-split-view",className)} data-orientation={orientation} data-resizing={dragging||undefined} data-overconstrained={bounds.overconstrained||undefined}
    style={{...props.style,...(orientation==="horizontal"?{gridTemplateColumns:template}:{gridTemplateRows:template})}}>
   <div id={rootId+"-primary"} role="region" aria-label={primaryLabel} aria-hidden={effective===0||undefined} style={{visibility:effective===0?"hidden":undefined}} className="seda-split-view__panel">{primary}</div>
   <div ref={separator} role="separator" tabIndex={disabled?-1:0} aria-label={separatorLabel??primaryLabel}
    aria-orientation={orientation==="horizontal"?"vertical":"horizontal"} aria-controls={rootId+"-primary"} aria-valuemin={percent(bounds.min)} aria-valuemax={percent(bounds.max)} aria-valuenow={percent(effective)} aria-valuetext={Math.round(effective)+" px"} aria-disabled={disabled||undefined}
    className="seda-split-view__separator" onPointerDown={pointerDown} onPointerMove={pointerMove}
    onPointerUp={event=>{if(gesture.current?.pointerId===event.pointerId){stopCapture();end("pointer");}}}
    onPointerCancel={cancelGesture} onLostPointerCapture={()=>{if(gesture.current)cancelGesture();}} onKeyDown={keyDown}/>
   <div id={rootId+"-secondary"} role="region" aria-label={secondaryLabel} aria-hidden={bounds.total-effective===0||undefined} style={{visibility:bounds.total-effective===0?"hidden":undefined}} className="seda-split-view__panel">{secondary}</div>
  </SedaProvider>;
 }
);
SplitView.displayName="SplitView";
