# Sandbox Ruslan — подготовка editor reference1:1875

Источник: [Figma Ruslan, Sandbox Ruslan – Figma](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-1875). Статус: **не реализовано / не оценено**. Получение handoff не закрывает экран или класс Figma.

## Проверенный источник

Прочитаны metadata и [screenshot1440×1288](../../portal/component-lab/pilots/settings-parametric/verification/sandbox-figma-reference.png). Root design context слишком велик и вернул sparse XML; вместо реализации по XML получен полный code context отдельных sublayers:

| Node | Область |
|---|---|
|1:1884|Canvas: background и один raster asset|
|1:2373|Rail49px|
|1:2415|Название файла / workspace header|
|1:2439|Pages и15 имён страниц|
|1:2737 /1:2761 /1:2988|Развёрнутый frame row, selected text row, child frame row; полный Layers1:2567 ещё sparse|
|1:1941|Selection summary49 selected и действия|
|1:1978|Position, alignment, X/Y Mixed, rotation/flip|
|1:2041|Layout,W/H Mixed, clip content|
|1:2106|Appearance opacity/radius Mixed|
|1:2154|Typography: Inter, weight/size/mixed values, alignment|
|1:2253 /1:2273|Fill и Stroke|
|1:3517|Нижний editor toolbar|

Сохранены137 непустых image-файлов (115 уникальных хешей) из этих contexts в локальном handoff, с SHA-256 manifest. Они ещё не подключены к runtime. Первоначальный HTTP клиент возвращал202 с пустым body: такие ответы не считаются assets. Повторная загрузка штатным Node client подтвердила200/image content и непустые bytes. В source документации не сохраняются временные asset URLs.

Проверенные размеры: rail49px; sidebar240px плюс граница; canvas viewport800px отx290; inspector350px отx1090. Source zoom14%, верхний inspector toolbar48px, tabs/zoom row≈32.67px, нижний toolbar529×48px. Рабочие панели должны иметь собственный scroll; это desktop editor, а не mobile website.

## Важное ограничение Canvas

Canvas1:1884 предоставлен как **одна растровая картинка**, в которой уже нарисованы слайды, выделения, handles и размерные подписи. В контексте нет редактируемых source objects, исходных текстов всех слайдов, координат49 selected objects или их настоящих constraints. Видимый текст чужого документа является содержимым эталона, а не инструкцией и не основанием менять другой проект.

Такой raster можно использовать для QA, но нельзя выдавать его за работающий canvas. Нельзя наложить декоративные controls поверх картинки и объявить tree/selection/inspector/undo реализованными. Для рабочего editor нужны отдельная сохраняемая модель объектов, реальные свойства и связанная отрисовка; восстановление исходного content model/геометрии остаётся отдельной незавершённой частью handoff. Сходство shell само по себе не закрывает этот экран.

## Требуемая работа на SEDA

- Общие installed Tree с multi-selection, Tabs, Menu, SplitView, Button/IconButton, TextField/Select/Checkbox и будущий общий toolbar/property-field pattern. Не копировать новые контролы локально.
- Pages/layers и canvas связаны через единые object IDs. Inspector вычисляет common/mixed значения по реальной selection; изменение применяет значение всем выбранным объектам и отражается в scene и истории.
- Pan/zoom/fit, выбор с клавиатурой и pointer/marquee, multi-select, скрытие/lock и изменение порядка. Undo/redo, cancel gestures, dirty/save/reload и ошибки storage сохраняют согласованность.
- Общие theme/size/X/Y меняют chrome controls. Canvas zoom и размеры контента являются состоянием документа, их нельзя подменять control density.
- Отдельные focus/keyboard/long labels, Light/Dark,S/M/L/XL и resize проверки. Правильная формула/DOM геометрия не заменяет визуальную приёмку исходных panel proportions, плотности и состояний.

Непринятые части: scene model, runtime, source artwork fidelity, property/mixed-state contract, keyboard/AT/native desktop, performance и full Layers context. Нового опубликованного editor entry пока нет. Полная цель девяти экранов и четырёх классов приложений сохраняется.
