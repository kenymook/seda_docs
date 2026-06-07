# Button Social

> **Category** · Actions
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-06-07
> **Figma** · [Button Social](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=791-1400), [Button Social Group](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=796-2955)

---

## 1. Key Principles / Принципы использования

### Что это

Button Social — action component для входа, подключения или продолжения через внешнего identity/provider account: Google, Apple, Facebook или другой подтвержденный provider.

Компонент наследует поведение [Button](button.md), но имеет отдельный contract: provider name, logo artwork, auth intent, loading state, disabled reason, privacy copy и accessible label должны быть однозначными. AI может предложить тексты и порядок providers, но не должен придумывать brand colors, provider logos или OAuth behavior.

### Когда использовать

- Пользователь может продолжить вход или регистрацию через внешний provider.
- Нужно подключить внешний account к профилю или workspace.
- Несколько provider actions показаны рядом как Button Social Group.
- Provider brand помогает распознать способ входа быстрее, чем текст без logo.

### Когда не использовать

- Для обычных product actions — используйте [Button](button.md).
- Для icon-only provider actions без текста — нужен отдельный review accessibility и legal.
- Для sharing actions — используйте Button, Icon Button или Dropdown Menu по контексту.
- Для неподтвержденных provider logos или кастомных brand colors.

### Основные принципы

- **Provider is explicit** — label всегда называет provider.
- **Brand artwork is bounded** — raw brand fills допустимы только внутри provider logo artwork.
- **Button shell stays tokenized** — surface, border, foreground, focus и disabled states используют system tokens.
- **Auth copy is precise** — label описывает действие: `Continue with Google`, `Sign in with Apple`.
- **Privacy is externalized** — terms/privacy copy не прячется в button label.
- **AI assists, system governs** — AI не выбирает provider availability, brand logo или legal copy без human review.

### Связанные спецификации

- [Button](button.md) — базовое action behavior.
- [Icon Button](icon-button.md) — icon-only actions.
- [Form](../overlays-layout/form.md) — auth form composition.
- [Alert](../feedback/alert.md) — auth error messaging.
- [Spinner](../feedback/spinner.md) — loading indicator.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `root` | Да | Button shell с focus, disabled и loading behavior. |
| `providerLogo` | Да | Provider logo artwork. |
| `label` | Да | Видимый action text с provider name. |
| `spinner` | Условно | Loading indicator для auth request. |
| `group` | Нет | Container для набора provider buttons. |

### Правила анатомии

- `providerLogo` не заменяет текстовый label.
- Logo artwork может иметь raw brand fills только по accepted brand exception.
- Root surface, border, focus и text должны быть tokenized через Button/system variables.
- Button Social Group содержит однотипные provider actions и не смешивает auth с unrelated actions.
- Spinner не должен удалять accessible name provider action.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Правило |
|---|---|---|
| `google` | Google sign-in/connect. | Использовать official Google logo artwork. |
| `apple` | Apple sign-in/connect. | Соблюдать contrast и platform guidance. |
| `facebook` | Facebook sign-in/connect. | Использовать official Facebook mark. |
| `custom` | Enterprise/provider-specific auth. | Требует review logo, label и legal copy. |

### Group variants

| Variant | Когда использовать | Правило |
|---|---|---|
| `stacked` | Вертикальный auth layout. | Default для mobile и narrow forms. |
| `inline` | Компактный desktop layout. | Использовать только если labels помещаются. |
| `icon-leading` | Logo перед label. | Default для readability. |

---

## 4. Sizes / Размеры

Button Social использует тот же размерный словарь, что Button.

| Size | Когда использовать | Правило |
|---|---|---|
| `s` | Compact auth panels. | Проверить target size и label readability. |
| `m` | Default auth forms. | Базовый размер. |
| `l` | Touch-first и onboarding. | Использовать для primary auth entry. |
| `xl` | Hero/onboarding screens. | Только если форма не перегружена. |

### Правила размеров

- Все buttons внутри Button Social Group используют один size.
- Logo size должен масштабироваться системно и не менять button height.
- Long provider labels переносятся или сокращаются только по documented localization rule.

---

## 5. States / Состояния

| State | Визуальная роль | Content rule |
|---|---|---|
| `default` | Provider action доступен. | Label называет provider. |
| `hover` | Pointer affordance. | Не менять brand logo artwork. |
| `pressed` | Active feedback. | Сохранять читаемость label. |
| `focus` | Keyboard focus. | Focus ring обязателен. |
| `loading` | Auth request выполняется. | Accessible name сохраняется. |
| `disabled` | Provider временно недоступен. | Причина должна быть рядом или в form error/help. |
| `error` | Auth flow завершился ошибкой. | Error показывается вне button через Alert/Form feedback. |

### State rules

- `loading` блокирует повторное нажатие.
- `disabled` не должен быть единственным способом объяснить недоступность provider.
- Error state не меняет provider logo на warning icon.
- Focus должен быть виден без опоры только на цвет.

---

## 6. Behavior / Поведение

### Activation

- Button Social запускает auth/connect flow для конкретного provider.
- Повторный click во время `loading` игнорируется.
- После auth failure focus возвращается в понятное место формы.
- Если provider открывает popup/new window, это фиксируется в handoff.

### Group behavior

- Button Social Group упорядочивает providers по product rule, а не по случайной популярности.
- В группе не должно быть двух actions для одного provider без явного distinction.
- Если providers скрываются за overflow, это уже auth pattern review.

### Localization

- Label должен сохранять provider name без перевода brand.
- Verb phrase локализуется: `Continue with Google`, `Войти через Google`.
- Long labels должны иметь responsive rule.

---

## 7. Accessibility

Button Social следует [foundation/accessibility.md](../../foundation/accessibility.md) и базовому [Button](button.md) contract.

| Сценарий | Требование | Пример |
|---|---|---|
| Accessible name | Name содержит action и provider. | `Continue with Google`. |
| Logo | Logo decorative, если label уже называет provider. | `aria-hidden="true"` для icon. |
| Loading | Loading объявляется без потери name. | `aria-busy` или framework equivalent. |
| Error | Ошибка auth связана с form feedback. | Alert рядом с auth block. |
| Keyboard | Button доступен через Tab/Enter/Space. | Native `<button>`. |

### Accessibility checklist

- [ ] Provider name есть в visible label.
- [ ] Logo не является единственным provider identifier.
- [ ] Loading state не удаляет accessible name.
- [ ] Disabled provider имеет объяснение в контексте.
- [ ] Auth error сообщается текстом.
- [ ] Button Social Group имеет логичный order чтения.

---

## 8. Design Tokens

Button Social использует Button/system tokens для shell и accepted brand artwork exception для provider logos.

| Token / source | Роль | Правило |
|---|---|---|
| `button/neutral/secondary/surface/default` | Default shell surface. | Использовать для neutral social button shell. |
| `button/neutral/secondary/border/default` | Default shell border. | Не заменять brand-colored border без review. |
| `button/neutral/secondary/foreground/default` | Label foreground. | Текст должен оставаться system-colored. |
| `button/neutral/secondary/focus/ring` | Keyboard focus. | Focus ring обязателен. |
| `button/neutral/secondary/surface/disabled` | Disabled shell surface. | Provider logo не должен быть единственным disabled signal. |
| `RAW:brand-colors` | Provider logo artwork fills. | Допустимо только внутри official logo vectors и documented exceptions. |

### Token rules

- Не создавать `button-social/*` tokens без token architecture review.
- Provider logo fills не связывать с semantic UI tokens.
- Button shell не должен использовать raw provider colors.
- Если нужен branded filled social button, это новый variant и требует design/legal review.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Provider | `provider` | `google`, `apple`, `facebook`, `custom`. |
| Label | `children` / `label` | Содержит action и provider. |
| Loading | `loading` | Блокирует повторное действие. |
| Disabled | `disabled` | Требует contextual reason. |
| Auth callback | `onClick` / `onAuthorize` | Запускает provider flow. |
| Group layout | `layout` | `stacked`, `inline`. |

### Contract rules

- Provider logo выбирается из approved asset map, не из произвольного URL.
- `provider` управляет только logo/default label, не auth behavior целиком.
- `onClick` не должен запускать несколько provider flows.
- Brand artwork exceptions должны быть ограничены logo nodes.

---

## 10. Handoff notes

Handoff для Button Social должен фиксировать:

- provider list и порядок;
- action copy для каждого provider;
- auth flow: redirect, popup, native bridge или connect account;
- loading, disabled и error handling;
- legal/privacy copy рядом с auth block;
- logo source и brand exception scope;
- group layout и responsive switch;
- focus return после error/cancel.

---

## 11. Acceptance criteria

- [ ] Каждый Button Social имеет visible label с provider name.
- [ ] Provider logo не является единственным accessible identifier.
- [ ] Shell использует Button/system tokens.
- [ ] Raw brand fills ограничены provider logo artwork.
- [ ] Loading блокирует повторное нажатие и сохраняет accessible name.
- [ ] Disabled provider имеет объяснение в контексте.
- [ ] Auth error показывается текстом через Form/Alert feedback.
- [ ] Button Social Group имеет стабильный порядок и единый size.
- [ ] No custom provider brand color используется без review.

---

## 12. AI usage rules

AI может:

- предложить labels для provider actions;
- проверить, не смешаны ли auth, sharing и обычные product actions;
- подготовить handoff для loading/error/focus behavior;
- проверить, ограничены ли brand exceptions logo artwork;
- предложить order providers по заданному product rule.

AI не должен:

- придумывать provider logos, brand colors или OAuth behavior;
- заменять Button shell tokens raw provider colors;
- скрывать provider name только в icon;
- добавлять unsupported provider без product/legal review;
- писать privacy/legal copy как окончательную без human approval.

Если Button Social используется для finance, healthcare, identity verification или enterprise SSO, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

| Сценарий | Решение |
|---|---|
| Sign in form with Google and Apple. | Button Social Group, stacked, size `m`, labels with provider names. |
| Connect Facebook account in settings. | Single Button Social with explicit connect copy. |
| Provider temporarily unavailable. | Disabled button plus form helper/error text. |

---

## 14. Anti-patterns

- Использовать provider logo без visible label.
- Делать весь button brand-colored без documented variant review.
- Использовать Social Button для sharing actions.
- Смешивать social auth buttons с unrelated submit/cancel actions в одной group.
- Прятать auth error внутри button label.
- Подменять official logo кастомной иконкой.
