# @seda-ai/ui

React-компоненты SEDA для веб-приложений и веб-интерфейсов в desktop shell. Пакет пока private/experimental: production-ready статус всей библиотеки не заявляется.

`Search` — общий experimental query/results pattern: настоящее TextField и отдельный IconButton очистки, native Link/Button результатов, локализованные состояния и snapshot identity. Files использует внешний фильтруемый результат; Chat — общий Search внутри Modal, с настоящими переходами и клавиатурой. UI сверяет исходный query и queryKey для ready/loading/error, включая A→B→A; data layer по-прежнему владеет transport/debounce/abort. Ранжирование, поиск и документы не симулируются библиотекой. Полный API и ограничения: specs/overlays-layout/search.md.

`NotificationCenter` — общий experimental центр уведомлений: snapshot items, точный unread count, all/mentions/unread Tabs, локализованные labels и явные владельцы mark-read/retry/settings. Loading/error/read states используют общие Text/Button/Badge/Icon и существующие notification-center tokens. Panel интегрирован с историей реальных локальных операций Files. `placement=overlay` требует host-owned non-modal surface; самостоятельный overlay host не предоставляется. API, fallback geometry и открытая Figma/AT-приёмка: specs/overlays-layout/notification-center.md.

## Сборка и подключение

```sh
npm --prefix ../seda-contracts ci
npm ci
npm run typecheck
npm run build
npm pack
```

`prepack` собирает ESM, declarations и CSS. Архив содержит только `dist`, README, CHANGELOG и package manifest; React остаётся peer dependency приложения.

В приложении:

```tsx
import { Button, TextField, Select } from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';
```

CSS импортируется явно один раз в entry приложения. Импорт JS не загружает CSS и не обращается к DOM, поэтому пакет можно импортировать при SSR. Если ранее использовался alias на `src/index.ts` с неявным подключением стилей, добавьте явный CSS import. Лаборатория уже использует его. Автоматическая упаковка React запрещена: хост предоставляет одну совместимую копию.

## Проверка поставки

```sh
npm run verify:package
```

Verifier запускает настоящий `npm pack`, устанавливает архив в отдельные приложения React 18/19, проверяет exports, declarations (NodeNext), SSR/hydration, CSS и интерактивность в Chromium. Он не использует alias на исходники. Результаты и приложения находятся в `.diagnostics-package/`. Для установленного Chromium задайте `SEDA_BROWSER_EXECUTABLE`; без него нужен browser runtime Playwright.

Сборка повторяется в verifier; сравниваются SHA-256 артефактов. `dist/manifest.json` содержит хеши выходных файлов. Архив не публикуется в npm registry.

## Modal: native surface, experimental geometry

```tsx
<Modal open={open} onOpenChange={setOpen} title="Настройки проекта"
  size="l" description="Изменения вступят в силу после сохранения"
  footer={<Button loading={saving} onClick={save}>Сохранить</Button>}>
  <TextField label="Название" />
</Modal>
```

`open` и `onOpenChange` обязательны; uncontrolled режима нет. Второй аргумент callback — `{reason, returnValue}`: `close-button`, `escape`, `scrim`, `native`. Владелец может отклонить запрос, например из-за несохранённых изменений. Нативные `close()`/`method="dialog"` также возвращаются владельцу; при отказе поверхность открывается снова. `showCloseButton=true`, `closeOnEscape=true`, `closeOnScrimClick=false`. Для confirmation/alert обязательна description и запрещён scrim-dismiss. Закрытие во время async submit определяет приложение; Modal не симулирует сохранение.

`variant`: default/confirmation/alert/fullscreen. `size`: s/m/l/xl — ширина поверхности, **не** размер контрола. Fullscreen использует xl. `title` — обязательная строка; `description`, `children`, `footer` — содержимое. `footer` заменяет предложенные в дизайн-спеке primaryAction/secondaryAction: публичные Button остаются самостоятельными и сохраняют собственные loading/disabled/danger props. `closeLabel` нужен для локализации доступного имени. `initialFocusRef` задаёт точку входа; иначе default выбирает первое поле, confirmation/alert — безопасный заголовок. `returnFocusRef` задаёт логическую цель, если trigger удаляется. Открывать вложенные модальные окна запрещено; одновременно допускается одна поверхность в документе.

Цвета берутся из существующих `modal/*` tokens, заголовок — Text heading/section. Собственный close recipe сохраняет квадратную зону минимум 44px, а glyph наследует общий масштаб иконок. Body прокручивается отдельно; заголовок и footer имеют свои ограничения в коротком viewport. Tab/Shift+Tab замыкаются внутри окна. Нативный `<dialog>.showModal()` обеспечивает top layer и неактивный фон. Программно перемещать фокус за пределы модального сценария не следует.

**Происхождение геометрии:** L=720px, padding=24px, radius=12px, viewport gutter=32px, shadow `0 16px 64px #0006` сохранены из reference-dialog.css на commit b6768f7. S=480/M=560/XL=960 и адаптация короткого viewport — промежуточный documented adapter. В tokens отсутствуют width/padding/gap/radius/shadow Modal; они не объявляются восстановленными из Figma. Источник дизайна Su1jWqKc9TkD1R8f7wHOQU node 6653:395 в этой итерации недоступен из-за MCP quota. Визуальная приёмка относительно Figma остаётся открытой. Modal пока **не имеет исполняемого instance-контракта**; его нельзя пропускать через compileControl с формулой однострочной высоты. Реализация не подтверждает WebKit/Firefox, assistive technology, native desktop shell или closed Shadow DOM.

## Границы зрелости

34 component entry modules и foundation API не означают готовность всей библиотеки. Тринадцать контролов имеют исполняемые контракты в соседнем `seda-contracts`: Button/TextField/Select/Checkbox/Radio/Toggle/IconButton/Tabs/DropdownMenu/Tree/TextArea/Slider/NumberField. Публичный `SedaProvider` подключает темы и наследуемый размер к установленному пакету; проверка выполняется без CSS лаборатории. Явный size компонента приоритетнее общего.

Следующие обязательные направления: полная матрица взаимодействий и доступности, навигация/overlays/data-компоненты, документация и политика совместимости. WCAG-сертификация, Firefox/WebKit, screen readers и native desktop shell этими тестами не подтверждаются.


## Иконки и геометрия контрола

`Icon` предоставляет 26 имён на основе 25 исходных SVG SEDA из `assets/icons/seda`; имена и Figma node IDs перечислены в `assets/icons/seda/icons.json`. Это начальный набор, не полный каталог иконок приложения.

```tsx
import { Button, Icon, TextField } from '@seda-ai/ui';
<Button iconLeft={<Icon name="add" />}>Создать проект</Button>
<TextField label="Поиск" prefix={<Icon name="search" />} />
```

`undo`, `redo`, `more`, `copy`, `trash`, `settings`, `circle`, `monitor` дополняют исходный набор. `data-seda-icon` показывает имя фактически отрисованного glyph. Геометрия оригинальных SVG не перерисовывается; каталог содержит source node IDs и SHA-256. `arrow-left` использует тот же `arrow-right.svg` с CSS-поворотом 180°; `derivedFrom`/`rotation` явно показывают происхождение. Это дополнительное публичное имя, не новый Figma SVG. Направление физической команды задаёт приложение; автоматического RTL-переворота здесь нет.

Иконка наследует цвет и размер слота. По умолчанию она декоративна; самостоятельной смысловой иконке передайте `label`. IconButton должен иметь собственный `aria-label`. SVG и IMG в непосредственном слоте нормализуются по его размерам; составные пользовательские обёртки с абсолютной геометрией требуют собственного адаптера.

Контролы используют `--seda-control-icon-size` с fallback на скомпилированный preset; Button и TextField используют preset gap. В Lab масштаб контролов применяется к font, line и icon одновременно, затем вычисляется высота. `SedaProvider.textScale` по-прежнему управляет типографическими ролями Text: это отдельная настройка, она сама не меняет геометрию контролов. X прибавляется к базовому горизонтальному padding, Y — к вертикальному. Эти параметры не сертифицируют оптическое качество композиции.

## Общая тема и размер

FileUpload также использует общий preset. Он сохраняет естественную многострочную высоту; `files` управляет отображаемым списком, а не native FileList. `disabled`/`state="disabled"` блокируют выбор и drop. `uploading` показывает busy/progress без сетевого запроса; валидация файлов, отправка и reset принадлежат приложению. Подробности: `specs/inputs/file-upload.md` и `docs/library/FILEUPLOAD-VISUAL-HANDOFF.md` в репозитории. Это ещё не executable instance contract.

```tsx
import { SedaProvider, Button, TextField } from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';

<SedaProvider theme="dark" controlSize="m">
  <TextField label="Название" />
  <Button>Сохранить</Button>
  <Button size="s">Локальный S</Button>
</SedaProvider>
```

Вложенные providers наследуют неуказанные настройки. Defaults — light/m; React state сохраняется при смене профиля. `useSedaConfiguration()` возвращает readonly frozen snapshot. CSS и `profiles.json` генерируются из настоящих `tokens.json` и contract system при build в монорепозитории; в consumer исходники и resolver не требуются. Метаданные доступны как `@seda-ai/ui/profiles.json` и не добавляются к JS entry автоматически. Без provider сохраняется каноническая геометрия явно заданных размеров, но для общей темы нужен provider.

Проверка включает 24 сочетания theme/size/width на каждом React runtime, четыре размера без provider, nested scopes, local overrides и loading при смене профиля. Reduced motion/forced colors — smoke checks, без заявления полной accessibility-сертификации. Стили импортируются явно; для source alias всё ещё нужен build CSS, эталонный способ потребления — установленный пакет.

## Меню команд (experimental)

`DropdownMenu` использует shared Button/IconButton, наследуемые профили/темы и portal overlay. Поддерживает группы, separators, реальные shortcuts, disabled/danger, controlled open и keyboard/typeahead. `react-dom >=18` — явная peer dependency. API и ограничения: [Dropdown Menu spec](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/overlays-layout/dropdown-menu.md#14-react-implementation--experimental). Это девятый instance contract общего compiler; DOM snapshots сопоставляются с compiler на React 18/19. Для destructive action приложение открывает подтверждение. Рабочие reference screens ещё требуют реализации.

```tsx
<DropdownMenu triggerLabel="Действия" items={[
  { id: "open", label: "Открыть", onSelect: openDocument },
]} />
```

## Разделяемые рабочие панели (experimental)

`SplitView` — две постоянно mounted панели с pointer/keyboard resize, RTL, controlled/uncontrolled размером, minimum/maximum bounds и явным overflow при нехватке места. Два вложенных SplitView дают три области редактора. `Enter` минимизирует/восстанавливает primary (при minSize=0 — collapse), `Escape` отменяет drag. Host владеет моделью и сохранением. [Полный API, token gaps и ограничения](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/overlays-layout/split-view.md). Instance contract ещё не зарегистрирован; provider/foundation binding не заменяет его.

```tsx
<div style={{height:520}}>
  <SplitView primaryLabel="Объекты" secondaryLabel="Редактор"
    primary={<Objects />} secondary={<Editor />}
    primarySize={width} onSizeChange={setWidth} minSize={120} secondaryMinSize={400}/>
</div>
```

## Вкладки рабочих панелей — API

`Tabs` поддерживает line/pill, наследуемый размер, controlled/uncontrolled выбор, automatic/manual activation, RTL keyboard и сохранение mounted panels. [Полный API и границы](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/navigation/tabs.md#14-react-implementation--experimental). Импорт: `import { Tabs } from "@seda-ai/ui"`. Требуются `label` списка и items с value/label/content.

Tabs проверяется отдельным installed consumer в составе verify:package; Tabs также зарегистрирован восьмым компонентом общего compiler. Полных editor primitives и четырёх reference applications пока нет.

```tsx
<Tabs label="Панели документа" activationMode="manual" items={[
  { value: "properties", label: "Свойства", content: <PropertiesForm /> },
  { value: "history", label: "История", content: <History /> },
]} />
```

## Дерево рабочих объектов — experimental

`Tree` экспортируется из установленного пакета и использует общий SedaProvider, S/M/L/XL и canonical components/tree roles. API: [Tree spec](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/navigation/tree.md). Поддержаны вложенные items, controlled/uncontrolled selection и expansion, multiple/range selection, keyboard/typeahead/RTL и focus repair. Selection не следует за фокусом. Не поддержаны virtualization, lazy loading, drag/reorder и checkbox tree. Десятый executable contract общего compiler проверяет authored facts; browser/AT readiness из compile не выводится.

```tsx
<Tree label="Слои" items={[{id:"frame",label:"Frame",children:[{id:"title",label:"Заголовок"}]}]} defaultExpandedIds={["frame"]}/>
```

## TextArea — multiline input (experimental)

TextArea использует общие S/M/L/XL и собственные canonical `text-area` tokens. [API и ownership D30](../../packages/seda-contracts/TEXTAREA-CONTRACT.md). Rows/native editing, controlled/uncontrolled value, readOnly/disabled/error, counter и clear; autoResize/maxRows ограничивают рост, после cap прокручивается поле. Enter остаётся native вводом новой строки; submit/IME policy принадлежит composer. Ручная высота не сбрасывается при вводе. Native reset поддержан для uncontrolled value; controlled reset — у формы.

```tsx
<TextArea label="Сообщение" value={message} onChange={e=>setMessage(e.target.value)}
  rows={1} autoResize maxRows={8} clearable onClear={()=>setMessage('')}
  showCount maxLength={4000}/>
```

Компонент зарегистрирован одиннадцатым executable contract. Installed React18/19 proofs включают SSR/Strict hydration и DOM/profile measurements. Это не приёмка40 Figma variants, реального IME на каждой ОС, screen reader или native desktop shell. Clear label сейчас русский; общей i18n модели внутренних подписей ещё нет.

## Text и масштаб типографики

19-й public component `Text` использует23 роли foundation. Пример: `<SedaProvider textScale={115}><Text as="h2" variant="heading/section">Раздел</Text></SedaProvider>`. `as` задаёт native outline, `variant` — визуальную роль. Scale80–200 наследуется абсолютно; controlSize независим. CSS содержит те же token values/provenance, что общий compiler; important text minimum12px. Author content/Canvas zoom принадлежат приложению. Подробный контракт: specs/data-display/text.md; роли без prefix type/. Это foundation execution, не12-й registry component contract.


## Feedback и палитра композиций

Badge, Tag, Alert и Toast используют общие preset/font/line/icon/scale. Pill/dot сохраняют смысловую форму; rich feedback растёт по содержимому. Вложенный счётчик Tag — Badge с внутренним view tag-counter. Selectable Tag теперь имеет отдельные native main/dismiss buttons: aria-pressed находится на main; dismiss не меняет selection. Внешний ref остаётся ref обёртки layout. Action/dismiss без handlers недоступны.

Public styles экспортируют все semantic color роли с provenance. Filled brand default/hover/pressed используют blue60/70/80 в обеих темах для контраста белого текста. Status feedback использует согласованные container/text/icon роли. Новые роли и Figma handoff: docs/library/FEEDBACK-VISUAL-HANDOFF.md в репозитории.

Каталог имён/происхождения иконок доступен через export @seda-ai/ui/icons.json; SVG bytes встроены, временные Figma URLs в runtime не используются. Генератор scripts/icon-assets.mjs проверяет каталог и rejects stale generated module при build.

Toast остаётся presentation-компонентом. Исполняемый host: `ToastProvider`, один `ToastViewport` и `useToast()` с notify/update/dismiss/clear. FIFO: 3 видимых +50 ожидающих, dedupe сохраняет ID/позицию; overflow возвращает null. Таймер начинает отсчёт после показа, сохраняет остаток при hover/focus/неактивном окне и remount viewport. Action/warning/error persistent по умолчанию. Приход не перемещает фокус, Escape закрывает сфокусированный item. Placement задаёт приложение внутри SEDA scope. Подробные границы и duration policy: spec Toast. AT/OS-приёмка и instance contract остаются открытыми.

## Constrained actions

`Button fullWidth` удерживает ширину в parent, включая длинный label и icon slots. Однострочная подпись получает ellipsis; полное имя остаётся доступным, а приложение передаёт полный native `title` для компактных навигационных строк. Критические действия лучше размещать шире или группировать вертикально. Многострочная геометрия ещё не входит в Button contract. Loading измеряет реальный ограниченный border box.

DropdownMenu ограничивает текстовый trigger доступной шириной, используя этот публичный Button recipe и полный triggerLabel в title. API и семантика меню не меняются.


### Tooltip
`Tooltip` accepts plain `content`, `variant="default"|"light"`, `placement="top"|"bottom"|"left"|"right"`, `disabled`, `describedBy` and a render function child. Spread its ref and aria-describedby onto the real trigger. It does not provide the trigger's accessible name. `IconButton tooltip="..."` binds the same runtime automatically; `title` remains native only when tooltip is absent. Hover350ms, focus immediate, Escape/click dismissal, hoverable surface, no auto-dismiss, document-exclusive, existing descriptions preserved. Surface geometry is experimental; Text caption/default follows provider textScale. Arrow/size/controlled delay are not public props. Disabled actions need a visible alternative explanation. Test coverage does not certify screen-reader/desktop-shell support.

### Plain appearance для составной поверхности (experimental)

`appearance="outlined"` — прежнее поведение по умолчанию. `appearance="plain"` нужен для composer внутри общей поверхности: убирает только собственную заливку и видимую рамку default/hover/active/focus/readOnly. Геометрия, X/Y, autoResize, accessible label и focus ring сохраняются; error и disabled используют прежние component tokens. Forced colors сохраняет видимую границу. Оболочка приложения отвечает за общую поверхность и layout, не меняет внутренние элементы TextArea. Причина нового API: прежний TextArea нельзя было встроить в единую поверхность без произвольных вложенных CSS overrides. Это документированное расширение runtime, не новый Figma variant и не доказательство визуального совпадения всей библиотеки.

Текстовый trigger DropdownMenu содержит trailing chevron из каталога SEDA; iconOnly не получает вторую иконку. Это общий признак раскрытия во всех приложениях; имя действия и keyboard policy сохраняются.


### Table (experimental)

```tsx
const columns: TableColumn<Project>[] = [
  {key:'name', header:'Проект', type:'text', sortable:true, render:row=>row.name},
  {key:'budget', header:'Бюджет', type:'numeric', render:row=>formatCurrency(row.budget)},
];
<Table label="Проекты" columns={columns} data={visibleProjects}
  rowKey={row=>row.id} rowLabel={row=>row.name}
  sort={sort} onSortChange={setSort}
  selectedRowKeys={selection} onSelectionChange={setSelection}
  loading={pending} errorState={error} onRetry={reload}
  density="medium" fixedHeader maxHeight={480} minWidth={720}/>
```

Приложение само сортирует/фильтрует data либо делает запрос. Table сохраняет off-page keys при выборе текущей страницы; disabled rows не меняются. Refresh с сохранёнными data удерживает body; empty/error используют последнюю высоту как minimum и сохраняют ширины колонок. Feedback растёт по содержимому, если minimum недостаточен. `rowActions(row, {disabled,loading})` и custom render отвечают за доступность вложенных controls. Типы `TableColumn`, `TableSort`, `TablePagination`, `TableCellContext`, `TableProps` экспортируются. Native table/scroll, controlled pagination/expansion; grid navigation, virtualization и inline editing отсутствуют. Полный текущий API и границы — `specs/data-display/table.md`, секция15. Component geometry не является новым executable registry contract; fresh Figma/AT/OS review открыт.


### ChatBubble (experimental)

```tsx
<ChatBubble sender="ai" author="SEDA Assistant" aiLabel="AI · сгенерированный ответ"
  appearance="plain" contentType="text" content={response || 'Ожидание ответа…'}
  streaming announcementPolicy="status-only" statusLabel="Ответ формируется"
  actions={<Button onClick={copyWithSource}>Копировать ответ</Button>}/>
```

Text/rich/code/file/image/audio используют явные content models, native media и реальные вложенные actions. Автор и AI label, error/recovery, streaming policy и empty-content guards обязательны. Theme/Text/radius/X/Y общие; plain view не создаёт поверхность. Компонент не запускает запрос и не владеет thread/scroll/clipboard. Полный API и границы: `specs/data-display/chat-bubble.md#react-runtime`; instance contract/Figma/AT review ещё открыт.

### Avatar / AvatarGroup / Card (experimental)

```tsx
<Avatar name="Анна Смирнова" src="/anna.png" status="online" statusLabel="В сети" />
<AvatarGroup label="Участники команды" items={members} maxVisible={3}
  overflowLabel="Показать всех участников" onOverflow={showMembers}/>
<Card title="Atlas workspace" variant="selectable" interactiveStrategy="selectable"
  selected={selected} onSelectedChange={setSelected}
  description="Документы, задачи и обсуждения команды"
  metadata="Core · обновлено сегодня" actions={<Button onClick={openProject}>Подробнее</Button>}/>
```

Avatar сохраняет named diameter/circle: image→initials→original glyph, late load/error guard, доступные status и native actions. alt="" устраняет дублирование соседнего имени. AvatarGroup overflow требует настоящего действия и сохраняет порядок владельца; group sizes s/m/l/xl. X/Y/textScale не растягивают identity frame.

Card использует общие Text roles и existing Card tokens; X/Y увеличивают foundation padding. Content/actions-only, explicit Checkbox selection и text-only native whole-card action разделены типами. Нет elevated и смешанного whole-card/rich interactive content. Loading сохраняет содержимое/геометрию с progress line/status; вложенные actions владелец блокирует сам. Реальные Projects/Team используют эти exports и общий selection Table. Surface geometry/Avatar dimensions остаются experimental, instance contracts ещё не введены. Полный текущий API и ограничения: specs/data-display/card.md и avatar.md, section15; fresh Figma/OS/AT review открыт.

### TopBar (experimental)

`TopBar` — общий заголовок приложения: app-bar/application/page-header/transparent, provider size/theme/X/Y и существующие Top Bar token roles. Files, Building и Chat используют установленный export. Named slots сохраняют владельцев действий и поиска; `gutter=compact|regular|wide` задаёт foundation12/16/24 px. Application navigation использует native Link и явный inline/dialog режим с настоящим Modal, keyboard/RTL и focus return. Владелец scroll передаёт state=scrolled. API и fallback geometry: specs/navigation/top-bar.md, React runtime. Нового executable registry contract нет; Figma/AT review открыт.

`Icon` теперь отклоняет неизвестные имена и prototype keys в JavaScript runtime; TypeScript по-прежнему ограничивает имена исходным каталогом25 glyphs. Пустой mask вместо изображения больше не возникает молча.
### Sidebar (experimental)

`Sidebar` объединяет persistent navigation Files/Chat: ordered sections, native link/action items, selectedKey, full/collapsed, provider size/theme/X/Y, controlled group collapse и loading status. Header/footer и ширина остаются host-owned. Свёрнутые items требуют исходную Icon и сохраняют label/Tooltip; keyboard сохраняет native Tab order. Explicit link/action types защищают route semantics. Полный API, причины дополнительных props и ограничения — specs/navigation/sidebar.md, React runtime. Нового registry contract нет.
### Accordion (experimental)

`Accordion` объединяет inspector disclosure sections Framer/Webflow/Spline: required single/multiple mode, explicit controlled owner, required-open policy, native triggers/headings, optional roving keyboard и focus repair. Hidden panels остаются mounted по умолчанию и сохраняют invalid draft/validation; forceMount=false разрешает reset. Surface density compact/medium/large отделена от provider S/M/L/XL controls. API, token roles и fallback geometry: specs/data-display/accordion.md, React runtime. Loading/error остаются содержимым приложения; registry instance contract ещё не введён.

### Popover (experimental)

Controlled nonmodal anchored host: обязательные open/onOpenChange, title, closeLabel и render-prop trigger с реальными Button/IconButton bindings. Компактный content/footer, safe outside-focus dismissal, Tab без trap, explicit focus targets, Menu/Modal hierarchy, logical alignment/collision, inherited compiler styles и native top layer/fixed fallback. Files news и Chat share используют installed export без смены document/save/request owners. Nested Popover запрещён; dirty content остаётся у owner. Geometry/token gaps и весь API: specs/feedback/popover.md, React runtime. Новый registry instance contract, Figma/AT/OS approval не заявлены.

### Slider (experimental)

Controlled horizontal `mode=single|range`, required numeric value/owner and visible label. Range requires two thumbLabels and an ordered pair; native inputs preserve form semantics and Tab order. Existing color tokens, profile sizes, compiler font/icon/height/extra-X inheritance, nearest-thumb rail gesture, keyboard/RTL, bounds and parent fieldset disabled are supported. Four Lab parameters use the installed export; range/state examples stay explicitly experimental. D31 adds an executable registry instance contract, a browser-safe numeric core shared with React, and documented geometry with provenance. Build packages that core inside dist/internal; consumers need no checkout dependency. No defaultValue or vertical mode. API, numeric grid restrictions, geometry gaps and AT limits: specs/inputs/slider.md and packages/seda-contracts/SLIDER-CONTRACT.md.

### NumberField (experimental)

Controlled raw-string numeric input composed from actual TextField, with required label/value/onValueChange, finite min/max, positive step, Mixed and partial buffers. Up/Down/Page/Home/End preserve decimal/large offsets and bounds; native text editing, IME, disabled/readOnly/fieldset and FormData are retained. The owner controls commit, undo and save; raw buffers never become a second document model. D32 is executable, using the same bundled numeric core in React/Node. Visual colors and geometry explicitly reuse TextField. CSS custom properties from native style reach all TextField slots; ordinary styles keep their input target. Sandbox/Spline numeric properties and Lab examples use the installed export. Localized parsing, pointer stepper/scrub policy and Figma/OS/AT acceptance remain open. Full API: specs/inputs/number-field.md.
