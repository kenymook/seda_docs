# Тематизация

> Figma: https://www.figma.com/design/h8wSwPpnlt91IQH7h4Kvj0/SEDA-UI-kit?node-id=2556-1805

Система тематизации на CSS-переменных и семантических токенах.

См. также:
- `tokens.md` — архитектура токенов, naming, references, lifecycle.
- `color.md` — правила использования цвета, contrast, surface/container/status/link/tag.

---

## О тематизации в SEDA UI

SEDA UI использует CSS-переменные как основу системы тем. Вместо жёстко заданных цветов все компоненты обращаются к семантическим токенам — переменным с осмысленными именами: `surface/default`, `text/primary`, `border/hover`.

Чтобы кастомизировать тему, достаточно переопределить нужные переменные в корневом CSS. Компоненты автоматически подхватят изменения без правки классов или пропсов.

---

## Light и Dark режимы

Каждый семантический токен определён в двух вариантах: Light и Dark. Переключение темы сводится к смене набора CSS-переменных на корневом элементе — все компоненты адаптируются мгновенно.

Палитра строится на foundation-токенах (`color/neutral/*`, `color/blue/*` и т.д.), которые не используются в компонентах напрямую — только через семантические алиасы.

---

## Конвенция именования

Токены структурированы по схеме: `категория / вариант / состояние`.

Примеры: `surface/default`, `border/brand/hover`, `status/error/text`, `text/on-inverse/secondary`.

Категории: `surface`, `container`, `border`, `text`, `link`, `status`, `shadow`, `focus`, `tag`.

Подробная архитектура токенов, слои `foundation` / `semantic` / `components`, правила ссылок и lifecycle описаны в `tokens.md`. Этот документ фокусируется на тематизации и значениях semantic tokens в Light/Dark режимах.

Правила использования цветовых ролей, contrast requirements, text-on-color pairing и status color guidance описаны в `color.md`.

---

## Токены

### Поверхности (surface)

Фоновые цвета страниц, секций и контейнеров.

| Token | Role | Light | Dark |
|---|---|---|---|
| `surface/default` | Основной фон страницы | color/neutral/0 | color/neutral/85 |
| `surface/hover` | Фон при наведении | color/neutral/5 | color/neutral/90 |
| `surface/pressed` | Фон при нажатии | color/neutral/10 | color/neutral/95 |
| `surface/inverse/default` | Инверсный фон | color/neutral/85 | color/neutral/0 |
| `surface/inverse/hover` | Инверсный фон при наведении | color/neutral/90 | color/neutral/5 |
| `surface/inverse/pressed` | Инверсный фон при нажатии | color/neutral/95 | color/neutral/5 |
| `surface/brand/default` | Фирменный фон | color/blue/50 | color/blue/50 |
| `surface/brand/hover` | Фирменный фон при наведении | color/blue/60 | color/blue/60 |
| `surface/brand/pressed` | Фирменный фон при нажатии | color/blue/70 | color/blue/70 |

### Заливки контейнеров (container)

Цвета заливки для интерактивных областей и контролов.

| Token | Role | Light | Dark |
|---|---|---|---|
| `container/default` | Контейнер по умолчанию | color/black/5 | color/white/10 |
| `container/hover` | Контейнер при наведении | color/black/10 | color/white/10 |
| `container/pressed` | Контейнер при нажатии | color/black/15 | color/white/15 |
| `container/brand/default` | Фирменный контейнер | color/blue/50 | color/blue/50 |
| `container/brand/hover` | Фирменный контейнер при наведении | color/blue/60 | color/blue/60 |
| `container/brand/pressed` | Фирменный контейнер при нажатии | color/blue/70 | color/blue/70 |
| `container/inverse/default` | Инверсный контейнер | color/neutral/85 | color/neutral/5 |
| `container/inverse/hover` | Инверсный контейнер при наведении | color/neutral/70 | color/neutral/15 |
| `container/inverse/pressed` | Инверсный контейнер при нажатии | color/neutral/60 | color/neutral/15 |

### Границы (border)

Цвета обводок, разделителей и рамок элементов.

| Token | Role | Light | Dark |
|---|---|---|---|
| `border/default` | Граница по умолчанию | color/black/5 | color/white/5 |
| `border/hover` | Граница при наведении | color/black/10 | color/white/10 |
| `border/pressed` | Граница при нажатии | color/black/15 | color/white/15 |
| `border/brand/default` | Фирменная граница | color/blue/50 | color/blue/50 |
| `border/brand/hover` | Фирменная граница при наведении | color/blue/60 | color/blue/60 |
| `border/brand/pressed` | Фирменная граница при нажатии | color/blue/70 | color/blue/60 |
| `border/inverse/default` | Инверсная граница | color/neutral/85 | color/neutral/10 |
| `border/inverse/hover` | Инверсная граница при наведении | color/neutral/70 | color/neutral/20 |
| `border/inverse/pressed` | Инверсная граница при нажатии | color/neutral/60 | color/neutral/30 |
| `border/negative/1` | Ошибка: светлая граница | color/red/20 | color/neutral/80 |
| `border/negative/2` | Ошибка: средняя граница | color/red/30 | color/neutral/70 |
| `border/negative/3` | Ошибка: акцентная граница | color/red/40 | color/neutral/60 |

### Текст (text)

Цвета текста, иконок и меток на различных поверхностях.

| Token | Role | Light | Dark |
|---|---|---|---|
| `text/primary` | Основной текст | color/neutral/95 | color/neutral/0 |
| `text/secondary` | Вторичный текст | color/black/85 | color/white/85 |
| `text/tertiary` | Третичный текст (подсказки, лейблы) | color/black/60 | color/white/60 |
| `text/muted` | Приглушённый текст (плейсхолдеры) | color/black/40 | color/white/40 |
| `text/on-brand/primary` | Основной текст на фирменном фоне | color/neutral/0 | color/neutral/0 |
| `text/on-brand/secondary` | Вторичный текст на фирменном фоне | color/white/85 | color/white/85 |
| `text/on-brand/tertiary` | Третичный текст на фирменном фоне | color/white/60 | color/white/60 |
| `text/on-brand/muted` | Приглушённый текст на фирменном фоне | color/white/40 | color/white/40 |
| `text/on-inverse/primary` | Основной текст на инверсном фоне | color/neutral/0 | color/neutral/95 |
| `text/on-inverse/secondary` | Вторичный текст на инверсном фоне | color/white/85 | color/neutral/85 |
| `text/on-inverse/tertiary` | Третичный текст на инверсном фоне | color/white/60 | color/neutral/60 |
| `text/on-inverse/muted` | Приглушённый текст на инверсном фоне | color/white/40 | color/neutral/40 |

### Ссылки (link)

Цвета интерактивных ссылок и их состояний.

| Token | Role | Light | Dark |
|---|---|---|---|
| `link/default` | Ссылка по умолчанию | color/blue/50 | color/blue/50 |
| `link/hover` | Ссылка при наведении | color/blue/60 | color/blue/60 |
| `link/pressed` | Ссылка при нажатии | color/blue/70 | color/blue/70 |
| `link/visited` | Посещённая ссылка | color/purple/50 | color/purple/50 |
| `link/visited-hover` | Посещённая ссылка при наведении | color/purple/60 | color/purple/60 |
| `link/visited-pressed` | Посещённая ссылка при нажатии | color/purple/70 | color/purple/70 |

### Статусы (status)

Семантические цвета для состояний: info, error, warning, success, disabled.

| Token | Role | Light | Dark |
|---|---|---|---|
| `status/info/surface` | Информация: поверхность | color/blue/50 | color/blue/30 |
| `status/info/container` | Информация: контейнер | color/blue/10 | color/blue/80 |
| `status/info/border` | Информация: граница | color/blue/50 | color/blue/30 |
| `status/info/text` | Информация: текст | color/blue/50 | color/blue/10 |
| `status/error/surface` | Ошибка: поверхность | color/red/50 | color/red/40 |
| `status/error/container` | Ошибка: контейнер | color/red/10 | color/red/80 |
| `status/error/border` | Ошибка: граница | color/red/50 | color/red/40 |
| `status/error/text` | Ошибка: текст | text/on-brand/primary | text/on-brand/primary |
| `status/warning/surface` | Предупреждение: поверхность | color/yellow/50 | color/yellow/30 |
| `status/warning/container` | Предупреждение: контейнер | color/yellow/10 | color/yellow/80 |
| `status/warning/border` | Предупреждение: граница | color/yellow/50 | color/yellow/30 |
| `status/warning/text` | Предупреждение: текст | color/yellow/50 | color/yellow/10 |
| `status/success/surface` | Успех: поверхность | color/green/50 | color/green/30 |
| `status/success/container` | Успех: контейнер | color/green/10 | color/green/80 |
| `status/success/border` | Успех: граница | color/green/50 | color/green/30 |
| `status/success/text` | Успех: текст | color/green/50 | color/green/10 |
| `status/disabled/surface` | Отключён: поверхность | color/neutral/5 | color/neutral/100 |
| `status/disabled/container` | Отключён: контейнер | color/black/5 | color/white/5 |
| `status/disabled/border` | Отключён: граница | border/default | color/neutral/100 |
| `status/disabled/text` | Отключён: текст | color/black/25 | color/white/25 |

### Тени и фокус (shadow, focus)

Токены для теней компонентов и кольца фокусировки.

| Token | Role | Light | Dark |
|---|---|---|---|
| `shadow/base` | Базовая тень | color/black/5 | color/black/95 |
| `shadow/darker` | Усиленная тень | color/black/15 | color/black/95 |
| `focus/ring` | Кольцо фокуса (outline) | rgba(0,114,245,0.24) | rgba(0,114,245,0.24) |

---

## Соответствие Состояний И Токенов

Состояния реализуются через семантические токены:

| Состояние | Основные токены |
|---|---|
| `default` | `surface/default`, `container/default`, `border/default`, `text/primary` |
| `hover` | `surface/hover`, `container/hover`, `border/hover` |
| `active` | `surface/pressed`, `container/pressed`, `border/pressed` |
| `focus` | `focus/ring` |
| `selected` | `container/brand/default`, `surface/brand/default`, `text/on-brand/primary` |
| `checked` | `container/brand/default`, `text/on-brand/primary` |
| `error` | `status/error/border`, `status/error/text`, `status/error/surface` |
| `warning` | `status/warning/border`, `status/warning/text`, `status/warning/surface` |
| `success` | `status/success/border`, `status/success/text`, `status/success/surface` |
| `disabled` | `status/disabled/surface`, `status/disabled/container`, `status/disabled/border`, `status/disabled/text` |
| `loading` | component-specific, с сохранением базовой семантики компонента |

Связь между терминами состояния и их смыслом описана в `state-vocabulary.md`.
