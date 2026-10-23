# SEDA AI Lab 2.0 — рабочая область приложения

Лаборатория поведения дизайн-системы для **веб- и десктоп-приложений**. В сохранённую композицию Lab 2.0 встроен рабочий интерфейс с постоянной навигацией «Проекты / Настройки / Команда». Узкие ширины рассматриваются как ограниченное пространство окна приложения; таблицы прокручиваются внутри своей области.

## Запуск

Требуется Node.js 24+. Из корня:

```sh
npm --prefix packages/seda-contracts ci
npm --prefix portal/component-lab/pilots/settings-parametric ci
npm --prefix portal/component-lab/pilots/settings-parametric exec playwright install chromium
npm --prefix portal/component-lab/pilots/settings-parametric run typecheck
npm --prefix portal/component-lab/pilots/settings-parametric run build
npm --prefix portal/component-lab/pilots/settings-parametric run verify
npm --prefix portal/component-lab/pilots/settings-parametric run serve
```

`verify` последовательно выполняет `verify-lab2.mjs`, `verify-workspace.mjs` и `verify-controls.mjs`. Они поднимают собственные loopback-серверы на свободных портах и закрывают их после проверки. Для установленного Chromium можно задать `SEDA_BROWSER_EXECUTABLE`. Превью: http://127.0.0.1:5184/ . Проверочные fixtures библиотеки доступны при `?review=1`.

## Что реализовано

- **Проекты:** пересечение поиска, статуса, команды и Checkbox «Только активные»; сортировка; выбор строк и indeterminate header Checkbox; массовая приостановка; таблица/карточки; размер страницы, пагинация и empty state; создание проекта через dialog.
- **Настройки:** text/email/URL/number/date-поля, Select команды и региона, disabled-поле, Radio доступа, Toggle уведомлений и зависимый Checkbox отчёта. Валидация, фокус в ошибочное поле, применение и отмена к последнему сохранённому значению.
- **Команда:** поиск, фильтр роли, email/Select форма добавления в демонстрационную таблицу, защита от повторного email. Добавление локальное, сетевого приглашения нет.
- Навигация и смена параметров сохраняют введённые данные, состав команды, фильтры, выбор строк и незавершённое сохранение исходной формы.

## Общие правила

`build.mjs` компилирует Light/Dark × S/M/L/XL из `packages/seda-contracts`, включает контракты `Select`, `Checkbox`, `Radio`, `Toggle` и их разрешённые ветви из общего compiler и фиксирует хеши исходников/артефактов. Runtime-таблицы пресетов нет.

`lab-model.mjs` рассчитывает H/font/line/radius/X/Y из compiled geometry. Для Button X прибавляется к `buttonPaddingInline`; для TextField и Select — к `textFieldPaddingInline`. IconButton остаётся квадратом H×H. Формулы, инспектор, экспорт и React используют эти значения.

Для Checkbox/Radio/Toggle учитывается семантика: общий размер и масштаб задают размер маркера, X прибавляется к базовому интервалу до подписи, Y меняет высоту строки. Radio остаётся круглым; Toggle — переключателем. Компактные checkbox таблицы масштабируют маркер, а вертикальную плотность задают строки таблицы. Радиусы полей/кнопок и отступы строк таблиц также связаны с параметрами.

Общий адаптер находится в `workspace-bindings.mjs` и `workspace.css`; область применения отмечена `data-workspace`, включая dialog. Служебные параметры лаборатории снаружи этой области, чтобы изменение рабочего интерфейса не мешало управлению экспериментом. В узких панелях длинные подписи команд могут сокращаться многоточием с сохранением полного accessible name.

Button сохраняет фактический border box и X на время loading. Изменения X применяются к save-кнопке после ответа. Исходная форма продолжает использовать `transitionForm`: синхронный submit guard, snapshot, request ID, stale response и retry. Остальные формы демонстрируют локальное состояние рабочей области.

## Границы контрактов

- Button, IconButton, TextField, Select, Checkbox, Radio, Toggle — реальные компоненты SEDA UI с исполняемыми контрактами общего пакета `seda-contracts`. `contract-controls.tsx` проверяет props и связывает compiled states; рисуют и обрабатывают события сами компоненты `@seda-ai/ui`. Build metadata содержит пути реально включённых TSX-модулей.
- Navigation, Table, Card, Dialog и составные формы — демонстрационные композиции. Select сохраняет нативную семантику, ref, формы и клавиатуру. В поддерживающем `appearance: base-select` Chromium список оформлен токенами; в остальных браузерах остаётся системным. Календарь date-поля системный.
- Данные и сохранение локальны текущей сессии страницы. Backend, отправка email и восстановление после reload не реализованы. Нативная оболочка десктоп-приложения в задачу не входит.

## Как читать проверки

[Отчёт](LAB2-INTEGRATION-REPORT.md), [результаты Lab](verification/lab2-results.json), [совместные сценарии приложения](verification/workspace-results.json).

1. **90 unit tests** (77 исходных + 13 новых групп контрактов) проверяют API, resolver, компиляцию, web bindings и модель формы исходного контрактного пакета.
2. **55 Lab browser checks** проверяют прежние сценарии, включая 288 сочетаний loading. Эти сочетания являются вложенными измерениями, а не 288 разными пользовательскими сценариями.
3. **14 workspace checks**: 8 групп геометрии (144 сочетания темы/размера/параметров/ширины/раздела), 5 связанных пользовательских сценариев и отсутствие page errors. Измеряются реальные поля, Select, команды, IconButton, Checkbox/Radio/Toggle; проверяется совместная работа навигации, данных, таблиц и форм.

4. **12 control checks**: 8 групп Light/Dark × S/M/L/XL по 5 состояний × 4 контрола (160 снимков), клавиатура/multi, disabled/loading guard, единая рамка фокуса и оформленный popup, проверка реально собранных SEDA TSX и browser errors.

Browser QA — Chromium; это проверка реализованной рабочей области, а не сертификация всей дизайн-системы. Исторический `verify.mjs` этапа 3 сохранён без изменений и не является runner нового интерфейса.
