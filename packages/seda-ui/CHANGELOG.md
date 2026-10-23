# Изменения @seda-ai/ui

## Unreleased — поставка библиотеки

- Добавлены build/prepack, ESM с явными `.js` specifiers, declarations, CSS и манифест SHA-256. Tarball ограничен публичными build artifacts.
- React остаётся внешним peer. Сборка не включает React внутрь библиотеки.
- **Подключение стилей:** теперь импортируйте `@seda-ai/ui/styles.css` явно в entry приложения. JS entry не импортирует CSS и поддерживает загрузку при SSR. Для старого source alias, полагавшегося на неявные стили, требуется добавить этот import. В Lab он уже есть.
- Измерения Button используют browser layout effect с SSR-safe fallback. Исправлен intrinsic min-width, из-за которого меняющийся скрытый label увеличивал loading-кнопку вне Lab.
- Добавлен verifier отдельной установки tarball в React 18/19: exports/types, SSR/hydration, CSS, linked controls и loading.
- Тестовый Playwright обновлён после подтверждённого audit finding. Публикация в npm registry не выполнялась; пакет остаётся private/experimental.
