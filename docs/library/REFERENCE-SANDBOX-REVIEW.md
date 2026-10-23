# Sandbox — рабочий редактор и границы соответствия1:1875

Источник: [Figma Ruslan, Sandbox Ruslan – Figma](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-1875). Route: `/references/sandbox.html`. Экран реализуется на установленном SEDA package. Визуальная и продуктовая приёмка **не завершена**.

## Источник и честная реконструкция

[Handoff](REFERENCE-SANDBOX-HANDOFF.md) содержит точные nodes и размеры chrome. В runtime подключены136 отдельных chrome assets с hash manifest. Полный screenshot и Canvas image не используются в приложении: исходный Canvas — один raster с уже нарисованными выделениями и handles, его нельзя выдавать за редактор.

Создана самостоятельная редактируемая реконструкция:15 страниц с исходными названиями,12 artboards в сетке,156 отдельных frame/text/shape объектов. Их ID, геометрия, тексты и стили принадлежат настоящей модели документа. Часть видимого artwork восстановлена приближённо. **Это не исходный Figma scene graph**: координаты/тексты49 source selected objects не получены. Начальное выделение — два реальных неоднородных текстовых объекта, счётчик вычисляется из модели; он не подменяется статическим49.

## Что связано

Tree/Canvas/Inspector используют одни object IDs. Видимые свойства — local X/Y,width/height,rotation,opacity,radius,fill/stroke и typography; common/mixed выводятся по выбранным объектам. Mixed — отсутствие общего значения, не числовой0. Ввод числа применяется Enter/blur; многострочный текст — Ctrl/Cmd+Enter/blur. Invalid draft сохраняется в поле и блокирует save/другую документную команду до применения или Escape. Поля используют реальные SEDA TextField/TextArea, не частные HTML inputs.

Canvas — реальный SVG с отдельными объектами и HTML text layout в foreignObject. Движение в world space переводится в local space родителя; parent+child selection не двигается дважды. Поворот, resize одного объекта с фиксированным rotated top-left, group/ungroup/reparent, align/distribute, duplicate/delete/order и undo/redo изменяют ту же модель. Canvas и artboard preview используют один SceneArtwork renderer.

Pan/zoom/fit и marquee работают с настоящими объектами. Pointer capture, Escape, pointercancel/window blur, смена tool/page и позднее завершение жеста имеют собственную отмену. Необработанная правка поля применяется перед чтением snapshot при переходе на canvas; устаревший gesture не может заменить новый документ. Перемещение камеры не попадает в document undo history.

Сохранение явное: immutable snapshot, lock от повторной отправки, frozen Button geometry, newer edits остаются в памяти. Сохраняются document/page/selection/expansion/cameras; размеры панелей и appearance — отдельно. JSON import проверяет schema/ID/иерархию/finite ranges/paints, не исполняет HTML/код/URLs. Закрытый import и изменившийся документ инвалидируют позднее чтение файла. Quota/corrupt recovery не скрывают потерю хранения.

## SEDA и архитектура

Installed public SedaProvider, Button/IconButton (включая настоящий selected prop), Link, TextField, TextArea, Select, Checkbox, Tabs, Tree, DropdownMenu, SplitView и FileUpload. Shared controls используют compiler profiles; Sidebar selected surface имеет component-token provenance. Раздельные base X отступы Button/field сохраняются; IconButton квадратный. Размер chrome не меняет zoom/font author content.

Scene domain model/affine math/history и editor compositions принадлежат приложению. Это не новые certified SEDA contracts, не NumberField и не сертифицированный Canvas/Toolbar. SplitView остаётся experimental; FileUpload/Link ограничения общей библиотеки сохраняются. Новые component tokens и копии контролов не создавались.

## Проверки и визуальная оценка

`npm --prefix portal/component-lab/pilots/settings-parametric run verify:sandbox` выполняет15 domain-model groups и browser groups отдельно. Они проверяют affine/inverse/nested movement, parent/child normalization, rotated resize, group/reparent, numeric/unknown-prop/depth rejection, page history, camera ownership, совместную работу Tree/fields/SVG, gestures, snapshots, import и profiles.24 profile samples — вложенная матрица, а не24 независимых workflows. Модельные результаты не подменяют browser или visual review.

Первый browser pass нашёл ошибку ожидания в проверке zoom (искался несуществующий private CSS selector): заменён поиск по accessible имени. Pointer проверка теперь сравнивает модель и отрисованный SVG с **фактически доставленными pointer coordinates**, а не требует от браузера недостижимой точности дробных координат requested mouse API. Чистая affine математика проверяется отдельно с допуском1e-7.

Просмотрен первый Dark1440: rail49, navigation вместе с divider241, canvas отx290, inspector отx1090, рабочие scroll regions, реальная сетка artboards и исходный toolbar placement. Это полезная проверка структуры, **не pixel/visual PASS**. Общие SplitView dividers8px вместо исходной тонкой границы; canonical palette/selected/labels/field geometry отличаются. Artwork,49 selected source geometry, typography/wrapping и часть source commands не совпадают и не приняты.

## Оставшиеся ограничения

Не реализованы исходные49 editable objects/полный source artwork, auto-layout/constraints, boolean/vector/pen geometry, multi-object nonuniform resize/skew, prototype hotspots, collaboration/server storage/AI и полный asset management. Нарисованные rect/ellipse/frame/text и сохранение локальные. Page15 names и12 artboard headings не доказывают точное восстановление содержимого документа.

Нет принятой screen-reader/OS IME/native desktop/cross-browser/performance/RTL приёмки. Renderer/Tree ещё не virtualized; лимит5000 объектов — validation boundary, не обещание интерактивной производительности. Mixed property editors — application compositions поверх существующих contracts. Визуальная приёмка этого и остальных экранов остаётся отдельным обязательным gate полной цели.


Локальный итог:15/15 domain-model и18/18 browser groups; [model results](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-model-results.json), [browser results](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-local-results.json). Повторно прошли прежние125 browser groups и9 model groups; общий результат143 browser/24 model, три TypeScript проекта и build PASS. Контракты115/package23 не менялись в этом этапе и повторяются отдельным CI. [Dark](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-dark-1440.png) и [Light](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-light-1440.png) просмотрены; это не утверждённая визуальная приёмка.

## Version19: публикация и независимая проверка

На прежнем [owner-private сайте](https://seda-ai-pilot.kenymook.chatgpt.site/references/sandbox) опубликована version19. Deployment `appgdep_6adbcbf678388191910bb9848aed52b0` succeeded; Sites source `cc1375bfef6b5ac5eb1a88315d83a1895748b9d5`, функциональный GitHub `c0d4e30de4b3ea4b84393feae44cf7b390285dea`. Access revision1: один owner, external visitors0, groups0. [Release record](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-v19-release.json).

Publication checkout повторил три TypeScript проекта, build и143 browser/24 model groups без ошибок. Первое выполнение остановилось до browser checks: Playwright искал отсутствующий default headless shell. Указан уже установленный Chromium через SEDA_BROWSER_EXECUTABLE; выполненные сборки не повторялись, все оставшиеся проверки прошли. [Publication results](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-v19-publication-checks.json).

[CI40022960953](https://github.com/kenymook/seda_docs/actions/runs/40022960953), job120651909514, для functional c0d4e30 completed/success: contracts115, installed-package23 React18/19, browser143, model24, TypeScript/build. [CI record](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-ci-v19.json). Отчёты, добавленные после этого коммита, не объявляются проверенными этим CI.

[Production browser proof](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-live-v19.json) повторил все18 Sandbox groups на приватном origin, включая24 вложенных profile/viewport samples, реальные pointer gestures, mixed apply/undo, parent-child/group, URL history, save snapshot/loading/newer draft, quota/import/late response, preview/reload.582 source hashes совпали с canonical Git bytes; JS errors0. [Dark](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-live-v19-dark.png) и [Light](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-live-v19-light.png) сохранены.

Визуальная приёмка остаётся открытой. На Dark1440 замечены наложения artboard captions между рядами: fixed11px label при zoom14% не помещается в масштабируемый вертикальный gap. Это открытый дефект оформления, не покрытый functional PASS; нужен отдельный расчёт размещения подписей при zoom/перемещении. Source artwork и49-object selection также остаются невосстановленными.
