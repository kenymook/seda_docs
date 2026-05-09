# Tabs

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Tabs — горизонтальный или вертикальный переключатель между секциями контента. В отличие от Segmented Control, Tabs управляют полноценными view: смена таба приводит к смене отображаемого контента.

### When to use

**Use** — для переключения между разделами с полноценным контентом: вкладки профиля (Основное / Безопасность / Уведомления), разделы объекта (Описание / Отзывы / Условия).

**Don't use:**
- Для переключения режима отображения одних данных — используйте **Segmented Control**
- Если вкладок больше 6–7 и они не помещаются — используйте **Select** или навигационное меню
- Для wizard-потоков — используйте **Stepper**

### Core principles

- **Один активный таб** — всегда ровно один таб выбран
- **Контент загружается при смене** — не показывайте все панели одновременно, скрытые через `display: none`
- **Не используйте Tabs для навигации между страницами** — для этого есть Sidebar / Top Bar

---

## 2. Anatomy

```
Horizontal:
┌─────────┬──────────┬─────────┬─────────┐
│  Tab 1  │● Tab 2  │  Tab 3  │  Tab 4  │
└─────────┴──────────┴─────────┴─────────┘▔▔▔▔▔▔▔▔▔
                    [tab panel content]

Vertical:
│ Tab 1      │
│● Tab 2    │  [tab panel content]
│ Tab 3      │
```

| Slot | Обязательность | Описание |
|---|---|---|
| `tab` | required (2+) | Отдельный таб |
| `tab-label` | required | Текст таба |
| `tab-icon` | optional | Иконка слева или сверху от label |
| `tab-badge` | optional | Badge с числом на табе |
| `tab-panel` | required | Контентная панель, связанная с табом |
| `tab-list` | auto | Контейнер всех табов |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `line` | Подчёркивание под активным табом. Лаконичный, нейтральный |
| `pill` | Активный таб с заливкой в форме капсулы. Более выраженный акцент |
| `card` | Активный таб как карточка (с рамкой или тенью). Ощущение «вкладки браузера» |

### Ориентации

| Ориентация | Описание |
|---|---|
| `horizontal` | Табы в строку. Стандарт |
| `vertical` | Табы в колонку. Для боковых панелей |

### Modifiers

| Модификатор | Описание |
|---|---|
| `icon-left` | Иконка слева от label |
| `icon-top` | Иконка над label. Только для `horizontal` |
| `badge` | Числовой Badge на табе |
| `scrollable` | Горизонтальный скролл при переполнении `horizontal` |

---

## 4. Sizes

| Size | Height (таб) | Font / Line | Контекст |
|---|---|---|---|
| `small` | 24px | 12px / 16px | Компактные панели |
| `medium` | 32px | 14px / 20px | Карточки, боковые панели — дефолт |
| `large` | 40px | 16px / 24px | Основные разделы страницы |
| `extraLarge` | 48px | 18px / 28px | Hero-зоны, крупные блоки |

---

## 5. States

### State types

- **interaction:** `hover`, `focus`
- **selection:** `active` (выбранный таб)
- **availability:** `disabled`

### State matrix (на отдельный таб)

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Невыбранный таб | Базовый цвет `text/tertiary` |
| `hover` | Курсор над табом | Цвет `text/secondary`, лёгкий фон |
| `active` | Выбранный таб | Цвет `text/primary`, индикатор типа |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `disabled` | Таб недоступен | `status/disabled/text`, cursor `not-allowed` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `active` + `hover` | ✓ | Наведение на выбранный таб |
| `active` + `focus` | ✓ | Фокус на выбранном |
| `disabled` + `active` | ✗ | Нельзя быть выбранным и недоступным |
| `disabled` + `hover` | ✗ | `disabled` блокирует взаимодействие |

---

## 6. Details on Types / Variants

### line
Самый нейтральный тип. Индикатор активного таба — линия снизу (horizontal) или слева (vertical). Цвет линии — `border/brand/default`. Не имеет фоновой заливки на активном табе.

### pill
Активный таб обёрнут в заливку (капсула). Фон `container/default` или `container/brand/default` в зависимости от конфигурации темы. Неактивные табы прозрачны.

### card
Активный таб визуально «поднят» — рамка снизу у панели или тень. Создаёт ощущение вкладок браузера. Сложнее в поддержке тёмной темы — требует проверки контраста рамки.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на tab list |
| `→` / `↓` | Следующий таб (в зависимости от ориентации) |
| `←` / `↑` | Предыдущий таб |
| `Home` | Первый таб |
| `End` | Последний таб |
| `Enter` / `Space` | Активация таба |

> По умолчанию навигация стрелками **автоматически активирует** таб (automatic activation). Если загрузка контента тяжёлая — используйте manual activation: `Enter`/`Space` активируют, стрелки только перемещают фокус.

### Scrollable overflow
При переполнении `scrollable` — добавляются стрелки прокрутки или нативный скролл. Активный таб всегда прокручивается в видимость при активации.

### Focus management
После смены таба фокус остаётся на tab list. Переход в panel — через Tab.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="tablist"` | — | Контейнер табов |
| `role="tab"` | — | Каждый таб |
| `role="tabpanel"` | — | Каждая панель контента |
| `aria-selected="true"` | — | Активный таб |
| `aria-selected="false"` | — | Неактивный таб |
| `aria-controls` | ID panel | Таб → связанная панель |
| `aria-labelledby` | ID tab | Панель → связанный таб |
| `aria-disabled="true"` | — | Недоступный таб |
| `tabindex="0"` | — | Активный таб (в tab-order) |
| `tabindex="-1"` | — | Неактивные табы (out of tab-order) |

### Visual
- Активный таб не передаётся только цветом — индикатор (линия, заливка) обязателен
- Контрастность: минимум 4.5:1 для текста табов
- Focus ring видим на любом фоне

---

## 9. Design Tokens

### Tab text

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tabs-text-default` | Цвет неактивного таба | `text/tertiary` | `text/tertiary` |
| `--tabs-text-hover` | Цвет hover | `text/secondary` | `text/secondary` |
| `--tabs-text-active` | Цвет активного таба | `text/primary` | `text/primary` |
| `--tabs-text-disabled` | Цвет disabled | `status/disabled/text` | `status/disabled/text` |

### Indicators (line type)

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tabs-indicator` | Линия активного таба | `border/brand/default` | `border/brand/default` |
| `--tabs-track` | Базовая линия под всеми табами | `border/default` | `border/default` |

### Pill / Card backgrounds

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tabs-pill-bg` | Фон активного `pill` таба | `container/default` | `container/default` |
| `--tabs-pill-bg-hover` | Фон hover неактивного | `surface/hover` | `surface/hover` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tabs-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
