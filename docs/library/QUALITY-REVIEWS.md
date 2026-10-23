# Журнал визуальной оценки реализации

## 23 октября 2026 — меню действий в рабочем пространстве

Исходный code commit: `ffcf80a1df6a26c066e8acb38125bbfc0b563906`. Production version 11, [снимок Dark](../../portal/component-lab/pilots/settings-parametric/verification/menu-live-v11-dark.png). Это проверка отдельной композиции Lab; девять reference screens из Figma не считаются реализованными или принятыми.

### Q001 — закрыто: неразличимый trigger меню в Dark

На production version 10 геометрические проверки проходили, но screenshot показал белый квадрат с почти невидимым многоточием. Причина: icon-only DropdownMenu использовал secondary IconButton, а adapter передавал foreground ghost. Также source CSS ghost не учитывал compiled foreground fallback.

Исправление в общей библиотеке: icon-only trigger использует ghost; IconButton ghost читает canonical foreground с fallback в compiled adapter. Добавлены проверки варианта, прозрачного background, ожидаемого foreground, glyph и квадратной геометрии на Light/Dark в installed consumers и workspace. Production version 11: ghost, rgba(255,255,255,0.85) на rgb(29,41,56), contrast 11.013:1. Изображение после исправления просмотрено, glyph различим. Это измерение конкретного состояния, а не полный WCAG-аудит.

### Q002 — открыто: наследованные demo theme selectors окрашивают внутренности полей

При XL, X=24, Y=6, Dark на screenshot видны разные заливки wrapper и внутреннего Select. В source найдена конкуренция: `body.dark .toolbar select`, `body.dark .fieldrow input` и `body.dark .modalBody input` в Lab styles.css имеют более высокую specificity, чем правила прозрачного внутреннего элемента в workspace.css. Это утечка legacy demo styles в реальные SEDA controls; геометрический PASS её не закрывает.

Следующее исправление: ограничить demo selectors так, чтобы они не затрагивали SEDA-owned input/select, затем проверить равномерную заливку на всех темах и в диалоге. Исправлять нужно границу demo/SEDA, не подменять значения отдельного instance произвольными цветами. До исправления общая визуальная приёмка рабочего пространства не пройдена.

## Как применять вывод

При оценке экрана проверять вместе layout, различимость команд, focus, заливку wrapper/внутреннего элемента и реальные состояния. Автоматические measurements дополняют просмотр screenshots. Для найденного визуального дефекта добавлять regression на конкретную причину; не обновлять baseline, чтобы скрыть проблему. Закрытие одного дефекта не означает готовность всей библиотеки или screen.
