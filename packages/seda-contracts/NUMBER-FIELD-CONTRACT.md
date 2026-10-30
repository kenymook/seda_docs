# D32 — NumberField: числовой буфер инспектора

Один browser-safe numeric model используется compiler/React. Controlled `value:string` сохраняет промежуточный ввод; owner управляет document commit, selection scope, history и save. Raw/Mixed не преобразуются в0. min/max/step проверяются как конфигурация; пользовательский нечисловой buffer — факт invalid/incomplete, не exception рендера.

Семантическое расширение использует actual TextField anatomy, общие размеры и явный alias его component token branch. Новой geometry/palette нет. Переключение в NumberField не должно добавлять слот, менять высоту, ломать icon/text scale или создавать вторую границу/focus ring. Separate Figma component approval пока отсутствует.

API/type data и статические факты отделены от runtime: keys/IME/native fieldset/form/owner refusal/focus требуют browser evidence. Node browser rules остаются not-checked. Decimal stepping использует точное сложение десятичных представлений с финальным JS Number; это не arbitrary precision финансовый parser.

См. [полный контракт/ограничения](../../specs/inputs/number-field.md). Использование допускается как experimental с прежними владельцами моделей; status ready требует отдельного design/AT review.
