# Framer reference: модель и native preview

Статус: подготовлена и проверена предметная модель размеров и три изолированных native canvas. React chrome редактора ещё не собран; Framer не опубликован. Это не новый публичный компонент или executable contract SEDA.

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

60 assets скачаны и проверены по HTTP/type, SVG root или PNG signature и SHA256;49 уникальных хешей. В `verification/framer-source-asset-inventory.json` нет временных URL. Runtime icons пока не подключены; screenshot хранится только как QA reference.

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

## Следующий этап

Собрать React shell на installed SEDA Button/IconButton/Text/Select/TextField/TextArea/Toggle/Tabs/Tree/SplitView/DropdownMenu. Связать Pages/Layers/search, три artboards и active frame, native measurements, inspector sizing/content/style/visibility/accessibility, history/save/reload, zoom/pan и preview. Для Fit показывать computed размер, для cross-axis Fill не принимать неиспользуемый factor как будто он меняет layout.

Подключить source icons; сохранить pending drafts/selection/focus при переходах. Проверить темы/размеры/X/Y/text scale, loading, storage failures, самостоятельный scroll панелей и читаемость actual values/titles. Добавить UI/browser/visual evidence, затем обновить существующий PR и тот же owner-private Site. Agent, внешняя публикация, collaboration, vectors, Link/Cursor/Effects и неизвестная семантика Text Direction не должны изображаться работающими без реализации и доказательств.

Framer и workflow graph1:8421 остаются незавершёнными экранами; полная цель четырёх классов приложений, visual/AT/OS/performance и итоговая приёмка остаются открытыми.


## Найденный renderer defect

Parent-created FontFace давал Inter в computed style и корректный статус loaded, но в другом document текст не рисовался. Это обнаружено просмотром screenshot после зелёных geometry tests. Native FontFace теперь создаётся в window самого iframe без allow-scripts. Visible/hidden pixel comparison проверяет фактический paint. Исторические before/after и числа сохранены в `verification/iframe-fontface-paint-local.json`; прежний ложный geometry-only результат не переобозначается как визуальная приёмка.
