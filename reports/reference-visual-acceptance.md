# Приёмка reference-интерфейсов SEDA

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
