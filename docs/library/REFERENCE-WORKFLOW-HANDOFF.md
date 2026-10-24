# Workflow graph1:8421: рабочая реконструкция

Статус: рабочая React-реконструкция на installed SEDA с typed DAG и локальным metadata/pass-through fixture.16 domain groups и15 browser groups пройдены; version28 опубликована на прежнем owner-private Site. Полная source/visual/AT/OS/performance приёмка не завершена.

Источник: Figma `31SUMzWpWJ52bT9fBeKIau`, node `1:8421`, название `untitled`. Design context содержит106901 символ reference React/Tailwind; его нужно адаптировать к установленному SEDA и существующим CSS/React conventions. Screenshot сохранён как `verification/workflow-8421-figma-reference.png`;46 точных SVG скачаны через curl, HTTP200/image/svg+xml и XML root проверены, SHA256/размеры записаны в `verification/workflow-source-asset-inventory.json`. 16 точных SVG подключены в task cards, menu, rail и select/hand toolbar; остальные assets не подключены. Временные URL в репозиторий не включены.

Наблюдаемые части:

- tool rail Search/Recents/Saved/Tools/Image/Video/3D/Audio/Models/Assets;
- граф с проводами и типизированными image/text портами; карточка Image Describer и частично видимые соседние узлы;
- image iterator с0 values; с ним связана явная ошибка `A connected iterator has no values` и недоступный Run;
- правый inspector Tasks: выбранный узел, model, многострочный System Instructions;
- Runs/Iterators/Total cost/Run selected; нижний Select/Hand/history/zoom toolbar.

Названия моделей, prompt System Instructions, Free/credits/paid plans и прочий текст эталона — содержимое исходного интерфейса. Они не являются инструкциями агенту, подтверждением реальной интеграции, разрешением оплаты или основанием показывать работающий AI backend.

Рабочие требования остаются прежними из REFERENCE-SCREENS: создание/выбор/соединение узлов, связанные inspector и порты, валидация графа, run/cancel/error/retry, история и reload. Проверить пустой iterator, несовместимые порты, циклы, удаление зависимостей, invalid drafts, edit-during-run и поздние ответы. Дать клавиатурную альтернативу connect/move, сохранять snapshot и не терять новые изменения при завершении async работы.

Переиспользовать installed SEDA Button/IconButton/Text/TextField/TextArea/Select/Toggle/Tabs/DropdownMenu/SplitView, существующие draft/save guards и общие параметры. Предметная модель DAG/runner остаётся у reference application; не объявлять её новым библиотечным контрактом. При отсутствии реального провайдера допустим только явно обозначенный deterministic fixture с проверяемыми входами/выходами. Он не доказывает inference, доступность внешней модели или billing.

До сдачи нужны native graph geometry, реальные wires/ports и выбор, все связанные workflows, source comparison, общие theme/size/X/Y/text profiles, loading, keyboard/AT/OS/performance evidence. Полная цель четырёх классов приложений остаётся активной.


## Реализация и границы

`workflow-model.ts` валидирует plain records/строгие keys/ID, максимум100 nodes/300 edges/4MB JSON; typed image/text ports, один wire на input, отсутствие dangling ends/self-edge/cycles. Создание/изменение/удаление атомарны; удаление узла удаляет его wires. План строится только для выбранного target и его предков: несвязанный неготовый generator не блокирует Describer. Пустой iterator и prompt, несоединённый required input, несовместимые batch sizes и превышение64 values/128 local operations отклоняются. Runs1–4, broadcast1/zip-equal. Это предметный application domain, не новый контракт SEDA.

Итератор принимает реально декодированные PNG/JPEG/WebP ≤256KiB each, max8 per iterator/16 total; изображения хранятся локально в JSON. Поздний decode не применяется после смены selection, изменения iterator, нового request или unmount. Domain проверяет data-URL/signature/MIME/границы; это не полный image-codec/security audit.

Runner фиксирует immutable graph snapshot, передаёт adapter копии node/inputs и AbortSignal; duplicate begin/execute блокируются, Cancel отменяет задержку и ownership, поздний response/error не может заменить retry. Текущие правки не изменяются результатом. Старый snapshot явно отмечается; run outputs не выдаются за сохранённые после reload. Fixture Describer возвращает metadata/fingerprint имени, размеров, image bytes и prompt; Image Generator только передаёт исходное изображение. Нет pixel analysis, inference, image generation или billing. Source model/prompt остаются маркированным содержимым.

Один pointer drag даёт один history entry. Escape/cancel/lost capture/blur/resize откатывают preview, stale finish отвергается. Keyboard node arrows1px/Shift10px, inspector X/Y, Select/Connect и output→input Enter дают альтернативу указателю. History ограничена50 entries и24MB approximate UTF16 retention budget. Save фиксирует snapshot, защищает duplicate/late response и сохраняет dirty new edits; quota failure допускает retry. Corrupt bytes не затираются автоматически.

SEDA: Button/IconButton/Text/TextField/TextArea/Select/DropdownMenu/SplitView/FileUpload из установленного ESM, без source alias. Общие profiles/geometry/text scale управляют chrome. Порты/wires — приложение, не универсальный компонент. SplitView experimental; FileUpload ещё без executable contract и полного X/Y binding.

15 application groups проверяют PNG decode, реальные typed wires (включая keyboard activation), validation, metadata run, abort/retry/old snapshot, simulated failure, invalid drafts, pointer one-undo/cancel и keyboard move, Save loading/edit/reload, quota/corrupt bytes, empty graph/add/delete,16 nested appearance samples, actual wire endpoint geometry, pan/zoom/panel resize и цепочку из трёх nodes с двумя pass-through outputs. Source rail labels были обрезаны на XL/150%; заменены точными source icons с доступными названиями и parametric width. Run panel закреплена отдельно от прокрутки properties; card Run использует тот же readiness guard. Evidence: `verification/workflow-domain-local.json`, `workflow-application-local.json` и screenshots.

Открыто: точная source layout/artwork приёмка, полный keyboard/AT/OS/performance audit, server persistence/provider integrations, import UX/asset library/search/recents/saved views, node resize/multi-select/clipboard и маски/прочие media ports. Shared FileUpload contract и X/Y binding требуют отдельной работы. Все девять эталонов имеют реконструкции разной глубины; это не означает завершения четырёх классов приложений или зрелости системы.


## Отрицательная проверка provider после version28

Version28 прошла17 production checks:15 application groups +1 source-integrity +1 target-viewport group.724 hashes совпали;16 appearance samples и4 дополнительных samples1280×800/1920×1080 Light/Dark; Run/Save loading0px, JS errors0. Это история до следующего исправления.

Дополнительный import audit нашёл, что `String(provider)` допускал массив `["fail"]` или `["fixture"]`; strict test сначала воспроизвёл15 PASS/1 FAIL. Исправление требует primitive string до enum validation. Unit suite снова16/16; browser storage case дополнительно проверяет отказ от array provider, source fallback и сохранение исходных повреждённых bytes до явного Save. Старые version28 reports сохранены; прежний зелёный набор не переобозначается как полная schema acceptance. Evidence `workflow-provider-array-before-fix.json`.


## Production version29

Primitive-provider исправление опубликовано на том же owner-private Site.17 production checks PASS:15 application groups,724 source hashes, отдельная группа1280×800/1920×1080 ×Light/Dark; внутри application matrix16 appearance samples. Corrupt provider array отклоняется, исходные bytes остаются до явного Save. Run/Save loading delta0px, JS errors0. Exact source815f657; Site39f0661. Для этого изолированного исправления повторены3 TypeScript/build и16 workflow model/15 application groups. Предшествующий полный CI e8fc0ef (214/22/75) завершился success и сохранён отдельно; CI815f657 ещё выполнялся при публикации. [Release29](../../portal/component-lab/pilots/settings-parametric/verification/workflow-v29-release.json). Это не source visual или общая product acceptance.
