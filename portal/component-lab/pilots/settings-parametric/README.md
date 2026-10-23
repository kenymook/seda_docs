# SEDA AI Lab 2.0

React-интеграция готовой композиции `seda-ai-lab-2-source-and-handoff.zip` поверх этапа 3 (`a0c2793`). Разметка экранов, граф, сравнение, таблица, карточки, фильтры и диалог перенесены из `index.html`; стили основаны на `lab.css`; расчёты — порт `lab.js`, без runtime-таблицы пресетов.

## Запуск и проверка

Node.js 24+, из корня репозитория:

```sh
npm --prefix packages/seda-contracts ci
npm --prefix portal/component-lab/pilots/settings-parametric ci
npm --prefix portal/component-lab/pilots/settings-parametric exec playwright install chromium
npm --prefix portal/component-lab/pilots/settings-parametric run typecheck
npm --prefix portal/component-lab/pilots/settings-parametric run build
npm --prefix portal/component-lab/pilots/settings-parametric run verify
npm --prefix portal/component-lab/pilots/settings-parametric run serve
```

`verify` запускает собственный сервер на свободном loopback-порту и закрывает его после проверки. `SEDA_BROWSER_EXECUTABLE` позволяет выбрать уже установленный Chromium; иначе используется версия из закреплённого Playwright. Страница: http://127.0.0.1:5184/. Дополнительные библиотечные fixtures доступны только при `?review=1`.

Существующие 77 тестов контрактов запускаются отдельно:

```sh
npm --prefix packages/seda-contracts test
```

Старый `verify.mjs` сохранён без изменений как историческая проверка экрана этапа 3. Он использует прежние DOM-селекторы и layout и не является проверкой нового экрана; для Lab 2.0 используется `verify-lab2.mjs`.

## Источники и границы

- `build.mjs` компилирует восемь профилей Light/Dark × S/M/L/XL из `packages/seda-contracts` и `tokens.json`, проверяет исходные API и сохраняет хеши исходников и артефактов.
- `lab-model.mjs` берёт height/font/line/radius/icon/border из compiled geometry. Округление, padding, минимум высоты и множитель радиуса перенесены из архива. Border читается из контракта, а не из константы 1.
- Четыре вычисленные CSS-переменные применяются к реальным Button, IconButton и TextField. Инспектор и JSON содержат применённые значения, исходное значение, цепочку resolver и входы derivation.
- Базовые профили и экспериментальная геометрия разделены. Произвольные дополнительные настройки Lab не объявляются сертифицированными профилями SEDA.
- Table/Card/Dialog и нативные Select/Range/Checkbox — демонстрационные композиции; они помечены в интерфейсе и не имеют заявленного компонентного контракта. Навигационные кнопки лаборатории относятся к её оболочке.
- Сохранение использует существующий `transitionForm`, синхронный ref guard и request ID. Транспорт демонстрационный: ручной ответ либо таймер 900 мс, без записи на сервер. Данные формы и проекты живут в памяти страницы и не сохраняются после reload.
- При запросе Button фиксирует фактический border box, центрирует spinner и сохраняет accessible name. Пустого leading slot нет. После завершения authored dimensions восстанавливаются. При смене профиля во время loading эта кнопка сохраняет snapshot-геометрию до ответа, остальные контролы пересчитываются сразу; DOM-проверка учитывает оба источника.
- «Сбросить» сбрасывает параметры, сохраняя данные и текущий запрос.

## Проверки

[Отчёт интеграции](LAB2-INTEGRATION-REPORT.md) и [машинные результаты](verification/lab2-results.json). Скриншоты генерируются в игнорируемой `.diagnostics-lab2/`; выбранные изображения приложены к `verification/`.

Проверяются 32 конфигурации (1440/1180/780/390 × Light/Dark × S/M/L/XL), 96 комбинаций loading (8 профилей × 3 длины подписи × 4 набора иконок), расчёты и clamp, токены и происхождение значений, экспорт, duplicate submit, snapshot, stale response, retry, error/focus, фильтры, карточки и dialog/Enter/Escape/возврат фокуса. Допуск геометрии — 1 px. Test runner сверяет исходники и реально отдаваемые файлы с хешами сборки.
