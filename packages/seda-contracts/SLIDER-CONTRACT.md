# D31 — исполняемый контракт Slider

Статус: implementation contract; fresh Figma/OS/AT acceptance остаётся открытой. Существующие visual token gaps не становятся утверждёнными design tokens от появления JSON.

Числовая модель `src/slider.mjs` — browser-safe source для Node-компилятора и React. UI build копирует этот модуль в самостоятельный installed package; относительная ссылка наружу пакета запрещена. Типы single/range сохраняют discriminated union; проверка props через TypeScript не должна разъединять mode, value и thumbLabels.

Компилятор не исполняет callbacks. Оpaque `$handler` для formatValue проверяется как string-returning callback по действительному типу API; результат форматирования, aria-valuetext, форма/fieldset, focus, keyboard и gestures требуют браузерного доказательства. Успех validateInstance не равен runtimeConformance.

## Geometry

Slider имеет собственные документированные измерения: minRailHeight44, minThumbSize12, trackHeight4, thumbBorderWidth2, focusWidth2, focusOffset3, headerGap8px. Их источником является contract.geometry; это единый recipe с provenance, а не семь новых токенов. Component geometry не может заменить общую height/font/icon/radius. Цвета берутся из существующего slider branch; error text — явный semantic status/danger/text adapter.

Общий профиль задаёт font/line/icon/height; experiment X расширяет rail gutters, Y влияет через высоту общего контрола. Native thumb остаётся круглым. Добавление отдельной component geometry необходимо, поскольку общий минимум кнопки24/32px не равен hit area Slider44px. Остальные компоненты сохраняют свои прежние размеры.

Модель требует конечные representable min/max/step и упорядоченные значения на сетке. Она не выполняет save, не меняет owner data, не парсит выражения и не является финансовой decimal арифметикой. Сетевой ответ и document undo transaction остаются у владельца приложения.
