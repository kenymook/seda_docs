# Toggle

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Toggle — переключатель бинарного состояния. Мгновенно применяет изменение без дополнительного подтверждения (в отличие от Checkbox в форме). Используется для включения/выключения настроек и функций.

### When to use

**Use** — для мгновенного включения/выключения настройки: тёмная тема, уведомления, режим, отображение элементов. Изменение применяется немедленно.

**Do not use:**
- Когда нужно подтверждение перед применением — используйте **Checkbox** в форме с кнопкой Save
- Для выбора одного из трёх+ вариантов — используйте **Radio** или **Select**
- Когда значение «включено» неочевидно из label — добавьте явный label со статусом

### Core principles

- **Мгновенное действие** — Toggle применяет изменение сразу, без Submit
- **Понятный label** — label описывает настройку, не состояние («Тёмная тема», не «Включить тёмную тему»)
- **Нет среднего состояния** — Toggle бинарен. Если нужен третий вариант — используйте другой компонент

---

## 2. Anatomy

```
[●──]  Label text     (off)
[──●]  Label text     (on)
       Helper text
```

| Slot | Обязательность | Описание |
|---|---|---|
| `track` | required | Фоновая дорожка переключателя |
| `thumb` | required | Ползунок, перемещающийся по track |
| `label` | required | Описание настройки |
| `helper-text` | optional | Подсказка под label |

---

## 3. Types / Variants

Toggle имеет один тип. Состояние определяется `on` / `off`.

---

## 4. Sizes

Toggle не следует стандартной системе высот — он имеет специфичные пропорции.

| Size | Track (h×w) | Thumb diameter | Контекст |
|---|---|---|---|
| `small` | 16×24px | 10px | Компактные списки настроек |
| `medium` | 20×28px | 12px | Страницы настроек — дефолт |
| `large` | 24×36px | 16px | Акцентные переключатели |
| `extraLarge` | 28×44px | 20px | Для больших разрешений |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `off-default` | Выключен | Track `container/neutral/default`, thumb белый |
| `off-hover` | Выключен, курсор над | Track `container/neutral/hover` |
| `on-default` | Включён | Track `container/brand/default`, thumb белый справа |
| `on-hover` | Включён, курсор над | Track `container/brand/hover` |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border`, оба состояния |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `on` + `hover` | ✓ | — |
| `off` + `hover` | ✓ | — |
| `on` + `focus` | ✓ | `focus/ring` |
| `disabled` + `on` | ✓ | Отображает зафиксированное состояние |
| `disabled` + `hover` | ✗ | — |

---

## 6. Details on Types / Variants

Toggle реализован как `<button role="switch">` или `<input type="checkbox">` с кастомным отображением. При переключении применяется CSS-анимация движения thumb по track по `foundation/motion.md`: `duration/base` (150ms), `easing/enter` или `easing/standard`.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Space` | Переключение состояния |

### Animation
Thumb плавно перемещается между позициями. Анимация должна быть отключена при `prefers-reduced-motion: reduce`.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="switch"` | — | Всегда |
| `aria-checked="true"` | — | Состояние `on` |
| `aria-checked="false"` | — | Состояние `off` |
| `aria-label` | Описание настройки | Если label не связан программно |
| `aria-disabled="true"` | — | Состояние `disabled` |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--toggle-track-off` | Track выключен | `container/neutral/default` | `container/neutral/default` |
| `--toggle-track-off-hover` | Track hover выключен | `container/neutral/hover` | `container/neutral/hover` |
| `--toggle-track-on` | Track включён | `container/brand/default` | `container/brand/default` |
| `--toggle-track-on-hover` | Track hover включён | `container/brand/hover` | `container/brand/hover` |
| `--toggle-thumb` | Цвет ползунка | `surface/base` | `surface/base` |
| `--toggle-track-disabled` | Track disabled | `status/disabled/container` | `status/disabled/container` |
| `--toggle-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--toggle-label` | Цвет label | `text/primary` | `text/primary` |
| `--toggle-helper` | Цвет helper | `text/tertiary` | `text/tertiary` |


---

## Related specifications / Связанные спецификации

- [Checkbox](../specs/inputs/checkbox.md) — явный бинарный или множественный выбор.
- [Radio](../specs/inputs/radio.md) — выбор одного варианта из группы.
- [Form](../specs/overlays-layout/form.md) — размещение controls и helper text.

