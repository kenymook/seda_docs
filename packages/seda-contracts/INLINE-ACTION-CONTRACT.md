# D35: компактное текстовое действие

Существующий Button variant="text" — inline action, а не обычная кнопка с прозрачной заливкой. Новый variant и новая таблица размеров не добавляются.

Свежая read-only сверка Figma `Su1jWqKc9TkD1R8f7wHOQU`, Button / Button: text/default M `4017:1569`, L `4017:1610`, XL `4017:1651`. Высота S/M/L/XL — 16/20/24/28 px: существующие lineHeight роли. Label M — Text/body/Base, Regular. Иконки занимают квадрат высоты строки. Gap S — gap/x/2xs (явное сопоставление существующему foundation.space.2xs), M/L/XL — space/xs, space/s, space/m. Нулевые paddingInline и layout border — документированные измерения источника: hug width равна тексту, двум icon slots и двум gap. Inner stroke border/width/s рисуется внутри корпуса и не прибавляется к его высоте.

Радиус сохраняет существующую размерную роль; XL border/radius/xl подтверждён. Полная свежая приёмка остальных радиусов и всех состояний остаётся открытой. Этот проход не изменяет геометрию обычных Button/IconButton.

Компилятор и сборщик CSS используют один adapter inline-action.mjs. После разрешения ролей действует прежний общий numeric/CSS граф: scale меняет font/line/icon, X добавляется к нулевому padding, Y — к нулевому базовому вертикальному интервалу. Loading сохраняет фактический корпус. Ни контракт, ни разрешённый JSON не удостоверяют браузерное соответствие.

TextArea использует настоящий Button text в отдельной строке с label. clearLabel нужен для видимого и локализуемого действия; прежний onClear определяет владение значением. При clearable действие сохраняется в header и недоступно для пустого/disabled/readOnly поля. Очистка не отправляет форму и возвращает фокус в textarea. HideLabel не добавляет видимую строку, если clearable=false.

Rows=3 остаётся adapter default. Figma Fill 140 px описывает выделенное родителем место, а не число строк. Обычный TextArea может заполнить заданную через style высоту; autoResize продолжает владеть высотой ввода и соблюдать maxRows. Для фиксированной родительской области используйте resize="none". Label/helper/counter следуют эффективной типографике поля и двум существующим field gap4.

Compact inline targets рассчитаны на pointer/keyboard desktop. Это не подтверждение touch-target 44 px или полной OS/AT/Figma приёмки; для touch-контекста требуется отдельное решение о hit area.

Исходный text palette содержит surface/border только default и loading. Для hover/pressed/disabled применяется явный adapter inline-transparent-state к существующему default с сохранением цепочки токена и ссылки на это решение. Foreground hover/pressed/disabled/loading, focus/ring и spinner/foreground обязательны отдельно; отсутствующие токены не создаются.

Открыто: свежий body container TextArea M показывает собственные space/s и space/l padding. Их согласование со всеми размерами и нынешним профилем height/rows требует отдельного разрешения; данный проход не выдаёт общий single-line padding за точное соответствие всего TextArea Figma.
