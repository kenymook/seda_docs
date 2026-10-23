# @seda-ai/ui

React-компоненты SEDA для веб-приложений и веб-интерфейсов в desktop shell. Пакет пока private/experimental: production-ready статус всей библиотеки не заявляется.

## Сборка и подключение

```sh
npm ci
npm run typecheck
npm run build
npm pack
```

`prepack` собирает ESM, declarations и CSS. Архив содержит только `dist`, README и package manifest; React остаётся peer dependency приложения.

В приложении:

```tsx
import { Button, TextField, Select } from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';
```

CSS импортируется явно один раз в entry приложения. Импорт JS не загружает CSS и не обращается к DOM, поэтому пакет можно импортировать при SSR. Если ранее использовался alias на `src/index.ts` с неявным подключением стилей, добавьте явный CSS import. Лаборатория уже использует его. Автоматическая упаковка React запрещена: хост предоставляет одну совместимую копию.

## Проверка поставки

```sh
npm run verify:package
```

Verifier запускает настоящий `npm pack`, устанавливает архив в отдельные приложения React 18/19, проверяет exports, declarations (NodeNext), SSR/hydration, CSS и интерактивность в Chromium. Он не использует alias на исходники. Результаты и приложения находятся в `.diagnostics-package/`. Для установленного Chromium задайте `SEDA_BROWSER_EXECUTABLE`; без него нужен browser runtime Playwright.

Сборка повторяется в verifier; сравниваются SHA-256 артефактов. `dist/manifest.json` содержит хеши выходных файлов. Архив не публикуется в npm registry.

## Границы зрелости

13 exports не означают 13 готовых production-компонентов. Семь контролов имеют исполняемые контракты в соседнем `seda-contracts`; Button/TextField/Select/Checkbox/Radio/Toggle/IconButton проверяются в Lab. Общие параметры и component-token темы пока подключаются там через compiler/web bridge. Проверка поставки отдельно проверяет базовую библиотеку, без CSS лаборатории.

Следующие обязательные направления: единые профили и темы в любом consumer, полная матрица взаимодействий и доступности, навигация/overlays/data-компоненты, документация и политика совместимости. WCAG-сертификация, Firefox/WebKit, screen readers и native desktop shell этими тестами не подтверждаются.
