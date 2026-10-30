# Отчёт интеграции SEDA AI Lab 2.0

Дата: 23 октября 2026. Репозиторий `kenymook/seda_docs`, PR #4. База: `codex/seda-phase-3-react-pilot-20261022`, `a0c2793f6dee705061d8ca931c1ac6af109679ad`.

Исходный архив SHA-256: `290073b8532608be1c55de42fbd46686b7ad1f717519548921119d5203f0d1a5`.

## Текущее исполнение

Сохранена структура переданного Lab 2.0: параметры, workspace, инспектор, граф зависимостей, формулы, before/after и экспорт. Workspace расширен для веб- и десктоп-приложений: навигация «Проекты / Настройки / Команда», поля разных типов, Select, Radio, Toggle, Checkbox, пересечение фильтров, сортировка, выбор строк/indeterminate, bulk action, пагинация, карточки и dialog. Узкое окно не превращает рабочую область в лендинг; таблицы прокручиваются внутри своей области.

Используются **настоящие компоненты `packages/seda-ui`**, импортированные из `@seda-ai/ui`. Build alias направлен на `packages/seda-ui/src/index.ts`. `dist/build-metadata.json#bundledComponents` содержит фактически включённые TSX-модули esbuild. `contract-controls.tsx` только проверяет props и подключает compiled metadata; собственных input/select вместо компонентов библиотеки в нём нет.

Исполняемые контракты теперь существуют для **Button, IconButton, TextField, Select, Checkbox, Radio, Toggle**. Реестр общий для TypeScript API inspector, schema validation и state rules. `compileControl()` проверяет отдельный экземпляр и возвращает его geometry/state/checks/tokenBranch. `compile()` включает четыре новых контракта в `controls`; `createControlWebBindings()` проверяет обязательные состояния и выдаёт CSS assignments с provenance. Отдельный ручной каталог `workspaceTokens` удалён. Runtime лаборатории использует те же executable rules при передаче props настоящим компонентам. Решение и правила: [D25](../../../../packages/seda-contracts/WORKSPACE-CONTRACTS.md).

Геометрия приходит из system/profile compiler без дублирующих пресетов. Дополнительный X прибавляется к базовому padding Button/TextField/Select, а у Checkbox/Radio/Toggle — к интервалу до подписи. Y меняет высоту строки. IconButton остаётся квадратным; Radio круглым, Toggle сохраняет форму. Формулы и React используют одни значения. Служебная панель лаборатории отделена от рабочей области.

## Исправления компонентов

- У input/select убрана двойная рамка фокуса: индикатор принадлежит всей поверхности поля, внутренний элемент не рисует вторую рамку. Клавиатурный фокус остаётся видимым.
- У TextField устранён двойной интервал между label и полем в workspace: margin компонента больше не суммируется с grid gap адаптера. Подписи input/select выровнены с допуском 1 px.
- Select сохраняет нативную семантику, ref и поведение формы. При поддержке `appearance: base-select` popup оформлен теми же component tokens: фон, границы, радиус, размер строк, выбранный пункт и disabled options. При отсутствии поддержки используется системный popup.
- Select/Checkbox/Radio/Toggle объединяют внешний `aria-describedby` с локальным сообщением без повторов и висячего локального ID. Общая утилита использует уже принятые правила TextField для содержимого ReactNode.
- Disabled подавляет визуальную/ARIA ошибку; helper остаётся доступным. У Radio исправлен конфликт checked/defaultChecked. Checkbox сохраняет mixed/indeterminate. Toggle блокирует pointer и keyboard изменения во время loading.
- Button сохраняет border box и X на время loading, label/accessibility и центральный spinner. Существующая модель формы сохраняет snapshot, request ID, синхронный guard, retry и защиту от поздних ответов. Новая геометрия применяется после ответа.

## Уровни проверки

Среда: Windows, Node 24, установленный Chromium через `SEDA_BROWSER_EXECUTABLE`. Числа ниже относятся к реализованным компонентам и сценариям лаборатории, а не ко всей дизайн-системе.

| Проверка | Результат / область |
|---|---|
| TypeScript пилота и библиотеки | PASS |
| Unit tests пакета contracts | 90 / 90: 77 исходных и 13 новых групп; API, ошибки авторства, варианты значений, состояния, токены, общая компиляция и web bridge |
| Lab browser runner | 55 / 55; включая 32 комбинации ширины/темы/размера и 288 вложенных loading-сочетаний |
| Button loading | Максимальный Δwidth/Δheight — 0/0 px при допуске 1 px, включая изменение X во время запроса |
| Workspace runner | 14 / 14; 8 групп геометрии содержат 144 сочетания темы/размера/параметров/ширины/раздела, ещё 5 связанных сценариев и browser errors |
| Control runner | 12 / 12; 8 групп по 5 состояний × 4 компонента = 160 снимков DOM-состояний; keyboard/multi, loading/disabled guard, focus/picker и подтверждение модулей библиотеки |
| Toggle loading | Δwidth/Δheight 0/0 px, 0 callbacks при заблокированных pointer/Space действиях |
| Сборка | 8 профилей, schema validation и source audit PASS; SHA-256 исходников и артефактов проверяет Lab runner |
| Browser errors | 0 ошибок приложения |

Для исходного теста deferred browser checks обновлено ожидаемое количество 13 → 33: новые контракты добавили 20 деклараций. Эти декларации сохраняют `not-checked` в статической проверке; реальные DOM-результаты находятся отдельно. Старый `verify.mjs` phase 3 сохранён и не используется как runner новой композиции.

Машинные результаты: [Lab](verification/lab2-results.json), [workspace](verification/workspace-results.json), [новые контракты](verification/controls-results.json), [unit summary](verification/contracts-results.txt). [Popup Select](verification/select-picker-Light.png), [единая рамка фокуса](verification/field-focus-Light.png).

## Публикация и границы

Обновляется существующий приватный Site `appgprj_6ada9cdd1d4c8191ab6ccb4e9a59a8af`: https://seda-ai-pilot.kenymook.chatgpt.site/ . Policy owner-only (`custom`, один owner, без групп и внешних посетителей) сохраняется. Идентификатор версии, deployment и source SHA фиксируются в PR после успешной публикации; новый сайт не создаётся.

- Navigation/Table/Card/Dialog и составные формы остаются демонстрационными композициями. Семь перечисленных контролов имеют исполняемые контракты; дополнительные X/Y — эксперимент Lab, а не новый сертифицированный размерный профиль.
- Данные и транспорт локальны сессии; серверная запись, реальные email-приглашения и восстановление после reload не реализованы.
- Проверен Chromium. Firefox/WebKit, native desktop shell, screen readers и полный WCAG-аудит не проверены. Popup Select вне поддержки base-select и календарь date остаются системными.
- Закреплённые зависимости не обновлялись. Ранее отмеченные инструментальные dependency/security-ограничения этой интеграцией не устраняются.

## Дополнение: проверка библиотеки как устанавливаемого пакета

В рамках цели зрелой библиотеки для сложных рабочих приложений добавлены build/prepack, публичные ESM/types/CSS artifacts, SSR-safe entry и отдельный consumer verifier. В отличие от Lab, он устанавливает tarball и не использует source alias или CSS лаборатории.

Итог: 8/8 групп проверки поставки на React 18.3.1 и 19.2.7; оба приложения проходят SSR, NodeNext declarations, hydration, связанные контролы и loading. Сборка повторяется с идентичным manifest SHA-256. npm audit library toolchain после обновления Playwright: 0 findings. [Машинные результаты](../../../../packages/seda-ui/verification/package-results.json).

Этот verifier нашёл отдельный дефект Button: `min-width: max-content` позволял скрытому меняющемуся label увеличивать кнопку во время loading за пределами Lab. Ограничение исправлено в library CSS; оба consumer показывают loading Δ0/0 px. Существующие contracts 90/90 и Lab 55/55 повторно прошли после исправления.

Для SSR библиотечный JS entry больше не импортирует CSS автоматически. Consumers должны явно импортировать `@seda-ai/ui/styles.css`; Lab уже делал это. Migration notes находятся в `packages/seda-ui/CHANGELOG.md`. [Полный критерий зрелости](../../../../docs/library/MATURITY.md) включает четыре класса сложных рабочих приложений и остаётся незавершённым. Public npm release и native desktop build этим этапом не заявляются.

## Дополнение: публичные темы и размеры вне Lab

Добавлен SedaProvider с наследуемыми Light/Dark и S/M/L/XL, frozen configuration snapshot и приоритетом явного size компонента. CSS и metadata генерируются из canonical tokens/system, без отдельной таблицы React-пресетов. [Foundation API](../../../../foundation/react-provider.md).

Проверено 11/11 групп установленного tarball на React 18/19: по 24 комбинации theme/size/width, по 4 bare-size сценария, nested scopes/local size, 240 action-state снимков в сумме, error/focus/disabled, state retention и loading при смене профиля. Общий compiler и публичный generator совпадают по восьми профилям и 64 цветовым привязкам/цепочкам. Отсутствие обязательного state token отклоняется; API audit различает standalone-default и Context. 93 unit tests — PASS.

Исправлен отдельный пограничный loading-дефект: короткая кнопка S росла 21.5→42 px при изменении общего профиля на XL. Теперь snapshot включает padding; обе consumer-версии сохраняют Δ0/0 px и применяют новый padding после ответа. [Package summary](../../../../packages/seda-ui/verification/package-results.json), [provider measurements](../../../../packages/seda-ui/verification/provider-results.json).

Lab сохраняет свой исходный layout и экспериментальные X/Y overrides. Проверка provider выполняется в отдельном consumer с реальным установленным пакетом, а не выдаёт CSS лаборатории за поведение библиотеки. Общая цель четырёх классов сложных приложений не считается завершённой; полный API остальных компонентов и platform/accessibility matrix остаются впереди.

## Публикация public provider / version 8

Проверенный код: `13acd516fc11b84757777b44fd0279ad42f22601`. [Clean Ubuntu CI 39954141798](https://github.com/kenymook/seda_docs/actions/runs/39954141798): package 11/11, contracts 93/93, TypeScript, build и 81 browser checks — success. Публикационный checkout повторно прошёл TypeScript/build и 55+14+12 checks.

На прежнем owner-private Site опубликована версия 8. Source SHA: `1b513b5357f61550853cf1c280e8a8921766a8c7`; deployment `appgdep_6adb5551651881919460b2625bd339d4` — succeeded. Access policy revision 1: один owner, без групп/внешних посетителей.

Свежая production-проверка: HTTP 200; все 85 source hashes совпали с проверенным checkout; Projects/Settings/Members, сохранение snapshot и зависимые controls работают; loading Δ0/0 px, IconButton квадратный, Select использует styled native picker и одну рамку focus; page errors 0. [Результат](verification/live-provider-v8.json).

Числа тестов относятся к ограниченным проверяемым слоям, а не к полной зрелости библиотеки: 93 unit tests общего compiler/contracts, 81 browser check Lab и 11 групп поставки/consumer tests. Вложенные матрицы и palette snapshots не считаются отдельными пользовательскими сценариями. Полная работа по четырём reference applications продолжается.

## D27: Tabs в общем compiler и рабочей форме

Восьмой executable component contract — Tabs. API/defaults извлекаются из реальных types/implementation, nested content/icon slots проходят TypeScript проверку внутри items. Правила items/selection и authored per-item states, line/pill token requirements и browser-safe binding входят в общий compiler. Прямой compileControl теперь отклоняет отсутствующие обязательные color roles; только валидировать весь profile заранее недостаточно.

Settings использует настоящий SEDA Tabs: две панели с mounted полями, сохранение draft и зависимых controls, раскрытие панели ошибки до focus. Size/theme/text scale/X/Y влияют и на Tabs; это тот же Lab geometry experiment поверх canonical profile. Публичный пакет включает navigation CSS автоматически.

Локально прошли TypeScript обоих проектов, 13 package proof groups, полный unit run 100/100, Lab/workspace/controls 55+15+12. После усиления прямого compileControl отдельно повторены семь Tabs tests — PASS. Consumer DOM сопоставляется с compiler в семи selection snapshots на каждом React runtime; восемь общих профилей и 80 цветовых привязок/цепочек сверены с public generator. Финальная чистая CI и повторная публикационная проверка фиксируются после завершения.

Шесть Tabs DOM checks в статическом contract report остаются not-checked. Browser proofs не заменяют screen readers, Firefox/WebKit, native desktop runtime, full catalogue и четыре сложных reference applications. Следующая общая работа: overlays/menus, resizable panels, Tree и commands. Общая цель остаётся активной.


## Публикация version 9 и чистая CI D27

[CI 39959381410](https://github.com/kenymook/seda_docs/actions/runs/39959381410), code `0d3f6e11c090bafffc808c57b459e6882ab26a59`: все шаги success — package 13/13, unit 100/100, оба TypeScript, build и browser 55+15+12. Follow-up `9fd9b99` включает Tabs в измерения Inspector; его run 39959605474 пока in_progress на установке Chromium и не объявлен успешным. Публикационный checkout с follow-up прошёл TypeScript/build и все 82 browser checks.

Прежний private Site: version 9; deployment `appgdep_6adb5e73b50c81918347af75514712e4` succeeded; source SHA `3990395fb70c5f4e6bdd211c1a9d402678939626`. Policy revision 1 сохранена: один owner, без groups/external visitors. На живом сайте проверены настоящий contract Tabs, keyboard, draft retention и раскрытие ошибки скрытой панели; loading Δ0/0, IconButton square, single focus/Select picker, JS errors 0. Все 90 source hashes совпали с проверенным checkout. При сверке provider.css единственное расхождение оказалось CRLF/LF; deployment bytes отдельно совпали с Git blob, после восстановления canonical LF повторная строгая сверка прошла без изменения кода. [Live result](verification/live-tabs-v9.json), [Settings Light](verification/settings-tabs-Light.png), [Settings Dark](verification/settings-tabs-Dark.png).

Эта публикация не завершает цель зрелой библиотеки. Четыре сложных reference applications, overlays/menus, panels/Tree/commands, data/editor/conversation primitives и полная runtime/accessibility matrix остаются впереди.

## Публикация D28: version 11 и визуальная оценка

На прежнем owner-private сайте опубликована version 11: deployment `appgdep_6adb6d7955748191b4d8d80fa72a0ce7` succeeded; Sites source `b525870c54f55abcc3e724b5601786859d05a3e6`, функциональный код GitHub `ffcf80a1df6a26c066e8acb38125bbfc0b563906`. Access policy revision 1 сохранена, один owner, external visitors/groups отсутствуют.

Оба TypeScript, сборка и все 84 browser checks повторно прошли в publication checkout. Package proof — 15/15, 14 Menu DOM/compiler snapshots и 32 profile measurements. Чистый Ubuntu [run 39968677287](https://github.com/kenymook/seda_docs/actions/runs/39968677287) на code ffcf80a завершился **success**: installs, оба TypeScript, build, package 15/15, contracts 106/106 и browser 55+17+12. Числа подтверждены завершёнными job logs 120465220291. Последующие commits содержат только отчёты, screenshots и документацию; опубликованный функциональный код совпадает с проверенным.

[Свежий production result](verification/live-menu-v11.json): HTTP200, 97 source hashes совпали, настоящий DropdownMenu, copy dialog, delete confirmation/cancel/focus fallback, Tabs/формы/linked controls работают, loading Δ0/0 px, JS errors 0. На визуальном просмотре version 10 был найден белый малоконтрастный menu trigger; исправлен в shared library и повторно опубликован. В version 11 glyph видим, ghost trigger имеет измеренный contrast 11.013:1 в проверенном Dark состоянии.

[Журнал качества](../../../../docs/library/QUALITY-REVIEWS.md) фиксирует также открытый Q002: legacy demo theme selectors перекрашивают внутренние SEDA input/select. Геометрические тесты этого не доказывают; общая визуальная приёмка рабочего пространства остаётся незавершённой. Следующее исправление — изоляция demo theme rules, затем общие панели/дерево/команды для reference screens. Девять эталонов и четыре класса приложений остаются обязательными; цель не завершена.

## SplitView и редактор: publication version 12

Функциональный code `e7916cd5536aa5717e35f26e88947643ab7c2b81`: добавлен общий experimental SplitView, два вложенных экземпляра в странице «Редактор» и исправлена изоляция theme rules реальных полей. Модель редактора связана с inspector/preview, содержит undo/redo и явно сохраняется вместе с requested размерами панелей в localStorage. Reload, повреждение данных, пустой текст и ошибка записи проверены. Объектная навигация — обычные кнопки, не завершённый Tree contract.

SplitView поддерживает pointer/keyboard/RTL, minimum/maximum constraints, Enter minimum/restore (minSize=0 даёт collapse), Escape/pointercancel и controlled rejection. Дочерние состояния остаются mounted; callbacks после unmount защищены. Нехватка места обозначена data-overconstrained и scroll, минимумы не скрываются. [Spec](../../../../specs/overlays-layout/split-view.md) фиксирует token gaps и непроверенные платформы. Layout instance contract ещё отсутствует; registry по-прежнему содержит девять contracts.

Локально и в публикационном checkout прошли оба TypeScript, build и 87 browser checks (55 Lab +20 workspace +12 controls). Full local contracts — 107/107. Installed tarball React 18/19 — 17/17 proof groups; 16 NodeNext negative checks, 128 public color/provenance bindings, SplitView keyboard/pointer/SSR/hydration/StrictMode и 16 aggregate theme/orientation/width snapshots. Вложенные комбинации не считаются отдельными пользовательскими сценариями. [CI 39975034950](https://github.com/kenymook/seda_docs/actions/runs/39975034950), job 120487286870, пока in_progress (после установки Chromium прошёл library TypeScript, выполняется package proof); полного CI success этого этапа пока нет.

На прежнем owner-private сайте опубликована **version 12**, deployment `appgdep_6adb7827307c8191819a64071137b10f` succeeded, Sites source `e03b4e7d07e4689e356a0eb62df10f9054af1ba8`. Access policy revision 1 сохранена: один owner, без external visitors/groups.

[Production proof](verification/live-editor-v12.json): HTTP200, **103 source hashes** совпали; resize navigation 180→188 px, linked inspector/preview, undo/redo, save/reload и восстановление ширины 188 px работают. Foundation provenance виден отдельно. Q002 закрыт: filter/project имеют прозрачный inner и тот же foreground, что wrapper; изображение Dark после исправления просмотрено. Loading Δ0/0, IconButton square, single focus/Select picker, JS errors 0. [Устойчивые цвета](verification/visual-editor-v12.json) отдельно проверены после finite transitions: enabled navigation имеет ожидаемый foreground и opacity 1 в Light/Dark.

Это experimental editor composition, **не один из принятых Figma reference screens**. Девять эталонов и четыре класса приложений остаются обязательными и незавершёнными. Дальше нужны Tree/selection/commands и reference applications; native desktop, Firefox/WebKit, screen readers и полный accessibility/performance audit не доказаны.
