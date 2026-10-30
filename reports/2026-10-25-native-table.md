# Публичный Table и проверка поставки SEDA — 25.10.2026

В Projects и Team локальные table-разметки заменены общим generic Table из @seda-ai/ui. Это шаг к библиотеке рабочих приложений; вся дизайн-система не объявляется готовой.

## Реализация и визуальные правила

Native table со scope=col/row, controlled sorting, выбором строк, раскрытием деталей, pagination и loading/empty/error/retry. Table использует существующие Table color tokens, typography общего compiler и реальные Checkbox/Button/Icon; форматирование ячеек и данные принадлежат приложению. Registry по-прежнему содержит 11 control contracts: новый Table не выдан за двенадцатый сертифицированный instance contract.

Общие X/Y/scale влияют на padding/font/minimum row height. Density compact/medium/comfortable имеет floors32/40/48 и gutters0/4/8; строки растут по содержимому. Геометрия experimental: отдельные Table geometry tokens ещё не введены. В обеих темах устранены прежние внешние th/td overrides: body cells не имеют случайных фонов, font/padding одинаковы. Имена колонок читаются как обычные подписи, сортировка — настоящий button с aria-sort; прежние жёсткие uppercase подписи удалены.

Визуальный stress-review выявил побуквенный перенос из-за overflow-wrap:anywhere. Исправлено min-content поведение: перенос по словам, широкие данные доступны через внутренний native scroll. Добавлена проверка минимальной ширины видимых слов в заголовках и достижимости последней колонки. Это реальная корректировка после просмотра таблиц ниже первого viewport, а не смена screenshot baseline. Старый дефект сохранён в evidence как rejected, не как принятый результат.

Selected/off-page/disabled keys сохраняются корректно; сортировка и преобразования data принадлежат владельцу. Refresh сохраняет supplied rows; state feedback использует последнюю высоту body как minimum и измеренные ширины колонок. Длинный feedback может увеличить высоту. Error/empty сбрасывают внутреннюю прокрутку к сообщению. Live loading status остаётся смонтированным вне aria-busy table. Пагинация сохраняет фокус на достигшей границы кнопке, aria-disabled и guards блокируют недоступный переход. Стабильные keys сохраняют focus при reorder; исчезновение сфокусированной строки возвращает его в именованный scroll region; внешний поиск не перехватывается.

## Настоящая поставка пакета

Восемь references ранее уже использовали установленный пакет; корневой Lab всё ещё имел source alias packages/seda-ui/src/index.ts. Теперь и он собирается из node_modules/@seda-ai/ui/dist/index.js. Build останавливается при stale manifest или source alias. Metadata получает только модули с положительным bytesInOutput: Table/Table.js должен присутствовать. Это устраняет прежний разрыв между «реальные компоненты в исходниках» и доказанной поставкой установленного пакета.

## Проверки

Контракты: npm --prefix packages/seda-contracts test —123/123, exit0. Pilot/references TypeScript —PASS. Package verifier штатно запущен через npm run verify:package:47/47 groups, exit0, реальные installed tarballs с React18.3.1 и19.2.7. Table имеет48 selected samples на каждой React-версии:2темы ×4размера ×2масштаба (100/150) ×3density. Отдельно проверены10 runtime rejects и положительные/отрицательные TypeScript fixtures, SSR/Strict hydration, selection/sort/disclosure/пагинация, retry, самостоятельные instances, narrow scroll/sticky/RTL, status и focus recovery. В проверенном refresh measured body delta0px; в refresh/error/empty max column boundary delta0px. Высота error/empty уложилась в допуск1px. Это не обещание нулевого изменения высоты для произвольного feedback.

Projects/Team:60 selected samples =2views ×3ширины (1543/1024/390) ×2темы ×5сочетаний size/scale/X/Y. Проверяются все body cells, compiler-derived font/padding/row floor, читабельные слова header, достижимость последней колонки и отсутствие root overflow. Сортировка связана с действующими фильтрами и selection, состояние двух views независимо. Это выбранные сочетания, не все перестановки параметров.

Весь npm run verify завершился с exit0:38 последовательных скриптов на финальном artifact. Включены Table60, inspector160, Files48, Composer48, application text96, tooltip64, modal32, Lab55/55, Workspace21/21, controls12/12 и editor/model/rendering сценарии до Workflow15/15. Это runner groups, сценарии и DOM-выборки разного уровня, их нельзя складывать в общий сертификат. [Полный лог](../portal/component-lab/pilots/settings-parametric/verification/table-v44/full-verify-final.log). Матрицы не сертифицируют все states/OS.

Просмотрены реальные Projects/Team Light/Dark и stress-таблицы с началом/концом горизонтальной прокрутки; package loaded/loading/error/empty/RTL frames. Сравнение с v43 сохранено. При XL150/X24/Y12 данные требуют локальной прокрутки — теперь без распада слов по буквам. Независимой дизайнерской или AT/Figma приёмки этим не заявляется.

Первый прямой запуск package verifier был отклонён его npm guard; затем использован штатный npm script. Отдельная focus-проверка падала из-за body focus при native disable; runtime исправлен. Старые проверки tbody/td и списка композиционных adapters обновлены под native Table scope=row, а не отключены. Остановка сборки из-за дублированной переменной metadata ранее исправлена; финальный build требует installedPackage=true/sourceAlias=false. Логи и отвергнутый render сохранены. Screenshot baselines не обновлялись.

## Оставшиеся ограничения

Table experimental: нет virtualization, grid arrow navigation, inline editing, resize/pin/reorder колонок, multi-sort и автоматической cards-mode. Native table не переименован в ARIA grid. Общая i18n, Firefox/WebKit, целевые screen readers и native desktop shell ещё требуют проверки. Fresh Figma context и screenshot node7318:412 в этом проходе отклонены лимитом Starter plan; текущие основания — repository spec, токены и реальные renders, не новая Figma fidelity-приёмка.

Backend, серверная pagination/sort, request ownership и permissions принадлежат приложению. Pilot остаётся локальной демонстрацией; сервер или приглашения по email не имитируются как настоящая интеграция. Public Card/Avatar/advanced DataGrid и полная приёмка reference editors ещё открыты. 23 component entry modules не означают 23 из52 полностью готовых компонентов: инвентари не соответствуют один к одному.

Примеры: [Projects Light](../portal/component-lab/pilots/settings-parametric/verification/table-v44/local-projects-light-1543-m.png), [Team Dark](../portal/component-lab/pilots/settings-parametric/verification/table-v44/local-members-dark-1543-m.png), [stress start](../portal/component-lab/pilots/settings-parametric/verification/table-v44/stress-projects-light-table-stress.png), [stress end](../portal/component-lab/pilots/settings-parametric/verification/table-v44/stress-projects-light-table-stress-end.png). [Package47](../portal/component-lab/pilots/settings-parametric/verification/table-v44/package-results.json), [Table React18](../portal/component-lab/pilots/settings-parametric/verification/table-v44/table-react-18.3.1.json), [Table React19](../portal/component-lab/pilots/settings-parametric/verification/table-v44/table-react-19.2.7.json), [визуальная проверка](../portal/component-lab/pilots/settings-parametric/verification/table-v44/visual-review.json).

## Публикация

Version44 опубликована по прежнему приватному https://seda-ai-pilot.kenymook.chatgpt.site/. Deployment appgdep_6add676323988191be6857bb9fffd194 — succeeded. Runtime GitHub commit49abcbda9c06a491f159516b3c01bcda24980e31; Site source b6c67b49e1d685fb88ce739f7907cef1ccf3c156. Archive7867865bytes, SHA256 5482e87c2106c8d90f15323b812f89f4ab6cce7d977032ba42f7769ccf516493. Перед публикацией 805 source hashes и532 artifact hashes Site-сборки полностью совпали с локальным проверенным artifact. Production proof повторно подтвердил805/532, Table60 иrhythm16, errors0; main installedPackage=true/sourceAlias=false. Свежие contexts и просмотр Live Projects/Team Light/Dark завершены. ACL custom/revision1, один owner, external visitors0/groups0 — сохранён. [Production results](../portal/component-lab/pilots/settings-parametric/verification/table-v44/production-results.json).
