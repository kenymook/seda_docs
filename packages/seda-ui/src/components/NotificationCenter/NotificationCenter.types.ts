import type {HTMLAttributes,ReactNode} from 'react';
import type {SedaSize} from '../../types';

export type NotificationFilter='all'|'mentions'|'unread';
export interface NotificationItem {
  id:string;
  title:string;
  message:string;
  source:string;
  timestamp:{dateTime:string;label:string};
  unread:boolean;
  mention?:boolean;
  icon?:ReactNode;
}
export interface NotificationLabels {
  all:string;mentions:string;unread:string;markAllRead:string;markRead:string;
  empty:string;noResults:string;loading:string;retry:string;settings:string;
  unreadCount:(count:number)=>string;
}
type FilterOwnership={activeFilter:NotificationFilter;onActiveFilterChange:(filter:NotificationFilter)=>void;defaultFilter?:never}|{activeFilter?:never;defaultFilter?:NotificationFilter;onActiveFilterChange?:(filter:NotificationFilter)=>void};
type DataState={state?:'ready'|'loading';errorText?:never;onRetry?:never;unrecoverableReason?:never}|({state:'error';errorText:string}&({onRetry:()=>void;unrecoverableReason?:never}|{onRetry?:never;unrecoverableReason:string}));
/** Panel content only. The owner supplies the non-modal overlay host for placement=overlay. */
export type NotificationCenterProps=Omit<HTMLAttributes<HTMLDivElement>,'children'|'title'|'onChange'|'defaultValue'> & FilterOwnership & DataState & {
  title:string;
  items:readonly NotificationItem[];
  labels:NotificationLabels;
  placement?:'panel'|'overlay';
  size?:SedaSize;
  onMarkRead:(id:string)=>void;
  onMarkAllRead:(ids:readonly string[])=>void;
  onSettings?:()=>void;
  busy?:boolean;
  actionStatus?:string;
};
