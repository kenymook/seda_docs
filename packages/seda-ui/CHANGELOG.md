# Изменения @seda-ai/ui

## Unreleased — навигация рабочих панелей

- Добавлен experimental Tabs: line/pill, inherited size, controlled/uncontrolled selection, manual/automatic activation, RTL arrows, disabled skip, Home/End и focus repair при изменении items.
- Panels остаются mounted; hidden сохраняет локальный draft. Empty/all-disabled list имеет ноль доступных tabs. Нет lazy/unmount/close/vertical API.
- Цвета Tabs генерируются из существующих component tokens, геометрия использует общий size profile; missing used component token блокирует build.
- Installed tarball proof расширен отдельным Tabs consumer на React 18/19 с SSR/hydration и 64 совокупными theme/size/variant/width комбинациями.

## Ранее — публичная конфигурация

- Snapshot loading Button теперь сохраняет padding: короткая кнопка не увеличивается при S→XL, новый padding применяется после завершения.
- Добавлены SedaProvider, useSedaConfiguration, наследование theme/controlSize, вложенные scopes и приоритет явного size. Standalone defaults light/m сохраняются; context snapshots frozen.
- Общие профили и component-token темы генерируются при build из canonical tokens/system, без CSS лаборатории. Добавлены profiles.json и обязательная проверка state roles.
- Базовая геометрия Button/IconButton/TextField/Select/Checkbox/Radio/Toggle согласована с системой и вне provider. Добавлены font fallback и устойчивые label gaps в grid.
- Аудит API различает literal defaults и standalone fallback через Context; источник fallback входит в provenance. Исправлена ложная неоднозначность alias между token leaf и одноимённой веткой; два настоящих leaf остаются ошибкой.
- При сборке из монорепозитория используются соседние tokens/system/resolver; tarball consumer остаётся самодостаточным. Доступны Light/Dark и regular S/M/L/XL. Остальные режимы не объявлены проверенными.

## Ранее — поставка библиотеки

- Добавлены build/prepack, ESM с явными `.js` specifiers, declarations, CSS и манифест SHA-256. Tarball ограничен публичными build artifacts.
- React остаётся внешним peer. Сборка не включает React внутрь библиотеки.
- **Подключение стилей:** теперь импортируйте `@seda-ai/ui/styles.css` явно в entry приложения. JS entry не импортирует CSS и поддерживает загрузку при SSR. Для старого source alias, полагавшегося на неявные стили, требуется добавить этот import. В Lab он уже есть.
- Измерения Button используют browser layout effect с SSR-safe fallback. Исправлен intrinsic min-width, из-за которого меняющийся скрытый label увеличивал loading-кнопку вне Lab.
- Добавлен verifier отдельной установки tarball в React 18/19: exports/types, SSR/hydration, CSS, linked controls и loading.
- Тестовый Playwright обновлён после подтверждённого audit finding. Публикация в npm registry не выполнялась; пакет остаётся private/experimental.
