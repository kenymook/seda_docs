# Словарь состояний

`state-vocabulary.md` — единый источник правды для состояний SEDA AI. В этом документе описаны смысл состояний, визуальное поведение, допустимые комбинации и правила применения в компонентах.

Раньше визуальные правила были вынесены в отдельный документ. Теперь они объединены здесь, чтобы дизайнеру не приходилось выбирать между двумя похожими источниками.

---

## 1. Принципы

| Принцип | Правило |
|---|---|
| Один термин — один смысл | `active`, `selected`, `checked`, `open` и `pressed` не взаимозаменяемы. |
| Смысл важнее визуала | State описывает состояние компонента, а не только цвет или стиль. |
| State должен быть доступен | Состояние не передается только цветом. Нужны текст, ARIA, иконка или поведение. |
| State принадлежит владельцу | Если state относится к вложенному Button, его не нужно дублировать на родителе без причины. |
| Комбинации ограничены | Не все состояния можно смешивать. `disabled` почти всегда имеет максимальный приоритет. |

---

## 2. Категории состояний

| Категория | Состояния | Что описывает |
|---|---|---|
| Interaction | `default`, `hover`, `focus`, `active`, `pressed` | Реакцию на pointer/keyboard interaction. |
| Selection | `selected`, `checked`, `indeterminate`, `on`, `off` | Выбор, отметку или бинарное состояние. |
| Disclosure | `open`, `closed`, `expanded`, `collapsed` | Раскрытие overlay, секции или вложенного контента. |
| Data | `empty`, `filled`, `loading`, `loaded`, `no-results` | Наличие данных или процесс загрузки. |
| Validation | `error`, `warning`, `success`, `validating` | Корректность значения или результата проверки. |
| Availability | `disabled`, `read-only`, `hidden` | Доступность действия или значения. |
| Lifecycle | `entering`, `visible`, `exiting`, `dismissed` | Временное состояние feedback/overlay компонентов. |

---

## 3. Interaction states

### `default`

Начальное состояние компонента без текущего взаимодействия.

- Используется как базовый visual style.
- Не означает отсутствие значения.
- Не означает disabled.

### `hover`

Pointer находится над интерактивным элементом.

- Временное состояние.
- Не должно быть единственным способом показать доступность действия.
- Не применяется на touch как обязательное состояние.

### `focus`

Элемент находится в keyboard focus.

- Обязателен для интерактивных элементов.
- Использует `focus/ring`.
- Не означает выбор или активацию.
- Должен быть видимым на всех поверхностях.

### `active`

Момент нажатия: mouse down, touch down или key press.

- Временное состояние.
- Не равно `selected`.
- Не равно “текущая страница”.
- Используется для tactile feedback.

### `pressed`

Состояние toggle-like button после активации, если кнопка удерживает pressed-смысл.

- Используется только там, где button имеет постоянное on/off или pressed state.
- Для обычного Button не нужен.
- Для выбора из набора чаще используйте `selected`.

---

## 4. Selection states

### `selected`

Элемент выбран из набора вариантов.

- Постоянное состояние до следующего выбора.
- Подходит для Tabs, Segmented Control, selected row, selected option.
- Не использовать как синоним `active`.

### `checked`

Бинарная отметка true/false.

- Используется для Checkbox.
- Может быть частью multi-select.
- Не заменяет `selected`.

### `indeterminate`

Частичный выбор.

- Используется для родительского Checkbox.
- Показывает, что выбрана часть дочерних элементов.
- Не равен `checked`.

### `on` / `off`

Бинарное состояние настройки.

- Используется для Toggle/Switch.
- Описывает состояние настройки, а не действие.
- Не заменяет `checked` в Checkbox.

---

## 5. Disclosure states

### `open` / `closed`

Компонент с overlay или popup раскрыт или закрыт.

- Используется для Select, Combobox, Popover, Date Picker, Drawer.
- Trigger должен иметь `aria-expanded`, если это применимо.
- Закрытие должно возвращать фокус на логичное место.

### `expanded` / `collapsed`

Секция или ветка раскрыта или свернута.

- Используется для Accordion, Tree View, Sidebar groups.
- Не использовать для Modal/Popover; для них лучше `open`.

---

## 6. Data states

### `empty`

Данных нет.

- Требует понятного empty state или fallback.
- Не равно error.
- Может иметь primary action.

### `filled`

У поля или компонента есть значение.

- Не означает, что значение валидно.
- Не заменяет `success`.

### `loading`

Данные или действие выполняются.

- Временное состояние.
- Может блокировать повторное действие.
- Должно иметь доступный текст или live region, если ожидание важно.

### `no-results`

Поиск или фильтр не вернул результатов.

- Не равно empty first-use state.
- Должен предлагать изменить запрос или сбросить фильтры.

---

## 7. Validation states

### `validating`

Значение проверяется.

- Используется для async validation или долгой проверки.
- Не должен показывать устаревший результат после изменения значения.

### `error`

Значение или действие некорректно, продолжить нельзя.

- Blocking state.
- Требует текст ошибки.
- Использует `aria-invalid`, если относится к полю.

### `warning`

Есть риск или рекомендация, но действие возможно.

- Non-blocking state.
- Не должен выглядеть как error.

### `success`

Значение или действие подтверждено.

- Использовать точечно.
- Не показывать success на каждом корректном поле без пользы.

---

## 8. Availability states

### `disabled`

Элемент недоступен для взаимодействия.

- Не получает focus.
- Не отправляет действие.
- Использует disabled styling.
- Не объясняет причину сам по себе; при необходимости добавьте helper text или tooltip на доступном wrapper.

### `read-only`

Значение можно прочитать, но нельзя изменить.

- Значение остается видимым.
- Может оставаться в tab order, если его можно выделить или скопировать.
- Не равно `disabled`.

### `hidden`

Элемент не отображается и не участвует в доступной структуре.

- Не использовать вместо disabled, если пользователь должен понимать, что действие существует.

---

## 9. Lifecycle states

### `entering`

Компонент появляется.

- Используется для Toast, Modal, Drawer, Popover.
- Motion должен следовать `foundation/motion.md`.

### `visible`

Компонент полностью отображается.

### `exiting`

Компонент исчезает.

- После exit state элемент должен быть удален из focus order.

### `dismissed`

Feedback или notification закрыт пользователем или системой.

---

## 10. Visual behavior

| State | Визуальное поведение | Token direction |
|---|---|---|
| `default` | Базовая поверхность, текст и граница. | surface/*, container/*, text/*, border/* |
| `hover` | Легкое усиление background/border/text. | */hover |
| `active` / `pressed` | Более сильная pressed-поверхность. | */pressed |
| `focus` | Видимое focus ring поверх текущего state. | `focus/ring` |
| `selected` | Устойчивый выбранный стиль. | brand/selected component tokens |
| `checked` | Отмеченный control. | `container/brand/default`, text/on-brand/* |
| `open` | Trigger показывает раскрытое состояние; overlay видим. | component tokens + elevation |
| `error` | Error text/border/surface. | status/danger/* |
| `warning` | Warning text/border/surface. | status/warning/* |
| `success` | Success text/border/surface. | status/success/* |
| `disabled` | Muted text/background/border. | status/disabled/* |

Focus ring не должен исчезать из-за `hover`, `selected` или `error`.

---

## 11. State precedence

Если несколько состояний совпадают, применяйте приоритет:

```text
disabled
  > loading / submitting
  > error
  > warning
  > success
  > open / selected / checked
  > focus
  > active / pressed
  > hover
  > default
```

Правила:

- `disabled` блокирует hover/focus/active.
- `error + focus` допустимы: error остается, focus ring видим.
- `selected + hover` допустимы: selected остается базой, hover слегка усиливает.
- `loading + disabled` не смешивайте без причины; чаще нужен `loading`, который сам блокирует повторное действие.

---

## 12. Частые ошибки

| Ошибка | Как правильно |
|---|---|
| Использовать `active` для текущей вкладки. | Используйте `selected` или `current`. |
| Использовать `checked` для Tabs. | Используйте `selected`. |
| Показывать `error` до взаимодействия с полем. | Валидируйте после blur или submit. |
| Скрывать disabled-действие без объяснения. | Покажите disabled или объясните причину. |
| Передавать status только цветом. | Добавьте текст, icon label или accessible state. |
| Использовать `loading` без accessible text. | Добавьте status text или live region. |

---

## 13. Component-specific states

Некоторые состояния допустимы только в конкретных компонентах:

| State | Где используется |
|---|---|
| `drag-over` | File Upload |
| `uploading` | File Upload |
| `visited` | Link |
| `current` | Breadcrumbs, Pagination, Stepper |
| `skeleton` | Skeleton pattern |
| `dismissible` | Alert, Toast, Tag |

Их можно использовать в component specs, но не как общий state vocabulary для всех компонентов.

---

## 14. Checklist

- [ ] State name описывает смысл, а не визуальный стиль.
- [ ] `active`, `selected`, `checked`, `pressed` не смешаны.
- [ ] `disabled` и `read-only` различаются.
- [ ] Focus ring видим во всех допустимых state combinations.
- [ ] Validation state имеет текстовое сообщение.
- [ ] Async/loading state доступен для assistive technologies.
- [ ] State tokens ссылаются на semantic или component tokens.
- [ ] Недопустимые комбинации явно исключены в component spec.
