# Card / Avatar: согласованные entity surfaces — 25.10.2026

Projects и Team теперь переиспользуют Card, Avatar и AvatarGroup из установленного @seda-ai/ui. Это очередной шаг к библиотеке веб- и десктоп-приложений; готовность всей дизайн-системы не заявляется.

## Что изменено

Card: native article/section/li/div, heading level2–6, content/media/description/metadata/status/actions slots, explicit Checkbox selection и text-only whole-card link/button. Общие compiler Text roles, существующие Card color tokens и foundation padding12/16/24 с дополнительными X/Y/radius. Known empty slots не создают пустых рядов. Loading сохраняет содержимое/геометрию, progress line не закрывает текст, status находится вне busy content. Actions в slots принадлежат владельцу, отсутствующий elevated/rich whole-card не имитируется.

Avatar: image→Unicode initials→original SEDA user/AI glyph; image decode/error не меняет named diameter16/20/24/32/40/48. Круг не растягивается дополнительными X/Y, textScale или radius — это identity scale. Default size наследует controlSize. Полное имя, status и selected имеют текстовые альтернативы; alt="" исключает дублирование соседнего имени. Native actions, расширенная pointer area маленького Avatar, именованный group overflow с настоящим переходом к списку. Персональные фото и присутствие пользователей не выдумываются.

Projects делит selection owner между Card и Table. Details не меняет selection; фильтры сохраняют off-page keys. AvatarGroup команды очищает фильтры и переводит фокус в именованную таблицу. Emoji в названии проекта не превращается в невалидный initials override.

## Найденные реальные дефекты

Первый контрастный тест остановился: новые brand/AI Avatar CSS ожидали aliased names, тогда как importer leaves назывались onBrand/onAi. Добавлены явные CSS-алиасы к оригинальным paths и полная provenance; tokens.json и namespace не переименованы. Build теперь требует используемые Card/Avatar color roles. Проверяется и отказ при отсутствии avatar onBrand/card title token.

Checkbox без своей подписи оставлял пустой label slot и второй grid track: фактический gap до Card title был16px вместо8px. Удалены и пустой DOM slot, и лишняя track/gap в общем Checkbox/provider, а не компенсированы локальным CSS. Настоящие label/helper/required и aria-labelledby сохраняются.

Дополнительный transition/Suspense-тест выявил image race: ref менялся во время ещё не committed render, поэтому успешная загрузка старого, всё ещё видимого image игнорировалась. Guard перенесён в layout effect после commit. Тест сначала воспроизвёл timeout, затем прошёл вместе с late load/error, cache и fallback сценариями. Это один проверенный concurrent scenario, не сертификат всех Suspense/streaming/AT режимов.

Loading Table вынесен в слой viewport: центр индикатора не уезжает при horizontal/vertical scroll, в LTR и RTL. Пустой grid track Checkbox также перестал влиять на selection columns Table.

## Визуальная проверка

Посмотрены Projects/Team в Light/Dark: одни identity frames,8px selection/title gap, общие Card padding/radius и semantic Text roles. При XL150/X24/Y12 статус может сокращаться внутри pill; полный текст доступен через настоящий SEDA Tooltip, отдельно проверенный в обеих темах. Стресс-режим не является рекомендуемой default density. Source v44 before frames сохранены.

Сохранённый перенос правил Files на8 reference routes повторно проверен:160 selected inspector samples,293 source asset hashes и95 реально использованных glyph raster probes. Повторно просмотрены normal M100 кадры Recents, Building, Chat, Sandbox, Spline, Webflow, Framer, Workflow в обеих темах. Шкала секций16px, связанных полей8px, подписи/значения4px; слот/цвет glyph следует контролу. Building не получает выдуманного inspector; authored canvas content не масштабируется вместе с chrome. Это продолжение визуальной проверки, а не новая Figma pixel fidelity приёмка.

Package gallery проверяет loaded/loading, media frame, identity sizes, initials/glyph/image, status/selected и RTL. UI screenshot не заменяет shape/token/keyboard проверок; тестовые SVG служат только источником image request в harness, не макетом реализации.

## Проверки и публикация

Финальные команды завершились с exit0:123/123 tests packages/seda-contracts;49/49 групп installed tarball package verification (React18.3.1 и19.2.7);39 pilot verifier scripts; TypeScript для main иreferences. Это разные уровни проверок, не сумма готовности библиотеки. Новая Card/Avatar матрица содержит48 выбранных комбинаций на каждую React version; Projects/Team —60 выбранных комбинаций (3 widths ×2 themes ×5 parameter profiles), плюс selection/filter/Details/overflow/Unicode/Tooltip workflows.

Loading delta и media frame delta в измеренных package-сценариях —0px на обеих React versions. Проверены committed-source guard при suspended transition и реальные late image events. Existing Table matrix и scrolled LTR/RTL loading checks также прошли. Source/provenance проверяет240 color bindings и явный отказ при отсутствии Card/Avatar roles.

[Package49](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/package-results.json), [React18](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/surfaces-react-18.3.1.json), [React19](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/surfaces-react-19.2.7.json), [Projects/Team60](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/local-results.json), [visual review](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/visual-review.json).

Опубликована version45 по прежнему приватному https://seda-ai-pilot.kenymook.chatgpt.site/. Deployment appgdep_6add7ed622a08191a4d2192e07010ff4 — succeeded; Site source ab3eded7008c6e4ef3946ed85fe96c72def8dab8; runtime GitHub9522781391a796a31869911cbd9aea7d97be282f. Archive7885512 bytes, SHA256 7cd09747f5acabe91e0ebff3fd20747f9ca1e5590fffa3c0da95e9621a4f5bed. После канонизации переносов строк Site и локальная сборка совпали по826 source/532 artifact hashes. Fresh production contexts подтвердили826/532, entities60, Table60, inspectors160/glyph raster95 иrhythm16, JavaScript errors0; installedPackage=true/sourceAlias=false. Live Projects/Team иWebflow просмотрены в Light/Dark. ACL custom/revision1, один owner, external visitors0/groups0 — сохранён. [Production results](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/production-results.json), [release](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/release.json).

При первом production run Webflow измерял составной glyph до завершения загрузки одного SVG. Отдельный network/decode probe воспроизвёл complete=false и затем успешное декодирование всех30 частей без failed requests/HTTP errors. Verifier теперь ждёт img.decode() и сохраняет все assertions на loaded/geometry/foreground/alpha; missing/broken asset продолжает отклоняться с URL. Это исправление readiness теста, runtime/site не менялся. Полный39-script runner прошёл до этого изменения harness; изменённый inspector verifier повторно прошёл160/160 локально и160/160 в production с exit0. Ранее обнаруженные реальные runtime-дефекты не скрывались сменой baseline.

## Что ещё открыто

Card/Avatar geometry и reference glyph adapters experimental; registry остаётся11 control contracts, не14. Именованные Avatar diameters и Card spacing — documented foundation fallback, не новые geometry tokens. Card elevated, rich whole-card media/actions, полный Avatar Block/Add Button, surface instance contracts, полная i18n, OS/AT и все states ещё не приняты. Fresh Figma acceptance не сделана: ранее MCP запросы context/screenshot ограничены Starter quota. Нового pixel match с Figma этим проходом не заявляется.

25 component entry modules не означают25/52 готовых specs: AvatarGroup входит в Avatar entry, provider/host APIs считаются отдельно. Main Lab Dialog остаётся явной композицией, а не выдан за public Modal; reference applications уже используют public Modal. Backend/AI/collaboration и отправка приглашений в локальном pilot не добавлялись. Общая цель остаётся активной.

## Граница проверки шрифтов и GitHub CI

CI Ubuntu для runtime9522781 прошёл package49, contracts123 и TypeScript, но остановился на Building: source-reference Segoe UI дал бы78px для первого абзаца, fallback дал104px. Windows с установленным Segoe UI сохраняет исходные36 text boxes; подстановка bundled Inter меняет36 измерений и поэтому не принята как незаметная замена. Координаты и screenshot baselines не обновлялись.

Building verifier теперь отдельно фиксирует доступность исходного шрифта. При наличии Segoe UI сохраняются строгие x/y/height и guide assertions относительно исходной Figma. Без исходного шрифта fidelity явно not-verified-source-font-unavailable; проверяются source content, x/landmarks, переносы без наложений, границы, guides и неизменность authored typography при24 combinations темы/размера/масштаба. Дополнительный bundled Inter fixture проверяет portable flow на каждом host, включая Windows. Это не исправляет поставку исходного шрифта и не объявляет Linux точным Figma match. Runtime и опубликованная v45 не менялись. [Windows source/font + portable flow](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/building-platform-font.json), [падение Linux CI](../portal/component-lab/pilots/settings-parametric/verification/entities-v45/ci-font-failure.txt).

Новый CI запускается после изменения harness; его terminal статус записывается отдельно.
