# Общая визуальная система: feedback и состояния

Продолжение активной цели зрелой SEDA для веб- и десктоп-приложений. Этот этап не является приёмкой всей библиотеки или всех Figma-экранов.

## Изменения

- Badge, Tag, Alert и Toast используют общие preset font/line/icon/gap/padding. Lab scale и дополнительные X/Y доходят до них; многострочные сообщения сохраняют естественную высоту, pill/dot — семантическую форму.
- Добавлены шесть точных оригинальных SVG SEDA: success, error, ai, upload, warning, user. Всего 17 иконок. Каталог и генератор проверяют происхождение и байты; package export `@seda-ai/ui/icons.json` доступен установленному потребителю. Переводы строк SVG закреплены для воспроизводимости Windows/CI.
- Исправлены canonical component aliases feedback и общий brand default/hover/pressed. Lab composition использует semantic surfaces; генератор больше не теряет вложенные token leaves, когда родитель тоже содержит значение.
- Selectable Tag использует native main button и соседнюю dismiss button. Счётчик — реальный Badge, без двойных X/Y. Неназначенные действия disabled; числовой 0 отображается.
- В лаборатории добавлена вкладка «Состояния»: настоящий локальный фильтр, счётчик, сообщения, dismiss/restore и возврат фокуса. Статусы проектов используют SEDA Tag. Header actions остаются видимыми, навигация прокручивается отдельно.

## Результаты проверок

- TypeScript: библиотека, pilot и references — PASS. Контракты: 120/120 PASS; новые feedback instance contracts этим этапом не объявлены.
- Финальный установленный package: 29 групп PASS, 0 FAIL, React 18.3.1 и 19.2.7; `.diagnostics-package/2026-10-24T14-34-31-352Z/results.json`. Детерминированная сборка: 140 одинаковых артефактов.
- На каждую React-версию: 192 сочетания theme/size/tone/Tag type и 8 параметрических образцов, native keyboard/select/dismiss/disabled, отсутствие вложенных кнопок/пустых слотов, длинный контент и forced colors. Минимальный измеренный контраст активного feedback-текста 5.1195:1; brand white default/hover/pressed 5.9049/8.5921/12.4653:1.
- Финальная последовательность pilot завершена: feedback 6 групп с 24 theme/size/scale сочетаниями, visual consistency 24 образца, Lab 55 групп (288 loading-сценариев, дельта 0 px), workspace 21, controls 12. Все восемь reference-приложений и их domain/preview/renderer проверки PASS; результаты в отдельных `.diagnostics-*`.
- Осмотрен финальный Dark 1280 capture. Автоматика также сняла Light/Dark 1280/1920. Это проверки конкретных свойств, а не 192 независимых экспертных визуальных оценок.

Проверки обнаружили и привели к исправлению: контраста вложенного Badge 4.35:1, обрезанного Export в header, пропущенного вложенного token leaf. Измерение hover/pressed ожидает окончания реальной CSS-анимации; пороги не ослаблены.

## Оставшиеся ограничения

Toast — presentation-компонент: duration metadata, без timer/queue/pause/dedupe. Пример явно persistent и управляется приложением. Badge/Tag/Alert/Toast/FileUpload пока библиотечные адаптеры, не executable instance contracts. Нужны Toast host, полная AT/OS/browser матрица, внешняя визуальная приёмка, проверка плотности сложных панелей и дальнейшее покрытие оригинальными иконками. Сходство с девятью исходными Figma-экранами и готовность уровня Figma/Notion этим этапом не доказаны.

Подробности миграции: [FEEDBACK-VISUAL-HANDOFF](../docs/library/FEEDBACK-VISUAL-HANDOFF.md). 
## Публикация и production proof

- Прежний URL https://seda-ai-pilot.kenymook.chatgpt.site/, version32. Native deployment `appgdep_6adcc4d208b08191aec6f66dc3b4d737` succeeded. Политика custom/revision1: один владелец, без visitors/groups.
- GitHub functional source `0a66eab8f0a513e84abab5b80ce92eed002d3cb4`; Site source `87b7090df1d752a4f3d3a11d0f25c8231ba353eb`. Archive SHA256 `9383e5fb150b98c3d69833c41593ddffec1108c5e4a647c3a37b4540f891dd09`, 7,546,027 bytes.
- Production Chromium: 7/7 групп PASS, включая точное совпадение всех 749 source hashes, реальные filter/count/dismiss/focus действия, 24 theme/size/scale сочетания, пять severity, контраст активного текста ≥4.5 и отсутствие overflow при 1280/1920 Light/Dark; 0 JavaScript errors. Raw results и source/ACL proof сохранены в `verification/feedback-v32-release.json`, два production captures рядом.
- Первая отправка в Site source остановилась из-за истёкшего короткоживущего Git credential. После обновления ключа отправлен тот же сохранённый source commit; повторная сборка/новый Site не создавались.

