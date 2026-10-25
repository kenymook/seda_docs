# ChatBubble: общий компонент сообщений — 25.10.2026

Chat перестаёт владеть отдельной HTML-реализацией каждого сообщения: установленный @seda-ai/ui теперь экспортирует experimental ChatBubble. Это шаг к сборке приложений уровня ChatGPT/Notion; готовность всей дизайн-системы не заявляется.

## Изменения

Explicit incoming/outgoing/AI/system author, bubble/neutral/plain views, grouping без потери имени и AI label. Общие Provider/Text/radius/X/Y; foundation geometry fallback явно описан в [runtime API](../specs/data-display/chat-bubble.md#react-runtime). Text/rich/code/file/image/audio — discriminated content models. Native image с reserved frame и настоящим retry, native audio controls/transcript policy, code copy и file actions через SEDA Button/Link. Empty content, ошибочная identity/state model и recovery без действия отклоняются.

Body остаётся aria-live=off, streaming требует явной policy и readable status. Persistent status вынесен из busy body; chunks не объявляются как новые статусы. Отправка, storage, scroll, stop/retry/late-result guard остались у ChatRunner/владельца. Локальный fixture не объявлен реальным AI. Исторический AI source видим и сохраняется при copy. Настоящие текстовые вложения открывают escaped preview с возвратом фокуса.

Rich message table и historical file card используют public Table/Card. Удалены локальные table paddings и стили, перезаписывавшие анатомию этих компонентов. Known-empty slot detection переиспользуется Card и ChatBubble.

Общий application-text verifier выявил реальный дефект миграции: render ячеек Table потерял SEDA Text wrapper. Восстановлен body/default внутри cells; assertion на semantic role/scale сохранён. Первая остановка полного прогона не объявляется успехом и не скрывается заменой selector/baseline. После исправления сборка и проверки повторяются.

Token diff — только два AI alias leaves. Purple-on-purple foreground заменён существующим text.on-brand.primary, icon — icon.on-brand.primary; namespace/importer не менялись. Theme build проверяет обязательные message roles и отказывает при удалённом AI foreground.

Дополнительная сверка с Git blobs выявила44 старых CRLF runtime files: локальная и Site сборки совпадали между собой, но raw hashes этих файлов отличались от canonical commit. Исправлены только переводы строк; scoped .gitattributes закрепляет LF для contracts/UI source/pilot HTML, исходные byte-verified SVG остаются -text. До публикации сборки и проверки повторяются на canonical bytes. Архив, подготовленный до этой сверки, не публикуется.

## Проверка

Первый targeted consumer остановился из-за унаследованного tsconfig source alias и второй копии React. Исправлен harness: tsconfig aliases выключены, metafile требует installed @seda-ai/ui/dist и запрещает seda-ui/src. Source aliases не использовались как способ добиться прохождения теста.

Targeted installed consumer:48 selected theme/size/scale/view combinations,19 invalid-model guards, SSR/Strict hydration, native image error/retry,0px reserved-frame delta, native2-second WAV play/pause/seek и keyboard copy/file/recovery. Persistent status node не меняет содержимое на3 text chunks. Это тестовая тишина, не voice provider/ASR.

Существующий Chat verifier:4 model и12 browser checks прошли, включая duplicate/late/thread isolation, stop/retry, drafts/reload, quota recovery и180-message anchor retention. Новый workspace verifier:24 combinations (1440/1024/960 × Light/Dark ×4 profiles), public Table/Card, source-preserving copy, реальное текстовое вложение/escaping/return focus; errors0. Неверный selector ожидания двух одинаковых filename labels в harness уточнён до owner-rendered paragraph.

Просмотрены package gallery и настоящий Chat в обеих темах: одинаковый ритм identity/content/status/actions, readable AI ink, neutral outgoing и plain rich reply. Старые screenshot baselines не переписывались. Полные package/contract/pilot проверки и публикация фиксируются ниже после завершения.

## Открытые ограничения

Geometry experimental, registry остаётся11 control contracts. Code/rich и sending/edited/streaming — code-level модели. Свежая Figma library acceptance не получена:7063:1570 ограничен Starter quota, reference contexts1:3917/1:3921 не доказывают все варианты. OS-native audio не является Figma player. Target screen-reader/Firefox/WebKit/native shell, rich accessibility, i18n/performance и полный icon catalog остаются открыты.

Chat shell сохраняет существующий minimum viewport960px. Новый тест сначала выявил ожидаемый root overflow160px при800px: это не скрыто увеличением допуска и не названо адаптивной поддержкой800px. Narrow-shell layout остаётся отдельной задачей; проверяемая матрица покрывает поддерживаемые окна от960px. Backend/AI/collaboration не подключались.
