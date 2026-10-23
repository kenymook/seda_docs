# Журнал визуальной оценки реализации

## 23 октября 2026 — меню действий в рабочем пространстве

Исходный code commit: `ffcf80a1df6a26c066e8acb38125bbfc0b563906`. Production version 11, [снимок Dark](../../portal/component-lab/pilots/settings-parametric/verification/menu-live-v11-dark.png). Это проверка отдельной композиции Lab; девять reference screens из Figma не считаются реализованными или принятыми.

### Q001 — закрыто: неразличимый trigger меню в Dark

На production version 10 геометрические проверки проходили, но screenshot показал белый квадрат с почти невидимым многоточием. Причина: icon-only DropdownMenu использовал secondary IconButton, а adapter передавал foreground ghost. Также source CSS ghost не учитывал compiled foreground fallback.

Исправление в общей библиотеке: icon-only trigger использует ghost; IconButton ghost читает canonical foreground с fallback в compiled adapter. Добавлены проверки варианта, прозрачного background, ожидаемого foreground, glyph и квадратной геометрии на Light/Dark в installed consumers и workspace. Production version 11: ghost, rgba(255,255,255,0.85) на rgb(29,41,56), contrast 11.013:1. Изображение после исправления просмотрено, glyph различим. Это измерение конкретного состояния, а не полный WCAG-аудит.

### Q002 — закрыто в version 12: наследованные demo theme selectors окрашивают внутренности полей

При XL, X=24, Y=6, Dark на screenshot видны разные заливки wrapper и внутреннего Select. В source найдена конкуренция: `body.dark .toolbar select`, `body.dark .fieldrow input` и `body.dark .modalBody input` в Lab styles.css имеют более высокую specificity, чем правила прозрачного внутреннего элемента в workspace.css. Это утечка legacy demo styles в реальные SEDA controls; геометрический PASS её не закрывает.

Demo selectors теперь исключают .seda-field__input/.seda-field__select. Не добавлялись цвета отдельных instances: wrapper продолжает брать canonical surface/foreground, внутренний элемент прозрачен и наследует текст. В общей геометрической матрице проверяются также эти свойства на всех видимых полях Projects/Settings/Access/Members/Editor; отдельная группа проверяет диалог Light/Dark × S/M/L/XL. [Production Dark](../../portal/component-lab/pilots/settings-parametric/verification/fields-live-v12-dark.png) просмотрен: заливка фильтров равномерная при XL, scale125, X24, Y6. [Live proof version 12](../../portal/component-lab/pilots/settings-parametric/verification/live-editor-v12.json) подтвердил прозрачный внутренний элемент и наследуемый foreground у filter/project, 103 исходных хеша совпали. Это не общая приёмка всех экранов.

### Панели редактора — ограниченная визуальная проверка

Просмотрены [Light](../../portal/component-lab/pilots/settings-parametric/verification/editor-workspace-Light.png) и [Dark](../../portal/component-lab/pilots/settings-parametric/verification/editor-workspace-Dark.png): три области, реальные controls, связанный preview и независимые scroll regions. Тесты проверяют pointer/keyboard resize, состояние children, историю, сохранение/reload и ошибки хранения. При узком окне применяется явный overflow minimum constraints. Это experimental composition, не точная реализация одного из девяти Figma frames; их статус не меняется.

## Как применять вывод

Устойчивые production screenshots снимаются после конечных CSS transitions (animations disabled только для screenshot), чтобы не принимать промежуточную интерполяцию Light→Dark за постоянный дефект. Отдельно проверены computed foreground активной навигации, disabled=false и opacity=1 в обеих темах: [visual proof](../../portal/component-lab/pilots/settings-parametric/verification/visual-editor-v12.json), [устойчивый Dark](../../portal/component-lab/pilots/settings-parametric/verification/editor-live-v12-dark.png). Это не motion/reduced-motion аудит и не обновление baseline для сокрытия регрессии.

При оценке экрана проверять вместе layout, различимость команд, focus, заливку wrapper/внутреннего элемента и реальные состояния. Автоматические measurements дополняют просмотр screenshots. Для найденного визуального дефекта добавлять regression на конкретную причину; не обновлять baseline, чтобы скрыть проблему. Закрытие одного дефекта не означает готовность всей библиотеки или screen.

## Tree — локальная проверка перед публикацией

Просмотрены [Dark editor](../../portal/component-lab/pilots/settings-parametric/verification/editor-tree-dark.png) и installed-consumer [Dark Tree](../../packages/seda-ui/verification/tree-19.2.7-dark.png): вложенность, отличимый selected row и сохранённое полное accessible имя при ellipsis. В узкой панели длинная подпись сокращается, инспектор показывает текст целиком; это не visual acceptance Figma reference. Отдельного утверждённого Figma Tree пока нет.

Joint test обнаружил crash от whitespace draft: подпись Tree обязана быть непустой, поэтому editor даёт запасное имя, не переписывая draft. Regression проверяет пустой текст, видимую ошибку, save guard и отсутствие JS errors. Все 21 workspace checks прошли после исправления. Проверка unit/geometry не заменяет эту проверку связи контролов.

Production version13: просмотрен [устойчивый Dark editor с Tree](../../portal/component-lab/pilots/settings-parametric/verification/editor-tree-live-v13-dark.png); selected row различим, подписи в узкой панели обрезаются штатным ellipsis, полный текст остаётся в inspector/accessibility name. Tree selection/expansion пережили explicit save/reload; X/Y/height подтверждены production measurements. Сам editor ещё не соответствует ни одному reference frame и не закрывает приёмку девяти экранов.

## Recents — оценка source assets и регрессий

[Review](REFERENCE-RECENTS-REVIEW.md) содержит source/actual screenshots и раздельные статусы визуального соответствия и функциональности. Первая QA нашла portrait avatar вместо thumbnail у Главная Салют, потерянный цветной фон SVG avatars и отсутствие подложки file-type marks. Исправлены роли исходных assets и контейнеры из design context; [production Dark v14](../../portal/component-lab/pilots/settings-parametric/verification/recents-live-v14-dark.png) просмотрен после исправления. Эти дефекты не закрывались обновлением baseline.

Новая ссылка на экран давала overflow64px у старого Lab390. Исправлен wrap шапки; существующие55 Lab и21 workspace checks прошли без ослабления допусков и отдельно повторены на Ubuntu CI. Installed manifest check выявил несовпадение public CSS/profiles и теперь останавливает stale package build. Технические97 browser checks и source hash parity не компенсируют незавершённую визуальную приёмку эталона.

## Building — локальная проверка документа

[Review](REFERENCE-BUILDING-REVIEW.md) разделяет 5 model и 12 browser groups, 24 вложенных profile samples и незавершённое визуальное соответствие. Сравнение source/actual показывает отличия шрифта, переносов, sidebar/Tree surfaces, контраста и дополнительных команд. Геометрический PASS не закрывает эти расхождения. Проверка выделения между блоками выявила риск обработки Enter/Delete в чужом диапазоне; добавлены guard и отдельный сценарий с границами на Element. Общая цель и визуальная приёмка остаются открытыми.

## Building — различие declared и фактически отрисованного шрифта

[Продолжение review](REFERENCE-BUILDING-REVIEW.md#доработка-типографики-и-границ-изменений): source Segoe UI16/26 и regular headings восстановлены в content surface, Inter controls сохранён. Проверяется не только computed font-family: CDP возвращает actual platform font и число glyphs. На Windows подтверждён Segoe UI; на Linux/Mac используется fallback и нельзя обещать те же переносы. Визуальное соответствие всё ещё требует приёмки. Структурная команда сверх глубины отклоняется до изменения модели/history; rejected typing/paste восстанавливают DOM по принятой модели.

## TextArea — целостность ввода и состояние в реальном приложении

[Review](TEXTAREA-REVIEW.md) фиксирует фактические дефекты и regression: bidi порядок счётчика, потеря ручной высоты на rerender, disabled+readOnly cascade, active paint и скрытый источник значения children/HTML. Все исправлены до публикации17; installed React18/19 и production checked. Просмотрен Light/Dark dialog Building с сохранённым multiline comment: один textarea frame, label/counter и ожидаемая высота по общему профилю. Отдельная Figma component/AT/native desktop приёмка этим не заменяется.

## Chat — source lists, общий Link, Stop и восстановление scroll

[Review](REFERENCE-CHAT-REVIEW.md) фиксирует реальную причину непрошедших сценариев: неправильная группировка source numbered list; игнорируемый Link variant; повторный submit при DOM-переходе Stop→Send; ранний scroll до восстановления модели. Исправления проверяются на уровне структуры, public package и приложения отдельно. Сходство composition не объявляется визуальной приёмкой; source palette/type/Composer отличаются и требуют оценки.

## Следующий editor: raster Canvas не доказывает исполнение

[Sandbox handoff](REFERENCE-SANDBOX-HANDOFF.md) выявил отдельный риск оценки: Canvas1:1884 содержит один raster с уже нарисованными handles/размерами. Shell можно собрать из controls, но картинка не доказывает scene selection/inspector/history. Нужны реальные object IDs/геометрия и связанная отрисовка. На этапе handoff screen ещё не был реализован; последующая рабочая реконструкция описана ниже. Screenshot остаётся только QA evidence.

## Sandbox — связанная модель вместо raster Canvas

[Review](REFERENCE-SANDBOX-REVIEW.md) отделяет156 редактируемых объектов от исходного bitmap: renderer/Tree/property fields/history работают на одной модели, но source artwork не принят. Числа/pending drafts имеют composition guard; blur→canvas читает актуальный snapshot, закрытый import и смена страницы инвалидируют поздние действия. Численные тесты используют actual pointer coordinates и отдельно проверяют реальное SVG смещение. Source counter49 не подменён статическим значением.

Открытый visual defect Sandbox version19: fixed-size artboard captions пересекаются с предыдущим рядом на14% zoom; geometry scene/undo tests не оценивают читаемость подписей. Нужна отдельная проверка canvas overlay placement. Отдельный foundation gap — типографические роли интерфейса пока не имеют общего executable scale/binding; Lab text-scale влияет на controls, но не на произвольные h2 в editor preview.
