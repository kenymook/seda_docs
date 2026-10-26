# Chat — рабочий reference screen 1:3894

Источник: [Figma Ruslan, «Проектирование дизайн системы»](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-3894). Route: `/references/chat.html` (на Sites также `/references/chat`). Экран реализован на установленном `@seda-ai/ui`; полная визуальная и продуктовая приёмка **не завершена**. AI/backend, voice, cloud browser и субагенты не подключены.

## Реализация и источник

Получен design context восьми sublayers, сохранены 42 исходных assets с SHA-256 manifest, 24 заголовка threads, пять исторических сообщений, таблица и десять пронумерованных шагов. Semibold и inline code восстановлены из исходных JSX spans в отдельный безопасный text-run inventory; исходный JSX не исполняется. Тексты переписки — содержимое эталона, а не инструкции агенту. Screenshot не используется как UI.

Используются public SedaProvider, Button, IconButton, TextField, TextArea, Select, FileUpload, Link, DropdownMenu и SplitView. Composer, thread navigation, message actions, native Dialog, rich-content renderer и Activity — application compositions, не новые сертифицированные контракты. Предметные модель и transport не включены в библиотеку.

Три области имеют собственную прокрутку: threads, conversation и activity. Сохранены rail52/navigation238/header52 и ширина message column до768. Панель Activity изменяется мышью/клавиатурой и скрывается; навигация сворачивается. При ширине меньше960 предусмотрен minimum desktop workspace, а не мобильный landing. Проверяемые desktop viewports:1280×800,1440×1288,1920×800.

## Работающие сценарии

- Threads и URL/Back/Forward, поиск по заголовкам/сообщениям, rename, pin, trash/restore, clear, JSON export и локальная ссылка.
- Собственный draft и до трёх .txt/.md файлов по256КБ на thread; файл читается локально и попадает в snapshot запроса. Остальные типы отклоняются явно. Нет серверной загрузки.
- Enter/Shift+Enter, composition guard, streaming/stop/retry с сохранением предыдущих ответов; одновременные запросы в разных threads; pending повтор не отправляется.
- Редактирование создаёт отдельную ветку с уникальными ID и сохраняет исходную историю. Clear исходного чата отсоединяет provenance ссылки веток и сохраняет их содержимое.
- LocalStorage autosave, quota failure с сохранённым draft и Retry, явное восстановление повреждённой модели. Reload переводит незавершённый ответ в stopped. Scroll position сохраняется отдельно; проверка учитывает округление ±1 CSSpx, без требования идентичной строки при смене шрифта.
- Selected navigation surface привязан к существующей Sidebar branch с provenance. Раздельные базовые X отступы Button и поля сохранены. Параметры Light/Dark,S/M/L/XL,X/Y передаются через общий compiler/bindings к контрактным контролам. Draft и запрос остаются в исходном thread при смене параметров/панелей.

Transport явно обозначен как локальный образец. Режимы sample/error/manual позволяют управляемо воспроизвести продолжение, остановку и ошибку. Новые ответы не выдаются за AI inference. Исторические artifact карточки открывают сведения о своём происхождении; исходные image/zip не выдаются за вновь созданные файлы. Настоящий результат SEDA Lab открывается по ссылке.

## Найденные дефекты и исправления

1. Source list extraction отделял номера от текста. Восстановлен semantic ol из десяти items; source/sourceId сохранены.
2. Public Link игнорировал variant, включая subtle: sidebar был синим. Исправлены общие component-token mappings, hover/pressed/visited/disabled/focus и strong. [Link review](LINK-REVIEW.md); без локальной перекраски экземпляров.
3. Stop → Send переиспользовал DOM button, менял type на submit до завершения click default action и отправлял следующий draft. Разные keys и preventDefault для Stop устранили лишнюю отправку; regression проверяет и request count, и сохранение draft.
4. Первичная layout effect до чтения LocalStorage прокручивала восстановленный чат в конец. Scroll восстановление и обработчик ограничены ready state; сохранённая позиция больше не заменяется стартовой.
5. Clear исходного thread ломал валидацию branchOf у независимых веток. При clear отсоединяются только ссылки происхождения; copied messages/draft остаются.

## Визуальная оценка и открытые ограничения

Source screenshot экспортирован с overflow: для будущего overlay/diff нужно ограничить эталон областью1440×1288. Overlay и визуальная приёмка ещё не пройдены. Локальные actual screenshots снимаются при том же viewport после загрузки fonts. Просмотрены Dark и Light; автоматические geometry checks дополняют, но не заменяют визуальный просмотр.

Состав областей и источник текстов перенесены. **Полное визуальное соответствие не принято:** SF Pro заменён Inter; canonical SEDA surfaces, borders, semibold control labels и геометрия отличаются от source ChatGPT; Composer использует общий TextArea frame вместо частного pill skin; исторический excerpt маркирован и имеет собственную границу; добавлены честные fixture/status/validation сообщения и команды. Нет согласованного разрешения считать эти отличия финальными. Pixel similarity percentage не заявляется.

Проверка composition выполняется синтетическими browser events; реальная OS IME, screen reader, native desktop shell, performance большой истории, bidi/i18n и cross-browser не приняты. История рендерит последние80 сообщений и позволяет загрузить предыдущие, но это не доказанная virtualized production history. FileUpload остаётся legacy public component без executable contract и без полного X/Y binding; Link тоже пока без executable contract. Максимумы модели и LocalStorage принадлежат reference app. Cross-tab conflict resolution и серверное хранение отсутствуют.

## Проверки

Воспроизводимая команда: `npm --prefix portal/component-lab/pilots/settings-parametric run verify:chat`. Четыре группы модели проверяют source/asset integrity, валидацию/recovery/ветки, некооперативный transport с поздними chunks/errors и атомарный отказ commit. Двенадцать browser groups проверяют состав, navigation/drafts/reload, composer, background/error, attachments, branches, profile matrix, scroll/reload, storage recovery и JS errors. 24 profile samples являются вложенной матрицей, а не24 отдельными пользовательскими сценариями. Локально пройдено4/4 model и12/12 browser groups; [результаты](../../portal/component-lab/pilots/settings-parametric/verification/chat-local-results.json), [Dark](../../portal/component-lab/pilots/settings-parametric/verification/chat-dark-1440.png), [Light](../../portal/component-lab/pilots/settings-parametric/verification/chat-light-1440.png). Дополнительно проверены search/rename/pin/trash/restore/share/export и история180 messages с загрузкой по80 и сохранением anchor. Установленный public package —23/23 groups на React18/19; контракты115/115; три TypeScript проекта и build PASS. Существующие113 browser groups и5 Building model groups прошли. Общий браузерный итог текущего checkout125 groups, модельные группы9 учитываются отдельно. Publication evidence добавляется после проверки production.


## Публикация18 и production proof

На прежнем [owner-private сайте опубликован Chat](https://seda-ai-pilot.kenymook.chatgpt.site/references/chat). Deployment `appgdep_6adbb7da68008191b17a1109b3d8d8a0` succeeded; Sites source `7816989772b4c336ff19ac268b18d81fb2ecfe92`, GitHub functional commit `ff02b5e8db3317cc591f2251e5cf21582ff7e0bb`. Тот же URL и access revision1: один owner, visitors0/groups0.

Publication checkout повторил UI/pilot/reference TypeScript, manifest parity, build,125 browser groups и9 domain-model groups: [aggregate](../../portal/component-lab/pilots/settings-parametric/verification/chat-v18-publication-checks.json). Package23 и contracts115 проверены отдельно в основном checkout; их нельзя складывать с browser workflow counts.

[Production proof](../../portal/component-lab/pilots/settings-parametric/verification/chat-live-v18.json): HTTP200,437 source hashes совпали, installed TextArea/Button/Select/Link/Menu/SplitView подтверждены build metadata. Stop не отправляет следующий draft; partial/retry, .md snapshot, Light/Dark×S/M/L/XL,X14/Y6, keyboard panel resize, interrupted reload и draft прошли. TextArea heights36/44/52/60px, поле X24px, Button X22/26/30/34px, IconButton квадратный, overflow0, JS errors0. Это восемь вложенных production profile samples.

Просмотрены [production Dark](../../portal/component-lab/pilots/settings-parametric/verification/chat-live-v18-dark.png) и [production Light](../../portal/component-lab/pilots/settings-parametric/verification/chat-live-v18-light.png): selected navigation видна; длинные artifact names переносятся; composer имеет один TextArea frame. Source palette/type/Composer отличия остаются открытыми.

## Отдельная проверка CI

Первый remote run40012527962 для functional ff02b5e не прошёл: package23/contracts115 и первые97 browser groups прошли, затем Building test не нашёл Parent document после reload; Chat в этом run не запускался. Локальный и publication Building16 прошли. Тест уточнён: перед вводом названия ждёт новый заголовок и его фактический focus, отдельно подтверждает parent/child IDs, сохранённое имя и parentId до reload. Assertions не ослаблены, timeout не увеличен. Повторный remote run проверяется отдельно; прежняя неудача не скрывается.

Повторный [CI40013689889](https://github.com/kenymook/seda_docs/actions/runs/40013689889) для commit7046710ffdd7771a0fe7842020ead13a7ff979f9 **completed/success**. Job120620209128 logs подтвердили package23/contracts115/browser125/domain-model9, TypeScript/build. Это отдельное подтверждение полного текущего прогона на Ubuntu, включая Chat. Последующее добавление отчётов/handoff не объявляется проверенным этим run.

## Проверка недопустимого вложения на разных браузерах

Поздний CI-прогон `40328441588` выявил зависимость теста от нативного `accept` у файлового поля: программная установка `.png` на одном Chromium не вызвала приложение и не показала ожидаемую ошибку. Следующие тесты каскадно упали, потому что диалог остался открыт. Тест теперь дожидается завершения чтения допустимого `.md` и передаёт недопустимый `.png` через поддерживаемое drag-and-drop событие, которое действительно достигает валидации приложения. Проверка отсутствия добавленного вложения и видимой ошибки сохранена; локально 4/4 model и 12/12 browser groups PASS. Новый remote CI проверяется отдельно.
