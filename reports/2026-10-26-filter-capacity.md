# Вместимость фильтров при общей параметризации

26.10.2026 · private v59 · runtime `06f51e3e8dc306823cc5664042f8961f266a9fc5`.

При M / 150% / X=24 / Y=12 и ширине окна 1702 px прежние четыре колонки оставляли Select сортировки дефицит примерно 80.9 px для самого длинного значения. Статусу не хватало примерно 61 px. Это был дефект композиции: высота и padding контролов соответствовали расчёту, но фиксированная сетка не учитывала их растущую вместимость. Новый verifier сначала воспроизвёл отказ на прежней сборке; исходные результаты и снимок сохранены.

Фильтры проектов и участников теперь используют принцип, уже применённый в «Файлах»: минимальная ширина учитывает текущие font, padding X, icon и gap. Число колонок автоматически сокращается при увеличении параметров. При обычном M / 100% в широком окне сохраняются четыре колонки, при M / 150% / X=24 — две. При узком окне — одна. У участников верхний предел — две колонки. SEDA-контролы сохраняют свои рассчитанные высоту, шрифт, строку, радиус и отступы; новые токены, пресеты и overrides внутренних элементов не добавлялись.

## Доказательства

| Проверка | Результат и граница |
| --- | --- |
| TypeScript / build | PASS для Lab и references; восемь профилей, source audit PASS. |
| Новая локальная проверка | 240 сочетаний: проекты/участники × обе темы × S–XL × три набора параметров × пять ширин 390/1024/1440/1702/2200. Проверяется реальный самый длинный option/placeholder с загруженным шрифтом, рамки и отступы; дефицит ≤1 px там, где область может вместить текст. |
| Связанные действия | Поиск, статус, команда, сортировка и reset работают совместно; при изменении ширины сохраняются тот же DOM-узел, фокус, значение и выделение текста. Tab переводит поиск к статусу. |
| Локальные регрессии | Workspace 21/21, Controls 12/12, Lab 55/55 групп PASS. Последний runner включает 288 вложенных loading-сочетаний, а также форму, повторные и поздние ответы, карточки и диалог. Группы и вложенные измерения не складываются в число пользовательских сценариев. |
| CI пакета и контрактов | Указанный runtime: installed package 69/69 групп PASS и Node contracts/models 139/139 PASS. Проверены настоящий npm pack/install, React 18/19, SSR/hydration и NodeNext types. |
| Опубликованная v59 | Те же 240 сочетаний и связанные действия PASS; два дополнительных loading-перехода S80→150/X24/Y12 в обеих темах PASS. Кнопка остаётся 72.09375×21 px, спиннер 15×15 px по центру, изменение корпуса 0 px, отправка одна. Errors 0. |
| Поставка | 930 source hashes, 689 canonical Git blobs, 241 installed entries и 532 artifact hashes совпали. Архив и опубликованные файлы проверены. `installedPackage=true`, `sourceAlias=false`, tokens hash не изменился. |
| CI | Запуск [40256806492](https://github.com/kenymook/seda_docs/actions/runs/40256806492) указанного runtime head завершился success во всех четырёх jobs: package, Lab, references и итоговый library. Все 51 application scripts завершились exit 0: Lab 23 + references 28. Новый verifier прошёл и в Linux CI. |

Новая группа добавлена в полный npm verifier и в Lab partition CI; проверка полноты подтверждает 51 скрипт: Lab 23 + references 28.

Визуально просмотрены normal и large фильтры в обеих темах, узкий XL и полные опубликованные экраны «Проекты»/«Команда» при M150/X24/Y12. В широком окне значения больше не сталкиваются со стрелкой и не обрезаются из-за лишних колонок. Крупные параметры увеличивают высоту композиции и требуют переноса навигации и текстов таблицы; это экспериментальные пределы, не рекомендуемая рабочая плотность. Screenshot baselines не обновлялись.

[До исправления](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/filter-capacity-before.png) · [После, Light](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/production/projects-light-full.png) · [После, Dark](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/production/projects-dark-full.png) · [Команда, Dark](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/production/members-dark-full.png).

## Ограничения и поставка

В восьми измерениях полей из 720 при физически узкой области самое длинное значение не вмещается даже во всю её ширину. В таком случае допускается сокращение; горизонтального переполнения страницы нет. Ширина рецепта не является гарантией для любой локализации, шрифта и произвольного будущего значения: verifier измеряет текущие реальные строки независимо от формулы сетки. Проверен Chromium; OS/AT, Firefox/WebKit и native desktop этой работой не сертифицированы.

Исправление касается компоновки фильтров. Общая цель зрелой дизайн-системы остаётся активной: полная визуальная приёмка компонентов и поверхностей, каталог иконок, доступность на целевых платформах, сложные grid/editor patterns и Figma/code соответствие ещё требуют работы.

[Тот же приватный сайт](https://seda-ai-pilot.kenymook.chatgpt.site/) · версия 59 · deployment `appgdep_6adeb467e53c8191b80fd182eb9d90c6` — succeeded. Site source `788e67cb8cf3ccbf18f98f633bae06ec51ca8e00`. Access custom/revision 1: owner 1, groups 0, external visitors 0. Архив 8249824 bytes; SHA-256 `6458a3fbf966fc79543b49cf2f14d9008179915844073357746e687b5447524e`.

[Исходный отказ](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/filter-capacity-before-results.json) · [Локальные измерения](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/local/results.json) · [Production](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/production/results.json) · [Release](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/filter-release.json) · [Хеши доказательств](../portal/component-lab/pilots/settings-parametric/verification/filter-capacity/evidence-hashes.json).
