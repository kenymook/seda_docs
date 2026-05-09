# Skeleton

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Skeleton — заглушки-плейсхолдеры, повторяющие форму будущего контента во время загрузки. Создают ощущение быстрого интерфейса за счёт немедленного отображения структуры страницы.

### When to use

**Use** — для первичной загрузки страницы или блока, когда структура контента известна (карточки, таблицы, профили).

**Don't use:**
- Для коротких операций < 300ms — контент появится быстрее, чем Skeleton успеет показаться
- Когда структура неизвестна — используйте **Spinner**

### Core principles

- **Повторяет форму контента** — скелет должен быть похож по размеру и форме на реальный контент
- **Анимация привлекает внимание** — pulse или wave сигнализирует о загрузке
- **Замените сразу по готовности** — не держите Skeleton дольше необходимого

---

## 2. Anatomy

Набор примитивов, собираемых в композиции:

| Примитив | Форма | Применение |
|---|---|---|
| `text` | Прямоугольник с скруглёнными краями | Строки текста |
| `circle` | Круг | Аватары, иконки |
| `rectangle` | Прямоугольник | Изображения, блоки |
| `rounded` | Прямоугольник с большим radius | Карточки, кнопки |

---

## 3. Types / Variants

### Анимации

| Анимация | Описание |
|---|---|
| `pulse` | Плавное изменение opacity по `duration/loading`. Дефолт |
| `wave` | Волна светлого блика слева направо по `duration/loading` |
| `none` | Без анимации (для `prefers-reduced-motion`) |

### Составные паттерны

| Паттерн | Описание |
|---|---|
| `card-skeleton` | Заглушка карточки |
| `list-skeleton` | Заглушка списка строк |
| `table-skeleton` | Заглушка таблицы |
| `form-skeleton` | Заглушка формы |

---

## 4. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `aria-busy="true"` | — | Контейнер, пока грузится |
| `aria-label="Загрузка..."` | — | На Skeleton-контейнере |
| `prefers-reduced-motion` | `animation: none` | Отключить волновую анимацию |

Motion следует `foundation/motion.md`: Skeleton использует `duration/loading` для pulse/wave и статичный placeholder при `prefers-reduced-motion: reduce`.

---


---

## States

Skeleton has loading and educed-motion states. It should not expose hover, focus, selected or disabled states. Once data is ready, Skeleton is replaced by the final content without layout shift.

---

## 5. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--skeleton-bg` | Базовый цвет | `status/disabled/container` | `status/disabled/container` |
| `--skeleton-shine` | Цвет блика wave | `surface/default` | `surface/default` |
