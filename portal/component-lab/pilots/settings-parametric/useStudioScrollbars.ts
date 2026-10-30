import {useEffect} from 'react';

// Shared by the Studio shell and Lab. Native scrolling, keyboard and dragging
// remain browser-owned; only the transient visibility of the thumb is managed.
const regions='.studio-rail,.studio-library-items,.studio-canvas-scroll,.studio-inspector,.studio-property-list,.studio-color-options,.studio-semantic-table,.lab-navigation,.lab-right-sidebar,.lab-studio .canvas';
export function useStudioScrollbars(){
 useEffect(()=>{
  const timers=new Map<Element,ReturnType<typeof setTimeout>>();
  const scrolling=(event:Event)=>{
   const target=event.target;
   if(!(target instanceof Element)||!target.matches(regions))return;
   const previous=timers.get(target);if(previous)clearTimeout(previous);
   target.setAttribute('data-studio-scrolling','');
   timers.set(target,setTimeout(()=>{target.removeAttribute('data-studio-scrolling');timers.delete(target);},900));
  };
  document.addEventListener('scroll',scrolling,{capture:true,passive:true});
  return()=>{document.removeEventListener('scroll',scrolling,true);for(const [target,timer]of timers){clearTimeout(timer);target.removeAttribute('data-studio-scrolling');}};
 },[]);
}
