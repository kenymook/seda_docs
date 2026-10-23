# Text

> **Category** · Data Display · **Status** · needs-review · **Owner** · Kenymook
> **Foundation** · [Типографика](../../foundation/typography.md), [Доступность](../../foundation/accessibility.md), [Контент](../../foundation/content.md)

## Назначение и использование

Общий React primitive для типографических ролей SEDA в web/desktop приложениях. Используется для заголовков, основного/служебного текста, метрик и кода. Не заменяет Button, Link, label поля, rich-text editor или author text canvas. Текст внутри документа и chrome редактора имеют разных владельцев масштаба.

## Анатомия и API

Один native элемент с текстовым содержимым. `Text` экспортируется из `@seda-ai/ui`; CSS подключается через `@seda-ai/ui/styles.css`.

| Prop | Контракт |
|---|---|
| `variant` | Одна из23 ролей foundation без префикса `type/`; default `body/default`. Набор экспортирован как readonly `textVariants` |
| `as` | `span` по умолчанию; допустимы `p`, `div`, `h1`–`h6`, `code`, `strong`, `em`, `small` |
| Native attributes/ref | Передаются одному элементу. ref типа HTMLElement; `id`, lang, dir, ARIA, selection и native events сохраняются |

Визуальная роль не создаёт heading semantics. Для заголовка: `<Text as="h2" variant="heading/section">Раздел</Text>`. Уровень h1–h6 выбирается по outline, не по размеру. Пустой текст имеет обычную native семантику; отдельного loading/disabled/error состояния у текста нет. Inline emphasis оформляется семантически; display roles не используются в плотных панелях.

## Масштаб и геометрия

`SedaProvider textScale={115}` задаёт абсолютные115%, не множитель родителя. Неуказанное значение наследуется; standalone default100. Допустимы конечные числа80–200. Invalid role/tag/scale отклоняются до render. `controlSize` независим от роли текста; X/Y/radius не меняют её. Существующая геометрия контролов компилируется отдельно, не масштабируется повторно Provider.

Для роли с token size S и line-height L: `factor=max(textScale/100, minimumSize/S)`, `fontSize=S×factor`, `lineHeight=L×factor`, `letterSpacing=tokenSpacing×factor`. Дробные значения сохраняются. Важный UI text имеет minimum12px; `body/xsmall`, `label/xsmall`, `caption/tiny` —10px, `caption/micro` —8px и не используются как единственный источник важной информации. Clamp отражается в deriveTypography, а не скрывается округлением.

Text обнуляет собственный margin; layout gap задаёт композиция. Длинные слова переносятся, фиксированной высоты, line-clamp и ellipsis нет. Метрики используют tabular numbers. Политика переноса кода в этом primitive — безопасный перенос длинных строк; редактор кода со scroll должен иметь отдельную композицию.

## Токены и исполнение

Существующие foundation roles сопоставлены реальным ключам tokens.json в `packages/seda-contracts/src/typography.mjs`. `heading/page|section|panel` используют `font/h1|h2|h3/strong`; display — `font/title1|title2|title3/strong`. Это исправляет устаревшие названия документации, не меняет значения токенов. Основное семейство берётся из `font/family` (сейчас Inter). Для mono используется явно документированный CSS stack: отдельного family/mono token пока нет.

Общий compiler выдаёт `typography.roles` с token chains; `createTypographyBindings` выдаёт CSS и provenance; `deriveTypography` — применённые метрики/минимум. Пакет строит CSS из того же compiler. Это executable foundation contract, а не дополнительный registry component contract: API Text ещё не добавлен в11-component serializable validation registry.

## Доступность и acceptance

Native outline/чтение, lang/dir и выделение текста сохраняются; интерактивности и tab stop по умолчанию нет. Цвет наследуется от контекста: композиция должна подтвердить contrast, компонент сам его не гарантирует. Font scaling до200%, длинные строки, RTL, вложенные scopes, SSR/hydration, minimum и DOM/compiler parity проверяются отдельно от контраста/AT. Полная screen-reader/native desktop приёмка открыта.

Handoff: Figma component/variables mapping пока не подтверждён. Перед статусом ready нужны visual/contrast/AT acceptance и использование в оставшихся reference screens. AI использует только перечисленные props/roles и реальные токены; неизвестный mapping помечает Needs system review. Нельзя выдавать произвольный CSS font-size за роль SEDA, скрывать ошибки уменьшением шрифта или масштабировать Canvas artwork вместе с UI chrome. Human review handoff остаётся обязательной стадией зрелости.

Пример независимого author scope:

```tsx
<SedaProvider textScale={150}>
  <Text as="h2" variant="heading/panel">Инспектор</Text>
  <SedaProvider textScale={100}>
    <Text as="p">Текст документа с собственным масштабом</Text>
  </SedaProvider>
</SedaProvider>
```
