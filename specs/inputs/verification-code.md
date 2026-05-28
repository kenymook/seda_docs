# Verification Code

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Verification Code — специализированный input-компонент для ввода одноразового кода подтверждения: SMS OTP, email-кода, PIN или кода подтверждения операции. Компонент визуально разделяет код на ячейки, управляет фокусом, поддерживает paste/autofill и помогает пользователю быстро исправить ошибку.

Verification Code не является password field и не должен использоваться для длинных секретов. В отличие от Text Field, он оптимизирован для короткого кода фиксированной длины, где важны auto-advance, paste distribution, resend flow и validation feedback.

### Когда использовать

**Используйте** — когда пользователь вводит короткий код фиксированной длины:

- двухфакторная аутентификация;
- подтверждение email или телефона;
- подтверждение транзакции;
- восстановление доступа;
- PIN-код в коротком flow;
- одноразовый код, который можно вставить из SMS/email.

**Не используйте:**

- Для паролей — используйте [Text Field](../inputs/text-field.md) с `type="password"`.
- Для длинных кодов больше 8 символов — используйте [Text Field](../inputs/text-field.md).
- Для свободного ввода без фиксированной длины — используйте Text Field.
- Для выбора метода подтверждения — используйте Radio, Select или Segmented Control.
- Для статуса отправки кода — используйте Alert, Toast или inline status text.

### Основные принципы

- **Код имеет фиксированную длину** — количество ячеек должно соответствовать реальному коду.
- **Paste работает целиком** — пользователь может вставить полный код, и символы распределяются по ячейкам.
- **Focus помогает, но не мешает** — auto-advance ускоряет ввод, но пользователь может перемещаться клавиатурой.
- **Error не стирает без причины** — неверный код показывает ошибку, а очистка выполняется только если это описано в flow.
- **Resend flow отделен от input** — повторная отправка кода, таймер и смена метода не являются частью ячеек.
- **AI не придумывает security behavior** — AI может описать UX, но правила retry, expiry и masking утверждает человек.

### Связанные спецификации

- [Text Field](../specs/inputs/text-field.md)
- [Button](../specs/actions/button.md)
- [Alert](../specs/feedback/alert.md)
- [Toast](../specs/feedback/toast.md)
- [Form](../specs/overlays-layout/form.md)

---

## 2. Anatomy

```text
Label
[1] [2] [3] [ ] [ ] [ ]
Helper text / Error
[Resend code]
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | да | Контейнер Verification Code |
| `label` | рекомендуется | Видимый label control |
| `cells` | да | Набор ячеек кода: 4, 6 или 8 |
| `cell` | да | Одна позиция символа |
| `helperText` | опционально | Подсказка, срок действия, формат кода |
| `errorText` | условно | Ошибка неверного или истекшего кода |
| `resendAction` | опционально | Повторная отправка кода, обычно Button или Link |
| `timer` | опционально | Countdown до повторной отправки или истечения кода |
| `methodHint` | опционально | Текст о канале доставки: SMS, email, authenticator |

### Правила anatomy

- Количество `cells` должно совпадать с `length`.
- `label` не заменяется placeholder или helper text.
- `resendAction` не должен находиться внутри ячейки.
- `timer` и `errorText` должны быть текстовыми, не только цветом.
- Для 4, 6 и 8 ячеек используйте устойчивый layout без сдвига при вводе.

---

## 3. Types / Variants

### Типы кода

| Тип | Описание | Правило |
| --- | --- | --- |
| `numeric` | Только цифры 0-9 | Дефолт для SMS OTP |
| `alphanumeric` | Буквы и цифры | Используйте только если код реально содержит буквы |
| `pin` | Короткий numeric code | Может требовать masking по security rules |

### Длина

| Length | Когда использовать |
| --- | --- |
| `4` | Короткий PIN или легкий confirmation flow |
| `6` | Дефолт для OTP и 2FA |
| `8` | Более длинный security code |

### Input mode

| Mode | Описание | Правило |
| --- | --- | --- |
| `single-input` | Один скрытый/визуально распределенный input | Лучше для paste, autofill и screen readers |
| `multi-input` | Отдельный input на каждую cell | Требует аккуратного focus management |

---

## 4. Sizes

Размер Verification Code управляет размером ячейки, spacing и плотностью layout.

| Size | Плотность ячейки | Когда использовать |
| --- | --- | --- |
| `compact` | Малые ячейки и небольшой gap | Узкие panels и dense auth flows |
| `medium` | Дефолтный размер | Большинство auth/verification screens |
| `large` | Крупные ячейки | Mobile-first screens, onboarding, high-attention flows |

### Правила размеров

- Используйте `medium` по умолчанию.
- Используйте `large` на мобильных, если компонент является главным действием экрана.
- Используйте `compact` только если код остается легко читаемым и touch targets достаточны.
- Gap между ячейками должен помогать чтению, но не разрывать код на несвязанные поля.
- Не уменьшайте font size ради 8 ячеек; лучше уменьшите gap или перейдите к Text Field для длинного кода.

---

## 5. States

### Матрица состояний

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `default` | Пустой код | Ячейки готовы к вводу |
| `focus` | Активная ячейка или input | Видимый focus treatment |
| `filled` | Код частично или полностью введен | Символы видимы или masked по rules |
| `complete` | Заполнены все позиции | Можно запускать auto-submit, если это описано |
| `validating` | Код проверяется | Заблокируйте duplicate submit, сохраните код |
| `error` | Код неверный, истек или не принят | Покажите error text и recovery |
| `disabled` | Ввод недоступен | Нет ввода, disabled treatment |
| `expired` | Код истек | Покажите resend path |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| `filled` + `focus` | да | Пользователь редактирует введенный код |
| `complete` + `validating` | да | Проверка после полного ввода |
| `error` + `filled` | да | Неверный код может оставаться видимым для исправления |
| `expired` + `disabled` | да | Ввод может быть заблокирован до resend |
| `disabled` + `focus` | нет | Disabled control не фокусируется |

---

## 6. Behavior

### Ввод

- При вводе допустимого символа focus переходит к следующей позиции.
- `Backspace` удаляет текущий символ; если ячейка пустая, возвращает focus к предыдущей позиции.
- Arrow keys перемещают focus между позициями.
- При paste полный код распределяется по ячейкам с учетом `length` и `type`.
- Недопустимые символы игнорируются или показывают validation feedback, если это описано.
- Для `numeric` используйте `inputmode="numeric"`.

### Submit и validation

- Auto-submit допустим только после полного ввода и если это явно описано в flow.
- Manual submit через Button допустим, если пользователю нужно проверить код самостоятельно.
- В `validating` повторный submit блокируется.
- При `error` сохраняйте код, если пользователю полезно исправить отдельный символ.
- При `expired` показывайте resend action и понятный текст.

### Resend и timeout

- Resend action должен иметь cooldown, если это требуется security/product rules.
- Таймер должен быть текстовым и доступным для screen readers.
- После resend решите, очищается ли текущий код; это должно быть описано в handoff.
- Ошибки отправки нового кода показываются отдельно от ошибки введенного кода.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `0-9`, `A-Z` | Ввод допустимого символа и переход вперед |
| `Backspace` | Удаление символа или переход назад |
| `ArrowLeft` / `ArrowRight` | Перемещение между позициями |
| `Home` / `End` | Перейти к первой или последней позиции, если поддержано |
| `Ctrl/Cmd+V` | Вставка кода и распределение по ячейкам |
| `Enter` | Submit, если код complete и flow это поддерживает |

---

## 7. Accessibility

Verification Code следует [foundation/accessibility.md](../../foundation/accessibility.md), [foundation/content.md](../../foundation/content.md) и input semantics.

| Требование | Правило |
| --- | --- |
| Label | Control имеет видимый label или programmatic label |
| Autofill | Используйте `autocomplete="one-time-code"` для OTP |
| Input mode | Используйте `inputmode="numeric"` для numeric code |
| Cell naming | Если inputs раздельные, каждая cell имеет имя "цифра N из M" |
| Error | Error text связан с control через description |
| Live region | Resend/timer/status не должны шуметь; announce только важные изменения |
| Paste | Paste full code поддерживается |
| Color reliance | Error/focus/disabled не передаются только цветом |

### Accessibility checklist

- [ ] Label понятен и связан с control.
- [ ] `autocomplete="one-time-code"` включен для OTP.
- [ ] Numeric keyboard открывается на mobile для numeric code.
- [ ] Paste full code работает.
- [ ] Error text доступен screen reader.
- [ ] Resend action доступен keyboard.
- [ ] Timer и expiry не зависят только от цвета.
- [ ] Focus order не ловит пользователя в ячейках.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Роль | Component token | Semantic |
| --- | --- | --- |
| Cell surface default | `verification-code/cell/surface/default` | `surface/base` |
| Cell surface hover | `verification-code/cell/surface/hover` | `surface/subtle` |
| Cell surface active | `verification-code/cell/surface/active` | `surface/base` |
| Cell surface focus | `verification-code/cell/surface/focus` | `surface/base` |
| Cell surface error | `verification-code/cell/surface/error` | `status/danger/container` |
| Cell surface disabled | `verification-code/cell/surface/disabled` | `status/disabled/container` |
| Cell border default | `verification-code/cell/border/default` | `border/default` |
| Cell border hover | `verification-code/cell/border/hover` | `border/hover` |
| Cell border active | `verification-code/cell/border/active` | `border/strong` |
| Cell border focus | `verification-code/cell/border/focus` | `border/focus` |
| Cell border error | `verification-code/cell/border/error` | `status/danger/border` |
| Cell border disabled | `verification-code/cell/border/disabled` | `status/disabled/border` |
| Cell foreground default | `verification-code/cell/foreground/default` | `text/primary` |
| Cell foreground placeholder | `verification-code/cell/foreground/placeholder` | `text/muted` |
| Cell foreground disabled | `verification-code/cell/foreground/disabled` | `status/disabled/text` |
| Focus ring | `verification-code/focus/ring` | `focus/ring` |
| Disabled surface | `verification-code/disabled/surface` | `status/disabled/container` |
| Helper default | `verification-code/helper/default` | `text/tertiary` |
| Helper error | `verification-code/helper/error` | `status/danger/text` |

### Token gaps

- Сейчас у Verification Code нет component tokens для cell size, cell gap, radius, digit typography, timer text, resend action и shake animation.
- Используйте foundation sizing, spacing, typography, radius, motion и Button/Text Field rules, пока не появятся component-specific tokens.
- Не придумывайте `--otp-*` или новые `verification-code/*` token paths в specs, code, Figma или AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Value | `value` | Текущий код как строка |
| Length | `length` | `4`, `6`, `8` или documented custom value |
| Type | `type` | `numeric`, `alphanumeric`, `pin` |
| Size | `size` | `compact`, `medium`, `large` |
| Input mode | `inputMode` | `single-input`, `multi-input` |
| Disabled | `disabled` | Блокирует ввод |
| Error | `error` | Error message или error state |
| Validating | `validating` | Async validation state |
| Expired | `expired` | Код истек |
| Auto submit | `autoSubmit` | Только если flow это поддерживает |
| Masked | `masked` | Для PIN/security contexts |
| On change | `onChange` | Возвращает normalized value |
| On complete | `onComplete` | Вызывается при заполнении всех позиций |
| On submit | `onSubmit` | Проверка кода |
| On resend | `onResend` | Повторная отправка |

### Contract rules

- `length` должен совпадать с количеством ячеек и backend contract.
- `type` определяет допустимые символы и mobile keyboard.
- `onComplete` не всегда означает successful verification.
- `autoSubmit` требует защиты от duplicate submit.
- `resendAction`, timer и expiry behavior должны быть описаны отдельно от cells.

---

## 10. Handoff notes

В handoff нужно передать:

- длину кода и допустимые символы;
- source кода: SMS, email, authenticator, transaction approval;
- поведение paste/autofill;
- auto-submit или manual submit;
- retry, cooldown, resend и expiry rules;
- error states: неверный код, истекший код, слишком много попыток, ошибка отправки;
- masking rules, если это PIN/security context;
- focus behavior для input, paste, backspace и arrows;
- token mapping для cell surface, border, foreground, helper и focus;
- token gaps для размеров, gap, timer, resend action и motion.

### Acceptance criteria

- Количество ячеек совпадает с длиной кода.
- Paste full code распределяет символы корректно.
- Numeric OTP использует `autocomplete="one-time-code"` и `inputmode="numeric"`.
- `error`, `expired`, `validating` и `disabled` states различимы.
- Error text связан с control и не передается только цветом.
- Resend action и cooldown доступны keyboard и screen reader.
- Компонент использует документированные `verification-code/*` tokens и foundation rules для token gaps.
- AI-generated drafts не добавляют security behavior, token paths или validation rules без review.

---

## 11. AI usage rules

- AI может использовать Verification Code только для коротких одноразовых кодов фиксированной длины.
- AI должен рекомендовать Text Field для длинных кодов, паролей и свободного ввода.
- AI не должен придумывать code length, retry rules, expiry time, masking, token paths или backend validation behavior.
- AI должен проверять `tokens.json` перед изменением Verification Code token mappings.
- AI должен помечать missing paste behavior, missing expiry/resend rules, unclear validation flow, inaccessible cells или unsupported security behavior как `Needs system review`.
- AI может подготовить Handoff notes, validation copy и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Examples

### Корректно

| Сценарий | Использование |
| --- | --- |
| SMS OTP | `type=numeric`, `length=6`, `autocomplete="one-time-code"` |
| Email code | `type=alphanumeric`, `length=6`, paste supported |
| Transaction approval | `type=numeric`, `length=6`, manual submit |
| PIN setup | `type=pin`, `masked=true`, security rules documented |
| Expired code | `expired=true`, resend action и clear recovery text |

### Требует review

| Сценарий | Причина |
| --- | --- |
| 12-символьный recovery code в отдельных cells | Лучше Text Field |
| Auto-submit без duplicate guard | Риск повторных запросов |
| Error очищает код сразу | Пользователь не может исправить один символ |
| Resend без cooldown в security flow | Требуется product/security rule |
| AI задает expiry 30 секунд без требования | Придуманное security behavior |

---

## 13. Anti-patterns

- Использовать Verification Code для пароля.
- Делать каждую cell отдельным тупиковым focus trap.
- Не поддерживать paste full code.
- Показывать ошибку только красной рамкой.
- Автоматически стирать код без понятной причины.
- Прятать resend action или timer от keyboard users.
- Создавать raw colors, ad hoc cell spacing или недокументированные token names.
