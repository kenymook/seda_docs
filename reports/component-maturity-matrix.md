# Component Maturity Matrix

Дата: 2026-05-09

## Статусы

| Статус | Значение |
|---|---|
| `ready` | Spec полный, есть реальная Figma-ссылка, accessibility и tokens проверены |
| `needs-review` | Spec полезен, но требует metadata, Figma, foundation sync или проверки токенов |
| `draft` | Spec создан как начальная версия или покрытие неполное |
| `deprecated` | Компонент больше не рекомендуется |

## Матрица

| Компонент | Категория | Spec | Статус | Главный следующий шаг |
|---|---|---|---|---|
| Button | Actions | `specs/actions/button.md` | needs-review | Добавить metadata, проверить token refs |
| Button Group | Actions | `specs/actions/button-group.md` | needs-review | Добавить metadata, Figma TBD/URL |
| Icon Button | Actions | `specs/actions/icon-button.md` | needs-review | Добавить metadata, проверить iconography |
| Link | Actions | `specs/actions/link.md` | needs-review | Добавить metadata, content/link accessibility |
| Text Field | Inputs & Forms | `specs/inputs/text-field.md` | needs-review | Добавить metadata, проверить content/icon refs |
| Text Area | Inputs & Forms | `specs/inputs/text-area.md` | needs-review | Синхронизировать с Text Field/content |
| Checkbox | Inputs & Forms | `specs/inputs/checkbox.md` | needs-review | Проверить states/accessibility |
| Radio | Inputs & Forms | `specs/inputs/radio.md` | needs-review | Проверить group semantics |
| Toggle | Inputs & Forms | `specs/inputs/toggle.md` | needs-review | Motion уже синхронизирован, добавить metadata |
| Select | Inputs & Forms | `specs/inputs/select.md` | needs-review | Сверить combobox/listbox accessibility |
| Segmented Control | Inputs & Forms | `specs/inputs/segmented-control.md` | needs-review | Проверить selected vs active vocabulary |
| Slider | Inputs & Forms | `specs/inputs/slider.md` | needs-review | Проверить keyboard and value labels |
| File Upload | Inputs & Forms | `specs/inputs/file-upload.md` | needs-review | Проверить drag keyboard alternative |
| Verification Code | Inputs & Forms | `specs/inputs/verification-code.md` | needs-review | Проверить OTP accessibility |
| Date Picker | Inputs & Forms | `specs/inputs/date-picker.md` | needs-review | Проверить calendar keyboard model |
| Time Picker | Inputs & Forms | `specs/inputs/time-picker.md` | needs-review | Проверить spinbutton/list semantics |
| Color Picker | Inputs & Forms | `specs/inputs/color-picker.md` | draft | Review с дизайнером и Figma |
| Breadcrumbs | Navigation | `specs/navigation/breadcrumbs.md` | needs-review | Проверить collapsed/options accessibility |
| Tabs | Navigation | `specs/navigation/tabs.md` | needs-review | Проверить tablist/tabpanel contract |
| Pagination | Navigation | `specs/navigation/pagination.md` | needs-review | Проверить labels and current page |
| Sidebar | Navigation | `specs/navigation/sidebar.md` | needs-review | Проверить collapsed icon-only labels |
| Top Bar | Navigation | `specs/navigation/top-bar.md` | needs-review | Проверить landmarks/navigation labels |
| Stepper | Navigation | `specs/navigation/stepper.md` | needs-review | Проверить current/completed semantics |
| Drawer | Navigation | `specs/navigation/drawer.md` | needs-review | Motion синхронизирован, проверить overlay/elevation |
| Avatar | Data Display | `specs/data-display/avatar.md` | needs-review | Проверить image fallback semantics |
| Badge | Data Display | `specs/data-display/badge.md` | needs-review | Проверить host aria-label |
| Tag | Data Display | `specs/data-display/tag.md` | needs-review | Проверить status vs category color |
| Chip | Data Display | `specs/data-display/chip.md` | needs-review | Проверить remove control labels |
| Table | Data Display | `specs/data-display/table.md` | needs-review | High priority: sorting, selection, density |
| Card | Data Display | `specs/data-display/card.md` | needs-review | Сверить elevation/radius |
| Description List | Data Display | `specs/data-display/description-list.md` | needs-review | Расширить accessibility/semantics |
| Divider | Data Display | `specs/data-display/divider.md` | needs-review | Проверить decorative vs separator |
| Accordion | Data Display | `specs/data-display/accordion.md` | needs-review | Сверить motion/keyboard |
| Timeline | Data Display | `specs/data-display/timeline.md` | needs-review | Проверить current/completed semantics |
| Stat / Metric | Data Display | `specs/data-display/stat-metric.md` | needs-review | Сверить typography/numeric rules |
| Chat Bubble | Data Display | `specs/data-display/chat-bubble.md` | needs-review | Расширить accessibility/status |
| Alert | Feedback | `specs/feedback/alert.md` | needs-review | Motion синхронизирован, добавить metadata |
| Toast / Snackbar | Feedback | `specs/feedback/toast.md` | needs-review | Motion синхронизирован, проверить live regions |
| Modal / Dialog | Feedback | `specs/feedback/modal.md` | needs-review | Accessibility pilot done, добавить metadata |
| Tooltip | Feedback | `specs/feedback/tooltip.md` | needs-review | Проверить tooltip vs label/content |
| Popover | Feedback | `specs/feedback/popover.md` | needs-review | Проверить focus return and interactive content |
| Spinner / Loader | Feedback | `specs/feedback/spinner.md` | needs-review | Motion синхронизирован, проверить status text |
| Progress Bar | Feedback | `specs/feedback/progress-bar.md` | needs-review | Проверить progressbar aria values |
| Skeleton | Feedback | `specs/feedback/skeleton.md` | needs-review | Motion синхронизирован, проверить busy region |
| Empty State | Feedback | `specs/feedback/empty-state.md` | needs-review | Content синхронизирован, добавить accessibility |
| Dropdown / Menu | Overlays & Layout | `specs/overlays-layout/dropdown-menu.md` | needs-review | High priority: menu/listbox semantics |
| Search | Overlays & Layout | `specs/overlays-layout/search.md` | needs-review | Проверить combobox/searchbox model |
| Container | Overlays & Layout | `specs/overlays-layout/container.md` | needs-review | Сверить spacing/layout |
| Grid | Overlays & Layout | `specs/overlays-layout/grid.md` | needs-review | Сверить breakpoints/layout |
| Form | Overlays & Layout | `specs/overlays-layout/form.md` | needs-review | Сверить validation/content/accessibility |
| Notification Center | Overlays & Layout | `specs/overlays-layout/notification-center.md` | needs-review | Проверить live regions and overlay behavior |

## Приоритеты Следующей Проверки

1. `Select`, `Dropdown / Menu`, `Search`: composite widgets и keyboard risk.
2. `Table`: data density, sorting, row selection, accessibility.
3. `Toast`, `Alert`, `Modal`, `Drawer`: live regions, overlay, focus, motion.
4. `Form`, `Text Field`, `Text Area`: validation/content consistency.
5. `Card`, `Popover`, `Tooltip`: elevation, interaction boundaries.
