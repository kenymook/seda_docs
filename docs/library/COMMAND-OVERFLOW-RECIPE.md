# Command overflow — Files experiment

30 октября 2026. Статус: application recipe, экспериментальная реализация на Files. Не новый public component/API. Вход — `FILES-VIS-01` из [baseline](FILES-VISUAL-BASELINE.md).

## Правило

Верхняя панель содержит один ряд контролов. Владелец композиции задаёт порядок команд: первая остаётся видимой, остальные при нехватке ширины уходят с конца в существующий SEDA DropdownMenu. Дополнительные настройки и справка остаются в том же More. Команда представлена один раз, обработчик, icon и disabled передаются из одного списка. TopBar и Button продолжают наследовать параметры системы; font size, padding, height и token mappings не переопределяются.

`references/command-actions.tsx` измеряет доступную ширину через ResizeObserver и фактический overflow, а не один viewport breakpoint. Изменение densityKey пересчитывает вместимость. Если даже первая команда и More не помещаются, остаётся локальная native горизонтальная прокрутка с раскрытием keyboard focus; внешнего overflow/обрезки команд нет. Это fallback, не обещание комфортной плотности на любом окне.

При переносе сфокусированной команды в меню focus переходит на More, меню само не открывается. More остаётся тем же смонтированным DropdownMenu при resize. Escape и возврат фокуса принадлежат SEDA menu; операции и сохранение — Files. Открытый диалог не пересоздаётся при изменении вместимости, его draft сохраняется. В toolbar нет второй скрытой копии кликабельных команд для измерения.

## Проверки и область

`verify-command-actions.mjs`: Chrome, Light/Dark × S/M/L/XL/stress, один ряд с учётом min-height TopBar, каждое действие ровно один раз, menu keyboard/Escape, создание всех четырёх типов Files через текущую presentation, ввод имени и resize диалога, focus repair при 1920→900 и menu resize обратно. Token API — изолированный GET-only fixture; записи owner document не выполняются. Результат сохраняется в `verification/command-overflow/results.json`.

Повторный `verify-recents.mjs` проверяет существующие девять групп: assets/frame, поиск/фильтры/tabs, navigation/history, создание/rename/copy/reload, selection/trash/restore, storage failure/draft/retry, размер/темы/X/Y, corrupt recovery и ошибки браузера. Это не независимая визуальная приёмка.

Baseline `files-2026-10-30` сохраняется без изменений. After capture находится в отдельной папке `files-command-overflow-2026-10-30`; одинаковые fixture/source reference позволяют сравнить высоту header и положение первой карточки. Полная visual acceptance и остальные вопросы baseline остаются открыты.

## Следующий gate

Применить этот же recipe к иному типу приложения, включая toggle/undo/save/loading semantics, прежде чем повышать его до общего публичного API. Framer уже имеет собственный overflow algorithm; он не считается вторым consumer этой реализации. Не подменять перенос общего правила похожим, но независимым частным CSS. Сначала сопоставить state/command ownership и потребности обоих consumers, затем расширять API только при доказанном gap.
