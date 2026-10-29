# Каталог покрытия SEDA

Каталог отвечает на вопрос «что существует и чем подтверждено», а не присваивает общий `ready`. Он собирается из исходников при каждом build портала. Текущая точка: 59 записей, 58 спецификаций, 36 public modules, 13 executable contracts, 52 component token branches и 7 Studio adapters. Это разные множества, их нельзя складывать или выдавать за число принятых компонентов.

## Источники и использование

- `packages/seda-ui/src/index.ts` и TypeScript module checker: настоящие value exports, включая AvatarGroup и provider/hook exports внутри модулей. Type-only exports не считаются runtime.
- `specs/**/*.md`: наличие спецификации, её authored status и SHA-256. Исторический `ready` остаётся свойством документа.
- `packages/seda-contracts/contracts` и registry: проверяется точное совпадение зарегистрированных контрактов и публичных модулей.
- `tokens.json`: фактические component branches; значения токенов каталог не меняет.
- `StudioPreviews.tsx`: одна literal registry одновременно используется интерфейсом и читается build через TypeScript AST. Отдельного ручного списка preview нет.
- `packages/seda-ui/component-relations.json`: явные family/composition/foundation связи, shared token ownership и ссылки на ограниченные review evidence. Пути должны оставаться внутри репозитория; неизвестные связи останавливают build.
- `reports/component-registry.md`: исторические Figma aliases сохраняются как `historical-unverified`; React exports из них не выводятся.

После `npm run build` в `portal/component-lab/pilots/settings-parametric` артефакт доступен как `dist/component-catalog.json`, в опубликованном портале — `/component-catalog.json`. В `/owner` раздел «Каталог покрытия» показывает независимые статусы и даёт скачать JSON. Тот же объект встроен в существующий `componentCoverage.catalog`; прежние массивы сохранены для совместимости.

## Значение статусов

| Поле | Что подтверждено | Чего оно не подтверждает |
| --- | --- | --- |
| `specification: present` | Markdown найден, известны путь и hash | Реализацию или современную приёмку |
| `runtime: exported` | Public module разрешён TypeScript, содержит value exports | Все variants, accessibility, визуальное качество |
| `runtime: family-only` | Семейство явно описано через members | Отдельный React export |
| `tokens: own/shared/no-component-branch` | Владелец цветовой ветки указан явно | Наличие отдельного набора цветов у каждого layout primitive |
| `contract: registered` | Контракт присутствует в действующем registry | Приёмку всех браузерных состояний |
| `preview: registered` | Есть живой Studio adapter реального компонента | Все размеры, темы и состояния компонента |
| `visualReview/platformReview: not-accepted` | Полная актуальная приёмка ещё не заявлена | Отсутствие любого прежнего теста: bounded evidence хранится отдельно |

Примеры: NumberField — public composition с собственным числовым контрактом и shared TextField tokens. Button System — family, не выдуманный ButtonSystem export. Breadcrumbs имеет runtime и Studio adapter, но не зарегистрированный instance contract. Chip имеет spec и tokens, но отсутствующий public runtime. Icon использует foundation documentation.

Каталог фиксирует 22 записи без public runtime и одно family-only семейство. Нулевые `visualAccepted/platformAccepted` означают отсутствие полной актуальной приёмки по gates roadmap; прежние целевые проверки не обнуляются и перечислены как evidence с ограниченным scope.

## Проверка

`npm run verify:catalog` в `packages/seda-ui` проверяет модель, некорректные связи, literal registry, границы путей, реальные value exports, отсутствие автоматического повышения статуса и детерминированную генерацию. `node verify-component-catalog.mjs` в pilot проверяет endpoint, owner UI, download и все семь adapters в обеих темах на изолированном API fixture. Дополнительные Select/part-navigation verifiers проверяют сохранение интерактивного поведения.

Этот slice закрывает сбор исходных данных `COV-01`. `COV-02` остаётся отдельной задачей: статусы до выбора компонента и маркировка старых HTML demos во всех поверхностях портала. Каталог не объявляет зрелой всю систему и не заменяет независимую приёмку четырёх классов приложений и девяти reference frames.
