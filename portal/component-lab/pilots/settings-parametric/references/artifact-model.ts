/** A local document next to Chat. The source message is a proposal, never an automatic edit. */
export interface ArtifactRevision {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}
export interface ArtifactProposal {
  sourceMessageId: string;
  baseTitle: string;
  baseBody: string;
  body: string;
}
export interface ArtifactDocument {
  threadId: string;
  title: string;
  body: string;
  revisions: ArtifactRevision[];
  proposal: ArtifactProposal | null;
}

export const artifactKey = (threadId: string) => `seda.reference.chat.artifact.v1:${threadId}`;
export const blankArtifact = (threadId: string): ArtifactDocument => ({
  threadId, title: 'Новый артефакт', body: '', revisions: [], proposal: null,
});

const validText = (value: unknown, limit: number) => typeof value === 'string' && value.length <= limit;
export function readArtifact(raw: string | null, threadId: string): ArtifactDocument {
  if (!raw) return blankArtifact(threadId);
  if (raw.length > 2_500_000) throw new Error('Артефакт превышает допустимый объём');
  const value = JSON.parse(raw);
  if (value?.version !== 1 || value.threadId !== threadId || !validText(value.title, 160) ||
    !validText(value.body, 100_000) || !Array.isArray(value.revisions) || value.revisions.length > 30) {
    throw new Error('Артефакт повреждён или относится к другому чату');
  }
  const ids = new Set<string>();
  for (const revision of value.revisions) {
    if (!validText(revision?.id, 160) || !revision.id || ids.has(revision.id) ||
      !validText(revision.title, 160) || !validText(revision.body, 100_000) ||
      !Number.isFinite(revision.createdAt)) throw new Error('История артефакта повреждена');
    ids.add(revision.id);
  }
  const proposal = value.proposal;
  if (proposal !== null && (!validText(proposal?.sourceMessageId, 160) || !proposal.sourceMessageId ||
    !validText(proposal.baseTitle, 160) || !validText(proposal.baseBody, 100_000) ||
    !validText(proposal.body, 100_000))) throw new Error('Предложение артефакта повреждено');
  return {threadId, title: value.title, body: value.body, revisions: value.revisions, proposal};
}

export const serializeArtifact = (document: ArtifactDocument) => JSON.stringify({version: 1, ...document});

export function saveArtifactVersion(document: ArtifactDocument, id: string, createdAt: number): ArtifactDocument {
  if (!document.title.trim() || !document.body.trim()) throw new Error('Добавьте название и содержимое');
  const latest = document.revisions.at(-1);
  if (latest?.title === document.title && latest.body === document.body) return document;
  if (!id || !Number.isFinite(createdAt)) throw new Error('Неверный идентификатор версии');
  return {...document, revisions: [...document.revisions.slice(-29), {id, title: document.title, body: document.body, createdAt}]};
}

export function proposeMessage(document: ArtifactDocument, sourceMessageId: string, body: string): ArtifactDocument {
  if (!sourceMessageId || sourceMessageId.length > 160 || !body.trim() || body.length > 100_000)
    throw new Error('Это сообщение нельзя перенести в артефакт');
  return {...document, proposal: {sourceMessageId, baseTitle: document.title, baseBody: document.body, body}};
}

export function acceptProposal(document: ArtifactDocument, id: string, createdAt: number): ArtifactDocument {
  const proposal = document.proposal;
  if (!proposal || proposal.baseTitle !== document.title || proposal.baseBody !== document.body)
    throw new Error('Артефакт изменился после предложения. Отклоните предложение и создайте новое.');
  return saveArtifactVersion({...document, body: proposal.body, proposal: null}, id, createdAt);
}

export function restoreArtifactVersion(document: ArtifactDocument, id: string): ArtifactDocument {
  const revision = document.revisions.find(item => item.id === id);
  if (!revision) throw new Error('Версия не найдена');
  return {...document, title: revision.title, body: revision.body, proposal: null};
}
