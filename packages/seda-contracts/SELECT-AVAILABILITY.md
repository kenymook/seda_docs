# Select: read-only и loading

Публичные `readOnly:boolean=false` и `loading:boolean=false` добавляют поведение к существующим ролям токенов. Нативный select остаётся владельцем selection, form name, options и клавиатуры в обычном состоянии.

## Семантика

- disabled: настоящий disabled, не фокусируется и исключается из FormData нативным браузером.
- readOnly: остаётся фокусируемым и успешным полем формы; pointer/key изменения и открытие picker блокируются, значение сохраняется. `aria-readonly=true` не заменяет реализацию блокировки.
- loading: aria-busy=true и aria-disabled=true; native select остаётся успешным полем формы. Текущее значение сохраняется, взаимодействие временно блокируется, стрелка меняется на декоративный spinner в том же слоте. Блокировка submit всей формы, загрузка options и защита от поздних серверных ответов — ответственность приложения.
- disabled имеет приоритет над loading, loading — над readOnly. Эти три режима подавляют validation tone и устаревшие сообщения; helperText остаётся доступным описанием. Validation возвращается при снятии блокировки.

Семантика aria-readonly для combobox/listbox опирается на [WAI-ARIA](https://www.w3.org/TR/wai-aria/#aria-readonly). Это основание выбора атрибутов, а не свидетельство полного тестирования screen readers.

## Поведение

Не заменяем контрол hidden input или статическим текстом: name/value, форма и DOM-узел сохраняются. Нативный readonly для select отсутствует, поэтому реализация блокирует pointer/click, selection keys/typeahead и guard-ит onInput/onChange с восстановлением последнего принятого значения. Tab/Shift+Tab, Escape и copy shortcut не блокируются. Controlled value и options могут обновляться владельцем и во время блокировки. Form reset обновляет snapshot выбора. При переходе в блокировку открытый picker закрывается с возвратом фокуса на тот же контрол.

У расширенного base-select нет публичного hidePicker: на время readOnly/loading CSS отключает этот progressive слой и его picker. Layout effect сохраняет фокус после нативного закрытия, только если фокус принадлежал Select; поле не становится временно disabled и не размонтируется. Controlled reset оставляет значение владельцу; для изменения нужно обновить value в приложении. У неизменяемого controlled Select change handler может отсутствовать; для редактируемого он обязателен. Нативные системные popup других движков требуют отдельной проверки.

Пустой required select остаётся невалидным нативно; приложение не должно помещать пользователя в readOnly с обязательным пустым значением без возможности исправить его. Не вызывается showPicker извне: такие обходы приложения не являются границей безопасности компонента.

## Контракт и токены

Select.states объявляет read-only в availability и loading в activity. Приоритеты deriveState совпадают с React. Preview state без соответствующего readOnly/loading prop отклоняется. Browser rule select-availability требует фактических доказательств блокировки, сохранности формы и геометрии; compileControl не объявляет эти DOM-проверки выполненными.

Используются существующие select.surface/border.read-only/loading, foreground/label.read-only и icon.loading. Никаких новых цветов или presets не добавлено. Loading не меняет геометрию single-select; multi-select сохраняет собственную высоту и резервирует место для spinner. Reduced motion отключает вращение, сохраняя индикатор и aria-busy.

Ограничения: native picker зависит от движка/ОС, полная OS/AT-приёмка остаётся отдельной. Изменения программы, включая загрузку и сохранение данных, не превращаются в локальный API компонента.

## Проверено

- `node --test --test-concurrency=1 test/*.test.mjs`: 152 passed, 0 failed. Общее обязательное правило допускает явный browser layer; новое select-availability не выдаёт незапущенные браузерные проверки за passed.
- `verify-select-availability.mjs`: 16 live React случаев из установленного публичного пакета — обе темы, controlled/uncontrolled, single/multi, readOnly/loading. Изменяющие keys/typeahead/pointer блокируются; Tab/Shift+Tab работают; callbacks не вызываются, FormData и DOM-узел сохраняются. Внешний controlled value обновляется. Проверены оба reset, переход open → loading, отсутствие перехвата соседнего фокуса, приоритет disabled, реальная граница токена при hover/focus, центр spinner и reduced motion.
- `verify-select-validation.mjs`: 16 случаев сообщений и реального paint, включая hover/focus. `verify-select-studio`, `verify-token-editor`, `verify-select-arrow` — PASS. Studio показывает 9 состояний; обе темы просмотрены визуально.
- TypeScript пилота/reference-приложений, audited pilot build, Worker build — PASS. Token hash не менялся; production D1 не использовалась для тестовых записей.

Это Chrome/Windows proof. Firefox/WebKit, нативные системные picker и screen readers в этой правке не сертифицировались. Полная React 18/19 package matrix отдельно не повторялась. На доступном Node 22 полный набор contract tests запускался прямой командой выше: флаг --test-isolation=none из npm script этой версией Node не поддерживается.
