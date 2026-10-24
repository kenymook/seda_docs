## Unreleased — consistent dense workspace

- Text DropdownMenu trigger includes the original SEDA chevron; icon-only triggers retain their existing anatomy. Accessible name and ownership remain unchanged.
- Files workspace establishes shared action spacing, scalable card shape, grid-owned filters and theme-inheriting monochrome glyphs. Identity artwork remains separate.

## Unreleased — compound message surface

- TextArea: explicit experimental `appearance="plain"` for owning surfaces; outlined default, geometry, error/disabled paint and focus remain intact. Compiler/API/default audit includes appearance.
- Chat composer uses the public appearance and all four original Figma actions; voice remains visibly unavailable and never simulates a connected service.

# Изменения @seda-ai/ui

## Unreleased — constrained actions

- Button fullWidth больше не растягивает узкий parent через min-width:max-content. Однострочный label получает ellipsis, иконки сохраняют размеры, loading фиксирует ограниченный border box.
- Tabs прокручивает только собственный tablist, полностью раскрывая focused tab, который помещается в его viewport. Keyboard/resize сохраняют document scroll и focus panel; большие labels не уменьшаются.
- Текстовый DropdownMenu trigger использует этот recipe и полный title; меню остаётся доступным клавиатурой.


## Unreleased — native Modal

- Публичный controlled Modal использует native dialog/top layer, Text heading/section, SEDA IconButton и существующие modal color tokens. Surface widths отделены от плотности контролов; геометрия пока experimental adapter с явно описанным источником.
- DropdownMenu внутри native dialog сохраняет portal в его DOM scope: body portal попадал в inert background и не получал focus. Native Popover продолжает выводить menu поверх clipping.
- Initial/return focus, Tab boundaries, Escape/scrim policies, native close requests и прокрутка входят в React-адаптер. Shared WorkspaceDialog переводит reference-приложения на него; это не добавляет сертифицированный surface contract и не закрывает визуальную приёмку Figma/AT/OS.

## Unreleased — application icons

- Восемь оригинальных glyphs SEDA дополняют публичный каталог до 25: undo/redo, more, copy, trash, settings, circle, monitor. Исходные SVG, node IDs и hashes сохраняются; Icon показывает data-seda-icon для инспекции.
- Mask-based Icon наследует системный цвет host в forced-colors. Danger icon в DropdownMenu согласован с destructive label, disabled сохраняет свой приоритет.
- Lab, его редактор и Sandbox используют общие glyphs; масштаб chrome Sandbox хранится отдельно от authored scene/camera. Hand остаётся явной текстовой командой до добавления оригинальной иконки.


## Unreleased — first-line alignment

- Checkbox, Radio и Toggle привязаны к первой строке подписи. Helper/error и переносы больше не центрируют маркер относительно всего блока; совместные горизонтальные группы используют первую baseline. Отступы и высота следуют существующему preset и параметрам Lab.
- Подпись и описание разделены через aria-labelledby/aria-describedby с сохранением явного имени потребителя. Radio сохраняет helperText=0.
- Проверки установленного tarball и реального Lab измеряют эту геометрию отдельно; это не означает завершённую visual/AT/OS-приёмку библиотеки.

## Unreleased — essential boundaries и compound choice states

- Neutral control boundaries отделены от декоративных borders. Focus ring теперь opaque; Toggle off track и on thumb различимы, новая граница не меняет размеры/insets. Forced-colors использует CanvasText/GrayText.
- Checkbox/Radio сохраняют checked/mixed/error marker при hover; unchecked Radio не наследует Checkbox indeterminate bar. Disabled имеет приоритет.
- Custom token overrides должны включать новые required Checkbox control/icon/error, Radio control/dot/error и Toggle thumb/on, border/default, border/disabled. Canonical token source уже содержит их. Подробнее: reports/2026-10-24-control-boundaries.md в репозитории.

## Unreleased — Toast host

- Отдельные ToastProvider/ToastViewport/useToast: ограниченная FIFO-очередь, dedupe/update, активное время показа, hover/focus/window pause, сохранение остатка при remount и guard старой revision.
- Arrival без autofocus, локальный Escape и возврат фокуса; provider isolation, без глобального singleton и transport. Состояния видны в рабочем Lab.
- Presentation Toast сохраняет API; автоматический lifecycle работает только через host. Полная AT/OS-приёмка ещё требуется.

## Unreleased — feedback, исходные иконки и semantic palette

- Общая геометрия Badge/Tag/Alert/Toast, естественная multiline-высота и отсутствие пустых slots. Native selectable Tag и независимый dismiss; вложенный counter — реальный Badge с documented view.
- 17 оригинальных SVG SEDA, проверяемый генератор и public icons.json. FileUpload получает исходный upload glyph.
- Status containers/text/icon согласованы; общий filled brand blue60/70/80 обеспечивает readable white text. Все semantic color роли доступны композициям, вложенные token leaves больше не пропускаются.
- Duration Toast по-прежнему metadata: lifecycle/queue не объявляются готовыми. Figma/AT приёмка и feedback instance contracts остаются открытыми.

## Unreleased — FileUpload в общей геометрии

- FileUpload наследует общий preset, размер иконки, шрифт, строку, gap и radius; multiline-контент растёт естественно. Lab применяет X/Y ко всем трём вариантам с сохранением их базовых отступов.
- Исправлены реальная блокировка state=disabled, имя/description, пустые ошибки, finite/indeterminate progress и drag-over. `files` остаётся отображаемой коллекцией, transport и native reset принадлежат родителю.
- Error/drag colors используют существующие theme-aware semantic aliases; новая surface/success отделяет фон от status accent. Все используемые FileUpload component tokens обязательны для сборки.
- Installed consumer проверяет состояния, контраст с alpha compositing, keyboard chooser, реальные файлы/drop, длинные имена, reduced motion и forced colors. Figma/AT и executable instance contract остаются открытыми.

## Unreleased — согласованность иконок и контента

- Общий Icon с 11 оригинальными SEDA glyphs, унаследованным foreground, типизированными именами и декоративной/смысловой семантикой.
- Иконки Button, IconButton, TextField, Tabs, Tree и DropdownMenu учитывают общий размер, включая непосредственные IMG. Disclosure Tree также масштабируется. Button/TextField используют preset gap вместо фиксированных 8 px.
- Progressive native Select центрирует выбранный текст вертикально и масштабирует место под стрелку. Native popup остаётся зависимым от поддержки браузера.
- Lab масштабирует font/line/icon вместе и показывает реальные компоненты в отдельном разделе сравнения состояний. Это первый этап визуальной согласованности, не заявление зрелости всех компонентов.

## Unreleased — доступное имя Select

- Native Select использует отдельную связь с label: options/helper/error больше не включаются в имя контрола. Required marker скрыт от имени; явные ARIA naming props потребителя сохранены. Длинное выбранное значение progressive native picker остаётся в одной строке с ellipsis и отдельной стрелкой. Installed React18/19 consumer проверяет точное имя до/после выбора, explicit ARIA override, узкий host и настоящий keyboard picker.

## Unreleased — панели редактора и изоляция темы

- Добавлен experimental SplitView: horizontal/vertical, pointer capture/transform, keyboard/RTL, Enter minimum/restore, Escape/pointercancel, controlled rejection, clamp с сохранением requested intent, вложенные mounted panels и unmount cleanup.
- Layout CSS включён в публичный stylesheet; semantic surface/base, border/subtle и focus/ring генерируются из canonical tokens. Нет новой component token family и нет заявления общего instance contract SplitView.
- Installed React 18/19 verifier добавляет две группы SplitView; NodeNext проверяет labels, numeric extents и orientation.
- Lab получил редактор с тремя областями, linked inspector/preview, undo/redo и явным browser-local сохранением/reload/error handling. Это композиция для проверки библиотеки, не готовый Figma reference screen.
- Legacy demo Dark selectors больше не перекрашивают SEDA input/select. Browser checks теперь проверяют прозрачность внутреннего элемента и наследование foreground, включая диалог.

## Unreleased — меню команд

- Icon-only DropdownMenu использует ghost IconButton. Ghost foreground теперь учитывает canonical token и compiled adapter; исправлен белый trigger с неразличимым многоточием в Dark Lab. Добавлены theme/size проверки trigger в package consumer и workspace.

- D28: DropdownMenu зарегистрирован в общем compiler/API/schema с items/open/shortcut checks, authored menu snapshots и browser-safe binding; семантические focus/danger adapters имеют provenance. DOM snapshots сверяются на React 18/19.
- Lab row actions используют настоящий DropdownMenu: details, duplicate dialog и delete confirmation с focus fallback и сохранением draft. Table/Dialog остаются композициями.

- Experimental DropdownMenu: owned Button/IconButton trigger, grouped actions/descriptions/separators, реальные menu/provider shortcuts, keyboard/typeahead, disabled guards и controlled/uncontrolled open.
- Общий document overlay stack, body portal, optional manual Popover top layer, viewport flip/clamp, RTL, наследование темы/геометрии и focus handoff в host-диалог. react-dom объявлен peer dependency.
- Пакетный verifier проверяет installed tarball на React 18/19; отдельные menu группы включают SSR/hydration/StrictMode, 32 aggregate profile/viewport измерения и cleanup/fallback. Точные результаты хранятся в verification reports.
- Screen reader и Firefox/WebKit/desktop proof ещё не завершены. Это не объявление полного production-ready каталога.

## Unreleased — общий контракт навигации

- Tabs подключён к registry/API inspector/common compiler с items/selection checks, default/selected/disabled snapshots и обязательными token roles. Смешанные value/defaultValue отклоняются.
- Вложенные opaque $slot/$handler bindings проверяются TypeScript внутри полного property; неверный тип/descriptor не проходит как valid.
- Browser-safe Tabs binding связывает compiler geometry/colors/provenance; SSR/hydration consumer сверяет rendered item states с compiler.
- Общие Tabs styles вынесены в navigation.css, включённый в публичный styles.css. Отдельный CSS import пользователю пакета не нужен.

## Ранее — навигация рабочих панелей

- Добавлен experimental Tabs: line/pill, inherited size, controlled/uncontrolled selection, manual/automatic activation, RTL arrows, disabled skip, Home/End и focus repair при изменении items.
- Panels остаются mounted; hidden сохраняет локальный draft. Empty/all-disabled list имеет ноль доступных tabs. Нет lazy/unmount/close/vertical API.
- Цвета Tabs генерируются из существующих component tokens, геометрия использует общий size profile; missing used component token блокирует build.
- Installed tarball proof расширен отдельным Tabs consumer на React 18/19 с SSR/hydration и 64 совокупными theme/size/variant/width комбинациями.

## Ранее — публичная конфигурация

- Snapshot loading Button теперь сохраняет padding: короткая кнопка не увеличивается при S→XL, новый padding применяется после завершения.
- Добавлены SedaProvider, useSedaConfiguration, наследование theme/controlSize, вложенные scopes и приоритет явного size. Standalone defaults light/m сохраняются; context snapshots frozen.
- Общие профили и component-token темы генерируются при build из canonical tokens/system, без CSS лаборатории. Добавлены profiles.json и обязательная проверка state roles.
- Базовая геометрия Button/IconButton/TextField/Select/Checkbox/Radio/Toggle согласована с системой и вне provider. Добавлены font fallback и устойчивые label gaps в grid.
- Аудит API различает literal defaults и standalone fallback через Context; источник fallback входит в provenance. Исправлена ложная неоднозначность alias между token leaf и одноимённой веткой; два настоящих leaf остаются ошибкой.
- При сборке из монорепозитория используются соседние tokens/system/resolver; tarball consumer остаётся самодостаточным. Доступны Light/Dark и regular S/M/L/XL. Остальные режимы не объявлены проверенными.

## Ранее — поставка библиотеки

- Добавлены build/prepack, ESM с явными `.js` specifiers, declarations, CSS и манифест SHA-256. Tarball ограничен публичными build artifacts.
- React остаётся внешним peer. Сборка не включает React внутрь библиотеки.
- **Подключение стилей:** теперь импортируйте `@seda-ai/ui/styles.css` явно в entry приложения. JS entry не импортирует CSS и поддерживает загрузку при SSR. Для старого source alias, полагавшегося на неявные стили, требуется добавить этот import. В Lab он уже есть.
- Измерения Button используют browser layout effect с SSR-safe fallback. Исправлен intrinsic min-width, из-за которого меняющийся скрытый label увеличивал loading-кнопку вне Lab.
- Добавлен verifier отдельной установки tarball в React 18/19: exports/types, SSR/hydration, CSS, linked controls и loading.
- Тестовый Playwright обновлён после подтверждённого audit finding. Публикация в npm registry не выполнялась; пакет остаётся private/experimental.

## Unreleased — общее дерево объектов

- Tree: nested roles, single/multiple selection, independent expansion/focus, disabled inheritance, keyboard/range/typeahead/RTL, controlled rejection и focus repair. Canonical Tree tokens включены в public stylesheet/provenance; sizes берутся из общего профиля.
- Десятый compiler contract и web bindings; React 18/19 installed proof, SSR/Strict hydration, 14 aggregate DOM/compiler snapshots, 32 profile/width samples. Проверка пакета теперь 19 групп, а не 19 независимых пользовательских сценариев.
- Editor использует реальный Tree, синхронизирует label/selection с inspector/preview/history и сохраняет view вместе с model/panels. Исправлен crash на whitespace label при редактировании; незаполненный текст продолжает блокировать save.

## Unreleased — TextArea и D30

- Общий native TextArea с forwardRef, label/hint/error, controlled/uncontrolled value, rows, autoResize/maxRows, manual resize, clear и UTF-16 counter. Общие theme/size/X/Y, собственная text-area token branch; одиннадцатый compiler/API/schema contract и web binding.
- Иcправлены RTL порядок счётчика, сохранение ручной высоты, precedence disabled+readOnly и active paint. Clear/focus, rejected controlled edits, native form reset и composition forwarding проверены в installed consumers.
- Public package теперь18 компонентов +provider/hook,20 runtime exports. Package verifier21 aggregate groups,113 app groups и115 authored contract tests — разные области проверки, не взаимозаменяемые доказательства готовности.
- Building использует настоящий TextArea для многострочных локальных комментариев; draft через close/reopen и сохранение/reload проверены. Полный chat/composer ещё не реализован.

## Unreleased — параметрическая типографика

- Public Text с23 существующими roles, semantic as и ref; наследуемый Provider textScale80–200, minimum и дробные size/line-height/tracking. Control size и author canvas font независимы.
- Role mappings используют фактические h1/h2/h3 и title1/2/3, текущий Inter и token provenance; tokens.json не изменён.
- Installed React18/19 proof добавляет по одной typography group: SSR/Strict hydration, кириллица/UTF-8,40 вложенных profile samples на каждый consumer, nested/explicit/standalone scopes, wrapping и RTL.


- Add public text-only Tooltip and connect IconButton.tooltip to shared hover/focus/escape runtime instead of native title. Preserve description IDs, refs and button metrics; scope portals to owning native dialog. Experimental surface geometry, existing colors and Text role, no new tokens.
