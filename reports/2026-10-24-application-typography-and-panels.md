# Типографика и адаптация рабочих панелей SEDA

## Что изменилось

В «Файлах», редакторе документов и чате масштаб был зафиксирован на100%; соответствующего поля настройки не было. У Sandbox масштаб существовал, но заголовки секций, подсказки и статус оставались фиксированными10–12px. Снимки «до» получены из предыдущей сборки: для первых трёх приложений scale150 был записан в preferences и игнорировался; у Sandbox использовался уже поддержанный scale. Это не сравнение двух версий интерфейса с одинаковым доступным UI selector.

Теперь общий Preferences.scale хранит80–150%, старые настройки получают100%, нечисловые/неконечные и выходящие за диапазон значения отклоняются. Sandbox использует ту же валидацию, сохраняя свой исходный size=s. Новый ReferenceTextScale — композиция настоящего SEDA Select, не отдельный сертифицированный компонент. Значение одновременно поступает в SedaProvider.textScale и существующие derive/createWorkspaceBindings для контролов. CSS zoom или масштабирование всего приложения не используются.

Навигация, подписи файлов, заголовки и подсказки инспектора, статусы, сообщения/таблицы чата используют существующий Text и роли foundation. Удалены мешающие фиксированные font rules. Inline emphasis и code из исходного текста чата сохранены; его чтение приведено к body/large, включая16/24px при100% вместо прежней локальной16/26px. Размеры авторского документа и сцены не меняются вместе с панелями.

| Область | Роль | 100% | 150% |
| --- | --- | ---: | ---: |
| Название файла / заголовок коллекции | label/default | 14px | 21px |
| Metadata файлов и статус документов | caption/default | 12px | 18px |
| Разделы навигации/активности чата | body/default | 14px | 21px |
| Чтение сообщений | body/large | 16px | 24px |
| Секции инспектора Sandbox | label/small | 12px | 18px |
| Вторичный статус Sandbox | caption/tiny | 10px | 15px |
| Авторский заголовок документа | document model | 40px | 40px |

При80% применяются существующие минимумы конкретных ролей, поэтому уменьшение не всегда линейно. Привязанные к действиям иконки растут вместе с контролами; standalone glyphs заголовка чата и карточек файлов используют общую геометрию. More, close и переход к последнему сообщению используют оригинальные SEDA Icon. Identity marks, thumbnails и авторское содержимое не превращены в управляющие иконки.

## Дефекты, найденные на больших настройках

- **Button fullWidth:** width100% не помогал из-за min-width:max-content. Теперь ширина действительно ограничена parent; однострочный label получает ellipsis, icon slots сохраняют размеры. Полное имя остаётся доступным, приложение задаёт native title. DropdownMenu использует этот публичный recipe для текстового trigger. Новые props и token names не добавлены. Многострочный Button по-прежнему требует отдельной геометрии.
- **Tabs:** DOM focus мог находиться на Prototype, когда часть текста оставалась вне видимой области. Компонент прокручивает только собственный tablist при focus, keyboard и resize; для вкладки шире viewport сохраняется полный label и прокрутка с логического начала. Проверены LTR/RTL и document scrollX0.
- **Чат:** ширина rail/navigation учитывает геометрию контролов, ChatGPT не разбивается посреди слова. Длинные действия используют настоящие iconLeft slots и ограниченные подписи; label/value в активности переносятся целыми блоками. Jump-to-latest — IconButton внутри области истории, который не перекрывает composer.
- **Sandbox:** Zoom перенесён из absolute overlay над вкладками в панель действий инспектора. Колонки полей выбираются по минимальной ширине из8 размеров шрифта и двух inset; при больших параметрах получается одна читаемая колонка. Заголовок Pages не разбивается на отдельные буквы. Toolbar принадлежит canvas stage, а не всему viewport; команды раскрываются прокруткой при Tab, сохраняя authored scene.
- **Диалоги:** собственная композиция reference-dialog-content задаёт stack gap16px для текстов и форм. Внутренние размеры полей/кнопок не заменены локальными overrides.

Это адаптация существующих рабочих экранов, а не генерация нового сайта. Полная визуальная fidelity-приёмка исходных Figma frames не заявляется.

## Проверки и их область

Implementation commit: `93174f4419dc674fd231715ae16446d42f593a08`.

- Build и3 TypeScript-проекта PASS. Contract/foundation tests122/122 PASS; остаётся11 executable control contracts и21 component exports.
- Installed tarball43/43 групп React18.3.1/19.2.7, без source/React aliases. Raw: packages/seda-ui/.diagnostics-package/2026-10-24T20-12-58-222Z/results.json. Добавлены constrained actions с длинными латинскими/кириллическими именами, реальным menu focus, сохранением геометрии и центром spinner; Tabs проверяет видимость focus в LTR/RTL при900/390px.
- verify-application-text:96 сочетаний4 routes ×2 themes ×4 densities ×3 scales. Реальные font-size/line-height/weight/letter-spacing сопоставляются с действующим compiler, соседние glyphs — с общей геометрией. Проверяются legacy migration, invalid storage boundaries, reload и неизменность данных файлов/чата/документа/сцены. Число96 относится к DOM-матрице, не к96 независимым пользовательским workflow.
- verify-adaptive-panels:6 сочетаний Chat/Sandbox при960/1280/1440px, Light/XL/150%/X24/Y12. Проверяются границы действий и dock, целый бренд/значения, отсутствие пересечения jump/composer, видимость Prototype при keyboard focus и одна колонка полей.
- Полная pilot sequence завершилась с exitCode0, включая все8 reference applications и model/preview/renderer suites. После последнего локального переноса dock и исправления Pages выполнены финальная сборка и focused application-text96/adaptive6/icon-workspace96/reference-modal32/Sandbox model20/browser20 — PASS. Остальной runtime и публичный пакет после широкой регрессии не менялись.
- Loading-матрица Lab повторена:288 сочетаний, максимальные дельты ширины и высоты0px. Это вложенные измерения, а не288 пользовательских сценариев.
- Первое прохождение Chat остановилось на устаревшем требовании однострочной высоты TextArea: при более узком composer черновик корректно занял две строки. Проверка заменена независимым DOM mirror, определяющим число строк и ожидаемую высоту base+(rows−1)×line-height. Проверки Select/Button, padding, draft и active request сохранены; финальный Chat прошёл. Screenshot baselines для сокрытия ошибок не обновлялись.

## Границы результата

Типографика и адаптация этих композиций стали согласованнее, но это не приёмка всей библиотеки. Открыты остальные legacy recipes, полное покрытие и оптика glyphs, Tooltip/Popover и другие отсутствующие runtime компоненты, multi-line actions, полное RTL, target browser/AT/OS/performance и актуальная fidelity-приёмка Figma. Native title не заменяет полноценный Tooltip. Modal/feedback/FileUpload пока не получили executable instance contracts. Два специализированных окна основного Lab остаются композициями. Chat/Workflow сохраняют явно локальные fixtures без реального AI inference/billing.

## Публикация и доказательства

[Тот же приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) — version39. Deployment appgdep_6add167067d081918a715d3372d0a3fd succeeded, Site source c004a2dc4960a4942df5833ff65ae4039e000a21. Custom/revision1: один owner, ноль external visitors/groups. Архив7,723,140 bytes, SHA256 c47be21778d957770941436b5b1dc4ad9168a0d4270c0a788e2b29b34fc40130.

Production повторила root text24, application text96, adaptive panels6 и Modal32 во всех8 reference routes. Все774 source hashes совпали, JS errors0. [Release evidence/hashes](../portal/component-lab/pilots/settings-parametric/verification/application-v39-release.json), [полные production результаты](../portal/component-lab/pilots/settings-parametric/verification/v39-production-results.json).

Логи: [package](../portal/component-lab/pilots/settings-parametric/verification/v39-package-log.txt), [contracts](../portal/component-lab/pilots/settings-parametric/verification/v39-contracts-log.txt), [full pilot](../portal/component-lab/pilots/settings-parametric/verification/v39-pilot-log.txt), [final focused](../portal/component-lab/pilots/settings-parametric/verification/v39-focused-log.txt). Логи нормализованы в LF до вычисления hashes. У исторических v38 логов hashes приведены к каноническим Git bytes; исходные hashes до нормализации сохранены отдельно, содержание и результаты тестов не изменены. CI последнего head здесь не объявляется завершённым.

Сравнимые M/150% снимки: [Chat до](../portal/component-lab/pilots/settings-parametric/verification/v39-chat-before-m150.png), [Chat после](../portal/component-lab/pilots/settings-parametric/verification/v39-chat-after-m150.png), [Sandbox до](../portal/component-lab/pilots/settings-parametric/verification/v39-sandbox-before-m150.png), [Sandbox после](../portal/component-lab/pilots/settings-parametric/verification/v39-sandbox-after-m150.png). Экстремальные настройки: [Sandbox960](../portal/component-lab/pilots/settings-parametric/verification/v39-sandbox-960-large.png), [Chat1280](../portal/component-lab/pilots/settings-parametric/verification/v39-chat-1280-large.png).

Критерий оценки расширен: нулевого document overflow недостаточно. Проверяются собственные границы панелей, неразбитые подписи/значения, отсутствие перекрытий, фактическая видимость keyboard focus и независимость authored content. Снимки помогают находить дефекты, которые не покрывала прежняя матрица размеров.
