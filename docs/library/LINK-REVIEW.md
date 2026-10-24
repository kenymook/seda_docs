# Link — исправление существующих visual variants

Chat выявил, что `data-variant` выводился в DOM, но CSS не применял variant. Теперь default/subtle/inverse используют существующие component branches из `tokens.json`; danger — ранее документированный semantic fallback `status/danger/text` (отдельной component family нет). Hover/pressed/visited/disabled/focus и strong реализованы в общей библиотеке; private overrides в Chat не добавляются.

`verify-link.mjs` проверяет установленный пакет на React18/19: Light/Dark, четыре variants, token paints default/hover/pressed, visited token, disabled программную блокировку и keyboard focus. Это regression существующего visual API, **не новый executable contract и не полная сертификация Link**. Typography/textStyle, настоящий browser visited privacy, screen-reader announcement external links и полный native desktop runtime остаются отдельными задачами. Новые component tokens не вводились.
