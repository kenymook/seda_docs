# Доступность

> Цель: все компоненты SEDA UI должны быть доступны с клавиатуры, понятны assistive technologies и визуально различимы без зависимости только от цвета.

SEDA UI следует подходу **native-first**: сначала используем семантический HTML и нативное поведение платформы, затем добавляем ARIA только там, где семантики HTML недостаточно.

---

## Стандарт

Базовый уровень: **WCAG 2.2 AA** для всех production-ready компонентов.

| Область | Минимальное требование |
|---|---|
| Текст | Контраст минимум `4.5:1` |
| Крупный текст | Контраст минимум `3:1` |
| Иконки и UI boundaries | Контраст минимум `3:1` к соседним цветам |
| Индикатор фокуса | Видим, не зависит только от цвета |
| Клавиатура | Все интерактивные элементы доступны без мыши |
| Touch target | Минимум `44x44px` |
| Движение | Есть fallback для `prefers-reduced-motion` |

> `disabled-контент может иметь сниженный контраст, если он действительно недоступен и не несет критичную информацию.

---

## Принципы

- **Native-first.** Используйте <button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<dialog> и другие нативные элементы, когда они подходят по смыслу.
- **Паритет клавиатуры.** Все действия, доступные мышью, должны быть доступны с клавиатуры.
- **Видимый фокус.** Пользователь всегда видит текущую точку фокуса.
- **Семантика до ARIA.** ARIA не заменяет неправильную семантику.
- **Состояние не только цветом.** Ошибки, предупреждения и destructive actions не передаются только цветом.
- **Стабильное взаимодействие.** Focus не теряется после закрытия Modal, Drawer, Dropdown, Popover или Tooltip.
- **Без gesture-only действий.** Сценарий не должен требовать только hover, drag, swipe или long press без альтернативы.

---

## Семантический HTML И Roles

| Сценарий | Базовый элемент | Когда нужна ARIA |
|---|---|---|
| Действие | <button>` | `aria-busy`, `aria-disabled`, `aria-label` для icon-only |
| Навигация | `<a href>` | `aria-current`, уточняющий `aria-label` для неясного текста |
| Текстовое поле | `<input>` / `<textarea>` | `aria-describedby`, `aria-invalid`, `aria-required` |
| Checkbox | `<input type="checkbox">` | `aria-checked="mixed"` для indeterminate при кастомной реализации |
| Radio | `<input type="radio">` | `radiogroup` / `aria-labelledby` для кастомной группы |
| Select | `<select>` или combobox pattern | `aria-expanded`, `aria-controls`, `aria-activedescendant` для кастомного listbox |
| Tabs | `tablist` / `tab` / `tabpanel` | `aria-selected`, `aria-controls`, `aria-labelledby` |
| Dialog / Modal | `<dialog>` или `role="dialog"` | `aria-modal`, `aria-labelledby`, `aria-describedby` |
| Table | `<table>` | `aria-sort`, `aria-selected` при интерактивных строках |
| Progress | `<progress>` или `role="progressbar"` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` |
| Status update | Текстовый контейнер | `aria-live="polite"` или `aria-live="assertive"` |

### Правила

- Не дублируйте role на нативном элементе без необходимости: `<button role="button">` не нужен.
- Не используйте `<div>` или `<span>` как интерактивный элемент, если можно использовать нативный HTML.
- `aria-label` обязателен, если нет видимого текстового label.
- Видимый label предпочтительнее скрытого label.
- Tooltip не заменяет label. Tooltip только дополняет понятное имя элемента.

---

## Клавиатура

### Общие Правила

| Клавиша | Ожидаемое поведение |
|---|---|
| `Tab` | Переход к следующему интерактивному элементу |
| `Shift+Tab` | Переход к предыдущему интерактивному элементу |
| `Enter` | Активация ссылки, кнопки, выбранной опции или submit |
| `Space` | Активация button-like control, checkbox, toggle |
| `Escape` | Закрытие временного слоя: Modal, Drawer, Dropdown, Popover, Tooltip |
| `Arrow keys` | Навигация внутри composite widgets |
| `Home` / `End` | Переход к началу/концу списка, слайдера или группы, если применимо |

### Порядок Фокуса

- Порядок фокуса следует визуальному и логическому порядку интерфейса.
- `disabled`-элементы не участвуют в tab-order.
- `read-only` поля обычно остаются в tab-order, потому что значение можно прочитать и скопировать.
- Фокус не должен попадать на декоративные элементы.
- После закрытия временного слоя фокус возвращается на trigger или логически следующий элемент.

### Составные Виджеты

| Компонент | Паттерн фокуса |
|---|---|
| Radio Group | Arrow keys перемещают выбор внутри группы |
| Segmented Control | Arrow keys перемещают выбранный сегмент |
| Tabs | Arrow keys перемещают фокус между tabs |
| Select / Combobox | Фокус остается на trigger/input, активная опция связана через `aria-activedescendant` |
| Date Picker | Фокус перемещается внутри calendar grid |
| Modal / Drawer | Focus trap внутри открытого слоя |
| Dropdown / Menu | Arrow keys перемещают активный item, `Escape` закрывает |

---

## Индикатор Фокуса

Focus indicator обязателен для всех интерактивных элементов.

| Требование | Правило SEDA |
|---|---|
| Token | Используйте `focus/ring` |
| Видимость | Кольцо видно на light, dark, brand и inverse поверхностях |
| Offset | Не перекрывает содержимое и не обрезается контейнером |
| Не только цвет | При необходимости используйте outline, border, shadow или shape change |
| Состояния | `focus` может сочетаться с `hover`, `selected`, `checked`, `error` |

Не удаляйте focus outline без замены на равноценный видимый focus indicator.

---

## Цвет И Контраст

| Пара | Минимум |
|---|---:|
| Основной текст / фон | `4.5:1` |
| Label или helper text / фон | `4.5:1` |
| Крупный текст / фон | `3:1` |
| Иконка / соседний цвет | `3:1` |
| Граница интерактивного контрола / соседний цвет | `3:1` |
| Индикатор фокуса / соседние цвета | `3:1` |

### Передача Состояний

- `error`, `warning`, `success` должны иметь текст, иконку или другое нецветовое подтверждение.
- Destructive action не передается только красным цветом: label должен явно описывать действие.
- Selected/current state не должен отличаться только цветом, если это ключевое состояние навигации или выбора.

---

## Имена, Подписи И Описания

### Доступное Имя

Каждый интерактивный элемент должен иметь доступное имя.

Приоритет:
1. Видимый текст.
2. Связанный `<label>`.
3. `aria-labelledby`.
4. `aria-label`.

### Описания

Используйте `aria-describedby`, когда элементу нужно дополнительное объяснение:

- helper text;
- error text;
- format hint;
- character count;
- file constraints;
- destructive warning.

### Icon-only Контролы

Icon-only action всегда требует:

- `aria-label`;
- Tooltip с тем же смыслом;
- видимый focus indicator;
- touch target минимум `44x44px`.

---

## Формы И Валидация

| Сценарий | Требование |
|---|---|
| Label | Всегда видимый или программно связанный label |
| Required | Видимый маркер и `aria-required="true"` при кастомной реализации |
| Helper text | Связать через `aria-describedby` |
| Error | `aria-invalid="true"` и связанный error text |
| Error summary | Для длинных форм показывать summary над формой |
| Timing | Не показывать ошибку на пустом untouched field |
| Recovery | Ошибка объясняет, как исправить ввод |

### Состояния Валидации

- `error` блокирует отправку, если данные невалидны.
- `warning` предупреждает, но не всегда блокирует.
- `success` подтверждает корректность, но не заменяет label или helper text.

---

## Live Regions И Асинхронная Обратная Связь

| Сценарий | ARIA |
|---|---|
| Toast / Snackbar | `aria-live="polite"` |
| Critical error | `aria-live="assertive"` |
| Loading section | `aria-busy="true"` на контейнере |
| Spinner без видимого текста | `aria-label="Загрузка"` |
| Progress | `role="progressbar"` или `<progress>` |
| Notification Center | `aria-live="polite"` для новых элементов |

Правило: не озвучивайте слишком много. Live region должен сообщать изменение, а не перечитывать весь экран.

---

## Overlay-Компоненты

| Компонент | Требования |
|---|---|
| Modal | `role="dialog"` / `<dialog>`, `aria-modal="true"`, focus trap, `Escape` закрывает |
| Drawer | focus trap, `aria-labelledby` или `aria-label`, возврат фокуса на trigger |
| Dropdown / Menu | `aria-expanded`, `aria-haspopup`, keyboard navigation, `Escape` закрывает |
| Popover | `aria-expanded`, понятный trigger, возврат фокуса |
| Tooltip | `aria-describedby`, открытие по hover и focus, не содержит интерактивных элементов |

Фоновый контент не должен быть доступен для фокуса, пока открыт модальный слой.

---

## Touch И Pointer

- Минимальный touch target: `44x44px`.
- Маленький визуальный control может иметь невидимую hit area.
- Hover не считается обязательным состоянием для touch-only устройств.
- Drag-and-drop должен иметь keyboard alternative.
- Context menu по right click должен иметь альтернативный trigger.

---

## Движение

- Все декоративные или длительные анимации должны уважать `prefers-reduced-motion: reduce`.
- Reduced-motion fallback не должен скрывать информацию.
- Loading indicators не должны вызывать layout shift.
- Auto-dismiss элементы должны останавливаться при hover или focus внутри элемента.

---

## Чеклист Для Дизайна

Перед передачей компонента в разработку проверьте:

- [ ] Есть видимый или программный label.
- [ ] Все состояния различимы не только цветом.
- [ ] Contrast соответствует минимумам SEDA.
- [ ] Focus indicator показан во всех интерактивных состояниях.
- [ ] Touch target минимум `44x44px`.
- [ ] Error/warning/success имеют текст или понятную иконку.
- [ ] Icon-only controls имеют tooltip и accessible name.
- [ ] Порядок фокуса соответствует визуальному порядку.
- [ ] Overlay описывает поведение закрытия и возврата фокуса.
- [ ] Движение имеет fallback для reduced motion.

## Чеклист Для Разработки

Перед публикацией компонента проверьте:

- [ ] Использован нативный HTML там, где возможно.
- [ ] ARIA не дублирует нативную семантику.
- [ ] Клавиатурное взаимодействие соответствует паттерну компонента.
- [ ] `disabled` и `read-only` реализованы разными состояниями.
- [ ] `aria-describedby` связывает helper/error text с control.
- [ ] `aria-invalid` выставляется только при ошибке.
- [ ] Live regions используются только для динамических сообщений.
- [ ] Focus trap работает для modal overlays.
- [ ] После закрытия overlay фокус возвращается корректно.
- [ ] Компонент проверен в light и dark темах.

---

## Критерии Готовности Компонента

Компонент может получить статус `ready`, только если:

1. Он доступен с клавиатуры.
2. У всех интерактивных частей есть accessible name.
3. Focus indicator видим и использует `focus/ring`.
4. Контраст текста, иконок и интерактивных границ соответствует требованиям.
5. Состояния валидации имеют текстовое объяснение.
6. Icon-only режим имеет `aria-label` и Tooltip.
7. Overlay-компоненты управляют focus trap и focus return.
8. Асинхронная обратная связь использует `aria-busy`, `aria-live` или progress semantics, когда это нужно.
9. Touch target не меньше `44x44px`.
10. Reduced-motion сценарий описан, если компонент анимирован.
