import type{SearchLabels,SearchMatch}from'@seda-ai/ui';
/** Application copy and local source rules; the library does not rank or query documents. */
export const referenceSearchLabels:SearchLabels={clear:'Очистить поиск',empty:'Введите запрос или выберите доступный результат.',typing:'Запрос изменён. Ожидание актуальных результатов…',loading:'Поиск…',noResults:'Ничего не найдено. Измените запрос или очистите поиск.',retry:'Повторить поиск',resultCount:count=>'Найдено: '+count};
export const normalizeSearchQuery=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().trim();
/** Highlight only an exact original-string range; normalization/ranking does not rewrite text. */
export function literalSearchMatches(title:string,query:string):readonly SearchMatch[]|undefined{const index=query?title.indexOf(query):-1;return index<0?undefined:[{start:index,end:index+query.length}];}
