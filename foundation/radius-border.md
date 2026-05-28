# Radius И Border

> Figma: TBD

Radius и border задают форму компонентов, силу разделения и визуальную читаемость границ. Этот документ описывает, когда использовать скругления, stroke width, outline, separator и focus border в SEDA UI.

---

## Цель

Radius и border должны:

- поддерживать единую форму компонентов;
- отделять интерактивные контролы от фона;
- помогать читать таблицы, формы, карточки и overlay;
- не конкурировать с `focus/ring`;
- оставаться предсказуемыми в Light и Dark темах.

Правило: radius описывает форму, border описывает границу или разделение. Не используйте тень как замену обязательной границы, если граница нужна для понимания структуры.

---

## Источники Токенов

Текущие foundation-токены уже содержат:

| Группа | Примеры | Назначение |
|---|---|---|
| border/radius/* | border/radius/s, border/radius/m, border/radius/xl | Скругления формы |
| border/width/* | border/width/s, border/width/m, border/width/l | Толщина границ |
| border/* | `border/default`, `border/hover`, `border/brand/default` | Цвет границы |
| status/*/border | `status/danger/border`, `status/warning/border` | Валидационные и статусные границы |
| `focus/ring` | `focus/ring` | Индикатор фокуса |

Примечание о текущем состоянии: часть specs использует имя `border-radius-lg`. Новые specs должны использовать border/radius/*; старые ссылки нужно мигрировать во время component specs cleanup.

---

## Radius Scale

| Токен | Значение | Использование |
|---|---:|---|
| border/radius/none | 0px | Табличные сетки, sharp dividers, edge-to-edge layout |
| border/radius/2xs | 2px | Микроэлементы, индикаторы, маленькие бейджи |
| border/radius/xs | 4px | Очень компактные controls и внутренние элементы |
| border/radius/s | 6px | `small` controls, tags, compact chips |
| border/radius/m | 8px | Default controls, inputs, cards в плотном UI |
| border/radius/l | 10px | `large` controls, панели с мягкой формой |
| border/radius/xl | 12px | `extraLarge` controls, крупные cards, modal corners |
| border/radius/2xl | 16px | Большие panels, onboarding blocks, media containers |
| border/radius/3xl | 20px | Редкие крупные surface blocks |
| border/radius/4xl | 24px | Hero/media surfaces, не для обычных controls |
| border/radius/circle | 999px | Avatar, pill, круглые icon controls |

---

## Связь С Размером Компонента

| Размер компонента | Рекомендуемый radius | Примеры |
|---|---|---|
| `small` | border/radius/s | Small Button, Tag, compact field |
| `medium` | border/radius/m | Default Button, Text Field, Select |
| `large` | border/radius/l | Large Button, крупное поле формы |
| `extraLarge` | border/radius/xl | Touch-first controls, крупные CTA |

Правила:

- Не увеличивайте radius только ради визуальной мягкости, если компонент находится в плотной таблице или toolbar.
- Pill-форма допустима для tags, chips, segmented controls и avatar, но не должна становиться формой всех компонентов.
- Radius дочернего элемента должен быть меньше или равен radius родительской поверхности, если элементы соприкасаются.

---

## Border Width

| Токен | Значение | Использование |
|---|---:|---|
| border/width/s | 0.5px | Hairline separators, retina-only subtle borders |
| border/width/m | 1px | Default borders для inputs, cards, tables, dividers |
| border/width/l | 2px | Selected state, strong emphasis, active indicator |

Правила:

- Для большинства компонентов используйте border/width/m.
- border/width/s не должен быть единственным признаком интерактивной границы, если контраст слабый.
- border/width/l используйте для selected/current state или сильного визуального акцента, но не для обычного hover.

---

## Border Color Roles

| Роль | Токены | Использование |
|---|---|---|
| Default border | `border/default` | Базовая граница neutral controls |
| Hover border | `border/hover` | Усиление при наведении |
| Pressed border | `border/strong` | Момент нажатия |
| Brand border | border/brand/* | Focus-adjacent, selected, current, primary outline |
| Inverse border | border/inverse/* | Границы на inverse surfaces |
| Status border | `status/danger/border`, `status/warning/border`, `status/success/border` | Валидация и статусы |
| Disabled border | `status/disabled/border` | Отключённые controls |

Не используйте border/danger/* для новых validation specs. Для ошибок используйте `status/danger/border`.

---

## Separators И Dividers

Separators отделяют группы, но не создают отдельную поверхность.

| Сценарий | Рекомендация |
|---|---|
| Table row separator | `border/default`, border/width/m |
| Card section separator | `border/default`, только если padding недостаточно |
| Modal header/footer separator | `border/default`, когда контент прокручивается или footer отделён |
| Sidebar section separator | `border/default` или spacing, если разделение мягкое |
| Dense metadata divider | border/width/s, если контраст остаётся читаемым |

Правила:

- Не ставьте divider между каждым элементом, если spacing уже показывает группировку.
- В таблицах separator помогает сканированию, но не должен быть темнее текста.
- Divider не должен быть интерактивным сам по себе.

---

## Focus Border И Focus Ring

`focus/ring` является главным индикатором фокуса. Border может дополнительно усилить состояние, но не заменяет focus ring.

| Сценарий | Правило |
|---|---|
| Input focus | `border/brand/default` + `focus/ring`, если нужно усиление |
| Button focus | `focus/ring`; border меняется только по variant/state |
| Error + focus | `status/danger/border` сохраняется, `focus/ring` добавляется снаружи |
| Selected + focus | Selected border сохраняется, `focus/ring` показывает текущий фокус |
| Disabled | Нет focus ring, если элемент исключён из tab-order |

Focus ring не должен обрезаться родительским `overflow: hidden`.

---

## Border И Состояния

| Состояние | Border behavior |
|---|---|
| `default` | `border/default` или прозрачная граница, если variant без рамки |
| `hover` | `border/hover` или без изменения, если hover передан через surface |
| `active` | `border/strong` только во время нажатия |
| `focus` | `focus/ring`; border меняется только если компонентный spec требует |
| `selected` | `border/brand/default` или border/width/l, если выбранность должна быть видимой |
| `error` | `status/danger/border` + текст ошибки |
| `warning` | `status/warning/border` + текст предупреждения |
| `success` | `status/success/border`, если success не создаёт визуальный шум |
| `disabled` | `status/disabled/border`, взаимодействие отключено |

---

## Применение По Компонентам

| Компонент | Radius | Border |
|---|---|---|
| Button | По `size`, обычно `s`-`xl` | Secondary/destruction outline, focus ring отдельно |
| Text Field / Select | По `size`, обычно `m` | Default, focus, validation borders |
| Checkbox / Radio | Форма компонента | Border должен быть видимым в unchecked state |
| Card | `m` или `xl` | `outlined` использует border, `elevated` использует elevation |
| Table | Обычно `none` внутри grid | Row/header separators |
| Modal / Popover / Dropdown | `m`-`xl` | Border + elevation для отделения от фона |
| Avatar | `circle` | Border только для group/overlap или contrast |

---

## Доступность

- Граница интерактивного компонента должна иметь контраст минимум `3:1` к соседнему цвету, если она нужна для распознавания control boundary.
- Ошибка, предупреждение и success не должны передаваться только цветом border.
- Focus ring должен оставаться видимым при любом radius.
- Очень тонкие separators не должны быть единственным способом понять структуру критичного контента.

---

## Что Делать И Чего Избегать

| Делать | Избегать |
|---|---|
| Использовать border/radius/* вместо legacy border-radius-* | Добавлять произвольные `7px` или `13px` radius |
| Связывать radius с размером компонента | Делать все компоненты pill-shaped |
| Использовать status/*/border для валидации | Использовать border/danger/* в новых specs |
| Сохранять `focus/ring` отдельно от border | Заменять focus только изменением border |
| Использовать separators для структуры | Делить каждый блок линиями без необходимости |

---

## Чеклист

- [ ] Radius взят из border/radius/*.
- [ ] Border width взят из border/width/*.
- [ ] Цвет границы взят из border/* или status/*/border.
- [ ] Focus ring не заменён border.
- [ ] Error/warning/success имеют текст или иконку, не только border color.
- [ ] Selected/current state видим без зависимости только от цвета.
- [ ] Legacy border-radius-* не используется в новых specs.
