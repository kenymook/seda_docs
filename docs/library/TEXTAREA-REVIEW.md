# TextArea — общий компонент для рабочих приложений

[D30](../../packages/seda-contracts/TEXTAREA-CONTRACT.md) и [spec](../../specs/inputs/text-area.md) описывают API, rows/layout и ownership. В публичный пакет добавлен18-й компонент; общий compiler содержит11 контрактов. Цвета идут из существующей text-area ветки, размеры — из общего профиля. Новых token values нет. Build проверяет обязательные token leaves и сохраняет hash декларации контракта в profiles provenance.

## Фактические проверки

-115/115 Node contract tests: API, негативные cases, source defaults, состояния, tokens и compiler/web bridge;4 новых tests относятся к TextArea. Это не browser или AT checks.
-[Package proof](../../packages/seda-ui/verification/textarea-package.json):21/21 groups, tarball установлен отдельно на React18.3.1 и19.2.7. Каждый TextArea consumer использует installed dist без source alias, SSR +Strict hydration, NodeNext declarations, negative inputs и настоящие native events.
-[React18](../../packages/seda-ui/verification/textarea-18.3.1.json) и [React19](../../packages/seda-ui/verification/textarea-19.2.7.json): по64 вложенных geometry samples (2 themes ×4 sizes ×2 rows ×2 growth modes ×2 X/Y combinations), всего128; это не128 независимых workflows. Проверены controlled rejection/clear, autoResize cap, manual height through typing/rerender, form reset, Enter без submit, composition event forwarding, helper/error IDs, disabled+readOnly precedence, active canonical border, hidden label, UTF-16 counter, RTL и отсутствие JS/hydration errors.

Просмотрен [actual React19 Dark](../../packages/seda-ui/verification/textarea-19.2.7-dark.png). Первая визуальная проверка выявила обратный порядок `2 /1000` в RTL — counter теперь имеет изолированное LTR направление. Ручной resize раньше сбрасывался при каждом rerender; теперь inline height снимается только при переходе из auto-owned режима. Структурная проверка CSS выявила конфликт disabled+readOnly specificity; добавлены browser assertions на реальный canonical disabled background и active paint. Исправления не скрывались baseline update.

## Реальная композиция

Building импортирует TextArea из установленного public package и использует его для комментария rows2/maxRows6. [Проверка приложения](../../portal/component-lab/pilots/settings-parametric/verification/textarea-building.json):5 model +16 browser groups PASS; multiline comment проходит save/reload, draft переживает close/reopen dialog. При XL/X14/Y6 minHeight88px =control60 +line28. [Actual dialog Dark](../../portal/component-lab/pilots/settings-parametric/verification/textarea-building-dark.png) просмотрен. Это общая реализация, а не локальный textarea с похожими стилями.

## Ограничения

Status experimental: отдельная визуальная приёмка Figma node2187:3331 и всех40 variants не выполнена; настоящий OS IME и screen reader требуют ручных проверок. Composition forwarding не объявляется полной проверкой IME. Другие browser engines/native desktop shell и performance на больших текстах не подтверждены. Внутренняя clear label сейчас русская, общего i18n API ещё нет. Counter использует native UTF-16 units, не grapheme count. Rich text отсутствует. Clear notification — отдельный onClear, synthetic ChangeEvent не выдумывается. Composer/streaming/thread UI и следующий reference1:3894 ещё не реализованы.

Последний API guard исключает children/dangerouslySetInnerHTML из types и отклоняет их runtime, чтобы они не задавали третий источник текста мимо value/defaultValue/counter. После этого guard повторены4 TextArea contract tests и полный installed-package verifier21/21 (включая NodeNext negative JSX и9 SSR invalid cases на каждой React версии). Полный115-test suite пройден перед этим guard; новый полный CI ещё ожидается.
