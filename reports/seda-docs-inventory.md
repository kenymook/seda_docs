# Инвентаризация Документации SEDA AI

Дата: 2026-05-09  
Область: `foundation/`, `specs/`, `reports/`

## Краткий Вывод

Foundation-слой закрывает основные P0/P1-пробелы: accessibility, typography, tokens, color, spacing/layout, radius/border, elevation, motion, content и iconography. Component specs покрывают почти весь перечень из `foundation/components.md`.

Главные оставшиеся задачи:

1. Проставить `Status`, `Owner`, `Last reviewed` во все component specs.
2. Заменить placeholder Figma-ссылки на реальные node URLs или явный `Figma · TBD`.
3. Привести короткие specs к новой структуре template.
4. Проверить token references после введения `radius-border.md`, `elevation.md`, `motion.md`, `content.md`, `iconography.md`.
5. Настроить docs quality checks.

## Foundation Inventory

| Документ | Статус | Комментарий |
|---|---|---|
| `accessibility.md` | ready-foundation | WCAG 2.2 AA, keyboard, focus, live regions, checklist |
| `typography.md` | ready-foundation | Type roles, scale, responsive, numeric alignment |
| `tokens.md` | ready-foundation | Layers, naming, lifecycle, quality checks |
| `color.md` | ready-foundation | Color roles, contrast, status, text-on-color |
| `spacing-layout.md` | ready-foundation | Spacing scale, density, layout patterns |
| `radius-border.md` | ready-foundation | Radius scale, border width, focus border |
| `elevation.md` | ready-foundation | Elevation levels, z-index, overlay/scrim |
| `motion.md` | ready-foundation | Duration/easing, patterns, reduced motion |
| `content.md` | ready-foundation | UX writing, labels, errors, empty/loading |
| `iconography.md` | ready-foundation | Icon roles, sizes, accessibility |
| `interaction-model.md` | needs-review | Сильная модель, стоит связать с all overlay specs |
| `state-vocabulary.md` | needs-review | Хороший словарь, нужна state precedence matrix |
| `states.md` | needs-review | Нужна синхронизация с token grammar |
| `sizes.md` | needs-review | Связан с typography, radius-border; можно добавить token aliases |
| `theming.md` | needs-review | Есть Light/Dark values, нужен pipeline/export |
| `validation-model.md` | needs-expansion | Короткий документ, стоит расширить после content/accessibility |
| `component-anatomy.md` | needs-expansion | Короткий документ, стоит связать со spec template |
| `components.md` | needs-review | Overview актуален; Color Picker теперь покрыт spec |

## Component Specs Inventory

| Категория | В overview | Spec-файлов | Пробел |
|---|---:|---:|---|
| Действия | 4 | 4 | Нет |
| Ввод и формы | 13 | 13 | Color Picker добавлен как draft |
| Навигация | 7 | 7 | Нет |
| Отображение данных | 12 | 12 | Нет |
| Обратная связь | 9 | 9 | Нет |
| Оверлеи и layout | 6 | 6 | Нет |
| Всего | 51 | 51 | Нет |

## Figma Links

Текущее состояние:

- `Button` имеет реальную Figma-ссылку.
- Остальные specs используют placeholder `[ссылка на фрейм компонента]` или новый `TBD`.

Рекомендация:

- Для готовых компонентов заменить на реальные Figma node URLs.
- Для draft specs использовать явный `> **Figma** · TBD`.
- Добавить docs check, который запрещает placeholder `[ссылка на фрейм компонента]` в `ready` specs.

## Обязательные Секции

Новый template требует:

1. Metadata: category, version, status, owner, last reviewed, Figma, foundation refs.
2. Key Principles of Use.
3. Anatomy.
4. Types / Variants.
5. Sizes или явное исключение.
6. States или явное исключение.
7. Behavior.
8. Accessibility.
9. Design Tokens.

Короткие specs без полного набора секций не нужно расширять искусственно за один проход. Их стоит помечать `needs-review` и дорабатывать по приоритету использования.

## Найденные Расхождения

| Расхождение | Статус |
|---|---|
| `Color Picker` был в `components.md`, но не имел spec | Исправлено: добавлен `specs/inputs/color-picker.md` |
| Большинство specs не имеют `Status`, `Owner`, `Last reviewed` | Открыто |
| Большинство specs имеют placeholder Figma | Открыто |
| Часть specs использует legacy `border-radius-lg` | Открыто, мигрировать на `border/radius/*` |
| Часть specs использует `shadow/base` и `shadow/darker` напрямую | Допустимо как реализация, но уровень должен ссылаться на `elevation.md` |
| Motion был локально описан в specs | Частично исправлено: pilot specs синхронизированы с `motion.md` |
| Content/icon rules были локальными | Частично исправлено: pilot specs синхронизированы с `content.md` и `iconography.md` |

## Следующий Cleanup-Пакет

1. Механически заменить placeholder Figma на `TBD`.
2. Добавить metadata block в каждый spec.
3. Создать docs quality check для:
   - missing metadata;
   - placeholder Figma;
   - missing required sections;
   - missing spec for component overview;
   - legacy token references.
4. Пройти high-impact specs: Select, Dropdown/Menu, Table, Toast, Drawer, Modal.
