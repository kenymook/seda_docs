# NumberField и согласованные поля инспектора

Текущий проход добавляет общий raw numeric input для рабочих приложений. NumberField использует настоящий TextField и13-й executable contract D32 с одним numeric core для compiler/React. Это experimental implementation; отдельное Figma утверждение и готовность всей SEDA не заявлены.

Numeric buffer сохраняет пустую строку, Mixed, знак и неполную exponent notation без подмены нулём. Keyboard stepping поддерживает bounds, decimal/representable large values, native editing/IME и owner refusal. Общая библиотека не присваивает себе document commit, history или save. Sandbox/Spline используют этот export с прежними владельцами и единственным источником собственных bounds.

Выявлен и исправлен реальный общий дефект TextField: непосредственно переданные CSS variables оставались на input и не меняли окружающую рамку/affix. Regression probe до исправления получил48px/font18 вместо58px/font21 и прежнюю границу. Теперь CSS variables наследуются всем составом поля, обычные native input styles сохраняют прежнюю цель. Повторный probe подтвердил58px/font21 и заданный border; native letter-spacing не перенесён на label.

По замечанию пользователя кнопки «Назад/Далее» в Projects pagination выровнены по нижнему краю контрола Select. Проверка существующей Table матрицы измеряет совпадающие нижние границы на общей строке и сохраняет допустимые переносы;60 случаев пройдены, Light/Dark снимки просмотрены.

Первые завершённые проверки:4/4 новых contract tests; installed React18 consumer —32 выбранных theme/size/width/RTL pairs,20 invalid models, decimal/large steps, raw/Mixed, actual IME/fieldset/readOnly/FormData/owner refusal и применение inline compiler variables;16 Lab profiles плюс2 реальных editor flows. Undo/Redo после группы шагов, invalid cancel, multi-selection commit, blocking и save/reload проверены в браузере. Это предварительные результаты; полная библиотечная серия, оба runtime и публикация ещё выполняются. Новые результаты добавляются после завершения запусков.

Ограничения: locale decimal parser, pointer stepper/scrub affordance policy, отдельный Figma NumberField, target OS/AT/touch/Firefox/WebKit/native desktop acceptance открыты. CSS units/auto/expressions остаются в owner DraftProperty. Native-number/defaultValue/onChange overrides не допускаются. При extreme XL/150%/X24/Y12 панели по-прежнему тесные и требуют прокрутки. Geometry/counts не означают maturity всей библиотеки.
