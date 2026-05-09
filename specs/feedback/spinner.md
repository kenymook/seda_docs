# Spinner / Loader

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Spinner — индикатор неопределённой загрузки. Используется когда конец операции неизвестен и нужно показать, что система работает.

### When to use

**Use** — для async-операций без известной длительности: загрузка данных, отправка формы, инициализация.

**Don't use:**
- Когда известна доля выполненного — используйте **Progress Bar**
- Для первичной загрузки контента — используйте **Skeleton**
- Долгих операций > 10 секунд — используйте Progress Bar с оценкой времени

### Core principles

- **Не блокируйте без причины** — Spinner должен сигнализировать о реальном ожидании
- **Размещайте близко к загружаемому** — не по центру экрана, если загружается только часть

---

## 2. Anatomy

Spinner — один SVG-элемент с CSS-анимацией вращения. Никаких дополнительных слотов.

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `circular` | Круговой. Дефолт. Анимация вращения |
| `linear` | Линейный (indeterminate progress bar). Для строчных контекстов |

### Варианты применения

| Вариант | Описание |
|---|---|
| `standalone` | Самостоятельный индикатор загрузки |
| `overlay` | Поверх блокируемого контента |
| `button` | Внутри Button в состоянии `loading` |

---

## 4. Sizes

| Size | Diameter | Stroke | Контекст |
|---|---|---|---|
| `small` | 16px | 2px | Внутри кнопок, инлайн |
| `medium` | 24px | 2.5px | Inline-блоки — дефолт |
| `large` | 40px | 3px | Полноэкранная загрузка |

---

## 5. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="status"` | — | Контейнер Spinner |
| `aria-label="Загрузка..."` | — | Всегда (нет видимого текста) |
| `aria-live="polite"` | — | Динамическое появление |

Motion следует `foundation/motion.md`: круговое вращение использует `easing/linear` и цикл `duration/loading`. При `@media (prefers-reduced-motion: reduce)` заменяйте Spinner на статичный индикатор или текстовое состояние.

---


---

## States

Spinner has loading, inline, page and educed-motion states. It should not receive focus. If loading blocks an action, the parent Button or control owns the disabled/loading state.

---

## 6. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--spinner-track` | Цвет дорожки | `border/default` | `border/default` |
| `--spinner-fill` | Цвет активной части | `border/brand/default` | `border/brand/default` |
