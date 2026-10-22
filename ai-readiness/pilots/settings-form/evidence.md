# SEDA AI Измерения исходной реализации

**Reference commit:** `354e19adc00605c422033a53ed1dd81dc33259ae`. **Дата наблюдений:** 22 октября 2026, UTC.

Диагностический стенд использует исходные Button, IconButton, TextField, package CSS, tokens.json и portal token resolver. Его переключатели меняют props и тему для наблюдения текущего кода. Новый параметрический runtime и целевой сценарий сохранения из settings-profile.json ещё не подключены.

## Условия

| Параметр | Значение |
| --- | --- |
| Node.js | v24.19.0 |
| React и React DOM | 18.3.1 |
| esbuild | 0.25.5 |
| Playwright | 1.51.1 |
| Chromium Headless Shell | 134.0.6998.35 |
| Viewport и DPR | 1100 × 850; 1 |
| Host typography | 16px / 24px system-ui, sans-serif |
| Global box-sizing reset | Отсутствует |
| Переопределение component CSS | Отсутствует |
| Профили наблюдения | Light/Dark × s/m/l/xl, восемь сочетаний |
| Ошибки console/page | 0 в зафиксированном запуске |

Наружные размеры измерены через DOM после двух animation frames и ожидания 180 ms для завершения CSS transitions. Поле наследует размер текста host; это условие эксперимента, а не рекомендуемая типографика пилота. В package font-family указан Inter и fallback stack. Файл шрифта Inter в стенд отдельно не загружался; присутствие имени в computed style не подтверждает его использование для отрисовки.

## Геометрия

| Размер | Button высота | IconButton | TextField наружная высота | Radius Button / TextField | Button шрифт / строка | TextField input шрифт / строка |
| --- | ---: | --- | ---: | --- | --- | --- |
| s | 24 | 24 × 24 | **30** | 6 / **8** | 12 / 16 | 16 / 24 |
| m | 32 | 32 × 32 | **34** | 8 / 8 | 14 / 20 | 16 / 24 |
| l | 40 | 40 × 40 | **42** | 10 / **8** | 16 / 24 | 16 / 24 |
| xl | 48 | 48 × 48 | **50** | 12 / **8** | 18 / 28 | 16 / 24 |

Числа — CSS px. Высоты и радиусы совпали между светлой и тёмной темами. TextField имеет content-box: к min-height 28/32/40/48 добавляются границы 1 + 1 px. Это объясняет расхождение с целевой наружной высотой 24/32/40/48.

## Loading и отправка формы

Button m с подписью «Сохранить», без iconLeft/iconRight:

| Состояние | Ширина | Высота |
| --- | ---: | ---: |
| Обычное | 110.84375 | 32 |
| Loading | 136.84375 | 32 |
| Изменение | **+26** | 0 |

Название действия сохраняется. Spinner добавляет содержимое и gap; механизм сохранения ширины отсутствует.

В host form.onSubmit намеренно нет общего saving guard:

| Маршрут при loading | Счётчик отправок |
| --- | --- |
| Mouse click по Button | 0 → 0 |
| Enter из input #project-name | 0 → 0 |
| form#settings-form.requestSubmit() без submitter | **0 → 1** |

Первые два маршрута проходят через активацию submit button. Прямой requestSubmit показывает, почему владелец формы должен отдельно блокировать повторное сохранение. Это наблюдение диагностического host, а не дефект неизвестной production Form.

## Focus и ошибки TextField

- После Tab input имеет реальный focus и matches(:focus-visible)=true.
- У input outline:none / 0px; у wrapper outline:none и box-shadow:none. Дополнительная focus border не появляется.
- При errorText и клавиатурном фокусе остаётся оформление ошибки; отдельного индикатора фокуса нет.
- errorText без error prop переводит поле в data-state=error и aria-invalid=true.
- state=error без errorText тоже делает input invalid, но продолжает показывать helper text.
- state=disabled оставляет input.disabled=false. В него удалось ввести строку «Изменено при state=disabled».
- disabled=true блокирует native input.
- readOnly=true устанавливает native readOnly; отдельный visual variant этим не подтверждается.

## Токены и варианты

- Исходный resolver загрузил tokens.json; root содержит 1166 inline custom properties.
- text-primary меняется с #0a0a0b в Light на #ffffff в Dark.
- Фон TextField меняется с white на rgb(23, 23, 24).
- --button-primary-surface-default и --icon-button-neutral-surface-default остаются пустыми в обеих темах.
- Это подтверждает использование semantic/raw fallbacks без дополнительного component-token mapping в данном стенде.
- IconButton без variant получает data-variant=neutral.
- У primary Button background в default и hover одинаков: rgb(38, 125, 225). Это проверка одного признака одного варианта, а не всех состояний всей библиотеки.
- Иконка помощи передана явным SVG 16 × 16; стенд не доказывает автоматическое масштабирование SVG.

## Проверка происхождения данных

- 67 материализованных исходных файлов сверены по Git blob SHA с reference commit. Совпадение подтверждено.
- Все **22** существующих tokenRef/tokenBranch планового профиля разрешаются в tokens.json.
- text-field/border/disabled проверен как отсутствующий component leaf.
- Целевой semantic status/disabled/border существует в Light и Dark.
- Build использует esbuild; проверка TypeScript и полный аудит доступности не объявляются выполненными.
- Параметры baseline host отличаются от target profile: host text 16/24 и область формы 520 px; целевой профиль m задаёт input 14/20 и container max-width 640 px. Эти различия сохранены явно.

## Воспроизведение

Инструкция и переносимые исходники: [settings-baseline](../../../portal/component-lab/pilots/settings-baseline/README.md).

Сырые measurements.json, screenshots, browser binaries, node_modules и dist создаются локально и исключены из Git. Этот файл содержит отобранные наблюдения для решений пилота. При последующих изменениях компонентов новое измерение должно отражать фактические source fingerprints и не представляться запуском старого reference commit.

