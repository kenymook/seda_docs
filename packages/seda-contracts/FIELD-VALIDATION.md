# TextField и NumberField: сообщения валидации

Публичные `warningText`/`successText` замыкают существующие text-field surface/border/helper/icon роли на реальное поведение. NumberField остаётся композицией TextField с тем же визуальным alias.

Приоритет: disabled подавляет validation, затем errorText, warningText, successText, helperText. Показывается одно непустое сообщение; aria-describedby объединяет его ID с внешними без повторов. Только errorText устанавливает aria-invalid=true; внешнее aria-invalid сохраняется. Warning/success не блокируют ввод или форму. Error-сообщение само по себе также не заменяет бизнес-валидацию отправки приложения.

Пустые строки, boolean, null, массивы и известный пустой Fragment не создают сообщение в React; явное пустое validation-сообщение нарушает исполняемый контракт. Opaque React-компонент требует отдельной DOM-проверки. Preview TextField state=warning/success без текста не создаёт ложное подтверждение.

Success подавляется при внешнем aria-invalid. NumberField дополнительно требует конечное число внутри min/max: empty, Mixed, minus, exponent draft, invalid buffer и out-of-range скрывают устаревшее successText. Raw buffer остаётся у владельца и не превращается в 0. Это не автоматический текст ошибки: errorText и warningText задаёт приложение, numericState/outOfRange доступны отдельно в модели. readOnly сохраняет прежнюю native семантику и не получает новый визуальный контракт в рамках этой задачи.

Compiler deriveState и React используют одинаковые условия подтверждения. Token requirements и web bindings требуют warning/success surface, border, helper и icon. Фокус остаётся видимым поверх validation; hover/press не перекрывают выбранную validation роль. Токены не меняются.

`test/controls.test.mjs` проверяет API, состояние компилятора, пустые сообщения и numeric buffer. `verify-field-validation.mjs` проверяет установленный пакет, прямую и contract binding отрисовку и живое совместное редактирование на рабочем экране. Проверки ограничены Chrome; OS/AT и межбраузерная приёмка остаются открытыми. Это не полная готовность библиотеки для Figma/Notion/ChatGPT/Cloude Design.

Итог проверки: 154/154 контрактных теста, 19/19 целевых controls tests на окончательном состоянии, 56 message/paint случаев direct/contract binding, две живые React темы и 390 px. Повторные регрессии: 72 field paint, 16 Select validation, 24 workspace geometry/loading. TypeScript и audited pilot build — PASS. Визуально просмотрены обе темы новой композиции. Никаких production D1 записей для тестов не выполнялось.
