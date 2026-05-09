# Компоненты

Полный перечень компонентов production-ready дизайн-системы с описанием назначения, типов, размеров и состояний.

Компоненты разделены на шесть категорий: **действия**, **ввод и формы**, **навигация**, **отображение данных**, **обратная связь**, **оверлеи и layout**.

---

## Действия

### Button

Основной элемент взаимодействия. Инициирует действие: отправку формы, подтверждение, переход, запуск процесса.

**Типы**
| Тип | Назначение |
|-----|------------|
| `primary` | Главное действие на экране. Используется один раз на контекст |
| `secondary` | Второстепенное действие рядом с Primary |
| `ghost` | Третичное действие, минимальный визуальный вес |
| `text` | Действие без фона и рамки, встраивается в текстовый контент |
| `destruction` | Необратимые действия: удаление, отзыв доступа |

**Размеры**: `small` (24px) · `medium` (32px) · `large` (40px) · `extraLarge` (48px)

**Состояния**: `default` · `hover` · `active` · `focus` · `loading` · `disabled`

**Модификаторы**
- `icon-only` — кнопка без текста, только иконка
- `icon-left` / `icon-right` — иконка слева или справа от текста
- `full-width` — кнопка растягивается на всю ширину контейнера

---

### Button Group

Группа связанных кнопок, объединённых в единый контрол. Используется для переключения режимов или выбора одного из взаимоисключающих действий.

**Типы**: `horizontal` · `vertical`

**Размеры**: `small` · `medium` · `large` · `extraLarge`

**Состояния**: наследуются от Button

---

### Icon Button

Кнопка без текстовой метки. Используется в тулбарах, карточках, строках таблиц, где пространство ограничено.

**Типы**: `primary` · `secondary` · `ghost` · `destruction`

**Размеры**: `small` (24px) · `medium` (32px) · `large` (40px) · `extraLarge` (48px)

**Состояния**: `default` · `hover` · `active` · `focus` · `loading` · `disabled`

---

### Link

Текстовая навигация внутри контента. Отличается от Button тем, что ведёт к ресурсу, а не инициирует действие.

**Типы**: `default` · `subtle` · `danger`

**Модификаторы**: `icon-left` · `icon-right` · `external` (иконка внешней ссылки)

**Состояния**: `default` · `hover` · `active` · `focus` · `visited` · `disabled`

---

## Ввод И Формы

### Text Field

Однострочное поле ввода. Используется для текстовых данных: имён, email, паролей, поисковых запросов.

**Типы**
| Тип | Назначение |
|-----|------------|
| `default` | Стандартное поле ввода |
| `password` | Скрытый ввод с кнопкой показа |
| `search` | Поле с иконкой поиска и кнопкой очистки |
| `number` | Числовой ввод со стрелками инкремента |

**Размеры**: `small` · `medium` · `large` · `extraLarge`

**Состояния**: `default` · `hover` · `focus` · `filled` · `error` · `warning` · `success` · `read-only` · `disabled`

**Слоты**: `label` · `placeholder` · `helper-text` · `prefix-icon` · `suffix-icon` · `prefix-text` · `suffix-text` · `character-count`

---

### Text Area

Многострочное поле ввода. Используется для комментариев, описаний, длинных текстов.

**Типы**: `manual-resize` · `auto-resize` · `fixed`

**Размеры**: `small` · `medium` · `large` · `extraLarge`

**Состояния**: `default` · `hover` · `focus` · `filled` · `error` · `warning` · `success` · `read-only` · `disabled`

**Слоты**: `label` · `placeholder` · `helper-text` · `character-count`

---

### Checkbox

Элемент выбора одного или нескольких значений из набора. Может существовать самостоятельно или в составе группы.

**Типы**: `default` · `indeterminate` (частичный выбор, для родительского чекбокса группы)

**Размеры**: `small` (14px) · `medium` (16px) · `large` (18px) · `extraLarge` (20px)

**Состояния**: `default` · `hover` · `focus` · `checked` · `indeterminate` · `error` · `disabled`

**Слоты**: `label` · `helper-text`

---

### Radio

Элемент выбора одного значения из группы взаимоисключающих вариантов.

**Размеры**: `small` (14px) · `medium` (16px) · `large` (18px) · `extraLarge` (20px)

**Состояния**: `default` · `hover` · `focus` · `selected` · `error` · `disabled`

**Слоты**: `label` · `helper-text`

---

### Toggle

Переключатель бинарного состояния. Используется для мгновенного включения/выключения настройки без подтверждения.

**Размеры**: `small` (16×28px) · `medium` (20×36px) · `large` (24×44px)

**Состояния**: `off-default` · `off-hover` · `on-default` · `on-hover` · `disabled`

**Слоты**: `label` · `helper-text`

---

### Select

Выпадающий список для выбора одного значения из предустановленного набора. Отличается от Dropdown тем, что служит формовым контролом с value.

**Типы**: `single` · `multi` (множественный выбор с тегами)

**Размеры**: `small` · `medium` · `large` · `extraLarge`

**Состояния**: `default` · `hover` · `focus` · `open` · `filled` · `error` · `disabled`

**Слоты**: `label` · `placeholder` · `helper-text` · `prefix-icon` · `option-icon` · `option-description`

---

### Segmented Control

Горизонтальная группа взаимоисключающих сегментов. Используется для переключения режимов или фильтров внутри одного контекста.

**Типы**: `text-only` · `icon-only` · `icon+text`

**Размеры**: `small` · `medium` · `large` · `extraLarge`

**Состояния сегмента**: `active` · `non-active` · `hover` · `disabled`

**Количество сегментов**: 2–6

---

### Slider

Ползунок для выбора числового значения в диапазоне.

**Типы**: `single` · `range` (два ползунка для диапазона)

**Модификаторы**: `with-input` · `with-labels` · `with-steps`

**Состояния**: `default` · `hover` · `active` · `focus` · `disabled`

---

### File Upload

Зона загрузки файлов. Поддерживает клик и drag-and-drop.

**Типы**: `dropzone` · `button` (только кнопка без зоны) · `inline`

**Состояния**: `default` · `hover` · `drag-over` · `uploading` · `success` · `error` · `disabled`

**Слоты**: `label` · `description` · `accepted-formats` · `size-limit` · `file-list`

---

### Verification Code

Поле ввода кода подтверждения (OTP). Автоматически переключает фокус между ячейками.

**Типы**: `numeric` · `alphanumeric`

**Количество ячеек**: 4 · 6 · 8

**Состояния**: `default` · `focus` · `filled` · `error` · `disabled`

---

### Date Picker

Выбор даты из календарного виджета.

**Типы**: `single` · `range` · `month` · `year`

**Размеры**: `small` · `medium` · `large`

**Состояния**: `default` · `hover` · `focus` · `open` · `filled` · `error` · `disabled`

**Слоты**: `label` · `placeholder` · `helper-text` · `footer-actions`

---

### Time Picker

Выбор времени через инпут или скролл.

**Типы**: `input` · `scroll` · `combined` (дата + время)

**Форматы**: `12h` · `24h`

**Состояния**: `default` · `hover` · `focus` · `open` · `filled` · `error` · `disabled`

---

### Color Picker

Выбор цвета: палитра, спектр, HEX/RGB-ввод.

**Типы**: `swatch-only` · `full` (палитра + спектр + инпут) · `compact`

**Состояния**: `default` · `open` · `disabled`

---

## Навигация

### Breadcrumbs

Цепочка навигации, показывающая положение пользователя в иерархии контента.

**Типы**
| Тип | Назначение |
|-----|------------|
| `ghost` | Интерактивные ссылки с фоном при ховере |
| `text` | Текстовые ссылки без фона, встраиваются в контент |

**Разделители**: `slash` ( / ) · `triangle` ( › )

**Размеры**: `small` (24px) · `medium` (32px) · `large` (40px) · `extraLarge` (48px)

**Состояния элемента**: `default` · `hover` · `active` (текущая страница) · `pressed` · `focus` · `disabled`

**Модификаторы**: `options` (кнопка раскрытия свёрнутых уровней) · `collapsed` (многоточие при длинном пути)

---

### Tabs

Горизонтальный или вертикальный переключатель между секциями контента. В отличие от Segmented Control, Tabs управляют полноценными view.

**Типы**: `line` (подчёркивание) · `pill` (капсульный активный таб) · `card` (бокс-стиль)

**Ориентация**: `horizontal` · `vertical`

**Размеры**: `small` · `medium` · `large` · `extraLarge`

**Состояния таба**: `default` · `hover` · `active` · `focus` · `disabled`

**Модификаторы**: `icon-left` · `icon-top` · `badge` · `scrollable` (горизонтальный скролл при переполнении)

---

### Pagination

Навигация по страницам в таблицах и списках.

**Типы**: `numbered` · `prev-next-only` · `load-more` · `infinite-scroll`

**Размеры**: `small` · `medium` · `large`

**Состояния кнопки страницы**: `default` · `hover` · `active` · `focus` · `disabled`

**Слоты**: `page-size-select` · `total-count` · `jump-to-page`

---

### Sidebar / Navigation Menu

Боковая панель навигации. Содержит иерархический список разделов приложения.

**Типы**: `fixed` · `collapsible` · `overlay` (поверх контента на мобильных)

**Варианты элемента**: `item` · `group` · `sub-item` · `divider` · `section-title`

**Состояния элемента**: `default` · `hover` · `active` · `focus` · `disabled` · `expanded` / `collapsed`

**Размеры**: `compact` (32px item) · `default` (40px item) · `comfortable` (48px item)

**Слоты**: `logo-area` · `navigation-items` · `footer-items` · `collapse-trigger`

---

### Top Bar / Navbar

Верхняя панель приложения с логотипом, навигацией и глобальными действиями.

**Типы**: `app-bar` (фиксированная) · `page-header` (в потоке страницы) · `transparent`

**Слоты**: `logo` · `primary-nav` · `search` · `actions` · `avatar` · `breadcrumbs`

**Состояния**: `default` · `scrolled` (тень при прокрутке) · `mobile-collapsed`

---

### Stepper

Индикатор прогресса многошагового процесса: регистрация, оформление заказа, онбординг.

**Типы**: `horizontal` · `vertical`

**Варианты шага**: `upcoming` · `current` · `completed` · `error`

**Модификаторы**: `with-description` · `clickable` (можно перейти на шаг)

---

### Drawer

Панель, выезжающая с края экрана. Используется для дополнительного контента, настроек, фильтров.

**Позиция**: `left` · `right` · `bottom`

**Размеры**: `small` · `medium` · `large` · `full`

**Состояния**: `closed` · `open`

**Слоты**: `header` · `body` · `footer`

---

## Отображение Данных

### Avatar

Визуальное представление пользователя или сущности.

**Типы**
| Тип | Описание |
|-----|----------|
| `image` | Фото пользователя |
| `initials` | Инициалы на цветном фоне |
| `icon` | Иконка на фоне |
| `photo` | Крупное фото в круглом контейнере |

**Размеры**: `16px` · `20px` · `24px` · `32px` · `40px` · `48px` · `56px` · `64px` · `72px`

**Индикаторы**: `online` · `icon` · `verified-tick`

**Составные варианты**: `Avatar Group` · `Avatar Block` (аватар + имя + подпись) · `Avatar Add Button` · `Avatar More Button`

---

### Badge

Маленький счётчик или индикатор статуса, наложенный поверх иконки или элемента.

**Типы**: `notification` (число) · `dot` (без числа, просто точка)

**Размеры**: `small` (16px) · `medium` (20px)

**Состояния**: `default` · `hover`

---

### Tag

Метка для категоризации, фильтрации и маркировки контента.

**Типы**
| Тип | Описание |
|-----|----------|
| `read-only` | Только для отображения, не кликается |
| `selectable` | Можно выбирать как фильтр |
| `interactive` | Кликабельна, может закрываться |

**Цвета** (read-only): `gray` · `blue` · `mint` · `pistachio` · `purple` · `orange` · `yellow` · `red`

**Состояния**: `enabled` · `hover` · `selected` · `focus` · `disabled` · `skeleton`

---

### Chip

Компактный контрол для отображения значений множественного выбора или фильтров с кнопкой удаления.

**Типы**: `default` (без фона) · `filled` (с фоном)

**Состояния**: `default` · `hover` · `active`

**Под-компоненты**: `chipItem` (текст + иконка) · `chipControl` (стрелка / крестик удаления)

---

### Table

Структурированное отображение данных в строках и столбцах.

**Типы ячейки**: `text` · `tag` · `avatar` · `badge` · `actions` · `checkbox` · `custom`

**Типы шапки**: `label` · `sortable` · `filter`

**Состояния строки**: `default` · `hover` · `selected` · `expanded`

**Модификаторы таблицы**: `fixed-header` · `striped` · `bordered` · `compact` · `resizable-columns` · `row-selection` · `expandable-rows`

**Слоты**: `toolbar` · `header` · `body` · `footer` · `pagination` · `empty-state`

---

### Card

Контейнер для группировки связанного контента и действий.

**Типы**: `default` · `clickable` · `selected` · `outlined` · `elevated`

**Состояния**: `default` · `hover` · `active` · `focus` · `selected` · `disabled`

**Слоты**: `media` · `header` · `body` · `footer` · `actions` · `badge`

---

### Description List

Отображение пар ключ–значение: детали объекта, свойства записи, характеристики.

**Типы**: `horizontal` (ключ и значение в одной строке) · `vertical` (ключ над значением) · `table` (в виде таблицы)

**Модификаторы**: `bordered` · `striped` · `compact`

---

### Divider

Горизонтальный или вертикальный разделитель для визуального отделения секций.

**Типы**: `horizontal` · `vertical`

**Варианты**: `solid` · `dashed` · `dotted`

**Модификаторы**: `with-text` · `with-icon` (текст или иконка по центру разделителя)

---

### Accordion

Сворачиваемые секции контента. Экономит пространство при большом количестве информации.

**Типы**: `single` (открыт один элемент) · `multiple` (можно открыть несколько)

**Варианты**: `default` · `bordered` · `elevated`

**Состояния элемента**: `collapsed` · `expanded` · `hover` · `focus` · `disabled`

---

### Timeline

Хронологическое отображение событий или шагов процесса.

**Ориентация**: `vertical` · `horizontal`

**Варианты точки**: `dot` · `icon` · `number` · `avatar`

**Состояния события**: `upcoming` · `current` · `completed` · `error`

---

### Stat / Metric

Крупное отображение числовой метрики с подписью и опциональным трендом.

**Варианты тренда**: `up` · `down` · `neutral`

**Слоты**: `label` · `value` · `unit` · `trend` · `description`

---

### Chat Bubble

Пузырь сообщения в интерфейсах чата.

**Типы**: `outgoing` (от текущего пользователя) · `incoming` (от собеседника)

**Варианты**: `text` · `image` · `file` · `audio`

**Состояния**: `sent` · `delivered` · `read` · `error`

**Слоты**: `avatar` · `content` · `timestamp` · `status` · `reactions`

---

## Обратная Связь

### Alert

Встроенное сообщение для информирования пользователя в контексте страницы или формы. Не исчезает автоматически.

**Типы**: `info` · `success` · `warning` · `error`

**Размеры**: `small` (24px) · `medium` (32px) · `large` (40px) · `extraLarge` (48px+)

**Модификаторы**: `dismissible` (крестик закрытия) · `with-action` (кнопка-ссылка внутри) · `with-icon`

---

### Toast / Snackbar

Временное уведомление, накладывающееся поверх интерфейса. Исчезает автоматически или по действию пользователя.

**Типы**: `info` · `success` · `warning` · `error`

**Позиция**: `top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

**Модификаторы**: `dismissible` · `with-action` · `with-icon` · `persistent` (не исчезает автоматически)

**Состояния**: `entering` · `visible` · `exiting`

---

### Modal / Dialog

Диалоговое окно, блокирующее взаимодействие с остальным интерфейсом до принятия решения.

**Типы**
| Тип | Описание |
|-----|----------|
| `default` | Стандартный диалог с заголовком, телом и футером |
| `confirmation` | Запрос подтверждения действия (2 кнопки) |
| `alert` | Информационное сообщение (1 кнопка) |
| `form` | Форма внутри модала |
| `fullscreen` | Полноэкранный оверлей |

**Размеры**: `small` (400px) · `medium` (560px) · `large` (720px) · `fullscreen`

**Состояния**: `closed` · `opening` · `open` · `closing`

**Слоты**: `header` · `body` · `footer`

---

### Tooltip

Подсказка при наведении или фокусе на элементе. Кратко объясняет назначение элемента.

**Позиция**: `top` · `bottom` · `left` · `right` · `top-start` · `top-end` · `bottom-start` · `bottom-end`

**Варианты**: `default` (тёмный фон) · `light` (светлый фон с рамкой)

**Триггер**: `hover` · `focus` · `click`

**Слоты**: `content` (текст или кастомный HTML)

---

### Popover

Расширенная подсказка с интерактивным содержимым: меню, списки, форма, действия.

**Типы**: `default` · `icon` · `emoji` · `checkbox` · `avatar` · `custom`

**Позиция**: `top` · `bottom` · `left` · `right` + варианты start/end

**Триггер**: `click` · `hover`

**Состояния**: `closed` · `open`

---

### Spinner / Loader

Индикатор неопределённой загрузки. Используется, когда конец операции неизвестен.

**Типы**: `circular` · `linear`

**Размеры**: `small` (16px) · `medium` (24px) · `large` (40px)

**Варианты**: `standalone` · `overlay` (поверх контента) · `button` (внутри кнопки)

---

### Progress Bar

Индикатор определённого прогресса. Используется, когда известна доля выполненного.

**Типы**: `linear` · `circular`

**Варианты**: `default` · `segmented` · `with-label`

**Состояния**: `default` · `success` · `error`

---

### Skeleton

Заглушки-плейсхолдеры, повторяющие форму будущего контента во время загрузки.

**Типы примитивов**: `text` · `circle` · `rectangle` · `rounded`

**Анимация**: `pulse` · `wave` · `none`

**Составные паттерны**: `card-skeleton` · `list-skeleton` · `table-skeleton` · `form-skeleton`

---

### Empty State

Экран или блок, отображаемый при отсутствии данных. Направляет пользователя к первому действию.

**Типы**: `no-data` · `no-results` · `no-access` · `error` · `first-time`

**Слоты**: `illustration` · `title` · `description` · `action` (кнопка или ссылка)

---

## Оверлеи И Layout

### Dropdown / Menu

Список опций, раскрывающийся при клике на триггер. Используется для действий, навигации и сортировки.

**Типы**
| Тип | Описание |
|-----|----------|
| `menu` | Список действий (кнопки) |
| `select-menu` | Список для выбора значения |
| `context-menu` | Появляется по правому клику |
| `command-palette` | Поиск + список команд |

**Варианты элемента**: `default` · `with-icon` · `with-description` · `with-badge` · `destructive` · `disabled` · `separator` · `group-title` · `checkbox-item` · `radio-item`

**Состояния элемента**: `default` · `hover` · `active` · `focus` · `disabled`

**Позиция**: `bottom-start` · `bottom-end` · `top-start` · `top-end`

---

### Search

Поиск с автодополнением и отображением результатов.

**Типы**: `inline` (встроен в страницу) · `overlay` (полноэкранный) · `command-palette`

**Состояния**: `empty` · `typing` · `loading` · `results` · `no-results`

**Слоты**: `input` · `results-list` · `recent-items` · `suggested-items` · `footer`

---

### Container

Обёртка, ограничивающая максимальную ширину контента и центрирующая его на странице.

**Максимальные ширины**: `sm` (640px) · `md` (768px) · `lg` (1024px) · `xl` (1280px) · `2xl` (1440px) · `full` (100%)

**Отступы**: адаптивные горизонтальные padding по брейкпоинтам

---

### Grid

Сетка для компоновки интерфейса.

**Типы**: `12-column` · `auto` (CSS Grid auto-fill)

**Брейкпоинты**: `xs` (320px) · `sm` (640px) · `md` (768px) · `lg` (1024px) · `xl` (1280px) · `2xl` (1440px)

**Параметры**: `columns` · `gap` · `gutter` · `margin`

---

### Form

Составной компонент для группировки полей ввода с лейблами, подсказками и обработкой валидации.

**Типы**: `vertical` (лейбл над полем) · `horizontal` (лейбл рядом с полем) · `inline`

**Слоты**: `field-groups` · `submit-actions` · `error-summary`

---

### Notification Center

Панель истории уведомлений. Открывается как оверлей или боковая панель.

**Типы элемента**: `info` · `success` · `warning` · `error`

**Состояния элемента**: `unread` · `read` · `dismissed`

**Слоты**: `header` · `filter-tabs` · `notification-list` · `empty-state`

---

## Справочная матрица

Быстрый обзор покрытия компонентов по категориям.

### Действия
| Компонент | Типы | Размеры | Состояний |
|-----------|------|---------|-----------|
| Button | 5 | 4 | 6 |
| Button Group | 2 | 4 | — |
| Icon Button | 4 | 4 | 6 |
| Link | 3 | — | 6 |

### Ввод И Формы
| Компонент | Типы | Размеры | Состояний |
|-----------|------|---------|-----------|
| Text Field | 4 | 4 | 9 |
| Text Area | 3 | 4 | 9 |
| Checkbox | 2 | 4 | 7 |
| Radio | 1 | 4 | 6 |
| Toggle | 1 | 3 | 5 |
| Select | 2 | 4 | 7 |
| Segmented Control | 3 | 4 | 4 |
| Slider | 2 | — | 5 |
| File Upload | 3 | — | 7 |
| Verification Code | 2 | — | 5 |
| Date Picker | 4 | 3 | 7 |
| Time Picker | 3 | — | 6 |

### Навигация
| Компонент | Типы | Размеры | Состояний |
|-----------|------|---------|-----------|
| Breadcrumbs | 2 | 4 | 6 |
| Tabs | 3 | 4 | 5 |
| Pagination | 4 | 3 | 5 |
| Sidebar | 3 | 3 | 5 |
| Top Bar | 3 | — | 3 |
| Stepper | 2 | — | 4 |
| Drawer | 4 | — | 2 |

### Отображение Данных
| Компонент | Типы | Размеры | Состояний |
|-----------|------|---------|-----------|
| Avatar | 4 | 9 | 5 |
| Badge | 2 | 2 | 2 |
| Tag | 3 | 1 | 6 |
| Chip | 2 | 1 | 3 |
| Table | — | — | 5 |
| Card | 5 | — | 6 |
| Description List | 3 | — | — |
| Divider | 2 | — | — |
| Accordion | 2 | — | 5 |
| Timeline | 2 | — | 4 |
| Chat Bubble | 2 | — | 4 |

### Обратная Связь
| Компонент | Типы | Размеры | Состояний |
|-----------|------|---------|-----------|
| Alert | 4 | 4 | — |
| Toast | 4 | — | 3 |
| Modal | 5 | 4 | 4 |
| Tooltip | 2 | — | — |
| Popover | 6 | — | 2 |
| Spinner | 2 | 3 | — |
| Progress Bar | 2 | — | 3 |
| Skeleton | 4 | — | — |
| Empty State | 5 | — | — |

### Оверлеи И Layout
| Компонент | Типы | Размеры | Состояний |
|-----------|------|---------|-----------|
| Dropdown / Menu | 4 | — | 5 |
| Search | 3 | — | 5 |
| Container | 6 | — | — |
| Grid | 2 | 6 | — |
| Form | 3 | — | — |
| Notification Center | — | — | 3 |
