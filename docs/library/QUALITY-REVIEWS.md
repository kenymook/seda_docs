# Журнал визуальной оценки реализации

## 26 октября 2026 — контекстное форматирование Building

Первый снимок нового `InlineToolbar` при Dark/XL перекрывал заголовок документа. Причина: абсолютное размещение над блоком без зарезервированного места. Для блока с активным выделением добавлен отступ от предыдущего содержимого на основе общей высоты SEDA-контрола; браузерный сценарий теперь проверяет, что верх панели не пересекает низ заголовка. [Локальные снимки и результаты](REFERENCE-BUILDING-MARKS.md) охватывают Light/Dark, XL, scale 150%, X24/Y12. Это проверка одного нового состояния, а не визуальная приёмка всего Building.

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

## Typography — токены против документации и runtime

[Review](TYPOGRAPHY-REVIEW.md): исправлены устаревшие role mappings/семейство в foundation, подключён generated CSS, устранена window.nodeName DOM id collision. UI scale и controlSize независимы; inspector показывает реальный token и applied metrics, role choice участвует в истории. SSR fixture получил явный UTF-8; Ghost paint проверяется по фактическому hover/default state. Эти результаты не заменяют visual/contrast/AT приёмку.

## Caption paint bounds и быстрые structural shortcuts

Для Canvas overlays различены SVG typographic box и glyph ink: font-size не уменьшен, исходные frame coordinates не сдвинуты. Проверяется12 initial labels, grapheme truncation, actual paint overlap и document isolation. Отдельный CI defect Building исправлен в приложении: synchronous layout focus repair вместо RAF; тест намеренно удерживает RAF, а не добавляет sleep. Результаты не закрывают весь visual/AT gate.


## Spline — связанный inspector и intrinsic layout

Реальный3D renderer отделён от shared UI. При visual review обнаружены: длинный выбранный текст native base-select переносился в несколько строк и выходил за фиксированную высоту; Select accessible name захватывал options. Оба дефекта исправлены в библиотеке, installed React18/19 consumer проверяет точное имя/override, narrow host и настоящий keyboard picker.

Другой дефект принадлежал reference layout: фиксированный230px inspector не вмещал intrinsic Delete button при text150% и X24/Y12. Кнопка не уменьшена и не обрезана: host рассчитывает minimum inspector по derived font/padding, затем переводит внутренний SplitView в вертикальный режим при нехватке ширины. Материалы используют общий Tree вместо кнопок с чрезмерной intrinsic шириной. При обычном S100% сохранены source sidebar320 / viewport x336,y55,width858,height1217 / inspector230 на1440×1288; точный screenshot artwork отличается и визуальная приёмка остаётся открытой.

Список открытых механизмов и source отличий находится в REFERENCE-SPLINE-HANDOFF.md.10 UI groups /5 renderer groups /7 model groups имеют отдельный scope;24 profile samples не считаются независимыми пользовательскими сценариями.


## Spline — gesture transaction и настоящая WebGL recovery

Pointer drag связывает TransformControls/preview/inspector/authoritative document через отдельный transaction, один undo entry и guarded finish. Тест сравнивает сцену после undo с исходной без selection/gizmo overlays, а не сравнивает разные hover states. Найденный resize→pointerup race закрыт синхронной сверкой rect/viewport/DPR; Observer-only cancellation была недостаточной.

Appearance recovery отдельно от draw calls: потеря PMREM render target делала серебро чёрным после context restore. Теперь environment создаётся заново, pixel identity до/после восстановлена на проверенном browser/GPU fixture. Старое5/5 renderer evidence version22 имело более узкий scope и не переобозначается как проверка appearance. Pointer tests отдельно маркируют синтетические blur/cancel события и16 profile samples. Полная source/OS/AT/performance приёмка открыта.

После реального pointer gesture отдельно проверяются длинные дробные XYZ. Целое250 помещалось в grid, а147.79153846153852 обрезалось. Исправлена раскладка columns по текущим числам/derived metrics; UI font/padding и точность модели сохранены.16 pointer profile samples теперь включают measured input scrollWidth/clientWidth.


## Webflow — authored CSS и SEDA chrome

[Review](REFERENCE-WEBFLOW-REVIEW.md): один документ связывает navigator, native iframe, overlay и inspector. Specified values и computed CSS разделены; Inter загружен в обоих документах.16 вложенных samples проверяют параметры SEDA без изменения authored units. Структурная реконструкция не равна точной исходной иерархии; toolbar/inspector отличаются плотностью, визуальная/AT/performance приёмка открыта.


Webflow version24: визуальный просмотр XL/150% обнаружил вертикальное разбиение Navigator рядом с Collapse при зелёной geometry matrix. Добавлен regression по фактической высоте заголовка; получен FAIL на прежней раскладке и PASS после wrap команды. Source icons/font sizes и shared SEDA controls сохранены. Старые production screenshots/version24 evidence сохранены.


## Iframe Inter — computed metrics против glyph paint

При подготовке Framer discovered: parent-created FontFace, добавленный в iframe FontFaceSet, в проверенном Chromium показывал loaded и white Inter40/45, но не рисовал glyphs. Это затрагивает и authored preview Webflow25; ранние DOM/geometry tests не проверяли paint. Создание FontFace в собственном realm исправляет paint без расширения sandbox. Новые native Framer и application Webflow проверки сравнивают actual screenshots текста visible/hidden. Реальные Inter metrics изменили inferred H1 height90→135; source90 остаётся открытым отклонением, шрифт не уменьшен для маскировки.


## Framer — плотные панели и границы окружения

React editor на installed SEDA связывает три native canvas и inspector. Screenshot XL/150% выявил перенос title и потерю площади холста, затем overlap title с toolbar. Исправлена раскладка без уменьшения SEDA scale/X/Y;16 appearance samples проверяют title height, соседние bounds и canvas≥350px при window height1100. В последующем этапе Framer header получил адаптивное меню действий на SEDA DropdownMenu: Canvas, Insert text, Save и Publish остаются видимыми при XL/150%/X24/Y12, остальные команды доступны с клавиатуры. Внутренние frame/canvas toolbars пока прокручиваются в своих границах. Source H1 height90 vs actual inferred135 не подгоняется.

Добавление Framer в Lab header вызвало51px overflow на1024:8 workspace groups FAIL, исправление границ header вернуло21/21 PASS. Production environment имеет дополнительный iframe; первый count-all assertion получил4 вместо3, после уточнения ownership13 production checks PASS. Исходный report сохранён. Это исправление области теста, не удаление iframe или ослабление native geometry/paint требований.


## Workflow — source tools, run panel и strict schema

Рабочие typed connections и local run не равны provider integration. На XL/150% текстовые кнопки rail обрезались; заменены точными source SVG на Seda IconButton и caption roles, ширина rail следует control height. Run panel отделена от properties scroll; Run в карточке блокируется тем же empty-iterator guard, что Run selected. Вложенная матрица проверяет реальную вместимость rail и native wire endpoints.

После version28 additional negative import case воспроизвёл provider array coercion:15/1 FAIL при зелёных функциональных checks. Исправлен primitive type guard;16/16 model checks и15/15 browser checks включают corrupt storage array provider с сохранением исходных bytes. Это не универсальный security audit; полный source visual/AT/OS/performance review остаётся открытым.

## Чат и артефакт — визуальная проверка плотного режима

[Рабочий сценарий и ограничения](REFERENCE-ARTIFACT-REVIEW.md): при первом просмотре Light XL/150% длинная кнопка принятия выходила за узкую панель, хотя общий document overflow был равен нулю. Кнопке разрешён многострочный label в этой композиции, а SplitView выделяет артефакту минимум 400 px; при 1280 px скрывается навигация. Повторно просмотрены Light XL на 1440/1280 и Dark на 1440; исходный Chat 4 model/12 browser групп и новый артефакт 1 model/4 browser групп прошли локально. Наличие этих проверок не закрывает полную визуальную приёмку экрана и платформ.

## Lab 2.0 — служебные панели на SEDA UI

Левая конфигурация использует контрактные SEDA Select, Slider и Checkbox, а пояснение о профилях — SEDA Alert. Правый Explain Engine использует SEDA Button для узлов графа, Card для пяти разделов, Select для источника применённых значений и Alert для результата измерений. Граф зависимостей, метрики и provenance остаются композициями: у библиотеки нет отдельного компонента для их предметной модели. `data-seda-contract` проверяется на контролах; служебные панели сохраняют отдельную область параметров, а X/Y и масштаб применяются к рабочему приложению.

Визуальная проверка Light/Dark проведена на 1440 px; плотность карточек и длинный результат активного узла доработаны после просмотра снимков. Это проверка применения компонентов в Lab, не приёмка всех reference screens по Figma.

Следующий проход заменил оба нативных `details` инспектора на SEDA Accordion. Заголовок раскрытия сокращён до «Источники», чтобы он не переносился в узкой панели; полное название сохранено в доступной метке. SEDA Sidebar не применяется к конфигурации и Explain Engine: его контракт описывает навигацию, а эти панели содержат параметры и результаты. После изменения локально прошли TypeScript, сборка, 56/56 групп Lab (включая Light/Dark, размеры, loading, X и клавиатуру), 5/5 model и 18/18 browser Building. Просмотрены снимки двух тем при ширине 1440 px. Общий CI и production требуют отдельной проверки после публикации.

CI выявил устаревшее ожидание проверки поверхности: старый нативный `#theme` имел собственную непрозрачную заливку, SEDA Select рисует её на `.seda-field__control`, а внутренний `<select>` остаётся прозрачным. Проверка теперь измеряет оба слоя; локально прошли 16 route-theme случаев и 110 видимых полей в Dark.
