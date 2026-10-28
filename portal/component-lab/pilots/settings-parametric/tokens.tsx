import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Checkbox, Icon, Radio, Select, SedaProvider, TextField, Toggle, TopBar } from '@seda-ai/ui';
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
const rolePresets: Record<string, string[]> = {
  border: ['border/subtle', 'border/default', 'border/strong', 'border/field/default', 'border/focus', 'status/danger/border'],
  surface: ['container/subtle/default', 'container/neutral/default', 'surface/base', 'surface/raised', 'surface/sunken', 'status/info/surface'],
  text: ['text/primary', 'text/secondary', 'text/tertiary', 'text/disabled', 'text/inverse', 'text/brand'],
  icon: ['icon/primary', 'icon/secondary', 'icon/tertiary', 'icon/disabled', 'icon/brand', 'icon/accent'],
  focus: ['focus/ring', 'focus/outline', 'focus/ring-strong', 'border/focus'],
};
const groupLabels: Record<string, string> = {};
const friendlyRoles: Record<string, string> = { 'border/subtle': 'Почти незаметная', 'border/default': 'Мягкая рамка', 'border/strong': 'Средняя рамка', 'border/field/default': 'Поле по умолчанию', 'text/primary': 'Основной текст', 'text/secondary': 'Вторичный текст', 'surface/base': 'Базовый фон', 'surface/raised': 'Приподнятая поверхность' };

function recommendedRoles(item: TokenEntry) {
  const path = item.path;
  if (path.includes('/border/')) return rolePresets.border;
  if (path.includes('/surface/') || path.includes('/track/') || path.includes('/thumb/')) return rolePresets.surface;
  if (path.includes('/foreground/') || path.includes('/label/') || path.includes('/helper/')) return rolePresets.text;
  if (path.includes('/icon/') || path.includes('/arrow/') || path.includes('/dot/')) return rolePresets.icon;
  if (path.includes('/focus/')) return rolePresets.focus;
  return rolePresets.surface;
}

function componentColorVars(source: any, name: string, theme: Theme, item?: TokenEntry) {
  const entries = catalog.filter(entry => entry.collection === 'components' && entry.component === name);
  const vars: Record<string, string> = Object.fromEntries(entries.map(entry => [`--${entry.path.replaceAll('/', '-')}`, resolvedToken(source, entry, theme).value]));
  if (name === 'button') {
    const parts = item?.path.split('/') ?? [];
    const branch = parts.length > 2 ? `${parts[0]}/${parts[1]}/${parts[2]}/` : 'button/primary/solid/';
    for (const entry of entries.filter(entry => entry.path.startsWith(branch))) {
      const suffix = entry.path.slice(branch.length).replaceAll('/', '-');
      const value = resolvedToken(source, entry, theme).value;
      vars[`--seda-action-${suffix === 'focus-ring' ? 'focus' : suffix === 'spinner-foreground' ? 'spinner' : suffix}`] = value;
    }
    vars['--seda-action-foreground-hover'] ??= vars['--seda-action-foreground-default'];
    vars['--seda-action-foreground-pressed'] ??= vars['--seda-action-foreground-default'];
  }
  return vars;
}

function componentSample(name: string, item: TokenEntry, label: string, vars: Record<string, string>) {
  const path = item.path;
  const disabled = path.endsWith('/disabled');
  const error = path.endsWith('/error');
  if (name === 'select') return <Select label={label} options={[{ value: 'all', label: 'Все роли' }]} defaultValue="all" disabled={disabled} errorText={error ? 'Проверьте значение' : undefined} />;
  if (name === 'text-field') return <TextField label={label} defaultValue="Atlas" disabled={disabled} errorText={error ? 'Проверьте значение' : undefined} />;
  if (name === 'checkbox') return <Checkbox label={label} defaultChecked={path.includes('/checked') || path.includes('/indeterminate')} disabled={disabled} errorText={error ? 'Проверьте значение' : undefined} />;
  if (name === 'radio') return <Radio label={label} options={[{ value: 'one', label: 'Первый' }, { value: 'two', label: 'Второй' }]} defaultValue="one" disabled={disabled} />;
  if (name === 'toggle') return <Toggle label={label} defaultChecked={path.includes('/on/')} disabled={disabled} />;
  if (name === 'button') {
    const parts = path.split('/');
    const variant = parts[1] === 'primary' ? 'primary' : parts[1] === 'danger' ? 'destruction' : parts[2] === 'secondary' ? 'secondary' : parts[2] === 'outline' ? 'outline' : parts[2] === 'ghost' ? 'ghost' : 'text';
    return <Button variant={variant} disabled={disabled} loading={path.endsWith('/loading')} style={vars as React.CSSProperties}>{label}</Button>;
  }
  return <p className="token-preview-unavailable">Для {name} проверенный предпросмотр ещё не подготовлен. Значение и цепочка токена видны ниже.</p>;
}

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
  const [layer, setLayer] = useState<Layer>('components');
  const [theme, setTheme] = useState<Theme>('Light');
  const [component, setComponent] = useState('select');
  const [group, setGroup] = useState('border');
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [showAllDependents, setShowAllDependents] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [colorEditorOpen, setColorEditorOpen] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [initialEdits] = useState<Record<string, string>>(restoreValidEdits);
  const [edits, setEdits] = useState<Record<string, string>>(initialEdits);
  const [appliedEdits, setAppliedEdits] = useState<Record<string, string>>(initialEdits);
  const [message, setMessage] = useState('Изменения сразу видны в предпросмотре и сохраняются в этом браузере.');
  const [compactNav, setCompactNav] = useState(() => window.innerWidth < 700);
  useEffect(() => { const update = () => setCompactNav(window.innerWidth < 700); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update); }, []);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify({ sourceTokensSha256: provenance.tokensSha256, edits })); }, [edits]);

  const draft = useMemo(() => {
    try { return { tokens: applyWorkbenchEdits(tokens, edits, catalog), error: '' }; }
    catch (error) { return { tokens, error: error instanceof Error ? error.message : String(error) }; }
  }, [edits]);
  useEffect(() => { if (!draft.error) setAppliedEdits({ ...edits }); }, [edits, draft.error]);
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
  const linkOptions = options.some(option => option.value === authored) ? options : [{ value: authored, label: `Original alias · ${authored}` }, ...options];
  const componentToken = selected?.collection === 'components' ? selected : undefined;
  const componentGroupEntries = entries.filter(item => item.group === activeGroup);
  const componentRoleAlias = componentToken ? appliedEdits[componentToken.key] ?? componentToken.authored : '';
  const componentRolePath = componentRoleAlias.startsWith('{') ? componentRoleAlias.slice(1, -1).replaceAll('.', '/') : '';
  const allRoles = catalog.filter(item => item.collection === 'semantic' && item.mode === 'Light');
  const recommendedPaths = componentToken ? [...new Set([componentRolePath, ...recommendedRoles(componentToken)])] : [];
  const roleChoices = (roleQuery.trim() ? allRoles.filter(item => item.path.toLowerCase().includes(roleQuery.trim().toLowerCase())) : showAllRoles ? allRoles : allRoles.filter(item => recommendedPaths.includes(item.path))).slice(0, roleQuery.trim() ? 30 : undefined);
  const componentSourceVars = componentToken ? componentColorVars(tokens, component, theme, componentToken) : {};
  const componentCurrentVars = componentToken ? componentColorVars(applied, component, theme, componentToken) : {};
  const componentColorBefore = componentToken ? resolvedToken(tokens, componentToken, theme).value : '';
  const componentColorAfter = componentToken ? resolvedToken(applied, componentToken, theme).value : '';
  const selectVars = useMemo(() => componentColorVars(applied, 'select', theme), [applied, theme]);
  const componentNames = [...new Set(catalog.filter(item => item.collection === 'components').map(item => item.component).filter(Boolean))] as string[];
  const componentCount = entries.length;

  function navigateToEntry(item: TokenEntry) {
    setLayer(item.collection); setComponent(item.component ?? component); setGroup(item.group); setQuery(''); setSelectedKey(item.key); setShowAllDependents(false);
    setMessage(`Показан связанный токен ${item.path}. Его цепочка указана в инспекторе.`);
  }
  function switchLayer(value: Layer) { setLayer(value); setGroup(value === 'foundation' ? 'blue' : 'border'); setQuery(''); setRoleQuery(''); setSelectedKey(''); }
  function edit(value: string) { if (!selected) return; setEdits(previous => ({ ...previous, [selected.key]: value })); setMessage('Изменения сохранены в этом браузере. Предпросмотр обновлён.'); }
  function revert() { if (!selected) return; setEdits(previous => { const next = { ...previous }; delete next[selected.key]; return next; }); }
  function apply() { if (draft.error) { setMessage(draft.error); return; } setAppliedEdits({ ...edits }); setMessage('Черновик применён к предпросмотру. Исходный tokens.json не изменён.'); }
  function reset() { setEdits({}); setAppliedEdits({}); setMessage('Черновик сброшен к исходным токенам.'); }
  function openComponentEditor() { setLayer('components'); setComponent('select'); setGroup('border'); setQuery(''); setSelectedKey(selectDefaultBorder.key); setMessage('Выберите компонент, свойство и состояние. Затем назначьте цветовую роль.'); }
  function chooseComponentRole(path: string) {
    if (!componentToken || draft.error) return;
    const alias = `{${path.replaceAll('/', '.')}}`;
    const target = componentToken;
    const update = (previous: Record<string, string>) => { const next = { ...previous }; if (alias === target.authored) delete next[target.key]; else next[target.key] = alias; return next; };
    setEdits(update); setAppliedEdits(update); setGroup(target.group); setQuery(''); setSelectedKey(target.key);
    setMessage(`${target.path} теперь использует ${path}. Предпросмотр обновлён; исходный tokens.json не изменён.`);
  }
  function resetComponentToken() {
    if (!componentToken) return;
    const key = componentToken.key;
    const remove = (previous: Record<string, string>) => { const next = { ...previous }; delete next[key]; return next; };
    setEdits(remove); setAppliedEdits(remove); setMessage(`${componentToken.path} возвращён к исходной роли.`);
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
    brand: <strong className="token-brand"><span>S</span> SEDA AI</strong>, actions: <span className="token-top-note"></span>,
  };

  function pick(item: TokenEntry) { setSelectedKey(item.key); setGroup(item.group); setQuery(''); setRoleQuery(''); }
  function chooseLibrary(name: string) { const first = catalog.find(item => item.collection === 'components' && item.component === name)!; setComponent(name); pick(first); setColorEditorOpen(false); }
  const library = layer === 'components' ? componentNames : groups;
  const semanticGroups = [...new Set(shown.map(item => item.path.split('/').slice(0, -1).join('/')))];
  const colorOptions = (layer === 'semantic' ? foundation : semantic).filter(item => item.path.toLowerCase().includes(roleQuery.toLowerCase()));
  return <SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m"><div className="token-app studio" data-theme={theme.toLowerCase()}>
    <header className="studio-header"><strong className="studio-brand">SEDA</strong><nav aria-label="Области редактора">{([['foundation','Палитра'],['semantic','Семантика'],['components','Компоненты']] as const).map(([id,title]) => <button key={id} aria-current={layer === id ? 'page' : undefined} onClick={() => { switchLayer(id); setLibraryQuery(''); setColorEditorOpen(false); }}>{title}</button>)}</nav><div className="studio-header-actions"><Select label="Theme" value={theme} options={['Light','Dark'].map(value => ({value,label:value}))} onValueChange={value => setTheme(value as Theme)} /><Button variant="secondary" onClick={download}>Экспорт JSON</Button><Button variant="text" onClick={reset}>Сбросить</Button></div></header>
    <div className="studio-workspace"><aside className="studio-library"><div className="studio-panel-heading">{layer === 'components' ? 'Библиотека' : 'Color groups'}<span>{library.length}</span></div><div className="studio-library-search"><TextField label="Поиск в библиотеке" placeholder="Поиск…" value={libraryQuery} onChange={event => setLibraryQuery(event.target.value)} /></div><div className="studio-library-items">{library.filter(name => name.toLowerCase().includes(libraryQuery.toLowerCase())).map(name => <button key={name} aria-pressed={layer === 'components' ? component === name : activeGroup === name} onClick={() => { if(layer === 'components') chooseLibrary(name); else { setGroup(name); setQuery(''); setSelectedKey(''); } }}><span className="studio-item-symbol" aria-hidden="true">{layer === 'components' ? '◇' : '▦'}</span>{groupLabels[name] ?? name}</button>)}</div><div className="studio-library-footer">{layer === 'components' ? `${componentCount} цветовых токенов` : `${entries.length} цветов`}</div></aside>
    <main className="studio-canvas"><div className="studio-canvas-toolbar"><span>{layer === 'components' ? `Компоненты / ${component}` : layer === 'foundation' ? `Палитра / ${activeGroup}` : `Семантика / ${activeGroup}`}</span><span>{theme} <span className="studio-toolbar-divider">|</span> 100%</span></div><div className="studio-canvas-scroll">
      {layer === 'components' && componentToken ? <div className="studio-artboard-wrap"><div className="studio-artboard-title">{component}<span>SEDA UI</span></div><section className="studio-artboard" aria-label="Холст компонента"><div className="studio-selected-element" onClick={() => setColorEditorOpen(true)}><span className="studio-selection-label">{component}</span><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={componentCurrentVars as React.CSSProperties}>{componentSample(component, componentToken, component === 'button' ? 'Создать проект' : 'Название проекта', componentCurrentVars)}</SedaProvider><i className="studio-handle studio-handle--tl"/><i className="studio-handle studio-handle--tr"/><i className="studio-handle studio-handle--bl"/><i className="studio-handle studio-handle--br"/></div></section><div className="studio-parts" aria-label="Component parts">{groups.map(name => <button key={name} aria-pressed={activeGroup === name} onClick={() => { const item=entries.find(entry => entry.group === name)!; pick(item); setColorEditorOpen(true); }}>{groupLabels[name] ?? name}</button>)}</div><p className="studio-canvas-hint">Выберите часть под компонентом или цветовое свойство в инспекторе.</p></div> : <><div className="studio-color-heading"><h1>{layer === 'foundation' ? 'Палитра' : 'Semantic colors'}</h1><TextField label="Поиск по токенам" placeholder="Найти цвет…" value={query} onChange={event => {setQuery(event.target.value);setSelectedKey('');}} /></div>{layer === 'semantic' ? <div className="studio-semantic-table"><table aria-label="Semantic tokens"><thead><tr><th>Token</th><th>Reference</th><th>Color</th><th>Value</th></tr></thead>{semanticGroups.map(branch => <tbody key={branch}><tr className="studio-token-group"><th colSpan={4}>{branch}<span>{shown.filter(item => item.path.split('/').slice(0,-1).join('/') === branch).length}</span></th></tr>{shown.filter(item => item.path.split('/').slice(0,-1).join('/') === branch).map(item => { const color = resolvedToken(draft.error ? applied : draft.tokens,item,theme).value; return <tr key={item.key} className="studio-token-row" aria-selected={selected?.key === item.key} onClick={() => {setSelectedKey(item.key);setGroup(item.group);}}><td><button onClick={() => {setSelectedKey(item.key);setGroup(item.group);}}>{item.path}</button>{Object.hasOwn(edits,item.key) && <span className="studio-token-modified" title="Modified">•</span>}</td><td><code>{edits[item.key] ?? item.authored}</code></td><td><i className="studio-table-color" style={{background:color}} /></td><td><code>{displayOklch(color)}</code></td></tr>;})}</tbody>)}</table>{!shown.length && <p className="studio-table-empty">No tokens found</p>}</div> : <div className="studio-swatches">{shown.map(item => {const color=resolvedToken(draft.error ? applied : draft.tokens,item,theme).value;return <button key={item.key} aria-pressed={selected?.key === item.key} onClick={() => pick(item)}><i style={{background:color}}/><strong>{item.path}</strong><small>{displayOklch(color)}</small></button>;})}</div>}</>}
    </div><footer className="studio-canvas-footer" role="status"><span>{draft.error || `${Object.keys(edits).length} изменений · Сохранено в браузере`}</span><span>Живой предпросмотр</span></footer></main>
    <aside className="studio-inspector" aria-label="Инспектор"><div className="studio-panel-heading">{layer === 'components' ? component : 'Цвет'}<span>{theme}</span></div>
      {layer === 'components' ? <><div className="studio-inspector-section"><h2>Color properties</h2><p>Выберите свойство, чтобы назначить цветовую роль.</p><Select label="Property group" value={activeGroup} options={groups.map(value=>({value,label:groupLabels[value]??value}))} onValueChange={value=>{pick(entries.find(item=>item.group===value)!);setColorEditorOpen(false);}} /></div><div className="studio-property-list">{componentGroupEntries.map(item=><button key={item.key} aria-pressed={componentToken?.key===item.key} onClick={()=>{pick(item);setColorEditorOpen(true);}}><span>{item.path.split('/').slice(1).join(' / ')}</span><i style={{background:resolvedToken(applied,item,theme).value}}/><span aria-hidden="true">›</span></button>)}</div></> : null}
      {selected && (layer !== 'components' || colorEditorOpen) && <section className="studio-inspector-section studio-color-editor" aria-label="Редактор цвета"><div className="studio-editor-heading"><h2>{layer === 'components' ? 'Color role' : 'Color value'}</h2>{layer==='components' && <button aria-label="Закрыть выбор цвета" onClick={()=>setColorEditorOpen(false)}>×</button>}</div><p className="studio-token-path">{selected.path}</p><div className="studio-resolved-color"><i style={{background:effectiveColor}}/><code>{displayOklch(effectiveColor??'')}</code></div>
        {layer==='foundation' ? <><TextField label="OKLCH" value={editorValue} onChange={event=>edit(event.target.value)} /><label className="studio-native-picker">Выбрать визуально<input type="color" aria-label="Выбрать цвет палитры" value={pickerHex(effectiveColor??'')??'#000000'} onChange={event=>edit(hexToOklch(event.target.value)??event.target.value)} /></label></> : <><Select label={layer==='semantic'?'Palette color':'Semantic role'} value={authored} options={linkOptions} onValueChange={value=>edit(String(value))} /><TextField label="Поиск цвета" value={roleQuery} placeholder="Название цвета или роли" onChange={event=>setRoleQuery(event.target.value)} /><div className="studio-color-options">{colorOptions.map(item=><button key={item.key} aria-pressed={authored===directAlias(item)} onClick={()=>edit(directAlias(item))}><i style={{background:resolvedToken(applied,item,theme).value}}/><span>{item.path}</span></button>)}</div></>}
        <Button variant="text" disabled={!Object.hasOwn(edits,selected.key)} onClick={revert}>Вернуть исходное значение</Button><details><summary>Token references</summary><div className="studio-relations">{relations.sources.map(item=><button key={item.key} onClick={()=>navigateToEntry(item)}>{item.path} →</button>)}</div></details>
      </section>}{layer==='components'&&!colorEditorOpen&&<div className="studio-inspector-section"><p>Нажмите на цвет справа от свойства. Изменение применяется сразу.</p></div>}
    </aside></div></div></SedaProvider>;
}

createRoot(document.getElementById('root')!).render(<TokenWorkbench />);
