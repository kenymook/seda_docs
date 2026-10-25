# Accordion: общие секции инспекторов — 25.10.2026

Public experimental Accordion из установленного @seda-ai/ui заменяет локальные details/summary Framer/Webflow и disclosure sections Spline. Реальные поля, validation, drafts, история и model/save ownership сохраняются. Spline placeholders остаются обозначенными как неисполненные функции.

Single/multiple, controlled/uncontrolled ownership, обязательная открытая секция, optional roving keyboard, semantic headings, native Button/Badge/Icon, mounted hidden panels и focus repair реализованы в общем компоненте. ForceMount по умолчанию сохраняет draft; явный false разрешает reset при unmount. Trigger title следует control font/line-height, description — Text role. Geometry/colors связываются с provider и existing Accordion tokens. tokens.json не изменён; executable instance registry остаётся11.29 component entry modules/36 runtime exports не означают29 готовых компонентов.

Формулы, API и причины дополнительных props документированы в specs/data-display/accordion.md. Compact panel прозрачен, использует foundation padding16+X/bottom16+Y; старые локальные section paddings удалены, чтобы не удваивать отступы. Мгновенное переключение цветов устраняет transient low contrast при смене темы; chevron сохраняет foundation150ms rotation с reduced-motion fallback. Height animation не задерживает доступность — панель переключается сразу.

## Проверка

Installed consumer:384 выбранных сочетания width/theme/variant/control size/density/type. Проверяются24 invalid models, aria associations, required-open, disabled, keyboard, draft retention против explicit unmount, скрытие/удаление focused panel, внешний focus, retry/duplicate-save/loading и reduced motion. Реальные Framer/Webflow/Spline имеют отдельные72 viewport/theme/profile cases и сохранённый baseline документа: параметры UI не переписывают модель, invalid draft/validation переживают закрытие/раскрытие.

Framer12/Webflow13 исходных browser workflows прошли после подключения. Финальные локальные результаты: **57/57 групп installed-package** с React18.3.1 и19.2.7, **123/123 тестов контрактов**, TypeScript pilot/references PASS. Все **43 verifier scripts** завершились с exit0:21 Lab и22 references.384 выбранных сочетания Accordion проверены на каждой React-версии; это целевая матрица, а не полный перебор всех возможных props. Loading-кнопка внутри панели сохранила размеры: изменение ширины и высоты0px.

Первый полный Lab-проход остановлен контролем целостности: ref/focus-capture изменились после сборки. Этот проход не засчитан; исходники зафиксированы, пакет и приложение пересобраны, обе группы полностью повторены без runtime-изменений. В первом reference-проходе браузер завершился при Spline screenshot; причина не установлена. Исходный отказ сохранён, отдельная диагностика Spline прошла10/10 с нормальным browser exit0, финальная полная references-группа прошла22/22 scripts. Успешный повтор не считается доказательством причины первого отказа. Screenshot baselines не переписывались.

## Публикация и визуальная проверка

На прежнем [приватном сайте](https://seda-ai-pilot.kenymook.chatgpt.site/) опубликована **версия49**, deployment `appgdep_6addfef4d26481918ed72cb36c6d7013` succeeded. Проверенный runtime GitHub: `67f19f537378490e5949a762c01b8e7b7a201e69`; Site source: `cd09bac96656795fd00109279c62cbb17349f04b`. Доступ custom/revision1: один owner, групп и внешних посетителей0.

Между локальной и Site сборками совпали868 source hashes и532 artifact hashes.663 tracked runtime файла дополнительно сверены с canonical Git blobs;205 записей относятся к установленному пакету. Во всех трёх references положительно подтверждено включение установленного Accordion, sourceAlias=false. Local gzip:7,952,200 bytes, SHA256 `e0bff212528d5bca283f11e392a2373afe993bc02050d3aa44f1f42a5a82e21a`; нормализованный Sites tar имеет отдельный hash в release.json.

Свежий браузерный проход по опубликованной версии: **72** сценария Framer/Webflow/Spline, **160** сценариев согласованности восьми reference-приложений, **95** проверок фактической отрисовки glyphs; JavaScript errors0. Production загрузил и сверил байты всех532 артефактов. Числа разных scopes не складываются в сертификат зрелости.

Framer, Webflow и Spline визуально просмотрены в Light/Dark на production. Заголовки и иконки раскрытия следуют общей геометрии контролов; компактные панели сохраняют фон владельца и единый ритм полей. Удалены повторные section paddings. Визуальная проверка обнаружила transient низкий контраст текста во время theme-анимации — исправлено до финальных прогонов. Поля и сообщения могут увеличивать высоту секции; авторский canvas не перепараметризован.

[Release](../portal/component-lab/pilots/settings-parametric/verification/accordion/release.json), [production](../portal/component-lab/pilots/settings-parametric/verification/accordion/production-results.json), [package57](../portal/component-lab/pilots/settings-parametric/verification/accordion/package-summary.json), [снимки и raw logs](../portal/component-lab/pilots/settings-parametric/verification/accordion/).32 proof files сверяются по evidence-hashes.json. Следующий evidence-only commit не меняет опубликованный runtime.

Независимый [CI runtime67f19f5](https://github.com/kenymook/seda_docs/actions/runs/40195530274) на момент записи: package и references success, Lab выполняется; общий success заранее не заявляется. Предыдущий v48 evidence head e447036b79508a26af6c8c64076a451406dd0e6a получил [independent CI success во всех4 группах](https://github.com/kenymook/seda_docs/actions/runs/40192912070).

## Ограничения

Fresh Figma6668:44 review недоступен из-за уже полученной service quota; исходная спецификация не является свежей pixel-приёмкой. Нет нового executable Accordion instance contract, surface spacing/motion/radius остаются foundation fallback. Long titles более2 строк требуют content review; trigger не ограничен фиксированной высотой. Browser evidence не заменяет screen readers/native desktop/Firefox/WebKit/performance. Loading/error/retry принадлежит содержимому приложения, Accordion не симулирует transport. Общая цель зрелости библиотеки остаётся открытой.
