# Состояния

> Figma: https://www.figma.com/design/h8wSwPpnlt91IQH7h4Kvj0/SEDA-UI-kit?node-id=2575-9673

Интерактивные состояния и их визуальное отображение в компонентах SEDA UI.

---

## Связь Со State Vocabulary

Этот документ описывает визуальное поведение состояний.

Семантика и определения состояний заданы в:
→ `state-vocabulary.md`

Примеры:
- `active` — состояние нажатия
- `selected` — выбранное состояние
- `error` — состояние валидации
- `disabled` — состояние недоступности

---

## О состояниях компонентов

Каждый интерактивный компонент в SEDA UI может находиться в одном или нескольких состояниях, отражающих текущее взаимодействие пользователя или статус данных. Состояния реализованы через семантические токены — изменение темы автоматически применяется ко всем состояниям всех компонентов.

Состояния разделены на три группы: **интерактивные** (отклик на действия пользователя), **функциональные** (статус компонента) и **валидационные** (обратная связь по корректности ввода).

---

## Интерактивные состояния

Отображают реакцию компонента на действия пользователя: наведение, нажатие, фокус клавиатуры.

| Состояние | Описание | Токены | Компоненты |
|-----------|----------|--------|------------|
| `default` | Начальный вид без взаимодействия | `surface/default`, `container/default` | Все |
| `hover` | Курсор наведён на элемент | `surface/hover`, `container/hover`, `border/hover` | Button, Link, Tag, Chip, Dropdown |
| `active` | Элемент нажат (`mouse down`) | `surface/pressed`, `container/pressed`, `border/pressed` | Button, Link, Tag, Chip |
| `focus` | Фокус клавиатуры (`Tab`) | `focus/ring` | Button, Input, Checkbox, Radio, Select |

---

## Функциональные состояния

Отражают статус компонента, не зависящий от прямого действия пользователя.

| Состояние | Описание | Токены | Компоненты |
|-----------|----------|--------|------------|
| `disabled` | Недоступен для взаимодействия | `status/disabled/surface`, `status/disabled/text` | Все интерактивные |
| `loading` | Ожидание завершения операции | — | Button, Icon Button |
| `skeleton` | Заглушка до загрузки контента | `status/disabled/container` | Tag, Avatar |
| `selected` | Элемент выбран | `container/brand/default`, `surface/brand/default` | Radio, Segmented Control, Tag, Button Group |
| `read-only` | Поле видно, но недоступно для редактирования | `surface/default`, `text/secondary` | Text Field, Text Area |
| `filled` | У компонента есть значение | `text/primary`, `border/default` | Text Field, Text Area, Select, Date Picker |
| `open` | Раскрыт список, popup или календарь | component-specific | Select, Date Picker, Time Picker, Popover |
| `checked` | Компонент отмечен | `container/brand/default`, `text/on-brand/primary` | Checkbox |
| `indeterminate` | Частично отмечен | `container/brand/default`, `text/on-brand/primary` | Checkbox |
| `on` / `off` | Переключатель включён / выключен | `container/brand/*`, `container/*` | Toggle |

---

## Состояния валидации

Сигнализируют о корректности введённых данных или результате операции.

| Состояние | Описание | Токены | Компоненты |
|-----------|----------|--------|------------|
| `error` | Ошибка валидации или ввода | `status/error/border`, `status/error/text` | Text Field, Text Area, Select, Checkbox Group |
| `warning` | Предупреждение о возможной проблеме | `status/warning/border`, `status/warning/text` | Text Field, Text Area |
| `success` | Успешная валидация или завершение | `status/success/border`, `status/success/text` | Text Field, Alert |

---

## Принципы использования

- **Один термин — один смысл.** `active` означает только состояние нажатия. `selected` означает устойчивое состояние выбора. `checked` означает бинарную отметку.
- **Смысл и визуал разделены.** За смысл отвечает `state-vocabulary.md`, за визуальную реализацию — этот документ.
- **Некоторые комбинации допустимы.** Например: `hover` + `focus`, `selected` + `hover`, `error` + `focus`, `filled` + `error`.
- **Состояние не заменяет объяснение.** `disabled` скрывает возможность действия, но не объясняет причину — дополняйте тултипом или вспомогательным текстом.
- **Skeleton только при неизвестном контенте.** Если время ожидания известно или коротко, используйте `loading`, а не `skeleton`.
- **Валидация после взаимодействия.** Показывайте `error` и `warning` только после того, как пользователь начал вводить данные или попытался отправить форму.
