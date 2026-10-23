# SEDA — зрелость библиотеки для сложных рабочих приложений

Объектив: «Создай дизайн систему будущего. Критерий зрелости дизайн системы, на основе нее можно собрать такие интерфесы как figma, Notion, ChatGPT, Cloude Design».

Обязательное дополнение пользователя от 23 октября 2026: для сдачи готового проекта необходимо подготовить рабочие экраны уровня [Figma Ruslan](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=0-1), оценить качество их реализации и устранить блокирующие дефекты. [Матрица девяти эталонных экранов и методика приёмки](REFERENCE-SCREENS.md) — часть этой цели. Это требование дополняет четыре класса приложений ниже. Текущие тесты компонентов и лаборатории сами по себе его не закрывают; эталонные экраны пока не реализованы и не оценены.

Пользователь уточнил приоритет: максимально зрелая библиотека для веб- и десктоп-приложений. Ни зелёная лаборатория, ни количество specs не доказывают этот результат. Ниже рабочая декомпозиция полного критерия, а не замена цели одним удобным этапом. Состояние на 23 октября 2026.

## Что должно быть доказано

Названия продуктов обозначают классы сложности интерфейсов. Сценарии ниже — требования к нашим reference applications; они не являются заявлением о внутренней архитектуре или полном наборе функций этих продуктов.

| Класс приложения | Требуемые рабочие сценарии | Общие элементы библиотеки |
|---|---|---|
| Пространственный редактор уровня Figma | Панели и дерево объектов; выделение; inspector; zoom/pan; клавиатурные команды; свойства объекта; undo/redo; сохранение и восстановление рабочего состояния | AppShell, split/resizable panels, Tree, Toolbar, Tabs, Menu, Popover, Dialog, поля свойств, canvas surface, selection model |
| Документное пространство уровня Notion | Дерево документов; редактор блоков; slash commands; inline toolbar; перемещение блоков с keyboard alternative; таблица/списки; сохранение и reload | Navigation, Tree, command palette, rich content primitives, menus, overlays, sortable/virtual lists, Table, inline feedback |
| Диалоговое приложение уровня ChatGPT | Thread navigation; composer; вложения; длинная история; потоковый ответ; stop/retry; ветвление/редактирование; состояния инструментов и ошибок | ChatBubble, Composer, TextArea, FileUpload, virtual list, actions, progress/feedback, scroll anchoring, async state |
| Дизайнерское AI-пространство уровня Claude Design | Диалог рядом с редактируемым артефактом; версии; inspector; preview; изменение размеров панелей; откат и подтверждение изменений | Те же панели/команды/диалоговые элементы/история; artifact surface; controlled state и feedback |

Все четыре приложения должны использовать один установленный пакет SEDA и общие primitives. Копирование отдельных контролов, raw CSS поверх каждого приложения или новые несогласованные component tokens не подтверждают критерий. Функциональность предметной области остаётся у приложения; библиотека обеспечивает общие взаимодействия и визуальные/доступные состояния.

## Обязательные качества

1. **Поставка:** воспроизводимые ESM/types/CSS, корректные exports и peer dependencies, установка tarball в отдельное приложение, отсутствие alias на repo source.
2. **Foundation:** общие токены, темы, плотность, типографика, radius, focus, motion/reduced motion, RTL/локализация и high contrast. Геометрия не определяется частными overrides каждого reference app.
3. **Взаимодействие:** мышь и клавиатура, сохранение focus, предсказуемые overlays/commands, управление selection, controlled/uncontrolled, async/disabled/error и отсутствие поздних side effects.
4. **Доступность:** проверка семантики, focus и имени в браузерах; screen reader и ручные проверки на целевых платформах. Автотесты не заменяют эту часть.
5. **Составные интерфейсы:** данные/selection/history не теряются при смене панели, темы, плотности или маршрута. Сохранение/reload и ошибки восстановления проверены там, где обещаны приложением.
6. **Масштаб:** измеренная работа с длинными списками, деревьями, документами и threads; измеренные границы и воспроизводимые performance fixtures. Числа производительности будут утверждаться по измерениям, а не назначаться задним числом.
7. **Контракты:** API, состояния, component-token bindings, DOM и документация согласованы; отрицательные случаи действительно отклоняются. Непроверенные возможности обозначены явно.
8. **Эксплуатация:** версии, migration notes, reproducible build, dependency audit, компонентные примеры и быстрый старт, явные границы поддержки.

## Текущие свидетельства и пробелы

| Область | Есть сейчас | Не доказано / нужно продолжить |
|---|---|---|
| Кодовый каталог | 16 component exports + provider/configuration API, включая experimental SplitView; добавлен SplitView spec | Полное покрытие согласованного каталога и сложных editor primitives |
| Исполняемые контракты | 9 компонентов, 8 профилей, API/state/token validation; 107 unit checks с foundation binding | Layout instance contract, остальные навигация/overlays, data и editor primitives; согласование с переносимым Contract Standard из product draft |
| Реальное приложение | Lab: проекты/настройки/команда/experimental editor; 55+20+12 browser checks | Девять эталонных экранов и четыре перечисленных класса сложных рабочих интерфейсов |
| Поставка | Раньше npm pack не включал объявленные dist exports; добавлены build/prepack/files, отдельный consumer verifier | Public release/support policy и полный target-runtime matrix |
| Реальный consumer | 17/17 групп: установка tarball, React 18.3.1/19.2.7, Node ESM/SSR, declarations NodeNext, hydration, CSS, linked selection/loading, Tabs/Menu/SplitView | Остальные компоненты, browser engines и полная contract-матрица |
| Foundation вне Lab | Публичный SedaProvider, Light/Dark × S/M/L/XL из общего system/resolver; nested scopes и explicit size; 13 package proof groups (включая две группы Tabs) | Дальнейшая матрица остальных компонентов, полная accessibility и target runtime проверка |
| Доступность | Native controls, description merge, keyboard/focus в проверенных сценариях | Screen reader, target ОС, forced colors, reduced motion, полная WCAG-проверка |
| Инструменты | Закреплённые зависимости; npm audit новой library toolchain: 0 findings; удалённый CI Ubuntu прошёл | Публичный выпуск артефакта и полная политика совместимости |

## Продвижение: experimental DropdownMenu

В общий пакет добавлен DropdownMenu с owned Button/IconButton trigger, grouped actions, реальными shortcuts, document overlay stack и portal/top-layer placement. Installed consumer на React 18/19 проверил клавиатуру, disabled guards, controlled rejection, nested provider shortcut isolation, смену theme/geometry без потери focus, передачу focus в host-диалог, Popover fallback и StrictMode cleanup. Полный package run: 15/15 групп; меню — 16 profile/viewport измерений на runtime, 32 суммарно. Это вложенные измерения двух menu proof groups, а не 32 новых пользовательских сценария. Library и pilot TypeScript/build прошли. [Menu evidence](../../packages/seda-ui/verification/menu-results.json).

DropdownMenu пока не зарегистрирован в общем instance compiler и не подключён к действиям Lab; это следующая работа. Число executable contracts остаётся 8. Screen reader, Firefox/WebKit, native desktop и девять эталонных экранов не доказаны. Общий objective остаётся активным.

## Продвижение: D28 и действия таблицы

DropdownMenu включён в registry/schema/API/common compiler и web adapter. Items/open/shortcut ownership проверяются на instance layer, пять browser declarations остаются not-checked. Focus/danger semantic adapters разрешаются с provenance. Installed consumer сопоставляет семь DOM snapshots с compiler на runtime (14 суммарно); profile source verifier сверяет 104 color/provenance bindings. Package proof — 15/15 групп React 18/19.

Lab использует настоящий DropdownMenu в row actions: сведения, копия через существующий диалог, удаление с подтверждением. Draft и ожидаемый focus сохраняются; после удаления trigger focus идёт в search. На свежей сборке пройдены 55 Lab + 17 workspace + 12 controls = 84 browser checks. Full unit run — 106/106; после уточнения active tokenState меню повторно пройдены все шесть Menu unit tests. TypeScript и build прошли. Это не приёмка девяти reference screens и не проверка native desktop. Публикация и удалённый CI этого этапа фиксируются после фактического результата.

## Текущий этап поставки

- Первый потребитель: независимое React-приложение, включая web UI в desktop shell.
- Обещание этапа: пакет можно собрать, установить и использовать без исходников репозитория.
- Внешний к исходникам proof: два отдельных consumer-проекта устанавливают настоящий npm tarball.
- Граница готовности этапа: entry/types/CSS присутствуют, SSR/hydration/types/interactions проходят на заявленных React 18/19, сборка воспроизводится, React не вшит в библиотеку.
- Этот этап **не завершает общий objective**. Public theme/profile layer теперь проверен вне лаборатории. Следующая работа — Tabs instance contract и остальные элементы рабочих пространств: overlays/menus, панели, дерево и команды; затем reference applications и их общие contracts.

## Последовательность реализации

1. Завершить и зафиксировать доказательство поставки.
2. Вынести общие темы/профили в библиотечную интеграцию и проверить самостоятельные формы без Lab CSS. Исправления должны жить в shared library, а не маскироваться в reference app.
3. Реализовать навигацию, overlays, панели, Tree и commands с контрактами и keyboard behavior по существующим specs. Новые API документировать; unsupported возможности не объявлять ready.
4. Добавить data/editor/conversation primitives и собрать четыре рабочие композиции поверх одной библиотеки.
5. Проверить связанные сценарии, историю/сохранение/reload, масштаб, темы/плотность, accessibility и целевые browser/desktop runtime.
6. Провести полный аудит исходного objective по каждому обязательному сценарию и качеству; только после этого обсуждать общую зрелость и выпуск.

Доказательство текущего этапа: [package results](../../packages/seda-ui/verification/package-results.json), [consumer verifier](../../packages/seda-ui/scripts/verify-package.mjs), [CI](../../.github/workflows/library.yml). Consumer-проверка нашла и закрыла реальный рост loading Button при изменении label вне Lab.

Удалённое подтверждение: [GitHub Actions run 39946528027](https://github.com/kenymook/seda_docs/actions/runs/39946528027), commit `b680ca9751b1db921c7778ca4dc6238d279d011b`: чистые npm ci, package proof, 90 contracts tests, TypeScript и все три browser runners — success. Это подтверждает этап поставки на Windows/Ubuntu, но не заменяет аудит четырёх классов приложений.


## Продвижение: общие публичные профили

Добавлен SedaProvider, два режима темы и четыре размера вне Lab CSS. По 24 комбинации theme/size/width и по 4 bare-size сценария проверяются на каждом React runtime, с nested scopes, local overrides, state retention, error/focus и loading при смене профиля. Palette-проверка содержит 240 снимков состояний двух action-компонентов (2 React × 2 темы × 6 вариантов × 5 состояний × 2 компонента). Это вложенные измерения 11 групп, а не 240 новых пользовательских сценариев.

93 unit tests подтверждают API defaults/provenance, token resolver и существующие rules. Поведение остальных компонентов, полные contract variants, навигация/overlays/editor primitives и четыре целевых класса приложений остаются незавершёнными. Следующий общий кодовый слой — навигация, панели и команды по существующим specs.

Удалённая проверка public provider: [run 39954141798](https://github.com/kenymook/seda_docs/actions/runs/39954141798), commit `13acd516fc11b84757777b44fd0279ad42f22601`: package 11/11, contracts 93/93, TypeScript, build и Lab/workspace/controls 81/81 — success на чистом Ubuntu/Node 24.

## Продвижение: Tabs рабочих панелей

Первый public navigation component — Tabs (line/pill) с keyboard/RTL, controlled state, hidden mounted panels и focus repair. Installed consumer React 18/19 проверяет SSR/hydration и 64 комбинации профиля/варианта/ширины суммарно. Navigation proof добавляет две группы к package verifier: локально 13/13. Tabs теперь является восьмым instance contract общего compiler; интегрирован в Settings с сохранением draft и раскрытием скрытой ошибки. Это пока не полноценная workspace navigation. Следующая работа: overlays/menus, resizable panels, Tree и commands. Общий objective остаётся активным.

Удалённая проверка Tabs: [run 39956240735](https://github.com/kenymook/seda_docs/actions/runs/39956240735), commit `515ad7a9cf9018fc36e942b0be872e0ade07ed79`: чистые installs, TypeScript обоих проектов, package 13/13, contracts 93/93, build и Lab/workspace/controls 81/81 — success. [Измерения Tabs](../../packages/seda-ui/verification/tabs-results.json). Публикация этой проверки была version 8; последующий этап Tabs описан ниже.

## Продвижение: общий контракт и Settings Tabs

D27 добавил Tabs в registry/schema/API inspector/common compiler. Сериализованные nested slots проверяются по реальным TypeScript props; значения choice snapshots и обязательные token roles проверяются при compileControl. Web binding использует разрешённые данные с provenance. В installed consumer семь DOM snapshots на runtime сопоставляются с compiler; профильный generator теперь сверяет 80 color/provenance bindings суммарно.

Settings Lab использует настоящий Tabs через contract adapter. Panels сохраняют mounted поля, cross-panel validation открывает скрытую ошибку до focus; common size/theme/X/Y влияют и на Tabs. Package proof 13/13, полный unit run 100/100 и browser 55+15+12 прошли локально; после ужесточения direct compileControl повторно прошли все семь Tabs tests. Финальная чистая CI и публикация фиксируются отдельной записью. Общий objective не завершён.


Удалённое подтверждение D27: [CI 39959381410](https://github.com/kenymook/seda_docs/actions/runs/39959381410), commit `0d3f6e11c090bafffc808c57b459e6882ab26a59`: package 13/13, contracts 100/100, TypeScript и Lab/workspace/controls 82/82 — success на чистом Ubuntu/Node 24. Следующий commit `9fd9b99` добавляет только Tabs в DOM measurements Inspector; публикационный checkout повторно прошёл TypeScript/build и 82 browser checks. Его remote run 39959605474 пока in_progress на установке Chromium; не заявлен как PASS.

На прежнем owner-private сайте опубликована version 9, Sites source `3990395fb70c5f4e6bdd211c1a9d402678939626`. Свежая production-проверка: 90 source hashes совпали, Tabs contract/keyboard/draft/cross-panel validation работают, loading Δ0/0, JS errors 0. [Live result](../../portal/component-lab/pilots/settings-parametric/verification/live-tabs-v9.json). Следующий слой — Dropdown Menu/overlay interactions для toolbar и действий таблицы, далее resizable panels, Tree и commands.

## Публикация D28: version 11 и визуальная оценка

На прежнем owner-private сайте опубликована version 11: deployment `appgdep_6adb6d7955748191b4d8d80fa72a0ce7` succeeded; Sites source `b525870c54f55abcc3e724b5601786859d05a3e6`, функциональный код GitHub `ffcf80a1df6a26c066e8acb38125bbfc0b563906`. Access policy revision 1 сохранена, один owner, external visitors/groups отсутствуют.

Оба TypeScript, сборка и все 84 browser checks повторно прошли в publication checkout. Package proof — 15/15, 14 Menu DOM/compiler snapshots и 32 profile measurements. Чистый Ubuntu [run 39968677287](https://github.com/kenymook/seda_docs/actions/runs/39968677287) на code ffcf80a завершился **success**: installs, оба TypeScript, build, package 15/15, contracts 106/106 и browser 55+17+12. Числа подтверждены завершёнными job logs 120465220291. Последующие commits содержат только отчёты, screenshots и документацию; опубликованный функциональный код совпадает с проверенным.

[Свежий production result](../../portal/component-lab/pilots/settings-parametric/verification/live-menu-v11.json): HTTP200, 97 source hashes совпали, настоящий DropdownMenu, copy dialog, delete confirmation/cancel/focus fallback, Tabs/формы/linked controls работают, loading Δ0/0 px, JS errors 0. На визуальном просмотре version 10 был найден белый малоконтрастный menu trigger; исправлен в shared library и повторно опубликован. В version 11 glyph видим, ghost trigger имеет измеренный contrast 11.013:1 в проверенном Dark состоянии.

[Журнал качества](QUALITY-REVIEWS.md) фиксирует также открытый Q002: legacy demo theme selectors перекрашивают внутренние SEDA input/select. Геометрические тесты этого не доказывают; общая визуальная приёмка рабочего пространства остаётся незавершённой. Следующее исправление — изоляция demo theme rules, затем общие панели/дерево/команды для reference screens. Девять эталонов и четыре класса приложений остаются обязательными; цель не завершена.
