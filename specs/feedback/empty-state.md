# Empty State

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Empty State — экран или блок, отображаемый при отсутствии данных. Объясняет причину и направляет пользователя к первому действию.

### When to use

**Use** — в таблицах без результатов поиска; в разделах без созданных объектов; при ошибке загрузки; при отсутствии прав доступа.

**Don't use:**
- Просто «Нет данных» без объяснения и действия — это тупик
- Для временных состояний загрузки — используйте **Skeleton**

### Core principles

- **Объясните причину** — «Вы ещё не создали ни одного проекта», не просто «Пусто»
- **Предложите действие** — кнопка «Создать первый проект» убирает барьер
- **Иллюстрация — не обязательна** — но помогает установить тон
- **Текст следует content foundation** — title, description и action пишутся по `foundation/content.md`

---

## 2. Anatomy

```
     [illustration]
   
     Title
     Description text
   
     [Primary action]  [Secondary action]
```

| Slot | Обязательность | Описание |
|---|---|---|
| `illustration` | optional | SVG-иллюстрация или иконка |
| `title` | required | Краткое объяснение состояния |
| `description` | optional | Уточняющий текст с контекстом |
| `action` | optional | Кнопка или ссылка для первого действия |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `no-data` | Данных нет. Первый шаг пользователя |
| `no-results` | Поиск не дал результатов |
| `no-access` | Нет прав доступа |
| `error` | Ошибка загрузки данных |
| `first-time` | Онбординговый первый запуск |

### Content

Следуйте `foundation/content.md`.

| Тип | Title | Description | Action |
|---|---|---|---|
| `no-data` | `Проектов пока нет` | `Создайте первый проект, чтобы начать работу` | `Создать проект` |
| `no-results` | `Ничего не найдено` | `Измените запрос или сбросьте фильтры` | `Сбросить фильтры` |
| `no-access` | `Нет доступа` | `Запросите доступ у владельца проекта` | `Запросить доступ` |
| `error` | `Не удалось загрузить данные` | `Проверьте соединение и попробуйте снова` | `Повторить` |

---


---

## States

Empty State variants describe the empty condition: 
o-data, 
o-results, 
o-access, error, irst-time. Interactive states belong to nested actions. Loading should use Skeleton or Spinner instead of Empty State.

---


---

## Accessibility

Use a real heading for the title when the empty state is the main content of a region. Illustration is decorative unless it communicates unique meaning. Primary action must be reachable by keyboard and have a clear label.

---

## 4. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--empty-illustration-color` | Цвет иллюстрации | `text/tertiary` | `text/tertiary` |
| `--empty-title` | Заголовок | `text/primary` | `text/primary` |
| `--empty-description` | Описание | `text/secondary` | `text/secondary` |
