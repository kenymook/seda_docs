# Tree

> Category · Navigation · Version 0.1 · Status needs-review · Owner Kenymook
> Last reviewed 2026-10-23 · Figma: Needs design review

## Назначение и принципы

Иерархия слоёв, документов или объектов рабочего приложения. Выбор, раскрытие и keyboard focus независимы. Нельзя заменять деревом обычный плоский список, Tabs или menu команд. Компонент не реализует canvas, inspector или document model: их связи принадлежат приложению.

## Анатомия

Root с role=tree и accessible label; вложенные treeitem и group; строка с disclosure, optional icon и текстовой label. Branch имеет aria-expanded; leaf его не имеет. Disabled узел делает недоступным поддерево. У каждого узла явные aria-level, aria-posinset, aria-setsize. Selected задаётся отдельно от focus; aria-checked не используется.

## API и варианты

Публичные Tree/TreeProps/TreeNode экспортируются из @seda-ai/ui. Новая API нужна для иерархии, которую Tabs/Menu не представляют. Визуальных variants нет.

| Prop | Default | Смысл |
|---|---|---|
| label / items | required | Accessible имя и immutable readonly TreeNode[] |
| size | inherited, m outside provider | s/m/l/xl |
| selectionMode | single | single/multiple; фокус сам по себе не выбирает |
| selectedIds / defaultSelectedIds | [] | Controlled или initial selection |
| expandedIds / defaultExpandedIds | [] | Controlled или initial раскрытие |
| onSelectionChange / onExpandedChange | optional for uncontrolled | Canonical preorder ids; controlled требует соответствующий handler |
| onActivate | optional | Enter или double click leaf |
| disabled | false | Все действия запрещены; root остаётся доступен для чтения |
| emptyText | Нет элементов | Текст пустого дерева |

TreeNode: уникальный непустой id, непустая string label, optional decorative ReactNode icon, boolean disabled, children массив. Глубина максимум 128; дубликаты/cycles/неправильная форма отклоняются. Controlled и default одного состояния несовместимы. Single принимает максимум один authored selected id. Устаревшие id, disabled selection и раскрытие leaf отфильтровываются без callback loop. Selection может оставаться на скрытом потомке. При смене multiple→single сохраняется первый выбранный в preorder; остальные не восстанавливаются автоматически.

## Размеры и tokens

Цвета — реальные components/Mode 1/tree: row/surface/{default,hover,selected,disabled}, foreground/{default,selected,disabled}, icon/{default,selected,disabled}, focus/ring. Они ссылаются на существующие semantic/foundation роли; новых semantic цветов нет. Light/Dark разрешаются общим token resolver с provenance.

Height/font/line-height/radius/padding/icon/gap берутся из общего size profile, без собственной таблицы S/M/L/XL. Indent = (level−1) × (iconSize+gap); label обрезается ellipsis, доступное имя сохраняется целиком. Token gap: отдельные indent и focus width пока используют профиль и технические 2 px. Small desktop rows не подтверждают foundation touch target 44×44; touch и screen reader ещё не приняты.

## Состояния и поведение

Default/hover/focus/selected/expanded/disabled/empty. Один Tab stop; disabled узлы пропускаются. Up/Down/Home/End перемещают focus по видимым enabled узлам без wrap. Right раскрывает ветку, затем переходит к первому ребёнку; Left сворачивает или идёт к родителю; направления зеркальны в RTL. Space выбирает; multiple Space переключает выбор. Enter выбирает и вызывает onActivate без keyboard repeat. Double click branch раскрывает, leaf активирует. Pointer disclosure меняет только раскрытие.

Multiple: plain click заменяет selection, Ctrl/Meta click переключает, Shift click и Shift navigation выбирают range от anchor, Ctrl/Meta+Shift добавляют range. Ctrl/Meta+A выбирает видимые enabled узлы, сохраняя скрытый выбор. `*` раскрывает соседние enabled ветки. Typeahead имеет окно 500 ms, Unicode/diacritic normalization и cycling повторённой буквы; composition/modifier input не перехватывается.

Удаление, disabled и сворачивание восстанавливают наш focus на доступном предке/первом узле. Изменения темы, данных или selection не забирают focus у inspector. Root key capture preventDefault позволяет host запретить действие. Поля или кнопки внутрь label/icon не помещать: отдельные команды требуют отдельного спроектированного взаимодействия.

## Исполняемый контракт и handoff

D29: packages/seda-contracts/contracts/Tree.json подключён к общему registry/compiler. Проверяет authored items, ownership и states; выдаёт geometry, required token leaves и web bindings. Статус browser checks остаётся not-checked до фактического browser proof; compile сам не доказывает keyboard/AT.

Acceptance: installed tarball, React 18/19, SSR/Strict hydration; DOM parity с compiler; disclosure/selection независимы; disabled skip/range/RTL/typeahead/control rejection; focus repair; Light/Dark×4 sizes; editor selection→inspector→preview, undo/redo и explicit save/reload. Полные девять reference screens остаются отдельной приёмкой.

Пример: `<Tree label="Слои" items={[{id:"frame",label:"Frame",children:[{id:"title",label:"Заголовок"}]}]} defaultExpandedIds={["frame"]}/>`.

Не поддержаны: virtualization/lazy loading/reorder/drag and drop/checkbox tree/inline edit/context menu. Их нельзя имитировать произвольными props. Для длинных деревьев нужны отдельные scale fixtures и performance evidence. [APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) задаёт ориентир семантики и клавиатуры, но ссылка не доказывает соответствие реализации.

AI может применять только этот документированный API, состояния и реальные tokens. Missing states/token mappings и accessibility gaps должны быть помечены Needs system review. Нельзя выдавать текущий experimental API за утверждённый Figma component или production-ready библиотеку. Человеческий design/accessibility review остаётся необходимым для приёмки.


## Проверка поверхности 2026-10-25

Root Tree — scope для размера/темы, он не рисует собственную surface. `tree/row/surface/default` уже ссылается на `color/transparent`; внутренний SedaProvider раньше добавлял непрозрачную base-подложку вопреки этому поведению. Исправление принадлежит общему Tree, не локальному override приложения. Hover/selected/disabled и foreground продолжают использовать исходные component tokens. На root нет новых props/variants/tokens. Проверяется вложение на neutral host в Light/Dark × 4 sizes × 2 widths, помимо прежних keyboard/selection/compiler checks. Полная Figma/AT приёмка Tree по-прежнему открыта.
