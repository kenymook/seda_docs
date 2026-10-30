import React from 'react';
import {Breadcrumbs,Button,Checkbox,Chip,EmptyState,Icon,Pagination,Radio,Select,TextField,Toggle} from '@seda-ai/ui';

export type StudioPreviewProps={path:string;label:string;variables:Record<string,string>};
type PreviewRenderer=(props:StudioPreviewProps)=>React.ReactNode;
function ChipPreview({path}:StudioPreviewProps){
 const [visible,setVisible]=React.useState(true);
 const [expanded,setExpanded]=React.useState(false);
 const popupId=React.useId();
 if(path.startsWith('chip/control/'))return <div><Chip label="Фильтр" control="expand" expanded={expanded} controlsId={popupId} onOpenChange={setExpanded} disabled={path.endsWith('/disabled')}/><div id={popupId} hidden={!expanded}>Параметры фильтра</div></div>;
 return visible?<Chip label="Активный фильтр" control="remove" removeLabel="Удалить фильтр" onRemove={()=>setVisible(false)} disabled={path.endsWith('/disabled')} variant={path.endsWith('/selected')?'selected':path.endsWith('/filled')?'filled':'default'}/>:<Button variant="secondary" onClick={()=>setVisible(true)}>Восстановить фильтр</Button>;
}
function PaginationPreview({path}:StudioPreviewProps){
 const [page,setPage]=React.useState(3);
 return <Pagination label="Страницы проектов" page={page} pageCount={9} onPageChange={setPage} disabled={path.endsWith('/disabled')}/>;
}
// One literal registry is used by Studio and inspected by the build-time catalogue.
// Registration means a live adapter exists, not that every state is accepted.
export const studioPreviews={
 'empty-state':()=> <EmptyState size="s" reason="no-results" title="Ничего не найдено" description="Измените запрос или фильтры." media={<Icon name="search"/>}/>,
 'pagination':(props:StudioPreviewProps)=><PaginationPreview {...props}/>,
 'chip':(props:StudioPreviewProps)=><ChipPreview {...props}/>,
 'breadcrumbs':({path}:StudioPreviewProps)=><Breadcrumbs label="Путь документа" expandLabel="Показать весь путь" items={[{id:'workspace',label:'Atlas',href:'#atlas',disabled:path.endsWith('/disabled'),icon:<Icon name="monitor"/>},{id:'project',label:'Проекты',href:'#projects',disabled:path.endsWith('/disabled')},{id:'current',label:'Документ'}]}/>,
 'select':({path,label}:StudioPreviewProps)=><Select label={label} options={[{value:'all',label:'Все роли'},{value:'editor',label:'Редактор'},{value:'viewer',label:'Наблюдатель'}]} defaultValue="all" disabled={path.endsWith('/disabled')} readOnly={path.endsWith('/read-only')} loading={path.endsWith('/loading')} warningText={path.endsWith('/warning')?'Проверьте доступ':undefined} successText={path.endsWith('/success')?'Доступ подтверждён':undefined} errorText={path.endsWith('/error')?'Проверьте значение':undefined}/>,
 'text-field':({path,label}:StudioPreviewProps)=><TextField label={label} defaultValue="Atlas" disabled={path.endsWith('/disabled')} errorText={path.endsWith('/error')?'Проверьте значение':undefined} warningText={path.endsWith('/warning')?'Требуется проверка':undefined} successText={path.endsWith('/success')?'Значение подтверждено':undefined}/>,
 'checkbox':({path,label}:StudioPreviewProps)=><Checkbox label={label} defaultChecked={path.includes('/checked')||path.includes('/indeterminate')} disabled={path.endsWith('/disabled')} errorText={path.endsWith('/error')?'Проверьте значение':undefined}/>,
 'radio':({path,label}:StudioPreviewProps)=><Radio label={label} options={[{value:'one',label:'Первый'},{value:'two',label:'Второй'}]} defaultValue="one" disabled={path.endsWith('/disabled')}/>,
 'toggle':({path,label}:StudioPreviewProps)=><Toggle label={label} defaultChecked={path.includes('/on/')} disabled={path.endsWith('/disabled')}/>,
 'button':({path,label,variables}:StudioPreviewProps)=>{
  const parts=path.split('/');
  const variant=parts[1]==='primary'?'primary':parts[1]==='danger'?'destruction':parts[2]==='secondary'?'secondary':parts[2]==='outline'?'outline':parts[2]==='ghost'?'ghost':'text';
  return <Button variant={variant} disabled={path.endsWith('/disabled')} loading={path.endsWith('/loading')} style={variables as React.CSSProperties}>{label}</Button>;
 },
} satisfies Record<string,PreviewRenderer>;
export function renderStudioPreview(name:string,props:StudioPreviewProps){
 const renderer=Object.hasOwn(studioPreviews,name)?studioPreviews[name as keyof typeof studioPreviews]:undefined;
 return renderer?renderer(props):null;
}
