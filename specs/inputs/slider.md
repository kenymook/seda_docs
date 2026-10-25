# Slider

> **Category** · Inputs
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · Kenymook
> **Last reviewed** · 2026-10-25
> **Figma** · [Slider](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=4113-3829)

---

## React runtime — experimental

Публичный `Slider` из установленного `@seda-ai/ui` реализует horizontal single/range. [D31](../../packages/seda-contracts/SLIDER-CONTRACT.md) подключает исполняемый instance contract к общему компилятору и использует один числовой модуль в React/Node. Это расширение React-библиотеки по существующей spec; свежая Figma-сверка, target OS/AT/Firefox/WebKit и touch screen-reader review остаются открытыми. Для точного свободного числового ввода сохраняется TextField с владельцем черновика; Slider не парсит выражения, единицы CSS или Mixed.

### Исполняемый API

| Prop | Правило |
| --- | --- |
| `mode` | `single` по умолчанию либо `range`; vertical пока Needs system review |
| `label` | Обязательная непустая видимая строка |
| `value` | Обязательное конечное число в single; упорядоченная пара `[lower,upper]` в range |
| `onValueChange` | Обязательный owner callback с числом либо новой парой; библиотека не мутирует переданную пару |
| `thumbLabels` | Обязательные две непустые подписи в range; accessible name объединяет общий label и подпись бегунка |
| `min/max/step` | По умолчанию0/100/1; конечные min<max, положительный representable step, диапазон делится на шаг. Все значения лежат на сетке от min. Невалидная модель отвергается, а не молча исправляется |
| `size` | s/m/l/xl; наследуется от SedaProvider |
| `disabled` | Реальная недоступность native inputs; также действует родительский native fieldset |
| `helperText/errorText` | Общая связь aria-describedby с каждым бегунком; содержательная ошибка задаёт aria-invalid, при disabled prop скрывается |
| `formatValue(number)` | Непустой plain text для visible output и aria-valuetext, например проценты. Не меняет числовую модель |
| `name/form` | Настоящие native form inputs; range отправляет два значения под одним name в lower/upper порядке |
| `id/className/style/dir`, root HTML attributes | id single input; range input IDs имеют суффиксы -lower/-upper. Root ref указывает group. style — host escape hatch, не набор новых visual props |

Видимое output не live region: текущее значение уже доступно через native slider и aria-valuetext. Изменение props контролирует и DOM, и paint. Owner может отклонить intent; Slider не хранит альтернативное принятое значение. Controlled form reset принадлежит owner, defaultValue не добавлен.

### Поведение

- Использованы реальные input[type=range], native keyboard, form semantics и native drag thumb. Общий rail выбирает ближайший бегунок, сохраняет его на протяжении жеста и использует pointer capture; смена фокуса не переставляет inputs.
- Значения range не пересекаются. Эффективные aria-valuemin/max каждого бегунка учитывают соседний. При совпадении значений оба остаются доступны в неизменном Tab-порядке.
- Up/Down, Home/End и Page Up/Down работают нативно. В RTL шкала отражена, Left увеличивает значение, Right уменьшает; вертикальные стрелки сохраняют числовое направление.
- На границе и при declined intent DOM не уходит от controlled value. Drag/keyboard публикуют непрерывные намерения; отдельного сетевого save/undo transaction API здесь нет. Группировка изменений документа и commit/cancel принадлежат приложению.
- Pointer cancel прекращает жест, уже принятые owner значения сохраняются. Native fieldset disabled запрещает также клики по общему rail. Unmount освобождает capture нативно.
- Params scale/X/Y/radius лаборатории используют этот export и общий compiler. Range на странице «Компоненты» проходит тот же instance contract; его значения принадлежат примеру и не фильтруют вымышленные данные. Проверка геометрии измеряет rail с минимумом44px, а не выдаёт его за кнопку32px.

### Геометрия и tokens

Используются существующие slider track/thumb/focus/label/value component tokens; tokens.json не изменяется. Font/line-height, thumb icon slot, control height и дополнительный X наследуются от общих bindings. Rail имеет минимум44px по высоте; thumb минимум12px либо общий icon size. В горизонтальном направлении rail отступает на extra X, а native thumb centers и painted track совпадают.

Token gaps: track4px, thumb border2px, ring2px/offset3px, header gap8px, min targets44px/12px и круглые thumb/track пока документированные экспериментальные recipe values. Error foreground использует существующий semantic status/danger/text: отдельного slider error token нет. Это не pixel fidelity claim. Thumb остаётся круглым, глобальный radius не превращает маркер шкалы в прямоугольник.

Ориентир семантики: [WAI Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) и [WAI Multi-thumb Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/). Эти документы отдельно требуют реальной touch AT проверки; Chromium keyboard/geometry tests её не заменяют.

### Приёмка React

Проверяются installed tarball и sourceAlias=false, SSR/Strict hydration, single/range API declarations, invalid runtime models, native keys/drag, неизменный Tab-порядок, границы/совпавшие бегунки, controlled owner refusal, decimals, FormData и native disabled fieldset. Визуальная проверка Light/Dark, RTL, sizes и общего compiler inheritance обязательна. Нельзя добавлять state prop для имитации interaction или выдавать этот проход за Figma/OS/AT certification.

---

## 1. Key Principles

### Что это

Slider — контрол выбора числового значения или диапазона через непрерывную шкалу. В SEDA AI этот компонент описывается как часть AI-ready design system framework: спецификация фиксирует назначение, variants, states, props, token mapping, accessibility, handoff и правила использования AI.

AI может помогать с черновиками сценариев, текстов, acceptance criteria и handoff, но не заменяет дизайнера и разработчика. Финальное решение по поведению, доступности, токенам и соответствию продуктовой задаче остается за человеком.

### Когда использовать

Используйте Slider, когда пользователь регулирует значение в допустимом диапазоне, есть min/max/step и требуется visual feedback.

### Когда не использовать

Не используйте Slider, для отображения прогресса используйте Progress Bar; для точного ввода без шкалы используйте Text Field; не скрывайте текущее значение.

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

Figma component set: `Slider`. Variants: 40.

| Property | Default | Options |
| --- | --- | --- |
| `mode` | `single` | `single`, `range` |
| `size` | `s` | `s`, `m`, `l`, `xl` |
| `state` | `default` | `default`, `hover`, `active`, `focus`, `disabled` |

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

Если в Figma есть `size`, используйте только documented options. Размер отвечает за плотность, высоту, spacing и масштаб touch target, но не меняет назначение компонента.

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
| `$collections/components/$modes/Mode 1/slider/track/fill` | Component token | `container/brand/default` |
| `$collections/components/$modes/Mode 1/slider/track/background` | Component token | `container/neutral/default` |
| `$collections/components/$modes/Mode 1/slider/track/hover` | Component token | `container/brand/hover` |
| `$collections/components/$modes/Mode 1/slider/track/disabled` | Component token | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/slider/thumb/surface` | Component token | `surface/base` |
| `$collections/components/$modes/Mode 1/slider/thumb/border` | Component token | `border/brand/default` |
| `$collections/components/$modes/Mode 1/slider/thumb/hover` | Component token | `border/brand/hover` |
| `$collections/components/$modes/Mode 1/slider/thumb/active` | Component token | `border/brand/pressed` |
| `$collections/components/$modes/Mode 1/slider/thumb/disabled` | Component token | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/slider/focus/ring` | Component token | `focus/ring` |
| `$collections/components/$modes/Mode 1/slider/disabled/track` | Component token | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/slider/disabled/thumb` | Component token | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/slider/label/foreground` | Component token | `text/secondary` |
| `$collections/components/$modes/Mode 1/slider/label/disabled` | Component token | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/slider/value/foreground` | Component token | `text/primary` |
| `$collections/components/$modes/Mode 1/slider/value/disabled` | Component token | `status/disabled/text` |

### Token gaps

- Если нужного component token нет в таблице, используйте semantic token только с явной пометкой `Token gap`.
- Не создавайте локальные color, spacing, radius, shadow или motion values без system review.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Mode | `mode` | `single` или `range`; маппится на Figma `mode`. |
| Size | `size` | Использует `s`, `m`, `l`, `xl`. |
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

- Figma component и node id: `4113:3829`;
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
