# Number Field

> **Category** · Inputs
> **Status** · needs-review / experimental React implementation
> **Owner** · Kenymook
> **Last reviewed** · 2026-10-25 (implementation review; design/AT signoff open)
> **Visual basis** · [TextField/Input](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=914-9795). This is not approval of a separate NumberField Figma component.

## Purpose and anatomy

Числовой ввод для координат, размеров и параметров плотного рабочего приложения. Реализован композицией настоящего SEDA TextField: те же label/input/affix/message, цвета, focus ring, размеры и X/Y. Новых tokens, постоянного stepper slot или отдельного визуального primitive нет. Расширение необходимо: native type=number теряет промежуточные строки вроде `-`, а обычный TextField не задаёт согласованные step/bounds/ARIA semantics.

Использовать для plain finite numeric values с keyboard stepping. Для текста/идентификаторов — TextField; для CSS `auto`, units, выражений и rich property grammar — host DraftProperty; для непрерывной шкалы — Slider. NumberField не парсит CSS и не является финансовой decimal арифметикой.

## Public API and ownership

`value:string` и `onValueChange(raw:string)` обязательны: это controlled raw buffer, а не второй committed value. Поле сохраняет пустую строку, знак, неполную exponent notation и ошибочный черновик. Никогда не преобразует отсутствие числа/Mixed в ноль. Owner может отклонить intent; DOM остаётся равен value. NumberField не выполняет blur/Enter commit, save, undo или transport. Эти действия и scope identity принадлежат редактору. Отдельный числовой буфер необходим, чтобы не терять клавиатурный ввод и не создавать history entry на каждый символ.

Обязателен непустой `label:string`. `min/max` — необязательные конечные числа, min≤max; `step` — конечное положительное число, default1. `mixed=false`, `mixedLabel='Mixed'` (потребитель локализует); Mixed действует только при пустом buffer. `size` наследует provider S/M/L/XL. Native disabled/readOnly/required/name/form/id/ref/HTML/ARIA, helper/error и prefix/suffix поддержаны. Type, role, inputMode, value/defaultValue/onChange/onInput/pattern и aria-valuenow/min/max принадлежат компоненту; придумывать эти override нельзя.

Numeric grammar: trimmed signed decimal/exponent с точкой. `1,5`, CSS units и выражения сохраняются как raw draft, но не становятся числом; локализованный parser пока не предоставлен. `numericState` различает empty/mixed/incomplete/invalid/number. Положительные и отрицательные min/max допустимы; typed input не округляется и не clamp-ится автоматически. Owner валидирует документ и показывает errorText при подтверждении. Известный out-of-range buffer получает aria-invalid; visual error/message остаётся собственностью owner.

## States and keyboard

- Up/Down меняют текущий числовой buffer на step, PageUp/PageDown — на10×step, с ограничением min/max. Шаг прибавляется к текущему значению, не переставляет его на чужую grid. Decimal string arithmetic сохраняет .1+.2 и representable large offsets без fixed-significance rounding.
- При неизвестном числе Up/Down/Page не делают предположений. Home/End выбирают явный min/max, если он задан; иначе сохраняется native caret navigation. Shift/Ctrl/Meta/Alt combinations, Left/Right, selection, clipboard и обычный text editing не перехватываются.
- onKeyDown owner выполняется первым; preventDefault отменяет внутренний step. Enter/Escape принадлежат owner. IME composition не шагает. Focus остаётся в input. Wheel не меняет значение.
- Disabled, native fieldset и readOnly не отправляют intent. Min=max допускает постоянное значение. Если следующий JS number не представим или переполняется без конечной границы, intent отсутствует.

## Accessibility and visual mapping

Actual input type=text / role=spinbutton / inputMode=decimal. Visible label связан штатным TextField; helper/error IDs не дублируются, external description сохраняется. aria-valuenow только для конечного известного числа; unknown/Mixed не выдаётся за0. aria-valuemin/max из props, Mixed получает локализованный aria-valuetext. Required/error/disabled/readOnly имеют реальное поведение. Связанные основы: [WAI spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) и [ARIA numeric value](https://www.w3.org/TR/wai-aria-1.2/#aria-valuenow). Chromium keyboard checks не заменяют touch screen reader/native OS acceptance.

Все color roles — явный visual alias существующего `components/text-field`, без своей palette. Geometry — общие system presets и compiler overrides. Typography/icon/affix/border/radius/hover/focus/error/disabled повторяют TextField. Новый token family и отдельная Figma anatomy не выданы за согласованные. CSS не фиксирует дополнительную высоту/ширину.

## Handoff, acceptance and AI rules

Executable contract D32 и browser-safe numeric core принадлежат packages/seda-contracts; UI build включает тот же модуль внутрь installed dist. Node validation проверяет API/числовую конфигурацию/привязки/источники. Keyboard/IME/owner refusal/FormData/focus и реальный paint доказываются в браузере отдельно. Декларации browser rules остаются not-checked в Node.

Проверить single source bytes, decimal/large steps, partial/Mixed, bounds и неизменяемость; keyboard editing/IME/disabled/readOnly/fieldset, owner refusal, descriptions/form/ref, общий размер/темы; реальные редакторы должны сохранять commit/cancel/history/selection/save. Менять raw buffer без подтверждения документа нельзя считать сохранением. Не добавлять invented variants, formatter/parser, dragging или commit callbacks. AI отмечает gap и needs-review вместо выдуманного approved Figma состояния.

До готовности: fresh Figma design review, locales/parsing policy, pointer stepper/scrub affordance policy, touch/target OS/AT/Firefox/WebKit acceptance. Общая цель зрелости SEDA остаётся открытой.


Публичные warningText/successText, приоритеты сообщений и numeric confirmation описаны в [исполняемом контракте валидации](../../packages/seda-contracts/FIELD-VALIDATION.md).
