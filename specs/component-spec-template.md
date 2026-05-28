# [Component Name]

> **Category** · [Actions / Inputs & Forms / Navigation / Data Display / Feedback / Overlays & Layout]
> **Version** · 1.0
> **Status** · draft / needs-review / ready / deprecated
> **Owner** · TBD
> **Last reviewed** · YYYY-MM-DD
> **Figma** · TBD
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `motion.md`, `radius-border.md`, `elevation.md`, `tokens.md`

---

## 1. Key Principles of Use

### What it is

[Одно–два предложения: что делает компонент и чем отличается от похожих. Пример: «Button инициирует действие — отправку формы, подтверждение операции, запуск процесса. В отличие от Link, не ведёт к ресурсу».]

### When to use

**Use** — [когда компонент уместен. Конкретные сценарии, не абстрактные советы.]

**Do not use** — [когда нужен другой компонент. Назовите альтернативы явно.]

### Core principles

- **[Принцип 1]** — [пояснение]
- **[Принцип 2]** — [пояснение]
- **[Принцип 3]** — [пояснение]

---

## 2. Anatomy

[Вставьте схему с именованными частями компонента. В Figma — annotated frame.]

| Slot / Part | Обязательность | Описание |
|---|---|---|
| `[slot-name]` | required | [что это, какое содержимое принимает] |
| `[slot-name]` | optional | [что это, когда используется] |
| `[slot-name]` | optional | [что это, когда используется] |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `[type]` | [когда используется, визуальный вес] |
| `[type]` | [когда используется, визуальный вес] |
| `[type]` | [когда используется, визуальный вес] |

### Modifiers

| Модификатор | Описание | Ограничения |
|---|---|---|
| `[modifier]` | [что делает] | [с чем нельзя комбинировать, когда не применять] |
| `[modifier]` | [что делает] | — |

### Type hierarchy

[Опишите, как типы взаимодействуют друг с другом. Примеры типовых комбинаций в группах действий.]

| Контекст | Primary | Secondary | Ghost / Text |
|---|---|---|---|
| [сценарий] | [label] | [label] | — |
| [сценарий] | — | [label] | [label] |

---

## 4. Sizes

Компонент следует `foundation/spacing-sizing.md`, `foundation/typography.md`, `foundation/radius-border.md` и, если использует иконки, `foundation/iconography.md`.

| Size | Height | Font / Line | Radius | [Доп. параметр] | Контекст |
|---|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | [значение] | [где используется] |
| `medium` | 32px | 14px / 20px | 8px | [значение] | [где используется] |
| `large` | 40px | 16px / 24px | 10px | [значение] | [где используется] |
| `extraLarge` | 48px | 18px / 28px | 12px | [значение] | [где используется] |

> Если компонент не поддерживает какой-то размер или отклоняется от системы — укажите это явно с обоснованием.

---

## 5. States

### State types

Опишите состояния через категории из `state-vocabulary.md`:

- **interaction:** `hover`, `focus`, `active`
- **selection:** `selected`, `checked`, `indeterminate`, `on/off`
- **data:** `filled`, `open`
- **validation:** `error`, `warning`, `success`
- **availability:** `disabled`, `read-only`
- **async:** `loading`

> Указывайте только те категории и состояния, которые реально поддерживает компонент.

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Исходный вид без взаимодействия | — |
| `hover` | Курсор над элементом | [что меняется: bg, border, opacity…] |
| `active` | Нажатие (mousedown) | [что меняется] |
| `focus` | Фокус клавиатуры (Tab) | focus/ring |
| `disabled` | Недоступен | [что меняется] |
| `[другое]` | [описание] | [что меняется] |

> Уберите строки с состояниями, которые компонент не поддерживает. Добавьте специфичные для компонента (например, `checked`, `indeterminate`, `loading`, `error`).

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `hover` + `focus` | ✓ | Tab-навигация при наведении |
| `[state]` + `[state]` | ✓ | [когда возникает] |
| `[state]` + `[state]` | ✗ | [почему недопустимо] |
| `disabled` + любое интерактивное | ✗ | disabled отменяет все взаимодействия |

---

## 6. Details on Types / Variants

[Для каждого типа — отдельный подраздел. Описывайте только различия от базового поведения, не повторяйте общие правила.]

### [Type name]

[Описание визуальных и функциональных особенностей этого типа. Токены, которые отличаются от дефолтных. Когда выбирать именно этот тип.]

### [Type name]

[…]

---

## 7. Behavior

Поведение компонента должно ссылаться на `foundation/interaction-model.md`, `foundation/motion.md`, `foundation/content.md` и `foundation/accessibility.md`, если эти правила применимы.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` | [действие] |
| `Space` | [действие] |
| `Escape` | [действие, если применимо] |
| `Arrow keys` | [действие, если применимо] |

### [Специфичное поведение 1]

[Например: как работает loading state, что происходит при переполнении, анимация открытия/закрытия.]

### [Специфичное поведение 2]

[Например: минимальная touch-зона, поведение на мобильных устройствах, поведение при переполнении контейнера.]

---

## 8. Accessibility

Компонент следует `foundation/accessibility.md` и должен соответствовать WCAG 2.2 AA.

### Semantics

| Элемент / часть | Семантика | Когда |
|---|---|---|
| `[root]` | `[native element / role]` | [всегда / условие] |
| `[interactive part]` | `[native element / role]` | [условие] |
| `[decorative part]` | `aria-hidden="true"` | [если не несёт смысла] |

### Keyboard

[Порядок фокуса, какие клавиши активируют компонент, как компонент ведёт себя при навигации только с клавиатуры. Укажите, возвращается ли фокус после закрытия временного слоя.]

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | [перемещение фокуса] |
| `Enter` | [активация / submit / выбор] |
| `Space` | [активация button-like control / выбор] |
| `Escape` | [закрытие, если применимо] |
| `Arrow keys` | [навигация внутри composite widget, если применимо] |

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role` | `[role]` | [только если нативной семантики недостаточно] |
| `aria-label` | `[описание]` | [когда нет видимого label] |
| `aria-labelledby` | `[id]` | [когда есть видимый заголовок / label] |
| `aria-describedby` | `[id]` | [helper text, error text, format hint] |
| `aria-[attr]` | `[значение]` | [условие] |

### Validation & status

| Состояние | Требование |
|---|---|
| `error` | `aria-invalid="true"` и связанный error text |
| `warning` | Текстовое объяснение, не только цвет |
| `success` | Не заменяет label/helper text |
| `loading` | `aria-busy`, progress semantics или live region, если состояние динамическое |
| `disabled` | Нативный `disabled` или `aria-disabled` по паттерну компонента |
| `read-only` | Значение доступно для чтения и копирования |

### Visual

- **Контрастность текста:** минимум 4.5:1.
- **Крупный текст:** минимум 3:1.
- **Иконки и UI boundaries:** минимум 3:1.
- **Focus indicator:** использует `focus/ring`, не зависит только от цвета и видим на любом фоне.
- **State communication:** error/warning/success/selected не передаются только цветом, если состояние важно для понимания.

### Touch

- Минимальный touch-target: 44×44px (WCAG 2.5.8).
- [Как достигается для маленьких размеров компонента.]

### Motion

- [Есть ли анимация открытия/закрытия/перемещения. Укажите pattern из `foundation/motion.md`.]
- [Как компонент ведёт себя при `prefers-reduced-motion: reduce`.]

### Acceptance checklist

- [ ] Использован нативный HTML там, где возможно.
- [ ] У всех интерактивных частей есть accessible name.
- [ ] Компонент полностью доступен с клавиатуры.
- [ ] Focus indicator видим и использует `focus/ring`.
- [ ] Контраст текста, иконок и интерактивных границ соответствует `foundation/accessibility.md`.
- [ ] Состояния валидации имеют текстовое объяснение.
- [ ] Icon-only режим имеет `aria-label` и Tooltip.
- [ ] Overlay/popup режим управляет focus trap и focus return, если применимо.
- [ ] Async feedback использует `aria-busy`, `aria-live` или progress semantics, если применимо.
- [ ] Touch target не меньше 44×44px.
- [ ] Reduced-motion fallback описан, если компонент анимирован.

---

## 9. Design Tokens

Component tokens — локальные переменные компонента. Ссылаются на семантические токены SEDA UI. Для кастомизации переопределяйте component tokens, не semantic. Правила именования и lifecycle описаны в `foundation/tokens.md`.

### [Группа токенов: например, Background]

| Component token | Роль | Semantic token (Light) | Semantic token (Dark) |
|---|---|---|---|
| `--[component]-[role]` | [что задаёт] | `[semantic/token]` | `[semantic/token]` |
| `--[component]-[role]-hover` | [что задаёт] | `[semantic/token]` | `[semantic/token]` |
| `--[component]-[role]-pressed` | [что задаёт] | `[semantic/token]` | `[semantic/token]` |

### [Группа токенов: например, Text]

| Component token | Роль | Semantic token (Light) | Semantic token (Dark) |
|---|---|---|---|
| `--[component]-[role]` | [что задаёт] | `[semantic/token]` | `[semantic/token]` |

### [Группа токенов: например, Shared / Focus / Disabled]

| Component token | Роль | Semantic token (Light) | Semantic token (Dark) |
|---|---|---|---|
| `--[component]-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--[component]-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
| `--[component]-disabled-text` | Текст disabled | `status/disabled/text` | `status/disabled/text` |
| `--[component]-disabled-border` | Граница disabled | `status/disabled/border` | `status/disabled/border` |

---

<!-- NOTES FOR AUTHOR

Checklist before publishing:
[ ] Status, owner и last reviewed заполнены
[ ] Все типы из components.md покрыты в разделе 3
[ ] Все размеры из spacing-sizing.md проверены или исключения обоснованы
[ ] Все состояния из state-vocabulary.md перечислены или явно исключены
[ ] Токены соответствуют tokens.md, color.md и theming.md
[ ] Accessibility проверена по foundation/accessibility.md и WCAG 2.2 AA
[ ] Content rules проверены по foundation/content.md
[ ] Icon rules проверены по foundation/iconography.md, если есть иконки
[ ] Motion rules проверены по foundation/motion.md, если есть анимации
[ ] Radius/border/elevation проверены по foundation/radius-border.md и foundation/elevation.md
[ ] Figma-ссылка актуальна или явно указано TBD

-->
