import {PreviewAvailability} from './PreviewAvailability';
import {componentAvailability} from './component-availability.mjs';
import {renderStudioPreview} from './StudioPreviews';
import {bindSavedDesign} from './saved-design-model.mjs';
import {SelectStateBoard} from './SelectStateBoard';
import {StudioHeader, StudioRail} from './StudioChrome';
import {FoundationStudio} from './FoundationStudio';
import {foundationSections} from './foundation-model.mjs';
import {useTokenStore} from './use-token-store';
import {migrateTokenDocument} from './token-source-migration.mjs';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Icon, IconButton, Popover, Select, SedaProvider, TextField, TopBar } from '@seda-ai/ui';
import { componentCoverage, provenance, tokens, profiles, libraryBindings, buttonContract } from 'seda:catalog';
import { displayHex, displayOklch, hexToOklch, pickerHex } from './owner-color.mjs';
import { applyWorkbenchEdits, designCatalog, colorCatalog, directAlias, resolvedToken, tokenKey, tokenRelations, workbenchColorVariables } from './token-workbench-model.mjs';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@seda-ai/ui/styles.css';
import './tokens.css';

type Layer = 'foundation' | 'semantic' | 'components';
type Theme = 'Light' | 'Dark';
type TokenEntry = { collection: Layer; mode: string; path: string; key: string; authored: string; group: string; component: string | null };
const catalog = (colorCatalog(tokens) as TokenEntry[]).map(item => item.component === 'button' ? {...item, group:item.path.split('/').slice(1,3).join('/')} : item);
const allCatalog=designCatalog(tokens);
const byKey = new Map(allCatalog.map(item => [item.key, item]));
const storageKey = 'seda-token-workbench-v2';
const selectDefaultBorder = byKey.get(tokenKey('components', 'Mode 1', 'select/border/default'))!;
const rolePresets: Record<string, string[]> = {
  border: ['border/subtle', 'border/default', 'border/strong', 'border/field/default', 'border/focus', 'status/danger/border'],
  surface: ['container/subtle/default', 'container/neutral/default', 'surface/base', 'surface/raised', 'surface/sunken', 'status/info/surface'],
  text: ['text/primary', 'text/secondary', 'text/tertiary', 'text/disabled', 'text/inverse', 'text/brand'],
  icon: ['icon/primary', 'icon/secondary', 'icon/tertiary', 'icon/disabled', 'icon/brand', 'icon/accent'],
  focus: ['focus/ring', 'focus/outline', 'focus/ring-strong', 'border/focus'],
};
const groupLabels: Record<string, string> = {'primary/solid':'primary','neutral/secondary':'secondary','neutral/outline':'outline','neutral/ghost':'ghost','neutral/text':'text','danger/solid':'destruction'};
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
  return renderStudioPreview(name,{path:item.path,label,variables:vars}) ?? <p className="token-preview-unavailable">Для {name} проверенный предпросмотр ещё не подготовлен. Значение и цепочка токена видны ниже.</p>;
}

function restoreEdits(): Record<string, string> {
  try {
    const saved = migrateTokenDocument(JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem('seda-token-workbench-v1') || 'null'),tokens,provenance.tokensSha256);
    if (saved?.sourceTokensSha256 !== provenance.tokensSha256 || !saved.edits || typeof saved.edits !== 'object') return {};
    return Object.fromEntries(Object.entries(saved.edits).filter(([key, value]) => byKey.has(key) && typeof value === 'string' && value.length <= 120)) as Record<string, string>;
  } catch { return {}; }
}
function restoreValidEdits(pending: Record<string,string>): Record<string,string> {
  const candidates=[pending];
  for(const key of [storageKey+'-last-valid','seda-token-workbench-confirmed-v2']){
    try{const saved=migrateTokenDocument(JSON.parse(localStorage.getItem(key)||'null'),tokens,provenance.tokensSha256);if(saved?.sourceTokensSha256===provenance.tokensSha256&&saved.edits)candidates.push(saved.edits);}catch{}
  }
  for(const edits of candidates){try{applyWorkbenchEdits(tokens,edits,allCatalog);return edits;}catch{}}
  return {};
}

function TokenWorkbench() {
  const requestedArea=new URLSearchParams(location.search).get('area');
  const [foundationArea,setFoundationArea]=useState<string|null>(()=>foundationSections.some(item=>item.id===requestedArea)?requestedArea:null);
  const [layer, setLayer] = useState<Layer>(()=>['foundation','semantic','components'].includes(requestedArea??'')?requestedArea as Layer:'components');
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
  const [initialEdits] = useState<Record<string, string>>(restoreEdits);
  const [edits, setEdits] = useState<Record<string, string>>(initialEdits);
  const [lastEdit, setLastEdit] = useState<{key:string; before:string|undefined; after:string|undefined}|null>(null);
  const [appliedEdits, setAppliedEdits] = useState<Record<string, string>>(()=>restoreValidEdits(initialEdits));
  const [localDraftProblem,setLocalDraftProblem]=useState('');
  const [message, setMessage] = useState('Изменения сразу видны в предпросмотре и сохраняются в этом браузере.');
  const [compactNav, setCompactNav] = useState(() => window.innerWidth < 700);
  useEffect(() => { const update = () => setCompactNav(window.innerWidth < 700); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update); }, []);
  useEffect(() => {
    try {
      const raw=localStorage.getItem(storageKey)||localStorage.getItem('seda-token-workbench-v1');
      if(raw){const previous=JSON.parse(raw);if(previous?.sourceTokensSha256!==provenance.tokensSha256){const backup=storageKey+'-source-backup-'+(previous?.sourceTokensSha256??'unknown');if(!localStorage.getItem(backup))localStorage.setItem(backup,raw);}}
      localStorage.setItem(storageKey, JSON.stringify({ sourceTokensSha256: provenance.tokensSha256, edits }));setLocalDraftProblem('');
    } catch {setLocalDraftProblem('Не удалось сохранить локальный черновик. Правка остаётся в открытой вкладке; освободите место в браузере или экспортируйте JSON перед закрытием.');}
  }, [edits]);

  const draft = useMemo(() => {
    try { return { tokens: applyWorkbenchEdits(tokens, edits, allCatalog), error: '' }; }
    catch (error) { return { tokens, error: error instanceof Error ? error.message : String(error) }; }
  }, [edits]);
  useEffect(() => { if (!draft.error) {setAppliedEdits({ ...edits });try{localStorage.setItem(storageKey+'-last-valid',JSON.stringify({sourceTokensSha256:provenance.tokensSha256,edits}));}catch{}} }, [edits, draft.error]);
  const sync = useTokenStore(provenance.tokensSha256, edits, setEdits, !draft.error,tokens);
  const applied = useMemo(() => applyWorkbenchEdits(tokens, appliedEdits, allCatalog), [appliedEdits]);
  const liveBindings=useMemo(()=>bindSavedDesign(tokens,appliedEdits,profiles,libraryBindings,buttonContract),[appliedEdits]);
  const shellVariables = useMemo(() => workbenchColorVariables(applied, theme), [applied, theme]);
  const entries = catalog.filter(item => item.collection === layer && (layer !== 'semantic' || item.mode === theme) && (layer !== 'components' || item.component === component));
  const groups = [...new Set(entries.map(item => item.group))];
  if(layer === 'components' && component === 'button'){ const order=Object.keys(groupLabels); groups.sort((a,b)=>order.indexOf(a)-order.indexOf(b)); }
  const activeGroup = groups.includes(group) ? group : groups[0];
  const shown = entries.filter(item => query.trim()
    ? `${item.path} ${edits[item.key] ?? item.authored}`.toLowerCase().includes(query.trim().toLowerCase())
    : item.group === activeGroup);
  const selected = selectedKey === '__unrelated__' ? undefined : shown.find(item => item.key === selectedKey) ?? shown[0];
  const authored = selected ? edits[selected.key] ?? selected.authored : '';
  const editorValue = selected?.collection === 'foundation' ? displayOklch(authored) ?? authored : authored;
  const resolved = selected ? resolvedToken(draft.error ? applied : draft.tokens, selected, theme) : null;
  const sourceResolved = selected ? resolvedToken(tokens, selected, theme) : null;
  const effectiveColor = resolved?.value;
  const relations = (selected ? tokenRelations(draft.error ? applied : draft.tokens, catalog, selected, theme) : { sources: [], dependents: [] }) as { sources: TokenEntry[]; dependents: TokenEntry[] };
  const dependents = relations.dependents.length;
  const foundation = catalog.filter(item => item.collection === 'foundation');
  const semantic = catalog.filter(item => item.collection === 'semantic' && item.mode === theme);
  const semanticOptions = semantic.map(item => ({ value: directAlias(item), label: item.path }));
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
  function changeToken(key:string, value:string|undefined) {
    if(edits[key]===value)return;
    setLastEdit({key,before:edits[key],after:value});
    setEdits(previous=>{const next={...previous};if(value===undefined)delete next[key];else next[key]=value;return next;});
  }
  function edit(value: string) { if (selected) changeToken(selected.key,value===selected.authored?undefined:value); }
  function revert() { if (selected) changeToken(selected.key,undefined); }
  const canUndo=!!lastEdit && edits[lastEdit.key]===lastEdit.after;
  function undoLastEdit(){
    if(!lastEdit||!canUndo)return;
    const {key,before,after}=lastEdit;
    setEdits(previous=>{if(previous[key]!==after)return previous;const next={...previous};if(before===undefined)delete next[key];else next[key]=before;return next;});
    setLastEdit(null);
  }
  function pickSelectState(state:string){
    const target=entries.find(item=>item.group===activeGroup&&item.path.endsWith('/'+state)) ?? entries.find(item=>item.group==='border'&&item.path.endsWith('/'+state));
    if(target){pick(target);setColorEditorOpen(true);}else setMessage('Для этой части нет отдельного токена '+state+'.');
  }
  function apply() { if (draft.error) { setMessage(draft.error); return; } setAppliedEdits({ ...edits }); setMessage('Черновик применён к предпросмотру. Исходный tokens.json не изменён.'); }
  function reset() { setLastEdit(null); setEdits({}); setAppliedEdits({}); setMessage('Черновик сброшен к исходным токенам.'); }
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
  const isValidation = (item: TokenEntry) => ['error','warning','success','invalid','valid'].includes(item.path.split('/').at(-1)!);
  const propertyGroups = [{title:'States', items:componentGroupEntries.filter(item=>!isValidation(item))},{title:'Validation',items:componentGroupEntries.filter(isValidation)}].filter(group=>group.items.length); 
  const tokenGroups = [...new Set(shown.map(item => item.path.split('/').slice(0, -1).join('/')))];
  const legacySource = layer === 'components' && !semantic.some(item=>directAlias(item)===authored) ? foundation.find(item=>directAlias(item)===authored) : undefined;
  const colorOptions = (layer === 'semantic' ? foundation : semantic).filter(item => item.path.toLowerCase().includes(roleQuery.toLowerCase()));
  const colorEditor = selected && <section className="studio-color-editor" aria-label="Редактор цвета">{layer === 'components' && <p className="studio-edit-scope">Меняется назначение роли для {selected.path}. Сама роль и другие компоненты сохраняют свои значения.{relations.sources.find(item=>item.collection==='semantic') && <Button variant="secondary" onClick={()=>{navigateToEntry(relations.sources.find(item=>item.collection==='semantic')!);setColorEditorOpen(false);}}>Открыть общую роль</Button>}</p>}{layer === 'components' && legacySource && <p className="studio-edit-scope">Исходная прямая ссылка палитры: {legacySource.path}. Для нового назначения выберите semantic role.</p>}{layer === 'foundation' && <div className="studio-edit-scope"><p>Общий цвет палитры: изменение затронет {dependents} связанных токенов.</p><details><summary>Где используется</summary>{relations.dependents.map(item=><div key={item.key}>{item.path}</div>)}</details></div>}{layer === 'semantic' && <div className="studio-edit-scope"><p>Общая роль: изменение затронет {dependents} связанных токенов в {theme}.</p><details><summary>Где используется</summary>{relations.dependents.map(item=><div key={item.key}>{item.path}</div>)}</details></div>}{layer !== 'components' && <><p className="studio-token-path">{selected.path}</p><div className="studio-resolved-color"><i style={{background:effectiveColor}}/><div><code>{displayOklch(effectiveColor??'')}</code><code className="studio-hex-value">{displayHex(effectiveColor??'')}</code></div></div></>}
        {layer==='foundation' ? <><TextField label="OKLCH" value={editorValue} onChange={event=>edit(event.target.value)} /><label className="studio-native-picker">Выбрать визуально<input type="color" aria-label="Выбрать цвет палитры" value={pickerHex(effectiveColor??'')??'#000000'} onChange={event=>edit(hexToOklch(event.target.value)??event.target.value)} /></label></> : <>{layer==='semantic' && <Select label="Palette color" value={authored} options={linkOptions} onValueChange={value=>edit(String(value))} />}<TextField className="studio-role-search" label="Поиск цвета" value={roleQuery} placeholder="Название цвета или роли" onChange={event=>setRoleQuery(event.target.value)} /><div className="studio-color-options">{colorOptions.map(item=><button key={item.key} ref={node=>{if(node && authored===directAlias(item)){const list=node.parentElement!;const optionBox=node.getBoundingClientRect(),listBox=list.getBoundingClientRect();list.scrollTop+=optionBox.top-listBox.top-(list.clientHeight-optionBox.height)/2;}}} aria-pressed={authored===directAlias(item)} onClick={()=>{if(authored!==directAlias(item))edit(directAlias(item));}}><i style={{background:resolvedToken(applied,item,theme).value}}/><span>{item.path}</span>{authored===directAlias(item) && <Icon name="success" />}</button>)}</div></>}
        <Button variant="text" disabled={!Object.hasOwn(edits,selected.key)} onClick={revert}>Вернуть исходное значение</Button><details><summary>Token references</summary><div className="studio-relations">{relations.sources.map(item=><button key={item.key} onClick={()=>navigateToEntry(item)}>{item.path} →</button>)}</div></details></section>;
  const draftProblem=draft.error ? draft.error+' '+(localDraftProblem ? 'Незавершённая правка не отправлена в базу.' : 'Незавершённая правка сохранена локально и не отправлена в базу. Предпросмотр использует последнее корректное оформление.') : '';
  const syncProblem=!!draft.error||!!localDraftProblem||!!sync.conflict||/Нет связи|Не удалось|отличается/.test(sync.status);
  const footer=<><span className="studio-sync-live" role="status" aria-live="polite">{draft.error||sync.status}</span>{syncProblem&&<div className="studio-sync-error" role="alert"><span>{[draftProblem,localDraftProblem,!draft.error&&!localDraftProblem?sync.status:''].filter(Boolean).join(' ')}</span><div>{sync.conflict?<><Button variant="ghost" onClick={()=>sync.resolve(false)}>Загрузить из базы</Button><Button variant="secondary" onClick={()=>sync.resolve(true)}>Сохранить мою версию</Button></>:<Button variant="ghost" onClick={sync.retry}>Синхронизировать</Button>}</div></div>}</>;

  return <SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={shellVariables as React.CSSProperties}><style data-seda-editor-design>{liveBindings.css}</style><div className="token-app studio" data-theme={theme.toLowerCase()}>
    <StudioHeader actions={<><Select label="Theme" value={theme} options={['Light','Dark'].map(value => ({value,label:value}))} onValueChange={value => setTheme(value as Theme)} /><Button variant="secondary" onClick={download}>Экспорт JSON</Button><Button variant="ghost" onClick={reset}>Сбросить</Button></>}/>
    <div className="studio-workspace"><StudioRail area={foundationArea??layer} onSelect={id=>{if(['foundation','semantic','components'].includes(id)){setFoundationArea(null);switchLayer(id as Layer);}else setFoundationArea(id);setLibraryQuery('');setColorEditorOpen(false);}}/>{foundationArea?<FoundationStudio key={foundationArea} area={foundationArea} source={applied} original={tokens} theme={theme} edits={edits} setEdits={setEdits} footer={footer}/>:<><aside className="studio-library"><div className="studio-panel-heading">{layer === 'components' ? 'Библиотека' : 'Color groups'}</div><div className="studio-library-search"><TextField label="Поиск в библиотеке" placeholder="Поиск…" value={libraryQuery} onChange={event => setLibraryQuery(event.target.value)} /></div><div className="studio-library-items">{library.filter(name => name.toLowerCase().includes(libraryQuery.toLowerCase())).map(name => <button key={name} aria-label={layer === 'components' ? name : undefined} aria-describedby={layer === 'components' ? 'availability-'+name : undefined} title={layer === 'components' ? componentAvailability(componentCoverage.catalog,name).description : undefined} data-availability={layer === 'components' ? componentAvailability(componentCoverage.catalog,name).kind : undefined} aria-pressed={layer === 'components' ? component === name : activeGroup === name} onClick={() => { if(layer === 'components') chooseLibrary(name); else { setGroup(name); setQuery(''); setSelectedKey(''); } }}><span className="studio-item-symbol" aria-hidden="true">{layer === 'components' ? '◇' : '▦'}</span><span className="studio-library-item-copy">{groupLabels[name] ?? name}{layer === 'components' && <span id={'availability-'+name} className="studio-library-availability">{componentAvailability(componentCoverage.catalog,name).label}</span>}</span></button>)}</div></aside>
    <main className="studio-canvas"><div className="studio-canvas-scroll">
      {layer === 'components' && componentToken ? <div className="studio-artboard-wrap"><section className="studio-artboard" aria-label="Холст компонента">{componentAvailability(componentCoverage.catalog,component).kind !== 'live' ? <PreviewAvailability name={component}/> : <div className="studio-selected-element"><span className="studio-selection-label">{component}</span><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={componentCurrentVars as React.CSSProperties}>{componentSample(component, componentToken, component === 'button' ? 'Создать проект' : 'Название проекта', componentCurrentVars)}</SedaProvider><i className="studio-handle studio-handle--tl"/><i className="studio-handle studio-handle--tr"/><i className="studio-handle studio-handle--bl"/><i className="studio-handle studio-handle--br"/></div>}</section><div className="studio-parts" aria-label="Component parts">{groups.map(name => <button key={name} aria-pressed={activeGroup === name} onClick={() => { const item=entries.find(entry => entry.group === name)!; pick(item); setColorEditorOpen(false); }}>{groupLabels[name] ?? name}</button>)}</div><p className="studio-canvas-hint">Выберите часть под компонентом или цветовое свойство в инспекторе.</p>{component === 'select' && <SelectStateBoard onPick={pickSelectState}/>}</div> : <><div className="studio-color-heading"><h1>{layer === 'foundation' ? 'Палитра' : 'Semantic colors'}</h1><TextField label="Поиск по токенам" placeholder="Найти цвет…" value={query} onChange={event => {setQuery(event.target.value);setSelectedKey('');}} /></div>{layer !== 'components' ? <div className="studio-semantic-table"><table aria-label={layer === 'foundation' ? 'Palette tokens' : 'Semantic tokens'}><thead><tr><th>Token</th><th>{layer === 'foundation' ? 'Source' : 'Reference'}</th><th>Color</th><th>OKLCH</th><th>HEX</th></tr></thead>{tokenGroups.map(branch => <tbody key={branch}>{layer !== 'foundation' && <tr className="studio-token-group"><th colSpan={5}>{branch}<span>{shown.filter(item => item.path.split('/').slice(0,-1).join('/') === branch).length}</span></th></tr>}{shown.filter(item => item.path.split('/').slice(0,-1).join('/') === branch).map(item => { const color = resolvedToken(draft.error ? applied : draft.tokens,item,theme).value; return <tr key={item.key} className="studio-token-row" aria-selected={selected?.key === item.key} onClick={() => {setSelectedKey(item.key);setGroup(item.group);}}><td><button onClick={() => {setSelectedKey(item.key);setGroup(item.group);}}>{item.path}</button>{Object.hasOwn(edits,item.key) && <span className="studio-token-modified" title="Modified">•</span>}</td><td><code>{edits[item.key] ?? item.authored}</code></td><td><i className="studio-table-color" style={{background:color}} /></td><td><code>{displayOklch(color)}</code></td><td><code className="studio-hex-value">{displayHex(color)}</code></td></tr>;})}</tbody>)}</table>{!shown.length && <p className="studio-table-empty">No tokens found</p>}</div> : <div className="studio-swatches">{shown.map(item => {const color=resolvedToken(draft.error ? applied : draft.tokens,item,theme).value;return <button key={item.key} aria-pressed={selected?.key === item.key} onClick={() => pick(item)}><i style={{background:color}}/><strong>{item.path}</strong><small>{displayOklch(color)}</small></button>;})}</div>}</>}
    </div>{footer}</main>
    <aside className="studio-inspector" aria-label="Инспектор"><div className="studio-panel-heading studio-inspector-heading">{layer === 'components' ? component : 'Цвет'}{layer === 'components' && <IconButton aria-label="Отменить изменение" tooltip="Отменить изменение" icon={<Icon name="undo"/>} variant="ghost" disabled={!canUndo} onClick={undoLastEdit}/>}</div>
      {layer === 'components' && <><div className="studio-inspector-section studio-group-selector"><Select label="Property group" value={activeGroup} options={groups.map(value=>({value,label:groupLabels[value]??value}))} onValueChange={value=>{pick(entries.find(item=>item.group===value)!);setColorEditorOpen(false);}} /></div><div className="studio-property-list">{propertyGroups.map(({title,items})=><section key={title} className="studio-property-group" aria-label={title}><h3>{title}</h3>{items.map(item => {const color=resolvedToken(applied,item,theme).value;return <div className="studio-property-row" key={item.key} data-selected={componentToken?.key===item.key}><span>{item.path.split('/').at(-1)}</span><Popover open={colorEditorOpen && componentToken?.key===item.key} onOpenChange={open=>{if(open)pick(item);setColorEditorOpen(open);}} title="Color role" closeLabel="Close color editor" side="left" align="start" size="m" className="studio-color-popover token-app" style={shellVariables as React.CSSProperties} data-theme={theme.toLowerCase()} trigger={props=><Button {...props} variant="secondary" className="studio-color-trigger" aria-label={item.path+' color'} title={item.path}><i style={{background:color}}/><span className="studio-role-name">{(edits[item.key] ?? item.authored).replace(/^\{|\}$/g,'').replaceAll('.','/')}</span></Button>}>{colorEditor}</Popover></div>;})}</section>)}</div></>}
      {layer !== 'components' && <section className="studio-inspector-section"><h2>Color value</h2>{colorEditor}</section>}
    </aside></>}</div></div></SedaProvider>;
}

createRoot(document.getElementById('root')!).render(<TokenWorkbench />);
