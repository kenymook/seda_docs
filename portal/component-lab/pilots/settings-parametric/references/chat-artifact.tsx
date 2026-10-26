import React, {useEffect, useState} from 'react';
import {Alert, Button, Icon, IconButton, Select, Tabs, Text, TextArea, TextField} from '@seda-ai/ui';
import {
  acceptProposal, artifactKey, blankArtifact, proposeMessage, readArtifact,
  restoreArtifactVersion, saveArtifactVersion, serializeArtifact,
} from './artifact-model';
import type {ArtifactDocument} from './artifact-model';

interface SourceMessage {id: string; text: string}
interface ArtifactWorkspaceProps {threadId: string; source: SourceMessage | null; onSourceConsumed: () => void; onClose: () => void}

export function ArtifactWorkspace({threadId, source, onSourceConsumed, onClose}: ArtifactWorkspaceProps) {
  const [document, setDocument] = useState<ArtifactDocument | null>(null);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('Загрузка…');
  const [tab, setTab] = useState('edit');
  const [selectedVersion, setSelectedVersion] = useState('');
  useEffect(() => {
    setDocument(null);
    try {
      setDocument(readArtifact(localStorage.getItem(artifactKey(threadId)), threadId));
      setSaveState('Сохранено в этом браузере');
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось прочитать артефакт');
      setSaveState('Требуется восстановление');
    }
  }, [threadId]);

  function apply(change: (current: ArtifactDocument) => ArtifactDocument) {
    if (!document) return false;
    try {
      const next = change(document);
      readArtifact(serializeArtifact(next), threadId);
      setDocument(next);
      try {
        localStorage.setItem(artifactKey(threadId), serializeArtifact(next));
        setSaveState('Сохранено в этом браузере');
        setError('');
      } catch {
        setSaveState('Сохранение не удалось');
        setError('Изменения остались на экране. Освободите место и повторите сохранение.');
      }
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Изменение отклонено');
      return false;
    }
  }

  useEffect(() => {
    if (!document || !source) return;
    apply(current => proposeMessage(current, source.id, source.text));
    onSourceConsumed();
  }, [document?.threadId, source?.id]);

  function recover() {
    try {
      localStorage.removeItem(artifactKey(threadId));
      setDocument(blankArtifact(threadId));
      setSaveState('Пустой артефакт');
      setError('');
    } catch {
      setError('Не удалось восстановить артефакт. Исходные данные не удалены.');
    }
  }

  const currentVersion = document?.revisions.at(-1);
  const changed = !!document && (!currentVersion || currentVersion.title !== document.title || currentVersion.body !== document.body);
  const proposal = document?.proposal;
  const versionValue = document?.revisions.some(revision => revision.id === selectedVersion) ? selectedVersion : currentVersion?.id ?? '';
  return <aside className="chat-artifact" data-workspace-inspector="artifact" aria-label="Артефакт">
    <header className="chat-artifact__header">
      <div><Text as="p" variant="label/xsmall" className="chat-artifact__kicker">ДИАЛОГ · ДОКУМЕНТ</Text><Text as="h2" variant="heading/panel">Артефакт</Text></div>
      <IconButton variant="ghost" aria-label="Закрыть артефакт" tooltip="Закрыть артефакт" icon={<Icon name="close"/>} onClick={onClose}/>
    </header>
    <Text as="p" variant="caption/default" className="chat-artifact__scope">Локальный документ текущего чата. Ответы по образцу предлагают текст только после вашего выбора.</Text>
    {!document ? <div className="chat-artifact__recovery"><Alert variant="warning" title="Артефакт не загружен" description={error}/><Button onClick={recover}>Создать пустой артефакт</Button></div> : <>
      <div className="chat-artifact__meta"><Text as="span" variant="caption/default">Версий: {document.revisions.length}</Text><Text as="span" variant="caption/default" id="artifact-save-state" role="status">{saveState}</Text></div>
      {proposal && <section className="chat-artifact__proposal" aria-label="Предложение из сообщения">
        <Text as="h3" variant="label/default">Предложение из сообщения</Text>
        <Text as="p" variant="caption/default">Текущий текст останется прежним до подтверждения.</Text>
        <Text as="div" variant="body/small" className="chat-artifact__proposal-text">{proposal.body}</Text>
        <div className="chat-artifact__actions"><Button id="artifact-accept" onClick={() => apply(current => acceptProposal(current, crypto.randomUUID(), Date.now()))}>Принять и сохранить версию</Button><Button id="artifact-reject" variant="secondary" onClick={() => apply(current => ({...current, proposal: null}))}>Отклонить</Button></div>
      </section>}
      <div className="chat-artifact__work">
        <TextField id="artifact-title" label="Название артефакта" value={document.title} maxLength={160} onChange={event => apply(current => ({...current, title: event.target.value, proposal: null}))}/>
        <Tabs id="artifact-tabs" label="Вид артефакта" value={tab} onValueChange={setTab} variant="line" items={[
          {value:'edit',label:'Редактирование',content:<TextArea id="artifact-body" label="Содержимое" value={document.body} maxLength={100_000} rows={12} resize="vertical" onChange={event => apply(current => ({...current, body: event.target.value, proposal: null}))}/>},
          {value:'preview',label:'Просмотр',content:<div id="artifact-preview" className="chat-artifact__preview"><Text as="h3" variant="heading/compact">{document.title || 'Без названия'}</Text><Text as="div" variant="body/default">{document.body || 'Документ пока пуст'}</Text></div>},
        ]}/>
        <div className="chat-artifact__actions"><Button id="artifact-save-version" disabled={!changed || !document.title.trim() || !document.body.trim()} onClick={() => apply(current => saveArtifactVersion(current, crypto.randomUUID(), Date.now()))}>Сохранить версию</Button>{changed && <Text as="span" variant="caption/default">Есть правки после последней версии</Text>}</div>
        {!!document.revisions.length && <section className="chat-artifact__versions" aria-label="История артефакта">
          <Text as="h3" variant="label/default">История версий</Text>
          <Select id="artifact-version" label="Версия" value={versionValue} onValueChange={value => setSelectedVersion(String(value))} options={document.revisions.map((revision, index) => ({value:revision.id,label:`Версия ${index+1} · ${new Date(revision.createdAt).toLocaleString('ru-RU')}`}))}/>
          <Button id="artifact-restore" variant="secondary" onClick={() => apply(current => restoreArtifactVersion(current, versionValue))}>Восстановить в редакторе</Button>
        </section>}
      </div>
    </>}
    {error && document && <div className="chat-artifact__recovery"><Alert variant="warning" title="Изменение не сохранено" description={error}/>{saveState==='Сохранение не удалось'&&<Button id="artifact-retry-save" variant="secondary" onClick={() => apply(current => current)}>Повторить сохранение</Button>}</div>}
  </aside>;
}
