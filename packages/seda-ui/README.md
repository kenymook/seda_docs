# @seda-ai/ui

React-компоненты SEDA для веб-приложений и веб-интерфейсов в desktop shell. Пакет пока private/experimental: production-ready статус всей библиотеки не заявляется.

## Сборка и подключение

```sh
npm --prefix ../seda-contracts ci
npm ci
npm run typecheck
npm run build
npm pack
```

`prepack` собирает ESM, declarations и CSS. Архив содержит только `dist`, README, CHANGELOG и package manifest; React остаётся peer dependency приложения.

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

14 component exports и foundation API не означают готовность всей библиотеки. Восемь компонентов имеют исполняемые контракты в соседнем `seda-contracts`; Button/TextField/Select/Checkbox/Radio/Toggle/IconButton/Tabs проверяются в Lab. Публичный `SedaProvider` подключает темы и наследуемый размер к установленному пакету; проверка выполняется без CSS лаборатории. Явный size компонента приоритетнее общего.

Следующие обязательные направления: полная матрица взаимодействий и доступности, навигация/overlays/data-компоненты, документация и политика совместимости. WCAG-сертификация, Firefox/WebKit, screen readers и native desktop shell этими тестами не подтверждаются.


## Иконки и геометрия контрола

`Icon` использует 11 исходных SVG SEDA из `assets/icons/seda`; имена и Figma node IDs перечислены в `assets/icons/seda/icons.json`. Это начальный набор, не полный каталог иконок приложения.

```tsx
import { Button, Icon, TextField } from '@seda-ai/ui';
<Button iconLeft={<Icon name="add" />}>Создать проект</Button>
<TextField label="Поиск" prefix={<Icon name="search" />} />
```

Иконка наследует цвет и размер слота. По умолчанию она декоративна; самостоятельной смысловой иконке передайте `label`. IconButton должен иметь собственный `aria-label`. SVG и IMG в непосредственном слоте нормализуются по его размерам; составные пользовательские обёртки с абсолютной геометрией требуют собственного адаптера.

Контролы используют `--seda-control-icon-size` с fallback на скомпилированный preset; Button и TextField используют preset gap. В Lab масштаб контролов применяется к font, line и icon одновременно, затем вычисляется высота. `SedaProvider.textScale` по-прежнему управляет типографическими ролями Text: это отдельная настройка, она сама не меняет геометрию контролов. X прибавляется к базовому горизонтальному padding, Y — к вертикальному. Эти параметры не сертифицируют оптическое качество композиции.

## Общая тема и размер

```tsx
import { SedaProvider, Button, TextField } from '@seda-ai/ui';
import '@seda-ai/ui/styles.css';

<SedaProvider theme="dark" controlSize="m">
  <TextField label="Название" />
  <Button>Сохранить</Button>
  <Button size="s">Локальный S</Button>
</SedaProvider>
```

Вложенные providers наследуют неуказанные настройки. Defaults — light/m; React state сохраняется при смене профиля. `useSedaConfiguration()` возвращает readonly frozen snapshot. CSS и `profiles.json` генерируются из настоящих `tokens.json` и contract system при build в монорепозитории; в consumer исходники и resolver не требуются. Метаданные доступны как `@seda-ai/ui/profiles.json` и не добавляются к JS entry автоматически. Без provider сохраняется каноническая геометрия явно заданных размеров, но для общей темы нужен provider.

Проверка включает 24 сочетания theme/size/width на каждом React runtime, четыре размера без provider, nested scopes, local overrides и loading при смене профиля. Reduced motion/forced colors — smoke checks, без заявления полной accessibility-сертификации. Стили импортируются явно; для source alias всё ещё нужен build CSS, эталонный способ потребления — установленный пакет.

## Меню команд (experimental)

`DropdownMenu` использует shared Button/IconButton, наследуемые профили/темы и portal overlay. Поддерживает группы, separators, реальные shortcuts, disabled/danger, controlled open и keyboard/typeahead. `react-dom >=18` — явная peer dependency. API и ограничения: [Dropdown Menu spec](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/overlays-layout/dropdown-menu.md#14-react-implementation--experimental). Это девятый instance contract общего compiler; DOM snapshots сопоставляются с compiler на React 18/19. Для destructive action приложение открывает подтверждение. Рабочие reference screens ещё требуют реализации.

```tsx
<DropdownMenu triggerLabel="Действия" items={[
  { id: "open", label: "Открыть", onSelect: openDocument },
]} />
```

## Разделяемые рабочие панели (experimental)

`SplitView` — две постоянно mounted панели с pointer/keyboard resize, RTL, controlled/uncontrolled размером, minimum/maximum bounds и явным overflow при нехватке места. Два вложенных SplitView дают три области редактора. `Enter` минимизирует/восстанавливает primary (при minSize=0 — collapse), `Escape` отменяет drag. Host владеет моделью и сохранением. [Полный API, token gaps и ограничения](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/overlays-layout/split-view.md). Instance contract ещё не зарегистрирован; provider/foundation binding не заменяет его.

```tsx
<div style={{height:520}}>
  <SplitView primaryLabel="Объекты" secondaryLabel="Редактор"
    primary={<Objects />} secondary={<Editor />}
    primarySize={width} onSizeChange={setWidth} minSize={120} secondaryMinSize={400}/>
</div>
```

## Вкладки рабочих панелей — API

`Tabs` поддерживает line/pill, наследуемый размер, controlled/uncontrolled выбор, automatic/manual activation, RTL keyboard и сохранение mounted panels. [Полный API и границы](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/navigation/tabs.md#14-react-implementation--experimental). Импорт: `import { Tabs } from "@seda-ai/ui"`. Требуются `label` списка и items с value/label/content.

Tabs проверяется отдельным installed consumer в составе verify:package; Tabs также зарегистрирован восьмым компонентом общего compiler. Полных editor primitives и четырёх reference applications пока нет.

```tsx
<Tabs label="Панели документа" activationMode="manual" items={[
  { value: "properties", label: "Свойства", content: <PropertiesForm /> },
  { value: "history", label: "История", content: <History /> },
]} />
```

## Дерево рабочих объектов — experimental

`Tree` экспортируется из установленного пакета и использует общий SedaProvider, S/M/L/XL и canonical components/tree roles. API: [Tree spec](https://github.com/kenymook/seda_docs/blob/codex/seda-lab2-integration-20261023/specs/navigation/tree.md). Поддержаны вложенные items, controlled/uncontrolled selection и expansion, multiple/range selection, keyboard/typeahead/RTL и focus repair. Selection не следует за фокусом. Не поддержаны virtualization, lazy loading, drag/reorder и checkbox tree. Десятый executable contract общего compiler проверяет authored facts; browser/AT readiness из compile не выводится.

```tsx
<Tree label="Слои" items={[{id:"frame",label:"Frame",children:[{id:"title",label:"Заголовок"}]}]} defaultExpandedIds={["frame"]}/>
```

## TextArea — multiline input (experimental)

TextArea использует общие S/M/L/XL и собственные canonical `text-area` tokens. [API и ownership D30](../../packages/seda-contracts/TEXTAREA-CONTRACT.md). Rows/native editing, controlled/uncontrolled value, readOnly/disabled/error, counter и clear; autoResize/maxRows ограничивают рост, после cap прокручивается поле. Enter остаётся native вводом новой строки; submit/IME policy принадлежит composer. Ручная высота не сбрасывается при вводе. Native reset поддержан для uncontrolled value; controlled reset — у формы.

```tsx
<TextArea label="Сообщение" value={message} onChange={e=>setMessage(e.target.value)}
  rows={1} autoResize maxRows={8} clearable onClear={()=>setMessage('')}
  showCount maxLength={4000}/>
```

Компонент зарегистрирован одиннадцатым executable contract. Installed React18/19 proofs включают SSR/Strict hydration и DOM/profile measurements. Это не приёмка40 Figma variants, реального IME на каждой ОС, screen reader или native desktop shell. Clear label сейчас русский; общей i18n модели внутренних подписей ещё нет.

## Text и масштаб типографики

19-й public component `Text` использует23 роли foundation. Пример: `<SedaProvider textScale={115}><Text as="h2" variant="heading/section">Раздел</Text></SedaProvider>`. `as` задаёт native outline, `variant` — визуальную роль. Scale80–200 наследуется абсолютно; controlSize независим. CSS содержит те же token values/provenance, что общий compiler; important text minimum12px. Author content/Canvas zoom принадлежат приложению. Подробный контракт: specs/data-display/text.md; роли без prefix type/. Это foundation execution, не12-й registry component contract.
