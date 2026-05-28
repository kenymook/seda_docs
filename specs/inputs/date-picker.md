# Date Picker

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Date Picker — контрол выбора даты из календарного виджета. Сочетает текстовое поле ввода и всплывающий календарь.

### When to use

**Use** — для выбора даты события, срока, периода; в формах бронирования, фильтрах, профилях.

**Do not use:**
- Для выбора только месяца/года — используйте соответствующий тип
- Когда дата вводится регулярно и известна точно — рассмотрите Text Field с маской

---

## 2. Anatomy

```
Label
┌────────────────────┬────┐
│ DD.MM.YYYY         │ 📅 │
└────────────────────┴────┘
Helper text

Calendar (открыт):
┌─────────────────────────┐
│  ← Апрель 2025    →     │
├───┬───┬───┬───┬───┬───┬─┤
│ Пн│ Вт│ Ср│ Чт│ Пт│ Сб│Вс│
├───┼───┼───┼───┼───┼───┼─┤
│   │ 1 │ 2 │ 3 │ 4 │ 5 │6 │
│...│   │   │   │   │   │  │
└───┴───┴───┴───┴───┴───┴──┘
│         Footer actions   │
└──────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Метка поля |
| `input` | required | Текстовый инпут с маской даты |
| `calendar-icon` | required | Кнопка открытия календаря |
| `placeholder` | optional | Формат даты как подсказка |
| `helper-text` | optional | Подсказка под полем |
| `footer-actions` | optional | Кнопки «Сегодня», «Очистить» в нижней части |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `single` | Выбор одной даты |
| `range` | Выбор периода (дата начала + дата конца) |
| `month` | Выбор месяца и года |
| `year` | Выбор только года |

---

## 4. Sizes

| Size | Input height | Font / Line | Контекст |
|---|---|---|---|
| `small` | 24px | 12px / 16px | Компактные фильтры |
| `medium` | 32px | 14px / 20px | Формы — дефолт |
| `large` | 40px | 16px / 24px | Акцентные поля |

> Date Picker не поддерживает `extraLarge`.

---

## 5. States

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Пустое поле | Базовые border, bg |
| `hover` | Курсор над полем | `border/hover` |
| `focus` | Активно | `border/brand/default`, `focus/ring` |
| `open` | Календарь открыт | Иконка активна, календарь visible |
| `filled` | Дата выбрана | Дата в поле |
| `error` | Невалидная дата | `status/danger/border` |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

---

## 6. Details on Types / Variants

### single
Клик на день выбирает дату и закрывает календарь. Ввод с клавиатуры поддерживается через маску.

### range
Два клика — начало и конец периода. Между ними — подсветка диапазона. Во время выбора второй даты — hover показывает предполагаемый диапазон.

### month / year
Упрощённый picker без отображения дней. Для фильтров по периоду.

---

## 7. Behavior

### Keyboard interaction (calendar)

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на инпут / кнопку календаря |
| `Enter` / `Space` | Открыть / выбрать дату |
| `Escape` | Закрыть календарь |
| `↑` / `↓` | Неделя назад / вперёд |
| `←` / `→` | День назад / вперёд |
| `Page Up/Down` | Предыдущий / следующий месяц |

---

## 8. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="dialog"` | — | Контейнер календаря |
| `aria-label="Выбор даты"` | — | На диалоге |
| `role="grid"` | — | Таблица дней |
| `role="gridcell"` | — | Каждый день |
| `aria-selected` | `true` | Выбранный день |
| `aria-disabled` | `true` | Недоступный день |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--datepicker-border` | Граница инпута | `border/default` | `border/default` |
| `--datepicker-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--datepicker-calendar-bg` | Фон календаря | `surface/base` | `surface/base` |
| `--datepicker-day-hover` | Hover дня | `surface/subtle` | `surface/subtle` |
| `--datepicker-day-selected` | Выбранный день | `container/brand/default` | `container/brand/default` |
| `--datepicker-day-selected-text` | Текст выбранного | `text/on-brand/primary` | `text/on-brand/primary` |
| `--datepicker-range-bg` | Фон диапазона | `container/brand/default` | `container/brand/default` |
| `--datepicker-day-today` | Обводка сегодня | `border/brand/default` | `border/brand/default` |
| `--datepicker-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |


---

## Related specifications / Связанные спецификации

- [Text Field](../specs/inputs/text-field.md) — ручной ввод даты.
- [Popover](../specs/feedback/popover.md) — раскрываемая календарная панель.
- [Form](../specs/overlays-layout/form.md) — validation и layout.

