# D37: рамки полей и список Select — приватная v64

По замечанию в инспекторе Framer уменьшен контраст обычных рамок в тёмной теме. TextField, Select и TextArea теперь берут default/hover/pressed из общего `border.field` через существующий token resolver и SEDA Provider. Dark использует существующие белые слои с фактической прозрачностью около 30/35/40% вместо прежних 40/50/60%; Light разрешается в прежние значения. Квадратные IconButton, контуры Checkbox/Radio/Toggle, focus и смысловые error/warning/disabled состояния не менялись. NumberField наследует TextField.

Первое пробное значение default (около 25% белого) не прошло действующий порог контраста границы: 2,73:1 при минимуме 3:1. Финальное значение даёт **3,216:1** для TextField, TextArea и Select на контрольной тёмной поверхности в React 18 и 19. Порог теста не снижался.

Открытый нативный Select в браузере с `appearance: base-select` теперь использует непрозрачный `select.dropdown.surface` и отдельные роли для обычного, выбранного и недоступного option. Ранее список наследовал полупрозрачный фон trigger, из-за чего под ним просвечивали подписи инспектора. Нативные value, form и keyboard-механика сохранены; ArrowDown/Enter проверены в Framer.

## Проверка

| Область | Результат |
| --- | --- |
| TypeScript и сборка | Пакет UI и пилот с references — PASS. |
| Контракты | 147/147 тестов в 16 файлах. Каждый файл выполнен Node 24 test runner отдельно. Общий `npm test` на этой машине зависал без отчёта; его успешность не заявляется. |
| Установленный пакет | 75/75 групп React 18.3.1 и 19.2.7. Для каждой версии 72 сочетания состояний и взаимодействий в проверке контуров, без нарушений порога. Открытый Select и обе темы проверены отдельно. |
| Локальное приложение | Lab 24/24 и references 29/29. Отдельная матрица: 8 экранов × 2 темы, 113 видимых полей в Dark, фон popup, роль рамки, hover/focus Framer и отсутствие ошибок страницы. |
| Приватная v64 | Совпали metadata и SHA-256 всех 532 файлов манифеста. На опубликованном URL та же матрица из 16 экранов и 113 полей в Dark прошла без ошибок страницы. |

Я просмотрел [снимки всех восьми экранов в обеих темах](../portal/component-lab/pilots/settings-parametric/verification/field-borders-picker/live-screens), включая плотные инспекторы Framer, Spline, Webflow, Sandbox и Workflow, а также [открытый Select в Dark](../portal/component-lab/pilots/settings-parametric/verification/field-borders-picker/live-screens/framer-picker-dark.png). Поля на тёмных панелях выглядят спокойнее; список не просвечивает. [Сырые локальные результаты](../portal/component-lab/pilots/settings-parametric/verification/field-borders-picker/local-results.json), [результаты опубликованной версии](../portal/component-lab/pilots/settings-parametric/verification/field-borders-picker/live-results.json) и [сводка измерений](../portal/component-lab/pilots/settings-parametric/verification/field-borders-picker/summary.json) сохранены отдельно от снимков D36.

## Поставка

- Runtime commit `8e515e710a5180314ab4a47015fecb30172f26f5` отправлен в существующий [PR №4](https://github.com/kenymook/seda_docs/pull/4); merge не выполнялся.
- Site source commit `457fefa7307072980afc47249bd9abd5328b3264`; семь изменённых canonical source файлов и 533 файла собранного `dist` сверены побайтно перед упаковкой. Архив 8 299 946 bytes, SHA-256 `d81bae835faf6d8de1b3ffe4e438ddc0c38365792b5318442a06f889d7e8e8fa`.
- [Прежний приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) — версия **64**, deployment `appgdep_6adf2d070cf081919beac1a68fcf86c2` succeeded. ACL revision 1: один owner, 0 groups, 0 external visitors; доступ не менялся.

## Открытые ограничения

Стилизуемый popup зависит от поддержки `appearance: base-select`. В других браузерах список рисует платформа с переданным `color-scheme`; точное совпадение цветов не подтверждено. Не проверены Firefox/WebKit, screen reader/OS picker, touch, forced colors и native desktop shell. `border.field` применяется к подтверждённым TextField/Select/TextArea; Search и token-only DatePicker/TimePicker/VerificationCode/ColorPicker имеют отдельные роли и потребуют отдельной проверки общей матрицы полей. Эти экраны — локальные reference-композиции, а не подтверждение зрелости всей библиотеки или точного паритета с исходными Figma swatches.
