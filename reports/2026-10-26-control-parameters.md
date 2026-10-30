# Общие параметры контролов в библиотеке SEDA — D33

26.10.2026 · private v58 · проверенный head `8e79b15e9bc28002e30dc7a87b8cb15026bc84da`; реализация `abe59ccdbcf6dbaa48b3e47162136fea84d6b71b` и последующее исправление проверки компактных Checkbox.

Дополнительные X/Y, масштаб и радиус раньше исполнялись в адаптере лаборатории. Теперь opt-in `SedaProvider.controlParameters` работает в установленном `@seda-ai/ui` без CSS лаборатории. Численный компилятор и CSS используют один граф `control-geometry.mjs`, а базовые значения берутся из существующих разрешённых профилей. Второй авторской таблицы пресетов нет. Сохраняются 13 instance contracts, 34 component entry modules и восемь Light/Dark × S–XL профилей; D33 не объявлен новым сертифицированным контрактом.

```tsx
<SedaProvider theme="dark" controlSize="m" textScale={150}
  controlParameters={{scale:150,extraPaddingInline:24,extraPaddingBlock:12,radiusScale:1.25}}>
  <TextField label="Название" />
  <Button>Сохранить</Button>
  <Button size="s">Локальный S</Button>
</SedaProvider>
```

API и ограничения подробно описаны в [D33](../packages/seda-contracts/CONTROL-PARAMETERS.md).

X добавляется к собственному padding компонента; у Checkbox/Radio/Toggle он добавляется к интервалу перед подписью. IconButton остаётся квадратным, Radio — круглым, Toggle сохраняет форму. Локальный size имеет приоритет перед общим, частичные вложенные параметры наследуются абсолютно. `textScale` отвечает отдельно за роли Text; authored content и координаты документов остаются у приложения.

Для M при масштабе 150%, X = 24 и Y = 12 px применяются шрифт 21 px, строка 30 px, иконка 24 px, padding Y 17 px, высота 66 px; padding X у Button — 36 px, у поля — 34 px. `geometry` сохраняет исходные token chains, отдельная `parametric` — результат, параметры и реальные inputs. Web bindings отклоняют устаревший результат и подменённое происхождение. Передача изменённой compiled geometry в React сохранена через исходные size slots Provider, без второго расчёта в host CSS.

Lab и восемь reference apps используют публичный режим. Удалены дублирующие правила полей и выборов и восемь button-padding overrides. Старые HTML-стили Lab ограничены обычными HTML-контролами: они больше не перекрывают внутреннюю поверхность и текст реальных SEDA полей. Инспектор учитывает локальный S служебных кнопок. Компактные чекбоксы таблицы проверяются без интервала к отсутствующей подписи.

В самой библиотеке устранено двойное сложение отступа подписи/сообщения TextField: установленный TextField, Select и NumberField имеют один интервал 6 px. Множественный Select учитывает масштаб высоты строки. Loading-спиннер ограничен текущим замороженным корпусом Button: в маленьком S при 80% без минимума пресета сохраняется высота 21 px, а при смене API-параметров до 200% спиннер 15 px остаётся внутри и по центру. Новые токены и SVG не добавлялись.

| Проверка | Доказанный объём |
| --- | --- |
| TypeScript / build | UI, pilot и references — PASS; восемь профилей и source audit — PASS. |
| Контракты | 139 Node-тестов — PASS локально и в CI. Это API, разрешение токенов, модели и численные проверки. |
| Установленная поставка | 69 групп — PASS на React 18.3.1 / 19.2.7: настоящий npm pack/install, NodeNext types, SSR/hydration, без source alias и CSS Lab. |
| Новый публичный режим | По 40 выбранных сочетаний на каждом React: обе темы, S–XL, пять наборов параметров, включая 80 / 115 / 150 / 200%. По 4 error/disabled cases и 2 loading-fit cases. Проверены локальный S, вложенное наследование, порталы, сохранение DOM-фокуса, курсора и значения и совместные Checkbox/Toggle, Select/Radio. |
| Совместные приложения | Все 50 скриптов завершились exit 0: Lab 22 + references 28. Включены прежние save/late-response, история, фильтры, таблицы и редакторы. |
| Опубликованный интерфейс | Lab 24 выбранных сочетания и 2 loading-перехода80→150%; инспекторы 160 сочетаний на восьми экранах и 95 raster glyph checks; JavaScript errors 0. |
| Происхождение поставки | 930 source hashes, 689 canonical Git blobs, 241 installed UI entries и 532 опубликованных artifact hashes совпали. `sourceAlias=false`, tokens hash не изменился. |
| CI | [Все три группы и итоговая проверка указанного runtime head — success](https://github.com/kenymook/seda_docs/actions/runs/40251803801). |

Это разные уровни доказательств. Числа не складываются в оценку зрелости. Непрерывный диапазон параметров не проверен исчерпывающе. Лаборатория сохраняет исходный slider 80–150%, публичный API поддерживает 80–200%.

Визуально просмотрены нормальные M при 100% кадры всех восьми приложений в обеих темах, два крайних 1024/XL150 кадра, а также выбранные Lab и installed-consumer состояния. У полей и команд общий ритм, glyph slots масштабируются вместе с текстом. На крайних настройках требуются перенос, прокрутка и сокращение подписей; это экспериментальный режим, не рекомендуемая рабочая плотность. Длинные значения Select в четырёхколоночных фильтрах Lab при максимальных X и масштабе ещё тесны; адаптация вместимости фильтров остаётся открытой. Screenshot baselines не обновлялись.

Первичные отказы сохранены в proof. Найдены и исправлены внутренний белый фон/неверный foreground в Dark, выход loading-спиннера за маленькую кнопку, неверное сравнение локального S с общим M и потеря передачи compiled height. CI также обнаружил ошибочное ожидание gap8 для табличных Checkbox без подписи: теперь отдельные требования 0 и base+X проверяются явно. Один полный Windows package run остановился по таймауту filechooser 30 s; неизменённый изолированный сценарий из 168 cases, последующий полный 69/69 и Linux CI прошли. Причина этого единичного timeout не выдана за устранённый продуктовый дефект.

Пакет остаётся private/experimental. Открыты полный icon catalog, свежая Figma-приёмка всех поверхностей и состояний, сложные grid/editor patterns, surface contracts/Code Connect, browser/OS/AT/touch и performance. Содержимое реконструированных редакторов, API AI-провайдеров, collaboration и внешний sharing не становятся полноценными сервисами от этой параметризации. Прежняя отдельная граница production Search runner с авторизацией новой вкладки этой итерацией не закрывалась. WebGL проверялся с программным рендерером Chromium. Общая цель дизайн-системы активна.

[Тот же приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) · версия 58 · deployment `appgdep_6adea97453d08191a630a188824ef4a2` — succeeded. Site source `530a475b1992ec2f94f2519aae67417b4bc5e3f5`. Access custom/revision 1: owner 1, groups 0, external visitors 0.

Архив: 8249827 bytes; SHA-256 `c857c3f506e55ccebb53e38d112958bdd13e3becaa059c0dcacee818b3b9244d`. Proof содержит 85 hash-listed файлов; полный исходный package result остаётся в локальной диагностике и CI artifact, в PR сохранены результаты всех групп и подробности нового режима.

[Release](../portal/component-lab/pilots/settings-parametric/verification/control-parameters/release.json) · [Production](../portal/component-lab/pilots/settings-parametric/verification/control-parameters/production-results.json) · [Evidence hashes](../portal/component-lab/pilots/settings-parametric/verification/control-parameters/evidence-hashes.json).
