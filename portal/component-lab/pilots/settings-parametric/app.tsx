import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, IconButton, TextField } from '@seda-ai/ui';
import { createFormState, transitionForm } from '../../../../packages/seda-contracts/src/form.mjs';
import { createWebBindings, bindWebRecipe } from '../../../../packages/seda-contracts/src/web.mjs';
import { profiles, profile, provenance } from 'seda:catalog';
import { ReviewFixtures } from './test-fixtures';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@seda-ai/ui/styles.css';
import './styles.css';

type Configuration = { theme: 'Light' | 'Dark'; controlSize: 's' | 'm' | 'l' | 'xl'; density: 'regular' };
type TransportMode = 'success' | 'failure' | 'manual';
type RequestRecord = { requestId: number; value: string; status: 'pending' | 'success' | 'failure' };
const isReview = new URLSearchParams(window.location.search).get('review') === '1';
const initialConfiguration: Configuration = { ...profile.configuration };
const HelpIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><path d="M9.7 9.4a2.4 2.4 0 0 1 4.5 1.2c0 1.8-2.2 2-2.2 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="16.7" r=".85" fill="currentColor"/></svg>;
const ArrowIcon = () => <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

function App() {
  const [configuration, setConfiguration] = useState<Configuration>(initialConfiguration);
  const [replacement, setReplacement] = useState<any>(null);
  const [form, setForm] = useState(() => createFormState('SEDA AI'));
  const [transportMode, setTransportModeState] = useState<TransportMode>('success');
  const [requestRevision, setRequestRevision] = useState(0);
  const [inspectedRole, setInspectedRole] = useState('save');
  const formRef = useRef(form);
  const configurationRef = useRef(configuration);
  const replacementRef = useRef<any>(null);
  const transportRef = useRef<TransportMode>('success');
  const requestsRef = useRef<RequestRecord[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const generationRef = useRef(0);
  const routeRef = useRef<'click' | 'enter' | 'programmatic' | 'retry'>('programmatic');
  const fieldRef = useRef<HTMLInputElement>(null);
  const compiled = replacement ?? profiles[`${configuration.theme}:${configuration.controlSize}`];
  const bindings = createWebBindings(compiled);

  const activeCompiled = () => replacementRef.current ?? profiles[`${configurationRef.current.theme}:${configurationRef.current.controlSize}`];
  const refreshRequests = () => setRequestRevision(value => value + 1);

  function dispatch(event: any) {
    const result = transitionForm(formRef.current, event, activeCompiled().form.policy);
    // Update before React renders: multiple submit routes in one event loop share the guard.
    formRef.current = result.state;
    setForm(result.state);
    for (const effect of result.effects) {
      if (effect.type === 'focus') {
        if (effect.target === 'projectName') fieldRef.current?.focus();
      } else if (effect.type === 'save') {
        requestsRef.current.push({ requestId: effect.requestId, value: effect.value, status: 'pending' });
        refreshRequests();
        const outcome = transportRef.current;
        if (outcome !== 'manual') {
          const generation = generationRef.current;
          const timer = setTimeout(() => {
            timersRef.current.delete(timer);
            if (generation === generationRef.current) respond(effect.requestId, outcome);
          }, 900);
          timersRef.current.add(timer);
        }
      }
    }
  }

  function respond(requestId: number, outcome: 'success' | 'failure') {
    if (!['success', 'failure'].includes(outcome)) throw new TypeError('Response must be success or failure.');
    const request = requestsRef.current.find(item => item.requestId === requestId);
    // The model also receives unknown/duplicate IDs so its stale-response guard remains authoritative.
    dispatch({ type: outcome === 'success' ? 'saveSucceeded' : 'saveFailed', requestId });
    if (request?.status === 'pending') { request.status = outcome; refreshRequests(); }
  }

  function configure(update: Partial<Configuration>) {
    if (!update || typeof update !== 'object' || Array.isArray(update)) throw new TypeError('Configuration update must be an object.');
    if (Object.keys(update).some(key => !['theme', 'controlSize', 'density'].includes(key))) throw new TypeError('Unknown configuration option.');
    const next = { ...configurationRef.current, ...update };
    if (next.density !== 'regular' || !profiles[`${next.theme}:${next.controlSize}`]) throw new TypeError('Unsupported profile configuration.');
    dispatch({ type: 'profileChanged' });
    configurationRef.current = next;
    replacementRef.current = null;
    setReplacement(null);
    setConfiguration(next);
  }

  function setTransportMode(mode: TransportMode) {
    if (!['success', 'failure', 'manual'].includes(mode)) throw new TypeError('Unsupported demo transport mode.');
    transportRef.current = mode;
    setTransportModeState(mode);
  }

  function reset() {
    generationRef.current += 1;
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    requestsRef.current = [];
    routeRef.current = 'programmatic';
    const next = createFormState('SEDA AI');
    formRef.current = next;
    setForm(next);
    configurationRef.current = { ...initialConfiguration };
    setConfiguration(configurationRef.current);
    replacementRef.current = null;
    setReplacement(null);
    setTransportMode('success');
    refreshRequests();
  }

  function replaceCompiled(candidate: any) {
    if (!isReview) throw new Error('Compiled replacement is available only in the review fixture.');
    createWebBindings(candidate);
    if (!profiles[`${candidate.configuration.theme}:${candidate.configuration.controlSize}`]) throw new Error('Unsupported replacement configuration.');
    const next = structuredClone(candidate);
    dispatch({ type: 'profileChanged' });
    configurationRef.current = { ...next.configuration };
    setConfiguration(configurationRef.current);
    replacementRef.current = next;
    setReplacement(next);
  }

  useEffect(() => {
    document.documentElement.dataset.theme = compiled.domTheme;
  }, [compiled.domTheme]);

  useEffect(() => {
    (window as any).sedaPilot = {
      configure, setTransportMode, respond, reset,
      getState: () => structuredClone(formRef.current),
      getCompiled: () => structuredClone(activeCompiled()),
      getEvidence: () => structuredClone(createWebBindings(activeCompiled())),
      getRequests: () => structuredClone(requestsRef.current),
      ...(isReview ? { replaceCompiled } : {}),
    };
  });

  useEffect(() => () => {
    generationRef.current += 1;
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    delete (window as any).sedaPilot;
  }, []);

  const handlers = {
    'form.change': (event: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: 'change', value: event.currentTarget.value }),
    'form.blur': () => dispatch({ type: 'blur' }),
    'form.cancel': () => dispatch({ type: 'cancel' }),
    'form.toggleHelp': () => dispatch({ type: 'toggleHelp' }),
  };
  const slots = { 'help-icon': <HelpIcon/> };
  const propsFor = (role: string): any => bindWebRecipe(profile.recipes[role], compiled.configuration, form, { handlers, slots });
  const requests = requestsRef.current;
  const lastRequest = requests[requests.length - 1];
  const stateLabel = form.saving ? 'Сохранение…' : form.saveError ? 'Не удалось сохранить' : form.dirty ? 'Есть несохранённые изменения' : lastRequest?.status === 'success' ? 'Изменения сохранены' : 'Все изменения сохранены';
  const evidence = bindings.recipes[inspectedRole].evidence;
  const geometry = compiled.geometry;

  return <main className="parametric-shell" data-theme={compiled.domTheme}>
    <header className="lab-header">
      <a className="lab-brand" href="#" aria-label="SEDA AI, начало страницы"><span className="lab-mark" aria-hidden="true"><i/><i/><i/></span>SEDA <span>AI</span></a>
      <span className="lab-breadcrumb">Лаборатория <span>/</span> Параметрическая форма</span>
      <span className="lab-stage">Этап 03</span>
    </header>

    <div className="lab-intro">
      <div><p className="lab-eyebrow">ОДИН ПРОФИЛЬ · СВЯЗАННЫЕ КОМПОНЕНТЫ</p><h1>Настроить один раз.</h1><p className="lab-lead">Измените тему или размер. Поле и действия обновятся вместе, сохраняя введённые данные.</p></div>
      <div className="lab-profile-label"><span className="lab-status-dot"/> settings-form <span>v0.1</span></div>
    </div>

    <div className="lab-workspace">
      <aside className="lab-sidebar" aria-label="Настройки профиля">
        <section className="lab-panel">
          <div className="lab-section-title"><span className="lab-section-number">01</span><h2>Профиль</h2></div>
          <label className="lab-control" htmlFor="profile-theme"><span>Тема</span><select id="profile-theme" value={configuration.theme} onChange={event => configure({ theme: event.target.value as Configuration['theme'] })}><option value="Light">Светлая</option><option value="Dark">Тёмная</option></select></label>
          <label className="lab-control" htmlFor="profile-size"><span>Размер контролов</span><select id="profile-size" value={configuration.controlSize} onChange={event => configure({ controlSize: event.target.value as Configuration['controlSize'] })}>{['s', 'm', 'l', 'xl'].map(size => <option key={size} value={size}>{size.toUpperCase()} · {profiles[`${configuration.theme}:${size}`].geometry.height.value} px</option>)}</select></label>
          <div className="lab-density"><span>Плотность</span><span>Regular</span></div>
          <p className="lab-muted">Общий размер применяется ко всем четырём элементам формы.</p>
        </section>

        <section className="lab-panel">
          <div className="lab-section-title"><span className="lab-section-number">02</span><h2>Проверить сохранение</h2></div>
          <label className="lab-control" htmlFor="transport-mode"><span>Ответ демо-сервера</span><select id="transport-mode" value={transportMode} onChange={event => setTransportMode(event.target.value as TransportMode)}><option value="success">Успешно</option><option value="failure">Ошибка</option><option value="manual">Ответить вручную</option></select></label>
          <p className="lab-muted">Учебный сценарий: данные остаются на этой странице. Можно редактировать поле, пока выполняется запрос.</p>
          {transportMode === 'manual' && <div className="lab-manual-actions"><button type="button" disabled={!form.saving} onClick={() => form.activeRequest && respond(form.activeRequest.id, 'success')}>Успех</button><button type="button" disabled={!form.saving} onClick={() => form.activeRequest && respond(form.activeRequest.id, 'failure')}>Ошибка</button></div>}
        </section>

        <div className="lab-sidebar-foot"><span className="lab-connected-icon" aria-hidden="true">↳</span><p>Button · IconButton · TextField<br/><span>Реальные компоненты SEDA</span></p></div>
      </aside>

      <section className="lab-preview" aria-label="Живой пример">
        <div className="lab-preview-topline"><span>ПРЕДПРОСМОТР</span><span>{configuration.theme} <span className="lab-divider">/</span> {configuration.controlSize.toUpperCase()}</span></div>
        <article className="settings-card" style={bindings.layout.vars as React.CSSProperties}>
          <div className="settings-heading"><div className="settings-project-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></div><div><p>ПРОЕКТ</p><h2 id="settings-title">Настройки проекта</h2></div></div>
          <p className="settings-description">Основная информация о вашем проекте.</p>
          <form id="settings-form" noValidate={compiled.form.policy.noValidate} aria-labelledby="settings-title" onKeyDown={event => { if (event.key === 'Enter' && event.target instanceof HTMLInputElement) routeRef.current = 'enter'; }} onSubmit={event => { event.preventDefault(); const route = formRef.current.saveError ? 'retry' : routeRef.current; routeRef.current = 'programmatic'; dispatch({ type: 'submit', route }); }}>
            <div className="settings-fields"><div className="settings-field-slot" {...bindings.recipes.projectName.attributes} style={bindings.recipes.projectName.vars as React.CSSProperties}><TextField {...propsFor('projectName')} id="project-name" ref={fieldRef}/></div></div>
            <div className="settings-actions"><Button {...propsFor('save')} {...bindings.recipes.save.attributes} style={bindings.recipes.save.vars as React.CSSProperties} id="save-button" onClick={() => { if (routeRef.current !== 'enter') routeRef.current = 'click'; }}/><Button {...propsFor('cancel')} {...bindings.recipes.cancel.attributes} style={bindings.recipes.cancel.vars as React.CSSProperties} id="cancel-button"/><div className="settings-help-row"><IconButton {...propsFor('help')} {...bindings.recipes.help.attributes} style={bindings.recipes.help.vars as React.CSSProperties} id="help-button" aria-controls="help-panel"/><span>{compiled.instances.help.visibleExplanation}</span></div></div>
            <div id="help-panel" className="settings-help-panel" hidden={!form.helpExpanded}>{compiled.copy.helpText}</div>
            {form.saveError && <p id="form-error" className="settings-form-error" role="alert">{form.saveError}</p>}
            <p className="settings-status" role="status" aria-live="polite" data-saving={form.saving ? 'true' : undefined} data-error={form.saveError ? 'true' : undefined}><span aria-hidden="true">{form.saving ? '◌' : form.saveError ? '!' : form.dirty ? '•' : '✓'}</span>{stateLabel}</p>
          </form>
        </article>
        <div className="lab-metrics" aria-label="Разрешённая геометрия"><div><span>Высота</span><strong>{geometry.height.value}<small>px</small></strong></div><div><span>Радиус</span><strong>{geometry.radius.value}<small>px</small></strong></div><div><span>Текст / строка</span><strong>{geometry.fontSize.value}<small>/ {geometry.lineHeight.value}</small></strong></div><div><span>Связанных элементов</span><strong>4</strong></div></div>
      </section>
    </div>

    <details className="lab-explain" id="source-explanation">
      <summary><span className="lab-section-number">03</span><span><strong>Откуда берутся значения</strong><span>Применённые CSS-переменные и цепочки токенов</span></span><ArrowIcon/></summary>
      <div className="lab-explain-content"><label className="lab-control lab-inspect-select" htmlFor="inspect-component"><span>Элемент</span><select id="inspect-component" value={inspectedRole} onChange={event => setInspectedRole(event.target.value)}><option value="save">Button · Сохранить</option><option value="cancel">Button · Отмена</option><option value="help">IconButton · Справка</option><option value="projectName">TextField · Название проекта</option></select></label><p className="lab-muted">Здесь показаны значения, назначенные адаптером. Состояние наведения, фокуса или отключения выбирает соответствующую роль в CSS.</p><div className="lab-evidence-table"><table><thead><tr><th>CSS-переменная</th><th>Значение</th><th>Источник</th></tr></thead><tbody>{evidence.map((item: any) => <tr key={item.property}><td><code>{item.property}</code></td><td><code>{String(item.cssValue)}</code></td><td>{item.chain?.length ? item.chain.map((step: any, index: number) => <span className="lab-token-step" key={index}>{index > 0 && <span aria-hidden="true"> → </span>}<code>{step.collection ? `${step.collection}/` : ''}{Array.isArray(step.path) ? step.path.join('/') : step.path ?? step.ref ?? JSON.stringify(step)}{step.mode ? ` [${step.mode}]` : ''}</code></span>) : <code>{item.source || 'system.json · adapter'}</code>}</td></tr>)}</tbody></table></div><div className="lab-provenance"><span>Исходная сборка · tokens.json · SHA-256</span><code>{provenance.tokensSha256}</code></div></div>
    </details>

    <footer className="lab-footer"><span>SEDA AI · исполняемый профиль</span><span>Light / Dark · S–XL · regular</span><span>Запросов в демо: <strong>{requests.length}</strong></span></footer>
    {isReview && <ReviewFixtures compiled={compiled}/>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App/>);
