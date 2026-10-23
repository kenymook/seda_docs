# Журнал визуальной оценки реализации

## 23 октября 2026 — меню действий в рабочем пространстве

Исходный code commit: `ffcf80a1df6a26c066e8acb38125bbfc0b563906`. Production version 11, [снимок Dark](../../portal/component-lab/pilots/settings-parametric/verification/menu-live-v11-dark.png). Это проверка отдельной композиции Lab; девять reference screens из Figma не считаются реализованными или принятыми.

### Q001 — закрыто: неразличимый trigger меню в Dark

На production version 10 геометрические проверки проходили, но screenshot показал белый квадрат с почти невидимым многоточием. Причина: icon-only DropdownMenu использовал secondary IconButton, а adapter передавал foreground ghost. Также source CSS ghost не учитывал compiled foreground fallback.

Исправление в общей библиотеке: icon-only trigger использует ghost; IconButton ghost читает canonical foreground с fallback в compiled adapter. Добавлены проверки варианта, прозрачного background, ожидаемого foreground, glyph и квадратной геометрии на Light/Dark в installed consumers и workspace. Production version 11: ghost, rgba(255,255,255,0.85) на rgb(29,41,56), contrast 11.013:1. Изображение после исправления просмотрено, glyph различим. Это измерение конкретного состояния, а не полный WCAG-аудит.

### Q002 — закрыто в version 12: наследованные demo theme selectors окрашивают внутренности полей

При XL, X=24, Y=6, Dark на screenshot видны разные заливки wrapper и внутреннего Select. В source найдена конкуренция: `body.dark .toolbar select`, `body.dark .fieldrow input` и `body.dark .modalBody input` в Lab styles.css имеют более высокую specificity, чем правила прозрачного внутреннего элемента в workspace.css. Это утечка legacy demo styles в реальные SEDA controls; геометрический PASS её не закрывает.

Demo selectors теперь исключают .seda-field__input/.seda-field__select. Не добавлялись цвета отдельных instances: wrapper продолжает брать canonical surface/foreground, внутренний элемент прозрачен и наследует текст. В общей геометрической матрице проверяются также эти свойства на всех видимых полях Projects/Settings/Access/Members/Editor; отдельная группа проверяет диалог Light/Dark × S/M/L/XL. [Production Dark](../../portal/component-lab/pilots/settings-parametric/verification/fields-live-v12-dark.png) просмотрен: заливка фильтров равномерная при XL, scale125, X24, Y6. [Live proof version 12](../../portal/component-lab/pilots/settings-parametric/verification/live-editor-v12.json) подтвердил прозрачный внутренний элемент и наследуемый foreground у filter/project, 103 исходных хеша совпали. Это не общая приёмка всех экранов.

### Панели редактора — ограниченная визуальная проверка

Просмотрены [Light](../../portal/component-lab/pilots/settings-parametric/verification/editor-workspace-Light.png) и [Dark](../../portal/component-lab/pilots/settings-parametric/verification/editor-workspace-Dark.png): три области, реальные controls, связанный preview и независимые scroll regions. Тесты проверяют pointer/keyboard resize, состояние children, историю, сохранение/reload и ошибки хранения. При узком окне применяется явный overflow minimum constraints. Это experimental composition, не точная реализация одного из девяти Figma frames; их статус не меняется.

## Как применять вывод

Устойчивые production screenshots снимаются после конечных CSS transitions (animations disabled только для screenshot), чтобы не принимать промежуточную интерполяцию Light→Dark за постоянный дефект. Отдельно проверены computed foreground активной навигации, disabled=false и opacity=1 в обеих темах: [visual proof](../../portal/component-lab/pilots/settings-parametric/verification/visual-editor-v12.json), [устойчивый Dark](../../portal/component-lab/pilots/settings-parametric/verification/editor-live-v12-dark.png). Это не motion/reduced-motion аудит и не обновление baseline для сокрытия регрессии.

При оценке экрана проверять вместе layout, различимость команд, focus, заливку wrapper/внутреннего элемента и реальные состояния. Автоматические measurements дополняют просмотр screenshots. Для найденного визуального дефекта добавлять regression на конкретную причину; не обновлять baseline, чтобы скрыть проблему. Закрытие одного дефекта не означает готовность всей библиотеки или screen.

## Tree — локальная проверка перед публикацией

Просмотрены [Dark editor](../../portal/component-lab/pilots/settings-parametric/verification/editor-tree-dark.png) и installed-consumer [Dark Tree](../../packages/seda-ui/verification/tree-19.2.7-dark.png): вложенность, отличимый selected row и сохранённое полное accessible имя при ellipsis. В узкой панели длинная подпись сокращается, инспектор показывает текст целиком; это не visual acceptance Figma reference. Отдельного утверждённого Figma Tree пока нет.

Joint test обнаружил crash от whitespace draft: подпись Tree обязана быть непустой, поэтому editor даёт запасное имя, не переписывая draft. Regression проверяет пустой текст, видимую ошибку, save guard и отсутствие JS errors. Все 21 workspace checks прошли после исправления. Проверка unit/geometry не заменяет эту проверку связи контролов.
