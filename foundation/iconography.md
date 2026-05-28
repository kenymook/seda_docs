# Iconography

> Figma: TBD

Iconography описывает роли, размеры, стиль и accessibility-правила для иконок в SEDA UI. Иконка должна усиливать смысл интерфейса, ускорять сканирование и помогать различать состояния, но не заменять текст там, где текст нужен для понимания.

---

## Цель

Иконки в SEDA UI должны:

- помогать быстро распознавать действие, статус или тип объекта;
- быть визуально согласованными по размеру, stroke и оптическому выравниванию;
- не перегружать плотные B2B и AI-интерфейсы;
- работать в Light и Dark темах через semantic color tokens;
- быть доступными для assistive technologies, когда несут смысл;
- быть скрытыми от screen reader, когда они декоративные.

Правило: если без иконки пользователь всё равно понимает действие, иконка декоративна. Если иконка является единственным видимым сигналом действия или статуса, ей нужны текстовая альтернатива, Tooltip или связанный label.

---

## Типы Иконок

| Тип | Назначение | Accessibility |
|---|---|---|
| Decorative | Визуальное усиление рядом с текстом | `aria-hidden="true"` |
| Action | Запускает действие, часто внутри Icon Button | `aria-label` + Tooltip |
| Status | Показывает info/error/warning/success | Текст рядом или доступное описание |
| Navigation | Помогает распознать раздел или переход | Label рядом или Tooltip в collapsed mode |
| Affix | Prefix/suffix icon внутри field | Decorative или interactive по сценарию |
| Data | Обозначает тип объекта, формат, источник | Label или accessible name, если смысл важен |
| Illustration | Empty state или onboarding visual | Обычно decorative, если текст уже объясняет состояние |

---

## Размеры

| Токен | Размер | Использование |
|---|---:|---|
| icon/12 | 12px | Микроиндикаторы, плотные metadata, маленькие badges |
| icon/14 | 14px | `small` Button/Icon Button, compact table actions |
| icon/16 | 16px | Default controls, inputs, меню, toolbar |
| icon/18 | 18px | `large` controls, Alert small/medium variants |
| icon/20 | 20px | `extraLarge` controls, mobile actions, Alert large |
| icon/24 | 24px | Empty state icon, крупные navigation items |
| icon/32 | 32px | Illustration-like icon, onboarding block |

Рекомендуемые CSS custom properties:

```css
--icon-size-12: 12px;
--icon-size-14: 14px;
--icon-size-16: 16px;
--icon-size-18: 18px;
--icon-size-20: 20px;
--icon-size-24: 24px;
--icon-size-32: 32px;
```

Пока эти токены не экспортируются из `tokens.json`, specs могут ссылаться на documented roles icon/*.

---

## Связь С Размером Компонента

| Размер компонента | Icon size | Примеры |
|---|---:|---|
| `small` | icon/14 | Small Button, compact Icon Button, table row actions |
| `medium` | icon/16 | Default Button, Text Field prefix/suffix, menu item |
| `large` | icon/18 | Large Button, Alert, prominent controls |
| `extraLarge` | icon/20 | Mobile/touch controls, large CTA |

Правила:

- Не увеличивайте иконку отдельно от размера компонента без причины.
- Icon-only control остаётся квадратным, но touch target минимум `44x44px`.
- Внутри поля `prefix-icon` и `suffix-icon` обычно используют icon/16.
- Status icon рядом с текстом должен быть выровнен по первой строке текста.

---

## Стиль

SEDA использует outline-иконки как базовый стиль.

| Свойство | Правило |
|---|---|
| Stroke | 1.5-2px, в зависимости от библиотеки и размера |
| Caps / joins | Round или consistent library default |
| Fill | Только для selected/status/special cases |
| Viewbox | Обычно `24x24`, масштабируется через size token |
| Optical alignment | Иконка визуально центрируется, а не только математически |
| Detail level | Меньше деталей для `12`-`16px`, больше допустимо для `24`-`32px` |

Не смешивайте outline и filled icons в одной группе без семантической причины.

---

## Цвет

Иконки используют text/status tokens, а не raw hex.

| Сценарий | Токен |
|---|---|
| Декоративная иконка рядом с текстом | Наследует цвет текста |
| Secondary icon | `text/tertiary` |
| Default action icon | `text/secondary` или `text/primary` |
| Icon on brand surface | `text/on-brand/primary` |
| Icon on inverse surface | `text/on-inverse/primary` |
| Error icon | `status/danger/text` или `status/danger/surface` |
| Warning icon | `status/warning/text` или `status/warning/surface` |
| Success icon | `status/success/text` или `status/success/surface` |
| Disabled icon | `status/disabled/text` |

Контраст meaningful icon должен быть минимум `3:1` к соседнему цвету.

---

## Иконки В Контролах

### Button

- `icon-left` усиливает смысл label.
- `icon-right` используется для раскрытия, внешнего перехода или directional action.
- Иконка декоративна, если label уже описывает действие: используйте `aria-hidden="true"`.
- `icon-only` должен быть Icon Button, а не обычный Button без текста.

### Icon Button

- Всегда имеет `aria-label`.
- Всегда имеет Tooltip с тем же смыслом.
- Иконка не должна быть единственным способом понять destructive consequence: используйте подтверждение и явный текст.
- Loading spinner заменяет иконку визуально, но не заменяет accessible name.

### Inputs

- Prefix icon обычно декоративна и получает `aria-hidden="true"`.
- Suffix icon становится button, если очищает, раскрывает пароль, открывает picker или меняет значение.
- Interactive suffix button требует `type="button"` и `aria-label`.
- Status icon рядом с error/warning/success не заменяет текст сообщения.

### Navigation

- Navigation item с иконкой и label: иконка декоративна.
- Collapsed sidebar с одними иконками требует Tooltip и accessible name.
- External link icon должен сопровождаться `aria-label` или hidden text, если ссылка открывается в новой вкладке.

### Status And Feedback

- Alert/Toast status icon должен совпадать с типом сообщения.
- Error/warning/success не передаются только иконкой.
- Badge поверх иконки декоративен сам по себе; смысл дублируется в `aria-label` host-элемента.

---

## Иллюстрации И Empty States

Иллюстрация в Empty State помогает тону, но не является обязательной.

Правила:

- Empty state title и description должны объяснять состояние без иллюстрации.
- Если иллюстрация не добавляет уникальный смысл, скрывайте её от screen reader.
- Иллюстрации не должны быть визуально тяжелее основного action.
- Используйте `text/tertiary` или мягкие semantic colors, если иллюстрация не является брендовым элементом.

---

## Naming

Используйте функциональные имена иконок в specs:

| Хорошо | Избегать |
|---|---|
| `search-icon` | `magnifier-blue` |
| `close-icon` | `x-small-gray` |
| `error-icon` | `red-circle-icon` |
| `external-link-icon` | `arrow-up-right-16` |
| `sort-icon` | `triangle-icon` |

Имя описывает назначение, а размер и цвет задаются токенами.

---

## Accessibility

| Сценарий | Правило |
|---|---|
| Иконка рядом с видимым label | `aria-hidden="true"` |
| Icon-only action | `aria-label` + Tooltip |
| Status icon с текстом | `aria-hidden="true"`, если текст уже описывает статус |
| Status icon без видимого текста | Accessible name или live message |
| Decorative illustration | `aria-hidden="true"` |
| Badge на host icon | Badge `aria-hidden`, count в `aria-label` host |
| External link icon | Hidden text или `aria-label`, если открывает новую вкладку |

`aria-label` описывает действие, а не визуальную форму: `Удалить`, не `Крестик`; `Открыть меню`, не `Три точки`.

---

## Что Делать И Чего Избегать

| Делать | Избегать |
|---|---|
| Использовать системные icon/* размеры | Задавать случайные 15px или 22px |
| Скрывать decorative icons от screen reader | Озвучивать каждую иконку рядом с текстом |
| Давать Icon Button `aria-label` и Tooltip | Полагаться только на узнаваемость иконки |
| Использовать status icon вместе с текстом | Передавать ошибку только красной иконкой |
| Наследовать цвет текста для decorative icons | Красить каждую иконку отдельным raw color |
| Подбирать иконку по смыслу действия | Использовать декоративные иконки ради заполнения места |

---

## Чеклист

- [ ] Размер иконки выбран из icon/*.
- [ ] Цвет иконки взят из semantic token.
- [ ] Decorative icon имеет `aria-hidden="true"`.
- [ ] Icon-only control имеет `aria-label` и Tooltip.
- [ ] Status icon сопровождается текстом или доступным описанием.
- [ ] Иконка не является единственным сигналом ошибки, предупреждения или success.
- [ ] Interactive suffix icon в field реализован как button.
- [ ] Contrast meaningful icon не ниже `3:1`.
- [ ] Иллюстрация Empty State не заменяет title/description.
