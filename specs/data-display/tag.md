# Tag

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Tag — метка для категоризации, фильтрации и маркировки контента. В зависимости от типа может быть только декоративной, кликабельной как фильтр или интерактивной с возможностью закрытия.

### When to use

**Use** — для обозначения статуса, категории, тематики объекта; для отображения фильтров; для тегирования контента.

**Don't use:**
- Для нотификаций и счётчиков — используйте **Badge**
- Для выбранных значений формы — используйте **Chip** (в Select multi или самостоятельно)

### Core principles

- **Цвет несёт смысл** — используйте цвет системно: красный для ошибок/критического, зелёный для успеха, серый для нейтрального
- **Компактность** — Tag — маленький элемент. Не перегружайте длинным текстом
- **Консистентность** — используйте один набор цветов для одного типа категорий

---

## 2. Anatomy

```
┌─────────────────────┐
│ [icon]  Label  [×]  │
└─────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Текстовая метка |
| `icon` | optional | Иконка слева от label |
| `close-button` | conditional | Кнопка удаления (тип `interactive`) |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `read-only` | Только отображение. Не кликается, нет hover |
| `selectable` | Кликабельна как фильтр. Переключается между default / selected |
| `interactive` | Кликабельна, имеет кнопку закрытия (×) для удаления |

### Цветовые варианты (для `read-only`)

`gray` · `blue` · `mint` · `pistachio` · `purple` · `orange` · `yellow` · `red`

---

## 4. Sizes

Tag имеет один фиксированный размер в системе SEDA UI.

| Параметр | Значение |
|---|---|
| Height | 20px |
| Font | 12px / 16px |
| Radius | 4px |
| Padding H | 6px |

---

## 5. States

### State types

- **interaction:** `hover`, `focus` (для `selectable` и `interactive`)
- **selection:** `selected` (для `selectable`)
- **data:** `skeleton`
- **availability:** `disabled`

### State matrix

| Состояние | Применимые типы | Визуальное изменение |
|---|---|---|
| `enabled` | Все | Базовый вид |
| `hover` | `selectable`, `interactive` | Фон темнее |
| `selected` | `selectable` | Заливка `container/brand/default`, текст `text/on-brand/primary` |
| `focus` | `selectable`, `interactive` | `focus/ring` |
| `disabled` | Все | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |
| `skeleton` | Все | Анимированная заглушка |

---

## 6. Details on Types / Variants

### read-only
Статическая метка. Цвет из набора 8 вариантов. Нет hover, нет cursor pointer. Используется для обозначения статусов, категорий, тематик.

### selectable
Работает как фильтр-чекбокс. Клик переключает между `default` и `selected`. В `selected` — заливка брендовым цветом. Можно группировать для множественного выбора фильтров.

### interactive
Имеет кнопку закрытия (×) справа. Клик на label — навигация или действие. Клик на × — удаление тега. Отдельный focus-ring для кнопки закрытия.

---

## 7. Behavior

### Keyboard interaction (`selectable` и `interactive`)

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на Tag |
| `Space` / `Enter` | Выбор (`selectable`) / активация (`interactive`) |
| `Tab` на `interactive` | Переход на кнопку закрытия |
| `Enter` / `Space` на × | Удаление |
| `Delete` / `Backspace` | Удаление `interactive` Tag (альтернатива) |

---

## 8. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="button"` | — | `selectable` и `interactive` |
| `aria-pressed` | `true` / `false` | `selectable` |
| `aria-label="Удалить [label]"` | — | Кнопка × в `interactive` |

---

## 9. Design Tokens

### Read-only colors (пример для `gray` и `blue`)

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tag-gray-bg` | Фон gray | `container/default` | `container/default` |
| `--tag-gray-text` | Текст gray | `text/secondary` | `text/secondary` |
| `--tag-blue-bg` | Фон blue | `status/info/container` | `status/info/container` |
| `--tag-blue-text` | Текст blue | `status/info/text` | `status/info/text` |

### Selectable

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tag-selectable-bg` | Фон default | `container/default` | `container/default` |
| `--tag-selectable-bg-hover` | Фон hover | `container/hover` | `container/hover` |
| `--tag-selectable-bg-selected` | Фон selected | `container/brand/default` | `container/brand/default` |
| `--tag-selectable-text-selected` | Текст selected | `text/on-brand/primary` | `text/on-brand/primary` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tag-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--tag-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
| `--tag-disabled-text` | Текст disabled | `status/disabled/text` | `status/disabled/text` |
