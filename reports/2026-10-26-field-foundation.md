# Единые роли иконок поля и запасной Web-шрифт

26.10.2026 · private v60 · runtime `d08de31f7b42b9a87cc2e1eeb8c280afbf6ae98f`.

У обычного TextField декоративная иконка наследовала foreground значения, а контрактные правила состояния обращались только к SVG. Общий SEDA Icon рисуется span с CSS mask, поэтому focus/error/disabled могли оставлять ему прежний цвет. Новый installed-consumer verifier воспроизвёл расхождение: `rgb(10,10,11)` вместо разрешённого `rgba(24,25,27,0.6)`. Визуальная проверка затем выявила вторую причину разрозненности: компилятор передавал только `Inter`, перекрывая запасной стек Provider. Без установленного Inter контрактный пример получал браузерный serif fallback рядом с обычным системным sans-serif. Отдельная новая Node-проверка воспроизвела и этот отказ.

Исправлены общие источники, а не стили отдельного экрана:

- Прямые декоративные SEDA Icon и SVG в prefix/suffix TextField получают существующие icon/default, icon/active, icon/error и icon/disabled. Public Provider и контрактные привязки используют те же роли. NumberField наследует свой настоящий visual alias TextField.
- Текстовые приставки, самостоятельные действия и изображения не перекрашиваются правилом иконки. Search явно сохраняет собственные semantic icon roles.
- `withSystemFontFallback` сериализует один стек для Provider, контрактных контролов и Text: исходное имя, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif. Имя токена и цепочка разрешения сохраняются; adapter указан в evidence. Роли code/* сохраняют прежний monospace stack.
- Новых props, токенов, SVG, пресетов или instance contracts нет. Остаются 13 контрактов, восемь профилей и experimental статус библиотеки.

## Проверенный объём

| Уровень | Результат |
| --- | --- |
| Контракты и модели | 140/140 Node-тестов PASS локально и в CI. Новый тест проверяет fallback, равенство стеков control/Text, сохранение исходного значения/chain/adapter и отдельного mono stack. |
| Установленный пакет | 71/71 групп PASS на React 18.3.1 / 19.2.7: реальный npm pack/install, NodeNext types, SSR/hydration и штатные проверки библиотеки, без source alias и CSS Lab. |
| Новый installed-consumer regression | По 80 сочетаний на React: обе темы × S–XL × два набора параметров × default/hover/focus/error/disabled. На каждом проверяются public/bound TextField с Icon, SVG-пробой, NumberField и текстовыми приставками: цвет из независимого compiler oracle, размер/центрирование glyph, контраст enabled-состояний и одинаковые стеки поля/label. Дополнительно четыре Search ownership cases и сохранение DOM-фокуса, значения и курсора при смене темы/масштаба. SVG-проба — тестовая форма, не новая иконка каталога. |
| TypeScript и build | UI/pilot/references PASS; восемь профилей и source audit PASS. Pilot сначала корректно отклонил устаревшую локальную установку UI; после настоящего npm ci выполнена новая успешная сборка. |
| Локальные рабочие экраны | 16 сочетаний = обе темы × S–XL × 100/150%; 112 записей actual fields: bound поиск проектов, public поиск участников и default/error/disabled примеры компонентов. Также filters 240, inspectors 160 на восьми приложениях и glyph paint 95 — PASS; errors 0. |
| Production | Версия 60: те же 16 сочетаний/112 actual fields, filters 240, inspectors 160 и glyph paint 95 — PASS. Все 532 опубликованных artifact hashes совпали; errors 0. |
| CI | [40260589763](https://github.com/kenymook/seda_docs/actions/runs/40260589763): все четыре jobs — success. Все 51 application scripts завершились exit 0: Lab 23 + references 28. Итог относится к указанному runtime head; у коммита отчёта отдельный CI. |
| Поставка | Совпали 930 source hashes, 689 canonical Git blobs, 241 installed UI entries и 532 artifact hashes. Архив проверен. `installedPackage=true`, `sourceAlias=false`, tokens hash не изменился. |

Числа описывают разные уровни проверки и не складываются в оценку зрелости. Новый выборочный regression не покрывает все перестановки параметров и взаимодействий.

## Визуальная оценка и ограничения

Просмотрены installed-consumer состояния в обеих темах, включая error/focus/default и сравнение public/bound. После общего адаптера поля используют одинаковый sans-serif fallback; обе реализации glyph показывают заданный цвет состояния. В Lab просмотрены actual error поля при M100 и M150/X24/Y12, а также обычные кадры рабочих экранов и инспекторов. Screenshot baselines не обновлялись.

[Поле ошибки Light](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/production/fields/field-light-100-error.png) · [Поле ошибки Dark / 150%](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/production/fields/field-dark-150-error.png) · [Проекты, focus / Dark](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/production/fields/projects-dark.png) · [Files Light](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/production/inspectors/recents-light-1440-m.png).

Свежая Figma-сверка TextField `Su1jWqKc9TkD1R8f7wHOQU / 914:9795` дала только sparse metadata сорока variants. Запросы screenshot и подробных child contexts отклонены лимитом Figma MCP Starter. Это не визуальная Figma-приёмка. Анатомия и подложка affix не переделывались; их различия между прежними public и compiler-bound recipes остаются отдельным вопросом до проверки исходного дизайна.

UI-пакет не обещает загрузку основного шрифта. Lab и references явно импортируют Inter через @fontsource/inter; изолированный пакет проверяется без него, что и обнаружило fallback-дефект. Для точного совпадения метрик Figma нужен тот же загруженный основной шрифт; системные fallback между OS могут различаться. Проверен Chromium; target OS/AT/Firefox/WebKit/native desktop и полная визуальная приёмка всех поверхностей/состояний остаются открытыми.

Сохранены исходные отказы и ошибки подготовки измерителя: неверная передача id в page.evaluate и выбор скрытой вкладки состояний. После исправления измерителя тесты выполнены заново; эти ошибки не выданы за продуктовые дефекты. Общая цель зрелой дизайн-системы остаётся активной: полный каталог иконок, сложные grid/editor patterns, surface contracts и Figma/code соответствие ещё не завершены.

[Тот же приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) · версия 60 · deployment `appgdep_6adec182df048191a660a9924d1078c6` — succeeded. Site source `270a9580b2ce9428bcfbe588b45c11af7715d886`. Access custom/revision 1: owner 1, groups 0, external visitors 0. Архив 8250915 bytes; SHA-256 `dffaa81587a2e1f2fc957accc1a497e05dd6eaac386d9c626579199a438a764e`.

[Production](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/production/results.json) · [Release](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/field-release.json) · [Package receipt](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/package-receipt.json) · [Evidence hashes](../portal/component-lab/pilots/settings-parametric/verification/field-foundation/evidence-hashes.json).
