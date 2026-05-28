# Search

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Search — interactive pattern for entering a query, showing suggestions or results, and helping the user navigate to a matching object, page, command, or content item. It builds on Text Field `type=search`, but adds result state, keyboard navigation, and optional overlay behavior.

### Когда использовать

**Используйте** — when search is a primary way to find or execute something:

- global search across the product;
- scoped search inside a table, list, or section;
- command palette;
- searchable navigation;
- autocomplete with suggestions;
- search with recent queries or saved filters;
- result list with title, subtitle, icon, and action.

**Не используйте:**

- For a simple single-field filter without suggestions/results — use **Text Field** with `type=search`.
- For known hierarchical navigation — use **Sidebar**, **Breadcrumbs**, or Tabs.
- For selecting from a fixed small set — use Select, Radio, or Segmented Control.
- For a full results page layout — use a page pattern with Search as one part.
- For AI generation prompts unless the interaction is actually search/retrieval.

### Основные принципы

- **Query has scope** — users must understand what is being searched.
- **Feedback is stateful** — empty, typing, loading, results, no-results, and error states must be distinct.
- **Keyboard first** — search results must support predictable keyboard navigation.
- **Results are not decoration** — each result needs a clear title and action target.
- **Empty and no-results differ** — empty query can show recent/suggested items; no-results explains the failed query.
- **AI must preserve contracts** — Search must not become an unstructured prompt box without system review.

---

## 2. Anatomy

```text
┌─────────────────────────────────────┐
│ [search icon] Query            [x]  │ input
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Section title                       │
│ [icon] Result title                 │
│        Subtitle / path              │
│ [footer action]                     │
└─────────────────────────────────────┘
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Search pattern container |
| `input` | yes | Search input, usually `type=search` |
| `leadingIcon` | recommended | Search icon |
| `clearAction` | conditional | Clears query when value exists |
| `dropdown` | conditional | Suggestions/results container |
| `sectionTitle` | optional | Recent, suggestions, results, commands |
| `result` | conditional | Search result or command option |
| `resultTitle` | conditional | Primary result text |
| `resultSubtitle` | optional | Path, type, description, or metadata |
| `footer` | optional | Show all results, advanced search, or help action |

### Правила anatomy

- Input is required.
- Result title is required for every result item.
- Clear action appears only when query has value.
- Dropdown is shown only when Search is open and has content or a meaningful empty/loading state.

---

## 3. Types / Variants

| Variant | Description | Use |
| --- | --- | --- |
| `inline` | Search field embedded in page; dropdown appears below | Section/table/list search |
| `overlay` | Search opens in overlay or modal-like surface | Global search, mobile search |
| `command-palette` | Search plus executable commands | Keyboard-driven actions |
| `results-page` | Search field controls a full page of results | Search landing/results page |

### Result variants

| Result type | Description | Rule |
| --- | --- | --- |
| `navigation` | Opens page or object | Use Link behavior |
| `command` | Executes action | Use Button/command behavior |
| `suggestion` | Completes or replaces query | Update query and keep focus |
| `recent` | Previous query or visited item | Must be clear and removable if product supports it |
| `empty` | No query yet | Show guidance, recent, or suggestions |
| `no-results` | Query returned nothing | Explain and offer recovery |

---

## 4. Sizes

Search size controls input height, density, result item spacing, and dropdown width.

| Size | Input density | Result density | Use |
| --- | --- | --- | --- |
| `compact` | Dense input | Compact results | Toolbar, table header, side panel |
| `medium` | Default input | Default results | Default product UI |
| `large` | Prominent input | Roomier results | Global search, command palette, overlay |

### Правила размеров

- Use `medium` by default.
- Use `compact` when Search is secondary to the surrounding table/list.
- Use `large` when Search is the primary interaction in the region.
- Dropdown width should align to input or overlay rules.
- Do not scale result text just to fit too many fields; reduce metadata or use a results page.

---

## 5. States

### Матрица состояний

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `empty` | Query is empty | Show recent items, suggestions, or guidance |
| `typing` | User is editing query | Debounce before request |
| `loading` | Search request is running | Show Spinner/Skeleton pattern where appropriate |
| `results` | Results found | Show navigable list |
| `no-results` | Query returned no results | Show recovery Empty State |
| `error` | Request failed | Show error text and retry path |
| `disabled` | Search unavailable | Disable input and explain if not obvious |

### Interaction states

- Input owns hover, focus, active, and disabled states.
- Result items own hover, active, selected, and focus states.
- Clear action and footer actions use Button, Icon Button, or Link specs.

---

## 6. Behavior

### Open and close

- Inline Search opens on focus or query input.
- Overlay Search opens from a trigger, shortcut, or navigation action.
- Command palette may open by shortcut such as `Cmd/Ctrl+K`.
- Escape clears query first when appropriate, then closes overlay/dropdown.
- Closing overlay returns focus to the trigger.

### Query behavior

- Debounce API requests by 200-300ms after the last keystroke.
- Minimum query length should be documented by product context.
- Preserve query when navigating back to search results if this supports the workflow.
- Do not send a request for every keypress without debounce unless local search is cheap and documented.

### Result behavior

- Arrow keys move active result.
- Enter activates selected result.
- Result click or activation performs navigation, command, or suggestion behavior.
- No-results state should offer query edits, filter reset, or broader scope when possible.

### Responsive behavior

- Inline Search may become overlay Search on narrow screens.
- Result metadata may reduce or wrap before result title is truncated.
- Dropdown must stay within viewport and support scrolling when results exceed available height.

---

## 7. Accessibility

Search follows [foundation/accessibility.md](../foundation/accessibility.md) and Text Field search behavior in [text-field.md](../inputs/text-field.md).

| Требование | Правило |
| --- | --- |
| Input semantics | Use `type="search"` when appropriate |
| Combobox | Use combobox/listbox pattern when suggestions/results are inline selectable options |
| Expanded state | Maintain `aria-expanded` |
| Active option | Use `aria-activedescendant` or roving focus consistently |
| Results | Result items have accessible names |
| Loading | Expose loading with `aria-busy` or status text when needed |
| Empty/no-results | Provide readable text |
| Shortcut | Shortcut must not be the only way to open Search |

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Move active result |
| `Enter` | Activate selected result or submit query |
| `Escape` | Clear query or close dropdown/overlay |
| `Tab` | Move to next focusable element |
| `Cmd/Ctrl+K` | Open command palette when supported |

### Accessibility checklist

- [ ] Search has an accessible label.
- [ ] Result list state is programmatically exposed.
- [ ] Active result is announced during keyboard navigation.
- [ ] Loading, no-results, and error states are readable.
- [ ] Clear button has accessible label.
- [ ] Overlay Search restores focus on close.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Input surface default | component path: search input surface default | `surface/base` |
| Input surface hover | component path: search input surface hover | `surface/subtle` |
| Input surface active | component path: search input surface active | `surface/base` |
| Input surface focus | component path: search input surface focus | `surface/base` |
| Input surface disabled | component path: search input surface disabled | `status/disabled/container` |
| Input border default | `search/input/border/default` | `border/default` |
| Input border hover | `search/input/border/hover` | `border/hover` |
| Input border active | `search/input/border/active` | `border/strong` |
| Input border focus | `search/input/border/focus` | `border/focus` |
| Input border disabled | `search/input/border/disabled` | `status/disabled/border` |
| Placeholder foreground | `search/input/foreground/placeholder` | `text/muted` |
| Input foreground | `search/input/foreground/default` | `text/primary` |
| Input foreground disabled | `search/input/foreground/disabled` | `status/disabled/text` |
| Input icon default | `search/input/icon/default` | `icon/tertiary` |
| Input icon active | `search/input/icon/active` | `icon/primary` |
| Input icon disabled | `search/input/icon/disabled` | `status/disabled/icon` |
| Dropdown surface | `search/dropdown/surface` | `surface/overlay` |
| Dropdown border | `search/dropdown/border` | `border/default` |
| Result title | `search/result/foreground/title` | `text/primary` |
| Result subtitle | `search/result/foreground/subtitle` | `text/secondary` |
| Result match | `search/result/foreground/match` | `text/brand` |
| Result surface default | `search/result/surface/default` | `color/transparent` |
| Result surface hover | `search/result/surface/hover` | `container/neutral/hover` |
| Result surface active | `search/result/surface/active` | `container/neutral/pressed` |
| Result surface selected | `search/result/surface/selected` | `container/neutral/selected` |
| Result icon default | `search/result/icon/default` | `icon/tertiary` |
| Result icon selected | `search/result/icon/selected` | `icon/primary` |
| Highlight surface | `search/highlight/surface` | `status/warning/container` |
| Section title | `search/section-title/foreground` | `text/tertiary` |
| Focus ring | `search/focus/ring` | `focus/ring` |

### Token gaps

- Search does not currently have component tokens for size, height, padding, radius, result gap, dropdown shadow, width, or max height.
- Use Text Field, Container, Popover, and foundation spacing/elevation rules until Search-specific tokens are introduced.
- Do not invent Search token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Variant | `variant` | `inline`, `overlay`, `command-palette`, `results-page` |
| Size | `size` | `compact`, `medium`, `large` |
| Value | `value` | Query string |
| Placeholder | `placeholder` | Search scope hint |
| Results | `results` | Result items |
| Recent items | `recentItems` | Empty-query content |
| Suggestions | `suggestions` | Query suggestions |
| Loading | `loading` | Boolean |
| Error | `error` | Error state/message |
| Open | `open` | Dropdown/overlay state |
| Active item | `activeId` | Keyboard navigation |
| On search | `onSearch` | Debounced query handler |
| On select | `onSelect` | Result/suggestion activation |

### Contract rules

- Search input requires accessible label.
- Result item requires title and action target.
- Result type must define activation behavior.
- No-results and error states must be represented explicitly.
- Do not pass raw colors, custom result states, or unsupported variants.

---

## 10. Handoff notes

В handoff нужно передать:

- search scope and minimum query length;
- variant, size, and responsive behavior;
- result item schema: title, subtitle, icon, type, target/action;
- recent and suggestion behavior;
- debounce timing and request cancellation rules;
- loading, no-results, and error states;
- keyboard navigation and active-result behavior;
- overlay focus return behavior, if applicable;
- token mapping for input, dropdown, result, highlight, and focus;
- token gaps for size, spacing, shadow, and dimensions.

### Acceptance criteria

- Search scope is clear.
- Query input has accessible label.
- Results are keyboard navigable.
- Loading, no-results, and error states are distinct.
- Escape, Enter, Arrow keys, and Tab behavior are defined.
- Result activation behavior is documented.
- Search uses documented component tokens for input, dropdown, and results.
- Simple filtering uses Text Field instead of full Search.

---

## 11. AI usage rules

- AI may use Search only when query input and result/suggestion behavior are required.
- AI must recommend Text Field `type=search` for simple filtering.
- AI must recommend Table filters when search is part of table filtering.
- AI must not invent result states, token paths, shortcuts, or command behavior.
- AI must check `tokens.json` before changing Search token mappings.
- AI must flag missing scope, missing keyboard behavior, missing empty/no-results/error states, inaccessible result navigation, or unsupported command behavior as `Needs system review`.
- AI may draft result schemas, handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Global product search | `variant=overlay`, results grouped by type |
| Table search | Text Field search if no suggestions; Search only if result dropdown is needed |
| Command palette | `variant=command-palette`, result type `command` with action |
| Empty query | Recent items or suggested searches |
| No results | Message explains query and offers reset/broader scope |

### Требует review

| Scenario | Reason |
| --- | --- |
| Search with no keyboard result navigation | Accessibility gap |
| Simple table filter implemented as full Search | Component is too heavy |
| Command palette without command action contract | Behavior unclear |
| AI prompt box styled as Search | Wrong interaction model |

---

## 13. Anti-patterns

- Using Search for a single simple filter.
- Sending API request on every keypress without debounce.
- Showing no-results as a blank dropdown.
- Hiding search scope.
- Relying on mouse-only result selection.
- Mixing navigation results and command actions without labels.
- Creating custom result colors outside component tokens.
