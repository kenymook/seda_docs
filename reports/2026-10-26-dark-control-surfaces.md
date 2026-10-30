# D36: поверхности полей на всех reference-экранах — приватная v63

Проверил восемь приложений лаборатории: Recents, Building, Chat, Sandbox, Spline, Webflow, Framer и Workflow. В тёмной теме поле и Select раньше брали непрозрачный `surface.base` (`#171718`) и оказывались темнее панели. Это особенно заметно в инспекторе Framer, на который указал пользователь. В исходном кадре Ruslan/Framer `1:7743` панель тёмная, а поля визуально несколько светлее неё; точные swatches каждого поля этот кадр не раскрывает.

В [контракте поверхности](../packages/seda-contracts/CONTROL-SURFACE.md) добавлены семантические роли `surface.control` и `surface.control-hover`. В Dark они используют существующие белые слои 7% и 11% поверх панели. В Light значения сохраняют прежнюю белую и subtle поверхности. Эти роли идут через общий resolver и SEDA Provider в TextField, Select, TextArea, DatePicker, TimePicker, Search, VerificationCode и ColorPicker; NumberField наследует TextField. Служебные Select лаборатории используют ту же роль. Disabled и смысловые состояния ошибок/предупреждений не перекрашивались.

## Проверка

| Область | Результат |
| --- | --- |
| TypeScript | UI package и приложение с references — PASS. |
| Контракты | 146/146 Node tests; новый тест проверяет происхождение surface-ролей для восьми семейств, двух тем и отрицательный случай. |
| Установленный пакет | 75/75 групп React 18/19. Проверка контраста теперь учитывает прозрачное поле **вместе с фактической подложкой SEDA Provider**; порог текста 4.5:1 сохранён. |
| Браузер локально | Lab 24/24 и references 29/29. Новый сценарий проверил 8 экранов × 2 темы = 16 случаев, 113 видимых полей в Dark, hover/focus Framer и служебные Select. Ошибок страницы нет. |
| Приватная v63 | На том же адресе совпали build metadata и SHA-256 всех 532 артефактов. Те же 16 случаев и 113 видимых полей в Dark прошли без ошибок страницы. |

Для каждого экрана сохранены [снимки опубликованной версии в обеих темах](../portal/component-lab/pilots/settings-parametric/verification/control-surfaces/live-screens) и [сырые результаты](../portal/component-lab/pilots/settings-parametric/verification/control-surfaces/live-results.json). Я визуально сравнил плотные инспекторы Framer, Spline, Webflow, Chat и Workflow в Dark; поля теперь светлее прилегающей панели. Light-значения не менялись. Выборочная визуальная проверка и компьютерные выборки не являются полной дизайнерской приёмкой всех состояний. Снимок [источника Framer](../portal/component-lab/pilots/settings-parametric/verification/control-surfaces/figma-framer-source.png) фиксирует направление, но не доказывает точного совпадения цветов.

## Поставка

- Runtime commit: `8c9d8ee2eee9c7b9cf7dd6873ab80eac16aac07c` в существующем [PR №4](https://github.com/kenymook/seda_docs/pull/4). Merge не выполнялся.
- Site source commit: `48602bbe6d89f97e6b2b9014eeed589c624c6781`. Сверены 11 новых canonical source файлов относительно D35 и 532 артефакта архива. Архив 8 297 109 bytes, SHA-256 `52ca72a9cd0806949a053aca97605fed9ae647c413b13f1c1b6c60008a08d85b`.
- [Прежний приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) — версия **63**, deployment `appgdep_6adf13c387d481918c67fe64be2d92ab` succeeded. ACL revision 1: один owner, 0 groups, 0 external visitors; доступ не менялся.
- Сырые логи, снимки и контрольные суммы: [verification/control-surfaces](../portal/component-lab/pilots/settings-parametric/verification/control-surfaces).

## Открытые ограничения

Нативный popup Select рисует браузер/OS и в эту проверку не входит. Не проверены high-contrast, OS/AT, touch, Firefox/WebKit и native desktop shell. Исходный Framer frame не даёт точных значений всех слоёв полей; необходима дизайнерская приёмка по оригинальным компонентам и состояниям. Прочие визуальные вопросы экранов, включая типографику и композиции, этим изменением не закрыты. Цель зрелой библиотеки для веб- и десктоп-приложений остаётся в работе.
