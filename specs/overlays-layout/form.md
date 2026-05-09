# Form

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Form — составной компонент для группировки полей ввода с лейблами, подсказками и обработкой валидации. Обеспечивает согласованный layout и поведение для форм.

### When to use

**Use** — для любых форм с несколькими полями ввода: регистрация, профиль, настройки, фильтры.

**Don't use:**
- Для одиночного поля — используйте Text Field напрямую
- Для форм внутри Modal без модификации — используйте тип Modal `form`

### Core principles

- **Label над полем** — тип `vertical` дефолт. `horizontal` только для компактных форм с короткими лейблами
- **Validation model** (из validation-model.md) — `error` показывается после взаимодействия или Submit
- **Error summary** — при наличии нескольких ошибок показывайте общий список в начале формы
- **Required fields** — помечайте обязательные поля, объясняйте конвенцию (`* — обязательное`)

---

## 2. Anatomy

```
Vertical:
Label *
┌──────────────────────┐
│ Field value          │
└──────────────────────┘
Helper text

[Error summary (при ошибках)]

[Submit]  [Cancel]
```

| Slot | Обязательность | Описание |
|---|---|---|
| `field-groups` | required | Поля формы, сгруппированные логически |
| `submit-actions` | required | Кнопки Submit и Cancel |
| `error-summary` | conditional | Список ошибок при неудачном Submit |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `vertical` | Лейбл над полем. Рекомендуется — дефолт |
| `horizontal` | Лейбл слева от поля. Для компактных форм |
| `inline` | Поля в одну строку. Для поиска и фильтров |

---

## 4. Behavior

### Validation (из validation-model.md)

- `error` показывается только после `blur` на поле или Submit
- Пустое поле не считается ошибкой до взаимодействия
- `filled` ≠ `valid`
- При `error` поле остаётся редактируемым

### Submit flow
1. Click Submit → все поля проходят валидацию
2. Если ошибки — `error-summary` вверху, `error` на полях, фокус на первом ошибочном поле
3. Если OK → async-запрос, кнопка Submit в `loading`
4. Успех → redirect или success message

---

## 5. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `<form>` | — | Нативный элемент |
| `novalidate` | — | Для кастомной валидации |
| `aria-required="true"` | — | Обязательные поля |
| `aria-invalid="true"` | — | Поля с ошибкой |
| `aria-describedby` | ID error | Поле → сообщение об ошибке |
| `role="alert"` | — | Error summary |

---


---

## States

Form can expose aggregate states: default, dirty, alidating, invalid, submitting, submitted. Individual field states are owned by Form Field and input specs.

---

## 6. Design Tokens

Form использует токены дочерних компонентов (Text Field, Select и т.д.). Специфичные токены:

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--form-label` | Цвет label | `text/secondary` | `text/secondary` |
| `--form-required-marker` | Цвет «*» | `status/error/text` | `status/error/text` |
| `--form-group-title` | Заголовок группы полей | `text/primary` | `text/primary` |
| `--form-error-summary-bg` | Фон error summary | `status/error/container/default` | `status/error/container/default` |
| `--form-error-summary-border` | Граница error summary | `status/error/border` | `status/error/border` |
| `--form-error-summary-text` | Текст error summary | `status/error/text` | `status/error/text` |
