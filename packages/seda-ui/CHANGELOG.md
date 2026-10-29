## Unreleased — TextField and NumberField validation

- Add warningText/successText to the actual public fields, with disabled > error > warning > success message precedence and existing component roles. Preserve independent focus and external aria-invalid.
- Suppress stale numeric success while the controlled buffer is empty, partial, invalid or out of range; do not coerce input or add automatic business errors.
- Extend executable contracts, required token paths, compiler state and web bindings; add a live three-field validation composition and TextField Studio previews.

## Unreleased — field component error paint

- Preserve TextField component border/surface error tokens instead of overriding them on the child control with generic danger roles. NumberField inherits the fix through its TextField composition.
- Exclude error and disabled fields from ordinary hover/focus paint; retain the visible focus outline.
- Add installed-package browser coverage with distinct token assignments across Light/Dark and S/M/L/XL. No token values, numeric parsing, or public API changed.

## Unreleased — Select read-only and loading

- Add focusable readOnly/loading with retained form values and guarded native pointer, selection keys, input/change callbacks. Controlled values remain owned by the application; reset restores uncontrolled defaults and retains controlled values.
- Keep the same DOM and geometry; loading uses the existing icon slot and reduced-motion-aware spinner. Dismiss the progressive native picker on lock without temporarily disabling the form control or stealing a neighbour's focus.
- Connect existing availability tokens and preserve validation/availability tone under hover/focus. Expose a required browser obligation in the executable Select contract; compilation alone is not runtime proof.

## Unreleased — Select warning and success validation

- Add warningText/successText with disabled > error > warning > success precedence, one described message and non-blocking native selection for warning/success.
- Bind existing surface/border/helper/arrow validation tokens. Remove the generic error-field override from Select so its own border assignment reaches the painted control.
- Extend the executable Select contract and Studio state board; other controls do not acquire validation states implicitly.

## Unreleased — Select control-owned SEDA arrow

- Replace the browser picker-icon border drawing with the original SEDA chevron in a decorative, pointer-transparent control slot. The slot stays centered when the picker opens and follows icon-size and field-padding tokens, including RTL.
- Hide the native arrow to prevent duplicates; retain native selection, keyboard navigation and progressive picker styling. Multi-select has no disclosure arrow.
- Verify actual arrow geometry in Chrome across Light/Dark, open/closed, LTR/RTL and five token-controlled slot sizes. Other browser engines retain native pickers and require separate verification.

## Unreleased — Tree and Select disclosure alignment (D39)

- Use the SEDA chevron icon for Tree disclosure and keep its centre fixed while rotating between collapsed and expanded states, including RTL.
- Centre the native stylable Select picker icon with a single translate-and-rotate transform in both closed and open states. The system picker remains native where browser support differs.
- Measure both arrow centres across Light/Dark and S/M/L/XL in the installed package, including expanded Tree and open Select states.

## Unreleased — Search input role ownership (D38)

- Resolve Search input default, hover and active borders through the shared `border.field` roles. Focus and disabled keep their existing roles; current Light and Dark appearance stays aligned with TextField.
- Bind Search's named input roles through the same Provider field variables used by its composed TextField. This removes the stylesheet-order mismatch where Search tokens were declared but the visible control inherited TextField's border instead.
- Verify actual default, hover, focus and disabled border paint in both themes in the installed React 18/19 package.

## Unreleased — Native Select picker layers (D37)

- Give the stylable native Select picker its own opaque `select.dropdown` surface, border and shadow roles. The trigger keeps the layered `surface.control` role, while hover, selected and disabled options use their existing component tokens, including selected foreground contrast.
- Use a separate `border.field` role for TextField, Select and TextArea. Dark defaults/hover/pressed now resolve to existing 30%/35%/40% white alpha tokens; Light retains its previous values and Checkbox/Radio/Toggle keep their own stronger outlines. The control contrast suite requires at least 3:1 for each visible boundary.
- Preserve native `<select>` value, form, keyboard and platform popup behavior. Browsers without `appearance: base-select` retain their native picker and the Provider's theme `color-scheme`; the picker styling adds no props or token leaves.

## Unreleased — Layered field surfaces (D36)

- Resolve default/hover field surfaces through shared semantic control roles. Light keeps its previous colours; Dark uses existing 7%/11% white layers so TextField, Select, TextArea, DatePicker, TimePicker, Search, VerificationCode and ColorPicker sit slightly above their containing panels.
- Preserve disabled and validation palettes, component state semantics and native select popup ownership. The Lab settings rail follows the same role.

## Unreleased — Source field anatomy (D34)

- Align TextField/Select label and helper typography with effective control size and scale. Preserve explicit local sizes; keep action Semibold separate from field Regular.
- Resolve label/control and control/message gaps independently from the existing profile, now 4px each. Use the source's 6px TextField content gap while preserving 8px action/choice/navigation gaps.
- Remove the extra affix surface from compiler-bound TextField. NumberField retains the same actual TextField anatomy. Keep previously checked colour and icon state roles.
- Record read-only source observations and explicit mappings for unexported gap aliases. Full Figma, browser/OS/AT acceptance remains open.

## Unreleased — TextField icon state roles

- Apply existing TextField icon default/active/error/disabled tokens to direct SEDA Icon and SVG affixes in both the public Provider and compiler-bound fields. NumberField inherits the same visual alias.
- Preserve text affix paint and supplied artwork. Keep Search's own semantic icon roles when its internal TextField receives the shared icon adapter.
- Serialize the same named-font/system fallback stack in compiler recipes, public Provider and Text roles; keep the original font token and resolution chain. Preserve the documented monospace stack for code.
- Add an installed React 18/19 regression over both render paths, sizes, selected parameter settings, glyph contrast and retained input focus/value/caret. No new props, tokens, SVG or Figma fidelity approval.

## Unreleased — Public control parameters

- Add opt-in SedaProvider.controlParameters over actual shared presets, with per-field inheritance and explicit local size priority. Reuse one expression graph for numeric compiler output and CSS; publish defaults/ranges/source in profiles.json.
- Move Lab and eight reference applications to public geometry; remove private field/choice paint and geometry and per-application button padding overrides. Preserve Text-role scale and authored-document ownership.
- Keep canonical profiles without opt-in. CSS round() and size container units are required by the experimental mode; target browser/OS/AT and full visual acceptance remain separate.
- Limit the loading spinner to the frozen Button box when parameters grow during a request. Let TextField label/helper margins own their gaps once, matching Select and NumberField in installed consumers.

## Unreleased — Explicit icon orientation

- Add arrow-left as an attributed180° CSS rotation of the existing arrow-right SVG; preserve all25 original source files and expose derivedFrom/rotation in icons.json. Reject unsupported rotations, missing origins, alias chains and conflicting source descriptors.
- Spline uses public Icon for Undo/Redo and physical camera directions instead of font symbols; tooltips distinguish history from camera commands.
- Installed-package raster checks and actual editor workflows verify orientation, scale, inherited foreground and action ownership. No new Figma original or instance contract is claimed.

## Unreleased — NumberField and field bindings

- Add controlled raw-string NumberField and executable D32 contract/shared numeric core; use actual TextField without a new palette, slot or border.
- Migrate Sandbox/Spline numeric properties while keeping commit/cancel/history/save owners. Preserve Mixed/partial buffers, decimal/large steps, IME and native availability.
- Propagate field CSS custom properties to all TextField slots while retaining ordinary native input styles. Fix bottom alignment of Projects pagination actions.
- Experimental implementation; separate Figma/locales/pointer affordance/target OS/AT acceptance remains open.

## Unreleased — Slider

- Add controlled native single/range Slider with visible values, semantic thumb names, stable order, noncrossing bounds, nearest-thumb rail gestures, native forms/fieldset and RTL.
- Use existing slider component tokens and shared compiler geometry. Migrate four Lab parameter controls to the installed package; add explicitly experimental range examples.
- Numeric grid validation, installed-package and application tests; geometry gaps and target OS/AT/Figma review remain explicit. D31 adds an executable registry contract; browser evidence remains separate.

## Unreleased — Popover

- Experimental controlled nonmodal anchored surface with real trigger bindings, named content, explicit focus ownership, logical placement/collision and inherited compiler styles.
- Files news and Chat local-share use the installed component while retaining document/export/clipboard owners. Nested Menu/Modal interaction and a Search overlay host composition have dedicated tests.
- Shared overlayStack gives an open native Select its first Escape and suppresses repeated Escape from peeling parent layers; actual picker/choice/Modal regressions cover the interaction. Native Modal also blocks held Escape after its last child overlay has closed.
- Existing Popover color tokens are required by the CSS generator; surface geometry remains documented experimental fallback. No instance contract or fresh Figma/AT/OS certification claimed.

## Unreleased — Search

- Experimental Search composes canonical TextField, IconButton, Button/Link, Text and original icons. External local filter and structured result modes, exact snapshot identity, localized lifecycle, keyboard/IME event guards and native navigation semantics.
- Files and Chat use installed Search while retaining their sources, data/save/request owners and routes. Chat window shortcuts now work before focus enters the application, preserving Alt/Shift/browser/menu/modal boundaries.
- Mixed-icon result rows share a text column; unavailable actions retain readable data and explanation. Geometry and colors use shared bindings and existing search roles. Figma/AT/OS and standalone anchored overlay host acceptance remain open.

## Unreleased — NotificationCenter

- Experimental NotificationCenter: owned snapshot/read actions, all/mentions/unread filters, readable loading/error recovery, localized copy, native list/time and common controls/typography/icons.
- Files uses a real bounded local operation log, with independent history storage/retry. No remote service or multi-tab merge is simulated. Fresh Figma/AT and overlay-host acceptance remain open.

## Unreleased — shared message component

- Public experimental ChatBubble: explicit author/source, six content models, native media retry, owned actions and status-only streaming. Provider typography/density and existing message tokens; error requires recovery.
- Chat uses installed ChatBubble, Table and Card; copy preserves historical AI source, text attachments open a real escaped preview. Request/storage ownership is unchanged.
- Corrected two ChatBubble AI ink token aliases; missing message-role build guards and installed React18/19 consumer verification added.

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

## 2026-10-25 — Table (experimental)

Добавлен generic native Table: controlled sort/selection/expansion/pagination, data states/retry, fixed header, density и native scroll. Использует существующие Table tokens и compiler typography; geometry fallback явно документирован. Приложения Projects/Team переиспользуют этот export. Полная Figma/AT/OS, virtualization/grid/inline-editing и instance contract не объявляются готовыми.


## 2026-10-25 — Card / Avatar / AvatarGroup (experimental)

Добавлены entity surfaces и identity components с native actions/selection, image fallback и committed-source guard (включая transition/Suspense), именованными диаметрами и настоящим group overflow. Projects/Team используют exports установленного пакета, Card/Table разделяют selection owner. CSS-алиасы Avatar onBrand/onAi сохраняют исходные token paths и provenance. Build требует используемые Card/Avatar color roles. Checkbox без подписи/message больше не оставляет пустой slot/grid gap. Table loading центрируется и в RTL. Geometry/полная Figma/OS/AT приёмка и surface instance contracts остаются открытыми.

## 2026-10-25 — TopBar (experimental)

- Общий public TopBar: owned slots, provider density/theme, existing token roles, native Link navigation и explicit Modal collapse. Files/Building/Chat подключены к installed package; локальные header paddings удалены, длинные Building breadcrumbs переносятся.
- Icon отклоняет неизвестные имена вместо пустого mask; оригинальный каталог25 SVG сохранён.
- 27 component entry modules /34 runtime exports — поверхность experimental, а не число принятых контрактов. Реестр executable instance contracts остаётся11. Figma quota не позволила свежую визуальную сверку.
## 2026-10-25 — Sidebar (experimental)

- Public Sidebar и types: native routes/actions, sections, current route, full/collapsed Tooltip, controlled disclosure, loading, local scroll и focus repair. Files/Chat подключены к installed package, локальная анатомия navigation удалена.
- Общий Tooltip распознаёт trigger, сфокусированный родителем до подключения listener.
-28 component entry modules/35 runtime exports;11 executable instance contracts. Нового token mapping нет, geometry остаётся foundation fallback; Figma/AT review открыт.
## 2026-10-25 — Accordion (experimental)

- Public Accordion с native Button/Icon/Badge, single/multiple ownership, disabled/required-open, mounted hidden panels, optional roving и focus repair. Framer/Webflow/Spline используют installed export, старые details paddings удалены.
- Shared preset/Accordion token provenance и missing-role guards добавлены. Цвета trigger переключаются сразу, устраняя transient contrast failure; chevron motion уважает reduced motion.
- 29 component entry modules/36 runtime exports;11 executable instance contracts. Figma/AT/OS и surface contract review остаются открытыми.

## 2026-10-26 — D35 inline action / TextArea

- Исправлен существующий Button text: line-height geometry, Regular, размерные gaps, inline icon slots и inner border. Обычные действия и квадратный IconButton сохраняют свои профили.
- Button не создаёт пустые icon slots для false/пустого Fragment.
- TextArea использует Button text в header, эффективную field typography, стабильную очистку и родительскую высоту. Новый clearLabel нужен для видимой локализации действия. Clear теперь остаётся недоступным в пустом/readOnly/disabled состоянии, вместо исчезновения.
- Compiler и public CSS используют общий presentation adapter; source provenance и browser-not-checked границы сохранены.
## Unreleased — InlineToolbar для редактируемого выделения

- Добавлен experimental InlineToolbar с общей поверхностью, размерами S/M/L/XL, именем, roving focus и навигацией стрелками/Home/End с учётом RTL; приложение владеет выделением и действиями.
- В Building подключены ограниченные bold/italic/code marks одного блока с сохранением, undo, split/join и явной валидацией. Полный rich-text и межблочное форматирование остаются вне этого этапа.
