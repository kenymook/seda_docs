# SEDA AI Исходное состояние трёх компонентов

**Версия исходников:** `354e19adc00605c422033a53ed1dd81dc33259ae`. Таблицы в этом файле описывают факты кода и норму документации раздельно. Runtime-измерения и условия — в [evidence.md](evidence.md).

## Button

Источники: [Button.types.ts](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/components/Button/Button.types.ts), [Button.tsx](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/components/Button/Button.tsx), [спецификация](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/button.md).

| Prop или часть | Фактический контракт React | Default или исполнение |
| --- | --- | --- |
| variant | primary, secondary, outline, ghost, text, destruction | secondary |
| size | s, m, l, xl | m |
| type | button, submit, reset | button |
| loading | boolean | false |
| fullWidth | boolean | false |
| iconLeft, iconRight | ReactNode | отсутствуют |
| children | ReactNode, унаследован | Типы допускают отсутствие текста; spec требует видимый label |
| disabled | Нативный boolean | Передаётся в button; участвует в click guard |
| onClick | Нативный handler | Вызывается, если disabled и loading не true |
| ref | HTMLButtonElement | Перенаправляется в button |
| state | Собственного prop нет | Hover, focus и active должны приходить из DOM |

При loading spinner заменяет iconLeft, label остаётся, iconRight исчезает. Сам loading выставляет aria-disabled, но не выставляет native disabled; если disabled отдельно не передан, кнопка остаётся в tab order. Обработчик блокирует собственную активацию по disabled или loading. Передача одного aria-disabled=true не включает этот guard.

Props наследуют нативные HTML/ARIA/event attributes. Декоративность iconLeft/iconRight должна быть обеспечена вызывающим кодом: слоты вставляются напрямую.

## IconButton

Источники: [IconButton.types.ts](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/components/IconButton/IconButton.types.ts), [IconButton.tsx](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/components/IconButton/IconButton.tsx), [спецификация](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/icon-button.md).

| Prop или часть | Фактический контракт React | Default или исполнение |
| --- | --- | --- |
| aria-label | Обязательная string | Непустота в runtime не проверяется |
| icon | Обязательный ReactNode | ReactNode допускает null; наличие видимой иконки не проверяется |
| variant | primary, secondary, outline, ghost, text, destruction | **neutral**, которого нет в union |
| size | s, m, l, xl | m |
| type | button, submit, reset | button |
| loading | boolean | false |
| selected | boolean | Не задан; при передаче выставляются aria-pressed/data-selected |
| tooltip | string | Только native title |
| disabled, onClick, ref | Нативные button capabilities | Guard аналогичен Button |
| state | Собственного prop нет | Не существует публичного state API |

Icon обёрнут в aria-hidden span. При loading он заменяется spinner. Полноценного Tooltip с отдельным элементом, focus/Escape-поведением в этой реализации нет. В пилоте применяется документированное исключение: доступное имя и видимое пояснение рядом.

## TextField

Источники: [TextField.types.ts](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/components/TextField/TextField.types.ts), [TextField.tsx](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/components/TextField/TextField.tsx), [спецификация](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/inputs/text-field.md).

| Prop или часть | Фактический контракт React | Default или исполнение |
| --- | --- | --- |
| label | Обязательный ReactNode | Всегда рендерится внутри label root; пустота не проверяется |
| size | s, m, l, xl | m |
| state | default, hover, focus, error, disabled | default |
| filled | Optional boolean | Override либо value != null и непустая строка |
| helperText, errorText | ReactNode | Один общий message slot; errorText приоритетен |
| prefix, suffix | ReactNode | Span-слоты; отдельного оформления affix в CSS нет |
| value, onChange | Нативные input props | Controlled, если value задан |
| defaultValue | Нативный input prop | Поддерживается input; вычисление filled его не отслеживает |
| disabled | Нативный boolean | Единственный prop, реально отключающий input |
| readOnly | Нативный boolean | Передаётся input; отдельного visual variant нет |
| required | Нативный boolean | required input и видимая звёздочка |
| id | Нативный id | Переданный либо useId(); message id производный |
| type, inputMode, autoComplete, name, onBlur | Нативные input props | Передаются в input |
| className | string | Применяется к root label |
| ref | HTMLInputElement | Перенаправляется в input |

В API отсутствуют собственные error, clearable, onClear, hintText, description, ariaLabel, startAdornment и endAdornment. Suggested names из общей таблицы Code mapping не являются готовым API этого адаптера.

Фактическая деривация:

- resolvedState = disabled ? disabled : errorText ? error : state.
- isFilled = filled ?? (value != null && String(value).length > 0).
- errorText делает поле invalid без отдельного error prop.
- state=error без сообщения возможен в коде, но запрещён спецификацией.
- state=disabled без disabled=true оставляет input доступным.
- При disabled + errorText aria-invalid снимается, но сообщение ошибки продолжает отображаться.
- При helper/error переданный aria-describedby заменяется локальным message ID.
- При errorText="" и непустом helperText проверка наличия сообщения и nullish выбор текста могут расходиться; в пилоте отсутствие ошибки передаётся undefined.
- Native focus/hover не обновляют root data-state автоматически.

## Размеры и геометрия

Источник нормы: [spacing-sizing.md](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/foundation/spacing-sizing.md), [Button](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/button.md), [IconButton](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/icon-button.md). Источник реализации: [styles.css](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/packages/seda-ui/src/styles.css).

Все числа — CSS px в контексте web-адаптера. Это набор пресетов, а не формула свободного масштабирования.

| Код | Имя в документации | Нормативная высота | Шрифт и строка | Radius | Button padding X | Иконка по spec |
| --- | --- | ---: | --- | ---: | ---: | ---: |
| s | small | 24 | 12 / 16 | 6 | 8 | 14 |
| m | medium | 32 | 14 / 20 | 8 | 12 | 16 |
| l | large | 40 | 16 / 24 | 10 | 16 | 18 |
| xl | extraLarge | 48 | 18 / 28 | 12 | 20 | 20 |

Факты CSS:

| Свойство | Button | IconButton | TextField |
| --- | --- | --- | --- |
| Размер control | height 24/32/40/48 | width/height 24/32/40/48 | min-height 28/32/40/48 |
| Box sizing | border-box на root | border-box на root | control не включён в reset; content-box без внешнего CSS |
| Radius | 6/8/10/12 | 6/8/10/12 | 8 для всех размеров |
| Типографика value | Размерная, weight 600 | Font-size для иконки/spinner явно не нормализован | input font:inherit от окружения |
| Border | 1 | 1 | 1 |
| Padding X | 8/12/16/20 | 0 | 10 во всех размерах |
| Gap | 8 во всех размерах | Внутренний gap не задан | control gap 8; root gap 6 |
| Размер SVG | Не нормализован | Не нормализован | Слоты не нормализованы |
| Spinner | 1em + border 2; собственного border-box нет | То же | Не входит в API |

У TextField min-height задаёт content box, поэтому наружная высота без reset может быть на 2 px больше. Указанный в spec Figma default s, рекомендуемый default для формы m и React default m относятся к разным контекстам; в пилоте m задаётся явно.

## Состояния и доступность

| Возможность | Что есть в исходниках | Граница |
| --- | --- | --- |
| Button/IconButton hover и active | Нативные состояния существуют | В package CSS нет соответствующих token-driven selectors |
| Button/IconButton focus | Общий :focus-visible, outline 2 и offset 2 | Подтверждается на реальном DOM |
| Loading | Spinner, aria-disabled, click guard | Width Button не резервируется; отдельные loading colors не подключены |
| Disabled actions | Native disabled, opacity 0.56 | Component disabled token roles не применяются |
| IconButton selected | aria-pressed/data-selected | Отдельного selected CSS нет; пилот не использует toggle-сценарий |
| TextField focus | Outline input сброшен; общий selector направлен на span control | Связь индикатора с реально фокусируемым input отсутствует в CSS |
| TextField error | Цвета error, aria-invalid, message | API и текст spec расходятся по error boolean |
| TextField disabled | disabled prop и opacity 0.6 | state prop не заменяет native disabled |
| Reduced motion | Spinner animation только при no-preference | Это не полная проверка доступности |
| Touch target | Норма SEDA требует отдельную доступную область | Расширение hit area для малых контролов не реализовано в этих исходниках |

## Связь с токенами

[tokens.json](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/tokens.json) — источник значений. [portal-tokens.js](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/portal/portal-tokens.js) экспортирует foundation и semantic collections; component collection в CSS не экспортируется. Сам пакет импортирует styles.css, но не загружает tokens.json.

| Public variant | Существующая ветка Button | Существующая ветка IconButton |
| --- | --- | --- |
| primary | button/primary/solid | icon-button/primary |
| secondary | button/neutral/secondary | icon-button/neutral |
| outline | button/neutral/outline | Отдельной ветки нет |
| ghost | button/neutral/ghost | icon-button/ghost |
| text | button/neutral/text | Отдельной ветки нет |
| destruction | button/danger/solid | icon-button/danger |

CSS читает сокращённые переменные вроде --button-primary-surface-default. Они не являются прямым экспортом полной ветки button/primary/solid/surface/default. При текущем подключении portal resolver используются semantic/raw fallbacks.

Смысловые расхождения:

- secondary и outline имеют один CSS recipe; fallback surface/base отличается от container/neutral/default для secondary и transparent для outline;
- destruction использует status/danger/container и status/danger/text вместо filled-action ролей container/danger/default и text/on-danger/primary;
- ghost и text у Button объединены; text ожидает text/secondary;
- IconButton ghost наследует foreground базового control вместо icon/secondary;
- TextField не читает component variables; label использует text/primary вместо text-field/label/default → text/secondary;
- spec перечисляет text-field/border/disabled, но такой leaf отсутствует; semantic status/disabled/border существует.

Токены разных веток не образуют одинаковую полную матрицу states × roles. Отсутствующие branches нельзя достраивать по догадке.

## Расхождение семейства шрифта

В [typography.md](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/foundation/typography.md) font/family описан как SF Pro Text. Фактический foundation token содержит Inter, и CSS пакета начинает стек с Inter. Рабочее решение пилота — использовать существующий token source. Наличие имени Inter в computed font-family не доказывает загрузку файла шрифта; условия baseline описаны отдельно.

