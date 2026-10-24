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

На текущем локальном этапе пройдены120 contract/foundation tests (115 прежних +5 typography),7 новых Lab browser groups и три TypeScript проекта/build. Installed-package25/25 groups на React18.3.1/19.2.7 и полная регрессия150 browser/24 model groups также прошли. [Local summary](../../portal/component-lab/pilots/settings-parametric/verification/typography-local-summary.json), [новые7 browser groups](../../portal/component-lab/pilots/settings-parametric/verification/typography-local-results.json), [package proof](../../packages/seda-ui/verification/package-results.json). Публикация20 и production proof подтверждены ниже; первый независимый CI завершился failure в Building, см. уточнение ниже. Матрицы role/scale/theme/size являются вложенными samples, не дополнительными workflows.

Новые7 browser groups: canonical Text/source, shared scale/inspector, role/history/reload, независимость X/Y/radius/controlSize, длинная кириллица/viewport, theme repaint/save и JS errors. Public verifier отдельно проверяет SSR/Strict hydration, unknown role/tag/scale rejection,23 DOM/compiler roles, inherited/explicit/standalone scopes, control geometry independence,80/100/115/150/200%, wrapping и RTL на React18/19.

## Оставшаяся работа

Text не добавлен в serializable component contract registry: остаются11 component contracts плюс отдельный executable foundation module, а не12 certified components. Public component count становится19. Figma Text component/variables handoff, contrast/AT/native desktop/cross-engine и визуальная приёмка открыты. Цвет Text наследуется от host, поэтому contrast нельзя доказать одними метриками шрифта. Текстовые roles нужно осмысленно применять в остальных composition surfaces; ползунок не превращает каждый native текст страницы в Text автоматически.

Typography author content в Building/Chat/Sandbox сохраняет собственную модель; UI scale не переписывает canvas font properties и не служит zoom документа. В старом Lab preview heading намеренно использует наследуемую SEDA role; это демонстрационный макет, не импортированный исходный artwork.

Общая цель, остальные5 reference screens,4 класса приложений и visual acceptance всех реализованных screens остаются открытыми.

## Version20 — публикация и production proof

Опубликована [version20 прежнего owner-private сайта](https://seda-ai-pilot.kenymook.chatgpt.site/). Deployment appgdep_6adbd2e7e1188191a304d031c0a1e8b0 succeeded; Sites source c096a17538b38192fea09a3efdc1431ed1b2674b; functional GitHub1fcc034cfe901ab731d200cd67f6d073bef122e1. Access revision1: один owner, visitors0/groups0. [Release record](../../portal/component-lab/pilots/settings-parametric/verification/typography-v20-release.json).

Publication checkout повторил150 browser/24 model groups, UI/pilot/reference TypeScript и build. [Результаты](../../portal/component-lab/pilots/settings-parametric/verification/typography-v20-publication-checks.json). На production повторены все7 новых typography groups с24 вложенными profile samples, role/history/save/reload, длинной кириллицей и тремя viewport. HTTP200;589 canonical source hashes совпали; JavaScript errors0. [Production proof](../../portal/component-lab/pilots/settings-parametric/verification/typography-live-v20.json), [Light](../../portal/component-lab/pilots/settings-parametric/verification/typography-live-v20-light.png), [Dark](../../portal/component-lab/pilots/settings-parametric/verification/typography-live-v20-dark.png).

Пример applied metrics: heading/section =20/32px при100%,23/36.8px при115%,30/48px при150%; heading/panel при115% =20.7/27.6px. Это проверенные computed CSS значения, не rounded prose.

[CI40027185664](https://github.com/kenymook/seda_docs/actions/runs/40027185664), job120666214894, для functional1fcc034 завершился failure в Building keyboard scenario; полный browser success не заявляется. Последующие отчёты не объявляются прошедшими его CI.

## Уточнение результата CI40027185664

Run завершился failure, а не ожиданием установки Chromium. Raw job120666214894 logs подтверждают package25/25 и contract/foundation120/120, TypeScript/build PASS. Browser pipeline остановился в Building document-keyboard-move-nest-copy-delete:15/16 Building browser groups, остальные Chat/Sandbox/Typography suites в этом run не запускались. Ранее опубликованные local/production typography proofs сохраняют свой scope, но этот run не доказывает полный browser success.

Причина: после DOM reparent фокус возвращался через RAF; следующая быстрая клавиатурная команда успевала прийти в body и игнорировалась. Исправление переносит owned focus в useLayoutEffect с document/page guard. Новый regression держит RAF и выполняет6 последовательных indent/outdent commands; Building17/17 browser и5/5 model проходят локально. Новый CI ещё необходим.

После исправления focus новый CI40031537628 для3a05c5777944288f14edbcc5fcac973a20ff250f завершился completed/success:120/25/153/28 и TypeScript/build. Common typography code не менялся; в новом run прошли7 Lab typography groups и обе installed React typography groups. [CI record](../../portal/component-lab/pilots/settings-parametric/verification/editor-quality-ci-v21.json). Это не отменяет failure предыдущего run.
