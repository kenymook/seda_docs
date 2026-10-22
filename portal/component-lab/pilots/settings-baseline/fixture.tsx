import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, IconButton, TextField } from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';
import './harness.css';
declare const __SEDA_REFERENCE_MATCH__: boolean;

const HelpIcon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor"/><path d="M6.2 6.1a1.8 1.8 0 1 1 3.2 1.1C8.7 8 8 8.2 8 9.4" stroke="currentColor" strokeLinecap="round"/><circle cx="8" cy="11.2" r=".6" fill="currentColor"/></svg>;

function App() {
  const [size, setSize] = useState<'s'|'m'|'l'|'xl'>('m');
  const [theme, setTheme] = useState('light');
  const [projectName, setProjectName] = useState('SEDA AI');
  const [loading, setLoading] = useState(false);
  const [fieldMode, setFieldMode] = useState('default');
  const [submitCount, setSubmitCount] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    (window as any).baselineApi = {
      setSize, setTheme, setLoading, setFieldMode, setProjectName, setSubmitCount, setNotice,
      getState: () => ({ size, theme, projectName, loading, fieldMode, submitCount }),
    };
  }, [size,theme,projectName,loading,fieldMode,submitCount]);

  return <main className="baseline-shell">
    <header className="baseline-heading">
      <p className="baseline-eyebrow">SEDA AI · реализация из репозитория</p>
      <h1>Форма настроек</h1>
      <p>Эталон сравнения: 354e19a. {__SEDA_REFERENCE_MATCH__ ? 'Семь проверенных исходных файлов совпадают с эталоном.' : 'Исходники отличаются от эталона — см. metadata сборки.'}</p>
    </header>
    <section className="baseline-controls" aria-label="Настройки диагностического стенда">
      <label>Размер <select id="harness-size" value={size} onChange={e=>setSize(e.target.value as any)}>{['s','m','l','xl'].map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Тема <select id="harness-theme" value={theme} onChange={e=>setTheme(e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <label>Поле <select id="harness-field-mode" value={fieldMode} onChange={e=>setFieldMode(e.target.value)}>{['default','errorText','state-error','state-disabled','disabled','readOnly'].map(s=><option key={s}>{s}</option>)}</select></label>
      <label><input id="harness-loading" type="checkbox" checked={loading} onChange={e=>setLoading(e.target.checked)}/> Loading</label>
    </section>
    <section className="baseline-card">
      <h2>Настройки проекта</h2>
      <form id="settings-form" noValidate onSubmit={e=>{e.preventDefault(); setSubmitCount(c=>c+1); setNotice('Отправка формы '+(submitCount+1));}}>
        <TextField id="project-name" label="Название проекта" size={size}
          value={projectName} onChange={e=>setProjectName(e.target.value)}
          helperText="Название, которое увидит команда"
          errorText={fieldMode==='errorText' ? 'Введите название проекта' : undefined}
          state={fieldMode==='state-error' ? 'error' : fieldMode==='state-disabled' ? 'disabled' : 'default'}
          disabled={fieldMode==='disabled'} readOnly={fieldMode==='readOnly'}/>
        <div className="baseline-actions">
          <Button id="save-button" type="submit" variant="primary" size={size} loading={loading}>Сохранить</Button>
          <div className="baseline-help">
            <IconButton id="help-button" aria-label="Справка о названии проекта" icon={<HelpIcon/>} size={size} onClick={()=>setNotice('Название используется в списке проектов.')}/>
            <span>Справка о названии проекта</span>
          </div>
        </div>
        <p className="baseline-notice" aria-live="polite">{notice}</p>
      </form>
    </section>
    <footer className="baseline-footnote">Плотность стенда: regular. Ширина содержимого 520 px, поле → действия 24 px, gap действий 12 px. Значения заданы для baseline и не являются общим параметрическим движком.</footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App/>);
