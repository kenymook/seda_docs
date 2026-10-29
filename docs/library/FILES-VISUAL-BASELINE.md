# Files — VIS-00 baseline

30 октября 2026. Статус: baseline зафиксирован, визуальная приёмка открыта. Это вход в `0.3`, а не завершение версии.

## Сравнение и воспроизведение

[Интерактивный review](visual-baselines/files-2026-10-30/review.html) содержит Overlay, Split, Actual, Reference, матрицу 12 случаев и сравнение измерений. Для работы открыть через локальный HTTP server; исходные PNG сохраняют свои размеры, масштаб viewer меняет только отображение. [Capture receipt](visual-baselines/files-2026-10-30/capture.json), [source context](visual-baselines/files-2026-10-30/reference-source.json), [реестр вопросов](visual-baselines/files-2026-10-30/defects.json), [проверка viewer](visual-baselines/files-2026-10-30/review-verification.json).

Reference — [Ruslan, Recents / Figma, 1:691](https://www.figma.com/design/31SUMzWpWJ52bT9fBeKIau/Ruslan?node-id=1-691), frame clip 1440×1288, Dark. Версия Figma не предоставлена read-инструментом; `versionId=null`, вместо выдуманного номера якорь — SHA256 полученного PNG `d26a48f0c2e77c759c6c451e2df96f422eb65c58e938bfe615c7b67589903725`. Снимок и извлечённые anatomy/style facts предназначены для QA, не заменяют React-компоненты растровым экраном.

Actual — commit `3ee0c7c7b0c911db095cff049f35a36152d1d23a`, установленный public package `0.1.0`, source audit valid, Windows Chrome 156.0.8078.49, DPR 1, zoom 100%, en-US, Europe/Moscow, reduced motion. Все случаи используют 25 исходных файлов и canonical tokens с изолированным GET-only empty-edits fixture. Production owner document не читался и не изменялся. Поэтому эти снимки не доказывают вид конкретной пользовательской конфигурации.

Матрица: Light/Dark × S/M/L/XL при 1440×1288, text100/X0/Y0; обе темы при 1440×900, XL/text150/X24/Y12; Dark M при 1280×900 и 1920×1080. Light — расширение SEDA без отдельного Figma reference. Другие размеры/темы не считаются прямым pixel-match к Dark M.

Для нового capture сначала собрать актуальный pilot, затем из корня репозитория:

```powershell
$env:SEDA_BROWSER_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:SEDA_VISUAL_OUTPUT='<новая абсолютная папка>'
node scripts/visual/capture-files-baseline.mjs
```

Collector отказывается перезаписывать существующий `capture.json`. Reference/context и defect ledger переносятся в новую папку с явной provenance, затем `build-files-review.mjs` строит viewer, `verify-files-review.mjs` проверяет его. Нельзя заменять старые PNG новым результатом под видом прежней baseline.

## Что установлено

| Dark M, px | Reference | Actual |
| --- | ---: | ---: |
| Sidebar width | 241 | 241 |
| Header height | 48.67 | 48 |
| First card X / Y | 275 / 161.67 | 265 / 160 |
| First card width / height | 355.67 / 259 | 367.66 / 271.69 |
| Card radius | 13 | 8 |
| Card title font | 11 | 14 |
| Tabs height | 24 | 32 |
| Filters X | 558.23 | 812.83 |

72 уникальных используемых local assets проверены по существующему manifest: файл непустой, hash совпал. У Dark M 45 видимых image/glyph slots; видимые images загружены. Lazy images за viewport не выдаются за загруженные. API PUT=0, JS errors=0, внешнего overflow в записанных случаях нет. Это проверки целостности и геометрии, не оценка визуального качества.

Визуально рассмотрены reference, Dark/Light M, Dark S/XL и оба stress-снимка. Остальные случаи записаны и доступны в viewer, но общей приёмки всей матрицы это не даёт. Viewer проверен в браузере: 13 PNG, переключение 12 случаев, overlay opacity, split clipping, масштаб 1:1, исходные размеры wide-case и ссылки на evidence.

## Приоритеты

1. `FILES-VIS-01`: при XL/150/X24/Y12 header занимает **266 из 900 px**, banner ещё 102 px, первая карточка начинается на y588. Нулевой overflow скрывает потерю рабочей области. Следующая реализация — общий command overflow recipe с доступными вторичными командами, сохранением focus/draft и одного ряда header controls. Нельзя решать это отключением text scaling или сокрытием команд.
2. `FILES-VIS-02/03/04`: согласовать роли поверхностей, плотность и spacing/card recipe. Требование владельца 14px для оболочки сохраняется; исходные 11px не переносятся глобально ради похожего скриншота. Перенос длинных Sidebar labels предусмотрен spec — сначала решение о compact profile, затем изменение общего API при необходимости.
3. `FILES-VIS-05/06`: определить связи content glyph / typography / identity avatar и проверить применимость public Card/Avatar к интерактивной Files-композиции. Текущие local article/img не являются доказательством использования этих public компонентов. Нельзя слепо превращать вложенные действия в кнопку внутри кнопки.
4. `FILES-VIS-07`: явно зафиксировать дополнительные Notifications/footer и их смысл относительно reference.

Все семь записей открыты; ни одна не помечена автоматически как ошибка compiler или требующая нового токена. Статусы `visualReview` каталога не повышены.

## Ограничения

Нет independent visual acceptance, owner proof без подсказок, полного покрытия состояний, Firefox/WebKit, desktop host, OS/AT и performance acceptance. Не приняты остальные восемь frames/context. Прошлые functional/geometry PASS остаются историческими фактами со своей областью, но не закрывают нынешние visual вопросы. Этот slice меняет QA-артефакты, а не runtime портала; повторный deploy сайта не требуется.
