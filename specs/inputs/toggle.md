# Toggle

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Toggle](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=912-8761)

---

## 1. Key Principles

### Что это

Toggle — control для мгновенного включения или выключения бинарного режима. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует on/off state, immediate apply behavior, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с формулировкой settings, async behavior и acceptance criteria, но не заменяет дизайнера и разработчика. Финальное решение по применению изменения, rollback и доступности остаётся за человеком.

### Когда использовать

- Переключение применяется сразу после изменения.
- Значение бинарное: включено или выключено.
- Пользователь понимает последствия без отдельного submit.
- Настройка может быть безопасно изменена и, при ошибке, восстановлена.

### Когда не использовать

- Для согласия или выбора перед submit — используйте Checkbox.
- Для взаимоисключающих вариантов — используйте Radio или Segmented Control.
- Для destructive action, удаления или необратимого процесса.
- Для состояния, где нужен явный Save/Apply.

### Принципы

- **Immediate means immediate** — Toggle меняет состояние сразу, без дополнительного submit.
- **State is readable** — label должен быть понятен в on и off состояниях.
- **Rollback is planned** — async failure должен иметь восстановление значения.
- **Tokens before visuals** — track, thumb, label, helper и focus ring берутся из component tokens.
- **AI assists, system governs** — AI может описать behavior, но не придумывает states, tokens или dangerous usage.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер toggle, label и helper. |
| `track` | да | Поверхность on/off состояния. |
| `thumb` | да | Подвижный маркер состояния. |
| `label` | да | Описание режима. |
| `helperText` | опционально | Объяснение эффекта или ограничения. |
| `statusText` | условно | Дополнительный текст для async/error сценария. |

### Правила anatomy

- Label должен описывать настройку, а не только "Включить".
- Helper используется для последствий, задержки применения или ограничений.
- Thumb и track не должны быть единственными носителями состояния.
- Icon inside toggle требует system review, если его нет в component contract.

---

## 3. Types / Variants

Figma component set: `Toggle`. Node id: `912:8761`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `state` | `default` | `default`, `hover` | Interaction state из Figma. |
| `on` | `false` | `false`, `true` | Значение включено/выключено. |
| `size` | `s` | `s`, `m`, `l`, `xl` | Размер track/thumb и плотность. |

### Variant rules

- `on=true` соответствует включённому режиму.
- Loading/error не должны добавляться как визуальные variants без system review; они описываются behavior и status text.
- Disabled state должен поддерживаться через props и tokens.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные настройки и таблицы. | Проверьте touch target. |
| `m` | Основной размер для settings forms. | Используйте как default. |
| `l` | Touch-oriented settings. | Label должен переноситься отдельно от track. |
| `xl` | Редкие сценарии с повышенной читаемостью. | Не используйте для плотных списков. |

Размер не меняет immediate apply contract.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `off` | Режим выключен. | Значение `false`. |
| `on` | Режим включен. | Значение `true`. |
| `hover` | Pointer наведён на control. | Не должен менять значение. |
| `focus` | Keyboard focus. | Focus ring видим. |
| `disabled` | Переключение недоступно. | Причина должна быть понятна. |
| `loading` | Значение сохраняется. | Нужно описать optimistic или pessimistic update. |
| `error` | Сохранение не удалось. | Значение откатывается или ошибка явно объясняет состояние. |

---

## 6. Behavior

- Click по label или track переключает value.
- `Space` переключает focused toggle.
- Изменение применяется сразу через `onCheckedChange`/`onChange`.
- При async save заранее определите стратегию: optimistic update с rollback или ожидание подтверждения.
- Toggle не должен запускать destructive action без confirm flow.
- Если состояние зависит от permission, используйте disabled и helper/status text.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantics | Используйте native checkbox switch или `role="switch"`. |
| State | `aria-checked` отражает on/off. |
| Label | Control имеет видимый label или программное имя. |
| Keyboard | `Space` переключает значение. |
| Disabled | Disabled state программно недоступен для изменения. |
| Async | Ошибка сохранения объявляется текстом или live region. |

### Accessibility checklist

- [ ] Toggle имеет понятный label.
- [ ] On/off state программно доступен.
- [ ] Label кликабелен.
- [ ] Focus state видим.
- [ ] Async error объясняется текстом.
- [ ] Disabled state имеет понятную причину.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/toggle/track/off/default` | Track off default | `container/neutral/default` |
| `$collections/components/$modes/Mode 1/toggle/track/off/hover` | Track off hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/toggle/track/off/active` | Track off active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/toggle/track/on/default` | Track on default | `container/brand/default` |
| `$collections/components/$modes/Mode 1/toggle/track/on/hover` | Track on hover | `container/brand/hover` |
| `$collections/components/$modes/Mode 1/toggle/track/on/active` | Track on active | `container/brand/pressed` |
| `$collections/components/$modes/Mode 1/toggle/track/disabled` | Track disabled | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/toggle/thumb/default` | Thumb default | `surface/base` |
| `$collections/components/$modes/Mode 1/toggle/thumb/disabled` | Thumb disabled | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/toggle/label/default` | Label default | `text/primary` |
| `$collections/components/$modes/Mode 1/toggle/label/disabled` | Label disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/toggle/helper/default` | Helper default | `text/tertiary` |
| `$collections/components/$modes/Mode 1/toggle/helper/disabled` | Helper disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/toggle/focus/ring` | Focus indicator | `focus/ring` |

### Token gaps

- Если нужен token для async error/status text, используйте semantic status token с пометкой `Token gap`.
- Не используйте raw colors для on/off или disabled states.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Value | `checked` / `on` | Controlled boolean value. |
| Default value | `defaultChecked` | Только для uncontrolled mode. |
| Change | `onCheckedChange` | Применяет изменение сразу. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Label | `label` / children | Обязателен или заменяется `ariaLabel` только в исключении. |
| Loading | `loading` | Описывает async save state. |
| Disabled | `disabled` | Не скрывает причину ограничения. |

### Contract rules

- Не используйте Toggle, если нужен submit.
- Не смешивайте optimistic и pessimistic behavior без handoff.
- Unsupported icons, labels inside track или custom colors помечаются как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `912:8761` | Позволяет сверить design/code mapping. |
| `on`, `size`, disabled/loading/error states | Определяет вид и поведение. |
| Label и helper/status text | Объясняет эффект переключения. |
| Immediate apply и async strategy | Нужны для реализации и QA. |
| Rollback/error behavior | Предотвращает ложное состояние. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Toggle имеет понятный label.
- On/off state совпадает с реальным value.
- Изменение применяется сразу или явно показывает loading.
- Async error не оставляет ложное состояние.
- AI-generated output не добавляет destructive usage, variants или token names без review.

---

## 11. AI usage rules

- AI может предложить labels, helper text, async strategy и acceptance criteria.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Toggle вместо Checkbox, Radio или Button.
- AI не должен предлагать Toggle для destructive actions без review.
- AI обязан помечать unclear apply behavior, missing rollback, missing label и accessibility gap как `Needs system review`.
- AI может подготовить handoff notes, но человек утверждает immediate behavior.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Включить email-уведомления. | Бинарная настройка применяется сразу. |
| Переключить dark mode. | Состояние видно сразу и обратимо. |
| Включить автосохранение с async status. | Есть понятный on/off режим и обработка сохранения. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Toggle "Удалить аккаунт". | Destructive action требует Button и confirm flow. |
| Toggle перед submit формы. | Вероятно нужен Checkbox. |
| Toggle без label рядом с другими settings. | Состояние непонятно и недоступно. |

---

## 13. Anti-patterns

- Использовать Toggle для необратимых действий.
- Требовать отдельный Save после Toggle без объяснения.
- Прятать последствия переключения только в Tooltip.
- Оставлять on state после failed save без сообщения.
- Добавлять custom track colors без system review.
