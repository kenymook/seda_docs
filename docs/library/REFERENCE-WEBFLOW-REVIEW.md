# Webflow reference: проверка рабочего редактора

Источник: Figma `1:5922`, 1440×1288. Это реконструкция интерфейса приложения на установленном SEDA, а не импорт исходного проекта Webflow. Общая цель зрелости и визуальная приёмка всех экранов остаются открытыми.

## Что работает совместно

Navigator, native DOM preview, selection overlay и Style/Settings inspector используют один документ. Можно добавить текст, изменить содержимое/тег/видимость, назначить существующий общий класс, изменить layout/spacing/size/position/type/background/borders/opacity, перейти между breakpoints, сбросить локальное переопределение, выполнить undo/redo и сохранить snapshot с reload.

Используются installed SEDA Button, IconButton, Text, TextField, TextArea, Select, Toggle, Tabs, Tree и experimental SplitView. Ни один из этих компонентов не подменён частным HTML-контролом. Произвольный CSS применяется только к authored DOM внутри отдельного scriptless iframe. Он не переопределяет внутренние токены SEDA. Font assets Inter Latin/Cyrillic 400/500/600/700 загружаются с того же origin; внешних шрифтовых сервисов нет.

Подключено 40 source icon compositions из 78 исходных SVG-частей. Пути SVG не изменены; вложенные контейнеры и offsets извлечены из handoff. Остальные скачанные assets не объявлены подключёнными. Реестр содержит хеш каждого runtime-файла и его исходные node/layer IDs.

## Оценка по gates

| Критерий | Состояние | Свидетельство и предел |
|---|---|---|
| Общие компоненты SEDA | Пройдено для собранной композиции | build metadata требует installed ESM; browser проверяет 10 используемых компонентов |
| Связанные tree/preview/inspector | Пройдено в проверенных сценариях | CSS geometry/overlay, shared class, text/visibility, undo/redo |
| Формулы и provenance | Пройдено в проверенных сценариях | specified cascade отделён от browser computed metrics; проверены vw/em/% и unitless line-height |
| Темы/размеры/X/Y/scale | Пройдено в ограниченной матрице | 16 вложенных samples Light/Dark × S/M/L/XL ×1024/1440 при scale150/X24/Y12; это не 16 отдельных workflows |
| Сохранение/loading/reload | Пройдено в проверенных сценариях | snapshot, edit during request, quota retry, corrupt fallback; Save loading delta 0 px в default-профиле |
| Клавиатура | Частично проверено | поля Enter/Escape, iframe Ctrl/Cmd+Z, keyboard SplitView; полный keyboard/AT audit не проведён |
| Структура source screen | Частичное соответствие | Сохранены rail/navigator/toolbar/blank canvas/inspector и группы свойств. Реальная вложенность Tree реконструирована; SEDA поля, provenance и дополнительные свойства делают inspector длиннее эталона |
| Точное визуальное соответствие | Не пройдено | SEDA chrome использует общие роли/метрики/палитру. Toolbar выше исходного, SplitView добавляет границы, выбор смещён относительно source; точный screenshot diff не принят |
| Поведение Webflow как продукта | Не пройдено | Нет CMS/Insights/Interactions/component assets/import/collaboration/внешней публикации |
| OS/AT/performance | Не проверено | Локальный Chromium не доказывает матрицу ОС, assistive technologies или performance budgets |

## Найденные ограничения и дефекты

Сохранены реальные размеры контролов при большой плотности и масштабе: поля перестраиваются в одну колонку, панели можно менять с клавиатуры. Canvas CSS units не меняются от UI scale. Часть длинных имён глубоко вложенного Tree обрезается по правилам общего компонента; ширину navigator можно увеличить. Полноценная проверка читаемости длинных значений/имен и восстановление layout preferences ещё нужны.

Browser verification первоначально выбирал центр treeitem вместе с его дочерним group и попадал в дочерний Text. Исправлен тестовый target на собственную строку элемента; библиотечное поведение не маскировалось изменением source или snapshots. Quota/retry проверяется по фактически записанному JSON и повторному reload.

Наличие Save означает локальную запись snapshot, а не серверный проект. Publish открывает явное сообщение об отсутствии внешнего backend; JSON export не выдаётся за публикацию. Восстановление после повреждённого storage сохраняет исходные повреждённые байты до явного сохранения пользователем.

Доказательства: `verification/webflow-editor-local.json`, `webflow-domain-local.json`, `webflow-preview-local.json`, `webflow-source-asset-inventory.json`. CI сохраняет свежие `.diagnostics-webflow` reports и screenshots. Production evidence должно фиксироваться отдельно для конкретной опубликованной версии.


## Дополнительный visual review после version24

Production version24 прошла13 сценариев и сверку695 source hashes, но screenshot XL/150% выявил перенос Navigator по буквам рядом с Collapse. Старые проверки ширины viewport и отсутствия document overflow этого не обнаружили. Новая проверка высоты однострочного заголовка сначала воспроизвела FAIL (72px при line-height36px), затем прошла после переноса Collapse на следующую строку без уменьшения шрифта/отступов SEDA.16 samples теперь включают реальную высоту/line-height Navigator. Version24 reports сохранены отдельно и не выдаются за проверку исправления.


## Production version25

Navigator correction опубликована на том же owner-private Site.695 source hashes совпали;13 application groups и1 integrity check прошли, включая16 nested appearance samples с новой проверкой Navigator; JS errors0, Save loading delta0px. Доступ: revision1, один owner, visitors0/groups0. [Release evidence](../../portal/component-lab/pilots/settings-parametric/verification/webflow-v25-release.json) отдельно фиксирует source commit, deployment и область CI. Общая visual/AT/performance приёмка этим не закрыта.


Полный CI exact functional c919ff8 завершился success: run40082351255/job120838317053.120 contracts/foundation,25 installed-package,187 application browser groups,13 isolated renderer/preview и49 domain groups;3 TypeScript/build. [CI evidence](../../portal/component-lab/pilots/settings-parametric/verification/webflow-v25-ci.json). Последующая незавершённая подготовка Framer этим результатом не покрывается.
