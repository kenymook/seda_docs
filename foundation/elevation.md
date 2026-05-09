# Elevation

> Figma: TBD

Elevation описывает визуальную глубину интерфейса: какие элементы лежат в потоке страницы, какие приподняты, какие перекрывают контент и какие блокируют взаимодействие. В SEDA elevation строится из поверхности, границы, тени, overlay и z-index.

---

## Цель

Elevation должен:

- показывать, какой слой находится выше;
- отделять floating и overlay-компоненты от базового layout;
- не заменять spacing, border или grouping;
- сохранять читаемость в Light и Dark темах;
- не создавать декоративный шум в плотных B2B и AI-интерфейсах.

Правило: используйте минимальный уровень глубины, который объясняет поведение компонента. Если элемент не перекрывает другой контент, ему часто достаточно border и spacing.

---

## Текущие Токены

Сейчас в SEDA есть semantic shadow tokens:

| Токен | Назначение |
|---|---|
| `shadow/base` | Лёгкая тень для raised или scrolled surface |
| `shadow/darker` | Усиленная тень для overlays и floating surfaces |

Примечание о текущем состоянии: `shadow/base` и `shadow/darker` сейчас являются цвето-семантическими токенами. Новые specs должны описывать уровень elevation, а shadow token использовать как реализационное значение.

---

## Elevation Levels

| Уровень | Роль | Surface | Border | Shadow | Примеры |
|---|---|---|---|---|---|
| `elevation/none` | В потоке страницы | `surface/default` | По необходимости | Нет | Формы, таблицы, обычные секции |
| `elevation/outlined` | Отделённая поверхность | `surface/default` | `border/default` | Нет | Card outlined, panels, table container |
| `elevation/raised` | Лёгкий подъём | `surface/default` | Optional | `shadow/base` | Scrolled Top Bar, clickable card hover |
| `elevation/floating` | Floating layer над страницей | `surface/default` | `border/default` | `shadow/darker` | Dropdown, Popover, Tooltip, Search dropdown |
| `elevation/overlay` | Панель поверх контента | `surface/default` | `border/default` | `shadow/darker` | Drawer, Command palette, Notification Center |
| `elevation/modal` | Блокирующий слой | `surface/default` | `border/default` | `shadow/darker` + scrim | Modal/Dialog |
| `elevation/toast` | Временный notification layer | `surface/inverse/default` | Optional | `shadow/darker` | Toast/Snackbar |

`elevation/*` пока является documented role, а не обязательным token namespace. При token pipeline его можно превратить в отдельную группу.

---

## Surface, Border И Shadow

Elevation не состоит только из тени.

| Часть | Что делает | Когда нужна |
|---|---|---|
| Surface | Даёт слой фона | Всегда для floating/overlay |
| Border | Отделяет слой от соседних цветов | Особенно в Dark theme и low-shadow surfaces |
| Shadow | Показывает глубину | Когда слой перекрывает другой контент |
| Scrim | Блокирует фон и снижает внимание к нему | Modal, Drawer, blocking overlay |
| Z-index | Управляет порядком наложения | Все floating/overlay layers |

Правило: если shadow плохо читается на тёмной теме, усиливайте border или surface contrast, а не делайте тень чрезмерно тёмной.

---

## Z-Index Layers

| Layer | Рекомендуемый token | Примеры |
|---|---|---|
| Base | `z/base` | Страница, обычные секции |
| Raised | `z/raised` | Sticky table header, scrolled top bar |
| Sticky | `z/sticky` | Fixed header, sticky sidebar |
| Dropdown | `z/dropdown` | Dropdown Menu, Select list, Date Picker popover |
| Overlay | `z/overlay` | Drawer, command/search overlay |
| Modal | `z/modal` | Modal/Dialog |
| Toast | `z/toast` | Toast/Snackbar, global notifications |
| Tooltip | `z/tooltip` | Tooltip над другими слоями |

Рекомендуемые числовые значения для реализации:

| Token | Value |
|---|---:|
| `z/base` | 0 |
| `z/raised` | 10 |
| `z/sticky` | 100 |
| `z/dropdown` | 1000 |
| `z/overlay` | 1100 |
| `z/modal` | 1200 |
| `z/toast` | 1300 |
| `z/tooltip` | 1400 |

Не используйте произвольные значения вроде `99999`. Если слой конфликтует, исправляйте его место в z-index model.

---

## Overlay И Scrim

Scrim используется, когда фоновый контент должен потерять интерактивный приоритет.

| Сценарий | Scrim | Фокус |
|---|---|---|
| Modal | Обязателен | Focus trap внутри modal |
| Drawer blocking | Обязателен | Focus trap внутри drawer |
| Drawer non-blocking | Опционален | Фокус по сценарию |
| Dropdown / Menu | Не нужен | Фокус на trigger или внутри menu |
| Popover | Обычно не нужен | Возврат фокуса на trigger |
| Toast | Не нужен | Не перехватывает фокус |

Текущие specs часто используют `shadow/darker` как overlay color (`--modal-overlay`, `--drawer-overlay`). В следующей итерации лучше ввести отдельный token `overlay/scrim`.

---

## Elevation По Компонентам

| Компонент | Уровень | Правило |
|---|---|---|
| Card `default` | `elevation/outlined` или `none` | Border предпочтительнее shadow в плотных screens |
| Card `elevated` | `elevation/raised` | Использовать редко, для интерактивной карточки или акцента |
| Top Bar scrolled | `elevation/raised` | Shadow появляется только после scroll |
| Dropdown / Menu | `elevation/floating` | Border + shadow, закрывается по Escape/outside click |
| Popover | `elevation/floating` | Не блокирует страницу |
| Tooltip | `elevation/floating` | Минимальная глубина, без интерактивного контента |
| Drawer | `elevation/overlay` | Может иметь scrim и focus trap |
| Modal | `elevation/modal` | Scrim, focus trap, `aria-modal` |
| Toast | `elevation/toast` | Поверх UI, не блокирует workflow |
| Notification Center | `elevation/overlay` | Floating panel или drawer-like surface |

---

## Hover Elevation

Hover elevation допустим только для интерактивных элементов, где подъём помогает понять кликабельность.

Использовать:
- clickable Card;
- draggable item;
- floating action surface;
- toolbar panel, если она реально раскрывается.

Не использовать:
- обычные статичные cards;
- каждую строку таблицы;
- disabled элементы;
- элементы, где hover уже передан цветом, border или cursor.

Hover elevation не должен смещать layout. Используйте shadow или transform без изменения занимаемого пространства.

---

## Dark Theme

В dark theme тень часто менее заметна. Поэтому elevation должен опираться на комбинацию:

- surface contrast;
- `border/default` или `border/inverse/*`;
- shadow token;
- scrim для blocking overlays.

Не делайте dark overlays просто светлее без проверки контраста текста и границ.

---

## Доступность

- Elevation не должен быть единственным способом понять выбранность, ошибку или состояние.
- Modal и blocking Drawer должны управлять focus trap и focus return по `accessibility.md`.
- Scrim не заменяет `aria-modal`, `inert` или управление фокусом.
- Floating layers не должны закрывать focused element без понятного сценария.
- Toast не должен перехватывать фокус, если пользователь не инициировал действие внутри него.

---

## Что Делать И Чего Избегать

| Делать | Избегать |
|---|---|
| Использовать border для статичных поверхностей | Добавлять shadow каждой карточке |
| Использовать `shadow/base` для лёгкого подъёма | Делать hover elevation с layout shift |
| Использовать `shadow/darker` для floating/overlay | Использовать один shadow для всех уровней |
| Добавлять scrim для blocking overlays | Затемнять фон без focus trap |
| Следовать z-index model | Использовать случайные большие z-index |

---

## Чеклист

- [ ] У компонента указан elevation level.
- [ ] Shadow используется только если компонент перекрывает или визуально поднимается над контентом.
- [ ] Border не потерян в Dark theme.
- [ ] Blocking overlay имеет scrim, focus trap и focus return.
- [ ] Z-index соответствует общей модели.
- [ ] Hover elevation не меняет layout.
- [ ] Состояния не передаются только глубиной или тенью.
