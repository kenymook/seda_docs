# Radio

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Radio — элемент выбора одного значения из группы взаимоисключающих вариантов. Всегда используется в составе Radio Group — одиночный Radio без группы не имеет смысла.

### When to use

**Use** — когда нужно выбрать ровно один вариант из 2–7 взаимоисключающих; когда все варианты должны быть видны одновременно; для настроек и параметров.

**Don't use:**
- Для множественного выбора — используйте **Checkbox**
- Для мгновенного переключения настройки — используйте **Toggle**
- Более 7 вариантов — используйте **Select**

### Core principles

- **Всегда в группе** — Radio без группы теряет семантику
- **Один выбран всегда** — в группе всегда должен быть выбранный вариант (или явное «не выбрано»)
- **Видимые варианты** — все опции видны без дополнительных действий

---

## 2. Anatomy

```
(●)  Label text
     Helper text
```

| Slot | Обязательность | Описание |
|---|---|---|
| `control` | required | Круглый контрол с точкой |
| `label` | required | Текст варианта |
| `helper-text` | optional | Подсказка под label |

---

## 3. Types / Variants

Radio имеет один тип. Варианты определяются состоянием (`selected` / `default`).

---

## 4. Sizes

| Size | Control size | Font / Line | Контекст |
|---|---|---|---|
| `small` | 14px | 12px / 16px | Компактные списки |
| `medium` | 16px | 14px / 20px | Формы — дефолт |
| `large` | 18px | 16px / 24px | Акцентные настройки |
| `extraLarge` | 20px | 18px / 28px | Мобильные |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Не выбран | Пустой контрол, граница |
| `hover` | Курсор над элементом | Фон `container/hover` |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `selected` | Выбран | Заливка `container/brand/default`, точка |
| `error` | Ошибка в группе | Граница `status/error/border` |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

---

## 6. Details on Types / Variants

Все Radio в группе разделяют один `name` атрибут. При выборе одного — остальные снимаются автоматически браузером (нативное поведение `<input type="radio">`).

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на группу (на выбранный элемент) |
| `↑` / `←` | Предыдущий вариант в группе |
| `↓` / `→` | Следующий вариант в группе |
| `Space` | Выбор сфокусированного варианта |

> В Radio Group Tab перемещает фокус на всю группу, стрелки — внутри группы. Из группы выходят через Tab.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="radiogroup"` | — | На контейнере группы |
| `role="radio"` | — | Нативный `<input type="radio">` |
| `aria-checked` | `true` / `false` | Состояние |
| `aria-labelledby` | ID заголовка группы | Для группы |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--radio-bg` | Фон unselected | `surface/default` | `surface/default` |
| `--radio-bg-selected` | Фон selected | `container/brand/default` | `container/brand/default` |
| `--radio-border` | Граница | `border/inverse/default` | `border/inverse/default` |
| `--radio-dot` | Точка selected | `text/on-brand/primary` | `text/on-brand/primary` |
| `--radio-border-error` | Граница error | `status/error/border` | `status/error/border` |
| `--radio-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--radio-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
| `--radio-label` | Цвет label | `text/primary` | `text/primary` |
| `--radio-helper` | Цвет helper | `text/tertiary` | `text/tertiary` |
