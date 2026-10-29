# SEDA AI — этапы развития и версии

Дата: 29 октября 2026. Владелец: Kenymook. Статус: рабочий план; milestone не считается выполненным после написания этого документа.

Цель: зрелая дизайн-система для веб- и desktop-приложений, на которой можно собрать интерфейсы класса Figma, Notion, ChatGPT и Cloude Design (Claude Design в текущей матрице). Требуется также подготовить и принять все девять экранов из файла Ruslan. Полная граница цели определена в [MATURITY](MATURITY.md) и [REFERENCE-SCREENS](REFERENCE-SCREENS.md); этот план её не сокращает.

Названия продуктов обозначают классы сложности, а не обязательство воспроизвести каждый backend этих продуктов. Работающие selection, document model, rendering, history и сохранение нужны там, где обещаны reference-приложением. Статическая картинка, таймер вместо настоящего перехода состояния или скрытый fixture не являются доказательством реализации.

## Версии и текущая точка

- `@seda-ai/ui@0.1.0` — текущий private/experimental пакет, а не сертификат зрелости.
- Номер публикации портала, например `132`, — отдельный счётчик Sites. Он не означает SEDA `1.32` или готовность очередного milestone.
- Версии ниже — целевые версии системы. Они не создаются автоматически, не меняют `package.json` заранее и не требуют публикации в npm. Каждый этап можно завершить в прежнем приватном портале.
- Сохранение настроек владельца не зависит от выпуска новой версии пакета. Palette/semantic/component edits должны сохраняться и восстанавливаться в обычном рабочем процессе.

Срез исходников до планирования: commit `ed7a531f404ce54deca1bfae607242576de79411`. Точный inventory — [roadmap-baseline.json](roadmap-baseline.json).

| Что проверено в исходниках | Что это доказывает | Чего это не доказывает |
| --- | --- | --- |
| 36 component export modules в `packages/seda-ui/src/index.ts` | Есть публичные точки входа, включая Text/Icon и новые композиции | Не 36 принятых контрактов или полное покрытие всех specs |
| 13 JSON instance contracts и registry | Есть исполняемое ядро compiler | Остальные компоненты не получают контракт автоматически |
| 52 component token branches в `tokens.json` | Существует модель цветовых частей/состояний | Не наличие 52 React-реализаций или живых previews |
| 58 Markdown-документов под `specs/`, без шаблона | Есть компонентная и композиционная документация | Это другой знаменатель; исторические 52 `ready specs` не являются текущей runtime-приёмкой |
| Studio, Lab, shared store и reference routes существуют | Есть рабочая база, которую следует развивать | Не завершённая visual/OS/AT/performance приёмка |

Прошлые результаты проверок сохраняются с их commit и областью. Числа из [Component Maturity Matrix](../../reports/component-maturity-matrix.md) и старых отчётов не переносятся как PASS на новый код без релевантной проверки.

## Последовательность

| Этап / версия | Результат для пользователя | Главный артефакт | Условие выхода |
| --- | --- | --- | --- |
| 1 — `0.2` | Владелец понимает, что поддерживается, и надёжно настраивает SEDA | Согласованный каталог + owner workflow Palette → Semantic → Component | Сценарий настройки проходит без автора; доказаны scope изменения, сохранение, reload и восстановление |
| 2 — `0.3` | Общие компоненты выглядят и ведут себя согласованно на плотном экране | Принятое ядро и эталон Files | Все заявленные variants/states ядра согласованы; visual и functional приёмка Files завершены |
| 3 — `0.4` | Рабочие интерфейсы собираются по повторяемым правилам | Recipes для shell, inspector, form, data browser, overlays | Каждый общий recipe работает в двух разных приложениях без частных внутренних overrides |
| 4 — `0.5` | Можно собрать документное и диалоговое приложение | Building, Chat и editable artifact workspace | Полные задачи редактирования/диалога/версий переживают resize, ошибки и reload |
| 5 — `0.6` | Можно собрать сложные визуальные редакторы | Sandbox, оба Spline-контекста, Webflow, Framer, Workflow | Tree/canvas/inspector/history согласованы; оставшиеся reference-экраны визуально и функционально приняты |
| 6 — `0.7` | Система выдерживает реальные платформы и объёмы | Browser/desktop/AT/performance matrix | Подтверждены заявленные платформы, клавиатура/IME/AT и измеренные пределы нагрузки |
| 7 — `0.8` | Другой разработчик и AI могут пользоваться системой без догадок | Quickstart, API/token mapping, executable examples и composition guidance | Два чистых внешних consumer-проекта проходят основной сценарий без source aliases и помощи автора |
| 8 — `0.9` | Есть проверяемый кандидат зрелой системы | Release candidate и сводный acceptance dossier | Все предыдущие gates доказаны на одном candidate; нет blocker/major defects и потерянных настроек |
| 9 — `1.0` | Выполнен исходный критерий зрелости | Принятые четыре класса приложений + девять эталонных экранов | Независимая приёмка, воспроизводимая поставка, migration/recovery и вся обязательная матрица закрыты |

Порядок задаёт зависимости. Ранние проверки платформ, accessibility и производительности выполняются в каждом этапе; `0.7` замыкает общую матрицу, а не начинает её с нуля. Календарь и расход токенов здесь не обещаются: сроки можно оценивать после измерения первого законченного цикла `0.2`.

## Ближайшая версия — `0.2`

**Первый пользователь:** владелец SEDA, который настраивает систему для своих рабочих приложений. **Обещание:** понятно, что можно менять, какой результат получится, где изменение сохранено и как его отменить. **Основной сценарий:** найти компонент → часть → состояние → назначить semantic role → увидеть изменение в реальном компоненте → открыть ту же конфигурацию после reload и в другом consumer.

**Proof:** владелец самостоятельно выполняет не только пример с border Select, но три разные задачи: изменить общий цвет палитры, переназначить semantic role, поменять одну component binding. Наблюдение и затруднения фиксируются; автоматический тест этого не заменяет. Пока такого наблюдения нет, статус proof — «не проверено».

| ID / приоритет | Работа | Проверяемый результат |
| --- | --- | --- |
| `COV-01` / P0 | Свести существующий build-time `componentCoverage`, specs, API, token branches, previews и executable contracts | У каждой записи разные поля `runtime`, `contract`, `preview`, `visualReview`, `platformReview`; алиасы и композиции учтены явно. Числа имеют подписи и не выдают token count за component count |
| `COV-02` / P0 | Проверить статусы в старом Component Lab и текущем Studio | HTML-demo, placeholder и реальный installed SEDA runtime различимы. Нет общего `ready` по факту существования Markdown. Отсутствующий preview обозначен до выбора, а не обнаруживается как неожиданность |
| `OWN-01` / P0 | Пройти Palette → Semantic → Component на разных компонентах | Понятен scope: общий цвет/роль либо binding одного компонента. В списке назначения — semantic roles; selected role видна при открытии. Нет автоматического popover от выбора группы |
| `OWN-02` / P0 | Подтвердить shared persistence, undo и recovery на текущем source | Reload, новый consumer, параллельная правка, offline/retry, поздний ответ, stale revision и source migration проверены. При ошибке прежние данные доступны; старый черновик не теряется |
| `VIS-00` / P0 | Зафиксировать одну visual baseline Files и перечень дефектов общего ядра | Исходный frame/версия, actual screenshot, тема/размер/DPR, anatomy и severity записаны. Это вход в `0.3`, а не визуальный PASS |
| `PROOF-01` / P1 | Провести три owner-задачи выше на реальных controls | Есть наблюдаемый результат без подсказок автора; ошибки UX закрыты до выхода `0.2` |

Один активный implementation slice за раз: `COV-01` → `COV-02` → `OWN-01/02` → `VIS-00` → `PROOF-01`. Исправления, которые ломают сохранение или уже обещанное поведение, имеют приоритет перед следующим slice.

`COV-01`: реализован [генерируемый каталог покрытия](COMPONENT-CATALOG.md): source metadata, реальные value exports, ownership, отдельные contract/preview/review поля и download из `/owner`. Модель прошла 13 проверок; browser QA проверил каталог и семь реальных adapters в Light/Dark, девять Select fixtures и 50 выборов частей. `COV-02` и остальные gates `0.2` остаются открыты: присутствие каталога не является общей приёмкой системы.

В `0.2` не добавляются авторизация/роли для новых команд, marketplace, обязательный npm release, новый сайт, новый AI backend или переделка всей архитектуры. Уже работающая общая база сохраняется. Эти исключения относятся только к ближайшей версии и не отменяют полную цель.

## `0.3` — согласованное ядро

Опорная композиция — плотное файловое пространство: navigation, search/filter, Table/Card, выбор, toolbar, dialog, notifications и inspector. Компоненты исправляются в `packages/seda-ui`, bindings — в `packages/seda-contracts`, правила композиции — в recipes. Локальная заплатка внутри каждого приложения не закрывает дефект ядра.

Обязательное ядро: Button/IconButton/Link; TextField/NumberField/TextArea/Select; Checkbox/Radio/Toggle/Slider; Text/Icon; Tabs/Tree/Breadcrumbs/Sidebar/TopBar/DropdownMenu; Table/Card/Avatar; Modal/Popover/Tooltip; feedback и FileUpload, которые реально нужны опорной задаче. Для каждого — API, anatomy, все заявленные состояния, component-token bindings и живые examples. Остальные ветки inventory не исчезают: относятся к coverage backlog `0.4–0.6` и не маркируются stable.

Проверяются baseline и крайние допустимые значения: S/M/L/XL, Light/Dark, text scale, X/Y, radius, длинные labels, leading/trailing icons, focus/hover/pressed/disabled/loading/validation там, где они поддержаны. Иконки масштабируются согласованно с текстом, label и spinner центрированы; Button при loading сохраняет размеры с допуском 1px. Внешние интервалы не масштабируются автоматически вместе с текстом — сохраняется принятое правило композиции.

Выход: Files проходит [visual rubric](#как-оценивать-качество) и полную пользовательскую задачу. Правила перенесены минимум на Settings и другой inspector. Количество пройденных DOM-замеров не заменяет эту приёмку.

## `0.4` — правила сборки и стандартные пробелы

Развить [COMPOSITION-RULES](COMPOSITION-RULES.md) в исполняемые recipes: workspace shell с независимым scroll и minima панелей; inspector с selection/mixed/reset/provenance; form с field errors и async submit; data browser с одним набором фильтрации/сортировки/selection/pagination; согласованная overlay/focus stack.

Закрыть стандартные пробелы inventory, нужные этим recipes: pagination, empty/loading/error surfaces, command/search, date/time/color fields и структурные display-компоненты. Для каждого исходного spec/token branch есть disposition: самостоятельный runtime, документированная композиция/alias либо явный gap с задачей. Функция, нужная обязательному экрану, не может быть спрятана под disposition «не поддерживаем».

Проверка: один recipe используется в двух различных сценариях, например Projects/Team или Webflow/Spline, без fork внутренних компонентов. Есть переносы, scroll, nested menus/dialogs, keyboard alternatives и сохранность draft/selection при перестройке. Поддержка новых recipe не должна требовать переносить предметные данные в UI-пакет.

## `0.5` — документы, диалог и артефакты

- **Building / Notion-class:** дерево документов, блоки, slash commands, inline toolbar, ссылки/списки/таблица, перемещение с клавиатурной альтернативой, диапазоны между блоками, undo/redo и reload. Текущие одноблочные marks — стартовая точка, не готовый rich editor.
- **ChatGPT-class:** threads, composer, вложения, длинная история/scroll anchoring, streaming/stop/retry, редактирование/ветвление, tool/error states и восстановление draft. Transport adapter отделён от UI. Детерминированный fixture нужен для тестов, но показывается как fixture; интеграционное доказательство доставки/отмены/позднего ответа не подменяется таймером. Платный провайдер и реальное содержимое пользователя не подключаются молча.
- **Cloude Design-class:** диалог рядом с редактируемым артефактом, preview, версии, diff/предложение изменения, явное принятие/отклонение, сохранение/rollback и resize панелей. Изменения должны менять модель и видимый результат, а не только номер версии.

Выход: реальные end-to-end задачи трёх типов, visual acceptance Building/Chat, сохранение и восстановление после отказа. Незавершённые collaboration/backend возможности обозначены по границе приложения, а не приписаны библиотеке.

## `0.6` — визуальные инструменты

Sandbox, оба Spline-контекста, Webflow, Framer и Workflow должны пользоваться общими Tree, fields, toolbar, panels, menus и feedback. Domain engines и rendering остаются у приложений; shared selection/history adapters, inspector и layout recipes могут быть SEDA-композициями.

Обязательны согласованный tree/canvas/inspector selection; multi-select и mixed values; изменения geometry/layout/type/material с реальным preview; zoom/pan; keyboard alternatives; undo/redo; сохранение/reload; ошибки и отмена операций. В Workflow — реальные изменения DAG, validation и run/cancel/error/retry model; внешние исполнения отделены от локального fixture.

Выход: все шесть представлений/контекстов имеют собственное functional и visual доказательство. Смена двух контекстов Spline не создаёт разные расходящиеся документы. Наличие WebGL/Canvas/CSS renderer или исходного raster само по себе не доказывает качество и интерактивность.

## `0.7–0.8` — масштаб, платформы и самостоятельная сборка

Для `0.7` фиксируется support matrix, а не безграничное «desktop»: Chromium/Firefox/WebKit в вебе, целевые Windows/macOS desktop shells с web UI, OS scaling/zoom, keyboard shortcuts и IME, screen reader проходы (NVDA/Windows и VoiceOver/macOS), forced colors/reduced motion/RTL. Linux web проверяется отдельно; если Linux desktop заявлен, он получает отдельный gate. Непроверенную платформу нельзя включить в список поддержанных. Native toolkit вне web shell требует отдельного адаптера и не считается уже реализованным.

Performance fixtures покрывают длинные files/tables/trees, документ, историю сообщений и canvas scene. В начале `0.2` фиксируются устройство, workload и измеряемые метрики; в `0.7` — подтверждённые пределы, p95 interaction latency, frame responsiveness, memory и регрессии. Нагрузки/бюджеты не назначаются задним числом под удачный прогон. До утверждённых результатов performance gate открыт.

Для `0.8` два чистых consumer-проекта устанавливают тот же tarball: один data/document workspace, другой dialog/editor workspace. Они проходят Quickstart без imports из repo source. Документация содержит supported variants/states, recipes, token provenance и migration rules. AI получает эти же правила и создаёт рабочую композицию без invented props/tokens; unsupported requirement явно отклоняется. Code Connect используется при доступном подключении, но отсутствие лицензии не блокирует обычный API/token/source mapping и не доказывает его готовность.

## Матрица обязательных экранов

| Source frame в Ruslan | Основная версия приёмки | Обязательство |
| --- | --- | --- |
| `1:691` Recents – Figma | `0.3` | Файловое пространство, карточки/таблица, фильтры, навигация и состояния |
| `1:84` Building | `0.5` | Документ, дерево, команды, форматирование, сохранение |
| `1:3894` Проектирование дизайн системы | `0.5` | Chat, composer, история, tool/activity/result surfaces |
| `1:1875` Sandbox Ruslan – Figma | `0.6` | Tree/canvas/inspector, multi-select, geometry и history |
| `1:4844` Abstract 3D Icon Set · Spline | `0.6` | Scene context и настройки, real rendering |
| `1:5441` Abstract 3D Icon Set · Spline | `0.6` | Object/material context той же сцены, transform/gizmo |
| `1:5922` Webflow - KENYMOOK | `0.6` | Navigator, viewport/breakpoints и Style/Settings/Interactions |
| `1:7743` Skills Design System Demo (copy) – Framer | `0.6` | Pages/Layers/Assets, dimensions/type/a11y inspector, preview |
| `1:8421` untitled | `0.6` | Workflow DAG, ports, inspector, runs и ошибки |

Полные ссылки, исходные имена и актуальные ограничения находятся в [REFERENCE-SCREENS](REFERENCE-SCREENS.md). Для сдачи `1.0` все девять заново проходят candidate regression; ранняя приёмка не переносится на сломанный новый head.

## Как оценивать качество

У каждой проверки есть область: component state, recipe, screen или platform. `Not checked`, `Failed`, `Verified` и `Accepted` — разные статусы. `Verified` означает, что проверка выполнена; `Accepted` — что результат удовлетворяет критериям и визуальный review завершён. Один общий процент «готовности DS» не используется.

| Ось | Требуемое доказательство | Что блокирует приёмку |
| --- | --- | --- |
| Visual | Reference/actual/diff при одинаковых viewport/DPR/zoom/data; geometry, typography, icons, spacing, surfaces и states просмотрены глазами | Необъяснённые различия anatomy, потерянные элементы, несогласованные иконки/поля/контраст, неверные переносы или clipping |
| Behaviour | Полный пользовательский сценарий и отрицательные переходы | Неработающее действие, рассинхрон модели/preview, непредсказуемый focus или недоступная keyboard alternative |
| Data integrity | Save/reload, concurrent edit, offline/retry, stale/late response и recovery | Потеря правки, перезапись более новой ревизии, ложное «сохранено», повреждение документа |
| Accessibility | Семантика, accessible names, focus, клавиатура и ручной AT проход | Обязательная задача недоступна, trap/потеря фокуса, состояние передано только цветом |
| Composition | Полный экран в обеих темах, плотностях и при resize | Частные overrides внутренних controls, перекрытия, потеря контента, jump layout, draft/selection remount |
| Scale / delivery | Реальные workloads, чистая установка tarball, SSR/types/CSS и выбранная support matrix | Невоспроизводимая поставка, stale assets, непроверенная заявленная платформа, выход за принятый бюджет |

Каждый дефект получает severity, owner, воспроизводимый trigger, affected scope и evidence. Blocker — задача не выполняется или данные/доступность нарушены. Major — заметное несоответствие обязательному сценарию/макету или требуемый обходной путь. Minor — локальное отклонение без потери задачи. Для выхода milestone: 0 открытых blocker/major; minor не скрываются средним баллом и требуют явного решения владельца. «10 из 10» не присваивается автоматически по green tests.

Карточка screen acceptance содержит source node/version, implementation commit, package version, theme/size, viewport/DPR/zoom, dataset/state, reference/actual/diff, manual review, сценарии, platform/browser и defect list. Если у исходника только одна тема, вторая оценивается по SEDA theme contract и отмечается отдельно; вымышленный Figma reference не создаётся.

## `0.9–1.0`: финальная сдача

`0.9` собирает один неизменяемый candidate: пакет, contracts, tokens, documentation, все reference applications и подтверждения проверок относятся к одной версии. Смена кода после приёмки требует impact analysis и соответствующей повторной проверки. Build output сверяется с исходниками; опубликованный экран проверяется после deploy, а не только по успешному ответу hosting API.

`1.0` наступает только после выполнения всех пунктов:

- [ ] Четыре класса приложений выполняют требуемые задачи из MATURITY на одном установленном пакете.
- [ ] Все девять frames/context приняты функционально и визуально; source artwork и отличия не скрыты placeholder/raster.
- [ ] Всё заявленное ядро имеет согласованные API/state/token/DOM contracts; остальные возможности честно классифицированы и обязательные gaps закрыты.
- [ ] Owner workflow самостоятельно понятен; данные сохраняются и восстанавливаются; доступна безопасная миграция конфигурации.
- [ ] Support matrix, AT/keyboard, нагрузка, поставка и обновление подтверждены, открытых blocker/major нет.
- [ ] Два независимых consumer proof завершены, а владелец принял результат по карточкам evidence.

Публикация сайта, заполненный roadmap и количество тестов сами по себе не закрывают ни один из этих пунктов. Общая цель остаётся активной до такого аудита.
