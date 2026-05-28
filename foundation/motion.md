# Motion

> Figma: TBD

Motion описывает движение, переходы и временную обратную связь в SEDA UI. Он помогает пользователю понять, что изменилось, где появился слой, какое действие выполняется и когда интерфейс готов к следующему шагу.

---

## Цель

Motion должен:

- объяснять изменение состояния;
- связывать действие пользователя с результатом;
- делать появление overlay и floating layers предсказуемым;
- не задерживать выполнение задачи;
- уважать `prefers-reduced-motion;
- не быть декоративным шумом в плотных B2B и AI-интерфейсах.

Правило: движение используется только там, где оно помогает понять изменение. Если состояние понятно без анимации, выбирайте статичный переход.

---

## Базовые Принципы

- **Быстро.** UI motion должен ощущаться мгновенным. Большинство переходов укладывается в 150-200ms.
- **Предсказуемо.** Элемент появляется из направления, которое соответствует его размещению: Drawer справа выезжает справа, bottom Drawer — снизу.
- **Без layout shift.** Анимация не должна менять занимаемое место соседних элементов, если это не collapse/expand pattern.
- **Смысл важнее эффекта.** Motion не должен быть единственным способом передать состояние.
- **Reduced motion обязателен.** Любая анимация имеет понятный fallback.

---

## Duration Tokens

| Токен | Значение | Использование |
|---|---:|---|
| duration/instant` | 0ms | Reduced motion, мгновенное переключение, critical state |
| `duration/fast` | 100ms | Hover/pressed feedback, micro-change без перемещения |
| `duration/base` | 150ms | Toggle thumb, Modal open/close, small fade |
| `duration/moderate` | 200ms | Drawer, Alert dismiss, collapse/expand |
| `duration/slow` | 300ms | Сложный overlay, search debounce upper bound |
| `duration/loading` | 1000-1600ms | Skeleton pulse/wave, spinner rotation cycle |

Примечание: `duration/loading` описывает цикл бесконечной анимации, а не задержку интерфейса.

---

## Easing Tokens

| Токен | Значение CSS | Использование |
|---|---|---|
| `easing/linear` | `linear` | Spinner rotation, progress shimmer |
| `easing/standard` | `cubic-bezier(0.2, 0, 0, 1)` | Большинство UI transitions |
| `easing/enter` | `cubic-bezier(0, 0, 0.2, 1)` | Появление элемента |
| `easing/exit` | `cubic-bezier(0.4, 0, 1, 1)` | Исчезновение элемента |
| `easing/emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Drawer, Modal, заметное перемещение |

Если реализация пока использует `ease-out`, мапьте его на `easing/enter` или `easing/standard` в зависимости от сценария.

---

## Motion Tokens Для Реализации

Рекомендуемые CSS custom properties:

```css
--motion-duration-instant: 0ms;
--motion-duration-fast: 100ms;
--motion-duration-base: 150ms;
--motion-duration-moderate: 200ms;
--motion-duration-slow: 300ms;
--motion-easing-linear: linear;
--motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
--motion-easing-enter: cubic-bezier(0, 0, 0.2, 1);
--motion-easing-exit: cubic-bezier(0.4, 0, 1, 1);
```

Пока эти токены не экспортируются из `tokens.json`, specs могут ссылаться на documented roles duration/* и easing/*.

---

## Паттерны Движения

### Fade

Используется для мягкого появления или исчезновения без изменения позиции.

| Сценарий | Duration | Easing |
|---|---:|---|
| Tooltip appear/disappear | `duration/fast` | `easing/standard` |
| Modal overlay fade | `duration/base` | `easing/enter` / `easing/exit` |
| Alert dismiss opacity | `duration/moderate` | `easing/exit` |

Не используйте fade для изменений, где пользователь должен понять направление появления слоя.

### Slide

Используется для компонентов, которые появляются с края или из связанного trigger.

| Сценарий | Transform | Duration | Easing |
|---|---|---:|---|
| Drawer left/right | `translateX` | `duration/moderate` | `easing/emphasized` |
| Drawer bottom | `translateY` | `duration/moderate` | `easing/emphasized` |
| Toast enter | `translateY` или `translateX` + opacity | `duration/base`-`duration/moderate` | `easing/enter` |
| Toast exit | opacity или slight slide | `duration/base` | `easing/exit` |

Slide не должен сдвигать соседний layout, если компонент является overlay.

### Scale

Используется редко и только для маленьких feedback elements.

| Сценарий | Duration | Правило |
|---|---:|---|
| Badge появление | `duration/base` | Scale + opacity, без сдвига layout |
| Popover micro-enter | `duration/fast`-`duration/base` | Только если origin связан с trigger |

Не используйте scale для Modal или Drawer: это ухудшает пространственную модель.

### Collapse / Expand

Используется, когда элемент находится в потоке страницы и действительно меняет высоту.

| Сценарий | Duration | Easing |
|---|---:|---|
| Accordion open/close | `duration/moderate` | `easing/standard` |
| Alert dismiss height collapse | `duration/moderate` | `easing/exit` |
| Sidebar group expand | `duration/base`-`duration/moderate` | `easing/standard` |

Правила:

- Анимируйте `grid-template-rows`, `max-height` или измеренную высоту осторожно.
- Избегайте прыжков контента в конце transition.
- Reduced motion должен раскрывать/скрывать контент мгновенно.

### Loading

Используется, когда система выполняет действие и пользователь должен понимать, что ожидание активно.

| Сценарий | Pattern |
|---|---|
| Button loading | Spinner или статичный индикатор в reduced motion |
| Section loading | `aria-busy="true"` + Spinner или Skeleton |
| Known progress | Progress Bar вместо Spinner |
| Search debounce | 200-300ms задержка запроса, не визуальная анимация |

Не показывайте loading indicator для операций короче 300ms, если это создаёт flicker.

### Skeleton

Используется для первичной загрузки известной структуры.

| Pattern | Duration | Reduced motion |
|---|---:|---|
| `pulse` | `duration/loading` | Статичный placeholder |
| `wave` | `duration/loading` | `animation: none` |
| `none` | 0ms | Default для reduced motion |

Skeleton должен повторять форму будущего контента и исчезать сразу после загрузки.

### Drag

Drag motion должен быть прямым, без задержки.

Правила:

- Элемент следует pointer без smoothing delay.
- Drop target подсвечивается state token, а не только движением.
- Drag-and-drop всегда имеет keyboard alternative.
- Reduced motion не отключает саму возможность drag, но убирает декоративные transitions.

---

## Enter / Exit Model

| Компонент | Enter | Exit | Duration |
|---|---|---|---:|
| Modal | Fade overlay + fade/short translate content | Fade out | `duration/base` |
| Drawer | Slide from edge | Slide to edge | `duration/moderate` |
| Dropdown/Menu | Fade + slight offset | Fade | `duration/fast`-`duration/base` |
| Popover | Fade + slight offset | Fade | `duration/base` |
| Tooltip | Fade | Fade | `duration/fast` |
| Toast | Slide + fade | Fade or slide out | `duration/base`-`duration/moderate` |
| Alert dismiss | Fade + collapse | Collapse | `duration/moderate` |
| Accordion | Expand | Collapse | `duration/moderate` |

Фокус не должен ждать окончания enter animation. Для Modal/Drawer фокус перемещается внутрь сразу после открытия слоя.

---

## Reduced Motion

Все компоненты с motion должны поддерживать:

``css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
    scroll-behavior: auto;
  }
}
``

Компонентный fallback:

| Pattern | Reduced-motion behavior |
|---|---|
| Fade | Мгновенное появление/скрытие |
| Slide | Мгновенное появление в конечной позиции |
| Collapse | Мгновенное раскрытие/скрытие |
| Spinner | Статичный индикатор или текстовое состояние |
| Skeleton wave | `animation: none` |
| Auto-scroll | Отключить smooth scroll |

Reduced motion не должен скрывать информацию и не должен ломать focus management.

---

## Timing Rules

| Сценарий | Правило |
|---|---|
| Hover feedback | 0-100ms |
| Pressed feedback | Мгновенно |
| Toggle switch | 150ms |
| Modal open/close | 150ms |
| Drawer open/close | 200ms |
| Alert dismiss | 200ms |
| Search debounce | 200-300ms |
| Toast auto-dismiss | 4000ms info/success, 6000ms warning/error |
| Long operation | После 10s нужен progress или текст о статусе |

---

## Accessibility

- Motion не должен быть единственным способом передать состояние.
- Анимации не должны мешать keyboard interaction.
- Focus ring должен появляться сразу, а не после transition.
- Auto-dismiss компоненты должны ставить таймер на паузу при hover и focus.
- Spinner и Skeleton должны иметь `aria-busy`, `role="status"` или текстовое состояние по `accessibility.md`.
- `prefers-reduced-motion` обязателен для всех continuous animations.

---

## Применение По Компонентам

| Компонент | Motion rule |
|---|---|
| Button / Icon Button | Spinner в `loading`; reduced motion допускает статичный индикатор |
| Toggle | Thumb transition `duration/base`, `easing/enter` или `easing/standard` |
| Drawer | Slide `duration/moderate`, `easing/emphasized` |
| Modal | Fade/short enter `duration/base`; фокус устанавливается сразу |
| Alert | Dismiss fade + collapse `duration/moderate` |
| Toast | Enter slide+fade, exit fade; timer pause on hover/focus |
| Skeleton | Pulse/wave cycle, `animation: none` for reduced motion |
| Spinner | Linear rotation; static fallback for reduced motion |
| Accordion | Expand/collapse `duration/moderate` |
| Search | Debounce 200-300ms; loading state через Spinner или result state |

---

## Что Делать И Чего Избегать

| Делать | Избегать |
|---|---|
| Использовать documented durations | Ставить произвольные 137ms или 420ms |
| Двигать overlay из логичного направления | Масштабировать Modal из центра без причины |
| Отключать decorative motion в reduced motion | Оставлять бесконечный shimmer без fallback |
| Сохранять focus management независимо от animation | Ждать конца анимации перед установкой фокуса |
| Использовать progress для известной длительности | Показывать Spinner для долгих задач без статуса |

---

## Чеклист

- [ ] Указан motion pattern: fade, slide, collapse, loading, skeleton или drag.
- [ ] Duration взят из duration/*.
- [ ] Easing взят из easing/*.
- [ ] Reduced-motion fallback описан.
- [ ] Анимация не вызывает layout shift, кроме явного collapse/expand.
- [ ] Focus management не зависит от завершения transition.
- [ ] Loading state имеет accessible feedback.
- [ ] Auto-dismiss timers ставятся на паузу при hover/focus.
