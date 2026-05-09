# Button

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · https://www.figma.com/design/h8wSwPpnlt91IQH7h4Kvj0/SEDA-UI-kit?node-id=2463-16164

---

## 1. Key Principles of Use

### What it is

Button — основной элемент взаимодействия. Инициирует действие: отправку формы, подтверждение операции, переход к следующему шагу. В отличие от Link, не ведёт к ресурсу — всегда запускает процесс.

### When to use

**Use** — когда нужно инициировать действие: отправить форму, подтвердить удаление, запустить процесс, сохранить изменения, перейти к следующему шагу мастера.

**Don't use:**
- Для навигации к URL — используйте **Link**
- Для выбора из вариантов — используйте **Radio** или **Segmented Control**
- Для переключения режимов — используйте **Button Group**
- Для действий только с иконкой — используйте **Icon Button**

### Core principles

- **Один Primary на контекст** — несколько Primary конкурируют за внимание и размывают иерархию
- **Hierarchy** — Primary → Secondary → Ghost → Text отражает убывающий визуальный вес
- **Label-глагол** — следуйте `foundation/content.md`: «Сохранить», «Удалить», «Отправить». Избегайте «OK», «Да»
- **Destruction только для необратимого** — всегда сопровождается шагом подтверждения

---

## 2. Anatomy

```
┌─────────────────────────────────────┐
│  [icon-left]   Label   [icon-right] │
└─────────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required (кроме icon-only) | Текстовая метка. Глагол или глагольная фраза |
| `icon-left` | optional | Иконка слева от label. Следует `foundation/iconography.md`, усиливает смысл и не дублирует |
| `icon-right` | optional | Иконка справа. Следует `foundation/iconography.md`; для стрелок, внешних ссылок, раскрытия |
| `spinner` | conditional | Появляется в состоянии `loading` вместо иконки |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `primary` | Главное действие на экране. Один на контекст |
| `secondary` | Второстепенное действие рядом с Primary |
| `ghost` | Третичное действие, нет заливки, только граница |
| `text` | Минимальный вес, встраивается в текстовый контент |
| `destruction` | Необратимые действия: удаление, отзыв доступа |

### Modifiers

| Модификатор | Описание | Ограничения |
|---|---|---|
| `icon-left` | Иконка слева от label | Нельзя с `icon-only` |
| `icon-right` | Иконка справа от label | Нельзя с `icon-only` |
| `icon-only` | Только иконка, без label | Требует `aria-label` и Tooltip |
| `full-width` | Растягивается на всю ширину контейнера | Только для одиночной кнопки |

### Type hierarchy

| Контекст | Primary | Secondary | Ghost / Text |
|---|---|---|---|
| Форма сохранения | Сохранить | Отменить | — |
| Диалог удаления | Destruction: Удалить | Отмена | — |
| Карточка объекта | Открыть | Редактировать | Поделиться |
| Тулбар | — | Export | Filter, Sort |

---

## 4. Sizes

| Size | Height | Font / Line | Radius | Padding H | Icon | Контекст |
|---|---|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | 8px | `icon/14` | Тулбары, inline-действия, таблицы |
| `medium` | 32px | 14px / 20px | 8px | 12px | `icon/16` | Формы, карточки — **дефолт** |
| `large` | 40px | 16px / 24px | 10px | 16px | `icon/18` | Акцентные CTA |
| `extraLarge` | 48px | 18px / 28px | 12px | 20px | `icon/20` | Hero-секции, touch-first |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Базовое состояние | Базовые bg, border, text |
| `hover` | Курсор над кнопкой | bg, border → hover-токены |
| `active` | Нажатие (mousedown) | bg, border → pressed-токены |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `loading` | Async-операция | Spinner вместо иконки, `pointer-events: none` |
| `disabled` | Недоступен | Все элементы через `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `hover` + `focus` | ✓ | Tab-навигация при наведении |
| `active` + `focus` | ✓ | Нажатие Enter / Space |
| `loading` + `disabled` | ✓ | Блокировка во время запроса |
| `hover` + `disabled` | ✗ | `disabled` отменяет все интерактивные |
| `loading` + `hover` | ✗ | В `loading` кнопка визуально недоступна |

---

## 6. Details on Types / Variants

### primary
Заливка `container/brand/default`. Текст `text/on-brand/primary`. Hover → `container/brand/hover`, active → `container/brand/pressed`. Один на контекст.

### secondary
Заливка `container/default`, граница `border/default`. Hover → лёгкая заливка `container/hover`. Размещается рядом с Primary или как единственное действие без высокого приоритета.

### ghost
Нет заливки в default, только граница. При hover появляется `container/default`. Для тулбаров и карточек с высокой плотностью.

### text
Нет заливки и границы. Встраивается в текстовый контент как inline-действие. Не ставьте рядом с Primary в группе действий.

### destruction
Красная заливка `status/error/surface`. Сигнализирует необратимость. Всегда требует шага подтверждения. Никогда не помещайте как единственный CTA на экране.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` | Активация кнопки |
| `Space` | Активация кнопки |

### Loading state
При запуске async-операции: label заменяется спиннером, кнопка неинтерактивна (`pointer-events: none`, `aria-disabled="true"`). Ширина кнопки не меняется.

### Icon-only mode
Ширина равна высоте (квадратный контрол). Всегда добавляйте `aria-label` и Tooltip.

### Touch targets
Минимальная зона — 44×44px. Для `small` и `medium` расширяется невидимым padding.

---

## 8. Accessibility

Компонент следует `foundation/accessibility.md` и соответствует WCAG 2.2 AA.

### Semantics

| Элемент / часть | Семантика | Когда |
|---|---|---|
| Root | `<button type="button">` или `<button type="submit">` | Всегда. Не заменять на `<div>` или `<a>` |
| `icon-left` / `icon-right` | `aria-hidden="true"` | Если иконка дублирует label |
| `spinner` | `aria-hidden="true"` | Если состояние уже передано через `aria-busy` |

### Keyboard

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` | Активация кнопки |
| `Space` | Активация кнопки |

В `disabled` кнопка исключается из tab-order через нативный атрибут `disabled`. В `loading` кнопка остаётся в tab-order, но повторная активация блокируется через `aria-disabled="true"` и внутреннюю проверку обработчика.

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `aria-label` | Описание действия | Для `icon-only` |
| `aria-busy="true"` | — | Состояние `loading` |
| `aria-disabled="true"` | — | Состояние `loading` (остаётся в DOM) |
| `disabled` | — | Состояние `disabled` — через нативный атрибут |
| `type` | `button` / `submit` / `reset` | Всегда указывать явно, чтобы избежать случайного submit |

### Validation & status

| Состояние | Требование |
|---|---|
| `loading` | Сохраняет доступное имя кнопки; spinner не заменяет смысл действия |
| `disabled` | Использует нативный `disabled`; причина недоступности объясняется рядом или через Tooltip, если она не очевидна |
| `destruction` | Label следует `foundation/content.md`: явно называет необратимое действие и объект; цвет не единственный сигнал опасности |

### Visual
- Контрастность текста: минимум 4.5:1
- Контрастность иконки и интерактивной границы: минимум 3:1
- Focus ring использует `focus/ring`, видим на любом фоне и не обрезается контейнером
- Destruction не передаётся только цветом — используйте иконку или явный label
- `disabled`: контраст ниже 4.5:1 допустим (WCAG 1.4.3)

### Touch

- Минимальная зона — 44×44px.
- Для `small` и `medium` визуальная высота может быть меньше, но hit area расширяется невидимым padding.

### Motion

- Loading spinner уважает `prefers-reduced-motion: reduce`: допускается статичный индикатор или текстовое состояние без вращения.
- Переходы hover/active не должны вызывать layout shift.

### Acceptance checklist

- [ ] Использован нативный `<button>`.
- [ ] Указан явный `type`.
- [ ] Icon-only режим имеет `aria-label` и Tooltip.
- [ ] Loading сохраняет доступное имя действия и блокирует повторный запуск.
- [ ] Disabled исключён из tab-order через нативный `disabled`.
- [ ] Focus ring использует `focus/ring`.
- [ ] Текст имеет контраст минимум 4.5:1.
- [ ] Иконки и границы имеют контраст минимум 3:1.
- [ ] Touch target не меньше 44×44px.
- [ ] Destruction не передан только цветом.

---

## 9. Design Tokens

### Primary

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--btn-primary-bg` | `button/primary/solid/surface/default` | Фон default | `container/brand/default` |
| `--btn-primary-bg-hover` | `button/primary/solid/surface/hover` | Фон hover | `container/brand/hover` |
| `--btn-primary-bg-pressed` | `button/primary/solid/surface/pressed` | Фон pressed | `container/brand/pressed` |
| `--btn-primary-bg-disabled` | `button/primary/solid/surface/disabled` | Фон disabled | `status/disabled/surface` |
| `--btn-primary-border` | `button/primary/solid/border/default` | Граница default | `border/brand/default` |
| `--btn-primary-border-hover` | `button/primary/solid/border/hover` | Граница hover | `border/brand/hover` |
| `--btn-primary-border-pressed` | `button/primary/solid/border/pressed` | Граница pressed | `border/brand/pressed` |
| `--btn-primary-border-disabled` | `button/primary/solid/border/disabled` | Граница disabled | `status/disabled/border` |
| `--btn-primary-label` | `button/primary/solid/foreground/default` | Текст / иконка | `text/on-brand/primary` |
| `--btn-primary-label-disabled` | `button/primary/solid/foreground/disabled` | Текст disabled | `status/disabled/text` |
| `--btn-primary-focus-ring` | `button/primary/solid/focus/ring` | Кольцо фокуса | `focus/ring` |

### Secondary

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--btn-secondary-bg` | `button/neutral/secondary/surface/default` | Фон default | `container/default` |
| `--btn-secondary-bg-hover` | `button/neutral/secondary/surface/hover` | Фон hover | `container/hover` |
| `--btn-secondary-bg-pressed` | `button/neutral/secondary/surface/pressed` | Фон pressed | `container/pressed` |
| `--btn-secondary-bg-disabled` | `button/neutral/secondary/surface/disabled` | Фон disabled | `status/disabled/surface` |
| `--btn-secondary-border` | `button/neutral/secondary/border/default` | Граница default | `border/default` |
| `--btn-secondary-border-hover` | `button/neutral/secondary/border/hover` | Граница hover | `border/hover` |
| `--btn-secondary-border-pressed` | `button/neutral/secondary/border/pressed` | Граница pressed | `border/pressed` |
| `--btn-secondary-border-disabled` | `button/neutral/secondary/border/disabled` | Граница disabled | `status/disabled/border` |
| `--btn-secondary-label` | `button/neutral/secondary/foreground/default` | Текст / иконка | `text/primary` |
| `--btn-secondary-label-disabled` | `button/neutral/secondary/foreground/disabled` | Текст disabled | `status/disabled/text` |
| `--btn-secondary-focus-ring` | `button/neutral/secondary/focus/ring` | Кольцо фокуса | `focus/ring` |

### Ghost

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--btn-ghost-bg` | `button/neutral/ghost/surface/default` | Фон default | `transparent` |
| `--btn-ghost-bg-hover` | `button/neutral/ghost/surface/hover` | Фон hover | `container/hover` |
| `--btn-ghost-bg-pressed` | `button/neutral/ghost/surface/pressed` | Фон pressed | `container/pressed` |
| `--btn-ghost-bg-disabled` | `button/neutral/ghost/surface/disabled` | Фон disabled | `transparent` |
| `--btn-ghost-label` | `button/neutral/ghost/foreground/default` | Текст / иконка | `text/primary` |
| `--btn-ghost-label-disabled` | `button/neutral/ghost/foreground/disabled` | Текст disabled | `status/disabled/text` |
| `--btn-ghost-focus-ring` | `button/neutral/ghost/focus/ring` | Кольцо фокуса | `focus/ring` |

### Text

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--btn-text-label` | `button/neutral/text/foreground/default` | Текст default | `text/secondary` |
| `--btn-text-label-hover` | `button/neutral/text/foreground/hover` | Текст hover | `text/primary` |
| `--btn-text-label-pressed` | `button/neutral/text/foreground/pressed` | Текст pressed | `text/tertiary` |
| `--btn-text-label-disabled` | `button/neutral/text/foreground/disabled` | Текст disabled | `status/disabled/text` |
| `--btn-text-focus-ring` | `button/neutral/text/focus/ring` | Кольцо фокуса | `focus/ring` |

### Destruction

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--btn-danger-bg` | `button/danger/solid/surface/default` | Фон default | `status/error/container/default` |
| `--btn-danger-bg-hover` | `button/danger/solid/surface/hover` | Фон hover | `status/error/container/hover` |
| `--btn-danger-bg-pressed` | `button/danger/solid/surface/pressed` | Фон pressed | `status/error/container/pressed` |
| `--btn-danger-bg-disabled` | `button/danger/solid/surface/disabled` | Фон disabled | `status/disabled/surface` |
| `--btn-danger-label` | `button/danger/solid/foreground/default` | Текст / иконка | `text/on-brand/primary` |
| `--btn-danger-label-disabled` | `button/danger/solid/foreground/disabled` | Текст disabled | `status/disabled/text` |
| `--btn-danger-focus-ring` | `button/danger/solid/focus/ring` | Кольцо фокуса | `focus/ring` |
