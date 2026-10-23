# React foundation: SedaProvider и общие профили

> Status: experimental · Version: 0.1.0 · 23 октября 2026

SedaProvider подключает общую конфигурацию библиотеки для веб-приложений и UI внутри desktop shell. Это foundation API, а не новая визуальная композиция или отдельная палитра.

## Использование

```tsx
import { SedaProvider, Button, TextField, Select } from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';

<SedaProvider theme="dark" controlSize="m">
  <TextField label="Название" />
  <Select label="Команда" options={[{ value: 'core', label: 'Core' }]} />
  <Button>Сохранить</Button>
  <Button size="s">Локальная компактная команда</Button>
  <SedaProvider controlSize="l">
    <TextField label="Крупное поле в той же теме" />
  </SedaProvider>
</SedaProvider>
```

- `theme`: `light | dark`. При отсутствии наследуется; standalone fallback — `light`.
- `controlSize`: `s | m | l | xl`. При отсутствии наследуется; standalone fallback — `m`.
- Явный `size` компонента имеет приоритет над provider. Изменение provider не перемонтирует дочерние компоненты и не сбрасывает состояние формы. При loading Button замораживает размеры и padding до завершения, затем применяет актуальный профиль.
- Вложенный provider переопределяет только переданные настройки. Вложенная тема не меняет геометрию внешней области.
- `useSedaConfiguration()` возвращает readonly frozen snapshot действующей конфигурации. Изменение производится через props provider.
- Неизвестные theme/controlSize отклоняются и TypeScript, и runtime. Значение `system` не подменяет SSR-конфигурацию: выбор темы ОС остаётся у host, который передаёт явный theme.
- `className`, стандартные div-атрибуты и ref передаются корневому элементу. Внешний layout принадлежит приложению; provider не назначает viewport, grid или canvas.

## Источники значений

Авторские значения не дублируются в новых React-пресетах:

1. `tokens.json` — значения и alias chains.
2. `packages/seda-contracts/system.json` — действующие S/M/L/XL и общая геометрия.
3. Общий token resolver — проверка режимов, значений, циклов и обязательных leaf paths.
4. `packages/seda-ui/scripts/theme-assets.mjs` — CSS adapter и provenance в build artifacts.

Сборка формирует Light/Dark × S/M/L/XL, component/semantic CSS variables и `dist/profiles.json`. Метаданные доступны через export `@seda-ai/ui/profiles.json`. Они загружаются только по запросу; импорт обычного JS entry не включает JSON и CSS автоматически. Сборка выполняется в checkout монорепозитория; установленный tarball не требует `seda-contracts`, исходников или resolver в приложении.

`profiles.json` содержит хеши авторских файлов, resolved geometry, ссылки и цепочки происхождения. Восемь профилей сопоставляются с результатом общего compiler. Отсутствие используемого component state token останавливает сборку.

Базовая геометрия семи контролов одинакова и без provider, если size задан явно. Provider добавляет общую тему и наследуемый размер. Другие React-компоненты также наследуют значение size, но их собственные размерные модели не приравниваются к высоте Button.

## Семантика геометрии

Button/TextField/Select используют канонические высоты, шрифт, строку и радиус. IconButton сохраняет квадрат. Checkbox/Radio масштабируют маркер; Radio остаётся круглым. Размер Toggle получается из iconSize и foundation inset `space/2xs`, форма переключателя сохраняется. Общие experimental X/Y лаборатории не становятся новым публичным пресетом.

Font family сохраняет источник и явно добавляет системный sans-serif fallback. Для точного Inter host может отдельно загрузить шрифт. Перестановка grid-строк не растягивает внутренние gaps полей. Размер не подменяет отдельную политику touch hit area; текущие профили regular проверены для pointer/keyboard.

## Аудит defaults

`useSedaSize` является явным протоколом `size ?? configuration.controlSize`. API inspector читает standalone fallback из настоящего provider и проверяет форму этого протокола; не предполагает literal default там, где действует Context. В metadata записаны `defaultSources`, `standalone-fallback`, `providerOverride`. Drift fallback и нераспознанная замена helper не проходят аудит. Явный runtime размер в compiler по-прежнему проверяется по публичному типу.

## Проверки и границы

Consumer verifier устанавливает настоящий tarball в React 18/19, выполняет SSR/hydration и измеряет профили на 1280/780/390. Проверяются вложенные scopes, явный локальный size, размеры без provider, цвета из token metadata, font fallback, focus+error, disabled precedence, indeterminate, изменение профиля во время loading и сохранение состояния. Reduced motion и forced colors имеют отдельные smoke checks.

Эти проверки не заменяют Firefox/WebKit, screen reader, ручной accessibility review или проверку native desktop shell. Визуальные модели остальных компонентов и сложные рабочие приложения остаются частью [общего критерия зрелости](../docs/library/MATURITY.md).


## Соответствие action-вариантов

CSS adapter переводит публичный API в существующие component branches, не создавая новых значений:

| API | Источник Button | Источник IconButton |
|---|---|---|
| primary | button/primary/solid | icon-button/primary |
| secondary | button/neutral/secondary | icon-button/neutral |
| outline | button/neutral/outline | icon-button/neutral |
| ghost | button/neutral/ghost | icon-button/ghost |
| text | button/neutral/text | icon-button/ghost |
| destruction | button/danger/solid | icon-button/danger |

Каждая CSS-привязка сохраняет исходный ref/chain и API variant. Если у ветки нет отдельного foreground hover/loading или поверхности loading, adapter использует её default role; новое token leaf не выдумывается. Обязательные роли authored contracts по-прежнему проверяются. Default/hover/pressed/disabled/loading для шести action-вариантов измеряются в обоих режимах темы на React 18/19.

Это расширяет браузерное свидетельство, но не делает authored pilot contracts универсальными для всех вариантов: destructive confirmation, постоянный selected и остальные сценарии вне pilot scope требуют расширения contract rules. Link/Badge/Tag/Alert/Toast/FileUpload наследуют настройку size, но ещё не прошли такую же подробную визуально-поведенческую матрицу. Общая зрелость библиотеки остаётся открытой задачей.

Сборка экспортирует только CSS roles, используемые текущими стилями библиотеки. Метаданные происхождения загружаются отдельно и не входят в обычный JS payload. Это не сокращает авторский каталог tokens.json; новый библиотечный компонент подключает нужные роли через свои стили и adapter.
