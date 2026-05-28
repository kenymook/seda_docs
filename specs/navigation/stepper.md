# Stepper

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Stepper — навигационный и статусный компонент для линейного многошагового процесса. Он показывает порядок шагов, текущий шаг, завершенные шаги, будущие шаги и возможные ошибки, чтобы пользователь понимал, где он находится в сценарии и что осталось сделать.

Stepper не является обычным Progress Bar: Progress Bar показывает степень выполнения, а Stepper показывает дискретные шаги с названиями и правилами перехода. Stepper также не заменяет Tabs: Tabs переключают независимые разделы, а Stepper ведет пользователя через последовательный flow.

### Когда использовать

**Используйте** — когда сценарий состоит из предсказуемых шагов:

- onboarding;
- checkout или order flow;
- создание сложного объекта;
- multi-step form;
- setup wizard;
- approval flow с последовательными этапами;
- review process, где важно видеть `current`, `completed`, `upcoming` и `error`.

**Не используйте:**

- Для одного шага — Stepper не нужен.
- Для непрерывного процента выполнения — используйте [Progress Bar](../feedback/progress-bar.md).
- Для переключения независимых разделов — используйте [Tabs](../navigation/tabs.md).
- Для истории событий объекта — используйте [Timeline](../data-display/timeline.md).
- Для глубокой навигации по продукту — используйте [Sidebar](../navigation/sidebar.md).
- Для длинного процесса без понятных этапов — сначала определите UX pattern и модель данных.

### Основные принципы

- **Текущий шаг всегда явный** — пользователь должен видеть, где он находится.
- **Порядок имеет смысл** — последовательность шагов должна отражать реальный процесс.
- **Completed означает достаточную готовность** — завершенный шаг не должен означать просто "пользователь его открыл".
- **Error ведет к исправлению** — шаг с ошибкой должен объяснять, что нужно исправить или куда вернуться.
- **Clickable — это контракт** — если шаг кликабельный, правила перехода должны быть описаны.
- **AI не придумывает шаги процесса** — AI может предложить структуру, но шаги, блокировки и правила перехода утверждает человек.

### Связанные спецификации

- [Progress Bar](../specs/feedback/progress-bar.md)
- [Tabs](../specs/navigation/tabs.md)
- [Timeline](../specs/data-display/timeline.md)
- [Form](../specs/overlays-layout/form.md)
- [Button](../specs/actions/button.md)
- [Alert](../specs/feedback/alert.md)

---

## 2. Anatomy

```text
Horizontal:
[1✓] ---- [2] ---- [3] ---- [4]
Done      Current  Upcoming Upcoming

Vertical:
[1✓] Done
 |
[2] Current
 |  Optional description
[3] Upcoming
 |
[4] Upcoming
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | да | Контейнер Stepper |
| `step` | да | Один шаг процесса |
| `indicator` | да | Номер, иконка или статусная метка |
| `label` | да | Название шага |
| `description` | опционально | Короткое дополнительное описание |
| `connector` | условно | Линия между соседними шагами |
| `currentMarker` | да | Визуальное и программное обозначение текущего шага |
| `statusIcon` | условно | Check, error icon или другая статусная иконка |
| `actionTarget` | условно | Link/button behavior для кликабельного шага |

### Правила anatomy

- Stepper должен содержать минимум два шага.
- У каждого шага должны быть стабильный `id` и `label`.
- Используйте номера, когда важен порядок, и иконки/checkmarks, когда важнее статус.
- `description` должна быть короткой; длинные инструкции относятся к содержимому шага.
- `connector` отражает переход между шагами, а не только состояние следующего шага.

---

## 3. Types / Variants

### Ориентация

| Вариант | Описание | Когда использовать |
| --- | --- | --- |
| `horizontal` | Шаги расположены слева направо | Header формы, checkout, onboarding |
| `vertical` | Шаги расположены сверху вниз | Side panel, длинные labels, узкие экраны |

### Режим взаимодействия

| Режим | Описание | Правило |
| --- | --- | --- |
| `read-only` | Stepper только показывает прогресс | Дефолт для строгих линейных flow |
| `clickable-completed` | Пользователь может вернуться к завершенным шагам | Часто используется в формах и review flow |
| `clickable-all` | Пользователь может перейти к разрешенным шагам | Нужны явные правила validation/navigation |
| `nonlinear` | Шаги можно проходить не по порядку | Требует product review; возможно, лучше использовать Tabs |

### Статусы шага

| Статус | Значение | Правило |
| --- | --- | --- |
| `upcoming` | Шаг еще не достигнут | Более низкий визуальный акцент |
| `current` | Пользователь находится на этом шаге | В active flow должен быть только один |
| `completed` | Шаг завершен и достаточно валиден для продолжения | Используйте completed indicator |
| `error` | На шаге есть блокирующая ошибка | Покажите error state и путь восстановления |
| `disabled` | Шаг недоступен | Объясните причину, если она не очевидна |

---

## 4. Sizes

Размер Stepper управляет размером indicator, плотностью label, расстоянием connector и общей площадью компонента.

| Size | Плотность indicator | Плотность label | Когда использовать |
| --- | --- | --- | --- |
| `compact` | Малый indicator | Только короткие labels | Плотные панели, узкие headers |
| `medium` | Дефолтный indicator | Дефолтные labels | Большинство продуктовых flow |
| `large` | Увеличенный indicator | Есть место для descriptions | Onboarding, checkout, guided setup |

### Правила размеров

- Используйте `medium` по умолчанию.
- Используйте `compact` только когда labels короткие и остаются читаемыми.
- Используйте `large`, когда показаны descriptions или Stepper является главным ориентиром в сценарии.
- На мобильных горизонтальный Stepper может сворачиваться в summary текущего шага или переходить в vertical layout.
- Не уменьшайте шрифт ради большого количества шагов; упростите labels или измените layout.

---

## 5. States

### Матрица состояний шага

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `upcoming` | Будущий шаг | Не активен; может быть disabled в зависимости от flow |
| `current` | Активный шаг | Использует current indicator и `aria-current="step"` |
| `completed` | Завершенный шаг | Показывает completed indicator и completed connector после шага |
| `error` | Шаг содержит validation или process error | Показывает error indicator и error label treatment |
| `disabled` | Шаг недоступен | Нет activation, используется disabled treatment |
| `hover` | Pointer над кликабельным шагом | Hover treatment только для clickable step |
| `focus` | Keyboard focus | Видимый focus ring для clickable step |

### Состояния connector

| State | Значение |
| --- | --- |
| `default` | Между upcoming/current шагами |
| `completed` | Переход после завершенного шага |
| `error` | Переход, связанный с error path |
| `disabled` | Переход к недоступному шагу |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| один `current` step | да | В active flow должен быть ровно один текущий шаг |
| `completed` перед `current` | да | Стандартный линейный прогресс |
| `error` перед `current` | да | Пользователь может вернуться и исправить ошибку |
| `upcoming` перед `completed` | нет | Нарушает линейный смысл, если nonlinear flow не утвержден |
| `disabled` + clickable | нет | Disabled step не активируется |

---

## 6. Behavior

### Поведение прогресса

- Состояние Stepper управляется моделью процесса, а не только визуальной позицией.
- Переход к следующему шагу требует validation или completion rule, заданного в flow.
- Завершенный шаг может перейти в `error`, если поздняя validation или server response сделала его невалидным.
- Label текущего шага должен совпадать с видимым содержимым шага.
- Если количество шагов меняется динамически, handoff должен описывать пересчет текущего прогресса.

### Навигационное поведение

- `read-only` Stepper не делает шаги интерактивными.
- `clickable-completed` позволяет возвращаться к завершенным шагам.
- `upcoming` steps не кликабельны, если nonlinear navigation явно не поддержана.
- Error step должен вести пользователя к месту исправления.
- Back/Next buttons принадлежат окружающему flow, а не самому Stepper.

### Responsive behavior

- Horizontal Stepper может переноситься только если connector и порядок шагов остаются понятными.
- На узких экранах предпочтительны vertical Stepper, compact summary или текст "Step N of M" + current label.
- Descriptions можно скрывать в compact layout, но labels и current state должны оставаться видимыми.
- Error state нельзя скрывать при переходе в mobile/compact view.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Перемещение по кликабельным шагам и соседним actions |
| `Enter` / `Space` | Активировать focused clickable step |
| `ArrowLeft` / `ArrowRight` | Опциональная roving navigation в horizontal clickable Stepper |
| `ArrowUp` / `ArrowDown` | Опциональная roving navigation в vertical clickable Stepper |

---

## 7. Accessibility

Stepper следует [foundation/accessibility.md](../../foundation/accessibility.md) и navigation semantics.

| Требование | Правило |
| --- | --- |
| Ordered structure | Используйте ordered list semantics, когда шаги последовательны |
| Current step | Текущий шаг должен быть доступен программно |
| Status text | `completed` и `error` должны быть понятны assistive tech |
| Clickable step | Используйте link/button semantics только если шаг интерактивный |
| Disabled step | Не показывайте disabled step как активную навигацию |
| Error recovery | Error step должен указывать на проблему или вести к деталям |
| Color reliance | Статус нельзя передавать только цветом |
| Step count | Добавляйте "Step N of M", когда это помогает ориентации |

### Accessibility checklist

- [ ] Ровно один шаг имеет current state.
- [ ] Порядок шагов доступен программно.
- [ ] `completed` и `error` не передаются только цветом.
- [ ] Кликабельные шаги имеют accessible names и focus styles.
- [ ] `disabled` / `upcoming` steps не фокусируются, если не объясняют доступность.
- [ ] Error step ведет к recovery path.
- [ ] Compact/mobile версия сохраняет current step и error state.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Роль | Component token | Semantic |
| --- | --- | --- |
| Indicator upcoming | `stepper/indicator/upcoming` | `container/neutral/default` |
| Indicator current | `stepper/indicator/current` | `container/brand/default` |
| Indicator completed | `stepper/indicator/completed` | `container/brand/default` |
| Indicator error | `stepper/indicator/error` | `container/danger/default` |
| Indicator disabled | `stepper/indicator/disabled` | `status/disabled/container` |
| Icon default | `stepper/icon/default` | `text/on-brand/primary` |
| Icon upcoming | `stepper/icon/upcoming` | `icon/tertiary` |
| Icon current | `stepper/icon/current` | `text/on-brand/primary` |
| Icon completed | `stepper/icon/completed` | `text/on-brand/primary` |
| Icon error | `stepper/icon/error` | `text/on-danger/primary` |
| Icon disabled | `stepper/icon/disabled` | `status/disabled/icon` |
| Connector default | `stepper/connector/default` | `border/default` |
| Connector completed | `stepper/connector/completed` | `border/brand/default` |
| Connector error | `stepper/connector/error` | `border/danger/default` |
| Connector disabled | `stepper/connector/disabled` | `status/disabled/border` |
| Label current | `stepper/label/current` | `text/primary` |
| Label upcoming | `stepper/label/upcoming` | `text/tertiary` |
| Label completed | `stepper/label/completed` | `text/secondary` |
| Label error | `stepper/label/error` | `status/danger/text` |
| Label disabled | `stepper/label/disabled` | `status/disabled/text` |
| Focus ring | `stepper/focus/ring` | `focus/ring` |

### Token gaps

- Сейчас у Stepper нет component tokens для размера indicator, длины connector, толщины connector, расстояния между шагами, расстояния между label и indicator, цвета description и animation.
- Используйте foundation spacing, sizing, typography и motion rules, пока не появятся Stepper-specific layout tokens.
- Не придумывайте `--stepper-*` или новые `stepper/*` token paths в specs, code, Figma или AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Orientation | `orientation` | `horizontal`, `vertical` |
| Size | `size` | `compact`, `medium`, `large` |
| Interaction mode | `interactionMode` | `read-only`, `clickable-completed`, `clickable-all`, `nonlinear` |
| Steps | `steps` | Ordered step objects |
| Step id | `step.id` | Стабильный идентификатор |
| Step label | `step.label` | Обязательное название шага |
| Step description | `step.description` | Опциональный короткий текст |
| Step status | `step.status` | `upcoming`, `current`, `completed`, `error`, `disabled` |
| Current step | `currentStepId` | Ровно один текущий шаг |
| Click handler | `onStepSelect` | Только для clickable modes |
| Validation state | `errors` / `stepErrors` | Связь ошибок с шагами |
| Connector state | derived | Выводится из статусов соседних шагов |

### Contract rules

- `steps` должен быть упорядоченным массивом.
- Stepper требует минимум два шага.
- В активном процессе должен быть ровно один `current` step.
- Clickable behavior должен описывать, какие статусы доступны для перехода.
- Error status должен включать recovery behavior или ссылку на проблемное содержимое.

---

## 10. Handoff notes

В handoff нужно передать:

- название процесса и последовательность шагов;
- orientation, size и responsive behavior;
- список шагов: `id`, `label`, `description`, `status`, route/content target;
- правило определения current step и completion rule;
- clickable behavior и разрешенные navigation targets;
- validation и error mapping по шагам;
- mobile compact behavior, включая fallback "Step N of M";
- token mapping для indicator, icon, connector, label и focus;
- token gaps для dimensions, spacing, description text и animation.

### Acceptance criteria

- Stepper содержит минимум два упорядоченных шага.
- Ровно один current step видим и доступен программно.
- `completed`, `current`, `upcoming`, `error` и `disabled` визуально различимы.
- Error state имеет recovery behavior.
- Clickable behavior описан, либо Stepper является read-only.
- Mobile/compact view сохраняет current step и error visibility.
- Компонент использует документированные `stepper/*` tokens и foundation rules для token gaps.
- AI-generated drafts не добавляют и не переупорядочивают process steps без review.

---

## 11. AI usage rules

- AI может предлагать Stepper только для последовательных multi-step flows.
- AI должен рекомендовать Progress Bar для continuous progress и Tabs для независимых content sections.
- AI не должен придумывать process steps, validation rules, navigation permissions, token paths или completion criteria.
- AI должен проверять `tokens.json` перед изменением Stepper token mappings.
- AI должен помечать отсутствующий current step, неясный порядок шагов, отсутствие error recovery, неподдержанную nonlinear navigation или недоступные clickable steps как `Needs system review`.
- AI может подготовить step schemas, Handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Examples

### Корректно

| Сценарий | Использование |
| --- | --- |
| Checkout | `orientation=horizontal`, current step и completed previous steps |
| Onboarding | `orientation=vertical`, descriptions для каждого setup step |
| Multi-step form | `interactionMode=clickable-completed`, completed steps можно открыть снова |
| Server validation failed | Затронутый шаг получает `error` и ведет к recovery |
| Mobile wizard | Compact "Step 2 of 5" плюс current label |

### Требует review

| Сценарий | Причина |
| --- | --- |
| Пользователь может прыгнуть на любой будущий шаг без validation | Не описан navigation contract |
| Stepper используется для независимых settings sections | Вероятно, лучше Tabs или Sidebar |
| `completed` означает только "посещен" | Progress semantics вводит в заблуждение |
| Error state показан только красным цветом | Accessibility gap |
| AI добавляет шаг "Review" без product requirement | Придуманный process step |

---

## 13. Anti-patterns

- Использовать Stepper для одного шага или нелинейного flow.
- Показывать больше шагов, чем пользователь может быстро просканировать.
- Скрывать current step на мобильных.
- Разрешать переход к будущим шагам без validation rules.
- Отмечать шаг как completed до валидности обязательных данных.
- Показывать error state без recovery path.
- Создавать raw colors, connector styles или недокументированные token names для step states.
