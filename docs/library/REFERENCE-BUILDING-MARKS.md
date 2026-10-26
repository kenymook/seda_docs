# Building: ограниченное форматирование одного блока

Дата: 26 октября 2026. Route: `/references/building.html`. Source frame: [1:84 Building](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-84). Состояние с выделенным текстом в source screenshot отсутствует: геометрия нового toolbar проверяется как расширение SEDA, а не объявляется pixel-perfect копией эталона.

## Реализация

Публичный experimental `InlineToolbar` из установленного `@seda-ai/ui` задаёт поверхность и доступную навигацию по действиям. В Building при выделении текста в одном блоке доступны bold, italic и code; диапазоны представлены проверяемыми plain-text offsets, а отображение строится из безопасных DOM-узлов без HTML-строки. Ctrl/Cmd+B и Ctrl/Cmd+I используют ту же модель. Ввод и plain-text paste перестраивают диапазоны; split/join переносят marks; save/reload и undo/redo используют прежнюю модель документа. Переход в code block удаляет несовместимые inline marks. Повреждённые, выходящие за длину и ненормализованные диапазоны отклоняются при загрузке.

Toolbar следует общей теме/размеру/масштабу/X/Y. Во время выделения для него выделено место над блоком, чтобы не перекрывать заголовок и предыдущий текст. Его кнопки — SEDA Button с `aria-pressed` и текстовыми именами. Компонент описан в [спецификации](../../specs/overlays-layout/inline-toolbar.md).

## Доказательства

- TypeScript пакета и пилота, обе сборки PASS. Установленный tarball проверен в 77/77 группах на React 18.3.1 и 19.2.7, включая SSR, hydration, CSS, keyboard, LTR/RTL, disabled и Light/Dark × S–XL для InlineToolbar. [Результаты React 18](../../packages/seda-ui/verification/inline-toolbar-react18-results.json) и [React 19](../../packages/seda-ui/verification/inline-toolbar-react19-results.json).
- Новый `verify-building-marks.mjs`: 5/5 групп — чистая модель (overlap/toggle/remap/split/join/invalid) и браузерные действия (selection, toolbar, сохранение/reload, ввод и полное удаление marked text, клавиатура, Light/Dark XL, scale150, X24/Y12, отсутствие overflow и пересечения с заголовком), отсутствие JS errors.
- Существующий `verify-building.mjs` повторён после изменения редактора: 5 model + 18 browser groups, без регрессии. Новая проверка входит в общий `npm run verify` и CI раздел references.
- [Локальный Light XL](../../portal/component-lab/pilots/settings-parametric/verification/building-inline-light-xl-local.png) и [Dark XL](../../portal/component-lab/pilots/settings-parametric/verification/building-inline-dark-xl-local.png) просмотрены вручную. Первый Dark screenshot выявил перекрытие заголовка; отступ и проверка расположения добавлены до этих снимков.

CI и publication фиксируются после соответствующего прогона; локальный браузерный PASS не доказывает их автоматически.

## Ограничения

Это **не полный rich-text editor**. Поддержаны только три marks внутри одного блока. Межблочное выделение и форматирование, ссылки, списки с inline annotations, таблицы, drag/drop, совместное редактирование, backend и AI provider остаются открытыми. Нативный desktop shell, Firefox/WebKit и ручная AT-проверка ещё не пройдены. Figma frame показывает обычный документ, а не toolbar state; финальная визуальная приёмка всего экрана остаётся открытой. Отдельные component tokens InlineToolbar пока отсутствуют, что отмечено как Token gap в spec.
