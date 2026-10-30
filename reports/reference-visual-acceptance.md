# Приёмка reference-интерфейсов SEDA


D33: общие параметры контролов вынесены из Lab в public Provider и общий numeric/CSS граф; private v58, отдельная проверка installed React18/19 и совместных экранов. [Отчёт и границы](2026-10-26-control-parameters.md). Это experimental foundation, не новый instance contract и не приёмка всей библиотеки.

Цель — возможность собрать зрелые web/desktop приложения уровня Figma, Notion, ChatGPT и Cloude Design. Исполняемый пример и проверка одного визуального слоя не означают готовность библиотеки.

## Проверяемые оси

- **Источник:** актуальные Figma context/metadata/render с node IDs, или явно архивный snapshot. Скриншот не становится фоном реализации.
- **Структура:** frame/panes/scroll ownership, размеры и взаимное положение групп; переполнения и масштаб не скрывают действия.
- **Типографика и ритм:** роли UI отдельно от authored content; font/icon/line/padding связаны; измеряются накопленные отступы и decorative guides, а не только высота контрола.
- **Assets и смысл:** оригинальные локальные файлы, root geometry, правильный callsite и соответствие accessible имени действия. Непустое изображение не доказывает правильную иконку.
- **Поведение:** keyboard/focus, async/state, editing/history, отказ/повреждение данных и сохранение/reload. Контракты сравниваются с применёнными DOM состояниями.
- **Платформы:** темы, плотности и text scale; отдельно browser/OS/AT/performance. Один Windows/Chromium прогон не подтверждает остальные платформы.

Для каждой оси используем: доказано в указанной области / расхождение исправлено / намеренное отличие / не проверено. Единого процента готовности и автоматического “100% fidelity” по числу тестов нет.

## Текущее покрытие исходных frames

| Frame | Reference route | Актуальность и предел |
| --- | --- | --- |
| 1:84 Building | building.html | Fresh source25.10; authored36 text/3 guides проверены. Общий chrome/цвета/полный feature parity не приняты |
| 1:691 Recents | recents.html | Runtime проверяется; fresh full visual acceptance не выполнена |
| 1:3894 Chat | chat.html | Runtime проверяется; fresh full visual acceptance не выполнена |
| 1:1875 Sandbox | sandbox.html | Runtime проверяется; fresh full visual acceptance не выполнена |
| 1:4844 Scene | spline.html | Runtime проверяется; fresh full visual acceptance не выполнена |
| 1:5441 Object | spline.html | Второй исходный контекст того же приложения; fresh acceptance не выполнена |
| 1:5922 Webflow | webflow.html | Runtime проверяется; fresh full visual acceptance не выполнена |
| 1:7743 Framer | framer.html | Runtime проверяется; fresh full visual acceptance не выполнена |
| 1:8421 Workflow | workflow.html | Runtime проверяется; fresh full visual acceptance не выполнена |

Список frame IDs — существующая карта интеграции, не свидетельство свежего чтения всех frames. В этой итерации заново прочитан только Building1:84. См. [отчёт и границы результатов](2026-10-25-document-visual-fidelity.md).

Открыты source chrome и дополнительные состояния Building, свежая приёмка остальных frames, отсутствующие public runtime компоненты, rich text/virtualization, full RTL и target OS/AT. Архивный Figma scan и зелёные частные проверки эти пункты не закрывают.

## 25.10 — согласованность компонентов

[Files visual pass](2026-10-25-dense-visual-consistency.md): общие menu/action rhythm перенесены на8 apps;16 route/theme screenshots просмотрены. Files получил собственный verified optical/theme glyph adapter, flow filters,24px rhythm и card radius из compiled geometry; source34/32px композиция намеренно адаптирована. Это не fresh pixel fidelity approval всех9 frames. Для остальных source icon families оптическая приёмка открыта.

## 25.10 — продолжение: glyphs и инспекторы

[Текущий проход](2026-10-25-inspector-icon-consistency.md) переносит optical/theme/source-alpha adapter на остальные7 reference apps и общий section16/field8/label4 recipe на существующие inspector families. Проверены160 selected parameter/theme/width samples и95 painted glyph variants; просмотрены32 снимка. Это закрывает ограниченный объём согласованности показанных панелей, сохраняя открытыми все variants/states, полноту public icon catalog, Figma fidelity и target OS/AT. Исторические замечания выше к иконкам/плотности уточнены этим объёмом, а не превращены в утверждение о готовности всей библиотеки.

## 26.10 — размещение инспекторов

[EditorDock, private v56](2026-10-26-editor-dock.md): четыре редактора используют общую композицию установленного SplitView. При нехватке читаемой ширины inspector переходит под canvas без remount полей иpreview. Проверены32 selected cases и8 transitions, соседние размеры на границе reflow, draft/focus/caret, независимые width/height иactual canvas minimum. Framer сохранил прежний порог350px; исходная регрессия308px и её исправление записаны в proof. Визуально просмотрены обе темы и выбранные обычные/крупные параметры. Это намеренная адаптация композиции для большой типографики; fresh fidelity/signoff девяти исходных Figma frames, все states иtarget OS/AT остаются открыты.

## 26.10 — реальные иконки истории и камеры

[Private v57: Spline](2026-10-26-icon-orientation.md): 4 font symbols заменены public SEDA Icon с разной семантикой истории/камеры. 26 имён /25 прежних SVG, производный поворот явно атрибутирован. Просмотрены Light/Dark, выбранные normal/extreme параметры иproduction;48 selected cases, actual undo/redo/camera workflow и raster orientation proof не заменяют полную приёмку всех reference frames и target OS/AT.
