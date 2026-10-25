import type {HTMLAttributes,MouseEventHandler,ReactNode} from 'react';
import type {SedaSize} from '../../types';

interface SidebarItemBase {id:string;label:string;icon?:ReactNode;annotation?:ReactNode;disabled?:boolean;description?:string;}
export type SidebarItem = SidebarItemBase & (
  {kind:'link';href:string;target?:'_self'|'_blank';onClick?:MouseEventHandler<HTMLAnchorElement>} |
  {kind:'action';onClick:MouseEventHandler<HTMLButtonElement>;href?:never;target?:never}
);
interface SidebarSectionBase {id:string;label?:string;icon?:ReactNode;items:readonly SidebarItem[];emptyText?:string;}
export type SidebarSection=SidebarSectionBase & (
  {collapsible:true;label:string;expanded:boolean;onExpandedChange:(expanded:boolean)=>void;expandLabel:string;collapseLabel:string} |
  {collapsible?:false;expanded?:never;onExpandedChange?:never;expandLabel?:never;collapseLabel?:never}
);
interface SidebarBase extends Omit<HTMLAttributes<HTMLElement>,'children'> {
  label:string;
  sections:readonly SidebarSection[];
  /** Current destination; actions never impersonate a route. */
  selectedKey?:string;
  full?:boolean;
  size?:SedaSize;
  header?:ReactNode;
  footer?:ReactNode;
}
/** Width, collapse control, routes and persistence remain owned by the host application. */
export type SidebarProps=SidebarBase & (
  {loading:true;loadingLabel:string} | {loading?:false;loadingLabel?:never}
);
