# Смысловые границы, фокус и составные состояния контролов

Продолжение активной цели зрелой SEDA для рабочих веб/десктоп-приложений. Статус всей библиотеки и fidelity/AT приёмка девяти Figma frames остаются открытыми.

## Исходные дефекты

- Нейтральные поля и unchecked choices: boundary примерно 1.279:1; Toggle off Light — 1.128:1. Граница контролов использовала общую декоративную border/default.
- Focus ring был alpha24: около 1.394:1 Light/1.284:1 Dark. У поля был дополнительный синий border, но standalone controls полагались на слабую внешнюю обводку.
- Checked Checkbox/Radio при hover получали unchecked background из более специфичного selector. Белый marker терялся; selected+error давал примерно 1.071:1 на Light error surface.
- Unchecked Radio без выбора получал полоску Checkbox indeterminate: CSS :indeterminate применяется и к такой radio group. Исходный Dark capture показывает этот дефект; правило теперь ограничено type=checkbox.
- Toggle thumb в Dark on-hover терял контраст. В forced-colors custom thumb сливался с track. Дополнительная проверка выявила Lab-specific disabled+mixed background priority.

## Решение и точный handoff

Слои и importer JSON не менялись. Новые semantic роли нужны потому, что прежние neutral border/default/hover/strong являются декоративными и не обеспечивают essential boundary contrast; существующие role values не усиливались глобально.

В semantic Light/Dark добавлены:

- border/control/default, hover, pressed → color/black/50,60,70 в Light и color/white/40,50,60 в Dark.
- container/neutral/strong/default, hover, pressed → те же foundation leaves для другого назначения: заполнения neutral control indicator.

TextField/TextArea/Select default/loading/read-only borders используют border/control/default, hover — control/hover, active — control/pressed. Checkbox/Radio neutral borders используют default/hover. Общие декоративные border/default/subtle остались прежними.

Focus/ring теперь alias border/focus; focus/ring-strong — icon/brand. Новый raw hue не вводился. Для Keyboard focus применим контраст с соседним фоном, а не искусственное требование 3:1 между двумя разными состояниями. Кнопки с различимой подписью/иконкой не обязаны иметь контрастную рамку hit-area. Основание: [W3C Understanding SC1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Новые required component roles:

- checkbox/control/icon/error и radio/control/dot/error → status/danger/icon.
- toggle/thumb/on → text/on-brand/primary; off сохраняет surface/base.
- toggle/border/default → border/control/default; disabled → status/disabled/border.
- toggle/track/off/default,hover,active → container/neutral/strong/default,hover,pressed.

Toggle border включён в border-box; thumb offsets компенсируют 1px border. Его размеры, фактические insets и центр сохраняются. Forced-colors thumb использует системные CanvasText/GrayText. Hover не перекрывает checked/error, :indeterminate принадлежит только Checkbox, disabled имеет приоритет над selected/mixed. В Lab error gallery Checkbox/Radio теперь показывают настоящие errorText и interactive native state.

Spec mapping таблицы синхронизированы. Figma bindings не редактировались: требуется переназначение перечисленных border/focus/marker/track roles и отдельная visual acceptance. Для custom token sources новые required leaves обязательны; validation/bridge отклоняют их отсутствие.

## Проверка и границы доказательства

- 122/122 contract/foundation tests PASS, включая atomic missing required roles. Первый запуск нового negative test ошибочно обходил token tree через лишний children; исправлен test traversal, затем вся последовательность 122 прошла.
- Package:35/35 групп PASS React18.3.1/19.2.7, `.diagnostics-package/2026-10-24T16-06-37-995Z/results.json`, без UI/React aliases в tarball consumers.
- На каждую React-версию: исходная матрица60, затем focused расширение72 сочетания theme/state/checked/rest-hover-focus, включая disabled+mixed. Это повторяющиеся измерения семи controls, не 72 пользовательских workflow. Active threshold ≥3 по неокруглённым цветам. Минимум3.36415927095:1. Отдельно 8 Toggle S/M/L/XL on/off geometry cases и forced-colors markers. Числа не включают disabled paint в AA contrast; disabled проверяется native guard и override consistency.
- Lab:96 compiler-bound сочетаний theme/size/scale(default80/100/150)/validation/toggle-state, boundary/marker/glyph/focus и thumb geometry PASS. Отдельный native-property fixture подтверждает disabled-mixed background/border priority.
- Общая последовательность pilot прошла: contrast144, visual24, feedback8, Lab55, workspace21, controls12, восемь reference-приложений и domain/preview/renderer suites. После последней Lab-only disabled-mixed CSS-поправки повторены nontext96 и controls12. Reference runtime не менялся этой последней поправкой. Прежние 288 loading cases сохраняют дельты0px. TypeScript: библиотека/pilot/references PASS.
- Просмотрены baseline и исправленный Dark capture: границы видимы, выключенный Toggle различим, полоска unchecked Radio исчезла. Эти результаты не заменяют pixel/AT/OS приёмку, все Button variants, все внешние backgrounds, popups, RTL и authored canvas. Отдельная визуальная работа остаётся по вертикальному выравниванию соседних choices с helper/error text и общей плотности сложных экранов. Scope обычных цветов — default control size; размеры геометрии отдельно проверены в package и Lab.

Локальная file-dependency диагностика потребовала явного peer React dedupe; финальные tarball consumers проверены без alias. После каждого library CSS build установленная копия pilot обновлялась, чтобы не измерять старые dist styles.

## Публикация и production proof

- Прежний URL https://seda-ai-pilot.kenymook.chatgpt.site/, version35. Deployment `appgdep_6adcdbe6a33c819187016c3a0c8bbb68` succeeded; custom/revision1, один владелец, без visitors/groups.
- GitHub implementation `39438d18b2562bd059861ade190599a8b25c110a`; Site source `a6aa07ed2dd5623638acd1a05607ea647ff51c42`. Archive SHA256 `916c0ed27c57657913c1b08fab2217d134f6e173727fb6966adec1dd2e787b71`, 7,561,681 bytes.
- Production повторила 96 сочетаний с реальными hover/focus и Toggle changes, disabled-mixed fixture и geometry: 0 failures, 0 JS errors. Все 755 source hashes совпали. Два error captures и Dark controls capture приложены в verification; release summaries и hashes полных raw evidence — `verification/nontext-v35-release.json`.
- Production Light error capture просмотрен: checked error markers и границы читаемы. Это не закрывает перечисленные внешние visual/AT/OS gates; общая цель остаётся активной.
