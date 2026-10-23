import React,{useState} from "react";
import {Button,TextField,SplitView,Tree} from "@seda-ai/ui";
import {Select,Toggle,Checkbox} from "./contract-controls";
type NodeId="frame"|"heading"|"button";
type LayoutNode={text:string;visible:boolean;disabled:boolean};
type DocumentModel=Record<NodeId,LayoutNode>&{buttonVariant:"primary"|"secondary"};
const initial:DocumentModel={frame:{text:"Проект Atlas",visible:true,disabled:false},heading:{text:"Рабочее пространство",visible:true,disabled:false},button:{text:"Создать задачу",visible:true,disabled:false},buttonVariant:"primary"};
const storageKey="seda.lab.editor-layout.v1";
const initialTree={treeSelection:"heading" as NodeId,treeExpanded:["frame"] as readonly string[]};
function load(){
 try{
  const raw=localStorage.getItem(storageKey);if(!raw)return {...initialTree,document:initial,navigation:180,canvas:300,notice:"Макет ещё не сохранён"};
  const value=JSON.parse(raw);
  if(value.version!==1||!value.document||!["primary","secondary"].includes(value.document.buttonVariant)||!["frame","heading","button"].every(id=>typeof value.document[id]?.text==="string"&&value.document[id].text.trim().length>0&&value.document[id].text.length<=500&&typeof value.document[id].visible==="boolean"&&typeof value.document[id].disabled==="boolean")||!Number.isFinite(value.navigation)||value.navigation<0||!Number.isFinite(value.canvas)||value.canvas<0)throw Error("Invalid local layout");
  if(value.treeSelection!==undefined&&!["frame","heading","button"].includes(value.treeSelection))throw Error("Invalid selection");
  if(value.treeExpanded!==undefined&&(!Array.isArray(value.treeExpanded)||value.treeExpanded.some((id:unknown)=>id!=="frame")))throw Error("Invalid expansion");
  return {...initialTree,...value,notice:"Восстановлен локальный макет"};
 }catch{return {...initialTree,document:initial,navigation:180,canvas:300,notice:"Не удалось восстановить локальный макет; открыт исходный"};}
}
/** Stateful composition of shared components. This is not a completed Figma reference screen. */
export function EditorWorkspace({size,action}:{size:"s"|"m"|"l"|"xl";action:(role:string)=>any}){
 const [restored]=useState(load),[documentModel,setDocument]=useState<DocumentModel>(restored.document);
 const [saved,setSaved]=useState<DocumentModel>(restored.document),[selection,setSelection]=useState<NodeId>(restored.treeSelection);
 const [treeExpanded,setTreeExpanded]=useState<readonly string[]>(restored.treeExpanded);
 const [savedTree,setSavedTree]=useState({selection:restored.treeSelection,expanded:restored.treeExpanded});
 const [past,setPast]=useState<DocumentModel[]>([]),[future,setFuture]=useState<DocumentModel[]>([]);
 const [navigation,setNavigation]=useState(restored.navigation),[canvas,setCanvas]=useState(restored.canvas);
 const [savedPanels,setSavedPanels]=useState({navigation:restored.navigation,canvas:restored.canvas});
 const [notice,setNotice]=useState(restored.notice),[storageError,setStorageError]=useState(false),[clicks,setClicks]=useState(0);
 const current=documentModel[selection],dirty=JSON.stringify(documentModel)!==JSON.stringify(saved)||navigation!==savedPanels.navigation||canvas!==savedPanels.canvas||selection!==savedTree.selection||JSON.stringify(treeExpanded)!==JSON.stringify(savedTree.expanded);
 function commit(next:DocumentModel){if(JSON.stringify(next)===JSON.stringify(documentModel))return;setPast(old=>[...old.slice(-49),documentModel]);setFuture([]);setDocument(next);}
 function update(change:Partial<LayoutNode>){commit({...documentModel,[selection]:{...current,...change}});}
 function undo(){const previous=past.at(-1);if(!previous)return;setPast(old=>old.slice(0,-1));setFuture(old=>[documentModel,...old]);setDocument(previous);}
 function redo(){const next=future[0];if(!next)return;setFuture(old=>old.slice(1));setPast(old=>[...old,documentModel]);setDocument(next);}
 function persist(){
  if(![documentModel.frame,documentModel.heading,documentModel.button].every(node=>node.text.trim())){setStorageError(true);setNotice("Заполните текст всех элементов перед сохранением");return;}
  try{localStorage.setItem(storageKey,JSON.stringify({version:1,document:documentModel,navigation,canvas,treeSelection:selection,treeExpanded}));setSaved(documentModel);setSavedPanels({navigation,canvas});setSavedTree({selection,expanded:treeExpanded});setStorageError(false);setNotice("Макет, дерево и размеры панелей сохранены в этом браузере");}
  catch{setStorageError(true);setNotice("Не удалось сохранить макет в хранилище браузера");}
 }
 const pane=action("cancel");
 return <section className="workspace-page editor-workspace" aria-labelledby="editor-title">
  <div className="section-top"><div><div className="eyebrow">ПАНЕЛИ РАБОЧЕГО ПРИЛОЖЕНИЯ</div><h1 id="editor-title">Редактор интерфейса</h1>
  <p>Общие компоненты SEDA: разделители, поля, выбор и preview. Экспериментальная композиция, не готовый экран из Figma.</p></div></div>
  <div className="editor-toolbar">
   <Button {...pane} size={size} id="editor-undo" disabled={!past.length} onClick={undo}>Отменить</Button>
   <Button {...pane} size={size} id="editor-redo" disabled={!future.length} onClick={redo}>Повторить</Button>
   <Button {...pane} size={size} id="editor-reset-panels" onClick={()=>{setNavigation(180);setCanvas(300);}}>Сбросить панели</Button>
   <Button {...action("save")} size={size} id="editor-save-layout" onClick={persist}>Сохранить макет</Button>
   <span id="editor-dirty">{dirty?"Макет изменён":"Макет без изменений"}</span>
  </div>
  <div className="editor-surface">
   <SplitView id="editor-layout" primaryLabel="Объекты макета" secondaryLabel="Canvas и инспектор" separatorLabel="Ширина списка объектов"
    primarySize={navigation} onSizeChange={setNavigation} minSize={120} maxSize={320} secondaryMinSize={408}
    primary={<nav className="editor-objects" aria-label="Объекты макета">
     <h2>Объекты</h2>
     <Tree id="editor-node" label="Слои макета" size={size}
      items={[{id:"frame",label:documentModel.frame.text.trim()?documentModel.frame.text:"Frame",children:[{id:"heading",label:documentModel.heading.text.trim()?documentModel.heading.text:"Заголовок"},{id:"button",label:documentModel.button.text.trim()?documentModel.button.text:"Кнопка"}]}]}
      expandedIds={treeExpanded} onExpandedChange={setTreeExpanded} selectedIds={[selection]} onSelectionChange={ids=>{if(ids[0])setSelection(ids[0] as NodeId);}}/>
    </nav>}
    secondary={<SplitView id="editor-inspector-layout" primaryLabel="Предпросмотр макета" secondaryLabel="Свойства элемента" separatorLabel="Ширина preview"
     primarySize={canvas} onSizeChange={setCanvas} minSize={180} secondaryMinSize={220}
     primary={<div className="editor-preview" id="editor-preview">
      <p className="hint">Живой preview · SEDA UI</p>
      <div className="editor-artboard" hidden={!documentModel.frame.visible}>
       <div className="eyebrow">{documentModel.frame.text}</div>
       <h2 hidden={!documentModel.heading.visible}>{documentModel.heading.text}</h2>
       <div hidden={!documentModel.button.visible}>{documentModel.button.text.trim()?<Button {...action(documentModel.buttonVariant==="primary"?"save":"cancel")} size={size} id="editor-preview-button" variant={documentModel.buttonVariant} disabled={documentModel.button.disabled} onClick={()=>setClicks(count=>count+1)}>{documentModel.button.text}</Button>:<p role="status">Введите текст кнопки в инспекторе.</p>}</div>
       <p className="hint">Нажатий кнопки: <output id="editor-preview-count">{clicks}</output></p>
      </div>
      {!documentModel.frame.visible&&<p role="status">Frame скрыт. Включите видимость в инспекторе.</p>}
     </div>}
     secondary={<aside className="editor-properties">
      <h2>Инспектор</h2>
      <p id="editor-selection">Выбран: {selection}</p>
      <TextField id="editor-node-text" label="Текст элемента" size={size} value={current.text} errorText={current.text.trim()?undefined:"Текст обязателен"} onChange={event=>update({text:event.target.value.slice(0,500)})}/>
      <Toggle id="editor-node-visible" label="Видимость элемента" size={size} checked={current.visible} onCheckedChange={visible=>update({visible})}/>
      {selection==="button"&&<>
       <Select className="workspace-select" id="editor-button-variant" label="Вариант кнопки" size={size} value={documentModel.buttonVariant} onValueChange={variant=>commit({...documentModel,buttonVariant:variant as "primary"|"secondary"})} options={[{value:"primary",label:"Primary"},{value:"secondary",label:"Secondary"}]}/>
       <Checkbox id="editor-button-disabled" label="Кнопка недоступна" size={size} checked={current.disabled} onCheckedChange={disabled=>update({disabled})}/>
      </>}
     </aside>}
    />}
   />
  </div>
  <p id="editor-storage-notice" role={storageError?"alert":"status"}>{notice}</p>
  <p className="hint">Модель и размеры сохраняются явно кнопкой «Сохранить макет». Undo/redo хранит до 50 изменений текущего сеанса. Сервер не используется.</p>
 </section>;
}
