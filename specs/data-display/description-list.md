# Description List

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Description List — отображение пар ключ–значение для деталей объекта, свойств записи, характеристик. Семантически реализован через HTML `<dl>`, `<dt>`, `<dd>`.

### When to use

**Use** — для деталей профиля, карточки объекта, сводной информации о заказе, характеристик продукта.

**Don't use:**
- Для табличных данных с несколькими столбцами — используйте **Table**
- Для сравнения объектов между собой — используйте **Table**

---

## 2. Anatomy

```
Horizontal:
Name          John Doe
Email         john@example.com
Role          Administrator

Vertical:
Name
John Doe

Email
john@example.com

Table:
┌─────────────┬──────────────────┐
│ Name        │ John Doe         │
│ Email       │ john@example.com │
└─────────────┴──────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `term` (`<dt>`) | required | Ключ / метка атрибута |
| `definition` (`<dd>`) | required | Значение атрибута |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `horizontal` | Ключ и значение в одной строке. Ключ фиксированной ширины |
| `vertical` | Ключ над значением. Удобен для длинных значений |
| `table` | В виде таблицы с границами |

### Modifiers

| Модификатор | Описание |
|---|---|
| `bordered` | Горизонтальные разделители между парами |
| `striped` | Чередующийся фон строк |
| `compact` | Меньшие отступы |

---


---

## States

Description List is a static data-display pattern and has no component-level interactive states. If rows contain links, buttons or copy actions, their states are documented by the nested component specs.

---


---

## Accessibility

Use semantic description list markup (dl, dt, dd) when the content is term-value data. Keep terms concise and do not use layout-only tables for description lists.

---

## 4. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--dl-term-color` | Цвет ключа | `text/tertiary` | `text/tertiary` |
| `--dl-definition-color` | Цвет значения | `text/primary` | `text/primary` |
| `--dl-border` | Разделитель | `border/default` | `border/default` |
| `--dl-stripe-bg` | Фон чётных строк | `surface/default` | `surface/default` |
