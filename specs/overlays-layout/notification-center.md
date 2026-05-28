# Notification Center

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Notification Center — составной overlay-компонент для просмотра истории уведомлений, системных событий и действий, которые пользователь может обработать позже. Он открывается из триггера, обычно иконки уведомлений с Badge, и показывает список read/unread items, фильтры, группировку, bulk actions и системные состояния.

Notification Center не заменяет [Toast](../feedback/toast.md), [Alert](../feedback/alert.md) или [Timeline](../data-display/timeline.md): Toast сообщает о кратком событии прямо сейчас, Alert фиксирует важное состояние на странице, Timeline показывает историю объекта, а Notification Center собирает персональные уведомления пользователя в одном управляемом слое.

### Когда использовать

**Используйте** — когда продукту нужен единый центр уведомлений:

- задачи, комментарии, упоминания и назначения;
- изменения статусов, approvals, review requests;
- системные события, которые можно прочитать позже;
- список unread items с возможностью отметить как прочитанные;
- фильтры по типу, статусу или важности;
- переход из уведомления к связанному объекту.

**Не используйте:**

- Для мгновенного feedback после действия — используйте [Toast](../feedback/toast.md).
- Для постоянного предупреждения в контексте страницы — используйте [Alert](../feedback/alert.md).
- Для истории одного объекта — используйте [Timeline](../data-display/timeline.md).
- Для простого счетчика без списка — используйте [Badge](../data-display/badge.md).
- Для обязательного blocking decision — используйте [Modal](./modal.md) или соответствующий flow.
- Для произвольной ленты активности без read/unread contract — нужен отдельный Activity Feed pattern.

### Основные принципы

- **Unread is explicit** — непрочитанные уведомления должны отличаться от прочитанных не только текстом.
- **Every item has an action target** — уведомление должно вести к объекту, действию или объяснять, почему действие недоступно.
- **Center is not interruption** — Notification Center хранит события, но не должен перехватывать внимание как modal flow.
- **State is part of the contract** — empty, loading, error, offline, all-read и has-unread states обязательны.
- **Bulk actions are reversible or confirmed** — массовые действия должны иметь понятный результат и recovery path.
- **AI must preserve system rules** — AI может помогать с черновиками copy, handoff и проверкой, но не создает новые типы, токены или поведение без review.

### Связанные спецификации

- [Toast](../specs/feedback/toast.md)
- [Alert](../specs/feedback/alert.md)
- [Timeline](../specs/data-display/timeline.md)
- [Badge](../specs/data-display/badge.md)
- [Modal](../specs/overlays-layout/modal.md)

---

## 2. Anatomy

```text
[trigger + badge]
        |
        v
+--------------------------------------+
| Header title          [Mark all] [x] | header
| [All] [Unread] [Mentions]            | filters
| Today                                | group label
| o [icon] Title                       | notification item, unread
|          Description · 2 min ago     |
|   [icon] Title                       | notification item, read
|          Description · 1 hr ago      |
| [Load more]                          | pagination/action
+--------------------------------------+
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `trigger` | yes | Button/Icon Button that opens the center; usually includes unread Badge |
| `panel` | yes | Overlay, popover, drawer, or side panel surface |
| `header` | yes | Title, unread count, close action, optional settings action |
| `bulkActions` | conditional | Mark all as read, clear all, notification settings |
| `filters` | optional | All, unread, mentions, tasks, system, or product-specific categories |
| `groupLabel` | optional | Date or category label such as Today, Earlier, System |
| `notificationList` | yes | Scrollable list of notification items |
| `notificationItem` | conditional | Repeated item with title, description, time, status, icon and actions |
| `unreadIndicator` | conditional | Dot, surface treatment, or text emphasis for unread state |
| `itemActions` | optional | Mark as read, dismiss, secondary action |
| `emptyState` | required | Empty State shown when there are no notifications for current scope |
| `loadingState` | required | Spinner or Skeleton while notifications load |
| `errorState` | required | Recoverable error with retry action |

### Правила anatomy

- Header, panel and list region are required.
- Trigger must expose unread count if product shows unread notifications.
- Every notification item needs a title, timestamp and destination/action contract.
- Empty State must be scoped: no notifications, no unread notifications, or no results for current filter.
- Item actions must not hide the primary navigation target.

---

## 3. Types / Variants

### Container variants

| Variant | Description | Use |
| --- | --- | --- |
| `popover` | Compact overlay anchored to trigger | Desktop products with short notification lists |
| `drawer` | Side panel with larger content area | Dense enterprise flows, long lists, mobile/tablet |
| `full-page` | Dedicated notification page | Products with advanced filtering, search, archive or audit needs |

### Notification types

| Type | Meaning | Typical action |
| --- | --- | --- |
| `info` | Neutral product or system information | Open related object |
| `task` | Work item assigned to user | Open task or workflow |
| `mention` | User was mentioned or requested | Open comment/thread |
| `success` | Completed process | Open result details |
| `warning` | Needs attention but not blocking | Open review/action page |
| `error` | Failed process or critical event | Open error details or retry flow |

### Item status

| Status | Description | Rule |
| --- | --- | --- |
| `unread` | New or unprocessed item | Use unread indicator and unread foreground/icon treatment |
| `read` | User has opened or marked item | Use lower emphasis without losing readability |
| `selected` | Active item in keyboard/navigation context | Use selected surface and focus behavior |
| `dismissed` | Removed from visible list | Animate only if motion rules allow it |
| `disabled` | Item target is unavailable | Keep readable, explain unavailable target |

---

## 4. Sizes

Notification Center size defines panel width, item density and list height. It should follow foundation spacing, typography, radius, elevation and overlay rules.

| Size | Panel behavior | Item density | Use |
| --- | --- | --- | --- |
| `compact` | Anchored popover, short list | Dense | Toolbar and desktop header |
| `medium` | Default overlay panel | Default | Most product interfaces |
| `large` | Drawer or full-height panel | Roomier | Long notification history, filters, mobile |

### Правила размеров

- Use `medium` by default.
- Use `compact` only when item content is short and actions are limited.
- Use `large` when notifications include long descriptions, multiple filters or item actions.
- On narrow screens, prefer drawer/full-height behavior over a small floating popover.
- Do not shrink timestamps, actions or unread indicators below accessible touch/click targets.

---

## 5. States

### Panel states

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `closed` | Panel is not visible | Trigger remains focusable and shows unread count |
| `open` | Panel is visible | Focus moves into panel or stays on first meaningful control |
| `loading` | Notification list is loading | Show Skeleton or Spinner with `aria-busy` |
| `empty` | No notifications exist | Show Empty State |
| `all-read` | Notifications exist, none are unread | Keep list available; unread filter shows scoped Empty State |
| `has-unread` | At least one unread item exists | Trigger Badge and unread treatment are visible |
| `error` | Loading failed | Show message and retry action |
| `offline` | Data may be stale | Show status text without blocking list reading |

### Item interaction states

| State | Значение | Визуальное изменение |
| --- | --- | --- |
| `default` | Base item state | Uses read/unread visual contract |
| `hover` | Pointer is over item | Item surface uses hover treatment |
| `active` | Item is being pressed | Item surface uses active treatment |
| `focus` | Keyboard focus is on item/action | Visible focus ring |
| `selected` | Item is active in composite navigation | Selected surface |
| `disabled` | Item target unavailable | Disabled foreground and no primary activation |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| `unread` + `hover` | yes | Preserve unread indicator while showing hover |
| `read` + `selected` | yes | Selected surface wins over read surface |
| `loading` + populated list | yes | Use stale list plus loading indicator only if documented |
| `empty` + `has-unread` | no | Empty state cannot have unread count |
| `disabled` + primary navigation | no | Disabled item cannot navigate |

---

## 6. Behavior

### Open and close

- Trigger opens the panel by click/tap and, if supported, keyboard shortcut.
- `Escape` closes the panel and returns focus to the trigger.
- Click outside closes popover variant; drawer/full-page follows its own navigation rules.
- Close action must be available when panel behaves as overlay or drawer.
- Opening the panel must not automatically mark all notifications as read unless product explicitly defines that behavior.

### Read/unread behavior

- Item becomes read after explicit action, activation, or product-defined visibility rule.
- If reading on visibility is supported, define timing and viewport threshold in handoff.
- `Mark all as read` affects only the current scope unless label says otherwise.
- Dismiss removes item from visible list; archive/delete semantics must be documented separately.

### List behavior

- Newest notifications appear first unless the product documents another order.
- Grouping by date or category must not break keyboard order.
- Long lists should support pagination, "load more", or virtualization.
- Filters preserve current panel state and must expose empty states per filter.
- Item click activates primary target; secondary actions are separate controls.

### Responsive behavior

- Desktop can use `popover` or `drawer` depending on content density.
- Mobile should use `drawer` or full-screen panel to preserve readable content and touch targets.
- Long titles wrap before timestamps are removed.
- Item actions may collapse into an overflow menu on narrow widths, but primary action remains available.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Move through header actions, filters, list items and item actions |
| `Enter` | Activate focused trigger, item or action |
| `Space` | Activate button-like controls |
| `Escape` | Close overlay/drawer and return focus to trigger |
| `ArrowDown` / `ArrowUp` | Optional roving navigation between items, if implemented |
| `Delete` | Optional dismiss action for focused item, if documented |

---

## 7. Accessibility

Notification Center follows [foundation/accessibility.md](../../foundation/accessibility.md), [foundation/content.md](../../foundation/content.md) and overlay interaction rules.

| Требование | Правило |
| --- | --- |
| Trigger | Use Button/Icon Button semantics and accessible label |
| Unread count | Expose count in accessible name or nearby status text |
| Panel semantics | Use `dialog`, `region`, `popover` or page semantics according to implementation |
| Header | Visible title should label the panel via `aria-labelledby` when possible |
| Loading | Use `aria-busy` or status text; do not announce every Skeleton item |
| List | Use list/listitem semantics when items form a list |
| Item activation | Interactive item has accessible name and clear target |
| New notifications | Use polite live region only for meaningful additions |
| Focus return | Closing overlay returns focus to trigger |
| Color reliance | Unread state cannot rely on color only |

### Accessibility checklist

- [ ] Trigger has accessible label and unread count.
- [ ] Panel has a readable title.
- [ ] Keyboard users can open, close, filter and activate notifications.
- [ ] Focus order matches visual order.
- [ ] Unread state is visible without relying only on color.
- [ ] Loading, empty, error and offline states are readable.
- [ ] Item actions have labels such as "Mark as read" or "Dismiss notification".
- [ ] Bulk actions clarify scope.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Panel surface | `notification-center/surface/default` | `surface/overlay` |
| Item surface unread | `notification-center/item/surface/unread` | `surface/base` |
| Item surface read | `notification-center/item/surface/read` | `surface/base` |
| Item surface hover | `notification-center/item/surface/hover` | `container/neutral/hover` |
| Item surface active | `notification-center/item/surface/active` | `container/neutral/pressed` |
| Item surface selected | `notification-center/item/surface/selected` | `container/neutral/selected` |
| Item border | `notification-center/item/border/default` | `border/subtle` |
| Item foreground unread | `notification-center/item/foreground/unread` | `text/primary` |
| Item foreground read | `notification-center/item/foreground/read` | `text/secondary` |
| Item foreground disabled | `notification-center/item/foreground/disabled` | `status/disabled/text` |
| Timestamp foreground | `notification-center/item/timestamp/foreground` | `text/tertiary` |
| Icon unread | `notification-center/item/icon/unread` | `icon/brand` |
| Icon read | `notification-center/item/icon/read` | `icon/tertiary` |
| Header foreground | `notification-center/header/foreground` | `text/primary` |
| Header border | `notification-center/header/border` | `border/default` |
| Empty foreground | `notification-center/empty/foreground` | `text/secondary` |
| Panel shadow | `notification-center/shadow` | `shadow/overlay` |

### Token gaps

- Notification Center does not currently have component tokens for panel width, max height, item padding, item gap, radius, unread dot size, filter spacing, animation duration or overlay z-index.
- Use foundation spacing, radius, elevation, motion and overlay rules until component-specific tokens are introduced.
- Do not invent `--notif-*` or new `notification-center/*` token paths in specs, code, Figma or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Container variant | `variant` | `popover`, `drawer`, `full-page` |
| Size | `size` | `compact`, `medium`, `large` |
| Open state | `open` | Controlled or uncontrolled overlay state |
| Unread count | `unreadCount` | Used by trigger Badge and accessible label |
| Notifications | `items` | Array of notification item objects |
| Item id | `item.id` | Stable key for read/dismiss/action updates |
| Item type | `item.type` | `info`, `task`, `mention`, `success`, `warning`, `error` |
| Item status | `item.read` / `item.status` | Read/unread/disabled/dismissed contract |
| Timestamp | `item.timestamp` | Machine value plus formatted display |
| Primary target | `item.href` / `onItemSelect` | Navigation or command target |
| Filters | `filters`, `activeFilter` | Scope list content |
| Bulk action | `onMarkAllRead` | Scope must be explicit |
| Dismiss action | `onDismiss` | Optional per item |
| Loading | `loading` | Boolean or async state |
| Error | `error` | Error message/retry state |
| Empty state | `emptyState` | Scoped by active filter |

### Contract rules

- Notification item requires `id`, `title`, `timestamp`, `type`, read/unread status and action target.
- `description`, avatar or icon, `secondaryAction` and `metadata` are optional but must follow content rules.
- The component must define whether activation marks an item as read.
- The trigger unread count must match the list data or documented server state.
- Unsupported item types, custom colors or raw token values require system review.

---

## 10. Handoff notes

В handoff нужно передать:

- container variant, size and responsive behavior;
- trigger behavior and unread Badge rules;
- item schema: title, description, timestamp, type, status, target/action;
- read/unread logic, including whether opening or clicking marks items as read;
- filter names, grouping rules and sort order;
- loading, empty, all-read, error and offline states;
- pagination, "load more" or virtualization behavior for long lists;
- bulk action scope and confirmation/recovery rules;
- keyboard behavior and focus return;
- token mapping for panel, item surfaces, item text, icons, header, empty state and shadow;
- token gaps for dimensions, spacing, radius, motion and unread indicator size.

### Acceptance criteria

- Trigger opens and closes the Notification Center and returns focus on close.
- Unread count, unread item treatment and read/unread state remain consistent.
- Every item has an accessible title, timestamp and action target.
- Empty, loading, error, offline, all-read and has-unread states are represented.
- Filters and grouping do not break keyboard navigation.
- Bulk actions define scope and result.
- Component uses documented `notification-center/*` tokens and foundation rules for token gaps.
- Notification Center is not used for Toast, Alert, Timeline or blocking Modal scenarios.

---

## 11. AI usage rules

- AI may use Notification Center only for a persistent history of user-relevant notifications.
- AI must recommend Toast for immediate transient feedback and Alert for persistent page-level warnings.
- AI must not invent notification types, item statuses, token paths, bulk actions or keyboard shortcuts.
- AI must check `tokens.json` before changing Notification Center token mappings.
- AI must flag missing read/unread logic, missing item action target, missing empty/loading/error states, inaccessible trigger, or unclear bulk action scope as `Needs system review`.
- AI may draft notification copy, item schemas, Handoff notes and acceptance criteria, but human review is required.
- AI must preserve the distinction between generated drafts and approved system behavior.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| User has unread mentions | Trigger Badge shows unread count; list filter can show `mentions` |
| Process finished in background | Notification item `type=success` opens result details |
| Dataset sync failed | Notification item `type=error` links to retry/details flow |
| No unread items | Unread filter shows scoped Empty State, while All can still show history |
| Mobile header notifications | `variant=drawer`, `size=large`, full-height behavior |

### Требует review

| Scenario | Reason |
| --- | --- |
| Opening panel marks all items read immediately | May hide important state without user intent |
| Notification has no target or action | Item cannot be resolved by user |
| Error notifications use custom red styles | Must use documented tokens and status rules |
| Bulk clear deletes server history | Destructive behavior needs product and engineering review |
| AI creates custom notification severity | Unsupported system extension |

---

## 13. Anti-patterns

- Using Notification Center for one-off confirmation after a button click.
- Showing unread state only through color.
- Mixing read/unread, selected and disabled states without clear priority.
- Hiding item actions behind hover-only controls.
- Using empty state text that does not match the active filter.
- Showing infinite lists without pagination, virtualization or load-more behavior.
- Treating Notification Center as a blocking modal decision flow.
- Creating raw colors, ad hoc shadows or undocumented token names for notification items.
