# Select

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Select — выпадающий список для выбора одного или нескольких значений из предустановленного набора. В отличие от Dropdown/Menu, является формовым контролом с value и участвует в валидации формы.

### When to use

**Use** — когда вариантов больше 5–7 и они не умещаются как Radio/Checkbox; когда нужен выпадающий список как часть формы; для множественного выбора с тегами.

**Do not use:**
- Менее 5 вариантов и достаточно места — используйте **Radio** (single) или **Checkbox** (multi)
- Для навигационных действий — используйте **Dropdown / Menu**
- Для переключения режимов — используйте **Segmented Control**

### Core principles

- **Label всегда видим** — не заменяйте label на placeholder
- **Placeholder-опция** — первый элемент списка «Выберите...» как пустое состояние
- **Ограничение по количеству тегов** — в `multi` при переполнении схлапывайте в «+N ещё»

---

## 2. Anatomy

```
Label
┌────────────────────────────┬──────┐
│ Selected value / Placeholder│  ▼  │
└────────────────────────────┴──────┘
Helper text

Dropdown (открыт):
┌──────────────────────────────────┐
│ 🔍 Search...                     │
├──────────────────────────────────┤
│ Option 1                         │
│ ● Option 2 (selected)            │
│ Option 3                         │
└──────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Текстовая метка |
| `trigger` | required | Кнопка-триггер с выбранным значением и стрелкой |
| `placeholder` | optional | Текст при отсутствии выбора |
| `helper-text` | optional | Подсказка под контролом |
| `prefix-icon` | optional | Иконка внутри триггера |
| `option-icon` | optional | Иконка рядом с опцией в списке |
| `option-description` | optional | Подпись под текстом опции |
| `search` | conditional | Поиск по опциям. Для списков > 10 элементов |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `single` | Выбор одного значения. Value — строка |
| `multi` | Множественный выбор. Value — массив. Выбранные показываются как теги внутри триггера |

---

## 4. Sizes

| Size | Height (trigger) | Font / Line | Radius | Контекст |
|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | Компактные фильтры |
| `medium` | 32px | 14px / 20px | 8px | Формы — дефолт |
| `large` | 40px | 16px / 24px | 10px | Акцентные фильтры |
| `extraLarge` | 48px | 18px / 28px | 12px | Hero-формы |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Закрыт, ничего не выбрано | Базовые border, bg |
| `hover` | Курсор над триггером | `border/hover` |
| `focus` | Фокус на триггере | `border/brand/default`, `focus/ring` |
| `open` | Список раскрыт | Стрелка вверх, dropdown visible |
| `filled` | Выбрано значение | Значение отображается в триггере |
| `error` | Ошибка валидации | `status/danger/border` |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

---

## 6. Details on Types / Variants

### single
При открытии активный вариант выделен. Клик по опции закрывает список и устанавливает значение. Enter на сфокусированной опции — то же.

### multi
Выбранные варианты отображаются тегами внутри триггера. При переполнении — последние схлапываются в «+N». Клик по тегу удаляет его. Список не закрывается автоматически после выбора.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Фокус на триггер / уход |
| `Enter` / `Space` | Открыть/закрыть список |
| `↑` / `↓` | Навигация по опциям |
| `Enter` | Выбор сфокусированной опции |
| `Escape` | Закрыть список |
| Буквенные клавиши | Jump to option (первая буква) |

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="combobox"` | — | Триггер |
| `aria-expanded` | `true` / `false` | Состояние списка |
| `aria-haspopup="listbox"` | — | Всегда |
| `role="listbox"` | — | Контейнер опций |
| `role="option"` | — | Каждая опция |
| `aria-selected` | `true` / `false` | Выбранная опция |
| `aria-required` | `true` | Обязательное поле |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--select-bg` | Фон триггера | `surface/base` | `surface/base` |
| `--select-border` | Граница default | `border/default` | `border/default` |
| `--select-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--select-border-error` | Граница error | `status/danger/border` | `status/danger/border` |
| `--select-text` | Текст значения | `text/primary` | `text/primary` |
| `--select-placeholder` | Placeholder | `text/muted` | `text/muted` |
| `--select-arrow` | Цвет стрелки | `text/tertiary` | `text/tertiary` |
| `--select-dropdown-bg` | Фон выпадающего | `surface/base` | `surface/base` |
| `--select-option-hover` | Фон опции hover | `surface/subtle` | `surface/subtle` |
| `--select-option-selected` | Фон выбранной опции | `container/brand/default` | `container/brand/default` |
| `--select-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--select-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |


---

## Related specifications / Связанные спецификации

- [Dropdown Menu](../specs/overlays-layout/dropdown-menu.md) — меню команд.
- [Text Field](../specs/inputs/text-field.md) — ручной ввод значения.
- [Form](../specs/overlays-layout/form.md) — validation и layout полей.

