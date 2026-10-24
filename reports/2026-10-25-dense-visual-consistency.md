# Визуальная согласованность плотного рабочего интерфейса

Первый эталон — Files / Recents. Это улучшение существующего приложения на настоящем SEDA UI, не новый сайт. Цель всей библиотеки остаётся прежней: зрелые web/desktop приложения. Данный проход не является полной приёмкой всех компонентов и Figma frames.

## Принятые правила и исправления

- Одноцветный служебный glyph получает цвет от своего контрола. Неинвертированный белый SVG больше не исчезает в светлой теме Files. Исходные SVG сохраняются байт в байт; logo/avatar/thumbnail и цветные content marks не становятся одноцветными иконками.
- У 10 glyphs Files измерена область alpha >16 на raster256. Видимый максимальный размер приводится к 80% общего слота; коррекция центра учитывает реальные пустые поля. `reference-glyph-metrics.json` содержит SHA-256 оригиналов. Это оптический adapter reference-экрана, не расширение публичного каталога из25 SEDA glyphs и не редактирование SVG path.
- Текстовый DropdownMenu получает одну trailing chevron из общего SEDA Icon. Icon-only trigger сохраняет прежнюю anatomy. В Chat и Sandbox удалены дублирующие source-only chevrons; label, keyboard ownership и focus return сохранены.
- Группы действий:4px между компактными инструментами,8px между обычными действиями. Recipe явно применяется к owned application groups во всех8 reference routes. Он не меняет внутренние отступы компонентов или authored content.
- Files: единые края24px, расстояние карточек24px / строк списка8px, внутренний интервал metadata8px. Радиус карточки следует compiled control radius. Sidebar, header и cards используют существующие поверхности и границы темы.
- Tabs/filters размещаются общим flex layout с естественным переносом, без absolute overlay и резервирования440px. Ширина Select учитывает текст и общий X; sidebar адаптируется к крупным контролам. Account не сжимается поверх поиска.
- Chat: общей поверхностью владеет composer, TextArea использует публичный experimental `appearance="plain"`. Default outlined не меняется; focus/error/disabled/geometry остаются у компонента. Группа действий переносится целиком, сохраняя ширину ввода. Voice commands явно сообщают об отсутствии подключения, а не имитируют сервис.

## Визуальная проверка

Скриншоты действительно просмотрены: Files grid/list в Light/Dark, крайние960/1440 сXL/150%/X24/Y12 и16 снимков восьми приложений вLight/Dark/M. Автоматический PASS не заменял просмотр: он сначала пропустил сжатие account и обрезанные filters; эти дефекты обнаружены на изображениях и исправлены. Также просмотр выявил двойную chevron в Chat/Sandbox.

Приняты в этом проходе: читаемость служебных glyphs Files в двух темах, относительный оптический размер, общий card/control radius, интервалы групп, отсутствие наложения account/search и filters/content, перенос действий composer. Source gutters34/gaps32 заменены на24/24 как осознанный SEDA composition adapter; прежний тест исходных координат заменён проверкой принятого gutter/gap/column rule, не объявлен Figma fidelity PASS.

Горизонтальная прокрутка длинной строки Tabs при крайних параметрах остаётся штатной, с keyboard reveal. Source emoji/project identities и разноцветные thumbnails сохранены как содержимое. Авторские документы, canvas и 3D artwork не нормализуются под типографику chrome.

## Автоматические доказательства

- Контракты123/123; installed tarball45/45 groups наReact18.3.1 и19.2.7. В package добавлены plain state checks и общая menu disclosure. Счётчик catalog fixture теперь ограничен catalog sections; дополнительная chevron меню проверяется отдельно, без ослабления геометрии/цвета/asset hashes.
- TypeScript пакета, pilot и reference projects — PASS.
- Files48 сочетаний:2 widths ×2 themes ×4 sizes ×3 scales, X24/Y12. Проверяются baseline controls, square IconButton, radius, theme color glyphs, original hashes и границы layout. Это матрица размеров, не48 независимых продуктовых сценариев.
- Composer48 сочетаний,3 исходных action assets плюс общая SEDA chevron, multiline и явное unavailable поведение. Четыре исходных Figma SVG отдельно скачаны и совпали с локальными; chevron теперь принадлежит библиотечному menu.
- Перенос shared rhythm:16 route/theme samples, rendered menu glyphs и group gaps; по одному полному экрану для визуального просмотра каждого sample.
- Финальные Chat:4 model /12 browser checks; Sandbox20 browser checks — PASS после удаления двойных chevrons.

Первая общая последовательность остановилась на source integrity: после её build были исправлены app slots. Повтор на изолированном final artifact обнаружил, что verifier читал hardcoded dist metadata, хотя server обслуживал SEDA_PILOT_DIST. Verifier теперь использует тот же корень. Проверки source hashes и artifact hashes не отключались. Итоговые логи и production proof добавляются после завершения release checks.

## Открытые области

Оптическая нормализация исходных glyphs пока выполнена только для Files. Другие reference screens получили общий menu и action rhythm, но их исходные icon families и часть chrome ещё требуют такой же детальной приёмки. В частности, визуальный просмотр сохраняет замечания к muted glyphs Building, разной насыщенности источников и тесным inspector groups. Это не закрыто одним глобальным фильтром.

Полная Figma fidelity, все состояния/поверхности, public Table/Card families, target browser/OS/AT, RTL и performance остаются открыты. Неполные authored fixtures Webflow/Framer/Workflow и отсутствие реального AI/backend не объявляются исправленными этим визуальным проходом.

## Завершение локальной проверки

Вся последовательность pilot checks выполнена по частям: начало общего прогона до feedback; затем source/artifact55/55, workspace21/21 и controls12/12 наfinal artifact; затем исправленная спецификация Files и все оставшиеся reference/model/renderer verifiers до Workflow. Последний сегмент завершился сexit0. Это не заявление о единственном зелёном `npm run verify`: промежуточные остановки сохранены влогах и объяснены выше. Final Files9/9; Chat4 model+12 browser; Sandbox20 browser. После последней runtime-правки повторены composer48, rhythm16, Chat иSandbox. TypeScript PASS. Версии/контракты и loading/snapshot/late-result ownership проверяются существующими сценариями; screenshot baselines не обновлялись.

Дополнительно просмотрены6 Files state screenshots: selected card+menu, error+focus, search focus вLight/Dark. Это агентская визуальная проверка, не независимый signoff дизайнера и не pixel fidelity score.

[Доказательства, изображения и исходные результаты](../portal/component-lab/pilots/settings-parametric/verification/dense-v42/visual-review.json). [До](../portal/component-lab/pilots/settings-parametric/verification/dense-v42/before-files-light-grid.png), [после](../portal/component-lab/pilots/settings-parametric/verification/dense-v42/final-files-light-grid.png), [ошибка/focus](../portal/component-lab/pilots/settings-parametric/verification/dense-v42/states-dark-error-focus.png).

## Публикация

Версия42 опубликована на прежнем приватном https://seda-ai-pilot.kenymook.chatgpt.site/. Deployment `appgdep_6add39dbb49c8191a4772037db07ca9a` succeeded. Site source `67d4b2ee9726a5fc9ed1643d1b69fad205a17243`, runtime GitHub commit `814feb95387484496770c0e4f4f3812fdf200398`. Archive7,754,171 bytes, SHA256 `435e44e61cb4a918dc8a3f440e8949d560168d35642ab0544fea1c6e432ef9e1`. Custom/revision1: один owner, external visitors0, groups0; URL и аудитория сохранены. Поздние verifier/report changes не меняют опубликованный runtime. Production proof завершён:794 source hashes matched; Files48, Composer48 иRhythm16 samples — PASS; JavaScript errors0. Использованы отдельные свежие browser contexts, чтобы параметры предыдущего теста не меняли следующий. Снимки живых Files иChat также просмотрены. [Production results](../portal/component-lab/pilots/settings-parametric/verification/dense-v42/production-results.json).
