import React from 'react';
import {Select} from '@seda-ai/ui';

const states = ['default', 'hover', 'focus', 'disabled', 'error'] as const;

/** Fixed visual fixtures use the installed Select and its existing token bindings.
 * Pointer/keyboard behavior is exercised in the separate live specimen. */
export function SelectStateBoard({onPick}: {onPick: (state: string) => void}) {
  return <section className="studio-select-states" aria-label="Select states">
    <header><h2>States</h2><p>Состояния рядом · интерактивный Select выше</p></header>
    <div className="studio-select-state-grid">{states.map(state => <article key={state} data-preview-state={state}>
      <button className="studio-state-label" onClick={()=>onPick(state)} title={'Редактировать '+state}>{state}<span aria-hidden="true">↗</span></button>
      <Select label="Роль" aria-label={'Preview '+state} defaultValue="editor" options={[{value:'editor',label:'Редактор'},{value:'viewer',label:'Наблюдатель'}]} state={state==='hover'||state==='focus'?state:'default'} disabled={state==='disabled'} errorText={state==='error'?'Выберите доступную роль':undefined} tabIndex={-1}/>
    </article>)}</div>
    <details className="studio-state-gaps"><summary>Другие состояния токенов</summary><p>warning, success, active, read-only и loading есть в каталоге токенов, но отдельное поведение этих состояний в текущем Select не реализовано. Нативный список зависит от ОС. Здесь показаны только готовые состояния; hover и focus зафиксированы для сравнения.</p></details>
  </section>;
}
