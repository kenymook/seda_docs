# Исполняемый Toast host для рабочих приложений

Продолжение активной цели зрелой SEDA. Это закрытие конкретного lifecycle gap; полная визуальная/AT/OS зрелость и приёмка девяти Figma frames не объявляются достигнутыми.

## Реализация

- ToastProvider/ToastViewport/useToast дополняют существующий presentation Toast. Изолированная FIFO-очередь: 3 видимых +50 ожидающих; новые сверх лимита отклоняются с null, старые не теряются. Dedupe/update сохраняют ID/позицию и обновляют срок.
- Timer начинается после показа, сохраняет остаток при hover/focus/window/visibility pause и remount viewport. Callback старой revision не удаляет обновлённое сообщение. Action/warning/error по умолчанию persistent.
- Arrival не перемещает фокус; Escape действует только внутри сообщения. Последняя committed логическая цель сохраняется даже при временном сбросе sibling imperative ref; недоступная цель пропускается, пустая region остаётся focusable fallback.
- Viewport остаётся в SEDA scope: текст, SVG, темы и X/Y наследуются без body portal. Placement — CSS приложения. Нет имитации сервера, глобального singleton или скрытой persistence.
- Вкладка «Состояния»: реальная серия событий, очередь, действие, dedupe, dismiss и очистка. Старый ручной presentation пример сохранён для сравнения.

## Проверки

- Финальный package verifier: 31/31 групп, React18.3.1/19.2.7, `.diagnostics-package/2026-10-24T15-05-58-732Z/results.json`. 144 детерминированных артефакта; 26 JS exports. NodeNext declarations включают 22 отрицательных type checks.
- На каждой React-версии host проверен в StrictMode реальными browser timers: отложенный старт queued item; dedupe/restart; независимые hover/focus причины; window inactivity event fixture; remount и cleanup; arrival без autofocus; local Escape/логический возврат; disabled target fallback; persistent action/error; capacity/dedupe; atomic invalid duration; provider isolation; отсутствие leaked metadata/JS errors.
- Lab feedback 8/8 групп PASS, включая реальные 3 visible/2 queued, promotion/clear/action и 24 shared theme/size/scale сочетания host. Visual consistency 24/24 и Lab regression55/55 PASS; прежние 288 loading-сценариев сохраняют нулевые дельты.
- TypeScript библиотеки проверен build с noEmitOnError, pilot и references — tsc PASS. Иные reference domain/browser suites на этом этапе повторно не запускались: их runtime реализации не менялись. Установленный consumer и основные формы/loading проверены.

Проверки действительно изменили решение: отрицательный consumer type check обнаружил неразрешимый inferred extensionless import в d.ts — введён явный публичный ToastController. Joint test обнаружил очищенный React ref при удалении item — сохранена committed логическая цель. Проверка масштаба сначала читала контейнер вместо видимого title; исправлен измеряемый элемент, порог ±1px сохранён. В timer fixture указатель после dismiss оставался над новым item и закономерно приостанавливал его: указатель перенесён вне области перед новым timed sample; отдельная hover/focus проверка сохранена.

## Границы

OS/screen-reader/browser-engine приёмка, notification history, persistence между сессиями, cross-window coordination и executable feedback instance contracts остаются открытыми. Window blur проверен browser event fixture, не OS certification. Action callback не auto-dismiss и не async transport: приложение владеет результатом и закрытием. Наличие диапазона duration от 1с не означает доступность короткого показа; production policy должна давать достаточно времени. Motion не добавлялся. Общая цель остаётся активной.

API: [Toast spec](../specs/feedback/toast.md). Публикация и production proof будут добавлены после deploy.
