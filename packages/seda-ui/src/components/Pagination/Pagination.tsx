import {forwardRef} from 'react';
import type {PaginationProps} from './Pagination.types';
import {useSedaSize} from '../../foundation/SedaProvider';
import {cx} from '../../utils/classNames';
import {Icon} from '../Icon';

/** Controlled page navigation; the host owns loading, errors and dataset. */
export const Pagination=forwardRef<HTMLElement,PaginationProps>(function Pagination({label,page,pageCount,onPageChange,variant='numbered',size:sizeProp,disabled=false,loading=false,retainFocusOnDisabled=false,previousLabel='Предыдущая страница',nextLabel='Следующая страница',pageLabel=(n)=>`Страница ${n}`,className,...props},ref){
 const size=useSedaSize(sizeProp);
 if(!label?.trim() || !previousLabel?.trim() || !nextLabel?.trim() || !Number.isSafeInteger(pageCount) || pageCount<0 || !Number.isSafeInteger(page) || page<1 || page>Math.max(1,pageCount) || typeof onPageChange!=='function' || !['numbered','prev-next'].includes(variant) || typeof pageLabel!=='function') throw new TypeError('Pagination requires a name, valid page bounds and onPageChange');
 const blocked=disabled||loading||pageCount===0;
 const unavailable=(value:boolean)=>retainFocusOnDisabled?{'aria-disabled':value||undefined}:{disabled:value};
 const change=(next:number,unavailable:boolean)=>{if(!unavailable&&next!==page)onPageChange(next)};
 const visible=new Set([1,pageCount,...Array.from({length:5},(_,i)=>page+i-2).filter(n=>n>=1&&n<=pageCount)]);
 const pages=[...visible].filter(n=>n>=1&&n<=pageCount).sort((a,b)=>a-b);
 const items:(number|string)[]=[];for(const n of pages){const last=items[items.length-1];if(typeof last==='number'&&n-last===2)items.push(last+1);else if(typeof last==='number'&&n-last>2)items.push(`gap-${last}-${n}`);items.push(n)}
 return <nav {...props} ref={ref} aria-label={label} aria-busy={loading||undefined} className={cx('seda-pagination',className)} data-size={size}>
  <button type="button" className="seda-pagination__arrow" aria-label={previousLabel} {...unavailable(blocked||page===1)} onClick={()=>change(page-1,blocked||page===1)}><Icon name="arrow-left"/></button>
  {variant==='numbered'&&items.map(item=>typeof item==='number'?<button key={item} type="button" aria-label={pageLabel(item)} aria-current={item===page?'page':undefined} {...unavailable(blocked)} onClick={()=>change(item,blocked)}>{item}</button>:<span className="seda-pagination__gap" aria-hidden="true" key={item}>…</span>)}
  <button type="button" className="seda-pagination__arrow" aria-label={nextLabel} {...unavailable(blocked||page>=pageCount)} onClick={()=>change(page+1,blocked||page>=pageCount)}><Icon name="arrow-right"/></button>
 </nav>;
});
