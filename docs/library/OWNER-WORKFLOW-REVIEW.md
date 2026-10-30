# Owner workflow — scope и восстановление

Дата: 30 октября 2026. Область: технический проход `OWN-01/02` в текущем React Studio и изолированном локальном Worker/D1. Это не наблюдение за владельцем без подсказок и не приёмка всей дизайн-системы.

## Изменения

- Palette показывает охват связанных токенов и раскрываемый список использования. Semantic role по-прежнему показывает общий охват. Component popover объясняет, что меняется binding конкретной части/состояния.
- Новые component assignments выбираются только из semantic roles. Существующая историческая прямая palette-ссылка остаётся исходным значением и отдельно подписана; она не подмешивается в список новых semantic assignments. `tokens.json` не меняется и автоматического rebinding нет.
- Незавершённый, но структурно распознанный локальный цветовой ввод, например `oklch(`, больше не отбрасывается при reload. Raw draft хранится отдельно от применённого состояния. Для paint используется last-valid snapshot того же source, затем совместимый confirmed cache либо исходные tokens. Last-valid cache редактора не используется read-only consumers как подтверждение сохранения в D1.
- Inspector swatch, resolved value и зависимости используют тот же last-valid snapshot при ошибке, что и холст. Они не откатываются к исходному цвету и не показывают ложный нулевой охват.
- Ошибочная правка не отправляется в D1; предупреждение объясняет её локальный статус. Ошибка записи localStorage теперь видна: она не маскируется успешным ответом сервера. При quota error UI не обещает сохранность локального черновика и предлагает экспорт перед закрытием.
- Схема базы, CAS, source migration, API и compiler не изменены. У mutating `verify-token-store.mjs` добавлен запрет внешних URL; новый owner runner требует loopback URL и явный флаг dedicated fixture.

## Проверенные сценарии

`verify-owner-workflow.mjs` работает с настоящим локальным Worker и отдельной D1, без подмены успешных GET/PUT JSON fixtures. Перехват используется только для fault injection: offline, задержка уже выполненного PUT и quota error в отдельном браузерном context.

| Сценарий | Проверяемый результат |
| --- | --- |
| Palette blue/60 | Меняется ровно один foundation key; связанный Button получает новый цвет |
| Semantic Light border/field/default | Меняется ровно одна semantic binding; Select и TextField получают общий цвет |
| Select border/default | Меняется только component binding; TextField и общая роль сохраняют цвет |
| TextField border/default | Меняется TextField; Select сохраняет своё назначение |
| Button primary surface/default | Меняется выбранная binding Button; raw текст формы не теряется |
| Undo | Удаляется только последняя локальная правка Button, более ранние palette/semantic/field edits сохранены |
| Новый независимый browser context | Читает текущую D1, применяет оформление и не увеличивает revision |
| Исходная direct palette binding | Явно подписана как исходная; в selectable list только semantic roles |
| Некорректный цвет + offline reload | Raw input сохранён; D1 не изменена; холст, inspector и зависимости показывают last-valid состояние |
| Исправление + retry | Полный сохранённый документ содержит все прежние корректные edits и исправленный цвет |
| Поздний PUT | Ответ первой уже записанной правки приходит после второго ввода; второй ввод не теряется и сохраняется следующим revision |
| localStorage quota error | Есть видимое предупреждение; документ D1 не повреждается; ошибок React/JS нет |

В Light/Dark просмотрены screenshots сценария и исходной direct palette binding. Отдельно просмотрены invalid recovery и quota warning. Один технический повтор был вызван timeout screenshot при фоновой вкладке: runner явно активирует вкладку и отключает screenshot animations; этот timeout не объявляется успешной проверкой.

Дополнительные запущенные проверки:

- `verify-token-store.mjs`: настоящая отдельная локальная D1 — API validation, revision CAS, legacy client/source mismatch, независимые редакторы, конфликт и явный выбор серверной версии, offline/retry.
- `verify-saved-design.mjs`: настоящая локальная D1 — editor → Lab, reload, новый browser, восемь reference readers, сохранность формы и pending Button при изменении font/radius, stale/incompatible reads, offline confirmed cache и retry. Consumers не выполняют PUT.
- `verify-token-source-migration.mjs`: 26 544 resolved colour comparisons на восьми конфигурациях; SQLite API CAS/history; настоящий React old draft/cache, backup и reload idempotence. Это отдельный SQLite/route fixture, а не production D1.
- `verify-select-studio.mjs`: девять Select fixtures, state tokens в обеих темах, isolated autosave/reload/undo/reset, scope и mobile layout.
- Pilot/reference TypeScript, audited pilot build и Worker build.

## Воспроизведение

Подготовьте текущий Worker build из `site-runtime` с установленными зависимостями и текущим pilot output. Выберите **новый отдельный** `--persist-to` directory; старую рабочую базу для этих mutating tests не используйте. Схема — `site-runtime/drizzle/0000_open_lila_cheney.sql`.

Из runtime checkout:

```powershell
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --config dist/server/wrangler.json --local --persist-to .diagnostics-owner-d1 --file drizzle/0000_open_lila_cheney.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local --persist-to .diagnostics-owner-d1 --ip 127.0.0.1 --port 5211 --inspector-port 0
```

Из `portal/component-lab/pilots/settings-parametric`, после готовности HTTP endpoint:

```powershell
$env:SEDA_STORE_URL='http://127.0.0.1:5211'
$env:SEDA_TEST_STORE='isolated-owner'
$env:SEDA_BROWSER_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'
node verify-owner-workflow.mjs
node verify-token-store.mjs
node verify-saved-design.mjs
```

Первый runner требует пустой edits map и после выполнения восстанавливает начальные edits через API; revision/history намеренно остаются монотонными. Остальные verifiers также меняют fixture. Не направляйте их на свою рабочую локальную D1. Screenshots/results создаются в `.diagnostics-owner-workflow`; production token document не используется для тестовых записей.

## Что ещё не доказано

`PROOF-01` открыт: владелец должен самостоятельно выполнить три задачи без сценария автора. Скриптовая техническая проверка этого не заменяет. Полная Firefox/WebKit/OS/AT матрица и независимые consumers вне reference-приложений остаются открыты. Recovery повреждённого JSON и ручное восстановление произвольного неизвестного source не сертифицированы этим проходом. Last-valid cache — локальная помощь редактору, не замена общей базы и её истории. Зрелость четырёх классов приложений и девяти reference frames не заявляется.
