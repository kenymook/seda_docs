# Building — документное пространство на SEDA

Источник: [Ruslan, node 1:84](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-84), исходный frame 1440 × 1288. Design context и screenshot получены; 43 отдельных исходных image/vector assets сохранены с [хешами](../../portal/component-lab/pilots/settings-parametric/references/building-asset-manifest.json). Тексты документа являются содержимым примера, не требованиями к архитектуре SEDA.

## Реализация и границы

Локальный route `/references/building.html`. React entry импортирует установленный `@seda-ai/ui`, без alias на source. SedaProvider, SplitView, Tree, Button, IconButton, TextField, Select, Checkbox и DropdownMenu используются непосредственно из пакета. Геометрия контролов и Tree получает общий профиль, X/Y и тему через compiler adapters. SplitView остаётся experimental adapter. Header, document surface и native Dialog — композиции приложения, без заявления о сертифицированном контракте этих компонентов. Общий Dialog вынесен из Recents и используется обоими экранами.

23 страницы в локальной модели; у исходного документа 35 текстовых блоков с вложенными списками. Реализованы переходы дерева и breadcrumb, редактирование простого текста, split/join, типы блоков через slash/menu, keyboard move/indent/outdent, Todo, создание/дублирование страницы, локальные комментарии, поддерево корзины/restore, поиск, cover, undo/redo до 50 действий сеанса. Sidebar и документ прокручиваются отдельно; ширина и раскрытие дерева сохраняются отдельно от документа.

Сохранение пишет захваченный snapshot; новый draft во время сохранения остаётся изменённым. Lock предотвращает повторный save, epoch/mounted guard защищает завершение операции. Ошибки quota показываются без потери draft. Повреждённые данные требуют явного восстановления исходного документа; действия страницы и Save заблокированы до восстановления. Версия, уникальность IDs, циклы, глубина и размеры данных проверяются при загрузке/сохранении.

Это plain-text block editor, а не законченный rich-text движок. Inline marks/toolbar, полноценное редактирование выделения между блоками, drag/drop блоков, вложения, таблицы, collaboration/RBAC/backend и AI provider не реализованы. Enter/Delete/Backspace, paste и beforeinput между полями блокируются, чтобы не повреждать документ. Лимиты хранения валидируются при save; предотвращение всех предельных структурных операций до изменения draft ещё требует работы. История undo не переживает reload. Дублирование страницы не копирует подстраницы или комментарии — это указано в меню. Ссылка не передаёт локальное содержимое другому пользователю.

## Фактические локальные проверки

[Результаты](../../portal/component-lab/pilots/settings-parametric/verification/building-local.json): **5/5 model groups, 12/12 browser groups**. Это отдельные domain-model проверки, не дополнительные контракты SEDA. Покрыты source structure/installed package, caret/history/navigation, split/join, types/Todo/plain paste, keyboard operations, межблочное выделение с boundaries на Element, страницы/comments/trash/reload, save snapshot/newer draft/loading, quota/retry, corrupt reset, search/cover и JS errors.

Внутри одной profile group проверены **24 комбинации** (3 viewport × 2 themes × 4 sizes), X14/Y6: высота контролов и Tree 36/44/52/60 px, IconButton квадратный, горизонтального overflow нет. Эти комбинации не объявляются 24 независимыми пользовательскими сценариями. Loading Button сохранения имеет изменение размеров в допуске ±1 px. Reference TypeScript и build пройдены; [Общий regression run](../../portal/component-lab/pilots/settings-parametric/verification/building-regression.json) завершён: 55 Lab +21 workspace +12 controls +9 Recents +12 Building = **109 browser groups**, дополнительно 5 model groups; ошибок нет. Базовый pilot TypeScript также пройден.

## Визуальная оценка

Сопоставлены [исходный экран](../../portal/component-lab/pilots/settings-parametric/verification/building-figma-reference.png) и [actual Dark](../../portal/component-lab/pilots/settings-parametric/verification/building-dark-1440.png). Подготовлен также [Light](../../portal/component-lab/pilots/settings-parametric/verification/building-light-1440.png).

Сохранены sidebar/document/header, вложенность страницы, значок документа, его исходные тексты, callout и нумерованные/буквенные списки. В default viewport main content column имеет ширину 708 px, начало x480. Это измерение структуры, не доказательство полного визуального совпадения.

Незавершённые различия: Inter вместо исходного Segoe UI меняет переносы и высоту текста; title/heading/control weight и контраст отличаются. Canonical SEDA palette даёт более светлый sidebar, отдельную подложку Tree и яркий selected/callout. Навигационные отступы/ellipsis отличаются. Header получил Save/Undo/Redo, footer — локальный статус; source subscription/marketplace/update и неподключённые сервисные действия не воспроизведены как рабочие функции. Эти расхождения требуют решения при визуальной приёмке, они не считаются согласованными автоматически и не скрываются baseline update.

Статус: **локальная функциональная реализация проверена; публикация, итоговая визуальная приёмка и полнота документного приложения не завершены**. Screen reader, другие browser engines, native desktop shell, большие документы и performance пока не проверены. Этот этап не закрывает класс Notion и не означает готовность всей библиотеки.
