# Link

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Link — текстовый элемент навигации, ведущий к ресурсу: URL, другой странице, якорю или внешнему сайту. В отличие от Button, Link не инициирует действие — он осуществляет переход.

### When to use

**Use** — для навигации между страницами, переходов к внешним ресурсам, якорных ссылок внутри документа, текстовых ссылок в параграфах и описаниях.

**Don't use:**
- Для запуска действий (отправка формы, удаление, сохранение) — используйте **Button**
- Если URL нет или переход не предполагается — используйте **Button** с типом `text`

### Core principles

- **Нативный `<a>`** — всегда реализуется через элемент `<a href="...">`, не через `<button>` или `<div>`
- **Visited-состояние** — внешние ссылки должны иметь `visited`-состояние, чтобы пользователь знал, что уже посещал
- **Открытие в новой вкладке** — сигнализируйте через иконку `external` и `target="_blank"` с `rel="noopener noreferrer"`

---

## 2. Anatomy

```
[icon-left]  Link text  [icon-right / external-icon]
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Текст ссылки. Должен описывать назначение, а не «нажмите здесь» |
| `icon-left` | optional | Иконка слева |
| `icon-right` | optional | Иконка справа. Используется для внешних ссылок |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `default` | Стандартная ссылка. Цвет `link/default`, подчёркивание при hover |
| `subtle` | Приглушённая ссылка. Цвет `text/secondary`, подчёркивание сигнализирует о кликабельности |
| `danger` | Деструктивная навигация или предупреждающая ссылка. Красный цвет |

### Modifiers

| Модификатор | Описание | Ограничения |
|---|---|---|
| `icon-left` | Иконка слева от текста | — |
| `icon-right` | Иконка справа от текста | — |
| `external` | Иконка внешней ссылки справа + `target="_blank"` | Всегда добавляйте `rel="noopener noreferrer"` |

---

## 4. Sizes

Link не имеет фиксированной высоты — он наследует размер шрифта из контекста. Размер иконок подбирается к шрифту автоматически.

> Link не входит в глобальную size-систему SEDA UI (нет prop `size`).

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Исходный вид | Цвет `link/default`, нет подчёркивания |
| `hover` | Курсор над ссылкой | Цвет `link/hover`, подчёркивание появляется |
| `active` | Нажатие (mousedown) | Цвет `link/pressed` |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `visited` | Ссылка уже посещена | Цвет `link/visited` |
| `disabled` | Недоступна | `status/disabled/text`, cursor `not-allowed` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `visited` + `hover` | ✓ | Цвет `link/visited-hover` |
| `visited` + `active` | ✓ | Цвет `link/visited-pressed` |
| `hover` + `focus` | ✓ | Tab-навигация при наведении |
| `disabled` + любое интерактивное | ✗ | `disabled` отменяет все |

---

## 6. Details on Types / Variants

### default
Основная ссылка. Цвет `link/default` (синий). В состоянии hover — `link/hover` с подчёркиванием. Visited — `link/visited` (фиолетовый).

### subtle
Ссылка с меньшим визуальным акцентом. Используется в текстовых блоках, где синий цвет перегружал бы контент. Цвет `text/secondary`, подчёркивание сигнализирует о кликабельности.

### danger
Предупреждающая ссылка. Цвет `status/error/text`. Используется для ссылок с деструктивным контекстом (например, «Узнать о последствиях удаления»).

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` | Переход по ссылке |

### External links
При `target="_blank"` всегда добавляйте `rel="noopener noreferrer"` и иконку внешней ссылки. Предупреждайте пользователя об открытии в новой вкладке через `aria-label` или скрытый текст.

### Disabled
Реализуется через `aria-disabled="true"` и `tabindex="-1"`. Нативный атрибут `disabled` не работает на `<a>`. Предотвращайте навигацию через `e.preventDefault()`.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `<a href="...">` | — | Всегда |
| `aria-label` | Полное описание | Когда текст ссылки недостаточно информативен («подробнее», «здесь») |
| `target="_blank"` + скрытый текст | «открывается в новой вкладке» | Для внешних ссылок |
| `aria-disabled="true"` | — | Состояние `disabled` |

### Visual
- Контрастность: минимум 4.5:1
- Ссылка не передаётся только цветом — подчёркивание или иконка обязательны в inline-тексте
- Focus ring видим на любом фоне

---

## 9. Design Tokens

### Default

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--link-color` | Цвет default | `link/default` | `link/default` |
| `--link-color-hover` | Цвет hover | `link/hover` | `link/hover` |
| `--link-color-pressed` | Цвет active | `link/pressed` | `link/pressed` |
| `--link-color-visited` | Цвет visited | `link/visited` | `link/visited` |
| `--link-color-visited-hover` | Цвет visited hover | `link/visited-hover` | `link/visited-hover` |

### Subtle & Danger

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--link-subtle-color` | Цвет subtle default | `text/secondary` | `text/secondary` |
| `--link-subtle-color-hover` | Цвет subtle hover | `text/primary` | `text/primary` |
| `--link-danger-color` | Цвет danger | `status/error/text` | `status/error/text` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--link-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--link-disabled-color` | Цвет disabled | `status/disabled/text` | `status/disabled/text` |
