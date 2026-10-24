# FileUpload — геометрия и цвета состояний

Изменение от 2026-10-24 относится к существующему File Upload. Новые варианты не добавлены. Figma автоматически не изменялась; дизайнерская приёмка остаётся открытой.

## Связи цветов для Figma и React

Коллекция `components`, mode `Mode 1`, ветка `file-upload`. Имена существующих ролей сохранены.

| Component role | Новый semantic alias | Причина |
| --- | --- | --- |
| `surface/error` | `{status.danger.container}` | Прежний `{color.red.15}` одинаково светлый в Light/Dark и давал белый текст на светлом фоне. |
| `foreground/error` | `{text.danger}` | Прежний `{status.danger.text}` в Light давал 4,28:1 на новом error container; текстовая danger-роль обеспечивает читаемость. |
| `surface/drag` | `{status.info.container}` | Прежний яркий фон давал 4,12:1 с белым мелким текстом в Light. |
| `foreground/drag` | `{status.info.text}` | Парная роль для info container в обеих темах. |
| `icon/drag` | `{status.info.icon}` | Парная роль для info container в обеих темах. |
| `surface/success` — новая component роль | `{status.success.container}` | Насыщенный `status/success` не должен использоваться как фон нескольких текстовых строк. |

Существующие `status/success` и `status/error` не переименованы и не удалены: это акцентные status surface-роли, не container. Остальные компоненты и semantic aliases не изменены. В Figma нужно переназначить перечисленные связи, создать только `file-upload/surface/success` и проверить отсутствие прежнего красного foundation binding у error surface.

## Геометрия

Размеры берутся из общего compiler system preset. Явный size приоритетнее Provider, standalone — M. Нет отдельной таблицы 10/14/18/22 px padding или 13/14/16/18 px шрифтов.

- Dropzone: базовый field padding; button: базовый button padding; inline: нулевой базовый горизонтальный padding.
- Общие параметры Lab прибавляют X к соответствующей базе, Y — к базовому вертикальному padding. Font/line/icon следуют одному масштабу, radius — общему множителю.
- Многострочный контент растёт естественно. Длинные имена переносятся; выравнивание с однострочными контролами не достигается обрезкой сообщений.
- Иконка по умолчанию — оригинальный SEDA `add`, в общем слоте. Custom SVG/IMG подчиняются размеру слота.

## Поведение и границы приёмки

Disabled блокирует native input и callbacks выбора/drop. Drag-over включается реальным перетаскиванием файлов. Невалидный progress становится indeterminate при uploading; reduced motion отключает движение. В high contrast сохраняются focus и icon mask.

`files` — отображаемая коллекция родителя. Сам компонент не отправляет файлы, не проверяет их содержимое/тип/размер и не очищает native FileList при смене props. За повторный выбор того же файла и явный reset отвечает владелец формы.

Автоматические проверки цвета не заменяют внешнюю оценку оптики, screen reader/OS file picker acceptance или Figma parity. FileUpload остаётся библиотечным адаптером общей геометрии; executable instance contract ещё не введён.
