# Spline reference screens — детальный handoff

Статус: source inspected / assets downloaded, **не реализовано и не принято**. Экраны1:4844 и1:5441 остаются двумя обязательными контекстами общей [матрицы](REFERENCE-SCREENS.md); получение handoff не увеличивает число реализованных экранов.

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

Скачаны через предписанный Figma curl88 PNG/SVG,58 уникальных SHA-256. Все HTTP200/image MIME/non-empty; PNG signatures/dimensions и SVG root dimensions прочитаны. [Sanitized inventory](../../portal/component-lab/pilots/settings-parametric/verification/spline-source-asset-inventory.json) содержит source layer IDs, размеры/хеши и qaOnly, без временных asset URLs. Локальные88 файлов находятся в integration input `spline-handoff/assets`; они ещё не подключены к runtime. Это не проверка DOM callsite/effective geometry будущего интерфейса.

[Scene screenshot1:4844](../../portal/component-lab/pilots/settings-parametric/verification/spline-4844-figma-reference.png) · [Object screenshot1:5441](../../portal/component-lab/pilots/settings-parametric/verification/spline-5441-figma-reference.png).

Шесть Canvas assets — QA-only: handoff даёт растры viewport/orientation/selection, а не исходные meshes, material graph или camera model. Нельзя выдавать scene screenshot и переключение картинок за3D renderer или работающий transform. UI icon/material preview assets сохраняются; их реальные slots/geometry проверяются при реализации. GLB/scene export в этом handoff не получен; точное восстановление геометрии/шейдеров не доказано.

## Обязательная реализация и приёмка

Один scene document должен связывать Objects Tree, selection, native renderer, transform/material fields и preview. Модель/3D engine принадлежат reference app; общие Button/IconButton/Select/TextField/TextArea/Checkbox/Toggle/Tabs/Tree/Menu/SplitView/Text — установленному SEDA. Numeric property editor использует draft/apply/cancel/IME safeguards; UI scale не изменяет authored scene units или camera zoom.

Необходимы real orbit/pan/zoom, selection, XYZ transform с keyboard alternative для gizmo, material/background changes с видимым результатом, scene history и save/reload. Два source contexts должны быть доступны самостоятельно и сохранять общий scene state. Procedural reconstruction при отсутствии meshes маркируется прямо и не считается точным artwork acceptance.

Проверки: mouse/keyboard/focus при смене selection, draft и invalid numeric input; object/material changes до и после переключения tabs; undo/redo, save captured snapshot/newer edits/late result, reload/recovery; S/M/L/XL×Light/Dark, resize панелей, constrained property grids при увеличении X/Y, viewport/context loss и отсутствие WebGL fallback claim без реального результата. UI renderer snapshots/source comparison и material changes проверяются независимо от JSON model tests. Пока этих результатов нет, оба screen statuses остаются «не реализовано / не оценено».
