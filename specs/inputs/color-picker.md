# Color Picker

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · TBD
> **Foundation** · `accessibility.md`, `color.md`, `content.md`, `iconography.md`, `tokens.md`

---

## 1. Key Principles of Use

### What it is

Color Picker — контрол для выбора цвета через swatch, палитру, spectrum или ручной HEX/RGB-ввод. Используется там, где цвет является пользовательским значением, а не системным design token.

### When to use

**Use** — для пользовательских меток, брендинга, настройки визуального оформления, выбора цвета объекта или категории.

**Don't use:**
- Для выбора semantic color tokens дизайн-системы — используйте token selector или predefined options.
- Для статусов `error`, `warning`, `success` — используйте status tokens.
- Для простого выбора из 3-8 фиксированных вариантов — используйте Radio, Segmented Control или Select.

### Core principles

- **Цвет не единственный смысл** — выбранный цвет должен иметь текстовое имя, preview или значение.
- **Ручной ввод поддерживается** — HEX/RGB нужен для точного значения.
- **Контраст проверяется** — если цвет применяется к тексту или поверхности, показывайте contrast feedback.

---

## 2. Anatomy

```
Label
┌──────────────┬──────────────┐
│ [swatch]     │ #0072F5      │
└──────────────┴──────────────┘
Helper / contrast feedback

Popover:
┌─────────────────────────────┐
│ Swatches                    │
│ Spectrum / sliders          │
│ HEX / RGB fields            │
│ [Cancel] [Apply]            │
└─────────────────────────────┘
```

| Slot / Part | Обязательность | Описание |
|---|---|---|
| `label` | required | Видимая метка контрола |
| `swatch` | required | Preview выбранного цвета |
| `value-input` | required | HEX или другой текстовый формат |
| `helper-text` | optional | Подсказка, contrast feedback или ошибка |
| `popover` | conditional | Расширенный выбор цвета |
| `palette` | optional | Набор готовых swatches |
| `spectrum` | optional | Визуальный выбор оттенка |
| `sliders` | optional | RGB/HSL/opacity значения |
| `actions` | conditional | Apply/Cancel для popover-режима |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `swatch-only` | Только выбор из готовых swatches |
| `compact` | Swatch + HEX input + popover |
| `full` | Palette + spectrum + numeric inputs |

### Modifiers

| Модификатор | Описание | Ограничения |
|---|---|---|
| `with-alpha` | Добавляет opacity/alpha control | Не использовать, если прозрачность не поддерживается |
| `with-contrast` | Показывает contrast ratio к выбранному фону/тексту | Нужен для text/background сценариев |
| `custom-palette` | Ограничивает выбор заданной палитрой | Не заменяет semantic token picker |

---

## 4. Sizes

Триггер Color Picker следует размерам input controls.

| Size | Height | Font / Line | Radius | Swatch | Контекст |
|---|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | `icon/14` | Плотные панели |
| `medium` | 32px | 14px / 20px | 8px | `icon/16` | Формы — дефолт |
| `large` | 40px | 16px / 24px | 10px | `icon/18` | Крупные формы |
| `extraLarge` | 48px | 18px / 28px | 12px | `icon/20` | Touch-first |

---

## 5. States

### State types

- **interaction:** `hover`, `focus`, `active`
- **data:** `filled`, `open`
- **validation:** `error`, `warning`, `success`
- **availability:** `disabled`, `read-only`

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Цвет не выбран или выбран default | Базовые surface/border/text |
| `hover` | Курсор над trigger | `border/hover` |
| `focus` | Фокус клавиатуры | `focus/ring` |
| `filled` | Есть выбранное значение | Swatch и value отображаются |
| `open` | Popover открыт | `aria-expanded="true"` |
| `error` | Невалидный формат или недоступный contrast | `status/error/border` + error text |
| `warning` | Контраст на границе допустимого | `status/warning/border` + warning text |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |
| `read-only` | Значение видно, но не редактируется | Value можно копировать |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `open` + `focus` | ✓ | Фокус внутри popover или на trigger по паттерну |
| `filled` + `error` | ✓ | Значение есть, но формат или contrast невалидны |
| `read-only` + `filled` | ✓ | Значение отображается и копируется |
| `disabled` + `open` | ✗ | Disabled не раскрывается |
| `error` + `success` | ✗ | Взаимоисключающие состояния |

---

## 6. Details on Types / Variants

### swatch-only

Используется, когда пользователь выбирает только из фиксированного набора. Каждый swatch должен иметь accessible name, например `aria-label="Синий"`.

### compact

Основной вариант для форм: trigger с swatch и HEX input, popover открывает расширенный выбор.

### full

Подходит для редакторов и настроек бренда. Включает palette, spectrum, numeric inputs и optional alpha.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение между trigger, input и popover controls |
| `Enter` / `Space` | Открыть popover или выбрать swatch |
| `Escape` | Закрыть popover и вернуть фокус на trigger |
| `Arrow keys` | Навигация по swatches или sliders |
| `Home` / `End` | Начало/конец slider или swatch row |

### Value input

- HEX ввод нормализуется к одному формату, например `#0072F5`.
- Невалидный ввод не применяет цвет и показывает error text.
- Если значение вставлено без `#`, система может нормализовать его, если формат однозначен.

### Contrast feedback

Если выбранный цвет применяется к тексту или фону, показывайте contrast feedback:

- `error`, если контраст ниже обязательного минимума;
- `warning`, если значение близко к минимуму;
- `success`, только если подтверждение действительно полезно.

---

## 8. Accessibility

Компонент следует `foundation/accessibility.md`, `foundation/color.md` и `foundation/content.md`.

### Semantics

| Элемент / часть | Семантика | Когда |
|---|---|---|
| `label` | `<label for="...">` | Всегда |
| `value-input` | Нативный `<input>` | Для HEX/RGB ввода |
| `swatch button` | `<button type="button">` | Swatch выбирает цвет |
| `popover trigger` | `aria-expanded`, `aria-controls` | При раскрытии |
| `spectrum/sliders` | Нативные inputs или `role="slider"` | Если кастомная реализация |

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `aria-label` | Название цвета или действия | Swatch без видимого текста |
| `aria-describedby` | ID helper/error/contrast text | При наличии описания |
| `aria-invalid="true"` | — | Невалидный формат или contrast error |
| `aria-expanded` | `true` / `false` | Trigger popover |

### Visual

- Swatch не должен быть единственным способом узнать цвет: показывайте value или name.
- Focus ring использует `focus/ring`.
- Contrast feedback не передаётся только цветом.
- Touch target для swatches и trigger минимум `44x44px` или расширяется hit area.

### Acceptance checklist

- [ ] Label видим и связан с input/trigger.
- [ ] Swatch имеет текстовое значение, name или accessible name.
- [ ] HEX/RGB input валидируется текстом, не только цветом.
- [ ] Popover закрывается по `Escape` и возвращает фокус.
- [ ] Swatches доступны с клавиатуры.
- [ ] Contrast feedback следует `foundation/color.md`.
- [ ] Touch target не меньше 44x44px.
- [ ] Icon/color-only signals имеют текстовую альтернативу.

---

## 9. Design Tokens

### Trigger

| Component token | Роль | Semantic token (Light) | Semantic token (Dark) |
|---|---|---|---|
| `--color-picker-bg` | Фон trigger | `surface/default` | `surface/default` |
| `--color-picker-border` | Граница default | `border/default` | `border/default` |
| `--color-picker-border-hover` | Граница hover | `border/hover` | `border/hover` |
| `--color-picker-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--color-picker-text` | Текст значения | `text/primary` | `text/primary` |
| `--color-picker-placeholder` | Placeholder | `text/muted` | `text/muted` |

### Validation

| Component token | Роль | Semantic token (Light) | Semantic token (Dark) |
|---|---|---|---|
| `--color-picker-border-error` | Error border | `status/error/border` | `status/error/border` |
| `--color-picker-border-warning` | Warning border | `status/warning/border` | `status/warning/border` |
| `--color-picker-helper-error` | Error text | `status/error/text` | `status/error/text` |
| `--color-picker-helper-warning` | Warning text | `status/warning/text` | `status/warning/text` |

### Popover

| Component token | Роль | Semantic token (Light) | Semantic token (Dark) |
|---|---|---|---|
| `--color-picker-popover-bg` | Фон popover | `surface/default` | `surface/default` |
| `--color-picker-popover-border` | Граница popover | `border/default` | `border/default` |
| `--color-picker-popover-shadow` | Тень popover | `shadow/darker` | `shadow/darker` |
| `--color-picker-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
