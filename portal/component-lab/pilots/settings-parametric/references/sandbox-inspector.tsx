import {ReferenceGlyph} from './reference-glyph';
import {Icon,Text,Button, IconButton, Select, Checkbox, DropdownMenu} from '@seda-ai/ui';
import {NumberProperty, DraftProperty} from './sandbox-property';
import * as m from './sandbox-model';

const icon=(part:string,name='imgIcon')=><ReferenceGlyph file={'sandbox-'+part+'-'+name+'.svg'}/>;
interface Props {
 state:m.SceneState; enabled:boolean; getState:()=>m.SceneState;
 commit:(next:m.SceneState)=>boolean; command:(change:(state:m.SceneState)=>m.SceneState)=>boolean;
 onPending:(id:string,pending:boolean)=>void; onExport:()=>void; onFit:()=>void;
}
export function SandboxInspector({state,enabled,getState,commit,command,onPending,onExport,onFit}:Props){
 const page=m.activePage(state),selection=state.selection,nodes=page.nodes.filter(node=>selection.includes(node.id));
 const textIds=nodes.filter(node=>node.kind==='text').map(node=>node.id),shapeIds=nodes.filter(node=>node.kind!=='text').map(node=>node.id),frames=nodes.filter(node=>node.kind==='frame').map(node=>node.id);
 const scope=page.id+'|'+selection.join('|'),canEdit=enabled&&nodes.some(node=>m.available(page,node.id));
 function owns(){const value=getState();return value.pageId+'|'+value.selection.join('|')===scope;}
 function number(key:m.NumericKey,label:string,ids=selection,scale=1){
  const values=m.mixedValue(page,ids,key);
  return <NumberProperty key={key} id={'sandbox-'+key} label={label} property={key} value={values.value} mixed={values.mixed} identity={scope} disabled={!enabled||!ids.some(id=>m.available(page,id))} scale={scale} onPending={onPending} onCommit={value=>owns()&&commit(m.setProperties(getState(),{[key]:value},ids))}/>;
 }
 function draft(key:'name'|'text'|'fill'|'stroke',label:string,ids=selection,multiline=false){
  const value=m.mixedValue(page,ids,key);
  return <DraftProperty key={key} id={'sandbox-'+key} label={label} value={value.value} mixed={value.mixed} identity={scope} disabled={!enabled||!ids.some(id=>m.available(page,id))} maxLength={key==='text'?20000:160} multiline={multiline} onPending={onPending} validate={text=>{
   if((key==='fill'||key==='stroke')&&!/^#[a-f0-9]{6}([a-f0-9]{2})?$/i.test(text.trim()))throw Error('Формат #RRGGBB или #RRGGBBAA');
   if(key==='name'&&!text.trim())throw Error('Имя не может быть пустым');return key==='text'?text:text.trim();
  }} onCommit={text=>owns()&&commit(m.setProperties(getState(),{[key]:text},ids))}/>;
 }
 const roots=m.rootsOfSelection(page,selection).filter(id=>m.available(page,id));
 const font=m.mixedValue(page,textIds,'fontFamily'),weight=m.mixedValue(page,textIds,'fontWeight'),clip=m.mixedValue(page,frames,'clip'),visible=m.mixedValue(page,selection,'visible'),locked=m.mixedValue(page,selection,'locked');
 return <div className="sandbox-property-scroll">
  <header className="sandbox-selection-header"><Text as="strong" variant="label/small" id="sandbox-selection-count">{selection.length?selection.length+' selected':'Нет выделения'}</Text>
   <DropdownMenu triggerLabel="Действия объектов" triggerIcon={<Icon name="more"/>} iconOnly disabled={!enabled||!selection.length} items={[
    {id:'duplicate',label:'Дублировать',onSelect:()=>command(m.duplicateSelection)},
    {id:'group',label:'Сгруппировать',disabled:roots.length<2,onSelect:()=>command(m.groupSelection)},
    {id:'ungroup',label:'Вынести содержимое frame',disabled:selection.length!==1||nodes[0]?.kind!=='frame',onSelect:()=>command(m.ungroupSelection)},
    {id:'front',label:'На передний план',onSelect:()=>command(s=>m.orderSelection(s,'front'))},
    {id:'back',label:'На задний план',onSelect:()=>command(s=>m.orderSelection(s,'back'))},
    {id:'detach',label:'Вынести на страницу',onSelect:()=>command(s=>m.reparent(s,null))},
    {id:'delete',label:'Удалить',danger:true,onSelect:()=>command(m.deleteSelection)}
   ]}/>
  </header>
  {selection.length?<>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Position</Text><div className="sandbox-align-tools">
    {(['left','center-x','right','top','center-y','bottom'] as const).map((alignment,index)=><IconButton key={alignment} aria-label={'Выровнять '+alignment} title={alignment} variant="ghost" icon={icon('inspector-position',index?'imgIcon'+index:'imgIcon')} disabled={!enabled||roots.length<2} onClick={()=>command(s=>m.alignSelection(s,alignment))}/>)}
   </div><div className="sandbox-property-grid">{number('x','X · локальная')}{number('y','Y · локальная')}{number('rotation','Угол, °')}
    <Button variant="ghost" disabled={!canEdit} iconLeft={icon('inspector-position','imgIcon8')} onClick={()=>command(s=>{let next=s;for(const id of s.selection){const node=m.activePage(s).nodes.find(n=>n.id===id)!;next=m.setProperties(next,{rotation:node.rotation+90},[id]);}return next;})}>+90°</Button>
   </div></section>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Layout</Text><div className="sandbox-property-grid">{number('width','W · ширина')}{number('height','H · высота')}</div><div className="sandbox-command-row">
    <Button fullWidth title="Распределить X" variant="ghost" disabled={!enabled||roots.length<3} onClick={()=>command(s=>m.distributeSelection(s,'x'))}>Распределить X</Button><Button fullWidth title="Распределить Y" variant="ghost" disabled={!enabled||roots.length<3} onClick={()=>command(s=>m.distributeSelection(s,'y'))}>Распределить Y</Button>
   </div><Checkbox id="sandbox-clip" label="Clip content" checked={!!clip.value} indeterminate={clip.mixed} disabled={!enabled||!frames.length||!frames.some(id=>m.available(page,id))} onCheckedChange={clip=>command(s=>m.setProperties(s,{clip},frames))}/></section>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Appearance</Text><div className="sandbox-property-grid">{number('opacity','Непрозрачность, %',selection,100)}{number('radius','Радиус',nodes.filter(node=>['frame','rect'].includes(node.kind)).map(node=>node.id))}</div></section>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Typography</Text>{textIds.length?<>
    <Select id="sandbox-font-family" label="Семейство" value={font.mixed?'':font.value} disabled={!canEdit} options={[{value:'',label:'Mixed',disabled:true},...['Inter','Georgia','monospace'].map(value=>({value,label:value}))]} onValueChange={value=>command(s=>m.setProperties(s,{fontFamily:value as m.SceneNode['fontFamily']},textIds))}/>
    <div className="sandbox-property-grid"><Select id="sandbox-font-weight" label="Начертание" value={weight.mixed?'':String(weight.value)} disabled={!canEdit} options={[{value:'',label:'Mixed',disabled:true},{value:'400',label:'Regular'},{value:'600',label:'Semibold'},{value:'700',label:'Bold'}]} onValueChange={value=>command(s=>m.setProperties(s,{fontWeight:Number(value) as 400|600|700},textIds))}/>{number('fontSize','Размер текста',textIds)}{number('lineHeight','Межстрочный, px',textIds)}</div>
    <div className="sandbox-command-row">{(['left','center','right'] as const).map((align,index)=><IconButton key={align} aria-label={'Текст '+align} selected={textIds.every(id=>page.nodes.find(n=>n.id===id)?.align===align)} aria-pressed={textIds.every(id=>page.nodes.find(n=>n.id===id)?.align===align)} variant="ghost" icon={icon('inspector-typography','imgIcon'+(5+index))} disabled={!canEdit} onClick={()=>command(s=>m.setProperties(s,{align},textIds))}/>)}</div><details><summary><Text variant="label/small">Редактировать текст</Text></summary>{draft('text','Текст',textIds,true)}</details>
   </>:<Text as="p" variant="body/small">Выберите текстовый слой.</Text>}</section>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Fill</Text>{draft('fill','Цвет HEX')}<div className="sandbox-color-proof" aria-label="Применённые цвета">{[...new Set(nodes.map(node=>node.fill))].map(color=><span key={color} style={{backgroundColor:color}} title={color}/>)}</div></section>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Stroke</Text>{draft('stroke','Цвет обводки',shapeIds)}{number('strokeWidth','Толщина обводки',shapeIds)}</section>
   <section className="sandbox-properties-section">{draft('name','Имя слоя')}<div className="sandbox-choice-row">
    <Checkbox id="sandbox-visible" label="Видимый" checked={!!visible.value} indeterminate={visible.mixed} disabled={!canEdit} onCheckedChange={visible=>command(s=>m.setProperties(s,{visible}))}/>
    <Checkbox id="sandbox-locked" label="Заблокирован" checked={!!locked.value} indeterminate={locked.mixed} disabled={!enabled} onCheckedChange={locked=>command(s=>m.setProperties(s,{locked}))}/>
   </div></section>
   <section className="sandbox-properties-section"><Text as="h2" variant="label/default">Export</Text><Button fullWidth title="JSON документа" disabled={!enabled} onClick={onExport}>JSON документа</Button></section>
  </>:<section className="sandbox-properties-section"><Text as="p" variant="body/small">Выберите слой в дереве или на холсте. Все свойства берутся из реальной модели.</Text><Button onClick={onFit}>Показать все объекты</Button></section>}
 </div>;
}
