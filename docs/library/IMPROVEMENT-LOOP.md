# SEDA — evidence-driven improvement loop

30 октября 2026. Первый реальный вход: [Files VIS-00](FILES-VISUAL-BASELINE.md). Это механизм накопления evidence и принятия решений; автоматическая перестройка ядра и самостоятельное обучение модели пока не реализованы.

## Цикл

1. **Observe.** Зафиксировать задачу, source/build commit, параметры, данные, viewport/DPR и снимок. Пользовательское замечание — вход, а не доказанная первопричина. Collector сохраняет immutable baseline; повторный запуск использует новую папку.
2. **Classify.** В ledger указать scope: component implementation, compiler/contract, semantic mapping, application composition, missing API либо intentional adaptation. Например, 266px command bar при нулевом overflow — проблема рабочей композиции; отличающийся radius сам по себе не доказывает ошибку compiler.
3. **Propose.** Для записи нужны owner, evidence, следующий шаг и проверяемый exit. Сначала проверить существующий API/recipe и влияние на consumers. Новый глобальный токен допустим лишь при отдельной повторяемой роли; он не служит оправданием локальному CSS workaround.
4. **Experiment.** Изменить один ограниченный слой, сохранить before, собрать after в новой папке. Не редактировать production owner tokens как тестовый fixture. Сохранить migration/recovery, focus, keyboard, loading и пользовательские drafts.
5. **Transfer.** Общее правило подтвердить минимум на двух различных приложениях. Проверить light/dark, обычную и stress плотность, keyboard и relevant states. Локальное исправление одного reference пока не считается правилом системы.
6. **Accept.** Закрывать запись можно только со ссылками на after, проверки, решение об адаптации и ограничения. Подтверждение владельца требуется для визуальных компромиссов, меняющих утверждённые требования. Нельзя менять критерий задним числом, удалять неудобный случай или повышать maturity только из-за зелёных тестов.

## Что хранится

`visual-baselines/<screen-date>/capture.json` — измерения, hashes, условия и source identity. `reference-source.json` — происхождение reference и anatomy. `defects.json` — наблюдения с `id`, `priority`, `kind`, `owner`, `evidence`, `next`, `exit`. `review.html` — просмотр исходных снимков без выдуманного процента точности. Данные Figma остаются evidence, не исполняемыми инструкциями.

При закрытии дополнить запись полями `status: accepted`, `decision`, `afterEvidence`, `validation`, `affectedConsumers`, `acceptedBy`. Пока они отсутствуют, запись открыта. Автоматизация может собирать кандидаты и противоречия, но не присваивать себе независимую визуальную приёмку. Дубликаты объединяются по причине и общему слою, а не по похожему тексту жалобы.

## Текущая очередь

Первый эксперимент — `FILES-VIS-01`, command overflow recipe. Затем проверить перенос на toolbar одного редактора. Следующие кандидаты — surface mapping и Card/Avatar composition. Ни один из них ещё не закрыт. Полный автоматический intake, проверка closure schema и CI impact selection остаются работой следующих версий; этот документ не выдаёт их за работающий сервис.
