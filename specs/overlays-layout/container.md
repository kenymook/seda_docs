# Container

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Container — обёртка, ограничивающая максимальную ширину контента и центрирующая его на странице. Обеспечивает читаемую ширину строки и согласованные горизонтальные отступы.

### When to use

**Use** — для всех страниц и секций, где нужно ограничить ширину контента и центрировать его.

**Don't use:**
- Для вложенных контейнеров одного размера — достаточно одного уровня
- Для полноэкранных элементов (карты, hero с изображением) — используйте `full`

### Core principles

- **Один Container на секцию** — не вкладывайте Container в Container одного размера
- **Адаптивные отступы** — горизонтальный padding меняется по брейкпоинтам
- **Выбирайте размер по контенту** — `lg` для текстового, `xl`/`2xl` для сложных лейаутов

---

## 2. Anatomy

```
|←── viewport ──────────────────────→|
   |←──── container max-width ────→|
   |← gutter →|  content  |← gutter →|
```

| Slot | Обязательность | Описание |
|---|---|---|
| `content` | required | Произвольный контент |

---

## 3. Types / Variants

| Size | Max-width | Контекст |
|---|---|---|
| `sm` | 640px | Узкий контент: статьи, формы входа |
| `md` | 768px | Документы, блог |
| `lg` | 1024px | Стандартный лейаут с боковой колонкой |
| `xl` | 1280px | Широкие дашборды — дефолт для приложений |
| `2xl` | 1440px | Максимально широкий |
| `full` | 100% | Без ограничения ширины |

### Адаптивные отступы (padding H)

| Брейкпоинт | Padding |
|---|---|
| `xs` (320px) | 16px |
| `sm` (640px) | 24px |
| `md` (768px) | 32px |
| `lg` (1024px+) | 40px |

---


---

## States

Container is a layout primitive and has no interactive states. Responsive size changes are layout behavior, not component states. Nested components own their own states.

---


---

## Accessibility

Container should not add extra landmarks by default. Use semantic regions only when the content needs navigation structure. Container must not change DOM order for visual layout.

---

## 4. Design Tokens

Container использует только spacing-токены, нет специфичных component tokens.

| Параметр | Значение |
|---|---|
| `max-width` | Задаётся через size prop |
| `margin` | `0 auto` |
| `padding-inline` | Адаптивный (см. таблицу выше) |
