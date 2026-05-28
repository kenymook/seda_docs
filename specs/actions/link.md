# Link

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `state-vocabulary.md`, `tokens.md`, `typography.md`

---

## 1. Key Principles / Принципы использования

### Что это

Link — навигационный текстовый компонент для перехода к ресурсу: странице, URL, якорю, файлу, справке или внешнему сайту. В отличие от Button, Link не запускает продуктовую операцию и не подтверждает действие; он ведет пользователя к другому месту.

В SEDA AI Link является navigation contract: он должен явно описывать destination, доступное имя, состояние visited, правила external links, token mapping и отличие от action-компонентов. AI может помогать с текстом ссылки и handoff notes, но не должен превращать Link в Button или придумывать visual variants без токенов.

### Когда использовать

Используйте Link, когда:

- элемент ведет на другую страницу, URL, якорь или файл;
- пользователь должен открыть справку, документацию или внешний ресурс;
- ссылка встроена в текстовый абзац;
- нужно показать navigation внутри Breadcrumbs, Top Bar или content block;
- destination можно выразить через `href`.

### Не используйте

Не используйте Link, когда:

- элемент отправляет форму, сохраняет, удаляет, подтверждает или запускает процесс — используйте Button;
- нет `href` или реального перехода;
- нужен icon-only control — используйте Icon Button;
- нужно выбрать режим или состояние — используйте Button Group, Segmented Control, Radio или Toggle;
- ссылка используется только как декоративно-синий текст;
- disabled behavior является основным сценарием — пересмотрите flow, потому что недоступная ссылка часто скрывает проблему доступности.

### Основные принципы

- **Navigation, not action** — Link ведет к ресурсу, Button выполняет действие.
- **Native anchor first** — Link реализуется через `<a href="...">`.
- **Destination is clear** — label объясняет, куда ведет ссылка.
- **No vague labels** — избегайте `здесь`, `подробнее`, `читать`, если destination не понятен из контекста.
- **External is explicit** — внешняя ссылка или новая вкладка должны быть обозначены в тексте, icon или hidden text.
- **Visited is meaningful** — visited state помогает пользователю понимать, где он уже был.
- **Tokens before visuals** — foreground, disabled и focus берутся из `link` tokens.
- **AI assists, system governs** — AI может предложить label, но system contract определяет семантику, props и tokens.

### Связанные спецификации

- [Button](../specs/actions/button.md) — product action вместо navigation.
- [Icon Button](../specs/actions/icon-button.md) — icon-only action.
- [Breadcrumbs](../specs/navigation/breadcrumbs.md) — навигационный путь.
- [Top Bar](../specs/navigation/top-bar.md) — навигация верхнего уровня.
- [Tabs](../specs/navigation/tabs.md) — переключение разделов в текущем интерфейсе.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Нативный `<a href="...">` или framework link, который рендерит anchor. |
| `label` | Да | Видимый текст ссылки. |
| `iconLeft` | Нет | Иконка перед label, если она помогает распознать destination. |
| `iconRight` | Нет | Иконка после label: external, download, arrow, disclosure. |
| `hiddenText` | Условно | Текст для screen reader, например `откроется в новой вкладке`. |

### Правила анатомии

- `href` обязателен для настоящего Link.
- `label` не должен состоять только из иконки.
- Icon не заменяет понятный label.
- External icon должен быть декоративным, если hidden text уже сообщает о новой вкладке.
- Если элемент выглядит как Link, но не имеет destination, это не Link.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Типичный сценарий |
|---|---|---|
| `default` | Основная ссылка в контенте. | Inline text, help link, document link. |
| `subtle` | Ссылка с меньшим визуальным акцентом. | Secondary metadata, card footer, compact UI. |
| `inverse` | Ссылка на темном или inverse фоне. | Toast, dark header, inverse surface. |
| `danger` | Предупреждающая ссылка в рискованном контексте. | Справка о последствиях удаления, ссылка на revoke policy. |

### Modifiers

| Modifier | Назначение | Ограничения |
|---|---|---|
| `external` | Показывает, что ссылка ведет за пределы продукта или открывается в новой вкладке. | Нужны `target`, `rel` и accessible announcement. |
| `download` | Ссылка скачивает файл. | Укажите тип или формат файла, если это важно. |
| `iconLeft` | Добавляет leading icon. | Icon должен поддерживать смысл destination. |
| `iconRight` | Добавляет trailing icon. | Часто используется для external, download или arrow. |
| `strong` | Усиливает типографический вес. | Не заменяет Button и не создает новый visual priority. |

### Variant notes

- `danger` есть в Figma component set, но в `tokens.json` нет отдельной component-ветки `link.danger`. Пока это token gap: используйте semantic fallback только после system review.
- `inverse` есть в component tokens и component-lab; если Figma variant отсутствует в конкретной библиотеке, нужно синхронизировать Figma component set.

---

## 4. Sizes / Размеры

Link наследует типографику из контекста или использует documented size, если компонент вынесен в отдельный control.

| Size | Применение | Правило |
|---|---|---|
| `s` | Secondary metadata, compact rows. | Не использовать для ключевой навигации без достаточного hit area. |
| `m` | Default product UI. | Основной размер для standalone links. |
| `l` | Larger content blocks. | Подходит для карточек и пустых состояний. |
| `xl` | Prominent text context. | Не использовать как замену Button. |

### Правила размеров

- Inline Link наследует font size и line height от surrounding text.
- Standalone Link может использовать size prop, если он есть в реализации.
- Icon size должен соответствовать text size.
- Touch target должен быть не меньше 44x44px там, где ссылка используется как отдельный tap target.

---

## 5. States / Состояния

| State | Когда возникает | Правило |
|---|---|---|
| `default` / `base` | Ссылка доступна и не посещена. | Используются default foreground tokens. |
| `hover` | Pointer над ссылкой. | Можно добавлять underline и hover foreground. |
| `pressed` / `active` | Пользователь нажимает ссылку. | Используются pressed foreground tokens. |
| `focus` | Keyboard focus. | Focus ring должен быть видим. |
| `visited` | Browser считает destination посещенным. | Используются visited tokens для default variant. |
| `visitedHover` | Hover на visited ссылке. | Используется отдельный visited hover token. |
| `visitedPressed` | Pressed на visited ссылке. | Используется отдельный visited pressed token. |
| `disabled` | Ссылка временно недоступна. | Избегайте, если можно убрать ссылку или объяснить условие. |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
|---|---:|---|
| `visited` + `hover` | Да | Используйте `visitedHover`, если доступен. |
| `visited` + `pressed` | Да | Используйте `visitedPressed`, если доступен. |
| `hover` + `focus` | Да | Hover не должен скрывать focus ring. |
| `disabled` + interactive state | Нет | Disabled отменяет navigation и interaction. |

---

## 6. Behavior / Поведение

### Native behavior

- Используйте `<a href="...">`.
- Не используйте `<button>` для navigation.
- Не используйте `<div>` с click handler.
- Для framework routing допустим wrapper, если итоговая разметка остается anchor-compatible.
- `href` должен быть валидным URL, route, anchor или file destination.

### External links

- Для `target="_blank"` всегда добавляйте `rel="noopener noreferrer"`.
- Сообщайте пользователю, что ссылка откроется в новой вкладке: visible text, icon с hidden text или `aria-label`.
- External icon не должен быть единственным сигналом, если icon неочевиден.
- Для download links указывайте формат или размер файла, если это влияет на ожидания пользователя.

### Disabled links

- У `<a>` нет нативного `disabled`.
- Если ссылка временно недоступна, используйте `aria-disabled="true"`, `tabindex="-1"` и блокировку navigation.
- Если ссылка недоступна постоянно, лучше не рендерить ее как Link.
- Причина недоступности должна быть понятна из surrounding text или helper text.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещает фокус к ссылке или от нее. |
| `Enter` | Открывает ссылку. |
| `Space` | Не является стандартной активацией anchor; не добавляйте custom behavior без review. |

---

## 7. Accessibility

| Элемент | Семантика | Правило |
|---|---|---|
| Root | `<a href="...">` | Обязательная базовая семантика. |
| Label | Видимый текст | Должен описывать destination. |
| External link | `target="_blank"` + `rel` + announcement | Пользователь должен знать о новой вкладке. |
| Icon | `aria-hidden="true"` | Если icon декоративен и label уже описывает destination. |
| Hidden text | Visually hidden text | Для `откроется в новой вкладке`, `PDF`, `скачать`. |
| Disabled | `aria-disabled="true"` по необходимости | Не должен оставаться обычной активной ссылкой. |

### Accessibility checklist

- [ ] Link рендерится как `<a href="...">`.
- [ ] `href` ведет к реальному destination.
- [ ] Label понятен вне избыточного контекста.
- [ ] Нет vague labels вроде `здесь` без дополнительного accessible name.
- [ ] External link сообщает о новой вкладке.
- [ ] `target="_blank"` сопровождается `rel="noopener noreferrer"`.
- [ ] Focus ring видим и не обрезается.
- [ ] Link не передается только цветом в inline text; есть underline на hover/focus или другой сигнал.
- [ ] Disabled link не активируется мышью, клавиатурой или программно.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Link доступны component tokens в namespace `link`. В таблицах ниже component branches указаны в dot-notation, чтобы не создавать ложные token warnings в docs health; semantic tokens остаются в slash-notation. Устаревшие aliases вида `--link-*` не являются source of truth.

### Default

| Component branch | Роль | Semantic token |
|---|---|---|
| `link.default.foreground.default` | Цвет обычной ссылки. | `link/default` |
| `link.default.foreground.hover` | Цвет при hover. | `link/hover` |
| `link.default.foreground.pressed` | Цвет при pressed. | `link/pressed` |
| `link.default.foreground.visited` | Цвет посещенной ссылки. | `link/visited` |
| `link.default.foreground.visitedHover` | Цвет visited + hover. | `link/visited-hover` |
| `link.default.foreground.visitedPressed` | Цвет visited + pressed. | `link/visited-pressed` |
| `link.default.foreground.disabled` | Цвет disabled ссылки. | `status/disabled/text` |

### Subtle, inverse and shared

| Component branch | Роль | Semantic token |
|---|---|---|
| `link.subtle.foreground.default` | Цвет subtle ссылки. | `text/secondary` |
| `link.subtle.foreground.hover` | Цвет subtle hover. | `text/primary` |
| `link.subtle.foreground.pressed` | Цвет subtle pressed. | `text/secondary` |
| `link.subtle.foreground.disabled` | Цвет subtle disabled. | `status/disabled/text` |
| `link.inverse.foreground.default` | Цвет ссылки на inverse surface. | `text/on-inverse/primary` |
| `link.inverse.foreground.hover` | Цвет inverse hover. | `text/on-inverse/primary` |
| `link.inverse.foreground.pressed` | Цвет inverse pressed. | `text/on-inverse/secondary` |
| `link.focus.ring` | Focus ring. | `focus/ring` |
| `link.disabled.foreground` | Shared disabled foreground. | `status/disabled/text` |

### Brand branch

| Component branch | Роль | Semantic token |
|---|---|---|
| `link.brand.default` | Brand foreground default. | `color/blue/50` |
| `link.brand.hover` | Brand foreground hover. | `color/blue/60` |
| `link.brand.pressed` | Brand foreground pressed. | `color/blue/70` |
| `link.brand.visited` | Brand visited foreground. | `color/purple/50` |
| `link.brand.visited-hover` | Brand visited hover. | `color/purple/60` |
| `link.brand.visited-pressed` | Brand visited pressed. | `color/purple/70` |

### Token gaps

- В `tokens.json` нет отдельной component-ветки `link.danger`; danger variant должен использовать semantic fallback `status/danger/text` только как documented exception до добавления component tokens.
- Underline, text decoration thickness, icon gap и typography пока описаны foundation rules, а не Link component tokens.
- Нельзя добавлять новые token names в specs, code или AI-generated handoff без обновления `tokens.json`.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Destination | `href` | Обязателен для Link. |
| Variant | `variant` | `default`, `subtle`, `inverse`; `danger` требует token gap review. |
| Size | `size` | `s`, `m`, `l`, `xl`, если Link не наследует typography из контекста. |
| Label | `children` или `label` | Видимый текст ссылки. |
| External | `external` | Добавляет icon/announcement и может задавать `target="_blank"`. |
| Target | `target` | `_self`, `_blank`; для `_blank` нужен `rel`. |
| Rel | `rel` | Для `_blank`: `noopener noreferrer`. |
| Leading icon | `iconLeft` | Decorative, если label уже описывает destination. |
| Trailing icon | `iconRight` | External, download, arrow или disclosure. |
| Disabled | `disabled` или `ariaDisabled` | Использовать осторожно; anchor не имеет native disabled. |

### Contract rules

- Link без `href` не допускается.
- Navigation через Button допускается только как documented product exception.
- `target="_blank"` без `rel="noopener noreferrer"` не допускается.
- Icon-only Link не допускается без отдельного accessibility review.
- Custom colors, raw underline styles и ad-hoc danger tokens запрещены.
- `danger` нельзя использовать как замену destructive Button.

---

## 10. Handoff notes

Handoff для Link должен фиксировать:

- destination: internal route, external URL, anchor или file;
- visible label;
- variant и size;
- external/download behavior;
- `target` и `rel`;
- icon name и placement, если используется;
- visited state requirement;
- disabled behavior и причина, если есть;
- accessible announcement для external/new tab;
- token branch и known token gaps.

---

## 11. Acceptance criteria

- [ ] Link рендерится как anchor-compatible element с `href`.
- [ ] Label описывает destination.
- [ ] Link не используется для save, submit, delete, retry или других product actions.
- [ ] External links имеют `rel="noopener noreferrer"` при `target="_blank"`.
- [ ] Пользователь получает сигнал о новой вкладке или внешнем ресурсе.
- [ ] Focus ring использует component branch `link.focus.ring` и видим в UI.
- [ ] Foreground использует реальные `link` component tokens.
- [ ] `danger` variant отмечен как token gap, если используется.
- [ ] Disabled link не активируется и имеет понятную причину.
- [ ] AI-generated handoff не содержит invented props или token paths.

---

## 12. AI usage rules

AI может:

- предложить понятный label на русском;
- определить, нужен ли Link или Button;
- подготовить handoff notes для internal, external, anchor и download links;
- проверить `target`, `rel`, accessible announcement и `href`;
- сверить token mapping с `tokens.json`;
- отметить `danger` как token gap, если требуется рискованный визуальный сценарий.

AI не должен:

- использовать Link для product actions;
- придумывать Link variants, props, states или token paths;
- использовать vague labels без destination context;
- создавать icon-only Link без accessibility review;
- скрывать external/new tab behavior;
- использовать `danger` как полноценную tokenized ветку без system review;
- заменять Link на Button только из-за визуального вида.

Если требование выходит за contract Link, AI должен пометить его как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Inline справка | `href="/help/billing"`, label `условия оплаты`, `variant="default"`. |
| Внешняя документация | `href="https://..."`, `external=true`, `target="_blank"`, `rel="noopener noreferrer"`. |
| Файл | `href="/files/report.pdf"`, label `Скачать отчет PDF`, `download=true`. |
| Вторичная ссылка в карточке | `variant="subtle"`, label `Открыть историю изменений`. |
| Ссылка на темном фоне | `variant="inverse"`, token branch `link.inverse.foreground.default`. |

### Требует review

| Scenario | Причина |
|---|---|
| Link `Удалить проект`. | Это product action; нужен Button destruction. |
| Link без `href`. | Нет navigation destination. |
| Label `здесь`. | Destination не понятен. |
| External link без сигнала о новой вкладке. | Пользователь не предупрежден. |
| Danger Link без token mapping. | В `tokens.json` нет component-ветки `link.danger`. |

---

## 14. Anti-patterns

- Использовать Link для submit, save, delete, retry или confirm actions.
- Использовать Button для обычной navigation только из-за желаемого внешнего вида.
- Делать `<span>` или `<div>` с click handler вместо `<a href>`.
- Оставлять Link без `href`.
- Писать generic labels: `тут`, `здесь`, `подробнее` без понятного context.
- Открывать новую вкладку без `rel="noopener noreferrer"`.
- Не сообщать о внешнем ресурсе или новой вкладке.
- Использовать raw colors или старые aliases `--link-*`.
- Делать disabled Link основным способом объяснения недоступного сценария.
