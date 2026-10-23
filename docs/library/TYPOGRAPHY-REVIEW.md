# Параметрическая типографика SEDA

## Проблема и результат

Пользователь отметил heading `editor-preview > .editor-artboard > h2`: Lab text scale менял controls, но heading оставался21px. В foundation уже существовали semantic roles, однако они не имели общего browser execution. Дополнительно документ ошибочно называл20px heading токеном title2, тогда как реальные tokens.json имеют title2=40px и h2=20px. Источник font/family — Inter, не указанный ранее SF Pro Text. Tokens.json не менялся.

Добавлены executable foundation typography и public Text.23 роли используют реальные token paths/weight/spacing/line-height, общий compiler и CSS с provenance. Font size/line-height/letter-spacing масштабируются с сохранением дробных значений; minimum роли объявлен явно. Important UI text не уменьшается ниже12px; tiny/micro остаются ограниченными служебными ролями. Control sizes независимы от текстовой иерархии. Provider принимает абсолютный inherited textScale80–200; вложенный explicit scope не перемножается с parent.

В Lab workspace headings/prose используют общий Text. В Editor можно выбрать четыре heading roles; выбор включён в document undo/redo/save/reload с совместимостью старых saves. Inspector выводит применённые size/line-height и фактический token path. Исходный Lab потребляет canonical TS components через существующий source alias; теперь stylesheet берётся из установленного public build с manifest parity. Installed-package consumption Text доказывается отдельно React18/19 consumers, а не выдаётся за отсутствие alias в Lab.

## Найденные дефекты

- Устаревшие role paths документа не соответствовали token JSON; mapping исправлен по фактическим ключам, значения не переименовывались и не дублировались.
- Старый source stylesheet Lab не включал generated Text CSS. Подключён полный public stylesheet; это проверяется настоящим computed font-size.
- DOM id nodeName создавал window.nodeName element alias, из-за чего React event handling при resize мог вызвать `elem.nodeName.toLowerCase is not a function`. ID переименован в lab-active-node; browser QA проверяет отсутствие этой коллизии и JS errors.
- Изолированный SSR fixture не объявлял UTF-8 и создавал mojibake/hydration mismatch для кириллицы. Исправлен HTTP charset/meta; это ошибка fixture, не заявленный дефект Text.
- С полным CSS Ghost trigger получает canonical hover paint, пока над ним указатель. Проверка теперь сверяет hover с настоящим token и после pointer leave проверяет transparent default; стили компонента ради теста не менялись.

## Проверки и границы доказательств

На текущем локальном этапе пройдены120 contract/foundation tests (115 прежних +5 typography),7 новых Lab browser groups и три TypeScript проекта/build. Installed-package25/25 groups на React18.3.1/19.2.7 и полная регрессия150 browser/24 model groups также прошли. [Local summary](../../portal/component-lab/pilots/settings-parametric/verification/typography-local-summary.json), [новые7 browser groups](../../portal/component-lab/pilots/settings-parametric/verification/typography-local-results.json), [package proof](../../packages/seda-ui/verification/package-results.json). Новый CI и публикация пока не заявлены. Матрицы role/scale/theme/size являются вложенными samples, не дополнительными workflows.

Новые7 browser groups: canonical Text/source, shared scale/inspector, role/history/reload, независимость X/Y/radius/controlSize, длинная кириллица/viewport, theme repaint/save и JS errors. Public verifier отдельно проверяет SSR/Strict hydration, unknown role/tag/scale rejection,23 DOM/compiler roles, inherited/explicit/standalone scopes, control geometry independence,80/100/115/150/200%, wrapping и RTL на React18/19.

## Оставшаяся работа

Text не добавлен в serializable component contract registry: остаются11 component contracts плюс отдельный executable foundation module, а не12 certified components. Public component count становится19. Figma Text component/variables handoff, contrast/AT/native desktop/cross-engine и визуальная приёмка открыты. Цвет Text наследуется от host, поэтому contrast нельзя доказать одними метриками шрифта. Текстовые roles нужно осмысленно применять в остальных composition surfaces; ползунок не превращает каждый native текст страницы в Text автоматически.

Typography author content в Building/Chat/Sandbox сохраняет собственную модель; UI scale не переписывает canvas font properties и не служит zoom документа. В старом Lab preview heading намеренно использует наследуемую SEDA role; это демонстрационный макет, не импортированный исходный artwork.

Общая цель, остальные5 reference screens,4 класса приложений и visual acceptance всех реализованных screens остаются открытыми.
