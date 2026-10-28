import {Button,SedaProvider} from '@seda-ai/ui';
import React,{createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {profiles as defaults,tokens,provenance,libraryBindings,buttonContract} from 'seda:catalog';
import {bindSavedDesign} from './saved-design-model.mjs';
import './shared-design.css';
type Document={sourceTokensSha256:string;revision:number;edits:Record<string,string>;updatedAt:string|null};
const key='seda-design-consumer-confirmed-v1';
const Context=createContext(defaults);
const build=(edits:Record<string,string>)=>bindSavedDesign(tokens,edits,defaults,libraryBindings,buttonContract);
function readCache(){try{const doc=JSON.parse(localStorage.getItem(key)||'null');if(doc?.sourceTokensSha256===provenance.tokensSha256&&Number.isSafeInteger(doc.revision)&&doc.edits){build(doc.edits);return doc as Document;}}catch{}return null;}
export const useSavedProfiles=()=>useContext(Context);
export function SharedDesignProvider({children}:{children:React.ReactNode}){
 const [document,setDocument]=useState<Document|null>(readCache),[loaded,setLoaded]=useState(()=>!!readCache()),[problem,setProblem]=useState(''),[attempt,setAttempt]=useState(0);
 const confirmed=useRef(document);
 const design=useMemo(()=>{try{return document?build(document.edits):{profiles:defaults,css:''};}catch{return{profiles:defaults,css:''};}},[document]);
 useEffect(()=>{let stopped=false,controller:AbortController|null=null;let request=0;
  async function refresh(){const own=++request;controller?.abort();controller=new AbortController();const activeController=controller;const timeout=setTimeout(()=>activeController.abort(),15000);
   try{const response=await fetch('/api/token-document',{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error();const doc:Document=await response.json();if(stopped||own!==request)return;
    if(doc.sourceTokensSha256!==provenance.tokensSha256){setProblem('Сохранённые настройки относятся к другой базе токенов. Сохраняем последнее совместимое оформление.');return;}
    if(!Number.isSafeInteger(doc.revision)||doc.revision<0||!doc.edits||typeof doc.edits!=='object')throw Error();build(doc.edits);
    if(confirmed.current&&doc.revision<confirmed.current.revision)return;
    if(!confirmed.current||doc.revision!==confirmed.current.revision){confirmed.current=doc;setDocument(doc);try{localStorage.setItem(key,JSON.stringify(doc));}catch{}}
    setProblem('');
   }catch{if(!stopped&&own===request)setProblem(confirmed.current?'Нет связи с настройками. Используется последняя сохранённая конфигурация.':'Не удалось загрузить настройки. Используется базовое оформление.');}
   finally{clearTimeout(timeout);if(!stopped&&own===request)setLoaded(true);}
  }
  refresh();const timer=setInterval(refresh,15000);const onFocus=()=>refresh();const onVisibility=()=>{if(documentGlobal.visibilityState==='visible')refresh();};const documentGlobal=window.document;
  window.addEventListener('focus',onFocus);window.addEventListener('seda-design-saved',onFocus);documentGlobal.addEventListener('visibilitychange',onVisibility);
  const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('seda-design'):null;if(channel)channel.onmessage=onFocus;
  const onStorage=(event:StorageEvent)=>{if(event.key===key||event.key==='seda-token-workbench-confirmed-v2')refresh();};window.addEventListener('storage',onStorage);
  return()=>{stopped=true;request++;clearInterval(timer);controller?.abort();channel?.close();window.removeEventListener('focus',onFocus);window.removeEventListener('seda-design-saved',onFocus);window.removeEventListener('storage',onStorage);documentGlobal.removeEventListener('visibilitychange',onVisibility);};
 },[attempt]);
 return <Context.Provider value={design.profiles}><style data-seda-saved-design data-revision={document?.revision??'base'}>{design.css}</style>{loaded?children:<div className="shared-design-loading" role="status">Загружаем настройки SEDA…</div>}{problem&&<div className="shared-design-problem" role="status"><span>{problem}</span><Button variant="secondary" onClick={()=>setAttempt(v=>v+1)}>Повторить</Button></div>}</Context.Provider>;
}
