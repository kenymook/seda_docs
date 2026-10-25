# Component Maturity Matrix

Актуальная оценка: 2026-10-25. Цель — зрелая библиотека для веб- и десктоп-приложений, на которой можно собрать интерфейсы уровня Figma, Notion, ChatGPT и Cloude Design. Зелёный token scan, количество specs и число DOM-измерений не доказывают достижение этой цели.

## Текущее состояние React-реализации

| Область | Авторитетное основание | Статус |
| --- | --- | --- |
| Исполняемый пакет | `packages/seda-ui/src/index.ts`: 33 component entry modules плюс provider/host APIs | Реальная реализация, не полная библиотека |
| Контракты | 11 executable control contracts и 8 общих профилей | Проверяемое ядро; feedback/FileUpload/Modal instance contracts ещё отсутствуют |
| Иконки | Исходные SVG + Figma node IDs + генератор/публичный каталог | 25 исходных glyphs; полнота для всех приложений не достигнута |
| Совместные приложения | 8 reference routes, 9 исходных Figma frames | Работают на установленном пакете; визуальное соответствие требует отдельной приёмки |
| Визуальная согласованность | Текущие доказательства: `verification/inspectors-v43/release.json` и предыдущий `verification/dense-v42/` в pilot | Общие glyph slots/foreground/optical bounds и inspector recipe перенесены на reference apps; 160 selected samples и 32 визуальных кадра. Полная приёмка всех states/surfaces/Figma/OS/AT открыта |
| Modal | Public native dialog + common WorkspaceDialog in 8 reference apps | Реальный React-компонент; 32 production route/theme/density samples и package React18/19 PASS; surface geometry experimental, Figma fidelity и surface-family executable contract открыты |
| Tooltip | Public text-only Tooltip and IconButton.tooltip in 4 reference apps | 45 package groups before final keyboard listener; final Tooltip21 workflows and 16 matrix samples per React18/19, plus production Tooltip64/Modal32/text24, source hashes783. Experimental geometry; no surface instance contract or AT/Figma acceptance |
| Visual reference: Building | Fresh Figma context/metadata/render 2026-10-25, node1:84 | Authored36 text boxes: X0/Y≤0.167px;3 guides and3 action bindings checked. Shared Tree host paint fixed. Exact source coordinates depend on installed Segoe UI; portable fallback flow tested separately and Linux fidelity unverified. Full-screen chrome/other8 frames remain unaccepted |
| Table | Public generic native Table, Projects/Team use installed package; source aliases removed from main Lab | Experimental: controlled sort/selection/expansion/pagination, data states, density/scroll. [v44 report](2026-10-25-native-table.md):47 installed-package groups,48 Table samples per React18/19,60 production workspace cases. Separate instance contract, advanced grid and fresh Figma/AT/OS acceptance remain open |
| Card / Avatar / AvatarGroup | Public native entity surfaces and identity fallback; Projects/Team use installed package | Experimental: controlled Card/Table selection, independent actions, real group overflow, image/transition guards; [v45 report](2026-10-25-entity-surfaces.md):49 package groups,48 samples per React18/19 and60 production workspace cases. Full variants, instance contracts, Figma and target OS/AT acceptance remain open |
| ChatBubble / TopBar | Public message models and shared Files/Building/Chat headers; installed package and production proofs v46/v47 | Experimental: content/action/request ownership retained, TopBar72/inspector160/glyph95 production cases. Instance contracts/Figma/AT review open |
| Sidebar | Общий installed export в Files/Chat вместо локальной навигации; native links/actions, named groups, controlled collapse и local scroll | Experimental; current local verification/report: [Sidebar](2026-10-25-sidebar.md). Нового instance contract нет, Figma/AT/OS review открыт |
| Accordion | Public installed component в Framer/Webflow/Spline; disclosure state, native semantics, form retention и focus repair | Experimental; [текущий отчёт](2026-10-25-accordion.md). Новый instance contract/Figma/AT/OS review открыт |
| NotificationCenter | Общий компонент и реальная локальная история операций Files; фильтры/read ownership, loading/error/retry, независимое от файлов storage | Experimental; [приватная v50 и production proof](2026-10-25-notification-center.md). CI head5e687fd success во всех4 группах. Новый instance contract, fresh Figma/AT и overlay host acceptance открыты |
| Search | Общий query/results pattern с snapshot identity, реальными Files filter и Chat Modal consumers | Experimental; [текущий проход](2026-10-25-search.md). Приватная v51;61 package groups,45 scripts и runtime Linux CI пройдены. Production inspectors160/glyph95, реальные owner-browser переходы проверены; полный production Search runner ограничен приватной авторизацией новой вкладки. Instance contract/Figma/AT/OS и standalone anchored overlay открыты |
| Popover | Controlled nonmodal host, installed Files news / Chat share; source tokens, native/fallback, focus ownership and Search overlay composition | Experimental; [текущий проход](2026-10-25-popover.md). Приватная v52;63 package groups,46 scripts, production Popover48+4 / inspector160 / glyph95. Полные результаты и границы в отчёте. Instance contract/Figma/AT/OS approval открыты |
| Slider | Controlled native single/range export; four actual compiler parameters and explicit range/state examples | Experimental; private v53, package65 / scripts47 / production Slider16 + inspector160/glyph95. [Proof and limits](2026-10-25-slider.md); instance contract, Figma/OS/AT acceptance open |
| Browser/OS/AT | Chromium package и application checks | Firefox/WebKit, screen readers и native desktop shell не сертифицированы |
| Figma → code mapping | Сохранённые node IDs и исходные assets | Code Connect и полная актуальная fidelity-приёмка не завершены |

Обязательные условия готовности: реальные SEDA-компоненты вместо макета, управляемые общими параметрами контроли и типографика, согласованные icon/text/padding/состояния, рабочие сложные экраны, проверенные keyboard/focus/persistence/async сценарии, сопоставление с исходными Figma frames и целевыми browser/OS/AT. Каждый пункт требует соответствующего по объёму доказательства. Ни один частный зелёный тест не заменяет приёмку всей библиотеки.

Открыты оставшиеся состояния и поверхности сложных редакторов, полнота public icon catalog, все component variants/backgrounds/popups, полный RTL, системная accessibility и performance. Текущая библиотека не объявляется Level 3 или production-ready на основании архивного Figma health score.

## Визуальный проход Files и перенос правил — 25.10

Первый плотный экран Files получил optical/theme glyph adapter,24px gutters/gaps, общий radius и flow layout filters. Shared menu disclosure и action rhythm применены к8 routes; просмотрены16 theme/route screenshots и6 Files states. Composer использует public TextArea plain. Проверки:123contracts,45installed-package groups, Files48 иComposer48 parameter samples. Это частичная визуальная приёмка; остальные source icon families, inspector density и полный Figma/OS/AT review открыты. [Результаты и границы](2026-10-25-dense-visual-consistency.md).

## Архивная оценка Figma от 2026-06-12

Ниже сохранён прежний отчёт snapshot `2026-06-12T16:52:43.458Z`. Его “Done”, scan score 100, owner approval и “Strong” относятся только к тем историческим проверкам. Они не являются текущим статусом React runtime, визуальной готовности или всей цели. Эта архивная часть требует нового аудита при использовании её сведений.

## Latest Scan Results

The `2026-06-12T16:52:43.458Z` scan captured the Button System rename, IconButton visual-token alignment, Tag rebinding, Button Social removal, Badge tone expansion, and Notification Center retry Button delta.

| Component | Live state | Required next step |
|---|---|---|
| Icon Button | Scan confirms `Button / IconButton`, 144 Button-compatible variants, quality score `100`, unstyled text `0`, raw fills/strokes `0`, audit warnings `0`, and no direct semantic bindings. Live validation also reports root fill, root stroke, icon/spinner fill and focus ring match Button across all 144 combinations. | Done. |
| Badge | Scan confirms 256 variants with `variant/state/size/tone`; `tone=neutral/brand/info/success/warning/danger/ai/disabled`; quality score `100`. | Done. |
| File Upload | Scan confirms API `variant/state/size`, all text styled, and quality score `100`. | Done. |
| Top Bar | Scan confirms API `variant/state/size`, corrected role semantics, and quality score `100`. | Done. |
| Chat Bubble | Scan confirms API `sender/contentType/deliveryStatus/size`, 256 variants, all text styled, and quality score `100`. | Done. |
| Notification Center | Scan confirms 40 variants, state/content fixes, all text styled, and quality score `100`. | Done. |
| Notification Center retry action | Latest scan captures the live Button-instance fix. Notification Center has 40 variants, `nodeCount=1729`, unstyled text `0`, raw paints `0`, audit warnings `0`, and quality score `100`. | Done. |
| Tag quality polish | Scan confirms `Tag / Interactive` and `Tag / Selectable` no longer use direct semantic `surface/base` or legacy `focus/base`; both now have quality score `100`. | Done. |

## Priority Backlog

### P0 — Governance And Traceability

| Task | Scope | Done when |
|---|---|---|
| Assign owners | All 52 specs | Done: production specs use `Owner · Kenymook`. |
| Replace placeholder Figma links | Public specs | Done: every production spec has a real `figma.com` node link; only the reusable template keeps `TBD`. |
| Introduce readiness status gate | All specs | Done: all 52 production specs are marked `ready`; future changes must keep owner, real Figma link, token mapping, visual QA, accessibility review, and open questions current. |
| Add release audit entry | Repo | `CHANGELOG.md` records API/visual/token changes before release. |

### P1 — Public API Normalization

| Task | Components | Target contract |
|---|---|---|
| Normalize size values | Avatar, Avatar group, Table | Done in saved inventory: public sizes use named scales; density is separate from size. |
| Normalize prop casing | Link, Property List, Alert | Done in saved inventory: public variant props use lower camel/kebab consistently. |
| Replace ambiguous `type` | Done for current P1 batch | Remaining API work is strategic, not a simple `type` rename. |
| Remove standalone provider button primitive | Button Social | Done and captured: `Button Social` and `Button Social Group` no longer appear in saved inventory. Use Button and Button Group for provider auth scenarios; provider logo remains approved artwork inside Button. |

### P2 — Visual QA And UX State Completeness

| Component | Risk | Required work |
|---|---|---|
| Chat Bubble | AI/system sender contract is represented and captured with quality score `100`; `code/rich`, `sending/edited/streaming`, and dedicated AI/system tokens remain roadmap gaps. | Decide whether roadmap content/status states should become Figma variants or stay code-level patterns. |
| Top Bar | Variant-role fix is captured with score `100`. | Spot-check final release health only. |
| File Upload | Density/readability fix is captured with quality score `100`. | Done for current pass. |
| Notification Center | Error action decision is closed and captured: retry is a real Button instance in every error variant; latest scan remains score `100`. | Done for current pass. |

### P3 — AI-ready Handoff And Code Mapping

| Task | Scope | Done when |
|---|---|---|
| Create component registry | All public components | Done: `reports/component-registry.md` maps 52 production specs to Figma nodes, inventory matches, aliases, and next gaps. |
| Add Code Connect mappings | Priority components first | Planned in `reports/code-connect-plan.md`; canonical package, Wave 1 review, and Wave 2 Badge/Tag/Alert/Toast/FileUpload source exports are ready, but real mappings are blocked by Figma Code Connect access. |
| Add validation prompts to workflow | Design review and handoff | Done: `reports/validation-workflow.md` defines pass/fail validation stages for scope, component usage, tokens, visual QA, accessibility, handoff, AI output, and release. |
| Create release checklist | Repo + Figma | Done: `reports/release-checklist.md` defines scan, health, visual QA, docs, token, accessibility, handoff, Code Connect, and changelog gates. |

## Component Matrix

Legend:

- **Spec**: markdown status from the component spec.
- **Figma**: matched component from inventory.
- **API**: public API risk observed from inventory.
- **Blocker**: remaining review note, if any.

| Component | Spec | Figma | API | Main blocker |
|---|---|---|---|---|
| Button Group | ready | ButtonGroupHorizontal / ButtonGroupVertical | OK | Real Figma links added; verify alias coverage after fresh scan. |
| Button | ready | Button / Button | OK | Button System scan confirms 144 variants and quality score `100`. |
| Icon Button | ready | Button / IconButton | OK | Scan confirms visual-token alignment and score `100`. |
| Link | ready | Link | OK | Decision captured: semantic variants stay code/handoff token intent; canonical Figma API remains `textStyle/state/strong/visited/size`. |
| Accordion | ready | Accordion | OK | Real Figma link added. |
| Avatar | ready | Avatar | OK | Figma API normalized to `size=xxs/xs/s/m/l/xl`. |
| Badge | ready | badge | OK | Scan confirms `variant/state/size/tone`; `packages/seda-ui` export is ready. |
| Card | ready | Cards | OK | Real Figma link added. |
| Chat Bubble | ready | Chat Bubble | OK | Scan confirms `sender/contentType/deliveryStatus/size`, `sender=ai/system`, readable delivery labels, and quality score `100`; `code/rich` and streaming states remain roadmap/code-level gaps. |
| Chip | ready | Chip | OK | Ready. |
| Description List | ready | Description List | OK | Real Figma link added. |
| Divider | ready | divider | OK | Figma API normalized to `style/text/vertical/size`. |
| Property List | ready | PropertyList | OK | Figma API normalized to `variant/density`. |
| Stat / Metric | ready | Stat Metric | OK | Ready. |
| Table | ready | Table | OK | API normalized to `density`. |
| Tag | ready | Tag / Read-only, Tag / Selectable, Tag / Interactive | OK | Scan confirms Selectable/Interactive binding polish and score `100`; `packages/seda-ui` export is ready. |
| Timeline | ready | Timeline | OK | Ready. |
| Alert | ready | Alert | OK | Figma API normalized to `variant/size`; `packages/seda-ui` export is ready. |
| Empty State | ready | Empty State | OK | Figma API normalized to `reason/size`. |
| Modal / Dialog | ready | Modal | OK | API normalized to `variant/size`. |
| Popover | ready | Popover | OK | API normalized to `variant/size`. |
| Progress Bar | ready | Progress Bar | OK | Ready. |
| Skeleton | ready | Skeleton state animation | OK | Ready. |
| Spinner / Loader | ready | Spinner | OK | Ready. |
| Toast / Snackbar | ready | Toast | OK | Figma API normalized to `intent/dismissible/size`; `packages/seda-ui` export is ready. |
| Tooltip | ready | Tooltip | OK | API normalized to `variant/placement/arrow/size`. |
| Checkbox | ready | checkbox | OK | Ready. |
| Color Picker | ready | ColorPicker | OK | API normalized to `variant/size/state`; real Figma link added. |
| Date Picker | ready | DatePicker | OK | API normalized to `selection/size/state`. |
| File Upload | ready | File Upload | OK | Scan confirms API `variant/state/size`, `s` helper readability, disabled contextual reason, quality score `100`, and `packages/seda-ui` export is ready. |
| Radio | ready | radio | OK | Ready. |
| Segmented Control | ready | Segmented Control | OK | Ready. |
| Select | ready | Select | OK | API normalized to `selection/size/state`. |
| Slider | ready | Slider | OK | API normalized to `mode/size/state`. |
| Text Area | ready | TextArea | OK | Ready. |
| Text Field | ready | TextField variants | OK | Verify registry alias and code mapping. |
| Time Picker | ready | TimePicker | OK | API normalized to `variant/size/state`. |
| Toggle | ready | Toggle | OK | Ready. |
| Verification Code | ready | Verification Code | OK | Ready. |
| Breadcrumbs | ready | Breadcrumbs | OK | API normalized to `variant/separator/size`. |
| Drawer | ready | Drawer | OK | Ready. |
| Pagination | ready | Pagination | OK | API normalized to `variant/size`. |
| Sidebar / Navigation Menu | ready | Sidebar | OK | Ready; Menu alias should be explicit in registry. |
| Stepper | ready | Stepper | OK | Ready. |
| Tabs | ready | Tabs | OK | API normalized to `variant/size`. |
| Top Bar / Navbar | ready | Top Bar | OK | Saved scan confirms API `variant/state/size`; Figma distinguishes `app-bar`, `application`, and `page-header` roles. |
| Container | ready | Container | OK | API normalized to `variant/state/size`. |
| Dropdown Menu | ready | DropdownMenu | OK | API normalized to `variant/size`. |
| Form | ready | Form | OK | Ready. |
| Grid | ready | Grid | OK | Ready. |
| Notification Center | ready | Notification Center | OK | Latest scan captures the `Retry loading` Button-instance delta with quality score `100`. |
| Search | ready | Search | OK | API normalized to `variant/state/size`. |

## Next Recommended Step

Continue with **Wave 2 package growth while Code Connect access is blocked**. `packages/seda-ui` TypeScript validation passes through the local Node command; Figma-side Code Connect remains blocked by required Developer seat / Organization or Enterprise access.

1. Review the new experimental ChatBubble export/real consumer; continue Wave2 app-shell coverage without calling partial runtime full Figma acceptance.
2. Continue the breadth batch from `reports/package-export-coverage.md`: TopBar, NotificationCenter, Search, and DropdownMenu.
3. Enable a Figma Developer seat in an Organization or Enterprise plan for Code Connect access.
4. Create Wave 1 Code Connect mappings and run retrieval tests once access is available.

## 25.10 — продолжение: glyphs и инспекторы

[Текущий проход](2026-10-25-inspector-icon-consistency.md) переносит optical/theme/source-alpha adapter на остальные7 reference apps и общий section16/field8/label4 recipe на существующие inspector families. Проверены160 selected parameter/theme/width samples и95 painted glyph variants; просмотрены32 снимка. Это закрывает ограниченный объём согласованности показанных панелей, сохраняя открытыми все variants/states, полноту public icon catalog, Figma fidelity и target OS/AT. Исторические замечания выше к иконкам/плотности уточнены этим объёмом, а не превращены в утверждение о готовности всей библиотеки.

## 25.10 — native Table и поставка пакета

Текущий следующий шаг — [общий ChatBubble](2026-10-25-chat-bubble.md): public experimental API, реальный Chat consumer и shared Table/Card вместо локальных message compositions.26 entry modules не означают26 готовых specs. Source/contracts всё ещё требуют Figma/AT/OS review; registry остаётся11 control contracts. Подтверждённая публикация — приватная v46, а не завершение общей цели.

Добавлен реальный public Table вместо локальных HTML tables в Projects/Team. Весь корневой Lab переведён с source alias на installed ESM; metadata проверяет отсутствие source imports и реальные bytesInOutput компонентов. Table использует существующие component color tokens и compiler typography/geometry fallbacks; новый registry instance contract не объявлен. Advanced data grid (virtualization, cell editing/navigation, pin/resize/reorder), public Card/Avatar и полный review по исходным Figma и целевым platform/AT всё ещё необходимы для общей цели.
