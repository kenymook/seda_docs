# Checkbox

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Checkbox — элемент выбора одного или нескольких значений из набора. Может существовать самостоятельно или в составе группы. В отличие от Radio, позволяет выбрать несколько значений одновременно.

### When to use

**Use** — для множественного выбора из списка вариантов; для бинарного согласия (принятие условий); как родительский контрол группы с `indeterminate`-состоянием.

**Do not use:**
- Для выбора ровно одного из нескольких вариантов — используйте **Radio**
- Для мгновенного включения/выключения настройки — используйте **Toggle**
- Если вариантов больше 8 — используйте **Select** с множественным выбором

### Core principles

- **Независимые значения** — каждый чекбокс в группе независим
- **Явный label** — каждый чекбокс должен иметь видимый label
- **Indeterminate — только для родителя** — тип `indeterminate` означает частичный выбор в дочерней группе

---

## 2. Anatomy

```
[✓]  Label text
     Helper text
```

| Slot | Обязательность | Описание |
|---|---|---|
| `control` | required | Визуальный квадрат с галочкой |
| `label` | required | Текст рядом с контролом |
| `helper-text` | optional | Подсказка под label |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `default` | Стандартный чекбокс — выбран или нет |
| `indeterminate` | Частичный выбор. Для родительского чекбокса группы, где выбраны не все дочерние |

---

## 4. Sizes

| Size | Control size | Font / Line | Контекст |
|---|---|---|---|
| `small` | 14px | 12px / 16px | Компактные списки, таблицы |
| `medium` | 16px | 14px / 20px | Формы — дефолт |
| `large` | 18px | 16px / 24px | Акцентные настройки |
| `extraLarge` | 20px | 18px / 28px | Мобильные интерфейсы |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Не выбран | Пустой контрол, граница `border/default` |
| `hover` | Курсор над элементом | Фон `container/neutral/hover` |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `checked` | Выбран | Заливка `container/brand/default`, галочка |
| `indeterminate` | Частично выбран | Заливка `container/brand/default`, тире |
| `error` | Ошибка валидации | Граница `status/danger/border` |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `checked` + `hover` | ✓ | Наведение на выбранный |
| `checked` + `focus` | ✓ | Фокус на выбранном |
| `error` + `focus` | ✓ | Фокус на поле с ошибкой |
| `checked` + `indeterminate` | ✗ | Взаимоисключающие |
| `disabled` + любое интерактивное | ✗ | — |

---

## 6. Details on Types / Variants

### default
Переключается между `checked` и `unchecked` по клику или `Space`. Контрол — квадрат с скруглёнными углами. При `checked` — галочка SVG на фоне `container/brand/default`.

### indeterminate
Состояние родительского чекбокса когда выбраны некоторые (но не все) дочерние. Визуально — горизонтальное тире вместо галочки. Устанавливается программно через `element.indeterminate = true`. По клику переходит в `checked` (выбирает все дочерние).

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Space` | Переключение состояния |

### Group behavior
В группе чекбоксов каждый элемент независим. Tab перемещается по всем чекбоксам последовательно. Родительский чекбокс (при наличии) управляет всеми дочерними: `checked` выбирает все, `unchecked` снимает все.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="checkbox"` | — | Нативный `<input type="checkbox">` |
| `aria-checked="true"` | — | Выбран |
| `aria-checked="false"` | — | Не выбран |
| `aria-checked="mixed"` | — | Indeterminate |
| `aria-required="true"` | — | Обязательное поле |
| `aria-describedby` | ID helper-text | При наличии helper-text |
| `aria-label` | — | Если нет видимого label |

### Visual
- Touch-target: минимум 44×44px (WCAG 2.5.8)
- Состояние `checked` не передаётся только цветом — галочка визуально отличает

---

## 9. Design Tokens

### Control

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--checkbox-bg` | Фон unchecked | `surface/base` | `surface/base` |
| `--checkbox-bg-hover` | Фон hover | `container/neutral/default` | `container/neutral/default` |
| `--checkbox-bg-checked` | Фон checked | `container/brand/default` | `container/brand/default` |
| `--checkbox-border` | Граница unchecked | `border/inverse` | `border/inverse` |
| `--checkbox-border-hover` | Граница hover | `border/inverse` | `border/inverse` |
| `--checkbox-border-error` | Граница error | `status/danger/border` | `status/danger/border` |
| `--checkbox-check-icon` | Галочка / тире | `text/on-brand/primary` | `text/on-brand/primary` |

### Label

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--checkbox-label` | Цвет label | `text/primary` | `text/primary` |
| `--checkbox-helper` | Цвет helper-text | `text/tertiary` | `text/tertiary` |
| `--checkbox-label-disabled` | Label disabled | `status/disabled/text` | `status/disabled/text` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--checkbox-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--checkbox-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
| `--checkbox-disabled-border` | Граница disabled | `status/disabled/border` | `status/disabled/border` |


---

## Related specifications / Связанные спецификации

- [Radio](../specs/inputs/radio.md) — выбор одного варианта.
- [Toggle](../specs/inputs/toggle.md) — мгновенное включение/выключение настройки.
- [Form](../specs/overlays-layout/form.md) — группировка и validation.

