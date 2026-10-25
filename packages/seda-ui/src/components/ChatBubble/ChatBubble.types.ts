import type {HTMLAttributes, ReactNode} from 'react';
import type {SedaSize} from '../../types';
import type {AvatarIdentity} from '../Avatar';

export type ChatBubbleAction = {label:string} & (
  {href:string; onClick?:never} | {href?:never; onClick:()=>void}
);
export type ChatBubbleContent =
  | {contentType:'text'; content:string}
  | {contentType:'rich'; content:ReactNode}
  | {contentType:'code'; content:{code:string; languageLabel:string; copyLabel:string; onCopy:()=>void}}
  | {contentType:'file'; content:{name:string; description:string; action:ChatBubbleAction}}
  | {contentType:'image'; content:{src:string; alt:string; width:number; height:number; caption?:string; loadingLabel:string; errorLabel:string; retryLabel:string}}
  | {contentType:'audio'; content:{src:string; name:string; transcript:{text:string; label:string}|{unavailableLabel:string}; errorLabel:string; retryLabel:string}};
type MessageState =
  | {deliveryStatus:'error'; statusLabel:string; recovery:{label:string; onClick:()=>void; disabled?:boolean; loading?:boolean}; streaming?:false; announcementPolicy?:'off'|'status-only'}
  | {deliveryStatus?:'sending'|'sent'|'delivered'|'read'|'edited'; statusLabel?:string; recovery?:never; streaming?:false; announcementPolicy?:'off'|'status-only'}
  | {streaming:true; announcementPolicy:'off'|'status-only'; statusLabel:string; deliveryStatus?:never; recovery?:never};
interface ChatBubbleBase extends Omit<HTMLAttributes<HTMLElement>,'children'|'content'> {
  author:string;
  authorVisibility?:'visible'|'accessible';
  avatar?:Omit<AvatarIdentity,'name'|'alt'|'size'|'selected'|'disabled'|'loading'>;
  size?:SedaSize;
  as?:'article'|'li'|'div';
  /** Neutral outgoing and plain assistant views preserve direction without changing sender. */
  appearance?:'bubble'|'neutral'|'plain';
  groupPosition?:'single'|'first'|'middle'|'last';
  sourceLabel?:string;
  timestamp?:string;
  dateTime?:string;
  actions?:ReactNode;
  reactions?:ReactNode;
  attachments?:ReactNode;
}
export type ChatBubbleProps = ChatBubbleBase & ChatBubbleContent & MessageState & (
  {sender:'ai'; aiLabel:string} | {sender:'incoming'|'outgoing'|'system'; aiLabel?:never}
);
