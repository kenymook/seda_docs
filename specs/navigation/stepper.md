# Stepper

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Stepper](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6658-45)

---

## 1. Key Principles

### Что это

Stepper — навигация по последовательному многошаговому сценарию. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует порядок шагов, состояния, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с черновиком структуры flow, validation rules, handoff notes и acceptance criteria. AI не заменяет дизайнера и разработчика: финальное решение по числу шагов, переходам, ошибкам и доступности остаётся за человеком.

### Когда использовать

- Пользователь проходит линейный процесс: onboarding, настройка, создание сущности, checkout, wizard.
- Есть понятный текущий шаг и ожидаемый следующий шаг.
- Нужно показать прогресс по этапам, а не процент выполнения.
- Переход между шагами зависит от валидации или сохранения данных.

### Когда не использовать

- Для независимых разделов внутри одного контекста — используйте Tabs.
- Для переключения режимов или фильтров — используйте Segmented Control.
- Для непрерывного прогресса загрузки — используйте Progress Bar.
- Для длинного дерева навигации — используйте navigation pattern, а не Stepper.
- Для сценария без правил перехода между шагами.

### Принципы

- **Sequence is explicit** — порядок шагов, условия переходов и блокировки описаны в handoff.
- **State ownership is explicit** — current, completed, error и disabled вычисляются из данных flow.
- **Tokens before visuals** — индикаторы, connectors, labels и focus ring используют component tokens.
- **Validation before progress** — шаг не считается completed без успешной проверки.
- **AI assists, system governs** — AI может предложить структуру шагов, но не придумывает новые states, variants или tokens.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер Stepper и orientation contract. |
| `stepList` | да | Упорядоченный список шагов. |
| `step` | да | Один этап flow с indicator, label и состоянием. |
| `indicator` | да | Номер, icon или маркер состояния шага. |
| `label` | да | Название шага. |
| `connector` | условно | Линия между шагами; показывает связь и completed path. |
| `description` | опционально | Краткое пояснение шага, если label недостаточен. |
| `panel` | вне Stepper | Контент текущего шага; не должен быть вложен в сам navigation component без явного layout contract. |

### Правила anatomy

- Каждый `step` должен иметь устойчивый id и label.
- `indicator` не должен быть единственным носителем смысла состояния: состояние также передаётся через текст, ARIA или icon semantics.
- `connector` отражает связь между шагами, но не заменяет state текущего шага.
- Контент шага и кнопки Next/Back принадлежат flow, а не самому Stepper.

---

## 3. Types / Variants

Figma component set: `Stepper`. Node id: `6658:45`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `layout` | `horizontal` | `horizontal`, `vertical` | Orientation списка шагов. |
| `activeStep` | `2` | `2` | Figma snapshot состояния; в code active step должен приходить из данных flow. |
| `size` | `m` | `s`, `m`, `l`, `xl` | Плотность indicator, label и connector. |

### Layout rules

| Layout | Когда использовать | Ограничения |
| --- | --- | --- |
| `horizontal` | 3-5 коротких шагов, desktop, верхняя область wizard. | Не перегружайте длинными label; на mobile нужен перенос или vertical adaptation. |
| `vertical` | Длинные label, много шагов, side flow, mobile. | Не используйте как обычный menu без progression rules. |

### Active step contract

Figma metadata фиксирует `activeStep: 2` как пример состояния. В реализации `activeStep` или `currentStep` должен быть числом/ключом, который приходит из flow. Визуальные states шагов вычисляются из отношения каждого шага к текущему:

- before current: `completed`, если шаг прошёл валидацию;
- current: `current`;
- after current: `upcoming` или `disabled`, если переход невозможен;
- failed validation: `error`.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Компактные flows в плотных интерфейсах. | Проверьте читаемость label и размер focus target. |
| `m` | Основной размер для wizard и форм. | Используйте как default, если нет причины менять плотность. |
| `l` | Крупные этапы, onboarding, touch-oriented layout. | Проверьте перенос длинных label. |
| `xl` | Сценарии с повышенной читаемостью или небольшим числом шагов. | Не используйте для длинных списков шагов без vertical layout. |

Размер влияет на плотность indicator, connector и label, но не меняет логику переходов и validation rules.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `upcoming` | Шаг ещё не начат. | Доступность перехода зависит от flow; не показывайте как completed. |
| `current` | Активный шаг. | Должен быть один на flow. |
| `completed` | Шаг пройден и валиден. | Не ставится только из-за посещения шага. |
| `error` | Шаг содержит ошибку или требует исправления. | Ошибка должна иметь текстовое объяснение в panel или summary. |
| `disabled` | Переход временно недоступен. | Причина должна быть понятна из контекста. |
| `loading` | Flow проверяет данные или сохраняет шаг. | Используется в panel/actions; Stepper не должен хаотично менять current state. |

### State rules

- `completed` и `error` не должны одновременно применяться к одному шагу.
- `disabled` не используется для скрытия бизнес-ограничений без объяснения.
- Если пользователь может возвращаться к прошлым шагам, это должно быть описано в transition rules.

---

## 6. Behavior

- `Next` переводит на следующий шаг только после успешной validation текущего шага.
- `Back` возвращает на предыдущий шаг без потери введённых данных.
- Нелинейный переход по шагам разрешён только если flow явно поддерживает direct navigation.
- При ошибке focus переводится к error summary или первому полю с ошибкой в panel.
- При сохранении шага disabled/loading state должен принадлежать actions или panel, а не скрытно менять весь Stepper.
- На mobile horizontal Stepper должен иметь устойчивый overflow, collapse или переход в vertical layout.

### Transition matrix

| From state | Target | Условие |
| --- | --- | --- |
| `current` | next `current` | Данные текущего шага валидны и сохранены, если это требуется. |
| `current` | `error` | Validation failed или async save failed. |
| `completed` | `current` | Пользователь вернулся к шагу для редактирования. |
| `upcoming` | `current` | Flow разрешает переход. |
| `disabled` | any | Только после снятия условия блокировки. |

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantics | Используйте `nav` с `aria-label`, `ol`/`li` или эквивалентную структуру ordered steps. |
| Current step | Текущий шаг помечается через `aria-current="step"` или эквивалентный contract. |
| Interactive steps | Если шаг кликабельный, он должен быть доступен с клавиатуры и иметь понятное состояние. |
| Error state | Ошибка шага передаётся текстом и связана с panel/error summary. |
| Focus | После перехода focus должен попадать в начало нового panel или на heading шага. |
| Disabled | Disabled steps не должны быть достижимы как активные controls без объяснения причины. |

### Accessibility checklist

- [ ] Есть понятное имя группы шагов.
- [ ] Текущий шаг программно отмечен.
- [ ] Порядок чтения совпадает с визуальным порядком.
- [ ] Ошибки шагов доступны не только через цвет.
- [ ] Keyboard navigation описана для linear и non-linear режимов.
- [ ] Focus после `Next`/`Back` не теряется.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/stepper/indicator/upcoming` | Индикатор будущего шага | `container/neutral/default` |
| `$collections/components/$modes/Mode 1/stepper/indicator/current` | Индикатор текущего шага | `container/brand/default` |
| `$collections/components/$modes/Mode 1/stepper/indicator/completed` | Индикатор завершённого шага | `container/brand/default` |
| `$collections/components/$modes/Mode 1/stepper/indicator/error` | Индикатор шага с ошибкой | `container/danger/default` |
| `$collections/components/$modes/Mode 1/stepper/indicator/disabled` | Индикатор недоступного шага | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/stepper/icon/default` | Иконка по умолчанию | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/stepper/icon/upcoming` | Иконка будущего шага | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/stepper/icon/current` | Иконка текущего шага | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/stepper/icon/completed` | Иконка завершённого шага | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/stepper/icon/error` | Иконка ошибки | `text/on-danger/primary` |
| `$collections/components/$modes/Mode 1/stepper/icon/disabled` | Иконка disabled | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/stepper/connector/default` | Connector по умолчанию | `border/default` |
| `$collections/components/$modes/Mode 1/stepper/connector/completed` | Connector завершённого пути | `border/brand/default` |
| `$collections/components/$modes/Mode 1/stepper/connector/error` | Connector ошибки | `border/danger/default` |
| `$collections/components/$modes/Mode 1/stepper/connector/disabled` | Connector disabled | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/stepper/label/current` | Label текущего шага | `text/primary` |
| `$collections/components/$modes/Mode 1/stepper/label/upcoming` | Label будущего шага | `text/tertiary` |
| `$collections/components/$modes/Mode 1/stepper/label/completed` | Label завершённого шага | `text/secondary` |
| `$collections/components/$modes/Mode 1/stepper/label/error` | Label ошибки | `status/danger/text` |
| `$collections/components/$modes/Mode 1/stepper/label/disabled` | Label disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/stepper/focus/ring` | Focus indicator | `focus/ring` |

### Token gaps

- Если нужен отдельный token для hover/pressed interactive step, зафиксируйте `Token gap`.
- Не используйте raw colors для completed, error или disabled states.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Layout | `layout` | Только `horizontal` или `vertical`. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Steps | `steps` | Массив с `id`, `label`, optional `description`, `state`. |
| Current step | `currentStep` / `activeStep` | Controlled value из flow. |
| Переход | `onStepChange` | Вызывается только если direct navigation разрешена. |
| Linear mode | `linear` | Запрещает переход вперёд без validation. |
| Error | `errorStepIds` или state per step | Ошибка должна быть связана с текстом в panel. |
| Disabled | `disabledStepIds` или state per step | Причина disabled описывается в flow. |

### Contract rules

- Figma `activeStep: 2` не ограничивает code API одним значением; это визуальный пример.
- Stepper не хранит данные формы. Он отображает состояние flow.
- Unsupported states или новые indicator styles помечаются как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `6658:45` | Позволяет сверить design/code mapping. |
| Список шагов с id, label и порядком | Нужен для устойчивой реализации. |
| `layout`, `size`, current step | Определяет визуальную структуру. |
| State matrix по каждому шагу | Убирает спор между current, completed, error и disabled. |
| Transition rules | Нужны для `Next`, `Back`, direct navigation и validation. |
| Error и loading behavior | Предотвращает потерю контекста при async flow. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |
| Accessibility contract | Нужен для keyboard и screen reader QA. |

### Acceptance criteria

- Stepper показывает ровно один current step.
- Completed state ставится только после validation.
- Error state имеет текстовое объяснение и путь исправления.
- `layout` и `size` соответствуют documented variants.
- Keyboard/focus behavior проверен для переходов между шагами.
- AI-generated flow не добавляет новые visual states, token names или variants без review.

---

## 11. AI usage rules

- AI может предложить структуру шагов, labels, validation prompts и acceptance criteria.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Stepper вместо Tabs, Progress Bar или Segmented Control.
- AI не должен придумывать новые states, indicators, connectors или token paths.
- AI обязан помечать unclear transition rules, missing validation, missing error behavior и accessibility gaps как `Needs system review`.
- AI может подготовить handoff notes, но человек утверждает порядок шагов и правила перехода.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Onboarding из 4 шагов с `horizontal` Stepper. | Есть линейный flow и прогресс по этапам. |
| Настройка интеграции с `vertical` Stepper и длинными labels. | Вертикальный layout сохраняет читаемость. |
| Ошибка на предыдущем шаге после async validation. | Stepper помогает вернуться и исправить проблему. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Stepper как список разделов настроек без завершения. | Это навигация или Tabs, а не step flow. |
| Completed state только потому, что пользователь посетил шаг. | Прогресс становится недостоверным. |
| Disabled будущие шаги без объяснения. | Пользователь не понимает, что нужно сделать. |

---

## 13. Anti-patterns

- Использовать Stepper для независимых вкладок.
- Скрывать ошибки шага только цветом indicator.
- Давать пользователю перейти дальше без validation, если flow заявлен как linear.
- Менять порядок шагов после начала flow без объяснения.
- Добавлять новые indicator colors, icons или connector styles без system review.
