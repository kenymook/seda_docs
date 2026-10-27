import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert, Button, Checkbox, Icon, IconButton, NumberField, Radio, Select, SedaProvider, Slider, Table, Text, TextField, Toggle, TopBar } from '@seda-ai/ui';
import { componentCoverage, ownerPolicy, profile, profiles, provenance, system, tokens } from 'seda:catalog';
import { validateOwnerPolicy } from '../../../../packages/seda-contracts/src/owner-policy.mjs';
import { createWebBindings } from '../../../../packages/seda-contracts/src/web.mjs';
import { createWorkspaceBindings } from './workspace-bindings.mjs';
import { applyTokenEdits, editableComponentTokens, resolvedColorVariables, tokenDetail } from './owner-token-draft.mjs';
import { derive } from './lab-model.mjs';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@seda-ai/ui/styles.css';
import './owner.css';

const axes = [
  { key: 'scale', label: 'Масштаб текста', previewLabel: 'Текст', unit: '%' },
  { key: 'air', label: 'Дополнительный отступ Y', previewLabel: 'Отступ Y', unit: 'px' },
  { key: 'airX', label: 'Дополнительный отступ X', previewLabel: 'Отступ X', unit: 'px' },
  { key: 'radius', label: 'Множитель радиуса', previewLabel: 'Радиус', unit: '%' },
] as const;
const fields = [
  { key: 'min', label: 'От' },
  { key: 'max', label: 'До' },
  { key: 'step', label: 'Шаг' },
  { key: 'default', label: 'По умолчанию' },
] as const;
type Axis = typeof axes[number]['key'];
type RangeField = typeof fields[number]['key'];
type Theme = 'Light' | 'Dark';
type Size = 's' | 'm' | 'l' | 'xl';

const tokenEvidence = (() => {
  const web = createWebBindings(profiles['Light:m']);
  return [...web.layout.evidence, ...Object.values(web.controls).flatMap((control: any) => control.evidence), ...Object.values(web.recipes).flatMap((recipe: any) => recipe.evidence)];
})();
const visibleTokenBranches = new Set(['button', 'icon-button', 'text-field', 'select', 'checkbox', 'radio', 'toggle', 'slider']);
const tokenCatalog = editableComponentTokens(tokenEvidence).filter(item => visibleTokenBranches.has(item.component));
const draftStorageKey = 'seda-owner-component-lab-draft-v2';
function restoredDraft(): { policy: ReturnType<typeof toDraft>; edits: Record<string, string> } | null {
  try {
    const saved = JSON.parse(localStorage.getItem(draftStorageKey) || 'null');
    if (saved?.sourceTokensSha256 !== provenance.tokensSha256 || !saved.policy || !saved.componentTokenOverrides) return null;
    if (!Array.isArray(saved.policy.availableThemes) || !Array.isArray(saved.policy.availableSizes) || !saved.policy.defaultConfiguration || !saved.policy.controls) return null;
    if (axes.some(({ key }) => fields.some(({ key: field }) => typeof saved.policy.controls[key]?.[field] !== 'string'))) return null;
    const allowed = new Set(tokenCatalog.map(item => item.path));
    const edits = Object.fromEntries(Object.entries(saved.componentTokenOverrides).filter(([path, value]) => allowed.has(path) && typeof value === 'string' && value.length <= 120)) as Record<string, string>;
    return { policy: saved.policy as ReturnType<typeof toDraft>, edits };
  } catch { return null; }
}

function toDraft(policy: any) {
  return {
    availableThemes: [...policy.availableThemes] as Theme[],
    availableSizes: [...policy.availableSizes] as Size[],
    defaultConfiguration: { ...policy.defaultConfiguration } as { theme: Theme; controlSize: Size },
    controls: {
      ...Object.fromEntries(axes.map(({ key }) => [key, Object.fromEntries(fields.map(({ key: field }) => [field, String(policy.controls[key][field])]))])),
      strict: { default: policy.controls.strict.default as boolean },
    } as Record<string, any>,
  };
}
function toPolicy(draft: ReturnType<typeof toDraft>) {
  return {
    schemaVersion: ownerPolicy.schemaVersion,
    kind: ownerPolicy.kind,
    availableThemes: draft.availableThemes,
    availableSizes: draft.availableSizes,
    defaultConfiguration: draft.defaultConfiguration,
    controls: {
      ...Object.fromEntries(axes.map(({ key }) => [key, Object.fromEntries(fields.map(({ key: field }) => [field, draft.controls[key][field].trim() === '' ? NaN : Number(draft.controls[key][field])]))])),
      strict: { default: draft.controls.strict.default },
    },
  };
}
function defaults(policy: any) {
  return Object.fromEntries(axes.map(({ key }) => [key, policy.controls[key].default])) as Record<Axis, number>;
}

function OwnerLab() {
  const [restored] = useState(restoredDraft);
  const [compactNav, setCompactNav] = useState(() => window.innerWidth < 600);
  useEffect(() => {
    const update = () => setCompactNav(window.innerWidth < 600);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const [draft, setDraft] = useState<ReturnType<typeof toDraft>>(() => restored?.policy ?? toDraft(ownerPolicy));
  const [applied, setApplied] = useState<any>(ownerPolicy);
  const [tokenEdits, setTokenEdits] = useState<Record<string, string>>(() => restored?.edits ?? {});
  const [appliedTokenEdits, setAppliedTokenEdits] = useState<Record<string, string>>({});
  const [selectedComponent, setSelectedComponent] = useState('button');
  const [selectedToken, setSelectedToken] = useState('button/primary/solid/surface/default');
  const [activeAxis, setActiveAxis] = useState<Axis>('scale');
  const [theme, setTheme] = useState<Theme>(ownerPolicy.defaultConfiguration.theme);
  const [size, setSize] = useState<Size>(ownerPolicy.defaultConfiguration.controlSize);
  const [values, setValues] = useState(() => defaults(ownerPolicy));
  const [strict, setStrict] = useState<boolean>(ownerPolicy.controls.strict.default);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [checked, setChecked] = useState(false);
  const [choice, setChoice] = useState('local');
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState(restored ? 'Локальный черновик восстановлен. Примените его к предпросмотру после проверки.' : 'Черновик не опубликован. Применение меняет только предпросмотр этой страницы.');
  const [error, setError] = useState('');
  const compiled = profiles[`${theme}:${size}`];
  const parameters = { ...values, strict };
  const geometry = useMemo(() => derive(compiled, parameters), [compiled, values, strict]);
  const bindings = useMemo(() => createWorkspaceBindings(compiled, geometry, parameters), [compiled, geometry]);
  const appliedTokens = useMemo(() => applyTokenEdits(tokens, appliedTokenEdits, tokenCatalog), [appliedTokenEdits]);
  const colorVars = useMemo(() => resolvedColorVariables(bindings.evidence, appliedTokens, theme), [bindings, appliedTokens, theme]);
  const buttonEvidence = useMemo(() => createWebBindings(compiled).recipes.save.evidence, [compiled]);
  const buttonColors = useMemo(() => {
    const resolved = resolvedColorVariables(buttonEvidence, appliedTokens, theme) as Record<string, string>;
    const action: Record<string, string> = Object.fromEntries(Object.entries(resolved).filter(([name]) => /^--seda-(surface|border|foreground)-/.test(name)).map(([name, value]) => [name.replace('--seda-', '--seda-action-'), value]));
    action['--seda-action-foreground-hover'] = resolved['--seda-foreground-default'];
    action['--seda-action-foreground-pressed'] = resolved['--seda-foreground-default'];
    action['--seda-action-focus'] = resolved['--seda-focus-ring'];
    action['--seda-action-spinner'] = resolved['--seda-spinner-foreground'];
    return { ...resolved, ...action };
  }, [buttonEvidence, appliedTokens, theme]);
  const componentOptions = [...new Set(tokenCatalog.map(item => item.component))];
  const componentTokens = tokenCatalog.filter(item => item.component === selectedComponent);
  const currentToken = tokenCatalog.find(item => item.path === selectedToken) ?? componentTokens[0];
  const originalToken = currentToken ? tokenDetail(tokens, currentToken.path, theme) : null;
  const selectedDetail = useMemo(() => {
    if (!currentToken) return null;
    try { return tokenDetail(applyTokenEdits(tokens, tokenEdits, tokenCatalog), currentToken.path, theme); }
    catch { return null; }
  }, [tokenEdits, currentToken?.path, theme]);
  useEffect(() => {
    try { localStorage.setItem(draftStorageKey, JSON.stringify({ sourceTokensSha256: provenance.tokensSha256, policy: draft, componentTokenOverrides: tokenEdits })); }
    catch { setMessage('Браузер не сохранил локальный черновик. Скачайте JSON перед закрытием страницы.'); }
  }, [draft, tokenEdits]);
  const rows = [
    { id: 'atlas', name: 'Atlas Platform', status: 'Активный', owner: 'Core' },
    { id: 'nova', name: 'Nova Console', status: 'Черновик', owner: 'Product' },
    { id: 'orbit', name: 'Orbit Studio', status: 'Активный', owner: 'Design' },
  ];
  const filtered = rows.filter(row => row.name.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || row.status === status));
  const columns = [
    { key: 'name', header: 'Проект', type: 'text' as const, render: (row: typeof rows[number]) => row.name },
    { key: 'status', header: 'Статус', type: 'status' as const, render: (row: typeof rows[number]) => row.status },
    { key: 'owner', header: 'Команда', type: 'text' as const, render: (row: typeof rows[number]) => row.owner },
  ];

  function setRange(axis: Axis, field: RangeField, value: string) {
    setDraft(previous => ({ ...previous, controls: { ...previous.controls, [axis]: { ...previous.controls[axis], [field]: value } } }));
    setError('');
  }
  function toggleChoice(kind: 'availableThemes' | 'availableSizes', value: Theme | Size, active: boolean) {
    setDraft(previous => ({ ...previous, [kind]: active ? [...previous[kind], value] : previous[kind].filter(item => item !== value) }));
    setError('');
  }
  function validDraft() {
    try {
      const candidate = {
        policy: validateOwnerPolicy(toPolicy(draft), system, profile),
        tokens: applyTokenEdits(tokens, tokenEdits, tokenCatalog),
      };
      setError('');
      return candidate;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return null;
    }
  }
  function apply() {
    const candidate = validDraft();
    if (!candidate) return;
    setApplied(candidate.policy);
    setAppliedTokenEdits({ ...tokenEdits });
    setTheme(candidate.policy.defaultConfiguration.theme);
    setSize(candidate.policy.defaultConfiguration.controlSize);
    setValues(defaults(candidate.policy));
    setStrict(candidate.policy.controls.strict.default);
    setMessage('Черновик применён к предпросмотру. Опубликованная версия SEDA не изменена.');
  }
  function download() {
    const candidate = validDraft();
    if (!candidate) return;
    const exportDraft = { schemaVersion: 1, kind: 'seda-owner-draft', sourceTokensSha256: provenance.tokensSha256, policy: candidate.policy, componentTokenOverrides: tokenEdits };
    const url = URL.createObjectURL(new Blob([JSON.stringify(exportDraft, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seda-owner-component-lab.draft.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function reset() {
    setDraft(toDraft(ownerPolicy));
    setApplied(ownerPolicy);
    setTokenEdits({});
    setAppliedTokenEdits({});
    setTheme(ownerPolicy.defaultConfiguration.theme);
    setSize(ownerPolicy.defaultConfiguration.controlSize);
    setValues(defaults(ownerPolicy));
    setStrict(ownerPolicy.controls.strict.default);
    setError('');
    setMessage('Черновик сброшен к исходной политике и токенам.');
  }
  const topBarProps = {
    variant: 'application' as const,
    label: 'SEDA Component Lab',
    size: 'm' as const,
    gutter: 'wide' as const,
    navigationLabel: 'Рабочие области',
    items: [{ id: 'lab', label: 'Лаборатория', href: './' }, { id: 'owner', label: 'Component Lab', href: './owner.html', selected: true }],
    brand: <strong className="owner-brand"><span>S</span> SEDA AI</strong>,
    actions: <span className="owner-state">Черновик владельца</span>,
  };

  return <SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize="m" style={{ ...bindings.vars, minHeight: '100dvh' } as React.CSSProperties}>
    <div className="owner-shell" data-theme={theme.toLowerCase()}>
      {compactNav
        ? <TopBar {...topBarProps} navigationPresentation="dialog" navigationTriggerLabel="Разделы" navigationCloseLabel="Закрыть" />
        : <TopBar {...topBarProps} />}
      <div className="owner-layout">
        <aside className="owner-sidebar" aria-label="Политика владельца">
          <header className="owner-sidebar-head"><Text as="h1" variant="heading/compact">Управление SEDA</Text><Text as="p" variant="body/small">Определите, что сможет выбирать пользователь.</Text></header>
          <div className="owner-section">
            <h2>Доступные темы</h2>
            {system.supportedThemes.map((option: Theme) => <Checkbox key={option} label={option} checked={draft.availableThemes.includes(option)} onCheckedChange={active => toggleChoice('availableThemes', option, active)} />)}
            <Select label="Тема по умолчанию" value={draft.defaultConfiguration.theme} options={draft.availableThemes.map(option => ({ value: option, label: option }))} onValueChange={value => setDraft(previous => ({ ...previous, defaultConfiguration: { ...previous.defaultConfiguration, theme: value as Theme } }))} />
          </div>
          <div className="owner-section">
            <h2>Доступные размеры</h2>
            <div className="owner-size-list">{Object.keys(system.sizes).map(option => <Checkbox key={option} label={option.toUpperCase()} checked={draft.availableSizes.includes(option as Size)} onCheckedChange={active => toggleChoice('availableSizes', option as Size, active)} />)}</div>
            <Select label="Размер по умолчанию" value={draft.defaultConfiguration.controlSize} options={draft.availableSizes.map(option => ({ value: option, label: option.toUpperCase() }))} onValueChange={value => setDraft(previous => ({ ...previous, defaultConfiguration: { ...previous.defaultConfiguration, controlSize: value as Size } }))} />
          </div>
          <div className="owner-section">
            <Select label="Параметр" value={activeAxis} options={axes.map(axis => ({ value: axis.key, label: axis.label }))} onValueChange={value => setActiveAxis(value as Axis)} />
            <div className="owner-range-grid">{fields.map(field => <NumberField key={`${activeAxis}-${field.key}`} label={`${field.label} · ${axes.find(axis => axis.key === activeAxis)?.unit}`} value={draft.controls[activeAxis][field.key]} onValueChange={value => setRange(activeAxis, field.key, value)} />)}</div>
          </div>
          <div className="owner-section"><Checkbox label="Сохранять минимум высоты" checked={draft.controls.strict.default} onCheckedChange={value => setDraft(previous => ({ ...previous, controls: { ...previous.controls, strict: { default: value } } }))} /></div>
          <div className="owner-section owner-token-editor" aria-label="Токены компонентов">
            <h2>Токены компонентов</h2>
            <p>Меняйте роль или цвет части компонента. Значения проверяются общим resolver.</p>
            <Select label="Компонент" value={selectedComponent} options={componentOptions.map(value => ({ value, label: value }))} onValueChange={value => { const component = String(value); setSelectedComponent(component); setSelectedToken(tokenCatalog.find(item => item.component === component)?.path ?? ''); }} />
            <Select label="Часть и состояние" value={currentToken?.path ?? ''} options={componentTokens.map(item => ({ value: item.path, label: item.property }))} onValueChange={value => setSelectedToken(String(value))} />
            {currentToken && <><TextField label="Значение токена" value={tokenEdits[currentToken.path] ?? originalToken?.authored ?? ''} onChange={event => { const value = event.target.value; setTokenEdits(previous => ({ ...previous, [currentToken.path]: value })); setError(''); }} /><div className="owner-token-preview"><span className="owner-token-swatch" style={{ background: selectedDetail?.value ?? originalToken?.value }} /><span>{selectedDetail?.value ?? 'Значение ждёт проверки'}</span></div><Button variant="text" onClick={() => setTokenEdits(previous => { const next = { ...previous }; delete next[currentToken.path]; return next; })}>Вернуть значение токена</Button></>}
          </div>
          {error && <Alert variant="error" title="Проверьте черновик" description={error} />}
          <div className="owner-actions"><Button variant="primary" onClick={apply}>Применить к предпросмотру</Button><Button variant="secondary" onClick={download}>Скачать JSON</Button><Button variant="text" onClick={reset}>Сбросить</Button></div>
          <p className="owner-note" role="status">{message}</p>
        </aside>
        <main className="owner-main">
          <header className="owner-page-head"><div><Text as="h2" variant="heading/compact">Компоненты в рабочем интерфейсе</Text><Text as="p" variant="body/small">Предпросмотр использует установленный пакет @seda-ai/ui и действующие контракты.</Text></div><span className="owner-metrics">{componentCoverage.publicComponents.length} публичных · {componentCoverage.contractComponents.length} контрактов · {componentCoverage.tokenBranches.length} ветки токенов</span></header>
          <div className="owner-preview-toolbar"><Select label="Тема предпросмотра" value={theme} options={applied.availableThemes.map((value: Theme) => ({ value, label: value }))} onValueChange={value => setTheme(value as Theme)} /><Select label="Размер предпросмотра" value={size} options={applied.availableSizes.map((value: Size) => ({ value, label: `${value.toUpperCase()} · ${profiles[`${theme}:${value}`].geometry.height.value}px` }))} onValueChange={value => setSize(value as Size)} />{axes.map(axis => <div className="owner-preview-range" key={axis.key}><Slider label={axis.previewLabel} min={applied.controls[axis.key].min} max={applied.controls[axis.key].max} step={applied.controls[axis.key].step} value={values[axis.key]} formatValue={value => axis.key === 'radius' ? `${(value / 100).toFixed(2)}×` : `${value} ${axis.unit}`} onValueChange={value => setValues(previous => ({ ...previous, [axis.key]: value }))} /></div>)}</div>
          <SedaProvider theme={theme.toLowerCase() as 'light' | 'dark'} controlSize={size} textScale={values.scale} controlParameters={bindings.controlParameters} style={{ ...bindings.vars, ...colorVars, display: 'contents' } as React.CSSProperties}>
            <section className="owner-workspace" aria-label="Живой предпросмотр SEDA">
              <div className="owner-workspace-head"><div><Text as="h3" variant="heading/compact">Проекты</Text><Text as="p" variant="body/small">Форма, фильтры, действия и таблица в одной композиции.</Text></div><div className="owner-buttons"><Button variant="primary" data-seda-contract="Button" style={buttonColors as React.CSSProperties} iconLeft={<Icon name="add" />} loading={loading}>Создать проект</Button><IconButton aria-label="Добавить проект" icon={<Icon name="add" />} /></div></div>
              <div className="owner-filters"><TextField label="Поиск проектов" placeholder="Название проекта" value={query} onChange={event => setQuery(event.target.value)} /><Select label="Статус" value={status} options={[{ value: 'all', label: 'Все статусы' }, { value: 'Активный', label: 'Активный' }, { value: 'Черновик', label: 'Черновик' }]} onValueChange={value => setStatus(value as string)} /></div>
              <div className="owner-choices"><Checkbox label="Только мои" checked={checked} onCheckedChange={setChecked} /><Radio label="Источник" options={[{ value: 'local', label: 'Локально' }, { value: 'cloud', label: 'Облако' }]} value={choice} onValueChange={setChoice} /><Toggle label="Уведомления" checked={enabled} onCheckedChange={setEnabled} /><Checkbox label="Показать loading" checked={loading} onCheckedChange={setLoading} /></div>
              <Table label="Проекты" columns={columns} data={filtered} rowKey={row => row.id} emptyState="Проекты не найдены" />
            </section>
          </SedaProvider>
        </main>
        <aside className="owner-inspector" aria-label="Источники и готовность"><Text as="h2" variant="heading/compact">Источники</Text><dl><dt>Профиль</dt><dd>{profile.id}</dd><dt>Формула</dt><dd>{geometry.formula}</dd><dt>Высота</dt><dd>{geometry.height} px</dd><dt>Пакет</dt><dd>@seda-ai/ui</dd></dl><h3>Выбранный токен</h3>{currentToken && <><p className="owner-token-path">components/{currentToken.path}</p><dl><dt>Источник</dt><dd>{originalToken?.authored}</dd><dt>Черновик</dt><dd>{tokenEdits[currentToken.path] ?? 'без изменений'}</dd><dt>Значение</dt><dd>{selectedDetail?.value ?? 'не разрешено'}</dd><dt>CSS</dt><dd>{currentToken.variables.join(', ')}</dd></dl><p>Цепочка: {selectedDetail?.chain.join(' → ') ?? 'проверьте значение'}</p></>}<h3>Граница готовности</h3><p>На экране показаны настоящие SEDA Button, IconButton, TextField, Select, Checkbox, Radio, Toggle и Table. Геометрия Table остаётся экспериментальной композицией.</p><p>Остальные публичные модули доступны в пакете; отдельные истории и визуальная приёмка будут добавляться по мере проверки контрактов.</p><h3>Токены</h3><p>Редактор меняет только цветовые листья компонентов с действующими CSS-привязками. Черновик хранится в этом браузере и не меняет tokens.json до выпуска через PR.</p><details className="owner-catalog"><summary>Публичный API · {componentCoverage.publicComponents.length}</summary><ul>{componentCoverage.publicComponents.map((name: string) => <li key={name}><span>{name}</span><small>{componentCoverage.contractComponents.includes(name) ? 'контракт' : 'API'}</small></li>)}</ul></details></aside>
      </div>
    </div>
  </SedaProvider>;
}

createRoot(document.getElementById('root')!).render(<OwnerLab />);
