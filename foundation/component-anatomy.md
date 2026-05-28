# Анатомия компонента

Component anatomy описывает, из каких частей состоит компонент, какие части обязательны, какие опциональны и кто владеет поведением каждой части. Это общий язык между Figma, specs и code components.

Анатомия нужна не для красивой схемы, а для управления сложностью: если у компонента нет понятных slots и responsibilities, его сложно расширять, тестировать и поддерживать.

---

## 1. Основные понятия

| Термин | Значение |
|---|---|
| `root` | Верхний контейнер компонента. Отвечает за layout, размер и общий state. |
| `slot` | Именованная область для контента или вложенного элемента. |
| `part` | Внутренняя визуальная часть компонента, которая не всегда доступна как slot. |
| `control` | Интерактивная часть: input, button, trigger, thumb, handle. |
| `label` | Видимое или доступное имя компонента. |
| `helper-text` | Подсказка, которая объясняет формат, ограничение или контекст. |
| `error-text` | Текст ошибки, связанный с контролом. |
| `icon` | Визуальный знак: декоративный, статусный или смысловой. |
| `action` | Вложенное действие: clear, remove, retry, apply, cancel. |

---

## 2. Обязательные и опциональные части

Каждый component spec должен явно указывать обязательность частей.

| Обязательность | Когда использовать |
|---|---|
| `required` | Без этой части компонент теряет смысл или доступность. |
| `optional` | Часть добавляет контекст или функцию, но компонент работает без нее. |
| `conditional` | Часть обязательна только при конкретном variant/state. |
| `not allowed` | Часть не должна использоваться, потому что ломает паттерн. |

Пример:

| Slot / Part | Обязательность | Комментарий |
|---|---|---|
| `label` | required | Text Field должен иметь видимое label или доступное имя. |
| `helper-text` | optional | Используется для формата или ограничения. |
| `error-text` | conditional | Обязателен в `error` state. |
| `prefix-icon | optional | Декоративная или смысловая иконка до значения. |

---

## 3. Naming rules

Имена slots должны быть стабильными и описывать роль, а не внешний вид.

**Use**

- label`
- `trigger`
- `content`
- `value`
- `helper-text`
- `error-text`
- `prefix-icon`
- `suffix-icon`
- `primary-action`
- `secondary-action

**Do not use**

- left`
- `blue-icon`
- `big-text`
- `top-area`
- `thing`
- `slot-1`

Если позиция важна, используйте ее как modifier: `icon-left`, `icon-right`. Если роль важнее позиции, используйте роль: `leading-icon`, `trailing-action`.

---

## 4. Slot responsibilities

Каждый slot должен иметь владельца поведения.

| Slot | Кто владеет поведением |
|---|---|
| `root` | Компонент: layout, state, density, disabled/read-only. |
| `trigger` | Компонент: open/close, focus, keyboard. |
| `label` | Компонент или Form Field: accessible name. |
| `helper-text` | Компонент или Form Field: description via `aria-describedby`. |
| `error-text` | Validation model: error state, announcement, relation to input. |
| `icon` | Iconography foundation: size, stroke, decorative/meaningful role. |
| `action` | Вложенный Button/Icon Button spec. |
| `content` | Consumer, но в рамках ограничений компонента. |

Если slot содержит другой компонент, поведение вложенного компонента не переписывается. Например, `Modal.footer` может содержать Button, но правила Button остаются в `specs/actions/button.md`.

---

## 5. Anatomy in specs

В component spec раздел Anatomy должен отвечать на пять вопросов:

1. Какие slots/parts есть у компонента?
2. Какие из них обязательны?
3. Какие parts интерактивны?
4. Какие slots участвуют в accessibility?
5. Какие slots могут содержать другие компоненты?

Минимальная таблица:

```markdown
| Slot / Part | Обязательность | Описание |
|---|---|---|
| `root` | required | Контейнер компонента. |
| `label` | required | Видимое имя или accessible name. |
| `control` | required | Интерактивная часть. |
| `helper-text` | optional | Дополнительное описание. |
```

Для сложных компонентов добавляйте схему, но схема не заменяет таблицу.

---

## 6. Composition rules

Компонент может состоять из других компонентов, но composition должна быть явной.

| Pattern | Пример | Правило |
|---|---|---|
| Wrapper | Form Field wraps Text Field. | Wrapper владеет label/helper/error; input владеет value/focus. |
| Trigger + overlay | Select, Popover, Date Picker. | Trigger владеет open state; overlay владеет focus scope. |
| Collection | Table, Menu, List. | Collection владеет selection/navigation; item владеет local content. |
| Compound component | Modal header/body/footer. | Parent владеет layering/focus; slots владеют content structure. |

Не создавайте component-specific копию поведения, если уже есть foundation rule или nested component spec.

---

## 7. State ownership

State должен принадлежать тому уровню, который реально меняется.

| State | Где живет |
|---|---|
| `hover`, `focus`, `pressed` | Интерактивный control или item. |
| `open`, `closed` | Trigger/overlay component. |
| `selected`, `checked` | Selectable item/control. |
| `error`, `warning`, `success` | Form Field или validation owner. |
| `loading`, `submitting` | Action owner или async container. |
| `disabled`, `read-only` | Root component и вложенные controls. |

Если state влияет на несколько slots, root должен задавать state attribute, а slots должны получать стили через tokens.

---

## 8. Accessibility anatomy

Анатомия должна показывать не только визуальные части, но и accessibility relations.

| Relation | Пример |
|---|---|
| Accessible name | `label` -> input via `for` / `id` или `aria-labelledby`. |
| Description | `helper-text` -> input via `aria-describedby`. |
| Error | `error-text` -> input via `aria-describedby`; invalid state via `aria-invalid`. |
| Expanded content | `trigger` -> overlay via `aria-controls` and `aria-expanded`. |
| Selected item | item state via `aria-selected`, `aria-checked` или native checked. |
| Live update | status region via `role="status"` или `aria-live`. |

Если slot декоративный, он должен быть hidden from assistive technology.

---

## 9. Token anatomy

Component tokens должны соответствовать частям anatomy.

Пример:

```text
textfield/root/background
textfield/root/border
textfield/label/text
textfield/input/text
textfield/helper/text
textfield/error/text
textfield/focus/ring
```

Правила:

- token name должен отражать slot или part;
- state-specific token ставит state в конец;
- component token мапится на semantic token;
- CSS custom property может быть локальным alias, но spec должен показывать semantic mapping.

---

## 10. Anatomy checklist

Перед переводом component spec в `ready` проверьте:

- [ ] Есть таблица slots/parts.
- [ ] У каждого slot есть обязательность.
- [ ] Интерактивные parts отмечены.
- [ ] Label/helper/error relations описаны.
- [ ] Decorative icons и meaningful icons различаются.
- [ ] State ownership понятен.
- [ ] Nested components не дублируют чужое поведение.
- [ ] Component tokens соответствуют anatomy.
- [ ] Anatomy совпадает с Figma structure или осознанно отличается.
