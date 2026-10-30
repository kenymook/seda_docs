# D35: текстовые действия и многострочное поле — приватная v62

Цель прохода — убрать расхождение между обычной кнопкой, компактным текстовым действием и анатомией TextArea в плотных интерфейсах веб- и десктоп-приложений. `Button variant="text"` остаётся реальным публичным SEDA Button, а его геометрия теперь вычисляется из исходных ролей текстового действия: высота S/M/L/XL 16/20/24/28 px, Regular 400, иконка по высоте строки, межэлементные интервалы 2/4/6/8 px и отсутствие layout border/padding. Другие варианты Button и квадратный IconButton сохранили свою геометрию. Непрозрачные состояния текстового действия используют те же существующие surface/border роли через явный адаптер, без новой числовой таблицы размеров.

TextArea использует общее поле D34: подпись, helper и счётчик наследуют эффективный размер текста; очищение выводится как отдельный `Button variant="text"` рядом с подписью. Действие видно с локализуемой меткой `clearLabel`, но недоступно при пустом, read-only или disabled поле. Остаются нативные textarea, focus/caret, controlled value, reset, IME, ручной resize и autoResize/maxRows. В реальной панели «Настройки» добавлено управляемое многострочное описание; сохранение и отмена охватывают его вместе с существующими полями. Решение и границы источника: [D35](../packages/seda-contracts/INLINE-ACTION-CONTRACT.md).

## Основание и проверки

Наблюдения текущей Figma-библиотеки записаны в [source](../portal/component-lab/pilots/settings-parametric/verification/inline-action-textarea/source): Button text S/M/L/XL, M label, TextArea M root/label/helper/header/body и XL helper/root. AX-свойства и снимки образуют пары. Для Button text M подтверждены line box 20, gap 4, Regular 400 и inner stroke 0,5; для TextArea M header — horizontal layout и gap 4. Старый отсутствующий Button-instance в TextArea не копировался как реализация. Это выборочная проверка исходных слоёв, не дизайнерская приёмка всех состояний.

| Область | Результат и граница |
| --- | --- |
| Контракты | 145/145 Node tests. D35 добавил проверки ролей, provenance и отрицательные случаи; всего по-прежнему 13 исполняемых instance contracts и 8 базовых профилей. Полный прогон предшествовал финальной правке только source/decision metadata; повторный аудит сверил 239 runtime JS/CSS/types файлов байт в байт с проверенным установленным пакетом, 8 профилей и 464 цветовых/provenance binding. |
| Установленный пакет | 75/75 групп на React 18.3.1 и 19.2.7 после pack/install, без source aliases. Новая матрица на каждую версию React: 48 конфигураций и 48 loading transitions в обеих темах и S–XL; отдельно 64 TextArea measurements. Проверены публичные и compiler-bound рецепты, пустые/false/Fragment slots, геометрия, цветовые состояния, focus, clear, controlled value, авторазмер и ограничение строк. |
| TypeScript и сборка | UI package, приложение и references — PASS; каноническая финальная сборка — PASS. |
| Приложения локально | Все 52 сценария: 24 Lab и 28 references. Первые 21 Lab прошли; прежний workspace oracle ошибочно применял высоту обычной кнопки к текстовому действию и был уточнён по независимым source-правилам. Повторный workspace — 21/21 групп, затем filters 240 случаев и controls 12/12 групп. Проверены форма, save/cancel, навигация, фильтры, состояния и ошибки страницы. Snapshot baseline не обновлялся. |
| Локальная браузерная матрица | 64 конфигурации / 512 field records на Projects, Settings, Members, Components; 240 filter cases; 160 inspector samples на 8 routes; 95 glyph-paint samples; ошибок страницы нет. Измерены light/dark, S–XL и два набора общих параметров. |
| Опубликованная v62 | Та же матрица на приватном адресе; build metadata и 532 artifact hashes совпали с канонической финальной сборкой. Raw results и выбранные кадры в [verification/inline-action-textarea](../portal/component-lab/pilots/settings-parametric/verification/inline-action-textarea). |

Визуально просмотрены установленные light/dark образцы текстового действия и TextArea, а также Settings light100/dark150 и Building light/dark1440. Автоматические числа являются выборками сценариев, а не числом компонентов или доказательством полной готовности библиотеки.

## Поставка и происхождение

- Runtime commit: `f8d760dd25f6abff293d342d4c2218b3456d4fb3`; [PR №4](https://github.com/kenymook/seda_docs/pull/4) остаётся открытым, merge не выполнялся.
- Site source commit: `c377bbeeee98f2a42ded734c491b31e02f88a456`. Сверены 931 source hashes, 690 canonical Git blobs и 241 installed artifact. Исходный `tokens.json` не менялся.
- Архив: 8 295 845 bytes, SHA-256 `d389f6b6ec3636d331f6f100d875e33251c2909a23206b77c433f6c3b61581d0`; 534 файла, из них 532 artifact hashes сверены до публикации и после неё.
- Приватная версия **62**: [прежний сайт](https://seda-ai-pilot.kenymook.chatgpt.site/). Deployment `appgdep_6adf01aa82f88191916510bb5fbceebc` — succeeded. ACL revision 1: один owner, 0 groups, 0 external visitors; доступ не менялся.
- Доказательства и их SHA-256 перечислены в `verification/inline-action-textarea/evidence-hashes.json`. Токены доступа в отчёт и proof не сохраняются.

## Открытые ограничения

Внутренние padding тела TextArea в Figma (для выбранного M слоя 6 px снизу и 12 px слева/справа) пока не согласованы со всей размерной матрицей реализации. Запрошена дальнейшая исходная проверка regular Button/IconButton, радиусов, иконок и всех состояний. Полная визуальная приёмка девяти Figma frames, Firefox/WebKit, OS/AT/touch и native desktop shell ещё отсутствует. Приложение «Настройки» демонстрирует управляемое состояние в браузере, а не внешний сервер сохранения. Остальные поверхности и многие модули React-пакета пока экспериментальны; цель системы уровня Figma, Notion, ChatGPT и Cloude Design этим выпуском не считается достигнутой.
