# Button

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · https://www.figma.com/design/h8wSwPpnlt91IQH7h4Kvj0/SEDA-AI?node-id=2463-16164
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `spacing-sizing.md`, `state-vocabulary.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Button — основной компонент действия. Он запускает операцию внутри продукта: отправку формы, сохранение изменений, подтверждение выбора, повтор запроса, удаление объекта или переход к следующему шагу сценария.

В SEDA AI Button является action contract: он должен явно описывать действие, состояние, приоритет, токены, accessibility и handoff. Button не используется для навигации к URL или ресурсу; для этого нужен Link.

### Когда использовать

Используйте Button, когда пользователь должен:

- отправить форму;
- сохранить, применить или отменить изменения;
- подтвердить операцию;
- запустить async-процесс;
- повторить запрос после ошибки;
- удалить или отозвать объект;
- выполнить действие в Card, Table, Toolbar, Modal или Empty State.

### Не используйте

Не используйте Button, когда:

- элемент ведет на страницу, URL, файл или якорь — используйте [Link](../specs/actions/link.md);
- нужно выбрать один вариант из группы — используйте [Radio](../specs/inputs/radio.md) или [Segmented Control](../specs/inputs/segmented-control.md);
- нужен постоянный режим `selected` — используйте [Button Group](../specs/actions/button-group.md), Toggle или Segmented Control;
- действие состоит только из иконки — используйте [Icon Button](../specs/actions/icon-button.md);
- нужно показать статус, label или счетчик — используйте [Tag](../specs/data-display/tag.md) или [Badge](../specs/data-display/badge.md).

### Основные принципы

- **One primary per context** — в одном смысловом контексте должен быть один главный Button.
- **Hierarchy communicates priority** — variant задает визуальный вес действия.
- **Label is an action** — label должен быть глаголом или глагольной фразой: `Сохранить`, `Создать проект`, `Повторить`.
- **Native first** — Button реализуется как нативный `<button>` с явным `type`.
- **Danger needs intent** — destructive action должен ясно называть действие и объект.
- **Loading preserves meaning** — loading state блокирует повторную активацию, но не удаляет accessible name.
- **Tokens before visuals** — colors, border, focus и spinner берутся из component tokens.
- **AI assists, system governs** — AI может предложить label и handoff, но не должен придумывать variants, props или tokens.

### Связанные спецификации

- [Icon Button](../specs/actions/icon-button.md) — icon-only действия.
- [Button Group](../specs/actions/button-group.md) — связанные действия и grouped controls.
- [Link](../specs/actions/link.md) — навигация к ресурсу.
- [Form](../specs/overlays-layout/form.md) — submit/cancel actions.
- [Modal](../specs/feedback/modal.md) — footer actions и destructive confirmation.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Нативный `<button>` и визуальный контейнер. |
| `label` | Да | Видимый текст действия. |
| `iconLeft` | Нет | Иконка перед label, усиливает смысл действия. |
| `iconRight` | Нет | Иконка после label: направление, disclosure, продолжение. |
| `spinner` | Условно | Индикатор loading state. |

### Правила анатомии

- Regular Button всегда имеет видимый `label`.
- Если label отсутствует, используйте Icon Button.
- `iconLeft` и `iconRight` не используются как декор без смысловой связи с label.
- Spinner может заменить иконку, но не должен удалять accessible action name.
- Root не должен быть `<div>` с click handler.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Типичный сценарий |
|---|---|---|
| `primary` | Действие с максимальным приоритетом в локальном контексте. | Save, create, continue, submit. |
| `secondary` | Поддерживающее действие с видимым контейнером. | Cancel, alternative submit, neutral action. |
| `outline` | Нейтральное действие с border и меньшим весом. | Toolbar, modal footer, secondary row action. |
| `ghost` | Низкий визуальный вес без default fill/border. | Dense toolbar, table row, card action. |
| `text` | Inline или очень низкий visual emphasis. | Utility action рядом с текстом. |
| `destruction` | Рискованное или необратимое действие. | Delete, revoke, remove access. |

### Modifiers

| Modifier | Назначение | Ограничения |
|---|---|---|
| `iconLeft` | Добавляет leading icon. | Иконка поддерживает label. |
| `iconRight` | Добавляет trailing icon. | Использовать для направления, disclosure или продолжения. |
| `fullWidth` | Button занимает ширину parent. | Подходит для mobile, forms, narrow panels. |
| `loading` | Async action выполняется. | Блокирует повторное действие и сохраняет ширину. |
| `disabled` | Action недоступен. | Причина должна быть понятна из контекста или helper text. |

### Иерархия действий

| Контекст | Primary | Secondary / outline | Ghost / text |
|---|---|---|---|
| Форма | `Сохранить` | `Отмена` | `Сбросить` |
| Delete dialog | `Удалить проект` as `destruction` | `Отмена` | — |
| Object Card | `Открыть` | `Редактировать` | `Поделиться` |
| Toolbar | — | `Экспорт` | `Фильтр`, `Сортировка` |
| Empty State | `Создать проект` | `Импортировать` | `Подробнее` |

---

## 4. Sizes / Размеры

Button следует foundation rules для spacing, sizing, radius и iconography.

| Size | Height | Font / line | Radius | Padding X | Icon | Контекст |
|---|---:|---|---:|---:|---:|---|
| `small` | 24px | 12px / 16px | 6px | 8px | 14px | Dense toolbar, table row action. |
| `medium` | 32px | 14px / 20px | 8px | 12px | 16px | Default product UI. |
| `large` | 40px | 16px / 24px | 10px | 16px | 18px | Forms, panels, prominent action. |
| `extraLarge` | 48px | 18px / 28px | 12px | 20px | 20px | Touch-first или high-emphasis flow. |

### Правила размеров

- `medium` — default для продуктовых экранов.
- `small` может быть визуально ниже 44px, но touch target должен расширяться там, где ожидается touch input.
- Size не меняет смысловой приоритет действия.
- Не создавайте hierarchy через произвольный font size; используйте documented variant и size.

---

## 5. States / Состояния

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Button доступен и не взаимодействует с пользователем. | Используются default surface, border, foreground. |
| `hover` | Pointer над Button. | Используются hover tokens, если они есть в ветке variant. |
| `active` / `pressed` | Pointer или keyboard activation. | Используются pressed tokens. |
| `focus` | Keyboard focus. | Используется `focus/ring`. |
| `loading` | Async action выполняется. | Spinner видим, повторная активация заблокирована. |
| `disabled` | Action недоступен. | Нативный disabled или `aria-disabled` по сценарию. |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
|---|---:|---|
| `hover` + `focus` | Да | Pointer может быть над focused Button. |
| `active` + `focus` | Да | `Enter` или `Space` активируют focused Button. |
| `loading` + `focus` | Да | Фокус может оставаться на Button во время запроса. |
| `loading` + `disabled` | Условно | Использовать только если implementation явно различает blocking и unavailable. |
| `hover` + `disabled` | Нет | Disabled отменяет interactive states. |
| `active` + `disabled` | Нет | Disabled Button не активируется. |

### State ownership

- Button владеет `hover`, `active`, `focus`, `loading` и `disabled`.
- Parent component может передать state, но не переопределяет visual rules.
- `selected` или persistent `pressed` не относится к regular Button; используйте Button Group, Toggle или Segmented Control.

---

## 6. Behavior / Поведение

### Native behavior

- Используйте нативный `<button>`.
- Всегда задавайте `type`: `button`, `submit` или `reset`.
- Default для обычного действия: `type="button"`.
- Submit action в форме использует `type="submit"`.
- Не используйте `<a>` для действий, которые не выполняют navigation.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещает фокус к Button или от него. |
| `Enter` | Активирует Button. |
| `Space` | Активирует Button. |

### Loading

- Loading blocks repeated activation.
- Width должен оставаться стабильным между default и loading states.
- Spinner может заменять icon, но label остается видимым или доступным.
- Loading должен учитывать reduced motion preferences.
- Если async action завершился ошибкой, Button возвращается в доступное состояние или сопровождается error feedback.

### Responsive behavior

- Label переносится только если контейнер не поддерживает минимальную полезную ширину.
- Action group может складываться вертикально в narrow containers.
- `fullWidth` допустим в forms, mobile layouts и narrow panels.
- Icon-label gap должен оставаться token-driven.

---

## 7. Accessibility

Button следует [foundation/accessibility.md](../foundation/accessibility.md) и должен соответствовать WCAG 2.2 AA для interactive controls.

| Элемент | Семантика | Правило |
|---|---|---|
| Root | `<button type="button">`, `<button type="submit">`, `<button type="reset">` | Использовать native semantics. |
| `iconLeft` / `iconRight` | `aria-hidden="true"` | Если icon дублирует label. |
| `spinner` | `aria-hidden="true"` или status pattern | Зависит от того, остается ли label видимым. |
| Disabled Button | Native `disabled` | Когда action недоступен и должен выйти из tab order. |
| Loading Button | `aria-disabled="true"` + activation guard | Когда фокус должен остаться на Button. |

### Accessibility checklist

- [ ] Root является нативным `<button>`.
- [ ] `type` задан явно.
- [ ] Видимый label описывает действие.
- [ ] Loading сохраняет accessible action name.
- [ ] Disabled reason понятен из контекста или helper text.
- [ ] Focus ring использует `focus/ring` и не обрезается.
- [ ] Text contrast соответствует требованиям.
- [ ] Touch target не меньше 44x44px там, где ожидается touch input.
- [ ] Destructive action не передается только цветом.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Button доступны ветки primary solid, neutral secondary, neutral outline, neutral ghost, neutral text и danger solid.

### Variant branches

| Variant | Token branch | Назначение |
|---|---|---|
| `primary` | `button/primary/solid/surface/default` | Brand filled action. |
| `secondary` | `button/neutral/secondary/surface/default` | Neutral filled/subtle action. |
| `outline` | `button/neutral/outline/border/default` | Neutral bordered action. |
| `ghost` | `button/neutral/ghost/surface/default` | Transparent default action. |
| `text` | `button/neutral/text/foreground/default` | Inline/low-emphasis action. |
| `destruction` | `button/danger/solid/surface/default` | Danger filled action. |

### Token roles

| Role | Example token | Применение |
|---|---|---|
| Surface default | `button/primary/solid/surface/default` | Background по умолчанию. |
| Surface hover | `button/primary/solid/surface/hover` | Background при hover. |
| Surface pressed | `button/primary/solid/surface/pressed` | Background при active. |
| Surface disabled | `button/primary/solid/surface/disabled` | Background disabled state. |
| Surface loading | `button/primary/solid/surface/loading` | Background loading state. |
| Border default | `button/primary/solid/border/default` | Border по умолчанию. |
| Border hover | `button/primary/solid/border/hover` | Border при hover. |
| Border pressed | `button/primary/solid/border/pressed` | Border при active. |
| Border disabled | `button/primary/solid/border/disabled` | Border disabled state. |
| Border loading | `button/primary/solid/border/loading` | Border loading state. |
| Foreground default | `button/primary/solid/foreground/default` | Label и icon. |
| Foreground disabled | `button/primary/solid/foreground/disabled` | Label и icon disabled state. |
| Foreground loading | `button/primary/solid/foreground/loading` | Label и icon loading state. |
| Spinner foreground | `button/primary/solid/spinner/foreground` | Spinner color. |
| Focus ring | `button/primary/solid/focus/ring` | Keyboard focus. |

Используйте такую же структуру ролей для веток neutral secondary, neutral outline, neutral ghost, neutral text и danger solid.

### Token gaps

- Size, radius, padding, gap, icon size и typography пока описаны foundation rules, а не Button component tokens.
- Если component-level size tokens появятся позже, нужно добавить явный mapping вместо raw px.
- Нельзя придумывать Button token names в specs, code, Figma или AI-generated handoff.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Variant | `variant` | `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction`. |
| Size | `size` | `small`, `medium`, `large`, `extraLarge`. |
| Label | `children` или `label` | Обязательный видимый текст для regular Button. |
| Leading icon | `iconLeft` | Decorative, если смысл уже есть в label. |
| Trailing icon | `iconRight` | Direction, disclosure или continuation. |
| Full width | `fullWidth` | Boolean. |
| Loading | `loading` | Boolean; блокирует repeat activation. |
| Disabled | `disabled` | Boolean; unavailable state. |
| Type | `type` | `button`, `submit`, `reset`; default `button`. |
| Click handler | `onClick` | Для non-submit actions. |

### Contract rules

- `variant` должен быть только documented variant.
- `size` должен быть только documented size.
- Regular Button требует видимый текст.
- Icon-only action должен использовать Icon Button.
- Нельзя передавать raw colors, raw spacing или custom border styles через props.
- Нельзя добавлять ad-hoc variants вроде `success`, `warning`, `link` без system review.

---

## 10. Handoff notes

Handoff для Button должен фиксировать:

- variant и size;
- label text;
- icon name и placement, если icon используется;
- state requirements: default, hover, active, focus, loading, disabled;
- action behavior: submit, click handler, retry, async process или navigation exception;
- `type` value;
- `fullWidth`, если используется;
- loading behavior и requirement сохранять width;
- disabled reason, если причина не очевидна;
- destructive confirmation requirement;
- token branch, используемую для visual variant.

---

## 11. Acceptance criteria

- [ ] Button использует documented variant и size.
- [ ] Button использует реальные component token paths для surface, border, foreground, focus и spinner.
- [ ] Button имеет ясный action label.
- [ ] Root использует native `<button>` semantics.
- [ ] `type` задан явно.
- [ ] Loading blocks repeated activation и сохраняет accessible name.
- [ ] Disabled state не является единственным объяснением недоступного действия.
- [ ] Destruction Button ясно называет рискованное действие и объект.
- [ ] Implementation не вводит raw visual values.

---

## 12. AI usage rules

AI может:

- предложить action label на русском;
- выбрать documented variant и size по контексту;
- подготовить handoff notes и acceptance criteria;
- проверить, не нужен ли Link, Icon Button, Button Group, Toggle или Segmented Control вместо Button;
- сверить token mapping с `tokens.json`.

AI не должен:

- использовать variants вне списка `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction`;
- использовать sizes вне списка `small`, `medium`, `large`, `extraLarge`;
- придумывать props, states, token paths или visual overrides;
- рекомендовать Button для navigation к ресурсу;
- рекомендовать regular Button для icon-only action;
- скрывать missing `type`, unclear label, unsupported variant или raw visual values.

Если требование выходит за contract Button, AI должен пометить его как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Save form | `variant="primary"`, `type="submit"`, label `Сохранить`. |
| Cancel in modal | `variant="outline"` или `secondary`, `type="button"`, label `Отмена`. |
| Retry request | `variant="secondary"`, label `Повторить`, `loading=true` while request runs. |
| Delete project | `variant="destruction"`, label `Удалить проект`, confirmation required. |
| Dense toolbar action | `variant="ghost"`, `size="small"`, label `Фильтр`. |

### Требует review

| Scenario | Причина |
|---|---|
| Two primary buttons in one modal footer. | Competing hierarchy. |
| Button label `OK` для destructive action. | Action и object неясны. |
| Custom green success button. | Unsupported variant и token branch. |
| Icon-only regular Button. | Нужно использовать Icon Button. |
| Raw CSS color override. | Нарушает token contract. |

---

## 14. Anti-patterns

- Использовать Button для navigation, когда нужен Link.
- Использовать Link для submit, save, delete, retry или другого action.
- Добавлять несколько primary buttons в один локальный контекст.
- Прятать смысл действия за generic labels: `OK`, `Да`, `Готово` без контекста.
- Использовать `destruction` только потому, что действие визуально важное.
- Убирать focus ring.
- Использовать `disabled` без объяснения причины.
- Заменять loading label spinner без accessible name.
- Создавать custom one-off button colors вне component tokens.
