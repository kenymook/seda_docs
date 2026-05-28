# Progress Bar

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Progress Bar](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6648-110)

---

## 1. Key Principles

### Что это

Progress Bar — feedback-компонент для отображения известного и измеримого прогресса операции. Он показывает, какая часть процесса уже выполнена, сколько осталось и в каком состоянии находится операция.

В SEDA AI Progress Bar описывает measurable progress contract: диапазон значения, текущее значение, статус, текстовое объяснение, accessibility, token mapping и handoff. Компонент не используется для неизвестной загрузки и не заменяет метрики, графики или пошаговую навигацию.

### Когда использовать

- Загрузка, импорт или обработка имеют известный процент выполнения.
- Batch-операция имеет известное количество обработанных и оставшихся объектов.
- Пользователь проходит сценарий с измеримой степенью завершения.
- Профиль, настройка или quota имеют понятный `value`, `min` и `max`.
- Нужно показать успешное завершение или ошибку операции в рамках того же progress контекста.

### Когда не использовать

- Прогресс неизвестен — используйте [Spinner](spinner.md).
- Известна только структура будущего контента — используйте [Skeleton](skeleton.md).
- Загрузка завершилась без данных — используйте [Empty State](empty-state.md).
- Нужно показать последовательность шагов с названиями и переходами — используйте [Stepper](../navigation/stepper.md).
- Нужно показать KPI, аналитику или сравнение чисел — используйте Stat / Metric, Chart или Table.
- Нужен retry control — используйте Button рядом с Progress Bar, а не сам Progress Bar как действие.

### Ключевые принципы

- **Known progress only** — у компонента должен быть `value`, `min`, `max` или эквивалентная дробь.
- **Text confirms meaning** — статус и значение не должны передаваться только шириной полосы или цветом.
- **State is explicit** — `success`, `error` и `disabled` требуют понятного текстового контекста, если состояние влияет на пользователя.
- **Stable feedback** — прогресс не должен прыгать назад без объяснения причины.
- **Motion is restrained** — анимация fill не должна скрывать реальное значение.
- **AI assists, system governs** — AI может подготовить copy и handoff, но не придумывает новые состояния, токены и варианты.

### Связанные спецификации

- [Spinner](spinner.md) — неизвестная или короткая загрузка.
- [Skeleton](skeleton.md) — загрузка известной структуры контента.
- [Empty State](empty-state.md) — результат загрузки без данных.
- [Button](../actions/button.md) — retry, cancel или secondary action рядом с прогрессом.
- [Stepper](../navigation/stepper.md) — дискретные шаги сценария.

---

## 2. Anatomy

```text
Label                                  64%
[ track [========== fill ======      ] ]
Status text
```

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер и semantic wrapper Progress Bar. |
| `label` | условно | Название операции, если контекст не очевиден. |
| `value` | да | Текущее числовое значение progress. |
| `valueText` | условно | Видимое значение: `64%`, `3 из 5`, `12 МБ из 20 МБ`. |
| `track` | да | Фон прогресса. |
| `fill` | да | Заполненная часть, соответствующая `value`. |
| `statusText` | условно | Текст для `success`, `error`, `disabled` или важного ограничения. |

### Правила anatomy

- `track` и `fill` обязательны для визуального progress feedback.
- `label` обязателен, если область рядом не называет операцию.
- `valueText` нужен, когда пользователь должен понимать точное значение.
- `statusText` обязателен, если состояние нельзя безопасно понять из контекста.
- Цвет не должен быть единственным способом передать `success`, `error` или `disabled`.

---

## 3. Types / Variants

Figma component set использует variant properties `state`, `size` и `showValue`.

### State

| `state` | Значение | Поведение |
| --- | --- | --- |
| `default` | Операция выполняется штатно. | Fill отражает текущее значение. |
| `success` | Операция завершена успешно. | Значение обычно `100`; рядом можно показать completion text. |
| `error` | Операция не завершилась или заблокирована. | Нужен текст причины и отдельное действие восстановления, если оно доступно. |
| `disabled` | Progress временно недоступен или неактивен. | Используются disabled tokens; причина должна быть понятна из контекста или текста. |

### Value display

| `showValue` | Когда использовать |
| --- | --- |
| `true` | Значение важно для понимания процесса или сравнения. |
| `false` | Контекст уже объясняет процесс, а точное значение не критично. |

### Token-supported states

В `tokens.json` есть `progress-bar/fill/warning` и `progress-bar/fill/danger`. В Figma component set нет отдельного `state=warning` или `state=danger`; до добавления вариантов используйте `state=error` для критичных состояний и помечайте warning/danger как `Needs system review`.

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Компактные строки, карточки, dense lists. | Короткий label или только контекст; value показывать только при необходимости. |
| `m` | Стандартный Progress Bar в product UI. | Default для большинства операций. |
| `l` | Заметная операция в секции или форме. | Label и value рекомендуются. |
| `xl` | Основной progress feedback на экране. | Использовать только когда прогресс является главным содержимым области. |

### Правила размеров

- Размер меняет плотность и визуальный масштаб, но не смысл `state`.
- Не задавайте высоту track вручную, если нужный `size` уже есть в Figma.
- `s` не должен терять доступное имя и программное значение.
- `xl` не используется внутри таблиц и плотных списков.

---

## 5. States

| Состояние данных | Figma `state` | Поведение |
| --- | --- | --- |
| `in-progress` | `default` | Fill меняется от `min` к `max`; значение не выходит за диапазон. |
| `completed` | `success` | Показать завершение достаточно долго, чтобы пользователь понял результат. |
| `failed` | `error` | Объяснить причину, не показывать progress как продолжающийся. |
| `blocked` | `error` | Показать, что операция остановлена, и дать внешний recovery action. |
| `inactive` | `disabled` | Progress недоступен; причина должна быть понятна. |

### Правила значения

- Default range: `min=0`, `max=100`.
- Визуальный fill должен быть ограничен диапазоном `min`–`max`.
- Если значение стало неизвестным, переключайтесь на Spinner или текстовый статус.
- Если значение уменьшилось из-за реального пересчета, объясните это в status text или контексте.
- Не используйте Progress Bar для бесконечной decorative animation.

---

## 6. Behavior

### Обновление прогресса

- Обновляйте `aria-valuenow` при значимых изменениях `value`.
- Используйте `aria-valuetext`, если процент недостаточен: `3 из 5 файлов`, `12 МБ из 20 МБ`.
- Не озвучивайте каждое быстрое изменение через live region; озвучивайте milestone или итог.
- Track должен сохранять стабильную ширину, меняется только fill.

### Завершение

- При `value=max` используйте `state=success`, если операция успешно завершилась.
- Не убирайте Progress Bar мгновенно, если это единственный сигнал завершения.
- Если после завершения появляется контент, transition должен быть понятным: status text, Toast или обновленный результат.

### Ошибка и восстановление

- `state=error` требует текст причины или соседний Alert/Toast.
- Retry, cancel и details являются отдельными Button или Link, не частью Progress Bar.
- Error state не должен продолжать анимацию как активный progress.

### Responsive behavior

- В узких контейнерах label и value могут переноситься над track.
- Value нельзя обрезать, если оно критично для понимания прогресса.
- В dense context допустим `showValue=false`, если доступное значение остается программно доступным.

---

## 7. Accessibility

Progress Bar следует [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantics | Используйте native `<progress>` или `role="progressbar"`. |
| Accessible name | Компонент получает visible label, `aria-labelledby` или `aria-label`. |
| Range | Для ARIA role задавайте `aria-valuemin`, `aria-valuemax`, `aria-valuenow`. |
| Value text | Для дробей и domain-specific значений задавайте `aria-valuetext`. |
| Status text | `success`, `error` и `disabled` не передаются только цветом. |
| Announcements | Быстрые обновления не должны перегружать screen reader. |

### Accessibility checklist

- [ ] Progress Bar имеет доступное имя.
- [ ] Текущее значение доступно программно.
- [ ] `aria-valuetext` задан, если процент не объясняет состояние.
- [ ] `state=success`, `state=error` и `state=disabled` имеют текстовый контекст.
- [ ] Цвет не является единственным носителем статуса.
- [ ] Пользователь понимает, что делать после `state=error`.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Track default | `progress-bar/track/default` | Фон track в активном состоянии. | `container/neutral/default` |
| Track disabled | `progress-bar/track/disabled` | Фон track в disabled state. | `status/disabled/container` |
| Fill default | `progress-bar/fill/default` | Активный progress fill. | `container/brand/default` |
| Fill success | `progress-bar/fill/success` | Успешное завершение. | `container/success/default` |
| Fill error | `progress-bar/fill/danger` | Ошибка или блокирующее состояние. | `container/danger/default` |
| Fill warning | `progress-bar/fill/warning` | Предупреждение; требует system review, так как Figma state отсутствует. | `container/warning/default` |
| Fill disabled | `progress-bar/fill/disabled` | Disabled fill. | `status/disabled/icon` |
| Label foreground | `progress-bar/label/foreground` | Цвет label. | `text/secondary` |
| Label disabled | `progress-bar/label/disabled` | Цвет label в disabled state. | `status/disabled/text` |
| Value foreground | `progress-bar/value/foreground` | Цвет value text. | `text/primary` |
| Value disabled | `progress-bar/value/disabled` | Цвет value в disabled state. | `status/disabled/text` |

### Token gaps

- Нет component tokens для track height, radius, gap между label/value/track и transition duration.
- Нет отдельного Figma state для warning, хотя token `progress-bar/fill/warning` существует.
- Нет отдельного token alias `progress-bar/fill/error`; текущий `state=error` мапится на `progress-bar/fill/danger`.
- Не создавайте новые token names без system review и обновления Figma/code mapping.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Value | `value` | Текущее числовое значение. |
| Min | `min` | Default `0`. |
| Max | `max` | Default `100`. |
| State | `state` | `default`, `success`, `error`, `disabled`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Show value | `showValue` | Boolean, соответствует Figma `true/false`. |
| Label | `label` | Visible label или accessible name. |
| Value label | `valueLabel` | Видимое значение: percent/fraction/domain value. |
| Aria value text | `ariaValueText` | Для non-percent значения. |
| Status text | `statusText` | Для success/error/disabled или важных ограничений. |

### Contract rules

- `value`, `min` и `max` должны задавать determinate progress.
- `state`, `size` и `showValue` должны соответствовать Figma variants.
- `value` должен clamp-иться при визуальном рендеринге.
- `state=error` не должен выглядеть как активное продолжение процесса.
- Для indeterminate loading используйте Spinner или Skeleton.
- Не добавляйте arbitrary fill color prop.

---

## 10. Handoff notes

В handoff нужно передать:

- какую операцию измеряет Progress Bar;
- `value`, `min`, `max` и формат отображения;
- Figma variants: `state`, `size`, `showValue`;
- label, value label и status text;
- поведение при `value=max`;
- поведение при `state=error`;
- нужен ли retry/cancel/details рядом с компонентом;
- accessible name и `aria-valuetext`;
- token mapping для track, fill, label и value;
- token gaps для height, radius, spacing, transition и warning state.

### Acceptance criteria

- Progress Bar используется только для измеримого прогресса.
- Текущее значение доступно визуально или программно.
- `state`, `size` и `showValue` совпадают с Figma variants.
- `state=success`, `state=error` и `state=disabled` не передаются только цветом.
- Track, fill, label и value используют documented component tokens.
- Indeterminate loading использует Spinner или Skeleton.
- Retry/cancel/details реализованы соседними Button или Link.

---

## 11. AI usage rules

- AI может использовать Progress Bar только для measurable progress.
- AI должен рекомендовать Spinner, если прогресс неизвестен.
- AI должен рекомендовать Skeleton, если известна структура будущего контента, но неизвестен процент.
- AI может использовать только Figma states: `default`, `success`, `error`, `disabled`.
- AI может использовать только sizes: `s`, `m`, `l`, `xl`.
- AI не должен придумывать circular progress, warning state, arbitrary colors или новые token paths.
- AI должен проверять `tokens.json` перед изменением token mapping.
- AI должен помечать missing value range, missing accessible name, status-by-color-only, unsupported state или indeterminate progress как `Needs system review`.
- AI может подготовить labels, status text, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Загрузка файла с известным процентом. | `value=72`, `max=100`, `size=m`, `state=default`, `showValue=true`. |
| Импорт строк. | `value=3`, `max=5`, `valueLabel=3 из 5 файлов`, `ariaValueText=3 из 5 файлов`. |
| Заполнение профиля. | `value=80`, `state=default`, label `Профиль заполнен`. |
| Завершенный импорт. | `value=100`, `state=success`, status text `Импорт завершен`. |
| Ошибка операции. | `state=error`, status text с причиной, рядом Button `Повторить`. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Progress Bar без известного `value`. | Нужен Spinner или текстовый статус. |
| Красный fill без объяснения. | Статус передан только цветом. |
| Circular progress. | Не описан и не токенизирован в этой спецификации. |
| Warning progress. | Token есть, но Figma state отсутствует. |
| Значение прыгает назад без текста. | Пользователь теряет доверие к прогрессу. |

---

## 13. Anti-patterns

- Использовать Progress Bar для неизвестной загрузки.
- Показывать декоративную progress-like полоску для метрики без процесса выполнения.
- Скрывать точное значение, когда оно нужно пользователю.
- Убирать Progress Bar сразу на `100%` без completion feedback.
- Передавать `success`, `error` или `disabled` только цветом.
- Создавать custom fill colors вне component tokens.
- Использовать Progress Bar как Button, retry control или navigation stepper.
