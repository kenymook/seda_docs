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
const groupLabels: Record<string, string> = { border: 'Рамка', surface: 'Фон', foreground: 'Текст', label: 'Подпись', helper: 'Подсказка', icon: 'Иконка', arrow: 'Стрелка', focus: 'Фокус', control: 'Контрол', track: 'Трек', thumb: 'Ползунок', dropdown: 'Список', option: 'Пункт списка', primary: 'Primary', neutral: 'Neutral', danger: 'Danger' };
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
  const [layer, setLayer] = useState<Layer>('foundation');
  const [theme, setTheme] = useState<Theme>('Light');
  const [component, setComponent] = useState('select');
  const [group, setGroup] = useState('blue');
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [showAllDependents, setShowAllDependents] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');
  const [showAllRoles, setShowAllRoles] = useState(false);
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
    brand: <strong className="token-brand"><span>S</span> SEDA AI</strong>, actions: <span className="token-top-note">Система токенов · черновик</span>,
  };

  return <SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m">
    <div className="token-app" data-theme={theme.toLowerCase()}>
      {compactNav ? <TopBar {...topBarProps} navigationPresentation="dialog" navigationTriggerLabel="Разделы" navigationCloseLabel="Закрыть" /> : <TopBar {...topBarProps} />}
      <header className="token-toolbar"><div><h1>Токены SEDA</h1><p>Палитра → семантические роли → компоненты. Меняйте связи и проверяйте результат на настоящих контролах.</p><button type="button" className="token-task-link" onClick={openComponentEditor}>Настроить цвета компонента <span aria-hidden="true">→</span></button></div><div className="token-toolbar-actions"><Select label="Тема" value={theme} options={['Light', 'Dark'].map(value => ({ value, label: value }))} onValueChange={value => { setTheme(value as Theme); setSelectedKey(''); }} /><Button variant="primary" onClick={apply} disabled={!!draft.error}>Применить</Button><Button variant="secondary" onClick={download}>Скачать JSON</Button><Button variant="text" onClick={reset}>Сбросить</Button></div></header>
      <div className="token-status" role="status"><span>{Object.keys(edits).length} изменений в черновике</span><span>{draft.error || message}</span></div>
      <div className="token-layout">
        <nav className="token-rail" aria-label="Слои токенов"><h2>Слои</h2>{([['foundation', '01', 'Палитра', 'Исходные цвета в OKLCH'], ['semantic', '02', 'Семантика', 'Роли для Light и Dark'], ['components', '03', 'Компоненты', 'Части и состояния']] as const).map(([id, order, label, description]) => <button type="button" key={id} className="token-layer" aria-current={layer === id ? 'page' : undefined} onClick={() => switchLayer(id)}><span>{order}</span><strong>{label}</strong><small>{description}</small></button>)}<div className="token-rail-note"><strong>Источник</strong><span>tokens.json · {provenance.tokensSha256.slice(0, 10)}</span><p>Редактор сохраняет локальный черновик. Изменения библиотеки выпускаются отдельно через PR.</p></div></nav>
        <main className="token-main"><div className="token-heading"><div><p className="token-kicker">{layer === 'foundation' ? '01 / FOUNDATION' : layer === 'semantic' ? '02 / SEMANTIC' : '03 / COMPONENTS'}</p><h2>{layer === 'foundation' ? 'Палитра' : layer === 'semantic' ? 'Семантические роли' : `Компонент · ${component}`}</h2><p>{layer === 'foundation' ? 'Редактируйте исходные цвета. Зависимые роли и компоненты пересчитаются вместе с ними.' : layer === 'semantic' ? 'Каждая изменённая роль напрямую связывается с цветом палитры для выбранной темы.' : `Все ${componentCount} цветовых токенов ${component} сгруппированы по частям и состояниям. Изменённые связи ведут к семантическим ролям.`}</p></div>{layer === 'components' && <Select label="Компонент" value={component} options={componentNames.map(value => ({ value, label: value }))} onValueChange={value => { const nextComponent = String(value); const first = catalog.find(item => item.collection === 'components' && item.component === nextComponent); setComponent(nextComponent); setGroup(first?.group ?? 'surface'); setSelectedKey(first?.key ?? '__unrelated__'); setQuery(''); setRoleQuery(''); setMessage(`Выбран компонент ${nextComponent}. Теперь выберите свойство и цветовую роль.`); }} />}</div>
          {layer === 'components' && <section className="token-border-task" aria-label="Настройка цвета компонента">
            <div className="token-border-task-head"><div><span className="token-task-kicker">КОМПОНЕНТ · ЦВЕТОВЫЕ ТОКЕНЫ</span><h3>Настройка цвета</h3><p>Выберите часть и состояние, затем роль. Меняется один токен выбранного компонента. Размеры и типографика настраиваются отдельно в Component Lab.</p></div><span className="token-task-scope">{componentCount} токенов</span></div>
            <div className="token-task-fields"><Select label="1 · Группа цветов" value={activeGroup} options={groups.map(value => ({ value, label: `${groupLabels[value] ?? value} · ${value}` }))} onValueChange={value => { const nextGroup = String(value); const first = entries.find(item => item.group === nextGroup); setGroup(nextGroup); setSelectedKey(first?.key ?? '__unrelated__'); setQuery(''); setRoleQuery(''); }} /><Select label="2 · Часть и состояние" value={componentToken?.key ?? ''} options={componentGroupEntries.map(item => ({ value: item.key, label: item.path.split('/').slice(1).join(' / ') }))} placeholder="Выберите токен" onValueChange={value => { setSelectedKey(String(value)); setQuery(''); setRoleQuery(''); }} /></div>
            {componentToken ? <div className="token-border-task-body"><div className="token-border-choice-area"><div className="token-role-heading"><h4>3 · Назначьте цветовую роль</h4><span>{componentToken.path}</span></div><TextField label="Найти роль" value={roleQuery} onChange={event => setRoleQuery(event.target.value)} placeholder="Например, border/subtle" /><div className="token-border-choices">{roleChoices.map(role => {
              const darkRole = byKey.get(tokenKey('semantic', 'Dark', role.path));
              if (!darkRole) return null;
              return <button type="button" className="token-border-choice" key={role.path} aria-label={`Назначить роль ${role.path} для ${componentToken.path}`} aria-pressed={componentRolePath === role.path} onClick={() => chooseComponentRole(role.path)} disabled={!!draft.error}>
                <span className="token-border-choice-label"><strong>{friendlyRoles[role.path] ?? role.path.split('/').at(-1)}</strong><small>{role.path}</small></span><span className="token-border-choice-swatches"><i title="Light" style={{ background: resolvedToken(applied, role, 'Light').value }} /><i title="Dark" style={{ background: resolvedToken(applied, darkRole, 'Dark').value }} /></span><code>{displayOklch(resolvedToken(applied, role, theme).value)}</code>
              </button>;
            })}{!roleChoices.length && <p className="token-empty">Роли не найдены. Попробуйте другое слово.</p>}</div>{!roleQuery.trim() && <button type="button" className="token-show-all" onClick={() => setShowAllRoles(value => !value)}>{showAllRoles ? 'Показать рекомендуемые' : `Показать все ${allRoles.length} ролей`}</button>}<p className="token-border-note">Роль имеет отдельные значения Light и Dark. Выбор сразу обновляет предпросмотр и локальный черновик.</p></div>
              <div className="token-border-comparison"><h4>До → сейчас</h4><div className="token-border-demo"><span>Исходное значение · {displayOklch(componentColorBefore)}</span><i className="token-color-sample" style={{ background: componentColorBefore }} /><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...componentSourceVars, display: 'contents' } as React.CSSProperties}>{componentSample(component, componentToken, 'Было', componentSourceVars)}</SedaProvider></div><div className="token-border-demo token-border-demo--current"><span>Текущий выбор · {displayOklch(componentColorAfter)}</span><i className="token-color-sample" style={{ background: componentColorAfter }} /><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...componentCurrentVars, display: 'contents' } as React.CSSProperties}>{componentSample(component, componentToken, 'Сейчас', componentCurrentVars)}</SedaProvider></div><button type="button" className="token-border-revert" onClick={resetComponentToken} disabled={!Object.prototype.hasOwnProperty.call(edits, componentToken.key)}>Вернуть только этот токен</button></div>
            </div> : <p className="token-task-empty">Выберите часть и состояние, чтобы увидеть доступные роли и сравнение.</p>}
          </section>}
          {layer === 'components' && component === 'select' && <section className="token-preview" aria-label="Предпросмотр Select"><div><h3>Остальные состояния Select</h3><p>Контрактный компонент @seda-ai/ui. Состояния управляются реальным Select; вид нативного списка зависит от ОС.</p></div><SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...selectVars, display: 'contents' } as React.CSSProperties}><div className="token-preview-grid"><Select label="Обычный" options={[{ value: 'all', label: 'Все роли' }, { value: 'owner', label: 'Владелец' }]} defaultValue="all" /><Select label="Фокус" state="focus" options={[{ value: 'all', label: 'Все роли' }]} placeholder="Выберите роль" /><Select label="Ошибка" errorText="Проверьте значение" options={[{ value: 'all', label: 'Все роли' }]} placeholder="Выберите роль" /><Select label="Недоступен" disabled options={[{ value: 'all', label: 'Все роли' }]} defaultValue="all" /></div></SedaProvider></section>}
          {layer === 'components' && !['select', 'text-field', 'button', 'checkbox', 'radio', 'toggle'].includes(component) && <div className="token-scope">Значение и цепочка токена проверяются resolver. Для этого компонента отдельный визуальный образец пока не подготовлен.</div>}
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
