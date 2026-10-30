# Feedback и общая палитра — handoff

2026-10-24. Изменение кода и tokens.json; Figma автоматически не изменялась. Визуальная/AT-приёмка всей библиотеки остаётся открытой.

## Общие semantic роли

В обеих темах изменены только fill-роли `container/brand`:

| Роль | Было | Стало |
| --- | --- | --- |
| `default` | `{color.blue.50}` | `{color.blue.60}` |
| `hover` | `{color.blue.60}` | `{color.blue.70}` |
| `pressed` | `{color.blue.70}` | `{color.blue.80}` |

Белый мелкий текст на прежнем default давал около 4,12:1. Новый default с белым текстом даёт около 5,90:1; hover/pressed остаются различимыми. Border, selected и palette primitives не переназначены. Это общий semantic fix: Button, checked controls и brand labels получают одинаковый fill, без локального использования hover-цвета как default.

В публичном CSS теперь экспортируются все semantic color роли с provenance, чтобы композиции пользовались той же палитрой. Lab получает theme через SedaProvider; панели/фон/notes/status summaries используют semantic роли, а не отдельные navy/blue значения. Внутренние цвета компонентов не переопределяются селекторами композиции.

## Component aliases

- `alert/surface/{info,success,warning,danger,ai}` → `status/{intent}/container`; `alert/title/foreground/{intent}` → `text/{intent}`. Добавлены недостающие AI surface/border/icon/title/description роли с существующими semantic aliases.
- `tag/surface/{info,success,warning,danger,ai}` → `status/{intent}/container`. Tag и Badge foreground для этих тонов → `text/{intent}`.
- `badge/surface/neutral` → `surface/subtle`: непрозрачная нейтральная основа нужна для безопасного вложенного счётчика на цветном Tag.
- `toast/surface/{info,success,warning,danger}` → `status/{intent}/container`; добавлены `toast/foreground/{intent}` → `text/{intent}` и `{intent}-secondary` → `text/secondary`. Icon-роли → `status/{intent}/icon`. Status actions/close используют соответствующие foreground/icon роли, neutral Toast сохраняет inverse-роли.
- Legacy `toast/foreground/onStatus` не удалён, но не применяется ко всем разным status backgrounds как единый белый цвет.

В Figma необходимо переназначить эти связи и проверить все intents в Light/Dark. Новые semantic роли не добавлялись. Полный актуальный список component aliases находится в tokens.json; API-примеры не являются источником палитры.

## Иконки

В общий каталог добавлены точные SVG-экспорты SEDA:

| Имя Icon | Figma node | Исходное имя |
| --- | --- | --- |
| `success` | `789:208` | Icon/Line/circleSuccess |
| `error` | `789:195` | Icon/Line/circleError |
| `ai` | `789:168` | Icon/Line/bubbleAi |
| `upload` | `1575:8769` | Icon/Line/upload |
| `warning` | `2228:8785` в Alert `2228:8783` | converted (9) 1 |
| `user` | `789:230` | Icon/Line/user |

SVG geometry не перерисовывалась. Каталог: `assets/icons/seda/icons.json`; source hashes проверяются при генерации. Публичный export `@seda-ai/ui/icons.json` содержит 17 имён и provenance. Обновление: `node packages/seda-ui/scripts/icon-assets.mjs`, затем build. Stale generated module отклоняется.

## Геометрия и interaction

- Font/line/icon/border/gap поступают из общего preset, scale и X/Y — из Lab binding. Alert/Toast имеют естественную многострочную высоту; отсутствующие icon/close не оставляют пустых grid tracks.
- Tag/Badge сохраняют semantic pill/dot shape; radius multiplier не превращает status dot в прямоугольник. Компактный Badge следует line/icon, не высоте полноразмерного Button.
- Вложенный счётчик Tag — настоящий Badge с внутренним документированным view `tag-counter`. Его высота ограничена строкой Tag, без повторного применения X/Y. Произвольных вложенных color/radius override в API нет.
- Selectable Tag содержит отдельную native main button и соседнюю dismiss button. Space/Enter переключают ровно один раз, dismiss не переключает selection. Это изменение DOM: `aria-pressed` находится на native main button; внешний ref остаётся ref обёртки для layout. Фокусируйте/select по native button role.
- Неназначенные action/dismiss callbacks дают disabled native buttons. Числовой контент 0 не исчезает из label/description/counter. Badge count/max требуют safe integers, max >0; count ≤0 скрывает count badge.

## Открытые границы

Эти четыре компонента ещё не имеют executable instance contracts. Сам Toast остаётся presentation-компонентом: duration — metadata. Исполняемый lifecycle реализован отдельно через ToastProvider/ToastViewport/useToast: FIFO, dedupe, таймер активного показа, pause и focus return. Контракт API и границы: [Toast spec](../../specs/feedback/toast.md#react-host-исполняемые-правила). Полная AT/OS-приёмка host остаётся открытой.

Нужны внешняя визуальная оценка, полная AT/OS/browser матрица, приёмка Toast host на целевых платформах, контракты feedback и дальнейшая проверка плотности сложных панелей. Figma parity всех исходных экранов этим этапом не доказана.
