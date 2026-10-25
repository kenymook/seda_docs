# Slider D31: общий исполняемый контракт

Текущая итерация закрывает разрыв между существующим React Slider и общим компилятором. Это двенадцатый instance contract; библиотека по-прежнему experimental.

Один browser-safe модуль проверяет min/max/step, single/range, порядок значений и peer bounds в Node и React. Пакет содержит самостоятельную копию этого исходника с проверкой byte equality; зависимость на checkout в runtime не нужна. Actual discriminated union проверяется без потери связи mode/value/thumbLabels. Компилятор не исполняет formatter: default String остаётся явным предупреждением API_DEFAULT_UNCHECKED; его результат проверяется в браузере.

Семь размеров Slider объявлены в contract.geometry с provenance. Недостающий цвет/размер, нулевой обязательный размер и попытка заменить общие preset fields отвергаются. Adapter выдаёт CSS variables из compiled данных; браузерная проверка меняет contract minRailHeight44→52 и требует actual DOM52px. В лаборатории используется actual installed export через общий instance wrapper; inspector измеряет rail, не сравнивает его с Button32px.

Текущая проверка и публикация находятся в работе; результаты добавляются только после завершения соответствующих запусков. Исторические доказательства private v53 не выданы за текущую проверку D31. [Предыдущий отчёт](2026-10-25-slider.md).

Границы: geometry recipe остаётся документированным gap, не новым утверждённым Figma token set. Node browser rules сохраняют not-checked; данные контракта не доказывают работу OS/AT. Fresh Figma fidelity, Firefox/WebKit, touch screen readers и native desktop acceptance открыты. Controlled owner управляет сохранением и undo; Slider не добавляет transport, сервер или вертикальный режим.
