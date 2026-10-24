# Согласованность текста и ритма рабочего интерфейса

Продолжение активной цели зрелой SEDA для веб/десктоп-приложений. Измерение конкретного слоя не заменяет визуальную приёмку всей библиотеки и девяти исходных Figma frames.

## Найденные причины и изменения

- В Lab оставались независимые hex-цвета текста: границы диапазонов 2.301:1, подписи/метаданные около 3.7–3.9:1, таблица 4.482:1, brand-показатели и зелёные PASS в Dark около 3.53:1. Повторения одного элемента на разных экранах не считаются отдельными дефектами.
- Подписи, метаданные, таблица, диапазоны, compare/graph/inspector и avatar initials переведены на существующие text/tertiary, text/brand, text/success и status/info роли. Общий p наследует роль контейнера; component-owned цвета feedback не переопределяются.
- У TextField/TextArea/Select placeholder использовал text/muted: примерно 2.523:1 Light и 3.824:1 Dark. Три canonical aliases теперь указывают на text/tertiary. Новых semantic ролей и raw colors не добавлено, JSON importer structure сохранена.
- Select связывает реальный выбранный placeholder option с цветом закрытого trigger через внутренний data-seda-placeholder. Нативный uncontrolled выбор сразу меняет цвет. Обычная meaningful option с value="" остаётся обычным пунктом. Disabled не получает active placeholder color.
- foreground/placeholder добавлен в required roles исполняемого Select: удаление leaf отклоняют validation и web bridge. Геометрия и public props не менялись.
- Панель очереди использует существующий compiled layout actionsGap между блоками; случайные вложенные p/h3 margins убраны только в этой композиции.

## Проверка

- 121/121 contract/foundation tests PASS, включая новый negative placeholder-role test.
- Package 33/33 групп PASS на React18.3.1/19.2.7: `.diagnostics-package/2026-10-24T15-25-10-601Z/results.json`. Установленный consumer, без repo source alias.
- На каждую React-версию: 16 theme/size/default-error сочетаний с тремя полями и дополнительно 32 hover/focus/read-only измерения. Focused results сохранены отдельно в field-interaction-results.json. Минимальный активный placeholder contrast 4.5069790244:1; threshold проверяется по неокруглённому значению. Native selection, meaningful empty и disabled semantics PASS.
- В Lab: 144 вложенных сочетания =6 экранов ×2 темы ×4 размера ×3 масштаба (80/100/150). Это повторяющиеся DOM-измерения, не 144 независимых пользовательских workflow. Ни одного failure в измеренном отображаемом active text/placeholder; минимум 4.5201250403:1. Disabled и закрытые details исключаются явно; неизвестные gradients/group opacity должны останавливать проверку, а не объявляться PASS.
- Общий ритм очереди проверен по реальным DOM gaps; Light/Dark captures просмотрены. Осмотрен также isolated Light capture полей.
- Три TypeScript проекта/build PASS. Вся pilot verify sequence завершена, включая visual24, feedback8, Lab55, workspace21, controls12, восемь reference-приложений и domain/preview/renderer проверки. Прежние 288 loading-сценариев Button сохраняют нулевые дельты.

## Точный handoff mappings

В `$collections/components/$modes/Mode 1/`:

- `text-field/foreground/placeholder`: `{text.muted}` → `{text.tertiary}`.
- `text-area/foreground/placeholder`: `{text.muted}` → `{text.tertiary}`.
- `select/foreground/placeholder`: `{text.muted}` → `{text.tertiary}`.

Семантическая роль уже существует в Light/Dark; значения глобального text/muted не менялись. Три соответствующие spec-строки приведены к canonical mapping. Figma bindings не редактировались: дизайнеру нужно переназначить только эти placeholder bindings и проверить очистку старых ссылок; disabled bindings сохранить. Нельзя объявлять Figma parity по code-only изменению.

## Оставшиеся границы

Это computed DOM text audit шести Lab-экранов; не pixel audit, не аудит всего текста reference artboards и не WCAG/AT сертификация. Не проверены этим аудитом все icon/border контрасты, native OS popups, authored canvas, raster, gradients и все состояния каждого компонента. Full AT/OS/browser-engine, визуальная плотность сложных экранов, полнота иконок и executable feedback contracts остаются открытыми. Reference-regression подтверждает поведение, а не их визуальное совпадение с Figma. Общая цель не завершена.

Публикация и production proof будут добавлены после deploy.
