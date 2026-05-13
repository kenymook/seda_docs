# Модель валидации

Validation model описывает, как SEDA AI проверяет пользовательский ввод, показывает ошибки, предупреждения и успешные состояния. Цель — сделать validation предсказуемой, доступной и полезной, без лишнего шума и преждевременных ошибок.

Валидация — это не только цвет рамки. Это timing, текст сообщения, связь с полем, доступность, поведение submit и восстановление после ошибки.

---

## 1. Принципы

| Принцип | Что означает |
|---|---|
| Validate after intent | Не показывайте ошибку до того, как пользователь взаимодействовал с полем или попытался отправить форму. |
| Explain recovery | Сообщение должно говорить, что исправить. |
| Text over color | Ошибка, предупреждение или успех не передаются только цветом или иконкой. |
| Keep value editable | Ошибка не должна стирать введенное значение. |
| Focus helps recovery | После submit с ошибками фокус ведет к месту, где пользователь может исправить проблему. |
| Async is explicit | Если проверка занимает время, показывайте validating/loading state. |
| Summary for complex forms | В длинных формах нужен error summary. |

---

## 2. Когда валидировать

| Момент | Когда использовать | Что показывать |
|---|---|---|
| `onBlur` | Большинство текстовых полей. | Ошибка после ухода из поля, если значение некорректно. |
| `onInput` | Форматы с быстрым feedback: password strength, character count, search filters. | Нейтральные подсказки или мягкие предупреждения. |
| `onSubmit` | Обязательные поля и форма целиком. | Все blocking errors и error summary. |
| `onChange` | Checkbox, Radio, Select, Slider, Toggle. | Состояние обновляется сразу, ошибка снимается при корректном выборе. |
| `async` | Email uniqueness, promo code, username availability. | `validating`, затем success/error/warning. |

Не показывайте `error` на пустом required field до blur или submit. Исключение — поле уже было заполнено, а затем очищено.

---

## 3. Validation states

| State | Значение | Blocking |
|---|---|---|
| `default` | Поле еще не проверено или значение нейтрально. | Нет |
| `validating` | Идет синхронная или async-проверка. | Иногда |
| `error` | Значение некорректно и действие нельзя продолжить. | Да |
| `warning` | Есть риск или рекомендация, но действие возможно. | Нет |
| `success` | Значение подтверждено. | Нет |
| `disabled` | Поле недоступно. | Не валидируется |
| `read-only` | Значение нельзя изменить, но можно прочитать. | Обычно не валидируется |

`error` имеет приоритет над `warning` и `success`. `disabled` не должен одновременно показывать validation state.

---

## 4. Blocking vs non-blocking

### Blocking error

Используйте `error`, если пользователь не может продолжить:

- required field пустое после submit;
- формат некорректен;
- значение вне допустимого диапазона;
- файл превышает лимит;
- async-проверка отклонила значение;
- пользователь не имеет прав выполнить действие.

### Non-blocking warning

Используйте `warning`, если действие возможно, но есть риск:

- пароль слабый, но допустимый;
- дата находится вне рекомендованного периода;
- значение необычно высокое;
- действие может повлиять на связанные настройки;
- часть данных не будет сохранена.

Warning не должен блокировать submit без явного правила продукта.

### Success

Используйте `success` точечно:

- async-проверка подтвердила доступность username;
- промокод применен;
- файл прошел проверку;
- настройка сохранена.

Не показывайте success на каждом корректном поле в обычной форме; это создает визуальный шум.

---

## 5. Anatomy validation message

Validation message состоит из:

| Part | Обязательность | Правило |
|---|---|---|
| State | required | `error`, `warning`, `success`, `validating`. |
| Message | required для error/warning | Текст объясняет, что исправить или что произойдет. |
| Icon | optional | Дублирует смысл, но не заменяет текст. |
| Action | optional | Retry, request access, remove file, clear value. |
| Target | required | Сообщение связано с конкретным полем или формой. |

Пример:

```text
Введите email в формате name@example.com.
```

Плохой пример:

```text
Ошибка.
```

---

## 6. Inline validation

Inline validation показывается рядом с полем или группой.

Правила:

- error text находится под control или group;
- helper text и error text не должны конфликтовать;
- при error helper можно заменить error message;
- если helper остается, error должен быть визуально и семантически приоритетнее;
- поле связывается с сообщением через `aria-describedby`;
- для error используется `aria-invalid="true"`.

Для группы Checkbox/Radio error относится к group container, а не к каждому item.

---

## 7. Error summary

Error summary нужен, если:

- форма длинная;
- ошибок больше одной;
- ошибки могут быть вне видимой области;
- submit находится далеко от проблемных полей;
- форма разбита на секции или steps.

Error summary должен:

1. стоять перед формой или в начале проблемной секции;
2. иметь heading;
3. перечислять ошибки;
4. ссылаться на поля;
5. получать фокус после неуспешного submit, если это помогает пользователю;
6. не заменять inline messages.

Пример:

```text
Исправьте 3 поля:
- Email: введите email в формате name@example.com.
- Пароль: минимум 8 символов.
- Роль: выберите один вариант.
```

---

## 8. Async validation

Async validation используется, когда результат зависит от сервера или долгой проверки.

Правила:

- показывайте `validating`, если проверка дольше 300ms;
- не блокируйте ввод во время проверки, если это не необходимо;
- отменяйте устаревшие запросы;
- не показывайте success/error от старого значения после изменения input;
- при submit дождитесь актуального результата или покажите pending state;
- error должен объяснять, что произошло и можно ли повторить.

Примеры async states:

| Сценарий | State | Message |
|---|---|---|
| Username проверяется | `validating` | `Проверяем доступность...` |
| Username занят | `error` | `Это имя уже занято. Выберите другое.` |
| Promo code применен | `success` | `Промокод применен.` |
| Проверка не удалась | `warning` или `error` | `Не удалось проверить код. Попробуйте снова.` |

---

## 9. Submit behavior

При submit:

1. проверить все required и dirty fields;
2. показать inline errors;
3. показать error summary, если форма длинная или ошибок несколько;
4. перевести фокус к summary или первому ошибочному полю;
5. не очищать введенные значения;
6. не блокировать всю форму, если можно исправлять поля;
7. отключать submit только во время реальной отправки или если действие точно невозможно.

Не делайте submit button disabled только потому, что форма пока невалидна, если пользователь не понимает почему. Часто лучше разрешить submit и показать ошибки.

---

## 10. Accessibility

Validation должна соответствовать `foundation/accessibility.md`.

| Requirement | Правило |
|---|---|
| Accessible name | Поле имеет label или `aria-label`. |
| Description | Helper/error связан через `aria-describedby`. |
| Invalid state | Error field использует `aria-invalid="true"`. |
| Live region | Async/global errors объявляются через `role="status"` или `role="alert"` по смыслу. |
| Focus order | После submit фокус не теряется и помогает исправлению. |
| Color contrast | Error/warning/success text и border проходят contrast requirements. |
| Not color-only | Иконка/цвет всегда сопровождаются текстом. |

`role="alert"` используйте осторожно: он подходит для срочных ошибок, но не для каждого символа при вводе.

---

## 11. Content rules

Validation messages следуют `foundation/content.md`.

**Use**

- “Введите email в формате name@example.com.”
- “Пароль должен содержать минимум 8 символов.”
- “Файл должен быть меньше 10 MB.”
- “Выберите хотя бы один канал уведомлений.”

**Don't use**

- “Invalid.”
- “Wrong value.”
- “Something went wrong.”
- “Поле заполнено некорректно.”

Сообщение должно быть коротким, конкретным и ориентированным на исправление.

---

## 12. Component mapping

| Component | Validation ownership |
|---|---|
| Text Field / Text Area | Формат, required, min/max length, async validation. |
| Checkbox / Radio | Required choice, group-level error. |
| Select / Combobox | Required value, no-results, invalid option. |
| Slider / Stepper | Min/max, step, range validity. |
| File Upload | File type, size, count, upload failure. |
| Form | Error summary, submit state, cross-field validation. |
| Date / Time Picker | Date/time format, range, unavailable values. |
| Color Picker | Format, allowed palette, contrast feedback. |

---

## 13. Cross-field validation

Используйте cross-field validation, если значение одного поля зависит от другого:

- start date <= end date;
- password confirmation matches password;
- min value <= max value;
- at least one contact method selected;
- role requires additional permission.

Cross-field error должен быть привязан к группе или к полю, где пользователь может исправить проблему. Если исправить можно в нескольких местах, используйте group-level message.

---

## 14. Tokens

Validation states используют semantic status tokens:

| Role | Token examples |
|---|---|
| Error text | `status/error/text` |
| Error border | `status/error/border` |
| Error surface | `status/error/surface` |
| Warning text | `status/warning/text` |
| Success text | `status/success/text` |
| Disabled | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |
| Focus | `focus/ring` |

Component tokens должны мапиться на эти semantic tokens, а не на raw color values.

---

## 15. Checklist

Перед переводом form/input spec в `ready` проверьте:

- [ ] Описано, когда validation запускается.
- [ ] Есть `error`, `warning`, `success`, `validating`, если применимо.
- [ ] Error text объясняет исправление.
- [ ] Error связан с полем через `aria-describedby`.
- [ ] `aria-invalid` используется для error.
- [ ] Error summary описан для длинных форм.
- [ ] Async validation не показывает устаревший результат.
- [ ] Submit behavior не стирает значения.
- [ ] Disabled и read-only не смешаны.
- [ ] Tokens мапятся на semantic status tokens.
