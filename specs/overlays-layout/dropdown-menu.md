# Dropdown / Menu

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Dropdown / Menu — список опций, раскрывающийся при клике на триггер. В зависимости от типа содержит действия (Menu), выбор значения (Select Menu) или команды с поиском (Command Palette).

### When to use

**Use** — для списка действий над объектом («Редактировать», «Дублировать», «Удалить»); для контекстного меню; для выбора значения из длинного списка; для command palette.

**Don't use:**
- Для постоянно видимой навигации — используйте **Sidebar** или **Tabs**
- Для выбора в форме — используйте **Select** (формовый контрол с валидацией)
- Для одного действия — используйте **Button**

### Core principles

- **Destruction в конце** — деструктивные действия всегда последние в списке, отделены Divider
- **Не более 10 элементов** — длинные списки требуют поиска или групповки
- **Закрытие после выбора** — в `menu` тип закрывается после выбора, в `select-menu` — зависит от single/multi

---

## 2. Anatomy

```
[Trigger button]
      ↓
┌──────────────────────────┐
│ 🔍 Search...             │ ← (только command-palette)
├──────────────────────────┤
│ Group Title              │
│   [icon]  Option 1       │
│   [icon]  Option 2       │
│            Description   │
├──────────────────────────┤ ← separator / divider
│   [icon]  Delete    [⌘D] │ ← destructive
└──────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `trigger` | required | Элемент, открывающий список |
| `menu-item` | required (1+) | Элемент списка |
| `group-title` | optional | Заголовок группы элементов |
| `separator` | optional | Разделитель между группами |
| `search` | conditional | Поле поиска (command-palette) |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `menu` | Список действий. Каждый элемент — кнопка/ссылка |
| `select-menu` | Список для выбора значения. Элементы с чекмарком |
| `context-menu` | Появляется по правому клику. Нет явного триггера |
| `command-palette` | Поиск + список команд. Открывается по горячей клавише |

### Варианты элемента

| Вариант | Описание |
|---|---|
| `default` | Только текст |
| `with-icon` | Иконка + текст |
| `with-description` | Текст + подпись |
| `with-badge` | Текст + Badge |
| `destructive` | Красный цвет. Для необратимых действий |
| `disabled` | Недоступный элемент |
| `separator` | Горизонтальный разделитель |
| `group-title` | Некликабельный заголовок группы |
| `checkbox-item` | Элемент с чекбоксом |
| `radio-item` | Элемент с radio |

### Позиции

`bottom-start` · `bottom-end` · `top-start` · `top-end`

---

## 4. States (элемент списка)

### State types

- **interaction:** `hover`, `focus`, `active`
- **selection:** `selected` (для checkbox-item / radio-item)
- **availability:** `disabled`

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Базовый вид | Текст `text/primary` |
| `hover` | Курсор над элементом | Фон `surface/hover` |
| `active` | Нажатие | Фон `surface/pressed` |
| `focus` | Фокус клавиатуры | Фон `surface/hover`, outline |
| `selected` | Выбран (select-menu) | Чекмарк или иконка |
| `disabled` | Недоступен | `status/disabled/text`, cursor `default` |

---

## 5. Details on Types / Variants

### menu
Каждый элемент — действие. Клик выполняет действие и закрывает список. Нет состояния `selected`.

### select-menu
Элементы имеют состояние выбора. При `single` — клик выбирает и закрывает. При `multi` — клик переключает чекбокс, список остаётся открытым.

### context-menu
Открывается по `contextmenu` событию (правый клик или долгое нажатие). Позиционируется по координатам курсора. Нет явного trigger-элемента в DOM.

### command-palette
Открывается по горячей клавише (`⌘K` / `Ctrl+K`). Полноэкранный overlay или центрированный Modal. Поиск фильтрует команды в реальном времени.

---

## 6. Behavior

### Open / Close (из interaction-model.md)

**Открывается:** Click на trigger, `Enter` / `Space` на trigger, `ArrowDown` на trigger (select-like).
**Закрывается:** `Escape`, click outside, выбор элемента (single), Tab (уход фокуса).
**После закрытия:** фокус возвращается на trigger.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `↑` / `↓` | Навигация по элементам |
| `Enter` / `Space` | Активация элемента |
| `Escape` | Закрыть список |
| `Home` | Первый элемент |
| `End` | Последний элемент |
| Буква | Jump to (первое совпадение по букве) |

---

## 7. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="button"` | — | Trigger |
| `aria-expanded` | `true` / `false` | Trigger |
| `aria-haspopup="menu"` | — | Trigger типа `menu` |
| `aria-haspopup="listbox"` | — | Trigger типа `select-menu` |
| `role="menu"` | — | Контейнер списка (`menu`) |
| `role="listbox"` | — | Контейнер списка (`select-menu`) |
| `role="menuitem"` | — | Элемент `menu` |
| `role="option"` | — | Элемент `select-menu` |
| `aria-disabled="true"` | — | Disabled элемент |
| `aria-checked` | `true` / `false` | checkbox-item / radio-item |

---

## 8. Design Tokens

### Container

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--menu-bg` | Фон списка | `surface/default` | `surface/default` |
| `--menu-border` | Граница | `border/default` | `border/default` |
| `--menu-shadow` | Тень | `shadow/darker` | `shadow/darker` |

### Items

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--menu-item-text` | Цвет текста | `text/primary` | `text/primary` |
| `--menu-item-bg-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--menu-item-bg-active` | Фон active | `surface/pressed` | `surface/pressed` |
| `--menu-item-icon` | Цвет иконки | `text/tertiary` | `text/tertiary` |
| `--menu-item-description` | Цвет описания | `text/tertiary` | `text/tertiary` |
| `--menu-item-destructive` | Текст destructive | `status/error/text` | `status/error/text` |
| `--menu-item-disabled` | Текст disabled | `status/disabled/text` | `status/disabled/text` |
| `--menu-group-title` | Заголовок группы | `text/tertiary` | `text/tertiary` |
| `--menu-separator` | Разделитель | `border/default` | `border/default` |
| `--menu-checkmark` | Иконка выбора | `text/primary` | `text/primary` |
