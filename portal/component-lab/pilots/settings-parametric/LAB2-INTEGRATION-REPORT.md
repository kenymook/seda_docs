# Отчёт интеграции SEDA AI Lab 2.0

Дата: 23 октября 2026. Репозиторий `kenymook/seda_docs`, PR #4. База: `codex/seda-phase-3-react-pilot-20261022`, `a0c2793f6dee705061d8ca931c1ac6af109679ad`.

Исходный архив SHA-256: `290073b8532608be1c55de42fbd46686b7ad1f717519548921119d5203f0d1a5`.

## Текущее исполнение

Сохранена структура переданного Lab 2.0: параметры, workspace, инспектор, граф зависимостей, формулы, before/after и экспорт. Workspace расширен для веб- и десктоп-приложений: навигация «Проекты / Настройки / Команда», поля разных типов, Select, Radio, Toggle, Checkbox, пересечение фильтров, сортировка, выбор строк/indeterminate, bulk action, пагинация, карточки и dialog. Узкое окно не превращает рабочую область в лендинг; таблицы прокручиваются внутри своей области.

Используются **настоящие компоненты `packages/seda-ui`**, импортированные из `@seda-ai/ui`. Build alias направлен на `packages/seda-ui/src/index.ts`. `dist/build-metadata.json#bundledComponents` содержит фактически включённые TSX-модули esbuild. `contract-controls.tsx` только проверяет props и подключает compiled metadata; собственных input/select вместо компонентов библиотеки в нём нет.

Исполняемые контракты теперь существуют для **Button, IconButton, TextField, Select, Checkbox, Radio, Toggle**. Реестр общий для TypeScript API inspector, schema validation и state rules. `compileControl()` проверяет отдельный экземпляр и возвращает его geometry/state/checks/tokenBranch. `compile()` включает четыре новых контракта в `controls`; `createControlWebBindings()` проверяет обязательные состояния и выдаёт CSS assignments с provenance. Отдельный ручной каталог `workspaceTokens` удалён. Runtime лаборатории использует те же executable rules при передаче props настоящим компонентам. Решение и правила: [D25](../../../../packages/seda-contracts/WORKSPACE-CONTRACTS.md).

Геометрия приходит из system/profile compiler без дублирующих пресетов. Дополнительный X прибавляется к базовому padding Button/TextField/Select, а у Checkbox/Radio/Toggle — к интервалу до подписи. Y меняет высоту строки. IconButton остаётся квадратным; Radio круглым, Toggle сохраняет форму. Формулы и React используют одни значения. Служебная панель лаборатории отделена от рабочей области.

## Исправления компонентов

- У input/select убрана двойная рамка фокуса: индикатор принадлежит всей поверхности поля, внутренний элемент не рисует вторую рамку. Клавиатурный фокус остаётся видимым.
- Select сохраняет нативную семантику, ref и поведение формы. При поддержке `appearance: base-select` popup оформлен теми же component tokens: фон, границы, радиус, размер строк, выбранный пункт и disabled options. При отсутствии поддержки используется системный popup.
- Select/Checkbox/Radio/Toggle объединяют внешний `aria-describedby` с локальным сообщением без повторов и висячего локального ID. Общая утилита использует уже принятые правила TextField для содержимого ReactNode.
- Disabled подавляет визуальную/ARIA ошибку; helper остаётся доступным. У Radio исправлен конфликт checked/defaultChecked. Checkbox сохраняет mixed/indeterminate. Toggle блокирует pointer и keyboard изменения во время loading.
- Button сохраняет border box и X на время loading, label/accessibility и центральный spinner. Существующая модель формы сохраняет snapshot, request ID, синхронный guard, retry и защиту от поздних ответов. Новая геометрия применяется после ответа.

## Уровни проверки

Среда: Windows, Node 24, установленный Chromium через `SEDA_BROWSER_EXECUTABLE`. Числа ниже относятся к реализованным компонентам и сценариям лаборатории, а не ко всей дизайн-системе.

| Проверка | Результат / область |
|---|---|
| TypeScript пилота и библиотеки | PASS |
| Unit tests пакета contracts | 90 / 90: 77 исходных и 13 новых групп; API, ошибки авторства, варианты значений, состояния, токены, общая компиляция и web bridge |
| Lab browser runner | 55 / 55; включая 32 комбинации ширины/темы/размера и 288 вложенных loading-сочетаний |
| Button loading | Максимальный Δwidth/Δheight — 0/0 px при допуске 1 px, включая изменение X во время запроса |
| Workspace runner | 14 / 14; 8 групп геометрии содержат 144 сочетания темы/размера/параметров/ширины/раздела, ещё 5 связанных сценариев и browser errors |
| Control runner | 12 / 12; 8 групп по 5 состояний × 4 компонента = 160 снимков DOM-состояний; keyboard/multi, loading/disabled guard, focus/picker и подтверждение модулей библиотеки |
| Toggle loading | Δwidth/Δheight 0/0 px, 0 callbacks при заблокированных pointer/Space действиях |
| Сборка | 8 профилей, schema validation и source audit PASS; SHA-256 исходников и артефактов проверяет Lab runner |
| Browser errors | 0 ошибок приложения |

Для исходного теста deferred browser checks обновлено ожидаемое количество 13 → 33: новые контракты добавили 20 деклараций. Эти декларации сохраняют `not-checked` в статической проверке; реальные DOM-результаты находятся отдельно. Старый `verify.mjs` phase 3 сохранён и не используется как runner новой композиции.

Машинные результаты: [Lab](verification/lab2-results.json), [workspace](verification/workspace-results.json), [новые контракты](verification/controls-results.json), [unit summary](verification/contracts-results.txt). [Popup Select](verification/select-picker-Light.png), [единая рамка фокуса](verification/field-focus-Light.png).

## Публикация и границы

Обновляется существующий приватный Site `appgprj_6ada9cdd1d4c8191ab6ccb4e9a59a8af`: https://seda-ai-pilot.kenymook.chatgpt.site/ . Policy owner-only (`custom`, один owner, без групп и внешних посетителей) сохраняется. Идентификатор версии, deployment и source SHA фиксируются в PR после успешной публикации; новый сайт не создаётся.

- Navigation/Table/Card/Dialog и составные формы остаются демонстрационными композициями. Семь перечисленных контролов имеют исполняемые контракты; дополнительные X/Y — эксперимент Lab, а не новый сертифицированный размерный профиль.
- Данные и транспорт локальны сессии; серверная запись, реальные email-приглашения и восстановление после reload не реализованы.
- Проверен Chromium. Firefox/WebKit, native desktop shell, screen readers и полный WCAG-аудит не проверены. Popup Select вне поддержки base-select и календарь date остаются системными.
- Закреплённые зависимости не обновлялись. Ранее отмеченные инструментальные dependency/security-ограничения этой интеграцией не устраняются.
