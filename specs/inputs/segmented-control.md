# Segmented Control

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Segmented Control — горизонтальная группа взаимоисключающих сегментов. Используется для переключения режимов или фильтров внутри одного контекста. В отличие от Tabs, не управляет полноценными view — только меняет состояние контента без перехода.

### When to use

**Use** — для переключения режима отображения (список / сетка / карта); для фильтрации с взаимоисключающими вариантами; для выбора масштаба (день / неделя / месяц).

**Do not use:**
- Для переключения между view с разным контентом — используйте **Tabs**
- Более 6 сегментов — используйте **Select** или **Radio Group**
- Для выполнения действий — используйте **Button Group**

### Core principles

- **Один активный** — всегда ровно один сегмент активен
- **Все варианты видны** — пользователь видит все опции без раскрытия
- **Ограничение 2–6** — больше 6 сегментов теряют читаемость

---

## 2. Anatomy

```
┌──────────┬──────────┬──────────┐
│ Segment 1│●Segment 2│ Segment 3│
└──────────┴──────────┴──────────┘
  (inactive) (active)  (inactive)
```

| Slot | Обязательность | Описание |
|---|---|---|
| `segment` | required (2–6) | Отдельный сегмент |
| `label` | required | Текст или иконка сегмента |
| `icon` | optional | Иконка в сегменте |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `text-only` | Только текстовые метки |
| `icon-only` | Только иконки (компактный вариант) |
| `icon+text` | Иконка и текст |

---

## 4. Sizes

| Size | Height | Font / Line | Radius (внешний) | Контекст |
|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | Компактные фильтры |
| `medium` | 32px | 14px / 20px | 8px | Тулбары — дефолт |
| `large` | 40px | 16px / 24px | 10px | Страницы с ключевым переключением |
| `extraLarge` | 48px | 18px / 28px | 12px | Hero-блоки |

---

## 5. States

### State matrix (на сегмент)

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `active` | Выбранный сегмент | Заливка `container/neutral/default` (или brand), текст `text/primary` |
| `non-active` | Невыбранный | Прозрачный фон, текст `text/tertiary` |
| `hover` | Курсор над невыбранным | Лёгкий фон `surface/subtle` |
| `disabled` | Сегмент недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

---

## 6. Details on Types / Variants

### text-only
Метки выровнены по центру. Минимальная ширина сегмента — ширина самого длинного label + padding. Все сегменты равной ширины или пропорциональны контенту.

### icon-only
Только иконка. Требует `aria-label` на каждом сегменте и Tooltip. Размер иконки соответствует системным значениям для выбранного size.

### icon+text
Иконка слева от текста. Используется для усиления смысла метки. Не перегружайте: иконка должна дополнять label, а не дублировать его.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на группу |
| `→` / `↓` | Следующий сегмент |
| `←` / `↑` | Предыдущий сегмент |
| `Space` / `Enter` | Активация |

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="radiogroup"` | — | Контейнер |
| `role="radio"` | — | Каждый сегмент |
| `aria-checked` | `true` / `false` | Состояние сегмента |
| `aria-label` | Описание | Для `icon-only` |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--segmented-bg` | Фон группы | `container/neutral/default` | `container/neutral/default` |
| `--segmented-segment-active` | Фон активного | `surface/base` | `surface/base` |
| `--segmented-segment-hover` | Фон hover | `surface/subtle` | `surface/subtle` |
| `--segmented-text-active` | Текст активного | `text/primary` | `text/primary` |
| `--segmented-text-inactive` | Текст неактивного | `text/tertiary` | `text/tertiary` |
| `--segmented-border` | Внешняя граница | `border/default` | `border/default` |
| `--segmented-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--segmented-disabled-text` | Текст disabled | `status/disabled/text` | `status/disabled/text` |


---

## Related specifications / Связанные спецификации

- [Radio](../specs/inputs/radio.md) — семантически явный single choice.
- [Tabs](../specs/navigation/tabs.md) — переключение между views.
- [Button Group](../specs/actions/button-group.md) — группа связанных действий.

