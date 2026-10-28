import {useEffect,useRef,useState} from 'react';
type Edits=Record<string,string>;
type Document={sourceTokensSha256:string;revision:number;edits:Edits;updatedAt:string|null};
const same=(a:Edits,b:Edits)=>JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort());
const key='seda-token-workbench-confirmed-v2';
export function useTokenStore(hash:string,edits:Edits,setEdits:(edits:Edits)=>void,valid:boolean){
 const [status,setStatus]=useState('Подключение к базе…');
 const [ready,setReady]=useState(false);
 const [tick,setAttemptTick]=useState(0);
 const [attempt,setAttempt]=useState(0);
 const [conflict,setConflict]=useState<Document|null>(null);
 const base=useRef<Document|null>(null),current=useRef(edits),busy=useRef(false);
 current.current=edits;
 function accept(doc:Document){base.current=doc;try{localStorage.setItem(key,JSON.stringify(doc));}catch{}window.dispatchEvent(new Event('seda-design-saved'));try{const channel=new BroadcastChannel('seda-design');channel.postMessage({revision:doc.revision});channel.close();}catch{}}
 useEffect(()=>{let stopped=false;
  async function load(){
   try{
    const response=await fetch('/api/token-document',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();const doc:Document=await response.json();if(stopped||base.current&&doc.revision<base.current.revision)return;
    if(doc.sourceTokensSha256!==hash){setStatus('Версия токенов в базе отличается. Локальные изменения сохранены; нужен перенос данных.');return;}
    let previous:Document|null=base.current;if(!previous){try{previous=JSON.parse(localStorage.getItem(key)||'null');}catch{}}
    const local=current.current;
    if(same(local,doc.edits)||!Object.keys(local).length&& !previous){setEdits(doc.edits);accept(doc);setStatus('Сохранено в базе');}
    else if(doc.revision===0){accept(doc);setStatus('Перенос локальных изменений…');}
    else if(previous?.sourceTokensSha256===hash){
     const merged={...doc.edits};let clashes=false;
     for(const k of new Set([...Object.keys(previous.edits),...Object.keys(local)])){
      if(local[k]===previous.edits[k])continue;
      if(doc.edits[k]!==previous.edits[k]&&doc.edits[k]!==local[k]){clashes=true;break;}
      if(local[k]===undefined)delete merged[k];else merged[k]=local[k];
     }
     if(clashes){setConflict(doc);setStatus('Есть отличающиеся изменения в базе и в этом браузере.');return;}
     accept(doc);setEdits(merged);setStatus('Синхронизация…');
    }else{setConflict(doc);setStatus('Найдены локальные изменения и общая версия. Выберите, какую сохранить.');return;}
    setReady(true);
   }catch{if(!stopped)setStatus('Нет связи с базой. Изменения сохранены локально.');}
  }
  load();return()=>{stopped=true;};
 },[hash,attempt]);
 useEffect(()=>{
  if(!ready||conflict||!valid||!base.current||busy.current)return;
  if(same(edits,base.current.edits)){setStatus('Сохранено в базе');return;}
  setStatus('Сохранение…');
  const timer=setTimeout(async()=>{
   busy.current=true;const snapshot={...current.current};const revision=base.current!.revision;
   try{
    const response=await fetch('/api/token-document',{method:'PUT',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({clientVersion:2,sourceTokensSha256:hash,revision,edits:snapshot})});
    const doc=await response.json();
    if(response.status===409&&doc.document){setConflict(doc.document);setStatus('Изменено в другой вкладке. Ваши правки сохранены локально.');setReady(false);return;}
    if(!response.ok)throw Error();accept(doc);setStatus(same(current.current,snapshot)?'Сохранено в базе':'Сохранение…');
   }catch{setReady(false);setStatus('Не удалось сохранить в базе. Локальная копия сохранена.');}
   finally{busy.current=false;setAttemptTick(x=>x+1);}
  },500);
  return()=>clearTimeout(timer);
 },[edits,ready,conflict,valid,hash,tick]);
 // Pull another editor's changes only while this editor has no pending writes.
 useEffect(()=>{const refresh=()=>{if(!busy.current&&base.current&&same(current.current,base.current.edits)&&!conflict)setAttempt(x=>x+1);};const timer=setInterval(refresh,15000);window.addEventListener('focus',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);};},[conflict]);
 function resolve(useLocal:boolean){if(!conflict)return;if(conflict.sourceTokensSha256!==hash)return;accept(conflict);if(!useLocal)setEdits(conflict.edits);setConflict(null);setReady(true);setStatus('Синхронизация…');}
 return {status,conflict,retry:()=>setAttempt(x=>x+1),resolve};
}
