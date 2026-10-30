# Согласованная компоновка редакторов — private v56

На прежнем приватном сайте опубликована общая композиция EditorDock для Sandbox, Spline, Webflow и Framer. Это следующий шаг визуальной согласованности плотных рабочих приложений. Библиотечные SplitView, поля, иконки и типографика остаются настоящими компонентами установленного @seda-ai/ui. Новый public component/token/contract не добавлен:13 contracts и34 component modules не объявлены полной зрелой системой.

## Реальное поведение

Контейнер измеряет доступную ширину. Когда читаемые минимумы холста и инспектора не помещаются рядом, тот же SplitView переходит в vertical: холст сверху, инспектор снизу. В широком контейнере возвращаются колонки. Размеры и отступы контролов не уменьшаются ради размещения. Подробная формула вместимости и ownership записаны в [SplitView spec](../specs/overlays-layout/split-view.md).

Пользовательская ширина инспектора отделена от responsive minimum. Обычный ручной resize не запускает ложный reflow. Горизонтальная ширина принадлежит приложению; высота нижней области хранится отдельно в текущем сеансе. Минимумы по высоте сохраняются с локальной прокруткой. Автоматический переход не вызывает сохранение или изменение документа.

Поля и поверхности остаются mounted. Проверены идентичность DOM поля и iframe/canvas/SVG, сохранность черновика, фокуса и каретки при переходе в обе стороны, Escape cancel, клавиатурное изменение разделителя и восстановление выбранной вертикальной высоты. Прежние сценарии реального document commit, Undo/Redo и save/reload повторены отдельно.

Визуальный просмотр выявил дополнительный дефект: фиксированная ширина140px у Framer Canvas zoom не учитывала крупный текст, extra X и стрелку. Теперь вместимость поля рассчитывается из этих параметров. Actual native select измеряет ширину выбранного текста и доступную область до стрелки; значение помещается в обеих темах. Исходные снимки с дефектом сохранены.

## Доказательства

- TypeScript pilot/references PASS; build8 profiles, source audit PASS. Публичный пакет и контракты не менялись; старые локальные132 contract tests/67 package groups не выданы за новый запуск этой итерации.
- Все49 application scripts завершились exit0: Lab22 иreferences27. Новый verifier:32 выбранных сочетания4 editors ×2 themes ×2 appearances ×2 widths;8 transitions с реальными черновиками, поверхностями preview, focus/caret иkeyboard resize. Дополнительно прошёл прежний adaptive-panels6.
- Inspector160 на8 routes и95 painted glyphs, прежние form/filter/loading/late-response/save/domain checks пройдены. Проверка Sandbox grid теперь требует фактическое читаемое пространство input: широкому нижнему инспектору разрешены две колонки. Это изменение ожидаемой композиции, не ослабление границ геометрии.
- [Linux CI runtime 2d3fa9f](https://github.com/kenymook/seda_docs/actions/runs/40237011756): точные статусы всех jobs сохранены в [ci-runtime.json](../portal/component-lab/pilots/settings-parametric/verification/editor-dock/ci-runtime.json). Следующий evidence-only head не выдан за уже прошедший CI.
- Production повторил NumberField16 и2 editor flows, EditorDock32/8 transitions, inspector160 иglyph95; JavaScript errors0. Совпали926 source hashes и532 опубликованных artifact hashes;687 canonical Git blobs и239 installed UI entries. SourceAlias=false; tokens.json иnumeric core не изменились.

Первый новый runner остановился из-за неверного адреса тестового поля wf-gap; исправлен на существующий wf-style-gap. Этот harness failure сохранён отдельно. Ожидания поведения не ослаблялись. Screenshot baselines не обновлялись.

Общая серия также поймала настоящую регрессию Framer: видимый canvas уменьшился до308px вместо прежнего минимума350px. Порог теста сохранён. Теперь измеряется высота chrome вокруг canvas, включая переполнение при первоначальном reflow; она добавляется к минимальному бюджету viewport. После исправления прежний Framer verifier прошёл12/12. Исходный отказ и снимок сохранены; финальная серия повторена на исправленном runtime. Проверены и соседние целочисленные размеры окна на границе side/bottom: без однопиксельного overconstraint.

## Визуальная оценка и границы

Просмотрены нормальные1440/M100 и крупные1024/XL150/X24/Y12 состояния четырёх редакторов в Light/Dark; выбранные1702/XL кадры и повторные опубликованные экраны. Инспектор получает полноценную ширину, подписи и связанные поля размещаются согласованнее, zoom value не пересекает picker. Authored типографика, координаты и содержимое документов остаются независимыми от chrome.

Большие параметры всё ещё требуют прокрутки; названия навигации могут сокращаться, command bars могут прокручиваться горизонтально. Нижний inspector не делает любое сочетание удобной рабочей плотностью. Сохраняются минимальные ширины приложений; полноценное mobile/touch, native desktop/OS/AT/Firefox/WebKit acceptance, независимая Figma приёмка, сохранение dock-height между сеансами и произвольный drag docking/undocking не реализованы этим изменением. Реконструкции authored preview, полнота иконок/компонентов и сложные editor/grid patterns остаются открыты. Цель всей дизайн-системы активна.

## Публикация

Версия56; deployment `appgdep_6ade7c6df79481918874564b06bd6596` — succeeded. Runtime `2d3fa9fe1279172cba1f211101e6a077a9200bc2`, Site source `b705998d7fce71560f5324b533c042e70174994e`. Access custom/revision1: один owner, external visitors/groups0. [Прежний URL](https://seda-ai-pilot.kenymook.chatgpt.site/), аудитория сохранена.

[Release](../portal/component-lab/pilots/settings-parametric/verification/editor-dock/release.json) · [Production](../portal/component-lab/pilots/settings-parametric/verification/editor-dock/production-results.json) · [Evidence hashes](../portal/component-lab/pilots/settings-parametric/verification/editor-dock/evidence-hashes.json).
