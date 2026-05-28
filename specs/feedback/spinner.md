# Spinner / Loader

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `motion.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Spinner — индикатор неопределенной загрузки. Он сообщает, что операция выполняется, но не показывает точный прогресс или оставшееся время.

В SEDA AI Spinner используется как короткий feedback pattern для async-сценариев. Если команда знает процент выполнения, этапы или примерную длительность, нужно использовать `Progress Bar`, `Stepper` или текстовый статус вместо бесконечного вращения.

### Когда использовать

Используйте Spinner, когда:

- операция короткая и ее длительность заранее неизвестна;
- нужно показать загрузку внутри кнопки, компактного блока или inline-сценария;
- контент появится быстрее, чем имеет смысл строить Skeleton;
- действие уже запущено и пользователь должен увидеть, что система работает.

### Не используйте

Не используйте Spinner, когда:

- известен процент выполнения — используйте [Progress Bar](../specs/feedback/progress-bar.md);
- загружается структурированный контент страницы — используйте [Skeleton](../specs/feedback/skeleton.md);
- операция длится долго и требует объяснения — добавьте текстовый статус или этапы;
- нужно заменить disabled/loading state родительского `Button`;
- анимация может быть отключена, но альтернативное состояние не описано.

### Основные принципы

- **Short wait only** — Spinner подходит для короткого ожидания, а не для неопределенного зависания.
- **Context close to action** — размещайте Spinner рядом с действием или областью, которая загружается.
- **Parent owns blocking** — если Spinner внутри Button, именно Button управляет `loading`, `disabled` и focus behavior.
- **Motion has fallback** — при `prefers-reduced-motion` нужно показать статичный индикатор или текстовый статус.
- **AI drafts, system governs** — AI может предложить placement и states, но не должен заменять правила loading feedback.

### Связанные спецификации

- [Progress Bar](../specs/feedback/progress-bar.md) — для определенного прогресса.
- [Skeleton](../specs/feedback/skeleton.md) — для первичной загрузки контентной структуры.
- [Button](../specs/actions/button.md) — для loading state внутри действия.
- [Empty State](../specs/feedback/empty-state.md) — для состояния после завершения загрузки без данных.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `track` | Да | Базовая круговая дорожка или фон индикатора. |
| `fill` | Да | Активная часть индикатора, которая анимируется. |
| `label` | Условно | Видимый или screen-reader текст загрузки. |
| `container` | Условно | Область размещения для overlay или centered placement. |

### Правила анатомии

- Spinner не содержит интерактивных элементов и не получает focus.
- Видимый label нужен, если ожидание длится заметно или контекст неочевиден.
- Для icon-only spinner нужен accessible label на контейнере.
- Overlay-вариант не должен скрывать причину загрузки, если операция может занять больше нескольких секунд.

---

## 3. Types / Variants / Варианты

| Вариант | Когда использовать | Правило |
|---|---|---|
| `circular` | Основной spinner для короткой неопределенной загрузки. | Default. |
| `inline` | Внутри строки, небольшого блока или рядом с текстом. | Не должен ломать line-height. |
| `button` | Внутри Button в `loading` state. | Button управляет disabled и label. |
| `overlay` | Поверх области, которая временно недоступна. | Нужен явный blocking state у контейнера. |

### Тональные варианты

| Tone | Когда использовать | Token mapping |
|---|---|---|
| `brand` | Основной loading feedback на обычной поверхности. | `spinner/fill/default` |
| `neutral` | Вторичный или менее заметный loading feedback. | `spinner/fill/neutral` |
| `inverse` | На inverse или темной поверхности. | `spinner/fill/inverse` |
| `disabled` | В disabled/loading контексте. | `spinner/fill/disabled` |

---

## 4. Sizes / Размеры

| Size | Диаметр | Stroke | Контекст |
|---|---:|---:|---|
| `small` | 16px | 2px | Button, inline, плотные панели. |
| `medium` | 24px | 2.5px | Блоки и формы, default. |
| `large` | 40px | 3px | Пустая область или page-level loading. |

Размер Spinner должен быть стабильным: появление и скрытие индикатора не должно менять высоту строки, кнопки или контейнера.

---

## 5. States / Состояния

| Состояние | Когда возникает | Правило |
|---|---|---|
| `loading` | Операция выполняется. | Spinner видим и получает accessible status через контейнер. |
| `inline` | Загрузка относится к короткому фрагменту UI. | Не блокирует соседние элементы без причины. |
| `button-loading` | Загрузка запущена действием Button. | Button сохраняет понятный label или доступное имя. |
| `overlay-loading` | Блок временно недоступен. | Контейнер управляет `aria-busy` и pointer behavior. |
| `reduced-motion` | Пользователь отключил motion. | Анимация заменяется статичным индикатором или текстом. |

### Недопустимые состояния

| Сценарий | Почему нельзя |
|---|---|
| Spinner получает keyboard focus. | Это не интерактивный элемент. |
| Spinner используется как единственный label кнопки без accessible name. | Screen reader не узнает действие. |
| Spinner бесконечно заменяет ошибку загрузки. | Пользователь не получает результата и пути восстановления. |

---

## 6. Behavior / Поведение

### Появление и скрытие

- Spinner появляется только после запуска реальной операции.
- Если операция завершается мгновенно, Spinner можно не показывать, чтобы избежать flicker.
- Если ожидание становится долгим, добавьте текстовый статус, retry или Progress Bar.
- После завершения операции Spinner удаляется или заменяется результатом, ошибкой или empty state.

### Motion

- Анимация должна быть равномерной и не отвлекать от основного интерфейса.
- Скорость и easing берутся из motion foundation, если они определены для loading.
- При `prefers-reduced-motion: reduce` бесконечное вращение отключается.
- Reduced-motion fallback должен оставаться понятным: статичный индикатор плюс текст, если контекст неочевиден.

### Blocking behavior

- Inline Spinner не блокирует соседний UI.
- Button Spinner блокирует повторный submit через состояние родительской кнопки.
- Overlay Spinner может блокировать область, но не должен блокировать весь экран без явной причины.
- Если загрузка завершилась ошибкой, Spinner заменяется error state или Toast, а не остается на экране.

---

## 7. Accessibility

| Элемент | Атрибут | Когда |
|---|---|---|
| Контейнер загрузки | `role="status"` | Когда Spinner сообщает о динамическом статусе. |
| Загружаемая область | `aria-busy="true"` | Когда конкретный регион обновляется. |
| Spinner без видимого текста | `aria-label` | Когда нет отдельного label. |
| Динамический статус | `aria-live="polite"` | Когда появление статуса должно быть объявлено. |

### Accessibility checklist

- [ ] Spinner не получает focus.
- [ ] У loading state есть понятное accessible name.
- [ ] Родительская область использует `aria-busy`, если загружается конкретный регион.
- [ ] Button в loading state сохраняет понятный label.
- [ ] При reduced motion есть статичный или текстовый fallback.
- [ ] Долгая загрузка не остается без объяснения, retry или error handling.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Spinner доступны component tokens в namespace `spinner`.

| Component token | Роль | Semantic token |
|---|---|---|
| `spinner/track/default` | Цвет дорожки на обычной поверхности. | `container/neutral/default` |
| `spinner/track/inverse` | Цвет дорожки на inverse surface. | `container/inverse/default` |
| `spinner/fill/default` | Активная часть brand spinner. | `icon/brand` |
| `spinner/fill/neutral` | Активная часть neutral spinner. | `icon/secondary` |
| `spinner/fill/inverse` | Активная часть на inverse surface. | `icon/inverse` |
| `spinner/fill/disabled` | Активная часть в disabled/loading контексте. | `status/disabled/icon` |

Token gap: отдельные component tokens для diameter, stroke и motion duration пока не выделены. До появления таких tokens размеры и motion должны ссылаться на foundation rules, а не на произвольные значения в реализации.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Размер | `size` | `small`, `medium`, `large`. |
| Tone | `tone` | `brand`, `neutral`, `inverse`, `disabled`. |
| Accessible label | `ariaLabel` или `label` | Обязателен, если нет видимого текста. |
| Overlay | `overlay` | Используется только с blocking region. |
| Reduced motion | CSS/media behavior | Не должен требовать отдельного prop. |

### Контракт с родителем

- Spinner не управляет async-состоянием самостоятельно.
- Родительский компонент передает состояние загрузки и решает, блокировать ли действие.
- В Button loading state Spinner не должен заменять accessible name действия.
- В overlay state контейнер отвечает за `aria-busy`, pointer behavior и восстановление focus.

---

## 10. Handoff notes

Handoff для Spinner должен фиксировать:

- где отображается Spinner: inline, button, overlay или page-level;
- какой элемент владеет loading state;
- нужен ли visible label или достаточно accessible label;
- что происходит при success, error и empty result;
- есть ли reduced-motion fallback;
- какой tone и size используются;
- блокируется ли область, и как это отражено в accessibility.

---

## 11. Acceptance criteria

- [ ] Spinner используется только для неопределенной загрузки.
- [ ] Для определенного прогресса используется Progress Bar.
- [ ] В Button loading state родительский Button сохраняет accessible name.
- [ ] Overlay loading не блокирует весь экран без причины.
- [ ] Reduced-motion fallback описан и реализуем.
- [ ] Используются только documented `size` и `tone`.
- [ ] Token mapping соответствует documented Spinner component tokens из `tokens.json`.
- [ ] После ошибки Spinner заменяется error feedback.

---

## 12. AI usage rules

AI может:

- предложить placement Spinner относительно загружаемой области;
- подготовить loading state matrix для parent component;
- проверить, не нужен ли вместо Spinner Skeleton или Progress Bar;
- написать handoff notes и acceptance criteria.

AI не должен:

- использовать Spinner как универсальный ответ на любую неопределенность;
- добавлять новые sizes, tones или token paths без явной пометки `Token gap`;
- скрывать долгую загрузку без текста, retry или error state;
- заменять human review accessibility-поведения для Button, overlay и reduced motion.

Если контекст загрузки неясен, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Spinner внутри Button после submit. | Действие уже запущено, Button владеет loading state. |
| Inline Spinner рядом с названием виджета. | Загрузка относится к конкретной области. |
| Overlay Spinner на карточке с `aria-busy`. | Блокируется только обновляемая область. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Spinner на весь экран. | Нужен ли Skeleton, Progress Bar или текстовый статус. |
| Spinner показывается больше нескольких секунд. | Есть ли retry, этапы или сообщение о задержке. |
| Spinner без label. | Понятен ли loading state screen reader пользователю. |

---

## 14. Anti-patterns

- Использовать Spinner для загрузки целой страницы, где нужен Skeleton.
- Показывать Spinner бесконечно после ошибки.
- Оставлять Button без accessible name в loading state.
- Блокировать весь интерфейс из-за локальной операции.
- Добавлять произвольные colors вместо documented Spinner component tokens.
- Использовать motion без reduced-motion fallback.
