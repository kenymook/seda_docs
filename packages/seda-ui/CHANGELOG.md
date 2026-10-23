# Изменения @seda-ai/ui

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
