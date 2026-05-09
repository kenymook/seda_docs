# Verification Code

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Verification Code (OTP) — специализированный контрол ввода кода подтверждения. Отображает отдельные ячейки для каждой цифры/символа и автоматически переключает фокус при вводе.

### When to use

**Use** — для ввода SMS-кода, email-кода, PIN-кода; при двухфакторной аутентификации; для верификации транзакций.

**Don't use:**
- Для паролей — используйте **Text Field** с типом `password`
- Для длинных кодов > 8 символов — используйте обычный Text Field

---

## 2. Anatomy

```
Label
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │ │   │ │   │ │   │
└───┘ └───┘ └───┘ └───┘ └───┘ └───┘
Helper text / Error
```

| Slot | Обязательность | Описание |
|---|---|---|
| `cells` | required | Массив ячеек (4, 6 или 8) |
| `label` | optional | Метка контрола |
| `helper-text` | optional | Подсказка или сообщение об ошибке |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `numeric` | Только цифры 0–9 |
| `alphanumeric` | Буквы и цифры |

**Количество ячеек:** 4 · 6 · 8

---

## 4. States

| Состояние | Описание |
|---|---|
| `default` | Пустые ячейки |
| `focus` | Активная ячейка подсвечена `border/brand/default` |
| `filled` | Ячейка содержит символ |
| `error` | Код неверный, все ячейки `status/error/border` |
| `disabled` | Недоступен |

---

## 5. Behavior

- При вводе символа фокус автоматически переходит в следующую ячейку
- `Backspace` на пустой ячейке — возврат к предыдущей и очистка
- При вставке (Ctrl+V / Cmd+V) — символы распределяются по ячейкам
- При `error` — опциональное shake-анимирование ячеек и автоочистка

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `0–9`, `A–Z` | Ввод и переход к следующей |
| `Backspace` | Удаление и переход к предыдущей |
| `←` / `→` | Перемещение между ячейками |

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `autocomplete="one-time-code"` | — | Для SMS OTP |
| `inputmode="numeric"` | — | Тип `numeric` |
| `aria-label` | «Цифра N из M» | Каждая ячейка |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--otp-cell-bg` | Фон ячейки | `surface/default` | `surface/default` |
| `--otp-cell-border` | Граница default | `border/default` | `border/default` |
| `--otp-cell-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--otp-cell-border-error` | Граница error | `status/error/border` | `status/error/border` |
| `--otp-cell-text` | Введённый символ | `text/primary` | `text/primary` |
| `--otp-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--otp-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
