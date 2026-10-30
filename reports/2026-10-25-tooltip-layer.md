# Общий Tooltip для рабочих приложений SEDA

Раньше `IconButton.tooltip` выводил native title: одинакового слоя, keyboard feedback и общей типографики не было. Добавлен публичный Tooltip и общий внутренний runtime; 30 действий в Файлах, Документах, Чате и Sandbox теперь получают настоящую подсказку. Accessible name остаётся у кнопки. Новые внешние зависимости и токены не добавлены.

## Поведение и геометрия

- Focus открывает подсказку сразу, hover — через 350 ms. Pointer может перейти на поверхность; нет auto-dismiss timer. Уход из обеих областей без focus закрывает через 100 ms. Escape закрывает без смены focus; новый вход focus открывает снова, обычный rerender — нет.
- На документ открыт один Tooltip. Portal остаётся в owning native dialog, native manual Popover выводит поверхность над clipping. Общая overlay очередь закрывает сначала верхний слой. Без Popover есть fixed fallback с ограничениями для transformed ancestors/top layer.
- Content — plain string; API исключает controls/links внутри. Existing aria-describedby сохраняется, trigger refs и пользовательские handlers работают. Pointer activation закрывает подсказку, не блокирует действие. Disabled/loading/скрытый или полностью clipped/offscreen trigger закрывает поверхность. Unmount очищает таймеры, portal, listeners и observers.
- Цвета берутся из существующих tooltip dark/light tokens. Текст — Text caption/default: минимум 12 px, при 150% — 18 px, независимо от control density. Padding 8×12, radius 6, max-width 304, bridge 6 и viewport gutter 8 — documented experimental surface geometry; это не новые токены и не утверждённая Figma fidelity. У подсказки нет анимации, стрелки и тени.
- Публичный API: content, render-function children, variant default/light, placement top/bottom/left/right, disabled, describedBy. Arrow, size, arbitrary delay и controlled open пока не реализованы. Привязывайте переданные ref/aria-describedby к настоящему trigger, не к обёртке.

## Проверка

Implementation commit: `d27442f376d9e8057d28924562bb4df5ff7c9492`.

Installed tarball: 45/45 групп PASS на React 18.3.1 и 19.2.7 без source/React aliases. Отдельный финальный tarball-прогон Tooltip включает SSR/Strict hydration, 6 invalid inputs, 16 theme/density/scale сочетаний и 21 именованную проверку поведения на каждую React-версию. Проверены actual focus/description, hover transfer/persistence, Escape suppression/new focus, original handlers/ref, viewport flip/shift, offscreen dismissal, реальный contrast вариантов, content update, native Modal/Menu, forced colors, reduced-motion и non-Popover fallback. Число 16 относится к DOM-матрице, не к независимым пользовательским workflows.

В реальных reference-приложениях: 64 сочетания 4 routes × 2 themes × 4 densities × 2 scales, X24/Y12. Проверяются применённые provider настройки, Caption metrics, полное описание, сохранение accessible name/focus и неизменность actual button border box. Просмотрены снимки Chat/Sandbox при Dark/XL/150% и больших отступах. Такой extreme-профиль не считается утверждённым повседневным layout.

Первый пакетный прогон выявил подавление новой focus-сессии после клика при сохранённом pointer hover. Исправлен runtime, не ослаблено ожидаемое поведение. Первый application fixture не содержал обязательный view: storage validator корректно применил defaults; fixture исправлен и теперь явно ожидает нужные theme/density/scale. Результаты неуспешных прогонов не засчитаны. Screenshot baselines для сокрытия ошибок не обновлялись.

Полная pilot sequence завершилась с exitCode 0, включая 8 reference applications, model/preview/renderer suites и loading матрицу Lab. Она предшествует последним исправлениям callback ref cleanup и keyboard click listener. После cleanup финальный build/TypeScript и focused Tooltip64/Modal32/Lab55 прошли; после последнего click listener новый установленный tarball прошёл все 21 Tooltip workflows и 16 сочетаний на каждой React-версии. Полные 45 package groups выполнены после cleanup, до последнего click listener. Остальной runtime не менялся. Эти границы указаны, чтобы не выдавать прежний широкий прогон за повторение всех проверок на последнем head.

Дополнительная проверка воспроизвела потерю пользовательской cleanup функции callback ref в React19 (mounted1/cleaned0). Теперь составной ref сохраняет эту функцию; после unmount mounted/cleaned совпадают. На React18 сохранён legacy callback(null), на React19 — cleanup contract. Также подсказка закрывается при Enter activation, а исходный action handler выполняется. Соответствующие проверки добавлены в общий package verifier.

## Публикация

[Тот же приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) — version40. Native deployment `appgdep_6add1ffb37708191ac8b504251658183` succeeded. Site source `7e4b5801491f93b9fecf0f6e5a2d73cf4693bd8d`; archive 7,745,807 bytes, SHA256 `16da506b054452fb9f0869f298cb740abbf01f8b562b46de88d5b7ff15ab1b7d`. Custom/revision1: один owner, ноль external visitors/groups. Аудитория не менялась.

Production повторила Tooltip64, root text24 и Modal32 на восьми reference routes: ошибок JavaScript0. Все783 hashes, включённые в build provenance, совпали с каноническими локальными исходниками и установленным пакетом. Это проверка состава данной сборки, не аудит всех файлов репозитория. Финальные снимки Chat/Sandbox ниже получены с live version40.

При первом общем production-прогоне предыдущий typography verifier оставил viewport1702, а Tooltip fixture предполагал1440. Verifier теперь явно устанавливает1440×1288; повторный прогон прошёл без runtime-изменений. Затем test-only дополнение проверило все четыре placement на том же final tarball в React18/19. Последние изменения verifier не входят в browser bundle; повторная публикация не требуется. Исходники перед сборкой нормализованы к каноническим Git LF bytes; raw evidence logs также LF.

[Release evidence/hashes](../portal/component-lab/pilots/settings-parametric/verification/tooltip-v40-release.json), [полные production результаты](../portal/component-lab/pilots/settings-parametric/verification/v40-production-results.json), [финальный TypeScript/build](../portal/component-lab/pilots/settings-parametric/verification/v40-final-build-log.txt), [loading measurements](../portal/component-lab/pilots/settings-parametric/verification/v40-loading-results.json).

CI последнего PR head здесь не объявляется завершённым. Contract/foundation code не менялся; повторный запуск122 тестов в этой итерации не заявляется, прежний результат сохранён в v39 evidence.

## Границы результата

22 основных component exports; 11 executable control contracts остаются без изменений. Tooltip пока не имеет executable surface-family instance contract. Это добавляет проверяемый механизм для плотных рабочих интерфейсов, но не подтверждает готовность всей библиотеки. Открыты Figma fidelity, оставшиеся dynamic/icon-only action hints, многословный контент, полное RTL и целевые browser/OS/AT. Native disabled controls требуют доступного видимого объяснения; Tooltip не хранит критичную информацию. Screen-reader/desktop-shell сертификация не заявляется.

Основания поведения: [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), [APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) (pattern guidance пока без окончательного task force consensus). Требования доступности не заменены наличием ARIA-атрибутов.


Артефакты: [package summary](../portal/component-lab/pilots/settings-parametric/verification/v40-package-summary.json), [package log](../portal/component-lab/pilots/settings-parametric/verification/v40-package-log.txt), [pilot log](../portal/component-lab/pilots/settings-parametric/verification/v40-pilot-log.txt), [focused log](../portal/component-lab/pilots/settings-parametric/verification/v40-focused-log.txt), [React18 Tooltip](../portal/component-lab/pilots/settings-parametric/verification/v40-tooltip-react-18.3.1.json), [React19 Tooltip](../portal/component-lab/pilots/settings-parametric/verification/v40-tooltip-react-19.2.7.json), [application matrix](../portal/component-lab/pilots/settings-parametric/verification/v40-tooltip-workspace.json), [Chat](../portal/component-lab/pilots/settings-parametric/verification/v40-chat-tooltip.png), [Sandbox](../portal/component-lab/pilots/settings-parametric/verification/v40-sandbox-tooltip.png).
