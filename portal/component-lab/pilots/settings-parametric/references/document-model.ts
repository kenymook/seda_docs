import seed from './building-data.json';
import {joinMarks,normalizeMarks,splitMarks} from './document-marks';
import type {TextMark} from './document-marks';
export type BlockKind='paragraph'|'heading'|'callout'|'number'|'letter'|'bullet'|'todo'|'code';
export interface DocBlock{id:string;kind:BlockKind;text:string;marks?:TextMark[];checked?:boolean;children?:DocBlock[]}
export interface DocPage{id:string;title:string;parentId:string|null;icon:string|null;blocks:DocBlock[];trashed:boolean;favorite:boolean;cover:'none'|'brand';comments:{id:string;text:string}[]}
export interface DocModel{pages:DocPage[]}
export const documentKey='seda.reference.building.document.v1';
export const documentKinds:BlockKind[]=['paragraph','heading','callout','number','letter','bullet','todo','code'];
export const initialDocument:DocModel={pages:seed.pages as DocPage[]};
const icons=new Set(initialDocument.pages.map(page=>page.icon));
export function allBlocks(blocks:readonly DocBlock[]):DocBlock[]{return blocks.flatMap(block=>[block,...allBlocks(block.children??[])]);}
export function readDocument(raw:string|null):DocModel{
 if(raw===null)return structuredClone(initialDocument);
 if(raw.length>8_000_000)throw Error('Документ превышает лимит этого reference app');
 const value=JSON.parse(raw);if(value?.version!==1||!Array.isArray(value.pages)||value.pages.length>300)throw Error('Неподдерживаемый формат документа');
 const ids=new Set<string>();let blocksCount=0;
 function unique(id:unknown){if(typeof id!=='string'||!id.trim()||id.length>160||ids.has(id))throw Error('Некорректные или повторные идентификаторы');ids.add(id);}
 function blocks(items:unknown,depth=0){if(!Array.isArray(items)||depth>32)throw Error('Некорректная вложенность блоков');for(const block of items){unique(block?.id);if(!documentKinds.includes(block.kind)||typeof block.text!=='string'||block.text.length>20_000||(block.checked!==undefined&&typeof block.checked!=='boolean'))throw Error('Повреждён текст или тип блока');if(block.marks!==undefined){if(!Array.isArray(block.marks)||block.marks.length>2000||block.kind==='code')throw Error('Повреждено форматирование текста');const normalized=normalizeMarks(block.marks,block.text.length);if(JSON.stringify(normalized)!==JSON.stringify(block.marks))throw Error('Форматирование текста не нормализовано');}if(++blocksCount>10_000)throw Error('Слишком много блоков');if(block.children!==undefined)blocks(block.children,depth+1);}}
 for(const page of value.pages){unique(page?.id);if(typeof page.title!=='string'||page.title.length>160||!(page.parentId===null||typeof page.parentId==='string')||!(page.icon===null||icons.has(page.icon))||typeof page.trashed!=='boolean'||typeof page.favorite!=='boolean'||!['none','brand'].includes(page.cover)||!Array.isArray(page.comments))throw Error('Повреждены свойства страницы');blocks(page.blocks);for(const comment of page.comments){unique(comment?.id);if(typeof comment.text!=='string'||!comment.text.trim()||comment.text.length>2000)throw Error('Повреждены комментарии');}}
 const pages=new Map<string,DocPage>(value.pages.map((page:DocPage)=>[page.id,page]));
 for(const page of value.pages){let current:DocPage|undefined=page;const chain=new Set<string>();while(current){if(chain.has(current.id)||chain.size>32)throw Error('Цикл или слишком глубокое дерево страниц');chain.add(current.id);if(current.parentId!==null&&!pages.has(current.parentId))throw Error('Не найден родитель страницы');if(!current.trashed&&current.parentId!==null&&pages.get(current.parentId)!.trashed)throw Error('Активная страница скрыта в удалённом родителе');current=current.parentId===null?undefined:pages.get(current.parentId);}}
 return {pages:value.pages};
}
export function displayTitle(page:DocPage){return page.title.trim()||'Без названия';}
export function makeBlock(kind:BlockKind='paragraph',text=''):DocBlock{return{id:crypto.randomUUID(),kind,text,...(kind==='todo'?{checked:false}:{})};}
export function changeBlock(blocks:DocBlock[],id:string,change:(block:DocBlock)=>DocBlock):DocBlock[]{return blocks.map(block=>block.id===id?change(block):block.children?{...block,children:changeBlock(block.children,id,change)}:block);}
export function locateBlock(blocks:DocBlock[],id:string,parent:string|null=null):{block:DocBlock;index:number;siblings:DocBlock[];parent:string|null}|undefined{
 for(let i=0;i<blocks.length;i++){const block=blocks[i];if(block.id===id)return{block,index:i,siblings:blocks,parent};const found=locateBlock(block.children??[],id,block.id);if(found)return found;}
}
function listAt(blocks:DocBlock[],parent:string|null,change:(list:DocBlock[])=>DocBlock[]){return parent===null?change(blocks):changeBlock(blocks,parent,block=>({...block,children:change(block.children??[])}));}
export function moveBlock(blocks:DocBlock[],id:string,delta:number){const found=locateBlock(blocks,id);if(!found||found.index+delta<0||found.index+delta>=found.siblings.length)return blocks;return listAt(blocks,found.parent,list=>{const next=[...list];next.splice(found.index,1);next.splice(found.index+delta,0,found.block);return next;});}
export function insertAfter(blocks:DocBlock[],id:string,next:DocBlock){const found=locateBlock(blocks,id);if(!found)return blocks;return listAt(blocks,found.parent,list=>[...list.slice(0,found.index+1),next,...list.slice(found.index+1)]);}
export function removeBlock(blocks:DocBlock[],id:string){const found=locateBlock(blocks,id);return found?listAt(blocks,found.parent,list=>list.filter(block=>block.id!==id)):blocks;}
export function indentBlock(blocks:DocBlock[],id:string){const found=locateBlock(blocks,id);if(!found||found.index===0)return blocks;const previous=found.siblings[found.index-1];return changeBlock(removeBlock(blocks,id),previous.id,block=>({...block,children:[...(block.children??[]),found.block]}));}
export function outdentBlock(blocks:DocBlock[],id:string){const found=locateBlock(blocks,id);if(!found?.parent)return blocks;return insertAfter(removeBlock(blocks,id),found.parent,found.block);}
export function cloneBlock(block:DocBlock):DocBlock{return{...block,id:crypto.randomUUID(),...(block.children?{children:block.children.map(cloneBlock)}:{})};}
export function splitBlock(blocks:DocBlock[],id:string,start:number,end=start){const found=locateBlock(blocks,id);if(!found)return{blocks,id};const text=found.block.text;start=Math.max(0,Math.min(start,text.length));end=Math.max(start,Math.min(end,text.length));const kind=['number','letter','bullet','todo'].includes(found.block.kind)?found.block.kind:'paragraph';const [left,right]=splitMarks(found.block.marks??[],text.length,start,end);const next={...makeBlock(kind,text.slice(end)),...(right.length?{marks:right}:{})};return{blocks:insertAfter(changeBlock(blocks,id,block=>({...block,text:text.slice(0,start),marks:left.length?left:undefined})),id,next),id:next.id};}
export function joinPrevious(blocks:DocBlock[],id:string){const found=locateBlock(blocks,id);if(!found)return{blocks,id,offset:0};if(!found.index)return{blocks:outdentBlock(blocks,id),id,offset:0};const previous=found.siblings[found.index-1],offset=previous.text.length;if(offset+found.block.text.length>20_000)throw Error('Объединённый блок слишком длинный');const marks=previous.kind==='code'?[]:joinMarks(previous.marks??[],previous.text.length,found.block.marks??[],found.block.text.length);const next=changeBlock(removeBlock(blocks,id),previous.id,block=>({...block,text:block.text+found.block.text,marks:marks.length?marks:undefined,children:[...(block.children??[]),...(found.block.children??[])]}));return{blocks:next,id:previous.id,offset};}
export function pageDescendants(model:DocModel,id:string){const ids=new Set([id]);let changed=true;while(changed){changed=false;for(const page of model.pages)if(page.parentId&&ids.has(page.parentId)&&!ids.has(page.id)){ids.add(page.id);changed=true;}}return ids;}
export function pageAncestors(model:DocModel,id:string){const ids:string[]=[];let page=model.pages.find(page=>page.id===id);while(page?.parentId){ids.unshift(page.parentId);page=model.pages.find(item=>item.id===page!.parentId);}return ids;}
