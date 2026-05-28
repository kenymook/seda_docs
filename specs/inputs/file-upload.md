# File Upload

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [File Upload](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6661-46)

---

## 1. Key Principles

### Что это

File Upload — контрол выбора, перетаскивания и отслеживания загрузки файлов. В SEDA AI этот компонент описывается как часть AI-ready design system framework: спецификация фиксирует назначение, variants, states, props, token mapping, accessibility, handoff и правила использования AI.

AI может помогать с черновиками сценариев, текстов, acceptance criteria и handoff, но не заменяет дизайнера и разработчика. Финальное решение по поведению, доступности, токенам и соответствию продуктовой задаче остается за человеком.

### Когда использовать

Используйте File Upload, когда пользователь добавляет файл через dropzone, кнопку или inline control, а интерфейс показывает ограничения формата и результат загрузки.

### Когда не использовать

Не используйте File Upload, для выбора уже загруженного файла используйте Select или список; progress показывайте через Progress Bar; ошибки формата не прячьте только в Toast.

### Ключевые принципы

- **System before generation** — сначала используйте documented variants, states и props, затем формируйте UI.
- **Tokens before visuals** — визуальные решения должны ссылаться на реальные tokens или явные token gaps.
- **Components before custom UI** — не создавайте локальный паттерн, если системный компонент покрывает сценарий.
- **State ownership is explicit** — компонент, родитель и вложенные controls должны владеть только своими состояниями.
- **Documentation is source of truth** — Figma, code и handoff должны совпадать со spec.
- **AI assists, system governs** — AI ускоряет аудит и черновики, но не придумывает новые правила.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Корневой контейнер компонента и точка применения layout/ARIA contract. |
| `content` | условно | Основной текст, значение, список, область данных или slot. |
| `control` | условно | Интерактивная часть, если компонент принимает пользовательский ввод. |
| `label` | условно | Видимое имя компонента; не заменяется placeholder или Tooltip. |
| `helper` | опционально | Подсказка, ограничение или дополнительный контекст. |
| `error` | условно | Ошибка или validation message, если сценарий поддерживает error state. |

### Правила anatomy

- Обязательные части должны быть видимыми или программно доступными.
- Вложенные Button, Icon Button, Link, input controls и feedback components следуют собственным specs.
- Если часть компонента скрывается через boolean property, layout и keyboard order не должны ломаться.
- Не добавляйте произвольные decorative slots без system review.

---

## 3. Types / Variants

Figma component set: `File Upload`. Variants: 44.

| Property | Default | Options |
| --- | --- | --- |
| `type` | `dropzone` | `dropzone`, `button`, `inline` |
| `state` | `default` | `default`, `hover`, `drag-over`, `uploading`, `success`, `error`, `disabled` |
| `size` | `s` | `m`, `s`, `l`, `xl` |

### Boolean / slot properties

| Property | Default | Options |
| --- | --- | --- |
| Нет boolean properties | - | Видимость slots задается props contract. |

### Variant rules

- Используйте только options, перечисленные в Figma metadata.
- Если продуктовый сценарий требует нового variant, пометьте его как `Needs system review`.
- Не смешивайте design-only labels и code API: code mapping должен явно указать соответствие.

---

## 4. Sizes

Если в Figma есть `size` или `Size`, используйте только documented options. Размер отвечает за плотность, высоту, spacing и масштаб touch target, но не меняет назначение компонента.

| Правило | Требование |
| --- | --- |
| Consistency | Размер должен совпадать с соседними компонентами и layout density. |
| Accessibility | Touch target и focus target должны оставаться доступными. |
| Responsive | На узких экранах размер не должен ломать перенос текста и controls. |
| Handoff | Любое отличие от Figma size options фиксируется как token/layout gap. |

---

## 5. States

Состояния берутся из Figma variants, props contract и родительского сценария.

| State group | Что проверять |
| --- | --- |
| Default | Базовый вид и поведение без пользовательского взаимодействия. |
| Hover / focus / active | Доступность с мыши, клавиатуры и touch, если состояние поддержано. |
| Filled / selected / checked / open | Значение, выбранность или раскрытие должны быть программно доступны. |
| Error | Ошибка должна иметь текстовое объяснение и путь восстановления. |
| Disabled | Disabled state не должен быть единственным способом объяснить ограничение. |
| Loading / empty | Используйте Spinner, Skeleton, Progress Bar или Empty State, если это отдельный feedback pattern. |

---

## 6. Behavior

- Поведение должно быть связано с конкретным user intent и не зависеть только от визуального состояния.
- Keyboard behavior должен быть описан для всех интерактивных сценариев.
- Изменение значения, открытия, выбора, ошибки или submit должно иметь owner: компонент, parent или form flow.
- Данные пользователя не должны теряться при dismiss, navigation, reset или async update без явного правила.
- Responsive behavior должен описывать перенос, collapse, scrolling или mobile adaptation.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Accessible name | Интерактивный компонент имеет видимый label или программное имя. |
| Description | Helper, error и contextual text связываются с control программно, если они важны. |
| Keyboard | Все действия доступны с клавиатуры в ожидаемом порядке. |
| Focus | Focus indicator видим и не теряется при state changes. |
| Error | Error state передается текстом, а не только цветом. |
| Disabled | Причина недоступности понятна из контекста или helper text. |

### Accessibility checklist

- [ ] Есть accessible name.
- [ ] Keyboard path описан и не содержит ловушек.
- [ ] Focus state видим.
- [ ] Error/disabled states объяснены текстом.
- [ ] Важная информация не спрятана только в Tooltip.
- [ ] Mobile и touch behavior не ломают доступность.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/file-upload/border/default` | Component token | `border/default` |
| `$collections/components/$modes/Mode 1/file-upload/border/hover` | Component token | `border/hover` |
| `$collections/components/$modes/Mode 1/file-upload/border/drag` | Component token | `status/info/border` |
| `$collections/components/$modes/Mode 1/file-upload/border/error` | Component token | `status/danger/border` |
| `$collections/components/$modes/Mode 1/file-upload/border/disabled` | Component token | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/file-upload/surface/drag` | Component token | `status/info/surface` |
| `$collections/components/$modes/Mode 1/file-upload/surface/default` | Component token | `surface/base` |
| `$collections/components/$modes/Mode 1/file-upload/surface/hover` | Component token | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/file-upload/surface/error` | Component token | `color/red/15` |
| `$collections/components/$modes/Mode 1/file-upload/surface/disabled` | Component token | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/file-upload/icon/default` | Component token | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/file-upload/icon/drag` | Component token | `icon/on-brand/primary` |
| `$collections/components/$modes/Mode 1/file-upload/icon/error` | Component token | `status/danger/icon` |
| `$collections/components/$modes/Mode 1/file-upload/icon/disabled` | Component token | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/file-upload/foreground/default` | Component token | `text/secondary` |
| `$collections/components/$modes/Mode 1/file-upload/foreground/title` | Component token | `text/primary` |
| `$collections/components/$modes/Mode 1/file-upload/foreground/error` | Component token | `status/danger/text` |
| `$collections/components/$modes/Mode 1/file-upload/foreground/disabled` | Component token | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/file-upload/foreground/drag` | Component token | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/file-upload/progress/fill` | Component token | `container/brand/default` |
| `$collections/components/$modes/Mode 1/file-upload/progress/track` | Component token | `container/neutral/default` |
| `$collections/components/$modes/Mode 1/file-upload/status/success` | Component token | `status/success/surface` |
| `$collections/components/$modes/Mode 1/file-upload/status/error` | Component token | `status/danger/surface` |
| `$collections/components/$modes/Mode 1/file-upload/focus/ring` | Component token | `focus/ring` |

### Token gaps

- Если нужного component token нет в таблице, используйте semantic token только с явной пометкой `Token gap`.
- Не создавайте локальные color, spacing, radius, shadow или motion values без system review.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Variant/type | `type` / `variant` | Маппится на Figma variant property, если он есть. |
| Size | `size` | Использует documented size options. |
| State | `state` или derived state | Не должен конфликтовать с controlled props. |
| Value | `value` / `checked` / `selected` / `open` | Controlled или uncontrolled contract описывается явно. |
| Label | `label` / `ariaLabel` | Не заменяется placeholder. |
| Error | `error` / `errorText` | Error state сопровождается текстом. |
| Disabled | `disabled` | Не скрывает причину ограничения. |

### Contract rules

- Props должны соответствовать documented variants и states.
- Unsupported requirements помечаются как `Needs system review`.
- Нельзя добавлять arbitrary visual props, если их нет в token/design contract.

---

## 10. Handoff notes

В handoff нужно передать:

- Figma component и node id: `6661:46`;
- используемые variants и boolean properties;
- state matrix и owner каждого состояния;
- content, labels, helper/error texts и empty/loading behavior;
- token mapping и token gaps;
- keyboard, focus и screen reader behavior;
- responsive/mobile adaptation;
- acceptance criteria для реализации и QA.

### Acceptance criteria

- Компонент использует только documented Figma variants и реальные tokens.
- Все states имеют понятный owner и не конфликтуют с parent flow.
- Accessibility requirements покрыты для keyboard, focus, labels и errors.
- Handoff содержит props contract и token gaps.
- AI-generated output не добавляет неподтвержденные variants, props или token names.

---

## 11. AI usage rules

- AI может использовать только documented variants, states, props и реальные component tokens.
- AI должен сверять `tokens.json` до написания или изменения Design Tokens.
- AI должен проверять, не нужен ли вместо текущего компонента другой системный паттерн.
- AI не должен придумывать token names, visual values, props или Figma variants.
- AI должен помечать missing token, missing state, unclear owner, accessibility gap и unsupported behavior как `Needs system review`.
- AI может подготовить draft copy, code mapping, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Сценарий использует documented variant. | Сохраняется связь Figma, spec, code и handoff. |
| Компонент передает ошибку текстом. | Error state доступен не только визуально. |
| Responsive adaptation описана явно. | Разработчик понимает collapse, перенос или mobile behavior. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Нужен variant, которого нет в Figma. | Требуется system review и обновление component set. |
| Используются raw colors или custom spacing. | Нарушается token contract. |
| AI добавляет новый prop без spec. | Нет согласования design/code/handoff. |

---

## 13. Anti-patterns

- Использовать компонент как generic container без его системного назначения.
- Считать documented state только визуальным слоем.
- Прятать обязательный label, error или instruction в Tooltip.
- Добавлять неподтвержденные variants, props или token paths.
- Передавать handoff без keyboard и accessibility behavior.
