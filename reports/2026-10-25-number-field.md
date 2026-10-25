# NumberField, общие параметры поля и пагинация — private v55

Опубликована версия55 на прежнем приватном [сайте](https://seda-ai-pilot.kenymook.chatgpt.site/). Общий NumberField использует настоящий SEDA TextField и13-й исполняемый контракт D32. Sandbox и Spline подключены к установленному пакету; document commit, undo и save остаются у приложений. Компонент экспериментальный; готовность всей дизайн-системы не заявлена.

## Изменения

NumberField хранит исходную строку: пустое значение, Mixed, знак и неполную экспоненту не заменяет нулём. Общая с компилятором числовая модель проверяет min/max/step; клавиши меняют значение в пределах границ и поддерживают представимые десятичные/большие числа. Проверены отказ владельца принять изменение, native editing, IME, readOnly, disabled/fieldset и FormData. Это не parser выражений или финансовая decimal API. В Sandbox/Spline сохранены прежние владельцы транзакций и bounds; несколько шагов подтверждаются одной операцией документа.

Исправлен общий дефект TextField: переданные CSS variables применялись только к input, минуя окружающий control и affix. До исправления regression probe получил48px/font18 вместо58px/font21 и прежний border. Теперь переменные передаются всему составу поля; обычный native input style остаётся только на input. После исправления probe подтвердил58px/font21, заданный border и неизменную цель letter-spacing. Первые результаты отказа сохранены рядом с окончательными.

По замечанию пользователя кнопки «Назад/Далее» выровнены по нижнему краю Select «Строк на странице». Изменена только композиция Projects pagination. Table verifier измеряет нижние границы в общей строке и корректность переноса. Опубликованный экран дополнительно проверен в двух темах при1561×1244; отклонение не превышает1px.

## Проверки и их границы

- Контракты132/132; installed package67/67 групп на React18.3.1 и19.2.7; TypeScript UI, pilot иreferences — PASS. Это разные уровни проверки, не199 уникальных пользовательских сценариев.
- NumberField на каждой версии React:32 выбранных сочетания theme/size/width/RTL,20 неверных моделей,8 compiled profiles; SSR/Strict hydration, keyboard/raw/Mixed/decimal/large values/owner refusal/IME/fieldset/readOnly/FormData и реальные inline compiler bindings. Выборка не является полным декартовым произведением состояний/платформ.
- Все48 application scripts завершились exit0 непрерывными сериями: Lab22 иreferences26. Включены прежние проверки loading, формы, фильтров, таблицы, сохранения, повторной отправки, поздних ответов и изоляции authored document.
- Actual Lab16 профилей и2 editor flows: Sandbox Mixed → stepping → grouped commit → Undo/Redo, invalid cancel, multi-selection persistence/reload; Spline fractional position/scale, document commit/undo, locked иsave/reload.
- Независимый [Linux CI runtime a025c6f](https://github.com/kenymook/seda_docs/actions/runs/40232056972): library, package, Lab иreferences — success. Последующий evidence commit не выдан за уже прошедший CI.
- На опубликованной версии повторены NumberField16 и2 editor flows, Table60, Inspector160 на8 routes и95 painted glyph variants. JavaScript errors0. Сверены925 source hashes,532 опубликованных artifact hashes,686 canonical Git blobs и239 installed UI entries; sourceAlias=false. Numeric core package bytes совпадают с canonical contracts. tokens.json не менялся.

## Визуальная оценка

Просмотрены16 normal кадров всех8 приложений в Light/Dark,8 extreme кадров Sandbox/Spline/Webflow/Framer при1024/XL150/X24/Y12 и выбранные default/error/disabled/focus строки NumberField. После публикации повторно просмотрены actual NumberField, Sandbox/Spline иpagination в Light/Dark. В выбранных строках label/value/unit, рамки и темы согласованы. Baselines не переписывались.

Крайние параметры остаются неудобными: панели тесные, labels сокращаются, toolbars переносятся и canvas получает мало места. Geometry PASS не означает визуальную приёмку такой комбинации. Автоматические измерения, просмотр снимков и Figma/платформенная приёмка разделены.

## Публикация и ограничения

Runtime GitHub `a025c6ffaa8f0658d84515bddaf637c2239e3b57`; Site source `0365a388486bd08dd3d383d4cad3722530ef3fb7`. Deployment `appgdep_6ade6f486d708191944a2125baeed4ed` — succeeded. Access custom/revision1: один owner, групп иexternal visitors0; прежние URL иаудитория сохранены.

Открыты locale decimal parser, pointer stepper/scrub policy, отдельное Figma утверждение NumberField, target OS/AT/touch/Firefox/WebKit/native desktop acceptance. CSS units/auto/expressions остаются отдельным owner DraftProperty.13 executable contracts не сертифицируют все34 component modules /41 runtime exports. Полнота icon catalog, surface contracts исложные grid/editor patterns ещё требуют работы. Прежнее ограничение production Search runner с авторизацией native new tab не объявлено исправленным. Remote sharing иAI backend не симулируются; цель зрелости всей дизайн-системы активна.

[Release](../portal/component-lab/pilots/settings-parametric/verification/number-field/release.json) · [Production proof](../portal/component-lab/pilots/settings-parametric/verification/number-field/production-results.json) · [Evidence hashes](../portal/component-lab/pilots/settings-parametric/verification/number-field/evidence-hashes.json) · [API иgaps](../specs/inputs/number-field.md).
