# D34: согласованная анатомия полей — приватная v61

TextField, Select и NumberField получили общие размерные правила label/helper: Regular, размер и строка эффективного контрола, два раздельных интервала по 4 px. TextField использует content gap 6 px и прозрачный affix. Action/choice/navigation gap 8 px и action Semibold сохранены. Правила работают в публичном Provider и compiler-bound компонентах; новых props, tokens, SVG или instance contracts нет.

Исходное обоснование, адаптер отсутствующего gap/y/xs и границы Figma review: [D34](../packages/seda-contracts/FIELD-ANATOMY.md). [11 read-only наблюдений Figma UI](../portal/component-lab/pilots/settings-parametric/verification/field-anatomy/source/observations.json) сопровождаются снимками и AX-свойствами; 22 файла проверены по canonical Git bytes. Это агентская проверка выбранных слоёв, не дизайнерская приёмка всех вариантов.

## Изменение поведения

- Label и helper следуют S/M/L/XL и D33 scale, включая локальный S внутри Provider M. Фиксированный helper bodySmall больше не управляет этими полями.
- В базовом состоянии полная группа с однострочными label и helper занимает 64/80/96/112 px. Root не получает фиксированной высоты: длинные сообщения переносятся, отсутствие сообщения не оставляет gap.
- Gap между label/control и control/message разрешается из двух отдельных layout roles, связанных с существующим space/xs. NumberField остаётся одним TextField, сохраняет raw-buffer ownership и native поведение.
- Отдельная подложка compiler-bound affix удалена. Ранее проверенные icon/colour роли и контрастные коррекции сохранены; placeholder 40% из Figma не заменяет их без отдельной проверки.
- Отрицательный контроль на предыдущем установленном v60 воспроизвёл public S group 68 px, интервалы 6 px и label 600. В bound-колонке этого отрицательного контроля уже использовались candidate D34 bindings; это не архив всей старой конфигурации.

## Проверка

| Проверка | Результат и реальная область |
| --- | --- |
| TypeScript | PASS в UI package и обеих конфигурациях приложения; подтверждён CI |
| Node contracts | 141/141; API, data/rules, token/provenance и отрицательные проверки; 13 instance contracts остаются прежними |
| Installed package React 18.3.1 / 19.2.7 | 73/73 группы; реальная pack/install сборка, без source aliases |
| Новая anatomy-проверка пакета | По 48 конфигураций / 432 field records на React: public/bound TextField/Select/NumberField, локальный S, отсутствие сообщения, перенос, default/error/disabled, focus/value/caret |
| Loading и совместная параметризация | Существующая installed-package regression прошла для обеих React; loadingFrozen, linked choices, caret, portal inheritance и spinner fit сохранены в raw results |
| Linux CI | [Run 217](https://github.com/kenymook/seda_docs/actions/runs/40269110878), все 4 jobs SUCCESS; package73/Node141, 52 application scripts = lab24 + references28, подтверждены logs, не только списком скриптов |
| Локальная финальная сборка | 64 app configurations / 496 field records, 240 filter cases, 160 inspector samples в 8 routes и 95 glyph-paint samples; ошибок страницы нет |
| Опубликованная v61 | Та же матрица полей/фильтров/инспекторов, ошибок нет; все 532 artifact hashes совпали с подготовленной сборкой |

Числа обозначают группы проверок и выборки, не число компонентов и не полноту системы. Для новой anatomy-матрицы выбранные параметры — scale100/X0/Y0 и scale150/X24/Y12; непрерывный диапазон не исчерпан.

Визуально просмотрены source Input M, снимки установленного пакета в обеих темах, Projects/Settings/Members/Components, Sandbox M и Workflow XL. Снимки находятся в [verification/field-anatomy](../portal/component-lab/pilots/settings-parametric/verification/field-anatomy). Для Workflow при 1024/XL/150% header и inspector требуют внутренней прокрутки; CSS подтверждает владельцев scroll. Удобство такого режима требует дальнейшей работы и не объявляется принятым по одной геометрической проверке.

## Поставка

- Runtime GitHub: `dd1f0e30ef10ec714a3b34e138a24583e63cd3e7`; [PR №4](https://github.com/kenymook/seda_docs/pull/4) остаётся открытым, merge не выполнялся.
- Site source commit: `b431a7f58519f655d935dec6372b540b8a447dae`. Сверены 930 source hashes, 689 canonical Git blobs и 241 installed artifact; tokens.json не менялся.
- Архив: 8267423 bytes, SHA-256 `298b44d5ebcd1183eca52ad3d07dc156f3ed1a5afb4424a7ea305abf2d7f721c`; 534 файла, 532 artifact hashes сверены до публикации.
- Приватная версия **61**: [прежний сайт](https://seda-ai-pilot.kenymook.chatgpt.site/). Deployment `appgdep_6adeda925ce481919e34602ae6858315` — succeeded.
- ACL revision1: 1 owner, 0 groups, 0 external visitors. Доступ не менялся. Credential/bypass token не сохраняются в отчёте.

## Остаётся открытым

Полная визуальная приёмка TextField/Select variants, вложенные affix-композиции и required marker, остальные семейства полей (включая TextArea), popup/browser-OS rendering, системная accessibility, Firefox/WebKit и native desktop shell. Работа над сложными экранами и их полной согласованностью продолжается. Компилятор сохраняет runtimeConformance:not-checked; цель дизайн-системы уровня Figma/Notion/ChatGPT/Cloude Design не объявляется завершённой.
