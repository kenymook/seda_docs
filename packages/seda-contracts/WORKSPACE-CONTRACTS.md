# Контракты контролов рабочего приложения

## D25 — Select, Checkbox, Radio, Toggle

Общий движок проверяет настоящие TypeScript interfaces и forwardRef SEDA UI. `compileControl(name, props, {theme, interaction})` проверяет экземпляр и возвращает состояния, проверки и разрешённую цепочку component tokens. `compile()` включает `controls` с теми же контрактами и ветками токенов; отдельный каталог токенов лаборатории удалён. Базовые размеры поступают из общего system.json; дополнительные X/Y остаются экспериментом Lab.

Select и Radio: непустые уникальные options, single/multi соответствует форме value, выбранные значения существуют в options. Controlled value требует обработчик; value/defaultValue несовместимы. Пустое значение допустимо до выбора. Disabled option может сохраняться выбранным, но недоступен для нового выбора.

Checkbox и Toggle: checked/defaultChecked несовместимы; controlled checked требует обработчик или readOnly. Checkbox сохраняет independent indeterminate. Toggle loading блокирует переключение и повторные callbacks, сохраняет размеры; отдельного errorText у Toggle нет.

Disabled имеет приоритет над validation и focus ring. Непустой errorText определяет error независимо от focus. Внешние aria-describedby объединяются с локальным сообщением без повторов и висячего локального ID. Ошибка disabled-контрола скрыта, helper может оставаться.

Статические проверки не объявляются браузерными PASS. В контракте DOM-проверки остаются not-checked; отдельные отчёты фиксируют реальные результаты. Нативные popup Select и системные средства доступности требуют проверки на целевых ОС; Chromium не доказывает работу нативного desktop shell.


## D26 — публичная конфигурация библиотеки

SedaProvider наследует theme/controlSize; явный size компонента имеет приоритет. Standalone fallback m извлекается из настоящего useSedaSize/context protocol, со scope standalone-fallback и providerOverride в API metadata. Неизвестная форма протокола требует явного аудита и не проходит автоматически. Общая геометрия и component-token CSS генерируются из того же system/resolver, восемь результатов сверяются с compiler. Публичные профили не заменяют экспериментальные X/Y лаборатории. Документация: [React provider](../../foundation/react-provider.md).


## D27 — исполняемый Tabs и вложенные React bindings

Tabs добавлен в registry/common compiler. Поддерживаются горизонтальные line/pill, S–XL, automatic/manual. label списка и item labels — непустые строки; item values уникальны и непусты, content обязателен как поле, но может быть null/undefined для пустой панели. Пустой и полностью disabled список разрешены и не имеют selected panel. value/defaultValue взаимоисключающие. Неизвестное или disabled значение даёт первую доступную вкладку; controlled host сохраняет право отклонить новое значение без callback-цикла. Значение без onValueChange допустимо как controlled snapshot; клик не подменяет его внутренним состоянием.

Статический state.tabs содержит requestedValue/effective value, controlled и состояние каждого item. Это снимок authored props, а не чтение внутреннего uncontrolled state или DOM. Последующее внутреннее значение нужно передавать как текущий value для снимка runtime. Root hover/focus/active не приписываются всем item; реальные per-item состояния доказываются в consumer/browser tests.

Nested $slot/$handler descriptors в items и других вложенных props проходят проверку полного enclosing TypeScript property. Descriptor не заменяет валидацию типа: slot в value:string или label:string отклоняется. Content/icon slot — непрозрачный ReactElement, callback — opaque void handler. Сериализованный compile output не исполняет эти descriptors и не доказывает, что host привязал реальный React tree. Неправильная форма descriptor — error, не unchecked success.

Tabs root token branch использует существующий tabs catalogue; line/pill имеют отдельные required roles, default — их объединение. createTabsWebBindings берёт уже разрешённые цвета и геометрию с provenance; не читает tokens в браузере. Без отдельного Tab geometry token применяется явный adapter к общему height/font/field padding/gap/radius; indicator/focus width пока 2 px. В Lab X/Y и text scale остаются экспериментальными overrides над общим профилем и распространяются на Tabs.

Шесть DOM-check declarations остаются not-checked в статическом отчёте: keyboard, panels, focus repair, focus ring, geometry и token binding. Реальные SSR/hydration/browser результаты — отдельно. Hidden panels сохраняют mounted draft; nested form validation обязан раскрыть панель ошибки и только затем фокусировать поле. Vertical, close/reorder/lazy unmount, screen reader/native shell и прочие engines не подтверждаются этим контрактом.

## D28 — DropdownMenu и общий overlay adapter

DropdownMenu зарегистрирован девятым executable contract. Реальный TypeScript API/defaults проверяется через общий inspector; сериализованные handlers в actions/groups и onOpenChange остаются opaque bindings, не исполняются compiler. Уникальность IDs действует на всё меню; shortcut signatures уникальны; provider scope требует Control/Meta/Alt. Группы не вложенные. Controlled open требует onOpenChange и запрещает defaultOpen. Icon-only trigger требует непустой triggerIcon и triggerLabel.

state.menu — authored snapshot: requestedOpen, effective open, controlled, unavailable и отдельные item states/danger. Disabled root или отсутствие actions скрывает меню и блокирует trigger; все disabled items не блокируют открытие для чтения причин. Runtime uncontrolled state нужно передать обратно как текущий open при сопоставлении, snapshot не читает внутреннее состояние React.

Пять browser declarations (keyboard, focus, overlay, geometry, tokens) остаются not-checked в статическом отчёте. Installed React 18/19 consumer сравнивает семь текущих DOM snapshots с compiler на runtime; keyboard/shortcuts и portal fallback доказываются отдельными сценариями. Количество комбинаций профиля не является количеством независимых пользовательских сценариев.

createDropdownMenuWebBindings использует разрешённый component branch и geometry. Пока отсутствуют собственные component tokens focus/danger, compiler явно разрешает semantic focus/ring и status/danger/text/container в semanticAdapters с provenance. Это документированный adapter, не скрытый CSS fallback и не новые tokens. Menu row использует общий height/line-height/field padding/gap/radius; X/Y поверх них остаются экспериментом Lab. Surface portal копирует переменные и direction из trigger scope и обновляется при изменениях конфигурации.

Lab использует настоящий DropdownMenu в строках проектов: открыть сведения, создать копию через existing dialog, удалить только после подтверждения. Отмена сохраняет строку; подтверждение очищает row selection, сохраняет draft формы и переводит focus в search при удалении trigger. Диалоги и таблица остаются композициями; данные локальные, серверных операций здесь нет. Provider bridge передаёт правильную тему/размер порталу. Источники одинаковых CSS properties имеют отдельные React keys по component/property/path.

Submenus, checkable/async permission patterns, global command registry, screen reader, Firefox/WebKit и native shell не подтверждены. Следующий слой для reference screens — панели/Tree/commands и связанные рабочие композиции.
