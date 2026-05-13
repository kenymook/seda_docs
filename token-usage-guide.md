# Гайд по использованию токенов

> Статус: draft  
> Аудитория: дизайнеры, дизайн-системные редакторы, авторы компонентных спецификаций  
> Источник структуры: `tokens.json`, коллекция `semantic`

Этот документ объясняет, какой токен выбирать в типовых интерфейсных ситуациях. Его цель — не перечислить все значения, а дать понятную логику выбора: где поверхность, где контейнер, где граница, где статус, где текст, где иконка.

Главное правило: выбирайте токен по роли в интерфейсе, а не по похожему цвету.

---

## 1. Слои Токенов

В SEDA AI есть четыре уровня:

| Уровень | Пример | Кто использует | Для чего |
|---|---|---|---|
| Primitive | `color/blue/50` | Design system maintainers | Сырые значения палитры, размеров, шрифтов |
| Semantic | `container/brand/default` | Дизайнеры системы, авторы specs | Роль в интерфейсе, работает в Light/Dark |
| Component | `button/primary/solid/surface/default` | Компонентная библиотека | Привязка части компонента к semantic token |
| Product | `product/sidebar/surface` | Продуктовые команды | Дополнительная настройка поверх foundation |

Для foundation-документации и component specs используйте semantic tokens. Primitive tokens допустимы только как исключение, если semantic token ещё не создан.

---

## 2. Быстрое Правило Выбора

```text
Это фон страницы, секции, карточки или overlay?
  -> surface/*

Это заливка кнопки, chip, строки, control или выбранного объекта?
  -> container/*

Это линия, outline, separator или stroke?
  -> border/*

Это текст?
  -> text/*

Это иконка?
  -> icon/*

Это feedback: info, success, warning, danger, AI?
  -> status/*

Это ссылка?
  -> link/*

Это фокус?
  -> focus/*

Это тень, анимация или opacity?
  -> shadow/*, duration/*, easing/*, opacity/*
```

---

## 3. Surface: Поверхности

`surface/*` используется для больших, в основном неинтерактивных плоскостей. Это каркас экрана: страница, секция, карточка, drawer, modal, popover.

### Токены

| Токен | Где использовать | Не использовать |
|---|---|---|
| `surface/page` | Самый нижний фон приложения или страницы | Для кнопок и интерактивных controls |
| `surface/base` | Основная рабочая поверхность: карточка, panel body, section body | Для hover-состояния control |
| `surface/subtle` | Мягкое отличие блока от основной поверхности | Для primary actions |
| `surface/raised` | Приподнятая поверхность: card, floating panel | Как замену elevation, если нужен именно shadow |
| `surface/sunken` | Углублённая область: code block, input well, canvas well | Для disabled-состояния |
| `surface/overlay` | Modal, popover, drawer, dropdown panel | Для фона страницы |
| `surface/inverse` | Инверсная область с тёмной/светлой контрастной подложкой | Для danger/status |
| `surface/scrim` | Затемнение под modal/drawer | Для обычных фонов |

### Визуальная схема

```text
surface/page
┌────────────────────────────────────────────────────┐
│                                                    │
│  surface/base                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │  surface/raised                             │  │
│  │  ┌────────────────────────────────────────┐  │  │
│  │  │ card, panel, floating object           │  │  │
│  │  └────────────────────────────────────────┘  │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Пример: Экран Dashboard

```text
Page background              -> surface/page
Dashboard content area        -> surface/base
Metric card                   -> surface/raised
Chart well                    -> surface/sunken
Modal panel                   -> surface/overlay
Modal backdrop                -> surface/scrim
```

---

## 4. Container: Заливки Объектов И Controls

`container/*` используется для объектов внутри поверхности: кнопки, chips, selectable rows, tabs, toggles, segmented controls.

Surface отвечает за слой экрана. Container отвечает за конкретный объект на этом слое.

### Токены

| Токен | Где использовать |
|---|---|
| `container/neutral/default` | Secondary button, neutral chip, neutral selectable item |
| `container/neutral/hover` | Hover для нейтральных controls |
| `container/neutral/pressed` | Pressed для нейтральных controls |
| `container/neutral/selected` | Selected нейтрального item, row, tab background |
| `container/subtle/default` | Очень мягкая заливка control или grouped item |
| `container/brand/default` | Primary action, selected brand state, checked state |
| `container/accent/default` | Акцентный, но не основной продуктовый action |
| `container/info/default` | Информационный control или badge |
| `container/success/default` | Success action или positive state |
| `container/warning/default` | Warning action или предупреждающий state |
| `container/danger/default` | Destructive action |
| `container/ai/default` | AI-specific emphasis: generation, assistant, smart action |
| `container/inverse/default` | Control на inverse surface |
| `container/disabled` | Заливка disabled control |

### Визуальная схема: Кнопки

```text
Primary button
┌────────────────────────┐
│ container/brand/default │  text/on-brand/primary
└────────────────────────┘

Secondary button
┌─────────────────────────┐
│ container/neutral/default │  text/primary
└─────────────────────────┘

Danger button
┌─────────────────────────┐
│ container/danger/default │  text/on-danger/primary
└─────────────────────────┘
```

### Правило Состояний

Если у control есть интерактивные состояния, используйте state-токены внутри той же роли:

```text
default  -> container/brand/default
hover    -> container/brand/hover
pressed  -> container/brand/pressed
selected -> container/brand/selected
disabled -> container/disabled
```

Не смешивайте роли:

```text
Неправильно:
default -> container/neutral/default
hover   -> surface/subtle

Правильно:
default -> container/neutral/default
hover   -> container/neutral/hover
```

---

## 5. Border: Границы И Разделители

`border/*` используется для stroke, outline, separator и visual boundary.

### Нейтральные Границы

| Токен | Где использовать |
|---|---|
| `border/subtle` | Очень мягкий separator, low-emphasis divider |
| `border/default` | Базовая граница input, card, table row |
| `border/strong` | Усиленная граница, pressed state, selected boundary |
| `border/hover` | Hover boundary для input/control |
| `border/selected` | Selected row, selected card, chosen item |
| `border/disabled` | Disabled outline |
| `border/inverse` | Граница на inverse surface |
| `border/focus` | Основа для focus outline |

Для нейтральной границы не нужен `border/neutral/*`. Нейтральная роль уже является корневой:

```text
border/default
border/hover
border/strong
```

### Ролевые Границы

| Токен | Где использовать |
|---|---|
| `border/brand/default` | Brand emphasis, primary selected boundary |
| `border/accent/default` | Accent emphasis |
| `border/info/default` | Info state boundary |
| `border/success/default` | Success state boundary |
| `border/warning/default` | Warning state boundary |
| `border/danger/default` | Error/destructive boundary |
| `border/ai/default` | AI-specific boundary |

### Визуальный Пример: Text Field

```text
Default
┌────────────────────────────┐  border/default
│ text/primary               │
└────────────────────────────┘

Hover
┌────────────────────────────┐  border/hover
│ text/primary               │
└────────────────────────────┘

Error
┌────────────────────────────┐  border/danger/default
│ text/primary               │
└────────────────────────────┘
  status/danger/text
```

### Полный Пример Применения: Text Field

Text Field использует `surface` для плоскости поля, `border` для контура, `text` для label/value/helper, `icon` для prefix/suffix icons и `status` для validation/disabled-состояний.

```text
Label                                             -> text-field/label/default
┌──────────────────────────────────────────────┐
│ [prefix icon]  Value or placeholder  [suffix] │
└──────────────────────────────────────────────┘
Helper text

Поле:
surface       -> text-field/surface/*
border        -> text-field/border/*
value         -> text-field/foreground/default
placeholder   -> text-field/foreground/placeholder
prefix/suffix -> text-field/icon/*
helper        -> text-field/helper/*
focus ring    -> text-field/focus/ring
```

#### Anatomy

| Часть Text Field | Component token | Semantic token |
|---|---|---|
| Фон поля | `text-field/surface/default` | `surface/base` |
| Фон hover | `text-field/surface/hover` | `surface/subtle` |
| Фон disabled | `text-field/surface/disabled` | `status/disabled/container` |
| Контур default | `text-field/border/default` | `border/default` |
| Контур hover | `text-field/border/hover` | `border/hover` |
| Контур focus | `text-field/border/focus` | `border/focus` |
| Контур disabled | `text-field/border/disabled` | `status/disabled/border` |
| Label | `text-field/label/default` | `text/secondary` |
| Label disabled | `text-field/label/disabled` | `status/disabled/text` |
| Value text | `text-field/foreground/default` | `text/primary` |
| Placeholder | `text-field/foreground/placeholder` | `text/muted` |
| Value disabled | `text-field/foreground/disabled` | `status/disabled/text` |
| Helper text | `text-field/helper/default` | `text/tertiary` |
| Affix background | `text-field/affix/surface` | `container/subtle/default` |
| Affix text/icon | `text-field/affix/foreground` | `text/tertiary` |
| Icon default | `text-field/icon/default` | `icon/tertiary` |
| Icon active | `text-field/icon/active` | `icon/primary` |
| Icon disabled | `text-field/icon/disabled` | `status/disabled/icon` |
| Focus ring | `text-field/focus/ring` | `focus/ring` |

#### States

```text
Default
label:        text/secondary
surface:      surface/base
border:       border/default
value:        text/primary
placeholder:  text/muted
helper:       text/tertiary
icon:         icon/tertiary

Hover
surface:      surface/subtle
border:       border/hover

Focus
border:       border/focus
focus ring:   focus/ring
icon:         icon/primary, если иконка связана с активным вводом

Disabled
surface:      status/disabled/container
border:       status/disabled/border
label:        status/disabled/text
value:        status/disabled/text
icon:         status/disabled/icon
```

#### Validation

Для validation-состояний используйте `status/*`, потому что поле сообщает состояние ввода, а не выполняет действие.

| Состояние | Component token | Semantic token |
|---|---|---|
| Error surface | `text-field/surface/error` | `status/danger/container` |
| Error border | `text-field/border/error` | `status/danger/border` |
| Error helper | `text-field/helper/error` | `status/danger/text` |
| Error icon | `text-field/icon/error` | `status/danger/icon` |
| Warning surface | `text-field/surface/warning` | `status/warning/container` |
| Warning border | `text-field/border/warning` | `status/warning/border` |
| Warning helper | `text-field/helper/warning` | `status/warning/text` |
| Success surface | `text-field/surface/success` | `status/success/container` |
| Success border | `text-field/border/success` | `status/success/border` |
| Success helper | `text-field/helper/success` | `status/success/text` |

```text
Error
Email
┌──────────────────────────────────────────────┐
│ name@example                                 │
└──────────────────────────────────────────────┘
Введите корректный email

surface: text-field/surface/error   -> status/danger/container
border:  text-field/border/error    -> status/danger/border
helper:  text-field/helper/error    -> status/danger/text
icon:    text-field/icon/error      -> status/danger/icon
```

#### Do / Don't

| Do | Don't |
|---|---|
| Использовать `surface/base` для обычного фона поля | Использовать `container/neutral/default` как фон обычного input |
| Использовать `border/focus` для focused border | Использовать `border/brand/default` только потому, что он синий |
| Использовать `status/danger/*` для ошибки | Использовать `container/danger/*` для validation |
| Использовать `text/muted` для placeholder | Ослаблять placeholder вручную через opacity |
| Использовать `icon/*` для иконок | Красить значимую иконку через случайный text token |

---

## 6. Text: Текстовые Роли

`text/*` используется только для текста. Не используйте `text/*` для фона или границы.

### Основные Текстовые Токены

| Токен | Где использовать |
|---|---|
| `text/primary` | Главный текст, labels, value text |
| `text/secondary` | Вспомогательный текст, descriptions |
| `text/tertiary` | Metadata, timestamps, low-emphasis labels |
| `text/muted` | Placeholder, subtle hints |
| `text/disabled` | Disabled label |
| `text/inverse` | Текст на inverse surface |
| `text/brand` | Brand text или активная navigation label |
| `text/accent` | Accent label |
| `text/info` | Info text |
| `text/success` | Success text |
| `text/warning` | Warning text |
| `text/danger` | Error/destructive text |
| `text/ai` | AI-specific text emphasis |

### Текст На Цветных Контейнерах

Используйте `text/on-*`, когда текст лежит на насыщенном container или inverse surface.

| Фон | Текст |
|---|---|
| `container/brand/default` | `text/on-brand/primary` |
| `container/accent/default` | `text/on-accent/primary` |
| `container/info/default` | `text/on-info/primary` |
| `container/success/default` | `text/on-success/primary` |
| `container/warning/default` | `text/on-warning/primary` |
| `container/danger/default` | `text/on-danger/primary` |
| `surface/inverse` | `text/on-inverse/primary` |

### Визуальная Иерархия

```text
Заголовок карточки       -> text/primary
Описание                 -> text/secondary
Дата / метаданные         -> text/tertiary
Placeholder               -> text/muted
Disabled label            -> text/disabled
Ошибка под полем          -> text/danger
```

---

## 7. Icon: Иконки

`icon/*` повторяет смысл foreground, но отделяет иконки от текста. Это полезно, когда иконка меняет смысл независимо от label.

| Токен | Где использовать |
|---|---|
| `icon/primary` | Основная meaning-bearing icon |
| `icon/secondary` | Вспомогательная иконка |
| `icon/tertiary` | Low-emphasis icon |
| `icon/muted` | Placeholder/decorative-like icon |
| `icon/disabled` | Disabled icon |
| `icon/brand` | Brand action icon |
| `icon/info` | Info icon |
| `icon/success` | Success icon |
| `icon/warning` | Warning icon |
| `icon/danger` | Error/destructive icon |
| `icon/ai` | AI feature icon |

Правило:

- Если иконка просто сопровождает текст, можно использовать тот же semantic foreground, что и label.
- Если иконка несёт отдельный смысл, используйте `icon/*`.

---

## 8. Status: Обратная Связь И Состояния Системы

`status/*` используется для сообщений, validation, feedback и системных состояний.

Текущие роли:

```text
status/info/*
status/success/*
status/warning/*
status/danger/*
status/ai/*
status/disabled/*
```

Каждая роль содержит:

```text
surface
container
text
border
icon
```

### Когда Использовать `status`, А Когда `container`

Используйте `status/*`, если элемент сообщает состояние системы:

```text
Alert success        -> status/success/container + status/success/text
Field error          -> status/danger/text + status/danger/border
Toast warning        -> status/warning/container + status/warning/icon
AI generation state  -> status/ai/container + status/ai/text
```

Используйте `container/*`, если это control/action:

```text
Danger button        -> container/danger/default
Success action       -> container/success/default
AI action button     -> container/ai/default
```

### Визуальный Пример: Alert

```text
Info alert
┌──────────────────────────────────────────────┐
│ icon/info    Заголовок                       │
│             status/info/text                 │
└──────────────────────────────────────────────┘
container: status/info/container
border:    status/info/border

Danger alert
┌──────────────────────────────────────────────┐
│ icon/danger  Ошибка                          │
│             status/danger/text               │
└──────────────────────────────────────────────┘
container: status/danger/container
border:    status/danger/border
```

---

## 9. Link: Ссылки

`link/*` используйте только для навигации или перехода к ресурсу.

| Токен | Где использовать |
|---|---|
| `link/default` | Обычная ссылка |
| `link/hover` | Hover |
| `link/pressed` | Pressed |
| `link/visited` | Посещённая ссылка |
| `link/visited-hover` | Hover visited-ссылки |
| `link/visited-pressed` | Pressed visited-ссылки |

Не используйте `link/*` для кнопок. Если действие выполняет команду, это Button или command item, а не link.

---

## 10. Focus

`focus/*` используется для keyboard focus и accessibility indication.

| Токен | Где использовать |
|---|---|
| `focus/ring` | Основное кольцо фокуса |
| `focus/outline` | Outline, если компонент использует stroke-based focus |
| `focus/ring-strong` | Усиленный focus для сложных поверхностей |

Правило:

- Focus не заменяет hover.
- Focus должен быть видимым независимо от цвета компонента.
- Focus token не должен зависеть от конкретного компонента.

---

## 11. Shadow

`shadow/*` задаёт цветовую основу теней. Уровень elevation описывается в component или elevation rules.

| Токен | Где использовать |
|---|---|
| `shadow/ambient` | Мягкая внешняя тень |
| `shadow/key` | Основная направленная тень |
| `shadow/overlay` | Более заметная тень overlays |

Пример:

```text
Card                  -> shadow/ambient
Popover               -> shadow/key
Modal / Drawer         -> shadow/overlay
```

---

## 12. Motion: Duration И Easing

Используйте motion tokens для всех переходов, даже если они очень короткие.

### Duration

| Токен | Где использовать |
|---|---|
| `duration/instant` | Без анимации, мгновенная смена |
| `duration/fast` | Hover, small feedback |
| `duration/base` | Button, input, chip transitions |
| `duration/moderate` | Toast, alert, small overlay |
| `duration/slow` | Drawer, modal, large panel |
| `duration/loading` | Skeleton shimmer, spinner cycle |

### Easing

| Токен | Где использовать |
|---|---|
| `easing/standard` | Большинство UI transitions |
| `easing/enter` | Появление элемента |
| `easing/exit` | Исчезновение элемента |
| `easing/emphasized` | Drawer/modal movement |
| `easing/linear` | Spinner, progress loop |

---

## 13. Opacity

Opacity tokens используйте для состояния или слоя, а не для ручной подгонки цвета.

| Токен | Где использовать |
|---|---|
| `opacity/disabled` | Disabled state, если компонент требует opacity |
| `opacity/muted` | Мягкое снижение визуального акцента |
| `opacity/overlay` | Scrim/overlay intensity |
| `opacity/invisible` | Hidden-but-measured state |
| `opacity/visible` | Fully visible state |

Если можно выбрать semantic color вместо opacity, выбирайте semantic color.

---

## 14. Типовые Паттерны

### 14.1 Карточка

```text
Card
┌──────────────────────────────────────────────┐
│ Title                         text/primary   │
│ Description                   text/secondary │
│                                              │
│ [Secondary] [Primary]                         │
└──────────────────────────────────────────────┘

surface: surface/raised
border:  border/default
shadow:  shadow/ambient
```

### 14.2 Форма

```text
Form section                  -> surface/base
Input background              -> surface/base
Input border default          -> border/default
Input border hover            -> border/hover
Input border error            -> border/danger/default
Label                         -> text/primary
Helper text                   -> text/secondary
Error text                    -> text/danger
Disabled input fill           -> container/disabled
```

### 14.3 Таблица

```text
Table background              -> surface/base
Header row                    -> surface/subtle
Row hover                     -> container/neutral/hover
Row selected                  -> container/neutral/selected
Row border                    -> border/subtle
Primary cell text             -> text/primary
Secondary cell text           -> text/secondary
Status cell                   -> status/*/text + status/*/icon
```

### 14.4 Modal

```text
Backdrop                      -> surface/scrim
Modal panel                   -> surface/overlay
Header text                   -> text/primary
Body text                     -> text/secondary
Divider                       -> border/subtle
Primary action                -> container/brand/default
Danger action                 -> container/danger/default
Shadow                        -> shadow/overlay
Enter motion                  -> duration/slow + easing/enter
Exit motion                   -> duration/moderate + easing/exit
```

### 14.5 AI Action

```text
AI command button             -> container/ai/default
AI command hover              -> container/ai/hover
AI icon                       -> icon/ai
AI status container           -> status/ai/container
AI status text                -> status/ai/text
AI generated block surface    -> surface/subtle или surface/raised
```

---

## 15. Частые Ошибки

| Ошибка | Почему плохо | Как правильно |
|---|---|---|
| Использовать `color/blue/50` в компоненте | Нет семантики, ломает темы | `container/brand/default`, `text/brand`, `border/brand/default` |
| Использовать `surface/*` для кнопки | Surface описывает слой, не control | `container/*` |
| Использовать `container/*` для страницы | Container описывает объект, не canvas | `surface/page` |
| Использовать `text/primary` на brand background | Может не пройти контраст | `text/on-brand/primary` |
| Использовать `status/*` для обычной кнопки | Status — feedback, не action | `container/brand/*` или `container/danger/*` |
| Использовать `link/*` для действия | Link — навигация, не command | Button token или command item |
| Делать disabled через случайную opacity | Нестабильно в темах | `status/disabled/*` или `opacity/disabled` |
| Создавать `border/neutral/*` | Нейтральная граница уже корневая | `border/default`, `border/hover`, `border/strong` |

---

## 16. Мини-Чеклист Перед Созданием Нового Токена

Перед тем как добавить новый semantic token, ответьте:

1. Это новая роль или просто новый цвет?
2. Этот токен нужен больше чем одному компоненту?
3. Он будет иметь разные значения в Light и Dark?
4. Его нельзя выразить существующими `surface`, `container`, `border`, `text`, `icon`, `status`?
5. Имя описывает назначение, а не внешний вид?

Если ответ “нет” на пункты 2-4, скорее всего нужен component token, а не semantic token.

---

## 17. Короткая Карта Использования

```text
surface/page
  Фон приложения

surface/base
  Основная рабочая поверхность

surface/raised
  Карточка, panel, floating block

surface/overlay
  Modal, popover, drawer

container/neutral/*
  Secondary controls, selectable neutral items

container/brand/*
  Primary action, brand selected state

container/danger/*
  Destructive action

status/danger/*
  Error feedback, validation, alert

text/on-*
  Foreground на насыщенных фонах

border/default|hover|strong
  Нейтральные границы

border/brand|danger|success|warning|info|ai
  Ролевые границы
```
