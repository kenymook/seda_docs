# D33 — общая параметрическая геометрия контролов

Статус: experimental foundation execution. Это не четырнадцатый instance contract и не новый набор сертифицированных пресетов.

До D33 дополнительные X/Y, масштаб и радиус исполнялись в адаптере лаборатории. Установленный `@seda-ai/ui` предоставлял тему и S/M/L/XL, но не этот общий режим. Теперь модель принадлежит `src/control-geometry.mjs`: один граф выражений исполняется численно и превращается в CSS. Входные размеры берутся из реальных compiled geometry; второй таблицы пресетов нет.

## Публичное подключение

```tsx
import {SedaProvider,Button,Icon,TextField} from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';

<SedaProvider theme="dark" controlSize="m" textScale={115}
  controlParameters={{scale:115,extraPaddingInline:12,extraPaddingBlock:6,radiusScale:1.25}}>
  <TextField label="Проект" prefix={<Icon name="search"/>}/>
  <Button iconLeft={<Icon name="add"/>}>Создать</Button>
  <Button size="s">Локальный S</Button>
</SedaProvider>
```

`controlParameters` включается явно. Без него сохраняются прежние профили и форма `useSedaConfiguration()`. Частичные вложенные параметры наследуют остальные поля; `scale:100` означает абсолютные 100%, а не дополнительное умножение родителя. Snapshot и объект параметров заморожены. Явный `size` компонента имеет приоритет перед общим размером, после чего к его собственной базе применяются параметры. Меню, Popover, Modal и Tooltip наследуют React context при портале.

| Поле | Default | Допустимые значения | Смысл |
| --- | --- | --- | --- |
| scale | 100 | 80–200 | Проценты для font, line и icon контролов |
| extraPaddingInline | 0 | 0–24 px | Дополнение X к собственному Button/field padding; у Checkbox/Radio/Toggle — к интервалу перед подписью |
| extraPaddingBlock | 0 | 0–12 px | Дополнение Y к исходному вертикальному пространству |
| radiusScale | 1 | 0.5–1.75 | Множитель исходного радиуса |
| preserveMinimumHeight | true | boolean | Сохранение минимальной высоты пресета |

Неизвестные поля, строки вместо чисел, NaN/Infinity и значения вне границ отклоняются. `textScale` сохраняет отдельную ответственность за роли `Text`; приложение может связать два масштаба одним значением, как лаборатория. Масштаб холста и типографика документа принадлежат приложению.

## Формулы и форма компонента

Font, line и icon округляются до целого px. Исходный вертикальный padding: `(preset height − preset line − 2 × border) / 2`. Дополнение Y прибавляется к нему. Высота: `max(line, icon) + 2 × paddingY + 2 × border`, затем при необходимости минимум пресета. Радиус округляется до 0.01 px.

IconButton остаётся квадратным. Checkbox использует существующий primitive choice radius с множителем и ограничением радиуса контрола; Radio сохраняет круг, Toggle — форму переключателя и исходный inset. Многострочные TextArea, сообщения и поверхности сохраняют естественную высоту. Геометрия строки таблицы и её плотность остаются отдельной композицией.

Параметры работают в CSS установленного пакета. Требуются CSS `round()` и size container units; при их отсутствии opt-in Provider сообщает явную ошибку, а не рисует другое значение. Размерный container ограничивает спиннер текущим зафиксированным корпусом Button при изменении параметров во время loading. Четыре px запаса соответствуют двум существующим stroke widths спиннера по 2 px. SSR не требует DOM. Численный и CSS пути используют один граф; соответствие проверяется на реальных DOM-размерах. [CSS Values 4, stepped values](https://drafts.csswg.org/css-values-4/#round-func) — описание используемой операции, не доказательство поддержки целевого браузера.

## Компилятор и происхождение

```js
const compiled=engine.compile(undefined,{
  overrides:{theme:'Dark',controlSize:'m'},
  controlParameters:{scale:150,extraPaddingInline:24,extraPaddingBlock:12}
});
// geometry: исходные разрешённые leaf values и token chains.
// parametric: применённые значения, параметры, исходные inputs и modelSource.
const web=createWebBindings(compiled);
// web.controlParameters можно передать SedaProvider.
```

`compileControl(name, props, {controlParameters})` поддерживает тот же режим, сохраняя локальный размер. `geometry` не перезаписывается производными числами: `parametric.inputs` сохраняет оригинальное происхождение. Web bindings повторно исполняют общий граф и отклоняют устаревшие результаты, ложные inputs или преждевременный runtime PASS. Производное evidence содержит параметры и исходные leaf values. Файлы модели входят в engine provenance и metadata установленного пакета.

Авторская schema профиля не расширяется скрытыми полями: параметры передаются runtime-опцией. В обычном `compile()` без этой опции прежний результат остаётся базовым. Токены и восемь исходных профилей не меняются.

Адаптер приложения передаёт разрешённые исходные значения выбранного профиля в существующие `--seda-size-<size>-*` slots Provider. Это входы графа, а не дополнительный расчёт высоты в host CSS: изменения compiled geometry продолжают доходить до React, а явный локальный S использует собственную базу S. Инспектор сравнивает каждый контрол с его эффективным размером, а сохранённую loading-кнопку — со snapshot её корпуса.

## Границы проверки

Нужны installed React 18/19, SSR/hydration, nested scopes/local size, состояния, клавиатура/фокус, loading при смене параметров и совместные reference screens. Node-вычисление сохраняет `runtimeConformance: not-checked`. Это не визуальная приёмка всех вариантов Figma, всех значений непрерывного диапазона, OS/AT/Firefox/WebKit/native desktop или малых размеров текста. Особенно крупные параметры могут требовать переноса и прокрутки.
