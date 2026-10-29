import React from 'react';
type Entry={id:string;kind:string;runtime:{status:string;exports:string[]};specification:{status:string};tokens:{status:string};contract:{status:string};preview:{status:string};visualReview:{status:string};platformReview:{status:string}};
type Catalog={counts:{entries:number;publicModules:number;contracts:number;tokenBranches:number;studioPreviews:number};entries:Entry[]};
export function CoverageCatalog({catalog}:{catalog:Catalog}){
 return <details className="owner-catalog"><summary>Каталог покрытия</summary>
  <p>Наличие спецификации, API или preview не означает завершённую приёмку.</p>
  <p>{catalog.counts.publicModules} public modules · {catalog.counts.contracts} contracts · {catalog.counts.tokenBranches} token branches · {catalog.counts.studioPreviews} Studio previews</p>
  <a href="/component-catalog.json" download="seda-component-catalog.json">Скачать каталог JSON</a>
  <ul aria-label="Покрытие компонентов">{catalog.entries.map(entry=><li key={entry.id} data-component-id={entry.id}>
   <strong>{entry.id}</strong><small>{entry.kind}</small>
   <dl><dt>Runtime</dt><dd>{entry.runtime.status}</dd><dt>Contract</dt><dd>{entry.contract.status}</dd><dt>Studio preview</dt><dd>{entry.preview.status}</dd><dt>Tokens</dt><dd>{entry.tokens.status}</dd><dt>Visual review</dt><dd>{entry.visualReview.status}</dd><dt>Platform review</dt><dd>{entry.platformReview.status}</dd></dl>
  </li>)}</ul>
 </details>;
}
