import React from 'react';
import {Modal} from '@seda-ai/ui';
import './reference-dialog.css';
/** Reference composition uses the public Modal; surface geometry remains experimental. */
export function WorkspaceDialog({title,children,onDismiss}:{title:string;children:React.ReactNode;onDismiss:()=>void}){
 return <Modal open size="l" title={title} className="reference-dialog" onOpenChange={next=>{if(!next)onDismiss();}}><div className="reference-dialog-content">{children}</div></Modal>;
}
