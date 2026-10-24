# Изменения @seda-ai/ui

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
