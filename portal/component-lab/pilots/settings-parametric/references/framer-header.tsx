import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, DropdownMenu, IconButton, Text } from '@seda-ai/ui';
import type { MenuAction } from '@seda-ai/ui';
import { ReferenceGlyph } from './reference-glyph';

type ActionId = 'layout' | 'vector' | 'add' | 'export' | 'redo' | 'undo' | 'preview';
const hideOrder: readonly ActionId[] = ['layout', 'vector', 'add', 'export', 'redo', 'undo', 'preview'];

interface FramerHeaderProps {
  densityKey: string;
  locked: boolean;
  pending: boolean;
  busy: boolean;
  canUndo: boolean;
  canRedo: boolean;
  readOnly: boolean;
  onScope: () => void;
  onAddText: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSave: () => void;
  onExport: () => void;
  onPublish: () => void;
}

const sourceIcon = (name: string) => <ReferenceGlyph file={'framer-header-' + name + '.svg'} />;

/** Keep primary actions visible while lesser actions move into the SEDA menu. */
export function FramerHeader(props: FramerHeaderProps) {
  const header = useRef<HTMLElement>(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [width, setWidth] = useState(0);
  const hidden = new Set(hideOrder.slice(0, hiddenCount));

  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      const next = element.clientWidth;
      setWidth(old => old === next ? old : next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => { setHiddenCount(0); }, [width, props.densityKey]);
  useLayoutEffect(() => {
    const element = header.current;
    if (element && element.scrollWidth > element.clientWidth + 1 && hiddenCount < hideOrder.length) {
      setHiddenCount(hiddenCount + 1);
    }
  }, [hiddenCount, width, props.densityKey]);

  const blocked = props.locked || props.pending;
  const action: Record<ActionId, MenuAction> = {
    layout: { id: 'layout', label: 'Layout tools — not implemented', disabled: true, onSelect: () => {} },
    vector: { id: 'vector', label: 'Vector — not implemented', disabled: true, onSelect: () => {} },
    add: { id: 'add', label: 'Add text', disabled: blocked, onSelect: props.onAddText },
    export: { id: 'export', label: 'Export', onSelect: props.onExport },
    redo: { id: 'redo', label: 'Redo', disabled: !props.canRedo || blocked, onSelect: props.onRedo },
    undo: { id: 'undo', label: 'Undo', disabled: !props.canUndo || blocked, onSelect: props.onUndo },
    preview: { id: 'preview', label: props.readOnly ? 'Exit preview' : 'Preview', onSelect: props.onPreview },
  };
  const menuItems = hideOrder.filter(id => hidden.has(id)).map(id => action[id]);

  return <header ref={header} className="fr-header" data-workspace-actions="adaptive" data-overflow-count={hiddenCount}>
    <Button variant="secondary" iconLeft={sourceIcon('imgIcon')} onClick={props.onScope}>Canvas</Button>
    <IconButton aria-label="Insert text" icon={sourceIcon('imgGroup')} variant="ghost" disabled={blocked} onClick={props.onAddText} />
    {!hidden.has('layout') && <IconButton aria-label="Layout tools — not implemented" icon={sourceIcon('imgIcon1')} variant="ghost" disabled />}
    {!hidden.has('add') && <IconButton aria-label="Add text" icon={sourceIcon('imgGroup1')} variant="ghost" disabled={blocked} onClick={props.onAddText} />}
    {!hidden.has('vector') && <IconButton aria-label="Vector — not implemented" icon={sourceIcon('imgIcon2')} variant="ghost" disabled />}
    <Text as="span" variant="label/default" className="fr-title" title="Skills Design System Demo (copy) · main">Skills Design System Demo (copy) · main</Text>
    {!hidden.has('undo') && <Button variant="ghost" disabled={!props.canUndo || blocked} onClick={props.onUndo}>Undo</Button>}
    {!hidden.has('redo') && <Button variant="ghost" disabled={!props.canRedo || blocked} onClick={props.onRedo}>Redo</Button>}
    {!hidden.has('preview') && <Button id="fr-preview" variant="ghost" aria-pressed={props.readOnly} onClick={props.onPreview}>Preview</Button>}
    <Button id="fr-save" loading={props.busy} disabled={blocked} onClick={props.onSave}>Save</Button>
    {!hidden.has('export') && <Button variant="ghost" onClick={props.onExport}>Export</Button>}
    <Button onClick={props.onPublish}>Publish</Button>
    {hiddenCount > 0 && <DropdownMenu id="fr-more" triggerLabel="More actions" triggerIcon={<span aria-hidden="true">⋯</span>} iconOnly items={menuItems} align="end" />}
  </header>;
}
