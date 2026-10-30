# Визуальный ритм: типографика, иконки и рабочие приложения

## Непараметрические подписи проектов

Production baseline версии36 подтвердил наблюдение пользователя: «Управление рабочим пространством» и счётчик `#count` оставались 11px при 100% и 150%, без Text role. В React-композиции это были обычные span с legacy CSS.

Оба элемента используют настоящий SEDA Text, role `caption/default`. Источник метрик — foundation typography через общий компилятор: 12px при100%, 18px при150%. При80% остаётся12px из-за documented minimumSize этой роли; минимум не обходится отдельным множителем. Подключены также подпись и владелец пространства, описание экрана, заголовок панели, заголовки таблицы, bulk count, пагинация и метаданные карточек. Пагинация больше не навязывает 12px внутренним span контролов. Левая/правая служебные панели Lab остаются отдельной областью.

Проверены24 сочетания двух тем, S–XL и80/100/150%, с независимым `deriveTypography` oracle по скомпилированным token roles. Счётчик обновляется при фильтрации4→1→0→4; карточки сохраняют размер роли и не переполняются на1024/1702px. Ручной просмотр150% обнаружил обрезание «Карточки», которого не ловили прежние font-size assertions. Переключатель получил intrinsic width; теперь обе подписи дополнительно проверяются на clipping.

## Оригинальные иконки и состояния

Каталог расширен с17 до25 исходных glyphs SEDA: undo/redo, more, copy, trash, settings, circle, monitor. Node IDs, исходные24×24 SVG и SHA-256 сохранены в каталоге; геометрия не перерисовывалась. Glyphs подключены к меню проектов, истории редактора и инструментам Sandbox. Hand представлен подписанной Button-командой, пока оригинальной иконки нет; Unicode-подмена удалена. Существующие оригинальные reference assets сохранены.

`data-seda-icon` позволяет проверить фактически отрисованный glyph. Package verification сверяет реальные CSS mask bytes с публичным catalog hash, непустой alpha-render каждого SVG, размер/центр/foreground в Button и IconButton, доступные имена и decorative semantics.

Выявлены и исправлены два настоящих forced-colors дефекта: белая mask-иконка при чёрном тексте кнопки и чёрный disabled menu glyph при системном GrayText подписи. Icon сохраняет mask alpha и used color родителя через `forced-color-adjust: preserve-parent-color`; wrapper menu тоже наследует системный цвет. Семантика: [CSS Color Adjustment §3.2](https://drafts.csswg.org/css-color-adjust/#forced-color-adjust-prop). Обычная danger-иконка следует destructive label, disabled имеет приоритет.

## Масштаб и доступность Sandbox

UI scale80–150% добавлен к сохранённым appearance preferences отдельно от zoom/document typography. Старые preferences получают100%; неподдерживаемые значения отвергаются. В96 сочетаниях theme/size/scale/X/Y проверены реальные slots и неизменность геометрии/шрифтов authored scene. Reload сохраняет UI scale.

При960px, XL,150%, X24/Y12 обнаружена реальная недоступность части Save: button right1075px при toolbar right936px, native Tab не прокручивал scroller. Focus handler прокручивает только toolbar, сохраняя padding вокруг фокуса. Повторная проверка подтверждает доступность всех7 enabled actions, document scrollX0 и неизменный scene. Это не заявка на полную toolbar/AT/RTL-сертификацию.

## Проверки и их область

- TypeScript: UI package, pilot, references PASS. Contract/foundation tests122/122 PASS.
- Installed tarball:39/39 групп PASS React18.3.1/19.2.7, без source/React aliases. Raw: `packages/seda-ui/.diagnostics-package/2026-10-24T17-34-23-482Z/results.json`. Все25 glyphs рисуются и совпадают с catalog bytes; normal/danger/disabled forced-colors menu states совпадают с host foreground.
- Полная pilot sequence прошла с exitCode0: text24, icons96, choice48, nontext96, contrast144, visual24, feedback8, Lab55, workspace21, controls12, все8 reference applications и model/preview/renderer suites. После последних локальных исправлений view-switch и toolbar focus выполнены новая сборка и focused text24/icons96/Lab55/workspace21/Sandbox20 — PASS. Library runtime и остальные reference runtime этими двумя правками не менялись.
- Sandbox model20/20, включая миграцию/валидацию UI scale. Loading288 сочетаний: максимальная дельта ширины/высоты0px. Это вложенные измерения, не сотни независимых пользовательских workflow.
- Прежний assert на буквальный текст «···» заменён проверкой фактического SEDA glyph `more`; доступное имя и focus/action contracts сохранены. Screenshot baselines не обновлялись для скрытия ошибок. Неуспешный локальный file-dependency fixture не засчитан; итоговые consumers используют настоящий tarball.

## Границы зрелости

`reports/component-maturity-matrix.md` теперь отделяет текущую React-реализацию от архивного Figma scan2026-06-12. Score100 и старые “Done” не подтверждают production-ready статус библиотеки. Открыты оставшиеся legacy-тексты других композиций, полное покрытие/оптика иконок, плотность редакторов, variants/backgrounds/popups, полное RTL, Figma fidelity/bindings, target browser/OS/AT/performance и feedback instance contracts. Квота Figma ограничила часть дополнительных запросов; недоступные glyphs не подменены выдуманными оригиналами. Общая цель остаётся активной.

## Публикация и production proof

- Прежний приватный URL https://seda-ai-pilot.kenymook.chatgpt.site/, version37. Custom/revision1: один owner, ноль visitors/groups.
- GitHub implementation `b6768f73d87c8a09ec35d7203cc25ffe006eab75`; Site source `1edd7f52e62dfd7545f18cdaec1b3ea0eaed122f`.
- Deployment `appgdep_6adcf42cb1688191a2b9e344e2b2ea47` succeeded. Архив7,590,956 bytes, SHA256 `4d90b6585ee5a4ef81a3d671ec0654f83f43e665ca9bec1b1be10c4b36ad5592`.
- Production повторила text24 и icons96, UI scale reload и keyboard reachability всех7 enabled toolbar actions при960px. Все764 source hashes совпали; 0 JS errors. Обе отмеченные подписи:80%=12px,100%=12px,150%=18px.

[Release evidence и hashes raw-результатов](../portal/component-lab/pilots/settings-parametric/verification/visual-v37-release.json). Снимки: [до,150%](../portal/component-lab/pilots/settings-parametric/verification/v37-text-before-150.png), [после Light,150%](../portal/component-lab/pilots/settings-parametric/verification/v37-text-Light-150.png), [после Dark,150%](../portal/component-lab/pilots/settings-parametric/verification/v37-text-Dark-150.png), [toolbar960](../portal/component-lab/pilots/settings-parametric/verification/v37-toolbar-960-large.png), [menu Dark](../portal/component-lab/pilots/settings-parametric/verification/v37-menu-Dark.png), [forced-colors installed package](../portal/component-lab/pilots/settings-parametric/verification/v37-icon-forced-colors.png).
