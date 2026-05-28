# Empty State

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Empty State](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6650-37)

---

## 1. Key Principles

### Что это

Empty State — feedback-компонент для ситуации, когда в контейнере, разделе или экране ожидается содержимое, но его нельзя показать: данных нет, поиск ничего не нашел, доступ ограничен, загрузка завершилась ошибкой или пользователь еще не начал сценарий.

В SEDA AI Empty State фиксирует recovery contract: причину состояния, доступный следующий шаг, правила контента, token mapping, accessibility и handoff. Компонент не заполняет пустоту декоративным блоком, а помогает пользователю понять, что произошло и что можно сделать дальше.

### Когда использовать

- В списке, таблице или разделе нет объектов.
- Поиск или фильтры не вернули результатов.
- Пользователь не имеет доступа к содержимому.
- Данные не загрузились, и вместо отдельного Alert нужен контекстный recovery state.
- Пользователь впервые открывает сценарий и должен начать настройку.
- Контентная область должна сохранить структуру экрана, но показать отсутствие содержимого.

### Когда не использовать

- Во время загрузки данных — используйте [Skeleton](skeleton.md) или [Spinner](spinner.md).
- Для общей ошибки поверх заполненного интерфейса — используйте [Alert](alert.md) или Toast.
- Как декоративный блок без причины, условия показа и следующего шага.
- Для текста `Нет данных` без объяснения, если пользователь может что-то сделать.
- Внутри формы, если достаточно helper text, validation message или disabled state.
- Для маркетинговой иллюстрации, которая не связана с состоянием продукта.

### Ключевые принципы

- **Причина важнее украшения** — title должен прямо объяснять отсутствие содержимого.
- **Recovery before decoration** — действие нужно только тогда, когда у пользователя есть реальный путь восстановления.
- **Сохраняйте контекст** — Empty State в таблице не должен скрывать заголовки, фильтры и выбранный scope без причины.
- **Не имитируйте данные** — нельзя заменять пустой результат фальшивыми карточками или демо-строками.
- **Loading не является Empty State** — сначала показывается loading state, затем контент, ошибка или Empty State.
- **AI assists, system governs** — AI может подготовить текст и handoff, но использует только системные варианты, токены и правила.

### Связанные спецификации

- [Button](../actions/button.md) — primary и secondary action.
- [Link](../actions/link.md) — справочные и навигационные действия.
- [Table](../data-display/table.md) — empty state внутри таблиц.
- [Alert](alert.md) — системные ошибки и предупреждения.
- [Skeleton](skeleton.md) и [Spinner](spinner.md) — loading states.

---

## 2. Anatomy

```text
[media]

Title
Description

[Primary action] [Secondary action]
```

| Слот | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер Empty State внутри заданной области. |
| `media` | опционально | Иконка или иллюстрация, поддерживающая смысл состояния. |
| `title` | да | Короткая причина отсутствия содержимого. |
| `description` | рекомендуется | Контекст, последствие или следующий шаг. |
| `primaryAction` | условно | Основное действие восстановления или старта сценария. |
| `secondaryAction` | опционально | Сброс фильтров, справка, запрос доступа или альтернативный путь. |

### Правила слотов

- `title` обязателен всегда.
- `description` можно убрать только в компактном контейнере, если title и action уже объясняют состояние.
- `media` не должен быть единственным носителем смысла.
- Основное действие должно быть одно. Два primary action требуют пересмотра сценария.
- Secondary action не должен конкурировать с primary action по визуальному весу.

---

## 3. Types / Variants

Figma component set использует variant property `type`.

| `type` | Когда использовать | Типовой следующий шаг |
| --- | --- | --- |
| `no-data` | Объекты еще не созданы или раздел пуст. | Создать первый объект, импортировать данные. |
| `no-results` | Поиск или фильтры не нашли совпадений. | Изменить запрос, сбросить фильтры. |
| `no-access` | Пользователь не может видеть содержимое из-за прав. | Запросить доступ, связаться с владельцем. |
| `error` | Данные не удалось получить после завершения запроса. | Повторить запрос, открыть детали ошибки. |
| `first-time` | Пользователь впервые открывает сценарий. | Начать настройку, пройти onboarding step. |

### Примеры контента

| `type` | Title | Description | Action |
| --- | --- | --- | --- |
| `no-data` | `Проектов пока нет` | `Создайте первый проект, чтобы начать работу.` | `Создать проект` |
| `no-results` | `Ничего не найдено` | `Измените запрос или сбросьте фильтры.` | `Сбросить фильтры` |
| `no-access` | `Нет доступа` | `Запросите доступ у владельца пространства.` | `Запросить доступ` |
| `error` | `Не удалось загрузить данные` | `Проверьте соединение и попробуйте снова.` | `Повторить` |
| `first-time` | `Настройте рабочее пространство` | `Добавьте команду и подключите первый источник данных.` | `Начать настройку` |

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила компоновки |
| --- | --- | --- |
| `s` | Компактные области: таблица, drawer, sidebar, небольшая карточка. | Минимальный media или без media, короткий title, одно действие. |
| `m` | Стандартный empty state внутри секции. | Title, description, опциональный media, 1-2 действия. |
| `l` | Крупная контентная область страницы. | Более заметный media, расширенное описание, явное primary action. |
| `xl` | Full-page или first-time сценарий. | Основной контент экрана, крупная иерархия, onboarding/recovery action. |

### Правила размеров

- Размер отвечает за плотность и масштаб композиции, а не за новый смысл состояния.
- Не увеличивайте typography scale вручную, если нужного размера нет в Figma.
- В плотных интерфейсах используйте `s` или `m`, чтобы Empty State не ломал scanning flow.
- `xl` допустим только когда пустое состояние является главным содержимым страницы.

---

## 5. States

Empty State описывает результат состояния данных. Интерактивные состояния принадлежат вложенным Button, Link или Icon Button.

| Состояние | Где возникает | Поведение |
| --- | --- | --- |
| `empty` | Запрос успешен, объектов нет. | Показать `type=no-data` и действие создания, если оно доступно. |
| `no-results` | Поиск или фильтры вернули пустой набор. | Сохранить query/filter context и предложить сброс или изменение запроса. |
| `restricted` | Доступ ограничен. | Показать `type=no-access`, не раскрывать закрытые данные. |
| `failed` | Запрос завершился ошибкой. | Показать `type=error`, сохранить контекст и дать retry, если возможно. |
| `not-started` | Сценарий еще не настроен. | Показать `type=first-time` и первый безопасный шаг. |

### Владение состояниями

- `loading` не является состоянием Empty State.
- `hover`, `focus`, `active`, `disabled` и `loading` принадлежат вложенным действиям.
- Если действие недоступно, Empty State должен объяснить причину, а не показывать disabled primary action без контекста.

---

## 6. Поведение

### Размещение

- В Table Empty State заменяет строки, но не скрывает header, toolbar и фильтры.
- В Card или Section Empty State занимает body area и наследует alignment контейнера.
- На странице Empty State может быть main landmark content, если другого основного контента нет.

### Действия

- Primary action запускает наиболее ожидаемый путь восстановления.
- Secondary action используется для сброса фильтров, справки, запроса доступа или альтернативного пути.
- Не показывайте действие, если пользователь не может его выполнить.
- Retry в `type=error` должен повторять тот же запрос, а не перезагружать все приложение без необходимости.

### Search и filters

- `type=no-results` сохраняет введенный запрос и активные фильтры.
- Сброс фильтров должен быть явным действием, а не автоматическим side effect.
- Если доступны рекомендации по поиску, они должны быть частью description или secondary content, а не новым вариантом компонента.

### Responsive behavior

- Текст переносится раньше, чем действия переходят в вертикальный стек.
- На узких контейнерах действия можно расположить вертикально.
- `media` можно скрыть в `size=s`, если он мешает чтению или сканированию.

---

## 7. Accessibility

Empty State следует [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Heading | Если Empty State является главным содержимым региона, используйте настоящий heading. |
| Region semantics | Контейнер должен сохранять понятное имя региона: таблица, список, раздел, страница. |
| Decorative media | Декоративный `media` получает `aria-hidden="true"`. |
| Meaningful media | Значимая иконка не дублирует title; смысл должен быть доступен текстом. |
| Actions | Вложенные Button и Link следуют своим accessibility specs. |
| Error announcement | Динамический `type=error` объявляется через уместный live region. |

### Accessibility checklist

- [ ] Title видим и доступен программно.
- [ ] Description объясняет состояние без опоры на цвет или иллюстрацию.
- [ ] Action labels конкретны: `Создать проект`, а не `Создать`.
- [ ] Keyboard users могут добраться до всех доступных действий.
- [ ] `no-access` не раскрывает приватные данные.
- [ ] `error` не зацикливает пользователя на бесконечном retry без объяснения.

---

## 8. Design Tokens

Перед использованием токенов сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Illustration foreground | `empty-state/illustration/foreground` | Основной цвет иконки или иллюстрации. | `icon/muted` |
| Illustration accent | `empty-state/illustration/accent` | Акцентный цвет иллюстрации. | `icon/brand` |
| Title foreground | `empty-state/title/foreground` | Цвет заголовка. | `text/primary` |
| Description foreground | `empty-state/description/foreground` | Цвет описания. | `text/secondary` |
| Action foreground | `empty-state/action/foreground` | Цвет текстового secondary action или link-like action. | `text/brand` |

### Token gaps

- Нет component tokens для `root` gap, action gap, media size и responsive spacing.
- Нет отдельных component tokens для `type=error`, `type=no-access` и `type=first-time`; используйте существующие foreground tokens и системные компоненты действия.
- До появления component spacing tokens используйте semantic spacing scale из Foundation и фиксируйте mapping в handoff.
- Не создавайте локальные значения цвета, размера или spacing без system review.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Type | `type` | Только `no-data`, `no-results`, `no-access`, `error`, `first-time`. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Title | `title` | Обязательный string или heading slot. |
| Description | `description` | Опциональный string или rich text slot. |
| Media | `media` | Опциональный icon/illustration slot. |
| Primary action | `primaryAction` | Button contract или action slot. |
| Secondary action | `secondaryAction` | Link или secondary Button contract. |
| Trigger condition | `triggerCondition` | Условие данных, при котором показывается Empty State. |
| Retry behavior | `onRetry` | Для `type=error`, если повторный запрос возможен. |

### Contract rules

- `title` обязателен для всех типов.
- `type` и `size` должны соответствовать Figma variants.
- `primaryAction` и `secondaryAction` используют системные Button или Link.
- `type=no-results` должен получать контекст поиска или фильтров из родительского сценария.
- `type=no-access` не должен принимать приватные данные для отображения.

---

## 10. Handoff notes

В handoff нужно передать:

- `type` и `size`;
- title, description и action labels;
- условие данных, которое включает Empty State;
- является ли `media` декоративным или значимым;
- поведение primary и secondary actions;
- правила сохранения search/filter context;
- retry behavior для `type=error`;
- responsive layout rules;
- token gaps и временные semantic mappings.

### Acceptance criteria

- Empty State объясняет, почему содержимое отсутствует.
- Empty State предлагает следующий шаг, если восстановление возможно.
- `type=no-results` сохраняет query и активные фильтры.
- `type=error` дает retry, если запрос можно повторить.
- `type=no-access` не раскрывает приватные данные.
- Вложенные действия соответствуют Button или Link specs.
- Используются только задокументированные tokens или явно отмеченные token gaps.

---

## 11. AI usage rules

- AI может использовать только `type`: `no-data`, `no-results`, `no-access`, `error`, `first-time`.
- AI может использовать только `size`: `s`, `m`, `l`, `xl`.
- AI не должен использовать Empty State для loading; нужно предложить Skeleton или Spinner.
- AI должен указывать trigger condition, title, description и следующий шаг.
- AI должен сохранять search/filter context для `type=no-results`.
- AI не должен придумывать новые props, variants, illustrations или token names.
- AI должен помечать отсутствующие token mappings, непонятное retry behavior или неописанные права доступа как `Needs system review`.
- AI может подготовить draft copy, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Новый список проектов пуст. | `type=no-data`, `size=m`, title `Проектов пока нет`, primary action `Создать проект`. |
| Поиск в таблице не дал результатов. | `type=no-results`, сохранить query, secondary action `Сбросить фильтры`. |
| Пользователь открыл закрытый раздел. | `type=no-access`, объяснить ограничение, дать `Запросить доступ`, если процесс существует. |
| Ошибка загрузки списка. | `type=error`, сохранить текущую навигацию, дать `Повторить`. |
| Первый запуск настройки. | `type=first-time`, `size=l` или `xl`, action `Начать настройку`. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Empty State с двумя primary actions. | Нарушена иерархия действий. |
| Иллюстрация занимает больше внимания, чем причина и действие. | Компонент перестает помогать восстановлению. |
| `type=no-results` автоматически сбрасывает фильтры. | Пользователь теряет контекст без явного действия. |
| `type=error` без retry и объяснения. | Пользователь не понимает, что делать дальше. |

---

## 13. Anti-patterns

- Показывать только `Нет данных`.
- Использовать Empty State во время загрузки.
- Скрывать filters, search query или table header в `type=no-results`.
- Делать иллюстрацию единственным объяснением состояния.
- Создавать кастомный clickable text вместо Button или Link.
- Добавлять новый `type`, например `success` или `celebration`, без system review.
- Использовать локальные цвета и spacing вместо component tokens или явных token gaps.
