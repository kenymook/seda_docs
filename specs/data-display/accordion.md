# Accordion

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `motion.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Accordion — набор сворачиваемых секций, где каждая секция имеет trigger и panel. Он помогает показывать вторичный или редко используемый контент без перегрузки страницы.

В SEDA AI Accordion используется как disclosure pattern. Он не должен скрывать критичную информацию, которую пользователь обязан увидеть для завершения задачи.

### Когда использовать

Используйте Accordion, когда:

- контент можно разделить на независимые секции;
- пользователю не нужно видеть все секции одновременно;
- нужно сократить длину FAQ, настроек, справки или фильтров;
- секции имеют понятные заголовки и предсказуемый порядок;
- раскрытие не меняет основной workflow неожиданно.

### Не используйте

Не используйте Accordion, когда:

- весь контент критичен и должен быть видим сразу;
- нужен переход между равнозначными views — используйте [Tabs](../specs/navigation/tabs.md);
- секция содержит длинный workflow или сложную форму;
- пользователь должен сравнивать содержимое нескольких секций одновременно;
- заголовки секций не объясняют скрытое содержимое.

### Основные принципы

- **Disclosure, not navigation** — Accordion раскрывает контент, но не заменяет navigation.
- **Clear trigger text** — заголовок должен объяснять, что находится внутри.
- **State is explicit** — expanded/collapsed отражается визуально и через `aria-expanded`.
- **Single or multiple by intent** — режим открытия задается продуктовым сценарием.
- **Motion is supportive** — анимация помогает понять раскрытие, но имеет reduced-motion fallback.
- **AI drafts, human validates** — AI может предложить структуру секций, но человек проверяет важность скрытого контента.

### Связанные спецификации

- [Tabs](../specs/navigation/tabs.md) — переключение между равнозначными views.
- [Sidebar](../specs/navigation/sidebar.md) — навигационные группы.
- [Form](../specs/overlays-layout/form.md) — группировка полей в формах.
- [Divider](../specs/data-display/divider.md) — визуальное разделение без скрытия контента.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Контейнер набора секций. |
| `item` | Да | Одна раскрываемая секция. |
| `trigger` | Да | Заголовок, который раскрывает или скрывает panel. |
| `icon` | Да | Chevron или другой индикатор expanded/collapsed. |
| `panel` | Да | Контент секции. |
| `description` | Нет | Secondary text в trigger, если нужен контекст. |
| `badge` | Нет | Count/status рядом с trigger. |

### Правила анатомии

- Вся строка trigger должна быть кликабельной.
- `panel` связан с trigger через `aria-controls`.
- `icon` не должен быть единственной интерактивной областью.
- `description` не заменяет понятный trigger title.
- Не размещайте внутри trigger сложные interactive controls без отдельного review.

---

## 3. Types / Variants / Варианты

### Interaction type

| Type | Когда использовать | Правило |
|---|---|---|
| `single` | Пользователь работает с одной секцией за раз. | Открытие новой секции закрывает предыдущую. |
| `multiple` | Пользователь может сравнивать или держать открытыми несколько секций. | Секции открываются независимо. |

### Visual variant

| Variant | Когда использовать | Правило |
|---|---|---|
| `default` | Простое раскрытие с разделителями. | Default для списков и FAQ. |
| `bordered` | Нужна явная рамка вокруг каждого item. | Не использовать как Card replacement. |
| `elevated` | Секции на сложной поверхности. | Использовать осторожно, чтобы не получить nested cards. |
| `compact` | Плотные настройки или filters. | Сохранять keyboard и touch доступность. |

---

## 4. Sizes / Размеры

| Size | Trigger height | Контекст |
|---|---:|---|
| `compact` | 32-40px | Фильтры, плотные настройки, side panels. |
| `medium` | 44-52px | Default для форм, FAQ и рабочих интерфейсов. |
| `large` | 56-64px | Разделы с description, badge или крупным контентом. |

### Правила размеров

- Trigger должен иметь достаточную hit area.
- Padding panel зависит от size, но сохраняет визуальную связь с trigger.
- Icon alignment не должен прыгать между collapsed и expanded.
- Если trigger title переносится больше чем на 2 строки, нужно пересмотреть content model.

---

## 5. States / Состояния

| Состояние | Где применяется | Правило |
|---|---|---|
| `collapsed` | Item. | Panel скрыт, `aria-expanded="false"`. |
| `expanded` | Item. | Panel видим, `aria-expanded="true"`. |
| `hover` | Trigger. | Показывает интерактивность. |
| `focus` | Trigger. | Используется focus ring. |
| `active` | Trigger. | Краткий feedback при нажатии. |
| `disabled` | Item/trigger. | Trigger не раскрывает panel. |
| `loading` | Panel. | Контент panel загружается после раскрытия. |
| `error` | Panel. | Ошибка загрузки panel не скрывается молча. |

---

## 6. Behavior / Поведение

### Open / close

- `Enter` и `Space` переключают состояние текущего trigger.
- В `single` режиме открытие нового item закрывает предыдущий, если это не запрещено настройкой.
- В `multiple` режиме каждый item управляется независимо.
- Disabled item не раскрывается и не участвует в roving focus.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Переход к следующему focusable элементу. |
| `Enter` / `Space` | Открыть или закрыть текущий item. |
| `ArrowDown` | Перейти к следующему trigger, если включен roving focus. |
| `ArrowUp` | Перейти к предыдущему trigger, если включен roving focus. |
| `Home` | Перейти к первому trigger. |
| `End` | Перейти к последнему trigger. |

### Motion

- Раскрытие и закрытие используют короткую height/opacity animation.
- При `prefers-reduced-motion: reduce` panel открывается без transition.
- Motion не должен задерживать доступность panel для screen reader.

---

## 7. Accessibility

| Элемент | Атрибут | Правило |
|---|---|---|
| Trigger | Нативный `<button>` | Предпочтительно вместо `role="button"`. |
| Trigger | `aria-expanded` | Синхронизирован с expanded state. |
| Trigger | `aria-controls` | Указывает на panel id. |
| Panel | `id` | Связан с trigger. |
| Panel | `role="region"` | Использовать, если panel имеет значимый heading/контент. |
| Icon | `aria-hidden="true"` | Если только визуальный индикатор. |

### Accessibility checklist

- [ ] Trigger является нативной кнопкой или имеет равноценную семантику.
- [ ] `aria-expanded` корректно меняется.
- [ ] Trigger и panel связаны через `aria-controls` и `id`.
- [ ] Keyboard interaction работает без мыши.
- [ ] Скрытый panel не попадает в tab order.
- [ ] Disabled item не раскрывается.
- [ ] Reduced-motion fallback описан.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Accordion доступны component tokens в namespace `accordion`.

### Trigger и panel

| Component token | Роль | Semantic token |
|---|---|---|
| `accordion/trigger/surface/default` | Фон trigger по умолчанию. | `color/transparent` |
| `accordion/trigger/surface/hover` | Фон trigger hover. | `container/neutral/hover` |
| `accordion/trigger/surface/active` | Фон trigger active. | `container/neutral/pressed` |
| `accordion/trigger/surface/disabled` | Фон disabled trigger. | `color/transparent` |
| `accordion/trigger/surface/expanded` | Фон expanded trigger. | `color/transparent` |
| `accordion/trigger/foreground/default` | Текст trigger. | `text/primary` |
| `accordion/trigger/foreground/hover` | Текст trigger hover. | `text/primary` |
| `accordion/trigger/foreground/disabled` | Текст disabled trigger. | `status/disabled/text` |
| `accordion/trigger/foreground/expanded` | Текст expanded trigger. | `text/primary` |
| `accordion/trigger/icon/default` | Иконка trigger. | `icon/tertiary` |
| `accordion/trigger/icon/hover` | Иконка hover. | `icon/secondary` |
| `accordion/trigger/icon/expanded` | Иконка expanded. | `icon/primary` |
| `accordion/trigger/icon/disabled` | Иконка disabled. | `status/disabled/icon` |
| `accordion/trigger/border/default` | Border trigger по умолчанию. | `border/subtle` |
| `accordion/trigger/border/hover` | Border trigger при hover. | `border/default` |
| `accordion/panel/surface/default` | Фон panel. | `surface/base` |
| `accordion/panel/surface/raised` | Raised panel surface. | `surface/raised` |
| `accordion/panel/surface/elevated` | Elevated panel surface. | `surface/raised` |
| `accordion/panel/border/default` | Panel border. | `border/subtle` |
| `accordion/panel/border/bordered` | Bordered panel border. | `border/default` |
| `accordion/panel/foreground/default` | Текст panel. | `text/secondary` |

### Container states

| Component token | Роль | Semantic token |
|---|---|---|
| `accordion/border/default` | Разделитель default. | `border/default` |
| `accordion/border/hover` | Разделитель hover. | `border/hover` |
| `accordion/border/bordered` | Border для bordered variant. | `border/default` |
| `accordion/border/elevated` | Border для elevated variant. | `border/subtle` |
| `accordion/border/disabled` | Disabled border. | `status/disabled/border` |
| `accordion/focus/ring` | Focus ring. | `focus/ring` |
| `accordion/disabled/foreground` | Disabled foreground. | `status/disabled/text` |
| `accordion/surface/default` | Container surface default. | `color/transparent` |
| `accordion/surface/bordered` | Container surface bordered. | `surface/base` |
| `accordion/surface/elevated` | Container surface elevated. | `surface/raised` |
| `accordion/surface/disabled` | Container surface disabled. | `color/transparent` |

Token gap: отдельные component tokens для trigger height, padding, gap, radius, chevron rotation и animation duration пока не выделены. До появления таких tokens используйте foundation spacing/motion rules.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Type | `type` | `single` или `multiple`. |
| Value | `value` | Controlled open item id(s). |
| Default value | `defaultValue` | Uncontrolled initial state. |
| Change | `onValueChange` | Вызывается при open/close. |
| Collapsible | `collapsible` | Разрешает закрыть последнюю открытую секцию в `single` mode. |
| Variant | `variant` | `default`, `bordered`, `elevated`, `compact`. |
| Size | `size` | `compact`, `medium`, `large`. |
| Disabled | `disabled` | Отключает весь Accordion или item. |
| Item disabled | `items[].disabled` | Отключает конкретную секцию. |
| Roving focus | `rovingFocus` | Включает arrow-key navigation между triggers. |
| Force mount | `forceMount` | Оставляет panel в DOM для сложного контента, если это нужно implementation. |

### Contract rules

- `type` должен быть задан явно: `single` или `multiple`.
- В `single` mode поведение последней открытой секции задается через `collapsible`.
- `value` и `defaultValue` не используются одновременно.
- `items[].id` должны быть стабильными и совпадать с `aria-controls` / panel `id`.
- `forceMount` не должен оставлять скрытый panel доступным в tab order.
- Custom spacing, borders, animation duration и chevron styles нельзя задавать raw values без token gap.

---

## 10. Handoff notes

Handoff для Accordion должен фиксировать:

- `single` или `multiple` mode;
- `collapsible` behavior для `single` mode;
- default opened sections;
- список item ids, trigger titles и panel content;
- disabled items;
- keyboard behavior и roving focus policy;
- mounted/unmounted policy для panel content;
- motion и reduced-motion fallback;
- loading/error behavior для async panel content;
- token mapping и token gaps.

---

## 11. Acceptance criteria

- [ ] Trigger text ясно описывает содержимое panel.
- [ ] `aria-expanded` и `aria-controls` работают корректно.
- [ ] `single` и `multiple` behavior соответствует product rule.
- [ ] `collapsible` behavior явно описан для `single` mode.
- [ ] Controlled и uncontrolled state не смешиваются.
- [ ] Keyboard interaction работает для всех triggers.
- [ ] Скрытый panel не содержит доступных tab stops.
- [ ] Если panel остается mounted, скрытый контент недоступен для focus и screen reader.
- [ ] Disabled item не раскрывается.
- [ ] Reduced-motion fallback описан.
- [ ] Token mapping соответствует documented Accordion component tokens из `tokens.json`.

---

## 12. AI usage rules

AI может:

- предложить группировку контента по секциям;
- проверить, не нужен ли Tabs или Sidebar вместо Accordion;
- подготовить item model, states и acceptance criteria;
- найти скрытую критичную информацию.

AI не должен:

- скрывать обязательную информацию в Accordion без причины;
- использовать Accordion как navigation pattern;
- добавлять новые token paths без `Token gap`;
- создавать trigger titles, которые не объясняют panel content;
- пропускать keyboard и reduced-motion rules.
- смешивать controlled и uncontrolled state без явного implementation rule.
- оставлять hidden panel интерактивным для клавиатуры или screen reader.

Если секция содержит сложный workflow, длинную форму или критичное предупреждение, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| FAQ с независимыми вопросами. | Контент вторичный и хорошо делится на секции. |
| Группа фильтров в side panel. | Пользователь может раскрывать нужные группы. |
| Настройки с несколькими компактными разделами. | Секции имеют ясные titles и короткий content. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Accordion внутри длинной формы. | Не скрываются ли обязательные поля. |
| Несколько секций нужно сравнивать. | Нужен ли `multiple` mode или другой layout. |
| Accordion используется как меню. | Не подходит ли Sidebar или Tabs. |

---

## 14. Anti-patterns

- Использовать Accordion для основной навигации.
- Скрывать критичную ошибку или обязательное действие внутри collapsed panel.
- Делать кликабельной только иконку, а не весь trigger.
- Использовать неописательные titles вроде "Подробнее".
- Создавать вложенные Accordion без review.
- Использовать произвольные colors и borders вместо documented Accordion component tokens.
