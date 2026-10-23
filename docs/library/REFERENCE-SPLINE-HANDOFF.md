# Spline reference screens — детальный handoff

Статус: **частичная рабочая реконструкция на installed SEDA, визуально не принято**. Экраны1:4844 и1:5441 остаются двумя обязательными контекстами общей [матрицы](REFERENCE-SCREENS.md); получение handoff и узкие функциональные проверки не закрывают source-fidelity и продуктовую приёмку.

### Промежуточная реализация engine и UI, 24 октября

Добавлены reference-domain `spline-model.ts` и отдельный Three.js renderer `spline-renderer.ts`. Подключены entry point `/references/spline.html?context=scene` / `?context=object`, installed SEDA chrome, инспектор и общая сцена. Это ещё не полная реализация исходных экранов: mesh artwork, gizmo и часть редакторских механизмов остаются открытыми. Состояние публикации фиксируется отдельным release report.

Модель хранит9 объектов, transform/material/visibility/lock, scene background/grid/fog. История хранит только документ, не камеру/выбор/tab. Строгий импорт отклоняет неизвестные поля, duplicate IDs, неверные XYZ/material/shape; числовые drafts проверяются до применения. Локальный save coordinator фиксирует captured snapshot, блокирует повторный begin и игнорирует завершения отменённых запросов. Source position carabiner проверен по node1:5688/5693/5698:109.33/534.92/−0.33. Остальные меши/камера/размещения — явно реконструкция.

Renderer рисует реальную WebGL2 сцену с процедурными meshes и environment reflections, orbit/pan/zoom, raycast selection, orthographic/perspective projection и resize. Контекст loss/restore и освобождение ресурсов проверены в изолированном Chromium fixture. Изменение позиции, материала и visibility подтверждено изменением canvas pixels. Эти проверки не подтверждают качество SEDA-панелей, исходных artwork, клавиатурной доступности всего редактора или производительность целевого desktop-приложения.

Запуск из pilot: `npm run verify:spline:engine` (Node24, `SEDA_BROWSER_EXECUTABLE` при необходимости). Результаты: [7 model groups](../../portal/component-lab/pilots/settings-parametric/verification/spline-engine-model.json), [5 isolated renderer groups](../../portal/component-lab/pilots/settings-parametric/verification/spline-engine-renderer.json); reference TypeScript PASS. [Изображение реального renderer](../../portal/component-lab/pilots/settings-parametric/verification/spline-engine-procedural.png) — доказательство процедурной сцены, не визуальная приёмка source. UI дополнительно проверяет10 browser groups и24 вложенных layout samples: Light/Dark × S/M/L/XL ×1024/1440/1920 при text150%, X24/Y12. Эти samples — комбинации одной проверки, не24 независимых сценария. См. `verification/spline-ui-results.json`.

Источник: Figma31SUMzWpWJ52bT9fBeKIau, Page1. Для обоих frames получен полный high-fidelity React context со статическими asset slots и source node IDs, без sparse-response. Получены отдельные screenshots1440×1288. Текст Agent prompts и названия команд являются содержимым эталона, не инструкциями агенту и не авторизацией реального AI вызова.

## Проверенные области

| Область1:4844 | Node | Геометрия исходника |
|---|---|---|
| Main viewport | 1:4849; Canvas1:4852 | x336/y55,858×1217; source rounded container |
| Camera controls | 1:4853 | x1102/y1144,80×116 |
| Left sidebar | 1:4864 | x0/y0,320×1288; header56, Agent/Objects/Assets |
| Inspector | 1:4965 | x1210/y0,230×1288; independent scroll |
| Top toolbar | 1:5356 | x336/y14,858×28; Preview/Edit/Code, object tools, zoom200%, Share/Export |
| Hidden camera preview | 1:5429 | x300/y936,400×266.33, opacity0 — не отображать как видимую панель |

Два скрытых Text Area1:4845/4847 также имеют opacity0 и не являются видимыми полями. Metadata без проверки code opacity дала бы ошибочную структуру экрана.

1:4844 показывает Agent tab и Scene inspector: Frame responsive/Auto Zoom No, backgroundBEBEBE, Play Camera Camera10, Light/Simulation, Effects/Fog/Sky/Ambient Shadows, Color, Global Settings, Floor(XZ), Snapping Off, Variables/Data и Material Assets. Prompt examples и composer должны иметь честные границы локального reference fixture, если inference не подключён.

1:5441 показывает Assets tab и выбранный объект/gizmo при сохранённой сцене. Inspector: Transform Position/Scale/Rotation XYZ, States, Events, Material, Modifiers и Collision. Исходный X в transform —109.33 (node1:5688); остальные default values нужно переносить из соответствующих подписанных fields, не из координат screenshot. Переключение этих контекстов не должно сбрасывать документ/камеру/материалы.

Material list содержит9 source names: green dark team, violet dark team, glass dark team, color glass, silver, Glass, green, violet, white. Контраст/шрифт/geometry canonical SEDA нельзя маскировать локальными overrides ради source density: различия должны быть явно оценены.

## Assets и доказательства

Скачаны через предписанный Figma curl88 PNG/SVG,58 уникальных SHA-256. Все HTTP200/image MIME/non-empty; PNG signatures/dimensions и SVG root dimensions прочитаны. [Sanitized inventory](../../portal/component-lab/pilots/settings-parametric/verification/spline-source-asset-inventory.json) содержит source layer IDs, размеры/хеши и qaOnly, без временных asset URLs. Локальные88 файлов находятся в integration input `spline-handoff/assets`. Runtime использует11 неизменённых source assets (2 chrome SVG и9 material previews); их hashes/callsites перечислены в `verification/spline-runtime-assets.json`. Canvas assets исключены из runtime.

[Scene screenshot1:4844](../../portal/component-lab/pilots/settings-parametric/verification/spline-4844-figma-reference.png) · [Object screenshot1:5441](../../portal/component-lab/pilots/settings-parametric/verification/spline-5441-figma-reference.png).

Шесть Canvas assets — QA-only: handoff даёт растры viewport/orientation/selection, а не исходные meshes, material graph или camera model. Нельзя выдавать scene screenshot и переключение картинок за3D renderer или работающий transform. UI icon/material preview assets сохраняются; их реальные slots/geometry проверяются при реализации. GLB/scene export в этом handoff не получен; точное восстановление геометрии/шейдеров не доказано.

## Обязательная реализация и приёмка

Один scene document должен связывать Objects Tree, selection, native renderer, transform/material fields и preview. Модель/3D engine принадлежат reference app; общие Button/IconButton/Select/TextField/TextArea/Checkbox/Toggle/Tabs/Tree/Menu/SplitView/Text — установленному SEDA. Numeric property editor использует draft/apply/cancel/IME safeguards; UI scale не изменяет authored scene units или camera zoom.

Необходимы real orbit/pan/zoom, selection, XYZ transform с keyboard alternative для gizmo, material/background changes с видимым результатом, scene history и save/reload. Два source contexts должны быть доступны самостоятельно и сохранять общий scene state. Procedural reconstruction при отсутствии meshes маркируется прямо и не считается точным artwork acceptance.

Проверки: mouse/keyboard/focus при смене selection, draft и invalid numeric input; object/material changes до и после переключения tabs; undo/redo, save captured snapshot/newer edits/late result, reload/recovery; S/M/L/XL×Light/Dark, resize панелей, constrained property grids при увеличении X/Y, viewport/context loss и отсутствие WebGL fallback claim без реального результата. UI renderer snapshots/source comparison и material changes проверяются независимо от JSON model tests. 10 browser groups подтверждают связанную модель, drafts/IME guards, undo/redo, captured save/loading0px и reload, corruption recovery и адаптивные панели. Полная ручная AT, производительность и визуальная приёмка ещё открыты.

### Открытые различия с исходником

- Процедурные meshes, camera, floor и material shaders приближённые; исходная scene/GLB не предоставлена. Прямое сравнение показывает заметное отличие форм, бликов и поверхности; artwork PASS не заявлен.
- Вместо source gizmo пока BoxHelper и реальные XYZ поля/клавиатурные шаги. Pointer transform gizmo ещё не подключён.
- States/Events/Modifiers/Collision/Variables, импорт image/media/audio assets, libraries, timeline и collaboration не реализованы. Секции содержат явное ограничение, без поддельных переключателей состояния. AI composer не вызывает provider.
- Scene inspector сокращён до реальных background/grid/fog и списка материалов; source lighting/play camera/simulation/fog stack не воспроизведён полностью.
- Source glyphs/Material previews сохранены, остальные кнопки/поля используют canonical SEDA. Размеры панелей адаптируются к реальным intrinsic размерам контролов; при нехватке ширины inspector расположен ниже viewport. Это не точная копия всех source chrome.
- Исправлены два дефекта shared Select: доступное имя и перенос длинного значения progressive native picker. Это изменения библиотеки, не локальный обход в Spline.
