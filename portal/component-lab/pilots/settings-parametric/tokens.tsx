import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Icon, Select, SedaProvider, TextField, TopBar } from '@seda-ai/ui';
import { componentCoverage, provenance, tokens } from 'seda:catalog';
import { displayOklch, hexToOklch, pickerHex } from './owner-color.mjs';
import { applyWorkbenchEdits, colorCatalog, directAlias, resolvedToken, tokenKey, tokenRelations } from './token-workbench-model.mjs';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@seda-ai/ui/styles.css';
import './tokens.css';

type Layer = 'foundation' | 'semantic' | 'components';
type Theme = 'Light' | 'Dark';
type TokenEntry = { collection: Layer; mode: string; path: string; key: string; authored: string; group: string; component: string | null };
const catalog = colorCatalog(tokens) as TokenEntry[];
const byKey = new Map(catalog.map(item => [item.key, item]));
const storageKey = 'seda-token-workbench-v1';
const selectDefaultBorder = byKey.get(tokenKey('components', 'Mode 1', 'select/border/default'))!;
const selectBorderRoles = [
  { path: 'border/subtle', title: 'Почти незаметная', note: 'Минимальный контраст' },
  { path: 'border/default', title: 'Мягкая', note: 'Светлее исходной' },
  { path: 'border/strong', title: 'Средняя', note: 'Заметнее на фоне' },
  { path: 'border/field/default', title: 'Исходная', note: 'Роль по умолчанию' },
];

function restoreEdits(): Record<string, string> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved?.sourceTokensSha256 !== provenance.tokensSha256 || !saved.edits || typeof saved.edits !== 'object') return {};
    return Object.fromEntries(Object.entries(saved.edits).filter(([key, value]) => byKey.has(key) && typeof value === 'string' && value.length <= 120)) as Record<string, string>;
  } catch { return {}; }
}
function restoreValidEdits(): Record<string, string> {
  const edits = restoreEdits();
  try { applyWorkbenchEdits(tokens, edits, catalog); return edits; }
  catch { return {}; }
}

function TokenWorkbench() {
  const [layer, setLayer] = useState<Layer>('foundation');
  const [theme, setTheme] = useState<Theme>('Light');
  const [component, setComponent] = useState('select');
  const [group, setGroup] = useState('blue');
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [showAllDependents, setShowAllDependents] = useState(false);
  const [initialEdits] = useState<Record<string, string>>(restoreValidEdits);
  const [edits, setEdits] = useState<Record<string, string>>(initialEdits);
  const [appliedEdits, setAppliedEdits] = useState<Record<string, string>>(initialEdits);
  const [message, setMessage] = useState('Черновик хранится в браузере. Применение меняет только предпросмотр.');
  const [compactNav, setCompactNav] = useState(() => window.innerWidth < 700);
  useEffect(() => { const update = () => setCompactNav(window.innerWidth < 700); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update); }, []);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify({ sourceTokensSha256: provenance.tokensSha256, edits })); }, [edits]);

  const draft = useMemo(() => {
    try { return { tokens: applyWorkbenchEdits(tokens, edits, catalog), error: '' }; }
    catch (error) { return { tokens, error: error instanceof Error ? error.message : String(error) }; }
  }, [edits]);
  const applied = useMemo(() => applyWorkbenchEdits(tokens, appliedEdits, catalog), [appliedEdits]);
  const entries = catalog.filter(item => item.collection === layer && (layer !== 'semantic' || item.mode === theme) && (layer !== 'components' || item.component === component));
  const groups = [...new Set(entries.map(item => item.group))];
  const activeGroup = groups.includes(group) ? group : groups[0];
  const shown = entries.filter(item => query.trim()
    ? `${item.path} ${edits[item.key] ?? item.authored}`.toLowerCase().includes(query.trim().toLowerCase())
    : item.group === activeGroup);
  const selected = selectedKey === '__unrelated__' ? undefined : shown.find(item => item.key === selectedKey) ?? shown[0];
  const authored = selected ? edits[selected.key] ?? selected.authored : '';
  const editorValue = selected?.collection === 'foundation' ? displayOklch(authored) ?? authored : authored;
  const resolved = selected ? resolvedToken(draft.tokens, selected, theme) : null;
  const sourceResolved = selected ? resolvedToken(tokens, selected, theme) : null;
  const effectiveColor = draft.error ? sourceResolved?.value : resolved?.value;
  const relations = (selected && !draft.error ? tokenRelations(draft.tokens, catalog, selected, theme) : { sources: [], dependents: [] }) as { sources: TokenEntry[]; dependents: TokenEntry[] };
  const dependents = relations.dependents.length;
  const foundation = catalog.filter(item => item.collection === 'foundation');
  const semantic = catalog.filter(item => item.collection === 'semantic' && item.mode === theme);
  const semanticOptions = semantic.map(item => ({ value: directAlias(item), label: `${item.path} · ${displayOklch(resolvedToken(draft.tokens, item, theme).value)}` }));
  const foundationOptions = foundation.map(item => ({ value: directAlias(item), label: `${item.path} · ${displayOklch(resolvedToken(draft.tokens, item, theme).value)}` }));
  const options = selected?.collection === 'semantic' ? foundationOptions : semanticOptions;
  const linkOptions = options.some(option => option.value === authored) ? options : [{ value: authored, label: `Исходная косвенная ссылка · ${authored}` }, ...options];
  const selectVars = useMemo(() => Object.fromEntries(catalog.filter(item => item.collection === 'components' && item.component === 'select').map(item => [`--${item.path.replaceAll('/', '-')}`, resolvedToken(applied, item, theme).value])), [applied, theme]);
  const sourceSelectVars = useMemo(() => Object.fromEntries(catalog.filter(item => item.collection === 'components' && item.component === 'select').map(item => [`--${item.path.replaceAll('/', '-')}`, resolvedToken(tokens, item, theme).value])), [theme]);
  const selectBorderAlias = appliedEdits[selectDefaultBorder.key] ?? selectDefaultBorder.authored;
  const selectBorderRolePath = selectBorderAlias.slice(1, -1).replaceAll('.', '/');
  const borderRoleChoices = selectBorderRoles.some(role => role.path === selectBorderRolePath) ? selectBorderRoles : [...selectBorderRoles, { path: selectBorderRolePath, title: 'Текущая роль', note: 'Выбрана в инспекторе' }];
  const selectBorderBefore = resolvedToken(tokens, selectDefaultBorder, theme).value;
  const selectBorderAfter = resolvedToken(applied, selectDefaultBorder, theme).value;
  const componentNames = [...new Set(catalog.filter(item => item.collection === 'components').map(item => item.component).filter(Boolean))] as string[];
  const componentCount = entries.length;

  function navigateToEntry(item: TokenEntry) {
    setLayer(item.collection); setComponent(item.component ?? component); setGroup(item.group); setQuery(''); setSelectedKey(item.key); setShowAllDependents(false);
    setMessage(`Показан связанный токен ${item.path}. Его цепочка указана в инспекторе.`);
  }
  function switchLayer(value: Layer) {
    if (value === layer) return;
    const related = [...relations.sources, ...relations.dependents].filter(item => item.collection === value) as TokenEntry[];
    const next = related.find(item => item.component === component) ?? related[0];
    if (next) { navigateToEntry(next); return; }
    setLayer(value); setGroup(value === 'foundation' ? 'blue' : value === 'semantic' ? 'container' : 'surface'); setQuery(''); setSelectedKey('__unrelated__');
    setMessage(`У ${selected?.path ?? 'выбранного токена'} нет связи со слоем «${value === 'foundation' ? 'Палитра' : value === 'semantic' ? 'Семантика' : 'Компоненты'}». Выберите токен в таблице.`);
  }
  function edit(value: string) { if (!selected) return; setEdits(previous => ({ ...previous, [selected.key]: value })); setMessage('Черновик изменён. Примените его для проверки компонента.'); }
  function revert() { if (!selected) return; setEdits(previous => { const next = { ...previous }; delete next[selected.key]; return next; }); }
  function apply() { if (draft.error) { setMessage(draft.error); return; } setAppliedEdits({ ...edits }); setMessage('Черновик применён к предпросмотру. Исходный tokens.json не изменён.'); }
  function reset() { setEdits({}); setAppliedEdits({}); setMessage('Черновик сброшен к исходным токенам.'); }
  function openSelectBorder() { setLayer('components'); setComponent('select'); setGroup('border'); setQuery(''); setSelectedKey(selectDefaultBorder.key); setMessage('Настройка рамки Select: выберите более мягкую роль ниже. Предпросмотр обновится сразу.'); }
  function chooseSelectBorderRole(path: string) {
    const alias = `{${path.replaceAll('/', '.')}}`;
    const update = (previous: Record<string, string>) => { const next = { ...previous }; if (alias === selectDefaultBorder.authored) delete next[selectDefaultBorder.key]; else next[selectDefaultBorder.key] = alias; return next; };
    setEdits(update); setAppliedEdits(update); setGroup('border'); setQuery(''); setSelectedKey(selectDefaultBorder.key);
    setMessage(`Рамка Select теперь использует ${path}. Предпросмотр обновлён; исходный tokens.json не изменён.`);
  }
  function download() {
    if (draft.error) { setMessage(draft.error); return; }
    const content = { schemaVersion: 1, kind: 'seda-token-workbench-draft', sourceTokensSha256: provenance.tokensSha256, edits };
    const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'seda-token-workbench.draft.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const topBarProps = {
    variant: 'application' as const, label: 'SEDA Tokens', size: 'm' as const, gutter: 'wide' as const,
    navigationLabel: 'Рабочие области',
    items: [{ id: 'lab', label: 'Лаборатория', href: './' }, { id: 'owner', label: 'Component Lab', href: './owner.html' }, { id: 'tokens', label: 'Токены', href: './tokens.html', selected: true }],
    brand: <strong className="token-brand"><span>S</span> SEDA AI</strong>, actions: <span className="token-top-note">Система токенов · черновик</span>,
  };

  return <SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m">
    <div className="token-app" data-theme={theme.toLowerCase()}>
      {compactNav ? <TopBar {...topBarProps} navigationPresentation="dialog" navigationTriggerLabel="Разделы" navigationCloseLabel="Закрыть" /> : <TopBar {...topBarProps} />}
      <header className="token-toolbar"><div><h1>Токены SEDA</h1><p>Палитра → семантические роли → компоненты. Меняйте связи и проверяйте результат на настоящих контролах.</p><button type="button" className="token-task-link" onClick={openSelectBorder}>Быстро: сделать рамку Select мягче <span aria-hidden="true">→</span></button></div><div className="token-toolbar-actions"><Select label="Тема" value={theme} options={['Light', 'Dark'].map(value => ({ value, label: value }))} onValueChange={value => { setTheme(value as Theme); setSelectedKey(''); }} /><Button variant="primary" onClick={apply} disabled={!!draft.error}>Применить</Button><Button variant="secondary" onClick={download}>Скачать JSON</Button><Button variant="text" onClick={reset}>Сбросить</Button></div></header>
      <div className="token-status" role="status"><span>{Object.keys(edits).length} изменений в черновике</span><span>{draft.error || message}</span></div>
      <div className="token-layout">
        <nav className="token-rail" aria-label="Слои токенов"><h2>Слои</h2>{([['foundation', '01', 'Палитра', 'Исходные цвета в OKLCH'], ['semantic', '02', 'Семантика', 'Роли для Light и Dark'], ['components', '03', 'Компоненты', 'Части и состояния']] as const).map(([id, order, label, description]) => <button type="button" key={id} className="token-layer" aria-current={layer === id ? 'page' : undefined} onClick={() => switchLayer(id)}><span>{order}</span><strong>{label}</strong><small>{description}</small></button>)}<div className="token-rail-note"><strong>Источник</strong><span>tokens.json · {provenance.tokensSha256.slice(0, 10)}</span><p>Редактор сохраняет локальный черновик. Изменения библиотеки выпускаются отдельно через PR.</p></div></nav>
        <main className="token-main"><div className="token-heading"><div><p className="token-kicker">{layer === 'foundation' ? '01 / FOUNDATION' : layer === 'semantic' ? '02 / SEMANTIC' : '03 / COMPONENTS'}</p><h2>{layer === 'foundation' ? 'Палитра' : layer === 'semantic' ? 'Семантические роли' : `Компонент · ${component}`}</h2><p>{layer === 'foundation' ? 'Редактируйте исходные цвета. Зависимые роли и компоненты пересчитаются вместе с ними.' : layer === 'semantic' ? 'Каждая изменённая роль напрямую связывается с цветом палитры для выбранной темы.' : `Все ${componentCount} цветовых токенов ${component} сгруппированы по частям и состояниям. Изменённые связи ведут к семантическим ролям.`}</p></div>{layer === 'components' && <Select label="Компонент" value={component} options={componentNames.map(value => ({ value, label: value }))} onValueChange={value => { setComponent(String(value)); setGroup('surface'); setSelectedKey('__unrelated__'); setQuery(''); setMessage('Выбран другой компонент. Выберите токен в таблице для просмотра его цепочки.'); }} />}</div>
          {layer === 'components' && component === 'select' && <section className="token-border-task" aria-label="Быстрая настройка рамки Select">
            <div className="token-border-task-head"><div><span className="token-task-kicker">БЫСТРАЯ НАСТРОЙКА · SELECT</span><h3>Цвет рамки</h3><p>Обычное состояние. Выбор меняет только токен <code>select/border/default</code>; фокус, ошибка и другие состояния остаются отдельными.</p></div><span className="token-task-scope">Только Select</span></div>
            <div className="token-border-task-body"><div className="token-border-choice-area"><h4>Выберите контраст</h4><div className="token-border-choices">{borderRoleChoices.map(role => {
              const lightRole = byKey.get(tokenKey('semantic', 'Light', role.path));
              const darkRole = byKey.get(tokenKey('semantic', 'Dark', role.path));
              if (!lightRole || !darkRole) return null;
              return <button type="button" className="token-border-choice" key={role.path} aria-label={`Рамка Select: ${role.title}, ${role.path}`} aria-pressed={selectBorderRolePath === role.path} onClick={() => chooseSelectBorderRole(role.path)} disabled={!!draft.error}>
                <span className="token-border-choice-label"><strong>{role.title}</strong><small>{role.note}</small></span><span className="token-border-choice-swatches"><i title="Light" style={{ borderColor: resolvedToken(applied, lightRole, 'Light').value }} /><i title="Dark" style={{ borderColor: resolvedToken(applied, darkRole, 'Dark').value }} /></span><code>{role.path}</code>
              </button>;
            })}</div><p className="token-border-note">Роль имеет свои значения для Light и Dark. Нажатие сразу обновляет живой предпросмотр и локальный черновик.</p></div>
              <div className="token-border-comparison"><h4>До → сейчас</h4><div className="token-border-demo"><span>Исходная рамка · {displayOklch(selectBorderBefore)}</span><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...sourceSelectVars, display: 'contents' } as React.CSSProperties}><Select label="Было" options={[{ value: 'all', label: 'Все роли' }]} defaultValue="all" /></SedaProvider></div><div className="token-border-demo token-border-demo--current"><span>Текущий выбор · {displayOklch(selectBorderAfter)}</span><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...selectVars, display: 'contents' } as React.CSSProperties}><Select label="Сейчас" options={[{ value: 'all', label: 'Все роли' }]} defaultValue="all" /></SedaProvider></div><button type="button" className="token-border-revert" onClick={() => chooseSelectBorderRole('border/field/default')} disabled={selectBorderAlias === selectDefaultBorder.authored}>Вернуть только рамку Select</button></div>
            </div>
          </section>}
          {layer === 'components' && component === 'select' && <section className="token-preview" aria-label="Предпросмотр Select"><div><h3>Остальные состояния Select</h3><p>Контрактный компонент @seda-ai/ui. Состояния управляются реальным Select; вид нативного списка зависит от ОС.</p></div><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...selectVars, display: 'contents' } as React.CSSProperties}><div className="token-preview-grid"><Select label="Обычный" options={[{ value: 'all', label: 'Все роли' }, { value: 'owner', label: 'Владелец' }]} defaultValue="all" /><Select label="Фокус" state="focus" options={[{ value: 'all', label: 'Все роли' }]} placeholder="Выберите роль" /><Select label="Ошибка" errorText="Проверьте значение" options={[{ value: 'all', label: 'Все роли' }]} placeholder="Выберите роль" /><Select label="Недоступен" disabled options={[{ value: 'all', label: 'Все роли' }]} defaultValue="all" /></div></SedaProvider></section>}
          {layer === 'components' && component !== 'select' && <div className="token-scope">Токены компонента доступны для настройки. Отдельный предпросмотр состояний пока проверен для Select.</div>}
          <div className="token-list-toolbar"><Select label="Группа" value={activeGroup} options={groups.map(value => ({ value, label: value }))} onValueChange={value => { setGroup(String(value)); setSelectedKey('__unrelated__'); setQuery(''); setMessage('Группа изменена. Выберите токен в таблице.'); }} /><TextField label="Поиск по токенам" value={query} onChange={event => { setQuery(event.target.value); setSelectedKey('__unrelated__'); }} placeholder="Путь или ссылка" /><span>{shown.length} из {entries.length}</span></div>
          <div className="token-table" role="table" aria-label="Токены выбранного слоя"><div className="token-table-head" role="row"><span role="columnheader">Токен</span><span role="columnheader">Связь / значение</span><span role="columnheader">Цвет</span></div>{shown.map(item => { const value = resolvedToken(draft.tokens, item, theme).value; const changed = Object.prototype.hasOwnProperty.call(edits, item.key); const authoredValue = edits[item.key] ?? item.authored; return <button type="button" role="row" key={item.key} className="token-row" aria-selected={selected?.key === item.key} onClick={() => { setSelectedKey(item.key); setShowAllDependents(false); setMessage(`Выбран токен ${item.path}. Его цепочка указана в инспекторе.`); }}><span role="cell"><strong>{item.path.split('/').slice(layer === 'components' ? 1 : 0).join('/')}</strong>{changed && <em>изменён</em>}</span><span role="cell">{item.collection === 'foundation' ? displayOklch(authoredValue) ?? authoredValue : authoredValue}</span><span role="cell"><i style={{ background: value }} /><small>{displayOklch(value) ?? value}</small></span></button>; })}{!shown.length && <p className="token-empty">Токены не найдены.</p>}</div>
        </main>
        <aside className="token-inspector" aria-label="Редактор токена">
          <h2>Инспектор токена</h2>
          {selected ? <>
            <p className="token-inspector-path">{selected.collection}/{selected.mode}/{selected.path}</p>
            <div className="token-inspector-color"><i style={{ background: effectiveColor }} /><div><strong>{displayOklch(effectiveColor ?? '') ?? 'Ошибка разрешения'}</strong><small>{editorValue}</small></div></div>
            <dl><dt>Источник</dt><dd>{selected.authored}</dd><dt>Зависимых токенов</dt><dd>{dependents}</dd><dt>Цепочка</dt><dd>{resolved?.chain.join(' → ')}</dd></dl>
            <section className="token-relations" aria-label="Связи выбранного токена">
              <h3>Переходы по связям</h3>
              {relations.sources.length > 0 && <><p>Источники значения</p><div className="token-relation-list">{relations.sources.map(item => <button type="button" key={item.key} onClick={() => navigateToEntry(item)}><span>{item.collection === 'foundation' ? 'Палитра' : 'Семантика'}</span><strong>{item.path}</strong></button>)}</div></>}
              <p>Зависимые токены · {dependents}</p>
              {dependents > 0 ? <><div className="token-relation-list">{relations.dependents.slice(0, showAllDependents ? undefined : 6).map(item => <button type="button" key={item.key} onClick={() => navigateToEntry(item)}><span>{item.collection === 'components' ? `Компонент · ${item.component}` : 'Семантика'}</span><strong>{item.path}</strong></button>)}</div>{dependents > 6 && <button type="button" className="token-show-all" onClick={() => setShowAllDependents(value => !value)}>{showAllDependents ? 'Свернуть список' : `Показать все ${dependents}`}</button>}</> : <small>В выбранной теме зависимых токенов нет.</small>}
            </section>
            <div className="token-editor"><h3>{selected.collection === 'foundation' ? 'Исходный цвет' : 'Связь токена'}</h3>{selected.collection === 'foundation' ? <><TextField label="OKLCH" value={editorValue} onChange={event => edit(event.target.value)} placeholder="oklch(60% 0.15 240)" /><label className="token-visual-picker">Выбрать визуально <input type="color" aria-label="Выбрать цвет палитры" value={pickerHex(effectiveColor ?? '') ?? '#000000'} onChange={event => edit(hexToOklch(event.target.value) ?? event.target.value)} /></label></> : <Select label={selected.collection === 'semantic' ? 'Цвет палитры' : 'Семантическая роль'} value={authored} options={linkOptions} onValueChange={value => edit(String(value))} />}{selected.collection === 'semantic' && !authored.startsWith('{color.') && <p>Исходная роль связана косвенно. Выберите цвет палитры, чтобы установить прямую связь.</p>}<Button variant="text" onClick={revert} disabled={!Object.prototype.hasOwnProperty.call(edits, selected.key)}>Вернуть исходное значение</Button></div>
          </> : <p>Выберите токен в таблице. Переходы между слоями следуют только существующим связям.</p>}
          <div className="token-inspector-footer"><strong>Публичная библиотека</strong><span>{componentCoverage.publicComponents.length} компонентов · {componentCoverage.contractComponents.length} исполняемых контрактов</span></div>
        </aside>
      </div>
    </div>
  </SedaProvider>;
}

createRoot(document.getElementById('root')!).render(<TokenWorkbench />);
