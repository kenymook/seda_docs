# Отчёт интеграции SEDA AI Lab 2.0

Дата: 23 октября 2026. База: `kenymook/seda_docs`, ветка `codex/seda-phase-3-react-pilot-20261022`, commit `a0c2793f6dee705061d8ca931c1ac6af109679ad`.

Исходный архив SHA-256: `290073b8532608be1c55de42fbd46686b7ad1f717519548921119d5203f0d1a5`.

## Реализация

Сохранена композиция из `index.html` и `lab.css`: header, параметры слева, workspace по центру, инспектор справа, форма и сравнение под таблицей. Поведение из `lab.js` перенесено в React, включая фильтры, карточки, создание проекта через dialog, выбор узла графа, clamp, before/after и JSON export. Отдельный сайт не создавался.

Реальные Button, IconButton и TextField импортируются из `packages/seda-ui`. Их размеры и цветовые роли поступают через `createWebBindings`; base geometry берётся из компилятора `packages/seda-contracts`, без дублирующей таблицы пресетов. В формуле вместо исходной константы border=1 используется разрешённая ширина границы. Инспектор/экспорт сохраняют базовое значение, token resolution chain и derivation с параметрами.

Библиотечный Button не создаёт leading slot без иконки. Во время loading подпись и иконки визуально скрыты, accessible name сохранено, spinner расположен в центре. Компонент замеряет border box и временно фиксирует размеры. Form reducer остаётся существующим: raw snapshot, request ID, synchronous guard, stale response и retry.

Исправлены два обнаруженных проверкой дефекта: сдвиг submit-кнопки из-за blur validation (используется зарезервированная область сообщения) и второй экземпляр React после отдельной установки библиотечных peer dependencies (build явно использует React/React DOM хоста).

## Результаты

Среда: Windows, Node 24.19.0; Chromium из установленного browser runtime (явный `SEDA_BROWSER_EXECUTABLE`).

| Проверка | Результат |
|---|---|
| TypeScript React-пилота | PASS |
| TypeScript библиотеки SEDA UI с её собственным lockfile | PASS |
| Существующие model/API/token/web tests, без изменения тестов | 77 / 77 PASS |
| Сборка и source audit | 8 профилей, valid=true |
| Новый browser runner | 55 / 55 PASS |
| Темы/размеры/адаптив | 32 конфигурации: 1440/1180/780/390 × Light/Dark × S/M/L/XL |
| Loading | 288 комбинаций: 8 профилей × X=0/6/24 × 3 подписи × none/left/right/both icons |
| Максимальная разница loading width / height | 0 px / 0 px при допуске 1 px |
| Label/spinner | label центрирован без leading icon; spinner центрирован по X/Y; accessible name и guard сохранены |
| Источники и отдаваемые артефакты | Сверены SHA-256: 71 исходник, 45 артефактов |
| Формула и clamp | Проверены параметры 150%/+12/175%, 80%/0/50%, strict on/off и реальные DOM-значения |
| Форма | invalid/focus, duplicate submit, A→B snapshot, profile/reset during request, failure/retry/Enter, stale response, cancel, help, automatic response — PASS |
| Workspace | поиск, status filter, cards, create/Enter, Escape, возврат фокуса — PASS |
| Токены | Изменённый compiled profile достигает React; Light/Dark получают свои разрешённые роли |
| Browser page errors | 0 |

[Машинные результаты](verification/lab2-results.json), [desktop Light](verification/1440-Light.png), [mobile Dark](verification/390-Dark.png). Полный локальный набор скриншотов генерируется в `.diagnostics-lab2/`.

Исходные unit tests и исторический phase-3 `verify.mjs` не переписаны. Старый browser runner привязан к предыдущей разметке и не запускался как проверка Lab 2.0; `npm run verify` теперь выполняет новый runner с проверками новой композиции.

## Публикация

Целевой существующий Site: `appgprj_6ada9cdd1d4c8191ab6ccb4e9a59a8af`, URL: https://seda-ai-pilot.kenymook.chatgpt.site/ . Перед интеграцией Sites подтвердил owner-only policy (`custom`, только owner, без групп/внешних посетителей). Исходники синхронизируются в существующий source repository Sites; результат deployment фиксируется в PR и итоговом сообщении. Права доступа не меняются.

## Оставшиеся ограничения

- Table/Card/Dialog, Select/Range/Checkbox и оболочка лаборатории — демонстрационные композиции. Проверка браузером не присваивает им компонентный контракт.
- Дополнительные параметры геометрии экспериментальны. Проверенные базовые профили и расчётные overrides явно различаются в инспекторе и JSON.
- Во время loading кнопка сохраняет замеренный snapshot даже при смене профиля; новая геометрия применяется после ответа. DOM-conformance учитывает snapshot отдельно.
- Сохранение использует существующую локальную имитацию транспорта. Серверной записи и восстановления проектов/формы после reload нет.
- Browser QA выполнен в Chromium; отдельный прогон Firefox/WebKit, screen reader и полный WCAG-аудит не проводились. Ручной визуальный просмотр дополнен автоматическими замерами, но pixel-perfect сравнение с архивом не заявляется.
- Закреплённые версии зависимостей не обновлялись: npm ci сообщил одну high-зависимость в инструментах пилота и одну moderate в contracts. Их обновление и отдельный security-аудит находятся за пределами этой интеграции.

## Дополнение: горизонтальный отступ X

Добавлен X=0–24 px к разным базовым отступам Button и TextField. IconButton не получает этот override. Проверены восемь профилей: прирост ширины Button ровно 2X, сужение контентной области TextField на 2X при прежней внешней ширине и отступе baseline+X, неизменная высота, квадратный IconButton, формулы/цепочки источников, экспорт X=12 и сброс. Дополнительно проверены 16 сочетаний 1440/390 × Light/Dark × S/M/L/XL при X=24 без горизонтального overflow страницы. Во время loading смена X не меняет текущую ширину; после ответа применяется новый X. Обнаруженный intrinsic min-width эффект устранён сохранением отступа save-кнопки в snapshot.

Итог: 55/55 browser checks, 77/77 существующих тестов contracts, TypeScript PASS. Loading-матрица расширена с 96 до 288 комбинаций, максимальный Δwidth/Δheight — 0/0 px. [Desktop X=24](verification/x24-1440-Light.png), [Mobile Dark X=24](verification/x24-390-Dark.png).
