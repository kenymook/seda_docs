# SplitView

> **Category** · Overlays & Layout
> **Version** · 0.1 experimental
> **Status** · needs-review
> **Owner** · Kenymook
> **Last reviewed** · 2026-10-23
> **Figma** · отдельный library component отсутствует; требуется system review

## 1. Назначение

SplitView — две постоянно mounted рабочие панели и управляемый разделитель. Вложение двух SplitView даёт три области editor/workspace: навигация, canvas, inspector. Container/Grid задают статическую компоновку, Sidebar — навигацию; они не предоставляют pointer capture, keyboard resize, bounds и ARIA value. Поэтому нужен отдельный общий primitive, а не частный drag handler в каждом редакторе.

Используйте для редакторов, документных/диалоговых рабочих пространств и инспекторов. Для карточек, обычной сетки или временного overlay используйте соответствующие компоненты. SplitView не владеет route, моделью объектов, undo/history или хранением приложения.

## 2. Anatomy

| Часть | Роль |
|---|---|
| root | Grid внутри наследуемого SedaProvider; forwarded ref на HTMLDivElement |
| primary | Region с primaryLabel; размер задаётся в CSS px |
| separator | Focusable separator, имя primary панели/описание её размера, aria-controls primary ID |
| secondary | Region с secondaryLabel; оставшееся место с собственным минимумом |

Root и панели имеют min-width/min-height 0 и собственные scroll areas. Дочерние компоненты не размонтируются при resize, смене темы, collapse или ориентации. Родитель задаёт доступную ширину и **определённую высоту**, например контейнер height 520px.

## 3. API и новые решения

Экспорт: SplitView / SplitViewProps / SplitViewResizeReason из @seda-ai/ui. Стили включены в @seda-ai/ui/styles.css. API — experimental code mapping; его нельзя выдавать за существующие Figma variants.

| Prop | Default | Назначение |
|---|---|---|
| primary / secondary | required ReactNode | Постоянные slots содержимого |
| primaryLabel / secondaryLabel | required nonempty string | Accessible names панелей |
| separatorLabel | primaryLabel | Имя primary панели или её resize-команды |
| orientation | horizontal | Раскладка слева/справа или сверху/снизу; ARIA orientation разделителя перпендикулярна |
| primarySize | undefined | Controlled requested extent primary в CSS px |
| defaultPrimarySize | 240 | Начальный uncontrolled requested extent |
| minSize / secondaryMinSize | 160 / 160 | Минимумы панелей в CSS px |
| maxSize | undefined | Дополнительный максимум primary |
| resizeStep / largeResizeStep | 8 / 32 | Keyboard step и Shift+step в CSS px |
| disabled | false | Запрет resize; separator исключён из Tab order |
| onSizeChange(size, reason) | optional | Requested размер после пользовательского действия |
| onResizeEnd(size, reason) | optional | Последний committed rendered размер после действия |

Причины: pointer, keyboard, cancel. Controlled primarySize требует onSizeChange и запрещает defaultPrimarySize. Все числа конечные и неотрицательные; steps положительные, maxSize не меньше minSize. Размер layout не является S/M/L/XL размером контрола: плотность потомков наследуется от SedaProvider независимо.

Новые props нужны для host ownership размеров, ограничений и accessibility; произвольные variants, цвета и component tokens не добавлены. Нет size:"s"/"m" у layout. Root получает обычные div attributes/style; host может перехватить событие через preventDefault. Нельзя переопределять внутренний grid template.

## 4. Bounds и resize

Для доступного content extent E и разделителя 8 px:
- available = max(0, E − 8);
- total = max(available, minSize + secondaryMinSize);
- upper = max(minSize, min(maxSize ?? total, total − secondaryMinSize));
- rendered primary = clamp(requested, minSize, upper).

Если места меньше суммы минимумов и divider, root имеет data-overconstrained и scroll. Минимумы не игнорируются ради зелёного screenshot. Приложение решает, когда скрывать/collapse панели или переключать layout. Пересчёт контейнера сам не вызывает callback; исходный requested размер восстанавливается при расширении. Во время drag учитывается CSS transform scale и RTL direction.

### Композиция редактора: боковой / нижний инспектор

В reference-приложениях Sandbox, Spline, Webflow и Framer используется общий `references/editor-dock.tsx`. Это композиция над установленным SplitView, а не новый public export или Figma variant.

Доступная ширина измеряется у контейнера редактора. Если она меньше суммы читаемого минимума canvas, минимума inspector и divider, тот же SplitView переключается в vertical. Canvas остаётся сверху, inspector получает ширину редактора снизу; разделитель регулируется клавиатурой и указателем. Контролы сохраняют применённые размеры и типографику. В широком контейнере возвращаются две колонки.

Минимум canvas — `max(384px, 18 × применённый font-size + 2 × fieldPaddingX + 32px)`. Это проверяемая вместимость композиции, не новый размер контрола или токен. Минимум инспектора задаёт приложение по своему содержимому. Предпочитаемая пользователем ширина inspector не становится responsive minimum: иначе обычный resize мог бы сам запустить reflow и прервать жест. Если обе области не помещаются по высоте, SplitView сохраняет минимумы и локальную прокрутку.

Дерево React и DOM полей не перестраивается. При изменении ориентации должны сохраняться фокус, каретка, черновик, выделение документа и preview. Requested horizontal width принадлежит приложению; высота нижнего canvas — отдельное состояние вида текущего сеанса. Reflow не вызывает document commit/save и не перезаписывает горизонтальную ширину ограниченным значением. Полная независимая Figma/OS/AT приёмка этой композиции остаётся открытой.

Вертикальный минимум относится к самому viewport, а не сумме viewport и инструментов. Композиция измеряет chrome вокруг canvas, включая toolbars/status и их переносы, и добавляет сохранённый минимум viewport: Framer350px, Sandbox320px, Webflow/Spline240px. Если исходная область уже переполнена, учитывается scrollHeight родителя, чтобы не принять обрезанную высоту за полную. ResizeObserver обновляет этот бюджет после изменения шрифтов, отступов и контейнера. При нехватке общей высоты остаётся локальная прокрутка, а не уменьшение canvas ниже минимума.

Pointer capture удерживает gesture за границами divider. Pointer up завершает действие. Escape/pointercancel/window blur отменяют drag; после изменения восстанавливается исходный requested extent, включая случай, когда контейнер его временно ограничивал. onResizeEnd сообщает фактический размер после commit, а не отклонённое предложение. При disable/смене ориентации/unmount захват очищается; поздние end callbacks после unmount игнорируются.

## 5. Клавиатура и доступность

- Tab/Shift+Tab — фокус разделителя и обычный порядок потомков.
- ArrowLeft/Right — horizontal layout; RTL учитывает физическое направление.
- ArrowUp/Down — vertical layout.
- Shift — большой шаг; Home/End — границы.
- Enter — minimum/последний развёрнутый размер. При minSize=0 primary полностью скрывается.
- Escape во время drag отменяет его.
- Нулевая панель остаётся mounted, но visibility:hidden и aria-hidden исключают невидимый контент; если её элемент имел focus, он переводится на divider.

aria-valuenow/min/max — проценты от полного логического extent панелей; aria-valuetext — CSS px. aria-controls указывает primary region. Focus ring не зависит только от hover. Вынужденный scroll при невозможных минимумах объявлен явно.

Ориентир: [W3C APG Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) (прочитан 2026-10-23). APG отмечает незавершённый review самого pattern. Это ориентир для семантики и клавиатуры, не основание заявлять полную совместимость с assistive technologies. F6 pane cycling не реализован. Screen readers, touch и native desktop требуют отдельных проверок.

## 6. Токены и визуальный adapter

Отдельной component token family SplitView нет (**Token gap**). Используются существующие semantic surface/base, border/subtle, focus/ring. Public build генерирует их из canonical tokens; common compiled profile предоставляет foundationTokens с provenance, web adapter связывает их с CSS. Нет приватной цветовой палитры на каждом instance.

Приватные geometry constants: separator hit area 8 px, линия 1 px, focus outline 2 px. Это явно описанные временные code adapters; не новые canonical token paths. Touch target 44px не обещан. Нет motion/resize animation; forced-colors использует системные Canvas/CanvasText/Highlight. Public stylesheet самодостаточен, root theme scope наследуется.

## 7. Handoff и проверка

Installed tarball consumer React 18/19 проверяет SSR/hydration/StrictMode, typed API, keyboard/RTL, pointer capture, Escape, controlled rejection, committed callback, clamp/restore requested intent, transform, nested drafts, overconstrained layout и unmount во время gesture. Отрицательные runtime случаи отклоняются. Точные результаты — в packages/seda-ui/verification/split-results.json после завершённого прогона.

В Lab добавлена страница редактора: два вложенных SplitView, связанные реальные SEDA controls и preview, история до 50 изменений, явное browser-local сохранение модели и размеров с reload/error handling. Это демонстрационная композиция; она не подтверждает ни полный Tree, ни canvas editor, ни точное соответствие Figma references.

SplitView пока **не зарегистрирован** как instance contract общего compiler; foundation token binding не подменяет такой контракт. Требуется отдельное согласование layout/state contract. Остальные девять component contracts сохраняются.

## 8. AI usage rules

AI использует только описанные props и состояния. Не добавляет undocumented collapse/reorder/close/persistence APIs и не называет компонент ready по количеству browser combinations. Token gaps и непроверенные platforms сохраняются в handoff. Человек проверяет финальное соответствие и пригодность target-приложению.

## 9. Пример

```tsx
<div style={{height:520}}>
  <SplitView primaryLabel="Объекты" secondaryLabel="Редактор"
    primary={<ObjectNavigation />} secondary={<EditorWithInspector />}
    primarySize={navigationWidth} onSizeChange={setNavigationWidth}
    minSize={120} secondaryMinSize={400} />
</div>
```

Не сохраняйте отклонённое controlled предложение как фактический размер. Не размонтируйте draft ради resize. Не называйте обычные кнопки объекта полнофункциональным Tree и не обещайте native desktop proof на основании Chromium.
