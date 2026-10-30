# SEDA native Modal: общая поверхность для reference-приложений

## Изменение

Общая обёртка WorkspaceDialog раньше содержала собственный native dialog, фиксированный h2 20px, SVG через img и один scrollport на всё окно. Теперь восемь reference-приложений используют публичный `Modal` из установленного `@seda-ai/ui`. Заголовок — Text heading/section, close — IconButton с оригинальным SEDA Icon close. Body прокручивается отдельно, close сохраняет квадратную зону минимум44px. Плотность контролов не меняет ширину поверхности.

API управляется open/onOpenChange; callback сообщает close-button/escape/scrim/native и returnValue. Есть initial/return focus refs, безопасный вход в confirmation/alert, Tab boundaries, политика Escape/scrim, восстановление после отклонённого native close и защита от устаревших close events. Footer принимает самостоятельные Button, включая loading. Confirmation/alert требуют description и запрещают scrim dismiss. Вложенные модальные окна не поддерживаются.

При проверке совместного поведения обнаружен отдельный дефект DropdownMenu: portal в body находился вне native dialog и попадал в inert background. Portal теперь остаётся внутри владеющего dialog; native Popover выводит меню поверх clipping. Проверяется фактический focus на menuitem, а не только наличие menu в DOM; первый Escape закрывает меню, следующий — Modal. Нативная модель inert/focus-return основана на [HTML dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element).

## Источники и ограничения

- Цвета — существующие modal component tokens; новые tokens/variants не добавлены. Заголовок — общий typography compiler. Размер close glyph следует общему icon slot.
- L720px, padding24px, radius12px, gutter32px и shadow сохранены из прежнего reference-dialog.css на b6768f7. S480/M560/XL960 и адаптация короткого viewport — documented experimental adapter, а не восстановленная геометрия Figma. В токенах отсутствуют surface width/padding/gap/radius/elevation Modal.
- Исходник дизайна Su1jWqKc9TkD1R8f7wHOQU node6653:395 не удалось перечитать: get_design_context и get_screenshot вернули MCP quota. Проверка fidelity по этому макету остаётся открытой.
- Modal — реальный React-компонент, но пока без executable instance contract. Число control contracts остаётся11: surface нельзя компилировать по формуле однострочной высоты. Следующий шаг требует surface-family compiler model.
- Общая обёртка reference-приложений мигрирована. Два специализированных окна основного Lab пока остаются локальными композициями. Остальные legacy-тексты/иконки/spacing композиций не объявляются согласованными этим изменением.
- Firefox/WebKit, assistive technology, native desktop shell, closed Shadow DOM, все альтернативные focus/scroll scopes и полная визуальная приёмка не подтверждены. Общая цель зрелой библиотеки остаётся активной.

## Проверки

Functional GitHub source: `57453e0980f5acc8abf6bcaef4b7102fa793c224`.

- Build и3 TypeScript-проекта PASS. Contract/foundation tests122/122, fail0. Modal не добавлен к этому числу.
- Установленный tarball:41/41 групп на React18.3.1/19.2.7, без source/React aliases. `packages/seda-ui/.diagnostics-package/2026-10-24T19-02-43-000Z/results.json`. Пакет содержит21 component exports плюс foundation/host APIs; JS exports27.
- В каждой из двух Modal-групп:13 invalid API cases, SSR/Strict hydration,16 сочетаний theme/density/scale и17 именованных workflow-проверок: focus cycle, inert background, menu Escape, safe confirmation/alert, close policies, rejected native close, method-dialog returnValue, dynamic focus repair, scrim drag/click, removed-trigger fallback, loading geometry, short viewport scroll, empty slots, fullscreen, forced-colors и unmount. Матрица16 — вложенные DOM-измерения, не16 независимых продуктовых сценариев.
- Tall body проверен при1200×800,600×360 и360×640; scrollbar доступен клавиатурой, close и footer остаются в viewport. В footer loading размеры проверены с допуском1px.
- Полная существующая pilot sequence завершилась с exitCode0: формы, фильтры/таблица/карточки, сохранение/ошибки/повторные запросы, все8 приложений и model/preview/renderer suites. Новый verify-reference-modal отдельно прошёл32 сочетания route/theme/density; затем включён в npm verify. Он сравнивает вычисленный font-size с действующей typography formula и проверяет реальный Modal, close glyph/44px target, native close и логическую цель focus.
- Существующая loading-матрица Lab повторена:288 сочетаний, максимальная дельта ширины/высоты0px. Это матрица измерений, а не288 пользовательских workflow.
- Первый package-прогон не засчитан: fixture ошибочно передавал textScale=1 вместо100. В диагностике также исправлен отсутствующий UTF-8 charset тестового HTTP server. Итоговый tarball-прогон выше выполнен после исправления harness и inert-portal дефекта. Screenshot baselines для сокрытия ошибок не обновлялись.

## Публикация

Тот же приватный URL: https://seda-ai-pilot.kenymook.chatgpt.site/, version38. Native deployment `appgdep_6add036413c48191905dc50f8e4aeff1` succeeded; Site source `626f9afac798529aa70b3693026bbf8d99bd2b1c`. Custom access/revision1 сохранён: один owner, ноль external visitors/groups.

Архив7,719,559 bytes, SHA256 `30dbd14c38af3594b0e23b7c769a2ecc5c10bb040ca55110ad98de0f68c7e4ad`. Production повторила text24 и Modal32: все773 source hashes совпали, JS errors0. Отмеченные пользователем subtitle/count сохраняют caption/default:100%=12px,150%=18px, минимум12px.

[Release evidence, raw-result hashes и production samples](../portal/component-lab/pilots/settings-parametric/verification/modal-v38-release.json). Полные логи: [package](../portal/component-lab/pilots/settings-parametric/verification/v38-package-log.txt), [contracts](../portal/component-lab/pilots/settings-parametric/verification/v38-contracts-log.txt), [pilot](../portal/component-lab/pilots/settings-parametric/verification/v38-pilot-log.txt). Снимки: [Workflow Dark/XL/150%](../portal/component-lab/pilots/settings-parametric/verification/v38-modal-workflow-dark-xl.png), [Files Dark/XL](../portal/component-lab/pilots/settings-parametric/verification/v38-modal-recents-dark-xl.png), [короткий viewport600×360](../portal/component-lab/pilots/settings-parametric/verification/v38-modal-600x360.png), [узкий360×640](../portal/component-lab/pilots/settings-parametric/verification/v38-modal-360x640.png).
