# Framer reference: React editor и native preview

Статус: собрана рабочая React-реконструкция редактора на installed SEDA с предметной моделью размеров и тремя native canvas. Domain10/native preview9/application12 проверены; опубликовано в owner-private version27. Это не новый публичный компонент или executable contract SEDA. Source visual fidelity остаётся открытой.

## Источник

Figma `31SUMzWpWJ52bT9fBeKIau`, frame `1:7743`, 1440×1288. После sparse root metadata прочитаны 19 полных subcontexts: `7754`, `7797`, `7818`, `7922`, `7930`, `7999`, `8016`, `8034`, `8115`, `8123`, `8131`, `8139`, `8179`, `8187`, `8290`, `8298`, `8319`, `8330`, `8352`.

Подтверждены:

- страницы Home, /teams, /pricing, /design-system; Pages/Layers/Assets и Agent/Style;
- выбранный текст: «One shared research assistant for teams who show their work.»;
- Position Relative, Width 1fr / Fill, Height 90 / Fit, opacity1, visible Yes, White, accessibility tag h1, стиль Heading1(L);
- Desktop1200; Tablet1199–810 (artboard810); Phone≤809 (artboard390);
- navigator x0/y51/w260/h1237; inspector x1180/y51/w260/h1237;
- начальные world gaps между artboards100px; Desktop global x114/y225; selected box global x724/y493/w570/h90.

В screenshot canvas почти пустой: исходные authored DOM/CSS не переданы. Модель не импортирует проект Framer и не выдумывает готовую страницу сайта. В ней реконструированы только /teams root, двухколоночный hero, пустой левый столбец, правый контейнер и подтверждённый H1. Остальные страницы пусты, потому что их содержимое неизвестно.

Родительская структура, root height1400, hero padding20/top268, font Inter40/45/600 — **inferred**, а не полученные значения исходного проекта или токены SEDA. Они позволяют проверить native Fill/Fit и воспроизвести x/y/width известного выделения. После исправления FontFace realm реальная высота текста составляет135px вместо source90; это незакрытое отклонение, не фиксированная высота для подгонки. В новом preview виден настоящий H1; исходный screenshot не содержал его paint. Точная визуальная идентичность не заявляется.

60 assets скачаны и проверены по HTTP/type, SVG root или PNG signature и SHA256;49 уникальных хешей. В `verification/framer-source-asset-inventory.json` нет временных URL. Пять SVG header assets подключены точными байтами; остальные runtime icons пока не подключены. Screenshot хранится только как QA reference.

## Техническая основа

Используются общий authored-document model и `AuthorPreview`, ранее проверенные в Webflow. Это общий reference helper, отдельный от установленной библиотеки SEDA UI. В публичных props/tokens/контрактах SEDA изменений нет.

Общий CSS domain расширен только необходимыми native свойствами: flexGrow/flexShrink/flexBasis/alignSelf и fit-content для размеров. Они валидируются как конечные значения; произвольные CSS/HTML/scripts не исполняются. Существующие version1 документы остаются совместимыми: новые declarations необязательны.

Preview принимает явный breakpoint resolver: Framer использует1200/810, Webflow сохраняет992/768/480. Оба используют один scriptless iframe renderer, безопасный textContent, локальные Inter fonts, измерения DOM, выбор и lifecycle/dispose.

Fill задаёт реальные flex weights и basis0 в главной оси, stretch в поперечной; Fixed снимает соответствующий grow; Fit использует intrinsic width/height. Переход в cross-axis Fit снимает унаследованный stretch, сохраняя Fill другой оси. Vertical Fill без определённой высоты родителя отклоняется до изменения документа; пользователь должен сначала задать родителю высоту. Это ограничение текущей модели, не полная эмуляция всех Framer sizing semantics, min/max/grid и CSS containing blocks.

## Проверки

`npm run verify:framer:domain`:

- 10 domain groups: источник/roundtrip, thresholds, CSS validation, Fixed/Fit/Fill, cross-axis ownership, parent budget, responsive overrides, out-of-flow percentages, numeric drafts;
- 9 isolated browser groups: три iframe и 570px width / inferred135px height (source90 remains unmatched), веса1:2 →380/760px, Fixed left200 →right940px, изменение Fit после текста, parent400 с padding268 →stretch132 против Fit135, height Fill300 независимо от width Fixed120, breakpoint1199, независимость страниц, selection/UI scale/dispose.

Результаты: `verification/framer-domain-local.json`, `framer-preview-local.json`, `framer-native-three-frames-local.png`. Это не UI workflows и не доказательство приёмки экрана. После изменений общего helper отдельно повторены Webflow model12, isolated preview8, application13, references TypeScript и build.

## План исходного этапа (выполнен частично; текущий статус ниже)

Собрать React shell на installed SEDA Button/IconButton/Text/Select/TextField/TextArea/Toggle/Tabs/Tree/SplitView/DropdownMenu. Связать Pages/Layers/search, три artboards и active frame, native measurements, inspector sizing/content/style/visibility/accessibility, history/save/reload, zoom/pan и preview. Для Fit показывать computed размер, для cross-axis Fill не принимать неиспользуемый factor как будто он меняет layout.

Подключить source icons; сохранить pending drafts/selection/focus при переходах. Проверить темы/размеры/X/Y/text scale, loading, storage failures, самостоятельный scroll панелей и читаемость actual values/titles. Добавить UI/browser/visual evidence, затем обновить существующий PR и тот же owner-private Site. Agent, внешняя публикация, collaboration, vectors, Link/Cursor/Effects и неизвестная семантика Text Direction не должны изображаться работающими без реализации и доказательств.

Визуальная приёмка Framer и workflow graph1:8421 остаются незавершёнными; полная цель четырёх классов приложений, visual/AT/OS/performance и итоговая приёмка остаются открытыми.


## Найденный renderer defect

Parent-created FontFace давал Inter в computed style и корректный статус loaded, но в другом document текст не рисовался. Это обнаружено просмотром screenshot после зелёных geometry tests. Native FontFace теперь создаётся в window самого iframe без allow-scripts. Visible/hidden pixel comparison проверяет фактический paint. Исторические before/after и числа сохранены в `verification/iframe-fontface-paint-local.json`; прежний ложный geometry-only результат не переобозначается как визуальная приёмка.


## Publication26: реальный paint текста

Исправление FontFace realm опубликовано на прежнем owner-private Site. Production Webflow: 13 application groups +1 integrity check, 696 совпавших source hashes; actual Inter glyph paint подтверждён visible/hidden screenshot comparison и просмотром screenshot. 16 nested appearance samples, JS errors0, Save loading delta0px. Exact b69940d CI run40085925017/job120848724045 completed/success: 120 contracts/foundation,25 installed-package,187 application groups,22 isolated renderer/preview,59 model groups;3 TypeScript/build. На этапе version26 Framer application chrome отсутствовал; последующий этап version27 описан ниже. Source H1 height90 и inferred actual135 остаются несоответствием. Evidence: `verification/iframe-v26-release.json`, `iframe-v26-ci.json`, `iframe-live-v26-results.json`; исторические version25 отчёты сохранены.


## Рабочий React editor после version26

`references/framer.tsx` использует installed SEDA Button/IconButton/Text/TextField/TextArea/Select/Toggle/Tabs/Tree/SplitView. С одним документом связаны Pages/search, Layers/tree, три native artboards, active responsive layer, inspector Position/Size/Layout/Styles/Text/Accessibility и provenance. Секции сворачиваются; Fill/Fit/Fixed применяют native CSS, не статический cached размер. Cross-axis Fill показывает read-only computed размер без фиктивного fr factor. Высота Fill без определённого parent budget отклоняется с видимой ошибкой.

Undo/redo, pending draft guards, safe text/tag/visibility, local snapshot/reload, duplicate save и stale-response/dispose guards используют существующие AuthorHistory/AuthorSave. Новый несохранённый документ помечается modified. Hand/pan, zoom, active-frame jump, read-only preview и keyboard SplitView меняют view без изменения authored CSS. Скачивание JSON не обозначается серверной публикацией. Agent/assets/vector/layout tools без реализации обозначены явно; source SVG bytes подключены только для пяти header assets.

Application suite:12 browser groups, внутри одной16 appearance samples (Light/Dark × S/M/L/XL ×1024/1440, scale150/X24/Y12). Проверяются glyph paint, native geometry, responsive cascade/reset, invalid drafts, parent Fill rejection, text safety/visibility/tag/pages, snapshot/edit-during-save/loading/reload, quota retry/corrupt bytes, pan/zoom/preview, keyboard resize/search и отсутствие JS errors. Общая визуальная/AT/OS приёмка этими проверками не закрывается. При screenshot review найдены и исправлены перенос title, перекрытие toolbar items и потеря площади canvas при больших профилях; matrix теперь проверяет single-line title, отсутствие overlap и canvas≥350px при window height1100. Toolbar при больших профилях прокручивается горизонтально, навигация/inspector независимо прокручиваются. Полноценный overflow menu, сохранение view preferences и screenreader audit ещё нужны.

Реальная H1 height135 против source90 остаётся открытой; inferred DOM и typography не выдаются за исходный проект Framer. Source 1440×1288 сохранён отдельно от текущих screenshots.


## Production version27

Опубликована на прежнем owner-private Site.704 canonical source hashes совпали;12 application groups +1 integrity check прошли,16 nested appearance samples, glyph paint подтверждён actual screenshots. JS errors0, Save loading delta0px. Production добавляет собственный hosting iframe, поэтому verifier считает три iframe приложения по owner-контейнеру; исходный4-vs3 FAIL сохранён отдельно. Exact functional source11479bc; Site sourceabd8c66. Полный publication checkout:199 application/22 isolated/59 model,3 TypeScript/build PASS. CI40087768737/job120854084808 ещё выполнялся при публикации. Evidence: `verification/framer-v27-release.json` и `framer-live-v27-results.json`.


CI exact Framer27 source11479bc завершился completed/success: run40087768737/job120854084808.120 contracts/foundation,25 package,199 application/22 isolated/59 model;3 TypeScript/build. Evidence `verification/framer-v27-ci.json`. Последующий workflow editor этим результатом не покрывается.
