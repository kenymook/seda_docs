# Checkbox, Radio, Toggle: выравнивание первой строки

## Проблема и исправление

В установленном пакете маркер центрировался относительно label вместе с helper, а внешний flex-ряд центрировал всю высоту компонента. Добавление описания, ошибки или переноса смещало маркер и соседние подписи. Baseline-матрица обнаружила максимальное расхождение 45 px.

Общая inline-grid раскладка привязывает маркер к первой строке. Высота этой строки учитывает line-height и track Toggle с существующим inset. Подпись может переноситься, описание размещается ниже всей подписи; высота растёт естественно. Однострочный контрол сохраняет высоту preset/параметров Lab. Горизонтальная группа использует `align-items: first baseline`; нельзя обещать её выравнивание при произвольном внешнем `align-items: center`.

Lab передаёт размер маркера из существующей общей геометрии; X управляет gap, Y — общей высотой строки. Табличная композиция с визуально скрытым label сохраняет компактную одноколоночную геометрию без пустого слота. Новых public props, вариантов и токенов нет.

Checkbox/Toggle связывают label через aria-labelledby, сохраняя явные aria-label/aria-labelledby потребителя. Helper/status/error остаётся description и не дублируется в имени. Radio получает уникальные ID подписи и helper на каждый option; helperText=0 больше не теряется. Native checked/change и существующие async/read-only guards сохранены.

## Доказательства

- TypeScript: библиотека, pilot и references PASS. Контракты: 122/122 PASS.
- Установленный tarball: 37/37 групп PASS, React 18.3.1 и 19.2.7, без source/React aliases. Raw: `packages/seda-ui/.diagnostics-package/2026-10-24T16-47-05-563Z/results.json`.
- Новый package fixture: на каждую React-версию 80 сочетаний theme × size × message kind × direction, по шесть choice-контролов. Это повторные DOM-измерения, не 80 пользовательских workflow. Проверены отсутствие/наличие helper, error, числовой 0, multiline label, отдельное имя потребителя и native actions. Максимальная дельта первой строки/маркера 0 px; baseline до исправления — 45 px.
- Реальный Lab: 48 сочетаний двух тем, S–XL, масштаба 80/100/150% и крайних X/Y. Максимальная дельта 0 px; соседние Checkbox/Toggle выровнены и в error-строке. Проверка использует настоящий renderer и компилятор Lab. Raw: `.diagnostics-choice-layout/results.json` в pilot.
- Просмотрены package captures до/после и Light/Dark галерея Lab. В error-строке helper больше не опускает Checkbox и Toggle относительно друг друга.
- Lab 2: 55/55 групп PASS на свежем dist, включая source/artifact integrity. Все 288 сочетаний loading сохранили размеры: максимальные deltaWidth/deltaHeight — 0 px. Это матрица тем, размеров, X, подписей и icon slots, а не 288 отдельных пользовательских сценариев.

[Package до исправления](../portal/component-lab/pilots/settings-parametric/verification/v36-choice-before.png) · [после исправления](../portal/component-lab/pilots/settings-parametric/verification/v36-choice-after.png).

Первый общий browser-прогон использовал прежний dist и не считается доказательством исправления. После пересборки source-integrity обнаружила изменение package.json со списком проверок; этот незавершённый прогон также не считается итоговым. Исходники затем нормализованы и заморожены, выполнена новая сборка для итоговой последовательности.

## Ограничения

Геометрия и доступные имена проверены в Chromium, а не сертифицированы всеми браузерами и screen readers. RTL-матрица проверяет первую строку, но не заявляет полной поддержки зеркалирования Toggle и всей навигации. Исходный package fixture использует browser font fallback; итоговая Lab-галерея проверяет реальную типографику приложения. Figma-паритет, OS/AT-приёмка, общая плотность сложных редакторов и оставшееся покрытие иконками остаются открытыми. Исправление этой раскладки не означает готовности всей дизайн-системы.

## Итоговый прогон и публикация

Окончательная последовательность `npm run verify --prefix portal/component-lab/pilots/settings-parametric` завершилась с exitCode 0: choice48, nontext96, text144, visual24, feedback8, Lab55, workspace21, controls12, все восемь reference-приложений и их model/preview/renderer suites. Сборка и установленный пакет совпадают по всем 145 dist-файлам; 144 проверяемых build artifacts в package verifier не включают отдельный manifest.

- GitHub implementation: `69775bde929e530a5917252106a7326e9b8356a4` в прежнем PR #4.
- Site source: `8a1bb8536cdbabe1f7154211497f440570dc54d1`; version36, deployment `appgdep_6adce533f3648191bf7096861c3fdd92` succeeded.
- Прежний URL https://seda-ai-pilot.kenymook.chatgpt.site/ остаётся приватным: custom/revision1, один owner, ноль visitors/groups.
- Production: повторены 48 сочетаний общих параметров, maximum first-line delta 0 px, 0 JS errors. Все 755 source hashes совпали с локальными исходниками.
- Архив: 7,564,631 bytes, SHA256 `39beb2bf07a12999daca9773d02fe35f63142c867453edd4cd508956bde385cb`.

[Release evidence и hashes raw-результатов](../portal/component-lab/pilots/settings-parametric/verification/choice-v36-release.json). Production captures: [Light](../portal/component-lab/pilots/settings-parametric/verification/v36-choices-Light.png), [Dark](../portal/component-lab/pilots/settings-parametric/verification/v36-choices-Dark.png). Это доказательство конкретного исправления; общая цель зрелой библиотеки остаётся открытой.
