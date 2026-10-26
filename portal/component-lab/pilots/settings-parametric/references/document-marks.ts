export type TextMarkKind = 'bold' | 'italic' | 'code';
export interface TextMark {kind: TextMarkKind; start: number; end: number}
export const markKinds: readonly TextMarkKind[] = ['bold', 'italic', 'code'];

/** Canonical non-overlapping ranges per mark kind; different kinds may overlap. */
export function normalizeMarks(marks: readonly TextMark[], length: number): TextMark[] {
  if (!Number.isInteger(length) || length < 0) throw Error('Некорректная длина текста');
  const byKind = new Map<TextMarkKind, TextMark[]>();
  for (const mark of marks) {
    if (!markKinds.includes(mark.kind) || !Number.isInteger(mark.start) || !Number.isInteger(mark.end) || mark.start < 0 || mark.end > length || mark.start >= mark.end) throw Error('Повреждено форматирование текста');
    byKind.set(mark.kind, [...(byKind.get(mark.kind) ?? []), {...mark}]);
  }
  const result: TextMark[] = [];
  for (const kind of markKinds) {
    const ranges = (byKind.get(kind) ?? []).sort((a, b) => a.start - b.start || a.end - b.end);
    for (const range of ranges) {
      const last = result.at(-1);
      if (last?.kind === kind && range.start <= last.end) last.end = Math.max(last.end, range.end);
      else result.push({...range});
    }
  }
  return result;
}

export function toggleMark(marks: readonly TextMark[], length: number, kind: TextMarkKind, start: number, end: number): TextMark[] {
  if (!markKinds.includes(kind) || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= end || end > length) throw Error('Выделите текст внутри одного блока');
  const canonical = normalizeMarks(marks, length);
  const selected = canonical.filter(mark => mark.kind === kind).sort((a, b) => a.start - b.start);
  let cursor = start;
  for (const mark of selected) {
    if (mark.end <= cursor) continue;
    if (mark.start > cursor) break;
    cursor = Math.max(cursor, mark.end);
    if (cursor >= end) break;
  }
  if (cursor < end) return normalizeMarks([...canonical, {kind, start, end}], length);
  return normalizeMarks(canonical.flatMap(mark => mark.kind !== kind || mark.end <= start || mark.start >= end ? [mark] : [
    ...(mark.start < start ? [{kind, start:mark.start, end:start}] : []),
    ...(mark.end > end ? [{kind, start:end, end:mark.end}] : []),
  ]), length);
}

/** Map marks through one contiguous replacement inferred from the changed plain text. */
export function remapMarks(before: string, after: string, marks: readonly TextMark[]): TextMark[] {
  if (before === after) return normalizeMarks(marks, after.length);
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let suffix = 0;
  while (suffix < before.length - start && suffix < after.length - start && before[before.length-1-suffix] === after[after.length-1-suffix]) suffix++;
  const oldEnd = before.length-suffix, inserted = after.length-start-suffix, delta = after.length-before.length;
  return normalizeMarks(marks.flatMap(mark => {
    if (mark.end <= start) return [mark];
    if (mark.start >= oldEnd) return [{...mark,start:mark.start+delta,end:mark.end+delta}];
    if (mark.start <= start && mark.end >= oldEnd) return [{...mark,end:mark.end+delta}];
    if (mark.start < start) return [{...mark,end:start}];
    if (mark.end > oldEnd) return [{...mark,start:start+inserted,end:mark.end+delta}];
    return [];
  }).filter(mark=>mark.start<mark.end), after.length);
}

export function splitMarks(marks: readonly TextMark[], textLength: number, start: number, end: number): [TextMark[], TextMark[]] {
  const canonical = normalizeMarks(marks, textLength);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || end > textLength) throw Error('Некорректная позиция разделения');
  return [
    normalizeMarks(canonical.flatMap(mark => mark.start < start ? [{...mark,end:Math.min(mark.end,start)}] : []), start),
    normalizeMarks(canonical.flatMap(mark => mark.end > end ? [{...mark,start:Math.max(mark.start,end)-end,end:mark.end-end}] : []), textLength-end),
  ];
}

export function joinMarks(left: readonly TextMark[], leftLength: number, right: readonly TextMark[], rightLength: number): TextMark[] {
  return normalizeMarks([...normalizeMarks(left,leftLength),...normalizeMarks(right,rightLength).map(mark=>({...mark,start:mark.start+leftLength,end:mark.end+leftLength}))],leftLength+rightLength);
}
