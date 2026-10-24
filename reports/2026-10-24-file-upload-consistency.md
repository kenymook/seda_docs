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
- Все шаги pilot verification завершились успешно, включая все восемь reference routes, domain models и isolated renderers/previews. Первый прогон остановился на устаревшем ожидаемом списке adapters; в ожидание добавлен FileUpload, затем повторно запущены workspace и вся оставшаяся последовательность. Workspace 21/21 PASS. Уже прошедшие visual/Lab проверки без изменения runtime повторно не запускались. Контрактом FileUpload не объявлен.
- Осмотрен актуальный Dark 150% full-page capture. Figma и screen reader acceptance этим не доказаны.

## Границы

FileUpload не отправляет файлы и не валидирует их содержимое. `files` — отображаемая коллекция, не controlled native FileList; transport, отмена и native reset принадлежат приложению. Реальный OS picker и AT на целевых платформах требуют отдельной приёмки. [Figma handoff и точные aliases](../docs/library/FILEUPLOAD-VISUAL-HANDOFF.md).

Плотность панелей, legacy palette композиций Lab, полнота иконок, Badge/Tag/Alert/Toast и остальные сложные primitives остаются открытой работой. Успешный consumer test не является сертификатом визуальной зрелости всей библиотеки.

## Публикация и production proof

- https://seda-ai-pilot.kenymook.chatgpt.site/ — прежний адрес, версия 31. Политика custom/revision 1: только один владелец, без visitors/groups.
- GitHub implementation: `ccc2b1c9dd2e84e6dd3af72dccdf47a82f3cec41`; Site source: `35bddb422ecc99a62fbf9ed6fa3b607ea64f023c`.
- Deployment `appgdep_6adcaeda60d4819187608d92f253452c` succeeded. Archive SHA-256: `7e777c8b1b0ec93cdffbeabf175eaa7f4a9be842693198de7e054c8cb84825cf`.
- В авторизованном Chromium прошли все 24 сочетания scale/theme/size с проверкой новых FileUpload variant metrics и контраста активного текста на фактической цепочке фонов Lab. Реальный локальный файл появился в UI; disabled и indeterminate progress проверены отдельно. JavaScript errors: 0.
- Все 730 source hashes совпали с canonical Git-байтами. CRLF двух исходных файлов нормализованы до Git LF до публикационной сверки; функциональные изменения при этом не вносились.
- Минимум 4,617957:1 выше относится к полной isolated consumer matrix. Production проверяет порог ≥4,5 без заявления тождественности минимумов разных композиций.
