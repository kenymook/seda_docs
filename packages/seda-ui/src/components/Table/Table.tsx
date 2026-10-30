import {Fragment,useEffect,useId,useRef} from 'react';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {useSedaConfiguration} from '../../foundation/SedaProvider';
import {Checkbox} from '../Checkbox';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Pagination} from '../Pagination';
import {cx} from '../../utils/classNames';
import type {TableProps} from './Table.types';

const nonempty=(value:unknown):value is string=>typeof value==='string'&&!!value.trim();
function keys(values:readonly string[]|undefined,name:string){
  if(values&&(!Array.isArray(values)||values.some(v=>!nonempty(v))||new Set(values).size!==values.length))throw new TypeError('Table '+name+' requires unique nonempty string keys');
}

export function Table<Row>({label,columns,data,rowKey,rowLabel,density='medium',striped=false,bordered=false,fixedHeader=false,maxHeight,minWidth,
  sort=null,onSortChange,selectedRowKeys,onSelectionChange,selectionLabel='Выбрать строки на текущей странице',isRowDisabled,
  expandedRowKeys,onExpandedChange,renderExpanded,rowActions,actionsLabel='Действия',toolbar,footer,pagination,
  loading=false,loadingLabel='Загрузка данных',emptyState='Нет данных',errorState,onRetry,retryLabel='Повторить',
  id,className,style,onFocusCapture,onBlurCapture,...props}:TableProps<Row>){
  const generated=useId(),scope=id??'seda-table-'+generated.replace(/:/g,''),body=useRef<HTMLTableSectionElement>(null),reserved=useRef(0),reservedColumns=useRef(new Map<string,number>()),root=useRef<HTMLDivElement>(null),scroll=useRef<HTMLDivElement>(null),ownedFocus=useRef(false),lastFocus=useRef<HTMLElement|null>(null);
  const {controlSize,textScale}=useSedaConfiguration();
  const hasError=errorState!==undefined&&errorState!==null&&errorState!==false;
  const selection=selectedRowKeys!==undefined,expansion=renderExpanded!==undefined;
  if(!nonempty(label)||!Array.isArray(columns)||!columns.length||!Array.isArray(data)||typeof rowKey!=='function')throw new TypeError('Table requires label, columns, data and stable rowKey');
  if(!['compact','medium','comfortable'].includes(density)||![loading,striped,bordered,fixedHeader].every(v=>typeof v==='boolean')||!nonempty(loadingLabel)||!nonempty(selectionLabel)||!nonempty(actionsLabel)||!nonempty(retryLabel))throw new TypeError('Unsupported Table presentation or labels');
  if(selection!==(onSelectionChange!==undefined)||(onSelectionChange!==undefined&&typeof onSelectionChange!=='function'))throw new TypeError('Table selection requires controlled selectedRowKeys and onSelectionChange');
  if(expansion!==(expandedRowKeys!==undefined)||expansion!==(onExpandedChange!==undefined)||expansion&&(typeof renderExpanded!=='function'||typeof onExpandedChange!=='function'))throw new TypeError('Table expansion requires renderExpanded, expandedRowKeys and onExpandedChange');
  if((selection||expansion)&&typeof rowLabel!=='function')throw new TypeError('Selectable/expandable Table requires rowLabel');
  keys(selectedRowKeys,'selection');keys(expandedRowKeys,'expansion');
  const columnKeys=new Set<string>();
  for(const column of columns){
    if(!nonempty(column.key)||!nonempty(column.header)||columnKeys.has(column.key)||typeof column.render!=='function'||!['text','numeric','status','date','link','avatar','custom','actions'].includes(column.type)||column.align!==undefined&&!['start','center','end'].includes(column.align))throw new TypeError('Invalid or duplicate Table column');
    if(column.type==='actions'&&column.sortable)throw new TypeError('Table actions are not sortable');
    if(column.sortable&&typeof onSortChange!=='function')throw new TypeError('Sortable Table requires onSortChange; caller owns data order');
    if(column.sortable!==undefined&&typeof column.sortable!=='boolean')throw new TypeError('Table sortable must be boolean');
    if(column.type==='actions'&&column!==columns[columns.length-1])throw new TypeError('Table actions column must be last');
    columnKeys.add(column.key);
  }
  if(sort&&(!columns.some(c=>c.key===sort.key&&c.sortable)||!['ascending','descending'].includes(sort.direction)))throw new TypeError('Unsupported Table sort');
  if(pagination&&(![pagination.page,pagination.pageSize,pagination.total].every(Number.isSafeInteger)||pagination.page<1||pagination.pageSize<1||pagination.total<0||typeof pagination.onPageChange!=='function'))throw new TypeError('Invalid controlled Table pagination');
  const rows=data.map(row=>({row,key:rowKey(row),label:rowLabel?.(row),disabled:!!isRowDisabled?.(row)}));
  keys(rows.map(r=>r.key),'data');
  if((selection||expansion)&&rows.some(r=>!nonempty(r.label)))throw new TypeError('Table rowLabel must be nonempty');
  const eligible=rows.filter(r=>!r.disabled),selected=new Set(selectedRowKeys),expanded=new Set(expandedRowKeys);
  const visibleSelected=eligible.filter(r=>selected.has(r.key)).length,busy=loading||hasError;
  const headerKeys=[...(selection?['$selection']:[]),...(expansion?['$expansion']:[]),...columns.map(c=>'column:'+c.key),...(rowActions?['$actions']:[])];
  const headerWidths=[...(selection?[undefined]:[]),...(expansion?[undefined]:[]),...columns.map(c=>c.width),...(rowActions?[undefined]:[])];
  const headerSignature=JSON.stringify(headerKeys);
  useEffect(()=>{
    if(hasError||!data.length||!body.current)return;
    const node=body.current,table=node.closest('table'),measure=()=>{reserved.current=node.getBoundingClientRect().height;const cells=table?.querySelectorAll(':scope>thead>tr>th');if(cells?.length===headerKeys.length)reservedColumns.current=new Map(headerKeys.map((key,i)=>[key,cells![i]!.getBoundingClientRect().width]));};measure();
    if(typeof ResizeObserver==='undefined')return;
    const observer=new ResizeObserver(measure);observer.observe(node);if(table){observer.observe(table);table.querySelectorAll(':scope>thead>tr>th').forEach(cell=>observer.observe(cell));}return()=>observer.disconnect();
  },[loading,hasError,data.length,density,controlSize,textScale,headerSignature]);
  const totalColumns=columns.length+Number(selection)+Number(expansion)+Number(!!rowActions);
  const state=!hasError&&(data.length>0)?null:hasError?'error':loading?'loading':'empty';
  const frozen=!!state&&headerKeys.every(key=>reservedColumns.current.has(key));
  useBrowserLayoutEffect(()=>{
    if(state&&scroll.current)scroll.current.scrollTop=0;
  },[state]);
  useBrowserLayoutEffect(()=>{
    if(ownedFocus.current&&document.activeElement===document.body&&lastFocus.current){if(!scroll.current?.getClientRects().length){ownedFocus.current=false;return;}if(lastFocus.current.isConnected&&root.current?.contains(lastFocus.current)&&!lastFocus.current.matches(':disabled')&&lastFocus.current.getClientRects().length)lastFocus.current.focus({preventScroll:true});else{scroll.current?.focus({preventScroll:true});ownedFocus.current=false;}}
  });
  const toggleAll=(checked:boolean)=>{
    if(busy||!eligible.length)return;
    const next=new Set(selected);for(const r of eligible)checked?next.add(r.key):next.delete(r.key);onSelectionChange?.([...next]);
  };
  return <div {...props} ref={root} onFocusCapture={event=>{if(root.current?.contains(event.target as Node)){ownedFocus.current=true;lastFocus.current=event.target as HTMLElement;}onFocusCapture?.(event);}} onBlurCapture={event=>{const target=event.target as HTMLElement,next=event.relatedTarget;const unavailable=!target.isConnected||target.matches(':disabled')||!target.getClientRects().length;if(!(next instanceof Node&&root.current?.contains(next))&&(next!==null||!unavailable))ownedFocus.current=false;onBlurCapture?.(event);}} id={id} className={cx('seda-table',className)} data-density={density} data-striped={striped||undefined} data-bordered={bordered||undefined} data-fixed-header={fixedHeader||undefined} data-state={state??(loading?'refreshing':'loaded')} style={style}>
    {toolbar&&<div className="seda-table__toolbar">{toolbar}</div>}
    <div className="seda-table__viewport">
    <div ref={scroll} className="seda-table__scroll" role="region" aria-label={label} tabIndex={0} style={{maxHeight}}>
      <table className="seda-table__element" style={{minWidth,tableLayout:frozen?'fixed':undefined}} aria-label={label} aria-busy={loading||undefined}>
        <colgroup>{headerKeys.map((key,i)=><col key={key} style={{width:frozen?reservedColumns.current.get(key):headerWidths[i]}}/>)}</colgroup>
        <thead><tr>
          {selection&&<th scope="col" className="seda-table__selection"><Checkbox id={scope+'-select-all'} aria-label={selectionLabel} label="" checked={eligible.length>0&&visibleSelected===eligible.length} indeterminate={visibleSelected>0&&visibleSelected<eligible.length} disabled={!eligible.length} readOnly={busy} aria-disabled={busy||undefined} onCheckedChange={toggleAll}/></th>}
          {expansion&&<th scope="col"><span className="seda-table__sr">Подробности строки</span></th>}
          {columns.map(c=><th key={c.key} scope="col" data-align={c.align??(c.type==='numeric'?'end':'start')} aria-sort={c.sortable?(sort?.key===c.key?sort?.direction:'none'):undefined}>
            {c.sortable?<button type="button" className="seda-table__sort" aria-disabled={busy||undefined} onClick={()=>{if(!busy)onSortChange?.(sort?.key!==c.key?{key:c.key,direction:'ascending'}:sort?.direction==='ascending'?{key:c.key,direction:'descending'}:null);}}><span>{c.header}</span><span className="seda-table__sort-icon" data-direction={sort?.key===c.key?sort?.direction:'none'}><Icon name="arrow-chevron-down"/></span></button>:c.header}
          </th>)}
          {rowActions&&<th scope="col"><span className="seda-table__sr">{actionsLabel}</span></th>}
        </tr></thead>
        <tbody ref={body} id={scope+'-body'}>
          {state?<tr><td colSpan={totalColumns} className="seda-table__state" style={{height:reserved.current||undefined}}>
            <div role={state==='error'?'alert':state==='empty'?'status':undefined} aria-hidden={state==='loading'||undefined}>{state==='error'?errorState:state==='loading'?loadingLabel:emptyState}</div>
            {state==='error'&&onRetry&&<Button variant="secondary" disabled={loading} onClick={onRetry}>{retryLabel}</Button>}
          </td></tr>:rows.map(({row,key,label:rowName,disabled},index)=>{
            const detail=scope+'-detail-'+encodeURIComponent(key),trigger=detail+'-trigger',open=expanded.has(key),context={disabled:disabled||loading,loading};
            return <Fragment key={key}><tr data-row-key={key} data-selected={selected.has(key)||undefined} data-disabled={disabled||undefined} data-stripe={index%2===1||undefined}>
              {selection&&<td className="seda-table__selection"><Checkbox label="" aria-label={'Выбрать '+rowName} checked={selected.has(key)} disabled={disabled} readOnly={loading} aria-disabled={loading||undefined} onCheckedChange={checked=>{if(disabled||loading)return;const next=new Set(selected);checked?next.add(key):next.delete(key);onSelectionChange?.([...next]);}}/></td>}
              {expansion&&<td className="seda-table__expansion"><button id={trigger} type="button" aria-label={(open?'Скрыть':'Показать')+' подробности: '+rowName} aria-expanded={open} aria-controls={detail} disabled={disabled} aria-disabled={loading||undefined} onKeyDown={event=>{if(event.key==='Escape'&&open&&!disabled&&!loading){event.preventDefault();event.stopPropagation();onExpandedChange?.([...expanded].filter(value=>value!==key));}}} onClick={()=>{if(disabled||loading)return;const next=new Set(expanded);open?next.delete(key):next.add(key);onExpandedChange?.([...next]);}}><span data-open={open}><Icon name="arrow-chevron-down"/></span></button></td>}
              {columns.map((c,i)=>{const Cell=i===0?'th':'td';return <Cell key={c.key} scope={i===0?'row':undefined} data-type={c.type} data-align={c.align??(c.type==='numeric'?'end':'start')}>{c.render(row,context)}</Cell>;})}
              {rowActions&&<td className="seda-table__actions">{rowActions(row,context)}</td>}
            </tr>{expansion&&<tr hidden={!open} className="seda-table__expanded"><td colSpan={totalColumns}><div id={detail} role="region" aria-label={'Подробности: '+rowName}>{open&&renderExpanded?.(row)}</div></td></tr>}</Fragment>;
          })}
        </tbody>
      </table>
    </div>
      <div className={cx("seda-table__announcement",loading&&data.length>0&&!hasError?"seda-table__loading":"seda-table__sr")} role="status">{loading?loadingLabel:null}</div>
    </div>
    {(footer||pagination)&&<div className="seda-table__footer">{footer}{pagination&&<div className="seda-table__pagination">
      <span role="status"><bdi dir="ltr">{pagination.total&&data.length?(pagination.page-1)*pagination.pageSize+1:0}–{pagination.total&&data.length?Math.min((pagination.page-1)*pagination.pageSize+data.length,pagination.total):0}</bdi>{' из '}<bdi>{pagination.total}</bdi></span>
      <Pagination label={'Страницы: '+label} variant="prev-next" page={pagination.page} pageCount={Math.max(pagination.page,Math.ceil(pagination.total/pagination.pageSize))} onPageChange={pagination.onPageChange} previousLabel="Назад" nextLabel="Далее" disabled={busy||!data.length||pagination.page>Math.max(1,Math.ceil(pagination.total/pagination.pageSize))} loading={loading} retainFocusOnDisabled/>
    </div>}</div>}
  </div>;
}
