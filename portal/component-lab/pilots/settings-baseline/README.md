# SEDA settings form baseline

Диагностический стенд исходных Button, IconButton и TextField. Он импортирует текущий исходный React-пакет, оригинальный `styles.css` и `portal/portal-tokens.js`. Компоненты и их стили не исправляются. Исходное состояние этапа 1 связано с commit `354e19adc00605c422033a53ed1dd81dc33259ae`.

Стенд предназначен для размещения в `portal/component-lab/pilots/settings-baseline/`. Из этой папки корень репозитория определяется автоматически. В другом расположении задайте `SEDA_REPO_ROOT`, указывающий на корень snapshot SEDA.

## Запуск

Требуется Node.js 20.11 или новее. Используйте зафиксированный lockfile.

```sh
npm ci
npm run build
npm run serve
```

Откройте `http://127.0.0.1:5183/`. Сервер слушает только localhost. Порт можно изменить через `SEDA_BASELINE_PORT`.

## Диагностические измерения

```sh
npx playwright install chromium --only-shell
npm run measure
```

Сервер должен быть запущен. `npm run measure` сначала выполняет `premeasure` и пересобирает bundle. При другом порте задайте `SEDA_BASELINE_URL`. Измерения и скриншоты сохраняются в `.diagnostics/` и исключены из Git. Можно задать `SEDA_BASELINE_OUTPUT` для иной папки. Это наблюдения текущей реализации, а не набор тестов, подтверждающих соответствие будущему контракту.

## Условия baseline

- Начальный профиль: Light, размер `m`, плотность компоновки regular.
- Все четыре размера и обе темы доступны для сравнения.
- Host typography явно задана как `16px/24px system-ui, sans-serif`; компоненты сохраняют собственный `font-family` из пакета.
- Глобальный reset `box-sizing` не применяется; исходный CSS компонентов не переопределяется.
- Иконка помощи передана явным SVG 16×16. Рядом расположен поясняющий текст, доступное имя задано через `aria-label`. Отдельный Tooltip не реализуется.
- Button использует явно заданный `variant="primary"`, IconButton использует собственное значение по умолчанию, чтобы отразить фактический baseline.
- TextField контролируется состоянием формы. Отдельные режимы демонстрируют `errorText`, `state="error"`, `state="disabled"`, `disabled` и `readOnly`.
- Loading и ошибка включаются вручную переключателями стенда. Целевой сценарий формы из `settings-profile.json` пока не реализован: это исходный диагностический пример.
- Host layout: оболочка поля и действий до 520 px; от поля до действий 24 px; gap действий 12 px; gap иконки и пояснения 8 px.
- Native form submit считает отправки. Серверного сохранения, бизнес-валидации, общего resolver профилей и полного validator в стенде нет.
- Обработчик onSubmit намеренно не содержит общего saving guard. Диагностика сравнивает mouse click по Button, Enter из input и прямой `form.requestSubmit()` при loading, чтобы отделить защиту самой Button от ответственности формы.
- Portal resolver загружает исходный `tokens.json`. Отсутствующие component CSS variables остаются исходными fallback, без добавления искусственного mapping.

## Воспроизводимость

Harness: React 18.3.1, React DOM 18.3.1, esbuild 0.25.5, Playwright 1.51.1. Build транспилирует исходный код для baseline и не заменяет проверку TypeScript. Точная версия браузера, host environment и viewport записываются в `measurements.json` при запуске.

`referenceCommit` обозначает эталон сравнения. Для семи ключевых файлов (Button.tsx, IconButton.tsx, TextField.tsx, types.ts, styles.css, tokens.json, portal/portal-tokens.js) сборка вычисляет фактические Git blob SHA и сравнивает их с SHA эталонного commit. Результат записывается в `dist/build-metadata.json` и последующие `measurements.json`. Заголовок стенда сообщает, совпали ли эти семь файлов с эталоном; это не проверка всей рабочей копии.

Перед измерением проверяются неизменность этих исходников после сборки, SHA-256 локальных JS/CSS bundle и совпадение с bundle, реально отданным сервером. Аналогично проверяются отданные сервером tokens.json и portal resolver. Несоответствие прерывает измерение. Сборка из изменённого checkout разрешена, но её metadata явно показывает отличающиеся файлы и не выдаёт их за эталон.
