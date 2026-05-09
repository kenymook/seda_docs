# Avatar

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Avatar — визуальное представление пользователя или сущности. Используется для идентификации людей в интерфейсе: чатах, комментариях, карточках, таблицах.

### When to use

**Use** — для отображения автора, участника, пользователя в любом контексте, где нужна личная идентификация.

**Don't use:**
- Как декоративный элемент без связи с конкретным пользователем
- Для иконок категорий или объектов — используйте обычную иконку

### Core principles

- **Fallback-цепочка** — если фото недоступно: инициалы → иконка-заглушка
- **Цвет инициалов** — назначается детерминированно на основе имени/ID пользователя
- **Не масштабируйте произвольно** — используйте системные размеры

---

## 2. Anatomy

```
┌──────┐
│  AB  │  ← initials / image / icon
└──────┘
      ●   ← indicator (online / verified)
```

| Slot | Обязательность | Описание |
|---|---|---|
| `image` | conditional | Фото пользователя (тип `image`) |
| `initials` | conditional | Инициалы (тип `initials`) |
| `icon` | conditional | Иконка-заглушка (тип `icon`) |
| `indicator` | optional | Статус-индикатор: `online`, `icon`, `verified-tick` |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `image` | Фото пользователя в круглом контейнере |
| `initials` | 1–2 буквы инициалов на цветном фоне |
| `icon` | Иконка пользователя на нейтральном фоне |
| `photo` | Крупное фото (не обязательно круглое). Для профилей |

### Индикаторы

| Индикатор | Описание |
|---|---|
| `online` | Зелёная точка — пользователь онлайн |
| `icon` | Кастомная иконка в круглом бэдже |
| `verified-tick` | Галочка верификации |

### Составные варианты

| Вариант | Описание |
|---|---|
| `Avatar Group` | Несколько аватаров в ряд с перекрытием |
| `Avatar Block` | Аватар + имя + подпись (должность, email) |
| `Avatar Add Button` | Кнопка «+» в стиле аватара для добавления участника |
| `Avatar More Button` | «+N» при переполнении Avatar Group |

---

## 4. Sizes

Avatar использует числовые размеры вместо именованных ступеней.

| Size | Диаметр | Font | Индикатор |
|---|---|---|---|
| `16` | 16px | 8px | 5px |
| `20` | 20px | 10px | 6px |
| `24` | 24px | 11px | 7px |
| `32` | 32px | 13px | 8px |
| `40` | 40px | 15px | 10px |
| `48` | 48px | 17px | 12px |
| `56` | 56px | 20px | 14px |
| `64` | 64px | 23px | 16px |
| `72` | 72px | 26px | 18px |

---

## 5. States

### State types

- **interaction:** `hover`, `focus` (только при кликабельном аватаре)
- **data:** `skeleton`
- **availability:** `disabled`

| Состояние | Описание |
|---|---|
| `default` | Стандартный вид |
| `hover` | Лёгкое затемнение при наведении (кликабельный) |
| `focus` | `focus/ring` (кликабельный) |
| `skeleton` | Анимированная заглушка до загрузки |
| `disabled` | Приглушённые цвета |

---

## 6. Details on Types / Variants

### initials
Цвет фона назначается детерминированно на основе имени. Система должна поддерживать минимум 8 вариантов цвета. Инициалы — первые буквы имени и фамилии, или первые два символа имени.

### Avatar Group
Аватары накладываются с отрицательным margin. При переполнении N-й аватар заменяется `Avatar More Button` (+N). Размер группы определяется через `size` на уровне Group.

---

## 7. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `alt="Имя пользователя"` | — | Тип `image` |
| `aria-label="Имя пользователя"` | — | Тип `initials` и `icon` |
| `role="img"` | — | Не-кликабельный аватар |
| `role="button"` | — | Кликабельный аватар |

---

## 8. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--avatar-bg-fallback` | Фон заглушки-иконки | `container/default` | `container/default` |
| `--avatar-icon-fallback` | Цвет иконки заглушки | `text/tertiary` | `text/tertiary` |
| `--avatar-border` | Граница (Avatar Group) | `surface/default` | `surface/default` |
| `--avatar-indicator-online` | Индикатор онлайн | `status/success/surface` | `status/success/surface` |
| `--avatar-skeleton-bg` | Фон skeleton | `status/disabled/container` | `status/disabled/container` |
| `--avatar-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
