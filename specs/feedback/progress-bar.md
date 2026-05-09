# Progress Bar

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Progress Bar — индикатор определённого прогресса. Используется когда известна доля выполненного: загрузка файла, прохождение теста, заполнение профиля.

### When to use

**Use** — для File Upload, прохождения уроков, заполнения формы, импорта данных с известным прогрессом.

**Don't use:**
- Когда прогресс неизвестен — используйте **Spinner**
- Для отображения метрик и статистики — используйте Chart

### Core principles

- **Всегда показывайте значение** — «75%» или «3 из 4 шагов» — не только визуальная полоса
- **Success state** — по завершении явно показывайте успех, не исчезайте мгновенно

---

## 2. Anatomy

```
Linear:
Label                         75%
████████████████████░░░░░░  ← track + fill

Circular:
   ┌──┐
  /75% \
  \    /
   └──┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `track` | required | Фоновая дорожка |
| `fill` | required | Заполненная часть |
| `label` | optional | Текстовое описание |
| `value-label` | optional | Процент или дробь |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `linear` | Горизонтальная полоса |
| `circular` | Круговой прогресс |

### Варианты отображения

| Вариант | Описание |
|---|---|
| `default` | Простая полоса без текста |
| `segmented` | Разбита на сегменты (шаги) |
| `with-label` | С текстовым значением |

---

## 4. States

| Состояние | Описание |
|---|---|
| `default` | Идёт прогресс |
| `success` | 100%, операция завершена. Зелёный цвет |
| `error` | Ошибка. Красный цвет |

---

## 5. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="progressbar"` | — | Всегда |
| `aria-valuemin` | 0 | Всегда |
| `aria-valuemax` | 100 | Всегда |
| `aria-valuenow` | текущее | Всегда |
| `aria-valuetext` | «75%» | Когда нужна единица |
| `aria-label` | Описание | Без видимого label |

---

## 6. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--progress-track` | Дорожка | `container/default` | `container/default` |
| `--progress-fill` | Заполненная часть | `container/brand/default` | `container/brand/default` |
| `--progress-fill-success` | Заполненная success | `status/success/surface` | `status/success/surface` |
| `--progress-fill-error` | Заполненная error | `status/error/surface` | `status/error/surface` |
| `--progress-label` | Цвет label | `text/secondary` | `text/secondary` |
| `--progress-value` | Цвет процента | `text/primary` | `text/primary` |
