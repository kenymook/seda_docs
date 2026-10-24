import React,{useEffect,useId,useRef} from 'react';
import {IconButton} from '@seda-ai/ui';
import './reference-dialog.css';
/** Shared native composition used by the reference apps; no certified Dialog contract is claimed. */
export function WorkspaceDialog({title,children,onDismiss}:{title:string;children:React.ReactNode;onDismiss:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),id=useId();
 useEffect(()=>{ref.current?.showModal();return()=>{ref.current?.close();};},[]);
 return <dialog ref={ref} className="reference-dialog" aria-labelledby={id} onCancel={event=>{event.preventDefault();onDismiss();}}>
  <header><h2 id={id}>{title}</h2><IconButton aria-label="Закрыть диалог" variant="ghost" icon={<img src="./assets/recentsTools-imgIcon.svg" alt="" width="16" height="16"/>} onClick={onDismiss}/></header>{children}
 </dialog>;
}
