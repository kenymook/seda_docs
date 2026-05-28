# Top Bar / Navbar

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Top Bar — верхняя навигационная панель приложения или сайта. Она содержит product identity, основные разделы, глобальные действия и точки входа в Search, Notification Center, profile menu или settings. Top Bar задает стабильный верхний слой навигации, но не должен становиться контейнером для всех действий экрана.

Top Bar отличается от Sidebar: Top Bar подходит для плоской или короткой навигации и глобальных действий, Sidebar — для сложной иерархии продукта. Top Bar отличается от Toolbar: Toolbar управляет текущим view или выбранным объектом, Top Bar управляет глобальным контекстом приложения.

### Когда использовать

**Используйте** — когда интерфейсу нужен постоянный верхний navigation layer:

- продукт с 3-7 ключевыми разделами;
- сайт или docs portal с простой верхней навигацией;
- приложение, где Sidebar дополняется глобальным header;
- глобальные действия: search, notifications, help, profile, workspace switcher;
- mobile layout, где navigation сворачивается в menu trigger.

**Не используйте:**

- Для сложной многоуровневой навигации как единственный navigation component — используйте [Sidebar](../navigation/sidebar.md).
- Для действий, относящихся только к текущей таблице, карточке или editor canvas — используйте Toolbar или [Dropdown / Menu](../overlays-layout/dropdown-menu.md).
- Для переключения локальных sections внутри страницы — используйте [Tabs](../navigation/tabs.md).
- Для breadcrumb trail — используйте [Breadcrumbs](../navigation/breadcrumbs.md).
- Для постоянного feedback или status banner — используйте [Alert](../feedback/alert.md).

### Основные принципы

- **Только глобальный контекст** — Top Bar содержит только глобальные nav items и actions.
- **Identity стабилен** — logo/product title остается предсказуемым anchor для пользователя.
- **Активный раздел видим** — текущий section должен быть понятен без угадывания.
- **Responsive collapse описан явно** — порядок скрытия nav, search и actions должен быть зафиксирован.
- **Skip link идет первым** — keyboard users должны иметь быстрый переход к main content.
- **AI сохраняет navigation model** — AI не должен добавлять разделы, действия или collapse rules без product/navigation review.

### Связанные спецификации

- [Sidebar](../specs/navigation/sidebar.md)
- [Tabs](../specs/navigation/tabs.md)
- [Breadcrumbs](../specs/navigation/breadcrumbs.md)
- [Dropdown / Menu](../specs/overlays-layout/dropdown-menu.md)
- [Search](../specs/overlays-layout/search.md)
- [Notification Center](../specs/overlays-layout/notification-center.md)
- [Avatar](../specs/data-display/avatar.md)

---

## 2. Anatomy

```text
+--------------------------------------------------------------+
| [Logo] Product   [Nav 1] [Nav 2] [Nav 3]     [Search][Bell][Avatar] |
+--------------------------------------------------------------+
  identity       primary navigation               global actions
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | да | Контейнер Top Bar |
| `skipLink` | рекомендуется | Первый keyboard target для перехода к main content |
| `logo` | да | Brand/product mark или product title |
| `title` | опционально | Current product, workspace или title, если logo недостаточно |
| `primaryNav` | условно | Глобальные navigation links |
| `navItem` | условно | Отдельная navigation link или trigger |
| `activeIndicator` | условно | Визуальный/current page indicator |
| `searchAction` | опционально | Search button или compact search entry |
| `globalActions` | опционально | Notifications, help, settings, create, theme |
| `profileAction` | опционально | Avatar/profile menu trigger |
| `workspaceSwitcher` | опционально | Current workspace/org switcher |
| `mobileMenuTrigger` | условно | Открывает collapsed navigation на узких экранах |

### Правила anatomy

- Logo/title и хотя бы один navigation или global action обязательны.
- Primary navigation items должны быть ограниченными и стабильными.
- Global actions должны иметь accessible labels.
- Avatar/profile action должен открывать menu, а не неожиданно переводить пользователя.
- Mobile menu trigger появляется только когда navigation свернута.

---

## 3. Types / Variants

### Варианты контейнера

| Вариант | Описание | Когда использовать |
| --- | --- | --- |
| `app-bar` | Постоянный application header | Product UI с global actions |
| `site-navbar` | Навигация сайта, marketing или docs | Public site или docs portal |
| `page-header` | Header в потоке страницы | Content pages без sticky global bar |
| `transparent` | Прозрачный header поверх hero/media | Только если контраст остается доступным |
| `with-sidebar` | Top Bar в паре с Sidebar | Сложные продукты с global header и side navigation |

### Плотность навигации

| Вариант | Описание | Правило |
| --- | --- | --- |
| `nav-only` | Logo плюс nav links | Простой сайт или продукт |
| `actions-only` | Logo/title плюс global actions | Sidebar владеет навигацией |
| `nav-and-actions` | Nav плюс search/profile/actions | Дефолтный application layout |
| `workspace` | Workspace switcher заметен | Multi-tenant product context |

---

## 4. Sizes

Размер Top Bar управляет высотой, плотностью, расстоянием между nav items и action target size. Размеры Icon/Button остаются ответственностью дочерних компонентов.

| Size | Высота | Когда использовать |
| --- | --- | --- |
| `compact` | Плотный header | Data-heavy продукты и desktop-only tools |
| `medium` | Дефолтный header | Большинство application layouts |
| `large` | Просторный header | Sites, docs portals, onboarding surfaces |

### Правила размеров

- Используйте `medium` по умолчанию.
- Используйте `compact` только когда actions и nav labels остаются читаемыми.
- Используйте `large` для site/docs contexts, где navigation менее плотная.
- Touch targets в actions остаются минимум 44px там, где ожидается touch.
- Не масштабируйте font size от viewport; вместо этого сворачивайте content.

---

## 5. States

### Состояния контейнера

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `default` | Базовый Top Bar | Surface и border видимы как задумано |
| `elevated` | Top Bar перекрывает content или страница прокручена | Используется elevated surface или shadow treatment |
| `transparent` | Top Bar расположен поверх media/hero | Контраст должен быть проверен |
| `mobile-collapsed` | Navigation скрыта за trigger | Mobile menu trigger видим |
| `mobile-open` | Collapsed navigation открыта | Focus и close behavior описаны |

### Состояния элемента

| State | Значение | Визуальное изменение |
| --- | --- | --- |
| `default` | Неактивный item | Default foreground/surface |
| `hover` | Pointer hover | Hover foreground/surface |
| `active` | Нажатый item | Active surface |
| `selected` | Текущая page/section | Selected foreground/surface и current indicator |
| `focus` | Keyboard focus | Видимый focus ring |
| `disabled` | Временно недоступен | Disabled foreground/icon и нет activation |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| `selected` + `hover` | да | Selected meaning остается видимым |
| `elevated` + `mobile-collapsed` | да | Scrolled mobile header допустим |
| `transparent` + low contrast | нет | Нужно переключить surface/foreground treatment |
| `disabled` + `active` | нет | Disabled item не активируется |

---

## 6. Behavior

### Навигационное поведение

- Logo обычно ведет на product home или dashboard; исключения нужно документировать.
- Navigation items ведут к глобальным destinations и используют current-page state.
- Top Bar не должен сбрасывать локальные filters или page state, если navigation этого не требует.
- Workspace switcher меняет глобальный context и должен описывать loading/error behavior.
- Profile/avatar action открывает menu с profile/settings/sign out actions.

### Responsive behavior

- Collapse order должен быть явным: secondary nav, labels, search input, затем nav list.
- Primary actions, которые остаются видимыми на mobile, должны быть ограничены наиболее важными global actions.
- Collapsed nav может открывать Sidebar overlay, Drawer или menu; выберите один pattern и задокументируйте его.
- При открытии mobile menu focus переходит в menu и возвращается на trigger при закрытии.
- Content не должен перекрываться fixed Top Bar без layout offset.

### Scroll behavior

- Sticky Top Bar может переходить в `elevated` после scroll.
- Transparent variant должен переключаться на читаемый surface или foreground treatment поверх разного content.
- Не скрывайте Top Bar при scroll, если продукт явно не задает reveal behavior.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Перемещение по skip link, logo, nav и actions |
| `Enter` / `Space` | Активация focused buttons и menu triggers |
| `Escape` | Закрыть mobile menu или открытый overlay, которым владеет Top Bar |
| `Arrow keys` | Опционально только для menu-like nav groups; иначе обычный tab order |

---

## 7. Accessibility

Top Bar следует [foundation/accessibility.md](../../foundation/accessibility.md), [foundation/content.md](../../foundation/content.md) и navigation semantics.

| Требование | Правило |
| --- | --- |
| Semantic region | Используйте `<header>` для page/application header |
| Navigation | Используйте `<nav>` с понятным accessible label |
| Current item | Используйте current-page semantics для active destination |
| Skip link | Добавляйте skip link перед navigation, если Top Bar глобальный |
| Action labels | Icon-only actions требуют accessible labels |
| Mobile menu | Trigger показывает expanded state и связь с controlled region |
| Focus management | Collapsed menu возвращает focus на trigger при закрытии |
| Contrast | Transparent/elevated variants должны проходить contrast requirements |
| Landmark noise | Не создавайте несколько unlabeled nav landmarks |

### Accessibility checklist

- [ ] Header и navigation landmarks подписаны.
- [ ] Skip link первый в keyboard order, если применим.
- [ ] Active nav item доступен программно.
- [ ] Icon actions имеют accessible names.
- [ ] Mobile menu можно открыть, пройти клавиатурой и закрыть.
- [ ] Focus return определен для profile/search/notification overlays.
- [ ] Transparent variant сохраняет контраст на всех backgrounds.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`. Они записаны как component paths, чтобы не путать их с semantic token references.

| Роль | Component path | Semantic |
| --- | --- | --- |
| Surface default | top-bar surface default | `surface/base` |
| Surface elevated | top-bar surface elevated | `surface/raised` |
| Border default | top-bar border default | `border/default` |
| Link foreground default | top-bar link foreground default | `text/secondary` |
| Link foreground hover | top-bar link foreground hover | `text/primary` |
| Link foreground active | top-bar link foreground active | `text/primary` |
| Logo foreground | top-bar logo foreground | `text/primary` |
| Title foreground | top-bar title foreground | `text/primary` |
| Focus ring | top-bar focus ring | `focus/ring` |
| Item surface default | top-bar item surface default | `color/transparent` |
| Item surface hover | top-bar item surface hover | `container/neutral/hover` |
| Item surface active | top-bar item surface active | `container/neutral/pressed` |
| Item surface selected | top-bar item surface selected | `container/neutral/selected` |
| Item foreground default | top-bar item foreground default | `text/secondary` |
| Item foreground hover | top-bar item foreground hover | `text/primary` |
| Item foreground selected | top-bar item foreground selected | `text/primary` |
| Item foreground disabled | top-bar item foreground disabled | `status/disabled/text` |
| Item icon default | top-bar item icon default | `icon/tertiary` |
| Item icon hover | top-bar item icon hover | `icon/primary` |
| Item icon selected | top-bar item icon selected | `icon/primary` |
| Item icon disabled | top-bar item icon disabled | `status/disabled/icon` |

### Token gaps

- Сейчас у Top Bar нет component tokens для height, horizontal padding, nav gap, action gap, shadow, sticky offset, mobile breakpoint и transparent foreground overrides.
- Используйте foundation spacing, elevation, motion и child component tokens, пока не появятся Top Bar-specific layout tokens.
- Не придумывайте `--topbar-*` или новые Top Bar token paths в specs, code, Figma или AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Variant | `variant` | `app-bar`, `site-navbar`, `page-header`, `transparent`, `with-sidebar` |
| Size | `size` | `compact`, `medium`, `large` |
| Sticky behavior | `sticky` | Boolean или scroll behavior config |
| Elevated state | `elevated` | Управляется scroll или surface context |
| Logo | `logo` | Mark, text или composed slot |
| Title | `title` | Optional product/page/workspace title |
| Nav items | `navItems` | Global destinations |
| Active item | `activeId` / `currentPath` | Current destination |
| Actions | `actions` | Search, notifications, help, settings, create |
| Profile | `profileAction` | Avatar/menu trigger |
| Workspace | `workspaceSwitcher` | Optional global context switcher |
| Mobile menu | `mobileMenuOpen` | Collapsed navigation state |
| On navigate | `onNavigate` | Optional router integration |

### Contract rules

- Nav item требует `id`, `label`, destination и active matching rule.
- Icon-only action требует accessible label.
- Global action должен определить target overlay или command.
- Mobile collapse behavior должен описать, куда уходят скрытые nav items.
- Transparent variant требует contrast validation rules.

---

## 10. Handoff notes

В handoff нужно передать:

- variant, size, sticky/elevated behavior и responsive collapse rules;
- logo/title behavior и home destination;
- nav item schema: label, href/route, active rule, disabled state;
- global actions и их target components: Search, Notification Center, Dropdown / Menu, profile menu;
- mobile menu pattern и focus return behavior;
- scroll/elevation behavior и layout offset;
- accessibility requirements для landmarks, skip link, active item и icon action labels;
- token mapping для surface, border, nav/link/item states, logo, title, icon и focus;
- token gaps для height, spacing, shadow, breakpoints и transparent overrides.

### Acceptance criteria

- Top Bar понятно показывает global navigation или global actions.
- Active destination видим и доступен программно.
- Keyboard users могут перейти к main content и пройти все actions.
- Mobile collapsed navigation доступна, закрывается и возвращает focus.
- Sticky/elevated behavior не перекрывает content неожиданно.
- Icon-only actions имеют accessible names.
- Компонент использует документированные Top Bar component paths и semantic tokens.
- AI-generated drafts не добавляют неподдержанные nav items, actions, breakpoints или token names.

---

## 11. AI usage rules

- AI может использовать Top Bar только для global navigation и global actions.
- AI должен рекомендовать Sidebar для глубокой navigation hierarchy и Toolbar для локальных view/object actions.
- AI не должен придумывать product sections, routes, action targets, breakpoints, token paths или profile menu contents.
- AI должен проверять `tokens.json` перед изменением Top Bar token mappings.
- AI должен помечать missing active state, missing accessible labels, undefined mobile collapse, contrast risk в transparent variant или неясную границу global/local actions как `Needs system review`.
- AI может подготовить nav item schemas, Handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Examples

### Корректно

| Сценарий | Использование |
| --- | --- |
| Docs portal | `variant=site-navbar`, logo, docs nav, search action |
| Product with Sidebar | `variant=with-sidebar`, logo/workspace, search, notifications, profile |
| Simple SaaS app | `variant=app-bar`, 4-5 nav items и global actions |
| Mobile layout | nav сворачивается в menu trigger; search/profile остаются доступными |
| Hero page | `variant=transparent` с contrast validation и fallback surface |

### Требует review

| Сценарий | Причина |
| --- | --- |
| Top Bar содержит page-specific table actions | Это Toolbar или local actions |
| Десять navigation links помещаются только при уменьшении текста | Нужно пересмотреть navigation IA/collapse |
| Transparent Top Bar поверх непредсказуемого media | Contrast risk |
| AI добавляет route "Billing" без product requirement | Придуманная navigation |
| Mobile menu открывается, но focus остается за overlay | Accessibility gap |

---

## 13. Anti-patterns

- Использовать Top Bar как единственную навигацию для глубокой product hierarchy.
- Складывать все page actions в global actions.
- Скрывать active state.
- Использовать icon-only actions без accessible labels.
- Оставлять transparent variant поверх low-contrast content.
- Уменьшать текст вместо описанного responsive collapse.
- Создавать raw colors, spacing или недокументированные token names для header states.
