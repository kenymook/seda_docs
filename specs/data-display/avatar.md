# Avatar

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Avatar — визуальное представление пользователя, команды, AI-агента или другой идентифицируемой сущности. Он помогает быстро распознавать участников в списках, карточках, таблицах, чатах и навигации.

В SEDA AI Avatar не является декоративной картинкой. Он должен быть связан с конкретной сущностью, иметь fallback chain, доступное имя и стабильные размеры.

### Когда использовать

Используйте Avatar, когда:

- нужно показать пользователя, участника, автора, команду или AI-агента;
- рядом с именем нужен быстрый визуальный идентификатор;
- несколько участников отображаются в Avatar Group;
- статус присутствия или верификации относится к конкретной сущности;
- изображение может быть недоступно и нужен fallback.

### Не используйте

Не используйте Avatar, когда:

- элемент не представляет конкретную сущность;
- нужна иконка категории, файла или действия — используйте icon component;
- изображение несет самостоятельный контент, который нужно рассмотреть;
- статус можно понять только по цветной точке без text alternative;
- Avatar используется как декоративный паттерн без доступного имени.

### Основные принципы

- **Identity before image** — Avatar представляет сущность, а не просто фото.
- **Fallback is required** — image fallback chain обязателен: image -> initials -> icon.
- **Deterministic color** — initials color должен быть устойчивым для одной сущности.
- **Size is systematic** — используйте documented sizes, не масштабируйте произвольно.
- **Status needs text** — индикатор присутствия или верификации должен иметь доступное описание.
- **AI drafts, human validates** — AI может подготовить fallback и labels, но человек проверяет privacy, naming и accessibility.

### Связанные спецификации

- [Badge](../specs/data-display/badge.md) — статусы и счетчики рядом с Avatar.
- [Card](../specs/data-display/card.md) — карточки пользователей и сущностей.
- [Table](../specs/data-display/table.md) — Avatar в строках таблицы.
- [Chat Bubble](../specs/data-display/chat-bubble.md) — автор сообщения.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `container` | Да | Круглая или заданная форма Avatar. |
| `image` | Условно | Фото или изображение сущности. |
| `initials` | Условно | 1-2 символа fallback. |
| `icon` | Условно | Fallback icon, если нет image и initials. |
| `indicator` | Нет | Online, busy, away, offline или verification status. |
| `label` | Условно | Видимое имя в Avatar Block. |
| `description` | Нет | Role, email, metadata в Avatar Block. |

### Правила анатомии

- Один Avatar показывает один identity source.
- `image`, `initials` и `icon` не отображаются одновременно как основные слоты.
- `indicator` относится к сущности, а не к container.
- Avatar Group использует несколько Avatar и overflow item, а не отдельную картинку.
- Avatar Block состоит из Avatar + label + description, но не меняет правила самого Avatar.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Правило |
|---|---|---|
| `image` | Есть валидное изображение сущности. | Нужен alt или accessible name. |
| `initials` | Изображение отсутствует, но есть имя. | Использовать 1-2 символа. |
| `icon` | Нет изображения и надежных initials. | Использовать fallback icon. |
| `ai` | Сущность является AI-агентом или AI-generated actor. | Использовать AI surface/foreground tokens. |
| `brand` | Сущность связана с brand/team identity. | Не использовать для произвольного декора. |

### Composite variants

| Variant | Когда использовать | Правило |
|---|---|---|
| `Avatar Group` | Несколько участников в компактной области. | Ограничить max visible и показать overflow. |
| `Avatar Block` | Avatar + имя + secondary text. | Label остается текстом, не прячется в Avatar. |
| `Avatar Add Button` | Добавление участника. | Это action, нужен button semantics. |
| `Avatar More Button` | Overflow `+N`. | Нужен accessible label со списком/количеством. |

### Indicators

| Indicator | Назначение | Token mapping |
|---|---|---|
| `online` | Пользователь доступен. | `avatar/status/online` |
| `busy` | Пользователь занят. | `avatar/status/busy` |
| `away` | Пользователь отошел. | `avatar/status/away` |
| `offline` | Пользователь недоступен. | `avatar/status/offline` |
| `verified` | Сущность подтверждена. | Использовать icon + accessible label. |

---

## 4. Sizes / Размеры

Avatar использует числовые sizes, чтобы они точно совпадали с Figma и code implementation.

| Size | Диаметр | Типичный контекст |
|---|---:|---|
| `16` | 16px | Compact metadata, dense table. |
| `20` | 20px | Inline user mention. |
| `24` | 24px | Table cell, compact list. |
| `32` | 32px | Default list item. |
| `40` | 40px | Card, comment, chat. |
| `48` | 48px | Profile summary. |
| `56` | 56px | Large card. |
| `64` | 64px | Profile header. |
| `72` | 72px | Hero/profile detail. |

### Правила размеров

- Не используйте произвольный scale transform для Avatar.
- Indicator size и offset зависят от Avatar size.
- В Avatar Group все элементы используют один size.
- В table/list Avatar не должен менять row height непредсказуемо.

---

## 5. States / Состояния

| Состояние | Когда возникает | Правило |
|---|---|---|
| `default` | Avatar отображается без интерактивности. | Использует image, initials или icon. |
| `loading` | Изображение загружается. | Можно показать skeleton или fallback до загрузки. |
| `fallback` | Image недоступен. | Переход к initials, затем icon. |
| `hover` | Avatar кликабелен. | Показывать только если есть action. |
| `focus` | Avatar как button/link получил фокус. | Используется focus ring. |
| `selected` | Avatar выбран в группе/списке. | Selection state не только цветом. |
| `disabled` | Сущность или action недоступны. | Используются disabled tokens. |
| `status-online` | Indicator online. | Нужен text alternative. |
| `status-busy` | Indicator busy. | Нужен text alternative. |
| `status-away` | Indicator away. | Нужен text alternative. |
| `status-offline` | Indicator offline. | Нужен text alternative. |

---

## 6. Behavior / Поведение

### Fallback chain

- Если `image.src` валиден, показывается image.
- Если image не загрузился, используется initials.
- Если initials нельзя построить, используется fallback icon.
- Fallback не должен менять размер Avatar.
- Ошибка загрузки изображения не должна показываться пользователю как broken image.

### Initials

- Initials строятся из display name, а не из email, если display name доступен.
- Используйте 1-2 символа.
- Для одной сущности initials color должен быть детерминированным.
- Не используйте initials как единственный источник identity, если рядом нет имени в сложном контексте.

### Interactive Avatar

- Avatar становится интерактивным только если открывает профиль, меню или selection.
- Интерактивный Avatar должен быть `<button>` или `<a>`.
- Avatar с меню должен передавать `aria-haspopup` и open state на trigger.
- Avatar без действия не получает hover/focus styles.

### Avatar Group

- Показывайте ограниченное количество участников, затем overflow `+N`.
- Overflow item должен раскрывать список или вести в область участников.
- Порядок участников должен быть осмысленным: owner, active users, recent users или product-defined sort.
- Перекрытие Avatar не должно скрывать важные indicators без правила.

---

## 7. Accessibility

| Сценарий | Рекомендация | Правило |
|---|---|---|
| Image Avatar рядом с видимым именем | `alt=""` допустим. | Чтобы не дублировать имя. |
| Image Avatar без видимого имени | `alt` с именем сущности. | Сущность должна быть озвучена. |
| Initials/Icon Avatar | `aria-label` или связанный visible label. | Initials сами по себе недостаточны. |
| Interactive Avatar | `<button>` или `<a>`. | Нужен accessible name. |
| Status indicator | Text alternative. | Не передавать статус только цветом. |
| Avatar Group overflow | Accessible label. | Например: "Еще 5 участников". |

### Accessibility checklist

- [ ] У Avatar есть accessible name, если рядом нет видимого имени.
- [ ] Изображение не дублирует видимый label без необходимости.
- [ ] Fallback initials/icon не ломают доступность.
- [ ] Indicator имеет text alternative.
- [ ] Interactive Avatar доступен с клавиатуры.
- [ ] Focus state видим.
- [ ] Avatar Group overflow доступен screen reader пользователю.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Avatar доступны component tokens в namespace `avatar`.

| Component token | Роль | Semantic token |
|---|---|---|
| `avatar/surface/fallback` | Фон fallback Avatar. | `container/neutral/default` |
| `avatar/surface/default` | Фон default Avatar. | `container/neutral/default` |
| `avatar/surface/brand` | Фон brand Avatar. | `container/brand/default` |
| `avatar/surface/ai` | Фон AI Avatar. | `container/ai/default` |
| `avatar/surface/disabled` | Фон disabled Avatar. | `status/disabled/container` |
| `avatar/foreground/fallback` | Текст или icon fallback. | `text/secondary` |
| Avatar foreground on brand surface | Текст на brand surface. | `text/on-brand/primary` |
| Avatar foreground on AI surface | Текст на AI surface. | `text/on-brand/primary` |
| `avatar/foreground/disabled` | Текст disabled Avatar. | `status/disabled/text` |
| `avatar/border/default` | Border для Avatar Group. | `surface/base` |
| `avatar/border/selected` | Border selected Avatar. | `border/selected` |
| `avatar/border/focus` | Border focus Avatar. | `border/focus` |
| `avatar/indicator/online` | Online indicator. | `status/success/surface` |
| `avatar/focus/ring` | Focus ring. | `focus/ring` |
| `avatar/status/online` | Online status icon. | `status/success/icon` |
| `avatar/status/busy` | Busy status icon. | `status/danger/icon` |
| `avatar/status/away` | Away status icon. | `status/warning/icon` |
| `avatar/status/offline` | Offline status icon. | `icon/muted` |

Token gap: отдельные component tokens для numeric sizes, indicator size, group overlap, skeleton surface и shape radius пока не выделены. До появления таких tokens используйте documented size table и foundation rules.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Source | `src` | URL изображения. |
| Name | `name` | Используется для alt, aria-label и initials. |
| Initials | `initials` | Override, если нужно вручную задать fallback. |
| Size | `size` | `16`, `20`, `24`, `32`, `40`, `48`, `56`, `64`, `72`. |
| Variant | `variant` | `image`, `initials`, `icon`, `brand`, `ai`. |
| Status | `status` | `online`, `busy`, `away`, `offline`. |
| Selected | `selected` | Для selectable contexts. |
| Disabled | `disabled` | Отключает interactive behavior. |
| Click | `href` или `onClick` | Только для interactive Avatar. |
| Group max | `maxVisible` | Для Avatar Group overflow. |

---

## 10. Handoff notes

Handoff для Avatar должен фиксировать:

- какую сущность представляет Avatar;
- источник изображения и fallback chain;
- size и variant;
- правила initials и deterministic color;
- status indicator и accessible text;
- interactive behavior, если Avatar кликабелен;
- Avatar Group ordering, max visible и overflow behavior;
- privacy constraints для пользовательских фото;
- token mapping и token gaps.

---

## 11. Acceptance criteria

- [ ] Avatar связан с конкретной сущностью.
- [ ] Fallback chain описан и не ломает layout.
- [ ] Size взят из documented size table.
- [ ] Interactive Avatar доступен с клавиатуры.
- [ ] Status indicator имеет text alternative.
- [ ] Avatar Group имеет max visible и overflow behavior.
- [ ] Изображение имеет корректный alt или декоративный `alt=""`.
- [ ] Token mapping соответствует documented Avatar component tokens из `tokens.json`.

---

## 12. AI usage rules

AI может:

- предложить fallback chain для Avatar;
- проверить наличие accessible name и status text;
- подготовить Avatar Group overflow rules;
- найти сценарии, где нужна иконка вместо Avatar.

AI не должен:

- использовать Avatar как декоративный элемент без сущности;
- генерировать персональные фото или identity data без источника;
- передавать статус только цветом;
- добавлять новые token paths без `Token gap`;
- делать Avatar интерактивным без описанного действия.

Если Avatar связан с privacy, identity verification или AI-agent representation, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Avatar + имя автора в комментарии. | Avatar поддерживает идентификацию сущности. |
| Avatar Group в карточке проекта. | Показывает участников и overflow. |
| AI Avatar с отдельным variant. | AI-сущность визуально отличима и описана. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Avatar без имени в таблице. | Есть ли accessible name и не теряется ли identity. |
| Online indicator без текста. | Нужен text alternative. |
| Кликабельный Avatar с внутренним menu. | Описаны ли aria-haspopup и focus behavior. |

---

## 14. Anti-patterns

- Использовать Avatar для категории или действия вместо icon.
- Показывать broken image без fallback.
- Использовать случайный цвет initials, меняющийся между сессиями.
- Передавать online/busy/away только цветом.
- Делать Avatar кликабельным без hover/focus/keyboard rules.
- Масштабировать Avatar произвольно вне documented sizes.
