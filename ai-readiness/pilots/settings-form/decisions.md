# SEDA AI Решения для пилота формы настроек

> Историческая фиксация этапа 1. Текущие авторские данные пилота перенесены в [пакет контрактов](../../../packages/seda-contracts/README.md). Статус этапа 2 и команды проверки: [phase-2.md](phase-2.md).

Рабочие решения этапа 1 ограничены пилотом Button, IconButton и TextField. Они задают вход для этапа 2 и ожидаемое поведение следующей реализации. Публикация этого файла не означает, что исходные компоненты уже исправлены или глобальный стандарт изменён.

## API и семантика

| ID | Решение | Основание и последствие |
| --- | --- | --- |
| D01 | React API размеров сохраняет s/m/l/xl. Длинные имена small/medium/large/extraLarge явно сопоставляются с ними. | Совместимость текущего API; числовая шкала едина |
| D02 | Целевой default IconButton — secondary. В форме variant задаётся явно: ghost для помощи. | neutral отсутствует в public union; старый default остаётся фактом baseline |
| D03 | У Button требуется непустой видимый label; у IconButton — непустое aria-label и видимая иконка. | Одних ReactNode/string типов недостаточно |
| D04 | Момент нажатия называется active. Суффикс pressed существующих color tokens используется как adapter mapping временного нажатия. | Постоянные selected/aria-pressed имеют другой смысл и не используются в этой форме |
| D05 | errorText — вход сообщения и наличия ошибки текущего TextField. Пустота ошибки передаётся undefined. | Отдельного error prop в текущем API нет; state=error без текста недопустим |
| D06 | Недоступность задаётся disabled. Hover/focus приходят из DOM; state предназначен для описания/preview и не имитирует DOM-фокус. | state=disabled не отключает input; aria-disabled без guard не блокирует действие |
| D07 | Поле пилота controlled: value:string + onChange. filled выводится из value. | Устраняет неоднозначность uncontrolled filled без удаления native capability |

## Визуальные параметры

| ID | Решение | Основание и последствие |
| --- | --- | --- |
| D08 | Четыре высоты 24/32/40/48, радиусы 6/8/10/12 и размерная типографика сохраняются как пресеты. | Foundation; автоматическая формула radius=height/4 не вводится |
| D09 | Target TextField m: наружная высота 32, radius 8, border 1, padding X 10, input 14/20. | Высота измеряется по border box; внутренние отступы привязываются к существующим tokens |
| D10 | Font family берётся из tokens.json: Inter. Label m использует font/body/strong; helper/error font/bodySmall/base. | Семейство подтверждено token source; label weight — явное решение пилота, а не измеренный current style |
| D11 | Component token branches связываются с CSS через явный adapter mapping; в проверяемом режиме отсутствующая ссылка даёт issue. | Semantic/raw fallback не считается доказательством component binding |
| D12 | Для пилота реализуются Button primary/secondary и IconButton ghost; остальные публичные варианты сохраняются в инвентаре как не проверенные этим сценарием. | Отдельных icon-button outline/text веток нет; нельзя объявлять полную parity |
| D13 | Размер иконки m — 16 × 16, Button gap — space/m. Spinner и иконки имеют явный размер и box model. | Текущий CSS не обеспечивает нормализацию SVG и spinner |
| D14 | Default/loading Button сохраняют наружную ширину для заявленной конфигурации слотов. | Loading не должен менять положение соседних действий; механизм выбирается при реализации |
| D15 | В пилоте IconButton имеет доступное имя и видимое пояснение рядом. Native title — дополнительная подсказка, а не подтверждение полного Tooltip. | Документированное условное исключение; hover/focus/Escape Tooltip вне этого сценария |
| D16 | text-field/border/disabled планируется как alias к status.disabled.border. | Сейчас component leaf отсутствует; в JSON он хранится среди planned additions, а не existing refs |

## Состояние и поведение формы

| ID | Решение | Основание и последствие |
| --- | --- | --- |
| D17 | Form владеет value, touched, attemptedSubmit, fieldError, saveError, saving и snapshots. | Компоненты отображают состояние; бизнес-валидация не переносится в TextField |
| D18 | Required проверяет только trim(value).length > 0. Триггеры blur и submit; после показанной ошибки допускается повторная проверка при вводе. При невалидном submit выставить attemptedSubmit, показать ошибку, не запускать сохранение, сохранить value и перевести фокус в projectName. | Конкретная политика примера; ограничения длины, алфавита и уникальности не добавляются |
| D19 | Form.onSubmit имеет guard на время saving, включая отправку клавишей Enter. | Button guard не покрывает все маршруты отправки формы |
| D20 | Ввод во время сохранения разрешён. Ответ относится к отправленному snapshot и не перезаписывает новые правки; они остаются несохранёнными. | Сохранение пользовательских данных; success не объявляет сохранённым более поздний ввод |
| D21 | Сбой сохранения отображается как ошибка формы. Retry валидирует текущее значение. | Ошибка сети не делает корректное имя invalid |
| D22 | error + focus совместимы. Disabled presentation не показывает validation error; Form может сохранить ошибку в данных. | Разделение доступности, взаимодействия и валидации |
| D23 | aria-describedby объединяет внешние IDs и локальное сообщение без дублей. | Исходная реализация сейчас заменяет внешнее описание |
| D24 | Смена темы/размера/плотности не меняет идентичность компонентов, value, touched и текущее состояние сценария. | Профиль управляет представлением; remount не используется как механизм обновления |

## Профиль и точные значения

Параметры хранятся в [settings-profile.json](settings-profile.json). Здесь зафиксировано их назначение:

| Роль | Источник | Разрешённое значение |
| --- | --- | --- |
| Плотность | Выбор пилота в рамках foundation | regular |
| Размер | Текущий React API | m |
| Тема | Semantic mode | Light |
| Max width | sm container в spacing-sizing.md | 640 px |
| Padding контейнера | space/4xl | 24 px |
| Заголовок → поля | space/2xl | 16 px |
| Label → control | space/s | 6 px |
| Control → message | space/s | 6 px |
| Между полями | space/2xl | 16 px |
| Поля → действия | space/4xl | 24 px |
| Между действиями | space/xl | 12 px |

Два gap по 6 px имеют разные роли, хотя сейчас используют один token. Числа в таблице — разрешённые значения токенов указанной исходной версии, а не новые primitive tokens.

Для всех размеров известны нормативные пресеты. Исполнение переключения профиля относится к этапу 3; настройки стенда baseline только помогают наблюдать текущую библиотеку и не доказывают наличие нового ядра.

## Уточнение D34 (2026-10-26)

Это исторический документ первого пилота. [D34 — анатомия полей](../../../packages/seda-contracts/FIELD-ANATOMY.md) заменяет для текущих TextField/Select/NumberField предположения D10 о Semibold label и фиксированном helper bodySmall; текущий профиль использует два отдельных gap по 4 px. Общий action weight и gap других контролов не меняются. Наблюдения исходного Figma UI и границы проверки приведены в D34; исторические таблицы выше сохранены для объяснения изменения.

## Явные границы поддержки

- Основной сценарий использует web с мышью и клавиатурой. Touch targets малых размеров требуют отдельной реализации и проверки.
- Figma component names, variant counts и defaults прочитаны из specs. Живой файл не проверялся.
- У native HTML/ARIA props сохраняется их действительный API; минимальный AI allowlist не должен ошибочно запрещать корректные нативные атрибуты.
- Наличие native readOnly не означает наличия отдельного visual variant; этот режим не нужен основному сценарию.
- Не подтверждены полный Tooltip, masked/clearable input, uncontrolled filled, persistent selected IconButton и все шесть action recipes.
- В baseline нет обязательства исправить весь пакет. Исправления ограничиваются принятыми правилами и реально используемыми возможностями пилота.

## Источники решений

- [Button System](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/button-system.md)
- [Button](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/button.md)
- [IconButton](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/actions/icon-button.md)
- [TextField](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/specs/inputs/text-field.md)
- [Spacing and sizing](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/foundation/spacing-sizing.md)
- [State vocabulary](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/foundation/state-vocabulary.md)
- [Validation model](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/foundation/validation-model.md)
- [Tokens](https://github.com/kenymook/seda_docs/blob/354e19adc00605c422033a53ed1dd81dc33259ae/tokens.json)
- [Наблюдения кода](component-baseline.md)

