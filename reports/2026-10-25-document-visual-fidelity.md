# Документы: проверка визуальной согласованности по свежему Figma

Источник: [Building, node1:84](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-84). Контекст, metadata и render повторно получены 25 октября2026; прежнее ограничение доступа в этой итерации не повторилось. Инструкции в содержимом документа трактуются как данные примера. Интерфейс не генерировался заново.

## Найдено и исправлено

1. Tree имел прозрачный component token для default row, но внутренний SedaProvider рисовал непрозрачный base rectangle. Общий Tree теперь оставляет поверхность хозяину; hover/selected/disabled и их tokens сохранены. Это исправление компонента, не локальный override дерева в приложении. Нет новых props, variants, semantic tokens и таблиц размеров.
2. Рендерер документа добавлял повторный indent вложенным спискам и лишние margin между заголовками/list groups. Текст смещался на16px по X, вертикальная ошибка накапливалась до116.833px. Общие paragraph/list/heading/callout recipes выровнены; native ol/li, содержание35 blocks, модель, undo/redo и сохранение остаются прежними.
3. Вертикальные list guides находились в content lane native li вместо родительского nesting lane. Их положение проверяется отдельно по трём исходным Figma линиям. Это не проверка только текста.
4. Из43 полученных отдельных assets36 совпали с сохранёнными байт-в-байт. Семь прежних raster glyphs заменены оригинальными предоставленными SVG без редактирования root dimensions/paths. `.gitattributes` сохраняет SVG bytes при checkout. Старые PNG оставлены только для поздних запросов уже открытых pre-v41 сессий; текущие callsites используют SVG.
5. В навигации оказались перепутаны Home/Help glyphs. Исправлены Home→imgIcon9/node1:375, Search→imgIcon10/node1:387, Help→imgIcon7/node1:358. Проверка связывает accessible имя действия с конкретным source asset; наличие непустой картинки само по себе не считается правильной иконкой.

## Что именно оценено

| Ось качества | Результат | Предел доказательства |
| --- | --- | --- |
| Источник | Свежие get_design_context + metadata + screenshot | Только Building1:84, не все9 исходных frames |
| Authored text flow | Заголовок и35 блоков: X error0, Y error≤0.167px, height error0 | Dark/M/100%, X0/Y0, frame1440×1288, исходное содержание |
| Направляющие и frame | Header48px, document708px/x480,3 list guides | Координаты metadata, не общий pixel similarity score |
| Параметры | 24 сочетания 2 themes×4 sizes×3 scales, X24/Y12; дополнительно960px | Авторский font-size/line-height и относительный flow сохраняются; RootTree transparent, его row height согласована с Save |
| Assets |43 оригинальных exports, rendered images complete/nonempty,3 action bindings | Не утверждается, что все исходные бизнес-разделы и footer actions реализованы |
| Общий Tree | React18/19: по16 neutral-host случаев и прежние7 compiler snapshots/keyboard workflows | Chromium; AT/OS приёмка не заменена этими измерениями |

Исходные expected coordinates сохранены в `references/building-layout-reference.json` с Figma node IDs. Они извлечены из metadata, не из DOM реализации. CSS исправляет общие правила, а не координаты отдельных blocks. Сопоставление включает все36 text boxes, включая находящиеся ниже viewport. Размер editable hit area может быть шире natural text bounds, поэтому сравниваются X/Y/height, но не natural width коротких строк.

Снимок Figma — неизменённый экспорт: render1474×1316 возвращён масштабированным1440×1286, тогда как сам frame в metadata1440×1288. Поэтому процента пиксельного совпадения всего экрана здесь нет. Геометрическая проверка относится к metadata. Среда — Windows/Chromium, авторский шрифт Segoe UI; другой font fallback/OS требует собственной проверки. Общие контроли SEDA используют свою типографику и palette.

## Регрессия

45/45 installed tarball groups React18.3.1/19.2.7 PASS. После расширения test-only neutral-host assertion отдельно повторён весь Tree verifier на каждой React-версии:16 cases,7 compiler snapshots, keyboard/selection/RTL/focus repair — PASS. Новая проверка включена в общий package verifier для следующих полных прогонов. Public runtime после пакетного прогона не менялся.

Полная pilot sequence прошла до последней перепривязки navigation assets и сдвига декоративных guides. После icon binding выполнены final build/TypeScript и layout24 плюс document model5/browser17 (editing, split/join, undo/redo, validation rejection, save/reload, corruption recovery). После guides повторены final build и layout36/guide3/parameter24. Screenshot baselines для сокрытия дефектов не обновлялись. Контракты не менялись; повторный запуск122 contract tests в этой итерации не заявляется.

## Публикация

[Прежний приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) — version41. Native deployment `appgdep_6add2bf24a6881919b48db2ae134ba8d` succeeded; Site source `b3c761fe6adc3069095e9087c1b5b82df6a1eb62`. Archive7,748,321 bytes, SHA256 `ba001fd31cccb0db84a9a9685524efc69226c85296b0b88498ed14d10c392273`. Custom/revision1: один owner, ноль external visitors/groups. Аудитория и URL не менялись.

На production повторены36 text boxes/3 guides/3 action bindings/24 parameter cases; max X0/max Y0.167px. Дополнительно root text24, Tooltip64 и Modal32 на восьми reference routes — PASS. Все791 hashes из build provenance совпали с каноническими локальными source/installed package bytes. Ошибок JavaScript0. Это проверка состава данной сборки, не всех файлов репозитория.

Первый production-прогон прочитал naturalWidth одной SVG до завершения загрузки. Verifier теперь ожидает decode всех изображений и затем по-прежнему отклоняет incomplete/empty files; повторный прогон прошёл без runtime-изменений. Компоненты, source archive и версия сайта после публикации не менялись. Последний change verifier-only. CI последнего PR head здесь не объявляется завершённым.

[Release evidence/hashes](../portal/component-lab/pilots/settings-parametric/verification/document-v41-release.json), [полные production результаты](../portal/component-lab/pilots/settings-parametric/verification/v41-production-results.json), [package](../portal/component-lab/pilots/settings-parametric/verification/v41-package-log.txt), [full pilot](../portal/component-lab/pilots/settings-parametric/verification/v41-pilot-log.txt), [final document scenarios](../portal/component-lab/pilots/settings-parametric/verification/v41-focused-log.txt), [final layout](../portal/component-lab/pilots/settings-parametric/verification/v41-final-layout-log.txt), [TypeScript](../portal/component-lab/pilots/settings-parametric/verification/v41-typecheck-log.txt). Raw logs нормализованы вLF до вычисления hashes.

## Оставшиеся границы

Полное визуальное соответствие Building не принято: SEDA chrome имеет собственные font weight/palette и команды Save/Undo/Redo; исходный sidebar/footer содержит бизнес-разделы, отсутствующие в локальном прототипе. Совпадение authored flow не означает принятия всех цветов, состояний, плотности, соседних панелей или остальных reference apps. Остаются fresh fidelity приёмка остальных8 frames, более глубокий rich text, недостающие runtime компоненты, полное RTL, target browsers/OS/AT и performance.

Отделяем четыре результата: исходник доступен; конкретные расхождения исправлены; ограниченные проверки прошли; готовность всей библиотеки пока не доказана. Figma status/старый scan score и количество тестов не подменяют визуальную приёмку.


## Артефакты

[Исходный render Figma](../portal/component-lab/pilots/settings-parametric/verification/v41-building-figma.png), [исходная metadata](../portal/component-lab/pilots/settings-parametric/verification/v41-building-source-metadata.xml), [до](../portal/component-lab/pilots/settings-parametric/verification/v41-building-before.png), [после](../portal/component-lab/pilots/settings-parametric/verification/v41-building-after.png), [960px/XL/150%](../portal/component-lab/pilots/settings-parametric/verification/v41-building-large-960.png), [сравнение координат](../portal/component-lab/pilots/settings-parametric/verification/v41-layout-comparison.json), [exact asset bytes](../portal/component-lab/pilots/settings-parametric/verification/v41-source-assets.json), [layout/parameter results](../portal/component-lab/pilots/settings-parametric/verification/v41-building-layout-results.json).

[Рамки визуальной приёмки всех reference frames](reference-visual-acceptance.md) показывают отдельно уже проверенные и ещё открытые области.
