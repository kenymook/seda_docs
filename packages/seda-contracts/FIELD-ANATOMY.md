# D34 — анатомия TextField, Select и NumberField

Статус: experimental; исправление исполнения существующих полей, без новых props, токенов и instance contracts. NumberField сохраняет настоящий TextField как visual alias. D34 уточняет историческое D10: Semibold label, фиксированное сообщение bodySmall и два интервала 6 px были решениями первого пилота, а не измерением текущего Figma.

## Проверенный источник

Read-only UI review исходного файла SEDA AI v0.2.0 `Su1jWqKc9TkD1R8f7wHOQU`, Input set `914:9795`, M `914:9886`, S `914:9794`, Description set `914:9786`. MCP quota не позволяла получить новый полный context; использована доступная панель свойств Figma. Это агентская проверка конкретных слоёв, не дизайнерская приёмка всех 40 вариантов.

Дополнительно прочитан Select set `4080:170`: single XL `4080:128` — group height 112, gap 4; single M `4080:44` — group height 80, gap 4. XL label и helper — Text/bodyExtraLarge/Base, weight 400, line 28; palette roles select/label/default и select/helper/default сохранены. Это подтверждает общий адаптер label/helper/gap, но не полную fidelity всех Select variants и popup.

| Наблюдение | Применение |
| --- | --- |
| M label — Text/body/Base, weight 400, line 20 | Отдельная роль `system.typography.fieldWeight` → существующий `foundation/font/body/base/weight`; action labelWeight остаётся Semibold |
| Helper S/M/L/XL — bodySmall/body/bodyLarge/bodyExtraLarge Base, линии 16/20/24/28, weight 400 | Размер/строка label и helper следуют эффективной геометрии поля, включая локальный size и D33 scale; второй таблицы пресетов нет |
| M control height 32; padding Y space/s, padding X space/l; content gap space/s | Существующая формула border-box сохраняется: 20 + 2 × 5 + 2 × 1 = 32; gap слотов 6 px, padding X 10 px |
| Root M height 80, S height 64; vertical gap/y/xs | В экспорте `tokens.json` нет gap/y/xs. Число 4 **выведено** из M: (80 − 20 − 32 − 20) / 2, и проверено S: 16 + 24 + 16 + 8 = 64. Явная привязка к существующему foundation/space/xs, отдельно для двух layout-ролей |
| Prefix — самостоятельный Text/body/Base, без прямоугольной поверхности | Удалена подложка affix в compiler-bound CSS; иконка и текст сохраняют отдельные роли |

Label других размеров использует общий размерный адаптер; прямое наблюдение начертания label относится к M. Вспомогательный текст прочитан отдельно для всех четырёх размеров. Полные высоты групп L=96 и XL=112 следуют композиции двух строк, контрола и двух интервалов; root не получает фиксированной высоты. Многострочные подписи и сообщения расширяют поле естественно.

## Исполнение и происхождение

- `system.json` хранит fieldWeight/fieldLetterSpacing и TextField content gap. Схема, resolver, compiler, web bindings и сборка Provider читают эти же ссылки. Select использует общие field typography leaves; его внутренний gap не меняется без отдельного измерения.
- Публичный Provider получает два раздельных интервала из авторского `profiles/settings-form.json`. Изменения разрешённых layout/token values продолжают доходить до React. Custom profile может задавать другие labelToControl/controlToMessage.
- Web adapter не фиксирует размер helper на предке: он читается на самом компоненте из control geometry. Иначе локальный S мог бы ошибочно наследовать уже вычисленный M.
- NumberField compiler output содержит те же field typography leaves с provenance. UI остаётся одним TextField, не вторым набором рамок и сообщений.
- Общий gap выбора/навигации сохраняет прежние 8 px через buttonContentGap. Отдельный TextField gap меняется на 6 px; существующий gap других контролов не выводится из него.
- Старый `typography.message` сохраняется для совместимости данных, но не управляет TextField. `affix/surface` сохраняется в legacy token branch/requirements; TextField больше не рисует эту поверхность.
- Значения prefix placeholder 40% из исходного макета не переносятся поверх ранее исправленных контрастных ролей. Полная цветовая/состояний fidelity-приёмка остаётся открытой.

`runtimeConformance: not-checked` сохраняется в компиляторе. Node проверяет данные и происхождение; installed React18/19 browser verifier проверяет фактические label/helper/control/affix размеры, состояния, локальный S, перенос, отсутствие лишнего gap и сохранение input/focus/caret. Loading, async и совместные экраны требуют существующих отдельных regression checks. Ни один результат этой проверки не подтверждает Firefox/WebKit, screen readers или native desktop shell.
