# Icon Button

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Icon Button — кнопка без текстовой метки, содержащая только иконку. Используется в тулбарах, карточках, строках таблиц и других контекстах, где пространство ограничено, а действие понятно из контекста или иконки.

### When to use

**Use** — в тулбарах и панелях действий, где пространство ограничено; в повторяющихся строках таблиц (удалить, редактировать, открыть); как вспомогательное действие в карточках (закрыть, поделиться, добавить в избранное).

**Do not use:**
- Если действие неочевидно из одной иконки — используйте **Button** с label
- Как основное (Primary) действие страницы — пользователь должен видеть, что произойдёт
- Если нет возможности добавить Tooltip — иконка без подписи недоступна

### Core principles

- **Tooltip обязателен** — каждый Icon Button должен иметь Tooltip и `aria-label`
- **Контекст оправдывает иконку** — иконка без label уместна только когда действие предсказуемо из контекста
- **Тот же визуальный вес, что Button** — используйте `primary`, `secondary`, `ghost` по тем же правилам иерархии
- **Иконка следует foundation** — размер, цвет и accessibility описаны в `foundation/iconography.md`

---

## 2. Anatomy

```
┌──────┐
│  ✦   │   ← icon (единственный контент)
└──────┘
  width = height (квадратный контрол)
```

| Slot | Обязательность | Описание |
|---|---|---|
| `icon` | required | SVG-иконка. Размер задаётся `foundation/iconography.md`, не переопределяется вручную |
| `tooltip` | required | Всплывающая подсказка с описанием действия |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `primary` | Главное иконочное действие. Залитый фирменный фон |
| `secondary` | Второстепенное действие. Граница без заливки |
| `ghost` | Минимальный вес. Нет фона и границы в default |
| `destruction` | Необратимое действие. Красный фон, требует подтверждения |

---

## 4. Sizes

Контрол всегда квадратный: `width = height`.

| Size | Size (w×h) | Icon size | Radius | Контекст |
|---|---|---|---|---|
| `small` | 24×24px | 14px | 6px | Строки таблиц, компактные тулбары |
| `medium` | 32×32px | 16px | 8px | Карточки, панели — дефолт |
| `large` | 40×40px | 18px | 10px | Акцентные действия |
| `extraLarge` | 48×48px | 20px | 12px | Hero, мобильные интерфейсы |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Базовое состояние | Базовые bg, border, icon color |
| `hover` | Курсор над кнопкой | bg, border → hover-токены |
| `active` | Нажатие (mousedown) | bg, border → pressed-токены |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `loading` | Async-операция | Spinner вместо иконки |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `hover` + `focus` | ✓ | Tab-навигация при наведении |
| `loading` + `disabled` | ✓ | Блокировка во время запроса |
| `hover` + `disabled` | ✗ | `disabled` отменяет все интерактивные |

---

## 6. Details on Types / Variants

### primary
Аналог Button primary. Залитый фон `container/brand/default`, иконка `text/on-brand/primary`. Используется для главного иконочного действия в локальном контексте.

### secondary
Аналог Button secondary. Граница `border/default`, фон прозрачный. Hover добавляет лёгкий фон.

### ghost
Нет границы и фона в default. При hover появляется `surface/base`. Самый частый вариант в тулбарах.

### destruction
Красный фон `status/danger/surface`. Иконка — предпочтительно корзина или крест. Всегда с подтверждением.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` / `Space` | Активация |

### Touch targets
Минимальная зона — 44×44px. Для `small` (24px) и `medium` (32px) расширяется невидимым padding.

### Tooltip
Tooltip появляется при hover и focus. Содержит текстовое описание действия — то же, что в `aria-label`. Позиция: `bottom` по умолчанию, адаптируется к краям экрана.

---

## 8. Accessibility

### Keyboard
Фокусируется через `Tab`. Активируется `Enter` и `Space`. В `disabled` исключается из tab-order.

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `<button>` | — | Всегда |
| `aria-label` | Описание действия | Всегда (нет видимого текста) |
| `aria-busy="true"` | — | Состояние `loading` |
| `disabled` | — | Состояние `disabled` |

### Visual
- Контрастность иконки на фоне: минимум 3:1 (WCAG AA для не-текстовых элементов)
- Focus ring видим на любом фоне
- Touch-target: 44×44px (WCAG 2.5.8)
- Icon-only accessibility и naming следуют `foundation/iconography.md` и `foundation/content.md`.

---

## 9. Design Tokens

### Background (Primary)

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--icon-btn-primary-bg` | Фон default | `container/brand/default` | `container/brand/default` |
| `--icon-btn-primary-bg-hover` | Фон hover | `container/brand/hover` | `container/brand/hover` |
| `--icon-btn-primary-bg-pressed` | Фон active | `container/brand/pressed` | `container/brand/pressed` |
| `--icon-btn-primary-icon` | Цвет иконки | `text/on-brand/primary` | `text/on-brand/primary` |

### Background (Secondary / Ghost)

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--icon-btn-bg-hover` | Фон hover | `surface/base` | `surface/base` |
| `--icon-btn-bg-pressed` | Фон active | `container/neutral/pressed` | `container/neutral/pressed` |
| `--icon-btn-border` | Граница secondary default | `border/default` | `border/default` |
| `--icon-btn-icon` | Цвет иконки | `text/secondary` | `text/secondary` |

### Destruction

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--icon-btn-destruction-bg` | Фон default | `status/danger/surface` | `status/danger/surface` |
| `--icon-btn-destruction-icon` | Цвет иконки | `status/danger/text` | `status/danger/text` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--icon-btn-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--icon-btn-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
| `--icon-btn-disabled-icon` | Иконка disabled | `status/disabled/text` | `status/disabled/text` |


---

## Related specifications / Связанные спецификации

- [Button](../specs/actions/button.md) — текстовые и icon+text действия.
- [Tooltip](../specs/feedback/tooltip.md) — обязательное пояснение для icon-only действия.
- [Button Group](../specs/actions/button-group.md) — группировка icon actions.

