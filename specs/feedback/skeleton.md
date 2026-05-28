# Skeleton

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Skeleton state animation](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1174-1028)

---

## 1. Key Principles

### Что это

Skeleton — feedback-компонент для первичной загрузки интерфейса, когда структура будущего контента известна заранее. Он повторяет форму будущего содержимого до готовности данных и помогает избежать ощущения пустого или сломанного экрана.

В SEDA AI Skeleton описывает loading structure contract: какую область он замещает, какую композицию повторяет, как анимируется, чем заменяется после загрузки, какие токены использует и как ведет себя при reduced motion. Skeleton не является декоративной заглушкой и не должен скрывать неизвестный, ошибочный или уже пустой результат.

### Когда использовать

- Структура будущего контента известна: карточки, строки списка, таблица, профиль, форма или dashboard-блок.
- Нужно сохранить layout до прихода данных.
- Загружается повторяемый набор элементов с предсказуемой композицией.
- Пользователь уже находится в нужном контексте, и важно показать, что именно загружается.
- Требуется заменить loading state на контент, Empty State или error state без layout shift.

### Когда не использовать

- Для операций короче примерно 300 ms, если Skeleton создаст flicker.
- Для неизвестной структуры — используйте [Spinner](spinner.md) или текстовый loading state.
- Для известного процента выполнения — используйте [Progress Bar](progress-bar.md).
- Для результата без данных — используйте [Empty State](empty-state.md).
- Для ошибки загрузки — используйте [Alert](alert.md), Toast или контекстный error state.
- Для имитации реальных данных, графиков или метрик.

### Ключевые принципы

- **Shape before decoration** — Skeleton повторяет будущую форму, а не рисует абстрактные полосы.
- **Stable layout** — замена Skeleton на контент не должна вызывать заметный layout shift.
- **Short-lived state** — Skeleton исчезает сразу после готовности данных или перехода в empty/error state.
- **Motion is optional** — анимация поддерживает ожидание, но должна иметь reduced-motion fallback.
- **No fake content** — Skeleton не содержит настоящие label, row values или chart values.
- **AI assists, system governs** — AI может предложить структуру Skeleton, но не придумывает токены и не заменяет проверку человеком.

### Связанные спецификации

- [Spinner](spinner.md) — неизвестная структура или короткое ожидание.
- [Progress Bar](progress-bar.md) — измеримый прогресс.
- [Empty State](empty-state.md) — результат без данных.
- [Alert](alert.md) — ошибка или критичный feedback.
- [Table](../data-display/table.md) — skeleton rows в таблицах.

---

## 2. Anatomy

Skeleton собирается из примитивов, которые повторяют будущую композицию.

```text
[circle] [text line long]
         [text line short]

[rectangle media]
[text line]
[text line short]
```

| Часть | Форма | Обязательность | Назначение |
| --- | --- | --- | --- |
| `root` | Container | да | Группа skeleton primitives в нужной области. |
| `text` | Rounded line | условно | Placeholder для title, label, description или table cell. |
| `circle` | Circle | опционально | Avatar, icon или compact media slot. |
| `rectangle` | Rectangle | опционально | Image, card media, chart area или preview. |
| `rounded` | Rounded rectangle | опционально | Button, input, card surface или control placeholder. |
| `shine` | Overlay highlight | условно | Анимационный слой для wave/shimmer эффекта. |

### Правила anatomy

- Используйте минимальное количество примитивов, достаточное для понимания структуры.
- Пропорции должны быть близки к финальному контенту.
- Skeleton primitives не должны быть фокусируемыми.
- Skeleton primitives скрываются от assistive technologies.
- Не используйте реальные текстовые labels внутри Skeleton.

---

## 3. Types / Variants

Figma component set называется `Skeleton state animation` и использует variant properties `phase` и `size`.

### Animation phase

| `phase` | Назначение | Правила |
| --- | --- | --- |
| `1` | Начальная фаза animation cycle. | Используется как базовый кадр или static fallback. |
| `2` | Переходная фаза shine/pulse. | Не должна менять layout. |
| `3` | Средняя фаза animation cycle. | Поддерживает ощущение движения. |
| `4` | Переход к завершению цикла. | Не меняет размеры примитивов. |
| `5` | Завершающая фаза цикла. | Возвращает animation к началу. |

### Composition patterns

Это code/demo patterns, а не Figma variants.

| Pattern | Назначение | Правила |
| --- | --- | --- |
| `text` | Несколько строк текста. | Последняя строка обычно короче. |
| `avatar-row` | Avatar + text lines. | User list, comment row, profile header. |
| `card` | Media block + title/details. | Card grid или dashboard tile. |
| `list` | Повторяющиеся строки. | Row height близок к финальному элементу. |
| `table` | Placeholder rows в таблице. | Header сохраняется, если он уже известен. |
| `form` | Label/input placeholders. | Только если поля заранее известны. |
| `chart` | Placeholder для области графика. | Не имитирует реальные значения. |

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Compact rows, metadata, dense lists. | Минимальная высота и короткие text lines. |
| `m` | Default для большинства loading areas. | Подходит для list/card/form placeholders. |
| `l` | Крупные cards, profile headers, media blocks. | Используйте для заметных content areas. |
| `xl` | Большие sections, hero-like content blocks, dashboard panels. | Не превращать в декоративную заглушку. |

### Правила размеров

- Размер задает scale примитивов, но финальные width/height зависят от контекста.
- Используйте размеры финального компонента, если они известны.
- Повторяющиеся строки Skeleton должны совпадать с будущей row height.
- Если точная ширина текста неизвестна, варьируйте text lines реалистично, а не делайте все на 100%.
- Не создавайте новые size tokens без system review.

---

## 5. States

Skeleton описывает только loading state для известной структуры.

| State | Значение | Поведение |
| --- | --- | --- |
| `loading` | Данные загружаются или подготавливаются. | Skeleton видим. |
| `reduced-motion` | Пользователь предпочитает меньше motion. | Animation отключена или сведена к static phase. |
| `resolved` | Данные готовы. | Skeleton заменяется финальным контентом. |
| `empty` | Запрос завершился без данных. | Skeleton заменяется Empty State. |
| `error` | Запрос завершился ошибкой. | Skeleton заменяется error pattern. |

### Unsupported states

Skeleton не получает `hover`, `focus`, `active`, `selected`, `checked`, `disabled` или `read-only`. Эти состояния принадлежат финальному компоненту, который заменяет Skeleton.

---

## 6. Behavior

### Display timing

- Не показывайте Skeleton мгновенно для очень коротких операций, если это создает flicker.
- Показывайте Skeleton после короткой задержки, если загрузка предсказуемо заметна.
- Skeleton и финальный контент занимают одну и ту же layout area.
- Skeleton исчезает, когда доступен content, Empty State или error state.

### Layout behavior

- Зарезервируйте пространство финального контента до прихода данных.
- Сохраняйте стабильные grid, list, table и card dimensions.
- Не скрывайте известные persistent controls, если они уже доступны: table header, filters, toolbar.
- Не показывайте fake data или псевдографики с реальными значениями.

### Motion behavior

- `phase=1..5` описывает visual animation cycle.
- `shine` использует `skeleton/shine/default`.
- Reduced motion использует static state или animation `none`.
- Motion не должен быть единственным сигналом загрузки.

### Replacement behavior

- `resolved` заменяет Skeleton финальным контентом без заметного layout shift.
- `empty` заменяет Skeleton на Empty State.
- `error` заменяет Skeleton на Alert, Toast или контекстный retry state.
- Если loading длится слишком долго, добавьте текстовый статус или retry, а не бесконечный Skeleton без объяснения.

---

## 7. Accessibility

Skeleton следует [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Busy region | Используйте `aria-busy="true"` на области загрузки, если это помогает понять состояние. |
| Decorative primitives | Skeleton primitives получают `aria-hidden="true"`. |
| Status text | Если ожидание важно, добавьте доступный loading status вне декоративных примитивов. |
| Reduced motion | Уважайте `prefers-reduced-motion: reduce`. |
| Focus | Не переносите focus на Skeleton. |
| Fake content | Не раскрывайте screen reader фальшивые headings, rows, labels или values. |

### Accessibility checklist

- [ ] Skeleton primitives скрыты от assistive technologies.
- [ ] Loading region сообщает busy state, если это нужно.
- [ ] Focus остается на текущей задаче или trigger.
- [ ] Reduced motion отключает shimmer/wave animation.
- [ ] Replacement не переносит focus неожиданно.
- [ ] Empty и error outcomes заменяют Skeleton содержательными состояниями.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Surface default | `skeleton/surface/default` | Базовая поверхность placeholder. | `status/disabled/container` |
| Surface subtle | `skeleton/surface/subtle` | Более мягкая поверхность placeholder. | `surface/subtle` |
| Shine default | `skeleton/shine/default` | Блик wave/shimmer animation. | `surface/base` |

### Token gaps

- Нет component tokens для radius, spacing, primitive height, line width и animation duration.
- Нет отдельных tokens для `phase=1..5`; фазы описывают animation state, а не новые цвета.
- Для размеров используйте Figma `size=s/m/l/xl` и foundation spacing/radius/typography mapping.
- Не создавайте token names для отдельных Skeleton primitives без system review.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Phase | `phase` | `1`, `2`, `3`, `4`, `5` для animation cycle, если нужно синхронизировать с Figma. |
| Animation | `animation` | `pulse`, `wave`, `none`; маппится на implementation, не на Figma variant. |
| Pattern | `pattern` | `text`, `avatar-row`, `card`, `list`, `table`, `form`, `chart`. |
| Lines | `lines` | Количество text primitives. |
| Shape | `shape` | `text`, `circle`, `rectangle`, `rounded` для primitive API. |
| Width | `width` | Token, percentage или container-derived value. |
| Height | `height` | Token или container-derived value. |
| Aria hidden | `aria-hidden` | `true` для декоративных primitives. |

### Contract rules

- Skeleton API описывает структуру, а не fake content.
- `size` должен соответствовать Figma variants.
- Pattern APIs должны маппиться на documented compositions.
- Не передавайте arbitrary color props.
- Не создавайте focusable Skeleton primitives.
- Не оставляйте Skeleton после завершения request.

---

## 10. Handoff notes

В handoff нужно передать:

- loading trigger condition;
- ожидаемый финальный компонент или content pattern;
- Skeleton pattern и primitive structure;
- `size` и, если важно, `phase`/animation behavior;
- reduced-motion behavior;
- replacement outcome: content, Empty State или error state;
- layout constraints, которые должны оставаться стабильными;
- какие persistent controls остаются видимыми;
- token mapping для surface и shine;
- token gaps для size, radius, spacing и motion.

### Acceptance criteria

- Skeleton появляется только во время загрузки известной структуры.
- Skeleton structure соответствует ожидаемому финальному контенту.
- Замена на финальный контент не создает заметный layout shift.
- Reduced motion отключает shimmer или pulse animation.
- Skeleton primitives не объявляются как реальный контент.
- Empty и error outcomes не оставляют Skeleton видимым.
- Surface и shine используют documented component tokens.

---

## 11. AI usage rules

- AI может использовать Skeleton только для loading of known content structure.
- AI должен рекомендовать Spinner, если структура неизвестна.
- AI должен рекомендовать Progress Bar, если progress измерим.
- AI должен рекомендовать Empty State, когда loading завершился без данных.
- AI не должен придумывать fake labels, fake rows, chart values, token names или новые Figma variants.
- AI должен сверять `tokens.json` перед изменением Skeleton token mapping.
- AI должен помечать missing loading trigger, missing replacement state, missing reduced-motion behavior или layout shift risk как `Needs system review`.
- AI может подготовить Skeleton structure и handoff notes, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Загружается список пользователей. | `pattern=avatar-row`, повторить ожидаемые видимые строки, `size=m`. |
| Загружается card grid. | `pattern=card`, media rectangle и 2-3 text lines. |
| Загружается table body. | Сохранить известный header, заменить body на row-shaped placeholders. |
| Загружается profile header. | Circle + title/subtitle text lines, без fake имени. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Skeleton показан после завершения запроса без данных. | Нужен Empty State. |
| Shimmer работает при reduced motion. | Accessibility issue. |
| Placeholder rows сильно выше финальных rows. | Риск layout shift. |
| Chart skeleton показывает похожие на реальные значения bars. | Вводит пользователя в заблуждение. |

---

## 13. Anti-patterns

- Использовать Skeleton для любой async-операции по умолчанию.
- Показывать Skeleton для короткого действия, которое завершается без видимого loading.
- Делать все text lines одинаковой полной ширины.
- Раскрывать Skeleton primitives screen reader как реальный контент.
- Оставлять Skeleton после error или empty result.
- Создавать одноразовые Skeleton colors вне component tokens.
- Использовать Skeleton, чтобы скрыть медленное взаимодействие, которое нужно оптимизировать.
