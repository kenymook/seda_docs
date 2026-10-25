# NotificationCenter: реальные локальные события Files

Статус: experimental реализация опубликована в приватной version50. Общая цель зрелости SEDA остаётся открытой.

Вместо показа последнего toast-сообщения Files использует общий `NotificationCenter` установленного `@seda-ai/ui`. Отдельная неблокирующая страница показывает до200 событий успешных операций с названиями изменённых файлов. Все/Упоминания/Непрочитанные — общие Tabs; реальных внешних упоминаний нет. Прочитанные записи остаются в истории, unread count выводится из snapshot. Состояния loading/error имеют понятный текст и настоящую retry Button.

UI не выполняет транспорт и не сохраняет бизнес-данные. Все read/mark-all/retry intents принадлежат приложению. Отдельный storage key журнала позволяет восстановить его запись или очистить повреждённую историю, не сбрасывая файлы. Ошибка журнала не выдаётся за ошибку уже сохранённой операции с файлами. Pending history сохраняется в памяти и повторяется явно; это не серверный durable audit log и не multi-tab synchronization.

Компонент использует существующие Notification Center token roles, Text/Button/Badge/Icon/Tabs и общий provider. Размеры иконок следуют параметрам контролов, длинный текст переносится. Geometry gap явно описан в specs/overlays-layout/notification-center.md; новых tokens нет. Визуальный проход убрал анимацию цветов действий между loading/disabled/ready, чтобы не оставалось кратковременного тусклого label.

## Проверка

На зафиксированном runtime `daafd09fc2ba5c16dd19776b60f3f340206da3d7`:59/59 installed-package групп с React18.3.1/19.2.7,123/123 contract tests, TypeScript pilot/references PASS. Все44 verifier scripts завершились с exit0:21 Lab и23 references. В новый package consumer входят96 выбранных сочетаний ширины/темы/размера/placement/data-state на каждой React-версии,18 invalid models, SSR/Strict hydration, фильтры/read ownership, retry duplicate guard, keyboard/RTL, focus repair/external focus, reduced motion и text contrast. Отдельный model test проверяет10 невалидных форматов, ограничение200 и неизменность исходного snapshot.

Реальный Files прошёл24 selected viewport/theme/profile cases и9 исходных workflows. Создание файла двойным submit даёт одну запись; reload сохраняет историю и read state. При заблокированном journal storage файл сохраняется, UI сообщает о pending history и реальный retry завершает запись. Повреждённая история оставляет файлы доступными. Это отдельные scopes, их количества не складываются в сертификат зрелости.

Первый независимый Linux CI остановился в проверке после программного `setState`: DOM ещё показывал all-read вместо ожидаемого empty. Assertions не удалялись и не ослаблялись: verifier-only commit `a50bbd9b0f635822141404ebe1bc3bd77dda72f6` ожидает committed React snapshot перед проверкой empty, retry/loading и внешнего фокуса. Этот verifier не входит в runtime sources; опубликованный компонент и532 артефакта не менялись. Первый CI отказ сохранён как ограниченная диагностика со ссылкой на полный log. Полный повтор installed-package завершился59/59 (React18/19), [новый Linux CI](https://github.com/kenymook/seda_docs/actions/runs/40199246402) ещё выполняется; его общий success заранее не заявляется.

## Публикация и визуальная проверка

Опубликована version50 на прежнем [приватном сайте](https://seda-ai-pilot.kenymook.chatgpt.site/references/recents.html?section=notifications). Deployment `appgdep_6ade076a3c988191ba7184b77ee71f06` succeeded. Site source `f992471a3ae073a7fb492dd41e4cb33c4a629241`, runtime GitHub `daafd09fc2ba5c16dd19776b60f3f340206da3d7`. Access custom/revision1: один owner, групп/внешних посетителей0.

Совпали878 source hashes и532 artifact hashes локальной/Site сборок;667 tracked runtime файлов сверены с canonical Git blobs,211 записей установленного пакета. Положительно подтверждено включение установленного NotificationCenter в Files, sourceAlias=false. Local gzip7,967,352 bytes; SHA256 `c0e480e75cd18a35a1d7781466912f5cd0aad645f35384e7fd872e8f8a2ea674`. Нормализованный Sites tar имеет отдельный storage hash в release.json.

Свежий production browser проверил байты всех532 артефактов и повторил notifications24/inspectors160/painted glyph95; JavaScript errors0. NotificationCenter gallery и реальная страница Files просмотрены в обеих темах, включая production. Типографика, иконки и controls используют общие параметры; длинные сообщения переносятся без переполнения. Screenshot baselines не менялись.

[Release](../portal/component-lab/pilots/settings-parametric/verification/notifications/release.json), [production](../portal/component-lab/pilots/settings-parametric/verification/notifications/production-results.json), [proof и снимки](../portal/component-lab/pilots/settings-parametric/verification/notifications/). Предыдущий v49 evidence head a3a8411 получил [CI success во всех4 группах](https://github.com/kenymook/seda_docs/actions/runs/40196479978).

Открыты: завершение повторного Linux CI, fresh Figma6977:2860 (service quota), screen readers/target OS/Firefox/WebKit, surface instance contract и самостоятельный overlay host. Placement overlay обозначает содержимое поверхности; host-owned non-modal position/dismiss/focus return не симулируется компонентом.30 entry modules/37 runtime exports не являются30 готовыми production-компонентами.
