import React,{useLayoutEffect,useRef,useState} from 'react';
import {SplitView} from '@seda-ai/ui';
import type {SplitViewProps} from '@seda-ai/ui';

type EditorDockProps=Pick<SplitViewProps,'primary'|'secondary'|'primaryLabel'|'secondaryLabel'|'separatorLabel'|'primarySize'|'onSizeChange'|'onResizeEnd'|'disabled'> & {
 canvasMinimum:number;
 inspectorMinimum:number;
 /** Vertical bounds describe usable workspace regions, never control anatomy. */
 canvasMinHeight?:number;
 viewportSelector?:string;
 viewportMinHeight?:number;
 inspectorMinHeight?:number;
};

/** Application composition over the installed SplitView. Both regions stay mounted.
 * Width requests belong to the host; bottom-dock height is a separate view preference.
 * Reflow never commits a document or persists a clamped horizontal width. */
export function EditorDock({canvasMinimum,inspectorMinimum,canvasMinHeight=320,inspectorMinHeight=240,viewportSelector,viewportMinHeight=240,...props}:EditorDockProps){
 const host=useRef<HTMLDivElement>(null),[extent,setExtent]=useState({width:0,height:0,chrome:0}),[height,setHeight]=useState<number|null>(null);
 useLayoutEffect(()=>{
  const node=host.current!;
  const viewport=viewportSelector?node.querySelector<HTMLElement>(viewportSelector):null;
  const measure=()=>{const width=node.clientWidth,height=node.clientHeight;
   // scrollHeight includes toolbar/status overflow during the initial reflow;
   // subtracting only the current region height would underestimate that chrome.
   const chrome=viewport?Math.ceil(Math.max(0,viewport.parentElement!.scrollHeight-viewport.getBoundingClientRect().height)):0;
   setExtent(old=>old.width===width&&old.height===height&&old.chrome===chrome?old:{width,height,chrome});};
  measure();const observer=new ResizeObserver(measure);observer.observe(node);if(viewport){observer.observe(viewport);observer.observe(viewport.parentElement!);}return()=>observer.disconnect();
 },[viewportSelector]);
 // Use the same exact readable bounds as SplitView, including its 8px separator.
 const minimumHeight=Math.max(canvasMinHeight,extent.chrome+viewportMinHeight);
 const bottom=extent.width>0&&extent.width<canvasMinimum+inspectorMinimum+8;
 return <div ref={host} className="editor-dock" data-editor-dock={bottom?'bottom':'side'}>
  <SplitView {...props} orientation={bottom?'vertical':'horizontal'}
   separatorLabel={bottom?'Высота холста':props.separatorLabel}
   primarySize={bottom?(height??Math.max(minimumHeight,Math.round(extent.height*.55))):props.primarySize}
   minSize={bottom?minimumHeight:canvasMinimum}
   secondaryMinSize={bottom?inspectorMinHeight:inspectorMinimum}
   onSizeChange={bottom?value=>setHeight(value):props.onSizeChange}
   onResizeEnd={bottom?undefined:props.onResizeEnd}/>
 </div>;
}

/** Keep a useful canvas beside a readable inspector as chrome text/padding grows.
 * Eighteen text ems are a composition capacity, not a new SEDA size token. */
export function editorCanvasMinimum(geometry:{font:number;fieldPaddingX:number}){
 return Math.ceil(Math.max(384,geometry.font*18+geometry.fieldPaddingX*2+32));
}
