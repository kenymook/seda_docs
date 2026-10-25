# Иконки и плотность инспекторов — 25.10.2026

Вторая итерация переноса визуальных правил Files на Building, Chat, Sandbox, Spline Scene/Object, Webflow, Framer и Workflow. Исправлены служебные glyphs и композиция панелей. Компоненты по-прежнему импортируются из установленного @seda-ai/ui. Публичные API/токены, архитектура SEDA и размеры authored documents/canvas не менялись.

## Что изменено

ReferenceGlyph получает измеренные оптические границы исходного SVG, сохраняет пропорции и центрирует максимальную сторону силуэта в 80% общего icon slot. Размер slot берётся из SEDA-контрола и меняется вместе с размером/масштабом текста. Цвет — foreground владельца. Встроенная в экспорт полупрозрачность нормализована после mask, чтобы не умножать приглушение состояний компонента. Внутренние различия прозрачности сохранены. Цветные artwork, avatars, logos и thumbnails не перекрашиваются.

215 оригинальных SVG имеют metrics/hashes; Webflow использует 40 составных source glyph definitions. ReferenceCompositeGlyph сохраняет их исходную DOM-иерархию, SVG-фрагменты и их взаимное положение; размер и цвет применяются ко всему силуэту. Эксперимент со склеиванием в плоский SVG был отклонён и не входит в runtime. Исходные SVG bytes не изменены; проверяются 293 уникальных source files вместе с composite parts. Публичный каталог SEDA остаётся 25 glyphs: эти reference adapters не выданы за новые public exports.

Инспекторы используют общую композиционную шкалу:16px граница секции,8px связанные поля,4px подпись/значение. Заголовки секций Sandbox, Framer и Workflow приведены к label/default; поля и числа не получают фиксированную высоту поверх контрактов. Выравнивание и перенос рядов действий одинаковы. Spline при нехватке ширины переносит inspector ниже сцены; остальные поверхности сохраняют локальную прокрутку. Building не имеет inspector: новый для него не придуман. В Chat выровнена панель метаданных.

## Проверка и визуальная приёмка

Pilot/references TypeScript — PASS. Новый verifier:160 selected samples =8 routes ×2 themes ×2 widths (1440/1024) ×5 density cases: S/80/X0/Y0, S/100/0/0, M/100/0/0, L/115/X12/Y6, XL/150/X24/Y12. Это выбранные сочетания, а не все перестановки параметров. Проверяются icon slot/foreground/source binding, section padding/grid gaps, границы полей и отсутствие root overflow. Отдельный transparent raster probe проверяет 95 реально используемых в начальных состояниях glyph variants: ненулевой силуэт, оптический размер и peak alpha после нормализации. JavaScript errors0.

Просмотрены 32 снимка: обычная M100/1440 и крайняя XL150/1024 плотность каждого из 8 приложений в Light/Dark. До/после отдельно сопоставлены Building, Sandbox, Webflow и Framer. Сохранены 16 исходных снимков v42 для воспроизводимого сравнения. Замечания по каждому экрану — [visual-review.json](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/visual-review.json). Это агентская визуальная проверка; независимого designer signoff и fresh Figma fidelity approval нет.

Новый тест сначала остановился из-за owned browser context, затем из-за origin пустого тестового документа: CSS mask не мог рисоваться в about:blank с origin null. Исправлена настройка теста: отдельные страницы в явном context и same-origin probe. Условия проверки не ослаблены; исходные остановки сохранены как harness logs. Финальные снимки ждут штатного закрытия tooltip после диалога appearance.

Весь `npm run verify` завершился с exit 0: 37 последовательных скриптов на финальном artifact. Включены Files48, Composer48, Building24 parameter cases/36 authored boxes (X0/Y≤0.167px), application text96, tooltip64, modal32, adaptive panels6, Lab55/55, остальные control/workspace/editor/model/renderer проверки до Workflow15/15. Это отдельные сценарии и выборки, а не сумма независимых сертификатов качества. [Полный лог](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/full-verify.log). После добавления ожидания закрытия tooltip новый verifier повторён:160/160,95 painted variants, errors0. Старые snapshot baselines не обновлялись. Старые 123 contract tests/45 package groups этой итерацией заново не заявляются: package source не менялся.

## Границы результата

Принята согласованность перечисленных иконок и inspector recipes в проверенном Chromium-сценарии. Полное покрытие всех source variants/states, единая перерисованная icon family, public Table/Card, fresh Figma acceptance всех 9 frames, Firefox/WebKit, RTL, screen readers/native desktop shell и performance остаются открыты. При XL150 с дополнительным X24/Y12 часть редактора требует локальной прокрутки; это стресс-режим, а не рекомендуемая плотность.

Authored fixtures Webflow/Framer и процедурная Spline-сцена остаются ограниченными реконструкциями; реальный AI/backend/collaboration не подключены. Эти ограничения не объявляются устранёнными визуальным проходом.

Примеры: [Sandbox Light](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/sandbox-light-1440-m.png), [Sandbox Dark](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/sandbox-dark-1440-m.png), [Framer до](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/before-framer-dark.png), [Framer после](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/framer-dark-1440-m.png).

## Публикация

Версия 43 опубликована по прежнему приватному адресу. Deployment `appgdep_6add4d2132dc81919cc794b682c014d1` succeeded. Runtime GitHub commit `8312277dcfbfa1339317312341b6af76c53f6a99`; Site source `591e146611e3d25062232535c6f97e6e0159940f`. Archive 7 852 874 bytes, SHA256 `c0bd29fa02dc8e6415da312fbdd37c1a641ace0e4a485916a06da2523437912f`. Custom/revision1, один owner, external visitors0, groups0 — аудитория сохранена. Production proof завершён:796 source hashes и532 опубликованных artifact hashes совпали; inspector160/160, glyph raster95 иrhythm16 — PASS, JavaScript errors0. Свежие contexts исключают влияние предыдущих настроек. Live Sandbox/Webflow Light/Dark дополнительно просмотрены. [Production results](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/production-results.json).

## Повторная проверка опубликованной версии

Свежий запуск против существующей приватной v43 подтвердил 796 source hashes и 532 artifact hashes, inspector160/160, glyph raster95 и rhythm16; JavaScript errors0. Визуально повторно просмотрены Sandbox, Webflow, Spline и Workflow в Light/Dark. ACL прежний: custom/revision1, один owner, external visitors/groups0. [Повторная проверка](../portal/component-lab/pilots/settings-parametric/verification/inspectors-v43/production-recheck.json) содержит дату и hashes 48 свежих снимков (32 inspector и16 rhythm). Runtime не менялся, повторное развёртывание тех же файлов не выполнялось. Незавершённая локальная работа над Table исключена из этого результата.

## Повтор на текущей приватной версии51

Общие inspector recipes и optical glyph adapters сохранены при подключении Sidebar/TopBar/Accordion/NotificationCenter/Search. После полного локального прогона45 scripts и success4 runtime CI groups опубликована версия51. На production повторены все160 inspector cases восьми приложений и95 raster glyph checks; JavaScript errors0. Все532 опубликованных артефакта совпали со сборкой. Текущий визуальный проход охватил8 локальных M100 экранов в Light/Dark и выбранные extreme cases; на публикации дополнительно просмотрены Sandbox, Spline, Webflow и Files/Chat в обеих темах. [Proof и границы](2026-10-25-search.md). Search использует собственную semantic icon role вместо ошибочного сравнения с основным текстом поля. Все состояния/variants всей библиотеки и fresh Figma/AT/OS review по-прежнему не объявлены завершёнными.
