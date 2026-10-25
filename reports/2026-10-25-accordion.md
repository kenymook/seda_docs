# Accordion: общие секции инспекторов — 25.10.2026

Public experimental Accordion из установленного @seda-ai/ui заменяет локальные details/summary Framer/Webflow и disclosure sections Spline. Реальные поля, validation, drafts, история и model/save ownership сохраняются. Spline placeholders остаются обозначенными как неисполненные функции.

Single/multiple, controlled/uncontrolled ownership, обязательная открытая секция, optional roving keyboard, semantic headings, native Button/Badge/Icon, mounted hidden panels и focus repair реализованы в общем компоненте. ForceMount по умолчанию сохраняет draft; явный false разрешает reset при unmount. Trigger title следует control font/line-height, description — Text role. Geometry/colors связываются с provider и existing Accordion tokens. tokens.json не изменён; executable instance registry остаётся11.29 component entry modules/36 runtime exports не означают29 готовых компонентов.

Формулы, API и причины дополнительных props документированы в specs/data-display/accordion.md. Compact panel прозрачен, использует foundation padding16+X/bottom16+Y; старые локальные section paddings удалены, чтобы не удваивать отступы. Мгновенное переключение цветов устраняет transient low contrast при смене темы; chevron сохраняет foundation150ms rotation с reduced-motion fallback. Height animation не задерживает доступность — панель переключается сразу.

## Проверка

Installed consumer:384 выбранных сочетания width/theme/variant/control size/density/type. Проверяются24 invalid models, aria associations, required-open, disabled, keyboard, draft retention против explicit unmount, скрытие/удаление focused panel, внешний focus, retry/duplicate-save/loading и reduced motion. Реальные Framer/Webflow/Spline имеют отдельные72 viewport/theme/profile cases и сохранённый baseline документа: параметры UI не переписывают модель, invalid draft/validation переживают закрытие/раскрытие.

Framer12/Webflow13 исходных browser workflows прошли после подключения. Финальный package/application прогон, production и CI фиксируются после завершения; PASS заранее не заявляется. Предыдущий v48 evidence head e447036b79508a26af6c8c64076a451406dd0e6a получил [independent CI success во всех4 группах](https://github.com/kenymook/seda_docs/actions/runs/40192912070).

## Ограничения

Fresh Figma6668:44 review недоступен из-за уже полученной service quota; исходная спецификация не является свежей pixel-приёмкой. Нет нового executable Accordion instance contract, surface spacing/motion/radius остаются foundation fallback. Long titles более2 строк требуют content review; trigger не ограничен фиксированной высотой. Browser evidence не заменяет screen readers/native desktop/Firefox/WebKit/performance. Loading/error/retry принадлежит содержимому приложения, Accordion не симулирует transport. Общая цель зрелости библиотеки остаётся открытой.
