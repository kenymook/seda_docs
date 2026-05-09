# Stat / Metric

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Stat / Metric — крупное отображение числовой метрики с подписью и опциональным трендом. Используется в дашбордах и аналитических панелях для выделения ключевых KPI.

### When to use

**Use** — для дашбордов с KPI-блоками: выручка, количество пользователей, конверсия, среднее время.

**Don't use:**
- Для обычного текста с числами — используйте типографику
- Для более 6 метрик в одном ряду — разбейте на группы

### Core principles

- **Единица измерения рядом** — «$1.2M», «84%», «3.2s» — не заставляйте пользователя угадывать
- **Тренд — относительный** — «+12% vs прошлый месяц», не просто «+12%»
- **Компактность** — Metric — это акцент, не детальный отчёт

---

## 2. Anatomy

```
┌────────────────────────┐
│ Label                  │ ← label
│ $1,240,000             │ ← value (крупный шрифт)
│ USD                    │ ← unit
│ ↑ +12% vs last month   │ ← trend
│ Monthly revenue        │ ← description
└────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Короткое название метрики |
| `value` | required | Числовое значение |
| `unit` | optional | Единица измерения |
| `trend` | optional | Изменение по сравнению с предыдущим периодом |
| `description` | optional | Дополнительный контекст |

---

## 3. Types / Variants

### Варианты тренда

| Вариант | Описание |
|---|---|
| `up` | Положительная динамика. Зелёный цвет и стрелка вверх |
| `down` | Отрицательная. Красный цвет и стрелка вниз |
| `neutral` | Без изменений. Серый цвет |

> Направление тренда не всегда соответствует «хорошо / плохо» — рост расходов может быть негативным. Подбирайте цвет контекстуально.

---


---

## States

Stat Metric is usually static. Optional semantic states are 
eutral, positive, 
egative, warning and critical; each state must be supported by text, sign, label or icon, not color alone.

---


---

## Accessibility

Metric value, unit and trend must be available as text. Positive/negative meaning cannot be color-only. Use readable numeric formatting and avoid announcing decorative trend icons.

---

## 4. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--metric-label` | Цвет метки | `text/tertiary` | `text/tertiary` |
| `--metric-value` | Цвет значения | `text/primary` | `text/primary` |
| `--metric-unit` | Цвет единицы | `text/secondary` | `text/secondary` |
| `--metric-trend-up` | Тренд вверх | `status/success/text` | `status/success/text` |
| `--metric-trend-down` | Тренд вниз | `status/error/text` | `status/error/text` |
| `--metric-trend-neutral` | Нейтральный тренд | `text/tertiary` | `text/tertiary` |
| `--metric-description` | Описание | `text/tertiary` | `text/tertiary` |
