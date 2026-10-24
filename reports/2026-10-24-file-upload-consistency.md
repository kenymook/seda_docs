# FileUpload — визуальная согласованность и состояния

Этап общей цели зрелой SEDA для сложных веб/десктоп-приложений. Общая цель не завершена; это исправление одного из оставшихся компонентов.

## Что исправлено

- Вместо независимой таблицы размеров FileUpload использует общий compiler preset: font/line/icon/radius/border/gap и базовые отступы. Label, action и helper масштабируются вместе. В Lab X прибавляется к field/button/zero inline базе, Y — к вертикальной базе; многострочный контент не обрезается до высоты Button.
- Оригинальная иконка SEDA add заменяет текстовый символ. SVG/IMG заполняют общий слот.
- Native disabled теперь совпадает с состоянием disabled. Заблокированы callbacks выбора/drop; пустой drop не очищает коллекцию. Реальный drag-over даёт обратную связь.
- Accessible name исключает action/helper/required marker; внешние description IDs объединяются с локальным сообщением. Пустой errorText не создаёт error. Uploading имеет busy и determinate/indeterminate progress с reduced motion.
- Dark error больше не использует светлый foundation red. Success container отделён от насыщенного status surface. Drag использует согласованные info container/text/icon. Error text использует text/danger.
- В сборке обязательны все FileUpload component tokens: удаление нового surface/success воспроизводимо отклоняется.
- В разделе Lab «Компоненты» все три варианта можно проверить рядом с остальными контролами. Workflow получает ту же геометрию через общий binding.

## Доказательства

- Build и 3 TypeScript projects: PASS.
- Contract/foundation: 120/120 PASS. Число executable contracts остаётся 11.
- Tarball consumer: 27/27 групп PASS, React 18.3.1/19.2.7. На каждую версию 168 вложенных цветовых/геометрических сочетаний +24 сочетания scale/X/Y, реальный keyboard file chooser, File/Drop, disabled guards, длинные имена, ARIA, reduced motion и forced-colors focus/icon.
- Минимальный измеренный контраст активного title/action/message: 4,617957:1. Alpha backgrounds/foregrounds композитятся по фактической цепочке DOM; disabled исключён. Порог проверяется по неокруглённому значению, не по подписи.
- Ранее измерено: Dark error title 1,32:1, Light drag 4,12:1; success action 1,35:1/2,82:1 Light/Dark. Эти значения привели к исправлению canonical component aliases, а не к ослаблению проверок.
- Lab visual matrix: 24/24 PASS, теперь с реальными FileUpload variant metrics. Lab regression: 55/55 PASS, включая 288 loading-сценариев Button с нулевыми дельтами.
- Workspace/controls и первые reference applications прошли; итог всей оставшейся sequence и production proof записываются после окончания соответствующих процессов. Первый прогон остановился на устаревшем ожидаемом списке adapters; в ожидание добавлен FileUpload, после чего workspace 21/21 PASS. Контрактом FileUpload не объявлен.
- Осмотрен актуальный Dark 150% full-page capture. Figma и screen reader acceptance этим не доказаны.

## Границы

FileUpload не отправляет файлы и не валидирует их содержимое. `files` — отображаемая коллекция, не controlled native FileList; transport, отмена и native reset принадлежат приложению. Реальный OS picker и AT на целевых платформах требуют отдельной приёмки. [Figma handoff и точные aliases](../docs/library/FILEUPLOAD-VISUAL-HANDOFF.md).

Плотность панелей, legacy palette композиций Lab, полнота иконок, Badge/Tag/Alert/Toast и остальные сложные primitives остаются открытой работой. Успешный consumer test не является сертификатом визуальной зрелости всей библиотеки.
