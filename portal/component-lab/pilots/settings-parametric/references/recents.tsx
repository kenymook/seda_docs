import {SharedDesignProvider,useSavedProfiles} from '../SharedDesignProvider';
import {Breadcrumbs,Popover,Sidebar,TopBar,NotificationCenter,Search} from '@seda-ai/ui';
import {ReferenceGlyph} from './reference-glyph';
import {ReferenceTextScale} from './reference-text-scale';
import {CommandActions} from './command-actions';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Icon,Text,SedaProvider,Button,IconButton,TextField,Select,Checkbox,Tabs,DropdownMenu} from '@seda-ai/ui';
import type {MenuEntry} from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';
import '@fontsource/inter/400.css';import '@fontsource/inter/600.css';import '@fontsource/inter/700.css';
import {profiles} from 'seda:catalog';
import {derive} from '../lab-model.mjs';
import {createWorkspaceBindings} from '../workspace-bindings.mjs';
import {initialFiles,defaults,readFiles,readPreferences,filterFiles,nameError,filesKey,preferencesKey} from './file-model';
import type {WorkspaceFile,Preferences} from './file-model';
import {notificationsKey,readNotifications,appendNotification} from './notification-history';
import type {WorkspaceNotification} from './notification-history';
import {referenceSearchLabels}from'./reference-search';
import './recents.css';
import {WorkspaceDialog} from './reference-dialog';

const asset=(name:string)=>'./assets/'+name;
const icon=(name:string,size=16)=>/^(recentsSidebarNav|recentsDrafts|recentsTeamNav|recentsFilterContext|recentsHelp|recentsSidebarTop)-imgIcon/.test(name)?<ReferenceGlyph file={name}/>:<img src={asset(name)} alt="" width={size} height={size}/>;
const projects=['💡 SDDS 2.0','💎 SDDS Base','🌀 Plasma SD Service (exB2C)','🟢 SDDS Service','🟢 SDDS Insol [deprecated]','🌀 Plasma Infra','🟦 Plasma Giga [deprecated]','🌀 Plasma SD HomeOS','🛠 SDDS All Your Base','🌀 Plasma Salute Service','🌀 Plasma Core','📁 SDDS Netology','🌀 Plasma SD Mid (exB2B)','🌀 Plasma StarDS','🌀 Plasma Playground','🌀 Plasma ASDK','🟢 SDDS SbShop [deprecated]','🔹 SDDS AI [deprecated]','🖼 SDDS × Caldera Online','🌀 Plasma Builder','📁 Тестируем коннектед проджекты','🌀 Plasma Source'];
type Modal={kind:'create';type:string}|{kind:'rename'|'open';id:string}|{kind:'delete';ids:string[]}|{kind:'settings'|'help'|'reset'}|null;
function routeSection(){const params=new URLSearchParams(location.search),section=params.get('section');return params.has('project')?'project:'+params.get('project')!.slice(0,160):section&&['recents','community','drafts','teams','trash','notifications'].includes(section)?section:'recents';}

function RecentsWorkspace(){
 const profiles=useSavedProfiles();
 const [newsOpen,setNewsOpen]=useState(false);
 const [headerScrolled,setHeaderScrolled]=useState(false);
 const [files,setFiles]=useState<WorkspaceFile[]>([]),[preferences,setPreferences]=useState<Preferences>(defaults);
 const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading'),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [query,setQuery]=useState(''),[section,setSection]=useState(routeSection),[tab,setTab]=useState('recent'),[organization,setOrganization]=useState('all'),[type,setType]=useState('all'),[folder,setFolder]=useState<string|null>(null);
 const [selected,setSelected]=useState<string[]>([]),[modal,setModal]=useState<Modal>(null),[draft,setDraft]=useState(''),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[banner,setBanner]=useState(true),[starredOpen,setStarredOpen]=useState(true);
 const operation=useRef(0),locked=useRef(false),mounted=useRef(true),lastTrigger=useRef<HTMLElement|null>(null);
 const [notifications,setNotifications]=useState<WorkspaceNotification[]>([]),[historyState,setHistoryState]=useState<'loading'|'ready'|'error'>('loading'),[historyError,setHistoryError]=useState('');
 const historyRef=useRef<WorkspaceNotification[]>([]),pendingHistory=useRef<WorkspaceNotification[]|null>(null);
 function readHistory(){try{const next=pendingHistory.current??readNotifications(localStorage.getItem(notificationsKey));if(pendingHistory.current)localStorage.setItem(notificationsKey,JSON.stringify({version:1,items:next}));historyRef.current=next;pendingHistory.current=null;setNotifications(next);setHistoryError('');setHistoryState('ready');}catch(e){setHistoryError(e instanceof Error?e.message:'Не удалось прочитать историю уведомлений');setHistoryState('error');}}
 function commitHistory(next:WorkspaceNotification[]){historyRef.current=next;setNotifications(next);try{localStorage.setItem(notificationsKey,JSON.stringify({version:1,items:next}));pendingHistory.current=null;setHistoryError('');setHistoryState('ready');}catch{pendingHistory.current=next;setHistoryError('История изменена в памяти, но не сохранена в этом браузере. Повторите сохранение. Файлы не затронуты.');setHistoryState('error');}}
 function recordNotification(message:string,next:WorkspaceFile[]){if(historyState==='error'&&!pendingHistory.current)return;const old=new Map(files.map(file=>[file.id,file])),changed=next.filter(file=>JSON.stringify(old.get(file.id))!==JSON.stringify(file));const names=changed.slice(0,3).map(file=>file.name).join(', '),context=names?' · '+names+(changed.length>3?' и ещё '+(changed.length-3):''):'';commitHistory(appendNotification(historyRef.current,message+context,crypto.randomUUID(),new Date().toISOString()));}
 useEffect(readHistory,[]);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;operation.current++;};},[]);
 const configuration=profiles[(preferences.theme==='dark'?'Dark':'Light')+':'+preferences.size];
 const parameters={scale:preferences.scale,air:preferences.airY,airX:preferences.airX,radius:100,strict:true};
 const derived=derive(configuration,parameters),bindings=createWorkspaceBindings(configuration,derived,parameters);
 const style={...bindings.vars,'--reference-button-padding':derived.buttonPaddingX+'px'} as React.CSSProperties;

 function load(){
  if(locked.current)return;const request=++operation.current;setStatus('loading');setError('');
  // Deferred local read permits a loading announcement. No simulated network/provider.
  window.setTimeout(()=>{if(!mounted.current||request!==operation.current)return;
   try{const next=readFiles(localStorage.getItem(filesKey));let prefs={...defaults};try{prefs=readPreferences(localStorage.getItem(preferencesKey));}catch{setError('Параметры интерфейса повреждены. Применены исходные; сохраните новые параметры через меню аккаунта.');}setFiles(next);setPreferences(prefs);setSelected([]);setStatus('ready');setNotice('Локальное рабочее пространство загружено');}
   catch(e){setStatus('error');setError(e instanceof Error?e.message:'Не удалось прочитать локальные данные');}
  },0);
 }
 useEffect(load,[]);
 useEffect(()=>{const update=()=>{setSection(routeSection());setFolder(null);setSelected([]);setTab('recent');};window.addEventListener('popstate',update);return()=>window.removeEventListener('popstate',update);},[]);
 async function save(next:WorkspaceFile[],message:string,after?:()=>void){
  if(locked.current)return;locked.current=true;setBusy(true);setError('');const request=++operation.current;
  try{await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));if(!mounted.current||request!==operation.current)return;
   localStorage.setItem(filesKey,JSON.stringify({version:1,files:next}));setFiles(next);setNotice(message);recordNotification(message,next);setSelected(ids=>ids.filter(id=>next.some(file=>file.id===id&&file.trashed===(section==='trash'))));after?.();
  }catch{if(mounted.current&&request===operation.current)setError('Не удалось сохранить изменения в этом браузере. Данные не изменены; повторите действие.');}
  finally{locked.current=false;if(mounted.current)setBusy(false);}
 }
 function changePreferences(change:Partial<Preferences>){const next={...preferences,...change};setPreferences(next);try{localStorage.setItem(preferencesKey,JSON.stringify(next));setError('');}catch{setError('Параметры применены, но не сохранены в этом браузере');}}
 useEffect(()=>{setNewsOpen(false);},[section,modal]);
 function navigate(next:string,restoreFocus=true){const url=new URL(location.href);url.search='';url.searchParams.set(next.startsWith('project:')?'project':'section',next.startsWith('project:')?next.slice(8):next);history.pushState(null,'',url);setSection(next);setFolder(null);setSelected([]);setTab('recent');if(restoreFocus&&(section==='notifications'||next==='notifications'))requestAnimationFrame(()=>document.getElementById('reference-main')?.focus());}
 function show(next:NonNullable<Modal>,trigger?:HTMLElement){const active=document.activeElement as HTMLElement,menu=active?.closest('[role=menu]'),menuTrigger=menu?.getAttribute('aria-labelledby');lastTrigger.current=trigger??(menuTrigger?document.getElementById(menuTrigger):null)??active;setError('');setDirty(false);setDraft(next.kind==='rename'||next.kind==='open'?files.find(file=>file.id===next.id)?.name??'':next.kind==='create'?'Untitled':'');setModal(next);}
 function dismiss(){if(busy)return;if(dirty&&!window.confirm('Закрыть без сохранения названия?'))return;setModal(null);setDirty(false);requestAnimationFrame(()=>{const element=lastTrigger.current;if(element?.isConnected)element.focus();else document.getElementById('reference-search')?.focus();});}
 function fileMenu(file:WorkspaceFile):MenuEntry[]{return [
  {id:'open',label:'Открыть',onSelect:()=>show({kind:'open',id:file.id})},
  {id:'rename',label:'Переименовать',onSelect:()=>show({kind:'rename',id:file.id})},
  {id:'favorite',label:file.starred?'Убрать из избранного':'В избранное',onSelect:()=>void save(files.map(item=>item.id===file.id?{...item,starred:!item.starred}:item),'Избранное обновлено')},
  {id:'duplicate',label:'Создать копию',onSelect:()=>{const copy={...file,id:crypto.randomUUID(),name:(file.name+' — копия').slice(0,160),trashed:false,updated:'Edited just now'};void save([copy,...files],'Копия создана');}},
  {type:'separator',id:'separator'},
  file.trashed?{id:'restore',label:'Восстановить',onSelect:()=>void save(files.map(item=>item.id===file.id?{...item,trashed:false}:item),'Файл восстановлен')}
   :{id:'trash',label:'Переместить в корзину',danger:true,onSelect:()=>show({kind:'delete',ids:[file.id]})}
 ];}
 const filtered=useMemo(()=>filterFiles(files,{section,tab,query,organization,type,folder}),[files,section,tab,query,organization,type,folder]);
 const teams=[...new Set(files.map(file=>file.team))];
 const visibleSelection=selected.filter(id=>filtered.some(file=>file.id===id));
 const heading=section==='notifications'?'Уведомления':section==='recents'?'Recents':section==='drafts'?'Drafts':section==='trash'?'Trash':section==='community'?'Community':section==='teams'?'All teams':section.slice(8);
 function selectFile(id:string,checked:boolean){setSelected(old=>checked?[...new Set([...old,id])]:old.filter(value=>value!==id));}
 function saveDraft(){
  if(nameError(draft)||!modal)return;
  if(modal.kind==='create'){
   const file:WorkspaceFile={id:crypto.randomUUID(),name:draft.trim(),type:modal.type,team:'Drafts',updated:'Edited just now',shared:false,folder:'Drafts',trashed:false,starred:false,viewed:Date.now()};
   void save([file,...files],'Файл создан',()=>{navigate('recents');setQuery('');setType('all');setOrganization('all');setModal(null);setDirty(false);requestAnimationFrame(()=>lastTrigger.current?.focus());});
  }else if(modal.kind==='rename'||modal.kind==='open')void save(files.map(file=>file.id===modal.id?{...file,name:draft.trim(),updated:'Edited just now'}:file),'Название сохранено',()=>{setModal(null);setDirty(false);requestAnimationFrame(()=>lastTrigger.current?.focus());});
 }
 function collection(){
  if(status==='loading')return <div className="reference-empty" role="status">Загрузка локального рабочего пространства…</div>;
  if(status==='error')return <div className="reference-empty"><Text as="h2" variant="heading/section">Не удалось загрузить рабочее пространство</Text><Text as="p" variant="body/default">{error}</Text><Button onClick={load}>Повторить загрузку</Button><Button variant="ghost" onClick={()=>show({kind:'reset'})}>Восстановить исходные файлы</Button></div>;
  if(tab==='folders'||section==='teams')return <div className="reference-folder-grid">{[...new Set(filtered.map(file=>section==='teams'?file.team:file.folder))].map(name=><Button key={name} variant="secondary" onClick={()=>{if(section==='teams'){setOrganization(name);setSection('recents');}else setFolder(name);setTab('recent');}}>{name} · {filtered.filter(file=>(section==='teams'?file.team:file.folder)===name).length}</Button>)}{!filtered.length&&<Text as="p" variant="body/default">Нет доступных папок для выбранных фильтров.</Text>}</div>;
  if(!filtered.length)return <div className="reference-empty"><Text as="h2" variant="heading/section">{section==='trash'?'Корзина пуста':'Файлы не найдены'}</Text><Text as="p" variant="body/default">Измените запрос или сбросьте фильтры.</Text><Button variant="secondary" onClick={()=>{setQuery('');setOrganization('all');setType('all');setFolder(null);}}>Сбросить фильтры</Button></div>;
  return <div className={'reference-files reference-files--'+preferences.view} role="list" aria-label="Файлы рабочего пространства">
   {filtered.map(file=><article role="listitem" className="reference-file" data-file-id={file.id} data-selected={selected.includes(file.id)||undefined} key={file.id}>
    <button className="reference-file-open" onClick={event=>show({kind:'open',id:file.id},event.currentTarget)} aria-label={'Открыть '+file.name}>
     <div className="reference-thumbnail">{file.thumbnail?<img src={asset(file.thumbnail)} alt="" loading="lazy" draggable={false} style={{padding:file.previewInset??0}}/>:<span className="reference-new-preview">{file.type.toUpperCase()}<strong>{file.name}</strong></span>}</div>
     <div className="reference-file-summary">{file.icon?icon(file.icon):icon('recentsHeader-imgIcon.svg')}<div><Text as="h2" variant="label/default">{file.name}</Text><Text as="p" variant="caption/default">{file.team!=='Drafts'?file.team+' · ':''}{file.updated}</Text></div>{file.avatar&&<img className="reference-avatar" src={asset(file.avatar)} alt="" width="24" height="24"/>}</div>
    </button>
    <div className="reference-file-selection"><Checkbox label={'Выбрать '+file.name} checked={selected.includes(file.id)} onCheckedChange={checked=>selectFile(file.id,checked)}/></div>
    <div className="reference-file-menu"><DropdownMenu triggerLabel={'Действия: '+file.name} triggerIcon={<Icon name="more"/>} iconOnly items={fileMenu(file)} disabled={busy}/></div>
   </article>)}
  </div>;
 }
 const activeFile=modal&&(modal.kind==='open'||modal.kind==='rename')?files.find(file=>file.id===modal.id):undefined;
 return <SedaProvider controlParameters={bindings.controlParameters} theme={preferences.theme} controlSize={preferences.size} textScale={preferences.scale} style={style} className="reference-app" data-reference="recents" data-status={status}>
  <a className="reference-skip" href="#reference-main">К файлам</a>
  <Sidebar className="reference-sidebar" label="Навигация рабочего пространства" {...(!section.startsWith('project:')||projects.some(name=>'project:'+name.replace(/^[^\p{L}\p{N}]+/u,'').trim()===section)?{selectedKey:section}:{})} header={<><div className="reference-account"><DropdownMenu triggerLabel="Kenymook" triggerIcon={<img className="reference-avatar" src={asset('recentsSidebarTop-imgImage.png')} alt="" width="24" height="24"/>} items={[
    {id:'settings',label:'Параметры интерфейса',onSelect:()=>show({kind:'settings'})},{id:'reload',label:'Перезагрузить локальные файлы',disabled:busy,onSelect:load},{id:'documents',label:'Документы — Building',onSelect:()=>{location.href='./building.html';}},{id:'lab',label:'Открыть лабораторию',onSelect:()=>{location.href='../';}}]}/><IconButton variant="ghost" aria-label="Уведомления" tooltip="Уведомления" icon={icon('recentsSidebarTop-imgIcon1.svg',24)} onClick={()=>navigate('notifications')}/></div>
   <Search id="reference-search" className="reference-search" label="Поиск файлов" mode="filter" labels={referenceSearchLabels} resultsId="reference-file-results" resultCount={filtered.length} placeholder="Search" searchIcon={icon('recentsSidebarTop-imgIcon2.svg')} query={query} disabled={status!=='ready'} onQueryChange={value=>{if(section==='notifications')navigate('recents',false);setQuery(value);setSelected([]);}}/></>} footer={<Text as="div" variant="caption/default" className="reference-local-note">Локальные данные · <a href="../">SEDA Lab</a></Text>} sections={[
   {id:'files',items:[['recents','Recents','recentsSidebarNav-imgIcon.svg'],['community','Community','recentsSidebarNav-imgIcon1.svg'],['notifications','Уведомления','recentsSidebarTop-imgIcon1.svg']].map(([id,label,img])=>({id,label,kind:'link' as const,href:'?section='+id,icon:icon(img,24),onClick:(event:React.MouseEvent<HTMLAnchorElement>)=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();navigate(id);}}))},
   {id:'team',label:'SaluteDev',icon:<span className="reference-team-mark">S</span>,items:[['drafts','Drafts','recentsDrafts-imgIcon.svg'],['teams','All teams','recentsTeamNav-imgIcon.svg'],['trash','Trash','recentsTeamNav-imgIcon1.svg']].map(([id,label,img])=>({id,label,kind:'link' as const,href:'?section='+id,icon:icon(img,24),onClick:(event:React.MouseEvent<HTMLAnchorElement>)=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();navigate(id);}}))},
   {id:'starred',label:'Starred',collapsible:true,expanded:starredOpen,onExpandedChange:setStarredOpen,expandLabel:'Развернуть Starred',collapseLabel:'Свернуть Starred',items:projects.map(name=>{const clean=name.replace(/^[^\p{L}\p{N}]+/u,'').trim();return{id:'project:'+clean,label:clean,kind:'link' as const,href:'?project='+encodeURIComponent(clean),icon:<span>{name.slice(0,name.indexOf(clean)).trim()}</span>,onClick:(event:React.MouseEvent<HTMLAnchorElement>)=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();navigate('project:'+clean);}};})}
  ]}/>

  <main id="reference-main" className="reference-main" tabIndex={-1} onScroll={event=>setHeaderScrolled(event.currentTarget.scrollTop>0)}>
   {folder&&<div className="reference-folder-path"><Breadcrumbs label="Путь папки" variant="text" items={[{id:'collection',label:heading,href:location.href,onClick:event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();setFolder(null);setSelected([]);requestAnimationFrame(()=>document.getElementById('reference-main')?.focus());}},{id:'folder',label:folder}]}/></div>}
   <TopBar label="Файлы" variant="page-header" state={headerScrolled?'scrolled':'default'} gutter="wide" className="reference-header" title={<Text as="h1" variant="label/default">{folder??heading}</Text>} actions={<div className="reference-create-actions" data-workspace-actions="adaptive"><CommandActions label="Создание файлов" densityKey={[preferences.size,preferences.scale,preferences.airX,preferences.airY].join(':')} actions={[[ 'design','Design','recentsHeader-imgIcon.svg'],['figjam','FigJam','recentsHeader-imgIcon1.svg'],['slides','Slides','recentsHeader-imgIcon2.svg'],['make','Make','recentsHeader-imgIcon3.svg']].map(([id,label,img])=>({id,label,icon:<span className="reference-type-icon" data-kind={id}>{icon(img)}</span>,onSelect:()=>show({kind:'create',type:id}),disabled:busy||status!=='ready'}))} overflowLabel="More" overflowItems={[{id:'settings',label:'Параметры интерфейса',onSelect:()=>show({kind:'settings'})},{id:'help',label:'Справка и горячие клавиши',onSelect:()=>show({kind:'help'})}]}/></div>}/>
   {banner&&section!=='notifications'&&<section className="reference-banner" aria-label="Новости"><img src={asset('recentsTools-imgImage.svg')} alt="Config" width="152" height="30"/><Text as="p" variant="body/default">Check out everything we launched at Config India</Text><Popover size="l" id="reference-news" open={newsOpen} onOpenChange={setNewsOpen} title="Новости рабочего пространства" closeLabel="Закрыть панель" trigger={bindings=><Button {...bindings} variant="secondary">Read more</Button>}><Text as="p" variant="body/default">Файлы, команды и свойства собраны в одном рабочем пространстве.</Text><ul><li>Поиск, папки и фильтры работают совместно.</li><li>Название и корзина сохраняются в этом браузере.</li><li>Тема, размер и отступы меняются в параметрах интерфейса.</li></ul></Popover><IconButton aria-label="Закрыть новости" tooltip="Закрыть новости" variant="ghost" icon={<Icon name="close"/>} onClick={()=>{setNewsOpen(false);setBanner(false);}}/></section>}
   {section==='notifications'&&<div className="reference-notifications">
    <NotificationCenter title="История локальных операций" items={notifications.map(item=>({...item,timestamp:{dateTime:item.createdAt,label:new Date(item.createdAt).toLocaleString('ru-RU')},icon:<Icon name="success"/>}))} labels={{all:'Все',mentions:'Упоминания',unread:'Непрочитанные',markAllRead:'Прочитать все',markRead:'Прочитано',empty:'Событий пока нет. Создайте, переименуйте или переместите файл — успешная операция появится здесь.',noResults:'В этом разделе нет событий. Выберите «Все», чтобы посмотреть историю.',loading:'Чтение истории этого браузера…',retry:'Повторить чтение или сохранение',settings:'Параметры интерфейса',unreadCount:n=>'Непрочитанных: '+n}} {...(historyState==='error'?{state:'error' as const,errorText:historyError,onRetry:readHistory}:{state:historyState})} busy={busy} actionStatus={busy?'Сохраняется операция с файлами…':undefined} onMarkRead={id=>commitHistory(historyRef.current.map(item=>item.id===id?{...item,unread:false}:item))} onMarkAllRead={ids=>commitHistory(historyRef.current.map(item=>ids.includes(item.id)?{...item,unread:false}:item))} onSettings={()=>show({kind:'settings'})}/>
    <Text as="p" variant="caption/default">До 200 событий этого браузера. Это локальная история операций, без внешнего сервиса и без реальных упоминаний других пользователей.</Text>
    {historyState==='error'&&<Button variant="secondary" onClick={()=>{if(window.confirm('Удалить только историю уведомлений? Файлы будут сохранены.'))commitHistory([]);}}>Начать новую историю</Button>}
    <Button variant="secondary" onClick={()=>navigate('recents')}>Вернуться к файлам</Button>
   </div>}
   <div className="reference-collection" id="reference-file-results" role="region" aria-label="Результаты поиска файлов" hidden={section==='notifications'}>
    <div className="reference-filters" data-workspace-actions aria-label="Фильтры и вид файлов">
     <Select id="reference-organization" label="Организация" value={organization} onValueChange={value=>{setOrganization(String(value));setSelected([]);}} options={[{value:'all',label:'All organizations'},...teams.map(team=>({value:team,label:team}))]}/>
     <Select id="reference-type" label="Тип файла" value={type} onValueChange={value=>{setType(String(value));setSelected([]);}} options={[{value:'all',label:'All files'},...['design','published','figjam','slides','make','repo','prototype'].map(value=>({value,label:value}))]}/>
     <div className="reference-view" role="group" aria-label="Вид файлов"><IconButton aria-label="Сетка" tooltip="Сетка" selected={preferences.view==='grid'} aria-pressed={preferences.view==='grid'} variant="ghost" icon={icon('recentsFilterContext-imgIcon1.svg',24)} onClick={()=>changePreferences({view:'grid'})}/><IconButton aria-label="Список" tooltip="Список" selected={preferences.view==='list'} aria-pressed={preferences.view==='list'} variant="ghost" icon={icon('recentsFilterContext-imgIcon2.svg',24)} onClick={()=>changePreferences({view:'list'})}/></div>
    </div>
    <Tabs label="Доступ к файлам" variant="pill" value={tab} onValueChange={value=>{setTab(value);setFolder(null);setSelected([]);}} className="reference-tabs" items={[
     {value:'recent',label:'Recently viewed',content:tab==='recent'?collection():null},
     {value:'shared',label:'Shared files',content:tab==='shared'?collection():null},
     {value:'folders',label:'Shared folders',content:tab==='folders'?collection():null}]}/>
   </div>
   {visibleSelection.length>0&&<div className="reference-selection-bar" role="region" aria-label="Действия с выбранными файлами"><Text as="span" variant="label/default">Выбрано: {visibleSelection.length}</Text><Button variant="secondary" onClick={()=>setSelected([])}>Снять выбор</Button><Button variant="secondary" loading={busy} onClick={()=>section==='trash'?void save(files.map(file=>visibleSelection.includes(file.id)?{...file,trashed:false}:file),'Файлы восстановлены'):show({kind:'delete',ids:visibleSelection})}>{section==='trash'?'Восстановить':'В корзину'}</Button></div>}
   <Text as="p" variant="caption/default" className="reference-status" role="status" aria-live="polite">{busy?'Сохранение в этом браузере…':notice} · Файлов: {filtered.length}</Text>
   {historyState==='error'&&section!=='notifications'&&<Text as="p" variant="caption/default" role="status">История уведомлений недоступна; файлы работают отдельно. Откройте «Уведомления» для восстановления.</Text>}
   {error&&status!=='error'&&<Text as="p" variant="body/default" className="reference-error" role="alert">{error}</Text>}
  </main>
  <div className="reference-help"><IconButton variant="secondary" aria-label="Справка" tooltip="Справка" icon={icon('recentsHelp-imgIcon.svg',24)} onClick={()=>show({kind:'help'})}/></div>
  {modal&&<WorkspaceDialog title={modal.kind==='create'?'Новый файл':modal.kind==='rename'?'Переименовать файл':modal.kind==='open'?activeFile?.name??'Файл':modal.kind==='delete'?'Переместить в корзину?':modal.kind==='settings'?'Параметры интерфейса':modal.kind==='reset'?'Восстановить исходные данные?':'Справка'} onDismiss={dismiss}>
   {['create','rename','open'].includes(modal.kind)&&<form onSubmit={event=>{event.preventDefault();saveDraft();}}>
    {modal.kind==='open'&&activeFile?.thumbnail&&<img className="reference-open-preview" src={asset(activeFile.thumbnail)} alt={'Превью '+activeFile.name}/>}
    <TextField id="reference-file-name" label="Название файла" value={draft} onChange={event=>{setDraft(event.target.value);setDirty(true);}} errorText={nameError(draft)} required maxLength={160} disabled={busy}/>
    {activeFile&&<Text as="p" variant="body/default">{activeFile.team} · {activeFile.type} · {activeFile.shared?'Shared':'Private'}</Text>}
    <div className="reference-dialog-actions" data-workspace-actions><Button type="submit" loading={busy} disabled={!!nameError(draft)}>Сохранить</Button><Button variant="secondary" disabled={busy} onClick={dismiss}>Отмена</Button></div>
   </form>}
   {modal.kind==='delete'&&<><Text as="p" variant="body/default">{modal.ids.length} файл(а) будут перемещены в корзину. Их можно восстановить.</Text><div className="reference-dialog-actions" data-workspace-actions><Button variant="destruction" loading={busy} onClick={()=>void save(files.map(file=>modal.ids.includes(file.id)?{...file,trashed:true}:file),'Файлы перемещены в корзину',()=>{setModal(null);setSelected([]);requestAnimationFrame(()=>document.getElementById('reference-search')?.focus());})}>Переместить</Button><Button variant="secondary" disabled={busy} onClick={dismiss}>Отмена</Button></div></>}
   {modal.kind==='settings'&&<div className="reference-settings"><Select id="reference-theme" label="Тема" value={preferences.theme} onValueChange={value=>changePreferences({theme:value as Preferences['theme']})} options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]}/><Select id="reference-size" label="Размер контролов" value={preferences.size} onValueChange={value=>changePreferences({size:value as Preferences['size']})} options={['s','m','l','xl'].map(value=>({value,label:value.toUpperCase()}))}/><ReferenceTextScale id="reference-scale" value={preferences.scale} onChange={scale=>changePreferences({scale})}/><TextField id="reference-x" label="Дополнительный отступ X, px" type="number" min={0} max={24} value={preferences.airX} onChange={event=>changePreferences({airX:Math.min(24,Math.max(0,Math.round(Number(event.target.value)||0)))})}/><TextField id="reference-y" label="Дополнительный отступ Y, px" type="number" min={0} max={12} value={preferences.airY} onChange={event=>changePreferences({airY:Math.min(12,Math.max(0,Math.round(Number(event.target.value)||0)))})}/><Text as="p" variant="body/default">Параметры применяются ко всем контролам. IconButton остаётся квадратным.</Text></div>}
   {modal.kind==='reset'&&<><Text as="p" variant="body/default">Все локальные изменения файлов будут заменены исходными 25 файлами. Это действие нельзя отменить.</Text><Button variant="destruction" loading={busy} onClick={()=>void save(structuredClone(initialFiles),'Исходные файлы восстановлены',()=>{setStatus('ready');setModal(null);navigate('recents');})}>Восстановить</Button></>}
   {modal.kind==='help'&&<><Text as="p" variant="body/default">Tab перемещает фокус; Enter открывает файл или действие. Выбирайте файлы через checkbox; выбранные файлы можно переместить в корзину и восстановить.</Text><Text as="p" variant="body/default">Вкладки и меню управляются стрелками, Home/End и Escape. Параметры интерфейса находятся в меню аккаунта.</Text><Text as="p" variant="body/default">Данные локальные и не отправляются на сервер. Shared — демонстрационные группы доступа, не реальные права других пользователей.</Text><a href="../">Вернуться в SEDA Lab</a></>}
   {error&&<Text as="p" variant="body/default" role="alert" className="reference-error">{error}</Text>}
  </WorkspaceDialog>}
 </SedaProvider>;
}
createRoot(document.getElementById('root')!).render(<SharedDesignProvider><RecentsWorkspace/></SharedDesignProvider>);
