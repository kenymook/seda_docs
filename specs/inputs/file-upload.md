# File Upload

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

File Upload — контрол загрузки файлов. Поддерживает выбор через диалог файловой системы и drag-and-drop. Показывает прогресс загрузки и результат.

### When to use

**Use** — для загрузки документов, изображений, медиафайлов; в профилях (аватар), формах подачи заявок, редакторах контента.

**Do not use:**
- Когда нужно только сделать фото — используйте нативный `capture` инпут
- Для загрузки больших файлов без прогресс-индикатора

### Core principles

- **Явные ограничения** — всегда показывайте допустимые форматы и максимальный размер
- **Обратная связь** — прогресс, успех и ошибка должны быть видны пользователю
- **Отмена загрузки** — пользователь должен иметь возможность отменить

---

## 2. Anatomy

```
┌──────────────────────────────────────┐
│     ⬆ Перетащите файл сюда           │
│     или нажмите для выбора           │
│                                      │
│   Форматы: PDF, DOCX   Макс: 10 МБ  │
└──────────────────────────────────────┘
[file.pdf  ████████░░  80%  ✕]
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | optional | Заголовок зоны |
| `description` | optional | Вспомогательный текст |
| `accepted-formats` | required | Допустимые форматы файлов |
| `size-limit` | required | Максимальный размер |
| `file-list` | conditional | Список загруженных файлов с прогрессом |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `dropzone` | Большая зона drag-and-drop с кнопкой |
| `button` | Только кнопка «Выбрать файл», без зоны |
| `inline` | Компактный вариант, встроенный в форму |

---

## 4. Sizes

File Upload follows the standard component size model.

| Size | Use case | Expected composition |
|---|---|---|
| `s` | Dense forms, table/filter panels, compact inline upload | Compact button/inline layout, minimal helper text |
| `m` | Default form usage | Standard inline/button layout and default dropzone density |
| `l` | Prominent form sections | Larger dropzone with clearer icon, title, helper, and action spacing |
| `xl` | Dedicated upload pages or empty states | Spacious dropzone for primary upload flows |

Size must be exposed as a Figma component property and must affect spacing, min-height, icon sizing, and typography through existing system primitives and text styles. Do not create arbitrary one-off dimensions per variant.

---

## 5. States

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Ожидание файла | Штриховая граница |
| `hover` | Курсор над зоной | Граница `border/brand/default` |
| `drag-over` | Файл над зоной (drag) | Заливка `container/brand/default` с низкой прозрачностью |
| `uploading` | Загрузка идёт | Прогресс-бар на элементе файла |
| `success` | Загрузка завершена | Иконка чекмарка, зелёный |
| `error` | Ошибка загрузки | Иконка ошибки, красный, текст ошибки |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

---

## 6. Details on Types / Variants

### dropzone
Основной тип. Штриховая граница обозначает зону drop. При drag-over — визуальный отклик. Внутри — иконка, подпись, кнопка выбора.

### button
Минималистичный вариант — только кнопка «Выбрать файл». Список загружаемых файлов отображается под кнопкой. Используется когда нет места для зоны.

### inline
Встроен в строку формы как поле. Выбранный файл отображается рядом с кнопкой.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на зону/кнопку |
| `Enter` / `Space` | Открыть диалог выбора файла |

### File validation
Проверка типа и размера происходит до загрузки (на клиенте). Ошибка отображается немедленно.

---

## 8. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `<input type="file">` | — | Скрытый нативный инпут |
| `aria-label` | Описание | Для зоны drag-and-drop |
| `aria-describedby` | ID с форматами | Ссылка на блок с форматами |
| `role="status"` | — | Для динамического обновления прогресса |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--upload-border` | Граница зоны | `border/default` | `border/default` |
| `--upload-border-hover` | Граница hover | `border/brand/default` | `border/brand/default` |
| `--upload-border-drag` | Граница drag-over | `border/brand/default` | `border/brand/default` |
| `--upload-bg-drag` | Фон drag-over | `container/brand/default` | `container/brand/default` |
| `--upload-icon` | Цвет иконки | `text/tertiary` | `text/tertiary` |
| `--upload-text` | Цвет текста | `text/secondary` | `text/secondary` |
| `--upload-progress` | Прогресс-бар | `container/brand/default` | `container/brand/default` |
| `--upload-success` | Успех | `status/success/surface` | `status/success/surface` |
| `--upload-error` | Ошибка | `status/danger/surface` | `status/danger/surface` |


---

## Related specifications / Связанные спецификации

- [Button](../specs/actions/button.md) — выбор файла и actions.
- [Progress Bar](../specs/feedback/progress-bar.md) — прогресс загрузки.
- [Alert](../specs/feedback/alert.md) — ошибки загрузки и validation.

