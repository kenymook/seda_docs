# SEDA AI — исполняемые контракты пилота

Пакет проверяет 13 контрактов: Button, IconButton, TextField, Select, Checkbox, Radio, Toggle, Tabs, DropdownMenu, Tree, TextArea, Slider и NumberField. Он разрешает зависимости токенов и компилирует профиль формы настроек в данные для React-адаптера. Версия модели — `0.1.0`.

Проверка данных контракта, аудит текущих исходников и соответствие браузерного интерфейса имеют отдельные результаты. На третьем этапе добавлен [реальный React-пилот](../../portal/component-lab/pilots/settings-parametric/README.md), модуль web-привязок и браузерный verifier. Текущие исправления компонентов, D16 и результаты проверки описаны в [phase-3.md](../../ai-readiness/pilots/settings-form/phase-3.md).

[NumberField D32](NUMBER-FIELD-CONTRACT.md) использует controlled raw string и один numeric core в compiler/React. Его visual alias — настоящий TextField; документ, подтверждение и история остаются у host. Неизвестные/промежуточные значения не становятся нулём. Node не удостоверяет keyboard/IME/FormData или OS/AT по одному валидному JSON.

## Запуск

Нужен **Node.js 24 или новее** и checkout репозитория с `tokens.json` и `packages/seda-ui`. Из корня репозитория:

```bash
cd packages/seda-contracts
npm ci
npm run validate
npm test
```

`validate` проверяет схемы, API, зависимости токенов, правила и связи профиля. Для поставляемых данных ожидается `PASS (contract-and-profile-data)`. Тесты покрывают корректные сценарии и намеренные нарушения: API, контракты, модель формы, токены и web-привязки. Точный результат последнего зафиксированного запуска находится в отчёте третьего этапа.

Аудит существующей реализации запускается отдельно:

```bash
npm run audit
```

Для текущего кода ожидается **код завершения 0**: default IconButton исправлен на `secondary` и соответствует публичному TypeScript union и target default. Отдельный отрицательный тест возвращает в копию исходника старое значение `neutral` и подтверждает, что аудит обнаруживает регрессию.

Компиляция и контекст для человека или AI:

```bash
npm run compile -- --theme Dark --size l --output .generated/settings-dark-l.json
npm run context -- --output .generated/context.md
```

Поддерживаются Light/Dark × `s/m/l/xl` при плотности `regular`: восемь сочетаний данных профиля. `compact` и `comfortable` пока не имеют исполняемых правил этого пилота и отклоняются. Для структурированных отчётов доступны `npm run validate -- --json`, `npm run audit -- --json` и `npm run context -- --json`.

Без `--output` команды выводят результат в stdout. `.generated/` исключена из Git; результаты воспроизводятся из авторских источников и не поддерживаются вручную.

## Где редактировать правила

| Источник | Что он определяет |
| --- | --- |
| [tokens.json](../../tokens.json) | Реальные значения и aliases Foundation, Semantic и Component tokens |
| [TypeScript SEDA UI](../seda-ui/src) | Публичные props, native HTML/ARIA, React `ref`/`key`, размерные и вариантные union; defaults читаются из TSX |
| [system.json](system.json) | Пресеты пилота, роли геометрии и типографики, поддерживаемые темы и плотность, планируемые токены |
| [Button](contracts/Button.json), [IconButton](contracts/IconButton.json), [TextField](contracts/TextField.json) | Анатомия, оси состояний, область пилота, token branches, проверки и источники решений |
| [settings-form.json](profiles/settings-form.json) | Конфигурация формы, layout, recipes, связи с состоянием формы, сообщения и политика сценария |
| [schema/](schema) | Допустимая структура и версия авторских данных |
| [rules.mjs](src/rules.mjs), [form.mjs](src/form.mjs) | Реальное исполнение проверок и переходов; неизвестное имя проверки или модель политики отклоняется |

Документы [первого этапа](../../ai-readiness/pilots/settings-form/README.md), включая прежний `settings-profile.json`, сохраняются как историческая фиксация и обоснование решений. Текущий авторский профиль находится в `profiles/settings-form.json`. API-таблицы и AI-контекст генерируются из исходников: вторую редактируемую копию публичных props создавать не требуется.

## Что компилируется

D33 добавляет runtime-опцию `controlParameters` к `compile()` и `compileControl()`. Исходная `geometry` сохраняет token provenance; отдельная `parametric` содержит производные значения и реальные inputs. Web bindings повторно проверяют граф и возвращают согласованные значения и параметры для публичного `SedaProvider`. Режим experimental, opt-in; восемь базовых профилей и 13 instance contracts остаются прежними. [Правила и границы](CONTROL-PARAMETERS.md).

Дополнение [D25](WORKSPACE-CONTRACTS.md): `compile()` включает `controls` для Select/Checkbox/Radio/Toggle, с общими geometry и разрешёнными token branches; `compileControl(name, props, {theme, interaction})` проверяет отдельный экземпляр по настоящему API и возвращает его состояния и токены.

Результат содержит конфигурацию, layout и геометрию, типографику, четыре экземпляра компонентов с привязанными props, разрешённые ветки токенов, состояние и события формы, ограничения и отложенные проверки. Разрешённые значения сохраняют исходную ссылку и цепочку aliases.

| Размер | Высота | Радиус | Шрифт / строка | Иконка | Горизонтальный padding Button |
| --- | ---: | ---: | --- | ---: | ---: |
| `s` | 24 px | 6 px | 12 / 16 px | 14 px | 8 px |
| `m` | 32 px | 8 px | 14 / 20 px | 16 px | 12 px |
| `l` | 40 px | 10 px | 16 / 24 px | 18 px | 16 px |
| `xl` | 48 px | 12 px | 18 / 28 px | 20 px | 20 px |

Обязательные роли и состояния цвета перечислены в `tokenRequirements` каждого контракта. Проверка всей ветки дополняется проверкой этих конкретных leaf paths: отсутствие необходимого состояния не скрывается успешным разрешением остальных токенов. D16 реализован: `text-field/border/disabled` ссылается на `{status.disabled.border}` и обязателен в обеих темах. Для TextField также обязательны реально используемые active, placeholder, affix и icon roles; их отсутствие останавливает сборку.

`source` у числового documented preset указывает происхождение принятого значения. Валидатор проверяет наличие исходного файла; он не извлекает числа из Markdown. Авторским значением пилота служит `system.json`.

Высоты — явные пресеты Foundation; радиусы и типографика связаны с токенами. Общий padding TextField остаётся **10 px**, gap его affix и gap содержимого Button — **8 px** во всех размерах этого `regular`-профиля. Layout gaps формы также не масштабируются вместе с размером контрола. Размер и плотность имеют отдельный смысл.

Единица `px` добавляется только по явному запросу размерной роли. Web-адаптер веса label преобразует `Semibold` в **600**, без `px`. Ссылка `configuration.controlSize` управляет всеми recipes; вторая явно заданная копия `size` считается конфликтом. Тип каждой связи проверяется на всём диапазоне возможных значений: например, `string | undefined` нельзя подключить к boolean `disabled`, даже если начальное значение равно `undefined`.

## API и границы проверки

`src/api.mjs` использует TypeScript compiler API и закреплённые React types. Он сохраняет корректные inherited props, `Omit`, собственные overrides и фактический тип элемента `forwardRef`; произвольного короткого allowlist для native HTML/ARIA нет. Допустимые `data-*` принимаются, неизвестные props и опечатки в ARIA отклоняются.

Recipes используют сериализуемые значения и два явных вида привязок:

```json
{
  "onChange": { "$handler": "form.change" },
  "icon": { "$slot": "help-icon" }
}
```

`$handler` описывает непрозрачный callback; для string-returning `Slider.formatValue` проверяется действительный тип результата, для событий сохраняется void. `$slot` — непрозрачный ReactElement, который предоставит UI-адаптер. Дескрипторы проверяются на совместимость с реальным типом свойства. Тело обработчика, результат форматирования, видимость содержимого ReactNode и итоговое доступное имя требуют дополнительных доказательств. Непрозрачные значения получают `not-checked` в соответствующих проверках. Default `Slider.formatValue=String` оставляет явное предупреждение `API_DEFAULT_UNCHECKED`; аудит не исполняет его. Actual single/range union проверяется с сохранением связи mode/value/thumbLabels. См. [D31](SLIDER-CONTRACT.md).

Состояния доступности, загрузки, валидации, взаимодействия и данных разделены. `error + focus` допустимы. Строка из пробелов считается заполненными данными, но нарушает правило обязательного названия. Временное нажатие action-компонента использует token suffix `pressed` и не включает постоянный `selected` или `aria-pressed`.

## Модель формы и программное использование

```js
import {
  createContractEngine,
  createFormState,
  transitionForm,
} from './src/index.mjs';

const engine = createContractEngine();
const initial = createFormState('Проект');
const submitted = transitionForm(
  initial,
  { type: 'submit', route: 'click' },
  engine.bundle.profile.formPolicy,
);
const compiled = engine.compile(undefined, {
  overrides: { theme: 'Dark', controlSize: 'l' },
  formState: submitted.state,
});
```

`transitionForm` — чистая модель. Она возвращает новое состояние и эффекты `save`/`focus`; выполнение запроса и перевод DOM-фокуса принадлежат host-адаптеру. В React-пилоте они подключены к реальному input и явно обозначенному демо-транспорту. Ввод остаётся доступным во время сохранения. Ответ сопоставляется с ID запроса и отправленным snapshot: более свежий ввод сохраняется, повторные и устаревшие ответы игнорируются. Сбой сохранения относится к форме; retry проверяет текущее значение. Изменение профиля не сбрасывает состояние модели.

Публичный entry point экспортирует `loadBundle`, `createContractEngine`, `ContractValidationError`, `createApiInspector`, `createTokenResolver`, `TokenResolutionError`, `createFormState`, `transitionForm`, `formEvents`, `deriveState` и `mergeDescriptionIds`. Engine предоставляет `validate`, `validateInstance`, `audit`, `compile`, `provenance`, а также `bundle`, `api` и `resolver`.

## Как читать результат

| Статус | Значение |
| --- | --- |
| `passed` | Выполнена конкретная проверка на указанном слое |
| `violated` | Найдено нарушение с кодом и путём к данным |
| `decision-needed` | Требуется изменение или пересмотр явно запланированного решения |
| `not-checked` | Для вывода требуется ещё не выполненная проверка |

Сам `validate` по-прежнему возвращает **13 браузерных проверок** как `not-checked` и `runtimeConformance: not-checked`: он выполняет проверку данных, а не запускает браузер. Отдельный verifier React-пилота проверяет эти правила на конкретной сборке и выдаёт результаты, связанные с хэшами исходников и артефактов. См. [зафиксированный результат](../../ai-readiness/pilots/settings-form/phase-3.md). Полная доступность, живой Figma-файл и backend этим пакетом не сертифицируются.

Список `plannedTokenAdditions` сейчас пуст: D16 добавлен в реальный token document. Resolver по-прежнему не создаёт планируемые токены автоматически; тест отсутствующего дополнения использует историческую копию данных. Полный Tooltip находится за пределами пилота; для Help принято видимое пояснение, наличие которого проверяется в профиле.

`provenance()` фиксирует SHA-256 реально прочитанных token/API/TSX-файлов вместе с историческими reference commits. Это позволяет отличить основание решений от фактических входов текущего запуска.

Исторические результаты C01–C06 описаны в [итоге второго этапа](../../ai-readiness/pilots/settings-form/phase-2.md); текущий React-адаптер и R01–R10 — в [итоге третьего этапа](../../ai-readiness/pilots/settings-form/phase-3.md).

## Web-адаптер

Browser-safe entry points `./web` и `./form` не импортируют Node, TypeScript compiler или Ajv. Для React-потребителей заданы JSDoc-типы состояния, событий, эффектов и CSS-привязок.

- `createWebBindings(compiled)` возвращает `layout` и `recipes`; каждый набор содержит CSS-переменные и evidence с исходными значениями и цепочками. Recipe также содержит маркеры компонента и резервируемого loading-slot.
- `bindWebRecipe(recipe, configuration, form, { handlers, slots })` связывает только объявленные источники и предоставленные host-адаптеры. Отсутствующий обработчик или слот вызывает адресную ошибку.
- `validateWebProfile(profile)` проверяет границы конкретного host: DOM IDs, refs, inline style и служебные data-атрибуты принадлежат адаптеру. Save `onClick` и Help `aria-controls` также задаёт host. Конфликт получает `PROFILE_ADAPTER_PROP_CONFLICT`; неподдерживаемое подключение `$handler` — `PROFILE_HOST_HANDLER_UNSUPPORTED`. Это не сужает публичный HTML/ARIA API компонентов вне пилота.

Web-слой требует всех цветовых ролей, которые читает CSS, и проверяет числовые ограничения: положительные высота/шрифт/строка/иконка, неотрицательные радиус/границы/отступы. Отрицательный letter spacing допустим. Не поддерживаемое браузером размерное значение останавливает сборку до рендера.

Набор из восьми профилей строится из авторских данных. Редактирование `system.json`, профиля, токенов или исходного компонента требует новой сборки; переключение уже собранной темы/размера работает в браузере без пересоздания формы.


## Навигация рабочих панелей

Tabs — восьмой component contract. `compileControl('Tabs', {label:'Панели', items:[{value:'properties',label:'Свойства',content:{$slot:'document.properties'}}]})` проверяет фактический API, items и selection, разрешает общую геометрию/цвета и оставляет DOM conformance not-checked. Nested slots проверяются на тип всего property; они не исполняются compiler. `state.tabs` — authored snapshot с effective value и per-item default/selected/disabled. `createTabsWebBindings` — browser-safe binding уже разрешённого output. Подробные правила и границы: D27 в WORKSPACE-CONTRACTS.md.
