/** Local operation history, never a simulated remote notification service. */
export interface WorkspaceNotification{id:string;title:string;message:string;source:string;createdAt:string;unread:boolean}
export const notificationsKey='seda.reference.recents.notifications.v1';
export function readNotifications(raw:string|null):WorkspaceNotification[]{
 if(raw===null)return [];
 const value=JSON.parse(raw);if(value?.version!==1||!Array.isArray(value.items)||value.items.length>200)throw Error('Неподдерживаемый формат истории уведомлений');
 const ids=new Set<string>();for(const item of value.items){if(!item||!['id','title','message','source','createdAt'].every(k=>typeof item[k]==='string'&&!!item[k].trim()&&item[k].length<=1000)||ids.has(item.id)||!Number.isFinite(Date.parse(item.createdAt))||typeof item.unread!=='boolean')throw Error('История уведомлений повреждена. Файлы не затронуты.');ids.add(item.id);}
 return value.items;
}
export function appendNotification(items:readonly WorkspaceNotification[],message:string,id:string,createdAt:string):WorkspaceNotification[]{
 const next=[{id,title:'Операция с файлами',message,source:'Этот браузер',createdAt,unread:true},...items].slice(0,200);
 return readNotifications(JSON.stringify({version:1,items:next}));
}
