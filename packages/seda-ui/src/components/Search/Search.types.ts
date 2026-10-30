import type {HTMLAttributes,MouseEvent,ReactNode}from'react';
import type {SedaSize}from'../../types';
export interface SearchMatch{start:number;end:number}
type SearchResultBase={id:string;title:string;subtitle?:string;section?:string;icon?:ReactNode;disabled?:boolean;disabledReason?:string;matches?:readonly SearchMatch[]};
export type SearchResult=SearchResultBase&({kind:'command';href?:never;target?:never}|{kind:'navigation';href:string;target?:'_self'|'_blank'});
export interface SearchLabels{clear:string;empty:string;typing:string;loading:string;noResults:string;retry:string;resultCount:(count:number)=>string}
type QueryOwner=({query:string;defaultQuery?:never}|{query?:never;defaultQuery?:string})&{onQueryChange:(query:string,details:{reason:'input'|'clear';composing:boolean})=>void};
type Appearance={variant?:'inline';onDismiss?:never}|{variant:'overlay'|'command-palette';onDismiss:()=>void};
export type SearchData={resultsFor:string;queryKey:string}&({status:'ready';results:readonly SearchResult[]}|{status:'idle'|'typing'|'loading';results?:never}|({status:'error';errorText:string}&({onRetry:()=>void;unrecoverableReason?:never}|{onRetry?:never;unrecoverableReason:string})));
type ResultMode=Appearance&{mode?:'results';queryKey:string;data:SearchData;onSelectResult:(result:SearchResult,event:MouseEvent<HTMLButtonElement>|MouseEvent<HTMLAnchorElement>)=>void;resultsId?:never;resultCount?:never};
type FilterMode={mode:'filter';variant?:'inline';resultsId:string;resultCount:number;data?:never;queryKey?:never;onDismiss?:never;onSelectResult?:never};
/** Query and result UI. Transport, ranking, filtering and overlay/dialog ownership remain with the caller. */
export type SearchProps=Omit<HTMLAttributes<HTMLDivElement>,'children'|'onChange'|'defaultValue'|'onSubmit'> & QueryOwner & (ResultMode|FilterMode) & {
 label:string;labels:SearchLabels;size?:SedaSize;placeholder?:string;disabled?:boolean;searchIcon?:ReactNode;
 onSubmitQuery?:(query:string)=>void;
};
