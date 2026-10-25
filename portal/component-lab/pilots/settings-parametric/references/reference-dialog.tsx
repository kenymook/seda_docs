import React from 'react';
import {Modal} from '@seda-ai/ui';
import './reference-dialog.css';
import './workspace-rhythm.css';
/** Reference composition uses the public Modal; surface geometry remains experimental. */
export function WorkspaceDialog({title,children,onDismiss,initialFocusRef}:{title:string;children:React.ReactNode;onDismiss:()=>void;initialFocusRef?:React.RefObject<HTMLElement|null>}){
 return <Modal {...(initialFocusRef?{initialFocusRef}:{})} open size="l" title={title} className="reference-dialog" onOpenChange={next=>{if(!next)onDismiss();}}><div className="reference-dialog-content">{children}</div></Modal>;
}
