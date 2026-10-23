# Контракты контролов рабочего приложения

## D25 — Select, Checkbox, Radio, Toggle

Общий движок проверяет настоящие TypeScript interfaces и forwardRef SEDA UI. `compileControl(name, props, {theme, interaction})` проверяет экземпляр и возвращает состояния, проверки и разрешённую цепочку component tokens. `compile()` включает `controls` с теми же контрактами и ветками токенов; отдельный каталог токенов лаборатории удалён. Базовые размеры поступают из общего system.json; дополнительные X/Y остаются экспериментом Lab.

Select и Radio: непустые уникальные options, single/multi соответствует форме value, выбранные значения существуют в options. Controlled value требует обработчик; value/defaultValue несовместимы. Пустое значение допустимо до выбора. Disabled option может сохраняться выбранным, но недоступен для нового выбора.

Checkbox и Toggle: checked/defaultChecked несовместимы; controlled checked требует обработчик или readOnly. Checkbox сохраняет independent indeterminate. Toggle loading блокирует переключение и повторные callbacks, сохраняет размеры; отдельного errorText у Toggle нет.

Disabled имеет приоритет над validation и focus ring. Непустой errorText определяет error независимо от focus. Внешние aria-describedby объединяются с локальным сообщением без повторов и висячего локального ID. Ошибка disabled-контрола скрыта, helper может оставаться.

Статические проверки не объявляются браузерными PASS. В контракте DOM-проверки остаются not-checked; отдельные отчёты фиксируют реальные результаты. Нативные popup Select и системные средства доступности требуют проверки на целевых ОС; Chromium не доказывает работу нативного desktop shell.


## D26 — публичная конфигурация библиотеки

SedaProvider наследует theme/controlSize; явный size компонента имеет приоритет. Standalone fallback m извлекается из настоящего useSedaSize/context protocol, со scope standalone-fallback и providerOverride в API metadata. Неизвестная форма протокола требует явного аудита и не проходит автоматически. Общая геометрия и component-token CSS генерируются из того же system/resolver, восемь результатов сверяются с compiler. Публичные профили не заменяют экспериментальные X/Y лаборатории. Документация: [React provider](../../foundation/react-provider.md).
