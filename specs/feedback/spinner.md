# Spinner / Loader

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Spinner](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6647-38)

---

## 1. Key Principles

### Что это

Spinner — индикатор неопределенной загрузки. Он сообщает, что операция выполняется, но не показывает точный прогресс, оставшееся время или будущую структуру контента.

В SEDA AI Spinner описывает short async feedback contract: где появляется индикатор, какой элемент владеет loading state, какой доступный текст нужен, чем Spinner заменяется после завершения операции и какие token mappings используются. Spinner не является универсальной заглушкой для любого ожидания.

### Когда использовать

- Операция короткая, а длительность заранее неизвестна.
- Нужно показать loading внутри Button, compact block или inline-сценария.
- Контент появится быстрее, чем имеет смысл строить Skeleton.
- Пользователь уже запустил действие и должен видеть, что система работает.
- Загрузка относится к конкретной области, а не ко всей странице.

### Когда не использовать

- Известен процент выполнения — используйте [Progress Bar](progress-bar.md).
- Загружается известная структура страницы или списка — используйте [Skeleton](skeleton.md).
- Загрузка завершилась без данных — используйте [Empty State](empty-state.md).
- Операция длится долго и требует объяснения — добавьте текстовый статус, этапы, retry или Progress Bar.
- Нужно заменить loading state родительского Button — Button должен владеть состоянием, Spinner только отображается внутри него.
- Нет reduced-motion fallback.

### Ключевые принципы

- **Short wait only** — Spinner подходит для короткого ожидания, а не для неопределенного зависания.
- **Context close to action** — размещайте Spinner рядом с действием или областью, которая загружается.
- **Parent owns blocking** — Button, section или page region управляет loading, disabled, busy и focus behavior.
- **Motion has fallback** — при `prefers-reduced-motion` нужен статичный или текстовый fallback.
- **Result replaces loading** — после завершения Spinner заменяется результатом, error state или Empty State.
- **AI assists, system governs** — AI может предложить placement и handoff, но не придумывает variants, sizes и tokens.

### Связанные спецификации

- [Progress Bar](progress-bar.md) — измеримый прогресс.
- [Skeleton](skeleton.md) — загрузка известной структуры.
- [Empty State](empty-state.md) — результат без данных.
- [Button](../actions/button.md) — loading state действия.
- [Alert](alert.md) — ошибка загрузки или retry feedback.

---

## 2. Anatomy

```text
[track]
   [animated fill]

Optional label: Loading...
```

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `track` | да | Базовая круговая дорожка или фон индикатора. |
| `fill` | да | Активная часть индикатора, которая анимируется. |
| `label` | условно | Видимый или screen-reader текст загрузки. |
| `container` | условно | Область размещения для inline, button или overlay сценария. |

### Правила anatomy

- Spinner не содержит интерактивных элементов и не получает focus.
- Видимый label нужен, если ожидание заметное или контекст неочевиден.
- Icon-only Spinner требует accessible label на контейнере или родительском регионе.
- Overlay Spinner не должен скрывать причину загрузки, если операция может занять больше нескольких секунд.
- Spinner внутри Button не заменяет accessible name кнопки.

---

## 3. Types / Variants

Figma component set использует variant property `variant`.

| `variant` | Назначение | Token mapping |
| --- | --- | --- |
| `default` | Основной loading feedback на обычной поверхности. | `spinner/fill/default`, `spinner/track/default` |
| `neutral` | Вторичный или менее заметный loading feedback. | `spinner/fill/neutral`, `spinner/track/default` |
| `inverse` | Loading feedback на inverse или темной поверхности. | `spinner/fill/inverse`, `spinner/track/inverse` |
| `disabled` | Loading/disabled контекст, где активное действие недоступно. | `spinner/fill/disabled`, `spinner/track/default` |

### Usage variants

Это usage patterns, а не Figma variants.

| Pattern | Когда использовать | Правило |
| --- | --- | --- |
| `inline` | В строке, compact block или рядом с текстом. | Не должен ломать line-height. |
| `button` | Внутри Button loading state. | Button владеет disabled, label и submit lock. |
| `overlay` | Поверх обновляемой области. | Блокирует только конкретный region и задает `aria-busy`. |
| `page-local` | В небольшом пустом участке страницы. | Проверить, не нужен ли Skeleton или текстовый статус. |

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Button, inline, dense row, compact panel. | Не меняет высоту строки или кнопки. |
| `m` | Default для блоков и форм. | Используется в большинстве локальных loading states. |
| `l` | Заметная загрузка внутри section. | Добавляйте label, если контекст неочевиден. |
| `xl` | Page-local или крупная область. | Проверить, не нужен ли Skeleton, Progress Bar или текстовый статус. |

### Правила размеров

- Размер Spinner должен быть стабильным: появление и скрытие не меняют высоту строки, кнопки или контейнера.
- Не используйте custom diameter и stroke без system review.
- В Button используйте размер, совместимый с size кнопки.
- `xl` не должен становиться заменой полноценного loading pattern для всей страницы.

---

## 5. States

| State | Когда возникает | Поведение |
| --- | --- | --- |
| `loading` | Операция выполняется. | Spinner видим; родительский region или control владеет состоянием. |
| `button-loading` | Операция запущена Button. | Button блокирует повторный submit и сохраняет accessible name. |
| `overlay-loading` | Обновляется конкретная область. | Region использует `aria-busy`; pointer behavior задает родитель. |
| `reduced-motion` | Пользователь предпочитает меньше motion. | Вращение отключается или заменяется статичным/текстовым fallback. |
| `resolved` | Операция завершена. | Spinner заменяется результатом, Empty State или error state. |

### Unsupported states

Spinner не получает `hover`, `focus`, `active`, `selected`, `checked` или самостоятельный `disabled` behavior. Эти состояния принадлежат родительскому Button, region или control.

---

## 6. Behavior

### Появление и скрытие

- Spinner появляется только после запуска реальной операции.
- Для мгновенных операций Spinner можно не показывать, чтобы избежать flicker.
- Если ожидание становится долгим, добавьте текстовый статус, retry, этапы или Progress Bar.
- После завершения операции Spinner удаляется или заменяется результатом, error state или Empty State.

### Motion

- Анимация должна быть равномерной и не отвлекать от основного интерфейса.
- Motion duration и easing берутся из foundation motion rules, если они определены для loading.
- При `prefers-reduced-motion: reduce` бесконечное вращение отключается.
- Reduced-motion fallback должен оставаться понятным: статичный индикатор плюс текст, если контекст неочевиден.

### Blocking behavior

- Inline Spinner не блокирует соседний UI без причины.
- Button Spinner блокирует повторный submit через состояние родительской кнопки.
- Overlay Spinner может блокировать конкретный region, но не весь экран без явной причины.
- Если загрузка завершилась ошибкой, Spinner заменяется error feedback, а не остается бесконечно.

---

## 7. Accessibility

Spinner следует [foundation/accessibility.md](../foundation/accessibility.md).

| Элемент | Атрибут | Когда |
| --- | --- | --- |
| Loading container | `role="status"` | Когда Spinner сообщает о динамическом статусе. |
| Loading region | `aria-busy="true"` | Когда обновляется конкретный region. |
| Icon-only Spinner | `aria-label` | Если нет отдельного visible label. |
| Dynamic status | `aria-live="polite"` | Когда появление статуса должно быть объявлено. |
| Decorative spinner | `aria-hidden="true"` | Когда status уже описан родителем. |

### Accessibility checklist

- [ ] Spinner не получает focus.
- [ ] Loading state имеет понятное accessible name.
- [ ] Родительская область использует `aria-busy`, если загружается конкретный region.
- [ ] Button в loading state сохраняет понятный label.
- [ ] Reduced motion имеет статичный или текстовый fallback.
- [ ] Долгая загрузка не остается без объяснения, retry или error handling.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Track default | `spinner/track/default` | Дорожка на обычной поверхности. | `container/neutral/default` |
| Track inverse | `spinner/track/inverse` | Дорожка на inverse surface. | `container/inverse/default` |
| Fill default | `spinner/fill/default` | Активная часть default variant. | `icon/brand` |
| Fill neutral | `spinner/fill/neutral` | Активная часть neutral variant. | `icon/secondary` |
| Fill inverse | `spinner/fill/inverse` | Активная часть на inverse surface. | `icon/inverse` |
| Fill disabled | `spinner/fill/disabled` | Активная часть в disabled/loading context. | `status/disabled/icon` |

### Token gaps

- Нет component tokens для diameter, stroke width, animation duration и easing.
- Нет отдельного track token для `variant=neutral` и `variant=disabled`; используется `spinner/track/default`.
- Не создавайте локальные colors, stroke widths или motion values без system review.
- Размеры должны маппиться на Figma `size=s/m/l/xl` и foundation sizing rules.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Variant | `variant` | `default`, `neutral`, `inverse`, `disabled`. |
| Accessible label | `ariaLabel` / `label` | Обязателен, если нет visible status text. |
| Usage pattern | `placement` | `inline`, `button`, `overlay`, `page-local`. |
| Overlay | `overlay` | Используется только для loading region. |
| Reduced motion | CSS/media behavior | Не требует отдельного prop, но должен быть реализован. |

### Contract rules

- Spinner не управляет async state самостоятельно.
- Родительский компонент передает loading state и решает, блокировать ли действие.
- В Button loading state Spinner не заменяет accessible name действия.
- В overlay state container отвечает за `aria-busy`, pointer behavior и focus preservation.
- Не добавляйте arbitrary color, stroke или speed props.

---

## 10. Handoff notes

В handoff нужно передать:

- где отображается Spinner: inline, button, overlay или page-local;
- какой элемент владеет loading state;
- `size` и `variant`;
- нужен ли visible label или достаточно accessible label;
- что происходит при success, error и empty result;
- reduced-motion fallback;
- блокируется ли область, и как это отражено в accessibility;
- token mapping для track и fill;
- token gaps для diameter, stroke и motion.

### Acceptance criteria

- Spinner используется только для неопределенной загрузки.
- Для измеримого прогресса используется Progress Bar.
- Для известной структуры используется Skeleton.
- Button loading state сохраняет accessible name.
- Overlay loading блокирует только описанную область.
- Reduced-motion fallback описан и реализуем.
- Используются только documented `size`, `variant` и реальные component tokens из namespace Spinner.
- После ошибки Spinner заменяется error feedback.

---

## 11. AI usage rules

- AI может использовать Spinner только для indeterminate loading.
- AI должен рекомендовать Progress Bar, если progress измерим.
- AI должен рекомендовать Skeleton, если структура будущего контента известна.
- AI должен рекомендовать Empty State, если загрузка завершилась без данных.
- AI может использовать только `variant`: `default`, `neutral`, `inverse`, `disabled`.
- AI может использовать только `size`: `s`, `m`, `l`, `xl`.
- AI не должен придумывать sizes, variants, token paths, custom colors, stroke widths или animation speed.
- AI должен помечать unclear loading owner, missing accessible label, long loading without text/retry и missing reduced-motion fallback как `Needs system review`.
- AI может подготовить placement, state matrix, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Submit внутри Button. | `placement=button`, `size=s`, Button сохраняет label и блокирует повторный submit. |
| Inline loading рядом с названием виджета. | `placement=inline`, `size=s`, visible text `Обновляем`. |
| Загрузка карточки поверх текущего content. | `placement=overlay`, `size=m`, container задает `aria-busy`. |
| Loading на темной поверхности. | `variant=inverse`, track и fill маппятся на inverse tokens. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Spinner на весь экран. | Нужен ли Skeleton, Progress Bar или текстовый статус. |
| Spinner показывается больше нескольких секунд. | Нужен статус, retry, этапы или error handling. |
| Spinner без label. | Проверить, понятен ли loading state screen reader пользователю. |
| Button содержит только Spinner. | Action теряет accessible name. |

---

## 13. Anti-patterns

- Использовать Spinner для загрузки целой страницы, где нужен Skeleton.
- Показывать Spinner бесконечно после ошибки.
- Оставлять Button без accessible name в loading state.
- Блокировать весь интерфейс из-за локальной операции.
- Добавлять произвольные colors вместо documented Spinner component tokens.
- Использовать motion без reduced-motion fallback.
