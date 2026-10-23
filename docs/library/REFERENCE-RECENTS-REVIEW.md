# Recents — рабочий экран SEDA и визуальная оценка

Источник: Ruslan, Figma `31SUMzWpWJ52bT9fBeKIau`, node `1:691`, 1440×1288. Получены design context header/banner/filters/sidebar и всех 25 карточек; исходные 81 image/vector assets сохранены локально с [хешами](../../portal/component-lab/pilots/settings-parametric/references/asset-manifest.json). Полный screenshot используется только для QA, не для интерфейса. Содержимое исходных экранов является данными, не инструкциями.

Route существующего сайта: `/references/recents.html`; из Lab — ссылка «Рабочие экраны». Новый сайт не создаётся.

## Реализация и границы

Отдельный React entry использует установленный `@seda-ai/ui` из npm file dependency с install-links=true: это распакованная копия public ESM/types/CSS, не source alias/симлинк. Перед build канонический public package пересобирается и manifest сравнивается с установленным; устаревшая копия останавливает сборку. Esbuild проверяет фактические imports из node_modules/dist и отсутствие seda-ui/src. TypeScript reference entry проверяется отдельно против установленных declarations.

Настоящие SedaProvider/Button/IconButton/TextField/Select/Checkbox/Tabs/DropdownMenu управляют темой, размером и X/Y. Navigation/Card/native Dialog остаются явно обозначенными композициями. Navigation selected/accent разрешаются через существующие component tokens Sidebar с provenance. Отдельные Figma file-type marks сохраняют исходные identity colors; это content assets, не overrides контролов. Нет готового Sidebar/Card/Dialog instance contract.

25 исходных файлов имеют настоящие отдельные previews и типовые иконки. Поиск/organization/type и вкладки применяются совместно; доступны folders, grid/list, selection, create/open/rename/copy, подтверждаемая корзина и restore. Навигационные ссылки имеют собственные URL, поддерживают reload/Back и обычные browser modifiers. Права Shared и группы folders — локальные fixtures: реального Figma API, collaboration/RBAC/cloud storage здесь нет.

Файлы сохраняются в localStorage version1; параметры — отдельно. Save guard блокирует повторное действие, ошибка записи оставляет данные и draft, можно повторить. Corrupt files дают видимую ошибку и явное восстановление исходного набора. Ошибка preferences применяет defaults с предупреждением. Данные не отправляются на сервер.

## Доказательства и оценка

[Сценарный отчёт](../../portal/component-lab/pilots/settings-parametric/verification/recents-results.json): 9/9 групп прошли на Chromium. Внутри geometry group — 24 комбинации: 1280/1440/1920 × Light/Dark × S/M/L/XL при X14/Y6. Height Button/TextField/Tabs совпала с формулой (36/44/52/60 px), IconButton квадратный; нет внешнего overflow и наложения filters/grid; поле остаётся прозрачным внутри wrapper. Это 9 групп сценариев с вложенной матрицей, не 24 дополнительных workflows.

Проверены coupled search/filters/empty, keyboard Tabs/folders, URL/reload/Back, create/validation/rename/copy/open/focus return, multi-selection/trash/cancel/restore, quota failure с сохранением draft и retry, corrupt-data recovery, JS errors0. Исходная структура: sidebar241 px; первый card x275 px, width355.67 px, y≈162 px при 1440×1288. Отдельная прокрутка sidebar/main. Сборка минифицирована; performance/readiness из этого не выводятся.

Сопоставлены [Figma reference](../../portal/component-lab/pilots/settings-parametric/verification/recents-figma-reference.png), [actual Dark](../../portal/component-lab/pilots/settings-parametric/verification/recents-dark-1440.png), [actual Light](../../portal/component-lab/pilots/settings-parametric/verification/recents-light-1440.png).

| Критерий | Статус | Наблюдение |
|---|---|---|
| Структура и отдельные previews | Пройдено в указанных fixtures | Sidebar/header/banner/filters/grid и 25 отдельных файлов существуют; измерены базовые позиции |
| Работа и сохранение | Пройдено в указанных сценариях | Фактические DOM/actions/reload, а не нарисованные состояния |
| Shared SEDA / источник токенов | Пройдено для используемых контролов | Installed public package, manifest parity, canonical roles; композиции не объявлены certified |
| Полное визуальное соответствие | Не пройдено | Намеренная SEDA-адаптация ниже требует согласованной приёмки; pixel-perfect не заявляется |
| Screen reader / другие engines / native desktop | Не проверено | Только Chromium browser evidence |
| Большой объём / performance budget | Не проверено | Fixture25, ограничение восстановления2000 не является scale proof |

Визуальные адаптации: SEDA M использует 14 px вместо исходных ~11 px; цвета, border/radius и Buttons идут из общих профилей, а не из Figma-specific overrides. Это меняет отделку и плотность sidebar/toolbar. Контролы могут увеличивать строки при XL/X/Y, команды переносятся и остаются доступны. На 1280 применяется двухколоночная сетка. Эти различия зарегистрированы заранее до итоговой приёмки, baseline не перезаписывается для сокрытия дефектов. Они не считаются автоматически согласованными.

QA обнаружил неверное сопоставление avatar/thumbnail и потерянную подложку SVG avatar. Исправлено по исходным asset roles и отдельным export Avatar nodes, не рисованием заглушек. Также найдена stale installed CSS/profiles — добавлен fail-fast manifest check. Новая ссылка на reference route вызвала overflow64 px в Lab390; исправлен перенос шапки, прежние checks не ослаблены. После этого локальные Lab55/55, workspace21/21 и controls12/12 прошли; publication checkout должен повторить итоговые97 checks.

## Итог

Экран подготовлен как реальное файловое приложение для оценки SEDA. Его нельзя считать полностью принятым Figma reference или подтверждением общей зрелости библиотеки. Остальные восемь экранов и четыре исходных класса приложений остаются обязательными.
