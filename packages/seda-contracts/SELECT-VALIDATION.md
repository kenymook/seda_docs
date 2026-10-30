# Select: исполняемая валидация

Задача — замкнуть цепочку существующие цветовые токены → публичный React API → исполняемый контракт → реальная отрисовка. Наличие токена само по себе не означает готовое состояние.

## API и приоритеты

Select получает additive props `warningText?: ReactNode` и `successText?: ReactNode`, аналогичные существующему `errorText`. Существующие вызовы совместимы. Никаких новых токенов не добавлено.

- disabled, readOnly и loading подавляют визуальную валидацию; helperText может оставаться объяснением недоступности.
- Непустой errorText имеет приоритет над warningText, warningText — над successText. Показывается одно сообщение.
- Пустой или whitespace string, null, boolean, пустые массивы и известный пустой Fragment не создают сообщение в React. Оpaque React-компоненты требуют DOM-проверки; контракт не объявляет их содержимое проверенным.
- warning и success не ставят aria-invalid и не блокируют нативный выбор или отправку формы. error ставит aria-invalid=true, как прежде. Дополнительная бизнес-валидация и асинхронная загрузка принадлежат приложению.
- Внешние aria-describedby IDs объединяются без повторов с ID видимого сообщения.
- Preview state=warning/success требует соответствующего непустого сообщения. Контракт отклоняет пустое явно переданное сообщение; при неполных props React безопасно возвращается к обычному отображению.

Словарь validation в общей схеме дополнен warning/success; TextField и NumberField подключены отдельно в FIELD-VALIDATION.md. Остальные компоненты не получают новые состояния автоматически. deriveState и compileControl возвращают тот же приоритет validation/tokenState, что и React.

## Цветовые привязки

Для error/warning/success используются `select.surface.*`, `select.border.*`, `select.helper.*` и `select.arrow.*`. Foreground остаётся существующим default, поскольку отдельных validation-веток foreground нет. Фокус сохраняет видимое кольцо, не убирая validation tone. Disabled использует свои роли.

Общий старый child-level error CSS исключает Select: он больше не перекрывает компонентную рамку общим status/danger/border. Изменение роли в редакторе должно менять фактический paint, а не только значение переменной.

## Проверка и границы

`test/controls.test.mjs` проверяет публичные props, пустые значения, приоритеты и состояние компилятора. `verify-select-validation.mjs` монтирует установленный пакет в Chrome: 16 сочетаний тем/сообщений, известный пустой Fragment, aria-invalid/description IDs, disabled, выбор значения и checkValidity, реальная смена border/helper/arrow при назначении отдельных компонентных токенов. Это проверка package CSS и React, без записи в production D1.

Studio показывает семь настоящих Select рядом; warning/success больше не обозначены как отсутствующее поведение. readOnly/loading реализованы следующим расширением SELECT-AVAILABILITY.md; active остаётся отдельным пробелом. Само расширение validation не означает полной зрелости Select или библиотеки: нативный popup, OS/AT и другие движки требуют отдельной приёмки.

Результат текущего запуска: 151/151 контрактных тестов, 16 installed-package validation cases, verify-select-studio, verify-token-editor и verify-select-arrow — PASS. TypeScript пилота/reference-приложений, audited build и Worker build — PASS. Light/Dark холст с семью состояниями просмотрен визуально. На доступном Node 22 команда npm test не поддерживает --test-isolation=none; весь набор выполнен командой `node --test --test-concurrency=1 test/*.test.mjs`, без исключения файлов. Полная React 18/19 пакетная матрица и другие движки в этой задаче не запускались. Рабочая D1 не использовалась для тестовых записей; token source hash не менялся.
